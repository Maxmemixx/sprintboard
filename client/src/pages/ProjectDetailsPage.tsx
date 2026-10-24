
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../api";
import type { Project } from "../api";

function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setError("Missing project ID.");
      setLoading(false);
      return;
    }

    const id = projectId;

    async function loadProject() {
      try {
        setError("");
        const data = await getProject(id);
        setProject(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load project.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProject();
  }, [projectId]);

  return (
    <main className="app">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">S</span>
          SprintBoard
        </Link>
        <span className="topbar-label">PROJECT WORKSPACE</span>
      </header>

      <section className="content">
        <Link className="back-link" to="/">
          &larr; All projects
        </Link>

        {loading ? (
          <p className="state-message">Loading project...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : project ? (
          <>
            <div className="page-heading">
              <p className="eyebrow">PROJECT WORKSPACE</p>
              <h1>{project.name}</h1>
              <p className="subtitle">
                {project.description?.trim() || "No description provided."}
              </p>
            </div>

            <section className="panel">
              <h2>Tasks</h2>
              <p className="subtitle">
                Task list.
              </p>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}

export default ProjectDetailsPage;
