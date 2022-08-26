import * as React from "react";

interface StateTemplate {
  state: string;
  data?: unknown;
}

type SpecificState<S extends StateTemplate, N extends S["state"]> = S & {
  state: N;
};

// transform a union type into an intersection type
// see: https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**Type for defining a single transition for a specific state machine */
type Transition<
  S extends StateTemplate,
  FROM extends S["state"],
  TO extends S["state"]
> = (from: SpecificState<S, FROM>, ...params: any[]) => SpecificState<S, TO>;

/**Type containing all possible transition functions for a specific state machine */
type Transitions<S extends StateTemplate> = Record<
  string,
  Transition<S, any, any>
>;

type Trigger<
  S extends StateTemplate,
  FROM extends S["state"],
  TO extends S["state"]
> = (s: SpecificState<S, FROM>) => Promise<SpecificState<S, TO>>;

type Triggers<S extends StateTemplate> = Partial<Record<S["state"], any>>;

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
    createMachine(transitions).init(initialState)
  );

  const newTransitions = Object.keys(transitions).reduce(
    (acc, transitionKey) => {
      return {
        ...acc,
        [transitionKey]: (currentState: S) => {
          const result = transitions[transitionKey](currentState);
          setState(result);
        },
      };
    },
    {}
  );

  // execute the initial transition, if any
  React.useEffect(() => {
    // @ts-ignore TODO: how to make this type safe?
    const trigger: Trigger<S> = triggers[initialState.state];

    if (trigger) {
      trigger(initialState)
        .then(setState)
        .catch((err: any) => {
          console.error(
            "Transitions should never be allowed to fail, should always handle errors. Failed with: " +
              err?.message || "Unknown error"
          );
        });
    }
  }, []);

  return { state, transitions: newTransitions };
};

export { createMachine, useMachine };
export type { Transition, Trigger, SpecificState };
