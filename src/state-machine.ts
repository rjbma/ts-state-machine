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

type Transition<
  S extends StateTemplate,
  FROM extends S["state"],
  TO extends S["state"]
> = (from: S & { state: FROM }) => Promise<S & { state: TO }>;

const createMachine = <S extends StateTemplate>(
  transitions: UnionToIntersection<S["transitions"]>
) => {
  return {
    init: <S1 extends S>(
      initialState: S1,
      initialTransition?: keyof S1["transitions"]
    ) => {
      if (initialTransition) {
        const newState: Promise<S> =
          // @ts-ignore
          transitions[initialTransition](initialState);
        return newState;
      } else {
        return Promise.resolve(initialState);
      }
    },
    transitions,
  };
};

export { createMachine };
export type { Transition };
