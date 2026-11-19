/* Bộ dịch VI/EN chạy trong trình duyệt (được tools/i18n.js chèn vào <head> khi dựng).
 *
 *  Hai lớp bổ sung cho nhau:
 *   1) Lúc tạo chuỗi:  __t('chuỗi')  và  __tt`mẫu ${a} ${b}`  (mã nguồn được bọc tự động khi dựng) trả về đúng ngôn ngữ
 *      hiện tại ngay khi phát sinh (nhật ký, hộp thoại, bảng người chơi...).
 *   2) Lúc đổi ngôn ngữ:  setLang('vi'|'en')  duyệt lại toàn bộ chữ đang hiện trên trang và dịch theo CẢ HAI chiều
 *      (khớp nguyên văn hoặc theo mẫu có {0},{1}), nên chữ đã hiện từ trước vẫn đổi được mà không cần dựng lại ván.
 *      Chữ vẽ lên canvas 3D được vẽ lại qua các hàm đăng ký bằng onLangChange(fn).
 *
 *  Dữ liệu gốc của game luôn là tiếng Việt: trong lúc nạp script (chưa tới sự kiện load) __t/__tt giữ nguyên tiếng Việt;
 *  từ sự kiện load trở đi chúng dịch theo ngôn ngữ đã lưu. */
