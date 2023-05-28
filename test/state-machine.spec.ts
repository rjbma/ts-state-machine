import { Events, createMachine } from "../src/state-machine.js";
import {
  TrafficLighTriggers,
  TrafficLightState,
  TrafficLigthTransitions,
  trafficLightMachineProps,
} from "../react-example/src/traffic-light.machine.js";
import { jest } from "@jest/globals";

const createTrafficLightMachine = (
  initialState: TrafficLightState,
  events: Events<TrafficLightState>
) => {
  return createMachine<
    TrafficLightState,
    TrafficLigthTransitions,
    TrafficLighTriggers
  >({
    transitions: trafficLightMachineProps.transitions,
    triggers: trafficLightMachineProps.triggers({
      disabledDuration: 200,
      greenDuration: 150,
      yellowDuration: 50,
      redDuration: 100,
    }),
    initialState,
    events,
  });
};

describe("a state machine", () => {
  it("can handle both sync transitions and async triggers", async () => {
    // keep a trail of all the stated the machine goes through
    let trail: TrafficLightState[] = [];
    const onTriggerStateChangeIgnored = jest.fn();

    // kickstart the machine in 'green'
    const { state, transitions } = createTrafficLightMachine(
      { status: "green", a: 1 },
      {
        onStateChange: (newState) => trail.push(newState),
        onTriggerStateChangeIgnored,
      }
    );
    assertTrafficLightIs(state, "green");

    // give it enough time to execute several triggers, until it predictably switches to 'red'
    await delay(550);
    assertTrafficLightIs(state, "red");

    // disable the machine, and wait for it to fully stop
    transitions.stop(state);
    assertTrafficLightIs(state, "disabled");
    await delay(200);

    // check that the machine went through all the expected states
    expect(trail.map((t) => t.status).join(",")).toBe(
      "yellow,red,green,yellow,red,disabled"
    );
    expect(onTriggerStateChangeIgnored).not.toHaveBeenCalled();
  });

  it("initial state is canceled when a transition occurs", async () => {
    const onTriggerStateChangeIgnored = jest.fn();
    const { state, transitions } = createTrafficLightMachine(
      { status: "red", a: 1 },
      { onTriggerStateChangeIgnored }
    );
    assertTrafficLightIs(state, "red");

    transitions.stop(state);
    await delay(200);

    expect(onTriggerStateChangeIgnored).not.toHaveBeenCalled();
  });

  it("non-initial state is canceled when a transition occurs", async () => {
    const onTriggerStateChangeIgnored = jest.fn();
    const { state, transitions } = createTrafficLightMachine(
      { status: "red", a: 1 },
      { onTriggerStateChangeIgnored }
    );
    assertTrafficLightIs(state, "red");

    await delay(275);
    assertTrafficLightIs(state, "yellow");

    transitions.stop(state);
    assertTrafficLightIs(state, "disabled");
    await delay(300);

    expect(onTriggerStateChangeIgnored).not.toHaveBeenCalled();
  });

  it("non-initial state is canceled twice when a double transition occurs", async () => {
    const onTriggerStateChangeIgnored = jest.fn();
    const { state, transitions } = createTrafficLightMachine(
      { status: "red", a: 1 },
      { onTriggerStateChangeIgnored }
    );
    assertTrafficLightIs(state, "red");

    await delay(275);
    assertTrafficLightIs(state, "yellow");

    transitions.stop(state);
    transitions.stop(state);
    assertTrafficLightIs(state, "disabled");
    await delay(300);

    expect(onTriggerStateChangeIgnored).not.toHaveBeenCalled();
  });
});

function assertTrafficLightIs<STATUS extends TrafficLightState["status"]>(
  state: TrafficLightState,
  status: STATUS
): asserts state is TrafficLightState & { status: STATUS } {
  if (state.status != status) {
    expect(state.status).toBe(status);
    throw new Error(`Traffic light not '${status}'`);
  }
}

const delay = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
