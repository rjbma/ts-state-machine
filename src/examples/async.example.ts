import { createMachine, Transition, Transitions } from "../state-machine";

// define all the possible state for our machine
type TrafficLightState =
  | {
      state: "red";
      data: {};
      transitions: {
        redToGreen: Transition<TrafficLightState, "red", "green">;
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
  redToGreen: (s) =>
    delay(3000, () => ({
      state: "green",
      data: {},
      transitions: { greenToYellow: ts.greenToYellow },
    })),
  greenToYellow: (s) =>
    delay(5000, () => ({
      state: "yellow",
      data: {},
      transitions: { yellowToRed: ts.yellowToRed },
    })),
  yellowToRed: (s) =>
    delay(500, () => ({
      state: "red",
      data: {},
      transitions: { redToGreen: ts.redToGreen },
    })),
};

// infinite loop that will cycle throgh the states
const run = async () => {
  console.log("started");

  // create the machine with the definitions above
  const machine = createMachine<TrafficLightState>(ts);
  let s = await machine.init({
    state: "green",
    data: {},
    transitions: { greenToYellow: ts.greenToYellow },
  });

  // loop through the states
  while (true) {
    console.log(s.state);
    if (s.state == "green") {
      s = await s.transitions.greenToYellow(s);
    } else if (s.state == "yellow") {
      s = await s.transitions.yellowToRed(s);
    } else if (s.state == "red") {
      s = await s.transitions.redToGreen(s);
    }
  }
};

const delay = <T>(duration: number, fn: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), duration));

const AsyncExample = { run };
export { AsyncExample };
