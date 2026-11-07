// seed.js — bütün nümunə data
import { TODAY, addDays } from './utils.js';

export const users = [
  { id: 'u_hr1', name: 'Nigar Abbasova', role: 'hr', department: 'HR', email: 'nigar.abbasova@company.az' },
  { id: 'u_mgr1', name: 'Fərid Səfərov', role: 'manager', department: 'IT', email: 'farid.safarov@company.az' },
  { id: 'u_mgr2', name: 'Sevda Əhmədova', role: 'manager', department: 'Biznes', email: 'sevda.ahmadova@company.az' },
  { id: 'u_bud1', name: 'Orxan Vəliyev', role: 'buddy', department: 'IT', email: 'orxan.valiyev@company.az' },
  { id: 'u_bud2', name: 'Aytən Qasımova', role: 'buddy', department: 'Marketinq', email: 'ayten.qasimova@company.az' },
  { id: 'u_bud3', name: 'Cavid Məlikov', role: 'buddy', department: 'Maliyyə', email: 'cavid.malikov@company.az' },
  { id: 'u_trn1', name: 'Samir Cəfərov', role: 'trainer', department: 'Təlim', email: 'samir.cafarov@company.az' },
  { id: 'u_it1', name: 'Ramil Musayev', role: 'it', department: 'IT', email: 'ramil.musayev@company.az' },
];

const E = (id, firstName, lastName, position, department, email, n, startDate, managerId, buddyId) => ({
  id, firstName, lastName, position, department, email: `${email}@company.az`,
  phone: `+994 50 111 22 ${String(n).padStart(2, '0')}`, startDate, managerId, buddyId,
  createdAt: `${addDays(startDate, -20)}T10:00:00Z`,
});

export const employees = [
  E('e01', 'Aysel', 'Məmmədova', 'Marketinq mütəxəssisi', 'Marketinq', 'aysel.mammadova', 1, '2026-11-16', 'u_mgr2', 'u_bud2'),
  E('e02', 'Rəşad', 'Əliyev', 'Backend developer', 'IT', 'rashad.aliyev', 2, '2026-11-02', 'u_mgr1', 'u_bud1'),
  E('e03', 'Leyla', 'Hüseynova', 'HR mütəxəssisi', 'HR', 'leyla.huseynova', 3, '2026-10-05', 'u_mgr2', 'u_bud2'),
  E('e04', 'Murad', 'Quliyev', 'Kredit analitiki', 'Risk', 'murad.guliyev', 4, '2026-09-01', 'u_mgr2', 'u_bud3'),
  E('e05', 'Nərmin', 'İsmayılova', 'Müştəri xidmətləri mütəxəssisi', 'Müştəri xidmətləri', 'narmin.ismayilova', 5, '2026-08-03', 'u_mgr2', 'u_bud2'),
  E('e06', 'Tural', 'Həsənov', 'Data analitik', 'IT', 'tural.hasanov', 6, '2026-07-01', 'u_mgr1', 'u_bud1'),
  E('e07', 'Günay', 'Rzayeva', 'UX dizayner', 'Məhsul', 'gunay.rzayeva', 7, '2026-06-01', 'u_mgr1', 'u_bud3'),
  E('e08', 'Elvin', 'Babayev', 'Satış meneceri', 'Satış', 'elvin.babayev', 8, '2026-05-11', 'u_mgr2', 'u_bud3'),
  E('e09', 'Səbinə', 'Kərimova', 'Mühasib', 'Maliyyə', 'sabina.karimova', 9, '2026-11-23', 'u_mgr2', null),
  E('e10', 'Kamran', 'Nəsirov', 'DevOps mühəndisi', 'IT', 'kamran.nasirov', 10, '2026-10-19', 'u_mgr1', 'u_bud1'),
];
employees[0].createdAt = '2026-11-01T10:00:00Z';

