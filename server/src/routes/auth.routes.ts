import { Router } from "express";
import { hashPassword, comparePassword, generateToken } from "../services/auth.service";

const router = Router();

interface User {
  id: string;
  username: string;
  passwordHash: string;
}

// In-memory user store
const users: User[] = [];

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: "Username already taken" });
  }

  const passwordHash = await hashPassword(password);
  const id = Date.now().toString();
  users.push({ id, username, passwordHash });

  res.json({ message: "Registered successfully" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.id);
  res.json({ token });
});

export default router;
