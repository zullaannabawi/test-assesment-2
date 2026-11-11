# Members Directory — MemberCore

Frontend-only members directory dashboard built with a pragmatic TDD workflow on top of Clean Architecture, FDD (feature-driven slicing) and Atomic Design. The backend is a mock API implemented as Next.js route handlers with an in-memory store.

## Stack

- **Next.js (App Router) 16** + **React 19** + **TypeScript (strict)**
- **Redux Toolkit** (3 slices, thunks → controller → registry)
- **Vitest + React Testing Library + jest-dom + user-event**
- CSS in one global stylesheet (design tokens via custom properties), [lucide-react](https://lucide.dev) icons
- No auth, no pagination, no UI kit — per the agreed scope

## Getting started

```bash
npm install
cp .env.example .env   # NEXT_PUBLIC_BASE_API_URL=http://localhost:3000/api
npm run dev            # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server (mock API included) |
| `npm run test` | Vitest run |
| `npm run test:watch` | Vitest watch mode |
| `npm run typecheck` | `tsc --noEmit` (tests included) |
| `npm run build` / `npm start` | Production build / serve |
