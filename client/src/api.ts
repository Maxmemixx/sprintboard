
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  due_date: string | null;
  position: number;
  creator_id: string;
  assignee_id: string | null;
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

export async function getProject(projectId: string): Promise<Project> {
  const response = await fetch(
    `${API_URL}/api/projects/${encodeURIComponent(projectId)}`,
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data = (await response.json()) as ProjectResponse;
  return data.project;
}

export async function getProjectTasks(
  projectId: string,
): Promise<Task[]> {
  const response = await fetch(
    `${API_URL}/api/projects/${encodeURIComponent(projectId)}/tasks`,
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data = (await response.json()) as { tasks: Task[] };

  return data.tasks;
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
