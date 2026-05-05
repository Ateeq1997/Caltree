import { useState } from "react";
import { request } from "../services/api";
import "../App.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      }) as { token: string };
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🌳</div>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your CalcTree account</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <div>
            <label className="input-label">Username</label>
            <input
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className="auth-footer">
          No account? <a href="/register">Create one</a>
        </div>
      </div>
    </div>
  );
}
