// views/profile.js — işçi profili (7 tab)
import { one } from '../db.js';
import { PHASES, TODAY, diffDays, employeeStatus, isOverdue, addDays } from '../utils.js';
import {
  session, tasksOf, progressFor, overdueOf, dayInfo, canToggleTask, toggleTask, fullName, personName, usersByRole, buddyLoad,
  assignBuddy, BUDDY_LIMIT, visibleAccessRequests, sectionsSorted, ackOf, ackCount, visibleFeedback, canWriteFeedback, WINDOWS,
  openWindow, surveyTemplatesSorted, surveyState, responseOf, responseAvg, responseNps, visibleTrainings, signatureOf, trainingsSorted,
  navFor, toast,
} from '../store.js';
import { AccessRequestModal, AccessTable } from './access.js';
import { FeedbackCard, FeedbackModal } from './feedback.js';
import { profileSheets } from '../exportRows.js';

export const BuddyModal = {
  name: 'BuddyModal',
  props: { emp: Object },
  emits: ['close', 'assigned'],
  data() { return { BUDDY_LIMIT, warn: '' }; },
  computed: {
    buddies() {
      return usersByRole('buddy').map((u) => {
        const load = buddyLoad(u.id);
        const current = this.emp.buddyId === u.id;
        return { u, load, current, full: !current && load >= BUDDY_LIMIT };
      });
    },
    anyFull() { return this.buddies.some((b) => b.full); },
  },
  methods: {
    async pick(b) {
      if (b.full) { this.warn = this.t('buddy.limitWarn', { name: b.u.name }); return; }
      if (b.current) { this.$emit('close'); return; }
      try {
        await assignBuddy(this.emp, b.u.id);
        toast(this.t('buddy.assigned', { name: b.u.name }));
        this.$emit('assigned');
      } catch (e) { this.warn = String(e.message || e); }
    },
  },
  template: `
  <ui-modal :title="t('buddy.assignTitle', { name: emp.firstName + ' ' + emp.lastName })" @close="$emit('close')">
    <p class="muted small">{{ t('buddy.rule', { n: BUDDY_LIMIT }) }}</p>
    <div class="alert alert-warning" v-if="warn" role="alert">⚠️ {{ warn }}</div>
    <ul class="list">
      <li v-for="b in buddies" :key="b.u.id" class="list-row" :class="{ 'is-full': b.full }">
        <ui-avatar :name="b.u.name" :size="40"></ui-avatar>
        <span class="grow"><strong>{{ b.u.name }}</strong> <span v-if="b.current" class="tag">{{ t('buddy.current') }}</span>
          <span class="muted small block">{{ deptLabel(b.u.department) }}</span>
          <span v-if="b.full" class="warn-text small block">⚠️ {{ t('buddy.full') }}</span></span>
        <span class="load" :class="{ full: b.load >= BUDDY_LIMIT }" :title="t('buddy.activeCount')">{{ b.load }}/{{ BUDDY_LIMIT }}</span>
        <button type="button" class="btn btn-sm" :class="b.current ? 'btn-secondary' : 'btn-primary'" :disabled="b.full" :aria-disabled="b.full" @click="pick(b)">
          {{ b.current ? t('buddy.current') : t('buddy.choose') }}</button>
      </li>
    </ul>
    <div class="alert alert-warning" v-if="anyFull && !warn">⚠️ {{ t('buddy.someFull') }}</div>
  </ui-modal>`,
};

