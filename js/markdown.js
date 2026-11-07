// markdown.js — chatbot cavabları üçün kiçik və təhlükəsiz markdown renderer
// Dəstəklənir: başlıqlar, paraqraflar, qalın/kursiv/üstüxətli, `kod`, kod blokları, linklər (yalnız http/https),
// iç-içə siyahılar (• və 1.), cədvəllər (GitHub üslubu, sütun düzləndirməsi), sitat (>), ayırıcı xətt (---).
// Əvvəl bütün mətn HTML-escape olunur, sonra yalnız bizim yaratdığımız teqlər əlavə edilir.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(raw) {
  let s = esc(raw);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+?)__/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[Number(i)]}</code>`);
  return s;
}

const RE = {
  fence: /^\s*```/,
  heading: /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/,
  hr: /^\s{0,3}([-*_])(\s*\1){2,}\s*$/,
  quote: /^\s{0,3}>\s?(.*)$/,
  ul: /^(\s*)[-*+•]\s+(.*)$/,
  ol: /^(\s*)(\d+)[.)]\s+(.*)$/,
  tableSep: /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/,
};

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = []; let cur = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (s[i] === '|') { cells.push(cur.trim()); cur = ''; continue; }
    cur += s[i];
  }
  cells.push(cur.trim());
  return cells;
}

function isTableStart(lines, i) {
  return i + 1 < lines.length && lines[i].includes('|') && RE.tableSep.test(lines[i + 1]) && splitRow(lines[i]).length >= 2;
}

function renderTable(lines, i) {
  const head = splitRow(lines[i]);
  const aligns = splitRow(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : ''));
  const rows = [];
  let j = i + 2;
  while (j < lines.length && lines[j].trim() && lines[j].includes('|')) { rows.push(splitRow(lines[j])); j++; }
  const n = head.length;
  const cell = (tag, txt, k) => `<${tag}${aligns[k] ? ` style="text-align:${aligns[k]}"` : ''}>${inline(txt || '')}</${tag}>`;
  const html = `<div class="md-table"><table><thead><tr>${head.map((h, k) => cell('th', h, k)).join('')}</tr></thead><tbody>${
    rows.map((r) => `<tr>${Array.from({ length: n }, (_, k) => cell('td', r[k], k)).join('')}</tr>`).join('')}</tbody></table></div>`;
  return { html, next: j };
}

function renderList(lines, i) {
  // iç-içə siyahılar: girinti səviyyəsinə görə stek
  const out = [];
  const stack = []; // { type, indent }
  let j = i;
  const open = (type, indent, start) => { stack.push({ type, indent }); out.push(type === 'ol' && start && start !== 1 ? `<ol start="${start}">` : `<${type}>`); };
  const closeTop = () => { const top = stack.pop(); out.push(`</li></${top.type}>`); };
  while (j < lines.length) {
    const line = lines[j];
    const m = line.match(RE.ul) || line.match(RE.ol);
    if (!m) {
      // siyahı elementinin davamı (girintili sətir)
      if (line.trim() && /^\s{2,}/.test(line) && stack.length && !RE.heading.test(line) && !isTableStart(lines, j)) {
        out.push(`<br>${inline(line.trim())}`); j++; continue;
      }
      // siyahı elementləri arasında tək boş sətir — siyahı davam edir
      if (!line.trim() && j + 1 < lines.length && (RE.ul.test(lines[j + 1]) || RE.ol.test(lines[j + 1]))) { j++; continue; }
      break;
    }
    const isOl = !!line.match(RE.ol) && !line.match(RE.ul);
    const type = isOl ? 'ol' : 'ul';
    const indent = m[1].replace(/\t/g, '    ').length;
    const text = isOl ? m[3] : m[2];
    const start = isOl ? Number(m[2]) : null;
    while (stack.length && indent < stack[stack.length - 1].indent) closeTop();
    const top = stack[stack.length - 1];
    if (!top || indent > top.indent) {
      if (top && out.length) { /* yeni iç siyahı əvvəlki <li> içində açılır */ }
      open(type, indent, start);
      out.push(`<li>${inline(text)}`);
    } else {
      if (top.type !== type) { closeTop(); open(type, indent, start); out.push(`<li>${inline(text)}`); } else { out.push(`</li><li>${inline(text)}`); }
    }
    j++;
  }
  while (stack.length) closeTop();
  return { html: out.join(''), next: j };
}

export function renderMarkdown(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  const flush = () => { if (para.length) { out.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; } };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;
    if (RE.fence.test(line)) {
      flush();
      const code = []; i++;
      while (i < lines.length && !RE.fence.test(lines[i])) { code.push(lines[i]); i++; }
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`); i++; continue;
    }
    if (isTableStart(lines, i)) { flush(); const r = renderTable(lines, i); out.push(r.html); i = r.next; continue; }
    if ((m = line.match(RE.heading))) { flush(); const lvl = m[1].length <= 2 ? 4 : 5; out.push(`<h${lvl} class="md-h">${inline(m[2])}</h${lvl}>`); i++; continue; }
    if (RE.hr.test(line) && !para.length) { flush(); out.push('<hr>'); i++; continue; }
    if (RE.quote.test(line)) {
      flush(); const q = [];
      while (i < lines.length && (m = lines[i].match(RE.quote))) { q.push(m[1]); i++; }
      out.push(`<blockquote>${renderMarkdown(q.join('\n'))}</blockquote>`); continue;
    }
    if (RE.ul.test(line) || RE.ol.test(line)) { flush(); const r = renderList(lines, i); out.push(r.html); i = r.next; continue; }
    if (!line.trim()) { flush(); i++; continue; }
    para.push(line.trim()); i++;
  }
  flush();
  return out.join('');
}
