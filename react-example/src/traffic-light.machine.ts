import {
  Transition,
  TransitionWithParams,
  SimpleTrigger,
  useMachine,
  NoOpTrigger,
} from "../../src/state-machine";

// define all the possible state for our machine
type TrafficLightState =
  | {
      status: "disabled";
    }
  | {
      status: "red";
      a: number;
    }
  | {
      status: "green";
      a: number;
    }
  | {
      status: "yellow";
      a: number;
    };

// there are no "manual" transitions between states
type TrafficLigthTransitions = {
  start: TransitionWithParams<
    TrafficLightState,
    "disabled",
    "green",
    { additionalInfo: number }
  >;
  stop: Transition<TrafficLightState, "red" | "yellow", "disabled">;
};
const ts: TrafficLigthTransitions = {
  start: (_, params) => ({ status: "green", a: params.additionalInfo }),
  stop: (s) => ({ status: "disabled", a: s.a }),
};

type TrafficLighTriggers = {
  red: SimpleTrigger<TrafficLightState, "red", "green">;
  green: SimpleTrigger<TrafficLightState, "green", "yellow">;
  yellow: SimpleTrigger<TrafficLightState, "yellow", "red">;
  disabled: NoOpTrigger<TrafficLightState, "disabled">;
};
const triggers: TrafficLighTriggers = {
  red: (s) => delay(5000, () => ({ status: "green", a: s.a })),
  green: (s) => ({
    task: () => delay(5000, () => ({ status: "yellow", a: s.a })),
  }),
  yellow: (s) => ({
    task: () => delay(5000, () => ({ status: "red", a: s.a })),
  }),
  disabled: async () => {
    console.log("Just disabled the traffic light.");
    await delay(10000, () => undefined);
    console.log("Traffic light still disabled after 10s");
  },
};

const delay = <T>(duration: number, fn: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), duration));

const useTrafficLightStateMachine = () => {
  const machine = useMachine<
    TrafficLightState,
    TrafficLigthTransitions,
    TrafficLighTriggers
  >(ts, triggers, { status: "disabled" });
  return machine;
};

export { useTrafficLightStateMachine };
export type { TrafficLightState, TrafficLigthTransitions, TrafficLighTriggers };
