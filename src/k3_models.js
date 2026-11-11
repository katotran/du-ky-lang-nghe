    /* ---------- 8. Hàm dựng dùng chung cho 29 sa bàn mới ---------- */
    const TX = (key, w, h, draw, rx, ry, o) => c4('tx' + key, () => new THREE.MeshStandardMaterial(Object.assign({ map: vCanvasTex(key, w, h, draw, rx, ry), roughness: .8, side: THREE.DoubleSide }, o || {})));
    const discTex = (bg, fg, fg2) => (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,60,30,.5)'; for (let x = 0; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) { g.fillStyle = (i + j) % 3 === 0 && fg2 ? fg2 : fg; g.beginPath(); g.arc(w * (i + .5) / 4, h * (j + .5) / 2, Math.min(w / 4, h / 2) * .44, 0, 7); g.fill(); g.strokeStyle = 'rgba(200,170,120,.6)'; g.stroke(); } };
    const stripeTex = (bg, fg) => (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = fg; g.fillRect(i * w / 40 + 1, h * .05, w / 40 - 2, h * .9); } };
    function plane(K, w, h, mat, x, y, z, rx, ry) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); p.position.set(x, y, z); p.rotation.set(rx || 0, ry || 0, 0); p.castShadow = true; p.receiveShadow = true; K.g.add(p); return p; }
    function dryRack(K, x, z, w, d, mat, ry, hgt) { const R = K.grp(x, 0, z, ry || 0), wd = S(0x9a7a4a, .8), h = hgt || .12; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => R.box(.012, h + (b < 0 ? .05 : 0), .012, wd, a * w / 2, 0, b * d / 2)); const p = plane(R, w, d * 1.04, mat, 0, h + .03, 0, -Math.PI / 2 + .22); return R; }
    function sign(K, x, z, w, h, text, bg, fg, y, ry, posts) { const S2 = K.grp(x, 0, z, ry || 0); const m = TX('sg_' + text + bg, 256, Math.round(256 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = fg; g.font = `800 ${Math.round(H * .42)}px "Be Vietnam Pro", Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 1, W - 12); }, 1, 1, { roughness: .5 }); plane(S2, w, h, m, 0, (y || .3) + h / 2, 0); if (posts !== false) [-1, 1].forEach(a => S2.box(.012, (y || .3), .012, S(0x6b4a2f), a * w * .45, 0, 0)); return S2; }
    function gateArch(K, x, z, w, text, ry, col) { const G2 = K.grp(x, 0, z, ry || 0), wd = S(col || 0x7a4b2a, .7); [-1, 1].forEach(a => G2.box(.04, .42, .04, wd, a * w / 2, 0, 0)); G2.box(w + .14, .03, .07, wd, 0, .42, 0); const r = gableRoof(w + .18, .12, .06, MAT.roofTerra(), 0x7a2a1a); r.position.y = .45; G2.g.add(r); sign(G2, 0, .025, w * .9, .09, text, '#b91c1c', '#fde68a', .31, 0, false); return G2; }
    function van(K, x, z, ry, hex) { const V = K.grp(x, 0, z, ry || 0); V.box(.3, .1, .13, S(hex || 0xf2f2f2, .4), 0, .025, 0); V.box(.2, .06, .125, S(hex || 0xf2f2f2, .4), -.03, .125, 0); [-1, 1].forEach(a => plane(V, .18, .045, S(0x1d2a3a, .2, .3), -.03, .155, a * .064, 0, a > 0 ? 0 : Math.PI)); [[-.09, 1], [.09, 1], [-.09, -1], [.09, -1]].forEach(([a, b]) => { const w2 = V.cyl(.025, .025, .02, S(0x1a1a1a), a, .0, b * .065, 10); w2.rotation.x = Math.PI / 2; w2.position.y = .025; }); return V; }
    function truck(K, x, z, ry, hex, load) { const V = K.grp(x, 0, z, ry || 0); V.box(.1, .1, .12, S(hex || 0x2f6fd0, .4), .12, .025, 0); plane(V, .09, .04, S(0x1d2a3a, .2, .3), .171, .1, 0, 0, Math.PI / 2); V.box(.2, .03, .13, S(0x6b5a40, .7), -.04, .03, 0); if (load) for (let i = 0; i < 4; i++) V.box(.07, .05, .05, S(load, .8), -.1 + (i % 2) * .08, .06 + Math.floor(i / 2) * .05, (i % 2 ? -1 : 1) * .03); [[-.09, 1], [.12, 1], [-.09, -1], [.12, -1]].forEach(([a, b]) => { const w2 = V.cyl(.022, .022, .02, S(0x1a1a1a), a, 0, b * .065, 10); w2.rotation.x = Math.PI / 2; w2.position.y = .022; }); return V; }
    function moto(K, x, z, ry, col) { const V = K.grp(x, 0, z, ry || 0); V.box(.1, .03, .025, S(col || 0xc62828, .4), 0, .025, 0); [-1, 1].forEach(a => { const w2 = V.cyl(.02, .02, .012, S(0x1a1a1a), a * .045, 0, 0, 8); w2.rotation.x = Math.PI / 2; w2.position.y = .02; }); person(V, -.01, 0, { s: .8 }).g.position.y = .03; return V; }
    function bigPot(K, x, z, r, fire) { K.cyl(r * 1.15, r * 1.2, .05, S(0x8a5a3a, .9), x, 0, z, 12); if (fire !== false) { const f = K.cone(r * .6, .06, c4('fireM', () => new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a00, emissiveIntensity: 1.2 })), x, .02, z, 6); animatedElements.push({ type: 'FN', fn: t => { f.scale.y = .8 + Math.abs(Math.sin(t * 6 + x * 9)) * .5; } }); } K.cyl(r, r * .8, r * 1.1, S(0x222222, .4, .4), x, .05, z, 14); smoke(K, x, .05 + r * 1.1, z); }
    function stiltT(K, x, z, w, d, ry, s, wall) { return bStilt(K, x, z, w, d, { ry, s, wall: wall || 0xa8865a }); }
    function rongHouse(K, x, z, s, pattern) { const H = K.grp(x, 0, z, 0, s || 1), wd = S(0x6b4a2a, .8); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) H.cyl(.018, .02, .22, wd, -.18 + i * .18, 0, -.1 + j * .2, 6); H.box(.48, .03, .3, S(0x8a6a3a, .8), 0, .22, 0); H.box(.42, .12, .24, S(0x9a7a4a, .9), 0, .25, 0); const r = new THREE.Mesh(new THREE.ConeGeometry(.3, 1.0, 4, 1), MAT.thatch()); r.scale.set(1.25, 1, .62); r.rotation.y = Math.PI / 4; r.position.y = .86; r.castShadow = true; H.g.add(r); if (pattern !== false) { const p = plane(H, .2, .26, TX('rongpat', 64, 96, (g, w, h) => { g.fillStyle = '#5a3a20'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#c62828' : '#f2e2b0'; g.beginPath(); g.moveTo(w / 2, i * 12); g.lineTo(w * .1, i * 12 + 10); g.lineTo(w * .9, i * 12 + 10); g.fill(); } }), 0, .82, .158, -.08); } const st = H.box(.08, .2, .03, wd, 0, .02, .26); st.rotation.x = -.7; return H; }
    function tinRoofShop(K, x, z, w, d, text, bg, fg, ry) { const H = K.grp(x, 0, z, ry || 0); H.box(w, .2, d, S(0xd9c9a3, .85), 0, 0, 0); const r = gableRoof(w + .04, d + .06, .1, MAT.roofGray(), 0x555555); r.position.y = .2; H.g.add(r); const a = H.box(w, .012, .12, MAT.roofGray(), 0, .18, d / 2 + .06); a.rotation.x = .25; if (text) sign(H, 0, d / 2 + .13, w * .9, .07, text, bg || '#facc15', fg || '#b91c1c', .2, 0, false); return H; }
    function clothLine(K, x, z, w, cols, ry, h) { const C2 = K.grp(x, 0, z, ry || 0); [-1, 1].forEach(a => C2.box(.012, h || .3, .012, S(0x7a4b2a), a * w / 2, 0, 0)); C2.box(w, .008, .008, S(0x7a4b2a), 0, (h || .3) - .01, 0); cols.forEach((c, i) => plane(C2, w / cols.length * .86, (h || .3) * .62, S(c, .7), -w / 2 + w * (i + .5) / cols.length, (h || .3) * .62, 0)); return C2; }
    function statue(K, x, z, s, hex) { const T = K.grp(x, 0, z, 0, s || 1), m = S(hex || 0xc9c6bd, .75); T.box(.1, .05, .1, m, 0, 0, 0); T.cyl(.03, .045, .14, m, 0, .05, 0, 8); T.sph(.025, m, 0, .21, 0, 1); return T; }
    function lion(K, x, z, s) { const T = K.grp(x, 0, z, x, s || 1), m = S(0xbdb9ae, .8); T.box(.08, .03, .08, m, 0, 0, 0); T.box(.05, .05, .07, m, 0, .03, 0); T.sph(.03, m, 0, .1, .02, 1); return T; }
    function rockCliff(K, x, z, w, h, d, hex) { const T = K.grp(x, 0, z); for (let i = 0; i < 9; i++) { const r = T.add(new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), S(hex || 0x9a968c, .95)), (i % 3 - 1) * w * .32, h * (.2 + Math.floor(i / 3) * .3), ((i * 7) % 3 - 1) * d * .25); r.scale.set(w * .26, h * .28, d * .3); r.rotation.set(i, i * 2, 0); } for (let i = 0; i < 6; i++) T.sph(.07, S(LEAF.DARK[i % 3], .9), (i % 3 - 1) * w * .3, h * (.35 + (i % 2) * .4), d * .3, 1); return T; }
    function people(K, pts, o) { crowd(K, pts, o); }
    function waterBox(K, w, d, x, z, hex) { return K.box(w, .04, d, c4('wb' + hex, () => new THREE.MeshStandardMaterial({ map: vCanvasTex('water', 128, 128, texWater, 2, 2), color: hex || 0xffffff, roughness: .1, metalness: .15, transparent: true, opacity: .92 })), x, 0, z); }
    function ghe(K, x, z, ry, load) { const B = boat(K, x, z, ry); if (load) for (let i = 0; i < 7; i++) B.sph(.025, S([0x7cb342, 0xfdd835, 0xe53935, 0xfb8c00][i % 4], .7), -.15 + i * .05, .08, (i % 2 - .5) * .05, 0); return B; }
    function roofBoat(K, x, z, ry, hex) { const B = boat(K, x, z, ry); B.box(.26, .1, .12, S(0xf4f1ea, .6), 0, .05, 0); B.box(.3, .015, .15, S(hex || 0x2563eb, .5), 0, .15, 0); return B; }

    /* ---------- 9. 29 sa bàn theo ảnh mẫu ---------- */
    const RP = TX('ricepaper', 192, 96, discTex('#c8a46a', '#fbf6e8', '#f6d3c4'), 1, 1);
    const RPN = TX('ricepaperN', 192, 96, discTex('#a88a58', '#f5f1e2'), 1, 1);
    const NOODLE = TX('noodle', 128, 64, stripeTex('#a88a58', '#f7f3e6'), 1, 1);
    const MIEN = TX('mien', 128, 64, stripeTex('#8a7048', '#e8d6a8'), 1, 1);
    const K47 = {
        // 17. Bánh tráng An Ngãi
        AN_NGAI: K => {
            ground(K, GM.sand(), 1.96, 1.5, 0, -.2); ground(K, GM.asphalt(), 1.96, .3, 0, .82);
            northHouse(K, -.6, -.3, .55, .4, { roof: MAT.roofTerra() }); bigPot(K, -.62, -.05, .06); people(K, [[-.5, -.02], [-.75, .05]]);
            for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) dryRack(K, -.05 + i * .22, -.45 + j * .5, .18, .4, RP, 0);
            for (let i = 0; i < 4; i++) dryRack(K, .3 + (i % 2) * .22, .25 + Math.floor(i / 2) * .3, .18, .25, RP, 0);
            people(K, [[.05, .05], [.25, -.1], [.45, .1], [-.1, .35]]);
            gateArch(K, .62, .55, .42, 'LÀNG NGHỀ BÁNH TRÁNG AN NGÃI', 0, 0x8a5a2a); tinRoofShop(K, .78, .05, .3, .25, 'BÁNH TRÁNG', '#fde68a', '#7a2a1a', -Math.PI / 2);
            [[-.9, -.85], [-.3, -.88], [.35, -.85], [.85, -.6], [.88, -.25]].forEach(([x, z], i) => tree(K, 'PALM', x, z, .75 + (i % 2) * .15)); tree(K, 'BAMBOO', -.9, .3, .7);
            moto(K, -.5, .82, 0); moto(K, .1, .85, 0, 0x2f6fd0); truck(K, .55, .82, 0, 0x2f6fd0); for (let i = 0; i < 5; i++) K.cyl(.04, .04, .08, S(0xc9a35e, .8), -.35 + i * .09, 0, .55, 8);
        },
        // 19. Biến động Cồn Thới Sơn
        THOI_SON: K => {
            waterBox(K, .9, 1.96, -.55, 0, 0xd8b26a); ground(K, GM.grass(), 1.1, 1.96, .45, 0);
            [[-.7, -.6], [-.75, .1], [-.55, .7], [-.85, .55]].forEach(([x, z], i) => i < 3 ? roofBoat(K, x, z, 1.4 + i * .2, 0x8a5a2a) : ghe(K, x, z, 1.6, true));
            for (let i = 0; i < 10; i++) tree(K, i % 3 ? 'PALM' : 'BAMBOO', -.15 + (i % 4) * .14, -.85 + Math.floor(i / 4) * .28, .7 + (i % 3) * .1); for (let i = 0; i < 6; i++) banana(K, -.1 + (i % 3) * .12, .2 + Math.floor(i / 3) * .3, .8);
            bHouse(K, .45, -.55, .5, .32, { gable: true, roof: MAT.roofTerra(), wall: 0x9a6a3a }); bHouse(K, .78, -.25, .35, .28, { gable: true, roof: MAT.roofTerra(), wall: 0x9a6a3a, ry: -.4 });
            const st = K.grp(.4, 0, .05); st.box(.36, .04, .26, S(0x8a6a3a), 0, 0, 0); people(st, [[-.1, 0], [0, .05], [.1, 0]], { sit: true }); const r = vnRoof(.4, .3, .14, MAT.thatch(), 0x5a3a20, .02, .04); r.position.y = .3; st.g.add(r); [-1, 1].forEach(a => [-1, 1].forEach(b => st.cyl(.01, .01, .3, S(0x6b4a2f), a * .16, 0, b * .11, 5)));
            for (let i = 0; i < 8; i++) K.sph(.035, S(0x6aa63e, .7), .7 + (i % 3) * .06, .035, .35 + Math.floor(i / 3) * .06, 1);
            people(K, [[.1, .3], [.25, .45], [.55, .55], [.7, .15], [.0, -.3]]); K.box(.7, .02, .1, S(0x8a6a46), .0, .03, .82);
            const lo = K.grp(.75, 0, .7, -.5); lo.box(.12, .06, .08, S(0x3f8a5a, .5), 0, .02, 0); lo.box(.1, .05, .07, S(0x3f8a5a, .5), -.1, .02, 0);
        },
        // 21. Bánh tét Trà Cuôn
        TRA_CUON: K => {
            ground(K, GM.sand(), 1.96, 1.5, 0, -.18); ground(K, GM.asphalt(), .5, 1.96, .78, 0); waterBox(K, .6, .3, .45, -.8);
            for (let i = 0; i < 5; i++) bigPot(K, -.55 + i * .17, -.6, .065); tinRoofShop(K, -.15, -.88, .5, .16);
            for (let i = 0; i < 3; i++) { K.box(.28, .05, .16, S(0x8a6a3a), -.35 + i * .3, .03, -.15); for (let j = 0; j < 8; j++) K.cyl(.018, .018, .12, S(0x2e7d32, .7), -.45 + i * .3 + (j % 4) * .06, .1, -.18 + Math.floor(j / 4) * .06, 8).rotation.z = Math.PI / 2; }
            people(K, [[-.5, -.35], [-.2, -.35], [.1, -.35], [-.6, .1], [-.3, .15], [0, .1], [-.75, .4], [-.5, .5]], { sit: true });
            [[-.8, .3], [-.65, .55], [-.45, .7]].forEach(([x, z], i) => { K.cyl(.07, .06, .04, S([0x7b2fa0, 0x7cb342, 0xfdd835][i], .7), x, 0, z, 12); });
            K.box(.5, .02, .25, S(0x7a5a3a), .25, .1, .2); for (let i = 0; i < 12; i++) K.cyl(.018, .018, .1, S(0x2e7d32, .7), .05 + (i % 6) * .07, .14, .12 + Math.floor(i / 6) * .1, 8).rotation.z = Math.PI / 2;
            tinRoofShop(K, .1, .62, .45, .22, 'TRÀ CUÔN', '#facc15', '#b91c1c'); tinRoofShop(K, .55, -.25, .32, .3, 'BÁNH TÉT', '#facc15', '#b91c1c', -Math.PI / 2); gateArch(K, .4, .35, .32, 'BÁNH TÉT TRÀ CUÔN', Math.PI / 2);
            [[-.9, -.8], [-.9, -.4], [-.92, .0], [-.88, .45], [.88, -.88]].forEach(([x, z]) => tree(K, 'PALM', x, z, .8)); banana(K, -.85, .8, .9); boat(K, .45, -.8, 0);
            van(K, .78, .2, Math.PI / 2); van(K, .8, .7, Math.PI / 2); moto(K, .68, -.4, Math.PI / 2);
        },
        // 22. Bánh pía Vũ Thơm
        VU_THOM: K => {
            ground(K, GM.brick(), 1.96, 1.96, 0, 0); ground(K, GM.asphalt(), 1.96, .35, 0, .8);
            northHouse(K, -.35, -.45, .9, .5, { roof: MAT.roofTerra() });
            K.box(.9, .32, .04, S(0xe8c768, .85), -.35, .05, -.7); sign(K, -.72, -.15, .3, .12, 'LÒ BÁNH PÍA VŨ THƠM', '#7a4b2a', '#fde68a', .22, 0);
            const oven = K.add(new THREE.Mesh(lathe('pia', [[0, 0], [.17, 0], [.18, .1], [.14, .22], [.06, .28], [0, .29]], 16), S(0xb47a4a, .85)), .55, 0, -.45); K.box(.08, .07, .02, S(0x1a0a05), .55, .02, -.28); const fl = K.box(.06, .05, .01, c4('fireM', () => new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a00, emissiveIntensity: 1.2 })), .55, .02, -.275); K.cyl(.025, .025, .25, S(0x9a6a4a), .62, .2, -.55, 8); smoke(K, .62, .45, -.55);
            for (let i = 0; i < 3; i++) { K.box(.28, .02, .18, S(0x8a6a3a), -.3 + i * .3, .12, .15); [-1, 1].forEach(a => [-1, 1].forEach(b => K.box(.012, .12, .012, S(0x6b4a2f), -.3 + i * .3 + a * .12, 0, .15 + b * .07))); for (let j = 0; j < 8; j++) K.cyl(.022, .022, .015, S(0xe3b26a, .7), -.39 + i * .3 + (j % 4) * .06, .14, .1 + Math.floor(j / 4) * .08, 10); }
            for (let i = 0; i < 6; i++) K.box(.1, .08, .08, S(i % 2 ? 0xd62828 : 0xf2c230, .6), .1 + (i % 3) * .11, Math.floor(i / 3) * .08, -.62);
            stack(K, .35, .42, 8, 0xd6a548, .07); stack(K, .55, .4, 6, 0xd6a548, .07);
            people(K, [[-.45, .1], [-.15, .25], [.15, .05], [.4, .2], [-.6, .45], [-.75, .3], [.6, -.2]]);
            tree(K, 'PALM', .2, -.85, .9); tree(K, 'PALM', .45, -.9, .85); const pom = K.grp(.82, 0, -.8); pom.cyl(.04, .05, .3, S(0x6b4a2f), 0, 0, 0, 6); pom.sph(.22, S(0x3f7f3a, .85), 0, .42, 0, 1); for (let i = 0; i < 6; i++) pom.sph(.03, S(0xb8c84a, .6), Math.cos(i) * .18, .38 + (i % 2) * .1, Math.sin(i) * .18, 0);
            moto(K, -.75, .78, 0); people(K, [[-.6, .7], [-.85, .65]]);
        },
        // 23. Muối Bạc Liêu
        BAC_LIEU_SALT2: K => {
            ground(K, S(0x8a7a5a, .95), 1.96, 1.96, 0, 0);
            for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const x = -.68 + i * .34, z = -.35 + j * .38; K.box(.3, .015, .34, c4('saltPan', () => new THREE.MeshStandardMaterial({ color: 0xd8e6ea, roughness: .05, metalness: .35 })), x, .01, z); if ((i + j) % 2 === 0) for (let k = 0; k < 4; k++) K.cone(.045, .07, S(0xffffff, .5), x - .08 + (k % 2) * .16, .025, z - .09 + Math.floor(k / 2) * .18, 10); }
            for (let i = 0; i < 5; i++) K.box(.02, .03, 1.15, S(0x6b5a40, .9), -.85 + i * .34, 0, .03); for (let j = 0; j < 4; j++) K.box(1.4, .03, .02, S(0x6b5a40, .9), -.17, 0, -.54 + j * .38);
            const hut = K.grp(.6, 0, -.65); [[-.25, -.15], [.25, -.15], [-.25, .15], [.25, .15]].forEach(([a, b]) => hut.cyl(.014, .016, .28, S(0x6b4a2f), a, 0, b, 6)); hut.box(.5, .2, .02, S(0x7a5a3a, .9), 0, 0, -.15); const hr = gableRoof(.6, .4, .14, MAT.thatch(), 0x5a3a20); hr.position.y = .28; hut.g.add(hr); for (let i = 0; i < 9; i++) hut.box(.06, .06, .05, S(0xf0ece2, .8), -.15 + (i % 3) * .08, Math.floor(i / 3) * .055, .02);
            K.cone(.09, .1, S(0xffffff, .5), .45, 0, -.25, 12); K.cone(.07, .08, S(0xffffff, .5), .6, 0, -.25, 12);
            waterBox(K, .4, .15, .6, -.05, 0x9ac0a0); boat(K, .58, -.05, .1); const wh = K.cyl(.08, .08, .02, S(0x6b4a2f), .88, .08, -.3, 10); wh.rotation.x = Math.PI / 2; animatedElements.push({ type: 'WHEEL', mesh: wh });
            const sh = K.grp(-.45, 0, -.82); sh.box(.14, .1, .1, S(0xd8d4cc), 0, 0, 0); const sr = vnRoof(.18, .14, .08, MAT.roofTerra(), 0x7a2a1a, .04, .03); sr.position.y = .1; sh.g.add(sr);
            [[-.7, -.88], [-.3, -.9], [-.85, -.6]].forEach(([x, z]) => tree(K, 'PALM', x, z, .8)); people(K, [[-.2, .0], [.1, .25], [-.5, .3], [.3, -.1], [.1, .55]]); for (let i = 0; i < 4; i++) person(K, -.6 + i * .25, .55 - (i % 2) * .4, { col: 0x3f6e3a });
            K.sph(.12, S(0xc9a24a, .9), .62, .1, .3, 1).scale.y = .6;
        },
        // 24. Ao tôm Cà Mau
        CA_MAU2: K => {
            ground(K, S(0x8a7050, .95), 1.96, 1.96, 0, 0);
            [[-.05, .05, .7, .5], [.45, -.5, .55, .38]].forEach(([x, z, w, d], i) => { K.box(w + .1, .05, d + .1, S(0x9a7a50, .95), x, 0, z); waterBox(K, w, d, x, z, 0x7aa088); for (let k = 0; k < 2; k++) { const pw = K.grp(x + (k - .5) * w * .4, .05, z); pw.box(.18, .02, .02, S(0xf2c230, .5), 0, .01, 0); for (let j = 0; j < 4; j++) { const p = pw.box(.02, .05, .04, S(0x2a6fd0, .5), -.07 + j * .045, 0, 0); } const foam = pw.cyl(.12, .12, .006, S(0xffffff, .3), 0, 0, 0, 16); animatedElements.push({ type: 'FN', fn: t => { pw.g.children.forEach((c, n) => { if (n > 0 && n < 5) c.rotation.x = t * 8; }); } }); } });
            const hut = K.grp(-.05, .05, .05); [[-.08, -.06], [.08, -.06], [-.08, .06], [.08, .06]].forEach(([a, b]) => hut.cyl(.008, .008, .16, S(0x6b4a2f), a, 0, b, 5)); hut.box(.2, .1, .14, S(0x9a7a4a, .9), 0, .14, 0); const hr = gableRoof(.26, .2, .1, MAT.thatch(), 0x5a3a20); hr.position.y = .24; hut.g.add(hr);
            K.box(.5, .02, .05, S(0x8a6a46), .25, .07, -.25); K.box(.05, .02, .4, S(0x8a6a46), .2, .07, -.15);
            for (let i = 0; i < 9; i++) { const T = K.grp(-.75 + (i % 3) * .14, 0, -.75 + Math.floor(i / 3) * .2); for (let k = 0; k < 5; k++) { const rt = T.cyl(.006, .01, .14, S(0x5a4232), Math.cos(k) * .05, 0, Math.sin(k) * .05, 4); rt.rotation.z = Math.cos(k) * .4; } T.sph(.12 + (i % 2) * .03, S(LEAF.DARK[i % 3], .9), 0, .26, 0, 1); }
            for (let i = 0; i < 8; i++) { const b = K.sph(.012, S(0xffffff, .5), -.8 + (i % 4) * .14, .42 + (i % 3) * .05, -.8 + Math.floor(i / 4) * .25, 0); b.scale.set(1.6, .6, .6); }
            ghe(K, -.45, .7, .1, true); for (let i = 0; i < 5; i++) K.box(.08, .05, .06, S(0xf4f4f4, .6), .5 + (i % 3) * .1, Math.floor(i / 3) * .05, .45);
            people(K, [[-.3, .35], [.2, .35], [.45, .2], [.7, .05], [.6, .6], [.3, -.75]]); moto(K, .2, .75, .3); van(K, .75, .75, Math.PI / 2, 0x2f6fd0);
            [[.85, -.85], [.88, -.55]].forEach(([x, z]) => tree(K, 'PALM', x, z, .75));
        },
        // 25. Ngọc trai Phú Quốc
        PHU_QUOC2: K => {
            ground(K, GM.sand(), 1.96, .9, 0, -.53); waterBox(K, 1.96, 1.1, 0, .43, 0x7fe0e0);
            const shop = bHouse(K, -.4, -.65, .6, .35, { gable: true, roof: MAT.roofTerra(), wall: 0xf3efe6 }); sign(K, -.4, -.45, .36, .09, 'NGỌC TRAI PHÚ QUỐC', '#0f766e', '#fde68a', .3, 0, false);
            for (let i = 0; i < 3; i++) K.box(.12, .08, .06, S(0x8a5a3a, .6), -.6 + i * .2, 0, -.38);
            for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const x = -.35 + i * .24, z = .25 + j * .3; K.box(.22, .02, .02, S(0xb06a2a, .6), x, .05, z - .12); K.box(.22, .02, .02, S(0xb06a2a, .6), x, .05, z + .12); K.box(.02, .02, .24, S(0xb06a2a, .6), x - .11, .05, z); for (let k = 0; k < 3; k++) K.cyl(.02, .02, .05, S(k % 2 ? 0x2563eb : 0xf97316, .5), x - .08 + k * .08, .02, z + .13, 8).rotation.z = Math.PI / 2; plane(K, .2, .2, M(0x2a5a4a, .9, 0, { transparent: true, opacity: .45, side: THREE.DoubleSide }), x, .045, z, -Math.PI / 2); }
            const pv = K.grp(.62, 0, .1); [[-.18, -.12], [.18, -.12], [-.18, .12], [.18, .12]].forEach(([a, b]) => pv.cyl(.01, .01, .3, S(0x6b4a2f), a, 0, b, 5)); pv.box(.42, .03, .3, S(0x8a6a46), 0, .08, 0); const pr = gableRoof(.5, .38, .16, MAT.thatch(), 0x5a3a20); pr.position.y = .3; pv.g.add(pr); people(pv, [[-.1, 0], [.08, .05]]); pv.g.children.slice(-2).forEach(m => m.position.y = .11);
            K.box(.3, .02, .08, S(0x8a6a46), -.15, .04, -.12); boat(K, .3, .78, .2); for (let i = 0; i < 6; i++) K.sph(.05 + (i % 3) * .02, S(0x8f8a80, .95), .1 + i * .12, .03, -.2 - (i % 2) * .08, 0);
            [[-.9, -.85], [-.92, -.45], [-.75, -.92], [.15, -.9], [.4, -.88], [.7, -.82]].forEach(([x, z], i) => tree(K, 'PALM', x, z, .8 + (i % 2) * .15)); people(K, [[-.6, -.25], [-.2, -.2], [.0, .3], [.25, .55]]);
            moto(K, -.85, -.2, 1.2); K.box(.1, .07, .05, S(0x2563eb, .5), -.75, 0, -.08);
        },
        // 26. Chợ nổi Cái Răng
        CAI_RANG2: K => {
            waterBox(K, 1.96, 1.5, 0, .2, 0xc9a25a); ground(K, GM.grass(), 1.96, .5, 0, -.73);
            [[-.7, -.65], [-.35, -.7], [-.85, -.25]].forEach(([x, z], i) => { const H = bStilt(K, x, z, .32, .22, { ry: i * .2, wall: 0x7a6a5a, roof: MAT.roofGray() }); });
            K.box(1.7, .06, .14, S(0xa8a49a, .7), .1, .38, -.15); [-.5, .1, .7].forEach(x => K.box(.08, .38, .08, S(0x9a968c, .7), x, 0, -.15)); K.box(1.7, .05, .02, S(0x666666), .1, .44, -.08);
            sign(K, .2, -.18, .7, .14, 'CHỢ NỔI CÁI RĂNG', '#ffffff', '#1d4ed8', .45, 0, false); [[-.3, 0x2563eb], [.4, 0xd62828]].forEach(([x, c]) => truck(K, x, -.15, 0, c).g.position.y = .44);
            for (let i = 0; i < 6; i++) ghe(K, -.6 + (i % 3) * .35, .1 + Math.floor(i / 3) * .3, .2 - i * .1, true);
            roofBoat(K, .55, .3, -.3, 0x2563eb); roofBoat(K, .3, .65, .4, 0xd62828); roofBoat(K, -.25, .7, -.2, 0x16a34a); boat(K, .75, .75, .8);
            for (let i = 0; i < 3; i++) K.cyl(.006, .006, .3, S(0x6b4a2f), -.55 + i * .35, .05, .1, 4);
            [[-.92, -.85], [-.15, -.88], [.9, -.88]].forEach(([x, z]) => tree(K, 'PALM', x, z, .8)); flag(K, -.6, -.5, .45, 0, true);
            people(K, [[-.6, .1], [-.25, .12], [.1, .1], [-.6, .4], [-.25, .42], [.1, .4]], { sit: true }); K.g.children.slice(-6).forEach(m => m.position.y = .08);
        },
        // 27. Lụa Tân Châu
        TAN_CHAU2: K => {
            waterBox(K, .7, 1.0, -.62, -.5, 0xa89a6a); ground(K, GM.sand(), 1.26, 1.0, .35, -.5);
            [[-.8, -.85], [-.5, -.88]].forEach(([x, z]) => bStilt(K, x, z, .25, .18, { wall: 0x7a5a3a, roof: MAT.roofBrown() })); boat(K, -.6, -.45, .4); boat(K, -.75, -.15, -.2);
            const H = bHouse(K, .25, -.6, .65, .38, { gable: true, roof: MAT.roofTerra(), wall: 0x7a5a3a }); for (let i = 0; i < 3; i++) loomFrame(K, .05 + i * .2, -.25, 0, S(0x222244, .7));
            bHouse(K, .75, -.2, .35, .3, { gable: true, roof: MAT.roofTerra(), wall: 0x8a6a4a, ry: -.2 });
            for (let i = 0; i < 6; i++) K.cyl(.05, .045, .08, S(0x5a3a22, .7), -.15 + (i % 3) * .12, 0, -.05 + Math.floor(i / 3) * .12, 12);
            const cols = [0x111111, 0x111111, 0xc62828, 0xf2c230, 0x1d4ed8, 0x111111, 0x111111, 0x111111];
            cols.forEach((c, i) => clothLine(K, -.6 + (i % 4) * .25, .15 + Math.floor(i / 4) * .32, .22, [c, c, c], -.3, .26));
            gateArch(K, .45, .55, .35, 'LÀNG NGHỀ LỤA TÂN CHÂU', -.3); van(K, .8, .3, -1.2); moto(K, .65, .78, -.4);
            [[-.9, .8], [.9, -.85], [.6, -.9]].forEach(([x, z]) => tree(K, 'PALM', x, z, .8)); people(K, [[-.4, -.3], [-.2, -.35], [.0, .05], [.3, .3], [.55, .15], [-.1, .7]]);
        },
        // 28. Làng hoa Sa Đéc
        SA_DEC2: K => {
            waterBox(K, 1.3, 1.3, -.3, .3, 0x7a8a6a); ground(K, GM.grass(), 1.96, .7, 0, -.63); ground(K, S(0xd8d4cc, .8), .45, 1.3, .75, .3);
            for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const x = -.75 + i * .28, z = .0 + j * .3; K.box(.22, .03, .2, S(0x8a6a46), x, .04, z); for (let k = 0; k < 6; k++) K.sph(.035, S(j === 2 && i === 0 ? 0xe53935 : 0xf6c41a, .75), x - .07 + (k % 3) * .07, .09, z - .05 + Math.floor(k / 3) * .1, 1); }
            ghe(K, -.5, .82, .2); ghe(K, .1, .75, -.4); const fb = boat(K, .38, .3, 1.2); for (let i = 0; i < 4; i++) fb.sph(.03, S(0xf6c41a, .7), -.12 + i * .08, .08, 0, 1);
            const um = [0xe53935, 0xf97316, 0xfacc15, 0x22c55e, 0x3b82f6, 0xa855f7, 0xec4899];
            for (let i = 0; i < 14; i++) { const x = -.85 + (i % 7) * .22, z = -.42 - Math.floor(i / 7) * .14; K.cyl(.005, .005, .22, S(0x6b4a2f), x, 0, z, 4); K.cone(.07, .04, S(um[i % 7], .6), x, .22, z, 10); }
            const br = K.grp(.25, 0, -.05, .6); br.box(1.2, .03, .08, S(0xc62828, .6), 0, .18, 0); for (let i = 0; i < 7; i++) br.box(.02, .18, .02, S(0xc62828, .6), -.55 + i * .18, 0, .04);
            for (let i = 0; i < 6; i++) { K.cyl(.005, .005, .3, S(0x6b4a2f), .75, 0, -.25 + i * .18, 4); K.cone(.08, .045, S(um[(i + 3) % 7], .6), .75, .3, -.25 + i * .18, 10); }
            const tw = K.grp(.65, 0, -.75); [[-.06, -.06], [.06, -.06], [-.06, .06], [.06, .06]].forEach(([a, b]) => tw.box(.012, .5, .012, S(0x8a7a6a), a, 0, b)); tw.box(.16, .03, .16, S(0x8a6a46), 0, .5, 0);
            const wm = K.grp(.25, 0, -.8); wm.cyl(.05, .07, .22, S(0xc62828, .6), 0, 0, 0, 8); const bl = wm.grp(0, .22, .07); for (let i = 0; i < 4; i++) { const b = bl.box(.02, .14, .005, S(0xf5f0e0), 0, 0, 0); b.geometry.translate(0, .07, 0); b.position.y = 0; b.rotation.z = i * Math.PI / 2; } animatedElements.push({ type: 'FN', fn: t => { bl.g.rotation.z = t; } });
            greenhouse(K, -.15, -.8); bHouse(K, -.6, -.8, .3, .2, { gable: true, roof: MAT.roofTerra() }); gateArch(K, .75, -.35, .38, 'LÀNG HOA SA ĐÉC', 0, 0xb91c1c);
            [[-.92, -.6], [-.85, -.92], [.0, -.92]].forEach(([x, z]) => tree(K, 'PALM', x, z, .75)); van(K, .82, .75, Math.PI / 2, 0x16a34a); people(K, [[.7, .1], [.8, .45], [.65, .6], [.3, -.4], [-.3, -.5]]);
        },
        // 29. Trống Bình An
        BINH_AN: K => {
            ground(K, GM.sand(), 1.96, 1.96, 0, 0); waterBox(K, .5, .3, .7, -.82);
            const ws = K.grp(-.5, 0, -.55); [[-.3, -.2], [.3, -.2], [-.3, .2], [.3, .2]].forEach(([a, b]) => ws.cyl(.016, .018, .3, S(0x6b4a2f), a, 0, b, 6)); ws.box(.62, .22, .02, S(0x7a5a3a), 0, 0, -.2); const r = gableRoof(.72, .5, .2, MAT.roofTerra(), 0x7a2a1a); r.position.y = .3; ws.g.add(r);
            barrels(K, -.7, -.6, 6); for (let i = 0; i < 6; i++) { const lg = K.cyl(.03, .03, .32, S(0xa87a4a, .8), -.75, .03 + Math.floor(i / 3) * .055, -.1 + (i % 3) * .065, 8); lg.rotation.x = Math.PI / 2; lg.position.y = .03 + Math.floor(i / 3) * .055; }
            const drum = (x, z, r2, ry) => { const D = K.grp(x, 0, z, ry || 0); D.cyl(r2, r2 * .95, r2 * 1.3, S(0xb91c1c, .5), 0, 0, 0, 16); D.cyl(r2 * .98, r2 * .98, .008, S(0xe8d6a8, .6), 0, r2 * 1.3, 0, 16); return D; };
            const sh = K.grp(.55, 0, -.3); [[-.3, -.25], [.3, -.25], [-.3, .25], [.3, .25]].forEach(([a, b]) => sh.cyl(.014, .016, .3, S(0x6b4a2f), a, 0, b, 6)); sh.box(.02, .25, .5, S(0x7a5a3a), .3, 0, 0); const sr = gableRoof(.66, .6, .16, MAT.roofBrown(), 0x5a3a20); sr.position.y = .3; sh.g.add(sr);
            for (let i = 0; i < 12; i++) drum(.35 + (i % 4) * .11, -.45 + Math.floor(i / 4) * .14, .045);
            for (let i = 0; i < 10; i++) drum(.3 + (i % 5) * .12, .25 + Math.floor(i / 5) * .14, .05);
            [[-.15, -.25], [.08, -.2]].forEach(([x, z]) => { const F = K.grp(x, 0, z); [-1, 1].forEach(a => { const l = F.box(.012, .3, .012, S(0x6b4a2f), a * .1, 0, 0); l.rotation.z = a * .2; }); F.box(.22, .012, .012, S(0x6b4a2f), 0, .28, 0); drum(x, z + .08, .07, 0); });
            drum(-.2, .2, .09); drum(-.35, .35, .06); woodPile(K, -.6, .3); bigPot(K, -.45, .05, .05, true);
            gateArch(K, .0, .62, .45, 'LÀNG NGHỀ TRỐNG BÌNH AN', 0, 0x8a5a2a); for (let i = 0; i < 6; i++) K.cyl(.004, .004, .12, S(0x888888), -.35 + i * .14, 0, .5, 4); van(K, .1, .85, 0); truck(K, -.7, .7, .3, 0x2563eb, 0xb91c1c); moto(K, -.4, .82, .2);
            [[-.9, -.88], [-.55, -.92], [-.2, -.9], [.85, -.6], [.88, -.2], [.9, .2]].forEach(([x, z], i) => tree(K, i % 2 ? 'PALM' : 'DARK', x, z, .75)); boat(K, .7, -.82, 0);
            people(K, [[-.3, -.05], [-.05, .05], [.15, .0], [-.15, .4], [.25, .55], [.55, .1]]);
        },
        // 30. Bánh tráng phơi sương Trảng Bàng
        TRANG_BANG2: K => {
            ground(K, GM.grass(), 1.96, 1.96, 0, 0); ground(K, GM.sand(), 1.0, .9, .45, .35);
            northHouse(K, -.25, -.7, .6, .36, { roof: MAT.roofTerra() }); const kt = K.grp(-.4, 0, -.25); kt.box(.34, .2, .26, S(0x6a5a4a, .9), 0, 0, 0); const kr = gableRoof(.4, .32, .12, MAT.roofGray(), 0x444444); kr.position.y = .2; kt.g.add(kr); bigPot(K, -.42, -.02, .05);
            const th = K.grp(.35, 0, -.55); th.box(.3, .16, .24, S(0x9a7a4a, .9), 0, 0, 0); const tr = gableRoof(.36, .3, .14, MAT.thatch(), 0x5a3a20); tr.position.y = .16; th.g.add(tr);
            for (let i = 0; i < 6; i++) plane(K, .3, .18, RPN, -.8 + (i % 2) * .34, .025, -.3 + Math.floor(i / 2) * .3, -Math.PI / 2);
            for (let i = 0; i < 5; i++) dryRack(K, .05 + (i % 3) * .24, .0 + Math.floor(i / 3) * .3, .2, .22, RPN, .3, .08);
            tinRoofShop(K, .7, -.05, .35, .25, 'BÁNH TRÁNG TRẢNG BÀNG', '#facc15', '#14532d', -Math.PI / 2); sign(K, .45, .55, .36, .09, 'BÁNH TRÁNG PHƠI SƯƠNG', '#b91c1c', '#fde68a', .22, -.4);
            [[-.9, -.6], [-.85, -.88], [.6, -.88], [.85, -.75]].forEach(([x, z], i) => i % 2 ? banana(K, x, z, 1) : tree(K, 'BAMBOO', x, z, .8)); for (let i = 0; i < 4; i++) banana(K, .1 + i * .15, -.85, .9);
            const lp = K.grp(.88, 0, .25); lp.cyl(.006, .006, .45, S(0x333333), 0, 0, 0, 5); lp.sph(.025, c4('lampM', () => new THREE.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffc04a, emissiveIntensity: 1 })), 0, .46, 0, 1);
            van(K, .78, .55, Math.PI / 2); moto(K, .3, .78, .5); people(K, [[-.6, .1], [-.3, .3], [.2, .3], [.5, .15], [-.65, -.3]]);
        },
        // 31. Điêu khắc đá Bửu Long
        BUU_LONG: K => {
            ground(K, S(0xc9c4b8, .9), 1.96, 1.96, 0, 0); ground(K, GM.asphalt(), 1.96, .25, 0, .85);
            rockCliff(K, -.15, -.78, .7, .7, .35); rockCliff(K, .7, -.7, .5, .6, .4); waterBox(K, .55, .55, .7, -.15, 0x2f8a6a);
            const pg = K.grp(.25, .42, -.82, 0, .7); pg.box(.3, .12, .2, S(0xe9c46a), 0, 0, 0); const pr = vnRoof(.4, .3, .14, MAT.roofTerra(), 0x7a2a1a, .06, .06); pr.position.y = .12; pg.g.add(pr); const pr2 = vnRoof(.26, .2, .1, MAT.roofTerra(), 0x7a2a1a, .06, .04); pr2.position.y = .24; pg.g.add(pr2);
            for (let i = 0; i < 5; i++) K.box(.1, .03, .1, S(0xb9b4a8), .1 + i * .05, i * .06, -.55 + i * .02);
            [[-.75, -.45], [-.3, -.4]].forEach(([x, z]) => { tinRoofShop(K, x, z, .45, .28, 'ĐÁ MỸ NGHỆ', '#f4f4f4', '#7a1d1d'); const cr = K.grp(x, 0, z + .3); [-1, 1].forEach(a => cr.box(.02, .35, .02, S(0xf2c230, .5), a * .2, 0, 0)); cr.box(.46, .03, .03, S(0xf2c230, .5), 0, .35, 0); });
            for (let i = 0; i < 6; i++) K.box(.18, .12 + (i % 2) * .05, .12, S(0x8a96a8, .85), -.85 + (i % 3) * .22, 0, -.05 + Math.floor(i / 3) * .2);
            statue(K, -.35, .1, 1.8, 0xe8e4da); statue(K, -.1, .05, 1.5, 0xd8d4c8); statue(K, .1, .15, 1.3); for (let i = 0; i < 6; i++) lion(K, -.4 + i * .14, .38, 1.1); for (let i = 0; i < 8; i++) K.box(.04, .1 + (i % 3) * .03, .04, S(0xc9c4b8, .8), -.5 + i * .1, 0, .58);
            const tp = K.grp(.55, 0, .45); tp.box(.4, .14, .22, S(0xe8dcc0), 0, 0, 0); const tr = vnRoof(.46, .28, .12, MAT.roofTerra(), 0x7a2a1a, .05, .05); tr.position.y = .14; tp.g.add(tr); gateArch(K, .25, .62, .3, 'LÀNG ĐÁ BỬU LONG', 0, 0x9a8a7a);
            truck(K, .7, .85, Math.PI, 0xf2f2f2); van(K, -.2, .87, 0, 0x9a9a9a); moto(K, -.6, .85, 0); people(K, [[-.6, .2], [-.2, .35], [.0, -.1], [.35, .1], [.45, .7]]);
        },
        // 32. Bản lĩnh Nam Tây Nguyên - Thác Liêng Nung
        LIENG_NUNG: K => {
            ground(K, GM.grass(), 1.96, 1.96, 0, 0);
            const cl = K.grp(-.35, 0, -.6); for (let i = 0; i < 14; i++) { const c = cl.cyl(.055, .055, .55 + (i % 3) * .08, S(i % 2 ? 0x55534e : 0x6a675f, .9), -.6 + i * .09, 0, (i % 2) * .05, 6); } for (let i = 0; i < 10; i++) cl.sph(.08, S(LEAF.DARK[i % 3], .9), -.6 + i * .13, .66, .02, 1);
            for (let i = 0; i < 7; i++) tree(K, 'DARK', -.95 + i * .2, -.9, .75 + (i % 2) * .15);
            const fall = plane(K, .2, .6, c4('fallM', () => new THREE.MeshStandardMaterial({ map: vCanvasTex('fallT', 32, 128, (g, w, h) => { g.fillStyle = '#e8f6fb'; g.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(160,210,230,.6)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 10 + Math.random() * 20); } }, 1, 1), transparent: true, opacity: .9, roughness: .2 })), -.42, .3, -.5);
            animatedElements.push({ type: 'FN', fn: t => { fall.material.map.offset.y = -t * .4; } }); const mist = K.sph(.14, M(0xffffff, 1, 0, { transparent: true, opacity: .45 }), -.42, .05, -.4, 1); mist.scale.y = .5; mist.castShadow = false;
            const riv = waterBox(K, .35, 1.3, -.35, .3, 0x6fc8d8); riv.rotation.y = .3;
            for (let i = 0; i < 8; i++) K.sph(.04 + (i % 3) * .02, S(0x8a8a84, .9), -.5 + (i % 3) * .14, .02, .1 + Math.floor(i / 3) * .25, 0);
            const br = K.box(.5, .02, .08, S(0x8a6a46), -.3, .1, -.05); [-.5, -.1].forEach(x => K.box(.012, .1, .012, S(0x6b4a2f), x, 0, -.05));
            [[-.75, .45, 0xd62828], [-.6, .6, 0xf2c230], [-.82, .7, 0x2563eb]].forEach(([x, z, c]) => { const tt = K.cone(.07, .08, S(c, .6), x, 0, z, 4); tt.rotation.y = Math.PI / 4; });
            K.box(.06, .45, .3, S(0x8a6a46), .15, 0, -.35).rotation.z = .5;
            [[.45, -.1], [.7, .1], [.55, .45]].forEach(([x, z], i) => { const H = bStilt(K, x, z, .28, .2, { ry: -.3 + i * .2, wall: 0x9a7a4a }); }); gateArch(K, .2, .55, .25, 'THÁC LIÊNG NUNG', 0, 0x6b4a2a);
            for (let i = 0; i < 4; i++) banana(K, .1 + i * .15, -.55, .9); people(K, [[-.3, -.1], [-.15, .3], [.3, .25], [.6, .3], [.45, .7], [-.55, .2]]);
        },
        // 33. Nhà kính Đà Lạt
        DA_LAT2: K => {
            ground(K, GM.grass(), 1.96, 1.96, 0, 0);
            for (let i = 0; i < 3; i++) K.box(1.96, .06 + i * .06, .5, S([0x6a9a4a, 0x5f8f45, 0x557f3f][i], .9), 0, 0, -.7 + i * .02).position.z = -.75 + i * .1;
            const gh = (x, z, y) => { const G2 = K.grp(x, y || 0, z); G2.box(.26, .14, .4, MAT.glass(), 0, 0, 0); const rf = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .4, 12, 1, true, 0, Math.PI), MAT.glass()); rf.rotation.set(Math.PI / 2, 0, Math.PI / 2); rf.position.y = .14; G2.g.add(rf); const gl = G2.box(.22, .1, .36, c4('ghGlow', () => new THREE.MeshStandardMaterial({ color: 0xfff1c0, emissive: 0xffd27a, emissiveIntensity: .7, transparent: true, opacity: .55 })), 0, .01, 0); for (let k = 0; k < 6; k++) G2.sph(.025, S([0xe53935, 0x7cb342, 0xfdd835][k % 3], .7), -.06 + (k % 2) * .12, .03, -.14 + Math.floor(k / 2) * .14, 0); return G2; };
            for (let i = 0; i < 5; i++) gh(-.6 + i * .28, .25); for (let i = 0; i < 4; i++) gh(-.45 + i * .28, -.3, .12); for (let i = 0; i < 3; i++) gh(-.3 + i * .28, -.72, .22);
            K.cyl(.1, .1, .06, S(0x3b82f6, .2), .25, .12, -.05, 16); K.box(.14, .06, .14, S(0x60a5fa, .2), .55, 0, .55);
            const road = K.box(.18, .03, 1.9, S(0x55585c, .9), .78, 0, 0); road.rotation.y = .15; const cafe = K.grp(.72, .25, -.62); cafe.box(.3, .12, .22, S(0x8a6a46), 0, 0, 0); const cr = gableRoof(.34, .26, .1, MAT.roofGray(), 0x444444); cr.position.y = .12; cafe.g.add(cr); for (let i = 0; i < 6; i++) lanternBall(cafe, -.14 + i * .056, .1, .14, 0xffd27a);
            for (let i = 0; i < 12; i++) tree(K, 'PINE', -.95 + (i % 6) * .08 + (i > 5 ? 1.75 : 0), -.9 + Math.floor(i / 2) % 3 * .25, .6 + (i % 3) * .1);
            const ho = K.grp(-.65, .22, -.9); ho.box(.2, .12, .14, S(0xf4e7d0), 0, 0, 0); const hr = gableRoof(.24, .18, .1, MAT.roofTerra(), 0x7a2a1a); hr.position.y = .12; ho.g.add(hr);
            truck(K, -.4, .8, 0, 0x2563eb, 0xe53935); truck(K, .1, .82, 0, 0x16a34a, 0xe53935); moto(K, .65, .5, -1.4); moto(K, .75, .1, -1.6, 0x2563eb); van(K, .82, -.3, -1.4); people(K, [[-.7, .6], [-.2, .62], [.35, .55], [-.5, .05]]);
        },
        // 34. Cà phê Buôn Ma Thuột
        BMT2: K => {
            ground(K, S(0xa8502a, .95), 1.96, 1.96, 0, 0); mound(K, -.6, -.55, .5, .25);
            for (let i = 0; i < 9; i++) { const C2 = K.grp(-.85 + (i % 3) * .22, .08 + (i < 3 ? .05 : 0), -.85 + Math.floor(i / 3) * .25); C2.cyl(.012, .016, .12, S(0x5a4232), 0, 0, 0, 5); C2.sph(.11, S(0x2f6a3a, .85), 0, .2, 0, 1).scale.y = 1.2; for (let k = 0; k < 6; k++) C2.sph(.016, S(0xc62828, .5), Math.cos(k) * .09, .15 + (k % 3) * .05, Math.sin(k) * .09, 0); }
            plane(K, .55, .35, S(0x8a2a1a, .9), -.45, .025, .25, -Math.PI / 2); plane(K, .55, .35, S(0xc9b48a, .9), -.1, .025, .55, -Math.PI / 2); for (let i = 0; i < 6; i++) person(K, -.7 + i * .12, .15 + (i % 2) * .4, { col: 0x2a2a2a });
            const lh = K.grp(.35, 0, -.5); [[-.35, -.15], [.35, -.15], [-.35, .15], [.35, .15]].forEach(([a, b]) => lh.cyl(.015, .018, .14, S(0x6b4a2f), a, 0, b, 6)); lh.box(.76, .03, .36, S(0x7a5a3a), 0, .14, 0); lh.box(.7, .14, .02, S(0x6b4a2a), 0, .17, -.17); const lr = gableRoof(.85, .5, .28, MAT.thatch(), 0x5a3a20); lr.position.y = .32; lh.g.add(lr); bigPot(lh, 0, .08, .05); lh.g.children.slice(-4).forEach(m => m.position.y += .17); for (let i = 0; i < 5; i++) lh.cyl(.035, .03, .07, S(0x8a6a4a, .8), -.3 + i * .14, .17, .1, 10);
            for (let i = 0; i < 4; i++) K.cyl(.06, .06, .015, S(0x3a2414, .8), .15 + i * .15, 0, -.05, 14); sign(K, .72, -.1, .28, .1, 'CÀ PHÊ BUÔN MA THUỘT', '#5a3a20', '#fde68a', .25, -.4);
            gateArch(K, .55, .55, .3, 'BUÔN MA THUỘT', 0, 0x5a3a20); truck(K, .1, .72, .2, 0x2563eb, 0xd9c08a); van(K, .8, .78, Math.PI / 2, 0xf2f2f2); moto(K, -.25, .82, .3);
            [[.85, -.85], [.6, -.9], [.1, -.92]].forEach(([x, z], i) => tree(K, i % 2 ? 'BAMBOO' : 'DARK', x, z, .85)); for (let i = 0; i < 4; i++) lanternBall(K, .6 + i * .08, .3, .08, 0xd62828); people(K, [[.2, .2], [.4, .25], [.6, .3], [.3, -.15]]);
        },
        // 35. Tượng gỗ Jrai
        JRAI: K => {
            ground(K, S(0xb08a5a, .95), 1.96, 1.96, 0, 0); const rd = K.box(.22, .025, 1.96, S(0xa8502a, .95), .82, 0, 0); rd.rotation.y = -.15;
            rongHouse(K, -.05, -.5, 1.05); stiltT(K, -.55, -.62, .3, .22, 0, .9, 0x9a7a4a); stiltT(K, .45, -.62, .32, .24, 0, .9, 0x9a7a4a); stiltT(K, .4, -.05, .3, .24, -.3, .9, 0x9a7a4a);
            for (let i = 0; i < 12; i++) { const x = -.85 + (i % 2) * .08, z = -.5 + Math.floor(i / 2) * .18; const T = K.grp(x, 0, z); T.cyl(.03, .035, .18 + (i % 3) * .05, S(0x6b4a2a, .85), 0, 0, 0, 6); T.sph(.03, S(0x5a3a20, .85), 0, .22 + (i % 3) * .05, 0, 0); }
            for (let i = 0; i < 6; i++) { const T = K.grp(-.5 + i * .1, 0, -.25); T.cyl(.025, .03, .16, S(0x7a5a3a, .85), 0, 0, 0, 6); T.sph(.025, S(0x6b4a2a), 0, .19, 0, 0); }
            for (let i = 0; i < 5; i++) { const lg = K.cyl(.035, .035, .35, S(0x9a6a3a, .85), -.55 + i * .02, .035 + (i % 2) * .06, .25, 8); lg.rotation.z = Math.PI / 2; lg.position.y = .035 + (i % 2) * .06; }
            for (let i = 0; i < 6; i++) K.cyl(.035, .035, .06, S(0xb0804a, .85), -.2 + (i % 3) * .1, 0, .3 + Math.floor(i / 3) * .12, 8);
            stall(K, .35, .4, 0x8a5a2a); sign(K, .0, .62, .4, .08, 'LÀNG IA NUENG', '#3a2414', '#fde68a', .2); for (let i = 0; i < 8; i++) K.box(.012, .1, .012, S(0x6b4a2f), -.45 + i * .12, 0, .72);
            van(K, .8, .55, -1.4); moto(K, .78, .1, -1.6); [[-.9, -.9], [.88, -.88], [.9, -.4], [-.92, .8]].forEach(([x, z], i) => i % 2 ? banana(K, x, z, 1) : tree(K, 'DARK', x, z, .9));
            people(K, [[-.35, .05], [-.15, .1], [.05, .0], [.15, .25], [-.25, .4], [.45, .2], [.5, .55]]);
        },
        // 36. Thổ cẩm Kon Tum
        KON_TUM2: K => {
            ground(K, S(0xb5733e, .95), 1.96, 1.96, 0, 0); mound(K, .3, -.92, .35, .45).material = S(0xb5733e, .9);
            rongHouse(K, -.55, -.45, 1.15); stiltT(K, .15, -.5, .4, .28, 0, 1, 0xa8865a); tinRoofShop(K, .6, -.3, .4, .3, 'THỔ CẨM KON TUM', '#5a3a20', '#fde68a');
            const pat = TX('brocade', 64, 64, (g, w, h) => { g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 12) { g.fillStyle = ['#c62828', '#f2c230', '#f4f4f4', '#2563eb'][(y / 12 | 0) % 4]; g.fillRect(0, y, w, 4); for (let x = 0; x < w; x += 10) { g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + 5, y + 9); g.lineTo(x + 10, y + 4); g.fill(); } } }, 1, 1);
            clothLine(K, -.7, .1, .5, [0xc62828, 0x1a1a1a, 0xf2c230, 0xc62828, 0x2563eb], .3, .32);
            [[-.3, .45], [.05, .3], [.25, .1]].forEach(([x, z]) => { K.box(.3, .01, .16, S(0xd9c08a, .9), x, 0, z); plane(K, .2, .1, pat, x, .02, z, -Math.PI / 2); person(K, x - .12, z, { sit: true, col: 0x1a1a1a, hat: false }); person(K, x + .12, z, { sit: true, col: 0x1a1a1a, hat: false }); });
            for (let i = 0; i < 6; i++) K.cyl(.04, .035, .09, S(i % 2 ? 0x6b4a2a : 0xe8e0cc, .7), .05 + (i % 3) * .1, 0, -.15 + Math.floor(i / 3) * .1, 10);
            for (let i = 0; i < 3; i++) { const d = K.grp(.5 + i * .1, 0, .3); d.box(.06, .03, .025, S(0xc99a5a), 0, .02, 0); d.sph(.015, S(0xc99a5a), .03, .045, 0, 0); }
            moto(K, .7, .6, -.4); moto(K, .8, .3, -.8, 0x2563eb); [[-.9, .6], [.9, -.85], [-.2, -.9], [.88, .0]].forEach(([x, z], i) => i % 2 ? banana(K, x, z, 1) : tree(K, 'DARK', x, z, .85)); people(K, [[.4, .55], [.55, .45], [.2, .65], [-.1, .7]]);
        },
        // 37. Biến động Thành Cổ Quảng Trị
        THANH_CO: K => {
            waterBox(K, .45, 1.96, -.78, 0, 0x5fb0a8); ground(K, GM.asphalt(), 1.5, .2, .2, .88);
            const W2 = 1.15, wallM = S(0x9a5a3a, .9); [[0, -W2 / 2, W2, .06], [0, W2 / 2, W2, .06], [-W2 / 2, 0, .06, W2], [W2 / 2, 0, .06, W2]].forEach(([x, z, w, d]) => { K.box(w + .06, .09, d + .06, wallM, .1 + x, 0, -.1 + z); K.box(w, .03, d, GM.grass(), .1 + x, .09, -.1 + z); });
            waterBox(K, .08, 1.3, .78, -.1, 0x4a8a6a); K.box(1.0, .015, 1.0, GM.grass(), .1, 0, -.1);
            const g2 = K.grp(.1, 0, .48); g2.box(.24, .16, .1, wallM, 0, 0, 0); g2.box(.08, .1, .11, S(0x2a1a10), 0, 0, 0); const gr = vnRoof(.26, .14, .08, MAT.roofTerra(), 0x7a2a1a, .05, .03); gr.position.y = .16; g2.g.add(gr);
            const M2 = K.grp(.1, 0, -.15); for (let i = 0; i < 4; i++) M2.cyl(.3 - i * .05, .31 - i * .05, .03, S(0xe8e4dc, .6), 0, i * .03, 0, 28); M2.cyl(.05, .07, .5, S(0xf4f2ee, .5), 0, .12, 0, 8); M2.cyl(.035, .05, .14, S(0xf4f2ee, .5), 0, .62, 0, 8); M2.cone(.025, .08, S(0xd6a548, .4, .4), 0, .76, 0, 8); M2.box(.06, .06, .01, S(0xc62828), 0, .25, .065);
            flag(K, -.25, .2, .55, 0, true); for (let i = 0; i < 10; i++) person(K, -.12 + (i % 5) * .05, .15 + Math.floor(i / 5) * .06, { col: 0x3f6e3a, hat: false }); for (let i = 0; i < 8; i++) person(K, .2 + (i % 4) * .05, .15 + Math.floor(i / 4) * .06, { col: 0x1d4ed8, hat: false });
            const tm = K.grp(.45, 0, -.55); tm.box(.3, .1, .16, S(0xe8dcc0), 0, 0, 0); const tr = vnRoof(.34, .2, .1, MAT.roofTerra(), 0x7a2a1a, .05, .04); tr.position.y = .1; tm.g.add(tr);
            [[-.35, -.55], [-.3, -.3], [.55, -.2], [.5, .2], [-.4, .3]].forEach(([x, z], i) => { const T = K.grp(x, 0, z); T.cyl(.015, .02, .12, S(0x5a4232), 0, 0, 0, 5); T.sph(.1, S(i % 2 ? 0xe2462a : 0x3f7f3a, .85), 0, .17, 0, 1).scale.y = .7; });
            for (let i = 0; i < 12; i++) lanternBall(K, -.85 + (i % 3) * .1, .07, -.7 + Math.floor(i / 3) * .4, 0xffb23a); boat(K, -.75, .3, 1.4); basketBoat(K, -.8, -.4);
            van(K, .5, .88, 0, 0xf2f2f2); van(K, -.1, .9, Math.PI, 0xf2c230); moto(K, .2, .85, 0); people(K, [[.6, .65], [.35, .7], [-.4, .7]]);
        },
        // 38. Làng tương Nam Đàn
        NAM_DAN: K => {
            ground(K, GM.brick(), 1.96, 1.96, 0, 0); waterBox(K, 1.96, .25, 0, -.86, 0x8ab0a0);
            northHouse(K, -.6, -.35, .5, .36, { ry: Math.PI / 2, roof: MAT.roofTerra() }); K.box(.04, .3, .5, S(0xe8c768, .85), -.86, .05, -.35);
            const jt = S(0x6b3a1f, .25); jarRows(K, -.25, -.6, 6, 3, jt, .12); jarRows(K, -.25, -.15, 6, 3, jt, .12); jarRows(K, -.2, .35, 5, 2, jt, .12);
            for (let i = 0; i < 4; i++) K.cyl(.06, .06, .02, S(0x8a6a3a), -.7 + (i % 2) * .15, 0, .3 + Math.floor(i / 2) * .15, 12); for (let i = 0; i < 6; i++) K.cyl(.04, .04, .012, S(i % 2 ? 0x7cb342 : 0xd6a548, .7), -.72 + (i % 2) * .15, .02, .3 + Math.floor(i / 2) * .15, 10);
            bigPot(K, -.75, .7, .06); const sh = tinRoofShop(K, .65, -.2, .38, .32, 'ĐẶC SẢN TƯƠNG NAM ĐÀN', '#fde68a', '#b91c1c', -Math.PI / 2); gateArch(K, .45, .5, .3, 'LÀNG TƯƠNG NAM ĐÀN', -.3, 0x8a5a2a);
            [[-.9, -.6], [.0, -.95], [.5, -.92], [.85, -.75]].forEach(([x, z], i) => tree(K, i % 2 ? 'PALM' : 'DARK', x, z, .8)); moto(K, .7, .75, -.4); people(K, [[.0, .1], [-.5, .1], [.35, .2], [.7, .45], [.2, .7]]); van(K, .55, -.75, .2, 0xf2f2f2);
        },
        // 39. Rượu cần Mường Vang
        MUONG_VANG: K => {
            ground(K, GM.grass(), 1.96, 1.96, 0, 0); terraces(K, -.1, -.6, 4, false);
            stiltT(K, -.55, -.1, .45, .32, .1, 1); stiltT(K, .3, .1, .45, .32, -.1, 1);
            const st = waterBox(K, .14, 1.4, -.05, -.1, 0x8fd8e0); st.rotation.y = -.35; plane(K, .1, .3, M(0xe8f6fb, .2, 0, { transparent: true, opacity: .8 }), .1, .25, -.75);
            const wh = K.cyl(.12, .12, .025, S(0x7a5a3a), .2, .12, -.55, 12); wh.rotation.x = Math.PI / 2; animatedElements.push({ type: 'WHEEL', mesh: wh });
            rockCliff(K, .75, -.65, .4, .6, .35, 0x8a8a80); const jar = K.add(new THREE.Mesh(lathe('bigjar', [[0, 0], [.1, 0], [.15, .08], [.16, .18], [.1, .28], [.06, .32], [.07, .34], [0, .34]], 16), S(0x7a4a2a, .4)), .7, .35, -.45); jar.rotation.z = -.5; smoke(K, .62, .7, -.45);
            jarRows(K, .15, .45, 6, 2, S(0x8a4a2a, .3), .1); jarRows(K, -.65, .55, 3, 2, S(0x8a4a2a, .3), .1); bigPot(K, -.75, .3, .06);
            for (let i = 0; i < 4; i++) { const c = K.cyl(.004, .004, .2, S(0xd9c08a), .2 + i * .1, .1, .45, 4); c.rotation.z = .4; }
            [[-.9, -.85], [-.75, -.6], [.0, -.92]].forEach(([x, z]) => tree(K, 'BAMBOO', x, z, .8)); banana(K, .6, -.1, .9); people(K, [[.05, .3], [.3, .55], [-.6, .7], [-.4, .3], [.5, .4]], { hat: false });
        },
        // 40. Khăn Piêu Sơn La
        SON_LA2: K => {
            ground(K, GM.grass(), 1.96, 1.96, 0, 0); ground(K, S(0xb08a5a, .95), 1.3, .9, .2, .3);
            const H = bStilt(K, -.35, -.35, .7, .45, { s: 1.15, wall: 0xb08a58 }); clothLine(K, -.85, .15, .25, [0x1a1a2e, 0x1a1a2e, 0x1a1a2e], Math.PI / 2, .32);
            const pat = TX('pieu', 96, 48, (g, w, h) => { g.fillStyle = '#121225'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 12) { g.fillStyle = ['#e53935', '#fdd835', '#43a047', '#fb8c00'][(x / 12 | 0) % 4]; g.fillRect(x, h - 12, 8, 10); g.fillRect(x, 2, 8, 6); } }, 1, 1);
            const R = K.grp(.5, 0, -.35); [-1, 1].forEach(a => R.box(.012, .4, .012, S(0x7a4b2a), a * .32, 0, 0)); R.box(.66, .01, .01, S(0x7a4b2a), 0, .38, 0); for (let i = 0; i < 6; i++) plane(R, .09, .22, pat, -.27 + i * .11, .25, 0); R.box(.66, .01, .01, S(0x7a4b2a), 0, .2, .1); for (let i = 0; i < 5; i++) plane(R, .1, .14, pat, -.24 + i * .12, .12, .1);
            for (let i = 0; i < 4; i++) person(K, -.35 + i * .14, .2 + (i % 2) * .06, { sit: true, col: 0x1a1a2e, hat: false }); [[-.3, .35], [.0, .35]].forEach(([x, z]) => K.box(.2, .01, .12, S(0x2a2a4a), x, .05, z));
            for (let i = 0; i < 5; i++) { K.cyl(.05, .04, .04, S(0xb8935a, .9), -.2 + i * .1, 0, .6, 10); for (let k = 0; k < 3; k++) K.sph(.018, S([0xe53935, 0x2563eb, 0xfdd835][k], .7), -.22 + i * .1 + k * .015, .05, .6, 0); }
            jarRows(K, -.85, -.05, 2, 3, S(0x3a3a3a, .4), .1); const pp = K.grp(.82, 0, -.6); pp.cyl(.008, .01, .55, S(0x9a9a92), 0, 0, 0, 5);
            const peach = K.grp(.2, 0, -.85); peach.cyl(.015, .02, .2, S(0x5a4232), 0, 0, 0, 5); peach.sph(.14, S(0xf6a6b7, .8), 0, .28, 0, 1);
            K.cyl(.025, .025, .5, S(0x9ab04a), .3, .03, .8, 8).rotation.z = Math.PI / 2; moto(K, .75, .45, -1.2, 0x333333); people(K, [[.45, .15], [.6, .25], [.35, .45]]);
            banana(K, -.9, -.85, 1); tree(K, 'BAMBOO', .9, .7, .8); for (let i = 0; i < 3; i++) { const m = K.cone(.25, .5, S([0x6a8a5a, 0x7a9a6a, 0x5a7a4a][i], .9), -.4 + i * .5, 0, -.98, 5); m.scale.z = .25; }
        },
        // 41. Miến dong Bình Lư
        BINH_LU: K => {
            ground(K, GM.grass(), 1.96, 1.96, 0, 0); ground(K, S(0xb5946a, .95), 1.1, 1.2, -.4, .25);
            stiltT(K, -.5, -.3, .45, .3, 0, 1); stiltT(K, -.1, -.78, .4, .26, 0, .9); stiltT(K, .55, -.75, .42, .28, -.1, .9);
            const sl = K.grp(.45, 0, .05); sl.box(.9, .08, 1.0, GM.grass(), 0, 0, 0); for (let i = 0; i < 10; i++) dryRack(sl, -.3 + (i % 3) * .26, -.35 + Math.floor(i / 3) * .25, .22, .14, i % 2 ? MIEN : NOODLE, .1, .1).g.position.y = .08;
            for (let i = 0; i < 12; i++) K.box(.008, .14, .008, S(0x7a5a3a), .02 + i * .08, 0, -.5);
            bigPot(K, -.4, .1, .09); bigPot(K, -.2, .05, .06); K.box(.16, .08, .1, S(0x9a9a92, .5, .5), -.05, 0, .2);
            for (let i = 0; i < 8; i++) { const c = K.cyl(.02, .015, .16, S(0x8a5a3a, .9), -.85 + (i % 4) * .05, .02 + Math.floor(i / 4) * .03, .25, 6); c.rotation.z = Math.PI / 2; c.position.y = .02 + Math.floor(i / 4) * .03; }
            for (let i = 0; i < 8; i++) K.box(.08, .1, .06, S(0xd9c9a3, .9), .3 + (i % 4) * .09, Math.floor(i / 4) * .1, .65);
            const tk = K.grp(.55, 0, .82, .1); tk.box(.08, .08, .1, S(0xc62828, .4), .12, .02, 0); tk.box(.2, .03, .14, S(0x2563eb, .5), -.04, .04, 0); for (let i = 0; i < 4; i++) tk.box(.06, .05, .05, S(0xd9c9a3, .9), -.1 + (i % 2) * .07, .07, (i < 2 ? -1 : 1) * .03);
            for (let i = 0; i < 4; i++) K.sph(.02, S(0xf4f1ea, .7), -.6 + i * .06, .02, .55, 0); [[-.9, -.6], [-.9, -.2], [.9, -.4], [.88, .0]].forEach(([x, z], i) => i % 2 ? banana(K, x, z, 1) : tree(K, 'BAMBOO', x, z, .8));
            people(K, [[-.55, .1], [-.3, .3], [-.15, .45], [.1, .4], [.3, .3], [-.6, .5]], { hat: false });
        },
        // 42. Chợ phiên Tây Bắc
        CHO_PHIEN: K => {
            ground(K, GM.grass(), 1.96, 1.96, 0, 0);
            const lvl = [[-.55, .12, .9], [-.0, .06, 1.96], [.5, 0, 1.96]]; K.box(1.96, .14, .8, S(0x8a8a80, .95), 0, 0, -.58); K.box(1.96, .08, .45, S(0x9a9a8f, .95), 0, 0, -.05); ground(K, GM.asphalt(), 1.96, .3, 0, .82);
            const stallT = (x, y, z, w, ry, wares) => { const S2 = K.grp(x, y, z, ry || 0); [[-w / 2, -.08], [w / 2, -.08], [-w / 2, .08], [w / 2, .08]].forEach(([a, b]) => S2.cyl(.008, .008, .2, S(0x6b4a2f), a, 0, b, 5)); const r = gableRoof(w + .06, .24, .08, MAT.thatch(), 0x5a3a20); r.position.y = .2; S2.g.add(r); S2.box(w * .9, .05, .14, S(0x7a5a3a), 0, .04, 0); (wares || [0xc62828, 0x2563eb, 0xf2c230, 0x16a34a]).forEach((c, i) => S2.box(w * .18, .04, .1, S(c, .7), -w * .35 + i * w * .23, .09, 0)); return S2; };
            for (let i = 0; i < 5; i++) stallT(-.75 + i * .38, .14, -.65, .32); for (let i = 0; i < 4; i++) stallT(-.7 + i * .42, .08, -.12, .3, 0, i % 2 ? [0xb08a5a, 0x7cb342, 0xc9a24a] : null);
            for (let i = 0; i < 3; i++) { K.cyl(.05, .05, .06, S(0x333333), .2 + i * .14, .08, .05, 12); smoke(K, .2 + i * .14, .16, .05); }
            for (let i = 0; i < 3; i++) { const H = K.grp(-.6 + i * .25, 0, .4, i); H.box(.12, .05, .04, S(0x7a4a2a, .7), 0, .07, 0); [-.04, .04].forEach(a => [-.015, .015].forEach(b => H.box(.01, .07, .01, S(0x6a3a1a), a, 0, b))); H.box(.03, .05, .03, S(0x7a4a2a, .7), .07, .1, 0); }
            for (let i = 0; i < 2; i++) { const p2 = K.sph(.04, S(0xe8a0a0, .7), .1 + i * .12, .04, .45, 1); p2.scale.x = 1.5; }
            people(K, [[-.7, -.5], [-.3, -.48], [.1, -.5], [.5, -.48], [-.5, .02], [-.1, .05], [.35, .3], [.0, .4], [-.3, .55], [.25, .6]], { hat: false });
            van(K, .5, .8, 0, 0x2563eb); van(K, .8, .55, -.4, 0xf2f2f2); van(K, .15, .85, 0, 0xe2662a); moto(K, -.4, .82, 0);
            [[-.9, -.92], [.9, -.9]].forEach(([x, z]) => { const P = K.grp(x, .14, z); P.cyl(.015, .02, .18, S(0x5a4232), 0, 0, 0, 5); P.sph(.13, S(0xf6a6b7, .8), 0, .26, 0, 1); }); flag(K, -.4, -.9, .5, 0, true); flag(K, .4, -.9, .5, 0, true); K.g.children.slice(-4).forEach(m => m.position.y += .14);
        },
        // 43. Dệt lanh Lùng Tám
        LUNG_TAM: K => {
            ground(K, S(0xc4a87a, .95), 1.96, 1.96, 0, 0); rockCliff(K, -.4, -.85, 1.0, .9, .3, 0x8a8a84);
            const H = K.grp(-.25, 0, -.42); H.box(.8, .32, .4, S(0xb88a5a, .95), 0, 0, 0); H.box(.12, .2, .01, S(0x3a2a1a), -.1, 0, .205); H.box(.08, .08, .01, S(0x3a2a1a), -.3, .15, .205); const r = gableRoof(.92, .54, .22, c4('yinyang', () => new THREE.MeshStandardMaterial({ map: vCanvasTex('yy', 64, 64, texRibs('#4a4f52', '#2e3235'), 6, 6), roughness: .8, side: THREE.DoubleSide })), 0x2a2a2a); r.position.y = .32; H.g.add(r); sign(H, -.3, .21, .18, .08, 'HTX DỆT LANH LÙNG TÁM', '#5a3a20', '#fde68a', .16, 0, false);
            loomFrame(K, .1, -.15, 0, S(0x2a3a6a, .7)); person(K, .1, -.05, { sit: true, col: 0x1a1a2e, hat: false });
            const R = K.grp(.6, 0, -.35); [-1, 1].forEach(a => R.box(.012, .35, .012, S(0x7a4b2a), a * .3, 0, 0)); R.box(.62, .01, .01, S(0x7a4b2a), 0, .34, 0); for (let i = 0; i < 6; i++) plane(R, .09, .26, S(i % 3 ? 0x1e3a8a : 0x2a4aa0, .8), -.25 + i * .1, .2, 0);
            for (let i = 0; i < 4; i++) K.cyl(.07, .065, .12, S(0x4a3a2a, .8), .25 + i * .15, 0, .05, 12); for (let i = 0; i < 4; i++) K.cyl(.06, .06, .005, S(0x1e3a8a, .3), .25 + i * .15, .12, .05, 12);
            K.box(.4, .02, .14, S(0x7a5a3a), -.3, .1, .2); [-1, 1].forEach(a => K.box(.012, .1, .012, S(0x6b4a2f), -.3 + a * .17, 0, .2)); people(K, [[-.45, .3], [-.15, .3], [-.6, .05]], { sit: true, hat: false });
            const wh = K.cyl(.06, .06, .015, S(0x7a5a3a), -.75, .1, .25, 12); wh.rotation.x = Math.PI / 2; animatedElements.push({ type: 'WHEEL', mesh: wh });
            K.box(.4, .05, .22, S(0xb8935a, .9), .2, 0, .55); [0xc62828, 0x1e3a8a, 0xf2c230, 0x16a34a, 0xd946ef].forEach((c, i) => K.box(.07, .04, .1, S(c, .7), .05 + i * .075, .05, .55)); clothLine(K, .15, .3, .4, [0xc62828, 0x7c3aed, 0xf2c230, 0x1e3a8a], 0, .25);
            const peach = K.grp(.75, 0, -.75); peach.cyl(.015, .02, .2, S(0x5a4232), 0, 0, 0, 5); peach.sph(.14, S(0xf6a6b7, .8), 0, .28, 0, 1); moto(K, .78, .35, -1.2); banana(K, -.85, -.2, 1); people(K, [[.4, .75], [.6, .6], [.0, .7]]);
            for (let i = 0; i < 6; i++) K.box(.08, .01, .08, S(0x8a8a84, .9), -.55 + i * .1, 0, .55 - (i % 2) * .08);
        },
        // 44. Làng rèn Phúc Sen
        PHUC_SEN: K => {
            ground(K, S(0xb09670, .95), 1.96, 1.96, 0, 0); rockCliff(K, -.6, -.8, .8, .9, .35, 0x9a968c);
            const H = bStilt(K, -.35, -.35, .7, .45, { s: 1.1, wall: 0x7a5a3a, roof: MAT.roofGray() }); for (let i = 0; i < 3; i++) plane(K, .05, .14, S(0x1e3a8a, .7), -.15 + i * .07, .32, -.08);
            const F = K.grp(.5, 0, -.35); [[-.3, -.2], [.3, -.2], [-.3, .2], [.3, .2]].forEach(([a, b]) => F.cyl(.014, .016, .3, S(0x5a4232), a, 0, b, 6)); F.box(.62, .25, .02, S(0x6a5a4a), 0, 0, -.2); const fr = gableRoof(.7, .5, .14, MAT.roofGray(), 0x444444); fr.position.y = .3; F.g.add(fr);
            F.box(.18, .12, .14, S(0x7a5a4a, .9), -.1, 0, -.08); F.box(.08, .06, .01, c4('fireM', () => new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a00, emissiveIntensity: 1.2 })), -.1, .03, -.005); smoke(F, -.1, .12, -.1);
            K.cyl(.08, .1, .1, S(0x8a5a3a), .82, 0, -.35, 10); K.cone(.12, .14, S(0x1a1a1a, .9), .78, 0, -.05, 10);
            [[.3, .05], [.15, .2]].forEach(([x, z]) => { K.box(.06, .06, .05, S(0x3a3a3a, .3, .5), x, 0, z); }); K.box(.25, .06, .1, S(0x6a6a6a, .5, .4), .45, 0, .25); waterBox(K, .2, .07, .45, .25, 0x6a8aa0);
            for (let i = 0; i < 8; i++) { const b = K.box(.18, .012, .012, S(0x4a4a4a, .4, .5), .6 + (i % 2) * .05, .01 + Math.floor(i / 2) * .012, .45); b.rotation.y = i * .3; }
            for (let i = 0; i < 4; i++) { const r2 = K.box(.012, .2, .1, S(0x8a6a46), .1 + i * .06, 0, .45); r2.rotation.z = .3; }
            for (let i = 0; i < 4; i++) person(K, .2 + (i % 2) * .2, -.05 + Math.floor(i / 2) * .25, { col: 0x1e3a8a, hat: false }); people(K, [[-.2, .5], [-.05, .55], [.0, .7]]);
            moto(K, -.6, .65, .3); moto(K, -.8, .4, .6, 0x2563eb); [[-.8, .1], [.1, .8]].forEach(([x, z]) => { const c = K.sph(.03, S(0xd9a05a, .7), x, .03, z, 1); }); banana(K, .1, -.75, 1); tree(K, 'DARK', .85, -.8, .8);
        },
        // 45. Bản lĩnh Hòn Vọng Phu - Núi Tô Thị
        TO_THI: K => {
            ground(K, S(0xc9c4b8, .9), 1.96, 1.96, 0, 0);
            const mt = K.grp(-.15, 0, -.4); mt.g.scale.set(1.2, 1.75, 1.1); for (let i = 0; i < 16; i++) { const a = i * 2.4, r = (i % 4) * .14, h = .9 - r * 1.1; const rk = mt.add(new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), S(i % 2 ? 0x9a968c : 0x8a867c, .95)), Math.cos(a) * r, h * .55, Math.sin(a) * r * .8); rk.scale.set(.22, h * .6, .2); rk.rotation.set(i, i * 1.7, 0); } for (let i = 0; i < 12; i++) mt.sph(.07, S(LEAF.DARK[i % 3], .9), Math.cos(i * 1.3) * .35, .3 + (i % 4) * .15, Math.sin(i * 1.3) * .3, 1);
            const sp = K.grp(-.32, 1.52, -.42, .6, 1.35); sp.box(.12, .04, .12, S(0xd8d4cc), 0, 0, 0); sp.cyl(.03, .045, .22, S(0xcfcac0, .8), 0, .04, 0, 8); sp.sph(.03, S(0xcfcac0, .8), 0, .3, 0, 1); sp.sph(.022, S(0xcfcac0, .8), .03, .2, .03, 1); for (let i = 0; i < 6; i++) sp.box(.01, .03, .01, S(0x8a6a46), -.08 + i * .03, 0, .08);
            flag(K, .02, -.5, .5, 0, true); K.g.children.slice(-2).forEach(m => m.position.y += 1.25);
            const ft = K.grp(.38, .48, -.42); ft.box(.4, .2, .12, S(0x8a8a74, .95), 0, 0, 0); for (let i = 0; i < 5; i++) ft.box(.05, .05, .12, S(0x8a8a74, .95), -.18 + i * .09, .2, 0); ft.box(.08, .12, .13, S(0x2a2a1a), .05, 0, 0); ft.box(.12, .25, .12, S(0x8a8a74, .95), -.22, -.3, .1);
            for (let i = 0; i < 11; i++) K.box(.08, .02, .14, S(0xd8d4cc), .2 + i * .02, i * .045, -.24 + i * .03);
            const tp = K.grp(-.35, 0, .15); tp.box(.3, .12, .2, S(0xe8dcc0), 0, 0, 0); const tr = vnRoof(.36, .26, .12, MAT.roofTerra(), 0x7a2a1a, .05, .05); tr.position.y = .12; tp.g.add(tr); const tp2 = K.grp(.0, 0, .2); const tr2 = vnRoof(.26, .2, .12, MAT.roofTerra(), 0x7a2a1a, .06, .05); tp2.box(.2, .12, .14, S(0xb91c1c, .7), 0, 0, 0); tr2.position.y = .12; tp2.g.add(tr2); smoke(K, -.15, .1, .2);
            [[.35, .15, 0xd9b04a], [.55, .25, 0x2563eb], [.7, .1, 0xd9b04a], [-.7, .45, 0xb08a5a]].forEach(([x, z, c]) => { const S2 = K.grp(x, 0, z); [[-.08, -.06], [.08, -.06], [-.08, .06], [.08, .06]].forEach(([a, b]) => S2.cyl(.006, .006, .16, S(0x6b4a2f), a, 0, b, 4)); S2.box(.2, .015, .16, S(c, .7), 0, .16, 0); S2.box(.16, .04, .12, S(0x8a6a46), 0, .05, 0); });
            for (let i = 0; i < 6; i++) moto(K, .45 + (i % 3) * .1, .4 + Math.floor(i / 3) * .1, 1.57, [0xc62828, 0x333333, 0x2563eb][i % 3]); const bus = K.grp(.72, 0, .7, -.3); bus.box(.5, .14, .15, S(0xf4f4f4, .4), 0, .03, 0); [-1, 1].forEach(a => plane(bus, .45, .05, S(0x1d2a3a, .2, .3), 0, .13, a * .076, 0, a > 0 ? 0 : Math.PI));
            for (let i = 0; i < 4; i++) tree(K, 'DARK', -.1 + i * .22, .82, .55); sign(K, -.7, .75, .28, .1, 'NÚI TÔ THỊ', '#14532d', '#fde68a', .15, .3); people(K, [[-.1, .45], [.1, .5], [.25, .6], [-.3, .55], [.2, .05], [-.55, -.05]]);
        },
        // 46. Mỳ Chũ Thủ Dương
        MY_CHU: K => {
            ground(K, GM.sand(), 1.96, 1.96, 0, 0); ground(K, S(0xbdb8ae, .85), .8, .7, -.55, -.1);
            northHouse(K, -.45, -.62, .9, .42, { roof: MAT.roofTerra() }); lowWall(K, -.92, -.1, .8, Math.PI / 2); lowWall(K, -.55, .28, .7);
            bigPot(K, -.75, .1, .08); woodPile(K, -.85, .45); K.box(.18, .1, .12, S(0xf4f4f4, .5), -.75, 0, -.3); for (let i = 0; i < 6; i++) K.cyl(.04, .04, .07, S(0xe8e0cc, .7), -.6 + (i % 3) * .1, 0, -.25 + Math.floor(i / 3) * .1, 10);
            for (let i = 0; i < 9; i++) dryRack(K, .1 + (i % 3) * .28, -.65 + Math.floor(i / 3) * .3, .24, .2, NOODLE, 0, .1);
            for (let i = 0; i < 8; i++) K.cyl(.045, .045, .03, S(0xe8d6a8, .7), -.25 + (i % 4) * .1, 0, .45 + Math.floor(i / 4) * .1, 12);
            for (let i = 0; i < 6; i++) K.box(.09, .07, .07, S(0xd9c08a, .85), .05 + (i % 3) * .1, Math.floor(i / 3) * .07, .2);
            sign(K, .5, .45, .4, .09, 'HỢP TÁC XÃ MỲ CHŨ THỦ DƯƠNG', '#16a34a', '#ffffff', .2, -.2); const tk = K.grp(.72, 0, .8, .1); tk.box(.08, .08, .1, S(0x2563eb, .4), .12, .02, 0); tk.box(.2, .03, .14, S(0x16a34a, .5), -.04, .04, 0); for (let i = 0; i < 4; i++) tk.cyl(.03, .03, .05, S(0xe8d6a8, .7), -.1 + (i % 2) * .07, .07, (i < 2 ? -1 : 1) * .03, 10);
            for (let i = 0; i < 4; i++) banana(K, .35 + i * .15, .1, .85); [[.85, -.85], [.6, -.92], [.0, -.95]].forEach(([x, z], i) => tree(K, i % 2 ? 'BAMBOO' : 'DARK', x, z, .85)); for (let i = 0; i < 5; i++) K.sph(.02, S(0xe8a050, .7), -.3 + i * .08, .03, .75, 0);
            people(K, [[-.6, -.05], [-.35, .05], [.2, -.5], [.5, -.2], [.4, .65], [-.1, .75]]); moto(K, .2, .85, .1);
        },
        // 47. Đồi chè Tân Cương
        TAN_CUONG2: K => {
            ground(K, GM.grass(), 1.96, 1.96, 0, 0);
            const hill = (x, z, r, n) => { for (let i = 0; i < n; i++) { const rr = r * (1 - i / n), m = K.add(new THREE.Mesh(new THREE.CylinderGeometry(rr, rr + .02, .045, 30), S(i % 2 ? 0x3f9a3a : 0x2f7a2f, .85)), x, .022 + i * .045, z); m.scale.z = .85; const t2 = K.add(new THREE.Mesh(new THREE.TorusGeometry(rr * .98, .018, 5, 30), S(0x56b84a, .85)), x, .05 + i * .045, z); t2.rotation.x = Math.PI / 2; t2.scale.y = .85; } };
            hill(-.5, -.45, .5, 6); hill(.55, -.5, .45, 5); hill(-.35, .4, .5, 5); hill(.5, .45, .3, 3);
            const strm = waterBox(K, .12, 1.4, .1, .1, 0x7ad0e0); strm.rotation.y = -.35; const br = K.box(.2, .03, .05, S(0xc9a35e, .7), .2, .04, .45); br.rotation.y = -.3;
            [[-.45, -.45, .27], [.1, .05, 0]].forEach(([x, z, y]) => { const hut = K.grp(x, y, z); [[-.05, -.05], [.05, -.05], [-.05, .05], [.05, .05]].forEach(([a, b]) => hut.cyl(.006, .006, .12, S(0x6b4a2f), a, 0, b, 4)); const r = gableRoof(.16, .14, .07, MAT.thatch(), 0x5a3a20); r.position.y = .12; hut.g.add(r); });
            [[-.05, -.3], [.1, .3], [-.65, .0]].forEach(([x, z]) => tree(K, 'DARK', x, z, .75));
            const ppl = []; for (let i = 0; i < 16; i++) { const h = [[-.5, -.45, .4], [.55, -.5, .35], [-.35, .4, .4]][i % 3], a = i * 1.9; ppl.push([h[0] + Math.cos(a) * h[2] * .75, h[1] + Math.sin(a) * h[2] * .6]); }
            ppl.forEach(([x, z], i) => { const p = person(K, x, z, { col: [0x2f5d8a, 0xc0782f, 0x8a2f2f][i % 3] }); p.g.position.y = .12; K.cyl(.018, .015, .03, S(0xc9a35e, .8), x + .02, .14, z, 6); });
            for (let i = 0; i < 4; i++) K.cyl(.04, .035, .06, S(0xc9a35e, .8), -.6 + i * .1, 0, .85, 10); const tk = K.grp(.0, 0, .85); tk.box(.08, .08, .1, S(0x2563eb, .4), .12, .02, 0); tk.box(.2, .03, .14, S(0x2563eb, .5), -.04, .04, 0); for (let i = 0; i < 4; i++) tk.box(.06, .05, .05, S(0xd9c08a, .9), -.1 + (i % 2) * .07, .07, (i < 2 ? -1 : 1) * .03);
            moto(K, -.85, .85, 0); people(K, [[.35, .8], [.55, .75], [.75, .8]]);
        }
    };
    Object.assign(LAYOUT, K47);
