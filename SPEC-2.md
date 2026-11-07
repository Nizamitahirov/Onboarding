# SPEC.md — Onboarding System (Onboarding Management Platform)

> **Claude Code üçün qeyd:** Bu sənəd tətbiqin tam təsviridir. Kodu bu sənədə uyğun yaz. Build addımı olmamalıdır. Bütün fayllar statik olmalı və Vercel-də birbaşa açılmalıdır. İnterfeys mətnləri `i18n.js` faylından gəlir (AZ əsas dil, EN ikinci dil). MVP-ni təxminən 45 dəqiqəyə qurmaq üçün P0 funksiyalarından başla, sonra P1 funksiyalarına keç.

---

## 1. Məqsəd və problem

### Problem
- Yeni işçinin qəbulu Excel, e-poçt və şifahi tapşırıqlarla idarə olunur. Nə edildiyi, nəyin gecikdiyi görünmür.
- Əməkdaşa hansı sistemlərə giriş (access) veriləcəyi və bu barədə kimin məlumatlandırılacağı qeyri-müəyyəndir. Nəticədə işçi ilk günlərdə sistemlərə girə bilmir.
- Buddy (mentor-yoldaş) təyinatı sistemsizdir.
- Təlimlərdə iştirak kağız üzərində imzalanır. Sənədlər itir, yoxlamaq çətindir.
- İşçinin ilk 180 gündəki təcrübəsi barədə (sorğu, qarşılıqlı rəy) data toplanmır.

### Məqsəd
İşçinin müqavilə imzaladığı gündən 180-ci iş gününə qədər bütün səyahətini bir platformada idarə etmək:
- **Pre-boarding:** başlamazdan əvvəl, −14 gündən 0-cı günə qədər.
- **Onboarding:** 1-ci gündən 180-ci günə qədər.

### Uğur göstəriciləri
- Gecikmiş tapşırıqların sayı aşağı düşür.
- İşçi 1-ci gün bütün əsas sistemlərə girişə malik olur.
- Hər işçi üzrə 30, 90 və 180 günlük rəy və sorğu toplanır.
- Təlim imzaları 100% rəqəmsal saxlanılır.

---

## 2. İstifadəçi rolları

MVP-də giriş (login) yoxdur. Yuxarı paneldə **"Rol seç"** menyusu var və istifadəçi rollar arasında keçid edir. Real giriş (Firebase Authentication) gələcək mərhələdir.

| Rol | Kod | Nə edir |
|---|---|---|
| HR Admin | `hr` | Hər şeyi görür. İşçi əlavə edir, buddy təyin edir, planı izləyir, handbook və sorğuları idarə edir, nümunə datanı yükləyir. |
| Menecer | `manager` | Öz komandasındakı yeni işçiləri görür. Access sorğusu yaradır, tapşırıqları bağlayır, işçiyə rəy yazır. |
| Buddy | `buddy` | Ona təyin olunmuş işçiləri görür. Buddy tapşırıqlarını bağlayır, rəy yazır. |
| Təlimçi | `trainer` | Təlimləri görür. İştirakçıların imzasından sonra öz imzasını atır. |
| IT / Access admin | `it` | Access sorğularını görür, statusu dəyişir (Təsdiqləndi / Verildi / Rədd edildi). |
| Yeni işçi | `employee` | Yalnız öz səhifəsini ("Mənim onboardingim") görür. Tapşırıqlarını bağlayır, handbook oxuyur, sorğu doldurur, rəy yazır, təlimdə imza atır. |

`employee` rolu seçiləndə ikinci menyu açılır: **"Hansı işçi?"** (10 nümunə işçidən biri seçilir).

---

## 3. Funksiyalar (MVP)

**P0** — mütləq olmalıdır. **P1** — vaxt qalarsa edilir.

### 3.1 İşçi idarəetməsi (P0)
- İşçilər siyahısı, axtarış, status və şöbə üzrə filtr.
- Yeni işçi əlavə et: ad, vəzifə, şöbə, başlama tarixi, menecer, e-poçt, telefon.
- İşçi əlavə ediləndə **onboarding planı şablondan avtomatik yaradılır** (bax 3.3).
- **Status avtomatik hesablanır:**
  - `preboarding`: bu gün < başlama tarixi
  - `onboarding`: 1–180-ci gün
  - `completed`: 180 gün keçib

### 3.2 Pre-boarding və Onboarding (P0)
Plan mərhələlərə bölünür:

| Mərhələ | Gün aralığı |
|---|---|
| Pre-boarding | −14 … −1 |
| 1-ci gün | 0 |
| 1-ci həftə | 1 … 7 |
| 1-ci ay | 8 … 30 |
| 2–3-cü ay | 31 … 90 |
| 4–6-cı ay | 91 … 180 |

Hər tapşırığın sahələri: başlıq, məsul rol, son tarix, status (`todo` / `done`).

### 3.3 Tracking — izləmə (P0)
- Hər işçi üçün **irəliləyiş faizi**: bitmiş tapşırıqlar ÷ bütün tapşırıqlar.
- **"Gün X / 180"** göstəricisi və proqres zolağı (gradient rəngdə).
- **Gecikmiş tapşırıq:** son tarix keçib, status `todo`. Qırmızı nişanla göstərilir.
- HR dashboard-da ümumi göstəricilər (bax Ekran 4.2).

### 3.4 Buddy assignment — buddy təyini (P0)
- HR işçinin profilində **"Buddy təyin et"** düyməsini basır.
- Siyahıda buddy namizədləri və hər birinin hazırkı yükü görünür (neçə aktiv işçisi var).
- **Qayda:** bir buddy-nin ən çox 3 aktiv işçisi ola bilər. Limit dolubsa, xəbərdarlıq göstərilir.
- Təyinatdan sonra işçiyə və buddy-yə bildiriş yaradılır.

