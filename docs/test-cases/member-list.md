# Test Cases — Member List (`src/features/member-list`)

ID stabil, dipetakan 1:1 ke nama test: `it('MD-01: ...')`.

## Use Case

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| MD-01 | getMembers normalisasi filter | filter `{ search: '  sarah  ', status: '', department: undefined }` + mock repo | repo dipanggil sekali dengan `{ search: 'sarah' }`; key bernilai kosong tidak dikirim |
| MD-02 | getMemberById member tidak ada | mock repo `getMemberById` → `null` | throw `MemberNotFoundError` |
| MD-03 | deleteMembers guard & hasil | (a) `ids: []`; (b) `ids: [1,2]` repo → `{deleted:[1],failed:[2]}` | (a) throw `EmptyDeletionSelectionError`, repo TIDAK dipanggil; (b) hasil repo diteruskan |

## Repository (infrastructure/api)

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| MD-04 | getMembers URL & mapping DTO→domain | stub `fetch` respond array DTO (termasuk `bio: null`) | fetch ke `{base}/members?search=…&status=…&department=…`; hasil domain bertipe Member, `bio` tetap `null` |
| MD-05 | mapping error repository | respond 404 / 409 / 422 `{error:{code,message,fields}}` | 404 → `MemberNotFoundError`; 409 → `MemberEmailConflictError`; 422 → `MemberValidationFieldsError` dengan `.fields` |

## Presentation

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| MD-06 | mount halaman dashboard | render DashboardTemplate (store terisi) | dispatch `fetchMembers` + `fetchMemberStats` sekali |
| MD-07 | render baris tabel | state members terisi | nama, email, job title, pill department, pill status pendek, joined date terformat, link Edit + ikon trash per baris |
| MD-08 | debounce search 300ms | ketik burst `'sam'` → `'sarah'` (fake timers) | tepat 1 dispatch refetch setelah 300ms |
| MD-09 | empty state & clear | members `[]` setelah search tanpa hasil | tampil "No members found" + tombol Clear search; klik → query kosong + refetch daftar penuh |
| MD-10 | toggle checkbox baris | klik checkbox satu baris, lalu batal | `selectedIds` bertambah lalu berkurang |
| MD-11 | select-all & bulk action bar | klik checkbox header; lalu batal semua | semua id yang tampil terpilih; bar "N selected" muncul saat ≥1, hilang saat 0 |
| MD-12 | export CSV dari baris tampil | filter aktif, klik Export CSV | CSV dibuat dari baris yang TAMPIL (hasil filter), header sesuai kontrak |
| MD-13 | flow delete single | klik trash → confirm dialog → konfirmasi | DELETE dengan `ids: [id]` → modal "Member Deleted Successfully" → stats & list refetch, selection reset |
