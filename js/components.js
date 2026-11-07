// components.js — ümumi UI komponentləri
import { initials } from './utils.js';
import { UiExport } from './export.js';

export const UiModal = {
  name: 'UiModal',
  props: { title: String, wide: Boolean },
  emits: ['close'],
  mounted() {
    this._onKey = (e) => { if (e.key === 'Escape') this.$emit('close'); };
    document.addEventListener('keydown', this._onKey);
    document.body.classList.add('modal-open');
  },
  unmounted() {
    document.removeEventListener('keydown', this._onKey);
    if (!document.querySelector('.modal-backdrop')) document.body.classList.remove('modal-open');
  },
  template: `
  <teleport to="body">
    <div class="modal-backdrop" @mousedown.self="$emit('close')">
      <div class="modal" :class="{ wide }" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal-head">
          <h3>{{ title }}</h3>
          <button type="button" class="icon-btn" @click="$emit('close')" :aria-label="t('common.close')">✕</button>
        </div>
        <div class="modal-body"><slot></slot></div>
        <div class="modal-foot" v-if="$slots.footer"><slot name="footer"></slot></div>
      </div>
    </div>
  </teleport>`,
};

export const UiAvatar = {
  name: 'UiAvatar',
  props: { name: String, size: { type: Number, default: 44 } },
  computed: { letters() { return initials(this.name || '?'); } },
  template: `<span class="avatar" :style="{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.38) + 'px' }" aria-hidden="true">{{ letters }}</span>`,
};

export const UiProgress = {
  name: 'UiProgress',
  props: { value: { type: Number, default: 0 }, label: String },
  template: `<div class="progress" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100" :aria-label="label">
    <div class="progress-fill" :style="{ width: Math.max(0, Math.min(100, value)) + '%' }"></div></div>`,
};

export const UiRing = {
  name: 'UiRing',
  props: { value: { type: Number, default: 0 }, size: { type: Number, default: 96 } },
  template: `<div class="ring" :style="{ width: size + 'px', height: size + 'px', '--p': Math.max(0, Math.min(100, value)) }">
    <div class="ring-inner"><strong>{{ value }}%</strong></div></div>`,
};

export const UiStatus = {
  name: 'UiStatus',
  props: { status: String, kind: { type: String, default: 'status' } },
  template: `<span class="pill" :class="'pill-' + status">{{ t(kind + '.' + status) }}</span>`,
};

export const UiStars = {
  name: 'UiStars',
  props: { modelValue: { type: Number, default: 0 }, readonly: Boolean, label: String },
  emits: ['update:modelValue'],
  template: `<span class="stars" :class="{ readonly }" role="radiogroup" :aria-label="label">
    <button v-for="i in 5" :key="i" type="button" class="star" :class="{ on: i <= modelValue }"
      :disabled="readonly" :aria-label="i + ' / 5'" :aria-checked="i === modelValue" role="radio"
      @click="$emit('update:modelValue', i)">★</button></span>`,
};

export const UiEmpty = {
  name: 'UiEmpty',
  props: { icon: { type: String, default: '🗂️' }, text: String },
  template: `<div class="empty"><div class="empty-icon">{{ icon }}</div><p>{{ text }}</p></div>`,
};

export function registerComponents(app) {
  app.component('ui-modal', UiModal);
  app.component('ui-avatar', UiAvatar);
  app.component('ui-progress', UiProgress);
  app.component('ui-ring', UiRing);
  app.component('ui-status', UiStatus);
  app.component('ui-stars', UiStars);
  app.component('ui-empty', UiEmpty);
  app.component('ui-export', UiExport);
}