### 3.5 Access Management — giriş idarəetməsi (P0)
- Menecer və ya HR işçi üçün sistemləri seçir (çoxlu seçim). Hər seçilmiş sistem üçün ayrıca sorğu yaradılır.
- Hər sistemin **sahibi (owner)** və **bildiriş siyahısı** var (`systems` kolleksiyası).
- Sorğu yaradılan kimi `notifications` kolleksiyasına yazılır. Bildiriş kimlərə gedir:
  1. Sistemin sahibi (owner e-poçtu)
  2. IT / Access admin
  3. İşçinin meneceri
  4. HR
- Hər sorğuda **"E-poçtla xəbər ver"** düyməsi var. Düymə `mailto:` linki açır: alıcılar avtomatik doldurulur, mövzu və mətn hazır olur. Real e-poçt göndərmə gələcək mərhələdir.
- **Status axını:** `pending` (Gözləyir) → `approved` (Təsdiqləndi) → `granted` (Verildi). Və ya `rejected` (Rədd edildi).
- Hər status dəyişikliyi tarix və rol ilə `history` massivinə yazılır.

### 3.6 Employee Handbook (P0)
- Bölmələr: Xoş gəldiniz, Dəyərlərimiz, İş saatları, Məzuniyyət, İnformasiya təhlükəsizliyi, Geyim qaydası, Faydalar, Əlaqələr.
- Hər bölmənin mətni AZ və EN dilindədir.
- İşçi hər bölmədə **"Oxudum və tanış oldum"** düyməsini basır. Bu təsdiq `acknowledgements` kolleksiyasına yazılır.
- Profildə göstərilir: "Handbook: 5/8 bölmə oxunub".

### 3.7 Cross feedback — qarşılıqlı rəy (P0)
- Rəy pəncərələri: 30, 90 və 180-ci günlər. Hər pəncərə 14 gün açıq qalır.
- **İstiqamətlər:**
  - İşçi → Menecer
  - İşçi → Buddy
  - Menecer → İşçi
  - Buddy → İşçi
- **Rəy forması:**
  - Bal: 1–5 ulduz
  - "Güclü tərəflər" (mətn)
  - "İnkişaf sahələri" (mətn)
- Rəylər işçinin profilində "Feedback" tabında görünür. İşçi özü haqqında yazılan rəyləri yalnız HR paylaşdıqdan sonra görür (`sharedWithEmployee: true`).

### 3.8 Survey — sorğu (P0)
- Sorğu şablonları: 7, 30, 90 və 180-ci gün.
- Hər sorğuda 4–5 sual:
  - 1–5 şkala sualları
  - Bir eNPS sualı (0–10): "Şirkəti dostunuza tövsiyə edərdinizmi?"
  - Bir açıq şərh sahəsi
- İşçi panelində "Gözləyən sorğular" kartı görünür.
- HR dashboard-da orta bal və eNPS göstərilir.

### 3.9 Təlimlər və ekrandan imza modulu (P0)
- Təlim siyahısı: ad, tarix, təlimçi, iştirakçılar.
- **İmza axını:**
  1. İşçi təlimi açır və **"İmzala"** düyməsini basır.
  2. Canvas imza pəncərəsi açılır: barmaqla və ya siçanla imza atılır. Düymələr: "Təmizlə" və "Təsdiq et".
  3. İmza PNG şəklinə (base64 `dataURL`) çevrilir və tarix-saatla saxlanılır.
  4. Təlimçi iştirakçılar cədvəlində həmin işçinin sətrində **"Təlimçi imzası"** düyməsini basır və imza atır.
  5. Hər iki imza olduqda status `completed` olur və qeyd kilidlənir (redaktə olunmur).
- **"Aktı çap et"** düyməsi `window.print()` ilə çap üçün səliqəli səhifə açır. Səhifədə hər iki imza şəkli, adlar və tarixlər olur.
- **Texniki tələblər:**
  - İmza canvas-ı mobil toxunuşu (`pointer events`) dəstəkləməlidir.
  - Saxlamadan əvvəl canvas `1x` miqyasa salınmalıdır ki, fayl kiçik olsun (< 50 KB).

### 3.10 180 günlük period (P0)
- Bütün hesablamalar başlama tarixindən aparılır:
  - `dayNumber = bu gün − startDate + 1`
- 180 gün bitəndə status `completed` olur və profildə **"Onboarding tamamlandı 🎉"** banneri göstərilir.

### 3.11 Dil keçidi və tema (P0)
- **Dil:**
  - Yuxarı paneldə AZ / EN keçidi var.
  - Seçim `localStorage`-də (`lang`) saxlanılır.
  - Default dil AZ-dir.
- **Tema:**
  - Light / Dark keçidi var. Seçim `localStorage`-də (`theme`) saxlanılır.
  - İlk açılışda sistem ayarına (`prefers-color-scheme`) baxılır.

### 3.12 Bildirişlər (P1)
- Yuxarı paneldə zəng ikonu və oxunmamış bildirişlərin sayı.
- Bildirişlər seçilmiş rola görə filtr olunur.

### 3.13 Gələcək mərhələ (MVP-yə daxil deyil)
- Firebase Authentication ilə real giriş və rol əsaslı təhlükəsizlik qaydaları.
- Real e-poçt göndərmə (Firebase Functions + SMTP).
- Avtomatik xatırlatmalar.
- PDF eksport.

---

## 4. Ekranlar və elementlər

### Naviqasiya
- Hash routing istifadə olunur (`#/dashboard`, `#/employees`, `#/employee/:id` və s.). Ona görə Vercel-də əlavə ayar lazım deyil.
- **Desktop:** solda sidebar.
- **Mobil (< 768px):** aşağıda nav panel, 5 əsas ikon. Qalan bölmələr "Daha çox" menyusundadır.

