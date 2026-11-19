#!/usr/bin/env node
/* =============================================================================
 * ĐA NGÔN NGỮ (VI / EN) — bước dựng thứ hai, chạy sau tools/build47.rb
 *
 *   node tools/i18n.js build   <index.html>   gói chuỗi tiếng Việt trong mọi <script> nội tuyến bằng
 *                                              __t(...) / __tt`...`, chèn bộ dịch + từ điển EN, ghi đè file
 *   node tools/i18n.js extract <index.html> <thư mục>
 *                                              xuất danh sách chuỗi cần dịch ra các file strings_NN.txt
 *   node tools/i18n.js missing <index.html>   liệt kê chuỗi chưa có bản dịch EN
 *
 * Từ điển: các file src/i18n/*.tsv — mỗi dòng "<mã băm>\t<bản tiếng Anh>"; mã băm = FNV-1a 32-bit của chuỗi gốc đã chuẩn hoá
 * (gộp khoảng trắng). Mẫu có biến nội suy dùng {0}, {1}... theo thứ tự xuất hiện. Không phụ thuộc thư viện ngoài.
 * ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const VI = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;
const norm = s => s.replace(/\s+/g, ' ').trim();
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const hash = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const DICT_DIR = path.join(__dirname, '..', 'src', 'i18n');   // các file *.tsv: mã băm \t bản tiếng Anh

// ---------- bóc ký tự thoát ----------
function cook(raw) {
  return raw.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r?\n|[\s\S])/g, (m, c) => {
    if (c[0] === 'u') return c[1] === '{' ? String.fromCodePoint(parseInt(c.slice(2, -1), 16)) : String.fromCharCode(parseInt(c.slice(1), 16));
    if (c[0] === 'x') return String.fromCharCode(parseInt(c.slice(1), 16));
    if (c === '\n' || c === '\r\n') return '';
    return { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0' }[c] !== undefined ? { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0' }[c] : c;
  });
}

// ---------- bộ quét JS: tìm chuỗi và mẫu (template) kể cả lồng nhau, bỏ qua chú thích & regex ----------
const KW_BEFORE_REGEX = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
function scanScript(src) {
  const out = [];   // { kind:'str'|'tpl', start, end, key, ctx }
  let i = 0;
  const n = src.length;
  // prev: token cuối cùng có nghĩa: {t:'punct'|'id'|'num'|'str'|'tpl'|'kw', v}
  function code(stopAtBrace) {
    let depth = 0, prev = null, prevprev = null;
    const push = tok => { prevprev = prev; prev = tok; };
    while (i < n) {
      const c = src[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
      if (c === '"' || c === "'") {
        const st = i; i++; let raw = '';
        while (i < n && src[i] !== c) { if (src[i] === '\\') { raw += src[i] + src[i + 1]; i += 2; } else { raw += src[i++]; } }
        i++;
        const val = cook(raw);
        const rec = { kind: 'str', start: st, end: i, val, prev: prev && prev.v, prevprev: prevprev && prevprev.v, prevT: prev && prev.t, next: null };
        out.push(rec); push({ t: 'str', v: val, rec }); continue;
      }
      if (c === '`') { const rec = template(); push({ t: 'tpl', rec }); continue; }
      if (c === '/') {
        // regex hay phép chia?
        const rx = !prev || (prev.t === 'punct' && ![')', ']', '}'].includes(prev.v)) || (prev.t === 'id' && KW_BEFORE_REGEX.has(prev.v));
        if (rx) {
          i++; let inCls = false;
          while (i < n) { const d = src[i]; if (d === '\\') { i += 2; continue; } if (d === '[') inCls = true; else if (d === ']') inCls = false; else if (d === '/' && !inCls) break; else if (d === '\n') break; i++; }
          i++; while (i < n && /[a-z]/i.test(src[i])) i++;
          push({ t: 'num', v: 'regex' }); continue;
        }
        i++; push({ t: 'punct', v: '/' }); continue;
      }
      if (c === '{') { depth++; i++; push({ t: 'punct', v: '{' }); continue; }
      if (c === '}') { if (stopAtBrace && depth === 0) { i++; return; } depth--; i++; push({ t: 'punct', v: '}' }); continue; }
      if (/[A-Za-z_$]/.test(c)) { let j = i + 1; while (j < n && /[\w$]/.test(src[j])) j++; push({ t: 'id', v: src.slice(i, j) }); i = j; continue; }
      if (/[0-9]/.test(c)) { let j = i + 1; while (j < n && /[\w.]/.test(src[j])) j++; push({ t: 'num', v: src.slice(i, j) }); i = j; continue; }
      // dấu câu (gộp toán tử nhiều ký tự để nhận biết ===, !== ...)
      const m = /^(?:===|!==|\.\.\.|=>|==|!=|<=|>=|&&|\|\||\?\?|\+\+|--|\*\*|[-+*%&|^]=|[^\s\w$])/.exec(src.slice(i, i + 3));
      const op = m ? m[0] : c; i += op.length; push({ t: 'punct', v: op });
      // ghi nhận token kế tiếp cho chuỗi ngay trước
      if (prevprev && prevprev.t === 'str' && prevprev.rec && prevprev.rec.next === null) prevprev.rec.next = op;
    }
  }
  function template() {
    const st = i; i++; const quasis = []; let raw = '', hasExpr = 0;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { raw += src[i] + src[i + 1]; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { quasis.push(raw); raw = ''; i += 2; hasExpr++; code(true); continue; }
      raw += src[i++];
    }
    i++; quasis.push(raw);
    const cooked = quasis.map(cook), key = cooked.map((q, k) => (k ? '{' + (k - 1) + '}' : '') + q).join('');
    const rec = { kind: 'tpl', start: st, end: i, key, hasVi: cooked.some(q => VI.test(q)), tagged: false };
    out.push(rec); return rec;
  }
  code(false);
  return out;
}

// ---------- chọn chuỗi nào được bọc ----------
const CMP = new Set(['===', '!==', '==', '!=']);
function isLogicCtx(r) {
  if (CMP.has(r.prev) || CMP.has(r.next)) return 'so sánh';
  if (r.prev === 'case') return 'case';
  if (r.prevT === 'punct' && r.prev === '[' && r.next === ']') return 'khoá []';
  if ((r.prev === '{' || r.prev === ',') && r.next === ':') return 'khoá đối tượng';
  return null;
}
function wrapEdits(src, recs, tplTagged) {
  const edits = [], skipped = [];
  recs.forEach(r => {
    if (r.kind === 'str') {
      if (!VI.test(r.val)) return;
      const why = isLogicCtx(r);
      if (why) { skipped.push([why, r.val]); return; }
      edits.push([r.start, '__t('], [r.end, ')']);
    } else if (r.hasVi) {
      // mẫu đã có tag phía trước (ví dụ String.raw`...`) thì bỏ qua
      let k = r.start - 1; while (k >= 0 && /\s/.test(src[k])) k--;
      if (/[\w$)\]]/.test(src[k] || '') && !/(?:return|case|typeof|in|of|else|do|yield|await|new|void|delete|throw)$/.test(src.slice(Math.max(0, k - 7), k + 1))) { skipped.push(['mẫu có tag', r.key]); return; }
      edits.push([r.start, '__tt']);
    }
  });
  return { edits, skipped };
}
function applyEdits(src, edits) {
  edits.sort((a, b) => a[0] - b[0]);
  let out = '', last = 0;
  edits.forEach(([p, t]) => { out += src.slice(last, p) + t; last = p; });
  return out + src.slice(last);
}

// ---------- tách các khối script nội tuyến & phần HTML tĩnh ----------
function splitHtml(html) {
  const parts = [], re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m, last = 0;
  while ((m = re.exec(html))) {
    const attrs = m[1], isJs = !/\bsrc=/.test(attrs) && !/type=["'](?!module|text\/javascript)/.test(attrs);
    parts.push({ html: html.slice(last, m.index + m[0].indexOf('>') + 1) }); last = m.index + m[0].indexOf('>') + 1;
    parts.push({ js: m[2], isJs }); last = m.index + m[0].length - '</script>'.length;
  }
  parts.push({ html: html.slice(last) });
  return parts;
}
function staticHtmlKeys(htmlParts) {
  const keys = new Set();
  const text = htmlParts.map(p => p.html || '').join('').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  text.replace(/>([^<>]+)</g, (m, t) => { const k = norm(decode(t)); if (VI.test(k)) keys.add(k); return m; });
  text.replace(/\b(?:title|placeholder|alt|aria-label|value|content)="([^"]*)"/g, (m, t) => { const k = norm(decode(t)); if (VI.test(k)) keys.add(k); return m; });
  return keys;
}
function collect(html) {
  const parts = splitHtml(html), keys = new Map();   // key -> {kind, n}
  const add = (k, kind) => { k = norm(k); if (!k || !VI.test(k)) return; const e = keys.get(k); if (e) e.n++; else keys.set(k, { kind, n: 1 }); };
  staticHtmlKeys(parts).forEach(k => add(k, 'html'));
  const plans = parts.map(p => {
    if (!p.js || !p.isJs || p.js.startsWith('/* i18n */')) return null;   // bỏ qua khối bộ dịch đã chèn
    const recs = scanScript(p.js);
    recs.forEach(r => { if (r.kind === 'str' && VI.test(r.val)) add(r.val, 'str'); if (r.kind === 'tpl' && r.hasVi) add(r.key, 'tpl'); });
    return recs;
  });
  return { parts, keys, plans };
}

