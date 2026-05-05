import { useState } from "react";
import { request } from "../services/api";
import CalculationTree from "../components/CalculationTree";
import "../App.css";

export default function Home() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  async function start() {
    if (!value) return;
    setError("");
    try {
      await request("/calculations/start", {
        method: "POST",
        body: JSON.stringify({ value: Number(value) })
      });
      window.location.reload();
    } catch {
      setError("Failed to start calculation.");
    }
  }

  return (
    <div className="home-page">
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-bar-brand">
          <div className="brand-icon">🌳</div>
          CalcTree
        </div>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </header>

      <div className="home-body">
        {/* Start panel */}
        <div className="start-panel">
          <div className="start-field">
            <label className="input-label">Starting value</label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && start()}
            />
          </div>
          <button className="btn-start" onClick={start}>🌱 Start Tree</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="section-heading">Your trees</div>
        <CalculationTree />
      </div>
    </div>
  );
}
