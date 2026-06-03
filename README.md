# Doozy

A full-stack todo application with categories, bulk actions, and filtering. Built with NestJS and React.

## Project Structure

```
backend/                 # NestJS REST API
  src/
    @generated/          # Auto-generated Prisma client
    category/            # Category module (controller, service, DTOs)
    todo/                # Todo module (controller, service, DTOs)
    config/              # App configuration
    database/            # Prisma database module
  prisma/
    schema.prisma        # Database schema
    migrations/          # Migration history

frontend/                # React SPA
  src/
    api/                 # Axios HTTP client and API functions
    components/
      categories/        # Category select, create form
      todos/             # Todo list, item, filters, bulk actions, create form
      layout/            # App layout shell
      ui/                # Reusable UI primitives (Select, Spinner, etc.)
    hooks/               # Custom React hooks
    types/               # Shared TypeScript types
    utils/               # Utilities (cn for class merging)
```

## Tech Stack

**Backend**

- [NestJS](https://nestjs.com/) - REST API framework
- [Prisma](https://www.prisma.io/) - ORM with SQLite via better-sqlite3
- [Zod](https://zod.dev/) - Environment variable validation
- [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer) - DTO validation
- [Jest](https://jestjs.io/) - Unit testing
- TypeScript

**Frontend**

- [React](https://react.dev/)
- [Vite](https://vite.dev/) - Build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Axios](https://axios-http.com/) - HTTP client
- [Lucide React](https://lucide.dev/) - Icons
- TypeScript

**Tooling**

- [Biome](https://biomejs.dev/) - Linting and formatting (monorepo-wide)
- SQLite - Embedded database (zero setup)

## Setup

### Prerequisites

- Node.js v24+
- npm

### 1. Install dependencies

```bash
# Root (Biome + shared tooling)
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Configure environment

Create a `backend/.env` file:

```
PORT=3000
DATABASE_URL="file:./dev.db"
```

Create a `frontend/.env` file:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Generate Prisma client and run migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 4. Start development servers

```bash
# Terminal 1 - Backend (http://localhost:3000)
cd backend && npm run start:dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend && npm run dev
```

### 5. Verify

Open `http://localhost:5173` in your browser. Create a category, then add a todo.

## AI Workflow

This project uses [Claude Code](https://docs.anthropic.com/en/docs/claude-code) as a core part of the development workflow, covering both code review and feature implementation.

### PR Reviews

Pull requests are reviewed using a custom `/pr-review` command (defined in `.claude/commands/pr-review.md`). When given a PR number, it:

1. Fetches the PR diff and commit history via `gh`
2. Reviews changes for correctness, convention adherence, and security issues
3. Posts inline comments directly on the PR with severity levels
4. Labels the PR as `claude-reviewed`

It also works without a PR number, reviewing the current branch diff locally.

## License

MIT