// ---------- từ điển ----------
function loadDict() {
  const m = new Map();
  if (!fs.existsSync(DICT_DIR)) return m;
  fs.readdirSync(DICT_DIR).filter(f => f.endsWith('.tsv')).sort().forEach(f => fs.readFileSync(path.join(DICT_DIR, f), 'utf8').split('\n').forEach(l => { if (!l || l[0] === '#') return; const t = l.indexOf('\t'); if (t > 0) m.set(l.slice(0, t), l.slice(t + 1)); }));
  return m;
}

// mục dịch nhập tay: src/i18n/extra.txt, mỗi dòng "tiếng Việt<TAB>tiếng Anh" (cho chữ ghép lúc chạy mà mã không có nguyên câu)
function loadExtra() {
  const m = new Map(), f = path.join(DICT_DIR, 'extra.txt');
  if (fs.existsSync(f)) fs.readFileSync(f, 'utf8').split('\n').forEach(l => { if (!l || l[0] === '#') return; const t = l.indexOf('\t'); if (t > 0) m.set(norm(l.slice(0, t)), l.slice(t + 1)); });
  return m;
}

// ---------- bộ dịch chạy trong trình duyệt ----------
const RUNTIME = fs.readFileSync(path.join(__dirname, 'i18n_runtime.js'), 'utf8');

