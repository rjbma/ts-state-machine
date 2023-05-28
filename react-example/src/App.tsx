import { useState } from "react";
import "./App.css";
import { useTrafficLightStateMachine } from "./traffic-light.machine";

function App() {
  const { state, transitions } = useTrafficLightStateMachine();
  const [value, setValue] = useState(0);
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        {state.status == "disabled" && (
          <>
            <input
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            ></input>
            <button
              onClick={() =>
                transitions.start(state, { additionalInfo: count })
              }
            >
              start
            </button>
          </>
        )}
        {(state.status == "red" || state.status == "yellow") && (
          <button onClick={() => transitions.stop(state)}>stop</button>
        )}
        {state.status != "disabled" ? (
          <div style={{ height: 100, backgroundColor: state.status }}>
            {state.a}
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;
