// db.js — vahid data qatı: Firestore (firebaseConfig.apiKey doludursa) və ya localStorage (demo rejim)
import { firebaseConfig } from './firebase-config.js';
import { buildSeed } from './seed.js';

const { reactive } = Vue;

export const COLLECTIONS = [
  'users', 'employees', 'taskTemplates', 'employeeTasks', 'systems', 'accessRequests',
  'notifications', 'handbookSections', 'acknowledgements', 'feedback', 'surveyTemplates',
  'surveyResponses', 'trainings', 'trainingSignatures',
];

/** Yaddaşdakı reaktiv keş: cache[collection][id] = doc. Ekranlar buradan sinxron oxuyur. */
export const cache = reactive(Object.fromEntries(COLLECTIONS.map((c) => [c, {}])));

export const dbState = reactive({
  mode: 'demo',          // 'demo' | 'firestore'
  configured: !!(firebaseConfig && firebaseConfig.apiKey),
  ready: false,
  error: null,
  empty: false,
});

const LS_PREFIX = 'ob_';
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
let fs = null; // { db, m }

function lsRead(c) {
  try { return JSON.parse(localStorage.getItem(LS_PREFIX + c) || '{}'); } catch (e) { return {}; }
}
function lsWrite(c) {
  try { localStorage.setItem(LS_PREFIX + c, JSON.stringify(cache[c])); } catch (e) { console.warn('localStorage yazıla bilmədi', e); }
}
const clone = (o) => JSON.parse(JSON.stringify(o));

export async function init() {
  if (dbState.configured) {
    try {
      const appMod = await import(SDK + 'firebase-app.js');
      const m = await import(SDK + 'firebase-firestore.js');
      const app = appMod.initializeApp(firebaseConfig);
      fs = { db: m.getFirestore(app), m };
      await Promise.all(COLLECTIONS.map(async (c) => {
        const snap = await m.getDocs(m.collection(fs.db, c));
        const map = {};
        snap.forEach((d) => { map[d.id] = { ...d.data(), id: d.id }; });
        cache[c] = map;
      }));
      dbState.mode = 'firestore';
      dbState.empty = Object.keys(cache.employees).length === 0;
    } catch (e) {
      console.warn('Firestore-a qoşulmaq alınmadı, demo rejimə keçilir:', e);
      dbState.error = String((e && e.message) || e);
      fs = null;
      dbState.mode = 'demo';
    }
  }
  if (dbState.mode === 'demo') {
    COLLECTIONS.forEach((c) => { cache[c] = lsRead(c); });
    let seeded = null;
    try { seeded = localStorage.getItem(LS_PREFIX + 'seeded'); } catch (e) { /* ignore */ }
    if (!seeded || Object.keys(cache.employees).length === 0) await loadSeed();
  }
  dbState.ready = true;
}

function matches(doc, filters) {
  if (!filters) return true;
  return Object.entries(filters).every(([k, v]) => (Array.isArray(v) ? v.includes(doc[k]) : doc[k] === v));
}

/** Sinxron oxuma (keşdən) */
export function all(collection, filters) {
  return Object.values(cache[collection] || {}).filter((d) => matches(d, filters));
}
export function one(collection, id) {
  return (cache[collection] || {})[id] || null;
}

// ---------- Vahid asinxron API ----------
export async function list(collection, filters) { return all(collection, filters); }
export async function get(collection, id) { return one(collection, id); }

export async function set(collection, id, data) {
  const docData = clone({ ...data, id });
  cache[collection][id] = docData;
  if (fs) await fs.m.setDoc(fs.m.doc(fs.db, collection, id), docData);
  else lsWrite(collection);
  return docData;
}

export async function update(collection, id, patch) {
  const current = cache[collection][id];
  if (!current) throw new Error(`${collection}/${id} tapılmadı`);
  const p = clone(patch);
  Object.assign(current, p);
  if (fs) await fs.m.updateDoc(fs.m.doc(fs.db, collection, id), p);
  else lsWrite(collection);
  return current;
}

export async function remove(collection, id) {
  delete cache[collection][id];
  if (fs) await fs.m.deleteDoc(fs.m.doc(fs.db, collection, id));
  else lsWrite(collection);
}

/** Bir neçə sənədi birdən yazır (Firestore-da batch ilə) */
export async function setMany(collection, docs) {
  docs.forEach((d) => { cache[collection][d.id] = clone(d); });
  if (fs) await commitBatches(docs.map((d) => ({ type: 'set', c: collection, d })));
  else lsWrite(collection);
}

async function commitBatches(ops) {
  const { m, db } = fs;
  for (let i = 0; i < ops.length; i += 400) {
    const batch = m.writeBatch(db);
    ops.slice(i, i + 400).forEach((op) => {
      const ref = m.doc(db, op.c, op.id || op.d.id);
      if (op.type === 'delete') batch.delete(ref); else batch.set(ref, clone(op.d));
    });
    await batch.commit();
  }
}

export function isEmpty() {
  return COLLECTIONS.every((c) => Object.keys(cache[c]).length === 0);
}

/** Nümunə datanı yüklə: mövcud datanı silir və seed yazır */
export async function loadSeed() {
  const seed = buildSeed();
  if (fs) {
    const deletes = [];
    COLLECTIONS.forEach((c) => Object.keys(cache[c]).forEach((id) => deletes.push({ type: 'delete', c, id })));
    if (deletes.length) await commitBatches(deletes);
    const sets = [];
    COLLECTIONS.forEach((c) => (seed[c] || []).forEach((d) => sets.push({ type: 'set', c, d })));
    await commitBatches(sets);
  }
  COLLECTIONS.forEach((c) => {
    cache[c] = Object.fromEntries((seed[c] || []).map((d) => [d.id, d]));
    if (!fs) lsWrite(c);
  });
  if (!fs) { try { localStorage.setItem(LS_PREFIX + 'seeded', new Date().toISOString()); } catch (e) { /* ignore */ } }
  dbState.empty = false;
}
