# Members Directory — MemberCore

Frontend-only members directory dashboard, built with a pragmatic TDD workflow on top of Clean Architecture, FDD (feature-driven slicing) and Atomic Design. The backend is a mock API implemented as Next.js route handlers with an in-memory store. UI reference designs live in `docs/design/` (screen: `member-list-normal.png`).

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
| `npm run test` | Vitest run (95 tests) |
| `npm run test:watch` | Vitest watch mode |
| `npm run typecheck` | `tsc --noEmit` (tests included) |
| `npm run build` / `npm start` | Production build / serve |

## Architecture

```
src/
├── app/                        # routes: pages ('use client') + mock API handlers
│   ├── page.tsx                # '/' dashboard
│   ├── members/new|            # add form
│   ├── members/[id]/edit/      # edit form
│   └── api/members/            # GET/POST/DELETE collection, GET/PUT [id], /stats
│       └── mocks.ts            # 10-member seed + resetMemberStore()
├── features/                   # FDD slices
│   ├── member-list/       # read model: domain, use cases, infra, controller
│   └── member-form/            # write model: validation + create/update use cases
├── shared/
│   ├── lib/                    # pure helpers (formatters, csv, delay)
│   ├── constants/enums.ts      # re-export of domain enums for the UI
│   └── presentation/           # atoms/molecules/organisms/templates + Redux store
└── composition/registry.ts     # DI: default ApiMemberRepository, test seam setMemberRepository
```

**Data flow:** page → template → thunk → controller → use case → repository (interface) → infrastructure. Domain errors are typed (`MemberNotFoundError`, `MemberEmailConflictError`, `MemberValidationFieldsError`, …); the API repository translates HTTP envelopes into them so the UI never inspects status codes.

The mock API reuses the same `InMemoryMemberRepository` as the fast test double, and `_shared/member-payload.ts` shares the form's validation rules with the server — one source of truth.

## Testing

The catalogue in `docs/test-cases/` is the work order: stable IDs map 1:1 to `it('XX-NN: …')` names.

| Prefix | Area |
| --- | --- |
| SH-01..09 | shared lib formatters/CSV + atoms & form-field |
| MD-01..13 | member-list use cases, API repository, dashboard page |
| MF-01..15 | member-form validation, use cases, repository writes, form UI |
| ME-01..05 | member detail / edit page |
| API-01..12 | mock API route handlers (called directly with `new Request(...)`) |

Coverage notes: every step ended `test` + `typecheck` green (see git history: steps 0–11, each merged to `main`). Two testing gotchas documented in commits: `userEvent.type` hangs under fake timers (use `fireEvent.change` bursts for debounce tests), and `userEvent.setup()` installs its own `navigator.clipboard` (patch a mock **after** setup).

## Manual walkthrough (8 states)

1. **Dashboard default** — top profile bar (Alex Vance) + 4 KPI cards (Total Members 10 "+1 this month" · Active Now 8 "80% live activity" · Departments 2 "2 active units" · Pending Invites 5 "3 expiring soon") + table of the 10 seed members, sorted by joined date desc.
2. **Search empty state** — search `Samantha Williams` → "No members found" + **Clear search** → clicking it refetches the full list.
3. **Delete single** — trash icon on Sarah Jenkins → confirm dialog → "Member Deleted Successfully" modal (permissions/sessions/tokens revoked) → row gone, KPIs refetch, selection resets.
4. **Bulk delete** — select 4 rows via the header checkbox → bulk action bar "4 selected" → Delete → confirm → success modal.
5. **Add member** — `+ Add Member` → fill the form (Michael Phelps) → "Member Added Successfully — Michael Phelps (#MEM-2049)" → Back to Dashboard, the new member appears in the table.
6. **Edit member** — Edit on Sarah Jenkins → header `#MEM-2048`, joined date, profile card (42 Repositories / 1,489 Deployments), form prefilled → change something → "Member Updated Successfully" → Continue Editing keeps the form open, Back returns to `/`.
7. **Copy ID** — Copy ID on the edit page → clipboard contains `#MEM-2048` + toast confirmation.
8. **Export CSV** — with an active search filter, Export CSV downloads exactly the displayed rows with the contract header (`Full Name,Email,Job Title,Department,Status,Joined Date`), RFC 4180 escaping, short status and formatted dates.

## Mock data facts

- Seed ids 2039–2048 (Sarah Jenkins = 2048, activity 42/1489, joined 2022-02-14), 8 Active / 2 Inactive, 7 Engineering / 3 Design, one member joined "today" so *New This Month* is stable on any run date.
- `account_status` values use an **en dash** (`Active – Full Workspace Access`); source files must stay UTF-8 and tests compare against the enum constants.
- `pending_invites` (5) and `expiring_soon` (3) are display-only constants; no invite flow in this phase.
- DELETE is a hard delete, single & bulk via one endpoint (body `{ "ids": [...] }`), partitioned into `deleted` / `failed`.
