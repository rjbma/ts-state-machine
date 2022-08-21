import * as React from "react";

type StateTemplate = {
  state: string;
  data: unknown;
  transitions: Record<string, unknown>;
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
> = (
  from: S & { state: FROM }
) => (S & { state: TO }) | Promise<S & { state: TO }>;

/**Type containing all possible transition functions for a specific state machine */
type Transitions<S extends StateTemplate> = UnionToIntersection<
  S["transitions"]
>;

const createMachine = <S extends StateTemplate>(
  transitions: Transitions<S>
) => {
  return {
    init: <S1 extends S>(initialState: S1) => {
      return initialState as S;
    },
    transitions,
  };
};

const useMachine = <S extends StateTemplate>(
  transitions: Transitions<S>,
  initialState: S,
  initialTransition?: keyof S["transitions"]
) => {
  const [state, setState] = React.useState(
    createMachine(transitions).init(initialState)
  );

  Object.keys(state.transitions).forEach((transitionKey) => {
    state.transitions[transitionKey] = (currentState: S) => {
      // @ts-ignore TODO: how to make this type safe?
      const promise = transitions[transitionKey](currentState);
      promise.then(setState).catch((err: any) => {
        throw new Error(
          "Transitions should never be allowed to fail, should always handle errors. Failed with: " +
            err?.message || "Unknown error"
        );
      });
      return promise;
    };
  });

  // execute the initial transition, if any
  React.useEffect(() => {
    if (initialTransition) {
      // @ts-ignore TODO: how to make this type safe?
      state.transitions[initialTransition](initialState);
    }
  }, []);

  return state;
};

export { createMachine, useMachine };
export type { Transition, Transitions };
