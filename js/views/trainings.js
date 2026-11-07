// views/trainings.js — təlimlər, iştirakçılar cədvəli, ekrandan imza və akt çapı
import { one, set } from '../db.js';
import { uid } from '../utils.js';
import { SignaturePad } from '../signature.js';
import {
  session, currentUserId, visibleTrainings, signatureOf, signedCount, isEmployeeSigned, signAsEmployee, signAsTrainer,
  personName, usersByRole, employeesSorted, fullName, toast,
} from '../store.js';

export const NewTrainingModal = {
  name: 'NewTrainingModal',
  emits: ['close', 'created'],
  data() {
    const trainers = usersByRole('trainer');
    return {
      title: '', date: '', trainerId: session.role === 'trainer' ? currentUserId() : (trainers[0] ? trainers[0].id : ''),
      participantIds: [], errors: {}, saving: false,
    };
  },
  computed: { trainers() { return usersByRole('trainer'); }, emps() { return employeesSorted(); } },
  methods: {
    fullName,
    async save() {
      const e = {};
      if (!this.title.trim()) e.title = this.t('validation.required');
      if (!this.date) e.date = this.t('validation.required');
      if (!this.trainerId) e.trainerId = this.t('validation.required');
      if (!this.participantIds.length) e.participants = this.t('trainings.errParticipants');
      this.errors = e;
      if (Object.keys(e).length) return;
      this.saving = true;
      try {
        const tr = { id: uid('tr'), titleAz: this.title.trim(), titleEn: this.title.trim(), date: this.date, trainerId: this.trainerId, participantIds: [...this.participantIds] };
        await set('trainings', tr.id, tr);
        toast(this.t('trainings.created'));
        this.$emit('created', tr);
      } catch (err) { toast(String(err.message || err), 'error'); } finally { this.saving = false; }
    },
  },
  template: `
  <ui-modal :title="t('trainings.newTitle')" @close="$emit('close')">
    <div class="form-stack">
      <label class="field"><span>{{ t('fields.title') }} *</span><input v-model="title" :class="{ invalid: errors.title }"><small class="error-text" v-if="errors.title">{{ errors.title }}</small></label>
      <div class="form-grid">
        <label class="field"><span>{{ t('fields.date') }} *</span><input type="date" v-model="date" :class="{ invalid: errors.date }"><small class="error-text" v-if="errors.date">{{ errors.date }}</small></label>
        <label class="field"><span>{{ t('roles.trainer') }} *</span>
          <select v-model="trainerId" :disabled="session.role === 'trainer'"><option v-for="u in trainers" :key="u.id" :value="u.id">{{ u.name }}</option></select></label>
      </div>
      <fieldset class="field"><legend>{{ t('trainings.participants') }} *</legend>
        <div class="check-list two-col">
          <label v-for="e in emps" :key="e.id" class="check-row"><input type="checkbox" :value="e.id" v-model="participantIds"><span>{{ fullName(e) }}</span></label>
        </div>
        <small class="error-text" v-if="errors.participants">{{ errors.participants }}</small>
      </fieldset>
    </div>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ t('common.cancel') }}</button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="save">{{ t('common.save') }}</button>
    </template>
  </ui-modal>`,
};

