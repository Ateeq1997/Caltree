// ─── Types ────────────────────────────────────────────────────────────────────
interface User { id: string; username: string; passwordHash: string; }
interface CalcNode {
  id: string; parentId?: string; result: number;
  operation?: string; rightOperand?: number; authorId: string;
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function getUsers(): User[] {
  return JSON.parse(localStorage.getItem("_users") ?? "[]");
}
function saveUsers(u: User[]) {
  localStorage.setItem("_users", JSON.stringify(u));
}
function getNodes(): CalcNode[] {
  return JSON.parse(localStorage.getItem("_nodes") ?? "[]");
}
function saveNodes(n: CalcNode[]) {
  localStorage.setItem("_nodes", JSON.stringify(n));
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// Very simple hash – good enough for a demo (not for production)
async function hashPw(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// ─── Build tree ───────────────────────────────────────────────────────────────
interface NodeWithChildren extends CalcNode { children: NodeWithChildren[]; }
function buildTree(nodes: CalcNode[], parentId?: string): NodeWithChildren[] {
  return nodes
    .filter(n => n.parentId === parentId)
    .map(n => ({ ...n, children: buildTree(nodes, n.id) }));
}

// ─── Mock router ──────────────────────────────────────────────────────────────
type Body = Record<string, unknown>;

async function handle(method: string, path: string, body: Body, userId?: string): Promise<unknown> {
  // POST /auth/register
  if (method === "POST" && path === "/auth/register") {
    const users = getUsers();
    if (users.find(u => u.username === body.username))
      throw { status: 409, message: "Username already taken" };
    const hash = await hashPw(String(body.password));
    const user: User = { id: uid(), username: String(body.username), passwordHash: hash };
    saveUsers([...users, user]);
    return { message: "Registered" };
  }

  // POST /auth/login
  if (method === "POST" && path === "/auth/login") {
    const users = getUsers();
    const user = users.find(u => u.username === body.username);
    const hash = await hashPw(String(body.password));
    if (!user || user.passwordHash !== hash)
      throw { status: 401, message: "Invalid credentials" };
    // token = base64(userId) — trivially decoded, fine for a demo
    const token = btoa(user.id);
    return { token };
  }

  // Everything below needs auth
  if (!userId) throw { status: 401, message: "Unauthorized" };

  // GET /calculations
  if (method === "GET" && path === "/calculations") {
    const nodes = getNodes().filter(n => n.authorId === userId);
    return buildTree(nodes, undefined);
  }

  // POST /calculations/start
  if (method === "POST" && path === "/calculations/start") {
    const val = Number(body.value);
    if (isNaN(val)) throw { status: 400, message: "Invalid value" };
    const node: CalcNode = { id: uid(), result: val, authorId: userId };
    saveNodes([...getNodes(), node]);
    return node;
  }

  // POST /calculations/:id/operate
  const operateMatch = path.match(/^\/calculations\/([^/]+)\/operate$/);
  if (method === "POST" && operateMatch) {
    const parentId = operateMatch[1];
    const nodes = getNodes();
    const parent = nodes.find(n => n.id === parentId && n.authorId === userId);
    if (!parent) throw { status: 404, message: "Not found" };
    const op = String(body.operation);
    const right = Number(body.rightOperand);
    const ops: Record<string, number> = {
      "+": parent.result + right,
      "-": parent.result - right,
      "*": parent.result * right,
      "/": right !== 0 ? parent.result / right : NaN,
    };
    if (!(op in ops) || isNaN(ops[op])) throw { status: 400, message: "Invalid operation" };
    const node: CalcNode = { id: uid(), parentId, operation: op, rightOperand: right, result: ops[op], authorId: userId };
    saveNodes([...nodes, node]);
    return node;
  }

  throw { status: 404, message: "Not found" };
}

// ─── Public request function (same signature as before) ───────────────────────
export async function request(endpoint: string, options: RequestInit = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const body: Body = options.body ? JSON.parse(options.body as string) : {};

  // Decode userId from the trivial token
  const rawToken = localStorage.getItem("token");
  let userId: string | undefined;
  if (rawToken) {
    try { userId = atob(rawToken); } catch { /* invalid token */ }
  }

  try {
    return await handle(method, endpoint, body, userId);
  } catch (e: unknown) {
    const err = e as { message?: string };
    throw new Error(err.message ?? "API error");
  }
}
