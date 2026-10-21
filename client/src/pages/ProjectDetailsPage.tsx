
import { Link, useParams } from "react-router-dom";

function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();

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

        <div className="page-heading">
          <p className="eyebrow">PROJECT WORKSPACE</p>
          <h1>Project details</h1>
          <p className="subtitle">
            Your project tasks will live here.
          </p>
        </div>

        <section className="panel">
          <h2>Project ID</h2>
          <p className="project-id">{projectId}</p>
          <p className="subtitle">
            More info.
          </p>
        </section>
      </section>
    </main>
  );
}

export default ProjectDetailsPage;
