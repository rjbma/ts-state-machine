import {
  createMachine,
  newMachine,
  SpecificState,
  Transition,
  Trigger,
} from "../state-machine";

// define all the possible state for our machine
type ResoureceLoadedState =
  | {
      status: "idle";
    }
  | {
      status: "loading";
    }
  | {
      status: "loaded";
      value: number;
    }
  | {
      status: "error";
    };

type ResourceLoaderTransitions = {
  start: Transition<ResoureceLoadedState, "idle", "loading">;
  reload: Transition<ResoureceLoadedState, "loaded", "loading">;
};

const ts: ResourceLoaderTransitions = {
  start: (s) => ({ status: "loading" }),
  reload: () => ({ status: "loading" }),
};

type ResourceLoadedTiggers = {
  loading: Trigger<ResoureceLoadedState, "loading", "error" | "loaded">;
};

const triggers: ResourceLoadedTiggers = {
  loading: () => getResource(),
};

// infinite loop that will cycle throgh the states
const run = async () => {
  console.log("started");

  // create the machine with the definitions above
  const machine = newMachine<
    ResoureceLoadedState,
    ResourceLoaderTransitions,
    ResourceLoadedTiggers
  >(ts, triggers, { status: "idle" });

  console.log(new Date().toISOString(), machine.currentState.value);

  machine.transitions.start({ status: "idle" });
  console.log(new Date().toISOString(), machine.currentState.value);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(new Date().toISOString(), machine.currentState.value);

  if (machine.currentState.value.status == "loaded") {
    machine.transitions.reload(machine.currentState.value);
    console.log(new Date().toISOString(), machine.currentState.value);
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(new Date().toISOString(), machine.currentState.value);

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

async function getResource(): Promise<
  ResoureceLoadedState & { status: "error" | "loaded" }
> {
  const value = Math.random();
  if (value < 0.7) {
    return { status: "error" };
  } else {
    return { status: "loaded", value };
  }
}
