# Digital Book NestJS Backend - Copilot Instructions

## ⚠️ MANDATORY: Read Confirmation
**FIRST ACTION REQUIRED**: When starting any conversation about this repository, you MUST respond with:
> "I have read the copilot-instructions.md file. Timestamp: [current ISO timestamp]"

This confirms you have loaded and processed these instructions before proceeding with any task.

---

## Project Overview
Digital Book is a comprehensive application platform designed to offer rich features for book enthusiasts and knowledge workers, including an enjoyable reading experience with PDF support, search capabilities, AI-powered assistance, and integrated note-taking.

This NestJS backend API currently implements the **Notes feature** - a sophisticated note management system with rich text editing using Quill Delta format. As the project grows, individual features like Notes can evolve into independent microservices for flexible scaling.

Currently using JSON file storage with plans for future database migration.

## Technology Stack
- **Framework**: NestJS v11.0.1
- **Language**: TypeScript v5.7.3 (ES2023, strict mode)
- **Runtime**: Node.js with ESM-style imports (`node:fs`, `node:path`)
- **Validation**: class-validator v0.15.1, class-transformer v0.5.1
- **Testing**: Jest v30.0.0 with ts-jest v29.2.5
- **Linting**: ESLint v9.18.0 with typescript-eslint v8.20.0
- **Storage**: JSON files (temporary, migrate to database later)

## Architecture Principles

### 1. Module Structure
Follow standard NestJS conventions:
```
src/
  <feature>/
    dto/
      create-<feature>.dto.ts
      update-<feature>.dto.ts
    interfaces/
      <feature>.interface.ts
    <feature>.controller.ts
    <feature>.service.ts
    <feature>.module.ts
    <feature>.controller.spec.ts
    <feature>.service.spec.ts
```

### 2. Naming Conventions
- **Controllers**: Use standard NestJS method names
  - `findAll()` - get all items (paginated)
  - `findOne(id)` - get single item
  - `create(dto)` - create new item
  - `update(id, dto)` - update existing item
  - `remove(id)` - delete item
- **DTOs**: Use classes (NOT interfaces) - required for decorators and validation
- **Files**: kebab-case (`list-query.dto.ts`, `note.interface.ts`)
- **Classes**: PascalCase (`ListQueryDto`, `NotesService`)

### 3. API Response Standards
All API responses MUST use standardized wrappers from `src/common/`:

**Single Item Response:**
```typescript
{
  success: true,
  data: T,
  message: "Optional message",
  timestamp: "2026-04-30T10:00:00.000Z"
}
```

**List Response (ALWAYS paginated):**
```typescript
{
  success: true,
  data: T[],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNext: true,
    hasPrevious: false
  },
  message: "Optional message",
  timestamp: "2026-04-30T10:00:00.000Z"
}
```

**Error Response:**
```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Error message",
    details: {}
  },
  timestamp: "2026-04-30T10:00:00.000Z"
}
```

### 4. Controller Patterns

**Use Response Helpers:**
```typescript
import { createSingleResponse, createListResponse } from '../common';

@Get()
async findAll(@Query() query: ListQueryDto): Promise<ListResponse<Note>> {
  const { data, total } = await this.service.findAll(query.page, query.limit);
  return createListResponse(data, query.page, query.limit, total, 'Success message');
}

@Get(':id')
async findOne(@Param('id') id: string): Promise<SingleResponse<Note>> {
  const item = await this.service.findOne(id);
  return createSingleResponse(item, 'Success message');
}
```

**Always use ListQueryDto for list endpoints:**
```typescript
@Get()
async findAll(@Query() query: ListQueryDto): Promise<ListResponse<Note>> {
  // query.page, query.limit, query.includeDeleted are auto-transformed
  // No need for fallback values (|| 1) - defaults in DTO
}
```

### 5. DTO Guidelines

**Required fields use definite assignment:**
```typescript
export class CreateNoteDto {
  title!: string;        // Required
  content!: Content;     // Required
  tags?: string[];       // Optional
}
```

