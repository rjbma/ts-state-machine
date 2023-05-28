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

type SimpleTrigger<
  S extends StateTemplate,
  FROM extends S["status"],
  TO extends S["status"]
> = (s: SpecificState<S, FROM>) =>
  | Promise<SpecificState<S, TO>>
  | {
      task: () => Promise<SpecificState<S, TO>>;
      cancel?: () => void;
    };

type NoOpTrigger<S extends StateTemplate, FROM extends S["status"]> = (
  s: SpecificState<S, FROM>
) =>
  | Promise<void>
  | {
      task: () => Promise<void>;
      cancel?: () => void;
    };

type Trigger<S extends StateTemplate> =
  | SimpleTrigger<S, any, any>
  | NoOpTrigger<S, any>;

type Triggers<S extends StateTemplate> = Partial<Record<S["status"], any>>;

const createMachine = <
  S extends StateTemplate,
  T extends Transitions<S>,
  I extends Triggers<S>
>({
  transitions,
  triggers,
  onStateChange,
  initialState,
}: {
  transitions: T;
  triggers: I;
  onStateChange?: (s: S) => void;
  initialState: S;
}) => {
  type InternalState = { value: S; cancel?: () => void };
  const internalState: InternalState = { value: initialState };

  // set the new state, while also cancelling any work scheduled by the previous state
  const cancelAndSetState = (newState: S | undefined) => {
    // cancel any pending tasks on the old state
    internalState.cancel?.();

    if (newState !== undefined) {
      // start tasks of the new state, and get a function for cancelling in the future, in case it's needed
      const cancelTrigger = executeTrigger(newState);

      // update the internal state of the machine
      replaceObjectProps(internalState.value, newState);
      internalState.cancel = cancelTrigger;

      // signal the state of the machine has changed
      onStateChange?.(internalState.value);
    }
  };

  // checks if the given state has a trigger, and executes it if so
  const executeTrigger = (state: S) => {
    const trigger: Trigger<S> = triggers[state.status as S["status"]];
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
          if (!isCancelled) {
            return cancelAndSetState(newState || undefined);
          }
        })
        .catch((err: any) => {
          console.error(
            "Transitions should never be allowed to fail, should always handle errors. Failed with: " +
              err?.message || "Unknown error"
          );
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
  executeTrigger(internalState.value);

  return { state: internalState.value, transitions: newTransitions as T };
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
  const [state, setState] = React.useState<{ value: S }>({
    value: initialState,
  });
  const machine = React.useMemo(
    () =>
      createMachine({
        transitions,
        triggers,
        onStateChange: (newState) => {
          setState({ value: newState });
        },
        initialState,
      }),
    [transitions, triggers]
  );

  return { state: state.value, transitions: machine.transitions };
};

const replaceObjectProps = (oldObject: any, newObject: any) => {
  for (const key in oldObject) {
    delete oldObject[key];
  }
  Object.assign(oldObject, newObject);
  return oldObject;
};

export { createMachine, useMachine };
export type {
  Transition,
  TransitionWithParams,
  SimpleTrigger,
  NoOpTrigger,
  SpecificState,
};
