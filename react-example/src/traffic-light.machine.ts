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
    "yellow",
    { additionalInfo: number }
  >;
  stop: Transition<TrafficLightState, "red" | "yellow", "disabled">;
};
const ts: TrafficLigthTransitions = {
  start: (_, params) => ({ status: "yellow", a: params.additionalInfo }),
  stop: (s) => ({ status: "disabled", a: s.a }),
};

type TrafficLighTriggers = {
  red: SimpleTrigger<TrafficLightState, "red", "green">;
  green: SimpleTrigger<TrafficLightState, "green", "yellow">;
  yellow: SimpleTrigger<TrafficLightState, "yellow", "red">;
  disabled: NoOpTrigger<TrafficLightState, "disabled">;
};
const triggers = (config: {
  redDuration: number;
  greenDuration: number;
  yellowDuration: number;
  disabledDuration: number;
}): TrafficLighTriggers => ({
  red: (s) => delay(config.redDuration, () => ({ status: "green", a: s.a })),
  green: (s) => ({
    task: () =>
      delay(config.greenDuration, () => ({ status: "yellow", a: s.a })),
  }),
  yellow: (s) => ({
    task: () => delay(config.yellowDuration, () => ({ status: "red", a: s.a })),
  }),
  disabled: async () => {
    console.log("Just disabled the traffic light.");
    await delay(config.disabledDuration, () => undefined);
    console.log(
      `Traffic light still disabled after ${config.disabledDuration}ms`
    );
  },
});

const delay = <T>(duration: number, fn: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), duration));

const trafficLightMachineProps = {
  transitions: ts,
  triggers,
};

const useTrafficLightStateMachine = () => {
  const machine = useMachine<
    TrafficLightState,
    TrafficLigthTransitions,
    TrafficLighTriggers
  >(
    ts,
    triggers({
      disabledDuration: 10000,
      greenDuration: 5000,
      yellowDuration: 5000,
      redDuration: 5000,
    }),
    { status: "disabled" }
  );
  return machine;
};

export { useTrafficLightStateMachine, trafficLightMachineProps };
export type { TrafficLightState, TrafficLigthTransitions, TrafficLighTriggers };
