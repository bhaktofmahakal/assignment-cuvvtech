# Project Management Tool

A comprehensive enterprise-grade project management web application built with modern technologies, featuring role-based access control, real-time task tracking, and AI-powered user story generation.

## Features

### Core Functionality
- **User Management** with role-based access (Admin, Project Manager, Developer)
- **Project Management** with team assignment and progress tracking
- **Task Management** with status workflows, priorities, and deadlines
- **Real-time Dashboard** with metrics and progress visualization
- **JWT Authentication** with secure token-based authorization

### Advanced Features
- **AI-Powered User Story Generation** using GROQ API
- **Responsive Material-UI Design** with professional interface
- **RESTful API** with comprehensive Swagger documentation
- **Real-time Progress Tracking** with completion percentages
- **Role-based Access Control** with granular permissions

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework with automatic API documentation
- **PostgreSQL** - Robust relational database with ACID compliance
- **SQLAlchemy** - Powerful ORM with Alembic migrations
- **JWT** - Secure stateless authentication
- **GROQ API** - AI integration for intelligent user story generation
- **Pytest** - Comprehensive testing framework

### Frontend
- **React 18** with TypeScript for type safety and modern development
- **Material-UI (MUI)** - Professional component library
- **React Query** - Efficient data fetching and state management
- **React Router** - Client-side routing
- **Axios** - HTTP client with request/response interceptors

### DevOps & Infrastructure
- **Docker & Docker Compose** - Containerization for consistent deployment
- **Alembic** - Database schema migrations
- **Environment Configuration** - Secure configuration management

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 13+**
- **Docker & Docker Compose** (optional but recommended)

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd assignment-cuvvtech

# Copy and configure environment variables
cp .env.example .env 
or rename to .env
# Edit .env with your secure credentials

# Start all services
docker-compose up -d

# Initialize database with sample data
docker-compose exec backend python scripts/create_initial_data.py

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp ../.env.example .env
# Edit .env with your configuration

# Setup database
createdb projectmgmt
alembic upgrade head

# Create initial data
python scripts/create_initial_data.py

# Start the server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > .env

# Start the development server
npm start
```

## Default User Accounts

The system comes pre-configured with demo accounts for testing:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| **Admin** | `admin` | `admin123` | Full system access |
| **Project Manager** | `john_manager` | `manager123` | Manage projects and tasks |
| **Developer** | `alice_dev` | `dev123` | View assigned tasks |
| **Developer** | `bob_dev` | `dev123` | View assigned tasks |

## Database Schema

### Core Entities

#### Users
- **id** (Primary Key)
- **username** (Unique)
- **email** (Unique)
- **full_name**
- **hashed_password**
- **role** (admin, project_manager, developer)
- **is_active**
- **created_at**, **updated_at**

#### Projects
- **id** (Primary Key)
- **name**
- **description**
- **status** (planning, in_progress, on_hold, completed, cancelled)
- **start_date**, **end_date**
- **manager_id** (Foreign Key → Users)
- **created_at**, **updated_at**

#### Tasks
- **id** (Primary Key)
- **title**
- **description**
- **status** (todo, in_progress, done)
- **priority** (low, medium, high, critical)
- **project_id** (Foreign Key → Projects)
- **assignee_id** (Foreign Key → Users)
- **due_date**
- **created_at**, **updated_at**

#### User Stories (AI Feature)
- **id** (Primary Key)
- **title**
- **description**
- **acceptance_criteria**
- **project_id** (Foreign Key → Projects)
- **created_at**, **updated_at**

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/` - List all users (Admin only)
- `POST /api/v1/users/` - Create user (Admin only)
- `PUT /api/v1/users/{id}` - Update user (Admin only)
- `DELETE /api/v1/users/{id}` - Delete user (Admin only)

### Projects
- `GET /api/v1/projects/` - List projects
- `POST /api/v1/projects/` - Create project
- `GET /api/v1/projects/{id}` - Get project details
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### Tasks
- `GET /api/v1/tasks/` - List tasks
- `POST /api/v1/tasks/` - Create task
- `GET /api/v1/tasks/{id}` - Get task details
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `POST /api/v1/tasks/{id}/comments` - Add comment

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/recent-activity` - Get recent activity

### AI Features
- `POST /api/v1/ai/generate-user-stories` - Generate user stories with AI

## Testing

### Backend Tests
```bash
cd backend
pytest -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Configuration

