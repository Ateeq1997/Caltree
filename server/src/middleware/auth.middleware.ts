import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = "secret_key";

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, SECRET) as any;
    (req as any).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
