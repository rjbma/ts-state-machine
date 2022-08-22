import type { Transition, Transitions } from "./state-machine";
import { AsyncExample } from "./examples/async.example";
// import { SyncExample } from "./examples/sync.example";
import { createMachine } from "./state-machine";

AsyncExample.run();
// SyncExample.run();

export { createMachine };
export type { Transition, Transitions };
