import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import { calculate } from "../services/calc.service";

const router = Router();

interface CalcNode {
  id: string;
  parentId?: string;
  startValue?: number;
  operation?: string;
  rightOperand?: number;
  result: number;
  authorId: string;
}

interface CalcNodeWithChildren extends CalcNode {
  children: CalcNodeWithChildren[];
}

// In-memory store
const nodes: CalcNode[] = [];

function buildTree(allNodes: CalcNode[], parentId?: string): CalcNodeWithChildren[] {
  return allNodes
    .filter(n => n.parentId === parentId)
    .map(n => ({ ...n, children: buildTree(allNodes, n.id) }));
}

router.get("/", auth, (req, res) => {
  const userId = (req as any).userId;
  const userNodes = nodes.filter(n => n.authorId === userId);
  const tree = buildTree(userNodes, undefined);
  res.json(tree);
});

router.post("/start", auth, (req, res) => {
  const { value } = req.body;
  const userId = (req as any).userId;

  if (value === undefined || isNaN(Number(value))) {
    return res.status(400).json({ message: "Invalid value" });
  }

  const node: CalcNode = {
    id: Date.now().toString(),
    result: Number(value),
    startValue: Number(value),
    authorId: userId
  };

  nodes.push(node);
  res.json(node);
});

router.post("/:id/operate", auth, (req, res) => {
  const { operation, rightOperand } = req.body;
  const userId = (req as any).userId;

  const parent = nodes.find(n => n.id === req.params.id && n.authorId === userId);
  if (!parent) return res.status(404).json({ message: "Not found" });

  let result: number;
  try {
    result = calculate(parent.result, operation, Number(rightOperand));
  } catch {
    return res.status(400).json({ message: "Invalid operation" });
  }

  const node: CalcNode = {
    id: Date.now().toString(),
    parentId: parent.id,
    operation,
    rightOperand: Number(rightOperand),
    result,
    authorId: userId
  };

  nodes.push(node);
  res.json(node);
});

export default router;
