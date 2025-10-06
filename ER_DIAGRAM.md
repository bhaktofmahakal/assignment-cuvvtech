# **DATABASE ER DIAGRAM - PROJECT MANAGEMENT SYSTEM**

## **Entity Relationship Diagram**

```
┌─────────────────────────────────────┐
│                USERS                │
├─────────────────────────────────────┤
│ id (PK)              INTEGER        │
│ username             VARCHAR(50)    │ UNIQUE
│ email                VARCHAR(100)   │ UNIQUE
│ full_name            VARCHAR(100)   │
│ hashed_password      VARCHAR(255)   │
│ role                 ENUM           │ (admin, project_manager, developer)
│ is_active            BOOLEAN        │
│ created_at           TIMESTAMP      │
│ updated_at           TIMESTAMP      │
└─────────────────────────────────────┘
                  │
                  │ 1:M (manager)
                  ▼
┌─────────────────────────────────────┐
│               PROJECTS              │
├─────────────────────────────────────┤
│ id (PK)              INTEGER        │
│ name                 VARCHAR(100)   │
│ description          TEXT           │
│ status               ENUM           │ (planning, in_progress, on_hold, completed, cancelled)
│ start_date           TIMESTAMP      │
│ end_date             TIMESTAMP      │
│ manager_id (FK)      INTEGER        │ → users.id
│ created_at           TIMESTAMP      │
│ updated_at           TIMESTAMP      │
└─────────────────────────────────────┘
                  │
                  │ 1:M
                  ▼
┌─────────────────────────────────────┐
│                TASKS                │
├─────────────────────────────────────┤
│ id (PK)              INTEGER        │
│ title                VARCHAR(200)   │
│ description          TEXT           │
│ status               ENUM           │ (todo, in_progress, done)
│ priority             ENUM           │ (low, medium, high, critical)
│ project_id (FK)      INTEGER        │ → projects.id
│ assignee_id (FK)     INTEGER        │ → users.id
│ due_date             TIMESTAMP      │
│ created_at           TIMESTAMP      │
│ updated_at           TIMESTAMP      │
└─────────────────────────────────────┘
                  │
                  │ 1:M
                  ▼
┌─────────────────────────────────────┐
│            TASK_COMMENTS            │
├─────────────────────────────────────┤
│ id (PK)              INTEGER        │
│ content              TEXT           │
│ task_id (FK)         INTEGER        │ → tasks.id
│ author_id (FK)       INTEGER        │ → users.id
│ created_at           TIMESTAMP      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│             USER_STORIES            │
├─────────────────────────────────────┤
│ id (PK)              INTEGER        │
│ title                VARCHAR(200)   │
│ description          TEXT           │
│ acceptance_criteria  TEXT           │
│ project_id (FK)      INTEGER        │ → projects.id
│ created_at           TIMESTAMP      │
│ updated_at           TIMESTAMP      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          PROJECT_MEMBERS            │
│         (Junction Table)            │
├─────────────────────────────────────┤
│ project_id (PK,FK)   INTEGER        │ → projects.id
│ user_id (PK,FK)      INTEGER        │ → users.id
└─────────────────────────────────────┘
```

## **RELATIONSHIPS**

### **1:M (One-to-Many) Relationships**
- **USERS → PROJECTS**: One user can manage multiple projects
- **USERS → TASKS**: One user can be assigned to multiple tasks
- **USERS → TASK_COMMENTS**: One user can author multiple comments
- **PROJECTS → TASKS**: One project can have multiple tasks
- **PROJECTS → USER_STORIES**: One project can have multiple user stories
- **TASKS → TASK_COMMENTS**: One task can have multiple comments

### **M:M (Many-to-Many) Relationships**
- **USERS ↔ PROJECTS**: Users can be members of multiple projects (via PROJECT_MEMBERS junction table)

## **KEY CONSTRAINTS**

### **Primary Keys (PK)**
- All tables have auto-incrementing `id` as primary key
- Junction table `PROJECT_MEMBERS` has composite primary key (project_id, user_id)

### **Foreign Keys (FK)**
- `projects.manager_id` → `users.id`
- `tasks.project_id` → `projects.id`
- `tasks.assignee_id` → `users.id`
- `task_comments.task_id` → `tasks.id`
- `task_comments.author_id` → `users.id`
- `user_stories.project_id` → `projects.id`
- `project_members.project_id` → `projects.id`
- `project_members.user_id` → `users.id`

### **Unique Constraints**
- `users.username` - UNIQUE
- `users.email` - UNIQUE

### **Indexes**
- Primary keys (automatic)
- `users.username`, `users.email` (unique indexes)
- `projects.name`, `tasks.title` (performance indexes)

### **Cascading Rules**
- **Projects → Tasks**: CASCADE DELETE (delete all tasks when project is deleted)
- **Projects → User Stories**: CASCADE DELETE (delete all stories when project is deleted)
- **Tasks → Task Comments**: CASCADE DELETE (delete all comments when task is deleted)

## **BUSINESS RULES**

1. **User Role Hierarchy**: Admin > Project Manager > Developer
2. **Project Management**: Only Project Managers and Admins can create/modify projects
3. **Task Assignment**: Tasks can be assigned to any project member
4. **Task Workflow**: TODO → IN_PROGRESS → DONE (one-way progression)
5. **Project Status Flow**: PLANNING → IN_PROGRESS → (COMPLETED | CANCELLED | ON_HOLD)

## **DATA TYPES & VALIDATION**

### **Enumerations**
- **UserRole**: admin, project_manager, developer
- **ProjectStatus**: planning, in_progress, on_hold, completed, cancelled
- **TaskStatus**: todo, in_progress, done
- **TaskPriority**: low, medium, high, critical

### **String Lengths**
- Username: max 50 chars
- Email: max 100 chars
- Full Name: max 100 chars
- Hashed Password: max 255 chars
- Project Name: max 100 chars
- Task Title: max 200 chars
- User Story Title: max 200 chars

### **Timestamps**
- All timezone-aware timestamps using PostgreSQL's `TIMESTAMP WITH TIME ZONE`
- Auto-generated `created_at` for all entities
- Auto-updated `updated_at` for entities that can be modified