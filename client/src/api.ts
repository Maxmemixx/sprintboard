
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectsResponse {
  projects: Project[];
}

interface ProjectResponse {
  project: Project;
}

async function readError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return body?.error ?? `Request failed (${response.status})`;
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/api/projects`);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data = (await response.json()) as ProjectsResponse;
  return data.projects;
}

export async function createProject(
  name: string,
  description: string,
): Promise<Project> {
  const response = await fetch(`${API_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data = (await response.json()) as ProjectResponse;
  return data.project;
}
