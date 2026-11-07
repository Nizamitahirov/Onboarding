// views/access.js — Access Management
import { all, one } from '../db.js';
import {
  session, visibleEmployees, visibleAccessRequests, recipientsFor, createAccessRequests, changeAccessStatus, accessMailto,
  fullName, personName, LEVELS, ACCESS_STATUSES, toast,
} from '../store.js';

export const AccessRequestModal = {
  name: 'AccessRequestModal',
  props: { employeeId: String },
  emits: ['close', 'created'],
  data() { return { LEVELS, empId: this.employeeId || '', systemIds: [], level: 'read', note: '', error: '', saving: false }; },
  computed: {
    emps() { return visibleEmployees(); },
    systems() { return all('systems').sort((a, b) => a.name.localeCompare(b.name, 'az')); },
    recipients() { return this.empId ? recipientsFor(this.empId, this.systemIds) : []; },
  },
  methods: {
    fullName,
    async save() {
      if (!this.empId) { this.error = this.t('access.errEmployee'); return; }
      if (!this.systemIds.length) { this.error = this.t('access.errSystems'); return; }
      this.saving = true;
      try {
        const created = await createAccessRequests({ employeeId: this.empId, systemIds: this.systemIds, level: this.level, note: this.note.trim() });
        toast(this.t('access.created', { n: created.length }));
        this.$emit('created', created);
      } catch (e) { toast(String(e.message || e), 'error'); } finally { this.saving = false; }
    },
  },
  template: `
  <ui-modal :title="t('access.newTitle')" wide @close="$emit('close')">
    <div class="form-stack">
      <label class="field"><span>{{ t('fields.employee') }} *</span>
        <select v-model="empId" :disabled="!!employeeId">
          <option value="" disabled>{{ t('common.select') }}</option>
          <option v-for="e in emps" :key="e.id" :value="e.id">{{ fullName(e) }} — {{ e.position }}</option>
        </select></label>
      <fieldset class="field">
        <legend>{{ t('access.systems') }} *</legend>
        <div class="check-list">
          <label v-for="s in systems" :key="s.id" class="check-row">
            <input type="checkbox" :value="s.id" v-model="systemIds">
            <span class="grow"><strong>{{ s.name }}</strong><span class="muted small block">{{ t('access.owner') }}: {{ s.ownerName }} · {{ s.ownerEmail }}</span></span>
          </label>
        </div>
      </fieldset>
      <fieldset class="field">
        <legend>{{ t('fields.level') }}</legend>
        <div class="segmented">
          <label v-for="l in LEVELS" :key="l" :class="{ active: level === l }"><input type="radio" :value="l" v-model="level">{{ t('levels.' + l) }}</label>
        </div>
      </fieldset>
      <label class="field"><span>{{ t('fields.note') }}</span><textarea v-model="note" rows="2"></textarea></label>
      <div class="recipients">
        <h4>📨 {{ t('access.whoNotified') }}</h4>
        <p class="muted small" v-if="!recipients.length">{{ t('access.pickToPreview') }}</p>
        <ul v-else>
          <li v-for="r in recipients" :key="r.email"><span class="tag">{{ t('access.rcpt.' + r.kind) }}</span> <span>{{ r.name }}</span> <span class="muted small">&lt;{{ r.email }}&gt;</span></li>
        </ul>
        <p class="muted small" v-if="systemIds.length > 1">{{ t('access.separateNote', { n: systemIds.length }) }}</p>
      </div>
      <p class="error-text" v-if="error">{{ error }}</p>
    </div>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ t('common.cancel') }}</button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="save">{{ t('access.create') }}</button>
    </template>
  </ui-modal>`,
};

export const RejectModal = {
  name: 'RejectModal',
  emits: ['close', 'confirm'],
  data() { return { reason: '', error: '' }; },
  methods: { ok() { if (!this.reason.trim()) { this.error = this.t('access.reasonRequired'); return; } this.$emit('confirm', this.reason.trim()); } },
  template: `
  <ui-modal :title="t('access.rejectTitle')" @close="$emit('close')">
    <label class="field"><span>{{ t('access.reason') }} *</span><textarea v-model="reason" rows="3" :class="{ invalid: error }"></textarea></label>
    <p class="error-text" v-if="error">{{ error }}</p>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ t('common.cancel') }}</button>
      <button type="button" class="btn btn-danger" @click="ok">{{ t('access.reject') }}</button>
    </template>
  </ui-modal>`,
};

