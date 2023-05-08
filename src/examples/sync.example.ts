import { createMachine, Transition } from "../state-machine";

// type TrafficLightState =
//   | {
//       state: "red";
//       data: {};
//     }
//   | {
//       state: "green";
//       data: {};
//     }
//   | {
//       state: "yellow";
//       data: {};
//     };

// type TrafficLightTransitions = {
//   toGreen: Transition<TrafficLightState, "red", "green">;
//   toYellow: Transition<TrafficLightState, "green", "yellow">;
//   toRed: Transition<TrafficLightState, "yellow", "red">;
// };

// const ts: TrafficLightTransitions = {
//   toGreen: (s) => ({
//     immediate: {
//       state: "green",
//       data: {},
//     },
//   }),
//   toYellow: (s) => ({
//     immediate: {
//       state: "yellow",
//       data: {},
//     },
//   }),
//   toRed: (s) => ({
//     immediate: {
//       state: "red",
//       data: {},
//     },
//   }),
// };

// const run = async () => {
//   const machine = createMachine<TrafficLightState, TrafficLightTransitions>(ts);
//   let s = machine.init({
//     state: "green",
//     data: {},
//     transitions: { toYellow: ts.toYellow },
//   });

//   console.log(s.state);

//   if (s.state == "green") {
//     s = machine.transitions.toYellow(s).immediate || s;
//   } else if (s.state == "yellow") {
//     s = machine.transitions.toRed(s).immediate || s;
//   }

//   console.log(s.state);
// };

// const SyncExample = { run };
// export { SyncExample };
