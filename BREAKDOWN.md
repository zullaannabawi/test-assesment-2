# Project Breakdown — Test Assesment 2

## 1. Alur Fitur

### A. Members Directory (baca)

- Saat mount, halaman me-dispatch `fetchMembers` + `fetchMemberStats` tepat sekali → me-render 4 kartu KPI (Total Members *+N this month*, Active Now *% live activity*, Departments *N active units*, Pending Invites *N expiring soon*) dan tabel member (urut `joined_at` desc, avatar + nama/email per baris, pill department & status, tanggal join terformat, link Edit + ikon hapus per baris).
- **Pencarian** di-debounce 300ms (`useDebouncedValue`), partial + case-insensitive di `full_name ∪ email ∪ job_title`. Tanpa hasil → empty state ("No members found", menyebut query aktif) dengan tombol **Clear search** yang me-refetch daftar penuh secara langsung (tanpa debounce).
- **Seleksi**: checkbox per baris + select-all di header (status checked/indeterminate turunan); `selectedIds` dipangkas ke baris yang tampil setiap kali refetch.
- **Export CSV** sepenuhnya client-side dari baris yang *tampil* (hasil filter) — header kontrak, status pendek, tanggal terformat, escaping RFC 4180.

### B. Alur hapus (tunggal & massal)

- Ikon trash atau tombol Delete di bulk bar → `requestDeletion` → **dialog konfirmasi** → `DELETE {ids}` → partisi `{deleted, failed}` (hard delete) → modal sukses (ikon trash rose, strip footer, tombol **Dismiss**) menyebut nama member; seleksi direset; list + stats di-refetch.
- Menghapus dari halaman edit me-redirect ke `/` dan modal sukses tampil di dashboard (state Redux global).

### C. Tambah member

- `/members/new` → form dua section (General Information; Work Details & Permissions), 7 field, penanda wajib, helper text, dropdown dari konstanta enum.
- Validasi client-side jalan duluan (invalid → pesan inline "Required"/error, **tanpa dispatch**). Valid → `POST` → modal "Member Added Successfully" dengan nama + kode hasil generate (`#MEM-2049`) → Back to Dashboard.

### D. Edit member

- `/members/[id]/edit` → fetch berdasarkan id route → form ter-prefill dalam layout dua kolom: kiri sidebar profil (avatar, nama, role, email, repositories/deployments) + kanan kartu form dengan footer bar (**Delete Member** kiri, Cancel/Save kanan).
- Header: tombol back, nama member, pill status, `ID: #MEM-2048` monospace + "Joined February 2022", **Copy ID** → clipboard `#MEM-2048` + toast.
- Save → `PUT` (server menjaga `id`/`joined_at`/`activity`) → "Member Updated Successfully" (Continue Editing tetap di form / Back to Dashboard). Id tidak dikenal → error state yang bersih.

### E. Penanganan error

- Error domain bertipe mengalir end-to-end: `MemberNotFoundError` (404), `MemberEmailConflictError` (409 → menandai field email), `MemberValidationFieldsError` (422 → error inline per field), `EmptyDeletionSelectionError`, `ApiUnexpectedError`. UI tidak pernah memeriksa kode HTTP — repository yang menerjemahkan envelope ke error-error ini.

## 2. Endpoint API (mock, base `/api`)

| Method | Path | Perilaku |
|---|---|---|
| GET | `/members` | List + filter: `search` (partial, case-insensitive, nama∪email∪job_title), `status` (prefix active/inactive), `department` (exact); `sort` reserved (default `joined_at` desc); tanpa pagination |
| GET | `/members/stats` | KPI: total, new_this_month, active_now, activity_rate, departments, active_units, pending_invites (5), expiring_soon (3 — konstanta display-only) |
| GET | `/members/[id]` | Member tunggal termasuk `activity`; 404 envelope `NOT_FOUND` |
| POST | `/members` | Create; validasi bersama → 422 `VALIDATION_ERROR {fields}`; email duplikat (case-insensitive) → 409 `CONFLICT`; 201 dengan id berikutnya, `joined_at`=hari ini, `activity {0,0}` |
| PUT | `/members/[id]` | Full replacement yang menjaga `id`/`joined_at`/`activity`; 404 / 422 / 409 (email milik member lain; email sendiri tetap boleh) |
| DELETE | `/members` | Tunggal & massal via body `{ids: number[]}` (array integer non-kosong, selain itu 422); hard delete; `200 {deleted:[], failed:[]}` |

Envelope error seragam: `{ error: { code, message, fields? } }`.

## 3. Kekurangan yang Diketahui

1. **Tanpa persistensi** — store mock in-memory; data reset saat restart (dan per-instance di serverless).
2. **Tanpa auth** — profile bar (Alex Vance) mock statis; tidak ada login/roles.
3. **Tanpa pagination** — keputusan sadar sesuai scope; aman di ±150 member, butuh `page`/`limit` saat skala besar.
4. **Tanpa UI filter/sort** — param `status`/`department` sudah ada dan dites end-to-end, tapi desain hanya menyediakan search bar (menunggu konfirmasi designer); `sort` reserved.
5. **Alur invite di luar scope** — pending invites / expiring soon adalah nilai display hardcoded.
6. **Gap aksesibilitas** — dasar sudah baik (label, `aria-describedby`, role dialog) tetapi belum ada focus trap di modal dan belum ada audit kontras/keyboard formal.
7. **Tanpa e2e / CI** — 98 test unit/integrasi via controller yang di-mock; tanpa Playwright, tanpa pipeline, tanpa konfigurasi lint, tanpa threshold coverage.
8. **UI list-failure belum ada** — slice mencatat `listStatus: failed` tetapi belum ada error banner khusus untuk fetch yang gagal.
9. **Deviasi desain minor** — ikon inline di input ditunda, icon chip KPI masih aproksimasi, rotasi tone avatar berbasis id, bukan penetapan persis dari designer.
10. **Kopling antar-feature** — `member-form` meng-import interface repository dan sebagian presentation dari `member-list` (preseden terdokumentasi; kernel "member" bersama akan membuatnya lebih formal).
11. **Responsive masih dasar** — grid collapse di breakpoint, tapi desain hanya menarget desktop 1280px.