### Environment Variables

#### Backend (.env)
Create a `.env` file in the backend directory using `.env.example` as template:

```bash
cp .env.example backend/.env
```

Configure the following required variables:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SECRET_KEY=generate-a-secure-random-secret-key-at-least-32-characters
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=your-groq-api-key-here  # Optional: For AI features
```

**Security Note**: Never commit `.env` files to version control. All sensitive configuration is loaded from environment variables.

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## AI Integration

The application includes AI-powered user story generation using the GROQ API:

1. **Navigate to a project**
2. **Click "Generate User Stories"**
3. **Provide a project description**
4. **AI automatically generates professional user stories**

### Example Usage

Input:
```
An ecommerce website where customers can browse products, add to cart, and make payments online. Admin should manage products and view orders.
```

Output:
```
- As a customer, I want to browse products, so that I can choose what to buy.
- As a customer, I want to add products to a cart, so that I can purchase them later.
- As an admin, I want to manage the product catalog, so that the website reflects correct inventory.
```

## Database Schema

### Entity Relationship Diagram

The application uses a well-structured PostgreSQL database with the following entities and relationships:

![ER Diagram](ER_DIAGRAM.svg)

For detailed database documentation, see [ER_DIAGRAM.md](ER_DIAGRAM.md).

### Key Entities
- **Users** - Admin, Project Manager, Developer roles
- **Projects** - Project management with status tracking
- **Tasks** - Task assignments with workflow (TODO → IN_PROGRESS → DONE)
- **Task Comments** - Collaboration and communication
- **User Stories** - AI-generated or manual user stories
- **Project Members** - Many-to-many user-project associations

### Relationships
- **1:M** - Users manage projects, projects contain tasks
- **M:M** - Users can be members of multiple projects
- **Cascading Deletes** - Maintain referential integrity

## Security & Performance

### Security Features
- **JWT Authentication** with configurable expiration
- **Password Hashing** using bcrypt
- **Role-based Access Control** with granular permissions
- **CORS Configuration** for cross-origin requests
- **SQL Injection Protection** via SQLAlchemy ORM
- **Environment-based Configuration** for secrets

### Performance Optimizations
- **Database Indexing** on frequently queried columns
- **Connection Pooling** for database efficiency
- **Lazy Loading** for related entities
- **React Query Caching** for frontend performance
- **Containerized Deployment** for scalability

## Deployment

### Production Deployment

1. **Configure environment variables**
2. **Setup PostgreSQL database**
3. **Build and deploy containers**

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## Development Guidelines

### Code Quality Standards
- **Type Safety** with TypeScript
- **Consistent Formatting** with Prettier
- **Modular Architecture** with separation of concerns
- **Comprehensive Error Handling** with proper HTTP status codes
- **Detailed Logging** for debugging and monitoring

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## Architecture & Design Decisions

### Technical Architecture
- **Monorepo Structure** for simplified development and deployment
- **JWT Tokens** for stateless authentication
- **Role-based Access** for scalable permission management
- **PostgreSQL** for ACID compliance and complex relational queries
- **Material-UI** for consistent, professional user interface

### Business Logic
- **Project Managers** can only manage their assigned projects
- **Developers** can only view tasks assigned to them or in their projects
- **Admins** have full system access
- **Task Status Workflow**: To Do → In Progress → Done
- **Project Progress** calculated based on completed task percentage

## Future Enhancements

### Technical Improvements
- **WebSocket Integration** for real-time collaborative updates
- **File Upload System** for task attachments and documents
- **Advanced Reporting** with charts and analytics dashboard
- **Mobile Application** with React Native
- **Microservices Architecture** for horizontal scalability
- **Redis Caching** for improved API response times

### Feature Enhancements
- **Time Tracking** for tasks and projects
- **Notification System** for deadlines and status updates
- **Advanced Search** with filters and full-text search
- **Gantt Charts** for project timeline visualization
- **Integration APIs** for third-party tools (Slack, Jira, etc.)
- **Enhanced AI Features** for project insights and recommendations

## License

This project is created for evaluation purposes as part of a software development assignment.

## Contributing

This is an assignment project demonstrating enterprise-level web application development capabilities.

---

**Note**: This application demonstrates production-ready architecture with modern web development best practices, including secure authentication, role-based authorization, database optimization, API design, and AI integration.