// chatbot.js — "NextGen" AI köməkçisi (üzən düymə + söhbət paneli)
import { i18n } from './i18n.js';
import { session, currentUserId } from './store.js';
import { buildChatContext } from './chatContext.js';
import { renderMarkdown } from './markdown.js';

export { renderMarkdown };

const API = '/api/chat';
const STORE_PREFIX = 'nextgen_chat_';

const SUGGESTIONS = {
  hr: ['chat.s.hr1', 'chat.s.hr2', 'chat.s.hr3', 'chat.s.hr4'],
  manager: ['chat.s.mgr1', 'chat.s.mgr2', 'chat.s.mgr3'],
  buddy: ['chat.s.bud1', 'chat.s.bud2'],
  trainer: ['chat.s.trn1', 'chat.s.trn2'],
  it: ['chat.s.it1', 'chat.s.it2'],
  employee: ['chat.s.emp1', 'chat.s.emp2', 'chat.s.emp3', 'chat.s.emp4'],
};

export const NextGenChat = {
  name: 'NextGenChat',
  data() {
    let wide = false;
    try { wide = localStorage.getItem('nextgen_wide') === '1'; } catch (e) { /* ignore */ }
    return { open: false, wide, input: '', messages: [], loading: false, error: '' };
  },
  computed: {
    storeKey() { return STORE_PREFIX + session.role + '_' + (currentUserId() || ''); },
    suggestions() { return (SUGGESTIONS[session.role] || []).map((k) => this.t(k)); },
  },
  watch: {
    storeKey: { immediate: true, handler() { this.load(); } },
    open(v) { if (v) this.$nextTick(() => { this.scroll(); this.$refs.input && this.$refs.input.focus(); }); },
  },
  mounted() {
    this._onKey = (e) => { if (e.key === 'Escape' && this.open && !document.querySelector('.modal-backdrop')) this.open = false; };
    document.addEventListener('keydown', this._onKey);
  },
  unmounted() { document.removeEventListener('keydown', this._onKey); },
  methods: {
    renderMarkdown,
    load() {
      this.error = '';
      try { this.messages = JSON.parse(sessionStorage.getItem(this.storeKey) || '[]'); } catch (e) { this.messages = []; }
    },
    save() { try { sessionStorage.setItem(this.storeKey, JSON.stringify(this.messages.slice(-40))); } catch (e) { /* ignore */ } },
    toggleWide() { this.wide = !this.wide; try { localStorage.setItem('nextgen_wide', this.wide ? '1' : '0'); } catch (e) { /* ignore */ } },
    clear() { this.messages = []; this.error = ''; this.save(); },
    scroll() { const el = this.$refs.log; if (el) el.scrollTop = el.scrollHeight; },
    onKeydown(e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); this.send(); } },
    async send(text) {
      const content = String(text != null ? text : this.input).trim();
      if (!content || this.loading) return;
      this.input = '';
      this.error = '';
      this.messages.push({ role: 'user', content });
      this.save();
      this.loading = true;
      this.$nextTick(this.scroll);
      try {
        const r = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lang: i18n.lang,
            context: buildChatContext(),
            messages: this.messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content })).slice(-20),
          }),
        });
        let data = null;
        try { data = await r.json(); } catch (e) { data = null; }
        if (!r.ok || !data || !data.reply) {
          const code = (data && data.error) || (r.status === 404 ? 'not_deployed' : 'upstream_failed');
          throw new Error(code);
        }
        this.messages.push({ role: 'assistant', content: data.reply, model: data.model, tier: data.tier });
      } catch (e) {
        const code = e && e.message;
        const key = ['not_deployed', 'missing_key', 'invalid_key', 'rate_limited'].includes(code) ? code : 'generic';
        this.error = this.t('chat.err.' + key);
      } finally {
        this.loading = false;
        this.save();
        this.$nextTick(this.scroll);
      }
    },
  },
  template: `
  <div class="ng" :class="{ 'ng-open': open }">
    <button v-if="!open" type="button" class="ng-fab" @click="open = true" :aria-label="t('chat.open')">
      <span class="ng-fab-icon" aria-hidden="true">✦</span><span class="ng-fab-label">NextGen</span>
    </button>

    <section v-if="open" class="ng-panel" :class="{ 'ng-wide': wide }" role="dialog" aria-label="NextGen">
      <header class="ng-head">
        <span class="ng-avatar" aria-hidden="true">✦</span>
        <div class="grow min0">
          <strong>NextGen</strong>
          <span class="ng-sub">{{ t('chat.subtitle') }}</span>
        </div>
        <button type="button" class="ng-icon ng-expand" @click="toggleWide" :title="wide ? t('chat.shrink') : t('chat.expand')" :aria-label="wide ? t('chat.shrink') : t('chat.expand')" :aria-pressed="wide">
          <svg v-if="!wide" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h6v2H7.4l4.3 4.3-1.4 1.4L6 7.4V10H4zm16 16h-6v-2h2.6l-4.3-4.3 1.4-1.4 4.3 4.3V14h2z"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 11H5V9h2.6L3.3 4.7l1.4-1.4L9 7.6V5h2zm2 2h6v2h-2.6l4.3 4.3-1.4 1.4-4.3-4.3V19h-2z"/></svg></button>
        <button type="button" class="ng-icon" @click="clear" :title="t('chat.clear')" :aria-label="t('chat.clear')" v-if="messages.length">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7z"/></svg></button>
        <button type="button" class="ng-icon" @click="open = false" :aria-label="t('common.close')">✕</button>
      </header>

      <div class="ng-log" ref="log" aria-live="polite">
        <div v-if="!messages.length" class="ng-welcome">
          <div class="ng-welcome-icon" aria-hidden="true">✦</div>
          <p><strong>{{ t('chat.hello') }}</strong></p>
          <p class="muted small">{{ t('chat.intro') }}</p>
          <div class="ng-suggest">
            <button v-for="s in suggestions" :key="s" type="button" class="ng-chip" @click="send(s)">{{ s }}</button>
          </div>
        </div>
        <div v-for="(m, i) in messages" :key="i" class="ng-msg" :class="'ng-' + m.role">
          <div v-if="m.role === 'assistant'" class="ng-bubble ng-md" v-html="renderMarkdown(m.content)"></div>
          <div v-else class="ng-bubble">{{ m.content }}</div>
          <span v-if="m.model" class="ng-model" :title="t('chat.modelHint')">{{ m.tier === 'deep' ? '🧠' : '⚡' }} {{ m.model }}</span>
        </div>
        <div v-if="loading" class="ng-msg ng-assistant"><div class="ng-bubble ng-typing" :aria-label="t('chat.thinking')"><i></i><i></i><i></i></div></div>
        <div v-if="error" class="ng-error" role="alert">⚠️ {{ error }}</div>
      </div>

      <form class="ng-input" @submit.prevent="send()">
        <textarea ref="input" v-model="input" rows="1" :placeholder="t('chat.placeholder')" @keydown="onKeydown" :aria-label="t('chat.placeholder')" maxlength="2000"></textarea>
        <button type="submit" class="ng-send" :disabled="!input.trim() || loading" :aria-label="t('chat.send')">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z"/></svg></button>
      </form>
      <p class="ng-foot">{{ t('chat.disclaimer') }}</p>
    </section>
  </div>`,
};
