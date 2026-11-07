// views/feedback.js — qarşılıqlı rəy
import { one, update } from '../db.js';
import {
  session, visibleFeedback, feedbackTargets, canWriteFeedback, createFeedback, openWindow, personName, fullName, visibleEmployees, WINDOWS, toast,
} from '../store.js';

export const FeedbackCard = {
  name: 'FeedbackCard',
  props: { f: Object, showEmployee: Boolean },
  computed: {
    isHr() { return session.role === 'hr'; },
    aboutEmployee() { return this.f.toRole === 'employee'; },
  },
  methods: {
    personName,
    async toggleShare() {
      await update('feedback', this.f.id, { sharedWithEmployee: !this.f.sharedWithEmployee });
      toast(this.t(this.f.sharedWithEmployee ? 'feedback.shared' : 'feedback.unshared'));
    },
  },
  template: `
  <article class="card fb-card">
    <div class="row-between wrap gap-sm">
      <div class="fb-who">
        <ui-avatar :name="personName(f.fromId)" :size="36"></ui-avatar>
        <span><strong>{{ personName(f.fromId) }}</strong> <span class="muted small">({{ t('roles.' + f.fromRole) }})</span>
          <span class="muted"> → </span><strong>{{ personName(f.toId) }}</strong> <span class="muted small">({{ t('roles.' + f.toRole) }})</span></span>
      </div>
      <span class="tag">{{ t('feedback.windowN', { n: f.window }) }}</span>
    </div>
    <ui-stars :model-value="f.rating" readonly :label="t('feedback.rating')"></ui-stars>
    <dl class="fb-text">
      <dt>💪 {{ t('feedback.strengths') }}</dt><dd>{{ f.strengths || '—' }}</dd>
      <dt>🌱 {{ t('feedback.improvements') }}</dt><dd>{{ f.improvements || '—' }}</dd>
    </dl>
    <div class="row-between wrap gap-sm small muted">
      <span>{{ fmtDateTime(f.createdAt) }}<template v-if="showEmployee"> · {{ t('fields.employee') }}: {{ personName(f.employeeId) }}</template></span>
      <label v-if="isHr && aboutEmployee" class="switch">
        <input type="checkbox" :checked="f.sharedWithEmployee" @change="toggleShare">
        <span class="switch-track" aria-hidden="true"></span><span>{{ t('feedback.shareWithEmployee') }}</span>
      </label>
      <span v-else-if="aboutEmployee" class="small">{{ f.sharedWithEmployee ? '👁 ' + t('feedback.visibleToEmployee') : '🔒 ' + t('feedback.hiddenFromEmployee') }}</span>
    </div>
  </article>`,
};

