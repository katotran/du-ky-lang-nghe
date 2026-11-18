    /* =================================================================================
     * M. SẢNH CHỜ (LOBBY) · THẺ THÔNG TIN Ô KHÔNG HARDCODE · NÚT HÀNH ĐỘNG THEO LƯỢT · THU GỌN HUD
     * ================================================================================= */

    // ---------- 1. Đồng hồ 10:00 chỉ chạy sau khi bấm "Bắt Đầu Hành Trình" ----------
    const GAME_SECONDS = 10 * 60;
    gameState.remainingSeconds = GAME_SECONDS;
    const _startTimerK8 = start45MinTimer;
    let _timerStarted = false;
    start45MinTimer = function () { /* chờ Lobby */ };
    function startJourneyTimer() {
        if (_timerStarted) return;
        _timerStarted = true;
        gameState.remainingSeconds = GAME_SECONDS;
        _startTimerK8();
    }
    window.startJourneyTimer = startJourneyTimer;

    // ---------- 2. Thu gọn / mở cột phải (Thẻ thông tin ô + Nhật ký) ----------
    function setRightDrawerCollapsed(collapsed) {
        const ins = document.getElementById('tile-inspector');
        const log = document.getElementById('log-panel');
        const handle = document.getElementById('right-drawer-handle');
        if (!ins || !log || !handle) return;
        ins.classList.toggle('hidden', collapsed);
        log.classList.toggle('hidden', collapsed);
        handle.classList.toggle('hidden', !collapsed);
        handle.classList.toggle('flex', collapsed);
    }
    function toggleRightDrawer() {
        const ins = document.getElementById('tile-inspector');
        setRightDrawerCollapsed(!(ins && ins.classList.contains('hidden')));
    }
    window.toggleRightDrawer = toggleRightDrawer;

    // ---------- 3. Thẻ thông tin ô: mọi nội dung lấy từ đúng ô được chọn ----------
    const TYPE_INFO = {
        START: { label: 'Bến Khởi Hành', price: 'Qua ô nhận', rent: '+300đ' },
        SHOP: { label: 'Trạm Công Cụ', price: 'Mua Thẻ Công Cụ', rent: 'tại trạm' },
        BIEN_DONG: { label: 'Thẻ Biến Động (!)', price: 'Bốc 1 thẻ', rent: 'thực thi ngay' },
        BAN_LINH: { label: 'Thẻ Bản Lĩnh (?)', price: 'Bốc 1 thẻ', rent: 'giữ trên tay' }
    };
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v == null ? '' : v; };
    const showEl = (id, on) => { const el = document.getElementById(id); if (el) el.classList.toggle('hidden', !on); };

    updateTileInspector = function (tileIndex) {
        const tile = BOARD_TILES[tileIndex];
        if (!tile) return;
        gameState.selectedTileIndex = tileIndex;
        renderTileArtToCanvas(tile, document.getElementById('insp-Disconnect-canvas'));
        setText('insp-title', tile.name);
        showEl('insp-stats', true);

        if (tile.type === 'PROPERTY') {
            const ownerId = gameState.propertyOwners[tileIndex];
            const stars = starsOf(tileIndex);
            const owner = ownerId !== undefined ? PLAYERS[ownerId] : null;
            setText('insp-badge', `#${tileIndex} • ${owner ? `${starText(stars)} ${owner.shortName}` : '🌱 Chưa có chủ'}`);
            setText('insp-desc', owner
                ? (stars < STAR_CONFIG.maxStars ? `${stars} Sao (${STAR_CONFIG.levels[stars].name}) • ${tile.region}` : `5 Sao Chuẩn Quốc Tế • ${tile.region}`)
                : `Làng nghề chưa có chủ • ${tile.region}`);
            showEl('insp-row-price', true);
            showEl('insp-row-tool', true);
            setText('insp-price-label', owner ? (stars < STAR_CONFIG.maxStars ? 'Nâng cấp / Phí:' : 'Cấp / Phí:') : 'Đầu tư / Phí:');
            setText('insp-price', owner ? (stars < STAR_CONFIG.maxStars ? `+${tile.starCost[stars + 1]}đ` : 'Tối đa') : `${tile.starCost[1]}đ`);
            setText('insp-rent', `${tile.starRent[Math.max(1, stars)]}đ`);
            const tc = TOOL_CATEGORIES[tile.toolId];
            setText('insp-tool', `${tile.toolSpec}${tc ? ` (${tc.shortName})` : ''}`);
            setText('insp-situation', tile.situation ? `"${tile.situation}"` : '');
        } else {
            const info = TYPE_INFO[tile.type] || { label: 'Ô chức năng', price: '', rent: '' };
            setText('insp-badge', `#${tileIndex} • ${info.label}`);
            setText('insp-desc', `${tile.subtitle || info.label} • ${tile.region || ''}`);
            showEl('insp-row-price', true);
            showEl('insp-row-tool', false);
            setText('insp-price-label', 'Tác dụng:');
            setText('insp-price', info.price);
            setText('insp-rent', info.rent);
            setText('insp-tool', '');
            setText('insp-situation', tile.desc || '');
        }
        renderInspectorActions();
    };

    // ---------- 4. Nút hành động trong thẻ thông tin ô khi đến lượt người chơi ----------
    //   askInInspector(player, tile, mode) -> Promise<'invest'|'upgrade'|'pay'|'bargain'|'tool'|'vip'|'pass'>
    //   mode: 'UNOWNED' | 'OWN' | 'VISIT'
    let pendingAsk = null;
    function canUseInspectorButtons(player) {
        return !!player && !player.isNPC && !player.remote && !NET.routed && NET.role !== 'guest';
    }
    window.canUseInspectorButtons = canUseInspectorButtons;

    function askInInspector(player, tile, mode, extra) {
        return new Promise(resolve => {
            pendingAsk = { player, tile, mode, extra: extra || {}, resolve };
            setRightDrawerCollapsed(false);
            const body = document.getElementById('insp-body-wrap');
            if (body && body.classList.contains('hidden')) toggleElementBody('insp-body-wrap', 'insp-toggle-icon');
            updateTileInspector(tile.index);
            const box = document.getElementById('tile-inspector');
            if (box) { box.classList.remove('active-turn-glow'); void box.offsetWidth; box.classList.add('active-turn-glow'); }
        });
    }
    window.askInInspector = askInInspector;

    function finishAsk(choice) {
        if (!pendingAsk) return;
        const { resolve } = pendingAsk;
        pendingAsk = null;
        const box = document.getElementById('tile-inspector');
        if (box) box.classList.remove('active-turn-glow');
        renderInspectorActions();
        resolve(choice);
    }
    window.__inspAct = function (choice) {
        if (!pendingAsk) return;
        const b = document.querySelector(`#insp-actions [data-act="${choice}"]`);
        if (!b || b.disabled) return;
        playSFX('step');
        finishAsk(choice);
    };

    function renderInspectorActions() {
        const box = document.getElementById('insp-actions');
        if (!box) return;
        if (!pendingAsk) { box.classList.add('hidden'); box.innerHTML = ''; return; }
        const { player, tile, mode, extra } = pendingAsk;
        const stars = starsOf(tile.index);
        const isMax = stars >= STAR_CONFIG.maxStars;
        const investCost = extra.cost != null ? extra.cost : tile.starCost[1];
        const upCost = extra.cost != null ? extra.cost : (isMax ? 0 : tile.starCost[stars + 1]);
        const fee = extra.fee != null ? extra.fee : tile.starRent[Math.max(1, stars)];

        const btn = (act, label, sub, on, cls) => `
            <button data-act="${act}" onclick="__inspAct('${act}')" ${on ? '' : 'disabled'}
                class="${cls} w-full px-2 py-1.5 rounded-xl font-extrabold text-[11px] leading-tight text-left flex items-center justify-between gap-1 transition ${on ? '' : 'opacity-35 grayscale cursor-not-allowed'}">
                <span>${label}</span><span class="text-[10px] font-black shrink-0">${sub}</span>
            </button>`;
        const main = 'wood-btn';
        const off = 'bg-stone-300 text-stone-700 border-2 border-stone-400';

        const investOn = mode === 'UNOWNED' && player.cash >= investCost;
        const upOn = mode === 'OWN' && !isMax && player.cash >= upCost;
        const payOn = mode === 'VISIT';

        let extras = '';
        if (mode === 'UNOWNED' && extra.bargainCost != null) extras += btn('bargain', '🏷️ Thánh Mặc Cả (−30%)', `${extra.bargainCost}đ`, player.cash >= extra.bargainCost, 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-700');
        if (mode === 'OWN' && extra.bargainCost != null && !isMax) extras += btn('bargain', '🏷️ Thánh Mặc Cả (−30%)', `${extra.bargainCost}đ`, player.cash >= extra.bargainCost, 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-700');
        if (mode === 'VISIT' && extra.toolName) extras += btn('tool', `🛠️ Dùng thẻ "${extra.toolName}"`, 'Miễn phí', true, 'bg-teal-700 hover:bg-teal-600 text-white border-2 border-teal-300');
        if (mode === 'VISIT' && extra.hasVip) extras += btn('vip', '🎫 Dùng Vé Tham Quan VIP', 'Miễn phí', true, 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-700');

        const passLabel = mode === 'UNOWNED' ? 'Bỏ Qua' : (mode === 'OWN' ? (isMax ? 'Tiếp Tục' : 'Để Lượt Sau') : '');
        box.innerHTML = `
            <div class="text-[10px] font-extrabold uppercase text-red-800 mb-1 flex items-center justify-between">
                <span>🎯 Lượt của ${player.shortName}</span>
                <span class="text-amber-900 normal-case font-bold">Tiền: ${player.cash}đ</span>
            </div>
            ${tile.index !== gameState.selectedTileIndex ? `<button onclick="updateTileInspector(${tile.index})" class="w-full text-[10px] mb-1 underline text-amber-900">↩ Đang đứng ở #${tile.index} ${tile.name} — xem lại</button>` : ''}
            <div class="flex flex-col gap-1">
                ${btn('invest', '⭐ Đầu Tư Làng Nghề', mode === 'UNOWNED' ? `${investCost}đ` : '—', investOn, investOn ? main : off)}
                ${btn('upgrade', `⬆️ Nâng Cấp Sao (+1⭐)`, mode === 'OWN' ? (isMax ? 'Đã 5⭐' : `${upCost}đ`) : '—', upOn, upOn ? main : off)}
                ${btn('pay', '💸 Trải Nghiệm Dịch Vụ (Trả phí)', mode === 'VISIT' ? `${fee}đ` : '—', payOn, payOn ? main : off)}
                ${extras}
                ${passLabel ? `<button data-act="pass" onclick="__inspAct('pass')" class="w-full text-[11px] font-bold py-1 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800">${passLabel}</button>` : ''}
            </div>`;
        box.classList.remove('hidden');
    }

    // Cập nhật lại tiền/nút khi HUD thay đổi
    const _updHUDK8 = updateAllHUD;
    updateAllHUD = function () {
        _updHUDK8();
        if (pendingAsk) renderInspectorActions();
    };

    // ---------- 5. SẢNH CHỜ (LOBBY) ----------
    function buildLobby() {
        if (document.getElementById('dk-lobby')) return;
        const me = PLAYERS[0];
        let chosen = me.costumeKey;
        const wrap = document.createElement('div');
        wrap.id = 'dk-lobby';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;background:radial-gradient(circle at 50% 30%, rgba(122,22,24,.82), rgba(40,6,8,.94));backdrop-filter:blur(3px);overflow-y:auto;';
        const cards = PLAYERS.map(p => {
            const c = VIETNAMESE_COSTUMES[p.costumeKey];
            return `
                <button type="button" data-costume="${p.costumeKey}" class="dk-lobby-card text-left rounded-2xl p-2.5 border-2 transition flex flex-col gap-1" style="background:#fff8e6">
                    <div class="flex items-center gap-2">
                        <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style="background:${p.color}">${p.avatar}</span>
                        <div class="min-w-0">
                            <div class="font-extrabold text-[12px] text-amber-950 leading-tight">${c ? c.name.split('&')[0].trim() : p.costumeName}</div>
                            <div class="text-[10px] text-amber-800">Explorer ${p.id + 1}</div>
                        </div>
                    </div>
                    <div class="text-[10px] text-amber-900/80 leading-snug">${c ? c.desc : ''}</div>
                </button>`;
        }).join('');

        wrap.innerHTML = `
            <div class="kraft-card rounded-3xl w-full max-w-2xl p-4 md:p-6 my-auto">
                <div class="text-center">
                    <div class="text-4xl">🏯</div>
                    <h1 class="font-serif-vn font-extrabold text-2xl md:text-3xl text-red-900 leading-tight">Du Ký Làng Nghề 3D</h1>
                    <p class="text-xs text-amber-900/80">Sảnh chờ • Chuẩn bị hành trình qua 47 địa danh làng nghề Việt Nam</p>
                </div>

                <label class="block mt-4 text-[11px] font-extrabold uppercase text-amber-900">Tên của bạn</label>
                <input id="dk-lobby-name" type="text" maxlength="16" value="${me.shortName}"
                    class="mt-1 w-full px-3 py-2 rounded-xl border-2 border-amber-700 bg-amber-50 font-extrabold text-amber-950 text-sm">

                <div class="mt-4 text-[11px] font-extrabold uppercase text-amber-900">Chọn nhân vật Explorer</div>
                <div id="dk-lobby-cards" class="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">${cards}</div>

                <div class="mt-4 rounded-2xl bg-amber-900/10 border border-amber-800/30 p-3 text-[11px] text-amber-950 leading-relaxed">
                    <div class="font-extrabold text-amber-900 mb-1">📖 Tóm tắt luật chơi</div>
                    • 5 Thương Khách, mỗi người khởi đầu <b>300đ</b>. Tung xúc xắc đi vòng quanh 47 địa danh; qua Bến Khởi Hành nhận <b>+300đ</b>.<br>
                    • Dừng ở làng chưa có chủ: <b>[Đầu Tư Làng Nghề]</b> để đạt <b>1 Sao</b>. Quay lại làng mình ở lượt sau: <b>[Nâng Cấp Sao]</b> lên tối đa <b>5 Sao</b>.<br>
                    • Dừng ở làng của người khác: <b>[Trải Nghiệm Dịch Vụ]</b> trả phí theo số sao, hoặc dùng Thẻ Công Cụ / Vé VIP để miễn phí.<br>
                    • Ván kéo dài <b>10 phút</b>. Hết giờ sẽ kiểm kê tài sản (tiền + vốn đã đầu tư), người giàu nhất thắng.
                </div>

                <div class="mt-4 flex flex-col sm:flex-row gap-2">
                    <button id="dk-lobby-start" class="wood-btn flex-1 py-3 rounded-2xl font-extrabold text-base">🚩 Bắt Đầu Hành Trình</button>
                    <button id="dk-lobby-rules" class="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-4 py-3 rounded-2xl text-sm">Luật chi tiết</button>
                </div>
            </div>`;
        document.body.appendChild(wrap);

        const paint = () => wrap.querySelectorAll('.dk-lobby-card').forEach(b => {
            const on = b.dataset.costume === chosen;
            b.style.borderColor = on ? '#b3201f' : 'rgba(146,99,40,.35)';
            b.style.boxShadow = on ? '0 0 0 3px #e2b04a, 0 6px 14px rgba(0,0,0,.25)' : 'none';
            b.style.transform = on ? 'translateY(-2px)' : 'none';
        });
        wrap.querySelectorAll('.dk-lobby-card').forEach(b => b.onclick = () => { chosen = b.dataset.costume; playSFX('step'); paint(); });
        paint();

        document.getElementById('dk-lobby-rules').onclick = () => openRulesModal();
        document.getElementById('dk-lobby-start').onclick = () => {
            const nm = (document.getElementById('dk-lobby-name').value || '').trim();
            if (nm) { me.shortName = nm; me.name = `${nm} (Bạn)`; }
            // Đổi nhân vật: hoán đổi bộ cổ phục với Thương Khách đang giữ bộ đó
            const other = PLAYERS.find(p => p !== me && p.costumeKey === chosen);
            if (other) {
                [other.costumeKey, me.costumeKey] = [me.costumeKey, other.costumeKey];
                [other.costumeName, me.costumeName] = [me.costumeName, other.costumeName];
            }
            const foot = document.getElementById('user-footer-name');
            if (foot) foot.textContent = me.shortName;
            buildAllPlayerPawns();
            updateAllHUD();
            gameState.isBusy = false;
            wrap.remove();
            playSFX('build');
            startJourneyTimer();
            updateAllHUD();
            addLog(`🚩 <b>${me.shortName}</b> khởi hành! Đồng hồ <b>10:00</b> bắt đầu đếm ngược.`, '🚩', 'text-amber-200 font-semibold');
            showBanner(`Chúc ${me.shortName} thượng lộ bình an!`, '🚩', 2400);
        };
    }

    window.addEventListener('load', () => {
        // Khóa bàn cờ cho tới khi rời sảnh chờ (chặn phím Space tung xúc xắc)
        gameState.isBusy = true;
        const el = document.getElementById('game-timer');
        if (el) el.textContent = '10:00';
        buildLobby();
        updateAllHUD();
    });
