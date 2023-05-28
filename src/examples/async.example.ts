import { createMachine, SpecificState, SimpleTrigger } from "../state-machine";

// define all the possible state for our machine
type TrafficLightState =
  | {
      status: "red";
    }
  | {
      status: "green";
    }
  | {
      status: "yellow";
    };

type TrafficLigthTransitions = {};

const ts: TrafficLigthTransitions = {};

type TrafficLighTriggers = {
  red: SimpleTrigger<TrafficLightState, "red", "green">;
  green: SimpleTrigger<TrafficLightState, "green", "yellow">;
  yellow: SimpleTrigger<TrafficLightState, "yellow", "red">;
};

const triggers: TrafficLighTriggers = {
  red: (s) => ({ task: () => delay(1000, () => ({ status: "green" })) }),
  green: (s) => ({ task: () => delay(3000, () => ({ status: "yellow" })) }),
  yellow: (s) => ({ task: () => delay(500, () => ({ status: "red" })) }),
};

// infinite loop that will cycle throgh the states
const run = async () => {
  console.log("started");

  // create the machine with the definitions above
  const machine = createMachine<
    TrafficLightState,
    TrafficLigthTransitions,
    TrafficLighTriggers
  >({ transitions: ts, triggers, initialState: { status: "green" } });

  // loop through the states
  console.log(new Date().toISOString(), machine.state.status);
  // while (true) {
  //   if (s.state == "green") {
  //     s = machine.transitions.greenToYellow(s);
  //     console.log(new Date().toISOString(), s.state);
  //   } else if (s.state == "red") {
  //     s = ts.redToGreen(s);
  //     console.log(new Date().toISOString(), s.state);
  //   } else if (s.state == "yellow") {
  //     s = ts.yellowToRed(s);
  //     console.log(new Date().toISOString(), s.state);
  //   }
  // }
};

const delay = <T>(duration: number, fn: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), duration));

const AsyncExample = { run };
export { AsyncExample };