export const FeedbackModal = {
  name: 'FeedbackModal',
  props: { employeeId: String },
  emits: ['close', 'created'],
  data() {
    const targets = feedbackTargets();
    const pre = targets.find((x) => !this.employeeId || x.employeeId === this.employeeId) || targets[0];
    const emp = pre ? one('employees', pre.employeeId) : null;
    return {
      WINDOWS, targets, target: pre ? this.key(pre) : '',
      window: (emp && openWindow(emp)) || 30, rating: 0, strengths: '', improvements: '', error: '', saving: false,
    };
  },
  computed: {
    selected() { return this.targets.find((x) => this.key(x) === this.target) || null; },
    selectedEmp() { return this.selected ? one('employees', this.selected.employeeId) : null; },
    open() { return this.selectedEmp ? openWindow(this.selectedEmp) : null; },
  },
  watch: { target() { if (this.open) this.window = this.open; } },
  methods: {
    personName,
    key(x) { return `${x.toRole}:${x.toId}:${x.employeeId}`; },
    label(x) { return `${personName(x.toId)} (${this.t('roles.' + x.toRole)})`; },
    async save() {
      if (!this.selected) { this.error = this.t('feedback.errTarget'); return; }
      if (!this.rating) { this.error = this.t('feedback.errRating'); return; }
      if (!this.strengths.trim() || !this.improvements.trim()) { this.error = this.t('feedback.errText'); return; }
      this.saving = true;
      try {
        const f = await createFeedback({ ...this.selected, window: Number(this.window), rating: this.rating, strengths: this.strengths.trim(), improvements: this.improvements.trim() });
        toast(this.t('feedback.created'));
        this.$emit('created', f);
      } catch (e) { toast(String(e.message || e), 'error'); } finally { this.saving = false; }
    },
  },
  template: `
  <ui-modal :title="t('feedback.write')" @close="$emit('close')">
    <div class="form-stack" v-if="targets.length">
      <label class="field"><span>{{ t('feedback.to') }} *</span>
        <select v-model="target">
          <option v-for="x in targets" :key="key(x)" :value="key(x)">{{ label(x) }}</option>
        </select></label>
      <fieldset class="field"><legend>{{ t('feedback.window') }}</legend>
        <div class="segmented">
          <label v-for="w in WINDOWS" :key="w" :class="{ active: Number(window) === w }"><input type="radio" :value="w" v-model="window">{{ t('feedback.dayN', { n: w }) }}<span v-if="open === w" class="dot dot-success" :title="t('feedback.openNow')"></span></label>
        </div>
        <small class="muted" v-if="open">✅ {{ t('feedback.openWindow', { n: open }) }}</small>
        <small class="muted" v-else>{{ t('feedback.noOpenWindow') }}</small>
      </fieldset>
      <div class="field"><span>{{ t('feedback.rating') }} *</span><ui-stars v-model="rating" :label="t('feedback.rating')"></ui-stars></div>
      <label class="field"><span>{{ t('feedback.strengths') }} *</span><textarea v-model="strengths" rows="3"></textarea></label>
      <label class="field"><span>{{ t('feedback.improvements') }} *</span><textarea v-model="improvements" rows="3"></textarea></label>
      <p class="error-text" v-if="error">{{ error }}</p>
    </div>
    <ui-empty v-else icon="💬" :text="t('feedback.noTargets')"></ui-empty>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ t('common.cancel') }}</button>
      <button type="button" class="btn btn-primary" :disabled="saving || !targets.length" @click="save">{{ t('common.send') }}</button>
    </template>
  </ui-modal>`,
};

export default {
  name: 'FeedbackView',
  components: { FeedbackCard, FeedbackModal },
  data() { return { WINDOWS, win: 'all', emp: '', showNew: false }; },
  computed: {
    canWrite() { return canWriteFeedback(); },
    emps() { return visibleEmployees(); },
    list() {
      return visibleFeedback().filter((f) => (this.win === 'all' || f.window === Number(this.win)) && (!this.emp || f.employeeId === this.emp));
    },
  },
  methods: { fullName },
  template: `
  <div class="page">
    <div class="page-head">
      <h1>{{ t('nav.feedback') }}</h1>
      <button v-if="canWrite" type="button" class="btn btn-primary" @click="showNew = true">+ {{ t('feedback.write') }}</button>
    </div>
    <div class="toolbar">
      <div class="chips">
        <button type="button" class="chip" :class="{ active: win === 'all' }" @click="win = 'all'">{{ t('common.all') }}</button>
        <button v-for="w in WINDOWS" :key="w" type="button" class="chip" :class="{ active: win === w }" @click="win = w">{{ t('feedback.dayN', { n: w }) }}</button>
      </div>
      <select v-model="emp" :aria-label="t('fields.employee')">
        <option value="">{{ t('feedback.allEmployees') }}</option>
        <option v-for="e in emps" :key="e.id" :value="e.id">{{ fullName(e) }}</option>
      </select>
    </div>
    <div class="stack" v-if="list.length">
      <feedback-card v-for="f in list" :key="f.id" :f="f" show-employee></feedback-card>
    </div>
    <ui-empty v-else icon="💬" :text="t('feedback.empty')"></ui-empty>
    <feedback-modal v-if="showNew" @close="showNew = false" @created="showNew = false"></feedback-modal>
  </div>`,
};
