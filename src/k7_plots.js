    /* =================================================================================
     * K7. Ô ĐẤT TRỐNG & ĐẤT CHỜ XÂY — mỗi ô một tiểu cảnh riêng theo nghề và vùng miền
     *    · Chưa có chủ: hàng rào, biển gỗ có biểu tượng nghề, cụm nguyên liệu/dụng cụ của nghề,
     *      cây theo vùng miền, hoa cỏ, đá, bướm bay
     *    · Đã mua, chờ xây: nền móng viền màu chủ đất, giàn giáo tre, tường xây dở, vật tư, cờ chủ đất
     *    (thay cho createPlotMarker3D cũ trong k4_monopoly.js; giao diện userData giữ nguyên)
     * ================================================================================= */
    const PLOT_KIND = {
        DONG_HO_ART: 'PRINT', BINH_AN: 'DRUM', JRAI: 'WOOD', BUU_LONG: 'STONE', PHUC_SEN: 'FORGE', THUY_XUAN_INCENSE: 'INCENSE',
        NINH_BINH_HOA_LU: 'LOOM', KON_TUM2: 'LOOM', NGA_SON_MAT: 'REED', NON_CHUONG: 'HATS', PHU_BINH_LANTERN: 'LANTERN', TAN_CHAU2: 'CLOTH', SON_LA2: 'CLOTH', LUNG_TAM: 'CLOTH',
        AN_NGAI: 'TRAYS', TRANG_BANG2: 'TRAYS', BINH_LU: 'TRAYS', MY_CHU: 'TRAYS', BEN_TRE_COCONUT: 'COCONUT', TRA_CUON: 'BASKETS', VU_THOM: 'BASKETS', SA_DEC2: 'FLOWERS', DA_LAT2: 'FLOWERS',
        BMT2: 'COFFEE', TAN_CUONG2: 'TEA', NAM_DAN: 'JARS', MUONG_VANG: 'JARS', PHAN_THIET_SAUCE: 'JARS', LY_SON_ISLAND: 'GARLIC', NHA_TRANG_AGARWOOD: 'BOAT', PHU_QUOC2: 'BOAT', BAC_LIEU_SALT2: 'SALT', CA_MAU2: 'NET'
    };
    const PLOT_DEFAULT = { CERAMIC_ART: 'POTS', WEAVING_CRAFT: 'CLOTH', HIGHLAND_AGRI: 'BASKETS', COASTAL_AQUA: 'NET' };
    const BRIGHT = [0xe8504a, 0xf2a93b, 0xf6d54a, 0x4fb3a5, 0x5b8fd9, 0xd96bb0, 0xffffff];

    // Cụm nguyên liệu / dụng cụ đặc trưng của nghề, gói trong bán kính ~0.38
    function plotCraft(K, kind, rnd) {
        const wood = S(0x8a5a34, .85), dark = S(0x5b3a22, .85), tan = S(0xd9b877, .85), stone = S(0x9d9a92, .9);
        const pot = (x, z, s, hex) => { const b = K.sph(.07 * s, S(hex, .75), x, .065 * s, z, 1); b.scale.y = 1.1; K.cyl(.035 * s, .045 * s, .04 * s, S(hex, .75), x, .12 * s, z, 10); };
        const rows = (soil, bush, dot) => { for (let r = 0; r < 3; r++) { K.box(.6, .03, .1, S(soil, .95), 0, 0, -.16 + r * .16); for (let i = 0; i < 5; i++) { K.sph(.045, S(bush, .85), -.24 + i * .12, .06, -.16 + r * .16, 0); if (dot && (i + r) % 2) K.sph(.014, S(dot, .6), -.24 + i * .12 + .02, .1, -.16 + r * .16 + .02, 0); } } };
        if (kind === 'POTS') {
            const kiln = K.sph(.2, S(0xb0563a, .9), -.14, 0, -.16, 1); kiln.scale.y = .85; K.box(.09, .1, .03, S(0x2a1a12, .9), -.14, 0, .03); K.cyl(.03, .04, .12, S(0x8a4630, .9), -.14, .15, -.2, 8);
            K.sph(.1, S(0xc0744a, .95), .2, .02, -.12, 1).scale.y = .5; pot(.12, .16, 1, 0xc9683f); pot(.26, .1, .75, 0xd98a55); pot(.02, .24, .6, 0xe4d2b0); pot(.3, .26, .55, 0x4f7fb5);
        } else if (kind === 'PRINT') {
            [-.13, .13].forEach(x => K.cyl(.012, .012, .42, wood, x, 0, -.1, 5).rotation.x = -.18); K.box(.36, .28, .015, S(0xf4e6c2, .7), 0, .12, -.07).rotation.x = -.18;
            [[-.09, .3, 0xe8504a], [.09, .3, 0x4fb3a5], [-.09, .18, 0xf6d54a], [.09, .18, 0x5b8fd9]].forEach(([x, y, c]) => K.box(.13, .1, .005, S(c, .6), x, y - .02, -.045 - (y - .12) * .18).rotation.x = -.18);
            for (let i = 0; i < 4; i++) K.box(.2, .012, .15, S(i % 2 ? 0xf4e6c2 : 0xe8d49a, .7), .12, i * .013, .22).rotation.y = i * .12; K.box(.12, .05, .08, dark, -.18, 0, .22);
        } else if (kind === 'DRUM') {
            [[0, 0, 1], [.24, .12, .7]].forEach(([x, z, s]) => { const d = K.cyl(.13 * s, .13 * s, .2 * s, S(0xa23a2a, .7), x, 0, z, 16); d.scale.set(1, 1, 1); K.cyl(.132 * s, .132 * s, .012, S(0xf0e2c0, .6), x, .2 * s, z, 16); K.cyl(.136 * s, .136 * s, .02, S(0x3a2414, .7), x, .09 * s, z, 16); });
            const side = K.cyl(.1, .1, .16, S(0xa23a2a, .7), -.22, .1, .18, 16); side.rotation.z = Math.PI / 2; [-.06, .06].forEach(x => K.cyl(.01, .01, .22, wood, .05 + x, .21, .0, 5).rotation.z = .9 * Math.sign(x));
        } else if (kind === 'WOOD') {
            [[0, 0], [.07, 0], [.035, .06]].forEach(([y0, k], i) => { const l = K.cyl(.045, .045, .42, i % 2 ? wood : dark, .14, .045 + (i === 2 ? .075 : 0), .16 + (i === 1 ? .09 : i === 2 ? .045 : 0), 8); l.rotation.z = Math.PI / 2; });
            K.cyl(.05, .06, .46, wood, -.18, 0, -.08, 8); K.sph(.07, wood, -.18, .5, -.08, 1); K.box(.16, .03, .03, dark, -.18, .3, -.08); K.cyl(.09, .1, .1, dark, -.16, 0, .22, 8); K.box(.02, .14, .02, stone, -.14, .1, .22).rotation.z = .5;
        } else if (kind === 'STONE') {
            [[-.14, -.1, .2, .16, .18], [.12, -.06, .16, .22, .14], [.02, .16, .24, .1, .16], [.26, .2, .1, .08, .1]].forEach(([x, z, w, h, d], i) => K.box(w, h, d, S(i % 2 ? 0x8f9aa0 : 0xa7aeb0, .9), x, 0, z).rotation.y = i * .4);
            K.sph(.07, S(0xb8bfc2, .85), .02, .16, .16, 1); K.box(.02, .02, .16, wood, -.2, .0, .24).rotation.y = .6;
        } else if (kind === 'FORGE') {
            K.box(.26, .2, .22, S(0x8a4630, .9), -.14, 0, -.12); K.box(.12, .09, .02, new THREE.MeshStandardMaterial({ color: 0xff8a2a, emissive: 0xff5a10, emissiveIntensity: 1.1 }), -.14, .03, 0); K.cyl(.035, .045, .16, S(0x4a3a34, .9), -.14, .2, -.16, 8);
            K.cyl(.07, .08, .14, dark, .16, 0, .14, 8); K.box(.18, .05, .07, S(0x3c4046, .4, .5), .16, .14, .14); K.cone(.035, .08, S(0x3c4046, .4, .5), .28, .14, .14, 8).rotation.z = -Math.PI / 2;
            K.box(.02, .02, .16, wood, .02, .01, .26).rotation.y = .7; K.box(.06, .04, .04, S(0x3c4046, .4, .5), .07, .01, .31);
        } else if (kind === 'INCENSE') {
            [[-.14, -.08, 0xd92b3a, 1], [.14, -.02, 0xf2c230, .85], [0, .2, 0xe86aa6, .8], [.26, .22, 0xd92b3a, .6]].forEach(([x, z, c, s]) => { const f = K.cone(.17 * s, .07 * s, S(c, .7), x, .12 * s, z, 18); f.rotation.x = Math.PI; K.cyl(.02 * s, .03 * s, .12 * s, S(0xc9a35a, .8), x, 0, z, 6); });
        } else if (kind === 'LOOM') {
            [[-.2, -.14], [.2, -.14], [-.2, .14], [.2, .14]].forEach(([x, z]) => K.cyl(.014, .016, z < 0 ? .36 : .2, wood, x, 0, z, 6)); K.box(.44, .02, .02, wood, 0, .35, -.14); K.box(.44, .02, .02, wood, 0, .19, .14);
            for (let i = 0; i < 7; i++) { const w = K.box(.045, .008, .33, S(BRIGHT[i % 6], .7), -.18 + i * .06, .265, 0); w.rotation.x = -.5; } K.box(.2, .08, .1, dark, .02, 0, .3);
        } else if (kind === 'REED') {
            [[-.1, .16, 0xd9463a], [.06, .22, 0xf0d27a], [.2, .16, 0x4f9a5a]].forEach(([x, z, c]) => { const r = K.cyl(.05, .05, .34, S(c, .8), x, .05, z, 12); r.rotation.x = Math.PI / 2; r.rotation.z = .3; });
            for (let i = 0; i < 9; i++) { const a = i * 2.4, s = K.cyl(.008, .01, .4 + (i % 3) * .05, S(i % 3 ? 0x9fc46a : 0xd9c06a, .8), -.12 + Math.cos(a) * .05, 0, -.12 + Math.sin(a) * .05, 4); s.rotation.z = Math.cos(a) * .15; } K.cyl(.07, .07, .03, tan, -.12, .12, -.12, 10);
        } else if (kind === 'HATS') {
            for (let i = 0; i < 4; i++) K.cone(.15, .09, S(i % 2 ? 0xf0e0a8 : 0xe6d190, .8), -.1, i * .035, .12, 20); K.cyl(.012, .016, .3, wood, .18, 0, -.06, 5); K.cone(.17, .1, S(0xf0e0a8, .8), .18, .28, -.06, 20);
            K.cone(.13, .08, S(0xf4e8bc, .8), .22, 0, .24, 20); for (let i = 0; i < 5; i++) K.box(.012, .2, .012, S(0x9fc46a, .8), -.26 + i * .03, 0, -.14).rotation.z = (i - 2) * .12;
        } else if (kind === 'LANTERN') {
            [-.3, .3].forEach(x => K.cyl(.014, .018, .5, wood, x, 0, -.05, 6)); K.box(.6, .01, .01, dark, 0, .48, -.05);
            for (let i = 0; i < 5; i++) { const c = BRIGHT[i % 6], l = K.sph(.055, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .35, roughness: .5 }), -.24 + i * .12, .4 - Math.sin(i / 4 * Math.PI) * .05, -.05, 1); l.scale.y = i % 2 ? 1.25 : .9; }
            for (let i = 0; i < 5; i++) K.box(.012, .012, .3, S(0xc9b06a, .8), -.1 + i * .05, i * .004, .22).rotation.y = (i - 2) * .12;
        } else if (kind === 'CLOTH') {
            [-.28, .28].forEach(x => { K.cyl(.012, .016, .44, wood, x, 0, -.08, 5); }); K.box(.6, .014, .014, wood, 0, .43, -.08);
            for (let i = 0; i < 5; i++) { const h = .22 + (i % 3) * .05; K.box(.095, h, .01, S(BRIGHT[(i * 2 + 1) % 6], .75), -.22 + i * .11, .43 - h, -.08); }
            [[.1, .2, 0x5b8fd9], [-.12, .24, 0xe8504a], [-.02, .16, 0xf6d54a]].forEach(([x, z, c]) => { const r = K.cyl(.045, .045, .18, S(c, .8), x, .045, z, 10); r.rotation.z = Math.PI / 2; r.rotation.y = x * 3; });
        } else if (kind === 'TRAYS') {
            [[-.2, -.1], [.2, -.1], [-.2, .12], [.2, .12]].forEach(([x, z]) => K.cyl(.012, .014, .2, wood, x, 0, z, 5)); K.box(.46, .012, .28, S(0xb89a5a, .85), 0, .2, .01);
            [[-.11, -.04], [.11, -.04], [0, .12]].forEach(([x, z], i) => { K.cyl(.1, .1, .012, S(0xf4ecd6, .7), x, .212, z, 16); K.cyl(.105, .105, .008, tan, x, .208, z, 16); });
            K.cyl(.08, .06, .1, tan, .26, 0, .28, 10); K.sph(.07, S(0xf4ecd6, .8), .26, .1, .28, 0).scale.y = .5;
        } else if (kind === 'COCONUT') {
            [[0, 0, 0], [.1, 0, .02], [.05, 0, .1], [-.05, 0, .09], [.03, .08, .05], [-.1, 0, -.02]].forEach(([x, y, z], i) => K.sph(.06, S(i === 4 ? 0x7aa04a : i % 2 ? 0x7a5230 : 0x8a623c, .9), x, .06 + y, z + .12, 1));
            K.box(.22, .1, .16, tan, .24, 0, -.08); [0, 1, 2].forEach(i => K.sph(.05, S(0x7aa04a, .85), .18 + i * .06, .13, -.08, 1)); K.box(.2, .012, .1, S(0xf0e2c0, .7), -.2, 0, -.1); for (let i = 0; i < 4; i++) K.box(.035, .02, .025, S(0xd9a86a, .7), -.26 + i * .04, .012, -.1);
        } else if (kind === 'BASKETS') {
            [[-.14, .1, 0xe8504a], [.1, .18, 0xf2a93b], [.02, -.08, 0x7aa04a], [.26, 0, 0xd96bb0]].forEach(([x, z, c], i) => { const s = i === 3 ? .75 : 1; K.cyl(.085 * s, .065 * s, .09 * s, tan, x, 0, z, 12); for (let k = 0; k < 5; k++) K.sph(.03 * s, S(c, .7), x + Math.cos(k * 1.26) * .04 * s, .1 * s, z + Math.sin(k * 1.26) * .04 * s, 0); });
            K.cyl(.01, .01, .34, wood, -.24, .1, -.1, 4).rotation.z = 1.2;
        } else if (kind === 'FLOWERS') {
            K.box(.62, .035, .44, S(0x8a623c, .95), 0, 0, .04); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const x = -.25 + i * .1, z = -.1 + r * .14; K.cyl(.006, .006, .07, S(0x5f9a3a, .8), x, .03, z, 4); K.sph(.034, S(BRIGHT[(r * 2 + i) % 6], .6), x, .11, z, 0); }
            K.cyl(.05, .04, .08, S(0x5b8fd9, .5, .2), .32, 0, .3, 10);
        } else if (kind === 'COFFEE') { rows(0x8a4a2a, 0x3f7a3a, 0xd9302a); K.box(.3, .012, .2, S(0x6a4226, .9), .0, 0, .3); for (let i = 0; i < 12; i++) K.sph(.014, S(0x6a2a1a, .7), -.12 + (i % 4) * .08, .02, .25 + Math.floor(i / 4) * .05, 0); }
        else if (kind === 'TEA') { rows(0x7a5a34, 0x4f9a45, 0); K.cyl(.07, .05, .1, tan, .26, 0, .3, 10); K.sph(.06, S(0x6bb551, .8), .26, .1, .3, 0).scale.y = .5; }
        else if (kind === 'GARLIC') { rows(0xe9dcb4, 0x8fbf55, 0); for (let i = 0; i < 6; i++) K.sph(.035, S(0xf6f1e4, .7), -.1 + (i % 3) * .07, .03 + Math.floor(i / 3) * .05, .3, 0); }
        else if (kind === 'JARS') {
            [[-.16, -.06, 1], [.08, -.1, 1.1], [.22, .12, .85], [-.04, .16, .9], [-.24, .2, .7]].forEach(([x, z, s], i) => { const j = K.sph(.1 * s, S(i % 2 ? 0x6a3f2a : 0x7a4a30, .6), x, .095 * s, z, 1); j.scale.y = 1.05; K.cyl(.06 * s, .07 * s, .025, S(i % 3 ? 0xc9a35a : 0x8a5a34, .8), x, .185 * s, z, 10); });
        } else if (kind === 'BOAT') {
            const b = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x7a5a34, roughness: .85, side: THREE.DoubleSide })); b.position.set(-.06, .16, .02); b.scale.y = .75; b.rotation.z = .12; b.castShadow = true; K.g.add(b);
            const t = new THREE.Mesh(new THREE.TorusGeometry(.2, .014, 6, 20), S(0x3a2a1a, .8)); t.rotation.x = Math.PI / 2; t.rotation.y = .12; t.position.set(-.06, .16, .02); K.g.add(t);
            K.cyl(.01, .01, .44, wood, .12, .08, .16, 4).rotation.z = 1.3; K.box(.08, .01, .05, wood, .3, .13, .16); [0xe8504a, 0xffffff].forEach((c, i) => K.sph(.045, S(c, .5), .22 + i * .08, .045, -.14 + i * .05, 1)); K.cyl(.06, .06, .05, S(0x4fb3a5, .7), -.26, 0, .26, 10);
        } else if (kind === 'SALT') {
            [[-.14, -.06, 1], [.12, 0, .8], [-.02, .2, .65], [.26, .2, .5]].forEach(([x, z, s]) => K.cone(.13 * s, .18 * s, S(0xfbfbf6, .6), x, 0, z, 14)); K.box(.6, .008, .46, S(0xcfe6ea, .3, .2), 0, 0, .06);
            K.cyl(.008, .008, .4, wood, .28, .08, -.14, 4).rotation.z = 1.1; K.box(.02, .02, .14, wood, .1, .01, -.2);
        } else {   // NET
            [-.28, .28].forEach(x => K.cyl(.012, .016, .42, wood, x, 0, -.08, 5));
            const net = new THREE.Mesh(new THREE.PlaneGeometry(.56, .3, 9, 5), new THREE.MeshBasicMaterial({ color: 0x2f7f86, wireframe: true, transparent: true, opacity: .8 })); net.position.set(0, .26, -.08); K.g.add(net);
            for (let i = 0; i < 5; i++) K.sph(.022, S(i % 2 ? 0xe8504a : 0xf2a93b, .5), -.24 + i * .12, .42, -.08, 0);
            K.box(.2, .09, .14, S(0x5b8fd9, .6), .12, 0, .2); K.box(.16, .08, .12, S(0x4fb3a5, .6), -.14, 0, .22); K.sph(.03, S(0xf28a6a, .6), .12, .1, .2, 0);
        }
    }

    // Cây theo vùng miền (dựa trên toạ độ thật của làng nghề)
    function plotTrees(tile) {
        const la = tile.realLat === undefined ? tile.lat : tile.realLat, lo = tile.realLon === undefined ? tile.lon : tile.realLon;
        if (tile.island || tile.toolId === 'COASTAL_AQUA') return ['PALM', 'PALM', 'GREEN'];
        if (la >= 20) return lo < 105.3 || la > 22 ? ['PINE', 'PINK', 'DARK'] : ['PINK', 'BAMBOO', 'GREEN'];
        if (la >= 11.4 && la < 15 && lo > 107.3) return ['PINE', 'DARK', 'RED'];
        if (la >= 14) return ['GREEN', 'GOLD', 'PINE'];
        return ['PALM', 'GREEN', 'WILLOW'];
    }
    function plotFence(K, style, rnd) {
        const pts = []; for (let x = -.84; x <= .841; x += .28) pts.push([x, -.84]); for (let z = -.56; z <= .3; z += .28) { pts.push([-.84, z]); pts.push([.84, z]); }
        if (style === 0) {          // rào tre
            const bam = S(0xb9a35a, .8); pts.forEach(([x, z]) => K.cyl(.016, .02, .2, bam, x, 0, z, 5));
            [.07, .15].forEach(y => { K.box(1.68, .014, .014, bam, 0, y, -.84); [-.84, .84].forEach(x => K.box(.014, .014, 1.14, bam, x, y, -.27)); });
        } else if (style === 1) {   // rào gỗ sơn trắng
            const w = S(0xfaf6ea, .7); for (let x = -.84; x <= .841; x += .12) K.box(.035, .16 + (Math.round(x * 100) % 2 ? .02 : 0), .014, w, x, 0, -.84); K.box(1.7, .02, .016, w, 0, .08, -.845);
            [-.84, .84].forEach(x => { for (let z = -.72; z <= .3; z += .12) K.box(.014, .16, .035, w, x, 0, z); K.box(.016, .02, 1.04, w, x, .08, -.21); });
        } else if (style === 2) {   // bờ đá xếp
            const cols = [0xa7aeb0, 0x8f9aa0, 0xb8b4a8]; for (let x = -.84; x <= .841; x += .14) K.sph(.06 + rnd() * .025, S(cols[Math.floor(rnd() * 3)], .9), x, .03, -.84 + (rnd() - .5) * .03, 0).scale.y = .7;
            [-.84, .84].forEach(x => { for (let z = -.7; z <= .2; z += .15) K.sph(.055 + rnd() * .02, S(cols[Math.floor(rnd() * 3)], .9), x + (rnd() - .5) * .03, .03, z, 0).scale.y = .7; });
        } else {                    // hàng rào cây xén
            const g = [0x5f9a3a, 0x6bab45, 0x4f8a34]; for (let x = -.8; x <= .801; x += .16) K.sph(.085, S(g[Math.floor(rnd() * 3)], .9), x, .06, -.84, 1).scale.y = .8;
            [-.84, .84].forEach(x => { for (let z = -.68; z <= .2; z += .17) K.sph(.08, S(g[Math.floor(rnd() * 3)], .9), x, .06, z, 1).scale.y = .8; });
        }
    }
    function plotNature(K, tile, rnd, n) {
        const kinds = plotTrees(tile);
        tree(K, kinds[0], -.62, -.6, .5 + rnd() * .12); if (rnd() < .75) tree(K, kinds[1], .64, -.58, .42 + rnd() * .12); if (rnd() < .45) tree(K, kinds[2], .7, -.2, .34);
        for (let i = 0; i < n; i++) {
            const x = (rnd() - .5) * 1.5, z = -.5 + rnd() * 1.2; if (Math.abs(x) < .5 && z > -.1 && z < .55) continue;
            const k = rnd();
            if (k < .45) { K.cyl(.005, .005, .06, S(0x5f9a3a, .8), x, 0, z, 4); K.sph(.022, S(BRIGHT[Math.floor(rnd() * 7)], .6), x, .07, z, 0); }
            else if (k < .8) { for (let j = 0; j < 3; j++) K.cone(.014, .07 + rnd() * .04, S(0x7ab850, .85), x + (j - 1) * .02, 0, z + (j % 2) * .015, 4).rotation.z = (j - 1) * .25; }
            else K.sph(.03 + rnd() * .025, S(0xa9a69c, .9), x, .015, z, 0).scale.y = .6;
        }
    }

    function createPlotMarker3D(tile) {
        const root = new THREE.Group(), seed0 = tile.index * 7919 + 13; let s = seed0; const rnd = () => (s = (s * 16807 + 1) % 2147483647) / 2147483647;
        const kind = PLOT_KIND[tile.modelType] || PLOT_DEFAULT[tile.toolId] || 'BASKETS', woodM = S(0x7a4b2a, .8);

        /* ----- A. ĐẤT TRỐNG CHƯA CÓ CHỦ ----- */
        const unowned = new THREE.Group(), K1 = kit(unowned);
        plotFence(K1, tile.index % 4, rnd);
        // lối đá bước dẫn vào + mảng nền nơi bày đồ nghề
        [[-.5, .78, .1], [-.44, .56, .085], [-.52, .36, .09], [-.42, .16, .075]].forEach(([x, z, r], i) => { const st = K1.cyl(r, r, .012, S(i % 2 ? 0xd8d2c2 : 0xc9c2b0, .95), x, 0, z, 9); st.scale.z = .8; st.rotation.y = i; });
        const patch = K1.cyl(.5, .5, .008, S(tile.toolId === 'COASTAL_AQUA' ? 0xf0e2b4 : tile.toolId === 'CERAMIC_ART' ? 0xd9b48a : 0xc9d98a, .95), .26, 0, .2, 24); patch.scale.z = .8; patch.castShadow = false;
        const craft = K1.grp(.26, .012, .18, (rnd() - .5) * .5); plotCraft(craft, kind, rnd);
        // biển gỗ có mái che: biểu tượng nghề + giá đất
        const sg = K1.grp(-.36, 0, -.38, .22);
        sg.cyl(.02, .024, .5, woodM, -.26, 0, 0, 6); sg.cyl(.02, .024, .5, woodM, .26, 0, 0, 6);
        const signTex = vCanvasTex('k7plot_' + tile.index, 320, 176, (g, w, h) => {
            g.fillStyle = '#fff6dc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a5a34'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
            g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '86px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'; g.fillText(tile.icon || '🌱', 78, 92);
            g.fillStyle = '#7c2d12'; g.font = '800 30px "Be Vietnam Pro", Arial'; g.fillText('ĐẤT TRỐNG', 218, 62);
            g.fillStyle = '#065f46'; g.font = '900 44px "Be Vietnam Pro", Arial'; g.fillText(`${tile.price}đ`, 218, 114);
        });
        const board = new THREE.Mesh(new THREE.BoxGeometry(.6, .33, .03), [woodM, woodM, woodM, woodM, new THREE.MeshStandardMaterial({ map: signTex, roughness: .55 }), woodM]); board.position.set(0, .33, 0); board.castShadow = true; sg.g.add(board);
        [1, -1].forEach(k => { const r = sg.box(.38, .03, .16, S(0xc9573c, .7), k * .17, .53, 0); r.rotation.z = -k * .32; });
        plotNature(K1, tile, rnd, 16);
        // bướm bay lượn quanh ô (một số ô)
        if (tile.index % 3 !== 1) {
            const bf = new THREE.Group(), wm = new THREE.MeshBasicMaterial({ color: BRIGHT[(tile.index * 5) % 6], side: THREE.DoubleSide }), wg = new THREE.PlaneGeometry(.05, .04); wg.translate(.025, 0, 0);
            const L = new THREE.Mesh(wg, wm), R = new THREE.Mesh(wg, wm); R.rotation.y = Math.PI; L.rotation.x = R.rotation.x = -Math.PI / 2; bf.add(L, R); unowned.add(bf); const ph = tile.index * 1.3;
            animatedElements.push({ type: 'FN', fn: t => { if (!root.visible || !unowned.visible) return; const a = t * .9 + ph; bf.position.set(Math.cos(a) * .5 - .1, .42 + Math.sin(t * 2.3 + ph) * .1, Math.sin(a * 1.3) * .4 - .1); bf.rotation.y = -a; const f = Math.sin(t * 22) * .9; L.rotation.z = f; R.rotation.z = -f; } });
        }

        /* ----- B. ĐÃ MUA ĐẤT, CHỜ XÂY LÀNG NGHỀ ----- */
        const owned = new THREE.Group(); owned.visible = false; const K2 = kit(owned), stoneM = S(0x9a968c, .9);
        const ownerTrimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: .4, metalness: .2 });
        plotFence(K2, tile.index % 4, rnd);
        // nền móng viền màu chủ đất
        K2.box(1.1, .04, .8, stoneM, 0, 0, -.2); K2.box(1.02, .02, .72, S(0xdcd5c6, .85), 0, .04, -.2);
        [[1.12, .04, 0, -.6], [1.12, .04, 0, .2], [.04, .8, -.56, -.2], [.04, .8, .56, -.2]].forEach(([w, d, x, z]) => K2.box(w, .03, d, ownerTrimMat, x, .035, z));
        // tường gạch xây dở + giàn giáo tre
        const brick = [S(0xb55338, .85), S(0xc9683f, .85)];
        for (let r = 0; r < 4; r++) for (let i = 0; i < 7 - r; i++) K2.box(.12, .055, .07, brick[(i + r) % 2], -.42 + i * .125 + (r % 2) * .06, .06 + r * .057, -.54);
        for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) K2.box(.07, .055, .12, brick[(i + r) % 2], -.5, .06 + r * .057, -.42 + i * .125);
        const bam = S(0xb9a35a, .8); [[.1, -.44], [.5, -.44], [.1, -.02], [.5, -.02]].forEach(([x, z]) => K2.cyl(.014, .018, .62, bam, x, .04, z, 5));
        [.3, .58].forEach(y => { K2.box(.44, .014, .014, bam, .3, y, -.44); K2.box(.44, .014, .014, bam, .3, y, -.02); K2.box(.014, .014, .46, bam, .1, y, -.23); K2.box(.014, .014, .46, bam, .5, y, -.23); });
        K2.box(.4, .012, .2, S(0xc9a86a, .85), .3, .31, -.23); const dg = K2.box(.014, .014, .6, bam, .3, .3, -.44); dg.rotation.z = .95; dg.position.y = .45;
        // vật tư: gạch, gỗ, đống cát + xẻng
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) K2.box(.11, .045, .07, brick[(i + j) % 2], -.34 + i * .12, .06 + j * .046, .0);
        for (let i = 0; i < 4; i++) K2.cyl(.022, .022, .36, woodM, -.3, .085 + (i > 2 ? .04 : 0), -.2 + (i % 3) * .05, 8).rotation.z = Math.PI / 2;
        K2.cone(.13, .1, S(0xe6d29a, .95), -.1, .05, -.3, 12); const sv = K2.cyl(.008, .008, .26, woodM, -.02, .1, -.3, 4); sv.rotation.z = -.5;
        // cột cờ màu chủ đất
        K2.cyl(.012, .016, .95, S(0xe8e4d8, .5, .3), -.62, 0, .3, 6); const pen = new THREE.Mesh(new THREE.PlaneGeometry(.3, .18, 6, 1), ownerTrimMat); pen.material.side = THREE.DoubleSide; pen.position.set(-.46, .84, .3); owned.add(pen);
        animatedElements.push({ type: 'FN', fn: t => { if (owned.visible) pen.rotation.y = Math.sin(t * 2.4 + tile.index) * .25; } });
        // đồ nghề đã tập kết sẵn ở góc trước
        const craft2 = K2.grp(.42, .012, .46, .4, .72); plotCraft(craft2, kind, rnd);
        // bảng "đã có chủ"
        const og = K2.grp(-.12, 0, .5, -.12); og.cyl(.018, .02, .34, woodM, -.26, 0, 0, 6); og.cyl(.018, .02, .34, woodM, .26, 0, 0, 6);
        const ownedSignTex = vCanvasTex('k7owned_' + tile.index, 320, 128, (g, w, h) => {
            g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h); g.strokeStyle = '#92400e'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.textAlign = 'center';
            g.fillStyle = '#991b1b'; g.font = '800 24px "Be Vietnam Pro", Arial'; g.fillText('🏳️ ĐẤT ĐÃ CÓ CHỦ', w / 2, 38);
            g.fillStyle = '#1e3a8a'; g.font = '800 22px "Be Vietnam Pro", Arial'; g.fillText('Chờ xây dựng Làng nghề', w / 2, 72);
            g.fillStyle = '#065f46'; g.font = '900 22px "Be Vietnam Pro", Arial'; g.fillText(`Phí xây: ${tile.buildCost}đ -> Thu: ${tile.builtRent}đ`, w / 2, 106);
        });
        const ob = new THREE.Mesh(new THREE.BoxGeometry(.6, .24, .025), [woodM, woodM, woodM, woodM, new THREE.MeshStandardMaterial({ map: ownedSignTex, roughness: .5 }), woodM]); ob.position.set(0, .22, 0); ob.castShadow = true; og.g.add(ob);
        const kinds = plotTrees(tile); tree(K2, kinds[0], .68, -.62, .46); tree(K2, kinds[1], -.7, -.66, .38);

        root.add(unowned, owned);
        root.userData = { unowned, owned, ownerTrimMat };
        return root;
    }
