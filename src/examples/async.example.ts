import { createMachine, Transition } from "../state-machine";

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
  redToGreen: Transition<TrafficLightState, "red", "green">;
  greenToYellow: Transition<TrafficLightState, "green", "yellow">;
  yellowToRed: Transition<TrafficLightState, "yellow", "red">;
};

const ts: TrafficLigthTransitions = {
  redToGreen: (s) => ({
    deferred: () =>
      delay(1000, () => ({
        state: "green",
        data: {},
        transitions: { greenToYellow: ts.greenToYellow },
      })),
  }),

  greenToYellow: (s) => ({
    deferred: () =>
      delay(3000, () => ({
        state: "yellow",
        data: {},
        transitions: { yellowToRed: ts.yellowToRed },
      })),
  }),
  yellowToRed: (s) => ({
    deferred: () =>
      delay(500, () => ({
        state: "red",
        data: {},
        transitions: { redToGreen: ts.redToGreen },
      })),
  }),
};

// infinite loop that will cycle throgh the states
const run = async () => {
  console.log("started");

  // create the machine with the definitions above
  const machine = createMachine<TrafficLightState, TrafficLigthTransitions>(ts);
  let s = machine.init({ state: "green", data: {} });

  // loop through the states
  console.log(new Date().toISOString(), s.state);
  while (true) {
    if (s.state == "green") {
      const { immediate, deferred } = machine.transitions.greenToYellow(s);
      if (immediate) {
        s = immediate;
      }
      console.log(new Date().toISOString(), s.state);
      if (deferred) {
        s = (await deferred(s)) || s;
      }
    } else if (s.state == "red") {
      const { immediate, deferred } = ts.redToGreen(s);
      if (immediate) {
        s = immediate;
      }
      console.log(new Date().toISOString(), s.state);
      if (deferred) {
        s = (await deferred(s)) || s;
      }
    } else if (s.state == "yellow") {
      const { immediate, deferred } = ts.yellowToRed(s);
      if (immediate) {
        s = immediate;
      }
      console.log(new Date().toISOString(), s.state);
      if (deferred) {
        s = (await deferred(s)) || s;
      }
    }
  }
};

const delay = <T>(duration: number, fn: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), duration));

const AsyncExample = { run };
export { AsyncExample };