export default {
  name: 'TrainingsView',
  components: { NewTrainingModal },
  data() { return { showNew: false }; },
  computed: {
    list() { return visibleTrainings(); },
    canCreate() { return ['hr', 'trainer'].includes(session.role); },
    isEmployee() { return session.role === 'employee'; },
  },
  methods: {
    personName, signedCount,
    mySig(tr) { return signatureOf(tr.id, session.employeeId); },
    created(tr) { this.showNew = false; location.hash = '#/training/' + tr.id; },
  },
  template: `
  <div class="page">
    <div class="page-head">
      <h1>{{ t('nav.trainings') }}</h1>
      <button v-if="canCreate" type="button" class="btn btn-primary" @click="showNew = true">+ {{ t('trainings.new') }}</button>
    </div>
    <div class="card-grid" v-if="list.length">
      <a v-for="tr in list" :key="tr.id" class="card hover-lift training-card" :href="'#/training/' + tr.id">
        <div class="row-between gap-sm"><span class="training-icon" aria-hidden="true">🎓</span>
          <ui-status v-if="isEmployee" :status="mySig(tr).status" kind="sigStatus"></ui-status></div>
        <h3>{{ tx(tr, 'title') }}</h3>
        <p class="muted small">📅 {{ fmtDate(tr.date) }} · 👤 {{ personName(tr.trainerId) }}</p>
        <div class="row-between small"><span>{{ t('trainings.signedXY', { x: signedCount(tr), y: tr.participantIds.length }) }}</span>
          <span>{{ tr.participantIds.length }} {{ t('trainings.participantsShort') }}</span></div>
        <ui-progress :value="tr.participantIds.length ? Math.round(signedCount(tr) / tr.participantIds.length * 100) : 0"></ui-progress>
      </a>
    </div>
    <ui-empty v-else icon="🎓" :text="t('trainings.empty')"></ui-empty>
    <new-training-modal v-if="showNew" @close="showNew = false" @created="created"></new-training-modal>
  </div>`,
};

