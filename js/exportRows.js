// exportRows.js — Excel eksportu üçün sətirlər (seçilmiş dildə sütun başlıqları ilə)
import { one, all } from './db.js';
import { i18n, t, tx, deptLabel } from './i18n.js';
import { formatDate, formatDateTime, employeeStatus, isOverdue, diffDays, TODAY } from './utils.js';
import {
  progressFor, overdueOf, dayInfo, fullName, personName, ackCount, ackOf, sectionsSorted, tasksOf, visibleAccessRequests,
  visibleFeedback, surveyTemplatesSorted, surveyState, responseOf, responseAvg, responseNps, responseComment, trainingsSorted,
  signatureOf, isEmployeeSigned, signedCount,
} from './store.js';

const d = (v) => formatDate(v, i18n.lang);
const dt = (v) => formatDateTime(v, i18n.lang);
const round1 = (v) => (v == null ? '' : Math.round(v * 10) / 10);

export function employeeRows(emps) {
  const total = sectionsSorted().length;
  return emps.map((e) => {
    const p = progressFor(e.id), day = dayInfo(e), st = employeeStatus(e);
    return {
      [t('fields.name')]: fullName(e),
      [t('fields.position')]: e.position,
      [t('fields.department')]: deptLabel(e.department),
      [t('fields.email')]: e.email,
      [t('fields.phone')]: e.phone,
      [t('fields.startDate')]: d(e.startDate),
      [t('fields.manager')]: personName(e.managerId),
      [t('roles.buddy')]: e.buddyId ? personName(e.buddyId) : '',
      [t('fields.status')]: t('status.' + st),
      [t('export.day')]: st === 'preboarding' ? 0 : day.shown,
      [t('export.daysToStart')]: st === 'preboarding' ? day.untilStart : '',
      [t('export.progressPct')]: p.pct,
      [t('export.tasksDone')]: p.done,
      [t('export.tasksTotal')]: p.total,
      [t('status.overdue')]: overdueOf(e.id).length,
      Handbook: `${ackCount(e.id)}/${total}`,
    };
  });
}

export function taskRows(tasks, withEmployee) {
  return tasks.map((tk) => ({
    ...(withEmployee ? { [t('fields.employee')]: personName(tk.employeeId) } : {}),
    [t('export.phase')]: t('phases.' + tk.phase),
    [t('export.task')]: tx(tk, 'title'),
    [t('export.ownerRole')]: t('roles.' + tk.ownerRole),
    [t('export.dueDate')]: d(tk.dueDate),
    [t('fields.status')]: tk.status === 'done' ? t('export.done_') : isOverdue(tk) ? t('status.overdue') : t('export.todo'),
    [t('export.daysLate')]: isOverdue(tk) ? diffDays(TODAY, tk.dueDate) : '',
    [t('export.doneAt')]: tk.doneAt ? dt(tk.doneAt) : '',
  }));
}

export function accessRows(reqs, withEmployee = true) {
  return reqs.map((r) => {
    const sys = one('systems', r.systemId);
    const last = (r.history || [])[r.history.length - 1];
    return {
      ...(withEmployee ? { [t('fields.employee')]: personName(r.employeeId) } : {}),
      [t('fields.system')]: sys ? sys.name : r.systemId,
      [t('access.owner')]: sys ? sys.ownerName : '',
      [t('fields.level')]: t('levels.' + r.level),
      [t('fields.requestedBy')]: personName(r.requestedBy),
      [t('fields.date')]: dt(r.createdAt),
      [t('fields.status')]: t('accessStatus.' + r.status),
      [t('export.lastChange')]: last ? dt(last.at) : '',
      [t('access.reason')]: (last && last.reason) || '',
      [t('fields.note')]: r.note || '',
    };
  });
}

export function accessHistoryRows(reqs) {
  return reqs.flatMap((r) => (r.history || []).map((h) => ({
    [t('fields.employee')]: personName(r.employeeId),
    [t('fields.system')]: (one('systems', r.systemId) || {}).name || r.systemId,
    [t('fields.status')]: t('accessStatus.' + h.status),
    [t('fields.date')]: dt(h.at),
    [t('export.by')]: personName(h.by),
    [t('access.reason')]: h.reason || '',
  })));
}

export function feedbackRows(list) {
  return list.map((f) => ({
    [t('fields.employee')]: personName(f.employeeId),
    [t('feedback.window')]: f.window,
    [t('export.from')]: `${personName(f.fromId)} (${t('roles.' + f.fromRole)})`,
    [t('feedback.to')]: `${personName(f.toId)} (${t('roles.' + f.toRole)})`,
    [t('feedback.rating')]: f.rating,
    [t('feedback.strengths')]: f.strengths,
    [t('feedback.improvements')]: f.improvements,
    [t('feedback.shareWithEmployee')]: f.toRole === 'employee' ? (f.sharedWithEmployee ? t('export.yes') : t('export.no')) : '',
    [t('fields.date')]: dt(f.createdAt),
  }));
}

/** Hər sual ayrıca sütun kimi */
export function surveyResponseRows(responses) {
  return responses.map((r) => {
    const tpl = one('surveyTemplates', r.templateId);
    const row = {
      [t('fields.employee')]: personName(r.employeeId),
      [t('surveys.template')]: tpl ? t('surveys.dayN', { n: tpl.day }) : r.templateId,
      [t('fields.date')]: dt(r.createdAt),
      [t('surveys.avgScore')]: round1(responseAvg(r)),
      NPS: responseNps(r) ?? '',
      [t('surveys.comment')]: responseComment(r),
    };
    (tpl ? tpl.questions : []).forEach((q, i) => {
      if (q.type !== 'text') row[`Q${i + 1}`] = r.answers ? r.answers[q.id] ?? '' : '';
    });
    return row;
  });
}