### 4.1 Yuxarı panel (bütün ekranlarda)
- Logo yeri: gradient fonda ağ yazı "Onboarding".
- Rol seçici. `employee` rolunda əlavə olaraq işçi seçici.
- AZ / EN keçidi.
- 🌙 / ☀️ tema keçidi.
- Bildiriş zəngi (P1).

### 4.2 Dashboard (`#/dashboard`) — HR, Menecer
- **Hero kart:** gradient fonda "Sabahınız xeyir, {ad}" və bugünkü tarix.
- **KPI kartları (6 ədəd):**
  - Pre-boarding
  - Aktiv onboarding
  - Tamamlanmış
  - Gecikmiş tapşırıqlar
  - Gözləyən access sorğuları
  - Orta survey balı / eNPS
- **"Bu həftə başlayanlar"** siyahısı: avatar, ad, vəzifə, başlama tarixi.
- **"Gecikmiş tapşırıqlar"** siyahısı: tapşırıq, işçi, neçə gün gecikib.
- **"Mərhələ üzrə paylanma"**: sadə üfüqi zolaqlar. Kitabxana lazım deyil, CSS ilə qurulur.
- Menecer yalnız öz komandasının datasını görür (`managerId` üzrə filtr).

### 4.3 İşçilər (`#/employees`)
- Axtarış sahəsi.
- Filtrlər: status (çip düymələri) və şöbə (select).
- **"+ Yeni işçi"** düyməsi (HR rolunda).
- **İşçi kartları** (grid; desktopda 3 sütun, mobildə 1). Hər kartda:
  - avatar (ad-soyadın baş hərfləri, gradient fonda)
  - ad, vəzifə, şöbə
  - status nişanı
  - "Gün X/180" və proqres zolağı
  - buddy adı
  - gecikmiş tapşırıq sayı (qırmızı nişan)

### 4.4 Yeni işçi modalı
- **Sahələr:**
  - Ad, Soyad
  - Vəzifə
  - Şöbə (select)
  - Başlama tarixi
  - Menecer (select)
  - E-poçt
  - Telefon
- **Validasiya:**
  - Bütün sahələr məcburidir.
  - E-poçt formatı yoxlanılır.
- "Yadda saxla" basılanda işçi yaradılır və plan şablondan generasiya olunur.

### 4.5 İşçi profili (`#/employee/:id`)
- **Başlıq kartı:** avatar, ad, vəzifə, status, "Gün X/180", ümumi proqres, menecer, buddy.
- **Tablar:**
  1. **Plan:** mərhələlər üzrə timeline. Hər tapşırıqda checkbox, məsul rol nişanı, son tarix. Gecikənlər qırmızı göstərilir.
  2. **Buddy:** təyin olunmuş buddy-nin kartı. "Buddy təyin et / dəyiş" düyməsi (HR).
  3. **Access:** bu işçinin sorğuları və statusları. "+ Access sorğusu" düyməsi.
  4. **Handbook:** oxunmuş və oxunmamış bölmələr.
  5. **Feedback:** rəy kartları; pəncərələr (30/90/180) qrup şəklində. "+ Rəy yaz" düyməsi.
  6. **Sorğular:** göndərilmiş və gözləyən sorğular.
  7. **Təlimlər:** iştirak etdiyi təlimlər və imza statusları.

### 4.6 Buddy təyini modalı
- Buddy namizədlərinin siyahısı. Hər sətirdə: ad, şöbə, aktiv işçi sayı (məsələn, "2/3"), "Seç" düyməsi.
- Limit dolubsa (3/3), düymə deaktiv olur və xəbərdarlıq göstərilir.

### 4.7 Access Management (`#/access`) — HR, Menecer, IT
- **Status tabları:** Hamısı / Gözləyir / Təsdiqləndi / Verildi / Rədd edildi.
- **Cədvəl** (mobildə kartlara çevrilir). Sütunlar: işçi, sistem, giriş səviyyəsi, sorğu verən, tarix, status, əməliyyatlar.
- **Əməliyyatlar:**
  - IT rolunda: "Təsdiqlə", "Verildi", "Rədd et" (səbəb sahəsi ilə).
  - Hamısında: "E-poçtla xəbər ver" (`mailto`).
- **"+ Yeni sorğu" modalı:**
  - İşçi seçimi.
  - Sistemlər (checkbox siyahısı). Hər sistemin yanında sahibi görünür.
  - Giriş səviyyəsi: Oxuma / Redaktə / Admin.
  - Qeyd sahəsi.
- **"Kimlərə məlumat gedəcək"** önizləmə bloku. Alıcı siyahısı seçimlərə görə canlı yenilənir.

### 4.8 Employee Handbook (`#/handbook`)
- **Solda:** bölmələrin siyahısı. Oxunmuş bölmələr ✓ ilə işarələnir.
- **Sağda:** bölmənin mətni (seçilmiş dildə) və "Oxudum və tanış oldum" düyməsi.
- **Mobil:** siyahı akkordeon formasında açılır.
- HR rolunda bölmə mətni redaktə oluna bilər (P1).

### 4.9 Feedback (`#/feedback`)
- **Filtrlər:** pəncərə (30/90/180) və işçi.
- **Rəy kartları:** kimdən → kimə, ulduzlar, mətn, tarix.
- **"+ Rəy yaz" modalı:**
  - Kimə (rola görə avtomatik siyahı).
  - Pəncərə.
  - Ulduzlar.
  - İki mətn sahəsi.
- **HR rolunda** "İşçi ilə paylaş" keçidi.

### 4.10 Sorğular (`#/surveys`)
- **HR görünüşü:**
  - Hər şablon üzrə orta bal.
  - eNPS: promoters (9–10) − detractors (0–6), faizlə.
  - Cavabların siyahısı.
