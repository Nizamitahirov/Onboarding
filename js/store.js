// store.js — sessiya (rol), icazələr və biznes məntiqi
import { cache, all, one, set, update, setMany } from './db.js';
import { generateTasks } from './seed.js';
import { i18n, t } from './i18n.js';
import {
  TODAY, dayNumber, diffDays, employeeStatus, isActiveStatus, isOverdue, progressOf, nowISO, uid, unique, mailtoLink, formatDate,
} from './utils.js';

const { reactive } = Vue;

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

export const ROLES = ['hr', 'manager', 'buddy', 'trainer', 'it', 'employee'];
export const BUDDY_LIMIT = 3;

export const session = reactive({
  role: ROLES.includes(lsGet('role', 'hr')) ? lsGet('role', 'hr') : 'hr',
  employeeId: lsGet('employeeId', 'e10'),
  managerId: lsGet('managerId', 'u_mgr1'),
  buddyId: lsGet('buddyId', 'u_bud1'),
  toasts: [],
});

export function setSession(key, value) {
  session[key] = value;
  lsSet(key, value);
}

// ---------- Naviqasiya / icazələr ----------
export const NAV_ICONS = {
  dashboard: '📊', employees: '👥', access: '🔑', trainings: '🎓', handbook: '📘',
  feedback: '💬', surveys: '📝', me: '🏠', settings: '⚙️',
};
export const ROLE_NAV = {
  hr: ['dashboard', 'employees', 'access', 'trainings', 'handbook', 'feedback', 'surveys', 'settings'],
  manager: ['dashboard', 'employees', 'access', 'feedback', 'trainings', 'handbook'],
  buddy: ['employees', 'feedback', 'handbook'],
  trainer: ['trainings', 'handbook'],
  it: ['access', 'employees'],
  employee: ['me', 'handbook', 'surveys', 'trainings'],
};
export function navFor(role = session.role) { return ROLE_NAV[role] || []; }

export function canAccessRoute(name, params = {}) {
  const nav = navFor();
  if (name === 'employee') {
    if (!nav.includes('employees')) return false;
    return visibleEmployees().some((e) => e.id === params.id);
  }
  if (name === 'training') return nav.includes('trainings') && visibleTrainings().some((tr) => tr.id === params.id);
  return nav.includes(name);
}

// ---------- İstifadəçilər ----------
export function usersByRole(role) { return all('users', { role }).sort((a, b) => a.name.localeCompare(b.name, 'az')); }

export function currentUserId() {
  switch (session.role) {
    case 'manager': return session.managerId;
    case 'buddy': return session.buddyId;
    case 'employee': return session.employeeId;
    default: { const u = usersByRole(session.role)[0]; return u ? u.id : null; }
  }
}
export function currentEmployee() { return session.role === 'employee' ? one('employees', session.employeeId) : null; }

export function fullName(emp) { return emp ? `${emp.firstName} ${emp.lastName}` : '—'; }
export function personName(id) {
  if (!id) return '—';
  const e = one('employees', id);
  if (e) return fullName(e);
  const u = one('users', id);
  return u ? u.name : id;
}
export function personEmail(id) {
  const e = one('employees', id) || one('users', id);
  return e ? e.email : '';
}
export function currentName() {
  const id = currentUserId();
  const e = one('employees', id);
  if (e) return e.firstName;
  const u = one('users', id);
  return u ? u.name.split(' ')[0] : '';
}

// ---------- İşçilər ----------
export function employeesSorted() {
  return all('employees').sort((a, b) => (a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : a.id.localeCompare(b.id)));
}
export function visibleEmployees() {
  const uidv = currentUserId();
  const list = employeesSorted();
  switch (session.role) {
    case 'manager': return list.filter((e) => e.managerId === uidv);
    case 'buddy': return list.filter((e) => e.buddyId === uidv);
    case 'employee': return list.filter((e) => e.id === uidv);
    default: return list;
  }
}
export function departments() {
  const base = ['IT', 'HR', 'Marketinq', 'Biznes', 'Risk', 'Maliyyə', 'Müştəri xidmətləri', 'Məhsul', 'Satış'];
  return unique([...base, ...all('employees').map((e) => e.department)]);
}

