// app.js — Vue tətbiqi, hash router və layout
import { init, dbState, cache } from './db.js';
import { i18n, t, tx, deptLabel, setLang, setTheme } from './i18n.js';
import { TODAY, formatDate, formatDateTime, TODAY_OVERRIDDEN } from './utils.js';
import {
  session, setSession, ROLES, NAV_ICONS, navFor, canAccessRoute, usersByRole, employeesSorted, fullName, visibleNotifications,
  markNotificationsRead, currentUserId, personName,
} from './store.js';
import { registerComponents } from './components.js';
import DashboardView from './views/dashboard.js';
import EmployeesView from './views/employees.js';
import ProfileView from './views/profile.js';
import AccessView from './views/access.js';
import HandbookView from './views/handbook.js';
import FeedbackView from './views/feedback.js';
import SurveysView from './views/surveys.js';
import TrainingsView, { TrainingDetail } from './views/trainings.js';
import MeView from './views/me.js';
import SettingsView from './views/settings.js';

const { createApp } = Vue;

const VIEWS = {
  dashboard: DashboardView, employees: EmployeesView, employee: ProfileView, access: AccessView, handbook: HandbookView,
  feedback: FeedbackView, surveys: SurveysView, trainings: TrainingsView, training: TrainingDetail, me: MeView, settings: SettingsView,
};

function parseHash() {
  const raw = (location.hash || '').replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const parts = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  const query = Object.fromEntries(new URLSearchParams(queryPart || ''));
  const name = parts[0] || '';
  const params = {};
  if ((name === 'employee' || name === 'training') && parts[1]) params.id = parts[1];
  return { name, params, query, path: raw };
}