- **İşçi görünüşü:** gözləyən sorğunun forması (ulduz şkalaları, 0–10 düymələri, şərh).

### 4.11 Təlimlər və imza (`#/trainings`, `#/training/:id`)
- **Siyahı:** təlim kartları. Hər kartda ad, tarix, təlimçi və "imzalanıb X/Y" göstəricisi.
- **Detal:**
  - Təlim məlumatları.
  - İştirakçılar cədvəli. Sütunlar: ad, işçi imzası (miniatür və ya "İmzala" düyməsi), təlimçi imzası (miniatür və ya düymə), status.
  - "Aktı çap et" düyməsi.
- **İmza modalı:**
  - Ağ canvas (light və dark modda ağ qalır, qələm qara).
  - Düymələr: "Təmizlə", "Ləğv et", "Təsdiq et".
  - Canvas boşdursa, "Təsdiq et" deaktivdir.
- **"+ Yeni təlim" modalı** (HR, Təlimçi): ad, tarix, təlimçi, iştirakçılar (çoxlu seçim).

### 4.12 Mənim onboardingim (`#/me`) — Yeni işçi rolu
- **Gradient hero:** "Xoş gəldin, {ad}! Gün X/180", dairəvi proqres.
- **"Bugünkü tapşırıqlarım"** siyahısı. Yalnız məsul rolu `employee` olan tapşırıqlar göstərilir.
- **Buddy kartı:** ad, e-poçt, "Yaz" düyməsi (`mailto`).
- **Kartlar:**
  - Gözləyən sorğular
  - Handbook irəliləyişi
  - İmzalanmalı təlimlər
  - Rəy yaz
- **Pre-boarding statusunda** "Başlamağa X gün qaldı" sayğacı və ilk gün üçün məlumat göstərilir (ünvan, saat, nə gətirməli).

### 4.13 Ayarlar (`#/settings`) — HR
- Dil və tema.
- **Sistemlər siyahısı (access üçün):** sistem adı, sahibi, sahibin e-poçtu, əlavə bildiriş e-poçtları. Əlavə et və redaktə et.
- **"Nümunə datanı yüklə"** düyməsi. Firestore boşdursa, seed data yazılır. Doludursa, təsdiq istənir.
- **Firebase bağlantı statusu:** "Qoşulub" və ya "Demo rejim (localStorage)".

---

## 5. Data modeli (Firestore)

Bütün tarixlər `YYYY-MM-DD` formatında string kimi saxlanılır. Bütün vaxtlar ISO formatında string kimi saxlanılır (sadəlik üçün). Hər sənədin `id` sahəsi Firestore sənəd ID-si ilə eynidir.

### 5.1 `users` — işçi heyəti (HR, menecer, buddy, təlimçi, IT)
```json
{ "id": "u_hr1", "name": "Nigar Abbasova", "role": "hr", "department": "HR", "email": "nigar.abbasova@company.az" }
```

Nümunə data:

| id | name | role | department | email |
|---|---|---|---|---|
| u_hr1 | Nigar Abbasova | hr | HR | nigar.abbasova@company.az |
| u_mgr1 | Fərid Səfərov | manager | IT | farid.safarov@company.az |
| u_mgr2 | Sevda Əhmədova | manager | Biznes | sevda.ahmadova@company.az |
| u_bud1 | Orxan Vəliyev | buddy | IT | orxan.valiyev@company.az |
| u_bud2 | Aytən Qasımova | buddy | Marketinq | ayten.qasimova@company.az |
| u_bud3 | Cavid Məlikov | buddy | Maliyyə | cavid.malikov@company.az |
| u_trn1 | Samir Cəfərov | trainer | Təlim | samir.cafarov@company.az |
| u_it1 | Ramil Musayev | it | IT | ramil.musayev@company.az |

### 5.2 `employees` — yeni işçilər
```json
{
  "id": "e01",
  "firstName": "Aysel",
  "lastName": "Məmmədova",
  "position": "Marketinq mütəxəssisi",
  "department": "Marketinq",
  "email": "aysel.mammadova@company.az",
  "phone": "+994 50 111 22 01",
  "startDate": "2026-11-16",
  "managerId": "u_mgr2",
  "buddyId": "u_bud2",
  "createdAt": "2026-11-01T10:00:00Z"
}
```

Status saxlanılmır; `startDate`-dən hesablanır. Aşağıdakı statuslar 2026-11-07 tarixinə görədir.

**10 nümunə işçi:**

| id | Ad Soyad | Vəzifə | Şöbə | startDate | managerId | buddyId | Status |
|---|---|---|---|---|---|---|---|
| e01 | Aysel Məmmədova | Marketinq mütəxəssisi | Marketinq | 2026-11-16 | u_mgr2 | u_bud2 | preboarding |
| e02 | Rəşad Əliyev | Backend developer | IT | 2026-11-02 | u_mgr1 | u_bud1 | onboarding (gün 6) |
| e03 | Leyla Hüseynova | HR mütəxəssisi | HR | 2026-10-05 | u_mgr2 | u_bud2 | onboarding (gün 34) |
| e04 | Murad Quliyev | Kredit analitiki | Risk | 2026-09-01 | u_mgr2 | u_bud3 | onboarding (gün 68) |
| e05 | Nərmin İsmayılova | Müştəri xidmətləri mütəxəssisi | Müştəri xidmətləri | 2026-08-03 | u_mgr2 | u_bud2 | onboarding (gün 97) |
| e06 | Tural Həsənov | Data analitik | IT | 2026-07-01 | u_mgr1 | u_bud1 | onboarding (gün 130) |
| e07 | Günay Rzayeva | UX dizayner | Məhsul | 2026-06-01 | u_mgr1 | u_bud3 | onboarding (gün 160) |
| e08 | Elvin Babayev | Satış meneceri | Satış | 2026-05-11 | u_mgr2 | u_bud3 | completed (gün 181) |
| e09 | Səbinə Kərimova | Mühasib | Maliyyə | 2026-11-23 | u_mgr2 | — (təyin olunmayıb) | preboarding |
| e10 | Kamran Nəsirov | DevOps mühəndisi | IT | 2026-10-19 | u_mgr1 | u_bud1 | onboarding (gün 20) |

