// views/me.js — "Mənim onboardingim" (Yeni işçi rolu)
import { one } from '../db.js';
import { TODAY, addDays, diffDays, employeeStatus, isOverdue, mailtoLink } from '../utils.js';
import {
  session, currentEmployee, tasksOf, progressFor, dayInfo, toggleTask, pendingSurveys, ackCount, sectionsSorted, visibleTrainings,
  signatureOf, isEmployeeSigned, openWindow, fullName, personName, toast,
} from '../store.js';
import { FeedbackModal } from './feedback.js';
import { profileSheets } from '../exportRows.js';

export default {
  name: 'MeView',
  components: { FeedbackModal },
  data() { return { showFeedback: false }; },
  computed: {
    emp() { return currentEmployee(); },
    status() { return employeeStatus(this.emp); },
    day() { return dayInfo(this.emp); },
    prog() { return progressFor(this.emp.id); },
    buddy() { return this.emp.buddyId ? one('users', this.emp.buddyId) : null; },
    manager() { return one('users', this.emp.managerId); },
    myTasks() {
      const horizon = addDays(TODAY, 7);
      return tasksOf(this.emp.id).filter((tk) => tk.ownerRole === 'employee' && (tk.status === 'todo' ? tk.dueDate <= horizon : tk.dueDate === TODAY));
    },
    surveys() { return pendingSurveys(this.emp); },
    ackN() { return ackCount(this.emp.id); },
    totalSections() { return sectionsSorted().length; },
    toSign() { return visibleTrainings().filter((tr) => !isEmployeeSigned(signatureOf(tr.id, this.emp.id))); },
    openWin() { return openWindow(this.emp); },
    buddyMail() {
      if (!this.buddy) return '#';
      return mailtoLink([this.buddy.email], this.t('me.buddyMailSubject'), this.t('me.buddyMailBody', { buddy: this.buddy.name.split(' ')[0], name: fullName(this.emp) }));
    },
  },
  methods: {
    isOverdue, personName,
    exportSheets() {
      return profileSheets(this.emp).filter((s) => s.name !== 'Access');
    },
    async toggle(task) { await toggleTask(task); if (task.status === 'done') toast(this.t('me.taskDone')); },
    dueLabel(task) {
      const d = diffDays(task.dueDate, TODAY);
      if (d === 0) return this.t('me.dueToday');
      if (d < 0) return this.t('common.daysLate', { n: -d });
      return this.t('me.dueIn', { n: d });
    },
  },
  template: `
  <div class="page" v-if="emp">
    <div class="banner-done" v-if="status === 'completed'" role="status">🎉 {{ t('profile.completed') }}</div>
    <section class="hero hero-me">
      <div class="grow">
        <h1>{{ t('me.welcome', { name: emp.firstName }) }}</h1>
        <p v-if="status === 'preboarding'">{{ t('me.countdown', { n: day.untilStart }) }}</p>
        <p v-else>{{ t('common.dayOf', { n: day.shown }) }}</p>
        <p class="small hero-sub">{{ emp.position }} · {{ deptLabel(emp.department) }}</p>
      </div>
      <div class="hero-side">
        <ui-ring :value="prog.pct" :size="104"></ui-ring>
        <ui-export :sheets="exportSheets" filename="my-onboarding" small></ui-export>
      </div>
    </section>

    <section class="card first-day" v-if="status === 'preboarding'">
      <div class="countdown"><span class="countdown-n">{{ day.untilStart }}</span><span class="small">{{ t('me.daysLeft') }}</span></div>
      <div class="grow">
        <h2 class="card-title">📍 {{ t('me.firstDayTitle') }} — {{ fmtDate(emp.startDate) }}</h2>
        <ul class="info-list">
          <li><strong>{{ t('me.address') }}:</strong> {{ t('me.addressValue') }}</li>
          <li><strong>{{ t('me.time') }}:</strong> {{ t('me.timeValue') }}</li>
          <li><strong>{{ t('me.meet') }}:</strong> {{ buddy ? buddy.name : (manager ? manager.name : '—') }}</li>
          <li><strong>{{ t('me.bring') }}:</strong> {{ t('me.bringValue') }}</li>
        </ul>
      </div>
    </section>

    <div class="grid-2">
      <section class="card">
        <h2 class="card-title">✅ {{ t('me.myTasks') }}</h2>
        <ul class="task-list" v-if="myTasks.length">
          <li v-for="task in myTasks" :key="task.id" class="task" :class="{ done: task.status === 'done', late: isOverdue(task) }">
            <label class="task-check">
              <input type="checkbox" :checked="task.status === 'done'" @change="toggle(task)" :aria-label="tx(task, 'title')">
              <span class="grow">{{ tx(task, 'title') }}</span>
            </label>
            <span class="task-meta"><span class="small" :class="{ 'danger-text': isOverdue(task) }">{{ dueLabel(task) }}</span></span>
          </li>
        </ul>
        <ui-empty v-else icon="🎉" :text="t('me.noTasks')"></ui-empty>
      </section>

      <section class="card">
        <h2 class="card-title">🤝 {{ t('roles.buddy') }}</h2>
        <div v-if="buddy" class="buddy-card">
          <ui-avatar :name="buddy.name" :size="56"></ui-avatar>
          <div class="grow min0"><strong>{{ buddy.name }}</strong><span class="muted small block ellipsis">{{ buddy.email }}</span></div>
          <a class="btn btn-primary btn-sm" :href="buddyMail">✉️ {{ t('me.write') }}</a>
        </div>
        <ui-empty v-else icon="🤝" :text="t('buddy.notAssignedYet')"></ui-empty>
        <p class="small muted" v-if="manager">👔 {{ t('fields.manager') }}: {{ manager.name }} · <a class="link" :href="'mailto:' + manager.email">{{ manager.email }}</a></p>
      </section>
    </div>

    <section class="card-grid">
      <a class="card hover-lift action-card" href="#/surveys">
        <span class="action-icon">📝</span><strong>{{ t('me.pendingSurveys') }}</strong>
        <span class="action-value">{{ surveys.length }}</span>
        <span class="muted small">{{ surveys.length ? surveys.map(s => t('surveys.dayN', { n: s.day })).join(', ') : t('surveys.noPending') }}</span>
      </a>
      <a class="card hover-lift action-card" href="#/handbook">
        <span class="action-icon">📘</span><strong>{{ t('me.handbookProgress') }}</strong>
        <span class="action-value">{{ ackN }}/{{ totalSections }}</span>
        <ui-progress :value="totalSections ? Math.round(ackN / totalSections * 100) : 0"></ui-progress>
      </a>
      <a class="card hover-lift action-card" href="#/trainings">
        <span class="action-icon">✍️</span><strong>{{ t('me.toSign') }}</strong>
        <span class="action-value">{{ toSign.length }}</span>
        <span class="muted small">{{ toSign.length ? toSign.map(tr => tx(tr, 'title')).join(', ') : t('me.allSigned') }}</span>
      </a>
      <button type="button" class="card hover-lift action-card" @click="showFeedback = true">
        <span class="action-icon">💬</span><strong>{{ t('me.writeFeedback') }}</strong>
        <span class="muted small">{{ openWin ? t('feedback.openWindow', { n: openWin }) : t('feedback.noOpenWindow') }}</span>
      </button>
    </section>

    <feedback-modal v-if="showFeedback" :employee-id="emp.id" @close="showFeedback = false" @created="showFeedback = false"></feedback-modal>
  </div>
  <ui-empty v-else icon="🔍" :text="t('common.notFound')"></ui-empty>`,
};
