import { Transition, Trigger, useMachine } from "../../src/state-machine";

// define all the possible state for our machine
type TrafficLightState =
  | {
      status: "disabled";
    }
  | {
      status: "red";
    }
  | {
      status: "green";
    }
  | {
      status: "yellow";
    };

// there are no "manual" transitions between states
type TrafficLigthTransitions = {
  start: Transition<TrafficLightState, "disabled", "green">;
  stop: Transition<TrafficLightState, "green" | "red" | "yellow", "disabled">;
};
const ts: TrafficLigthTransitions = {
  start: () => ({ status: "green" }),
  stop: () => ({ status: "disabled" }),
};

type TrafficLighTriggers = {
  red: Trigger<TrafficLightState, "red", "green">;
  green: Trigger<TrafficLightState, "green", "yellow">;
  yellow: Trigger<TrafficLightState, "yellow", "red">;
};
const triggers: TrafficLighTriggers = {
  red: () => ({ task: () => delay(5000, () => ({ status: "green" })) }),
  green: () => ({ task: () => delay(5000, () => ({ status: "yellow" })) }),
  yellow: () => ({ task: () => delay(5000, () => ({ status: "red" })) }),
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