**Qeydlər:**
- "Aktiv işçi" = `preboarding` və ya `onboarding` statusunda olan işçi. Buddy limiti (3) yalnız aktiv işçilərə aiddir.
- Buddy yükləri:
  - `u_bud1` (Orxan Vəliyev): e02, e06, e10 → **3/3, dolu**
  - `u_bud2` (Aytən Qasımova): e01, e03, e05 → **3/3, dolu**
  - `u_bud3` (Cavid Məlikov): e04, e07 → **2/3**. e08 tamamlandığı üçün sayılmır.
- e09 üçün yalnız Cavid Məlikov seçilə bilər. Orxan və ya Aytəni seçmək cəhdi xəbərdarlıq göstərməlidir.
- e08: 180 gün başa çatıb. Status `completed` göstərilməlidir. Dəqiq hesablama: `dayNumber > 180` → `completed`.

### 5.3 `taskTemplates` — onboarding planı şablonu
```json
{ "id": "t01", "titleAz": "Əmək müqaviləsinin imzalanması", "titleEn": "Sign employment contract", "phase": "preboarding", "dayOffset": -10, "ownerRole": "hr" }
```

`dayOffset`: başlama tarixinə nisbətən gün. Son tarix belə hesablanır: `dueDate = startDate + dayOffset`.

| id | Tapşırıq (AZ) | phase | dayOffset | ownerRole |
|---|---|---|---|---|
| t01 | Əmək müqaviləsinin imzalanması | preboarding | −10 | hr |
| t02 | Buddy təyin edilməsi | preboarding | −7 | hr |
| t03 | Access sorğularının yaradılması | preboarding | −7 | manager |
| t04 | Noutbuk və avadanlığın hazırlanması | preboarding | −3 | it |
| t05 | Xoş gəldin məktubunun göndərilməsi | preboarding | −2 | hr |
| t06 | Ofis turu və komanda ilə tanışlıq | day1 | 0 | buddy |
| t07 | Avadanlığın təhvil verilməsi | day1 | 0 | it |
| t08 | Employee Handbook ilə tanışlıq | week1 | 3 | employee |
| t09 | İnformasiya təhlükəsizliyi təlimi (imza ilə) | week1 | 5 | trainer |
| t10 | 7-ci gün sorğusu | week1 | 7 | employee |
| t11 | Sınaq müddəti məqsədlərinin təyini | month1 | 14 | manager |
| t12 | 30 günlük qarşılıqlı rəy | month1 | 30 | employee |
| t13 | 30-cu gün sorğusu | month1 | 30 | employee |
| t14 | Aralıq 1:1 görüş | month3 | 60 | manager |
| t15 | Sınaq müddətinin qiymətləndirilməsi | month3 | 90 | manager |
| t16 | 90 günlük qarşılıqlı rəy və sorğu | month3 | 90 | employee |
| t17 | İnkişaf planının hazırlanması | month6 | 120 | manager |
| t18 | 180 günlük yekun görüş | month6 | 180 | manager |
| t19 | 180 günlük rəy və sorğu | month6 | 180 | employee |

Hər tapşırığın EN tərcüməsi seed faylında `titleEn` sahəsində yazılmalıdır.

### 5.4 `employeeTasks` — işçinin konkret tapşırıqları
```json
{ "id": "e02_t06", "employeeId": "e02", "templateId": "t06", "titleAz": "Ofis turu və komanda ilə tanışlıq", "titleEn": "Office tour & team intro", "phase": "day1", "dueDate": "2026-11-02", "ownerRole": "buddy", "status": "done", "doneAt": "2026-11-02T11:00:00Z" }
```

**Seed qaydası** (realistik görünüş üçün):
- Hər işçi üçün 19 tapşırıq generasiya olunur.
- Son tarixi bu gündən 3 gün əvvələ qədər olan tapşırıqların təxminən 85%-i `done` olur.
- Hər işçidə 1–2 köhnə tapşırıq `todo` saxlanılır. Bu, gecikmiş tapşırıq nümunəsi üçündür.

### 5.5 `systems` — access üçün sistemlər
```json
{ "id": "s_email", "name": "E-poçt (Outlook)", "ownerName": "Ramil Musayev", "ownerEmail": "ramil.musayev@company.az", "notifyEmails": ["it-support@company.az"] }
```

| id | name | owner | notifyEmails |
|---|---|---|---|
| s_email | E-poçt (Outlook) | Ramil Musayev | it-support@company.az |
| s_ad | Active Directory / Domen | Ramil Musayev | it-security@company.az |
| s_vpn | VPN | Ramil Musayev | it-security@company.az |
| s_crm | CRM | Fərid Səfərov | crm-admin@company.az |
| s_core | Core Banking | Fərid Səfərov | core-admin@company.az, it-security@company.az |
| s_jira | Jira / Confluence | Orxan Vəliyev | — |
| s_erp | 1C / ERP | Cavid Məlikov | finance-it@company.az |
| s_hrp | HR Portal | Nigar Abbasova | — |

### 5.6 `accessRequests`
```json
{
  "id": "ar01",
  "employeeId": "e01",
  "systemId": "s_crm",
  "level": "edit",
  "requestedBy": "u_mgr2",
  "note": "Marketinq kampaniyaları üçün",
  "status": "pending",
  "createdAt": "2026-11-05T09:00:00Z",
  "history": [{ "status": "pending", "by": "u_mgr2", "at": "2026-11-05T09:00:00Z" }]
}
```

