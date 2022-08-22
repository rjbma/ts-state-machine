import * as React from "react";

type StateTemplate = {
  state: string;
  data: unknown;
  transitions: Record<string, unknown>;
};

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
> = (from: SpecificState<S, FROM>) => {
  /**State change that occurs immediately when the transition occurs */
  immediate?: SpecificState<S, TO>;
  /**State change that occurs only after some work (represented by a promise) finishes. The work is triggered when the transition occurs */
  deferred?: () => Promise<SpecificState<S, TO>>;
};

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

const useMachine = <S extends StateTemplate, IS extends S>(
  transitions: Transitions<S>,
  initialState: IS,
  initialTransition?: keyof IS["transitions"]
) => {
  const [state, setState] = React.useState(
    createMachine(transitions).init(initialState)
  );

  Object.keys(state.transitions).forEach((transitionKey) => {
    state.transitions[transitionKey] = (currentState: S) => {
      // @ts-ignore TODO: how to make this type safe?
      const result = transitions[transitionKey](currentState);
      const immediate: S = result.immediate;
      const deferred: () => Promise<S> = result.deferred;

      if (immediate) {
        setState(immediate);
      }

      if (deferred) {
        deferred()
          .then(setState)
          .catch((err: any) => {
            console.error(
              "Transitions should never be allowed to fail, should always handle errors. Failed with: " +
                err?.message || "Unknown error"
            );
          });
      }
    };
  });

  // execute the initial transition, if any
  React.useEffect(() => {
    if (initialTransition && initialState == state) {
      // @ts-ignore TODO: how to make this type safe?
      state.transitions[initialTransition](state);
    }
  }, []);

  return state;
};

export { createMachine, useMachine };
export type { Transition, Transitions, SpecificState };
