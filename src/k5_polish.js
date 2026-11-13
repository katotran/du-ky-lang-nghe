    /* =================================================================================
     * M. TINH CHỈNH HIỂN THỊ: TÔNG ẤM TRẦM · MẶT ĐẤT PHẲNG THỐNG NHẤT · Ô THẲNG HÀNG
     *    · Bảng màu di sản: nâu gỗ, vàng đất, xanh rêu, đỏ son, vàng đồng (bớt chói, bớt bão hòa)
     *    · Bỏ sông suối trên bản đồ; nắng chiều ấm, bóng đổ mềm, nền và sương mù hài hòa
     *    · Mặt đất phẳng: mọi ô cờ, cây, đá cùng một cao độ (LAND_Y), không vật nào lơ lửng
     *    · Bệ ô cùng kích thước; sa bàn, cờ chủ đất nằm gọn trong biên ô
     * ================================================================================= */
    const PAL = {
        soil: [0x6b5a3e, 0x7c6a4a, 0x8a7752], moss: [0x4f6b3a, 0x5e7a45], water: [0x2f5d62, 0x3a6e73],
        wood: [0x5a3e2b, 0x8b5e3c], red: 0xa93a2c, bronze: 0xc79a3b, bg: 0x2b2219
    };
    window.TILE_R = 1.2;   // bán kính chuẩn cho mọi bệ ô (Xuất phát, Trạm, Làng nghề như nhau)
    window.__RIVERS = [];  // không vẽ sông suối

    // 1. Mặt đất phẳng: cao độ thật chỉ còn dùng để tô màu & đổ bóng địa hình trên texture
    window.__elevShape = (lon, lat) => _baseElev(lon, lat);
    sampleVietnamElevation = function () { return LAND_H; };

    // 2. Texture địa hình: tông đất ấm theo độ cao + bóng đồi hướng Tây Bắc (tạo chiều sâu), không sông
    createAuthenticShadedReliefTexture = function () {
        const w = 1024, h = 1536, lonMin = 101.5, lonMax = 110.2, latMin = 8.2, latMax = 23.8;
        const E = new Float32Array(w * h);
        for (let py = 0; py < h; py++) { const lat = latMax - (py / h) * (latMax - latMin); for (let px = 0; px < w; px++) E[py * w + px] = _elev0(lonMin + (px / w) * (lonMax - lonMin), lat); }
        // Làm mượt (box blur 2 lượt) để bỏ nhiễu hình sin đều của DEM gốc -> không còn vân lưới chéo
        const T = new Float32Array(w * h), R = 10;
        for (let pass = 0; pass < 2; pass++) {
            for (let py = 0; py < h; py++) { let acc = 0; const o = py * w; for (let px = -R; px <= R; px++) acc += E[o + Math.min(w - 1, Math.max(0, px))]; for (let px = 0; px < w; px++) { T[o + px] = acc / (2 * R + 1); acc += E[o + Math.min(w - 1, px + R + 1)] - E[o + Math.max(0, px - R)]; } }
            for (let px = 0; px < w; px++) { let acc = 0; for (let py = -R; py <= R; py++) acc += T[Math.min(h - 1, Math.max(0, py)) * w + px]; for (let py = 0; py < h; py++) { E[py * w + px] = acc / (2 * R + 1); acc += T[Math.min(h - 1, py + R + 1) * w + px] - T[Math.max(0, py - R) * w + px]; } }
        }
        // đồng bằng xanh rêu -> trung du ô liu -> cao nguyên nâu đất -> núi vàng đất
        const stops = [[0, [86, 112, 63]], [.18, [94, 122, 69]], [.45, [104, 108, 66]], [.8, [124, 106, 74]], [1.2, [138, 119, 82]], [1.9, [152, 134, 96]]];
        const col = e => { let i = 0; while (i < stops.length - 2 && e > stops[i + 1][0]) i++; const [e0, a] = stops[i], [e1, b] = stops[i + 1], k = Math.max(0, Math.min(1, (e - e0) / (e1 - e0))); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; };
        const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
        const img = ctx.createImageData(w, h), d = img.data; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
            const i = py * w + px, e = E[i], ex = E[i + (px < w - 2 ? 2 : 0)] - E[i - (px > 1 ? 2 : 0)], ey = E[i + (py < h - 2 ? 2 * w : 0)] - E[i - (py > 1 ? 2 * w : 0)];
            const shade = Math.max(.74, Math.min(1.16, 1 - (ex + ey) * 22)), grain = .96 + rnd() * .08, rgb = col(e), k = shade * grain;
            d[i * 4] = Math.min(255, rgb[0] * k); d[i * 4 + 1] = Math.min(255, rgb[1] * k); d[i * 4 + 2] = Math.min(255, rgb[2] * k); d[i * 4 + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        // mảng ruộng/rừng mờ cho mặt đất bớt đơn điệu (hoa văn nhẹ, tối giản)
        for (let i = 0; i < 900; i++) { ctx.fillStyle = rnd() < .5 ? 'rgba(70,92,50,.07)' : 'rgba(150,126,86,.06)'; ctx.beginPath(); ctx.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 22, 4 + rnd() * 14, rnd() * 3, 0, 7); ctx.fill(); }
        const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
    };

    // 3. Bệ ô cắt lớp theo bảng màu mới (cỏ rêu – đất nâu – đá)
    drawGrassTop = function (g, w, h) {
        g.fillStyle = '#5e7a45'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 2600; i++) { const v = _vrand(); g.fillStyle = v < .33 ? 'rgba(79,107,58,.55)' : v < .66 ? 'rgba(107,127,72,.45)' : 'rgba(124,106,74,.3)'; g.fillRect(_vrand() * w, _vrand() * h, 2 + _vrand() * 3, 2 + _vrand() * 6); }
    };
    drawSoilSide = function (g, w, h) {
        const grassH = h * .16, soilH = h * .5;
        g.fillStyle = '#6b5a3e'; g.fillRect(0, grassH, w, soilH);
        g.fillStyle = '#7a705f'; g.fillRect(0, grassH + soilH, w, h - grassH - soilH);
        for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${70 + _vrand() * 30},${52 + _vrand() * 20},${34 + _vrand() * 12},.55)`; g.beginPath(); g.ellipse(_vrand() * w, grassH + _vrand() * soilH, 2 + _vrand() * 5, 1.5 + _vrand() * 3, 0, 0, 7); g.fill(); }
        for (let i = 0; i < 70; i++) { const x = _vrand() * w, y = grassH + soilH + _vrand() * (h - grassH - soilH); g.fillStyle = `rgba(${120 + _vrand() * 30},${110 + _vrand() * 28},${92 + _vrand() * 24},1)`; g.beginPath(); g.ellipse(x, y, 6 + _vrand() * 12, 4 + _vrand() * 7, _vrand(), 0, 7); g.fill(); g.strokeStyle = 'rgba(60,48,36,.5)'; g.stroke(); }
        g.fillStyle = '#4f6b3a'; g.fillRect(0, 0, w, grassH);
        for (let x = 0; x < w; x += 3) { g.fillStyle = _vrand() < .5 ? '#5e7a45' : '#46603a'; g.fillRect(x, grassH - 2, 3, 4 + _vrand() * 9); }
    };
    drawRoad = function (g, w, h) {
        g.fillStyle = '#8a7752'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 900; i++) { const v = _vrand(); g.fillStyle = v < .5 ? 'rgba(107,90,62,.45)' : 'rgba(170,148,108,.35)'; g.fillRect(_vrand() * w, _vrand() * h, 2 + _vrand() * 3, 2 + _vrand() * 3); }
        g.fillStyle = 'rgba(90,62,43,.3)'; g.fillRect(w * .28, 0, w * .08, h); g.fillRect(w * .64, 0, w * .08, h);
        const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(79,107,58,.9)'); gr.addColorStop(.12, 'rgba(79,107,58,0)'); gr.addColorStop(.88, 'rgba(79,107,58,0)'); gr.addColorStop(1, 'rgba(79,107,58,.9)');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
    };
    V_MAT.tuft =new THREE.MeshStandardMaterial({ color: 0x4f6b3a, roughness: .9, flatShading: true });

    // 4. Mây cát tường: đỏ son & xanh rêu trầm thay cho đỏ tươi / xanh lá chói
    buildMoodboardClouds = function () {
        const mk = (fill, line, flip) => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; drawCloud(c.getContext('2d'), flip ? 330 : 180, 140, 66, fill, line, flip); return new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: .85 }); };
        const RED = ['#8f3a2c', '#d9b07a'], GREEN = ['#4f6b3a', '#b9b98a'];
        [[101.0, 23.0, 6.2, RED, 0], [110.6, 21.8, 5.4, GREEN, 1], [100.9, 13.5, 5.0, GREEN, 0], [112.2, 13.0, 6.0, RED, 1], [110.4, 7.6, 5.2, GREEN, 0], [101.4, 8.4, 5.8, RED, 0], [104.0, 25.0, 7.0, GREEN, 1]].forEach(([lo, la, y, c, f], i) => {
            const p = geoToBoardXZ(lo, la), sp = new THREE.Sprite(mk(c[0], c[1], f)); sp.scale.set(9, 4.5, 1); sp.position.set(p.x, y, p.z); scene.add(sp);
            animatedElements.push({ type: 'FN', fn: t => { sp.position.y = y + Math.sin(t * .3 + i) * .35; sp.position.x = p.x + Math.sin(t * .08 + i * 2) * .9; } });
        });
    };

    // 5. Mọi ô cùng một cao độ nền (kể cả ô trên đảo) -> không ô nào đội cao hay chìm xuống
    const _terrainK5 = build3DVietnamMapTerrain;
    build3DVietnamMapTerrain = function () {
        _terrainK5.apply(this, arguments);
        BOARD_TILES.forEach(t => { t.elevation = LAND_Y; });
    };

    // 6. Sa bàn quá lớn thì thu nhỏ cho vừa bệ ô (đo bounding box thật của mô hình)
    const FIT = TILE_R * .95 - .06;
    const _dioK5 = createBespokeTileDiorama;
    createBespokeTileDiorama = function (tile) {
        const g = _dioK5(tile);
        try {
            const s0 = g.scale.x; g.scale.setScalar(1); g.updateMatrixWorld(true);
            const b = new THREE.Box3().setFromObject(g), ext = Math.max(-b.min.x, b.max.x, -b.min.z, b.max.z);
            g.scale.setScalar(s0);
            const k = FIT / (ext * .95);   // k4 phóng sa bàn tới 0.95 khi xây xong
            if (isFinite(k) && k < 1) {
                const fit = new THREE.Group(); fit.name = 'fitToTile'; [...g.children].forEach(ch => fit.add(ch)); fit.scale.setScalar(k); g.add(fit);
                tile.__fit = +k.toFixed(3);
            }
        } catch (e) { console.warn('fit', tile.index, e); }
        return g;
    };

    // 7. Cờ chủ đất cắm thẳng trên mặt bệ ô, nằm trong biên ô
    const _bannerK5 = spawnOwnerBannerOnTile;
    spawnOwnerBannerOnTile = function (i, ownerId) {
        _bannerK5(i, ownerId);
        const f = ownerFlags[i], t = BOARD_TILES[i];
        if (f && t) f.position.set(t.mapX + TILE_R * .95 - .62, t.elevation + .14, t.mapZ - TILE_R * .95 + .1);
    };

    // 8. Ánh sáng, nền, sương mù & màu môi trường (chạy trước khi gộp khối tĩnh)
    const ENV_REMAP = new Map([
        [0x451a03, PAL.wood[0]],   // bàn gỗ
        [0xf59e0b, PAL.bronze],    // viền bàn vàng đồng
        [0x22b0dc, PAL.water[0]],  // khối biển dưới mặt nước
        [0xfde68a, 0xa8916a],      // bãi cát quanh đảo
        [0x40e0d0, PAL.water[1]],  // phá san hô
        [0x065f46, 0x46553a],      // núi đá vôi
        [0x22c55e, PAL.moss[1]], [0x15803d, PAL.moss[0]], [0x16a34a, PAL.moss[1]], [0x2f7d32, PAL.moss[0]], [0x3f7a3a, PAL.moss[0]],
        [0xecfdf5, PAL.bronze]     // đường viền biên giới
    ]);
    function skipRoots() {
        const s = new Set(); (playerPawns || []).forEach(p => p && s.add(p)); if (diceMesh) s.add(diceMesh);
        scene.children.forEach(c => { let tile = false; c.traverse(o => { if (o.userData && o.userData.tileIndex !== undefined) tile = true; }); if (tile) s.add(c); });
        return s;
    }
    function remapEnv() {
        const skip = skipRoots(), seen = new Set();
        scene.children.forEach(root => {
            if (skip.has(root)) return;
            root.traverse(o => {
                if (!o.isMesh) return;
                (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
                    if (!m || seen.has(m) || !m.color) return; seen.add(m);
                    const to = ENV_REMAP.get(m.color.getHex()); if (to === undefined) return;
                    m.color.setHex(to);
                    if (m.emissive && m.emissive.getHex() === 0x34d399) { m.emissive.setHex(0x6b4a1e); m.emissiveIntensity = .25; }
                    if (to === PAL.bronze && m.metalness !== undefined) { m.metalness = .45; m.roughness = .5; }
                });
            });
        });
    }
    applyC4DLook = function () {
        scene.background = new THREE.Color(PAL.bg); scene.fog = new THREE.FogExp2(PAL.bg, .0016);
        renderer.toneMappingExposure = .8;
        scene.traverse(o => {
            if (o.isHemisphereLight) { o.color.setHex(0xe9d9bd); o.groundColor.setHex(0x4a3b28); o.intensity = .3; }
            else if (o.isAmbientLight) { o.color.setHex(0xffe6c8); o.intensity = .1; }
            else if (o.isDirectionalLight && o !== window.__sun) { const fill = o.color.getHex() === 0x38bdf8; o.color.setHex(fill ? 0x9aa69a : 0xffc48a); o.intensity = fill ? .1 : .14; }
        });
        if (window.__sun) { window.__sun.color.setHex(0xffcf98); window.__sun.intensity = 1.5; }
        try { remapEnv(); } catch (e) { console.warn('remap', e); }
    };

    const _initK5 = init3DScene;
    init3DScene = function () {
        _initK5();
        try {
            // Nắng chiều: mặt trời thấp hơn ở hướng Tây Bắc -> bóng dài, mềm, tạo khối
            const s = window.__sun, R = BOARD_RECT;
            if (s) { s.position.set(R.cx - 58, 52, R.cz - 34); s.shadow.bias = -.0008; s.shadow.normalBias = .06; s.shadow.camera.updateProjectionMatrix(); }
            if (scene.fog) scene.fog.density = .0015;
            renderer.shadowMap.needsUpdate = true;
            const big = BOARD_TILES.filter(t => t.__fit).map(t => `#${t.index} ${t.name} ×${t.__fit}`);
            if (big.length) console.log('[Vừa bệ ô] thu nhỏ ' + big.length + ' sa bàn: ' + big.join(', '));
        } catch (e) { console.warn('lookK5', e); }
    };
