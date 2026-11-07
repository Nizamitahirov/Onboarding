// chatContext.js — NextGen üçün kontekst: yalnız cari rolun görə bildiyi data (yığcam mətn)
import { one } from './db.js';
import { i18n, t, tx, deptLabel } from './i18n.js';
import { TODAY, employeeStatus, isOverdue, diffDays, formatDate } from './utils.js';
import {
  session, currentUserId, currentEmployee, visibleEmployees, progressFor, overdueOf, dayInfo, fullName, personName, personEmail,
  ackCount, ackOf, sectionsSorted, tasksOf, visibleAccessRequests, visibleFeedback, surveyStats, pendingSurveys, visibleTrainings,
  signatureOf, isEmployeeSigned, openWindow, BUDDY_LIMIT, buddyLoad, usersByRole,
} from './store.js';
import { all } from './db.js';

const MAX = 15000;
const d = (v) => formatDate(v, i18n.lang);

function empLine(e) {
  const st = employeeStatus(e), day = dayInfo(e), p = progressFor(e.id);
  const when = st === 'preboarding' ? `starts in ${day.untilStart}d` : `day ${day.shown}/180`;
  return `- ${fullName(e)} | ${e.position} | ${deptLabel(e.department)} | ${t('status.' + st)} | start ${d(e.startDate)} (${when}) | progress ${p.pct}% (${p.done}/${p.total}) | overdue ${overdueOf(e.id).length} | manager ${personName(e.managerId)} | buddy ${e.buddyId ? personName(e.buddyId) : 'none'} | handbook ${ackCount(e.id)}/${sectionsSorted().length}`;
}

function handbookBlock() {
  return sectionsSorted().map((s) => `## ${tx(s, 'title')}\n${tx(s, 'content')}`).join('\n\n');
}

function staffContext() {
  const emps = visibleEmployees();
  const ids = new Set(emps.map((e) => e.id));
  const out = [];
  out.push(`EMPLOYEES (${emps.length}):`, ...emps.map(empLine));

  const overdue = emps.flatMap((e) => overdueOf(e.id).map((tk) => ({ e, tk }))).sort((a, b) => (a.tk.dueDate < b.tk.dueDate ? -1 : 1));
  out.push('', `OVERDUE TASKS (${overdue.length}):`, ...overdue.slice(0, 40).map(({ e, tk }) => `- ${fullName(e)}: "${tx(tk, 'title')}" owner ${t('roles.' + tk.ownerRole)}, due ${d(tk.dueDate)} (${diffDays(TODAY, tk.dueDate)} days late)`));

  // Hər işçinin növbəti 3 açıq tapşırığı
  out.push('', 'NEXT OPEN TASKS PER EMPLOYEE:');
  emps.filter((e) => employeeStatus(e) !== 'completed').forEach((e) => {
    const next = tasksOf(e.id).filter((tk) => tk.status === 'todo' && !isOverdue(tk)).slice(0, 3);
    if (next.length) out.push(`- ${fullName(e)}: ` + next.map((tk) => `"${tx(tk, 'title')}" (${t('roles.' + tk.ownerRole)}, ${d(tk.dueDate)})`).join('; '));
  });

  if (['hr', 'manager', 'it'].includes(session.role)) {
    const reqs = visibleAccessRequests();
    out.push('', `ACCESS REQUESTS (${reqs.length}):`, ...reqs.slice(0, 40).map((r) => {
      const sys = one('systems', r.systemId); const last = (r.history || [])[r.history.length - 1];
      return `- ${personName(r.employeeId)} → ${sys ? sys.name : r.systemId} (${t('levels.' + r.level)}), ${t('accessStatus.' + r.status)}${last && last.reason ? ` — reason: ${last.reason}` : ''}, requested by ${personName(r.requestedBy)} on ${d(r.createdAt)}`;
    }));
    out.push('', 'SYSTEMS (owner):', ...all('systems').map((s) => `- ${s.name}: ${s.ownerName} <${s.ownerEmail}>${(s.notifyEmails || []).length ? ', notify ' + s.notifyEmails.join(', ') : ''}`));
  }

  if (['hr', 'manager'].includes(session.role)) {
    const s = surveyStats(all('surveyResponses').filter((r) => ids.has(r.employeeId)));
    out.push('', `SURVEYS: ${s.count} responses, average score ${s.avg == null ? 'n/a' : s.avg.toFixed(2)}/5, eNPS ${s.enps == null ? 'n/a' : s.enps} (promoters ${s.promoters}, passives ${s.passives}, detractors ${s.detractors}).`);
    const missing = emps.flatMap((e) => pendingSurveys(e).map((tpl) => `${fullName(e)} (day ${tpl.day})`));
    if (missing.length) out.push(`Pending surveys: ${missing.join(', ')}`);
  }

  if (['hr', 'manager', 'buddy'].includes(session.role)) {
    const fb = visibleFeedback();
    out.push('', `FEEDBACK (${fb.length}):`, ...fb.slice(0, 25).map((f) => `- ${f.window}-day: ${personName(f.fromId)} (${f.fromRole}) → ${personName(f.toId)} (${f.toRole}), ${f.rating}/5. Strengths: ${f.strengths}. Improve: ${f.improvements}.${f.toRole === 'employee' ? (f.sharedWithEmployee ? ' [shared with employee]' : ' [not shared]') : ''}`));
    const open = emps.map((e) => [e, openWindow(e)]).filter(([, w]) => w);
    if (open.length) out.push('Open feedback windows: ' + open.map(([e, w]) => `${fullName(e)} (${w}-day)`).join(', '));
  }

  if (session.role === 'hr') {
    out.push('', `BUDDIES (limit ${BUDDY_LIMIT} active employees):`, ...usersByRole('buddy').map((u) => `- ${u.name} (${deptLabel(u.department)}): ${buddyLoad(u.id)}/${BUDDY_LIMIT}`));
  }

  const trs = visibleTrainings();
  if (trs.length && session.role !== 'buddy') {
    out.push('', 'TRAININGS:', ...trs.map((tr) => `- ${tx(tr, 'title')} on ${d(tr.date)}, trainer ${personName(tr.trainerId)}: ` +
      tr.participantIds.map((p) => `${personName(p)} [${t('sigStatus.' + signatureOf(tr.id, p).status)}]`).join(', ')));
  }
  return out;
}

