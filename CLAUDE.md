# CLAUDE.md

## CRITICAL RESTRICTIONS

**NEVER execute these commands or actions:**
- `git merge`, `git rebase` - no git merge/rebase operations
- `git push --force`, `git push --force-with-lease` - no force pushing
- `git commit` / `git push` to any branch that is NOT prefixed with `claude-chore/`
- `gh pr merge`, `gh pr close`, `gh pr review --approve` - no PR decisions
- `gh issue close` - no closing issues
- `prisma migrate`, `prisma db push`, `prisma db seed` - no database mutations
- Deleting or truncating database tables
- Modifying `.env` files with production credentials

**Git PR workflow ALLOWED:**
- Create a new branch named `claude-chore/<current-branch-name>` from the current branch
- `git add`, `git commit`, `git push` on `claude-chore/*` branches only
- `gh pr create` targeting the original branch (the branch you branched from)

**GitHub operations ALLOWED (annotation only):**
- `gh pr comment` - add review comments
- `gh pr edit --add-label` - add labels
- `gh pr edit --add-reviewer` - request reviewers
- `gh issue comment` - add comments
- `gh issue edit --add-label` - add labels

**When asked to do restricted actions, refuse and explain why.**

---

## Reuse Before Creating

**Before writing ANY new service, module, utility, or type:**
1. Search the codebase for existing implementations
2. Check `backend/src/database/` for Prisma service usage patterns
3. Check `backend/src/config/` for configuration access patterns
4. Check the same module's existing files for established patterns

- Types/inputs: reuse existing DTOs instead of declaring inline types
- Never declare a private service type that duplicates a DTO's shape — import and reference the DTO class directly (e.g. `todos: UpdateTodoItemDto[]`, not a re-declared `{ id: string; status: TodoStatus }[]`)
- Never edit files under `backend/src/@generated/` — these are auto-generated

---

## Project Overview

NestJS REST API backend with Prisma (SQLite) and Biome for linting/formatting.

## Repository Structure

```
backend/
  src/
    @generated/      # Auto-generated Prisma client (DO NOT EDIT)
    config/          # ConfigModule and ConfigService
    database/        # PrismaModule and PrismaService
    main.ts
    app.module.ts
  prisma/
    schema.prisma
```

## Safe Commands

```bash
cd backend && npm run start:dev    # Start dev server
cd backend && npm run lint         # Lint and fix (Biome)
cd backend && npm run lint:check   # Lint check only
cd backend && npm test             # Run tests (Jest)
cd backend && npm run build        # Build
```

---

## Code Style

### General Rules

- `const` over `let` always
- Destructuring always
- camelCase for constants (never CAPITAL_CASE)
- No one-letter variables (except i, j, k in loops)
- No unnecessary aliases (`password` not `pwd`)
- No optionality/nullability unless required
- Never use `''` as a value — use `null` instead; empty strings are treated as invalid/absent values
- No type assertions (`as` keyword is banned)
- Prefer optional chaining with nullish coalescing over ternary null checks (`value?.toString() ?? null` not `value ? value.toString() : null`)
- Avoid using `any` type as much as possible
- Extract magic numbers to named constants that capture the business rule
- Prefer `null` over `undefined` for intentional absence; function params that accept both (`null | undefined`) should be unified to just `null`
- Never use falsy checks on values that can legitimately be `0` — use `value !== null` not `value ?` for nullable numbers
- `flatMap` over `map` + `filter`
- Return directly — don't create intermediate variables for single-use values
- Name params specifically (`userId` not `id`, `createdAfter` not `date`)
- Name booleans after the state they describe, not the behavior they imply

### Control Flow

Prefer early returns over nested conditions — braces are enforced by Biome (`useBlockStatements`).

### Types

- Use `type`, not `interface`
- PascalCase for type aliases
- Use domain types for enum-like values — use the Prisma-generated enum type everywhere the value originates from an enum; using `string` where an enum type exists is a review failure

---

## NestJS Patterns

### Logging

Use `console` — do not use NestJS `Logger`:

```typescript
// CORRECT
console.log('message')
console.error('something failed', error)

// WRONG
import { Logger } from '@nestjs/common'
this.logger.log('message')
```

### Service Structure

```typescript
@Injectable()
export class EntityService {
  constructor(private readonly prisma: PrismaService) {}

  findMany = async (args: Args): Promise<Entity[]> => {
    return this.prisma.entity.findMany(args)
  }

  create = (data: CreateInput): Promise<Entity> => {
    return this.prisma.entity.create({ data })
  }
}
```

### Controller Structure

Controllers must use the `api/` prefix and the endpoint path is a noun resource (not a verb):

