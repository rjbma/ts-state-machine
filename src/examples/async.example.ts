import { createMachine, Transition, Transitions } from "../state-machine";

// define all the possible state for our machine
type TrafficLightState =
  | {
      state: "blue";
      data: {};
      transitions: {};
    }
  | {
      state: "red";
      data: {};
      transitions: {
        redToGreen: Transition<TrafficLightState, "red", "blue" | "green">;
      };
    }
  | {
      state: "green";
      data: {};
      transitions: {
        greenToYellow: Transition<TrafficLightState, "green", "yellow">;
      };
    }
  | {
      state: "yellow";
      data: {};
      transitions: {
        yellowToRed: Transition<TrafficLightState, "yellow", "red">;
      };
    };

// define all transitions for our state machine (must match the definition of the machine above)
const ts: Transitions<TrafficLightState> = {
  redToGreen: (s) => ({
    immediate: {
      state: "blue",
      data: {},
      transitions: { yellowToRed: ts.yellowToRed },
    },
    deferred: () =>
      delay(3000, () => ({
        state: "green",
        data: {},
        transitions: { greenToYellow: ts.greenToYellow },
      })),
  }),

  greenToYellow: (s) => ({
    immediate: {
      state: "yellow",
      data: {},
      transitions: { yellowToRed: ts.yellowToRed },
    },
  }),
  yellowToRed: (s) => ({
    immediate: {
      state: "red",
      data: {},
      transitions: { redToGreen: ts.redToGreen },
    },
  }),
};

// infinite loop that will cycle throgh the states
const run = async () => {
  console.log("started");

  // create the machine with the definitions above
  const machine = createMachine<TrafficLightState>(ts);
  let s = machine.init({
    state: "green",
    data: {},
    transitions: { greenToYellow: ts.greenToYellow },
  });

  // loop through the states
  console.log(new Date().toISOString(), s.state);
  while (true) {
    if (s.state == "green") {
      const { immediate, deferred } = s.transitions.greenToYellow(s);
      if (immediate) {
        s = immediate;
      }
      console.log(new Date().toISOString(), s.state);
      if (deferred) {
        s = await deferred();
      }
    } else if (s.state == "yellow") {
      const { immediate, deferred } = s.transitions.yellowToRed(s);
      if (immediate) {
        s = immediate;
      }
      console.log(new Date().toISOString(), s.state);
      if (deferred) {
        s = await deferred();
      }
    } else if (s.state == "red") {
      const { immediate, deferred } = s.transitions.redToGreen(s);
      if (immediate) {
        s = immediate;
      }
      console.log(new Date().toISOString(), s.state);
      if (deferred) {
        s = await deferred();
      }
    }
  }
};

const delay = <T>(duration: number, fn: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), duration));

const AsyncExample = { run };
export { AsyncExample };
