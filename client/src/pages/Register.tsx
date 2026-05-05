import { useState } from "react";
import { request } from "../services/api";
import "../App.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    setLoading(true);
    try {
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      window.location.href = "/login";
    } catch {
      setError("Registration failed. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🌳</div>
        <h2>Create account</h2>
        <p className="auth-subtitle">Start building your calculation trees</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <div>
            <label className="input-label">Username</label>
            <input
              placeholder="Choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              placeholder="Choose a password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRegister()}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <div className="auth-footer">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
}
