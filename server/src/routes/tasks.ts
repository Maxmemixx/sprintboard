
import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";

const router = Router({ mergeParams: true });

// GET /api/projects/:projectId/tasks
router.get("/", async (req, res) => {
    const projectIdResult = z.string().uuid().safeParse(
    (req.params as { projectId: string }).projectId,
    );

  if (!projectIdResult.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  const projectId = projectIdResult.data;

  try {
    // Check that the project exists.
    const projectResult = await pool.query(
      "SELECT id FROM projects WHERE id = $1",
      [projectId],
    );

    if (projectResult.rows.length === 0) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Retrieve tasks belonging to this project.
    const result = await pool.query(
      `SELECT
         id,
         project_id,
         title,
         description,
         status,
         priority,
         due_date,
         position,
         creator_id,
         assignee_id,
         created_at,
         updated_at
       FROM tasks
       WHERE project_id = $1
       ORDER BY position ASC, created_at ASC`,
      [projectId],
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    console.error("Failed to fetch project tasks:", error);
    res.status(500).json({ error: "Failed to fetch project tasks" });
  }
});

export default router;
