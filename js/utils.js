// utils.js — tarix hesablamaları, status, proqres, mailto və kiçik köməkçilər

const pad = (n) => String(n).padStart(2, '0');

export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(s) {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function resolveToday() {
  try {
    const p = new URLSearchParams(window.location.search).get('today');
    if (p && /^\d{4}-\d{2}-\d{2}$/.test(p) && !isNaN(parseDate(p))) return p;
  } catch (e) { /* ignore */ }
  return toISODate(new Date());
}

/** Sabit "bu gün" tarixi. Demo üçün URL ilə dəyişmək olar: ?today=2026-11-07 */
export const TODAY = resolveToday();
export const TODAY_OVERRIDDEN = TODAY !== toISODate(new Date());

export function addDays(s, n) {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** a − b (gün ilə) */
export function diffDays(a, b) {
  return Math.round((parseDate(a) - parseDate(b)) / 86400000);
}

/** dayNumber = bu gün − startDate + 1 */
export function dayNumber(startDate, today = TODAY) {
  return diffDays(today, startDate) + 1;
}

export const TOTAL_DAYS = 180;

export function employeeStatus(emp, today = TODAY) {
  if (!emp) return 'preboarding';
  if (today < emp.startDate) return 'preboarding';
  return dayNumber(emp.startDate, today) > TOTAL_DAYS ? 'completed' : 'onboarding';
}

export function isActiveStatus(status) {
  return status === 'preboarding' || status === 'onboarding';
}

/** Mərhələlər: dayOffset = tarix − startDate */
export const PHASES = [
  { key: 'preboarding', from: -14, to: -1 },
  { key: 'day1', from: 0, to: 0 },
  { key: 'week1', from: 1, to: 7 },
  { key: 'month1', from: 8, to: 30 },
  { key: 'month3', from: 31, to: 90 },
  { key: 'month6', from: 91, to: 180 },
];

export function phaseForOffset(offset) {
  if (offset < 0) return 'preboarding';
  const p = PHASES.find((ph) => offset >= ph.from && offset <= ph.to);
  return p ? p.key : 'month6';
}

/** İşçinin hazırkı mərhələsi (tamamlanıbsa 'completed') */
export function currentPhase(emp, today = TODAY) {
  if (employeeStatus(emp, today) === 'completed') return 'completed';
  return phaseForOffset(diffDays(today, emp.startDate));
}

export function isOverdue(task, today = TODAY) {
  return task.status === 'todo' && task.dueDate < today;
}

export function progressOf(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function nowISO() {
  const now = new Date();
  if (!TODAY_OVERRIDDEN) return now.toISOString();
  return `${TODAY}T${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}Z`;
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toLocaleUpperCase('az');
}

export function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());
}

export function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

export function mailtoLink(to, subject, body) {
  const recipients = unique(to).map((e) => encodeURIComponent(e)).join(',');
  return `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** ISO həftəsinin bazar ertəsi */
export function weekStart(s = TODAY) {
  const d = parseDate(s);
  const dow = (d.getDay() + 6) % 7; // 0 = B.e.
  d.setDate(d.getDate() - dow);
  return toISODate(d);
}

// ---------- Tarix formatı ----------
const AZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const fmtCache = {};
function getFmt(lang, withTime) {
  const key = lang + withTime;
  if (!fmtCache[key]) {
    const locale = lang === 'az' ? 'az' : 'en-GB';
    const opts = { day: 'numeric', month: lang === 'az' ? 'long' : 'short', year: 'numeric' };
    if (withTime) Object.assign(opts, { hour: '2-digit', minute: '2-digit', hour12: false });
    const f = new Intl.DateTimeFormat(locale, opts);
    // Bəzi brauzerlərdə "az" lokal datası yoxdur (məs. "2026 M11 16") — nəticəni yoxlayırıq
    const native = lang !== 'az' || /noyabr/i.test(f.format(new Date(2026, 10, 16)));
    fmtCache[key] = { f, native };
  }
  return fmtCache[key];
}

export function formatDate(value, lang = 'az') {
  if (!value) return '—';
  const d = String(value).length <= 10 ? parseDate(value) : new Date(value);
  if (isNaN(d)) return '—';
  const { f, native } = getFmt(lang, false);
  if (native) return f.format(d);
  return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value, lang = 'az') {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  const { f, native } = getFmt(lang, true);
  if (native) return f.format(d);
  return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
