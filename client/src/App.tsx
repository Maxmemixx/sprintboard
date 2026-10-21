
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createProject, getProjects } from "./api";
import type { Project } from "./api";
import { Link, Route, Routes } from "react-router-dom";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import "./App.css";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setError("");
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load projects.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");

      const project = await createProject(name, description);

      setProjects((currentProjects) => [project, ...currentProjects]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create project.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="app">
            <header className="topbar">
              <Link className="brand" to="/">
                <span className="brand-mark">S</span>
                SprintBoard
              </Link>
              <span className="topbar-label">PROJECT WORKSPACE</span>
            </header>

            <section className="content">
              <div className="page-heading">
                <p className="eyebrow">YOUR WORKSPACE</p>
                <h1>Projects</h1>
                <p className="subtitle">
                  Organize your work and keep your team moving forward.
                </p>
              </div>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Create a project</h2>
                    <p>Start something new for your team.</p>
                  </div>
                </div>

                <form className="project-form" onSubmit={handleSubmit}>
                  <label htmlFor="project-name">Project name</label>
                  <input
                    id="project-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Website redesign"
                    maxLength={120}
                    required
                  />

                  <label htmlFor="project-description">Description</label>
                  <textarea
                    id="project-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What are you planning to accomplish?"
                    rows={3}
                    maxLength={5000}
                  />

                  {error && <p className="error-message">{error}</p>}

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={creating || !name.trim()}
                    >
                      {creating ? "Creating..." : "Create project"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="projects-section">
                <div className="section-heading">
                  <div>
                    <h2>Your projects</h2>
                    <p>Projects available in your workspace.</p>
                  </div>
                  <span className="project-count">{projects.length}</span>
                </div>

                {loading ? (
                  <p className="state-message">Loading projects...</p>
                ) : projects.length === 0 ? (
                  <div className="empty-state">
                    <h3>No projects yet</h3>
                    <p>Create your first project using the form above.</p>
                  </div>
                ) : (
                  <div className="project-list">
                    {projects.map((project) => (
                      <Link
                        className="project-card project-card-link"
                        key={project.id}
                        to={`/projects/${project.id}`}
                      >
                        <div className="project-icon">
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="project-details">
                          <h3>{project.name}</h3>
                          <p>
                            {project.description?.trim() ||
                              "No description provided."}
                          </p>
                        </div>
                        <span className="project-status">Active</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </section>
          </main>
        }
      />

      <Route
        path="/projects/:projectId"
        element={<ProjectDetailsPage />}
      />
    </Routes>
  );
}

export default App;
