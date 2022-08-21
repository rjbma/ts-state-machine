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

      if (initialTransition) {
        const newState: Promise<S> =
          // @ts-ignore
          Promise.resolve(transitions[initialTransition](initialState));
        return newState;
      } else {
        return Promise.resolve(initialState);
      }
    },
    transitions,
  };
};

export { createMachine };
export type { Transition, Transitions };