const T = (id, titleAz, titleEn, phase, dayOffset, ownerRole) => ({ id, titleAz, titleEn, phase, dayOffset, ownerRole });
export const taskTemplates = [
  T('t01', 'Əmək müqaviləsinin imzalanması', 'Sign employment contract', 'preboarding', -10, 'hr'),
  T('t02', 'Buddy təyin edilməsi', 'Assign a buddy', 'preboarding', -7, 'hr'),
  T('t03', 'Access sorğularının yaradılması', 'Create access requests', 'preboarding', -7, 'manager'),
  T('t04', 'Noutbuk və avadanlığın hazırlanması', 'Prepare laptop & equipment', 'preboarding', -3, 'it'),
  T('t05', 'Xoş gəldin məktubunun göndərilməsi', 'Send welcome letter', 'preboarding', -2, 'hr'),
  T('t06', 'Ofis turu və komanda ilə tanışlıq', 'Office tour & team intro', 'day1', 0, 'buddy'),
  T('t07', 'Avadanlığın təhvil verilməsi', 'Hand over equipment', 'day1', 0, 'it'),
  T('t08', 'Employee Handbook ilə tanışlıq', 'Read the Employee Handbook', 'week1', 3, 'employee'),
  T('t09', 'İnformasiya təhlükəsizliyi təlimi (imza ilə)', 'Information security training (signed)', 'week1', 5, 'trainer'),
  T('t10', '7-ci gün sorğusu', 'Day 7 survey', 'week1', 7, 'employee'),
  T('t11', 'Sınaq müddəti məqsədlərinin təyini', 'Set probation goals', 'month1', 14, 'manager'),
  T('t12', '30 günlük qarşılıqlı rəy', '30-day cross feedback', 'month1', 30, 'employee'),
  T('t13', '30-cu gün sorğusu', 'Day 30 survey', 'month1', 30, 'employee'),
  T('t14', 'Aralıq 1:1 görüş', 'Mid-point 1:1 meeting', 'month3', 60, 'manager'),
  T('t15', 'Sınaq müddətinin qiymətləndirilməsi', 'Probation review', 'month3', 90, 'manager'),
  T('t16', '90 günlük qarşılıqlı rəy və sorğu', '90-day cross feedback & survey', 'month3', 90, 'employee'),
  T('t17', 'İnkişaf planının hazırlanması', 'Prepare development plan', 'month6', 120, 'manager'),
  T('t18', '180 günlük yekun görüş', '180-day final meeting', 'month6', 180, 'manager'),
  T('t19', '180 günlük rəy və sorğu', '180-day feedback & survey', 'month6', 180, 'employee'),
];

/** Şablondan işçi tapşırıqlarını generasiya edir (yeni işçi üçün hamısı todo) */
export function generateTasks(emp, templates = taskTemplates) {
  return templates.map((t) => ({
    id: `${emp.id}_${t.id}`, employeeId: emp.id, templateId: t.id, titleAz: t.titleAz, titleEn: t.titleEn,
    phase: t.phase, dueDate: addDays(emp.startDate, t.dayOffset), ownerRole: t.ownerRole, status: 'todo', doneAt: null,
  }));
}

