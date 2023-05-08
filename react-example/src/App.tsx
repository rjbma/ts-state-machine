import { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import { useTrafficLightStateMachine } from "./traffic-light.machine";
import viteLogo from "/vite.svg";

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
                transitions.start(state, { additionalInfo: value })
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

        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
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
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