`level`: `read` | `edit` | `admin`.

Nümunə: 8–10 sorğu, müxtəlif statuslarla:
- e01 üçün 3 sorğu `pending` statusunda.
- e09 üçün 2 sorğu `pending` statusunda.
- e02 üçün sorğuların çoxu `granted` statusunda.
- 1 sorğu `rejected` statusunda.

### 5.7 `notifications`
```json
{ "id": "n01", "type": "access_request", "toRoles": ["it", "hr"], "toUserIds": ["u_mgr2"], "toEmails": ["farid.safarov@company.az", "crm-admin@company.az"], "messageAz": "Aysel Məmmədova üçün CRM girişi tələb olunur", "messageEn": "CRM access requested for Aysel Məmmədova", "relatedId": "ar01", "createdAt": "2026-11-05T09:00:00Z", "read": false }
```

`type`: `access_request` | `access_status` | `buddy_assigned` | `feedback_due` | `survey_due` | `training_sign`.

### 5.8 `handbookSections`
```json
{ "id": "h01", "order": 1, "titleAz": "Xoş gəldiniz", "titleEn": "Welcome", "contentAz": "Komandamıza xoş gəlmisiniz! ...", "contentEn": "Welcome to our team! ..." }
```

8 bölmə, hər biri 2–4 abzas qısa və neytral mətn:
1. Xoş gəldiniz
2. Dəyərlərimiz
3. İş saatları və ofis qaydaları
4. Məzuniyyət və icazələr
5. İnformasiya təhlükəsizliyi
6. Geyim qaydası
7. Faydalar və güzəştlər
8. Faydalı əlaqələr

### 5.9 `acknowledgements`
```json
{ "id": "e02_h01", "employeeId": "e02", "sectionId": "h01", "at": "2026-11-04T12:00:00Z" }
```

### 5.10 `feedback`
```json
{ "id": "f01", "employeeId": "e03", "window": 30, "fromRole": "employee", "fromId": "e03", "toRole": "buddy", "toId": "u_bud2", "rating": 5, "strengths": "Hər sualıma vaxtında cavab verdi", "improvements": "Daha çox komanda görüşlərinə dəvət edə bilərdi", "sharedWithEmployee": false, "createdAt": "2026-11-04T15:00:00Z" }
```

`window`: 30 | 90 | 180.

Nümunə: 8–10 rəy. İşçilər: e03, e04, e05, e06, e07, e08.

### 5.11 `surveyTemplates`
```json
{ "id": "sv7", "day": 7, "questions": [
  { "id": "q1", "type": "scale5", "textAz": "İlk həftəniz necə keçdi?", "textEn": "How was your first week?" },
  { "id": "q2", "type": "scale5", "textAz": "İş yeriniz və avadanlığınız vaxtında hazır idimi?", "textEn": "Were your workspace and equipment ready on time?" },
  { "id": "q3", "type": "scale5", "textAz": "Buddy-nizdən nə qədər dəstək aldınız?", "textEn": "How supported did you feel by your buddy?" },
  { "id": "q4", "type": "nps", "textAz": "Şirkəti dostunuza iş yeri kimi tövsiyə edərdinizmi?", "textEn": "Would you recommend us as a workplace?" },
  { "id": "q5", "type": "text", "textAz": "Nəyi daha yaxşı edə bilərdik?", "textEn": "What could we do better?" }
]}
```

Şablonlar: `sv7`, `sv30`, `sv90`, `sv180`. Suallar mərhələyə uyğun bir az dəyişir.

### 5.12 `surveyResponses`
```json
{ "id": "sr01", "employeeId": "e03", "templateId": "sv30", "answers": { "q1": 4, "q2": 5, "q3": 4, "q4": 9, "q5": "Hər şey yaxşı idi" }, "createdAt": "2026-11-04T10:00:00Z" }
```

Nümunə: 10–12 cavab.

### 5.13 `trainings`
```json
{ "id": "tr01", "titleAz": "İnformasiya təhlükəsizliyi", "titleEn": "Information Security", "date": "2026-11-06", "trainerId": "u_trn1", "participantIds": ["e02", "e10"] }
```

Nümunə: 3 təlim.

| id | Təlim | Tarix | İştirakçılar | İmza vəziyyəti |
|---|---|---|---|---|
| tr01 | İnformasiya təhlükəsizliyi | 2026-11-06 | e02, e10 | e02 yalnız işçi tərəfindən imzalayıb; e10 heç kim imzalamayıb |
| tr02 | Müştəri xidməti standartları | 2026-08-10 | e05, e04 | tam imzalanıb |
| tr03 | AML / Compliance əsasları | 2026-10-12 | e03, e04, e06 | qarışıq |

### 5.14 `trainingSignatures`
```json
{ "id": "tr01_e02", "trainingId": "tr01", "employeeId": "e02", "employeeSignature": "data:image/png;base64,...", "employeeSignedAt": "2026-11-06T14:05:00Z", "trainerSignature": null, "trainerSignedAt": null, "status": "employee_signed" }
```

`status`: `pending` | `employee_signed` | `completed`.

Seed-də imza şəkilləri boş qala bilər. Bu halda `"signed"` sahəsi göstərici olur və UI "İmzalanıb (nümunə)" yazır. Alternativ olaraq kodda sadə xətt çəkilmiş kiçik demo PNG generasiya oluna bilər.

---

## 6. Dizayn

