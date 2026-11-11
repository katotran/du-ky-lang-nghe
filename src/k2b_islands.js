    /* ---------- 5. Quần đảo Hoàng Sa & Trường Sa: sa bàn khối nhựa trong theo ảnh mẫu ---------- */
    function resinBase(K, label, W) {
        const wood = GM.wood();
        const base = K.box(W + .2, .3, W + .2, wood, 0, -.3, 0);
        K.box(W + .26, .04, W + .26, S(0x3a2414, .4, .05), 0, -.31, 0);
        const plq = new THREE.Mesh(new THREE.PlaneGeometry(W * .7, W * .7 * 80 / 512), new THREE.MeshStandardMaterial({ map: vCanvasTex('plq_' + label, 512, 80, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f3d98a'); gr.addColorStop(.5, '#c99a3c'); gr.addColorStop(1, '#a87a26'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = '#6b4a14'; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#3a2508'; g.font = '800 34px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, h / 2 + 2, w - 24); }), roughness: .3, metalness: .6 }));
        plq.position.set(0, -.15, W / 2 + .105); K.g.add(plq);
        K.box(W, .02, W, S(0x7fd0c4, .9), 0, 0, 0); // đáy cát dưới nước
        const coral = [0xff6f61, 0xffa94d, 0xb06ad9, 0xff8fb1, 0xffd43b, 0x4dd4ac];
        for (let i = 0; i < 46; i++) { const a = i * 2.39, r = W * .32 + (i % 5) * W * .035, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(x) > W / 2 - .06 || Math.abs(z) > W / 2 - .06) continue; const c = K.sph(.035 + (i % 3) * .015, S(coral[i % coral.length], .7), x, .05, z, 0); c.scale.y = 1.4; }
        for (let i = 0; i < 22; i++) { const a = i * 1.7, x = (i % 2 ? 1 : -1) * (W / 2 - .05), z = -W / 2 + (i / 22) * W; K.sph(.03, S(coral[i % 6], .7), i % 4 < 2 ? x : z * .98, .06 + (i % 3) * .05, i % 4 < 2 ? z : x, 0); }
        const resin = K.box(W, .3, W, c4('resin', () => new THREE.MeshStandardMaterial({ color: 0x2fc6d2, roughness: .05, metalness: .1, transparent: true, opacity: .5, depthWrite: false })), 0, 0, 0);
        resin.castShadow = false; resin.renderOrder = 2;
        const top = new THREE.Mesh(new THREE.PlaneGeometry(W, W), c4('resinTop', () => new THREE.MeshStandardMaterial({ map: vCanvasTex('water', 128, 128, texWater, 3, 3), color: 0x8fe8ec, roughness: .08, metalness: .2, transparent: true, opacity: .55, depthWrite: false })));
        top.rotation.x = -Math.PI / 2; top.position.y = .301; top.renderOrder = 3; K.g.add(top);
        return .3;
    }
    function shore(K, rx, rz, x, z, Y) { const s = K.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1.15, .1, 28), S(0xf3e2b5, .95)), x, Y + .02, z); s.scale.set(rx, 1, rz); const gr = K.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .06, 26), GM.grass()), x, Y + .09, z); gr.scale.set(rx * .78, 1, rz * .76); for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; K.sph(.04 + (i % 3) * .02, S(0x8f8f88, .95), x + Math.cos(a) * rx * 1.08, Y + .06, z + Math.sin(a) * rz * 1.08, 0).scale.y = .7; } return Y + .12; }
    function obelisk(K, x, z, Y, h) { K.box(.22, .04, .22, S(0xd8d4cc, .7), x, Y, z); K.box(.16, .04, .16, S(0xd8d4cc, .7), x, Y + .04, z); const o = K.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .06, h, 4), S(0xb9b6ae, .6)), x, Y + .08 + h / 2, z); o.rotation.y = Math.PI / 4; K.cone(.05, .06, S(0xb9b6ae, .6), x, Y + .08 + h, z, 4).rotation.y = Math.PI / 4; const pl = new THREE.Mesh(new THREE.PlaneGeometry(.05, .07), c4('stele', () => new THREE.MeshStandardMaterial({ map: textTex('stl', 'VIỆT NAM', 64, 32, '#d4a63a', '#7a1010', '800 12px Arial'), roughness: .4 }))); pl.position.set(x, Y + .2, z + .045); K.g.add(pl); }
    function lighthouse(K, x, z, Y, h) { for (let i = 0; i < 5; i++) K.cyl(.05 - i * .004, .055 - i * .004, h / 5, S(i % 2 ? 0xffffff : 0xd22a2a, .5), x, Y + i * h / 5, z, 14); K.cyl(.06, .06, .015, S(0x333333, .5), x, Y + h, z, 14); const lm = new THREE.MeshStandardMaterial({ color: 0xfff3b0, emissive: 0xffc030, emissiveIntensity: 1.2 }); K.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .05, 10), lm), x, Y + h + .04, z); K.cone(.05, .05, S(0xd22a2a, .5), x, Y + h + .065, z, 10); animatedElements.push({ type: 'FN', fn: t => { lm.emissiveIntensity = .6 + Math.abs(Math.sin(t * 1.6)) * 1.4; } }); }
    function windTurbine(K, x, z, Y, h) { K.cyl(.008, .014, h, S(0xf2f2f2, .4), x, Y, z, 8); const hub = K.grp(x, Y + h, z + .015); hub.sph(.016, S(0xf2f2f2, .4), 0, 0, 0, 1); for (let i = 0; i < 3; i++) { const b = hub.box(.012, .16, .004, S(0xffffff, .4), 0, 0, 0); b.geometry.translate(0, .08, 0); b.position.y = 0; b.rotation.z = i * 2.094; } animatedElements.push({ type: 'FN', fn: t => { hub.g.rotation.z = t * 2.2 + x; } }); }
    function solarHouse(K, x, z, Y, w, d, ry) { const H = K.grp(x, Y, z, ry || 0); H.box(w, .12, d, S(0xf1e6c8, .7), 0, 0, 0); for (let i = 0; i < 3; i++) { const p = H.box(w * .3, .008, d * .9, S(0x1f3f8a, .2, .5), -w * .33 + i * w * .33, .14, 0); p.rotation.z = .35; } H.box(w * .2, .07, .01, S(0x4a3a2a), 0, .02, d / 2 + .003); }
    function smallTemple(K, x, z, Y, s) { const T = K.grp(x, Y, z, 0, s); T.box(.34, .04, .26, S(0xd8d4cc, .7), 0, 0, 0); T.box(.28, .14, .2, S(0xe9c46a, .7), 0, .04, 0); [-.12, -.04, .04, .12].forEach(a => T.cyl(.01, .01, .14, S(0xa8231b, .6), a, .04, .11, 6)); const r = vnRoof(.36, .28, .14, MAT.roofTerra(), 0x7a2a1a, .05, .05); r.position.y = .18; T.g.add(r); }
    function tinyShip(K, kind, x, z, ry, Y, s) { const sh = mkShip(kind); sh.scale.setScalar(s || .2); sh.position.set(x, Y, z); sh.rotation.y = ry || 0; sh.children.forEach(c => { if (c.material && c.material.map && c.renderOrder === 2) c.visible = false; }); K.g.add(sh); animatedElements.push({ type: 'FN', fn: t => { sh.position.y = Y + Math.sin(t * 1.5 + x * 9) * .004; sh.rotation.z = Math.sin(t + z * 7) * .03; } }); return sh; }
    function buildHoangSa() {
        const g = new THREE.Group(), K = kit(g), W = 2, Y0 = resinBase(K, 'QUẦN ĐẢO HOÀNG SA - VIỆT NAM', W);
        const Y = shore(K, .62, .5, -.15, -.12, Y0 - .02);
        shore(K, .22, .18, -.72, .45, Y0 - .04); tree(K, 'DARK', -.72, .45, .35).g.position.y = Y0 + .06;
        obelisk(K, -.42, -.12, Y, .48); flag(K, -.48, -.42, .72, 0, true); [K.g.children[K.g.children.length - 1], K.g.children[K.g.children.length - 2]].forEach(m => m.position.y += Y);
        smallTemple(K, -.05, .02, Y, 1.05); for (let i = 0; i < 4; i++) K.box(.03, .05, .03, S(0x9a9a92), -.05 + (i - 1.5) * .07, Y, .2);
        solarHouse(K, .3, -.32, Y, .3, .2); solarHouse(K, .38, -.05, Y, .26, .18, .2);
        windTurbine(K, .12, -.48, Y, .4); windTurbine(K, .3, -.56, Y, .36);
        lighthouse(K, .55, -.42, Y, .5);
        [[-.6, -.4], [-.2, -.5], [.05, -.38], [-.6, .05], [-.25, .3], [.1, .3], [.35, .22], [-.75, -.15]].forEach(([x, z], i) => tree(K, i % 3 ? 'DARK' : 'PALM', x, z, .32 + (i % 3) * .05).g.position.y = Y);
        for (let i = 0; i < 6; i++) K.box(.12, .02, .05, S(0x8a6a46, .8), .42 + i * .1, Y0 + .02, .08 + i * .05);
        crowd(K, [[-.3, .05], [-.2, -.05], [.2, .1], [.0, -.22]].map(([x, z]) => [x, z]), { s: .9 }); K.g.children.slice(-4).forEach(m => m.position.y += Y);
        tinyShip(K, 'coastguard', .6, .62, .3, Y0, .22); tinyShip(K, 'trawler', -.25, .62, -.2, Y0, .22); tinyShip(K, 'trawler', .15, .72, .1, Y0, .2); tinyShip(K, 'navy', -.55, -.78, 2.8, Y0, .2); tinyShip(K, 'trawler', .78, .28, -1.2, Y0, .2);
        g.scale.setScalar(2.35); return g;
    }
    function buildTruongSa() {
        const g = new THREE.Group(), K = kit(g), W = 2.1, Y0 = resinBase(K, 'QUẦN ĐẢO TRƯỜNG SA - VIỆT NAM', W);
        const Y = shore(K, .78, .52, 0, -.12, Y0 - .02);
        for (let i = 0; i < 18; i++) { const a = Math.PI * .1 + i / 18 * Math.PI * .85; K.sph(.05, S(0x8f8f88, .95), Math.cos(a) * .95, Y0 + .04, -.12 + Math.sin(a) * .66, 0).scale.y = .7; }
        const strip = K.box(.95, .012, .14, S(0x5d6166, .8), .25, Y, -.4); strip.rotation.y = -.25; for (let i = 0; i < 7; i++) { const d = K.box(.06, .014, .012, S(0xffffff, .5), -.12 + i * .13, Y, -.4 + (i - 3) * .033); d.rotation.y = -.25; }
        [[.05, -.33], [.45, -.46]].forEach(([x, z], i) => { const P = K.grp(x, Y + .03, z, -.25 + i * .5, .5); P.box(.18, .03, .04, S(0xf4f4f4, .4), 0, 0, 0); P.box(.04, .01, .3, S(0xf4f4f4, .4), .02, .02, 0); P.box(.03, .05, .06, S(0xd23a2a, .4), -.08, .02, 0); });
        obelisk(K, -.05, -.05, Y, .5); flag(K, -.05, -.22, .8, 0, true); K.g.children.slice(-2).forEach(m => m.position.y += Y);
        [[-.5, -.38], [-.32, -.48], [-.62, -.15]].forEach(([x, z], i) => { const B = K.grp(x, Y, z, i * .3); B.box(.22, .1, .12, S(0xf3ead6, .7), 0, 0, 0); const r = gableRoof(.24, .14, .07, MAT.roofTerra(), 0x8a3a20); r.position.y = .1; B.g.add(r); });
        smallTemple(K, .42, .05, Y, 1.0);
        for (let i = 0; i < 4; i++) { const p = K.box(.12, .008, .07, S(0x1f3f8a, .2, .5), .1 + i * .13, Y + .03, -.05); p.rotation.z = .3; K.box(.008, .03, .008, S(0x888888), .1 + i * .13, Y, -.05); }
        windTurbine(K, .2, -.58, Y, .4); windTurbine(K, .38, -.62, Y, .38); windTurbine(K, -.15, -.55, Y, .38);
        lighthouse(K, .68, .12, Y, .45);
        [[-.4, .05], [-.25, .2], [.15, .22], [-.7, .02], [.6, -.2], [-.15, -.3], [.3, .25]].forEach(([x, z], i) => tree(K, i % 2 ? 'DARK' : 'PALM', x, z, .3 + (i % 3) * .05).g.position.y = Y);
        crowd(K, [[-.2, .1], [.0, .12], [.2, .08], [-.35, -.2], [.1, -.15]]); K.g.children.slice(-5).forEach(m => m.position.y += Y);
        const pier = K.box(.12, .03, .5, S(0xc8c3b8, .7), -.35, Y0 - .01, .55); K.box(.55, .03, .1, S(0xc8c3b8, .7), -.35, Y0 - .01, .82);
        tinyShip(K, 'navy', -.55, .62, Math.PI / 2, Y0, .2); tinyShip(K, 'navy', -.18, .62, Math.PI / 2, Y0, .2); tinyShip(K, 'coastguard', .78, .7, -.4, Y0, .22); tinyShip(K, 'coastguard', -.85, -.75, .5, Y0, .2); tinyShip(K, 'trawler', .35, .8, 0, Y0, .2); tinyShip(K, 'trawler', .55, .62, .3, Y0, .18);
        [[-.82, -.82, 0], [.82, -.82, 1]].forEach(([x, z, radar]) => { const D = K.grp(x, Y0 - .3, z); [[-.07, -.07], [.07, -.07], [-.07, .07], [.07, .07]].forEach(([a, b]) => D.cyl(.01, .012, .62, S(0x6b6f74, .5, .3), a, 0, b, 6)); D.box(.24, .03, .24, S(0x8a8f95, .5, .3), 0, .62, 0); D.box(.18, .1, .18, S(0xe8b04a, .6), 0, .65, 0); D.box(.2, .02, .2, S(0x8a8f95, .5), 0, .75, 0); if (radar) { D.cyl(.012, .012, .06, S(0xdddddd), 0, .77, 0, 6); D.sph(.07, S(0xf4f4f4, .3), 0, .87, 0, 2); } else { const fl = D.grp(0, .77, 0); flag(fl, 0, 0, .18, 0, true); } });
        g.scale.setScalar(2.3); return g;
    }
    buildHoangSaTruongSaIslands = function () {
        [[buildHoangSa, HS_XZ, 'QUẦN ĐẢO HOÀNG SA (VIỆT NAM)'], [buildTruongSa, TS_XZ, 'QUẦN ĐẢO TRƯỜNG SA (VIỆT NAM)']].forEach(([fn, p, name]) => {
            let g; try { g = fn(); } catch (e) { console.warn('archipelago', e); return; }
            g.position.set(p.x, .1 + .3 * g.scale.x, p.z); g.rotation.y = -.15; scene.add(g);
            const sp = create3DTextSprite(name, '#991b1b', '#fef08a', true); sp.position.set(p.x, 4.6, p.z); sp.scale.set(4.2, .9, 1); scene.add(sp);
        });
    };

    /* ---------- 6. Chọn sa bàn cho từng ô theo modelType ---------- */
    createBespokeTileDiorama = function (tile) {
        const g = new THREE.Group(), f = LAYOUT[tile.modelType];
        if (!f) return createC4DDiorama(tile);
        try { f(kit(g)); } catch (e) { console.warn('diorama', tile.index, tile.modelType, e); }
        g.scale.setScalar(.95); return g;
    };

    /* ---------- 7. Camera cho bản đồ lớn ---------- */
    const camAt = (lon, lat) => geoToBoardXZ(lon, lat);
    const CAM_PRESETS = [
        ['Toàn Cảnh', () => { const R = BOARD_RECT; return [[R.cx - 4, 112, R.cz + 92], [R.cx - 2, 0, R.cz + 6]]; }],
        ['Miền Bắc', () => { const c = camAt(105.6, 21.6); return [[c.x + 2, 30, c.z + 26], [c.x, .5, c.z]]; }],
        ['Miền Trung & Tây Nguyên', () => { const c = camAt(107.8, 14.6); return [[c.x + 8, 34, c.z + 28], [c.x, .6, c.z]]; }],
        ['Miền Nam', () => { const c = camAt(105.9, 10.2); return [[c.x + 3, 30, c.z + 26], [c.x, .5, c.z]]; }],
        ['Biển Đảo Hoàng Sa - Trường Sa', () => { const c = camAt(111.8, 13.0); return [[c.x + 10, 34, c.z + 34], [c.x + 1, .5, c.z]]; }]
    ];
    cycleCameraPreset = function () {
        gameState.cameraPresetIdx = ((gameState.cameraPresetIdx || 0) + 1) % CAM_PRESETS.length;
        const [name, f] = CAM_PRESETS[gameState.cameraPresetIdx], [p, t] = f();
        const lb = document.getElementById('cam-mode-label'); if (lb) lb.textContent = name;
        gsap.to(camera.position, { x: p[0], y: p[1], z: p[2], duration: 1.1, ease: 'power2.out' });
        gsap.to(controls.target, { x: t[0], y: t[1], z: t[2], duration: 1.1, ease: 'power2.out' });
    };
    const _initK0 = init3DScene;
    init3DScene = function () {
        _initK0();
        try {
            controls.maxDistance = 185; camera.far = 640; camera.updateProjectionMatrix();
            const [p, t] = CAM_PRESETS[0][1](); camera.position.set(p[0], p[1], p[2]); controls.target.set(t[0], t[1], t[2]); controls.update();
            if (window.__sun) { const R = BOARD_RECT, s = window.__sun; s.target.position.set(R.cx, 0, R.cz); scene.add(s.target); s.position.set(R.cx - 30, 70, R.cz - 26); const d = Math.max(R.W, R.D) * .56; Object.assign(s.shadow.camera, { left: -d, right: d, top: d, bottom: -d, far: 240 }); s.shadow.camera.updateProjectionMatrix(); renderer.shadowMap.needsUpdate = true; }
            if (scene.fog) scene.fog.density = .0016;
        } catch (e) { console.warn('camK', e); }
        console.log('[47 địa danh] ' + BOARD_TILES.length + ' ô · lệch tối đa ' + Math.max(...BOARD_TILES.map(t => Math.hypot(t.lon - t.realLon, t.lat - t.realLat))).toFixed(2) + '°');
    };