export const TrainingDetail = {
  name: 'TrainingDetail',
  components: { SignaturePad },
  props: { id: String },
  data() { return { signing: null }; },
  computed: {
    tr() { return one('trainings', this.id); },
    rows() { return this.tr ? this.tr.participantIds.map((pid) => ({ pid, emp: one('employees', pid), sig: signatureOf(this.tr.id, pid) })) : []; },
    role() { return session.role; },
    me() { return currentUserId(); },
    isTrainer() { return this.role === 'trainer' && this.tr && this.tr.trainerId === this.me; },
  },
  methods: {
    personName, isEmployeeSigned, signedCount,
    canEmpSign(r) { return this.role === 'employee' && r.pid === session.employeeId && !isEmployeeSigned(r.sig) && r.sig.status !== 'completed'; },
    canTrainerSign(r) { return this.isTrainer && isEmployeeSigned(r.sig) && r.sig.status !== 'completed'; },
    startSign(r, who) {
      this.signing = { pid: r.pid, who, signer: who === 'employee' ? personName(r.pid) : personName(this.tr.trainerId) };
    },
    async saveSig(dataUrl) {
      const s = this.signing;
      this.signing = null;
      try {
        if (s.who === 'employee') await signAsEmployee(this.tr, s.pid, dataUrl);
        else await signAsTrainer(this.tr, s.pid, dataUrl);
        toast(this.t(s.who === 'employee' ? 'trainings.empSigned' : 'trainings.trainerSigned'));
      } catch (e) { toast(String(e.message || e), 'error'); }
    },
    print() { window.print(); },
  },
  template: `
  <div class="page" v-if="tr">
    <a href="#/trainings" class="back-link">← {{ t('nav.trainings') }}</a>
    <section class="card">
      <div class="row-between wrap gap-sm">
        <div>
          <h1 class="h-title">{{ tx(tr, 'title') }}</h1>
          <p class="muted">📅 {{ fmtDate(tr.date) }} · 👤 {{ t('roles.trainer') }}: {{ personName(tr.trainerId) }} · 👥 {{ tr.participantIds.length }}</p>
        </div>
        <button type="button" class="btn btn-secondary" @click="print">🖨️ {{ t('trainings.printAct') }}</button>
      </div>
      <div class="row-between small"><span>{{ t('trainings.signedXY', { x: signedCount(tr), y: tr.participantIds.length }) }}</span></div>
      <ui-progress :value="tr.participantIds.length ? Math.round(signedCount(tr) / tr.participantIds.length * 100) : 0"></ui-progress>
    </section>

    <section class="card flush">
      <h2 class="card-title pad">{{ t('trainings.participants') }}</h2>
      <table class="rtable">
        <thead><tr><th>{{ t('fields.name') }}</th><th>{{ t('trainings.empSignature') }}</th><th>{{ t('trainings.trainerSignature') }}</th><th>{{ t('fields.status') }}</th></tr></thead>
        <tbody>
          <tr v-for="r in rows" :key="r.pid">
            <td :data-label="t('fields.name')"><strong>{{ personName(r.pid) }}</strong><span class="muted small block" v-if="r.emp">{{ r.emp.position }}</span></td>
            <td :data-label="t('trainings.empSignature')">
              <figure v-if="r.sig.employeeSignature" class="sig-thumb"><img :src="r.sig.employeeSignature" :alt="t('trainings.empSignature')"><figcaption>{{ fmtDateTime(r.sig.employeeSignedAt) }}</figcaption></figure>
              <span v-else-if="isEmployeeSigned(r.sig)" class="small">✔ {{ t('trainings.signedSample') }}</span>
              <button v-else-if="canEmpSign(r)" type="button" class="btn btn-sm btn-primary" @click="startSign(r, 'employee')">✍️ {{ t('trainings.sign') }}</button>
              <span v-else class="muted small">{{ t('trainings.notSigned') }}</span>
            </td>
            <td :data-label="t('trainings.trainerSignature')">
              <figure v-if="r.sig.trainerSignature" class="sig-thumb"><img :src="r.sig.trainerSignature" :alt="t('trainings.trainerSignature')"><figcaption>{{ fmtDateTime(r.sig.trainerSignedAt) }}</figcaption></figure>
              <span v-else-if="r.sig.status === 'completed'" class="small">✔ {{ t('trainings.signedSample') }}</span>
              <button v-else-if="canTrainerSign(r)" type="button" class="btn btn-sm btn-primary" @click="startSign(r, 'trainer')">✍️ {{ t('trainings.trainerSign') }}</button>
              <span v-else-if="!isEmployeeSigned(r.sig)" class="muted small">{{ t('trainings.waitEmployee') }}</span>
              <span v-else class="muted small">{{ t('trainings.waitTrainer') }}</span>
            </td>
            <td :data-label="t('fields.status')"><ui-status :status="r.sig.status" kind="sigStatus"></ui-status> <span v-if="r.sig.status === 'completed'" :title="t('trainings.locked')">🔒</span></td>
          </tr>
        </tbody>
      </table>
    </section>

    <signature-pad v-if="signing" :signer="signing.signer" @save="saveSig" @cancel="signing = null"></signature-pad>

    <teleport to="body">
      <div class="print-act" aria-hidden="true">
        <h1>{{ t('trainings.actTitle') }}</h1>
        <table class="print-meta">
          <tr><th>{{ t('fields.title') }}</th><td>{{ tx(tr, 'title') }}</td></tr>
          <tr><th>{{ t('fields.date') }}</th><td>{{ fmtDate(tr.date) }}</td></tr>
          <tr><th>{{ t('roles.trainer') }}</th><td>{{ personName(tr.trainerId) }}</td></tr>
        </table>
        <table class="print-table">
          <thead><tr><th>#</th><th>{{ t('fields.name') }}</th><th>{{ t('trainings.empSignature') }}</th><th>{{ t('trainings.trainerSignature') }}</th><th>{{ t('fields.status') }}</th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in rows" :key="r.pid">
              <td>{{ i + 1 }}</td>
              <td>{{ personName(r.pid) }}</td>
              <td><img v-if="r.sig.employeeSignature" :src="r.sig.employeeSignature" alt=""><div class="small">{{ r.sig.employeeSignedAt ? fmtDateTime(r.sig.employeeSignedAt) : '—' }}</div></td>
              <td><img v-if="r.sig.trainerSignature" :src="r.sig.trainerSignature" alt=""><div class="small">{{ personName(tr.trainerId) }}<br>{{ r.sig.trainerSignedAt ? fmtDateTime(r.sig.trainerSignedAt) : '—' }}</div></td>
              <td>{{ t('sigStatus.' + r.sig.status) }}</td>
            </tr>
          </tbody>
        </table>
        <p class="print-foot">{{ t('trainings.printedAt') }}: {{ fmtDateTime(new Date().toISOString()) }}</p>
      </div>
    </teleport>
  </div>
  <ui-empty v-else icon="🔍" :text="t('common.notFound')"></ui-empty>`,
};