export function tasksOf(empId) {
  return all('employeeTasks', { employeeId: empId }).sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : a.id.localeCompare(b.id)));
}
export function progressFor(empId) { return progressOf(tasksOf(empId)); }
export function overdueOf(empId) { return tasksOf(empId).filter((tk) => isOverdue(tk)); }
export function dayInfo(emp) {
  const n = dayNumber(emp.startDate);
  return { n, shown: Math.max(0, Math.min(n, 180)), pct: Math.max(0, Math.min(100, Math.round((n / 180) * 100))), untilStart: diffDays(emp.startDate, TODAY) };
}

export function canToggleTask(task) {
  const r = session.role;
  if (r === 'hr') return true;
  const emp = one('employees', task.employeeId);
  if (!emp) return false;
  if (r === 'employee') return task.ownerRole === 'employee' && task.employeeId === session.employeeId;
  if (r === 'manager') return task.ownerRole === 'manager' && emp.managerId === session.managerId;
  if (r === 'buddy') return task.ownerRole === 'buddy' && emp.buddyId === session.buddyId;
  return task.ownerRole === r;
}

export async function toggleTask(task) {
  if (!canToggleTask(task)) return;
  const done = task.status !== 'done';
  await update('employeeTasks', task.id, { status: done ? 'done' : 'todo', doneAt: done ? nowISO() : null });
}

export async function completeTemplateTask(empId, templateId) {
  const tk = one('employeeTasks', `${empId}_${templateId}`);
  if (tk && tk.status !== 'done') await update('employeeTasks', tk.id, { status: 'done', doneAt: nowISO() });
}

export async function createEmployee(data) {
  const emp = { ...data, id: uid('e'), buddyId: null, createdAt: nowISO() };
  await set('employees', emp.id, emp);
  const templates = all('taskTemplates').sort((a, b) => a.dayOffset - b.dayOffset || a.id.localeCompare(b.id));
  await setMany('employeeTasks', generateTasks(emp, templates));
  return emp;
}

// ---------- Buddy ----------
export function buddyLoad(buddyId) {
  return all('employees', { buddyId }).filter((e) => isActiveStatus(employeeStatus(e))).length;
}
export async function assignBuddy(emp, buddyId) {
  const isCurrent = emp.buddyId === buddyId;
  if (!isCurrent && buddyLoad(buddyId) >= BUDDY_LIMIT) throw new Error(t('buddy.limitReached'));
  await update('employees', emp.id, { buddyId });
  const bName = personName(buddyId), eName = fullName(emp);
  await notify({
    type: 'buddy_assigned', toRoles: ['hr'], toUserIds: [buddyId, emp.id], toEmails: [personEmail(buddyId), emp.email],
    messageAz: `${bName} ${eName} üçün buddy təyin edildi`, messageEn: `${bName} was assigned as buddy to ${eName}`, relatedId: emp.id,
  });
  await completeTemplateTask(emp.id, 't02');
}

