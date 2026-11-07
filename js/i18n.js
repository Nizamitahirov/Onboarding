// i18n.js — az / en lüğət + t() funksiyası, dil və tema seçimi
const { reactive } = Vue;

export const messages = {
  az: {
    nav: { dashboard: 'Panel', employees: 'İşçilər', access: 'Girişlər', handbook: 'Kitabça', feedback: 'Rəylər', surveys: 'Sorğular', trainings: 'Təlimlər', me: 'Mənim onboardingim', settings: 'Ayarlar', more: 'Daha çox' },
    top: {
      role: 'Rol seç', whichEmployee: 'Hansı işçi?', whichManager: 'Hansı menecer?', whichBuddy: 'Hansı buddy?', language: 'Dil: AZ / EN', theme: 'Tema: işıqlı / qaranlıq',
      notifications: 'Bildirişlər', markAllRead: 'Hamısını oxunmuş et', noNotifications: 'Bildiriş yoxdur', menu: 'Əsas menyu', signedInAs: 'Hazırkı istifadəçi',
    },
    roles: { hr: 'HR Admin', manager: 'Menecer', buddy: 'Buddy', trainer: 'Təlimçi', it: 'IT / Access admin', employee: 'Yeni işçi' },
    status: { preboarding: 'Pre-boarding', onboarding: 'Onboarding', completed: 'Tamamlanıb', overdue: 'Gecikmiş' },
    accessStatus: { pending: 'Gözləyir', approved: 'Təsdiqləndi', granted: 'Verildi', rejected: 'Rədd edildi' },
    sigStatus: { pending: 'İmzalanmayıb', employee_signed: 'İşçi imzalayıb', completed: 'Tamamlanıb' },
    surveyState: { submitted: 'Göndərilib', pending: 'Gözləyir', upcoming: 'Gələcək', missed: 'Buraxılıb' },
    levels: { read: 'Oxuma', edit: 'Redaktə', admin: 'Admin' },
    phases: { preboarding: 'Pre-boarding', day1: '1-ci gün', week1: '1-ci həftə', month1: '1-ci ay', month3: '2–3-cü ay', month6: '4–6-cı ay', completed: 'Tamamlanıb', dayN: 'Gün {n}', range: 'Gün {a} … {b}' },
    common: {
      all: 'Hamısı', cancel: 'Ləğv et', close: 'Bağla', confirm: 'Təsdiq et', save: 'Yadda saxla', saved: 'Yadda saxlanıldı', send: 'Göndər', edit: 'Redaktə et',
      select: 'Seçin…', loading: 'Yüklənir…', notFound: 'Tapılmadı və ya bu rola icazə yoxdur',
      dayOf: 'Gün {n}/180', startsIn: 'Başlamağa {n} gün', daysLate: '{n} gün gecikib', tasksDone: '{done}/{total} tapşırıq',
    },
    validation: { required: 'Bu sahə məcburidir', email: 'E-poçt formatı düzgün deyil', emailList: 'E-poçtlardan biri düzgün deyil' },
    fields: {
      firstName: 'Ad', lastName: 'Soyad', name: 'Ad Soyad', position: 'Vəzifə', department: 'Şöbə', startDate: 'Başlama tarixi', manager: 'Menecer',
      email: 'E-poçt', phone: 'Telefon', employee: 'İşçi', system: 'Sistem', level: 'Giriş səviyyəsi', requestedBy: 'Sorğu verən', date: 'Tarix',
      status: 'Status', note: 'Qeyd', title: 'Ad',
    },
    dashboard: {
      morning: 'Sabahınız xeyir, {name}', afternoon: 'Günortanız xeyir, {name}', evening: 'Axşamınız xeyir, {name}', today: 'Bu gün', employeesTracked: 'işçi izlənir',
      kpi: { preboarding: 'Pre-boarding', active: 'Aktiv onboarding', completed: 'Tamamlanmış', overdue: 'Gecikmiş tapşırıqlar', pendingAccess: 'Gözləyən access sorğuları', survey: 'Orta survey balı / eNPS' },
      thisWeek: 'Bu həftə başlayanlar', upcoming: 'Yaxın 30 gündə başlayanlar', noStarters: 'Bu həftə başlayan yoxdur',
      overdueTasks: 'Gecikmiş tapşırıqlar', noOverdue: 'Gecikmiş tapşırıq yoxdur 👏', phaseDist: 'Mərhələ üzrə paylanma',
    },
    employees: {
      search: 'Ad, vəzifə və ya e-poçt üzrə axtar…', viewCards: 'Kart görünüşü', viewList: 'Siyahı görünüşü', progress: 'İrəliləyiş', allDepts: 'Bütün şöbələr', new: 'Yeni işçi', newTitle: 'Yeni işçi əlavə et', noResults: 'Heç bir işçi tapılmadı',
      planNote: 'Yadda saxlandıqdan sonra 19 tapşırıqdan ibarət onboarding planı şablondan avtomatik yaradılacaq.', created: '{name} əlavə edildi, plan yaradıldı',
    },
    profile: {
      completed: 'Onboarding tamamlandı 🎉', progress: 'Ümumi irəliləyiş', lateN: '{n} gecikmiş', handbookN: 'Handbook: {n}/{total} bölmə oxunub',
      tabs: { plan: 'Plan', buddy: 'Buddy', access: 'Access', handbook: 'Handbook', feedback: 'Feedback', surveys: 'Sorğular', trainings: 'Təlimlər' },
    },
    buddy: {
      none: 'Buddy yoxdur', notAssigned: 'Buddy hələ təyin olunmayıb', notAssignedYet: 'Buddy tezliklə təyin olunacaq', assign: 'Buddy təyin et', change: 'Buddy-ni dəyiş',
      assignTitle: 'Buddy təyini — {name}', rule: 'Bir buddy-nin ən çox {n} aktiv (pre-boarding və ya onboarding) işçisi ola bilər.', choose: 'Seç', current: 'Hazırkı',
      full: 'Limit dolub — bu buddy-ni seçmək mümkün deyil', someFull: 'Bəzi buddy-lərin limiti dolub (3/3), onları seçmək mümkün deyil.',
      limitWarn: '{name} üçün limit dolub (3/3). Başqa buddy seçin.', limitReached: 'Buddy limiti dolub (3/3)', assigned: '{name} buddy təyin edildi, bildiriş göndərildi',
      load: 'Hazırkı yük', activeCount: 'Aktiv işçi sayı',
    },
    access: {
      title: 'Access Management', new: 'Yeni sorğu', newShort: 'Access sorğusu', newTitle: 'Yeni access sorğusu', systems: 'Sistemlər', owner: 'Sahibi',
      whoNotified: 'Kimlərə məlumat gedəcək', pickToPreview: 'İşçi və sistem seçin — alıcılar burada görünəcək.',
      separateNote: 'Hər sistem üçün ayrıca sorğu yaradılacaq ({n} sorğu).', create: 'Sorğu yarat', created: '{n} sorğu yaradıldı, bildirişlər göndərildi',
      errEmployee: 'İşçi seçin', errSystems: 'Ən azı bir sistem seçin', actions: 'Əməliyyatlar', approve: 'Təsdiqlə', grant: 'Verildi', reject: 'Rədd et',
      email: 'E-poçtla xəbər ver', empty: 'Sorğu yoxdur', history: 'Tarixçə', rejectTitle: 'Sorğunu rədd et', reason: 'Səbəb', reasonRequired: 'Rədd etmək üçün səbəb yazın',
      statusChanged: 'Status dəyişdi: {status}',
      rcpt: { owner: 'Sistem sahibi', extra: 'Əlavə', it: 'IT', manager: 'Menecer', hr: 'HR' },
      mailSubject: 'Access sorğusu: {system} — {name}', mailGreeting: 'Salam,', mailIntro: 'Yeni əməkdaş üçün sistem girişi ilə bağlı məlumat:', mailThanks: 'Təşəkkürlər,',
    },
    handbook: {
      sections: 'Bölmələr', ack: 'Oxudum və tanış oldum', acked: 'Təsdiq qeydə alındı', ackedAt: 'Oxunub: {date}', unread: 'Oxunmayıb',
      employeeOnly: '"Oxudum və tanış oldum" təsdiqini yeni işçi rolunda vermək olar.', content: 'Mətn', editHint: 'Abzasları boş sətirlə ayırın.',
    },
    feedback: {
      write: 'Rəy yaz', to: 'Kimə', window: 'Pəncərə', windowN: '{n} günlük rəy', dayN: '{n}-cü gün', rating: 'Bal',
      strengths: 'Güclü tərəflər', improvements: 'İnkişaf sahələri', shareWithEmployee: 'İşçi ilə paylaş', shared: 'Rəy işçi ilə paylaşıldı', unshared: 'Paylaşım ləğv edildi',
      visibleToEmployee: 'İşçi görür', hiddenFromEmployee: 'İşçi görmür (HR paylaşmayıb)', allEmployees: 'Bütün işçilər', empty: 'Rəy yoxdur',
      noneInWindow: 'Bu pəncərədə rəy yoxdur', openWindow: '{n} günlük rəy pəncərəsi açıqdır', noOpenWindow: 'Hazırda açıq rəy pəncərəsi yoxdur (pəncərə 30/90/180-ci gündən 14 gün açıq qalır)',
      openNow: 'İndi açıqdır', errTarget: 'Kimə yazdığınızı seçin', errRating: 'Ulduzla bal verin', errText: 'Hər iki mətn sahəsini doldurun', created: 'Rəy göndərildi',
      noTargets: 'Rəy yazmaq üçün uyğun şəxs yoxdur',
    },
    surveys: {
      dayN: '{n}-cü gün sorğusu', avgScore: 'Orta bal', responses: 'Cavablar', byTemplate: 'Şablonlar üzrə', template: 'Şablon', responseList: 'Cavabların siyahısı',
      comment: 'Şərh', noResponses: 'Cavab yoxdur', enpsFormula: 'eNPS = promoters (9–10) % − detractors (0–6) %',
      promoters: 'Promoters', passives: 'Passives', detractors: 'Detractors', noPending: 'Gözləyən sorğu yoxdur', mySurveys: 'Mənim sorğularım',
      notLikely: 'Heç tövsiyə etmərəm', veryLikely: 'Mütləq tövsiyə edərəm', commentPh: 'Fikrinizi yazın…', errMissing: 'Bütün bal suallarını cavablandırın', thanks: 'Təşəkkürlər! Sorğu göndərildi',
    },
    trainings: {
      new: 'Yeni təlim', newTitle: 'Yeni təlim', participants: 'İştirakçılar', participantsShort: 'iştirakçı', signedXY: 'İmzalanıb {x}/{y}', empty: 'Təlim yoxdur',
      noneForEmployee: 'Bu işçinin təlimi yoxdur', printAct: 'Aktı çap et', empSignature: 'İşçi imzası', trainerSignature: 'Təlimçi imzası', sign: 'İmzala',
      trainerSign: 'Təlimçi imzası', notSigned: 'İmzalanmayıb', waitEmployee: 'İşçi imzası gözlənilir', waitTrainer: 'Təlimçi imzası gözlənilir', signedSample: 'İmzalanıb (nümunə)',
      locked: 'Qeyd kilidlənib', empSigned: 'İmzanız saxlanıldı', trainerSigned: 'Təlimçi imzası saxlanıldı — qeyd kilidləndi', created: 'Təlim yaradıldı',
      errParticipants: 'Ən azı bir iştirakçı seçin', actTitle: 'Təlimdə iştirak aktı', printedAt: 'Çap tarixi',
    },
    sign: { title: 'Ekrandan imza', signer: 'İmzalayan', hint: 'Barmaqla və ya siçanla burada imza atın', clear: 'Təmizlə', confirm: 'Təsdiq et', tooBig: 'İmza faylı çox böyükdür, sadə imza atın' },
    me: {
      welcome: 'Xoş gəldin, {name}!', countdown: 'Başlamağa {n} gün qaldı', daysLeft: 'gün qaldı', firstDayTitle: 'İlk gün üçün məlumat', address: 'Ünvan',
      addressValue: 'Bakı, Nizami küç. 10, Baş ofis, 1-ci mərtəbə', time: 'Saat', timeValue: '09:00 — qəbul masasında', meet: 'Sizi qarşılayacaq',
      bring: 'Nə gətirməli', bringValue: 'Şəxsiyyət vəsiqəsi, diplomun surəti, bank kartı rekvizitləri, 3×4 fotoşəkil',
      myTasks: 'Bugünkü tapşırıqlarım', noTasks: 'Hazırda tapşırıq yoxdur', dueToday: 'Bu gün', dueIn: '{n} gün qalıb', taskDone: 'Tapşırıq tamamlandı ✅',
      write: 'Yaz', pendingSurveys: 'Gözləyən sorğular', handbookProgress: 'Handbook irəliləyişi', toSign: 'İmzalanmalı təlimlər', allSigned: 'Hamısı imzalanıb',
      writeFeedback: 'Rəy yaz', buddyMailSubject: 'Salam! Onboarding sualı', buddyMailBody: 'Salam {buddy},\n\n\n\nHörmətlə,\n{name}',
    },
    settings: {
      appearance: 'Dil və tema', language: 'Dil', theme: 'Tema', light: 'İşıqlı', dark: 'Qaranlıq', systems: 'Sistemlər (access üçün)', addSystem: 'Sistem əlavə et',
      editSystem: 'Sistemi redaktə et', systemName: 'Sistem adı', ownerEmail: 'Sahibin e-poçtu', notifyEmails: 'Əlavə bildiriş e-poçtları', notifyHint: 'Vergüllə ayırın',
      data: 'Data', connection: 'Firebase bağlantı statusu', connected: 'Qoşulub', demoMode: 'Demo rejim (localStorage)', connError: 'Qoşulma xətası',
      firestoreEmpty: 'Firestore boşdur — nümunə datanı yükləyin.', seedHint: 'Nümunə data: 10 işçi, 8 istifadəçi, 19 tapşırıq şablonu, sistemlər, sorğular, rəylər və təlimlər.',
      loadSeed: 'Nümunə datanı yüklə', seedConfirm: 'Mövcud data silinəcək və nümunə data ilə əvəz olunacaq. Davam edilsin?', seeded: 'Nümunə data yükləndi',
    },
    chat: {
      open: 'NextGen AI köməkçisini aç', expand: 'Genişləndir', shrink: 'Kiçilt', subtitle: 'AI köməkçi · onboarding üzrə', clear: 'Söhbəti təmizlə', hello: 'Salam! Mən NextGen-əm 👋',
      intro: 'Onboarding planı, gecikmiş tapşırıqlar, girişlər, handbook qaydaları və s. barədə soruşun. Yalnız sizin rolunuzun gördüyü data ilə cavab verirəm.',
      placeholder: 'Sualınızı yazın…', send: 'Göndər', thinking: 'Düşünür…', modelHint: 'Sualın mürəkkəbliyinə görə avtomatik seçilmiş model',
      disclaimer: 'NextGen səhv edə bilər — vacib məlumatı yoxlayın.',
      err: {
        not_deployed: 'AI serveri tapılmadı. Chatbot Vercel-də (və ya "vercel dev" ilə) işləyir — lokal statik serverdə /api yoxdur.',
        missing_key: 'Serverdə GROQ_API_KEY təyin olunmayıb (Vercel → Settings → Environment Variables).',
        invalid_key: 'Groq açarı etibarsızdır və ya ləğv olunub.', rate_limited: 'Çox sayda sorğu — bir dəqiqə sonra yenidən cəhd edin.',
        generic: 'Cavab almaq alınmadı. Bir az sonra yenidən cəhd edin.',
      },
      s: {
        hr1: 'Hansı tapşırıqlar gecikib və kim məsuldur?', hr2: 'Bu ay hansı işçilər başlayır?', hr3: 'Survey nəticələrini və eNPS-i qısa analiz et', hr4: 'Hansı buddy-lərin yeri var?',
        mgr1: 'Komandamda kimin irəliləyişi geri qalır?', mgr2: 'Gözləyən access sorğularım hansılardır?', mgr3: 'Bu həftə nəyə diqqət etməliyəm?',
        bud1: 'Mənim işçilərimin vəziyyəti necədir?', bud2: 'Hansı rəy pəncərələri açıqdır?',
        trn1: 'Hansı imzalar məni gözləyir?', trn2: 'Təlimlərin ümumi vəziyyəti necədir?',
        it1: 'Gözləyən access sorğularını prioritetləşdir', it2: 'Hansı avadanlıq tapşırıqları gecikib?',
        emp1: 'Bu gün nə etməliyəm?', emp2: 'Məzuniyyət qaydaları necədir?', emp3: 'Buddy-m kimdir və necə əlaqə saxlayım?', emp4: 'İlk gün nə gətirməliyəm?',
      },
    },
    export: {
      excel: 'Excel', title: 'Excel faylı kimi yüklə (.xlsx)', done: '{name} yükləndi ({n} sətir)', failed: 'Eksport alınmadı',
      day: 'Gün (X/180)', daysToStart: 'Başlamağa qalan gün', progressPct: 'İrəliləyiş %', tasksDone: 'Bitmiş tapşırıq', tasksTotal: 'Cəmi tapşırıq',
      phase: 'Mərhələ', task: 'Tapşırıq', ownerRole: 'Məsul rol', dueDate: 'Son tarix', done_: 'Bitib', todo: 'Gözləyir', daysLate: 'Gecikmə (gün)',
      doneAt: 'Bitmə vaxtı', lastChange: 'Son dəyişiklik', by: 'Kim', from: 'Kimdən', yes: 'Bəli', no: 'Xeyr', type: 'Növ', question: 'Sual',
      read: 'Oxunub', readCount: 'Oxunub (X/8)', completedSigs: 'Tam imzalanıb', participantNames: 'İştirakçılar', empSignedAt: 'İşçi imza vaxtı',
      trainerSignedAt: 'Təlimçi imza vaxtı', field: 'Sahə', value: 'Dəyər', metric: 'Göstərici',
      sheetProfile: 'Profil', sheetEmployees: 'İşçilər', sheetOverdue: 'Gecikmiş tapşırıqlar', sheetKpi: 'Göstəricilər', sheetPhases: 'Mərhələlər',
      sheetHistory: 'Tarixçə', sheetResponses: 'Cavablar', sheetQuestions: 'Suallar', sheetByTemplate: 'Şablonlar üzrə', sheetMatrix: 'İşçilər üzrə',
      sheetMyTasks: 'Tapşırıqlarım', sheetSections: 'Bölmələr', sheetParticipants: 'İştirakçılar',
    },
    dept: {},
  },
  en: {
    nav: { dashboard: 'Dashboard', employees: 'Employees', access: 'Access', handbook: 'Handbook', feedback: 'Feedback', surveys: 'Surveys', trainings: 'Trainings', me: 'My onboarding', settings: 'Settings', more: 'More' },
    top: {
      role: 'Select role', whichEmployee: 'Which employee?', whichManager: 'Which manager?', whichBuddy: 'Which buddy?', language: 'Language: AZ / EN', theme: 'Theme: light / dark',
      notifications: 'Notifications', markAllRead: 'Mark all as read', noNotifications: 'No notifications', menu: 'Main menu', signedInAs: 'Current user',
    },
    roles: { hr: 'HR Admin', manager: 'Manager', buddy: 'Buddy', trainer: 'Trainer', it: 'IT / Access admin', employee: 'New employee' },
    status: { preboarding: 'Pre-boarding', onboarding: 'Onboarding', completed: 'Completed', overdue: 'Overdue' },
    accessStatus: { pending: 'Pending', approved: 'Approved', granted: 'Granted', rejected: 'Rejected' },
    sigStatus: { pending: 'Not signed', employee_signed: 'Employee signed', completed: 'Completed' },
    surveyState: { submitted: 'Submitted', pending: 'Pending', upcoming: 'Upcoming', missed: 'Missed' },
    levels: { read: 'Read', edit: 'Edit', admin: 'Admin' },
    phases: { preboarding: 'Pre-boarding', day1: 'Day 1', week1: 'Week 1', month1: 'Month 1', month3: 'Months 2–3', month6: 'Months 4–6', completed: 'Completed', dayN: 'Day {n}', range: 'Day {a} … {b}' },
    common: {
      all: 'All', cancel: 'Cancel', close: 'Close', confirm: 'Confirm', save: 'Save', saved: 'Saved', send: 'Send', edit: 'Edit',
      select: 'Select…', loading: 'Loading…', notFound: 'Not found or not allowed for this role',
      dayOf: 'Day {n}/180', startsIn: 'Starts in {n} days', daysLate: '{n} days late', tasksDone: '{done}/{total} tasks',
    },
    validation: { required: 'This field is required', email: 'Invalid email format', emailList: 'One of the emails is invalid' },
    fields: {
      firstName: 'First name', lastName: 'Last name', name: 'Name', position: 'Position', department: 'Department', startDate: 'Start date', manager: 'Manager',
      email: 'Email', phone: 'Phone', employee: 'Employee', system: 'System', level: 'Access level', requestedBy: 'Requested by', date: 'Date',
      status: 'Status', note: 'Note', title: 'Title',
    },
    dashboard: {
      morning: 'Good morning, {name}', afternoon: 'Good afternoon, {name}', evening: 'Good evening, {name}', today: 'Today', employeesTracked: 'employees tracked',
      kpi: { preboarding: 'Pre-boarding', active: 'Active onboarding', completed: 'Completed', overdue: 'Overdue tasks', pendingAccess: 'Pending access requests', survey: 'Avg. survey score / eNPS' },
      thisWeek: 'Starting this week', upcoming: 'Starting in the next 30 days', noStarters: 'Nobody starts this week',
      overdueTasks: 'Overdue tasks', noOverdue: 'No overdue tasks 👏', phaseDist: 'Distribution by phase',
    },
    employees: {
      search: 'Search by name, position or email…', viewCards: 'Card view', viewList: 'List view', progress: 'Progress', allDepts: 'All departments', new: 'New employee', newTitle: 'Add new employee', noResults: 'No employees found',
      planNote: 'After saving, a 19-task onboarding plan will be generated from the template automatically.', created: '{name} added, plan generated',
    },
    profile: {
      completed: 'Onboarding completed 🎉', progress: 'Overall progress', lateN: '{n} overdue', handbookN: 'Handbook: {n}/{total} sections read',
      tabs: { plan: 'Plan', buddy: 'Buddy', access: 'Access', handbook: 'Handbook', feedback: 'Feedback', surveys: 'Surveys', trainings: 'Trainings' },
    },
    buddy: {
      none: 'No buddy', notAssigned: 'No buddy assigned yet', notAssignedYet: 'A buddy will be assigned soon', assign: 'Assign buddy', change: 'Change buddy',
      assignTitle: 'Assign buddy — {name}', rule: 'A buddy can have at most {n} active (pre-boarding or onboarding) employees.', choose: 'Select', current: 'Current',
      full: 'Limit reached — this buddy cannot be selected', someFull: 'Some buddies are at their limit (3/3) and cannot be selected.',
      limitWarn: '{name} is at the limit (3/3). Choose another buddy.', limitReached: 'Buddy limit reached (3/3)', assigned: '{name} assigned as buddy, notification sent',
      load: 'Current load', activeCount: 'Active employees',
    },
    access: {
      title: 'Access Management', new: 'New request', newShort: 'Access request', newTitle: 'New access request', systems: 'Systems', owner: 'Owner',
      whoNotified: 'Who will be notified', pickToPreview: 'Pick an employee and systems — recipients appear here.',
      separateNote: 'A separate request will be created for each system ({n} requests).', create: 'Create request', created: '{n} request(s) created, notifications sent',
      errEmployee: 'Select an employee', errSystems: 'Select at least one system', actions: 'Actions', approve: 'Approve', grant: 'Granted', reject: 'Reject',
      email: 'Notify by email', empty: 'No requests', history: 'History', rejectTitle: 'Reject request', reason: 'Reason', reasonRequired: 'A reason is required to reject',
      statusChanged: 'Status changed: {status}',
      rcpt: { owner: 'System owner', extra: 'Extra', it: 'IT', manager: 'Manager', hr: 'HR' },
      mailSubject: 'Access request: {system} — {name}', mailGreeting: 'Hello,', mailIntro: 'Information about system access for a new employee:', mailThanks: 'Thank you,',
    },
    handbook: {
      sections: 'Sections', ack: 'I have read and understood', acked: 'Acknowledgement recorded', ackedAt: 'Read: {date}', unread: 'Not read',
      employeeOnly: 'The "I have read and understood" confirmation is given in the New employee role.', content: 'Content', editHint: 'Separate paragraphs with a blank line.',
    },
    feedback: {
      write: 'Write feedback', to: 'To', window: 'Window', windowN: '{n}-day feedback', dayN: 'Day {n}', rating: 'Rating',
      strengths: 'Strengths', improvements: 'Areas for improvement', shareWithEmployee: 'Share with employee', shared: 'Feedback shared with the employee', unshared: 'Sharing revoked',
      visibleToEmployee: 'Visible to employee', hiddenFromEmployee: 'Hidden from employee (not shared by HR)', allEmployees: 'All employees', empty: 'No feedback',
      noneInWindow: 'No feedback in this window', openWindow: '{n}-day feedback window is open', noOpenWindow: 'No feedback window is open now (each window stays open 14 days from day 30/90/180)',
      openNow: 'Open now', errTarget: 'Choose who the feedback is for', errRating: 'Give a star rating', errText: 'Fill in both text fields', created: 'Feedback sent',
      noTargets: 'Nobody to write feedback for',
    },
    surveys: {
      dayN: 'Day {n} survey', avgScore: 'Average score', responses: 'Responses', byTemplate: 'By template', template: 'Template', responseList: 'Responses',
      comment: 'Comment', noResponses: 'No responses', enpsFormula: 'eNPS = promoters (9–10) % − detractors (0–6) %',
      promoters: 'Promoters', passives: 'Passives', detractors: 'Detractors', noPending: 'No pending surveys', mySurveys: 'My surveys',
      notLikely: 'Not at all likely', veryLikely: 'Extremely likely', commentPh: 'Share your thoughts…', errMissing: 'Please answer all rating questions', thanks: 'Thank you! Survey submitted',
    },
    trainings: {
      new: 'New training', newTitle: 'New training', participants: 'Participants', participantsShort: 'participants', signedXY: 'Signed {x}/{y}', empty: 'No trainings',
      noneForEmployee: 'This employee has no trainings', printAct: 'Print record', empSignature: 'Employee signature', trainerSignature: 'Trainer signature', sign: 'Sign',
      trainerSign: 'Trainer signature', notSigned: 'Not signed', waitEmployee: 'Waiting for employee', waitTrainer: 'Waiting for trainer', signedSample: 'Signed (sample)',
      locked: 'Record locked', empSigned: 'Your signature was saved', trainerSigned: 'Trainer signature saved — record locked', created: 'Training created',
      errParticipants: 'Select at least one participant', actTitle: 'Training attendance record', printedAt: 'Printed at',
    },
    sign: { title: 'On-screen signature', signer: 'Signer', hint: 'Sign here with your finger or mouse', clear: 'Clear', confirm: 'Confirm', tooBig: 'Signature file is too large, please sign more simply' },
    me: {
      welcome: 'Welcome, {name}!', countdown: '{n} days until you start', daysLeft: 'days left', firstDayTitle: 'First day information', address: 'Address',
      addressValue: 'Baku, 10 Nizami str., Head office, 1st floor (reception)', time: 'Time', timeValue: '09:00 — at the reception desk', meet: 'You will be met by',
      bring: 'What to bring', bringValue: 'ID card, copy of your diploma, bank card details, 3×4 photo',
      myTasks: 'My tasks for today', noTasks: 'No tasks right now', dueToday: 'Today', dueIn: '{n} days left', taskDone: 'Task completed ✅',
      write: 'Write', pendingSurveys: 'Pending surveys', handbookProgress: 'Handbook progress', toSign: 'Trainings to sign', allSigned: 'All signed',
      writeFeedback: 'Write feedback', buddyMailSubject: 'Hi! An onboarding question', buddyMailBody: 'Hi {buddy},\n\n\n\nBest regards,\n{name}',
    },
    settings: {
      appearance: 'Language & theme', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', systems: 'Systems (for access)', addSystem: 'Add system',
      editSystem: 'Edit system', systemName: 'System name', ownerEmail: 'Owner email', notifyEmails: 'Extra notification emails', notifyHint: 'Separate with commas',
      data: 'Data', connection: 'Firebase connection status', connected: 'Connected', demoMode: 'Demo mode (localStorage)', connError: 'Connection error',
      firestoreEmpty: 'Firestore is empty — load the sample data.', seedHint: 'Sample data: 10 employees, 8 users, 19 task templates, systems, requests, feedback and trainings.',
      loadSeed: 'Load sample data', seedConfirm: 'Existing data will be deleted and replaced with sample data. Continue?', seeded: 'Sample data loaded',
    },
    chat: {
      open: 'Open NextGen AI assistant', expand: 'Expand', shrink: 'Shrink', subtitle: 'AI assistant · onboarding', clear: 'Clear chat', hello: "Hi! I'm NextGen 👋",
      intro: 'Ask about onboarding plans, overdue tasks, access requests, handbook rules and more. I only use data your role can see.',
      placeholder: 'Type your question…', send: 'Send', thinking: 'Thinking…', modelHint: 'Model picked automatically based on question complexity',
      disclaimer: 'NextGen can make mistakes — double-check important info.',
      err: {
        not_deployed: 'AI server not found. The chatbot runs on Vercel (or with "vercel dev") — a plain static server has no /api.',
        missing_key: 'GROQ_API_KEY is not set on the server (Vercel → Settings → Environment Variables).',
        invalid_key: 'The Groq key is invalid or revoked.', rate_limited: 'Too many requests — try again in a minute.',
        generic: 'Could not get an answer. Please try again shortly.',
      },
      s: {
        hr1: 'Which tasks are overdue and who owns them?', hr2: 'Who starts this month?', hr3: 'Briefly analyze survey results and eNPS', hr4: 'Which buddies have capacity?',
        mgr1: 'Who on my team is falling behind?', mgr2: 'Which of my access requests are pending?', mgr3: 'What should I focus on this week?',
        bud1: 'How are my buddies doing?', bud2: 'Which feedback windows are open?',
        trn1: 'Which signatures are waiting for me?', trn2: 'What is the overall status of trainings?',
        it1: 'Prioritize the pending access requests', it2: 'Which equipment tasks are overdue?',
        emp1: 'What should I do today?', emp2: 'What are the leave rules?', emp3: 'Who is my buddy and how do I reach them?', emp4: 'What should I bring on my first day?',
      },
    },
    export: {
      excel: 'Excel', title: 'Download as Excel file (.xlsx)', done: '{name} downloaded ({n} rows)', failed: 'Export failed',
      day: 'Day (X/180)', daysToStart: 'Days until start', progressPct: 'Progress %', tasksDone: 'Tasks done', tasksTotal: 'Total tasks',
      phase: 'Phase', task: 'Task', ownerRole: 'Owner role', dueDate: 'Due date', done_: 'Done', todo: 'To do', daysLate: 'Days late',
      doneAt: 'Completed at', lastChange: 'Last change', by: 'By', from: 'From', yes: 'Yes', no: 'No', type: 'Type', question: 'Question',
      read: 'Read', readCount: 'Read (X/8)', completedSigs: 'Fully signed', participantNames: 'Participants', empSignedAt: 'Employee signed at',
      trainerSignedAt: 'Trainer signed at', field: 'Field', value: 'Value', metric: 'Metric',
      sheetProfile: 'Profile', sheetEmployees: 'Employees', sheetOverdue: 'Overdue tasks', sheetKpi: 'KPIs', sheetPhases: 'Phases',
      sheetHistory: 'History', sheetResponses: 'Responses', sheetQuestions: 'Questions', sheetByTemplate: 'By template', sheetMatrix: 'By employee',
      sheetMyTasks: 'My tasks', sheetSections: 'Sections', sheetParticipants: 'Participants',
    },
    dept: {
      IT: 'IT', HR: 'HR', Marketinq: 'Marketing', Biznes: 'Business', Risk: 'Risk', 'Maliyyə': 'Finance', 'Müştəri xidmətləri': 'Customer service',
      'Məhsul': 'Product', 'Satış': 'Sales', 'Təlim': 'Training',
    },
  },
};

