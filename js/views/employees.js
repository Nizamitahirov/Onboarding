// views/employees.js — işçilər siyahısı və "Yeni işçi" modalı
import { all } from '../db.js';
import { employeeStatus, isValidEmail } from '../utils.js';
import {
  session, visibleEmployees, departments, progressFor, overdueOf, dayInfo, fullName, personName, usersByRole, createEmployee, toast,
} from '../store.js';

export const NewEmployeeModal = {
  name: 'NewEmployeeModal',
  emits: ['close', 'created'],
  data() {
    return {
      f: { firstName: '', lastName: '', position: '', department: '', startDate: '', managerId: '', email: '', phone: '' },
      errors: {}, saving: false,
    };
  },
  computed: { depts() { return departments(); }, managers() { return usersByRole('manager'); } },
  methods: {
    validate() {
      const e = {};
      Object.entries(this.f).forEach(([k, v]) => { if (!String(v).trim()) e[k] = this.t('validation.required'); });
      if (this.f.email.trim() && !isValidEmail(this.f.email)) e.email = this.t('validation.email');
      this.errors = e;
      return Object.keys(e).length === 0;
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      try {
        const data = Object.fromEntries(Object.entries(this.f).map(([k, v]) => [k, String(v).trim()]));
        const emp = await createEmployee(data);
        toast(this.t('employees.created', { name: fullName(emp) }));
        this.$emit('created', emp);
      } catch (err) {
        toast(String(err.message || err), 'error');
      } finally { this.saving = false; }
    },
  },
  template: `
  <ui-modal :title="t('employees.newTitle')" @close="$emit('close')">
    <form class="form-grid" @submit.prevent="save" novalidate>
      <label class="field"><span>{{ t('fields.firstName') }} *</span>
        <input v-model="f.firstName" :class="{ invalid: errors.firstName }" autocomplete="given-name"><small class="error-text" v-if="errors.firstName">{{ errors.firstName }}</small></label>
      <label class="field"><span>{{ t('fields.lastName') }} *</span>
        <input v-model="f.lastName" :class="{ invalid: errors.lastName }" autocomplete="family-name"><small class="error-text" v-if="errors.lastName">{{ errors.lastName }}</small></label>
      <label class="field full"><span>{{ t('fields.position') }} *</span>
        <input v-model="f.position" :class="{ invalid: errors.position }"><small class="error-text" v-if="errors.position">{{ errors.position }}</small></label>
      <label class="field"><span>{{ t('fields.department') }} *</span>
        <select v-model="f.department" :class="{ invalid: errors.department }">
          <option value="" disabled>{{ t('common.select') }}</option>
          <option v-for="d in depts" :key="d" :value="d">{{ deptLabel(d) }}</option>
        </select><small class="error-text" v-if="errors.department">{{ errors.department }}</small></label>
      <label class="field"><span>{{ t('fields.startDate') }} *</span>
        <input type="date" v-model="f.startDate" :class="{ invalid: errors.startDate }"><small class="error-text" v-if="errors.startDate">{{ errors.startDate }}</small></label>
      <label class="field full"><span>{{ t('fields.manager') }} *</span>
        <select v-model="f.managerId" :class="{ invalid: errors.managerId }">
          <option value="" disabled>{{ t('common.select') }}</option>
          <option v-for="m in managers" :key="m.id" :value="m.id">{{ m.name }} — {{ deptLabel(m.department) }}</option>
        </select><small class="error-text" v-if="errors.managerId">{{ errors.managerId }}</small></label>
      <label class="field"><span>{{ t('fields.email') }} *</span>
        <input type="email" v-model="f.email" :class="{ invalid: errors.email }" autocomplete="email" placeholder="ad.soyad@company.az"><small class="error-text" v-if="errors.email">{{ errors.email }}</small></label>
      <label class="field"><span>{{ t('fields.phone') }} *</span>
        <input type="tel" v-model="f.phone" :class="{ invalid: errors.phone }" autocomplete="tel" placeholder="+994 50 000 00 00"><small class="error-text" v-if="errors.phone">{{ errors.phone }}</small></label>
      <p class="muted small full">ℹ️ {{ t('employees.planNote') }}</p>
      <button type="submit" hidden></button>
    </form>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ t('common.cancel') }}</button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="save">{{ t('common.save') }}</button>
    </template>
  </ui-modal>`,
};

