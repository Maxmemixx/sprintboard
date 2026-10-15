
BEGIN;

-- Roles that a user can have within a project.
CREATE TYPE project_role AS ENUM (
    'OWNER',
    'ADMIN',
    'MEMBER',
    'VIEWER'
);

-- Workflow states for tasks.
CREATE TYPE task_status AS ENUM (
    'BACKLOG',
    'TODO',
    'IN_PROGRESS',
    'DONE'
);

-- Task priorities.
CREATE TYPE task_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(80) NOT NULL
        CHECK (length(trim(display_name)) > 0),
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email addresses are unique regardless of capitalization.
CREATE UNIQUE INDEX users_email_unique
    ON users (lower(email));

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL
        CHECK (length(trim(name)) > 0),
    description TEXT,
    created_by UUID NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX projects_created_by_idx
    ON projects (created_by);

-- Project membership and authorization roles.
CREATE TABLE project_members (
    project_id UUID NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    role project_role NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX project_members_user_id_idx
    ON project_members (user_id);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL
        CHECK (length(trim(title)) > 0),
    description TEXT,
    status task_status NOT NULL DEFAULT 'TODO',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    due_date DATE,
    position INTEGER NOT NULL DEFAULT 0,
    creator_id UUID NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    assignee_id UUID
        REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tasks_project_status_idx
    ON tasks (project_id, status);

CREATE INDEX tasks_project_priority_idx
    ON tasks (project_id, priority);

CREATE INDEX tasks_assignee_idx
    ON tasks (assignee_id);

CREATE INDEX tasks_project_created_at_idx
    ON tasks (project_id, created_at DESC);

CREATE INDEX tasks_due_date_idx
    ON tasks (due_date)
    WHERE due_date IS NOT NULL;

-- Comments on tasks
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL
        REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    body TEXT NOT NULL
        CHECK (length(trim(body)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_task_created_at_idx
    ON comments (task_id, created_at);

-- Keep updated_at current whenever a record changes.
CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER projects_set_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tasks_set_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER comments_set_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
