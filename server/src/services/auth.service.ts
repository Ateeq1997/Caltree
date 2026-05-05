import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = "secret_key";

export const hashPassword = (password: string) =>
  bcrypt.hash(password, 10);

export const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const generateToken = (userId: string) =>
  jwt.sign({ userId }, SECRET, { expiresIn: "1d" });