### 6.1 Rənglər (CSS dəyişənləri)
```css
:root {
  --red: #E4202E;
  --orange: #FF7A1F;
  --gradient: linear-gradient(135deg, #E4202E 0%, #FF7A1F 100%);
  --bg: #FFFFFF;
  --surface: #FFFFFF;
  --surface-2: #F6F7F9;
  --text: #1A1A1A;
  --text-muted: #6B7280;
  --border: #ECEDEF;
  --success: #16A34A;
  --warning: #F59E0B;
  --danger: #E4202E;
  --shadow: 0 4px 20px rgba(17, 17, 17, 0.06);
  --radius: 16px;
}
[data-theme="dark"] {
  --bg: #0F1115;
  --surface: #171A21;
  --surface-2: #1F232C;
  --text: #F3F4F6;
  --text-muted: #9CA3AF;
  --border: #2A2F3A;
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
```

### 6.2 Üslub
- Bank tətbiqlərinə xas, müasir və təmiz üslub. Light modda ağ fon.
- Qırmızıdan narıncıya gradient istifadə olunan yerlər:
  - hero kartlar
  - əsas düymələr
  - proqres zolaqları
  - aktiv nav elementi
  - avatar fonu
- Real bank loqosu və ya brend adı istifadə edilmir.
- **Şrift:** Montserrat (Google Fonts). Çəkilər 400, 500, 600, 700.
  - Başlıqlar: 600–700
  - Əsas mətn: 400, 15px
- **Kartlar:**
  - `--surface` fon
  - `--radius` (16px)
  - `--shadow`
  - 20px daxili boşluq (padding)
  - hover zamanı yüngül qalxma: `translateY(-2px)`
- **Düymələr:**
  - Əsas: gradient fon, ağ mətn, 12px radius, 44px hündürlük.
  - İkinci dərəcəli: şəffaf fon, `--red` rəngli 1px kontur.
- **Status nişanları (pill):**
  - preboarding: narıncı açıq fon
  - onboarding: mavi-boz
  - completed: yaşıl
  - gecikmiş: qırmızı
- **İkonlar:** emoji və ya inline SVG. Ayrıca kitabxana tələb olunmur.

### 6.3 Mobilə uyğunluq
- Breakpointlər: 480px, 768px, 1024px.
- Mobildə:
  - Sidebar gizlənir, aşağı nav panel görünür.
  - Cədvəllər kartlara çevrilir.
  - Modallar tam ekran açılır.
- Toxunma hədəfləri ən azı 44px.
- 360px ekran enində heç bir yerdə üfüqi scroll olmamalıdır.

### 6.4 Light / Dark mode
- `<html data-theme="light|dark">` atributu ilə idarə olunur.
- Keçid animasiyası: `transition: background .2s, color .2s`.
- **Dark modda:**
  - Gradient dəyişmir.
  - Kontrast WCAG AA səviyyəsinə uyğun olmalıdır.
  - İmza canvas-ı ağ qalır.

---

## 7. Texnologiya

### 7.1 Stek (build yoxdur)
- **HTML + CSS + JavaScript (ES modules).**
- **Vue 3, CDN global build:** `https://unpkg.com/vue@3/dist/vue.global.prod.js`. Ekranlar komponentlərə bölünür, template-lər JS faylında string kimi yazılır.
- **Firebase v10 modular SDK, CDN-dən:**
  - `https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js`
  - `https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js`
- **Hosting:** Vercel, statik sayt. `index.html` kökdə yerləşir.
- **Routing:** hash routing (`#/...`). Rewrite ayarı lazım deyil.

### 7.2 Fayl strukturu
```
/
├── index.html
├── SPEC.md
├── README.md
├── vercel.json            (istəyə bağlı: { "cleanUrls": true })
├── css/
│   └── styles.css
└── js/
    ├── app.js             (Vue app, router, layout)
    ├── firebase-config.js (firebaseConfig obyekti — boş qalarsa demo rejim)
    ├── db.js              (data qatı: Firestore və ya localStorage)
    ├── i18n.js            (az / en lüğət + t() funksiyası)
    ├── seed.js            (bütün nümunə data)
    ├── utils.js           (tarix hesablamaları, status, proqres, mailto)
    ├── signature.js       (canvas imza komponenti)
    └── views/             (dashboard.js, employees.js, profile.js, access.js,
                            handbook.js, feedback.js, surveys.js, trainings.js,
                            me.js, settings.js)
```

### 7.3 Data qatı (`db.js`)
- **Vahid API:**
  - `list(collection, filters?)`
  - `get(collection, id)`
  - `set(collection, id, data)`
  - `update(collection, id, patch)`
  - `remove(collection, id)`
- `firebase-config.js` daxilində `apiKey` doludursa, Firestore istifadə olunur.
- Boşdursa, **demo rejim** işləyir: data `localStorage`-də saxlanılır, ilk açılışda `seed.js`-dən avtomatik yüklənir.
- Bu sayədə tətbiq Firebase açarları olmadan da tam işləyir və test edilir.
- Firestore rejimində ilk açılışda kolleksiyalar boşdursa, Ayarlar ekranında "Nümunə datanı yüklə" düyməsi göstərilir.
- **Sabit "bu gün" tarixi:** `utils.js`-də `TODAY` dəyişəni olur. Default: real tarix. Demo üçün URL ilə dəyişmək mümkündür: `?today=2026-11-07`.