export function surveyQuestionRows() {
  return surveyTemplatesSorted().flatMap((tpl) => tpl.questions.map((q, i) => ({
    [t('surveys.template')]: t('surveys.dayN', { n: tpl.day }),
    '#': `Q${i + 1}`,
    [t('export.type')]: q.type === 'scale5' ? '1–5' : q.type === 'nps' ? 'eNPS 0–10' : t('surveys.comment'),
    [t('export.question')]: tx(q, 'text'),
  })));
}

export function employeeSurveyRows(emp) {
  return surveyTemplatesSorted().map((tpl) => {
    const r = responseOf(emp.id, tpl.id);
    return {
      [t('surveys.template')]: t('surveys.dayN', { n: tpl.day }),
      [t('fields.status')]: t('surveyState.' + surveyState(emp, tpl)),
      [t('fields.date')]: r ? dt(r.createdAt) : '',
      [t('surveys.avgScore')]: r ? round1(responseAvg(r)) : '',
      NPS: r ? responseNps(r) ?? '' : '',
    };
  });
}

export function handbookRowsForEmployee(empId) {
  return sectionsSorted().map((s) => {
    const a = ackOf(empId, s.id);
    return { '#': s.order, [t('handbook.sections')]: tx(s, 'title'), [t('fields.status')]: a ? t('export.read') : t('handbook.unread'), [t('fields.date')]: a ? dt(a.at) : '' };
  });
}

/** İşçi × bölmə matrisi */
export function handbookMatrixRows(emps) {
  const secs = sectionsSorted();
  return emps.map((e) => {
    const row = { [t('fields.employee')]: fullName(e), [t('fields.status')]: t('status.' + employeeStatus(e)), [t('export.readCount')]: `${ackCount(e.id)}/${secs.length}` };
    secs.forEach((s) => { row[`${s.order}. ${tx(s, 'title')}`] = ackOf(e.id, s.id) ? '✓' : ''; });
    return row;
  });
}

export function trainingRows(list) {
  return list.map((tr) => ({
    [t('fields.title')]: tx(tr, 'title'),
    [t('fields.date')]: d(tr.date),
    [t('roles.trainer')]: personName(tr.trainerId),
    [t('trainings.participants')]: tr.participantIds.length,
    [t('export.completedSigs')]: signedCount(tr),
    [t('export.participantNames')]: tr.participantIds.map(personName).join(', '),
  }));
}

export function participantRows(trainings, onlyEmployeeId) {
  return trainings.flatMap((tr) => tr.participantIds.filter((p) => !onlyEmployeeId || p === onlyEmployeeId).map((pid) => {
    const s = signatureOf(tr.id, pid);
    return {
      [t('nav.trainings')]: tx(tr, 'title'),
      [t('fields.date')]: d(tr.date),
      [t('fields.name')]: personName(pid),
      [t('trainings.empSignature')]: isEmployeeSigned(s) ? t('export.yes') : t('export.no'),
      [t('export.empSignedAt')]: s.employeeSignedAt ? dt(s.employeeSignedAt) : '',
      [t('trainings.trainerSignature')]: s.status === 'completed' ? t('export.yes') : t('export.no'),
      [t('export.trainerSignedAt')]: s.trainerSignedAt ? dt(s.trainerSignedAt) : '',
      [t('fields.status')]: t('sigStatus.' + s.status),
    };
  }));
}

export function systemRows() {
  return all('systems').sort((a, b) => a.name.localeCompare(b.name, 'az')).map((s) => ({
    [t('settings.systemName')]: s.name, [t('access.owner')]: s.ownerName, [t('settings.ownerEmail')]: s.ownerEmail,
    [t('settings.notifyEmails')]: (s.notifyEmails || []).join(', '),
  }));
}

export function profileInfoRows(e) {
  const p = progressFor(e.id), day = dayInfo(e), st = employeeStatus(e);
  const kv = [
    [t('fields.name'), fullName(e)], [t('fields.position'), e.position], [t('fields.department'), deptLabel(e.department)],
    [t('fields.email'), e.email], [t('fields.phone'), e.phone], [t('fields.startDate'), d(e.startDate)],
    [t('fields.manager'), personName(e.managerId)], [t('roles.buddy'), e.buddyId ? personName(e.buddyId) : ''],
    [t('fields.status'), t('status.' + st)], [t('export.day'), st === 'preboarding' ? 0 : day.shown],
    [t('export.progressPct'), p.pct], [t('export.tasksDone'), `${p.done}/${p.total}`], [t('status.overdue'), overdueOf(e.id).length],
    ['Handbook', `${ackCount(e.id)}/${sectionsSorted().length}`],
  ];
  return kv.map(([k, v]) => ({ [t('export.field')]: k, [t('export.value')]: v }));
}

export function profileSheets(e) {
  return [
    { name: t('export.sheetProfile'), rows: profileInfoRows(e) },
    { name: t('profile.tabs.plan'), rows: taskRows(tasksOf(e.id)) },
    { name: 'Access', rows: accessRows(visibleAccessRequests().filter((r) => r.employeeId === e.id), false) },
    { name: 'Handbook', rows: handbookRowsForEmployee(e.id) },
    { name: 'Feedback', rows: feedbackRows(visibleFeedback().filter((f) => f.employeeId === e.id)) },
    { name: t('profile.tabs.surveys'), rows: employeeSurveyRows(e) },
    { name: t('profile.tabs.trainings'), rows: participantRows(trainingsSorted().filter((tr) => tr.participantIds.includes(e.id)), e.id) },
  ];
}
