
import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";

const router = Router();

// Temporary development identity. Will be replaced with the authenticated user's ID when login is implemented.
const DEV_USER_ID = "adf2ef73-810c-43c7-b023-0541119409eb";

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(5000).optional(),
});

// GET for information about a specific project
router.get("/:projectId", async (req, res) => {
  const projectIdResult = z.string().uuid().safeParse(req.params.projectId);

  if (!projectIdResult.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, name, description, created_at, updated_at
       FROM projects
       WHERE id = $1`,
      [projectIdResult.data],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// GET /api/projects
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, created_at, updated_at
       FROM projects
       ORDER BY created_at DESC`,
    );

    res.json({ projects: result.rows });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST /api/projects
router.post("/", async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid project data",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { name, description } = parsed.data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectResult = await client.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by, created_at, updated_at`,
      [name, description ?? null, DEV_USER_ID],
    );

    const project = projectResult.rows[0];

    await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'OWNER')`,
      [project.id, DEV_USER_ID],
    );

    await client.query("COMMIT");

    res.status(201).json({ project });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to create project:", error);

    res.status(500).json({ error: "Failed to create project" });
  } finally {
    client.release();
  }
});

export default router;
