import * as React from "react";

interface StateTemplate {
  status: string;
  data?: unknown;
}

type SpecificState<S extends StateTemplate, N extends S["status"]> = S & {
  status: N;
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
  FROM extends S["status"],
  TO extends S["status"]
> = (from: SpecificState<S, FROM>) => SpecificState<S, TO>;

/**Type containing all possible transition functions for a specific state machine */
type Transitions<S extends StateTemplate> = Record<
  string,
  Transition<S, any, any> | ((...params: any[]) => Transition<S, any, any>)
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
    const trigger: Trigger<S> = triggers[initialState.status];

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

  return { state, transitions: newTransitions as T };
};

export { createMachine, useMachine };
export type { Transition, Trigger, SpecificState };
