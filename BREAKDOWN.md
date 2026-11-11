# Project Breakdown — Members Directory (MemberCore)

Frontend-only members directory dashboard with a mock API (Next.js route handlers + in-memory store), built test-first on Clean Architecture, FDD and Atomic Design.

## 1. Feature Flows

### A. Members Directory (read)

- On mount, the page dispatches `fetchMembers` + `fetchMemberStats` exactly once → renders 4 KPI cards (Total Members *+N this month*, Active Now *% live activity*, Departments *N active units*, Pending Invites *N expiring soon*) and the member table (sorted `joined_at` desc, avatar + name/email per row, department & status pills, formatted joined date, Edit link + delete icon per row).
- **Search** is debounced 300ms (`useDebouncedValue`), partial + case-insensitive across `full_name ∪ email ∪ job_title`. No match → empty state ("No members found", quoting the query) with a **Clear search** button that refetches the full list immediately (no debounce).
- **Selection**: row checkboxes + header select-all (checked/indeterminate derived state); `selectedIds` is pruned to displayed rows after every refetch.
- **Export CSV** is fully client-side from the *displayed* (filtered) rows — contract header, short status, formatted dates, RFC 4180 escaping.

### B. Delete flow (single & bulk)

- Trash icon or bulk-bar Delete → `requestDeletion` → **confirm dialog** → `DELETE {ids}` → `{deleted, failed}` partition (hard delete) → success modal (rose trash icon, footer strip, **Dismiss**) with the member name(s); selection cleared; list + stats refetched.
- Deleting from the edit page redirects to `/` and the success modal shows on the dashboard (global Redux state).

### C. Add member

- `/members/new` → two-section form (General Information; Work Details & Permissions), 7 fields, required markers, helper texts, dropdowns from the enum constants.
- Client-side validation runs first (invalid → inline "Required"/messages, **no dispatch**). Valid → `POST` → "Member Added Successfully" modal with name + generated code (`#MEM-2049`) → Back to Dashboard.

### D. Edit member

- `/members/[id]/edit` → fetch by route id → pre-filled form in a two-column layout: left profile sidebar (avatar, name, role, email, repositories/deployments) + right form card with footer bar (**Delete Member** left, Cancel/Save right).
- Header: back button, member name, status pill, monospace `ID: #MEM-2048` + "Joined February 2022", **Copy ID** → clipboard `#MEM-2048` + toast.
- Save → `PUT` (server preserves `id`/`joined_at`/`activity`) → "Member Updated Successfully" (Continue Editing stays / Back to Dashboard). Unknown id → clean error state.

### E. Error handling

- Typed domain errors flow end-to-end: `MemberNotFoundError` (404), `MemberEmailConflictError` (409 → marks the email field), `MemberValidationFieldsError` (422 → field-level inline errors), `EmptyDeletionSelectionError`, `ApiUnexpectedError`. The UI never inspects HTTP codes — the repository translates envelopes into these.

## 2. API Endpoints (mock, base `/api`)

| Method | Path | Behavior |
|---|---|---|
| GET | `/members` | List + filters: `search` (partial, case-insensitive, name∪email∪job_title), `status` (active/inactive prefix), `department` (exact); `sort` reserved (default `joined_at` desc); no pagination |
| GET | `/members/stats` | KPIs: totals, new_this_month, active_now, activity_rate, departments, active_units, pending_invites (5), expiring_soon (3 — display-only constants) |
| GET | `/members/[id]` | Single member incl. `activity`; 404 `NOT_FOUND` envelope |
| POST | `/members` | Create; shared validation → 422 `VALIDATION_ERROR {fields}`; duplicate email (case-insensitive) → 409 `CONFLICT`; 201 with next id, `joined_at`=today, `activity {0,0}` |
| PUT | `/members/[id]` | Full replacement preserving `id`/`joined_at`/`activity`; 404 / 422 / 409 (email owned by another member; keeping own email OK) |
| DELETE | `/members` | Single & bulk via body `{ids: number[]}` (non-empty integer array else 422); hard delete; `200 {deleted:[], failed:[]}` |

Uniform error envelope: `{ error: { code, message, fields? } }`.

## 3. Known Shortcomings

1. **No persistence** — the mock store is in-memory; data resets on restart (and would be per-instance on serverless).
2. **No auth** — the profile bar (Alex Vance) is a static mock; no login/roles.
3. **No pagination** — deliberate per scope; fine at ±150 members, needs `page`/`limit` at scale.
4. **No filter/sort UI** — `status`/`department` params exist and are tested end-to-end, but the design only ships a search bar (blocked on designer confirmation); `sort` is reserved.
5. **Invite flow out of scope** — pending invites / expiring soon are hardcoded display values.
6. **Accessibility gaps** — solid basics (labels, `aria-describedby`, dialog roles) but no focus trap in modals and no formal contrast/keyboard audit.
7. **No e2e tests / CI** — 98 unit/integration tests via mocked controllers; no Playwright, no pipeline, no lint config, no coverage threshold.
8. **List-failure UI missing** — the slice tracks `listStatus: failed` but there's no dedicated error banner for a failed fetch.
9. **Minor design deviations** — inline input icons deferred, KPI icon chips approximated, avatar tone rotation is id-based rather than the designer's exact assignments.
10. **Cross-feature coupling** — `member-form` imports the repository interface and some presentation pieces from `member-list` (documented precedent; a shared member kernel would formalize it).
11. **Responsive is basic** — grids collapse at breakpoints, but the design targets 1280px desktop only.
