# Onboarding — Onboarding Management Platform

İşçinin müqavilə imzaladığı gündən (pre-boarding, −14 gün) 180-ci gününə qədər bütün səyahətini bir platformada idarə edən statik veb tətbiq. Tam təsvir: [`SPEC-2.md`](SPEC-2.md).

- **Build yoxdur:** HTML + CSS + JavaScript (ES modules), Vue 3 (CDN), Firebase v10 modular SDK (CDN, istəyə bağlı).
- **Demo rejim:** `js/firebase-config.js` boşdursa, data brauzerin `localStorage`-ində saxlanılır və ilk açılışda nümunə data (10 işçi) avtomatik yüklənir.
- **Dillər:** AZ (əsas) / EN. **Tema:** Light / Dark.
- **Rollar:** yuxarı paneldəki "Rol seç" menyusu ilə (HR Admin, Menecer, Buddy, Təlimçi, IT / Access admin, Yeni işçi). Real giriş (login) gələcək mərhələdir.

## Lokal işə salma

ES modulları `file://` ilə işləmir, ona görə kiçik statik server lazımdır:

```bash
npx serve .
```

və ya VS Code-da **Live Server** genişlənməsi ilə `index.html`-i açın (və ya `python3 -m http.server 8080`).

Demo üçün "bu gün" tarixini URL ilə sabitləmək olar (spesifikasiyadakı statuslar bu tarixə görədir):

```
http://localhost:3000/?today=2026-11-07
```

Nümunə datanı sıfırlamaq üçün: **Ayarlar → Nümunə datanı yüklə** (HR rolu).

## Firebase-in qoşulması

1. [Firebase Console](https://console.firebase.google.com/)-da yeni layihə yaradın.
2. **Build → Firestore Database → Create database** (istənilən region, *production mode*).
3. **Rules** tabında aşağıdakı **müvəqqəti demo** qaydalarını yazın və *Publish* edin:
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
4. **Project settings → General → Your apps → Web (`</>`)** ilə veb tətbiq qeydiyyatdan keçirin və `firebaseConfig` obyektini kopyalayın.
5. Dəyərləri `js/firebase-config.js` faylına yazın (bu açarlar brauzer üçündür, gizli sayılmır — təhlükəsizliyi Firestore qaydaları təmin edir).
6. Saytı açın, **HR Admin** rolunda **Ayarlar → Nümunə datanı yüklə** düyməsini basın. Bütün kolleksiyalar Firestore-a yazılacaq. Status sətirində "Qoşulub" görünməlidir.

Firestore-a qoşulmaq alınmasa, tətbiq avtomatik demo rejimə keçir və xəta Ayarlar ekranında göstərilir.

## Vercel deploy

1. Reponu GitHub-a push edin.
2. [vercel.com](https://vercel.com) → **Add New → Project** → GitHub reposunu seçin.
3. **Framework preset:** `Other`. **Build command:** boş. **Output directory:** kök (`/` / `.`).
4. **Deploy.** Bundan sonra `main` branch-a hər push avtomatik deploy işə salır.

Hash routing (`#/dashboard`, `#/employee/e02` …) istifadə olunduğu üçün rewrite ayarı lazım deyil.

## Fayl strukturu

```
index.html
css/styles.css
js/app.js              Vue app, hash router, layout (top bar, sidebar, mobil nav)
js/firebase-config.js  firebaseConfig — boş qalarsa demo rejim
js/db.js               data qatı: list/get/set/update/remove (Firestore və ya localStorage)
js/i18n.js             az/en lüğət, t(), dil və tema
js/seed.js             bütün nümunə data
js/utils.js            tarix, status, proqres, mailto; TODAY (?today=YYYY-MM-DD)
js/signature.js        canvas imza komponenti (pointer events)
js/store.js            rol/sessiya, icazələr və biznes qaydaları
js/components.js       ümumi UI komponentləri (modal, avatar, proqres, ulduzlar…)
js/views/*.js          ekranlar: dashboard, employees, profile, access, handbook,
                       feedback, surveys, trainings, me, settings
```

## Qısa test ssenarisi (`?today=2026-11-07`)

- **İşçilər:** e01 və e09 Pre-boarding, e08 Tamamlanıb, qalanları Onboarding.
- **Buddy:** e09 profili → Buddy → "Buddy təyin et": Orxan və Aytən 3/3 (deaktiv), yalnız Cavid seçilə bilər.
- **Access:** "+ Yeni sorğu" → bir neçə sistem seçin → hər sistem üçün ayrıca sorğu və bildiriş yaranır. IT rolunda Təsdiqlə / Verildi / Rədd et (səbəb ilə).
- **Yeni işçi (Kamran Nəsirov, e10):** Handbook təsdiqi, 7-ci gün sorğusu, "İnformasiya təhlükəsizliyi" təlimində imza. Sonra Təlimçi rolunda təlimçi imzası → status `completed`, qeyd kilidlənir; "Aktı çap et".