function employeeContext(e) {
  const st = employeeStatus(e), day = dayInfo(e), p = progressFor(e.id);
  const out = [];
  out.push('MY PROFILE:', empLine(e), `email ${e.email}, phone ${e.phone}`);
  if (st === 'preboarding') out.push(`I start in ${day.untilStart} days. First day: ${t('me.addressValue')}; ${t('me.timeValue')}; bring: ${t('me.bringValue')}.`);
  const mgr = one('users', e.managerId);
  if (mgr) out.push(`My manager: ${mgr.name} <${mgr.email}>`);
  if (e.buddyId) out.push(`My buddy: ${personName(e.buddyId)} <${personEmail(e.buddyId)}>`);
  else out.push('My buddy: not assigned yet');
  const tasks = tasksOf(e.id);
  out.push('', `MY PLAN (${p.done}/${p.total} done, ${p.pct}%):`, ...tasks.map((tk) => `- [${tk.status === 'done' ? 'x' : isOverdue(tk) ? 'OVERDUE' : ' '}] ${tx(tk, 'title')} — ${t('phases.' + tk.phase)}, owner ${t('roles.' + tk.ownerRole)}, due ${d(tk.dueDate)}`));
  const ps = pendingSurveys(e);
  out.push('', `PENDING SURVEYS: ${ps.length ? ps.map((x) => `day ${x.day}`).join(', ') : 'none'}`);
  const w = openWindow(e);
  out.push(`FEEDBACK WINDOW: ${w ? `${w}-day window is open` : 'none open now (windows open on days 30/90/180 for 14 days)'}`);
  const mine = visibleFeedback().filter((f) => f.toId === e.id);
  if (mine.length) out.push('Feedback shared with me:', ...mine.map((f) => `- ${f.window}-day from ${personName(f.fromId)}: ${f.rating}/5. Strengths: ${f.strengths}. Improve: ${f.improvements}.`));
  const trs = visibleTrainings();
  out.push('', 'MY TRAININGS:', ...(trs.length ? trs.map((tr) => { const s = signatureOf(tr.id, e.id); return `- ${tx(tr, 'title')} on ${d(tr.date)}: ${t('sigStatus.' + s.status)}${isEmployeeSigned(s) ? '' : ' — I still need to sign it on the Trainings page'}`; }) : ['- none']));
  out.push('', 'HANDBOOK READ STATUS: ' + sectionsSorted().map((s) => `${tx(s, 'title')} ${ackOf(e.id, s.id) ? '✓' : '✗'}`).join(', '));
  return out;
}

export function buildChatContext() {
  const role = session.role;
  const head = [
    `TODAY: ${d(TODAY)} (${TODAY})`,
    `CURRENT USER: ${personName(currentUserId())}, role: ${t('roles.' + role)} (${role})`,
    `UI LANGUAGE: ${i18n.lang === 'en' ? 'English' : 'Azerbaijani'}`,
    'Statuses: pre-boarding (before start), onboarding (days 1–180), completed (after day 180). Buddy limit: 3 active employees.',
    '',
  ];
  const emp = currentEmployee();
  const body = role === 'employee' ? (emp ? employeeContext(emp) : ['(employee not found)']) : (role === 'trainer' ? trainerContext() : staffContext());
  let text = [...head, ...body].join('\n');
  const hb = `\n\nEMPLOYEE HANDBOOK:\n${handbookBlock()}`;
  if (text.length + hb.length > MAX) text = text.slice(0, Math.max(2000, MAX - hb.length - 20)) + '\n…(truncated)';
  return text + hb;
}

function trainerContext() {
  const trs = visibleTrainings();
  return ['MY TRAININGS:', ...trs.map((tr) => `- ${tx(tr, 'title')} on ${d(tr.date)}: ` + tr.participantIds.map((p) => {
    const s = signatureOf(tr.id, p);
    return `${personName(p)} [${t('sigStatus.' + s.status)}${s.status === 'employee_signed' ? ' — waiting for my trainer signature' : ''}]`;
  }).join(', '))];
}
