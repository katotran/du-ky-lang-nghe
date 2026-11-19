    /* =================================================================================
     * K10. NĂM NHÂN VẬT CHIBI HIỆN ĐẠI (kiểu figure / vinyl toy) + HỆ ANIMATION
     *
     *  Mô hình   · ~3,3 đầu, đầu to, cổ nhỏ, tay chân ngắn, bàn tay có ngón, bề mặt mịn bóng nhẹ như nhựa/đất sét
     *  Bộ xương  · phân cấp: body(squash) → hips → spine → neck/head; spine → vai → khuỷu → cổ tay → bàn tay (5 ngón);
     *              hips → đùi → gối → cổ chân → bàn chân. Không dùng GLB: dựng procedural bằng three.js.
     *  Tạo mới   · createCharacter(config, player): config = {kind, skin, eye, build(), idle[], grip, rest...}.
     *              Thêm nhân vật = thêm 1 mục vào CHARACTER_CONFIGS + 1 hàm dựng trang phục/tóc/phụ kiện.
     *  Animation · mỗi khớp là một "kênh" (30 kênh). Mỗi khung hình: tạo tư thế đích theo trạng thái
     *              (idle riêng · bước/nhảy khụy-bật-đáp · tung xúc xắc · thắng · thua · đến làng nghề · tới lượt · chào)
     *              rồi làm mượt bằng tween mũ (crossfade) → chuyển trạng thái liền mạch, tốc độ theo nút tốc độ của game.
     *  Phụ trợ   · chuyển động thứ cấp bằng lò xo (đuôi tóc, mũ, ba lô, váy, túi, dây đeo), bóng mềm dưới chân,
     *              nhãn tên nổi, avatar giao diện render từ chính mô hình 3D.
     * ================================================================================= */
    const CHARS = {
        AO_NGU_THAN: { kind: 'photographer', name: 'Nhiếp Ảnh Gia Film', short: 'Nhiếp Ảnh Gia', desc: 'Chàng trai mê máy ảnh film: áo bomber xanh rêu, quần cargo, mũ bucket, sneaker trắng và chiếc máy ảnh đeo cổ.' },
        AO_NHAT_BINH: { kind: 'vlogger', name: 'Vlogger Năng Động', short: 'Vlogger', desc: 'Cô bạn ham quay vlog: crop top hồng, quần ống rộng, tóc đuôi ngựa cao, tai nghe và gimbal luôn trên tay.' },
        AO_BA_BA: { kind: 'traveler', name: 'Phượt Thủ Núi Rừng', short: 'Phượt Thủ', desc: 'Chàng trai cao ráo mê khám phá: áo gió outdoor, quần túi hộp, ba lô leo núi lớn, mũ lưỡi trai, bình nước và giày trekking.' },
        AO_TU_THAN: { kind: 'artist', name: 'Nghệ Sĩ Cá Tính', short: 'Nghệ Sĩ', desc: 'Cô nàng nghệ sĩ: hoodie oversize, chân váy xếp ly, tóc bob nhuộm tím nhẹ, kính tròn, túi tote vẽ tay và sổ phác thảo.' },
        AO_GIAO_LINH: { kind: 'street', name: 'Streetstyle Cực Chất', short: 'Streetstyle', desc: 'Chàng trai phố thị: áo thun graphic, quần baggy, áo khoác thể thao, mũ snapback, headphone choàng cổ và balo mini.' }
    };
    // đổi tên/mô tả bộ trang phục trong dữ liệu gốc để sảnh chờ, bảng người chơi, chế độ chơi hiển thị đúng
    Object.keys(CHARS).forEach(k => {
        if (VIETNAMESE_COSTUMES[k]) { VIETNAMESE_COSTUMES[k].name = CHARS[k].name; VIETNAMESE_COSTUMES[k].desc = CHARS[k].desc; }
        PLAYERS.forEach(p => { if (p.costumeKey === k) p.costumeName = CHARS[k].short; });
    });

    /* ---------- vật liệu & hình khối cơ bản ---------- */
    // vật liệu dùng chung theo (màu, độ nhám, tuỳ chọn) để các khối cùng vật liệu gộp được thành một mesh
    const _vmCache = {};
    const VM = (hex, r, o) => { const k = hex + '|' + r + '|' + (o ? JSON.stringify(o) : ''); return _vmCache[k] || (_vmCache[k] = new THREE.MeshPhysicalMaterial(Object.assign({ color: hex, roughness: r === undefined ? .5 : r, metalness: 0, clearcoat: .28, clearcoatRoughness: .42 }, o || {}))); };
    // gộp các mesh con tĩnh cùng vật liệu trong mỗi khớp thành một mesh (giữ FPS: mỗi nhân vật ~300 mesh → ~60)
    function mergeGeoList(list) {
        let n = 0; const parts = list.map(g0 => { const g = g0.index ? g0.toNonIndexed() : g0; if (!g.attributes.normal) g.computeVertexNormals(); n += g.attributes.position.count; return g; });
        const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
        parts.forEach(g => { const c = g.attributes.position.count; pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += c; });
        const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); m.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return m;
    }
    function mergeStaticMeshes2(group) {
        const buckets = new Map();
        group.children.slice().forEach(ch => {
            if (!ch.isMesh || ch.userData.noMerge || Array.isArray(ch.material) || !ch.geometry.attributes.position || !ch.visible) return;
            ch.updateMatrix(); const g = ch.geometry.clone(); g.applyMatrix4(ch.matrix);
            const key = ch.material; if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(g); group.remove(ch);
        });
        buckets.forEach((list, mat) => { const m = new THREE.Mesh(list.length === 1 ? (list[0].index ? list[0].toNonIndexed() : list[0]) : mergeGeoList(list), mat); m.castShadow = true; group.add(m); });
        group.children.slice().forEach(ch => { if (ch.isGroup) mergeStaticMeshes2(ch); });
    }
    const CAN = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };
    function mk(par, geo, mat, x, y, z) { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; par.add(m); return m; }
    const KG = {
        sph: (r, ws, hs) => new THREE.SphereGeometry(r, ws || 28, hs || 20),
        cyl: (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s || 24),
        box: (w, h, d, r) => rbGeo(w, h, d, r === undefined ? Math.min(w, h, d) * .28 : r)
    };
    const joint = (par, x, y, z) => { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); par.add(g); return g; };
    function tubeBetween(par, pts, r, mat) { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 24, r, 8, false), mat); m.castShadow = true; par.add(m); return m; }
    function kLathe(par, prof, mat, y0, sz, phi0, phiLen) {
        const g = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 40, phi0 || 0, phiLen === undefined ? Math.PI * 2 : phiLen);
        const m = new THREE.Mesh(g, mat); m.position.y = y0 || 0; m.scale.z = sz || .84; m.castShadow = true; m.material.side = THREE.DoubleSide; par.add(m); return m;
    }

    /* ---------- bàn tay 5 ngón (mỗi ngón là một khớp để co/duỗi) ---------- */
    const HAND_POSES = {          // độ cong: [cái, trỏ, giữa, nhẫn, út]
        relaxed: [.25, .3, .35, .42, .5], open: [.05, .08, .08, .1, .14], fist: [1.0, 1.55, 1.6, 1.6, 1.6],
        point: [.9, .02, 1.5, 1.6, 1.7], V: [.9, .02, .04, 1.5, 1.7], thumbs: [-.45, 1.6, 1.6, 1.6, 1.6], grip: [.7, 1.0, 1.05, 1.1, 1.15]
    };
    function makeHand(skin, side) {
        const h = new THREE.Group(); h.userData.fingers = [];
        mk(h, KG.sph(.05), skin, 0, -.04, 0).scale.set(1.05, 1.12, .72);
        const th = new THREE.Group(); th.position.set(side * .043, -.035, .014); th.rotation.set(.2, 0, side * .95); h.add(th);
        mk(th, KG.cyl(.0125, .0135, .042, 10), skin, 0, -.021, 0); mk(th, KG.sph(.0128, 10, 8), skin, 0, -.042, 0);
        th.userData.thumb = side; h.userData.fingers.push(th);
        for (let k = 0; k < 4; k++) {       // k=0 trỏ (gần ngón cái) … k=3 út
            const i = side > 0 ? 3 - k : k, f = new THREE.Group(); f.position.set((i - 1.5) * .02, -.082, 0); f.rotation.x = .22; h.add(f);
            const L = k === 1 || k === 2 ? .052 : .044;
            mk(f, KG.cyl(.0105, .011, L, 10), skin, 0, -L / 2, 0); mk(f, KG.sph(.0108, 10, 8), skin, 0, -L, 0);
            h.userData.fingers.push(f);
        }
        h.userData.curl = HAND_POSES.relaxed.slice();
        return h;
    }
    function applyHand(h, c) {
        const F = h.userData.fingers, th = F[0], side = th.userData.thumb;
        th.rotation.set(.2 + c[0] * .15, 0, side * (.95 - c[0] * .7));
        for (let k = 1; k < 5; k++) F[k].rotation.x = c[k] * 1.0;
    }

    /* ---------- biểu cảm ---------- */
    const EXPR = {
        smile: { mouth: 'smile', brow: 0, browY: 0, eye: 1 },
        confident: { mouth: 'smirk', brow: -.16, browY: .004, eye: .93 },
        surprised: { mouth: 'o', brow: .1, browY: .038, eye: 1.14 },
        sad: { mouth: 'sad', brow: .34, browY: -.004, eye: .88 },
        tired: { mouth: 'flat', brow: .16, browY: -.014, eye: .5 },
        happy: { mouth: 'grin', brow: 0, browY: .022, eye: .68 }
    };
    const BLUSH = new THREE.MeshBasicMaterial({ color: 0xff8da6, transparent: true, opacity: .42, depthWrite: false });
    function buildHeadAndFace(C, spec, skin, hairM, head) {
        const eyeM = VM(spec.eye || 0x2a1a14, .18, { clearcoat: 1, clearcoatRoughness: .05 }), white = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const skull = mk(head, KG.sph(.3, 40, 30), skin); skull.scale.set(1.06, .97, 1);
        [1, -1].forEach(s => { mk(head, KG.sph(.052, 14, 10), skin, s * .31, -.03, -.01).scale.set(.5, 1, .8); });
        mk(head, KG.sph(.021, 14, 10), VM(spec.skinDeep, .5), 0, -.075, .292).scale.set(1, .85, .85);
        C.eyes = []; C.brows = [];
        [1, -1].forEach(s => {
            const E = new THREE.Group(); E.position.set(s * .118, -.035, .262); E.rotation.y = s * .3; head.add(E);
            mk(E, KG.sph(.064, 24, 18), eyeM).scale.set(1, 1.18, .5);
            mk(E, KG.sph(.036, 16, 12), VM(0x0b0605, .2, { clearcoat: 1 }), 0, -.004, .012).scale.set(1, 1.15, .5);
            mk(E, KG.sph(.02, 12, 10), white, .02, .03, .026); mk(E, KG.sph(.0095, 10, 8), white, -.02, -.026, .026);
            const lash = mk(E, new THREE.TorusGeometry(.066, .0065, 6, 20, Math.PI * .85), VM(0x1c110d, .5), 0, .004, .006); lash.rotation.z = Math.PI * .08; lash.scale.set(1, 1.1, .6);
            C.eyes.push(E);
            const bg = new THREE.Group(); bg.position.set(s * .122, .074, .265); bg.rotation.y = s * .3; head.add(bg);
            const b = mk(bg, KG.cyl(.0125, .0125, .086, 10), hairM); b.rotation.z = Math.PI / 2; mk(bg, KG.sph(.0125, 10, 8), hairM, .043, 0, 0); mk(bg, KG.sph(.0125, 10, 8), hairM, -.043, 0, 0);
            bg.userData.s = s; C.brows.push(bg);
            const bl = mk(head, new THREE.CircleGeometry(.046, 16), BLUSH, s * .19, -.1, .232); bl.rotation.y = s * .62; bl.castShadow = false;
        });
        const mg = new THREE.Group(); mg.position.set(0, -.13, .272); head.add(mg);
        const lipM = VM(0xb5424a, .45), dark = VM(0x4a1216, .6), M = {};
        M.smile = mk(mg, new THREE.TorusGeometry(.042, .0085, 8, 18, Math.PI * .8), lipM); M.smile.rotation.z = Math.PI + Math.PI * .1;
        M.smirk = mk(mg, new THREE.TorusGeometry(.04, .0085, 8, 18, Math.PI * .72), lipM, .012, .004, 0); M.smirk.rotation.z = Math.PI + Math.PI * .14 + .18;
        M.grin = new THREE.Group(); mg.add(M.grin); mk(M.grin, new THREE.SphereGeometry(.052, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), dark, 0, .014, 0).scale.set(1, .85, .55); mk(M.grin, KG.sph(.025, 12, 8), VM(0xe8707e, .5), 0, -.026, .006).scale.set(1.2, .55, .5);
        M.o = new THREE.Group(); mg.add(M.o); mk(M.o, new THREE.TorusGeometry(.021, .0085, 8, 18), lipM); mk(M.o, new THREE.CircleGeometry(.021, 14), dark, 0, 0, .001);
        M.sad = mk(mg, new THREE.TorusGeometry(.035, .0085, 8, 18, Math.PI * .75), lipM, 0, -.016, 0); M.sad.rotation.z = Math.PI * .125;
        M.flat = mk(mg, KG.cyl(.0085, .0085, .06, 8), lipM); M.flat.rotation.z = Math.PI / 2;
        Object.keys(M).forEach(k => { M[k].userData.noMerge = true; });
        C.mouths = M;
    }
    function setExpr(C, name) {
        if (C.expr === name) return; C.expr = name; const E = EXPR[name] || EXPR.smile;
        Object.keys(C.mouths).forEach(k => { C.mouths[k].visible = k === E.mouth; });
        C.brows.forEach(b => { b.rotation.z = -b.userData.s * E.brow; b.position.y = .074 + E.browY; });
        C.exprEye = E.eye;
    }

    /* ---------- tóc & mũ dùng chung ---------- */
    function hairCap(head, mat) {
        const m = mk(head, new THREE.SphereGeometry(.322, 40, 30, 0, Math.PI * 2, 0, Math.PI * .62), mat, 0, .0, -.01);
        m.rotation.x = -.7; m.scale.set(1.075, 1.04, 1.06); return m;
    }
    function fringe(head, mat, n, y, w, h) {
        for (let i = 0; i < n; i++) {
            const a = (i / (n - 1) - .5) * 2.05, s = mk(head, KG.sph(.07, 14, 10), mat, Math.sin(a) * .262, y + .075 - Math.abs(a) * .05, Math.cos(a) * .262 - .02);
            s.scale.set(w || 1.1, (h || 1.2) * .7, .55); s.rotation.y = a; s.rotation.x = .3;
        }
    }

    /* ---------- chuyển động thứ cấp bằng lò xo ---------- */
    // gF/gY/gW: độ nhạy theo vận tốc tiến / thẳng đứng / xoay đầu; ax: trục quay; k,d: độ cứng, giảm chấn
    function addSpring(C, obj, o) { C.sec.push(Object.assign({ obj, ax: 'x', gF: 0, gY: 0, gW: 0, k: 70, d: 7, max: .6, a: 0, v: 0, base: 0 }, o)); }

    /* ---------- bộ xương phân cấp ---------- */
    function buildSkeleton(C, o) {
        const skin = o.skinM, hipY = o.hipY, legLen = hipY - .09, T = legLen * .5, S = legLen - T, legMid = (o.legTop + o.legBot) / 2;
        const body = C.body = joint(C.fig, 0, 0, 0);                       // nút squash & stretch quanh bàn chân
        const hips = C.hips = joint(body, 0, hipY, 0);
        mk(hips, KG.sph(.2, 26, 18), o.hipM || o.pantM || skin, 0, .01, 0).scale.set(.98, .62, .8);
        C.thigh = []; C.knee = []; C.ankle = [];
        [1, -1].forEach(s => {
            const th = joint(hips, s * .098, 0, 0), kn = joint(th, 0, -T, 0), an = joint(kn, 0, -S, 0);
            if (o.skirt) {
                mk(th, KG.cyl(.056, .052, T + .01, 18), skin, 0, -T / 2, 0); mk(kn, KG.sph(.052, 14, 10), skin);
                mk(kn, KG.cyl(.052, .05, S, 18), skin, 0, -S / 2, 0); mk(an, KG.cyl(.056, .056, .15, 18), o.sockM, 0, .075, 0);
            } else {
                mk(th, KG.cyl(o.legTop, legMid, T + .01, 28), o.pantM, 0, -T / 2, 0); mk(kn, KG.sph(legMid * 1.01, 18, 12), o.pantM);
                mk(kn, KG.cyl(legMid, o.legBot, S, 28), o.pantM, 0, -S / 2, 0);
                mk(an, KG.cyl(o.legBot + .004, o.legBot + .004, .035, 28), o.cuffM || o.pantM, 0, .02, 0);
                if (o.legExtra) o.legExtra(th, s, T);
            }
            mk(an, KG.sph(.098, 24, 16), o.shoeM, 0, -.018, .05).scale.set(1.02, .66, 1.55);
            mk(an, KG.sph(.104, 24, 16), o.soleM, 0, -.062, .05).scale.set(1.04, .26, 1.6);
            if (o.bootCuff) mk(an, KG.cyl(.076, .082, .09, 20), o.shoeM, 0, .035, 0);
            if (o.toeM) mk(an, KG.sph(.07, 16, 12), o.toeM, 0, -.03, .11).scale.set(1, .6, .8);
            C.thigh.push(th); C.knee.push(kn); C.ankle.push(an);
        });
        const spine = C.spine = joint(hips, 0, 0, 0);
        o.torso(spine);
        mk(spine, KG.cyl(.056, .062, .12, 16), skin, 0, o.torsoH + .035, 0);                // cổ
        spine.add(C.head); C.head.position.y = o.neckTop + .35;
        C.shoulder = []; C.elbow = []; C.wrist = []; C.hands = [];
        const sl = o.sleeve, U = o.armLen * .5, Lw = o.armLen - U, rm = (sl.r0 + sl.r1) / 2;
        [1, -1].forEach(s => {
            const sh = joint(spine, s * o.shoulderX, o.torsoH - .055, 0), el = joint(sh, 0, -U, 0), wr = joint(el, 0, -Lw, 0);
            if (sl.short) {
                mk(sh, KG.cyl(.043, .04, U + .01, 18), skin, 0, -U / 2, 0); mk(sh, KG.cyl(sl.r0, sl.r0 * .93, U * .78, 20), sl.mat, 0, -U * .39, 0);
                mk(el, KG.sph(.041, 14, 10), skin); mk(el, KG.cyl(.04, .037, Lw, 18), skin, 0, -Lw / 2, 0);
            } else {
                mk(sh, KG.cyl(sl.r0, rm, U + .01, 22), sl.mat, 0, -U / 2, 0); mk(el, KG.sph(rm * 1.02, 16, 12), sl.mat);
                mk(el, KG.cyl(rm, sl.r1, Lw, 22), sl.mat, 0, -Lw / 2, 0);
                if (sl.cuff) mk(el, KG.cyl(sl.r1 + .004, sl.r1 + .004, .035, 22), sl.cuff, 0, -Lw + .02, 0);
                if (sl.stripe) { mk(sh, KG.box(.012, U, .012, .004), sl.stripe, s * (sl.r0 - .002), -U / 2, 0); mk(el, KG.box(.012, Lw, .012, .004), sl.stripe, s * (rm - .002), -Lw / 2, 0); }
            }
            mk(sh, KG.sph(sl.r0 * 1.04, 18, 12), sl.short ? sl.mat : sl.mat);
            const hand = makeHand(skin, s); wr.add(hand);
            C.shoulder.push(sh); C.elbow.push(el); C.wrist.push(wr); C.hands.push(hand);
        });
    }

    /* ---------- năm nhân vật: trang phục, tóc, phụ kiện ---------- */
    const SKINS = { photographer: [0xe3ac82, 0xc88f66], vlogger: [0xf8d9c6, 0xe8b79d], artist: [0xf0c9a8, 0xd9a984], traveler: [0xd49a6a, 0xb77d52], street: [0xe2b48d, 0xc79570] };

    function buildPhotographer(C, head, skinM) {
        const olive = VM(0x6f7d4a, .62), tee = VM(0xf6f2e8, .6), hairM = VM(0x3b2a22, .5), khaki = VM(0xb89f74, .65), white = VM(0xf3f4f6, .5), blue = VM(0x2f6df0, .4);
        C.hairM = hairM;
        buildSkeleton(C, {
            skinM, hipY: .6, torsoH: .6, neckTop: .62, shoulderX: .205, armLen: .6, legTop: .082, legBot: .095, pantM: khaki, shoeM: white, soleM: VM(0xe9e6df, .6), toeM: VM(0xd9d6cf, .6),
            sleeve: { mat: olive, r0: .056, r1: .052, cuff: VM(0x4d5834, .7) },
            legExtra: (th, s, T) => { mk(th, KG.box(.05, .11, .08, .02), khaki, s * .088, -T * .8, .0).rotation.z = s * .05; },
            torso: T => {
                kLathe(T, [[.0, .0], [.165, .0], [.176, .12], [.168, .28], [.19, .43], [.17, .55], [.085, .62], [0, .64]], tee, 0, .82);
                kLathe(T, [[.0, -.01], [.183, -.01], [.2, .12], [.188, .3], [.2, .45], [.175, .56], [.095, .62], [0, .64]], olive, 0, .84, .55, Math.PI * 2 - 1.1);
                const rib = mk(T, new THREE.TorusGeometry(.18, .019, 10, 36), VM(0x4d5834, .7), 0, .0, 0); rib.rotation.x = Math.PI / 2; rib.scale.y = .84;
                const col = mk(T, new THREE.TorusGeometry(.092, .026, 10, 24), VM(0x4d5834, .7), 0, .6, -.005); col.rotation.x = Math.PI / 2;
                const cam = new THREE.Group(); cam.position.set(.0, .34, .185); T.add(cam);
                mk(cam, KG.box(.19, .115, .075, .022), VM(0x1c1d21, .4), 0, 0, 0); mk(cam, KG.box(.19, .04, .078, .015), VM(0xc9ccd2, .25, { metalness: .6 }), 0, .062, 0);
                mk(cam, KG.cyl(.04, .044, .06, 20), VM(0x15161a, .3), .0, -.004, .06).rotation.x = Math.PI / 2; mk(cam, KG.cyl(.026, .026, .012, 18), VM(0x5b7fb0, .1, { clearcoat: 1 }), 0, -.004, .092).rotation.x = Math.PI / 2;
                mk(cam, KG.sph(.012), VM(0xe03b3b), .066, .056, .04);
                tubeBetween(T, [[-.075, .6, .03], [-.1, .45, .13], [-.075, .4, .17]], .0105, VM(0x2f6df0, .6)); tubeBetween(T, [[.075, .6, .03], [.1, .45, .13], [.075, .4, .17]], .0105, VM(0x2f6df0, .6));
                C.camObj = cam; addSpring(C, cam, { gY: .02, gF: .012, k: 55, d: 5, max: .35 });
            }
        });
        hairCap(head, hairM); fringe(head, hairM, 7, .12, 1, 1.15);
        [[-.1, .26, .14, .09], [.06, .29, .12, .1], [.14, .24, .06, .08], [-.18, .2, .02, .085], [0, .27, -.05, .11]].forEach(([x, y, z, r]) => mk(head, KG.sph(r, 14, 10), hairM, x, y, z).scale.set(1.1, .8, 1));
        [1, -1].forEach(s => mk(head, KG.sph(.07, 14, 10), hairM, s * .272, .02, .04).scale.set(.55, 1.5, .8));
        const hatM = VM(0x7d8b55, .78), hat = new THREE.Group(); hat.position.set(0, .19, -.015); hat.rotation.x = -.12; head.add(hat);
        mk(hat, KG.cyl(.255, .31, .21, 36), hatM, 0, .1, 0); mk(hat, new THREE.CylinderGeometry(.43, .34, .06, 36, 1), hatM, 0, -.0, 0);
        mk(hat, KG.cyl(.312, .312, .04, 36), blue, 0, .03, 0); mk(hat, KG.sph(.255, 28, 14), hatM, 0, .205, 0).scale.set(1, .22, 1);
        addSpring(C, hat, { gY: .03, gF: .01, gW: .25, k: 60, d: 6, max: .3, base: -.12 });
    }

    function buildVlogger(C, head, skinM) {
        const pink = VM(0xf0507a, .5), hairM = VM(0x2a1a18, .45), grey = VM(0xc9ced6, .6), white = VM(0xfafafa, .45), dark = VM(0x1d1f26, .45);
        C.hairM = hairM;
        buildSkeleton(C, {
            skinM, hipY: .58, torsoH: .58, neckTop: .62, shoulderX: .185, armLen: .56, legTop: .075, legBot: .125, pantM: grey, cuffM: VM(0xaeb4bf, .6), shoeM: white, soleM: VM(0xf0507a, .5), toeM: VM(0xffb3c6, .5),
            sleeve: { mat: pink, r0: .056, r1: .05, short: true },
            torso: T => {
                kLathe(T, [[.0, .0], [.15, .0], [.158, .12], [.15, .24]], skinM, 0, .8);
                kLathe(T, [[.152, .22], [.165, .3], [.185, .42], [.165, .53], [.082, .6], [0, .62]], pink, 0, .82);
                const hem = mk(T, new THREE.TorusGeometry(.153, .012, 8, 32), VM(0xc73a60, .5), 0, .225, 0); hem.rotation.x = Math.PI / 2; hem.scale.y = .8;
                const wb = mk(T, new THREE.TorusGeometry(.17, .022, 10, 36), VM(0x9aa1ad, .6), 0, .0, 0); wb.rotation.x = Math.PI / 2; wb.scale.y = .82;
            }
        });
        hairCap(head, hairM); fringe(head, hairM, 8, .14, 1.05, 1.3);
        mk(head, KG.sph(.065, 14, 10), hairM, -.13, .08, .275).scale.set(.8, 1.7, .6);
        const sc = mk(head, new THREE.TorusGeometry(.065, .028, 12, 20), VM(0xff4d8d, .5), 0, .27, -.2); sc.rotation.x = Math.PI / 2 - .6;
        // đuôi ngựa: chuỗi khớp lồng nhau, mỗi đốt có lò xo riêng → bay theo nhịp
        const tail = [[0, .33, -.26, .088], [0, .08, -.07, .09], [0, -.01, -.1, .088], [0, -.09, -.09, .08], [0, -.13, -.05, .07], [0, -.12, -.01, .056], [-.01, -.11, .01, .042]];
        let par = head, k0 = 90;
        tail.forEach(([x, y, z, r], i) => { const g = joint(par, x, y, z); mk(g, KG.sph(r, 16, 12), hairM); addSpring(C, g, { gY: .03, gF: .02, gW: .35, k: k0 - i * 8, d: 5, max: .5, base: i === 0 ? 0 : -.1 }); par = g; });
        [1, -1].forEach(s => mk(head, KG.sph(.05, 12, 10), hairM, s * .26, .0, .1).scale.set(.6, 1.7, .7));
        const band = mk(head, new THREE.TorusGeometry(.35, .017, 10, 40, Math.PI), VM(0x20222a, .4), 0, -.0, -.015);
        [1, -1].forEach(s => { mk(head, KG.cyl(.088, .088, .07, 24), white, s * .335, -.01, 0).rotation.z = Math.PI / 2; mk(head, KG.cyl(.07, .07, .03, 24), VM(0xff4d8d, .45), s * .375, -.01, 0).rotation.z = Math.PI / 2; });
        const hold = joint(C.hands[0], 0, -.085, .015); hold.rotation.x = .2;
        mk(hold, KG.cyl(.016, .018, .2, 12), dark, 0, .0, 0); mk(hold, KG.sph(.03, 14, 10), dark, 0, .11, 0).scale.set(1, .6, 1);
        const ph = joint(hold, 0, .2, .012); ph.rotation.x = -.15;
        mk(ph, KG.box(.075, .135, .014, .01), VM(0x15171d, .35), 0, 0, 0); mk(ph, new THREE.PlaneGeometry(.062, .118), new THREE.MeshBasicMaterial({ color: 0x4a7fd0 }), 0, 0, .0075); mk(ph, KG.sph(.009), VM(0x6b8fd0, .1), .022, .05, -.009);
        C.holdProp = hold;
    }

    function buildArtist(C, head, skinM) {
        const lilac = VM(0x8d6bd6, .75), hairM = VM(0x9a86ea, .5), white = VM(0xf5f5f7, .55), gold = VM(0xd9b04a, .3, { metalness: .8 });
        C.hairM = hairM;
        buildSkeleton(C, {
            skinM, hipY: .56, torsoH: .6, neckTop: .64, shoulderX: .205, armLen: .54, skirt: true, sockM: white, shoeM: VM(0xf7e9f0, .5), soleM: VM(0xb9a6f0, .5), toeM: VM(0xdcd0fa, .5),
            sleeve: { mat: lilac, r0: .068, r1: .08, cuff: VM(0x6f4fc0, .75) },
            torso: T => {
                kLathe(T, [[.0, -.12], [.2, -.12], [.245, .06], [.255, .24], [.25, .4], [.2, .54], [.1, .62], [0, .64]], lilac, 0, .88);
                const hem = mk(T, new THREE.TorusGeometry(.2, .02, 10, 36), VM(0x6f4fc0, .75), 0, -.115, 0); hem.rotation.x = Math.PI / 2; hem.scale.y = .88;
                const hood = mk(T, new THREE.TorusGeometry(.13, .05, 14, 28), lilac, 0, .6, -.07); hood.rotation.x = Math.PI / 2 - .5;
                mk(T, KG.box(.2, .09, .05, .03), VM(0x7a58c8, .75), 0, .1, .205).rotation.x = -.1;
                [-1, 1].forEach(s => tubeBetween(T, [[s * .05, .58, .19], [s * .055, .45, .225], [s * .05, .34, .232]], .0085, white));
                const skG = joint(T, 0, 0, 0), sk = new THREE.Mesh(new THREE.CylinderGeometry(.2, .31, .2, 22, 1, true), new THREE.MeshStandardMaterial({ color: 0x2e3a6b, roughness: .8, flatShading: true, side: THREE.DoubleSide })); sk.position.y = -.1; sk.scale.z = .9; sk.castShadow = true; skG.add(sk);
                addSpring(C, skG, { ax: 'z', gY: .015, gF: .02, k: 50, d: 5, max: .25 });
                const tote = joint(T, -.255, .05, .04); tote.rotation.z = .08;
                const tex = CAN(256, 256, (g, w, h) => { g.fillStyle = '#f7f0df'; g.fillRect(0, 0, w, h); const cs = ['#8d6bd6', '#f0507a', '#2fb5a5', '#f2a93b', '#4a7fd0']; for (let i = 0; i < 16; i++) { g.fillStyle = cs[i % 5]; g.beginPath(); g.arc(30 + (i * 53) % 210, 40 + (i * 71) % 190, 10 + i % 4 * 6, 0, 7); g.fill(); } g.strokeStyle = '#2e3a6b'; g.lineWidth = 6; g.beginPath(); g.moveTo(40, 190); g.bezierCurveTo(90, 120, 150, 230, 215, 110); g.stroke(); });
                const bag = joint(tote, 0, .1, 0); mk(bag, KG.box(.2, .23, .07, .03), new THREE.MeshStandardMaterial({ map: tex, roughness: .85 }), 0, -.12, 0);
                addSpring(C, bag, { ax: 'z', gY: .03, gF: .02, k: 45, d: 4.5, max: .4 });
                tubeBetween(T, [[-.17, .58, .01], [-.24, .38, .04], [-.2, .12, .05]], .012, VM(0xe8dcc0, .8));
            }
        });
        hairCap(head, hairM);
        const open = 1.0, cur = mk(head, new THREE.SphereGeometry(.345, 40, 24, Math.PI / 2 + open, Math.PI * 2 - open * 2, Math.PI * .4, Math.PI * .42), hairM, 0, -.01, -.02); cur.scale.set(1.09, 1.0, 1.07); cur.material.side = THREE.DoubleSide;
        fringe(head, hairM, 9, .15, 1.15, 1.45);
        const tip = mk(head, new THREE.SphereGeometry(.349, 40, 8, Math.PI / 2 + open, Math.PI * 2 - open * 2, Math.PI * .74, Math.PI * .08), VM(0x35c6c0, .5), 0, -.01, -.02); tip.scale.set(1.09, 1.0, 1.07); tip.material.side = THREE.DoubleSide;
        [1, -1].forEach(s => { const r = mk(head, new THREE.TorusGeometry(.075, .0072, 8, 28), gold, s * .118, -.033, .285); r.rotation.y = s * .3; mk(head, KG.cyl(.004, .004, .2, 6), gold, s * .3, -.03, .17).rotation.x = Math.PI / 2; });
        mk(head, KG.cyl(.005, .005, .05, 6), gold, 0, -.027, .298).rotation.z = Math.PI / 2;
        const hold = joint(C.hands[1], 0, -.07, .05); hold.rotation.set(-.3, .2, .0);
        mk(hold, KG.box(.13, .17, .024, .01), VM(0xf4ead2, .8), 0, 0, 0); mk(hold, KG.box(.135, .175, .008, .006), VM(0x2fb5a5, .6), 0, 0, -.016);
        for (let i = 0; i < 6; i++) mk(hold, new THREE.TorusGeometry(.008, .0025, 6, 10), VM(0x333, .4), -.068, .06 - i * .024, 0);
        C.holdProp = hold;
    }

    function buildTraveler(C, head, skinM) {
        const green = VM(0x2f8f5b, .6), orange = VM(0xf59e0b, .5), hairM = VM(0x2b1f18, .5), cargo = VM(0x5d6150, .7), boot = VM(0x7a4a2a, .65);
        C.hairM = hairM;
        buildSkeleton(C, {
            skinM, hipY: .66, torsoH: .62, neckTop: .66, shoulderX: .215, armLen: .64, legTop: .085, legBot: .1, pantM: cargo, shoeM: boot, soleM: VM(0x2a2a2a, .8), bootCuff: true, toeM: VM(0x5d3a20, .65),
            sleeve: { mat: green, r0: .057, r1: .053, cuff: orange },
            legExtra: (th, s, T) => { mk(th, KG.box(.05, .12, .085, .02), VM(0x4d5142, .7), s * .095, -T * .8, .0); },
            torso: T => {
                kLathe(T, [[.0, .0], [.17, .0], [.18, .12], [.175, .3], [.205, .46], [.18, .57], [.1, .64], [0, .66]], green, 0, .86);
                const st = mk(T, new THREE.TorusGeometry(.19, .016, 8, 36), orange, 0, .34, 0); st.rotation.x = Math.PI / 2; st.scale.y = .86;
                mk(T, KG.cyl(.098, .112, .07, 22), green, 0, .66, 0); mk(T, KG.box(.012, .5, .01, .004), VM(0xf1f1f1, .4), 0, .31, .165);
                const bp = joint(T, 0, .34, -.2);
                const pack = joint(bp, 0, 0, 0);
                mk(pack, KG.box(.36, .52, .2, .075), VM(0x276b4a, .7), 0, 0, 0); mk(pack, KG.box(.26, .2, .09, .04), orange, 0, -.02, -.13); mk(pack, KG.box(.3, .1, .16, .05), VM(0x276b4a, .7), 0, .3, .0);
                mk(pack, KG.cyl(.06, .06, .34, 20), VM(0xe8dcc0, .8), 0, -.31, 0).rotation.z = Math.PI / 2;
                mk(pack, KG.cyl(.04, .04, .16, 16), VM(0x2fb5c8, .4, { clearcoat: .8 }), -.22, -.1, -.0); mk(pack, KG.cyl(.042, .042, .03, 16), VM(0x1d1f26, .5), -.22, -.02, 0);
                [-1, 1].forEach(s => tubeBetween(T, [[s * .1, .6, -.1], [s * .15, .52, .08], [s * .15, .3, .15], [s * .13, .12, .02]], .017, VM(0x1f4d38, .7)));
                addSpring(C, pack, { gY: .018, gF: .03, k: 40, d: 4.5, max: .3 });
            }
        });
        hairCap(head, hairM); fringe(head, hairM, 6, .11, 1, 1.0);
        const capM = VM(0x2f7d4f, .7), cap = joint(head, 0, .05, -.005);
        const dome = mk(cap, new THREE.SphereGeometry(.335, 36, 24, 0, Math.PI * 2, 0, Math.PI * .57), capM, 0, .0, 0); dome.scale.set(1.07, 1.02, 1.07); dome.rotation.x = -.06;
        mk(cap, KG.sph(.045, 12, 8), orange, 0, .345, -.04);
        const brim = mk(cap, KG.sph(.26, 24, 12), capM, 0, .02, .29); brim.scale.set(1.05, .11, .85); brim.rotation.x = .14;
        addSpring(C, cap, { gY: .02, gF: .008, gW: .2, k: 70, d: 7, max: .2 });
    }

    function buildStreet(C, head, skinM) {
        const black = VM(0x24272f, .55), orange = VM(0xff7a1a, .5), tee = VM(0xf7f3ea, .65), hairM = VM(0x18120f, .45), baggy = VM(0x8a8e96, .7), white = VM(0xf4f4f4, .5);
        C.hairM = hairM;
        buildSkeleton(C, {
            skinM, hipY: .6, torsoH: .6, neckTop: .62, shoulderX: .21, armLen: .6, legTop: .1, legBot: .15, pantM: baggy, cuffM: VM(0x6d717a, .7), shoeM: white, soleM: orange, toeM: VM(0xffa24d, .5),
            sleeve: { mat: black, r0: .065, r1: .06, cuff: orange, stripe: orange },
            torso: T => {
                const gt = CAN(256, 256, (g, w, h) => { g.fillStyle = '#f7f3ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff7a1a'; g.beginPath(); g.arc(128, 128, 78, 0, 7); g.fill(); g.fillStyle = '#24272f'; g.font = '900 64px Arial'; g.textAlign = 'center'; g.fillText('GO', 128, 150); g.strokeStyle = '#24272f'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 78, 0, 7); g.stroke(); });
                kLathe(T, [[.0, -.04], [.19, -.04], [.205, .12], [.2, .3], [.215, .45], [.18, .56], [.092, .62], [0, .64]], tee, 0, .84);
                const gp = mk(T, new THREE.CircleGeometry(.1, 28), new THREE.MeshStandardMaterial({ map: gt, roughness: .8 }), 0, .32, .0); gp.position.z = .205 * .84 + .004;
                kLathe(T, [[.0, -.02], [.215, -.02], [.23, .12], [.222, .3], [.232, .46], [.2, .57], [.105, .63], [0, .65]], black, 0, .86, .62, Math.PI * 2 - 1.24);
                const hem = mk(T, new THREE.TorusGeometry(.21, .018, 8, 36), orange, 0, -.015, 0); hem.rotation.x = Math.PI / 2; hem.scale.y = .86;
                const col = mk(T, new THREE.TorusGeometry(.1, .028, 10, 24), black, 0, .61, 0); col.rotation.x = Math.PI / 2;
                const hp = mk(T, new THREE.TorusGeometry(.12, .026, 12, 32), orange, 0, .66, .03); hp.rotation.x = Math.PI / 2 - .3;
                [1, -1].forEach(s => { mk(T, KG.cyl(.056, .056, .045, 20), VM(0x20222a, .4), s * .12, .56, .1).rotation.z = Math.PI / 2; mk(T, KG.cyl(.044, .044, .02, 20), orange, s * .15, .56, .1).rotation.z = Math.PI / 2; });
                const bp = joint(T, 0, .36, -.18); mk(bp, KG.box(.22, .26, .1, .045), black, 0, 0, 0); mk(bp, KG.box(.16, .07, .02, .01), orange, 0, .02, -.055);
                [-1, 1].forEach(s => tubeBetween(T, [[s * .095, .6, -.1], [s * .13, .5, .1], [s * .13, .26, .13]], .014, black));
                addSpring(C, bp, { gY: .02, gF: .03, k: 45, d: 4.5, max: .3 });
            }
        });
        hairCap(head, hairM); const q = mk(head, KG.sph(.17, 18, 12), hairM, .04, .27, .09); q.scale.set(1.45, .72, 1.1); q.rotation.z = -.2;
        fringe(head, hairM, 5, .15, 1.1, 1.1); [1, -1].forEach(s => mk(head, KG.sph(.07, 14, 10), hairM, s * .275, .0, .03).scale.set(.55, 1.4, .8));
        const sb = joint(head, 0, .115, 0); sb.rotation.set(-.12, 0, .06);
        const capM = VM(0x20232b, .6), dm = mk(sb, new THREE.SphereGeometry(.335, 36, 24, 0, Math.PI * 2, 0, Math.PI * .46), capM, 0, 0, 0); dm.scale.set(1.07, 1.05, 1.07);
        const br = mk(sb, KG.cyl(.25, .25, .03, 28, 1), orange, 0, -.015, .27); br.scale.set(1.05, 1, .85); br.rotation.x = -.1; mk(sb, KG.sph(.05, 12, 8), orange, 0, .33, -.02);
        addSpring(C, sb, { gY: .02, gF: .008, gW: .2, k: 70, d: 7, max: .2, base: -.12 });
    }

    /* ---------- cấu hình nhân vật (thêm nhân vật = thêm mục ở đây) ---------- */
    // idle: các cử chỉ riêng chạy ngẫu nhiên khi đứng chờ · grip: kiểu cầm vật · rest: tư thế đứng nghỉ của tay
    const CHARACTER_CONFIGS = {
        AO_NGU_THAN: { kind: 'photographer', skin: SKINS.photographer, eye: 0x2a1a14, build: buildPhotographer, idle: ['camera', 'hat', 'look'], grip: [null, null], rest: { sRZ: .22, sLZ: .22 }, arrive: ['photo', 'thumbs', 'point'] },
        AO_NHAT_BINH: { kind: 'vlogger', skin: SKINS.vlogger, eye: 0x2a1a14, build: buildVlogger, idle: ['selfie', 'wave', 'look'], grip: ['grip', null], rest: { sRX: -.85, eR: -.55, wRX: -.2, sRZ: .12, sLZ: .2 }, arrive: ['selfie', 'point', 'thumbs'] },
        AO_BA_BA: { kind: 'traveler', skin: SKINS.traveler, eye: 0x2a1a14, build: buildTraveler, idle: ['strap', 'lookfar', 'look'], grip: [null, null], rest: { sRZ: .22, sLZ: .22 }, arrive: ['point', 'thumbs', 'photo'] },
        AO_TU_THAN: { kind: 'artist', skin: SKINS.artist, eye: 0x3a2418, build: buildArtist, idle: ['hair', 'sketch', 'look'], grip: [null, 'grip'], rest: { sLX: -.7, eL: -1.05, sRZ: .2, sLZ: .1 }, arrive: ['photo', 'thumbs', 'point'] },
        AO_GIAO_LINH: { kind: 'street', skin: SKINS.street, eye: 0x2a1a14, build: buildStreet, idle: ['music', 'look', 'strap'], grip: [null, null], rest: { sRZ: .2, sLZ: .2, eR: -.2, eL: -.2 }, arrive: ['thumbs', 'photo', 'point'] }
    };

    /* ---------- các kênh khớp ---------- */
    const KN = ['hipsY', 'hipsRX', 'hipsRY', 'hipsRZ', 'spRX', 'spRY', 'spRZ', 'hdRX', 'hdRY', 'hdRZ',
        'sRX', 'sRZ', 'eR', 'wRX', 'wRZ', 'sLX', 'sLZ', 'eL', 'wLX', 'wLZ',
        'tRX', 'tRZ', 'kR', 'aR', 'tLX', 'tLZ', 'kL', 'aL', 'sqY', 'sqXZ'];
    const KI = {}; KN.forEach((n, i) => KI[n] = i);
    const NK = KN.length;
    const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
    const envp = p => sm(p / .2) * sm((1 - p) / .2);                 // vào – giữ – ra

    /* ---------- lắp ráp một nhân vật từ cấu hình ---------- */
    function createCharacter(config, player, opts) {
        opts = opts || {};
        const group = new THREE.Group(), fig = new THREE.Group();
        group.add(fig); group.userData.figure = fig; group.userData.faceY = 0;
        const FEET = -.495; fig.position.y = FEET;
        const C = { player, group, fig, cfg: config, sec: [], ph: player.id * 1.7, last: null, lastVy: 0, vy: 0, hop: null, act: null, gest: null, nextG: 2 + Math.random() * 3, stepSide: 1, wave: 0, sad: 0, cheer: 0, tired: 0, blink: 2 + Math.random() * 3, cash: player.cash, lastT: 0, expr: null, lookYaw: 0, arrivals: 0, actCool: 0, FEET };
        const sk = config.skin, skinM = VM(sk[0], .55, { clearcoat: .3 }), spec = { eye: config.eye, skinDeep: sk[1] };
        const head = C.head = new THREE.Group();
        config.build(C, head, skinM);
        buildHeadAndFace(C, spec, skinM, C.hairM, head);
        setExpr(C, 'smile');
        mergeStaticMeshes2(C.body);
        // giá trị nghỉ của các kênh (tay đang cầm đồ có tư thế riêng)
        C.rest = new Float32Array(NK); Object.keys(config.rest || {}).forEach(k => { C.rest[KI[k]] = config.rest[k]; });
        C.cur = C.rest.slice(); C.tgt = C.rest.slice(); C.handNames = [config.grip[0] || 'relaxed', config.grip[1] || 'relaxed'];
        C.handCur = [HAND_POSES.relaxed.slice(), HAND_POSES.relaxed.slice()];
        C.baseHipsY = C.hips.position.y;
        // vòng màu người chơi, ngọc báo lượt, bóng mềm, nhãn tên, vùng bắt chuột
        const ring = mk(group, KG.cyl(.36, .4, .035, 36), new THREE.MeshStandardMaterial({ color: player.hex, emissive: player.hex, emissiveIntensity: .45, roughness: .4 }), 0, FEET + .018, 0); ring.castShadow = false; ring.receiveShadow = true;
        mk(group, new THREE.TorusGeometry(.38, .018, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, FEET + .036, 0).rotation.x = Math.PI / 2;
        const shadow = new THREE.Mesh(new THREE.CircleGeometry(.62, 28), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: .55 }));
        shadow.rotation.x = -Math.PI / 2; shadow.position.y = FEET + .042; shadow.renderOrder = 2; group.add(shadow);
        const gem = mk(group, new THREE.OctahedronGeometry(.11, 0), new THREE.MeshStandardMaterial({ color: player.hex, emissive: player.hex, emissiveIntensity: .7, roughness: .25 }), 0, FEET + 2.2, 0); gem.scale.y = 1.5; gem.visible = false;
        const hit = mk(group, new THREE.CylinderGeometry(.42, .42, 2.1, 10), new THREE.MeshBasicMaterial({ visible: false }), 0, FEET + 1.0, 0); hit.castShadow = false;
        C.ring = ring; C.gem = gem; C.hit = hit; C.shadow = shadow;
        if (!opts.noTag && typeof create3DTextSprite === 'function') {
            try { const tag = create3DTextSprite(player.shortName, player.color, '#ffffff', true); tag.position.set(0, FEET + 2.5 + (player.id % 2) * .3, 0); C.tagY = FEET + 2.5 + (player.id % 2) * .3; tag.scale.set(1.15, .29, 1); group.add(tag); C.tag = tag; } catch (e) { }
        }
        group.scale.setScalar(.64);
        group.userData.chibi = C; hit.userData.chibi = C;
        if (!opts.noRegister) {
            for (let i = CHIBI.length - 1; i >= 0; i--) if (!CHIBI[i].group.parent || CHIBI[i].player.id === player.id) CHIBI.splice(i, 1);
            CHIBI.push(C);
        }
        return group;
    }
    let _shTex = null;
    function shadowTex() {
        if (_shTex) return _shTex;
        _shTex = CAN(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(30,18,8,.85)'); gr.addColorStop(.55, 'rgba(30,18,8,.4)'); gr.addColorStop(1, 'rgba(30,18,8,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
        return _shTex;
    }
    createVietnameseCostumePawn3D = function (player) { return createCharacter(CHARACTER_CONFIGS[player.costumeKey] || CHARACTER_CONFIGS.AO_NGU_THAN, player); };
    window.createCharacter = createCharacter; window.CHARACTER_CONFIGS = CHARACTER_CONFIGS;

    /* ---------- thư viện cử chỉ & hành động ---------- */
    // mỗi hàm ghi tư thế ĐÍCH tuyệt đối vào P (các kênh khác giữ nguyên) và có thể đặt kiểu bàn tay H.R / H.L
    const setP = (P, o) => { for (const k in o) P[KI[k]] = o[k]; };
    const GESTURES = {
        camera: (P, e, H) => { setP(P, { sRX: -.95 * e, eR: -1.55 * e, sLX: -.95 * e, eL: -1.55 * e, hdRZ: .07 * e, hdRX: -.06 * e, spRX: -.04 * e }); H.R = H.L = 'grip'; },
        hat: (P, e, H, now) => { setP(P, { sRX: -2.3 * e, sRZ: .3 * e, eR: -1.2 * e, hdRX: .08 * e, hdRZ: -.05 * e }); H.R = 'open'; },
        look: (P, e, H, now, p) => { setP(P, { hdRY: Math.sin(p * Math.PI * 2) * .85 * e, hdRZ: .05 * e, spRY: Math.sin(p * Math.PI * 2) * .18 * e }); },
        lookfar: (P, e, H, now, p) => { setP(P, { sRX: -1.5 * e, eR: -1.9 * e, hdRY: Math.sin(p * Math.PI * 2) * .7 * e, hdRX: -.08 * e, spRY: Math.sin(p * Math.PI * 2) * .15 * e }); H.R = 'open'; },
        strap: (P, e, H) => { setP(P, { sRX: -.3 * e, sRZ: .8 * e, eR: -2.25 * e, spRX: -.03 * e, hdRZ: .06 * e }); H.R = 'fist'; },
        selfie: (P, e, H, now) => { setP(P, { sRX: -1.25 * e, eR: -.4 * e, hdRZ: .14 * e, hdRX: -.05 * e, spRZ: -.05 * e, sLX: -1.9 * e, eL: -1.5 * e, sLZ: .3 * e }); H.R = 'grip'; H.L = 'V'; },
        wave: (P, e, H, now) => { setP(P, { sLZ: (2.3 + Math.sin(now * 13) * .4) * e, sLX: -.2 * e, eL: -.3 * e, hdRZ: -.1 * e }); H.L = 'open'; },
        hair: (P, e, H, now) => { setP(P, { sLX: -1.95 * e, sLZ: -.4 * e, eL: -1.75 * e, hdRZ: .12 * e, hdRY: -.15 * e }); H.L = 'open'; },
        sketch: (P, e, H, now) => { setP(P, { sRX: -.9 * e, eR: -1.6 * e, sLX: -1.0 * e - .0, eL: -1.4 * e, hdRX: .22 * e, wRX: Math.sin(now * 14) * .18 * e, spRX: .08 * e }); H.R = 'grip'; },
        music: (P, e, H, now) => { const b = Math.sin(now * 7); setP(P, { hdRX: b * .13 * e, hipsY: Math.abs(b) * .03 * e, sRX: (-.4 + b * .12) * e, eR: -1.0 * e, sLX: (-.4 - b * .12) * e, eL: -1.0 * e, kR: .25 * Math.abs(b) * e, kL: .25 * Math.abs(b) * e, hdRZ: b * .06 * e }); H.R = H.L = 'fist'; }
    };
    // hành động một lần: p ∈ [0,1] tiến độ, v biến thể
    const ACTS = {
        roll: (P, p, H, C, now) => {
            const wind = sm(p / .28), thr = sm((p - .28) / .16), rel = sm((p - .55) / .35);
            setP(P, { sRX: .85 * wind - 2.6 * thr + 1.9 * rel, eR: -.7 * wind + .55 * thr + .15 * rel, spRX: .08 * wind - .2 * thr + .12 * rel, spRY: -.25 * wind + .5 * thr - .25 * rel, hipsY: -.06 * wind * (1 - thr), kR: .3 * wind * (1 - thr), kL: .3 * wind * (1 - thr), sLX: -.9 * thr * (1 - rel), eL: -.5 * thr * (1 - rel), sLZ: .5 * thr * (1 - rel), hdRY: C.lookYaw * sm((p - .1) / .2) });
            H.R = p < .3 ? 'grip' : 'open'; H.L = 'open';
        },
        win: (P, p, H, C, now, v) => {
            const up = p < .45 ? Math.sin(Math.min(1, p / .4) * Math.PI) : 0, e = envp(p);
            if (v === 0) { setP(P, { hipsY: up * .24, sRX: -2.7 * e, sRZ: .35 * e, eR: -.5 * e, sLZ: .5 * e, hdRZ: .12 * e, kR: .5 * (1 - up), kL: .5 * (1 - up), spRX: -.08 * e }); H.R = 'V'; H.L = 'open'; }
            else if (v === 1) { setP(P, { hipsY: up * .12, sRX: -1.3 * e, eR: -.4 * e, hdRZ: .16 * e, spRZ: -.06 * e, sLX: -2.05 * e, eL: -1.4 * e, sLZ: .25 * e }); H.R = 'grip'; H.L = 'V'; }
            else { const j = Math.abs(Math.sin(p * Math.PI * 2.2)) * .2 * e; setP(P, { hipsY: j, sRX: -2.9 * e, sRZ: .45 * e, sLX: -2.9 * e, sLZ: .45 * e, eR: -.3 * e, eL: -.3 * e, hdRX: -.12 * e, spRX: -.1 * e, hipsRY: C.spinWin ? p * Math.PI * 2 : 0 }); H.R = H.L = 'open'; }
        },
        lose: (P, p, H, C, now, v) => {
            const e = envp(p), tt = sm(p / .25);
            if (v === 0) { setP(P, { sRX: -2.5 * e, eR: -2.0 * e, sLX: -2.5 * e, eL: -2.0 * e, sRZ: -.2 * e, sLZ: -.2 * e, hdRX: .38 * e, spRX: .2 * e, kR: .3 * e, kL: .3 * e, hipsY: -.05 * e, hdRZ: Math.sin(now * 9) * .05 * e }); H.R = H.L = 'fist'; }
            else { const chest = sm(p / .3) * (1 - sm((p - .3) / .1)); setP(P, { spRX: -.08 * chest + .3 * sm((p - .32) / .2) * (1 - sm((p - .85) / .15)), hdRX: .42 * sm((p - .3) / .25) * (1 - sm((p - .85) / .15)), sRX: .15 * e, sLX: .15 * e, sRZ: -.12 * e, sLZ: -.12 * e, hipsY: -.05 * sm((p - .3) / .2) * (1 - sm((p - .85) / .15)), kR: .25 * e, kL: .25 * e }); H.R = H.L = 'relaxed'; }
        },
        arrive: (P, p, H, C, now, v) => {
            const e = envp(p), cfg = C.cfg.arrive[v % 3];
            if (cfg === 'point') { setP(P, { sRX: -1.45 * e, sRZ: .15 * e, eR: -.1 * e, hdRX: -.05 * e, hdRY: .35 * Math.sin(p * Math.PI) * e, spRY: .2 * e, hipsY: Math.abs(Math.sin(p * 6)) * .03 * e }); H.R = 'point'; }
            else if (cfg === 'photo') { setP(P, { sRX: -1.0 * e, eR: -1.75 * e, sLX: -1.0 * e, eL: -1.75 * e, hdRX: -.05 * e, spRX: -.05 * e, hdRY: Math.sin(p * Math.PI * 2) * .3 * e }); H.R = H.L = 'grip'; }
            else if (cfg === 'selfie') { setP(P, { sRX: -1.25 * e, eR: -.4 * e, hdRZ: .14 * e, sLX: -1.9 * e, eL: -1.5 * e }); H.R = 'grip'; H.L = 'V'; }
            else { setP(P, { sRX: -1.25 * e, eR: -1.05 * e, sRZ: .2 * e, hdRX: Math.sin(p * 12) * .1 * e, hipsY: Math.abs(Math.sin(p * 5)) * .04 * e }); H.R = 'thumbs'; }
        }
    };
    const ACT_DUR = { roll: 1.9, win: 2.0, lose: 2.2, arrive: 2.2 };
    function startAct(C, name, v) { if (!C || C.hop) return; C.act = { name, t: 0, dur: ACT_DUR[name] || 2, v: v === undefined ? Math.floor(Math.random() * 3) : v }; C.gest = null; C.actCool = name === 'win' || name === 'lose' ? .8 : 0; }
    const chibiOf = p => { const pw = p && playerPawns[p.id]; return pw && pw.userData.chibi; };

    /* ---------- vòng lặp animation ---------- */
    const _faceTmp = new THREE.Vector3();
    function chibiUpdate() {
        const now = performance.now() / 1000, spd = Math.max(.4, Math.min(3, gameState.speedMultiplier || 1));
        CHIBI.forEach(C => {
            const g = C.group; if (!g.parent || !g.visible) return;
            const dt = Math.min(.08, Math.max(0, now - (C.lastT || now))); C.lastT = now; if (!dt) return;
            const p = C.player, tile = BOARD_TILES[p.position], rest = tile ? tile.elevation + .45 : g.position.y, fy = (g.userData.faceY || 0);
            const air = Math.max(0, g.position.y - rest);
            const vx = C.last ? (g.position.x - C.last.x) / dt : 0, vz = C.last ? (g.position.z - C.last.z) / dt : 0, vyW = C.last ? (g.position.y - C.last.y) / dt : 0;
            C.last = { x: g.position.x, y: g.position.y, z: g.position.z };
            const vf = vx * Math.sin(fy) + vz * Math.cos(fy), accY = (vyW - C.lastVy) / dt; C.lastVy = vyW;
            // phản ứng với thay đổi tiền
            if (p.cash !== C.cash) { if (C.actCool <= 0 && !C.hop) { if (p.cash > C.cash) { startAct(C, 'win'); chibiPop(C, '💰'); } else startAct(C, 'lose'); } C.cash = p.cash; }
            C.actCool = Math.max(0, C.actCool - dt); C.wave = Math.max(0, C.wave - dt * 1.1); C.cheer = Math.max(0, C.cheer - dt * 1.1);
            const turn = gameState.currentPlayerIdx === p.id && !gameState.gameEnded, t = now + C.ph, ts = dt * spd;
            const tired = !turn && p.cash > 0 && p.cash < 70;
            const P = C.tgt; P.set(C.rest); const H = { R: C.handNames[0], L: C.handNames[1] }; let rate = 11 * Math.min(spd, 2.2), want = 'smile';

            // ---- nền idle: thở, đung đưa theo nhịp, nghiêng đầu ----
            const br = Math.sin(t * 2.1), sway = Math.sin(t * .9);
            P[KI.spRX] += br * .014 - .02; P[KI.hipsRZ] += sway * .02; P[KI.spRZ] -= sway * .012; P[KI.hdRZ] += Math.sin(t * .7) * .05; P[KI.hdRY] += Math.sin(t * .43) * .09; P[KI.hdRX] += Math.sin(t * .9) * .025;
            P[KI.sRX] += Math.sin(t * 1.3) * .035; P[KI.sLX] += Math.sin(t * 1.3 + 2) * .035; P[KI.sRZ] += br * .02; P[KI.sLZ] += br * .02;
            if (tired) { P[KI.spRX] += .08; P[KI.hdRX] += .22; P[KI.sRZ] -= .06; P[KI.sLZ] -= .06; want = 'tired'; }
            if (turn) { const b = Math.abs(Math.sin(t * 3.2)); P[KI.hipsY] += b * .05; P[KI.kR] += b * .28; P[KI.kL] += b * .28; P[KI.tRX] -= b * .14; P[KI.tLX] -= b * .14; P[KI.sRX] -= b * .1; P[KI.sLX] -= b * .1; want = 'confident'; }

            // ---- chọn trạng thái: nhảy ô > hành động > hover > cử chỉ idle ----
            if (C.hop) {
                const ph = C.hop.phase, side = C.stepSide;
                rate = 26 * Math.min(spd, 2.5); want = 'surprised';
                if (ph === 'crouch') setP(P, { hipsY: -.13, kR: 1.3, kL: 1.3, tRX: -.8, tLX: -.8, aR: -.4, aL: -.4, spRX: .22, hdRX: .12, sRX: .75, sLX: .75, eR: -.4, eL: -.4, sqY: -.1, sqXZ: .07 });
                else if (ph === 'fly') {
                    const sw = Math.sin(performance.now() / 1000 * 22) * 0;   // sải chân đối nhịp theo bước
                    setP(P, { hipsY: .05, tRX: side * -.85 - .1, tLX: side * .85 - .1, kR: side > 0 ? .25 : 1.0, kL: side > 0 ? 1.0 : .25, aR: .3, aL: .3, spRX: -.14, hdRX: -.14, sRX: side * .9, sLX: -side * .9, sRZ: .3, sLZ: .3, eR: -.5, eL: -.5, sqY: .1, sqXZ: -.05, spRY: side * .15 });
                } else setP(P, { hipsY: -.17, kR: 1.5, kL: 1.5, tRX: -.95, tLX: -.95, aR: -.5, aL: -.5, spRX: .3, hdRX: .2, sRX: .5, sLX: .5, sRZ: .35, sLZ: .35, sqY: -.17, sqXZ: .1 });
            } else if (C.act) {
                const A = C.act; A.t += ts; if (C.freeze !== undefined) A.t = C.freeze * A.dur; const pr = A.t / A.dur;
                if (pr >= 1) C.act = null; else {
                    if (A.name === 'roll' && typeof diceMesh !== 'undefined' && diceMesh) { const dx = diceMesh.position.x - g.position.x, dz = diceMesh.position.z - g.position.z; const a = Math.atan2(dx, dz) - fy; C.lookYaw = Math.max(-1, Math.min(1, Math.atan2(Math.sin(a), Math.cos(a)))); }
                    ACTS[A.name](P, pr, H, C, now, A.v);
                    want = A.name === 'win' ? 'happy' : A.name === 'lose' ? 'sad' : A.name === 'arrive' ? (pr < .2 ? 'surprised' : 'smile') : turn ? 'confident' : 'smile';
                    if (A.name === 'win' && pr < .45) { const up = Math.sin(Math.min(1, pr / .4) * Math.PI); P[KI.sqY] = up > .8 ? .08 : 0; }
                    if (pr > .42 && pr < .5 && A.name === 'win') { P[KI.sqY] = -.1; P[KI.sqXZ] = .06; }
                }
            } else if (C.wave > 0) {
                setP(P, { sLZ: 2.5 + Math.sin(now * 14) * .45, sLX: -.2, eL: -.3, hdRZ: .12 }); H.L = 'open'; want = 'smile';
                const a = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z) - fy; P[KI.hdRY] = Math.max(-.8, Math.min(.8, Math.atan2(Math.sin(a), Math.cos(a))));
            } else if (!tired) {
                // cử chỉ idle riêng của từng nhân vật
                if (C.gest) { C.gest.t += ts; if (C.freeze !== undefined) C.gest.t = C.freeze * C.gest.dur; const pr = C.gest.t / C.gest.dur; if (pr >= 1) { C.gest = null; C.nextG = 3.5 + Math.random() * 4; } else GESTURES[C.gest.name](P, envp(pr), H, now, pr); }
                else { C.nextG -= ts; if (C.nextG <= 0) { const list = C.cfg.idle; C.gest = { name: list[Math.floor(Math.random() * list.length)], t: 0, dur: 1.9 + Math.random() * .9 }; } }
            }
            // nhấn mạnh: được bấm vào / ăn mừng chạm chuột (cheer): nhảy xoay
            if (C.cheer > 0 && !C.hop && !C.act) { const cp = 1 - C.cheer / (C.cheer0 || 1); P[KI.hipsY] += Math.sin(cp * Math.PI) * .45; P[KI.sRX] = P[KI.sLX] = -2.8; P[KI.sRZ] = P[KI.sLZ] = .4; if (C.spin) P[KI.hipsRY] = cp * Math.PI * 2; want = 'happy'; H.R = H.L = 'open'; }
            setExpr(C, want);

            // ---- làm mượt tới tư thế đích (crossfade) rồi áp lên khớp ----
            const k = 1 - Math.exp(-rate * dt), cu = C.cur;
            for (let i = 0; i < NK; i++) cu[i] += (P[i] - cu[i]) * k;
            applyPose(C, cu);
            [H.R, H.L].forEach((nm, i) => { const tg = HAND_POSES[nm] || HAND_POSES.relaxed, hc = C.handCur[i]; for (let j = 0; j < 5; j++) hc[j] += (tg[j] - hc[j]) * (1 - Math.exp(-16 * dt)); applyHand(C.hands[i], hc); });

            // ---- mắt: chớp ngẫu nhiên + hình theo biểu cảm; miệng/lông mày theo setExpr ----
            C.blink -= dt; const bk = C.blink < .12 ? .1 : 1; if (C.blink < 0) C.blink = 2.2 + Math.random() * 3.5;
            C.eyes.forEach(E => { E.scale.set(want === 'surprised' ? 1.1 : 1, Math.max(.08, (C.exprEye || 1) * bk), 1); });

            // ---- chuyển động thứ cấp: lò xo theo vận tốc ----
            const wy = cu[KI.hdRY] - (C._lastHY || 0); C._lastHY = cu[KI.hdRY]; const yawRate = wy / dt;
            for (let i = 0; i < C.sec.length; i++) {
                const s = C.sec[i], tgt = -(s.gF * vf + s.gY * (vyW + accY * .02) + s.gW * yawRate * .3) + s.base * 0;
                const acc = s.k * (Math.max(-s.max, Math.min(s.max, tgt)) - s.a) - s.d * s.v; s.v += acc * dt; s.a += s.v * dt;
                const o = s.obj; if (s.ax === 'x') o.rotation.x = s.base + s.a; else o.rotation.z = s.a;
            }

            // ---- bóng mềm, vòng sáng, ngọc báo lượt, nhãn tên ----
            const lift = Math.min(1, air / 1.2) + Math.max(0, cu[KI.hipsY]) * 1.2;
            C.shadow.scale.setScalar(Math.max(.5, 1 - lift * .5)); C.shadow.material.opacity = Math.max(.15, .55 - lift * .4);
            C.gem.visible = turn; if (turn) { C.gem.rotation.y = now * 2.4; C.gem.position.y = C.FEET + 2.2 + Math.sin(now * 3) * .06; }
            C.ring.material.emissiveIntensity = turn ? .55 + Math.sin(now * 5) * .3 : .35;
            if (C.tag) C.tag.position.y = C.tagY + (turn ? .12 : 0);
        });
    }
    function applyPose(C, P) {
        C.hips.position.y = C.baseHipsY + P[0]; C.hips.rotation.set(P[1], P[2], P[3]);
        C.spine.rotation.set(P[4], P[5], P[6]); C.head.rotation.set(P[7], P[8], P[9]);
        C.shoulder[0].rotation.set(P[10], 0, P[11]); C.elbow[0].rotation.x = P[12]; C.wrist[0].rotation.set(P[13], 0, P[14]);
        C.shoulder[1].rotation.set(P[15], 0, -P[16]); C.elbow[1].rotation.x = P[17]; C.wrist[1].rotation.set(P[18], 0, -P[19]);
        C.thigh[0].rotation.set(P[20], 0, P[21]); C.knee[0].rotation.x = P[22]; C.ankle[0].rotation.x = P[23];
        C.thigh[1].rotation.set(P[24], 0, -P[25]); C.knee[1].rotation.x = P[26]; C.ankle[1].rotation.x = P[27];
        C.body.scale.set(1 + P[29], 1 + P[28], 1 + P[29]);
    }
    _mapAnim.push(chibiUpdate);

    /* ---------- nối vào luồng game ---------- */
    // Bước giữa các ô: khụy → bật (chân/tay đối nhịp) → đáp có squash & stretch. Thời lượng chia theo nút tốc độ.
    hopTween = function (pawn, targetTile, off, spd) {
        const ddx = targetTile.mapX + off.dx - pawn.position.x, ddz = targetTile.mapZ + off.dz - pawn.position.z;
        const cur = pawn.userData.faceY || 0, tgt = Math.atan2(ddx, ddz);
        const dl = ((tgt - cur + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
        gsap.to(pawn.userData, { faceY: cur + dl, duration: 0.15 / spd });
        const C = pawn.userData.chibi, T = .38 / spd, tc = T * .2, tf = T * .6, tl2 = T * .2, y0 = targetTile.elevation + .45;
        if (C) { C.stepSide *= -1; C.act = null; C.gest = null; }
        return new Promise(res => {
            const tl = gsap.timeline({ onComplete: () => { if (C) C.hop = null; res(); } });
            tl.call(() => { if (C) C.hop = { phase: 'crouch' }; }, null, 0)
                .call(() => { if (C) C.hop = { phase: 'fly' }; }, null, tc)
                .to(pawn.position, { x: targetTile.mapX + off.dx, z: targetTile.mapZ + off.dz, duration: tf, ease: 'power1.inOut' }, tc)
                .to(pawn.position, { y: y0 + .75, duration: tf * .5, ease: 'power2.out' }, tc)
                .to(pawn.position, { y: y0, duration: tf * .5, ease: 'power2.in' }, tc + tf * .5)
                .call(() => { if (C) C.hop = { phase: 'land' }; }, null, tc + tf)
                .to({}, { duration: tl2 }, tc + tf);
        });
    };
    // tung xúc xắc: nhân vật đang chơi vung tay, mắt nhìn theo xúc xắc
    const _diceK10 = animate3DDiceRoll;
    animate3DDiceRoll = function (v) { try { startAct(chibiOf(PLAYERS[gameState.currentPlayerIdx]), 'roll', 0); } catch (e) { } return _diceK10.apply(this, arguments); };
    // đầu tư / nâng sao: chủ ô nhảy mừng
    const _celebK10 = tileCelebrate;
    tileCelebrate = function (idx, hex) {
        try { const C = chibiOf(PLAYERS[gameState.propertyOwners[idx]]); if (C && !C.hop) { C.cheer = 0; startAct(C, 'win'); } } catch (e) { }
        return _celebK10.apply(this, arguments);
    };
    // đến ô làng nghề: tò mò, chỉ tay / chụp ảnh / giơ ngón cái
    const _moveK10 = movePawnSteps;
    movePawnSteps = async function (player, steps) {
        const r = await _moveK10.apply(this, arguments);
        try { const t = BOARD_TILES[player.position], C = chibiOf(player); if (C && t && t.type === 'PROPERTY') { C.arrivals++; startAct(C, 'arrive', (C.arrivals + player.id) % 3); } } catch (e) { }
        return r;
    };

    /* ---------- avatar giao diện: render từ chính mô hình 3D ---------- */
    const AV = { cache: {}, r: null };
    function avatarURL(costumeKey) {
        if (AV.cache[costumeKey]) return AV.cache[costumeKey];
        try {
            if (!AV.r) { AV.r = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); AV.r.setSize(128, 128); AV.r.setClearColor(0x000000, 0); AV.r.outputEncoding = renderer.outputEncoding; AV.r.toneMapping = renderer.toneMapping; AV.r.toneMappingExposure = renderer.toneMappingExposure; }
            const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xfff6e8, 0x9fb07a, .9)); const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(1.2, 2, 2.2); sc.add(dl);
            const cfg = CHARACTER_CONFIGS[costumeKey], pl = { id: 9, hex: 0xffffff, color: '#fff', shortName: '', cash: 300 };
            const ch = createCharacter(cfg, pl, { noRegister: true, noTag: true }); ch.scale.setScalar(1); sc.add(ch);
            const C = ch.userData.chibi; applyPose(C, C.rest); sc.updateMatrixWorld(true);
            const hp = new THREE.Vector3(); C.head.getWorldPosition(hp);
            const cam = new THREE.PerspectiveCamera(24, 1, .1, 20); cam.position.set(hp.x, hp.y + .02, hp.z + 3.1); cam.lookAt(hp.x, hp.y - .06, hp.z);
            AV.r.render(sc, cam); AV.cache[costumeKey] = AV.r.domElement.toDataURL('image/png');
            sc.traverse(o => { if (o.geometry) o.geometry.dispose && 0; });
        } catch (e) { console.warn('avatar', e); AV.cache[costumeKey] = ''; }
        return AV.cache[costumeKey];
    }
    // thay biểu tượng emoji của người chơi trong giao diện bằng ảnh nhân vật (theo bộ nhân vật người đó đang dùng)
    function applyAvatars(root) {
        if (!root || !root.querySelectorAll) return;
        const map = {}; PLAYERS.forEach(p => { map[p.avatar] = p; });
        root.querySelectorAll('div,span').forEach(el => {
            if (el.children.length || el.dataset.dkav) return; const tx = el.textContent.trim(), p = map[tx]; if (!p) return;
            const url = avatarURL(p.costumeKey); if (!url) return;
            el.dataset.dkav = '1'; el.textContent = ''; const im = document.createElement('img'); im.src = url; im.alt = p.shortName; im.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;transform:scale(1.15)';
            el.style.overflow = 'hidden'; el.appendChild(im);
        });
    }
    window.addEventListener('load', () => {
        setTimeout(() => {
            let busy = false; const run = () => { if (busy) return; busy = true; requestAnimationFrame(() => { busy = false; try { applyAvatars(document.body); } catch (e) { } }); };
            new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
            run();
        }, 600);
    });
    window.__dkChar = { freeze: (id, v) => { chibiOf(PLAYERS[id]).freeze = v; }, startAct: (id, name, v) => startAct(chibiOf(PLAYERS[id]), name, v), gesture: (id, name) => { const C = chibiOf(PLAYERS[id]); C.gest = { name, t: 0, dur: 2.4 }; }, chibiOf };   // tiện gỡ lỗi / thử cử chỉ từ console