### 7.4 Firebase
- `firebaseConfig` obyekti `js/firebase-config.js` faylına yazılır. Bu açarlar brauzer üçün nəzərdə tutulub və gizli sayılmır. Təhlükəsizliyi Firestore qaydaları təmin edir.
- **MVP üçün müvəqqəti Firestore qaydaları (yalnız demo):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // DİQQƏT: yalnız demo üçün! Real istifadədən əvvəl Auth əlavə edilməlidir.
    }
  }
}
```
- README-də Firebase-in necə qoşulacağı addım-addım yazılmalıdır.

### 7.5 Dil (`i18n.js`)
```js
export const messages = {
  az: { nav: { dashboard: "Panel", employees: "İşçilər", access: "Girişlər", handbook: "Kitabça", feedback: "Rəylər", surveys: "Sorğular", trainings: "Təlimlər", me: "Mənim onboardingim", settings: "Ayarlar" }, ... },
  en: { nav: { dashboard: "Dashboard", employees: "Employees", access: "Access", handbook: "Handbook", feedback: "Feedback", surveys: "Surveys", trainings: "Trainings", me: "My onboarding", settings: "Settings" }, ... }
};
```
- `t('nav.dashboard')` funksiyası seçilmiş dildə mətni qaytarır.
- Data mətnləri dilə görə seçilir: `lang === 'az' ? titleAz : titleEn`.
- **Tarix formatı:**
  - AZ: `16 noyabr 2026`
  - EN: `16 Nov 2026`
  - Hər ikisi `Intl.DateTimeFormat` ilə formatlanır.

### 7.6 Deploy
- GitHub reposu Vercel-ə qoşulur.
- `main` branch-a hər push avtomatik deploy işə salır.
- Framework preset: **Other**. Build command boş, output directory kök (`/`).

---

## 8. Qəbul meyarları (yoxlama siyahısı)

### Ümumi
- [ ] Sayt Vercel-də build olmadan açılır, konsolda xəta yoxdur.
- [ ] `firebase-config.js` boş olanda tətbiq demo rejimdə 10 nümunə işçi ilə işləyir.
- [ ] Firebase konfiqurasiyası daxil edildikdə data Firestore-a yazılır və oxunur. Səhifə yenilənəndə data qalır.
- [ ] "Nümunə datanı yüklə" düyməsi Firestore-a bütün kolleksiyaları yazır.

### Dil və tema
- [ ] Default dil AZ-dir. EN keçidi bütün menyu, düymə, başlıq və handbook mətnlərini dəyişir.
- [ ] Dil seçimi səhifə yenilənəndən sonra da qalır.
- [ ] Light / Dark keçidi işləyir, seçim yadda qalır, dark modda bütün mətnlər oxunaqlıdır.

### Dizayn
- [ ] Montserrat şrifti yüklənir. Əsas düymələr, hero və proqres zolaqları qırmızı-narıncı gradientdədir.
- [ ] 360px ekranda üfüqi scroll yoxdur. Aşağı nav panel görünür, modallar tam ekran açılır.

### İşçilər və tracking
- [ ] İşçilər siyahısında 10 işçi görünür. Axtarış və filtrlər işləyir.
- [ ] Statuslar düzgün hesablanır (`?today=2026-11-07` ilə):
  - e01 və e09: pre-boarding
  - e08: tamamlanıb
  - qalanları: onboarding
- [ ] Yeni işçi əlavə edildikdə 19 tapşırıq avtomatik yaranır və son tarixlər düzgün hesablanır.
- [ ] Tapşırığı bağlamaq profil kartında və dashboard-da proqres faizini dərhal yeniləyir.
- [ ] Gecikmiş tapşırıqlar qırmızı göstərilir və dashboard-da sayılır.
- [ ] "Gün X/180" və proqres zolağı düzgün görünür. 180 gündən sonra "tamamlandı" banneri çıxır.

### Buddy
- [ ] HR buddy təyin edə və dəyişə bilir. Buddy yükü "X/3" formatında görünür.
- [ ] Limit dolu olan buddy-ni seçmək mümkün deyil, xəbərdarlıq çıxır.
- [ ] Təyinatdan sonra bildiriş yaradılır.

### Access Management
- [ ] Bir neçə sistem seçilib sorğu yaradılanda hər sistem üçün ayrıca sorğu yaranır.
- [ ] "Kimlərə məlumat gedəcək" blokunda sistem sahibi, əlavə e-poçtlar, IT, menecer və HR göstərilir.
- [ ] Hər sorğu üçün `notifications` qeydi yaranır.
- [ ] "E-poçtla xəbər ver" düyməsi alıcıları, mövzunu və mətni doldurulmuş `mailto` açır.
- [ ] IT rolu statusu dəyişə bilir. Hər dəyişiklik `history`-yə yazılır. Rədd etmək üçün səbəb tələb olunur.

### Handbook, feedback, survey
- [ ] Handbook-da 8 bölmə var. "Oxudum" düyməsi yadda qalır, profildə "X/8" görünür.
- [ ] Rəy 1–5 ulduz və iki mətn sahəsi ilə yazılır, profildə 30/90/180 pəncərələri üzrə qruplaşdırılır.
- [ ] HR "İşçi ilə paylaş" edənə qədər işçi özü haqqında rəyi görmür.
- [ ] İşçi gözləyən sorğunu doldurur. HR ekranında orta bal və eNPS düzgün hesablanır.

### Təlim imzası
- [ ] İmza canvas-ı siçan və toxunuşla işləyir. Boş imza ilə "Təsdiq et" deaktivdir.
- [ ] İşçi imzası saxlanılır, miniatür kimi görünür, status `employee_signed` olur.
- [ ] Təlimçi imzasından sonra status `completed` olur və qeyd kilidlənir.
- [ ] Hər imza şəklinin ölçüsü 50 KB-dan azdır.
- [ ] "Aktı çap et" səhifəsində təlim adı, tarix, iştirakçılar və hər iki imza görünür.

### Rollar
- [ ] Rol seçicisi ilə keçiddə menyu və icazələr dəyişir:
  - İşçi yalnız `#/me`, Handbook, Sorğular və Təlimləri görür.
  - IT Access ekranını görür.
- [ ] Menecer yalnız öz komandasını görür.

### Sənədləşdirmə
- [ ] README-də yazılıb:
  - lokal işə salma: `npx serve .` və ya VS Code Live Server
  - Firebase-in qoşulması
  - Vercel deploy addımları