export default {
  name: 'ProfileView',
  components: { BuddyModal, AccessRequestModal, AccessTable, FeedbackCard, FeedbackModal },
  props: { id: String, query: Object },
  data() {
    const tabs = ['plan', 'buddy', 'access', 'handbook', 'feedback', 'surveys', 'trainings'];
    return { tabs, tab: (this.query && tabs.includes(this.query.tab)) ? this.query.tab : 'plan', showBuddy: false, showAccess: false, showFeedback: false, WINDOWS, BUDDY_LIMIT };
  },
  computed: {
    emp() { return one('employees', this.id); },
    status() { return employeeStatus(this.emp); },
    day() { return dayInfo(this.emp); },
    prog() { return progressFor(this.id); },
    lateCount() { return overdueOf(this.id).length; },
    manager() { return one('users', this.emp.managerId); },
    buddy() { return this.emp.buddyId ? one('users', this.emp.buddyId) : null; },
    isHr() { return session.role === 'hr'; },
    phases() {
      const tasks = tasksOf(this.id);
      return PHASES.map((p) => {
        const list = tasks.filter((tk) => tk.phase === p.key);
        return { ...p, list, done: list.filter((x) => x.status === 'done').length };
      }).filter((p) => p.list.length);
    },
    access() { return visibleAccessRequests().filter((r) => r.employeeId === this.id); },
    canRequestAccess() { return ['hr', 'manager'].includes(session.role); },
    sections() { return sectionsSorted().map((s) => ({ s, ack: ackOf(this.id, s.id) })); },
    ackN() { return ackCount(this.id); },
    feedbackGroups() {
      const list = visibleFeedback().filter((f) => f.employeeId === this.id);
      return WINDOWS.map((w) => ({ w, list: list.filter((f) => f.window === w) }));
    },
    openWin() { return openWindow(this.emp); },
    canWrite() { return canWriteFeedback() && session.role !== 'employee'; },
    surveys() { return surveyTemplatesSorted().map((tpl) => ({ tpl, state: surveyState(this.emp, tpl), resp: responseOf(this.id, tpl.id) })); },
    trainings() { return trainingsSorted().filter((tr) => tr.participantIds.includes(this.id)).map((tr) => ({ tr, sig: signatureOf(tr.id, this.id) })); },
    trainingLinks() { return navFor().includes('trainings'); },
  },
  methods: {
    fullName, personName, canToggleTask, isOverdue, responseAvg, responseNps, buddyLoad, addDaysFn: addDays,
    async toggle(task) { await toggleTask(task); },
    exportSheets() { return profileSheets(this.emp); },
    lateDays(task) { return diffDays(TODAY, task.dueDate); },
    rangeLabel(p) { return p.from === p.to ? this.t('phases.dayN', { n: p.from }) : this.t('phases.range', { a: p.from, b: p.to }); },
    phaseDate(p) { return this.fmtDate(addDays(this.emp.startDate, p.from)); },
  },
  template: `
  <div class="page" v-if="emp">
    <div class="row-between wrap gap-sm">
      <a href="#/employees" class="back-link">← {{ t('nav.employees') }}</a>
      <ui-export :sheets="exportSheets" :filename="'employee-' + emp.firstName + '-' + emp.lastName" small></ui-export>
    </div>
    <div class="banner-done" v-if="status === 'completed'" role="status">🎉 {{ t('profile.completed') }}</div>

    <section class="card profile-head">
      <ui-avatar :name="fullName(emp)" :size="72"></ui-avatar>
      <div class="grow min0">
        <div class="row wrap gap-sm"><h1 class="h-title">{{ fullName(emp) }}</h1><ui-status :status="status"></ui-status>
          <span v-if="lateCount" class="pill pill-overdue">⏰ {{ t('profile.lateN', { n: lateCount }) }}</span></div>
        <p class="muted">{{ emp.position }} · {{ deptLabel(emp.department) }}</p>
        <div class="meta-grid small">
          <span>📅 {{ t('fields.startDate') }}: <strong>{{ fmtDate(emp.startDate) }}</strong></span>
          <span>👔 {{ t('fields.manager') }}: <strong>{{ manager ? manager.name : '—' }}</strong></span>
          <span>🤝 {{ t('roles.buddy') }}: <strong>{{ buddy ? buddy.name : t('buddy.none') }}</strong></span>
          <span>✉️ <a class="link" :href="'mailto:' + emp.email">{{ emp.email }}</a></span>
          <span>📞 {{ emp.phone }}</span>
          <span>📘 {{ t('profile.handbookN', { n: ackN, total: sections.length }) }}</span>
        </div>
      </div>
      <div class="profile-progress">
        <div class="row-between small">
          <strong v-if="status === 'preboarding'">{{ t('common.startsIn', { n: day.untilStart }) }}</strong>
          <strong v-else>{{ t('common.dayOf', { n: day.shown }) }}</strong>
          <span class="muted">{{ day.pct }}%</span>
        </div>
        <ui-progress :value="status === 'preboarding' ? 0 : day.pct"></ui-progress>
        <div class="row-between small"><strong>{{ t('profile.progress') }}</strong><span>{{ prog.pct }}% · {{ prog.done }}/{{ prog.total }}</span></div>
        <ui-progress :value="prog.pct"></ui-progress>
      </div>
    </section>

    <nav class="tabs" role="tablist">
      <button v-for="tb in tabs" :key="tb" type="button" class="tab" :class="{ active: tab === tb }" role="tab" :aria-selected="tab === tb" @click="tab = tb">{{ t('profile.tabs.' + tb) }}</button>
    </nav>

    <!-- PLAN -->
    <section v-if="tab === 'plan'" class="timeline">
      <div v-for="p in phases" :key="p.key" class="card phase">
        <div class="phase-head">
          <span class="phase-dot" :class="{ done: p.done === p.list.length }" aria-hidden="true"></span>
          <h3>{{ t('phases.' + p.key) }}</h3>
          <span class="muted small">{{ rangeLabel(p) }} · {{ phaseDate(p) }}</span>
          <span class="spacer"></span><span class="small">{{ p.done }}/{{ p.list.length }}</span>
        </div>
        <ul class="task-list">
          <li v-for="task in p.list" :key="task.id" class="task" :class="{ done: task.status === 'done', late: isOverdue(task) }">
            <label class="task-check">
              <input type="checkbox" :checked="task.status === 'done'" :disabled="!canToggleTask(task)" @change="toggle(task)" :aria-label="tx(task, 'title')">
              <span class="grow">{{ tx(task, 'title') }}</span>
            </label>
            <span class="task-meta">
              <span class="tag" :class="'role-' + task.ownerRole">{{ t('roles.' + task.ownerRole) }}</span>
              <span class="small" :class="{ 'danger-text': isOverdue(task) }">{{ fmtDate(task.dueDate) }}</span>
              <span v-if="isOverdue(task)" class="pill pill-overdue">{{ t('common.daysLate', { n: lateDays(task) }) }}</span>
            </span>
          </li>
        </ul>
      </div>
    </section>

    <!-- BUDDY -->
    <section v-if="tab === 'buddy'" class="card">
      <div v-if="buddy" class="buddy-card">
        <ui-avatar :name="buddy.name" :size="64"></ui-avatar>
        <div class="grow"><h3>{{ buddy.name }}</h3><p class="muted small">{{ deptLabel(buddy.department) }} · <a class="link" :href="'mailto:' + buddy.email">{{ buddy.email }}</a></p>
          <p class="small">{{ t('buddy.load') }}: <strong>{{ buddyLoad(buddy.id) }}/{{ BUDDY_LIMIT }}</strong></p></div>
      </div>
      <ui-empty v-else icon="🤝" :text="t('buddy.notAssigned')"></ui-empty>
      <div class="row-end" v-if="isHr"><button type="button" class="btn btn-primary" @click="showBuddy = true">{{ buddy ? t('buddy.change') : t('buddy.assign') }}</button></div>
    </section>

    <!-- ACCESS -->
    <section v-if="tab === 'access'" class="card flush">
      <div class="row-between pad wrap gap-sm"><h2 class="card-title nomargin">{{ t('profile.tabs.access') }}</h2>
        <button v-if="canRequestAccess" type="button" class="btn btn-primary" @click="showAccess = true">+ {{ t('access.newShort') }}</button></div>
      <access-table :requests="access" hide-employee></access-table>
    </section>

    <!-- HANDBOOK -->
    <section v-if="tab === 'handbook'" class="card">
      <h2 class="card-title">{{ t('profile.handbookN', { n: ackN, total: sections.length }) }}</h2>
      <ui-progress :value="sections.length ? Math.round(ackN / sections.length * 100) : 0"></ui-progress>
      <ul class="list">
        <li v-for="x in sections" :key="x.s.id" class="list-row">
          <span class="check-icon" :class="{ on: x.ack }" aria-hidden="true">{{ x.ack ? '✓' : '○' }}</span>
          <span class="grow">{{ tx(x.s, 'title') }}</span>
          <span class="small" :class="x.ack ? '' : 'muted'">{{ x.ack ? fmtDateTime(x.ack.at) : t('handbook.unread') }}</span>
        </li>
      </ul>
    </section>

    <!-- FEEDBACK -->
    <section v-if="tab === 'feedback'">
      <div class="row-between wrap gap-sm mb">
        <span class="small muted">{{ openWin ? '✅ ' + t('feedback.openWindow', { n: openWin }) : t('feedback.noOpenWindow') }}</span>
        <button v-if="canWrite" type="button" class="btn btn-primary" @click="showFeedback = true">+ {{ t('feedback.write') }}</button>
      </div>
      <div v-for="g in feedbackGroups" :key="g.w" class="fb-group">
        <h3 class="sub-title">{{ t('feedback.windowN', { n: g.w }) }} <span class="muted small">({{ g.list.length }})</span></h3>
        <div class="stack" v-if="g.list.length"><feedback-card v-for="f in g.list" :key="f.id" :f="f"></feedback-card></div>
        <p v-else class="muted small">{{ t('feedback.noneInWindow') }}</p>
      </div>
    </section>

    <!-- SURVEYS -->
    <section v-if="tab === 'surveys'" class="card">
      <ul class="list">
        <li v-for="x in surveys" :key="x.tpl.id" class="list-row">
          <span class="grow"><strong>{{ t('surveys.dayN', { n: x.tpl.day }) }}</strong>
            <span class="muted small block" v-if="x.resp">{{ fmtDate(x.resp.createdAt) }} · {{ t('surveys.avgScore') }}: {{ (responseAvg(x.resp) || 0).toFixed(1) }} · NPS: {{ responseNps(x.resp) ?? '—' }}</span>
            <span class="muted small block" v-else>{{ fmtDate(addDaysFn(emp.startDate, x.tpl.day - 1)) }}</span></span>
          <ui-status :status="x.state" kind="surveyState"></ui-status>
        </li>
      </ul>
    </section>

    <!-- TRAININGS -->
    <section v-if="tab === 'trainings'" class="card">
      <ul class="list" v-if="trainings.length">
        <li v-for="x in trainings" :key="x.tr.id" class="list-row">
          <component :is="trainingLinks ? 'a' : 'span'" :href="trainingLinks ? '#/training/' + x.tr.id : undefined" class="row-link">
            <span aria-hidden="true">🎓</span>
            <span class="grow"><strong>{{ tx(x.tr, 'title') }}</strong><span class="muted small block">{{ fmtDate(x.tr.date) }} · {{ personName(x.tr.trainerId) }}</span></span>
            <ui-status :status="x.sig.status" kind="sigStatus"></ui-status>
          </component>
        </li>
      </ul>
      <ui-empty v-else icon="🎓" :text="t('trainings.noneForEmployee')"></ui-empty>
    </section>

    <buddy-modal v-if="showBuddy" :emp="emp" @close="showBuddy = false" @assigned="showBuddy = false"></buddy-modal>
    <access-request-modal v-if="showAccess" :employee-id="emp.id" @close="showAccess = false" @created="showAccess = false"></access-request-modal>
    <feedback-modal v-if="showFeedback" :employee-id="emp.id" @close="showFeedback = false" @created="showFeedback = false"></feedback-modal>
  </div>
  <ui-empty v-else icon="🔍" :text="t('common.notFound')"></ui-empty>`,
};
