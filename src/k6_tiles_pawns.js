    /* =================================================================================
     * K6. BỆ ĐỊA DANH MỚI + NHÂN VẬT CHIBI CÓ HOẠT ẢNH
     *    · Bệ bo tròn, thấp, màu xanh non viền theo loại ô (thay khối vuông khung gỗ)
     *    · Nhân vật đầu to kiểu chibi mặc cổ phục, biết thở, chớp mắt, nhún nhảy khi tới lượt,
     *      co chân khi nhảy ô, vẫy tay khi rê chuột, nhảy xoay vòng khi bấm vào
     * ================================================================================= */
    const TILE_SCALE = .9;
    const rrPts = (w, r, n) => { const o = [], h = w / 2 - r; [[h, h, 0], [-h, h, 1], [-h, -h, 2], [h, -h, 3]].forEach(([cx, cy, q]) => { for (let i = 0; i <= n; i++) { const a = (q + i / n) * Math.PI / 2; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); return o; };
    const PAD_RIM = { START: '#d9534a', SHOP: '#2f9e8f', BIEN_DONG: '#c8553d', BAN_LINH: '#d99a2b', PROPERTY: '#8fbf55' };

    makeDioramaPlatform = function (tile, baseRadius) {
        const W = baseRadius * 1.9, R = .5, D = .34, BV = .05;
        const sh = new THREE.Shape(); rrPts(W - BV * 2, R, 8).forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); sh.closePath();
        const geo = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: true, bevelSize: BV, bevelThickness: BV, bevelSegments: 3, steps: 1 }); geo.rotateX(-Math.PI / 2);
        { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / W + .5, .5 - p.getZ(i) / W); uv.needsUpdate = true; }
        const rim = PAD_RIM[tile.type] || PAD_RIM.PROPERTY;
        const top = c4('k6pad' + tile.type, () => flat(0xffffff, { map: (() => {
            const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
            g.fillStyle = '#dff0a8'; g.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 260; i++) { g.fillStyle = i % 2 ? 'rgba(170,210,110,.35)' : 'rgba(240,250,200,.4)'; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 1.5 + Math.random() * 2.5, 0, 7); g.fill(); }
            const path = (inset, r) => { const a = inset, b = 256 - inset; g.beginPath(); g.moveTo(a + r, a); g.arcTo(b, a, b, b, r); g.arcTo(b, b, a, b, r); g.arcTo(a, b, a, a, r); g.arcTo(a, a, b, a, r); g.closePath(); };
            g.strokeStyle = rim; g.globalAlpha = .9; g.lineWidth = 9; path(13, 48); g.stroke(); g.globalAlpha = .35; g.lineWidth = 3; path(26, 38); g.stroke(); g.globalAlpha = 1;
            const t = new THREE.CanvasTexture(cv); t.anisotropy = 8; return t;
        })() }));
        const block = new THREE.Mesh(geo, [top, c4('k6padSide', () => flat(0xfaf2d8))]);
        block.position.y = .14 - D - BV; block.receiveShadow = block.castShadow = true;
        // bảng tên nhỏ đặt nghiêng trước bệ
        const plqCv = document.createElement('canvas'); plqCv.width = 512; plqCv.height = 96;
        const plqTex = new THREE.CanvasTexture(plqCv); plqTex.anisotropy = 4;
        const drawPlaque = () => {
            const g = plqCv.getContext('2d'), w = 512, h = 96, label = (typeof i18nText === 'function' ? i18nText(tile.name || '') : (tile.name || '')).toUpperCase().slice(0, 34);
            g.clearRect(0, 0, w, h); const r = 40; g.beginPath(); g.moveTo(r, 4); g.arcTo(w - 4, 4, w - 4, h - 4, r); g.arcTo(w - 4, h - 4, 4, h - 4, r); g.arcTo(4, h - 4, 4, 4, r); g.arcTo(4, 4, w - 4, 4, r); g.closePath();
            g.fillStyle = '#fffaf0'; g.fill(); g.strokeStyle = rim; g.lineWidth = 7; g.stroke();
            g.fillStyle = '#4a3418'; g.font = '800 36px "Be Vietnam Pro", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, h / 2 + 2, w - 56);
            plqTex.needsUpdate = true;
        };
        drawPlaque(); if (typeof onLangChange === 'function') onLangChange(drawPlaque);
        const tx = plqTex;
        const plq = new THREE.Mesh(new THREE.PlaneGeometry(W * .66, W * .66 * 96 / 512), new THREE.MeshBasicMaterial({ map: tx, transparent: true, alphaTest: .4 }));
        plq.rotation.x = -1.05; plq.position.set(0, .33, W / 2 + .2); block.add(plq);
        return block;
    };

    // Sau khi dựng ô: thu nhỏ bệ một chút và đổi vòng chủ sở hữu từ khung vuông sang viền bo tròn
    const _buildTilesK6 = build24GeographicalTilesWithDioramas;
    build24GeographicalTilesWithDioramas = function () {
        _buildTilesK6.apply(this, arguments);
        tileBaseRings.forEach((ring, i) => {
            const t = BOARD_TILES[i], W = (t.type === 'START' || t.type === 'SHOP' ? 1.28 : 1.15) * 1.9 + .12;
            const pts = rrPts(W, .56, 6).map(([x, y]) => new THREE.Vector3(x, y, 0));
            ring.geometry.dispose(); ring.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'catmullrom', .2), 96, .04, 6, true);
            ring.rotation.set(Math.PI / 2, 0, 0); ring.position.y = .1;
            if (ring.parent) ring.parent.scale.setScalar(TILE_SCALE);
        });
        tileLabelSprites.forEach(o => { o.sprite.position.y = 2.3; o.sprite.position.z = 0; });   // nhãn ô nổi cao hơn đầu nhân vật
    };

    /* ---------- Nhân vật chibi ---------- */
    const CHIBI = [];   // danh sách quân đang có trên bàn (để chạy hoạt ảnh & bắt chuột)
    // (mô hình nhân vật và hoạt ảnh nằm trong k10_characters.js; ở đây giữ danh sách CHIBI, vị trí đứng, hiệu ứng nổi và chuột)

    // Năm quân đứng thành vòng trên bệ để không che nhau
    getPlayerPawnOffset = function (i) { const a = -Math.PI / 2 + (i % 5) * Math.PI * 2 / 5 + Math.PI; return { dx: Math.cos(a) * .8, dz: Math.sin(a) * .8 }; };

    function chibiPop(C, emoji) {
        try {
            const sp = emojiSprite(emoji, .32); const p = C.group.position; sp.position.set(p.x, p.y + 1.25, p.z); scene.add(sp); const t0 = performance.now();
            const fn = () => { const e = (performance.now() - t0) / 900; if (e >= 1) { scene.remove(sp); const i = _mapAnim.indexOf(fn); if (i >= 0) setTimeout(() => _mapAnim.splice(_mapAnim.indexOf(fn), 1), 0); return; } sp.position.y = p.y + 1.25 + e * .9; sp.material.opacity = 1 - e * e; sp.scale.setScalar(.32 + Math.sin(e * Math.PI) * .14); };
            sp.material.transparent = true; _mapAnim.push(fn);
        } catch (e) { }
    }

    // Rê chuột: quân vẫy tay chào · Bấm: quân nhảy xoay vòng mừng rỡ
    const _initK6 = init3DScene;
    init3DScene = function () {
        _initK6.apply(this, arguments);
        try {
            const rc = new THREE.Raycaster(), m = new THREE.Vector2(), el = renderer.domElement; let down = null, lastMove = 0;
            const pick = e => { const r = el.getBoundingClientRect(); m.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); rc.setFromCamera(m, camera); const hits = rc.intersectObjects(CHIBI.filter(c => c.group.parent && c.group.visible).map(c => c.hit), false); return hits.length ? hits[0].object.userData.chibi : null; };
            el.addEventListener('pointermove', e => { const n = performance.now(); if (n - lastMove < 60) return; lastMove = n; const C = pick(e); if (C) { C.wave = Math.max(C.wave, .9); el.style.cursor = 'pointer'; } else if (el.style.cursor === 'pointer') el.style.cursor = ''; });
            el.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
            el.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const C = pick(e); if (C && C.cheer <= 0) { C.cheer = C.cheer0 = 1; C.spin = 1; chibiPop(C, ['💖', '⭐', '🎉', '👋'][Math.floor(Math.random() * 4)]); try { playSFX('step'); } catch (x) { } } });
        } catch (e) { console.warn('chibi input', e); }
    };
