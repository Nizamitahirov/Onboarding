// signature.js — canvas imza komponenti (pointer events: siçan, barmaq, qələm)
export const MAX_SIGNATURE_BYTES = 50 * 1024;

export const SignaturePad = {
  name: 'SignaturePad',
  props: { title: String, signer: String },
  emits: ['save', 'cancel'],
  data() { return { empty: true, tooBig: false }; },
  mounted() {
    requestAnimationFrame(() => this.setup());
    this._onResize = () => { if (this.empty) this.setup(); };
    window.addEventListener('resize', this._onResize);
  },
  unmounted() { window.removeEventListener('resize', this._onResize); },
  methods: {
    setup() {
      const c = this.$refs.canvas;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.cssW = Math.max(200, Math.round(rect.width));
      this.cssH = Math.max(120, Math.round(rect.height));
      c.width = this.cssW * dpr;
      c.height = this.cssH * dpr;
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.cssW, this.cssH);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      this.ctx = ctx;
      this.empty = true;
    },
    pos(e) {
      const r = this.$refs.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    },
    down(e) {
      e.preventDefault();
      this.$refs.canvas.setPointerCapture && this.$refs.canvas.setPointerCapture(e.pointerId);
      this.drawing = true;
      this.last = this.pos(e);
      this.ctx.beginPath();
      this.ctx.arc(this.last.x, this.last.y, 1.1, 0, Math.PI * 2);
      this.ctx.fillStyle = '#111111';
      this.ctx.fill();
      this.empty = false;
    },
    move(e) {
      if (!this.drawing) return;
      e.preventDefault();
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of events.length ? events : [e]) {
        const p = this.pos(ev);
        this.ctx.beginPath();
        this.ctx.moveTo(this.last.x, this.last.y);
        this.ctx.lineTo(p.x, p.y);
        this.ctx.stroke();
        this.last = p;
      }
      this.empty = false;
    },
    up() { this.drawing = false; },
    clear() { this.setup(); this.tooBig = false; },
    /** Saxlamadan əvvəl 1x miqyasa salınır ki, fayl kiçik olsun (< 50 KB) */
    toDataUrl() {
      const out = document.createElement('canvas');
      out.width = this.cssW;
      out.height = this.cssH;
      const ctx = out.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(this.$refs.canvas, 0, 0, out.width, out.height);
      let url = out.toDataURL('image/png');
      if (url.length * 0.75 > MAX_SIGNATURE_BYTES) {
        // çox mürəkkəb imza: ölçünü kiçildirik
        const small = document.createElement('canvas');
        small.width = Math.round(out.width / 2);
        small.height = Math.round(out.height / 2);
        const sctx = small.getContext('2d');
        sctx.fillStyle = '#ffffff';
        sctx.fillRect(0, 0, small.width, small.height);
        sctx.drawImage(out, 0, 0, small.width, small.height);
        url = small.toDataURL('image/png');
      }
      return url;
    },
    confirm() {
      if (this.empty) return;
      const url = this.toDataUrl();
      if (url.length * 0.75 > MAX_SIGNATURE_BYTES) { this.tooBig = true; return; }
      this.$emit('save', url);
    },
  },
  template: `
  <ui-modal :title="title || t('sign.title')" @close="$emit('cancel')">
    <p class="muted small" v-if="signer">{{ t('sign.signer') }}: <strong>{{ signer }}</strong></p>
    <div class="sig-wrap">
      <canvas ref="canvas" class="sig-canvas" @pointerdown="down" @pointermove="move" @pointerup="up"
        @pointercancel="up" @pointerleave="up" :aria-label="t('sign.hint')"></canvas>
      <span class="sig-hint" v-if="empty">{{ t('sign.hint') }}</span>
    </div>
    <p class="error-text" v-if="tooBig">{{ t('sign.tooBig') }}</p>
    <template #footer>
      <button type="button" class="btn btn-ghost" @click="clear">{{ t('sign.clear') }}</button>
      <span class="spacer"></span>
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">{{ t('common.cancel') }}</button>
      <button type="button" class="btn btn-primary" :disabled="empty" @click="confirm">{{ t('sign.confirm') }}</button>
    </template>
  </ui-modal>`,
};