function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

function initialTheme() {
  const saved = lsGet('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; }
}

export const i18n = reactive({
  lang: lsGet('lang') === 'en' ? 'en' : 'az',
  theme: initialTheme(),
});

function applyPrefs() {
  document.documentElement.setAttribute('lang', i18n.lang);
  document.documentElement.setAttribute('data-theme', i18n.theme);
}
applyPrefs();

export function setLang(lang) { i18n.lang = lang === 'en' ? 'en' : 'az'; lsSet('lang', i18n.lang); applyPrefs(); }
export function setTheme(theme) { i18n.theme = theme === 'dark' ? 'dark' : 'light'; lsSet('theme', i18n.theme); applyPrefs(); }

function resolve(obj, path) {
  return path.split('.').reduce((o, k) => (o && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined), obj);
}

/** t('nav.dashboard', { n: 3 }) — seçilmiş dildə mətni qaytarır */
export function t(key, params, lang) {
  const L = lang || i18n.lang;
  let s = resolve(messages[L], key);
  if (s === undefined) s = resolve(messages.az, key);
  if (typeof s !== 'string') return key;
  if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined && params[k] !== null ? params[k] : m));
  return s;
}

/** Data mətnləri: lang === 'az' ? titleAz : titleEn */
export function tx(obj, base) {
  if (!obj) return '';
  const az = obj[base + 'Az'], en = obj[base + 'En'];
  return i18n.lang === 'az' ? (az || en || '') : (en || az || '');
}

export function deptLabel(d) {
  if (!d) return '—';
  return (i18n.lang === 'en' && messages.en.dept[d]) || d;
}