/** Sorğuların cədvəli (mobildə kartlara çevrilir) — həm Access ekranında, həm profildə istifadə olunur */
export const AccessTable = {
  name: 'AccessTable',
  components: { RejectModal },
  props: { requests: Array, hideEmployee: Boolean },
  data() { return { rejecting: null, openHistory: {} }; },
  computed: { isIt() { return session.role === 'it'; } },
  methods: {
    fullName, personName, accessMailto,
    emp(id) { return one('employees', id); },
    sys(id) { return one('systems', id) || { name: id }; },
    async setStatus(r, status, reason) {
      try { await changeAccessStatus(r, status, reason); toast(this.t('access.statusChanged', { status: this.t('accessStatus.' + status) })); } catch (e) { toast(String(e.message || e), 'error'); }
    },
    async doReject(reason) { const r = this.rejecting; this.rejecting = null; await this.setStatus(r, 'rejected', reason); },
    toggleHistory(id) { this.openHistory = { ...this.openHistory, [id]: !this.openHistory[id] }; },
  },
  template: `
  <div>
    <table class="rtable" v-if="requests.length">
      <thead><tr>
        <th v-if="!hideEmployee">{{ t('fields.employee') }}</th><th>{{ t('fields.system') }}</th><th>{{ t('fields.level') }}</th>
        <th>{{ t('fields.requestedBy') }}</th><th>{{ t('fields.date') }}</th><th>{{ t('fields.status') }}</th><th>{{ t('access.actions') }}</th>
      </tr></thead>
      <tbody>
        <tr v-for="r in requests" :key="r.id">
          <td v-if="!hideEmployee" :data-label="t('fields.employee')"><a :href="'#/employee/' + r.employeeId" class="link">{{ fullName(emp(r.employeeId)) }}</a></td>
          <td :data-label="t('fields.system')"><strong>{{ sys(r.systemId).name }}</strong><span v-if="r.note" class="muted small block">{{ r.note }}</span></td>
          <td :data-label="t('fields.level')">{{ t('levels.' + r.level) }}</td>
          <td :data-label="t('fields.requestedBy')">{{ personName(r.requestedBy) }}</td>
          <td :data-label="t('fields.date')">{{ fmtDate(r.createdAt) }}</td>
          <td :data-label="t('fields.status')">
            <button type="button" class="pill-btn" @click="toggleHistory(r.id)" :aria-expanded="!!openHistory[r.id]" :title="t('access.history')">
              <ui-status :status="r.status" kind="accessStatus"></ui-status> <span class="muted small">🕘</span>
            </button>
            <ol class="history" v-if="openHistory[r.id]">
              <li v-for="(h, i) in r.history" :key="i"><strong>{{ t('accessStatus.' + h.status) }}</strong> · {{ fmtDateTime(h.at) }} · {{ personName(h.by) }}<span v-if="h.reason" class="block muted">“{{ h.reason }}”</span></li>
            </ol>
          </td>
          <td :data-label="t('access.actions')">
            <div class="actions">
              <template v-if="isIt">
                <button v-if="r.status === 'pending'" type="button" class="btn btn-sm btn-primary" @click="setStatus(r, 'approved')">{{ t('access.approve') }}</button>
                <button v-if="r.status === 'approved'" type="button" class="btn btn-sm btn-primary" @click="setStatus(r, 'granted')">{{ t('access.grant') }}</button>
                <button v-if="r.status === 'pending' || r.status === 'approved'" type="button" class="btn btn-sm btn-secondary" @click="rejecting = r">{{ t('access.reject') }}</button>
              </template>
              <a class="btn btn-sm btn-ghost" :href="accessMailto(r)">✉️ {{ t('access.email') }}</a>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <ui-empty v-else icon="🔑" :text="t('access.empty')"></ui-empty>
    <reject-modal v-if="rejecting" @close="rejecting = null" @confirm="doReject"></reject-modal>
  </div>`,
};

export default {
  name: 'AccessView',
  components: { AccessRequestModal, AccessTable },
  data() { return { tab: 'all', showNew: false }; },
  computed: {
    canCreate() { return ['hr', 'manager'].includes(session.role); },
    base() { return visibleAccessRequests(); },
    tabs() {
      const c = { all: this.base.length };
      ACCESS_STATUSES.forEach((s) => { c[s] = this.base.filter((r) => r.status === s).length; });
      return c;
    },
    rows() { return this.tab === 'all' ? this.base : this.base.filter((r) => r.status === this.tab); },
  },
  template: `
  <div class="page">
    <div class="page-head">
      <h1>{{ t('access.title') }}</h1>
      <button v-if="canCreate" type="button" class="btn btn-primary" @click="showNew = true">+ {{ t('access.new') }}</button>
    </div>
    <div class="chips" role="tablist">
      <button v-for="(n, s) in tabs" :key="s" type="button" class="chip" :class="{ active: tab === s }" @click="tab = s" role="tab" :aria-selected="tab === s">
        {{ s === 'all' ? t('common.all') : t('accessStatus.' + s) }} <span class="chip-count">{{ n }}</span>
      </button>
    </div>
    <section class="card flush"><access-table :requests="rows"></access-table></section>
    <access-request-modal v-if="showNew" @close="showNew = false" @created="showNew = false"></access-request-modal>
  </div>`,
};