function build(file) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('__i18nInit')) throw new Error('file đã được xử lý đa ngôn ngữ rồi; hãy dựng lại từ đầu bằng tools/build47.rb');
  const { parts, keys, plans } = collect(html), dict = loadDict();
  // kiểm tra va chạm mã băm
  const byHash = new Map(); keys.forEach((v, k) => { const h = hash(k); if (byHash.has(h) && byHash.get(h) !== k) throw new Error('trùng mã băm: ' + k); byHash.set(h, k); });
  const D = {}; let miss = 0; keys.forEach((v, k) => { const e = dict.get(hash(k)); if (e !== undefined) D[k] = e; else miss++; });
  loadExtra().forEach((en, vi) => { if (D[vi] === undefined) D[vi] = en; });   // mục dịch nhập tay cho chữ ghép từ nhiều phần (không có trong mã)
  let wrapped = 0, skippedAll = [];
  const out = parts.map((p, idx) => {
    if (p.html !== undefined) return p.html;
    if (!p.isJs || !plans[idx]) return p.js;
    const { edits, skipped } = wrapEdits(p.js, plans[idx]); wrapped += edits.filter(e => e[1] !== ')').length; skippedAll = skippedAll.concat(skipped);
    return applyEdits(p.js, edits);
  });
  let res = out.join('');
  // bộ dịch phải chạy trước mọi script khác: chèn ngay sau <head>
  const boot = '<script>/* i18n */\n' + RUNTIME + '\nwindow.__I18N_DICT = ' + JSON.stringify(D).replace(/</g, '\\u003c') + ';\n__i18nInit();\n</script>';
  const hi = res.search(/<head[^>]*>/i); if (hi < 0) throw new Error('không thấy <head>');
  const he = res.indexOf('>', hi) + 1; res = res.slice(0, he) + '\n' + boot + '\n' + res.slice(he);
  // kiểm tra cú pháp từng script đã gói
  splitHtml(res).forEach(p => { if (p.js && p.isJs) { try { new Function(p.js); } catch (e) { throw new Error('script sau khi gói bị lỗi cú pháp: ' + e.message + '\n' + p.js.slice(0, 80)); } } });
  fs.writeFileSync(file, res);
  console.log(`i18n: ${keys.size} chuỗi, đã dịch ${keys.size - miss}, thiếu ${miss}; gói ${wrapped} vị trí; bỏ qua ${skippedAll.length} (ngữ cảnh logic)`);
  if (process.env.I18N_VERBOSE) skippedAll.forEach(s => console.log('  skip', s[0], JSON.stringify(s[1]).slice(0, 90)));
}
function extract(file, dir) {
  const { keys } = collect(fs.readFileSync(file, 'utf8')), dict = loadDict();
  const all = [...keys].filter(([k]) => !dict.has(hash(k)));
  fs.mkdirSync(dir, { recursive: true });
  const size = 120; let c = 0;
  for (let i = 0; i < all.length; i += size) { fs.writeFileSync(path.join(dir, 'strings_' + String(c++).padStart(2, '0') + '.txt'), all.slice(i, i + size).map(([k, v]) => hash(k) + '\t' + k).join('\n') + '\n'); }
  console.log(`cần dịch ${all.length}/${keys.size} chuỗi -> ${c} file trong ${dir}`);
}
function missing(file) {
  const { keys } = collect(fs.readFileSync(file, 'utf8')), dict = loadDict();
  [...keys].filter(([k]) => !dict.has(hash(k))).forEach(([k]) => console.log(hash(k) + '\t' + k));
}
function addEntries(file, pairs) { // add <file.tsv> 'VI=>EN' ...: thêm nhanh vài mục dịch
  const out = pairs.map(p => { const i = p.indexOf('=>'); const vi = norm(p.slice(0, i)); return hash(vi) + '\t' + p.slice(i + 2).trim(); });
  fs.appendFileSync(path.join(DICT_DIR, file), out.join('\n') + '\n'); console.log(out.join('\n'));
}
const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'add') addEntries(a, process.argv.slice(4)); else if (cmd === 'build') build(a); else if (cmd === 'extract') extract(a, b); else if (cmd === 'missing') missing(a);
else { console.error('dùng: node tools/i18n.js build|extract|missing <index.html> [thư mục]'); process.exit(1); }
