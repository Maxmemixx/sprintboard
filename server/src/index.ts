
import express from "express";
import cors from "cors";

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

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
