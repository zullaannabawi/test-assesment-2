# Test Cases — Member Detail / Edit (`src/app/members/[id]/edit`)

ID stabil, dipetakan 1:1 ke nama test: `it('ME-01: ...')`.

## Presentation

| ID | Skenario | Input / Prekondisi | Expected Result |
|----|----------|--------------------|-----------------|
| ME-01 | load halaman edit | route `/members/2048/edit`, mock repo sukses | fetch member by route id; seluruh form terisi data member |
| ME-02 | header & profile card | member Sarah Jenkins (id 2048) | header `#MEM-2048`, "Joined February 2022" (bulan-tahun, per design); kartu profil: inisial `SJ`, job title, email, stats `42` Repositories & `1,489` Deployments |
| ME-03 | Copy ID | klik Copy ID (`navigator.clipboard` di-mock) | `writeText('#MEM-2048')` dipanggil + toast konfirmasi |
| ME-04 | id tidak dikenal | mock repo throw `MemberNotFoundError` | tampil error state, tidak crash |
| ME-05 | delete dari halaman edit | klik Delete Member → konfirmasi | delete `ids: [id]` → router push `/` → modal sukses tampil di dashboard |
