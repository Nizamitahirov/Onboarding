// views/dashboard.js — HR və Menecer paneli
import { cache } from '../db.js';
import { TODAY, PHASES, diffDays, employeeStatus, currentPhase, weekStart, addDays } from '../utils.js';
import { employeeRows, taskRows } from '../exportRows.js';
import { visibleEmployees, overdueOf, surveyStats, fullName, currentName, session } from '../store.js';

export default {
  name: 'DashboardView',
  computed: {
    emps() { return visibleEmployees(); },
    greeting() {
      const h = new Date().getHours();
      return this.t(h < 12 ? 'dashboard.morning' : h < 18 ? 'dashboard.afternoon' : 'dashboard.evening', { name: currentName() });
    },
    counts() {
      const c = { preboarding: 0, onboarding: 0, completed: 0 };
      this.emps.forEach((e) => { c[employeeStatus(e)]++; });
      return c;
    },
    overdue() {
      return this.emps.flatMap((e) => overdueOf(e.id).map((task) => ({ task, emp: e, days: diffDays(TODAY, task.dueDate) })))
        .sort((a, b) => b.days - a.days);
    },
    pendingAccess() {
      const ids = new Set(this.emps.map((e) => e.id));
      return Object.values(cache.accessRequests).filter((r) => r.status === 'pending' && ids.has(r.employeeId)).length;
    },
    survey() {
      const ids = new Set(this.emps.map((e) => e.id));
      return surveyStats(Object.values(cache.surveyResponses).filter((r) => ids.has(r.employeeId)));
    },
    kpis() {
      const s = this.survey;
      return [
        { key: 'preboarding', icon: '🧳', value: this.counts.preboarding, href: '#/employees?status=preboarding' },
        { key: 'active', icon: '🚀', value: this.counts.onboarding, href: '#/employees?status=onboarding' },
        { key: 'completed', icon: '🎉', value: this.counts.completed, href: '#/employees?status=completed' },
        { key: 'overdue', icon: '⏰', value: this.overdue.length, danger: this.overdue.length > 0, href: '#overdue' },
        { key: 'pendingAccess', icon: '🔑', value: this.pendingAccess, href: '#/access' },
        { key: 'survey', icon: '⭐', value: (s.avg == null ? '—' : s.avg.toFixed(1)) + ' / ' + (s.enps == null ? '—' : (s.enps > 0 ? '+' : '') + s.enps), href: session.role === 'hr' ? '#/surveys' : null },
      ];
    },
    week() { const start = weekStart(TODAY); return { start, end: addDays(start, 6) }; },
    weekStarters() { return this.emps.filter((e) => e.startDate >= this.week.start && e.startDate <= this.week.end).sort((a, b) => (a.startDate < b.startDate ? -1 : 1)); },
    upcoming() {
      const limit = addDays(TODAY, 30);
      return this.emps.filter((e) => e.startDate > this.week.end && e.startDate <= limit).sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
    },
    phases() {
      const keys = [...PHASES.map((p) => p.key), 'completed'];
      const counts = Object.fromEntries(keys.map((k) => [k, 0]));
      this.emps.forEach((e) => { counts[currentPhase(e)]++; });
      const max = Math.max(1, ...Object.values(counts));
      return keys.map((k) => ({ key: k, count: counts[k], pct: Math.round((counts[k] / max) * 100) }));
    },
  },
  methods: {
    fullName,
    exportSheets() {
      const kv = this.kpis.map((k) => ({ [this.t('export.metric')]: this.t('dashboard.kpi.' + k.key), [this.t('export.value')]: k.value }));
      const s = this.survey;
      kv.push({ [this.t('export.metric')]: this.t('surveys.avgScore'), [this.t('export.value')]: s.avg == null ? '' : Math.round(s.avg * 10) / 10 });
      kv.push({ [this.t('export.metric')]: 'eNPS', [this.t('export.value')]: s.enps == null ? '' : s.enps });
      return [
        { name: this.t('export.sheetKpi'), rows: kv },
        { name: this.t('export.sheetEmployees'), rows: employeeRows(this.emps) },
        { name: this.t('export.sheetOverdue'), rows: taskRows(this.overdue.map((o) => o.task), true) },
        { name: this.t('export.sheetPhases'), rows: this.phases.map((p) => ({ [this.t('export.phase')]: this.t('phases.' + p.key), [this.t('export.value')]: p.count })) },
      ];
    },
    go(href) { if (!href) return; if (href === '#overdue') { const el = document.getElementById('overdue'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else location.hash = href; } },
  template: `
  <div class="page">
    <section class="hero">
      <div>
        <h1>{{ greeting }}</h1>
        <p>{{ t('dashboard.today') }}: {{ fmtDate(TODAY) }}</p>
      </div>
      <div class="hero-side">
        <div class="hero-badge">{{ emps.length }} {{ t('dashboard.employeesTracked') }}</div>
        <ui-export :sheets="exportSheets" filename="dashboard"></ui-export>
      </div>
    </section>

    <section class="kpi-grid">
      <button type="button" v-for="k in kpis" :key="k.key" class="card kpi" :class="{ danger: k.danger, clickable: !!k.href }" @click="go(k.href)">
        <span class="kpi-icon" aria-hidden="true">{{ k.icon }}</span>
        <span class="kpi-value">{{ k.value }}</span>
        <span class="kpi-label">{{ t('dashboard.kpi.' + k.key) }}</span>
      </button>
    </section>

    <div class="grid-2">
      <section class="card">
        <h2 class="card-title">{{ t('dashboard.thisWeek') }}</h2>
        <ul class="list" v-if="weekStarters.length">
          <li v-for="e in weekStarters" :key="e.id" class="list-row">
            <a :href="'#/employee/' + e.id" class="row-link">
              <ui-avatar :name="fullName(e)" :size="40"></ui-avatar>
              <span class="grow"><strong>{{ fullName(e) }}</strong><span class="muted small block">{{ e.position }}</span></span>
              <span class="small">{{ fmtDate(e.startDate) }}</span>
            </a>
          </li>
        </ul>
        <ui-empty v-else icon="📅" :text="t('dashboard.noStarters')"></ui-empty>
        <template v-if="upcoming.length">
          <h3 class="sub-title">{{ t('dashboard.upcoming') }}</h3>
          <ul class="list">
            <li v-for="e in upcoming" :key="e.id" class="list-row">
              <a :href="'#/employee/' + e.id" class="row-link">
                <ui-avatar :name="fullName(e)" :size="40"></ui-avatar>
                <span class="grow"><strong>{{ fullName(e) }}</strong><span class="muted small block">{{ e.position }}</span></span>
                <span class="small">{{ fmtDate(e.startDate) }}</span>
              </a>
            </li>
          </ul>
        </template>
      </section>

      <section class="card" id="overdue">
        <h2 class="card-title">{{ t('dashboard.overdueTasks') }} <span class="pill pill-overdue" v-if="overdue.length">{{ overdue.length }}</span></h2>
        <ul class="list scroll" v-if="overdue.length">
          <li v-for="o in overdue" :key="o.task.id" class="list-row">
            <a :href="'#/employee/' + o.emp.id" class="row-link">
              <span class="dot dot-danger" aria-hidden="true"></span>
              <span class="grow"><strong>{{ tx(o.task, 'title') }}</strong><span class="muted small block">{{ fullName(o.emp) }} · {{ t('roles.' + o.task.ownerRole) }}</span></span>
              <span class="pill pill-overdue">{{ t('common.daysLate', { n: o.days }) }}</span>
            </a>
          </li>
        </ul>
        <ui-empty v-else icon="✅" :text="t('dashboard.noOverdue')"></ui-empty>
      </section>
    </div>

    <section class="card">
      <h2 class="card-title">{{ t('dashboard.phaseDist') }}</h2>
      <div class="bars">
        <div v-for="p in phases" :key="p.key" class="bar-row">
          <span class="bar-label">{{ t('phases.' + p.key) }}</span>
          <span class="bar-track"><span class="bar-fill" :style="{ width: p.pct + '%' }"></span></span>
          <span class="bar-value">{{ p.count }}</span>
        </div>
      </div>
    </section>
  </div>`,
};
