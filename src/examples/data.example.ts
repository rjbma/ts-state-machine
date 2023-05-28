import {
  createMachine,
  Transition,
  TransitionWithParams,
  SimpleTrigger,
} from "../state-machine";

// define all the possible state for our machine
type ResourceLoaderState =
  | {
      status: "idle";
    }
  | {
      status: "loading";
      errorThreshold: number;
    }
  | {
      status: "loaded";
      value: number;
    }
  | {
      status: "error";
    };

type ResourceLoaderTransitions = {
  start: TransitionWithParams<
    ResourceLoaderState,
    "idle",
    "loading",
    { t: number }
  >;
  reload: Transition<ResourceLoaderState, "loaded", "loading">;
};

const ts: ResourceLoaderTransitions = {
  start: (s, params) => ({ status: "loading", errorThreshold: params.t }),
  reload: () => ({ status: "loading", errorThreshold: 0 }),
};

type ResourceLoadedTiggers = {
  loading: SimpleTrigger<ResourceLoaderState, "loading", "error" | "loaded">;
};

const triggers: ResourceLoadedTiggers = {
  loading: (s) => getResource(s.errorThreshold),
};

// infinite loop that will cycle throgh the states
const run = async () => {
  console.log("started");

  // create the machine with the definitions above
  const machine = createMachine<
    ResourceLoaderState,
    ResourceLoaderTransitions,
    ResourceLoadedTiggers
  >({ transitions: ts, triggers, initialState: { status: "idle" } });

  console.log(new Date().toISOString(), machine.state);

  machine.transitions.start({ status: "idle" }, { t: 0.5 });
  console.log(new Date().toISOString(), machine.state);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(new Date().toISOString(), machine.state);

  if (machine.state.status == "loaded") {
    machine.transitions.reload(machine.state);
    console.log(new Date().toISOString(), machine.state);
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(new Date().toISOString(), machine.state);

  // while (true) {
  //   console.log(new Date().toISOString(), machine.currentState.value);
  //   console.log(new Date().toISOString(), s.status);
  //   if (s.status == "loaded") {
  //     console.log(new Date().toISOString(), "OK", s);
  //   } else if (s.status == "error") {
  //     console.log(new Date().toISOString(), "NOK", s);
  //   }
  // }
};

const delay = <T>(duration: number, fn: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), duration));

const AsyncExample = { run };
export { AsyncExample };

async function getResource(
  threshold: number
): Promise<ResourceLoaderState & { status: "error" | "loaded" }> {
  const value = Math.random();
  console.log("got", value);
  if (value < threshold) {
    return { status: "error" };
  } else {
    return { status: "loaded", value };
  }
}
