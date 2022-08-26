import { createMachine, SpecificState, Trigger } from "../state-machine";

// define all the possible state for our machine
type TrafficLightState =
  | {
      state: "red";
    }
  | {
      state: "green";
    }
  | {
      state: "yellow";
    };

type TrafficLigthTransitions = {
  // redToGreen: Transition<TrafficLightState, "red", "green">;
  // greenToYellow: Transition<TrafficLightState, "green", "yellow">;
  // yellowToRed: Transition<TrafficLightState, "yellow", "red">;
};

const ts: TrafficLigthTransitions = {};

type TrafficLighTriggers = {
  red: Trigger<TrafficLightState, "red", "green">;
  green: Trigger<TrafficLightState, "green", "yellow">;
  yellow: Trigger<TrafficLightState, "yellow", "red">;
};

const triggers: TrafficLighTriggers = {
  red: (s) => delay(1000, () => ({ state: "green" })),
  green: (s) => delay(3000, () => ({ state: "yellow" })),
  yellow: (s) => delay(500, () => ({ state: "red" })),
};

// infinite loop that will cycle throgh the states
const run = async () => {
  console.log("started");

  // create the machine with the definitions above
  const machine = createMachine<
    TrafficLightState,
    TrafficLigthTransitions,
    TrafficLighTriggers
  >(ts, triggers);
  let s = machine.init({ state: "green" });

  // loop through the states
  console.log(new Date().toISOString(), s.state);
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
