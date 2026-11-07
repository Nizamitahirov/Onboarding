// views/handbook.js — Employee Handbook
import { update } from '../db.js';
import { session, sectionsSorted, ackOf, ackCount, acknowledge, toast } from '../store.js';

export default {
  name: 'HandbookView',
  data() {
    const first = sectionsSorted()[0];
    return { activeId: first ? first.id : null, editing: false, draft: { titleAz: '', titleEn: '', contentAz: '', contentEn: '' }, saving: false };
  },
  computed: {
    sections() { return sectionsSorted(); },
    active() { return this.sections.find((s) => s.id === this.activeId) || null; },
    isEmployee() { return session.role === 'employee'; },
    isHr() { return session.role === 'hr'; },
    empId() { return session.employeeId; },
    readN() { return this.isEmployee ? ackCount(this.empId) : 0; },
  },
  methods: {
    ack(s) { return this.isEmployee ? ackOf(this.empId, s.id) : null; },
    paragraphs(s) { return String(this.tx(s, 'content') || '').split(/\n\s*\n/).filter(Boolean); },
    select(s) {
      if (this.editing) this.editing = false;
      // mobil akkordeon: eyni bölməyə basanda bağlanır
      this.activeId = this.activeId === s.id && window.matchMedia('(max-width: 767px)').matches ? null : s.id;
    },
    async confirmRead(s) {
      await acknowledge(this.empId, s.id);
      toast(this.t('handbook.acked'));
      const next = this.sections.find((x) => !ackOf(this.empId, x.id));
      if (next && window.matchMedia('(min-width: 768px)').matches) this.activeId = next.id;
    },
    startEdit() {
      const s = this.active;
      this.draft = { titleAz: s.titleAz, titleEn: s.titleEn, contentAz: s.contentAz, contentEn: s.contentEn };
      this.editing = true;
    },
    async saveEdit() {
      this.saving = true;
      try { await update('handbookSections', this.active.id, { ...this.draft }); this.editing = false; toast(this.t('common.saved')); }
      catch (e) { toast(String(e.message || e), 'error'); } finally { this.saving = false; }
    },
  },
  template: `
  <div class="page">
    <div class="page-head">
      <h1>{{ t('nav.handbook') }}</h1>
      <span v-if="isEmployee" class="pill pill-onboarding">📘 {{ t('profile.handbookN', { n: readN, total: sections.length }) }}</span>
    </div>
    <div class="handbook">
      <aside class="card hb-list flush" :aria-label="t('handbook.sections')">
        <ul>
          <li v-for="s in sections" :key="s.id">
            <button type="button" class="hb-item" :class="{ active: activeId === s.id }" @click="select(s)" :aria-expanded="activeId === s.id">
              <span class="check-icon" :class="{ on: ack(s) }" aria-hidden="true">{{ ack(s) ? '✓' : s.order }}</span>
              <span class="grow">{{ tx(s, 'title') }}</span>
              <span class="hb-chevron" aria-hidden="true">›</span>
            </button>
            <div class="hb-inline" v-if="activeId === s.id">
              <p v-for="(p, i) in paragraphs(s)" :key="i">{{ p }}</p>
              <div class="hb-actions" v-if="isEmployee">
                <span v-if="ack(s)" class="success-text small">✓ {{ t('handbook.ackedAt', { date: fmtDateTime(ack(s).at) }) }}</span>
                <button v-else type="button" class="btn btn-primary" @click="confirmRead(s)">{{ t('handbook.ack') }}</button>
              </div>
            </div>
          </li>
        </ul>
      </aside>
      <article class="card hb-panel" v-if="active">
        <template v-if="!editing">
          <div class="row-between wrap gap-sm">
            <h2 class="h-title">{{ tx(active, 'title') }}</h2>
            <button v-if="isHr" type="button" class="btn btn-sm btn-secondary" @click="startEdit">✏️ {{ t('common.edit') }}</button>
          </div>
          <div class="hb-content"><p v-for="(p, i) in paragraphs(active)" :key="i">{{ p }}</p></div>
          <div class="hb-actions" v-if="isEmployee">
            <span v-if="ack(active)" class="success-text">✓ {{ t('handbook.ackedAt', { date: fmtDateTime(ack(active).at) }) }}</span>
            <button v-else type="button" class="btn btn-primary" @click="confirmRead(active)">{{ t('handbook.ack') }}</button>
          </div>
          <p v-else-if="!isHr" class="muted small">{{ t('handbook.employeeOnly') }}</p>
        </template>
        <form v-else class="form-stack" @submit.prevent="saveEdit">
          <div class="form-grid">
            <label class="field"><span>{{ t('fields.title') }} (AZ)</span><input v-model="draft.titleAz"></label>
            <label class="field"><span>{{ t('fields.title') }} (EN)</span><input v-model="draft.titleEn"></label>
          </div>
          <label class="field"><span>{{ t('handbook.content') }} (AZ)</span><textarea v-model="draft.contentAz" rows="8"></textarea></label>
          <label class="field"><span>{{ t('handbook.content') }} (EN)</span><textarea v-model="draft.contentEn" rows="8"></textarea></label>
          <p class="muted small">{{ t('handbook.editHint') }}</p>
          <div class="row-end gap-sm">
            <button type="button" class="btn btn-secondary" @click="editing = false">{{ t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ t('common.save') }}</button>
          </div>
        </form>
      </article>
    </div>
  </div>`,
};