function __i18nInit() {
  var W = window, KEY = 'dkln_lang', lang = 'vi', active = false;
  var D = W.__I18N_DICT || {};
  var VIRE = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  var decode = function (s) { return s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'); };
  var cache = new Map(), tplKey = new WeakMap(), redraw = [];
  try { var saved = localStorage.getItem(KEY); if (saved === 'en' || saved === 'vi') lang = saved; } catch (e) { }

  /* ---------- Từ điển hai chiều: nguyên văn + mẫu ---------- */
  var ex = { en: new Map(), vi: new Map() };   // ex.en: VI->EN ; ex.vi: EN->VI   (khoá đã chuẩn hoá)
  var pats = { en: [], vi: [] };               // mẫu có {n}: {re, groups:[n...], to:'...', need:'chuỗi cố định dài nhất'}
  var ATTR_RE = /\b(title|placeholder|alt|aria-label)="([^"]*)"/g;
  function addPair(vi, en) {
    vi = norm(vi); en = norm(en); if (!vi || !en || (vi === en && !/\{\d+\}/.test(vi))) return;
    if (/\{\d+\}/.test(vi) || /\{\d+\}/.test(en)) { addPat('en', vi, en); addPat('vi', en, vi); return; }
    if (!ex.en.has(vi)) ex.en.set(vi, en);
    if (!ex.vi.has(en)) ex.vi.set(en, vi);
  }
  function addPat(dir, from, to) {
    var lits = from.split(/\{\d+\}/), groups = (from.match(/\{(\d+)\}/g) || []).map(function (g) { return +g.slice(1, -1); });
    var need = lits.reduce(function (a, b) { return b.length > a.length ? b : a; }, '');
    if (need.replace(/[\s.,:;!?·•()\-–—|/]/g, '').length < 3) return;       // mẫu quá ngắn dễ khớp nhầm
    var toN = (to.match(/\{(\d+)\}/g) || []).map(function (g) { return +g.slice(1, -1); });
    if (toN.some(function (n) { return groups.indexOf(n) < 0; })) return;      // câu đích dùng biến mà câu nguồn không có
    var src = lits.map(function (l) { return l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('(.+?)');
    pats[dir].push({ re: new RegExp('^' + src + '$'), groups: groups, to: to, need: need });
  }
  // tách một mẫu HTML thành (thẻ đã che giá trị thuộc tính, các đoạn chữ, các giá trị thuộc tính)
  function split(s) {
    var parts = s.split(/(<[^>]*>)/), tags = [], texts = [], attrs = [];
    for (var i = 0; i < parts.length; i++) {
      if (i % 2) { tags.push(parts[i].replace(ATTR_RE, function (m, a, v) { attrs.push(v); return a + '="§"'; })); }
      else { var t = norm(decode(parts[i])); if (t) texts.push(t); }
    }
    return { tags: tags, texts: texts, attrs: attrs };
  }
  // đoạn chữ ghép cặp theo vị trí chỉ đáng tin khi cả hai bên đều có chữ thật và cùng các biến {n} (tránh ghép lệch khi câu EN đổi trật tự)
  function okFrag(vi, en) {
    var strip = function (t) { return t.replace(/\{\d+\}/g, ''); }, letters = /[A-Za-zÀ-ỹ].*[A-Za-zÀ-ỹ]/;
    if (!letters.test(strip(vi)) || !letters.test(strip(en))) return false;
    var ph = function (t) { return (t.match(/\{\d+\}/g) || []).sort().join(); };
    return ph(vi) === ph(en);
  }
  Object.keys(D).forEach(function (vi) {
    var en = D[vi];
    if (vi.indexOf('<') < 0 && en.indexOf('<') < 0) { addPair(decode(vi), decode(en)); return; }
    var a = split(vi), b = split(en);
    if (a.tags.join('') !== b.tags.join('') || a.texts.length !== b.texts.length || a.attrs.length !== b.attrs.length) return;
    for (var i = 0; i < a.texts.length; i++) if (okFrag(a.texts[i], b.texts[i])) addPair(a.texts[i], b.texts[i]);
    for (var j = 0; j < a.attrs.length; j++) if (okFrag(decode(a.attrs[j]), decode(b.attrs[j]))) addPair(decode(a.attrs[j]), decode(b.attrs[j]));
  });

  // dự phòng cho chữ ghép từ nhiều phần (ví dụ "#0 • Bến Khởi Hành"): tách theo dấu phân cách rồi dịch từng phần
  var SEPS = [' • ', ' · ', ' | ', ' - ', ': ', ', ', ' (', ') '];
  function convDeep(text, dir, depth) {
    var r = conv(text, dir); if (r !== null) return r;
    if ((depth || 0) > 2) return null;
    var pm = /^([\s"'“”‘’(\[•·\-–—]+)([\s\S]*?)([\s"'“”‘’)\].,;:!?…]*)$/.exec(text);   // bóc dấu ngoặc/nháy bao quanh
    if (pm && pm[2] && (pm[1] || pm[3]) && pm[2] !== text) { var pr = convDeep(pm[2], dir, (depth || 0) + 1); if (pr !== null) return pm[1] + pr + pm[3]; }
    var pm2 = /^([\s\S]*?)([\s"'“”‘’)\].,;:!?…]+)$/.exec(text);
    if (pm2 && pm2[1] && pm2[1] !== text) { var pr2 = convDeep(pm2[1], dir, (depth || 0) + 1); if (pr2 !== null) return pr2 + pm2[2]; }
    for (var s = 0; s < SEPS.length; s++) {
      var sep = SEPS[s]; if (text.indexOf(sep) < 0) continue;
      var parts = text.split(sep), changed = false;
      var out = parts.map(function (p) { var q = convDeep(p, dir, (depth || 0) + 1); if (q !== null && q !== p) { changed = true; return q; } return p; });
      if (changed) return out.join(sep);
    }
    return null;
  }
  // dịch một đoạn chữ thuần theo hướng dir ('en' = VI→EN, 'vi' = EN→VI); trả về null nếu không khớp
  function conv(text, dir) {
    var t = norm(text); if (!t) return null;
    var e = ex[dir].get(t); if (e !== undefined) return e;
    var list = pats[dir];
    for (var i = 0; i < list.length; i++) {
      var p = list[i]; if (t.indexOf(p.need) < 0) continue;
      var m = p.re.exec(t); if (!m) continue;
      var vals = {}; for (var k = 0; k < p.groups.length; k++) { var c = m[k + 1], cv = ex[dir].get(norm(c)); vals[p.groups[k]] = cv !== undefined ? cv : c; }
      return p.to.replace(/\{(\d+)\}/g, function (x, n) { return vals[n] !== undefined ? vals[n] : x; });
    }
    return null;
  }

  /* ---------- __t / __tt: dịch ngay lúc tạo chuỗi ---------- */
  var look = function (s) { var e = D[norm(s)]; return e === undefined ? s : e; };
  var tv = function (x) { return typeof x === 'string' && VIRE.test(x) ? look(x) : x; };
  W.__t = function (s) {
    if (!active || lang === 'vi' || typeof s !== 'string' || !VIRE.test(s)) return s;
    var r = cache.get(s); if (r === undefined) { r = look(s); cache.set(s, r); } return r;
  };
  W.__tt = function (s) {
    var v = arguments, i, r;
    if (!active || lang === 'vi') { r = s[0]; for (i = 1; i < s.length; i++) r += v[i] + s[i]; return r; }
    var k = tplKey.get(s);
    if (!k) { k = ''; for (i = 0; i < s.length; i++) k += (i ? '{' + (i - 1) + '}' : '') + s[i]; k = norm(k); tplKey.set(s, k); }
    var e = D[k];
    if (e === undefined) { r = s[0]; for (i = 1; i < s.length; i++) r += tv(v[i]) + s[i]; return r; }
    return e.replace(/\{(\d+)\}/g, function (m, n) { return tv(v[+n + 1]); });
  };
  // dịch chuỗi bất kỳ theo ngôn ngữ hiện tại (cho chữ vẽ lên canvas); không đổi nếu không có bản dịch
  W.i18nText = function (s) {
    if (typeof s !== 'string') return s;
    if (lang === 'en') { var r = convDeep(s, 'en'); return r === null ? s : r; }
    var q = convDeep(s, 'vi'); return q === null ? s : q;
  };
  W.i18nAddPair = function (vi, en) { addPair(vi, en); };   // bổ sung cặp dịch lúc chạy (ví dụ tên ngắn trên nhãn)
  W.getLang = function () { return lang; };
  W.onLangChange = function (fn) { redraw.push(fn); };

  /* ---------- dịch chữ đang hiện trên trang (hai chiều) ---------- */
  var ATTRS = ['title', 'placeholder', 'alt', 'aria-label'];
  var textNode = function (n) {
    var d = n.data, t = d.trim(); if (!t) return;
    var r = (lang === 'en' && !VIRE.test(d)) ? (ex.en.get(norm(d)) || null) : convDeep(d, lang === 'en' ? 'en' : 'vi');   // chữ Việt không dấu chỉ tra nguyên văn
    if (r === null) return;
    var lead = d.match(/^\s*/)[0], trail = d.match(/\s*$/)[0], out = lead + r + trail;
    if (out !== d) n.data = out;
  };
  var attrNode = function (el, a) {
    var d = el.getAttribute(a); if (!d) return;
    var r = (lang === 'en' && !VIRE.test(d)) ? (ex.en.get(norm(d)) || null) : convDeep(d, lang === 'en' ? 'en' : 'vi'); if (r !== null && r !== d) el.setAttribute(a, r);
  };
  var walk = function (root) {
    if (root.nodeType === 3) { if (root.parentNode && !/^(SCRIPT|STYLE)$/.test(root.parentNode.nodeName)) textNode(root); return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(root.nodeName)) return;
    var tw = document.createTreeWalker(root, 5), n = root;
    do {
      if (n.nodeType === 3) { if (!/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) textNode(n); }
      else for (var i = 0; i < ATTRS.length; i++) attrNode(n, ATTRS[i]);
    } while ((n = tw.nextNode()));
  };
  var obs = new MutationObserver(function (list) {
    if (lang !== 'en' || !active) return;
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'characterData') textNode(m.target);
      else if (m.type === 'attributes') attrNode(m.target, m.attributeName);
      else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
    }
  });
  var viTitle = null;   // tiêu đề gốc: đọc lúc dịch lần đầu vì <title> chưa có khi script này chạy
  function apply() {
    cache.clear();
    if (document.body) walk(document.body);
    if (viTitle === null) viTitle = document.title;
    var r = conv(viTitle, 'en'); document.title = lang === 'en' && r !== null ? r : viTitle;
    document.documentElement.lang = lang;
    redraw.forEach(function (fn) { try { fn(lang); } catch (e) { console.warn('i18n redraw', e); } });
  }
  W.setLang = function (l) {
    if (l !== 'vi' && l !== 'en' || l === lang) return; lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { }
    if (active) apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  };
  // chạy từ sự kiện load: bắt đầu dịch lúc tạo chuỗi + theo dõi DOM, và áp ngôn ngữ đã lưu
  function activate() {
    if (active) return; active = true;
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  W.i18nApply = apply;
  W.i18nActivate = function () { activate(); apply(); document.dispatchEvent(new CustomEvent('langchange', { detail: lang })); };
  document.documentElement.lang = lang;
  // phần HTML tĩnh (màn hình nạp...) dịch sớm nhất có thể để người dùng EN không thấy chữ Việt nhấp nháy
  document.addEventListener('DOMContentLoaded', function () { if (lang === 'en' && !active) { var a0 = active; apply(); } });
  // load: handler này đăng ký trước mọi handler khác nên chạy đầu tiên → game dựng giao diện bằng đúng ngôn ngữ
  window.addEventListener('load', function () { activate(); setTimeout(function () { W.i18nActivate(); }, 0); });
}
