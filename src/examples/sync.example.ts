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
  toGreen: (s) => ({
    state: "green",
    data: {},
    transitions: { toYellow: ts.toYellow },
  }),
  toYellow: (s) => ({
    state: "yellow",
    data: {},
    transitions: { toRed: ts.toRed },
  }),
  toRed: (s) => ({
    state: "red",
    data: {},
    transitions: { toGreen: ts.toGreen },
  }),
};

const run = () => {
  const machine = createMachine<TrafficLightState>(ts);
  let s = machine.init(
    {
      state: "green",
      data: {},
      transitions: { toYellow: ts.toYellow },
    },
    "toYellow"
  );

  console.log(s.state);

  if (s.state == "green") {
    s = s.transitions.toYellow(s);
  } else if (s.state == "yellow") {
    s = s.transitions.toRed(s);
  }

  console.log(s.state);
};

const SyncExample = { run };
export { SyncExample };
