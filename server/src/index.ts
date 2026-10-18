
import express from "express";
import cors from "cors";
import projectsRouter from "./routes/projects.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sprintboard-api",
  });
});

app.use("/api/projects", projectsRouter);

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