function hash(s) { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

/** Realistik görünüş: köhnə tapşırıqların ~85%-i done, hər işçidə 1–2 köhnə todo (gecikmiş nümunəsi) */
function seedTasks() {
  const out = [];
  const cutoff = addDays(TODAY, -3);
  employees.forEach((emp) => {
    const tasks = generateTasks(emp);
    const old = tasks.filter((t) => t.dueDate <= cutoff);
    const keep = old.length >= 10 ? 2 : old.length >= 1 ? 1 : 0;
    const keepIds = new Set();
    for (let i = 0; keepIds.size < keep; i++) keepIds.add(old[(hash(emp.id) + i * 3) % old.length].id);
    tasks.forEach((t) => {
      if (t.dueDate <= cutoff) {
        if (!keepIds.has(t.id)) { t.status = 'done'; t.doneAt = `${t.dueDate}T11:00:00Z`; }
      } else if (t.dueDate < TODAY && hash(t.id) % 2 === 0) {
        t.status = 'done'; t.doneAt = `${t.dueDate}T15:00:00Z`;
      }
    });
    out.push(...tasks);
  });
  return out;
}

export const systems = [
  { id: 's_email', name: 'E-poçt (Outlook)', ownerName: 'Ramil Musayev', ownerEmail: 'ramil.musayev@company.az', notifyEmails: ['it-support@company.az'] },
  { id: 's_ad', name: 'Active Directory / Domen', ownerName: 'Ramil Musayev', ownerEmail: 'ramil.musayev@company.az', notifyEmails: ['it-security@company.az'] },
  { id: 's_vpn', name: 'VPN', ownerName: 'Ramil Musayev', ownerEmail: 'ramil.musayev@company.az', notifyEmails: ['it-security@company.az'] },
  { id: 's_crm', name: 'CRM', ownerName: 'Fərid Səfərov', ownerEmail: 'farid.safarov@company.az', notifyEmails: ['crm-admin@company.az'] },
  { id: 's_core', name: 'Core Banking', ownerName: 'Fərid Səfərov', ownerEmail: 'farid.safarov@company.az', notifyEmails: ['core-admin@company.az', 'it-security@company.az'] },
  { id: 's_jira', name: 'Jira / Confluence', ownerName: 'Orxan Vəliyev', ownerEmail: 'orxan.valiyev@company.az', notifyEmails: [] },
  { id: 's_erp', name: '1C / ERP', ownerName: 'Cavid Məlikov', ownerEmail: 'cavid.malikov@company.az', notifyEmails: ['finance-it@company.az'] },
  { id: 's_hrp', name: 'HR Portal', ownerName: 'Nigar Abbasova', ownerEmail: 'nigar.abbasova@company.az', notifyEmails: [] },
];

function ar(id, employeeId, systemId, level, requestedBy, note, createdAt, steps) {
  const history = [{ status: 'pending', by: requestedBy, at: createdAt }];
  (steps || []).forEach((s) => history.push(s));
  return { id, employeeId, systemId, level, requestedBy, note, status: history[history.length - 1].status, createdAt, history };
}
const ok = (status, at, extra) => ({ status, by: 'u_it1', at, ...(extra || {}) });

export const accessRequests = [
  ar('ar01', 'e01', 's_crm', 'edit', 'u_mgr2', 'Marketinq kampaniyaları üçün', '2026-11-05T09:00:00Z'),
  ar('ar02', 'e01', 's_email', 'read', 'u_mgr2', 'Korporativ e-poçt qutusu', '2026-11-05T09:01:00Z'),
  ar('ar03', 'e01', 's_ad', 'read', 'u_mgr2', 'Domen hesabı', '2026-11-05T09:02:00Z'),
  ar('ar04', 'e09', 's_erp', 'edit', 'u_mgr2', 'Mühasibat əməliyyatları üçün', '2026-11-06T10:00:00Z'),
  ar('ar05', 'e09', 's_email', 'read', 'u_hr1', '', '2026-11-06T10:05:00Z'),
  ar('ar06', 'e02', 's_email', 'read', 'u_mgr1', '', '2026-10-22T09:00:00Z', [ok('approved', '2026-10-23T10:00:00Z'), ok('granted', '2026-10-27T12:00:00Z')]),
  ar('ar07', 'e02', 's_ad', 'read', 'u_mgr1', '', '2026-10-22T09:05:00Z', [ok('approved', '2026-10-23T10:05:00Z'), ok('granted', '2026-10-27T12:10:00Z')]),
  ar('ar08', 'e02', 's_jira', 'edit', 'u_mgr1', 'Komanda layihələri', '2026-10-22T09:10:00Z', [ok('approved', '2026-10-24T09:00:00Z'), ok('granted', '2026-10-30T16:00:00Z')]),
  ar('ar09', 'e02', 's_vpn', 'read', 'u_mgr1', 'Uzaqdan iş üçün', '2026-10-28T11:00:00Z', [ok('approved', '2026-11-03T09:30:00Z')]),
  ar('ar10', 'e10', 's_core', 'admin', 'u_mgr1', 'Server mühitləri üçün', '2026-10-20T09:00:00Z', [ok('rejected', '2026-10-21T14:00:00Z', { reason: 'Admin səviyyəsi DevOps üçün tələb olunmur, "Oxuma" ilə yenidən sorğu yaradın' })]),
];

export const notifications = [
  { id: 'n01', type: 'access_request', toRoles: ['it', 'hr'], toUserIds: ['u_mgr2'], toEmails: ['farid.safarov@company.az', 'crm-admin@company.az'], messageAz: 'Aysel Məmmədova üçün CRM girişi tələb olunur', messageEn: 'CRM access requested for Aysel Məmmədova', relatedId: 'ar01', createdAt: '2026-11-05T09:00:00Z', read: false },
  { id: 'n02', type: 'access_request', toRoles: ['it', 'hr'], toUserIds: ['u_mgr2', 'u_it1'], toEmails: ['ramil.musayev@company.az', 'it-support@company.az'], messageAz: 'Aysel Məmmədova üçün E-poçt (Outlook) girişi tələb olunur', messageEn: 'E-poçt (Outlook) access requested for Aysel Məmmədova', relatedId: 'ar02', createdAt: '2026-11-05T09:01:00Z', read: false },
  { id: 'n03', type: 'access_request', toRoles: ['it', 'hr'], toUserIds: ['u_mgr2', 'u_bud3'], toEmails: ['cavid.malikov@company.az', 'finance-it@company.az'], messageAz: 'Səbinə Kərimova üçün 1C / ERP girişi tələb olunur', messageEn: '1C / ERP access requested for Səbinə Kərimova', relatedId: 'ar04', createdAt: '2026-11-06T10:00:00Z', read: false },
  { id: 'n04', type: 'buddy_assigned', toRoles: ['hr'], toUserIds: ['u_bud2', 'e01'], toEmails: [], messageAz: 'Aytən Qasımova Aysel Məmmədova üçün buddy təyin edildi', messageEn: 'Aytən Qasımova was assigned as buddy to Aysel Məmmədova', relatedId: 'e01', createdAt: '2026-11-02T12:00:00Z', read: true },
  { id: 'n05', type: 'survey_due', toRoles: [], toUserIds: ['e10'], toEmails: [], messageAz: '7-ci gün sorğusu sizi gözləyir', messageEn: 'Your day 7 survey is waiting', relatedId: 'sv7', createdAt: '2026-10-26T09:00:00Z', read: false },
  { id: 'n06', type: 'training_sign', toRoles: [], toUserIds: ['u_trn1'], toEmails: [], messageAz: 'Rəşad Əliyev "İnformasiya təhlükəsizliyi" təlimini imzaladı — təlimçi imzası gözlənilir', messageEn: 'Rəşad Əliyev signed "Information Security" — trainer signature pending', relatedId: 'tr01', createdAt: '2026-11-06T14:05:00Z', read: false },
  { id: 'n07', type: 'access_status', toRoles: ['hr'], toUserIds: ['u_mgr1'], toEmails: [], messageAz: 'Rəşad Əliyev üçün VPN sorğusu: Təsdiqləndi', messageEn: 'VPN request for Rəşad Əliyev: Approved', relatedId: 'ar09', createdAt: '2026-11-03T09:30:00Z', read: false },
  { id: 'n08', type: 'feedback_due', toRoles: ['hr'], toUserIds: ['e03', 'u_mgr2', 'u_bud2'], toEmails: [], messageAz: 'Leyla Hüseynova üçün 30 günlük rəy pəncərəsi açıqdır', messageEn: '30-day feedback window is open for Leyla Hüseynova', relatedId: 'e03', createdAt: '2026-11-03T09:00:00Z', read: false },
];

export const handbookSections = [
  { id: 'h01', order: 1, titleAz: 'Xoş gəldiniz', titleEn: 'Welcome',
    contentAz: 'Komandamıza xoş gəlmisiniz! Bu kitabça ilk günlərinizdə ən çox lazım olacaq məlumatları bir yerdə toplayır.\n\nOnboarding prosesi 180 gün davam edir. Bu müddətdə menecer, buddy və HR komandası hər addımda yanınızdadır.\n\nHər bölməni oxuduqdan sonra "Oxudum və tanış oldum" düyməsini basmağı unutmayın.',
    contentEn: 'Welcome to our team! This handbook brings together the information you will need most in your first days.\n\nOnboarding lasts 180 days. During this time your manager, buddy and the HR team are with you at every step.\n\nAfter reading each section, remember to press "I have read and understood".' },
  { id: 'h02', order: 2, titleAz: 'Dəyərlərimiz', titleEn: 'Our values',
    contentAz: 'Müştəri mərkəzlilik: hər qərarda müştərinin ehtiyacını əsas götürürük.\n\nDürüstlük və şəffaflıq: açıq danışırıq, səhvlərimizi gizlətmirik və birlikdə öyrənirik.\n\nKomanda ruhu və inkişaf: bir-birimizə dəstək oluruq və hər gün bir az daha yaxşı olmağa çalışırıq.',
    contentEn: 'Customer focus: we put the customer\'s needs at the heart of every decision.\n\nIntegrity and transparency: we speak openly, do not hide mistakes and learn together.\n\nTeam spirit and growth: we support each other and try to get a little better every day.' },
  { id: 'h03', order: 3, titleAz: 'İş saatları və ofis qaydaları', titleEn: 'Working hours & office rules',
    contentAz: 'Standart iş günü 09:00–18:00 arasıdır, 13:00–14:00 nahar fasiləsidir. Çevik iş qrafiki menecerlə razılaşdırılır.\n\nOfisə giriş şəxsi kartla həyata keçirilir. Kartınızı başqalarına verməyin.\n\nGörüş otaqlarını təqvim vasitəsilə rezerv edin və istifadədən sonra səliqəli buraxın.',
    contentEn: 'The standard working day is 09:00–18:00 with a lunch break from 13:00 to 14:00. Flexible schedules are agreed with your manager.\n\nOffice access is by personal badge. Never lend your badge to others.\n\nBook meeting rooms through the calendar and leave them tidy after use.' },
  { id: 'h04', order: 4, titleAz: 'Məzuniyyət və icazələr', titleEn: 'Leave & absences',
    contentAz: 'İllik əsas məzuniyyət əmək qanunvericiliyinə uyğun olaraq verilir. Sorğu HR Portal üzərindən ən azı 2 həftə əvvəl göndərilir.\n\nXəstəlik halında səhər 10:00-a qədər menecerinizi məlumatlandırın və sonradan arayışı HR-a təqdim edin.\n\nQısa müddətli icazələr menecerlə razılaşdırılır və portalda qeyd olunur.',
    contentEn: 'Annual leave is granted in line with labour law. Submit requests through the HR Portal at least 2 weeks in advance.\n\nIf you are sick, inform your manager before 10:00 and later submit a medical note to HR.\n\nShort absences are agreed with your manager and recorded in the portal.' },
  { id: 'h05', order: 5, titleAz: 'İnformasiya təhlükəsizliyi', titleEn: 'Information security',
    contentAz: 'Şifrənizi heç kimlə paylaşmayın və hər 90 gündən bir dəyişin. İki faktorlu doğrulamanı aktiv saxlayın.\n\nŞübhəli e-poçtları açmayın, linklərə klikləməyin və dərhal it-security@company.az ünvanına bildirin.\n\nKompüterdən uzaqlaşanda ekranı kilidləyin (Win + L). Müştəri məlumatlarını yalnız icazəli sistemlərdə saxlayın.',
    contentEn: 'Never share your password and change it every 90 days. Keep two-factor authentication enabled.\n\nDo not open suspicious emails or click their links — report them to it-security@company.az right away.\n\nLock your screen when you step away (Win + L). Store customer data only in approved systems.' },
  { id: 'h06', order: 6, titleAz: 'Geyim qaydası', titleEn: 'Dress code',
    contentAz: 'Gündəlik iş üçün biznes-kejual geyim tövsiyə olunur.\n\nMüştəri görüşlərində və rəsmi tədbirlərdə klassik biznes geyimi gözlənilir.\n\nCümə günləri daha sərbəst geyinmək olar, lakin səliqəli görünüş qorunmalıdır.',
    contentEn: 'Business casual is recommended for everyday work.\n\nClassic business attire is expected at client meetings and formal events.\n\nFridays can be more relaxed, but a neat appearance should be maintained.' },
  { id: 'h07', order: 7, titleAz: 'Faydalar və güzəştlər', titleEn: 'Benefits & perks',
    contentAz: 'Bütün əməkdaşlar sınaq müddətindən sonra tibbi sığorta ilə təmin olunur.\n\nTəlim və sertifikat xərcləri illik inkişaf büdcəsi çərçivəsində qarşılanır.\n\nTərəfdaş idman zalları, restoranlar və mağazalarda əməkdaşlar üçün endirimlər mövcuddur.',
    contentEn: 'All employees receive health insurance after the probation period.\n\nTraining and certification costs are covered by the annual development budget.\n\nEmployee discounts are available at partner gyms, restaurants and shops.' },
  { id: 'h08', order: 8, titleAz: 'Faydalı əlaqələr', titleEn: 'Useful contacts',
    contentAz: 'HR komandası: hr@company.az — müqavilə, məzuniyyət və onboarding sualları.\n\nIT dəstək: it-support@company.az, daxili nömrə 1111 — avadanlıq və girişlər.\n\nİnformasiya təhlükəsizliyi: it-security@company.az — şübhəli hallar barədə dərhal bildirin.',
    contentEn: 'HR team: hr@company.az — contracts, leave and onboarding questions.\n\nIT support: it-support@company.az, ext. 1111 — equipment and access.\n\nInformation security: it-security@company.az — report suspicious activity immediately.' },
];

function seedAcks() {
  const plan = { e01: 2, e02: 6, e03: 8, e04: 8, e05: 8, e06: 8, e07: 8, e08: 8, e10: 5 };
  const out = [];
  Object.entries(plan).forEach(([empId, n]) => {
    const emp = employees.find((e) => e.id === empId);
    handbookSections.slice(0, n).forEach((s, i) => {
      const day = emp.startDate > TODAY ? addDays(TODAY, -1) : addDays(emp.startDate, Math.min(2, i));
      out.push({ id: `${empId}_${s.id}`, employeeId: empId, sectionId: s.id, at: `${day}T12:${String(10 + i).padStart(2, '0')}:00Z` });
    });
  });
  return out;
}

const F = (id, employeeId, window, fromRole, fromId, toRole, toId, rating, strengths, improvements, shared, createdAt) =>
  ({ id, employeeId, window, fromRole, fromId, toRole, toId, rating, strengths, improvements, sharedWithEmployee: shared, createdAt });
export const feedback = [
  F('f01', 'e03', 30, 'employee', 'e03', 'buddy', 'u_bud2', 5, 'Hər sualıma vaxtında cavab verdi', 'Daha çox komanda görüşlərinə dəvət edə bilərdi', false, '2026-11-04T15:00:00Z'),
  F('f02', 'e03', 30, 'buddy', 'u_bud2', 'employee', 'e03', 4, 'Tez öyrənir, proseslərə maraq göstərir', 'Suallarını daha erkən verməsi faydalı olardı', false, '2026-11-05T11:00:00Z'),
  F('f03', 'e04', 30, 'employee', 'e04', 'manager', 'u_mgr2', 4, 'Məqsədləri aydın izah etdi', 'Həftəlik 1:1 görüşlər daha müntəzəm ola bilər', false, '2026-10-03T10:00:00Z'),
  F('f04', 'e04', 30, 'manager', 'u_mgr2', 'employee', 'e04', 4, 'Analitik düşüncəsi güclüdür, hesabatları dəqiqdir', 'Təqdimat bacarıqlarını inkişaf etdirə bilər', true, '2026-10-04T16:00:00Z'),
  F('f05', 'e05', 90, 'employee', 'e05', 'buddy', 'u_bud2', 5, 'Hər zaman əlçatan və səbirli idi', 'Əlavə heç nə', false, '2026-11-02T13:00:00Z'),
  F('f06', 'e05', 90, 'manager', 'u_mgr2', 'employee', 'e05', 4, 'Müştərilərlə ünsiyyəti nümunəvidir', 'CRM-də qeydləri daha ətraflı aparmalıdır', false, '2026-11-03T09:30:00Z'),
  F('f07', 'e06', 90, 'employee', 'e06', 'manager', 'u_mgr1', 4, 'Texniki məsələlərdə güclü dəstək verir', 'Prioritetləri daha erkən paylaşa bilər', false, '2026-10-02T12:00:00Z'),
  F('f08', 'e07', 90, 'buddy', 'u_bud3', 'employee', 'e07', 5, 'Dizayn həlləri yaradıcı və istifadəçi yönümlüdür', 'Komandalararası görüşlərdə daha aktiv ola bilər', true, '2026-09-01T10:00:00Z'),
  F('f09', 'e08', 180, 'manager', 'u_mgr2', 'employee', 'e08', 5, 'Satış planını 120% icra etdi', 'Mentorluq rolunu üzərinə götürə bilər', true, '2026-11-05T10:00:00Z'),
  F('f10', 'e08', 180, 'employee', 'e08', 'buddy', 'u_bud3', 4, 'İlk aylarda çox kömək oldu', 'Sonrakı mərhələlərdə görüşlər azaldı', false, '2026-11-05T12:00:00Z'),
];

const Q = (id, type, textAz, textEn) => ({ id, type, textAz, textEn });
const NPS = Q('q4', 'nps', 'Şirkəti dostunuza iş yeri kimi tövsiyə edərdinizmi?', 'Would you recommend us as a workplace?');
export const surveyTemplates = [
  { id: 'sv7', day: 7, questions: [
    Q('q1', 'scale5', 'İlk həftəniz necə keçdi?', 'How was your first week?'),
    Q('q2', 'scale5', 'İş yeriniz və avadanlığınız vaxtında hazır idimi?', 'Were your workspace and equipment ready on time?'),
    Q('q3', 'scale5', 'Buddy-nizdən nə qədər dəstək aldınız?', 'How supported did you feel by your buddy?'),
    NPS, Q('q5', 'text', 'Nəyi daha yaxşı edə bilərdik?', 'What could we do better?')] },
  { id: 'sv30', day: 30, questions: [
    Q('q1', 'scale5', 'Vəzifə öhdəlikləriniz sizə nə dərəcədə aydındır?', 'How clear are your role responsibilities?'),
    Q('q2', 'scale5', 'Bütün lazımi sistemlərə girişiniz varmı?', 'Do you have access to all the systems you need?'),
    Q('q3', 'scale5', 'Komandaya nə qədər inteqrasiya olunduğunuzu hiss edirsiniz?', 'How integrated do you feel in the team?'),
    NPS, Q('q5', 'text', 'İlk ayınızla bağlı şərhiniz', 'Comments about your first month')] },
  { id: 'sv90', day: 90, questions: [
    Q('q1', 'scale5', 'Menecerinizdən aldığınız rəy nə dərəcədə faydalıdır?', 'How useful is the feedback from your manager?'),
    Q('q2', 'scale5', 'Öz inkişaf yolunuzu nə qədər aydın görürsünüz?', 'How clearly do you see your growth path?'),
    Q('q3', 'scale5', 'İş yükünüz nə dərəcədə balanslıdır?', 'How balanced is your workload?'),
    NPS, Q('q5', 'text', 'Sınaq müddəti ilə bağlı nə dəyişərdiniz?', 'What would you change about the probation period?')] },
  { id: 'sv180', day: 180, questions: [
    Q('q1', 'scale5', 'Onboarding prosesini ümumilikdə necə qiymətləndirirsiniz?', 'How would you rate onboarding overall?'),
    Q('q2', 'scale5', 'İşinizdən nə dərəcədə məmnunsunuz?', 'How satisfied are you with your job?'),
    Q('q3', 'scale5', 'Gələcəyinizi bu şirkətdə nə qədər görürsünüz?', 'How much do you see your future at this company?'),
    Q('q4', 'scale5', 'Buddy proqramı nə dərəcədə faydalı oldu?', 'How useful was the buddy programme?'),
    Q('q5', 'nps', 'Şirkəti dostunuza iş yeri kimi tövsiyə edərdinizmi?', 'Would you recommend us as a workplace?'),
    Q('q6', 'text', 'Yeni gələnlər üçün tövsiyəniz', 'Your advice for newcomers')] },
];

const R = (id, employeeId, templateId, answers, createdAt) => ({ id, employeeId, templateId, answers, createdAt });
export const surveyResponses = [
  R('sr01', 'e03', 'sv30', { q1: 4, q2: 5, q3: 4, q4: 9, q5: 'Hər şey yaxşı idi' }, '2026-11-04T10:00:00Z'),
  R('sr02', 'e03', 'sv7', { q1: 5, q2: 4, q3: 5, q4: 10, q5: 'Buddy çox köməkçi oldu' }, '2026-10-12T10:00:00Z'),
  R('sr03', 'e04', 'sv7', { q1: 4, q2: 3, q3: 4, q4: 8, q5: 'Noutbuk bir gün gec gəldi' }, '2026-09-08T10:00:00Z'),
  R('sr04', 'e04', 'sv30', { q1: 4, q2: 4, q3: 4, q4: 8, q5: '' }, '2026-10-01T10:00:00Z'),
  R('sr05', 'e05', 'sv30', { q1: 5, q2: 4, q3: 5, q4: 9, q5: 'Komanda çox mehribandır' }, '2026-09-02T10:00:00Z'),
  R('sr06', 'e05', 'sv90', { q1: 4, q2: 4, q3: 3, q4: 7, q5: 'İş yükü bəzən çox olur' }, '2026-11-01T10:00:00Z'),
  R('sr07', 'e06', 'sv30', { q1: 3, q2: 2, q3: 4, q4: 6, q5: 'Bəzi sistemlərə giriş gecikdi' }, '2026-07-31T10:00:00Z'),
  R('sr08', 'e06', 'sv90', { q1: 4, q2: 3, q3: 4, q4: 7, q5: 'İnkişaf planı daha konkret ola bilər' }, '2026-09-29T10:00:00Z'),
  R('sr09', 'e07', 'sv30', { q1: 5, q2: 5, q3: 4, q4: 10, q5: '' }, '2026-07-01T10:00:00Z'),
  R('sr10', 'e07', 'sv90', { q1: 5, q2: 4, q3: 4, q4: 9, q5: 'Mentorluq çox faydalıdır' }, '2026-08-30T10:00:00Z'),
  R('sr11', 'e08', 'sv90', { q1: 4, q2: 5, q3: 4, q4: 9, q5: '' }, '2026-08-09T10:00:00Z'),
  R('sr12', 'e08', 'sv180', { q1: 5, q2: 5, q3: 4, q4: 5, q5: 10, q6: 'Sual verməkdən çəkinməyin!' }, '2026-11-05T10:00:00Z'),
];

export const trainings = [
  { id: 'tr01', titleAz: 'İnformasiya təhlükəsizliyi', titleEn: 'Information Security', date: '2026-11-06', trainerId: 'u_trn1', participantIds: ['e02', 'e10'] },
  { id: 'tr02', titleAz: 'Müştəri xidməti standartları', titleEn: 'Customer Service Standards', date: '2026-08-10', trainerId: 'u_trn1', participantIds: ['e05', 'e04'] },
  { id: 'tr03', titleAz: 'AML / Compliance əsasları', titleEn: 'AML / Compliance Basics', date: '2026-10-12', trainerId: 'u_trn1', participantIds: ['e03', 'e04', 'e06'] },
];

/** Sadə xətt çəkilmiş kiçik demo imza PNG-si */
export function demoSignature(seedText) {
  try {
    const c = document.createElement('canvas');
    c.width = 300; c.height = 100;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 300, 100);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const h = hash(seedText);
    const a = 10 + (h % 14), f = 0.05 + ((h >> 4) % 7) / 100, ph = (h >> 8) % 10;
    ctx.beginPath();
    for (let x = 20; x <= 270; x += 3) {
      const y = 55 + Math.sin(x * f + ph) * a * Math.sin(x / 45) + Math.cos(x * 0.21 + ph) * 6;
      if (x === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, 80); ctx.quadraticCurveTo(150, 70 + (h % 20), 260, 78); ctx.stroke();
    return c.toDataURL('image/png');
  } catch (e) {
    return null;
  }
}

function sig(trainingId, employeeId, empAt, trnAt) {
  const s = {
    id: `${trainingId}_${employeeId}`, trainingId, employeeId,
    employeeSignature: empAt ? demoSignature(employeeId + trainingId) : null, employeeSignedAt: empAt || null,
    trainerSignature: trnAt ? demoSignature('u_trn1' + trainingId + employeeId) : null, trainerSignedAt: trnAt || null,
    status: trnAt ? 'completed' : empAt ? 'employee_signed' : 'pending',
  };
  if (empAt) s.signed = true; // seed göstəricisi: şəkil yoxdursa UI "İmzalanıb (nümunə)" yazır
  return s;
}

export function trainingSignatures() {
  return [
    sig('tr01', 'e02', '2026-11-06T14:05:00Z', null),
    sig('tr01', 'e10', null, null),
    sig('tr02', 'e05', '2026-08-10T15:00:00Z', '2026-08-10T16:30:00Z'),
    sig('tr02', 'e04', '2026-08-10T15:02:00Z', '2026-08-10T16:31:00Z'),
    sig('tr03', 'e03', '2026-10-12T15:00:00Z', '2026-10-12T17:00:00Z'),
    sig('tr03', 'e04', '2026-10-12T15:04:00Z', null),
    sig('tr03', 'e06', null, null),
  ];
}

export function buildSeed() {
  return JSON.parse(JSON.stringify({
    users, employees, taskTemplates, employeeTasks: seedTasks(), systems, accessRequests, notifications,
    handbookSections, acknowledgements: seedAcks(), feedback, surveyTemplates, surveyResponses, trainings,
    trainingSignatures: trainingSignatures(),
  }));
}
