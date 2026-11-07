// views/settings.js — Ayarlar (HR)
import { all, set, dbState, loadSeed, isEmpty } from '../db.js';
import { uid, isValidEmail } from '../utils.js';
import { i18n, setLang, setTheme } from '../i18n.js';
import { toast } from '../store.js';

export const SystemModal = {
  name: 'SystemModal',
  props: { system: Object },
  emits: ['close', 'saved'],
  data() {
    const s = this.system || {};
    return { f: { name: s.name || '', ownerName: s.ownerName || '', ownerEmail: s.ownerEmail || '', notify: (s.notifyEmails || []).join(', ') }, errors: {}, saving: false };
  },
  methods: {
    async save() {
      const e = {};
      if (!this.f.name.trim()) e.name = this.t('validation.required');
      if (!this.f.ownerName.trim()) e.ownerName = this.t('validation.required');
      if (!isValidEmail(this.f.ownerEmail)) e.ownerEmail = this.t('validation.email');
      const notifyEmails = this.f.notify.split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
      if (notifyEmails.some((x) => !isValidEmail(x))) e.notify = this.t('validation.emailList');
      this.errors = e;
      if (Object.keys(e).length) return;
      this.saving = true;
      try {
        const id = (this.system && this.system.id) || uid('s');
        await set('systems', id, { name: this.f.name.trim(), ownerName: this.f.ownerName.trim(), ownerEmail: this.f.ownerEmail.trim(), notifyEmails });
        toast(this.t('common.saved'));
        this.$emit('saved');
      } catch (err) { toast(String(err.message || err), 'error'); } finally { this.saving = false; }
    },
  },
  template: `
  <ui-modal :title="system ? t('settings.editSystem') : t('settings.addSystem')" @close="$emit('close')">
    <form class="form-stack" @submit.prevent="save" novalidate>
      <label class="field"><span>{{ t('settings.systemName') }} *</span><input v-model="f.name" :class="{ invalid: errors.name }"><small class="error-text" v-if="errors.name">{{ errors.name }}</small></label>
      <div class="form-grid">
        <label class="field"><span>{{ t('access.owner') }} *</span><input v-model="f.ownerName" :class="{ invalid: errors.ownerName }"><small class="error-text" v-if="errors.ownerName">{{ errors.ownerName }}</small></label>
        <label class="field"><span>{{ t('settings.ownerEmail') }} *</span><input type="email" v-model="f.ownerEmail" :class="{ invalid: errors.ownerEmail }"><small class="error-text" v-if="errors.ownerEmail">{{ errors.ownerEmail }}</small></label>
      </div>
      <label class="field"><span>{{ t('settings.notifyEmails') }}</span><input v-model="f.notify" placeholder="it-security@company.az, admin@company.az" :class="{ invalid: errors.notify }">
        <small class="error-text" v-if="errors.notify">{{ errors.notify }}</small><small class="muted" v-else>{{ t('settings.notifyHint') }}</small></label>
      <button type="submit" hidden></button>
    </form>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ t('common.cancel') }}</button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="save">{{ t('common.save') }}</button>
    </template>
  </ui-modal>`,
};

