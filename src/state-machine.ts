import * as React from "react";

interface StateTemplate {
  status: string;
}

type SpecificState<S extends StateTemplate, N extends S["status"]> = S & {
  status: N;
};

/**Type for defining a single transition for a specific state machine */
type Transition<
  S extends StateTemplate,
  FROM extends S["status"],
  TO extends S["status"]
> = (from: SpecificState<S, FROM>) => SpecificState<S, TO>;

/**
 * Type for defining a single transition for a specific state machine; this transition also
 * needs additional params (i.e., not contained in the state) to be executed
 */
type TransitionWithParams<
  S extends StateTemplate,
  FROM extends S["status"],
  TO extends S["status"],
  PARAMS
> = (from: SpecificState<S, FROM>, params: PARAMS) => SpecificState<S, TO>;

/**Type containing all possible transition functions for a specific state machine */
type Transitions<S extends StateTemplate> = Record<
  string,
  Transition<S, any, any> | TransitionWithParams<S, any, any, any>
>;

type Trigger<
  S extends StateTemplate,
  FROM extends S["status"],
  TO extends S["status"] | void
> = (s: SpecificState<S, FROM>) =>
  | Promise<TO extends S["status"] ? SpecificState<S, TO> : void>
  | {
      task: () => Promise<TO extends S["status"] ? SpecificState<S, TO> : void>;
      cancel?: () => void;
    };

type Triggers<S extends StateTemplate> = Partial<Record<S["status"], any>>;

type Events<S extends StateTemplate> = {
  /**This is called every time the machine changes states */
  onStateChange?: (newState: S) => void;
  /**
   * This is called when a trigger's task is finished, but the system detects that
   * the current state is no longer the state that initiated the trigger, and the
   * trigger was never canceled.
   *
   * Usually this shouldn't happen, since tasks are cancelled when a transition is
   * executed on a machine and a trigger's task is still being executed. However it's
   * been known to happen on hot reloading, for example. This can be used as a hook
   * for debugging and reporting on these situations.
   */
  onTriggerStateChangeIgnored?: (params: {
    expectedState: { state: S; stateId: StateId };
    actualState: { state: S; stateId: StateId };
    ignoredState: S | void;
  }) => void;
  /**
   * Async tasks from triggers are not supposed to fail, they should always
   * return the next state for the machine. This function will be called should
   * the task fail, which most likely indicates a bug in your state machine.
   */
  onTriggerFailure?: (err: Error) => void;
};

type StateId = number;

const createMachine = <
  S extends StateTemplate,
  T extends Transitions<S>,
  I extends Triggers<S>
>({
  transitions,
  triggers,
  initialState,
  events = {
    onTriggerStateChangeIgnored: ({ expectedState, actualState }) => {
      console.warn(
        `Ignored trigger. Original state: ${expectedState.state.status}/${expectedState.stateId}. Current state: ${actualState.state.status}/${actualState.stateId}`
      );
    },
    onTriggerFailure: (err) => {
      console.error(
        "Transitions should never be allowed to fail, should always handle errors. Failed with: " +
          err?.message || "Unknown error"
      );
    },
  },
}: {
  transitions: T;
  triggers: I;
  initialState: S;
  events?: Events<S>;
}) => {
  type InternalState = { value: S; cancel?: () => void; stateId: StateId };
  const internalState: InternalState = {
    value: initialState,
    stateId: uniqueId(),
  };

  // set the new state, while also cancelling any work scheduled by the previous state
  const cancelAndSetState = (newState: S | void) => {
    // cancel any pending tasks on the old state
    internalState.cancel?.();

    if (newState !== undefined) {
      // generate a unique ID for the new state
      const newStateId = uniqueId();

      // start tasks of the new state, and get a function for cancelling in the future, in case it's needed
      const cancelTrigger = executeTrigger(newState, newStateId);

      // update the internal state of the machine
      internalState.stateId = newStateId;
      replaceObjectProps(internalState.value, newState);
      internalState.cancel = cancelTrigger;

      // signal the state of the machine has changed
      events.onStateChange?.({ ...internalState.value });
    }
  };

  // checks if the given state has a trigger, and executes it if so
  const executeTrigger = (state: S, stateId: StateId) => {
    const trigger: Trigger<S, any, any> = triggers[state.status as S["status"]];
    if (trigger) {
      const res = trigger(state);
      const task = res instanceof Promise ? res : res.task();
      let isCancelled = false;
      const cancel =
        res instanceof Promise
          ? () => {
              isCancelled = true;
            }
          : () => {
              isCancelled = true;
              res.cancel?.();
            };
      task
        .then((newState) => {
          // if the trigger was cancelled, don't change state
          if (!isCancelled) {
            // if the current state is no longer the exact same state that it
            // was when the trigger was activated, also don't change state
            if (stateId === internalState.stateId) {
              return cancelAndSetState(newState || undefined);
            } else {
              events.onTriggerStateChangeIgnored?.({
                expectedState: { state, stateId },
                actualState: {
                  state: internalState.value,
                  stateId: internalState.stateId,
                },
                ignoredState: newState,
              });
            }
          }
        })
        .catch((err: any) => {
          events.onTriggerFailure?.(err);
        });
      return cancel;
    }
  };

  const newTransitions = Object.keys(transitions).reduce(
    (acc, transitionKey) => {
      return {
        ...acc,
        [transitionKey]: (currentState: S, additionalParams: any) => {
          const newState = transitions[transitionKey](
            currentState,
            additionalParams
          );
          cancelAndSetState(newState || undefined);
        },
      };
    },
    {}
  );

  // execute the trigger for the initial state, if any
  const start = () => {
    const cancelTrigger = executeTrigger(
      internalState.value,
      internalState.stateId
    );
    internalState.cancel = cancelTrigger;

    return {
      state: internalState.value,
      transitions: newTransitions as T,
    };
  };

  return {
    state: internalState.value,
    transitions: newTransitions as T,
    start,
  };
};

const useMachine = <
  S extends StateTemplate,
  T extends Transitions<S>,
  I extends Triggers<S>
>(
  transitions: T,
  triggers: I,
  initialState: S
) => {
  const [state, setState] = React.useState<S>(initialState);
  const machine = React.useMemo(
    () =>
      createMachine({
        transitions,
        triggers,
        initialState,
        events: {
          onStateChange: (newState) => {
            setState(newState);
          },
        },
      }),
    [transitions, triggers, initialState]
  );

  // Make sure the state machine is only started once (i.e, the trigger for its initial state is only executed once)
  //
  // This is needed because of React's strict mode, which would execute the trigger twice. Most of the time this
  // shouldn't really be a problem, but some trigger may have actions that cannot be replayed!
  useEffectOnlyOnce(() => {
    machine.start();
  });

  return { state, transitions: machine.transitions };
};

/**
 * Same as `React.useEffect` but runs the effect only once. Usefull for using
 * with React's strict mode, when the effect cannot be run more than once (e.g.,
 * a non-idempotent HTTP request to a server)
 */
const useEffectOnlyOnce = (fn: () => any) => {
  const ref = React.useRef(false);
  React.useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      fn();
    }
  }, [fn]);
};

const replaceObjectProps = (oldObject: any, newObject: any) => {
  for (const key in oldObject) {
    delete oldObject[key];
  }
  Object.assign(oldObject, newObject);
  return oldObject;
};

const uniqueId = (): StateId => Math.random();

export { createMachine, useMachine };
export type {
  Transition,
  TransitionWithParams,
  Trigger,
  SpecificState,
  Events,
};