export const EmployeeCard = {
  name: 'EmployeeCard',
  props: { emp: Object },
  computed: {
    status() { return employeeStatus(this.emp); },
    day() { return dayInfo(this.emp); },
    prog() { return progressFor(this.emp.id); },
    late() { return overdueOf(this.emp.id).length; },
  },
  methods: { fullName, personName },
  template: `
  <a class="card emp-card hover-lift" :href="'#/employee/' + emp.id">
    <div class="emp-head">
      <ui-avatar :name="fullName(emp)" :size="48"></ui-avatar>
      <div class="grow min0">
        <strong class="ellipsis block">{{ fullName(emp) }}</strong>
        <span class="muted small ellipsis block">{{ emp.position }}</span>
        <span class="muted small ellipsis block">{{ deptLabel(emp.department) }}</span>
      </div>
      <ui-status :status="status"></ui-status>
    </div>
    <div class="emp-progress">
      <div class="row-between small">
        <span v-if="status === 'preboarding'">{{ t('common.startsIn', { n: day.untilStart }) }}</span>
        <span v-else>{{ t('common.dayOf', { n: day.shown }) }}</span>
        <span>{{ prog.pct }}%</span>
      </div>
      <ui-progress :value="status === 'preboarding' ? 0 : day.pct" :label="t('common.dayOf', { n: day.shown })"></ui-progress>
      <div class="row-between small muted"><span>{{ t('common.tasksDone', { done: prog.done, total: prog.total }) }}</span></div>
    </div>
    <div class="emp-foot">
      <span class="small">🤝 {{ emp.buddyId ? personName(emp.buddyId) : t('buddy.none') }}</span>
      <span v-if="late" class="pill pill-overdue">⏰ {{ late }}</span>
    </div>
  </a>`,
};

export default {
  name: 'EmployeesView',
  components: { NewEmployeeModal, EmployeeCard },
  props: { query: Object },
  data() {
    return { q: '', status: (this.query && this.query.status) || 'all', dept: '', showNew: false };
  },
  computed: {
    isHr() { return session.role === 'hr'; },
    base() { return visibleEmployees(); },
    depts() { return [...new Set(this.base.map((e) => e.department))].sort((a, b) => a.localeCompare(b, 'az')); },
    filtered() {
      const q = this.q.trim().toLocaleLowerCase('az');
      return this.base.filter((e) => {
        if (this.status !== 'all' && employeeStatus(e) !== this.status) return false;
        if (this.dept && e.department !== this.dept) return false;
        if (!q) return true;
        return [fullName(e), e.position, e.department, e.email].join(' ').toLocaleLowerCase('az').includes(q);
      });
    },
    chips() {
      const c = { all: this.base.length, preboarding: 0, onboarding: 0, completed: 0 };
      this.base.forEach((e) => { c[employeeStatus(e)]++; });
      return c;
    },
  },
  watch: { query(v) { if (v && v.status) this.status = v.status; } },
  methods: { created(emp) { this.showNew = false; location.hash = '#/employee/' + emp.id; } },
  template: `
  <div class="page">
    <div class="page-head">
      <h1>{{ t('nav.employees') }}</h1>
      <button v-if="isHr" type="button" class="btn btn-primary" @click="showNew = true">+ {{ t('employees.new') }}</button>
    </div>
    <div class="toolbar">
      <input class="search" type="search" v-model="q" :placeholder="t('employees.search')" :aria-label="t('employees.search')">
      <select v-model="dept" :aria-label="t('fields.department')">
        <option value="">{{ t('employees.allDepts') }}</option>
        <option v-for="d in depts" :key="d" :value="d">{{ deptLabel(d) }}</option>
      </select>
    </div>
    <div class="chips" role="tablist">
      <button v-for="(n, s) in chips" :key="s" type="button" class="chip" :class="{ active: status === s }" @click="status = s" role="tab" :aria-selected="status === s">
        {{ s === 'all' ? t('common.all') : t('status.' + s) }} <span class="chip-count">{{ n }}</span>
      </button>
    </div>
    <div class="card-grid" v-if="filtered.length">
      <employee-card v-for="e in filtered" :key="e.id" :emp="e"></employee-card>
    </div>
    <ui-empty v-else icon="🔍" :text="t('employees.noResults')"></ui-empty>
    <new-employee-modal v-if="showNew" @close="showNew = false" @created="created"></new-employee-modal>
  </div>`,
};
