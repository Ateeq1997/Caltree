import { useEffect, useState } from "react";
import { request } from "../services/api";
import type { CalculationNode as NodeType } from "../types/calculation";
import CalculationNode from "./CalculationNode";

export default function CalculationTree() {
  const [tree, setTree] = useState<NodeType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await request("/calculations");
      setTree(data);
    } catch {
      setError("Failed to load calculations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="empty-state">
      <div className="empty-icon">⏳</div>
      <p>Loading your tree…</p>
    </div>
  );

  if (error) return (
    <div className="empty-state">
      <div className="empty-icon">⚠️</div>
      <p style={{ color: "var(--danger)" }}>{error}</p>
    </div>
  );

  if (tree.length === 0) return (
    <div className="empty-state">
      <div className="empty-icon">🌱</div>
      <p>No calculations yet.</p>
      <small>Enter a starting number above and press <strong>Start</strong> to grow your tree.</small>
    </div>
  );

  return (
    <div className="calc-forest">
      {tree.map(node => (
        <div className="node-root-wrapper" key={node.id}>
          <CalculationNode node={node} reload={load} depth={0} />
        </div>
      ))}
    </div>
  );
}

