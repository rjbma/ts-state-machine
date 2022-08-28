import type {
  Transition,
  TransitionWithParams,
  Trigger,
  SpecificState,
} from "./state-machine";
import { AsyncExample } from "./examples/async.example";
// import { SyncExample } from "./examples/sync.example";
import { createMachine, useMachine } from "./state-machine";

AsyncExample.run();
// SyncExample.run();

export { createMachine, useMachine };
export type { Transition, TransitionWithParams, Trigger, SpecificState };
