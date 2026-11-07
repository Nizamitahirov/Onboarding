// views/surveys.js — sorğular (HR statistikası və işçi forması)
import { all, one } from '../db.js';
import { surveyResponseRows, surveyQuestionRows, employeeSurveyRows } from '../exportRows.js';
import {
  session, currentEmployee, pendingSurveys, surveyTemplatesSorted, surveyStats, submitSurvey, surveyState, responseOf,
  responseAvg, responseNps, responseComment, personName, toast,
} from '../store.js';

export const SurveyForm = {
  name: 'SurveyForm',
  props: { tpl: Object, employeeId: String },
  emits: ['submitted'],
  data() { return { answers: {}, error: '', saving: false }; },
  methods: {
    async submit() {
      const missing = this.tpl.questions.filter((q) => q.type !== 'text' && typeof this.answers[q.id] !== 'number');
      if (missing.length) { this.error = this.t('surveys.errMissing'); return; }
      this.saving = true;
      try {
        const answers = {};
        this.tpl.questions.forEach((q) => { answers[q.id] = q.type === 'text' ? String(this.answers[q.id] || '').trim() : this.answers[q.id]; });
        await submitSurvey(this.employeeId, this.tpl.id, answers);
        toast(this.t('surveys.thanks'));
        this.$emit('submitted');
      } catch (e) { toast(String(e.message || e), 'error'); } finally { this.saving = false; }
    },
  },
  template: `
  <form class="card survey-form" @submit.prevent="submit">
    <h2 class="card-title">📝 {{ t('surveys.dayN', { n: tpl.day }) }}</h2>
    <div v-for="(q, i) in tpl.questions" :key="q.id" class="question">
      <p class="q-text"><span class="q-num">{{ i + 1 }}.</span> {{ tx(q, 'text') }}</p>
      <ui-stars v-if="q.type === 'scale5'" v-model="answers[q.id]" :label="tx(q, 'text')"></ui-stars>
      <div v-else-if="q.type === 'nps'">
        <div class="nps" role="radiogroup" :aria-label="tx(q, 'text')">
          <button v-for="n in 11" :key="n" type="button" class="nps-btn" :class="{ active: answers[q.id] === n - 1, low: n - 1 <= 6, mid: n - 1 === 7 || n - 1 === 8, high: n - 1 >= 9 }"
            role="radio" :aria-checked="answers[q.id] === n - 1" @click="answers[q.id] = n - 1">{{ n - 1 }}</button>
        </div>
        <div class="row-between small muted"><span>{{ t('surveys.notLikely') }}</span><span>{{ t('surveys.veryLikely') }}</span></div>
      </div>
      <textarea v-else v-model="answers[q.id]" rows="3" :placeholder="t('surveys.commentPh')" :aria-label="tx(q, 'text')"></textarea>
    </div>
    <p class="error-text" v-if="error">{{ error }}</p>
    <div class="row-end"><button type="submit" class="btn btn-primary" :disabled="saving">{{ t('common.send') }}</button></div>
  </form>`,
};