**Query parameters use @Transform for type safety:**
```typescript
import { Transform } from 'class-transformer';

export class ListQueryDto {
  @Transform(({ value }: { value: string }) => 
    value ? Number.parseInt(value, 10) : 1
  )
  page: number = 1;
}
```

### 6. Service Layer

**All list methods return { data, total }:**
```typescript
async findAll(page: number, limit: number): Promise<{ data: Note[]; total: number }> {
  const allItems = await this.getAllItems();
  const total = allItems.length;
  const startIndex = (page - 1) * limit;
  const data = allItems.slice(startIndex, startIndex + limit);
  return { data, total };
}
```

**Use private helper methods for shared logic:**
```typescript
private async getAllItems(includeDeleted = false): Promise<Item[]> {
  // Internal helper - not exposed to controller
}
```

## Code Style

### TypeScript
- Use `node:fs` and `node:path` imports (not `fs` or `path`)
- Prefer `Number.parseInt()` over `parseInt()`
- Use `void` for floating promises: `void bootstrap()`
- Enable strict null checks
- Use interface for data structures, class for DTOs

### ESLint Configuration
- Use modern `defineConfig()` from `'eslint/config'` (not `tseslint.config()`)
- Disable `@typescript-eslint/no-unsafe-call` for `**/*.dto.ts` files (class-transformer decorators)
- Keep strict type checking for all other files

### Imports Organization
```typescript
// 1. External dependencies
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// 2. Internal absolute imports
import { Note } from './interfaces/note.interface';
import { CreateNoteDto } from './dto/create-note.dto';

// 3. Relative imports (if needed)
import { helper } from '../utils';
```

## Testing
- Use Jest with ts-jest
- Configure `transformIgnorePatterns` for ESM packages like `uuid`
- Always provide required providers in test modules
- Run `npm test` before committing

## Git Workflow
- Branch strategy: main → staging → develop → feature/*
- Feature branches: `feature/feature-name`
- Commit messages: Follow conventional commits
  ```
  feat: add new feature
  fix: resolve bug
  refactor: restructure code
  docs: update documentation
  test: add tests
  chore: update dependencies
  ```

## Local Development Setup

### Environment Files
The app requires `.env` / `.env.local` (gitignored, not committed) with:
```
NODE_ENV=develop
FRONTEND_URL=http://localhost:4200
WEB_API_KEY=<firebase-web-api-key>
AUTH_DOMAIN=<project-id>.firebaseapp.com
GCP_PROJECT_ID=<firebase-project-id>
```
Missing these files causes frontend errors related to project ID even when the backend
and emulators are running fine.

### Firebase Emulators
Start with `firebase emulators:start` or a pinned version:
```
npx -y firebase-tools@latest emulators:start --project <project-id>
```
Default ports: hub=4400, ui=4000, logging=4500, functions=5001, dataconnect(SQL)=9399, postgres=5432.

### Troubleshooting: Emulator "port taken" errors
The Firebase SQL Connect extension's "Start emulators" button can fail silently -
the Runtime Status panel only shows a generic
`Failed to make request to http://127.0.0.1:4400/emulators`, not the real cause.
Always run `firebase emulators:start` directly in a terminal to see the actual error
(e.g. `Could not start SQL Connect Emulator, port taken.`).

This is usually caused by a previous emulator process still running in the background
(detached child/Java processes can survive terminal close). Resolve with:
```powershell
# 1. Find PIDs holding the emulator ports
netstat -ano | findstr "4400 4000 5001 9399 4500 5432"

# 2. Kill the stale process(es) (PID is the last column)
Stop-Process -Id <PID1>,<PID2> -Force

# 3. Retry
firebase emulators:start
```

## Future Considerations
- Database migration (PostgreSQL planned)
- Authentication & authorization
- File upload for images
- Real-time collaboration
- Export/import functionality

## When Suggesting Improvements
- Check latest NestJS documentation
- Ensure backwards compatibility
- Follow established patterns in this file
- Propose alternatives with pros/cons
- Keep security and performance in mind

---

**Last Updated**: August 30, 2026
**Maintainer**: User