```typescript
// WRONG - missing api/ prefix and verb-based path
@Controller('entity')
@Get('download-report')

// CORRECT
@Controller('api/entity')
@Get('pdf-url')
```

```typescript
@Controller('api/entity')
export class EntityController {
  constructor(private readonly service: EntityService) {}

  @Get()
  getEntities(): Promise<EntityDTO[]> {
    return this.service.findMany()
  }

  @Put(':id')
  updateEntity(
    @Param('id') id: string,
    @Body() data: UpdateEntityDTO,
  ): Promise<EntityDTO> {
    return this.service.update(id, data)
  }
}
```

### Naming Conventions

- GET methods: `get{Entity}`, `get{Entities}`
- POST methods: `create{Entity}`
- PUT methods: `update{Entity}`
- DELETE methods: `delete{Entity}`

### DTO Rules

- Every DTO class must be **exported**
- DTO fields use `!` (non-optional), not `?`. Nullable is `field!: Type | null`, never `field?: Type`

```typescript
// WRONG
class EntityDto {
  name?: string
}

// CORRECT
class EntityDto {
  name!: string
  description!: string | null
}
```

### Controller Placement Rules

- Controllers must NOT contain business logic — no validation, transformation, or helper functions; delegate everything to services
- If a method doesn't use `this`, extract it as a standalone util function, not a class method

### Validation Rules

- Business rules MUST be enforced server-side — use Zod schemas or NestJS pipes at the boundary
- Never rely solely on client-side state to enforce business logic — it can be bypassed via direct API calls

### Module Rules

- Feature-based organization
- Global modules for Prisma, Config

### Error Handling

```typescript
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

throw new NotFoundException('Entity not found')
throw new BadRequestException('Invalid input')
throw new UnauthorizedException('Access denied')

// Use Prisma's findFirstOrThrow for automatic 404
const entity = await this.prisma.entity.findFirstOrThrow({ where: { id } })
```

---

## File Naming

- `{entity}.service.ts`
- `{entity}.controller.ts`
- `{entity}.module.ts`
- `dto/{entity}.dto.ts`
- `dto/{entity}-{action}.dto.ts` (e.g., `create-task-input.dto.ts`)
- `{name}.spec.ts` (unit tests, colocated with source)

---

## Testing

```bash
cd backend && npm test                                   # All tests
cd backend && npx jest --testPathPattern="foo.spec.ts"  # Single file
```

- Test files: `*.spec.ts`, colocated with source in `backend/src/`
- Use `@nestjs/testing` (`Test.createTestingModule`) to instantiate providers in isolation
- Mock injected dependencies with `jest.fn()` — never hit a real database in a unit test

### Time-dependent tests

Pin the system clock with Jest's fake timers — never hardcode dates that assume the current date falls in a particular range:

```typescript
beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2025-08-01T12:00:00Z'))
})

afterEach(() => {
  jest.useRealTimers()
})
```

---

## Prisma Patterns

### Data Fetching Rules

- Sort data on the backend via `orderBy` — never sort on the frontend what the DB can sort
- Use `select` to fetch only needed fields — don't fetch entire records to use one property
- No redundant `await` on return statements — `return this.prisma...`, not `return await this.prisma...`

### Conditional WHERE with AND arrays

```typescript
findMany = async (filters: Filters): Promise<Entity[]> => {
  const AND: Prisma.EntityWhereInput[] = []

  if (filters.status) {
    AND.push({ status: filters.status })
  }

  if (filters.search) {
    AND.push({
      OR: [
        { name: { contains: filters.search } },
      ],
    })
  }

  return this.prisma.entity.findMany({
    where: AND.length ? { AND } : {},
    orderBy: { createdAt: 'desc' },
  })
}
```

### Prefer OrThrow variants

```typescript
// WRONG - manual null check
const entity = await this.prisma.entity.findUnique({ where: { id } })
if (!entity) { ... }

// CORRECT - automatic throw
const entity = await this.prisma.entity.findUniqueOrThrow({ where: { id } })
```

### Transactions

```typescript
await this.prisma.$transaction(async (tx) => {
  const parent = await tx.parent.create({ data: parentData })
  await tx.child.create({ data: { parentId: parent.id, ...childData } })
  return parent
})
```

### Pagination

```typescript
findMany = async ({ skip, take }: { skip: number; take: number }): Promise<{ items: Entity[]; total: number }> => {
  const [items, total] = await this.prisma.$transaction([
    this.prisma.entity.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
    this.prisma.entity.count(),
  ])
  return { items, total }
}
```

---

## Important Notes

- Never edit `@generated/` directories
- Default exports disabled — use named exports everywhere
