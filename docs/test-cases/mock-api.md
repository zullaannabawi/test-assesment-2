# Test Cases — Mock API (`src/app/api/members`)

Handler dites langsung sebagai fungsi (`new Request(...)`), `resetMemberStore()` di `beforeEach`.
ID stabil, dipetakan 1:1 ke nama test: `it('API-01: ...')`.

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| API-01 | GET list tanpa filter | `GET /api/members` | 200; array 10 seed; bentuk field lengkap (id..activity) |
| API-02 | GET search | `?search=sarah` / `?search=SARAH` / `?search=frontend` / tanpa cocok | partial + case-insensitive di full_name / email / job_title; tanpa cocok → `[]` |
| API-03 | GET filter status & department | `?status=inactive`; `?department=Design` | status dipetakan prefix Active/Inactive; department exact match |
| API-04 | GET sort default | tanpa & dengan `sort` | default `joined_at desc`; param `sort` diterima (reserved) |
| API-05 | GET detail | id 2048; id 9999 | 200 dengan `activity`; 404 `{error:{code:'NOT_FOUND',...}}` |
| API-06 | POST valid | body lengkap sesuai kontrak | 201; `id` = nextId (2049); `joined_at` = hari ini; `activity {0,0}`; field lain sesuai body |
| API-07 | POST validasi gagal | tanpa required; email salah format | 422 `{error:{code:'VALIDATION_ERROR', fields}}` |
| API-08 | POST email duplikat | email sudah ada (case-insensitive) | 409 `{error:{code:'CONFLICT'}}` |
| API-09 | PUT valid & 404 | id 2048; id 9999 | 200 dengan `id`/`joined_at`/`activity` TERJAGA dari record lama; 404 |
| API-10 | PUT 409 | email milik member lain; email sendiri tetap sama | milik lain → 409; email sendiri → 200 |
| API-11 | DELETE bulk | ids campuran ada/tidak; `[]`; bukan array | campuran → 200 `{deleted:[...], failed:[...]}` (hard delete); `[]`/non-array → 422 |
| API-12 | stats | `computeStats(members, today)` dgn `today` fixed + `GET /api/members/stats` | total; active_now (prefix Active); activity_rate = round(active/total×100); new_this_month (bulan sama dgn today); departments distinct; active_units distinct dept member aktif; pending_invites 5, expiring_soon 3; route 200 |