const App = {
  data() { return { route: parseHash(), moreOpen: false, notifOpen: false }; },
  computed: {
    ROLES() { return ROLES; },
    nav() { return navFor().map((key) => ({ key, icon: NAV_ICONS[key], href: '#/' + key })); },
    mobileMain() { return this.nav.length > 5 ? this.nav.slice(0, 4) : this.nav; },
    mobileMore() { return this.nav.length > 5 ? this.nav.slice(4) : []; },
    activeKey() {
      const n = this.route.name;
      if (n === 'employee') return 'employees';
      if (n === 'training') return 'trainings';
      return n;
    },
    moreActive() { return this.mobileMore.some((i) => i.key === this.activeKey); },
    view() { return VIEWS[this.route.name] || null; },
    viewProps() {
      const p = { ...this.route.params };
      if (['employees', 'employee'].includes(this.route.name)) p.query = this.route.query;
      return p;
    },
    employees() { return employeesSorted(); },
    managers() { return usersByRole('manager'); },
    buddies() { return usersByRole('buddy'); },
    notifications() { return visibleNotifications(); },
    unread() { return this.notifications.filter((n) => !n.read).length; },
    who() { return personName(currentUserId()); },
  },
  created() {
    Vue.watch(() => [session.role, session.employeeId, session.managerId, session.buddyId], () => this.guard());
    window.addEventListener('hashchange', () => {
      this.route = parseHash();
      this.moreOpen = false;
      this.notifOpen = false;
      this.guard();
      window.scrollTo(0, 0);
    });
    document.addEventListener('click', (e) => {
      if (this.notifOpen && !e.target.closest('.notif-wrap')) this.notifOpen = false;
      if (this.moreOpen && !e.target.closest('.more-wrap')) this.moreOpen = false;
    });
    this.guard();
  },
  methods: {
    fullName, setLang, setTheme,
    guard() {
      const { name, params } = this.route;
      if (!VIEWS[name] || !canAccessRoute(name, params)) {
        if (name === 'employee' && session.role === 'employee' && params.id === session.employeeId) { location.replace('#/me'); return; }
        const first = navFor()[0] || 'dashboard';
        if (name !== first || !VIEWS[name]) location.replace('#/' + first);
      }
    },
    setRole(e) { setSession('role', e.target.value); },
    setSub(key, e) { setSession(key, e.target.value); },
    toggleLang() { setLang(i18n.lang === 'az' ? 'en' : 'az'); },
    toggleTheme() { setTheme(i18n.theme === 'dark' ? 'light' : 'dark'); },
    async toggleNotif() {
      this.notifOpen = !this.notifOpen;
    },
    async markAll() { await markNotificationsRead(this.notifications); },
    notifIcon(type) { return { access_request: '🔑', access_status: '🔄', buddy_assigned: '🤝', feedback_due: '💬', survey_due: '📝', training_sign: '✍️' }[type] || '🔔'; },
  },
  template: `
  <div class="app-shell">
    <header class="topbar">
      <a class="logo" href="#/" :aria-label="'Onboarding'"><span>Onboarding</span></a>
      <div class="topbar-selectors">
        <label class="select-wrap"><span class="sr-only">{{ t('top.role') }}</span>
          <span class="select-label" aria-hidden="true">{{ t('top.role') }}</span>
          <select :value="session.role" @change="setRole" :aria-label="t('top.role')">
            <option v-for="r in ROLES" :key="r" :value="r">{{ t('roles.' + r) }}</option>
          </select></label>
        <label class="select-wrap" v-if="session.role === 'employee'">
          <span class="select-label" aria-hidden="true">{{ t('top.whichEmployee') }}</span>
          <select :value="session.employeeId" @change="setSub('employeeId', $event)" :aria-label="t('top.whichEmployee')">
            <option v-for="e in employees" :key="e.id" :value="e.id">{{ fullName(e) }}</option>
          </select></label>
        <label class="select-wrap" v-if="session.role === 'manager'">
          <span class="select-label" aria-hidden="true">{{ t('top.whichManager') }}</span>
          <select :value="session.managerId" @change="setSub('managerId', $event)" :aria-label="t('top.whichManager')">
            <option v-for="u in managers" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select></label>
        <label class="select-wrap" v-if="session.role === 'buddy'">
          <span class="select-label" aria-hidden="true">{{ t('top.whichBuddy') }}</span>
          <select :value="session.buddyId" @change="setSub('buddyId', $event)" :aria-label="t('top.whichBuddy')">
            <option v-for="u in buddies" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select></label>
      </div>
      <div class="topbar-actions">
        <button type="button" class="icon-btn lang-btn" @click="toggleLang" :aria-label="t('top.language')" :title="t('top.language')">
          <span :class="{ on: i18n.lang === 'az' }">AZ</span><span class="sep">/</span><span :class="{ on: i18n.lang === 'en' }">EN</span></button>
        <button type="button" class="icon-btn" @click="toggleTheme" :aria-label="t('top.theme')" :title="t('top.theme')">{{ i18n.theme === 'dark' ? '☀️' : '🌙' }}</button>
        <div class="notif-wrap">
          <button type="button" class="icon-btn bell" @click.stop="toggleNotif" :aria-label="t('top.notifications')" :aria-expanded="notifOpen">🔔
            <span class="badge" v-if="unread">{{ unread > 99 ? '99+' : unread }}</span></button>
          <div class="notif-panel card" v-if="notifOpen" role="dialog" :aria-label="t('top.notifications')">
            <div class="row-between notif-head"><strong>{{ t('top.notifications') }}</strong>
              <button type="button" class="link-btn small" @click="markAll" v-if="unread">{{ t('top.markAllRead') }}</button></div>
            <ul v-if="notifications.length">
              <li v-for="n in notifications.slice(0, 30)" :key="n.id" :class="{ unread: !n.read }">
                <span class="notif-icon" aria-hidden="true">{{ notifIcon(n.type) }}</span>
                <span class="grow"><span class="block">{{ tx(n, 'message') }}</span>
                  <span class="muted small">{{ fmtDateTime(n.createdAt) }}</span>
                  <span class="muted small block" v-if="n.toEmails && n.toEmails.length">✉️ {{ n.toEmails.join(', ') }}</span></span>
              </li>
            </ul>
            <ui-empty v-else icon="🔕" :text="t('top.noNotifications')"></ui-empty>
          </div>
        </div>
      </div>
    </header>

    <aside class="sidebar" :aria-label="t('top.menu')">
      <nav>
        <a v-for="item in nav" :key="item.key" :href="item.href" class="nav-item" :class="{ active: activeKey === item.key }" :aria-current="activeKey === item.key ? 'page' : null">
          <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span><span>{{ t('nav.' + item.key) }}</span></a>
      </nav>
      <div class="sidebar-foot small">
        <div class="muted">{{ t('top.signedInAs') }}</div>
        <strong>{{ who }}</strong> <span class="muted">· {{ t('roles.' + session.role) }}</span>
        <div class="muted mt-sm">📅 {{ fmtDate(TODAY) }}<span v-if="todayOverridden"> (demo)</span></div>
        <div class="muted">{{ dbState.mode === 'firestore' ? '🟢 Firestore' : '🟠 ' + t('settings.demoMode') }}</div>
      </div>
    </aside>

    <main class="main" id="main">
      <component v-if="view" :is="view" v-bind="viewProps" :key="route.path + session.role + session.employeeId + session.managerId + session.buddyId"></component>
    </main>

    <nav class="bottom-nav" :aria-label="t('top.menu')">
      <a v-for="item in mobileMain" :key="item.key" :href="item.href" class="bn-item" :class="{ active: activeKey === item.key }">
        <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span><span class="bn-label">{{ t('nav.' + item.key) }}</span></a>
      <div class="more-wrap" v-if="mobileMore.length">
        <button type="button" class="bn-item" :class="{ active: moreActive || moreOpen }" @click.stop="moreOpen = !moreOpen" :aria-expanded="moreOpen">
          <span class="nav-icon" aria-hidden="true">⋯</span><span class="bn-label">{{ t('nav.more') }}</span></button>
        <div class="more-menu card" v-if="moreOpen">
          <a v-for="item in mobileMore" :key="item.key" :href="item.href" class="nav-item" :class="{ active: activeKey === item.key }">
            <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span><span>{{ t('nav.' + item.key) }}</span></a>
        </div>
      </div>
    </nav>

    <div class="toasts" aria-live="polite">
      <div v-for="x in session.toasts" :key="x.id" class="toast" :class="'toast-' + x.type">{{ x.message }}</div>
    </div>
  </div>`,
};

async function boot() {
  try {
    await init();
  } catch (e) {
    console.error(e);
  }
  const app = createApp(App);
  Object.assign(app.config.globalProperties, {
    t, tx, deptLabel, session, i18n, dbState, cache, TODAY, todayOverridden: TODAY_OVERRIDDEN,
    fmtDate: (v) => formatDate(v, i18n.lang),
    fmtDateTime: (v) => formatDateTime(v, i18n.lang),
  });
  registerComponents(app);
  const loading = document.getElementById('boot');
  if (loading) loading.remove();
  app.mount('#app');
}

boot();
