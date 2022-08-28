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
  TO extends S["status"]
> = (s: SpecificState<S, FROM>) => Promise<SpecificState<S, TO>>;

type Triggers<S extends StateTemplate> = Partial<Record<S["status"], any>>;

const createMachine = <
  S extends StateTemplate,
  T extends Transitions<S>,
  I extends Triggers<S>
>(
  transitions: T,
  triggers: I
) => {
  return {
    init: <S1 extends S>(initialState: S1) => {
      return initialState as S;
    },
    transitions,
    triggers,
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
  const [state, setState] = React.useState<S>(
    // @ts-ignore TODO: how to make this type safe?
    createMachine(transitions, triggers).init(initialState)
  );

  // checks if the given state has a trigger, and executes it if so
  const executeTrigger = (state: S) => {
    const trigger = triggers[state.status as S["status"]];
    if (trigger) {
      trigger(state)
        .then(setState)
        .catch((err: any) => {
          console.error(
            "Transitions should never be allowed to fail, should always handle errors. Failed with: " +
              err?.message || "Unknown error"
          );
        });
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
          setState((oldState) => {
            executeTrigger(newState);
            return newState;
          });
        },
      };
    },
    {}
  );

  // execute the trigger for the initial state, if any
  React.useEffect(() => {
    executeTrigger(initialState);
  }, []);

  return { state, transitions: newTransitions as T };
};

export { createMachine, useMachine };
export type { Transition, TransitionWithParams, Trigger, SpecificState };
