import { useState } from "react";
import { request } from "../services/api";

interface Props {
  parentId: string;
  parentResult: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OperationForm({ parentId, parentResult, onSuccess, onCancel }: Props) {
  const [operation, setOperation] = useState("+");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const preview = value !== "" && !isNaN(Number(value))
    ? (() => {
        const r = Number(value);
        switch (operation) {
          case "+": return parentResult + r;
          case "-": return parentResult - r;
          case "*": return parentResult * r;
          case "/": return r !== 0 ? +(parentResult / r).toFixed(6) : "÷0";
          default: return "?";
        }
      })()
    : null;

  async function submit() {
    if (!value) return;
    setError("");
    setLoading(true);
    try {
      await request(`/calculations/${parentId}/operate`, {
        method: "POST",
        body: JSON.stringify({ operation, rightOperand: Number(value) })
      });
      onSuccess();
    } catch {
      setError("Failed to apply operation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="op-form">
      <span className="op-form-label">New branch from {parentResult}</span>

      <select value={operation} onChange={e => setOperation(e.target.value)}>
        <option value="+">+</option>
        <option value="-">−</option>
        <option value="*">×</option>
        <option value="/">÷</option>
      </select>

      <input
        type="number"
        placeholder="Enter number"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        autoFocus
      />

      {preview !== null && (
        <span style={{ color: "var(--text-secondary)", fontSize: 13, fontFamily: "monospace" }}>
          = <strong style={{ color: "var(--text)" }}>{preview}</strong>
        </span>
      )}

      <button className="btn-apply" onClick={submit} disabled={loading || !value}>
        {loading ? "…" : "Apply"}
      </button>
      <button className="btn-cancel-sm" onClick={onCancel}>Cancel</button>

      {error && <span className="op-form-error">{error}</span>}
    </div>
  );
}
