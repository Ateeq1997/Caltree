import { useState } from "react";
import type { CalculationNode as NodeType } from "../types/calculation";
import OperationForm from "./OperationForm";

interface Props {
  node: NodeType;
  reload: () => void;
  depth?: number;
}

const OP_BADGE: Record<string, string> = {
  "+": "op-add",
  "-": "op-sub",
  "*": "op-mul",
  "/": "op-div",
};

const OP_RESULT_COLOR: Record<string, string> = {
  "+": "res-add",
  "-": "res-sub",
  "*": "res-mul",
  "/": "res-div",
};

const OP_SYMBOL: Record<string, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

export default function CalculationNode({ node, reload, depth = 0 }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const hasChildren = node.children.length > 0;
  const isRoot = !node.operation;
  const badgeClass = node.operation ? (OP_BADGE[node.operation] ?? "op-root") : "op-root";
  const resultColorClass = node.operation ? (OP_RESULT_COLOR[node.operation] ?? "") : "";
  const opSymbol = node.operation ? (OP_SYMBOL[node.operation] ?? node.operation) : null;

  return (
    <div className="node-wrapper">
      <div className="node-card">
        {/* Badge */}
        <div className={`op-badge ${badgeClass}`}>
          {isRoot ? "R" : opSymbol}
        </div>

        {/* Expression + result */}
        <div className="node-expression">
          {!isRoot && node.operation && node.rightOperand !== undefined && (
            <div className="node-expr-line">
              {OP_SYMBOL[node.operation] ?? node.operation} {node.rightOperand}
            </div>
          )}
          <div className={`node-result ${resultColorClass}`}>
            {node.result}
          </div>
          <div className="node-meta">
            {isRoot ? "root · depth 0" : `depth ${depth}`}
            {hasChildren && ` · ${node.children.length} branch${node.children.length !== 1 ? "es" : ""}`}
          </div>
        </div>

        {/* Actions */}
        <div className="node-actions">
          {hasChildren && (
            <button
              className="btn-collapse"
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? "Expand branches" : "Collapse branches"}
            >
              {collapsed ? "▶" : "▼"}
            </button>
          )}
          <button
            className="btn-branch"
            onClick={() => setShowForm(s => !s)}
          >
            {showForm ? "Cancel" : "+ Branch"}
          </button>
        </div>
      </div>

      {showForm && (
        <OperationForm
          parentId={node.id}
          parentResult={node.result}
          onSuccess={() => { setShowForm(false); reload(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!collapsed && hasChildren && (
        <div className="node-children">
          {node.children.map(child => (
            <div className="node-child-item" key={child.id}>
              <CalculationNode node={child} reload={reload} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
