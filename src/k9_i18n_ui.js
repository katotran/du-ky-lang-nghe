    /* =================================================================================
     * N. ĐA NGÔN NGỮ VI / EN — giao diện chuyển ngôn ngữ & vẽ lại chữ trong cảnh 3D
     *    · Bộ dịch (tools/i18n_runtime.js) lo chữ trên trang HTML; file này lo nút chuyển và chữ vẽ lên canvas 3D
     *    · Từ điển nằm ở src/i18n/*.tsv, chuỗi mới chưa có bản dịch sẽ hiện tiếng Việt (xem: node tools/i18n.js missing)
     * ================================================================================= */
    // ---------- 1. Nút chuyển ngôn ngữ ----------
    function langToggleEl(extra) {
        const box = document.createElement('div');
        box.className = 'dk-lang-toggle' + (extra ? ' ' + extra : '');
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', 'Language / Ngôn ngữ');
        box.innerHTML = '<i class="fa-solid fa-globe"></i><button type="button" data-lang="vi" title="Tiếng Việt">VI</button><button type="button" data-lang="en" title="English">EN</button>';
        box.querySelectorAll('button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); setLang(b.dataset.lang); }));
        return box;
    }
    function syncToggles() { document.querySelectorAll('.dk-lang-toggle button').forEach(b => b.classList.toggle('on', b.dataset.lang === getLang())); }
    (function injectStyle() {
        const st = document.createElement('style');
        st.textContent = `
        .dk-lang-toggle { display: inline-flex; align-items: center; gap: 2px; padding: 3px 4px 3px 8px; border-radius: 999px; background: linear-gradient(180deg, #7a1618, #5c0f12); border: 1.5px solid #d4963a; box-shadow: 0 3px 8px rgba(60, 6, 10, .35); color: #fcd34d; font-size: 11px; line-height: 1; pointer-events: auto; }
        .dk-lang-toggle i { font-size: 12px; margin-right: 4px; opacity: .9; }
        .dk-lang-toggle button { border: 0; background: transparent; color: #f6dc9a; font-weight: 800; letter-spacing: .5px; font-size: 11px; padding: 5px 9px; border-radius: 999px; cursor: pointer; transition: background .15s, color .15s; }
        .dk-lang-toggle button:hover { background: rgba(255, 255, 255, .12); }
        .dk-lang-toggle button.on { background: linear-gradient(180deg, #fcd34d, #e0a82e); color: #5c0f12; box-shadow: inset 0 1px 0 rgba(255,255,255,.5); }
        .dk-lang-toggle.dk-lang-lobby { position: absolute; top: 12px; right: 12px; z-index: 5; }`;
        document.head.appendChild(st);
    })();
    function placeToggles() {
        if (!document.querySelector('header .dk-lang-toggle')) {
            const left = document.querySelector('header .hud-interactive');
            if (left) left.appendChild(langToggleEl());
        }
        const lobby = document.getElementById('dk-lobby');
        if (lobby && !lobby.querySelector('.dk-lang-toggle')) { const card = lobby.firstElementChild || lobby; card.style.position = card.style.position || 'relative'; card.appendChild(langToggleEl('dk-lang-lobby')); }
        syncToggles();
    }
    window.addEventListener('load', () => { setTimeout(placeToggles, 0); setTimeout(placeToggles, 400); });
    new MutationObserver(() => { if (document.getElementById('dk-lobby') && !document.querySelector('#dk-lobby .dk-lang-toggle')) placeToggles(); }).observe(document.body, { childList: true });

    // ---------- 2. Chữ vẽ lên canvas: dịch ngay lúc vẽ ----------
    const _fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxW) {
        if (getLang() === 'en' && typeof text === 'string') {
            const t = i18nText(text);
            if (t !== text) {
                text = t;
                const c = this.canvas;
                if (maxW === undefined && c && c.width === 384 && c.height === 112 && x >= 100) maxW = 268;   // nhãn ô: co chữ cho vừa
            }
        }
        return maxW === undefined ? _fillText.call(this, text, x, y) : _fillText.call(this, text, x, y, maxW);
    };

    // ---------- 3. Tên ngắn trên nhãn ô (VI → EN) ----------
    const SHORT_STRIP = /\b(Village|Craft|Heritage|Traditional)\b\s*/g;
    function viShort(n) { return n.replace(/Làng |Vườn |Cánh Đồng |Đồi /g, ''); }
    function registerShortNames() {
        BOARD_TILES.forEach(t => {
            const en = i18nTextOf(t.name); if (!en || en === t.name) return;
            const short = en.replace(SHORT_STRIP, '').replace(/\s+/g, ' ').trim() || en, v = viShort(t.name);
            i18nAddPair(v, short); i18nAddPair(v.slice(0, 16), short);
        });
    }
    const i18nTextOf = s => { const l = getLang(); if (l === 'en') return i18nText(s); return null; };

    // ---------- 4. create3DTextSprite: ghi nhớ để vẽ lại khi đổi ngôn ngữ ----------
    const _sprite = create3DTextSprite, SPRITES = [];
    create3DTextSprite = function (text, bg, fg, bold) {
        const sp = _sprite(text, bg, fg, bold);
        SPRITES.push({ sp, args: [text, bg, fg, bold] });
        return sp;
    };
    function redrawSprites() {
        for (let i = SPRITES.length - 1; i >= 0; i--) {
            const { sp, args } = SPRITES[i];
            if (!sp.parent && !sp.material) { SPRITES.splice(i, 1); continue; }
            const fresh = _sprite(...args), old = sp.material.map;
            sp.material.map = fresh.material.map; sp.material.needsUpdate = true;
            if (old && old.dispose) old.dispose();
            fresh.material.dispose();
        }
    }

    // ---------- 5. Làm mới giao diện sau khi đổi ngôn ngữ ----------
    function refreshGameUI() {
        try { registerShortNames(); } catch (e) { }
        try { BOARD_TILES.forEach((_, i) => updateTile3DBadge(i)); } catch (e) { console.warn('badge', e); }
        try { redrawSprites(); } catch (e) { console.warn('sprites', e); }
        try { updateAllHUD(); } catch (e) { }
        try { updateTileInspector(gameState.selectedTileIndex || 0); } catch (e) { }
        try { const l = document.getElementById('label-toggle-text'); if (l && l.textContent) l.textContent = i18nText(l.textContent); } catch (e) { }
        if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
        syncToggles();
    }
    let _first = true;
    document.addEventListener('langchange', () => {
        // lần đầu (ngay sau khi game dựng xong) chỉ cần đồng bộ nút; các lần sau mới làm mới toàn bộ
        if (_first) { _first = false; try { registerShortNames(); } catch (e) { } if (getLang() === 'vi') { syncToggles(); return; } }
        setTimeout(refreshGameUI, 0);
    });
