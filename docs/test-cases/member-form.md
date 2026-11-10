# Test Cases — Member Form (`src/features/member-form`)

ID stabil, dipetakan 1:1 ke nama test: `it('MF-01: ...')`.

## Domain (validasi)

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| MF-01 | validasi field wajib | input tanpa `full_name` / `email` / `job_title` / `department` | hasil invalid dengan entri error untuk tiap field wajib yang kosong |
| MF-02 | validasi format email | `email: 'not-an-email'` | `fields.email` berisi pesan format email tidak valid |
| MF-03 | validasi enum | `department: 'Marketing'`, `account_status: 'Banned'`, `employment_type: 'Intern'` | error untuk tiap field yang nilainya di luar konstanta enum |
| MF-04 | nilai valid diterima | input lengkap & sesuai enum | `{ valid: true, value: MemberInput }`; field opsional default (`bio: ''`) |

## Use Case

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| MF-05 | createMember happy path | input valid + mock repo | `repo.createMember` dipanggil dengan MemberInput tervalidasi; member dikembalikan |
| MF-06 | createMember input invalid | input tanpa email | throw `MemberValidationFieldsError`; repo TIDAK dipanggil (spy) |
| MF-07 | createMember email konflik | repo throw `MemberEmailConflictError` | error diteruskan ke caller |
| MF-08 | updateMember happy & 404 | input valid; (a) repo sukses; (b) repo throw `MemberNotFoundError` | (a) `repo.updateMember(id, input)` dipanggil; (b) error diteruskan |

## Repository (infrastructure/api)

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| MF-09 | POST create assertion | stub `fetch` respond 201 member | `POST {base}/members` dengan body JSON snake_case persis kontrak; hasil domain |
| MF-10 | PUT update assertion | stub `fetch` respond 200 | `PUT {base}/members/2048` + body; hasil domain |
| MF-11 | mapping error write | respond 409 / 422 | 409 → `MemberEmailConflictError`; 422 → `MemberValidationFieldsError.fields` |

## Presentation

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| MF-12 | render form | render MemberForm (mode create) | 2 section (General Information; Work Details & Permissions), 7 field + helper text, tanda `*` wajib, opsi dropdown dari konstanta enum |
| MF-13 | validasi klien | submit dengan field wajib kosong | pesan inline per field; thunk TIDAK di-dispatch |
| MF-14 | error server dipetakan ke field | thunk reject 409 / 422 `{fields}` | field email ditandai konflik; fields 422 muncul di input terkait |
| MF-15 | modal sukses add & update | (a) create sukses; (b) update sukses | (a) "Member Added Successfully" + nama + `#MEM-{id}` + Back to Dashboard; (b) "Member Updated Successfully" + Continue Editing (tutup modal, tetap di form) / Back (navigasi `/`) |

> Catatan: ID asli rencana MF-01..14 mengalami penyesuaian setelah validasi dipisah sebagai MF-04 — total tetap mencakup seluruh skenario di atas.
