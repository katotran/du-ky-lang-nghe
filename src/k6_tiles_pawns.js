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
        const label = (tile.name || '').toUpperCase().slice(0, 34);
        const tx = vCanvasTex('k6plq' + tile.index, 512, 96, (g, w, h) => {
            g.clearRect(0, 0, w, h); const r = 40; g.beginPath(); g.moveTo(r, 4); g.arcTo(w - 4, 4, w - 4, h - 4, r); g.arcTo(w - 4, h - 4, 4, h - 4, r); g.arcTo(4, h - 4, 4, 4, r); g.arcTo(4, 4, w - 4, 4, r); g.closePath();
            g.fillStyle = '#fffaf0'; g.fill(); g.strokeStyle = rim; g.lineWidth = 7; g.stroke();
            g.fillStyle = '#4a3418'; g.font = '800 36px "Nunito", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, h / 2 + 2, w - 56);
        });
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
    const PM = (c, r, m) => new THREE.MeshStandardMaterial({ color: c, roughness: r === undefined ? .6 : r, metalness: m || 0 });
    function chibiHat(st, cloth, gold) {
        const hg = new THREE.Group(), add = m => { m.castShadow = true; hg.add(m); return m; };
        if (st.hat === 'DONG') {            // khăn đóng
            const t = add(new THREE.Mesh(new THREE.TorusGeometry(.26, .085, 12, 32), PM(0x141a2e, .7))); t.rotation.x = Math.PI / 2 - .12; t.position.set(0, .16, -.02); t.scale.set(1, 1, 1.25);
            const b = add(new THREE.Mesh(new THREE.TorusGeometry(.27, .014, 6, 32), gold)); b.rotation.x = Math.PI / 2 - .12; b.position.set(0, .1, -.02);
        } else if (st.hat === 'VAN') {      // khăn vấn
            for (let i = 0; i < 3; i++) { const t = add(new THREE.Mesh(new THREE.TorusGeometry(.25 - i * .02, .06, 10, 32), PM(i % 2 ? 0xf5c542 : 0xe6ae32, .5, .1))); t.rotation.x = Math.PI / 2 - .2 + i * .06; t.position.set(0, .15 + i * .05, -.04); }
        } else if (st.hat === 'MAN') {      // mấn đội đầu + trâm vàng
            const t = add(new THREE.Mesh(new THREE.TorusGeometry(.26, .075, 12, 32), cloth)); t.rotation.x = Math.PI / 2 - .25; t.position.set(0, .17, -.04); t.scale.set(1, 1, 1.3);
            for (let i = 0; i < 5; i++) { const a = (i - 2) * .32, h = .1 + .06 * Math.cos((i - 2) * .7), c = add(new THREE.Mesh(new THREE.ConeGeometry(.03, h, 6), gold)); c.position.set(Math.sin(a) * .25, .27 + h / 2, Math.cos(a) * .2); }
            add(new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), PM(0xdc2626, .2, .3))).position.set(0, .3, .22);
        } else if (st.hat === 'LA') {       // nón lá
            const c = add(new THREE.Mesh(new THREE.ConeGeometry(.52, .3, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xead392, roughness: .75, side: THREE.DoubleSide }))); c.position.y = .3; hg.rotation.x = -.12;
            for (let k = 1; k <= 3; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(.52 * k / 4, .006, 5, 40), PM(0xb59a5a, .8)); t.rotation.x = Math.PI / 2; t.position.y = .45 - .3 * k / 4; hg.add(t); }
        } else if (st.hat === 'QUAI') {     // nón quai thao
            const d = add(new THREE.Mesh(new THREE.CylinderGeometry(.56, .58, .035, 40), PM(0xe6cf8a, .7))); d.position.y = .27; hg.rotation.x = -.16;
            const cap = add(new THREE.Mesh(new THREE.CylinderGeometry(.2, .24, .09, 24), PM(0xd9bf74, .7))); cap.position.y = .32;
            [1, -1].forEach(s => { const q = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .5, 5), PM(0x1f2937)); q.position.set(s * .36, .02, .1); q.rotation.z = s * .22; hg.add(q); const ts = add(new THREE.Mesh(new THREE.ConeGeometry(.035, .12, 8), PM(0xb91c1c, .6))); ts.position.set(s * .31, -.26, .1); });
        }
        return hg;
    }
    function chibiProp(st, playerHex) {
        const g = new THREE.Group(), add = m => { m.castShadow = true; g.add(m); return m; };
        if (st.prop === 'SCROLL') { add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .3, 12), PM(0xfef3c7, .6))).rotation.z = Math.PI / 2; [-.15, .15].forEach(x => { const e = add(new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .03, 12), PM(0xb91c1c, .4))); e.position.x = x; e.rotation.z = Math.PI / 2; }); }
        else if (st.prop === 'FAN') { const f = add(new THREE.Mesh(new THREE.CircleGeometry(.22, 20, Math.PI / 2 - .85, 1.7), new THREE.MeshStandardMaterial({ color: 0xe23b3b, roughness: .5, side: THREE.DoubleSide }))); f.position.y = .02; const r = new THREE.Mesh(new THREE.RingGeometry(.2, .22, 20, 1, Math.PI / 2 - .85, 1.7), new THREE.MeshStandardMaterial({ color: 0xf5c542, side: THREE.DoubleSide })); r.position.set(0, .02, .003); g.add(r); }
        else if (st.prop === 'LUA') { add(new THREE.Mesh(new THREE.CylinderGeometry(.012, .016, .36, 6), PM(0xc9a53a, .7))).position.y = .14; for (let i = 0; i < 6; i++) { const a = i * 1.05, k = add(new THREE.Mesh(new THREE.SphereGeometry(.028, 8, 6), PM(0xeab308, .5))); k.scale.set(.7, 1.7, .7); k.position.set(Math.cos(a) * .035, .32 + (i % 2) * .04, Math.sin(a) * .035); } }
        else if (st.prop === 'SEN') { add(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .32, 6), PM(0x15803d))).position.y = .12; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, p = add(new THREE.Mesh(new THREE.ConeGeometry(.04, .12, 6), PM(i % 2 ? 0xf9a8d4 : 0xf472b6, .45))); p.position.set(Math.cos(a) * .05, .32, Math.sin(a) * .05); p.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7); } add(new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), PM(0xfacc15))).position.y = .3; }
        else if (st.prop === 'NGOC') { add(new THREE.Mesh(new THREE.BoxGeometry(.07, .26, .02), PM(0x34d399, .2, .1))).position.y = .1; add(new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), PM(playerHex, .4))).position.y = -.06; }
        return g;
    }
    createVietnameseCostumePawn3D = function (player) {
        const st = PAWN_STYLES[player.costumeKey] || PAWN_STYLES.AO_NGU_THAN, F = st.sex === 'F';
        const group = new THREE.Group(), fig = new THREE.Group(), rig = new THREE.Group();
        group.add(fig); fig.add(rig); group.userData.figure = fig; group.userData.faceY = 0;
        const FEET = -.27; fig.position.y = FEET;           // game đặt quân cao hơn mặt bệ 0.45 -> hạ chân xuống sát mặt bệ
        const add = (parent, m, x, y, z) => { m.position.set(x || 0, y || 0, z || 0); if (m.isMesh) m.castShadow = true; parent.add(m); return m; };
        const skin = PM(st.skin, .65), hairM = PM(0x1a1210, .45, .05), gold = PM(0xf5c542, .3, .7), white = PM(0xffffff, .4), darkM = PM(0x14141a, .5);
        const cloth = new THREE.MeshStandardMaterial({ map: pawnTex(st.tex[0], st.tex[1], st.tex[2]), roughness: .6, side: THREE.DoubleSide });
        const main = PM(new THREE.Color(st.tex[1]).getHex(), .6);
        // vòng màu người chơi dưới chân + viên ngọc báo lượt trên đầu
        const ring = add(group, new THREE.Mesh(new THREE.CylinderGeometry(.36, .4, .035, 32), new THREE.MeshStandardMaterial({ color: player.hex, emissive: player.hex, emissiveIntensity: .45, roughness: .4 })), 0, FEET + .018, 0); ring.receiveShadow = true;
        add(group, new THREE.Mesh(new THREE.TorusGeometry(.38, .018, 8, 32), white), 0, FEET + .036, 0).rotation.x = Math.PI / 2;
        const gem = add(group, new THREE.Mesh(new THREE.OctahedronGeometry(.11, 0), new THREE.MeshStandardMaterial({ color: player.hex, emissive: player.hex, emissiveIntensity: .7, roughness: .25, metalness: .2 })), 0, FEET + 1.78, 0); gem.scale.y = 1.5; gem.visible = false;
        // chân
        const legs = [1, -1].map(s => { const L = new THREE.Group(); L.position.set(s * .1, .2, 0); rig.add(L); add(L, new THREE.Mesh(new THREE.CylinderGeometry(.065, .06, .16, 10), st.shirtOnly ? darkM : white), 0, -.08, 0); const shoe = add(L, new THREE.Mesh(new THREE.SphereGeometry(.085, 12, 8), PM(st.shoe, .5)), 0, -.165, .04); shoe.scale.set(1, .6, 1.5); return L; });
        // thân: áo dáng chuông
        const torso = new THREE.Group(); rig.add(torso);
        const lathe = (ctrl, mat) => { const pts = new THREE.SplineCurve(ctrl.map(p => new THREE.Vector2(p[0], p[1]))).getPoints(18); const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), mat); m.castShadow = true; m.scale.z = .86; torso.add(m); return m; };
        if (st.shirtOnly) { lathe([[.17, .2], [.19, .32], [.17, .4]], darkM); lathe([[.25, .36], [.24, .45], [.19, .6], [.13, .7], [.08, .73]], cloth); }
        else if (st.coat) { lathe([[.28, .12], [.24, .34], [.18, .5]], darkM); lathe([[.29, .3], [.25, .44], [.19, .6], [.13, .7], [.08, .73]], cloth); const y = add(torso, new THREE.Mesh(new THREE.CircleGeometry(.1, 4), PM(0xf472b6, .5)), 0, .58, .168); y.scale.set(.9, 1.3, 1); [1, -1].forEach(s => add(torso, new THREE.Mesh(new THREE.BoxGeometry(.09, .34, .02), main), s * .1, .3, .235).rotation.x = .1); }
        else lathe([[st.wide ? .31 : .28, .1], [.27, .25], [.2, .5], [.15, .66], [.08, .73]], cloth);
        const hemY = st.shirtOnly ? .36 : st.coat ? .3 : .1, hemR = st.shirtOnly ? .25 : st.coat ? .29 : st.wide ? .31 : .28;
        { const h = add(torso, new THREE.Mesh(new THREE.TorusGeometry(hemR, .014, 6, 28), gold), 0, hemY, 0); h.rotation.x = Math.PI / 2; h.scale.y = .86; }
        if (st.collar === 'STAND') { add(torso, new THREE.Mesh(new THREE.CylinderGeometry(.1, .11, .05, 16, 1, true), PM(0x172554, .5)), 0, .74, 0); for (let i = 0; i < 4; i++) add(torso, new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), gold), .05, .66 - i * .1, .15 + i * .022); }
        else if (st.collar === 'NHAT') { const b = add(torso, new THREE.Mesh(new THREE.BoxGeometry(.22, .17, .02), PM(0xfbbf24, .35, .5)), 0, .6, .165); b.rotation.x = -.3; add(torso, new THREE.Mesh(new THREE.CircleGeometry(.045, 14), PM(0xb91c1c, .4)), 0, .6, .178).rotation.x = -.3; }
        else if (st.collar === 'RAN') { const sc = add(torso, new THREE.Mesh(new THREE.TorusGeometry(.11, .04, 8, 20), new THREE.MeshStandardMaterial({ map: pawnTex('CHECK', '#f8fafc', '#15803d'), roughness: .8 })), 0, .72, 0); sc.rotation.x = Math.PI / 2; add(torso, new THREE.Mesh(new THREE.BoxGeometry(.08, .22, .025), sc.material), -.07, .6, .16).rotation.z = -.15; }
        else if (st.collar === 'GIAO') { [[-.1, gold], [-.07, white]].forEach(([o, m], k) => { const t = add(torso, new THREE.Mesh(new THREE.CylinderGeometry(.012 - k * .003, .012 - k * .003, .3, 6), m), o + .1, .58, .15 + k * .004); t.rotation.z = -.65; }); }
        if (!st.shirtOnly) { const b = add(torso, new THREE.Mesh(new THREE.TorusGeometry(.2, .022, 8, 24), new THREE.MeshStandardMaterial({ color: player.hex, roughness: .5 })), 0, .5, 0); b.rotation.x = Math.PI / 2; b.scale.y = .86; }
        // tay: xoay quanh vai
        const armR = st.wide ? .085 : .06;
        const arms = [1, -1].map(s => { const A = new THREE.Group(); A.position.set(s * .17, .66, 0); A.rotation.z = s * .55; torso.add(A); const sl = add(A, new THREE.Mesh(new THREE.CylinderGeometry(.05, armR, .24, 12), cloth), 0, -.12, 0); add(A, new THREE.Mesh(new THREE.SphereGeometry(.052, 10, 8), cloth), 0, 0, 0); add(A, new THREE.Mesh(new THREE.TorusGeometry(armR, .01, 6, 16), gold), 0, -.24, 0).rotation.x = Math.PI / 2; add(A, new THREE.Mesh(new THREE.SphereGeometry(.052, 10, 8), skin), 0, -.28, 0); return A; });
        { const p = chibiProp(st, player.hex); p.position.set(0, -.3, .03); p.rotation.z = -.55; arms[0].add(p); }
        // đầu to
        const head = new THREE.Group(); head.position.y = 1.0; rig.add(head);
        add(head, new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .08, 10), skin), 0, -.28, 0);
        const skull = add(head, new THREE.Mesh(new THREE.SphereGeometry(.3, 28, 22), skin)); skull.scale.set(1, .93, .95);
        const hair = add(head, new THREE.Mesh(new THREE.SphereGeometry(.315, 28, 18, 0, Math.PI * 2, 0, Math.PI * .56), hairM)); hair.rotation.x = -.42; hair.scale.set(1, .96, .98);
        [-1, 0, 1].forEach(k => { const f = add(head, new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), hairM), k * .13, .2 - Math.abs(k) * .035, .2); f.scale.set(1.1, .55, .6); });
        if (F) { [1, -1].forEach(s => { const l = add(head, new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), hairM), s * .27, -.06, -.02); l.scale.set(.55, 1.7, .8); }); add(head, new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), hairM), 0, st.hat === 'QUAI' || st.hat === 'LA' ? -.1 : .1, -.27); }
        [1, -1].forEach(s => add(head, new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), skin), s * .295, -.03, 0).scale.set(.5, 1, .8));
        const eyeM = PM(0x23160f, .15), eyes = [1, -1].map(s => {
            const E = new THREE.Group(); E.position.set(s * .115, -.035, .262); E.rotation.y = s * .32; head.add(E);
            add(E, new THREE.Mesh(new THREE.SphereGeometry(.052, 14, 12), eyeM)).scale.set(1, 1.28, .45);
            add(E, new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), white), .016, .028, .02); add(E, new THREE.Mesh(new THREE.SphereGeometry(.009, 6, 5), white), -.016, -.02, .022);
            const br = add(head, new THREE.Mesh(new THREE.BoxGeometry(.075, F ? .012 : .018, .012), hairM), s * .12, .075, .268); br.rotation.z = -s * .12; br.rotation.y = s * .3;
            const bl = add(head, new THREE.Mesh(new THREE.CircleGeometry(.045, 14), new THREE.MeshBasicMaterial({ color: 0xff8fa8, transparent: true, opacity: F ? .55 : .38, depthWrite: false })), s * .185, -.105, .232); bl.rotation.y = s * .62; bl.castShadow = false;
            return E;
        });
        const mouth = add(head, new THREE.Mesh(new THREE.TorusGeometry(.038, .009, 6, 14, Math.PI), PM(F ? 0xc2414b : 0x8f3a36, .4)), 0, -.13, .272); mouth.rotation.z = Math.PI;
        head.add(chibiHat(st, cloth, gold));
        // vùng bắt chuột (vô hình)
        const hit = add(group, new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 1.7, 10), new THREE.MeshBasicMaterial({ visible: false })), 0, FEET + .85, 0); hit.castShadow = false;
        group.scale.setScalar(.68);
        const C = { player, group, rig, torso, head, eyes, mouth, arms, legs, gem, ring, hit, ph: player.id * 1.7, last: null, air: 0, squash: 0, wave: 0, cheer: 0, sad: 0, blink: 2 + Math.random() * 3, cash: player.cash, lastT: 0 };
        group.userData.chibi = C; hit.userData.chibi = C;
        for (let i = CHIBI.length - 1; i >= 0; i--) if (!CHIBI[i].group.parent || CHIBI[i].player.id === player.id) CHIBI.splice(i, 1);
        CHIBI.push(C);
        return group;
    };

    // Năm quân đứng thành vòng trên bệ để không che nhau
    getPlayerPawnOffset = function (i) { const a = -Math.PI / 2 + (i % 5) * Math.PI * 2 / 5 + Math.PI; return { dx: Math.cos(a) * .8, dz: Math.sin(a) * .8 }; };

    function chibiPop(C, emoji) {
        try {
            const sp = emojiSprite(emoji, .32); const p = C.group.position; sp.position.set(p.x, p.y + 1.25, p.z); scene.add(sp); const t0 = performance.now();
            const fn = () => { const e = (performance.now() - t0) / 900; if (e >= 1) { scene.remove(sp); const i = _mapAnim.indexOf(fn); if (i >= 0) setTimeout(() => _mapAnim.splice(_mapAnim.indexOf(fn), 1), 0); return; } sp.position.y = p.y + 1.25 + e * .9; sp.material.opacity = 1 - e * e; sp.scale.setScalar(.32 + Math.sin(e * Math.PI) * .14); };
            sp.material.transparent = true; _mapAnim.push(fn);
        } catch (e) { }
    }
    function chibiUpdate() {
        const now = performance.now() / 1000;
        CHIBI.forEach(C => {
            const g = C.group; if (!g.parent || !g.visible) return;
            const dt = Math.min(.1, Math.max(0, now - (C.lastT || now))); C.lastT = now;
            const p = C.player, tile = BOARD_TILES[p.position], rest = tile ? tile.elevation + .45 : g.position.y;
            const air = Math.max(0, g.position.y - rest), moving = C.last ? Math.hypot(g.position.x - C.last.x, g.position.z - C.last.z) > .002 : false;
            if (C.air > .06 && air <= .06) C.squash = 1;                       // vừa chạm đất
            C.air = air; C.last = { x: g.position.x, z: g.position.z };
            if (p.cash !== C.cash) { if (p.cash > C.cash) { if (C.cheer <= 0) { C.cheer = C.cheer0 = .7; C.spin = 0; } chibiPop(C, '💰'); } else { C.sad = 1.6; } C.cash = p.cash; }
            ['squash', 'wave', 'cheer', 'sad'].forEach(k => { C[k] = Math.max(0, C[k] - dt * (k === 'squash' ? 4 : k === 'sad' ? 1 : 1.1)); });
            const turn = gameState.currentPlayerIdx === p.id && !gameState.gameEnded, t = now + C.ph, hop = air > .06 || moving;
            // thân: thở, nhún khi tới lượt, co giãn khi nhảy / chạm đất
            const cp = C.cheer > 0 ? 1 - C.cheer / (C.cheer0 || 1) : 0, ch = C.cheer > 0 ? Math.sin(cp * Math.PI) : 0;
            const bounce = turn && !hop ? Math.abs(Math.sin(t * 3.2)) * .07 : 0;
            const sq = C.squash > 0 ? Math.sin(C.squash * Math.PI) * .2 : 0, stretch = Math.min(.16, air * .2);
            C.rig.position.y = bounce + ch * .55;
            C.rig.scale.set(1 + sq * .6 - stretch * .5, 1 - sq + stretch, 1 + sq * .6 - stretch * .5);
            C.rig.rotation.y = C.cheer > 0 && C.spin ? cp * Math.PI * 2 : 0;
            C.rig.rotation.x = hop ? .18 : 0;
            C.torso.scale.x = C.torso.scale.z = 1 + Math.sin(t * 2.2) * .015;
            // đầu: lắc lư, nhìn theo camera khi được rê chuột, cúi khi mất tiền
            let look = 0; if (C.wave > 0) { const a = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z) - (g.userData.faceY || 0); look = Math.max(-1, Math.min(1, Math.atan2(Math.sin(a), Math.cos(a)))); }
            C.head.rotation.y += (look - C.head.rotation.y) * .18;
            C.head.rotation.z = Math.sin(t * 1.3) * .06 + (C.wave > 0 ? .12 : 0);
            C.head.rotation.x = C.sad > 0 ? .38 * Math.min(1, C.sad) : hop ? -.15 : Math.sin(t * .9) * .03;
            // mắt chớp
            C.blink -= dt; const bk = C.blink < .12 ? .12 : 1; if (C.blink < 0) C.blink = 2.2 + Math.random() * 3.5;
            C.eyes.forEach(E => E.scale.y = C.cheer > 0 || C.wave > 0 ? .55 : C.sad > 0 ? .7 : bk);
            C.mouth.scale.set(C.cheer > 0 || C.wave > 0 ? 1.5 : 1, C.sad > 0 ? -1 : C.cheer > 0 || C.wave > 0 ? 1.6 : 1, 1);
            // tay: đung đưa, giơ cao khi nhảy/ăn mừng, vẫy khi được chào
            const up = hop || C.cheer > 0;
            C.arms.forEach((A, i) => { const s = i ? -1 : 1; let z = s * (.5 + Math.sin(t * 2.2 + i * 3) * .07), x = Math.sin(t * 1.6 + i * 3.1) * .08; if (up) { z = s * 2.5; x = 0; } else if (C.wave > 0 && i === 1) { z = s * (2.5 + Math.sin(now * 14) * .45); x = 0; } else if (C.sad > 0) z = s * .25; A.rotation.z += (z - A.rotation.z) * .3; A.rotation.x += (x - A.rotation.x) * .3; });
            // chân: co lên khi nhảy, dậm nhẹ khi tới lượt
            C.legs.forEach((L, i) => { const tx = hop ? (i ? -.9 : .7) : turn ? Math.sin(t * 6.4 + i * Math.PI) * .12 : 0; L.rotation.x += (tx - L.rotation.x) * .35; });
            // ngọc báo lượt
            C.gem.visible = turn; if (turn) { C.gem.rotation.y = now * 2.4; C.gem.position.y = -.27 + 1.78 + Math.sin(now * 3) * .06; }
            C.ring.material.emissiveIntensity = turn ? .55 + Math.sin(now * 5) * .3 : .35;
        });
    }
    _mapAnim.push(chibiUpdate);

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