// ---------- Bildirişlər ----------
export async function notify(n) {
  const docData = { toRoles: [], toUserIds: [], toEmails: [], read: false, createdAt: nowISO(), ...n, id: uid('n') };
  docData.toEmails = unique(docData.toEmails);
  docData.toUserIds = unique(docData.toUserIds);
  await set('notifications', docData.id, docData);
  return docData;
}
export function visibleNotifications() {
  const r = session.role, me = currentUserId();
  return all('notifications')
    .filter((n) => (r !== 'employee' && (n.toRoles || []).includes(r)) || (n.toUserIds || []).includes(me))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export async function markNotificationsRead(list) {
  for (const n of list) if (!n.read) await update('notifications', n.id, { read: true });
}

// ---------- Access ----------
export const LEVELS = ['read', 'edit', 'admin'];
export const ACCESS_STATUSES = ['pending', 'approved', 'granted', 'rejected'];

/** Sorğu üzrə alıcılar: sistem sahibi (+ əlavə e-poçtlar), IT, menecer, HR */
export function recipientsFor(empId, systemIds) {
  const emp = one('employees', empId);
  const out = [];
  const add = (kind, name, email) => { if (email && !out.some((r) => r.email === email)) out.push({ kind, name, email }); };
  systemIds.map((id) => one('systems', id)).filter(Boolean).forEach((s) => {
    add('owner', `${s.ownerName} (${s.name})`, s.ownerEmail);
    (s.notifyEmails || []).forEach((e) => add('extra', s.name, e));
  });
  usersByRole('it').forEach((u) => add('it', u.name, u.email));
  if (emp && emp.managerId) { const m = one('users', emp.managerId); if (m) add('manager', m.name, m.email); }
  usersByRole('hr').forEach((u) => add('hr', u.name, u.email));
  return out;
}

export function visibleAccessRequests() {
  const ids = new Set(visibleEmployees().map((e) => e.id));
  const list = all('accessRequests').sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return session.role === 'manager' ? list.filter((r) => ids.has(r.employeeId)) : list;
}

export async function createAccessRequests({ employeeId, systemIds, level, note }) {
  const emp = one('employees', employeeId);
  const by = currentUserId();
  const created = [];
  for (const systemId of systemIds) {
    const sys = one('systems', systemId);
    const at = nowISO();
    const req = { id: uid('ar'), employeeId, systemId, level, requestedBy: by, note: note || '', status: 'pending', createdAt: at, history: [{ status: 'pending', by, at }] };
    await set('accessRequests', req.id, req);
    const owner = all('users').find((u) => u.email === sys.ownerEmail);
    await notify({
      type: 'access_request', toRoles: ['it', 'hr'], toUserIds: [emp.managerId, owner && owner.id],
      toEmails: recipientsFor(employeeId, [systemId]).map((r) => r.email),
      messageAz: `${fullName(emp)} üçün ${sys.name} girişi tələb olunur`, messageEn: `${sys.name} access requested for ${fullName(emp)}`, relatedId: req.id,
    });
    created.push(req);
  }
  await completeTemplateTask(employeeId, 't03');
  return created;
}

export async function changeAccessStatus(req, status, reason) {
  const entry = { status, by: currentUserId(), at: nowISO() };
  if (reason) entry.reason = reason;
  await update('accessRequests', req.id, { status, history: [...(req.history || []), entry] });
  const emp = one('employees', req.employeeId), sys = one('systems', req.systemId);
  const sAz = t('accessStatus.' + status, null, 'az'), sEn = t('accessStatus.' + status, null, 'en');
  await notify({
    type: 'access_status', toRoles: ['hr'], toUserIds: [req.requestedBy, emp && emp.managerId],
    toEmails: [], relatedId: req.id,
    messageAz: `${fullName(emp)} üçün ${sys ? sys.name : ''} sorğusu: ${sAz}`, messageEn: `${sys ? sys.name : ''} request for ${fullName(emp)}: ${sEn}`,
  });
}

export function accessMailto(req) {
  const emp = one('employees', req.employeeId), sys = one('systems', req.systemId);
  const L = i18n.lang;
  const to = recipientsFor(req.employeeId, [req.systemId]).map((r) => r.email);
  const subject = t('access.mailSubject', { system: sys ? sys.name : '', name: fullName(emp) });
  const last = (req.history || [])[req.history.length - 1];
  const lines = [
    t('access.mailGreeting'), '',
    t('access.mailIntro'), '',
    `${t('fields.employee')}: ${fullName(emp)}`,
    `${t('fields.position')}: ${emp ? emp.position : ''} (${emp ? emp.department : ''})`,
    `${t('fields.startDate')}: ${emp ? formatDate(emp.startDate, L) : ''}`,
    `${t('fields.system')}: ${sys ? sys.name : ''}`,
    `${t('fields.level')}: ${t('levels.' + req.level)}`,
    `${t('fields.status')}: ${t('accessStatus.' + req.status)}${last && last.reason ? ' — ' + last.reason : ''}`,
    `${t('fields.requestedBy')}: ${personName(req.requestedBy)}`,
  ];
  if (req.note) lines.push(`${t('fields.note')}: ${req.note}`);
  lines.push('', t('access.mailThanks'), personName(currentUserId()));
  return mailtoLink(to, subject, lines.join('\n'));
}

// ---------- Handbook ----------
export function sectionsSorted() { return all('handbookSections').sort((a, b) => a.order - b.order); }
export function ackOf(empId, sectionId) { return one('acknowledgements', `${empId}_${sectionId}`); }
export function ackCount(empId) {
  const ids = new Set(sectionsSorted().map((s) => s.id));
  return all('acknowledgements', { employeeId: empId }).filter((a) => ids.has(a.sectionId)).length;
}
export async function acknowledge(empId, sectionId) {
  const id = `${empId}_${sectionId}`;
  if (one('acknowledgements', id)) return;
  await set('acknowledgements', id, { employeeId: empId, sectionId, at: nowISO() });
  if (ackCount(empId) >= sectionsSorted().length) await completeTemplateTask(empId, 't08');
}

// ---------- Feedback ----------
export const WINDOWS = [30, 90, 180];
export const WINDOW_OPEN_DAYS = 14;
export function openWindow(emp) {
  const n = dayNumber(emp.startDate);
  return WINDOWS.find((w) => n >= w && n < w + WINDOW_OPEN_DAYS) || null;
}
export function canSeeFeedback(f) {
  const r = session.role, me = currentUserId();
  if (r === 'hr') return true;
  if (r === 'employee') return f.fromId === me || (f.toId === me && f.sharedWithEmployee);
  if (r === 'manager' || r === 'buddy') {
    const emp = one('employees', f.employeeId);
    const key = r === 'manager' ? 'managerId' : 'buddyId';
    return f.fromId === me || f.toId === me || (emp && emp[key] === me);
  }
  return false;
}
export function visibleFeedback() {
  return all('feedback').filter(canSeeFeedback).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
/** "Kimə" siyahısı — rola görə avtomatik */
export function feedbackTargets() {
  const r = session.role, me = currentUserId();
  if (r === 'employee') {
    const emp = one('employees', me);
    if (!emp) return [];
    const out = [];
    if (emp.managerId) out.push({ employeeId: emp.id, fromRole: 'employee', fromId: emp.id, toRole: 'manager', toId: emp.managerId });
    if (emp.buddyId) out.push({ employeeId: emp.id, fromRole: 'employee', fromId: emp.id, toRole: 'buddy', toId: emp.buddyId });
    return out;
  }
  if (r === 'manager' || r === 'buddy') {
    return visibleEmployees().map((e) => ({ employeeId: e.id, fromRole: r, fromId: me, toRole: 'employee', toId: e.id }));
  }
  return [];
}
export function canWriteFeedback() { return ['employee', 'manager', 'buddy'].includes(session.role); }
export async function createFeedback(data) {
  const f = { ...data, id: uid('f'), sharedWithEmployee: false, createdAt: nowISO() };
  await set('feedback', f.id, f);
  if (f.fromRole === 'employee' && f.window === 30) await completeTemplateTask(f.employeeId, 't12');
  return f;
}

// ---------- Surveys ----------
const SURVEY_TASK = { sv7: 't10', sv30: 't13', sv90: 't16', sv180: 't19' };
export const SURVEY_OPEN_DAYS = 30;
export function surveyTemplatesSorted() { return all('surveyTemplates').sort((a, b) => a.day - b.day); }
export function responseOf(empId, templateId) { return all('surveyResponses', { employeeId: empId, templateId })[0] || null; }
export function surveyState(emp, tpl) {
  if (responseOf(emp.id, tpl.id)) return 'submitted';
  const n = dayNumber(emp.startDate);
  if (n < tpl.day) return 'upcoming';
  return n < tpl.day + SURVEY_OPEN_DAYS ? 'pending' : 'missed';
}
export function pendingSurveys(emp) { return emp ? surveyTemplatesSorted().filter((tpl) => surveyState(emp, tpl) === 'pending') : []; }
export async function submitSurvey(empId, templateId, answers) {
  const r = { id: uid('sr'), employeeId: empId, templateId, answers, createdAt: nowISO() };
  await set('surveyResponses', r.id, r);
  if (SURVEY_TASK[templateId]) await completeTemplateTask(empId, SURVEY_TASK[templateId]);
  return r;
}

/** Orta bal (1–5 sualları) və eNPS (promoters 9–10 − detractors 0–6, %) */
export function surveyStats(responses) {
  const tpls = Object.fromEntries(all('surveyTemplates').map((x) => [x.id, x]));
  const scale = [], nps = [];
  responses.forEach((r) => {
    const tpl = tpls[r.templateId];
    if (!tpl) return;
    tpl.questions.forEach((q) => {
      const v = r.answers ? r.answers[q.id] : undefined;
      if (typeof v !== 'number') return;
      if (q.type === 'scale5') scale.push(v);
      if (q.type === 'nps') nps.push(v);
    });
  });
  const avg = scale.length ? scale.reduce((a, b) => a + b, 0) / scale.length : null;
  const promoters = nps.filter((v) => v >= 9).length, detractors = nps.filter((v) => v <= 6).length;
  const passives = nps.length - promoters - detractors;
  const enps = nps.length ? Math.round(((promoters - detractors) / nps.length) * 100) : null;
  return { avg, enps, promoters, passives, detractors, npsCount: nps.length, count: responses.length };
}
export function responseAvg(r) { return surveyStats([r]).avg; }
export function responseNps(r) {
  const tpl = one('surveyTemplates', r.templateId);
  const q = tpl && tpl.questions.find((x) => x.type === 'nps');
  return q && r.answers ? r.answers[q.id] : null;
}
export function responseComment(r) {
  const tpl = one('surveyTemplates', r.templateId);
  const q = tpl && tpl.questions.find((x) => x.type === 'text');
  return (q && r.answers && r.answers[q.id]) || '';
}

// ---------- Trainings ----------
export function trainingsSorted() { return all('trainings').sort((a, b) => (a.date < b.date ? 1 : -1)); }
export function visibleTrainings() {
  const r = session.role, me = currentUserId();
  const list = trainingsSorted();
  if (r === 'employee') return list.filter((tr) => tr.participantIds.includes(me));
  if (r === 'trainer') return list.filter((tr) => tr.trainerId === me);
  if (r === 'manager') { const ids = new Set(visibleEmployees().map((e) => e.id)); return list.filter((tr) => tr.participantIds.some((p) => ids.has(p))); }
  return list;
}
export function signatureOf(trainingId, empId) {
  return one('trainingSignatures', `${trainingId}_${empId}`) || {
    id: `${trainingId}_${empId}`, trainingId, employeeId: empId, employeeSignature: null, employeeSignedAt: null,
    trainerSignature: null, trainerSignedAt: null, status: 'pending',
  };
}
export function signedCount(tr) {
  return tr.participantIds.filter((p) => signatureOf(tr.id, p).status === 'completed').length;
}
export function isEmployeeSigned(s) { return !!(s.employeeSignature || s.employeeSignedAt || s.signed); }
export async function signAsEmployee(tr, empId, dataUrl) {
  const s = signatureOf(tr.id, empId);
  if (s.status === 'completed' || isEmployeeSigned(s)) return;
  await set('trainingSignatures', s.id, { ...s, employeeSignature: dataUrl, employeeSignedAt: nowISO(), status: 'employee_signed' });
  await notify({
    type: 'training_sign', toRoles: [], toUserIds: [tr.trainerId], toEmails: [], relatedId: tr.id,
    messageAz: `${personName(empId)} "${tr.titleAz}" təlimini imzaladı — təlimçi imzası gözlənilir`,
    messageEn: `${personName(empId)} signed "${tr.titleEn}" — trainer signature pending`,
  });
}
export async function signAsTrainer(tr, empId, dataUrl) {
  const s = signatureOf(tr.id, empId);
  if (s.status === 'completed' || !isEmployeeSigned(s)) return;
  await set('trainingSignatures', s.id, { ...s, trainerSignature: dataUrl, trainerSignedAt: nowISO(), status: 'completed' });
  if (/təhlükəsizli|security/i.test(tr.titleAz + tr.titleEn)) await completeTemplateTask(empId, 't09');
}

// ---------- Toast ----------
export function toast(message, type = 'success') {
  const id = uid('t');
  session.toasts.push({ id, message, type });
  setTimeout(() => { const i = session.toasts.findIndex((x) => x.id === id); if (i >= 0) session.toasts.splice(i, 1); }, 3200);
}