export default {
  name: 'SurveysView',
  components: { SurveyForm },
  data() { return { tplFilter: 'all' }; },
  computed: {
    isEmployee() { return session.role === 'employee'; },
    emp() { return currentEmployee(); },
    pending() { return pendingSurveys(this.emp); },
    myStates() { return this.emp ? surveyTemplatesSorted().map((tpl) => ({ tpl, state: surveyState(this.emp, tpl), resp: responseOf(this.emp.id, tpl.id) })) : []; },
    templates() { return surveyTemplatesSorted(); },
    responses() { return all('surveyResponses').sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); },
    overall() { return surveyStats(this.responses); },
    perTemplate() { return this.templates.map((tpl) => ({ tpl, s: surveyStats(this.responses.filter((r) => r.templateId === tpl.id)) })); },
    shown() { return this.tplFilter === 'all' ? this.responses : this.responses.filter((r) => r.templateId === this.tplFilter); },
    npsBar() {
      const o = this.overall, n = o.npsCount || 1;
      return { p: Math.round((o.promoters / n) * 100), pa: Math.round((o.passives / n) * 100), d: Math.round((o.detractors / n) * 100) };
    },
  },
  methods: {
    personName, responseAvg, responseNps, responseComment,
    tplDay(id) { const x = one('surveyTemplates', id); return x ? x.day : '?'; },
    fmtAvg(v) { return v == null ? '—' : v.toFixed(1); },
    fmtEnps(v) { return v == null ? '—' : (v > 0 ? '+' : '') + v; },
    exportSheets() {
      if (this.isEmployee) return [{ name: this.t('surveys.mySurveys'), rows: this.emp ? employeeSurveyRows(this.emp) : [] }];
      const o = this.overall;
      const r1 = (v) => (v == null ? '' : Math.round(v * 10) / 10);
      const byTpl = this.perTemplate.map((x) => ({
        [this.t('surveys.template')]: this.t('surveys.dayN', { n: x.tpl.day }), [this.t('surveys.responses')]: x.s.count,
        [this.t('surveys.avgScore')]: r1(x.s.avg), eNPS: x.s.enps == null ? '' : x.s.enps,
        [this.t('surveys.promoters')]: x.s.promoters, [this.t('surveys.passives')]: x.s.passives, [this.t('surveys.detractors')]: x.s.detractors,
      }));
      byTpl.push({ [this.t('surveys.template')]: this.t('common.all'), [this.t('surveys.responses')]: o.count, [this.t('surveys.avgScore')]: r1(o.avg),
        eNPS: o.enps == null ? '' : o.enps, [this.t('surveys.promoters')]: o.promoters, [this.t('surveys.passives')]: o.passives, [this.t('surveys.detractors')]: o.detractors });
      return [
        { name: this.t('export.sheetByTemplate'), rows: byTpl },
        { name: this.t('export.sheetResponses'), rows: surveyResponseRows(this.shown) },
        { name: this.t('export.sheetQuestions'), rows: surveyQuestionRows() },
      ];
    },
  },
  template: `
  <div class="page">
    <div class="page-head"><h1>{{ t('nav.surveys') }}</h1><ui-export :sheets="exportSheets" filename="surveys"></ui-export></div>

    <template v-if="isEmployee">
      <template v-if="emp">
        <survey-form v-for="tpl in pending" :key="tpl.id" :tpl="tpl" :employee-id="emp.id"></survey-form>
        <section class="card" v-if="!pending.length"><ui-empty icon="🎉" :text="t('surveys.noPending')"></ui-empty></section>
        <section class="card">
          <h2 class="card-title">{{ t('surveys.mySurveys') }}</h2>
          <ul class="list">
            <li v-for="x in myStates" :key="x.tpl.id" class="list-row">
              <span class="grow"><strong>{{ t('surveys.dayN', { n: x.tpl.day }) }}</strong>
                <span class="muted small block" v-if="x.resp">{{ fmtDateTime(x.resp.createdAt) }}</span></span>
              <ui-status :status="x.state" kind="surveyState"></ui-status>
            </li>
          </ul>
        </section>
      </template>
    </template>

    <template v-else>
      <section class="kpi-grid kpi-3">
        <div class="card kpi"><span class="kpi-icon">⭐</span><span class="kpi-value">{{ fmtAvg(overall.avg) }}</span><span class="kpi-label">{{ t('surveys.avgScore') }}</span></div>
        <div class="card kpi"><span class="kpi-icon">📣</span><span class="kpi-value">{{ fmtEnps(overall.enps) }}</span><span class="kpi-label">eNPS</span></div>
        <div class="card kpi"><span class="kpi-icon">🗳️</span><span class="kpi-value">{{ overall.count }}</span><span class="kpi-label">{{ t('surveys.responses') }}</span></div>
      </section>

      <section class="card">
        <h2 class="card-title">eNPS</h2>
        <p class="muted small">{{ t('surveys.enpsFormula') }}</p>
        <div class="nps-bar" v-if="overall.npsCount">
          <span class="seg seg-d" :style="{ width: npsBar.d + '%' }" v-if="npsBar.d">{{ npsBar.d }}%</span>
          <span class="seg seg-pa" :style="{ width: npsBar.pa + '%' }" v-if="npsBar.pa">{{ npsBar.pa }}%</span>
          <span class="seg seg-p" :style="{ width: npsBar.p + '%' }" v-if="npsBar.p">{{ npsBar.p }}%</span>
        </div>
        <div class="legend small">
          <span><i class="lg lg-d"></i>{{ t('surveys.detractors') }} (0–6): {{ overall.detractors }}</span>
          <span><i class="lg lg-pa"></i>{{ t('surveys.passives') }} (7–8): {{ overall.passives }}</span>
          <span><i class="lg lg-p"></i>{{ t('surveys.promoters') }} (9–10): {{ overall.promoters }}</span>
        </div>
      </section>

      <section class="card flush">
        <h2 class="card-title pad">{{ t('surveys.byTemplate') }}</h2>
        <table class="rtable">
          <thead><tr><th>{{ t('surveys.template') }}</th><th>{{ t('surveys.responses') }}</th><th>{{ t('surveys.avgScore') }}</th><th>eNPS</th></tr></thead>
          <tbody>
            <tr v-for="x in perTemplate" :key="x.tpl.id">
              <td :data-label="t('surveys.template')"><strong>{{ t('surveys.dayN', { n: x.tpl.day }) }}</strong></td>
              <td :data-label="t('surveys.responses')">{{ x.s.count }}</td>
              <td :data-label="t('surveys.avgScore')">{{ fmtAvg(x.s.avg) }}</td>
              <td :data-label="'eNPS'">{{ fmtEnps(x.s.enps) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card flush">
        <div class="row-between wrap pad gap-sm">
          <h2 class="card-title nomargin">{{ t('surveys.responseList') }}</h2>
          <select v-model="tplFilter" :aria-label="t('surveys.template')">
            <option value="all">{{ t('common.all') }}</option>
            <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ t('surveys.dayN', { n: tpl.day }) }}</option>
          </select>
        </div>
        <table class="rtable" v-if="shown.length">
          <thead><tr><th>{{ t('fields.employee') }}</th><th>{{ t('surveys.template') }}</th><th>{{ t('fields.date') }}</th><th>{{ t('surveys.avgScore') }}</th><th>NPS</th><th>{{ t('surveys.comment') }}</th></tr></thead>
          <tbody>
            <tr v-for="r in shown" :key="r.id">
              <td :data-label="t('fields.employee')"><a class="link" :href="'#/employee/' + r.employeeId">{{ personName(r.employeeId) }}</a></td>
              <td :data-label="t('surveys.template')">{{ t('surveys.dayN', { n: tplDay(r.templateId) }) }}</td>
              <td :data-label="t('fields.date')">{{ fmtDate(r.createdAt) }}</td>
              <td :data-label="t('surveys.avgScore')">{{ fmtAvg(responseAvg(r)) }}</td>
              <td :data-label="'NPS'">{{ responseNps(r) ?? '—' }}</td>
              <td :data-label="t('surveys.comment')">{{ responseComment(r) || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <ui-empty v-else icon="📝" :text="t('surveys.noResponses')"></ui-empty>
      </section>
    </template>
  </div>`,
};
