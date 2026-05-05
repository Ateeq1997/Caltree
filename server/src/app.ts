import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import calcRouter from "./routes/calculation.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/calculations", calcRouter);

export default app;
