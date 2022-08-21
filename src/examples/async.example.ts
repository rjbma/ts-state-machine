import { createMachine, Transition } from "../state-machine";

type TrafficLightState =
  | {
      state: "red";
      data: {};
      transitions: { toGreen: Transition<TrafficLightState, "red", "green"> };
    }
  | {
      state: "green";
      data: {};
      transitions: {
        toYellow: Transition<TrafficLightState, "green", "yellow">;
      };
    }
  | {
      state: "yellow";
      data: {};
      transitions: { toRed: Transition<TrafficLightState, "yellow", "red"> };
    };

const ts: Parameters<typeof createMachine<TrafficLightState>>[0] = {
  toGreen: (s) =>
    Promise.resolve({
      state: "green",
      data: {},
      transitions: { toYellow: ts.toYellow },
    }),
  toYellow: (s) =>
    Promise.resolve({
      state: "yellow",
      data: {},
      transitions: { toRed: ts.toRed },
    }),
  toRed: (s) =>
    Promise.resolve({
      state: "red",
      data: {},
      transitions: { toGreen: ts.toGreen },
    }),
};

const run = async () => {
  const machine = createMachine<TrafficLightState>(ts);
  let s = await machine.init(
    {
      state: "green",
      data: {},
      transitions: { toYellow: ts.toYellow },
    },
    "toYellow"
  );

  console.log(s.state);

  if (s.state == "green") {
    s = await s.transitions.toYellow(s);
  } else if (s.state == "yellow") {
    s = await s.transitions.toRed(s);
  }

  console.log(s.state);
};

const AsyncExample = { run };
export { AsyncExample };
