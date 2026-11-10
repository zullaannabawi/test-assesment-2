# Test Cases — Shared Foundation (`src/shared`)

ID stabil, dipetakan 1:1 ke nama test: `it('SH-01: ...')`.

## Shared Lib (pure)

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| SH-01 | formatMemberCode menghasilkan kode tampilan | `formatMemberCode(2048)` | `'#MEM-2048'` |
| SH-02 | avatarInitials dari nama dua kata | `'Sarah Jenkins'`; variasi lowercase `'sarah jenkins'` | `'SJ'` (selalu uppercase) |
| SH-03 | avatarInitials satu kata | `'Cher'` | `'CH'` (2 huruf pertama) |
| SH-04 | shortStatus kedua nilai enum | `ACCOUNT_STATUSES[0]` dan `[1]` (bandingkan dgn konstanta, bukan literal) | `'Active'` / `'Inactive'` |
| SH-05 | formatDate tanpa pergeseran zona waktu | `'2022-02-14'`, `'2022-01-01'` | `'Feb 14, 2022'`, `'Jan 1, 2022'` (tanggal tidak mundur/maju sehari) |
| SH-06 | formatNumber pemisah ribuan | `1489` | `'1,489'` |
| SH-07 | toCsv header & baris | array 2 Member | baris pertama `Full Name,Email,Job Title,Department,Status,Joined Date`; kolom Status memakai shortStatus |
| SH-08 | toCsv escaping RFC-4180 | field mengandung koma dan tanda kutip | field dibungkus `"`, kutip digandakan `""` |

## Presentation — atoms & form-field (render/interaksi)

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| SH-09 | Atoms & FormField | render Button (varian, disabled, loading), Input (asosiasi label), Select, Textarea, Checkbox (change + indeterminate), Badge (tone), Avatar (inisial), Text, FormField (helper + error) | semua merender sesuai props; interaksi change terpanggil; helper & pesan error tampil |