export default {
  name: 'SettingsView',
  components: { SystemModal },
  data() { return { editing: null, showSystem: false, confirmSeed: false, seeding: false }; },
  computed: {
    systems() { return all('systems').sort((a, b) => a.name.localeCompare(b.name, 'az')); },
    db() { return dbState; },
    prefs() { return i18n; },
  },
  methods: {
    setLang, setTheme,
    edit(s) { this.editing = s; this.showSystem = true; },
    add() { this.editing = null; this.showSystem = true; },
    askSeed() { if (isEmpty()) this.runSeed(); else this.confirmSeed = true; },
    async runSeed() {
      this.confirmSeed = false;
      this.seeding = true;
      try { await loadSeed(); toast(this.t('settings.seeded')); } catch (e) { toast(String(e.message || e), 'error'); } finally { this.seeding = false; }
    },
  },
  template: `
  <div class="page">
    <div class="page-head"><h1>{{ t('nav.settings') }}</h1></div>

    <section class="card">
      <h2 class="card-title">{{ t('settings.appearance') }}</h2>
      <div class="settings-row">
        <span>{{ t('settings.language') }}</span>
        <div class="segmented">
          <label :class="{ active: prefs.lang === 'az' }"><input type="radio" value="az" :checked="prefs.lang === 'az'" @change="setLang('az')">AZ</label>
          <label :class="{ active: prefs.lang === 'en' }"><input type="radio" value="en" :checked="prefs.lang === 'en'" @change="setLang('en')">EN</label>
        </div>
      </div>
      <div class="settings-row">
        <span>{{ t('settings.theme') }}</span>
        <div class="segmented">
          <label :class="{ active: prefs.theme === 'light' }"><input type="radio" value="light" :checked="prefs.theme === 'light'" @change="setTheme('light')">☀️ {{ t('settings.light') }}</label>
          <label :class="{ active: prefs.theme === 'dark' }"><input type="radio" value="dark" :checked="prefs.theme === 'dark'" @change="setTheme('dark')">🌙 {{ t('settings.dark') }}</label>
        </div>
      </div>
    </section>

    <section class="card flush">
      <div class="row-between pad wrap gap-sm">
        <h2 class="card-title nomargin">{{ t('settings.systems') }}</h2>
        <button type="button" class="btn btn-primary btn-sm" @click="add">+ {{ t('settings.addSystem') }}</button>
      </div>
      <table class="rtable">
        <thead><tr><th>{{ t('settings.systemName') }}</th><th>{{ t('access.owner') }}</th><th>{{ t('settings.ownerEmail') }}</th><th>{{ t('settings.notifyEmails') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="s in systems" :key="s.id">
            <td :data-label="t('settings.systemName')"><strong>{{ s.name }}</strong></td>
            <td :data-label="t('access.owner')">{{ s.ownerName }}</td>
            <td :data-label="t('settings.ownerEmail')">{{ s.ownerEmail }}</td>
            <td :data-label="t('settings.notifyEmails')">{{ (s.notifyEmails || []).join(', ') || '—' }}</td>
            <td :data-label="t('access.actions')"><button type="button" class="btn btn-sm btn-ghost" @click="edit(s)">✏️ {{ t('common.edit') }}</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2 class="card-title">{{ t('settings.data') }}</h2>
      <div class="settings-row">
        <span>{{ t('settings.connection') }}</span>
        <span class="pill" :class="db.mode === 'firestore' ? 'pill-completed' : 'pill-preboarding'">
          {{ db.mode === 'firestore' ? '🟢 ' + t('settings.connected') : '🟠 ' + t('settings.demoMode') }}</span>
      </div>
      <p class="error-text small" v-if="db.error">{{ t('settings.connError') }}: {{ db.error }}</p>
      <p class="muted small" v-if="db.mode === 'firestore' && db.empty">{{ t('settings.firestoreEmpty') }}</p>
      <p class="muted small">{{ t('settings.seedHint') }}</p>
      <div class="alert alert-warning" v-if="confirmSeed" role="alert">
        <p>⚠️ {{ t('settings.seedConfirm') }}</p>
        <div class="row-end gap-sm"><button type="button" class="btn btn-secondary btn-sm" @click="confirmSeed = false">{{ t('common.cancel') }}</button>
          <button type="button" class="btn btn-danger btn-sm" @click="runSeed">{{ t('common.confirm') }}</button></div>
      </div>
      <button v-else type="button" class="btn btn-primary" :disabled="seeding" @click="askSeed">⤓ {{ seeding ? t('common.loading') : t('settings.loadSeed') }}</button>
    </section>

    <system-modal v-if="showSystem" :system="editing" @close="showSystem = false" @saved="showSystem = false"></system-modal>
  </div>`,
};
