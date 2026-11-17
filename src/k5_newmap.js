    /* =================================================================================
     * K5. BẢN ĐỒ KIỂU MỚI (theo ảnh mẫu của nhóm)
     *    · Đất liền là một khối phẳng, vách kem, mặt trên chia mảng xanh non – vàng cát
     *    · Biển xanh sáng nằm trong lòng một vùng bờ đất có vách cát, cây cối, nhà cửa
     *    · Bỏ núi bậc thang, sông 3D, rừng cây rải trên bản đồ, khung bàn gỗ
     * ================================================================================= */
    const LAND_Y = .56;                      // cao độ mặt đất (mặt biển ở .1)
    const FLAT_H = (LAND_Y - .36) / .92;     // các hàm cũ tính cao độ = .36 + h * .92
    sampleVietnamElevation = function () { return FLAT_H; };
    // Màu "đúng như ảnh": vật liệu bản đồ không qua tone-mapping (ACES làm bạc màu), bù lại nhân LIT cho tổng ánh sáng ~1.9
    const LIT = .52;
    const flat = (hex, o) => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(hex).multiplyScalar(LIT), roughness: .95, metalness: 0, toneMapped: false }, o || {}));
    const CLIFF = () => c4('k5cliff', () => flat(0xead9a4));
    const hash3 = (i, j, k) => { const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };

    // Khối đất phẳng từ một đường viền (toạ độ bàn cờ): mặt trên dùng topMat, vách + mép bo dùng màu kem
    function landSlab(pts, topY, topMat, bb, bevel) {
        const sh = new THREE.Shape(); pts.forEach(([x, z], i) => i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)); sh.closePath();
        const bv = bevel === undefined ? .13 : bevel, D = topY + .5;
        const geo = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: true, bevelSize: bv, bevelThickness: bv * .8, bevelSegments: 3, steps: 1 });
        geo.rotateX(-Math.PI / 2);
        if (bb) { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bb.x0) / (bb.x1 - bb.x0), 1 - (p.getZ(i) - bb.z0) / (bb.z1 - bb.z0)); uv.needsUpdate = true; }
        const m = new THREE.Mesh(geo, [topMat, CLIFF()]); m.position.y = topY - D - bv * .8; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
    }
    const blob = (cx, cz, rx, rz, seed, n) => { const o = []; n = n || 44; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + .09 * Math.sin(a * 3 + seed) + .05 * Math.sin(a * 5 + seed * 2.3); o.push([cx + Math.cos(a) * rx * k, cz + Math.sin(a) * rz * k]); } return o; };

    // Mặt trên của đất liền: các mảng tỉnh (Voronoi) xanh non / vàng cát, viền kem mảnh
    function landTexture(bb, outline) {
        const W = bb.x1 - bb.x0, D = bb.z1 - bb.z0, CW = 768, CH = Math.round(CW * D / W);
        const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d');
        const img = g.createImageData(CW, CH), d = img.data, CELL = 3.5;
        const kx = 2.55 * GEO_K, kz = 2.75 * GEO_K;
        const HI = [[103.3, 21.9, 1.5, 1.0], [105.3, 22.8, 1.3, .55], [104.8, 19.4, .9, .9], [106.2, 17.4, .8, .8], [108.2, 13.9, 1.0, 1.9], [107.6, 11.9, .7, .6]];   // vùng núi, cao nguyên -> vàng cát
        const LO = [[105.9, 20.9, .8, .55], [105.5, 9.9, 1.4, 1.0]];                                                                                                // châu thổ -> xanh đậm hơn
        const fld = (L, lon, lat) => { let s = 0; for (let i = 0; i < L.length; i++) { const u = (lon - L[i][0]) / L[i][2], v = (lat - L[i][1]) / L[i][3]; s += Math.exp(-(u * u + v * v)); } return s; };
        const GREEN = [[198, 219, 106], [188, 212, 96], [208, 226, 120], [180, 206, 90], [203, 222, 112]], DELTA = [[170, 206, 92], [162, 200, 86], [178, 210, 100]];
        const SAND = [[234, 214, 152], [228, 205, 140], [238, 220, 164], [224, 198, 132]], MID = [[218, 220, 130], [212, 216, 122], [222, 216, 140]];
        const cells = new Map();
        const cell = (i, j) => {
            const key = i * 4096 + j; let c = cells.get(key); if (c) return c;
            const sx = (i + .15 + .7 * hash3(i, j, 1)) * CELL, sz = (j + .15 + .7 * hash3(i, j, 2)) * CELL;
            const lon = (bb.x0 + sx) / kx + 106.15, lat = 16 - (bb.z0 + sz) / kz, r = hash3(i, j, 3);
            const hi = fld(HI, lon, lat) + (hash3(i, j, 4) - .5) * .45, lo = fld(LO, lon, lat);
            const pal = hi > .62 ? SAND : hi > .36 ? MID : lo > .55 ? DELTA : GREEN;
            c = { x: sx, z: sz, col: pal[Math.floor(r * pal.length)] }; cells.set(key, c); return c;
        };
        for (let py = 0; py < CH; py++) {
            const z = (py + .5) / CH * D, gj = Math.floor(z / CELL);
            for (let px = 0; px < CW; px++) {
                const x = (px + .5) / CW * W, gi = Math.floor(x / CELL); let d1 = 1e9, d2 = 1e9, best = null;
                for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const c = cell(gi + a, gj + b), dd = Math.hypot(c.x - x, c.z - z); if (dd < d1) { d2 = d1; d1 = dd; best = c; } else if (dd < d2) d2 = dd; }
                const e = d2 - d1, k = e < .13 ? .62 * (1 - e / .13) : 0, o = (py * CW + px) * 4, n = 1 + (hash3(px, py, 9) - .5) * .03;
                d[o] = (best.col[0] * (1 - k) + 246 * k) * n; d[o + 1] = (best.col[1] * (1 - k) + 238 * k) * n; d[o + 2] = (best.col[2] * (1 - k) + 196 * k) * n; d[o + 3] = 255;
            }
        }
        g.putImageData(img, 0, 0);
        const toC = (lon, lat) => { const q = geoToBoardXZ(lon, lat); return [(q.x - bb.x0) / W * CW, (q.z - bb.z0) / D * CH]; };
        const line = (pts, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => { const [x, y] = toC(p[0], p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); };
        // châu thổ sông Hồng quanh Hà Nội + một nhánh sông mảnh như ảnh mẫu
        { const [x, y] = toC(105.75, 20.95), gr = g.createRadialGradient(x, y, 4, x, y, 44); gr.addColorStop(0, 'rgba(150,204,110,.75)'); gr.addColorStop(.7, 'rgba(160,208,112,.45)'); gr.addColorStop(1, 'rgba(160,208,112,0)'); g.fillStyle = gr; g.fillRect(x - 50, y - 50, 100, 100); }
        line([[102.9, 22.5], [103.7, 22.0], [104.5, 21.6], [105.2, 21.25], [105.75, 21.0]], 'rgba(96,150,170,.55)', 2.2);
        line([[105.75, 21.0], [106.3, 20.75], [106.9, 20.72], [107.3, 20.9]], 'rgba(96,150,170,.45)', 2);
        // mép sáng dọc bờ
        g.save(); g.beginPath(); outline.forEach(([x, z], i) => { const cx = (x - bb.x0) / W * CW, cy = (z - bb.z0) / D * CH; i ? g.lineTo(cx, cy) : g.moveTo(cx, cy); }); g.closePath(); g.clip();
        g.filter = 'blur(3px)'; g.strokeStyle = 'rgba(248,240,200,.85)'; g.lineWidth = 12; g.stroke(); g.restore(); g.filter = 'none';
        const t = new THREE.CanvasTexture(cv); t.anisotropy = 8; return t;
    }

    build3DVietnamMapTerrain = function () {
        // 1. Đất liền
        const out = VIETNAM_BORDER_LONLAT.map(([lon, lat]) => { const q = geoToBoardXZ(lon, lat); return [q.x, q.z]; });
        const bb = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 }; out.forEach(([x, z]) => { bb.x0 = Math.min(bb.x0, x); bb.x1 = Math.max(bb.x1, x); bb.z0 = Math.min(bb.z0, z); bb.z1 = Math.max(bb.z1, z); });
        bb.x0 -= .5; bb.x1 += .5; bb.z0 -= .5; bb.z1 += .5;
        const topMat = flat(0xffffff, { map: landTexture(bb, out) });
        landSlab(out, LAND_Y, topMat, bb, .16);
        // 2. Đảo: Phú Quốc theo đúng hình trong ảnh, các đảo khác bo tròn
        const islTop = i => c4('k5isl' + (i % 3), () => flat([0xc4d96a, 0xbad460, 0xcfe07c][i % 3]));
        (window.__ISLANDS || []).forEach((s, i) => {
            const c = geoToBoardXZ(s.lon, s.lat);
            const pts = s.poly ? s.poly.map(([lo, la]) => { const q = geoToBoardXZ(lo, la); return [q.x, q.z]; }) : blob(c.x, c.z, s.rx, s.rz, i * 1.7);
            landSlab(pts, s.tile !== undefined ? LAND_Y : LAND_Y - .14, islTop(i), null, .12);
        });
        // 3. Đảo nhỏ đặt ngân hàng, hai bộ bài và xúc xắc (trước đây nằm trên mép bàn gỗ)
        landSlab(blob(DECK.x + 1.8, DECK.z, 6.3, 8.6, 2.2, 56), .19, c4('k5deck', () => flat(0xc8dc74)), null, .12);
        // 4. Mọi ô cờ nằm trên cùng một mặt phẳng
        BOARD_TILES.forEach(t => { const q = geoToBoardXZ(t.lon, t.lat); t.mapX = q.x; t.mapZ = q.z; t.elevation = LAND_Y; });
    };

    // Chỉ giữ cụm núi đá vịnh Hạ Long ngoài biển; không rải rừng trên mặt bản đồ nữa
    buildLush3DMapEnvironmentDetails = function () {
        [[452, 196, .9], [470, 186, .7], [440, 208, .8]].forEach(([px, py, kh]) => {
            const q = PXZ(px, py); if (!seaAt(q.x, q.z, 0)) return;
            const rock = new THREE.Mesh(new THREE.ConeGeometry(.3, kh, 7), S(0x6f8f6a, .85)); rock.position.set(q.x, .1 + kh / 2, q.z); rock.castShadow = true; scene.add(rock);
            const moss = new THREE.Mesh(new THREE.DodecahedronGeometry(.17, 1), S(0x58b85a, .75)); moss.position.set(q.x, .1 + kh * .8, q.z); scene.add(moss);
        });
    };

    /* ---------- Bờ đất bao quanh biển: vách cát, cỏ, cây, làng xóm, đồi xa ---------- */
    function buildShore() {
        const R = BOARD_RECT, TOP = 1.5, OUT = 420, rnd = (() => { let s = 4711; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
        const A = { x0: R.x0 - 80, x1: R.x1 + 80, z0: R.z0 - 80, z1: R.z1 + 80 }, AW = A.x1 - A.x0, AD = A.z1 - A.z0, CS = 1024;
        const cv = document.createElement('canvas'); cv.width = cv.height = CS; const g = cv.getContext('2d');
        const toC = (x, z) => [(x - A.x0) / AW * CS, (z - A.z0) / AD * CS];
        const path = off => { g.beginPath(); poolPts(off, 220).forEach(([x, z], i) => { const [cx, cy] = toC(x, z); i ? g.lineTo(cx, cy) : g.moveTo(cx, cy); }); g.closePath(); };
        g.fillStyle = '#84c455'; g.fillRect(0, 0, CS, CS);
        for (let i = 0; i < 520; i++) { const x = 80 + rnd() * (CS - 160), y = 80 + rnd() * (CS - 160), r = 14 + rnd() * 42, k = rnd(); const gr = g.createRadialGradient(x, y, 0, x, y, r); const c = k < .45 ? '110,180,70' : k < .85 ? '150,208,98' : '214,200,140'; gr.addColorStop(0, `rgba(${c},.5)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
        g.filter = 'blur(5px)'; g.strokeStyle = 'rgba(232,212,156,.95)'; g.lineWidth = 30; path(0); g.stroke();                 // bãi cát ven vách
        g.filter = 'blur(1.5px)'; g.strokeStyle = 'rgba(226,206,150,.9)'; g.lineWidth = 5; path(11.5); g.stroke(); g.filter = 'none'; // đường đất ven biển
        const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8;
        // khối bờ: hình chữ nhật lớn khoét lòng biển bo tròn (ngoài vùng vẽ, texture kẹp mép nên cỏ đều màu)
        const sh = new THREE.Shape(); sh.moveTo(R.cx - OUT, -(R.cz - OUT)); sh.lineTo(R.cx + OUT, -(R.cz - OUT)); sh.lineTo(R.cx + OUT, -(R.cz + OUT)); sh.lineTo(R.cx - OUT, -(R.cz + OUT)); sh.closePath();
        const hole = new THREE.Path(); poolPts(0, 220).forEach(([x, z], i) => i ? hole.lineTo(x, -z) : hole.moveTo(x, -z)); hole.closePath(); sh.holes.push(hole);
        const geo = new THREE.ExtrudeGeometry(sh, { depth: 2.2, bevelEnabled: true, bevelSize: .55, bevelThickness: .4, bevelSegments: 3, steps: 1 }); geo.rotateX(-Math.PI / 2);
        { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - A.x0) / AW, 1 - (p.getZ(i) - A.z0) / AD); uv.needsUpdate = true; }
        const land = new THREE.Mesh(geo, [flat(0xffffff, { map: tex }), flat(0xdcc48e)]);
        land.position.y = TOP - 2.2 - .4; land.receiveShadow = true; scene.add(land);

        // làng xóm ven bờ
        const o = new THREE.Object3D(), col = new THREE.Color(), houses = [];
        const NV = 13; for (let v = 0; v < NV; v++) { const th = (v + .15 + rnd() * .7) / NV * Math.PI * 2, n = 3 + Math.floor(rnd() * 4), base = poolPt(th, 9 + rnd() * 9); for (let k = 0; k < n; k++) { const x = base[0] + (rnd() - .5) * 11, z = base[1] + (rnd() - .5) * 11; if (poolSD(x, z) < 5 || houses.some(h => Math.hypot(h.x - x, h.z - z) < 3.2)) continue; houses.push({ x, z, w: 1.7 + rnd() * .9, d: 1.4 + rnd() * .6, h: 1 + rnd() * .35, ry: Math.atan2(R.cx - x, R.cz - z) + (rnd() - .5) * .5, r: rnd() }); } }
        const WALL = [0xf6ead0, 0xecd9b0, 0xdcc096, 0xfbf3e2], ROOF = [0xc9573c, 0xd97a42, 0xb44a3c, 0x6f8fa8, 0x8a5a3c, 0xc9573c];
        const mkInst = (geom, mat, n) => { const im = new THREE.InstancedMesh(geom, mat, n); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); return im; };
        const walls = mkInst(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: .85 }), houses.length);
        const roofG = new THREE.ConeGeometry(.82, 1, 4); roofG.rotateY(Math.PI / 4);
        const roofs = mkInst(roofG, new THREE.MeshStandardMaterial({ roughness: .7, flatShading: true }), houses.length);
        houses.forEach((h, i) => {
            o.rotation.set(0, h.ry, 0); o.position.set(h.x, TOP + h.h / 2, h.z); o.scale.set(h.w, h.h, h.d); o.updateMatrix(); walls.setMatrixAt(i, o.matrix); walls.setColorAt(i, col.setHex(WALL[Math.floor(h.r * WALL.length)]));
            o.position.y = TOP + h.h + .34; o.scale.set(h.w * 1.08, .7, h.d * 1.12); o.updateMatrix(); roofs.setMatrixAt(i, o.matrix); roofs.setColorAt(i, col.setHex(ROOF[Math.floor(h.r * 7.3) % ROOF.length]));
        });
        walls.instanceColor.needsUpdate = roofs.instanceColor.needsUpdate = true;
        // cây: tán tròn và thông
        const trees = []; for (let n = 0; n < 4000 && trees.length < 560; n++) { const th = rnd() * Math.PI * 2, p = poolPt(th, 4.6 + rnd() * rnd() * 70), x = p[0] + (rnd() - .5) * 3, z = p[1] + (rnd() - .5) * 3; if (poolSD(x, z) < 4 || houses.some(h => Math.hypot(h.x - x, h.z - z) < 2.3)) continue; trees.push({ x, z, s: 1 + rnd() * .9, pine: rnd() < .38, r: rnd() }); }
        const round = trees.filter(t => !t.pine), pine = trees.filter(t => t.pine), LEAF5 = [0x4fa244, 0x5cb04a, 0x3f923c, 0x6fbd55, 0x48a84c];
        const trunks = mkInst(new THREE.CylinderGeometry(.09, .13, 1, 6), new THREE.MeshStandardMaterial({ color: 0x8a623c, roughness: .9 }), trees.length);
        const crowns = mkInst(new THREE.IcosahedronGeometry(.62, 1), flat(0xffffff, { flatShading: true }), round.length);
        const cones = mkInst(new THREE.ConeGeometry(.55, 1.5, 7), flat(0xffffff, { flatShading: true }), pine.length);
        trees.forEach((t, i) => { o.rotation.set(0, t.r * 6, 0); o.position.set(t.x, TOP + .35 * t.s, t.z); o.scale.set(t.s, .7 * t.s, t.s); o.updateMatrix(); trunks.setMatrixAt(i, o.matrix); });
        round.forEach((t, i) => { o.rotation.set(0, t.r * 6, 0); o.position.set(t.x, TOP + 1.0 * t.s, t.z); o.scale.set(t.s, t.s * (.9 + t.r * .3), t.s); o.updateMatrix(); crowns.setMatrixAt(i, o.matrix); crowns.setColorAt(i, col.setHex(LEAF5[Math.floor(t.r * 5)])); });
        pine.forEach((t, i) => { o.rotation.set(0, t.r * 6, 0); o.position.set(t.x, TOP + 1.15 * t.s, t.z); o.scale.set(t.s, t.s, t.s); o.updateMatrix(); cones.setMatrixAt(i, o.matrix); cones.setColorAt(i, col.setHex(LEAF5[Math.floor(t.r * 5)]).multiplyScalar(.85)); });
        if (round.length) crowns.instanceColor.needsUpdate = true; if (pine.length) cones.instanceColor.needsUpdate = true;
        // dãy đồi xa khép đường chân trời
        const NH = 72, hills = mkInst(new THREE.IcosahedronGeometry(1, 2), flat(0xffffff), NH); hills.castShadow = false;
        for (let i = 0; i < NH; i++) { const p = poolPt((i + rnd() * .6) / NH * Math.PI * 2, i % 2 ? 100 + rnd() * 30 : 150 + rnd() * 50), r = 24 + rnd() * 26; o.rotation.set(0, rnd() * 6, 0); o.position.set(p[0], TOP - 2, p[1]); o.scale.set(r, r * (.3 + rnd() * .16), r); o.updateMatrix(); hills.setMatrixAt(i, o.matrix); hills.setColorAt(i, col.setHex([0x8fc45c, 0x82ba54, 0x9bcc66][i % 3])); }
        hills.instanceColor.needsUpdate = true;
    }

    // Thay khung bàn gỗ + viền vàng bằng đáy biển và bờ đất
    buildWoodenTableAndEastSea = function () {
        const R = BOARD_RECT;
        const bed = new THREE.Mesh(new THREE.BoxGeometry(R.W + 6, .3, R.D + 6), flat(0x1b9ce8));
        bed.position.set(R.cx, -.12, R.cz); bed.receiveShadow = true; scene.add(bed);
        try { buildShore(); } catch (e) { console.warn('shore', e); }
        buildMapExtras();
        // nhãn thành phố: hiện khi zoom xa, ẩn khi zoom gần
        const labels = [['Hà Nội', 105.85, 21.03], ['Sa Pa', 103.84, 22.34], ['Huế', 107.59, 16.46], ['Đà Nẵng', 108.2, 16.05], ['Nha Trang', 109.19, 12.24], ['Đà Lạt', 108.44, 11.94], ['TP. Hồ Chí Minh', 106.7, 10.78], ['Cần Thơ', 105.78, 10.04]].map(a => {
            const q = geoToBoardXZ(a[1], a[2]), sp = create3DTextSprite(a[0], '#0f172a', '#fde68a', true);
            sp.position.set(q.x, LAND_Y + 1.5, q.z); sp.scale.set(1.7, .45, 1); sp.material.transparent = true; scene.add(sp); return sp;
        });
        _mapAnim.push(() => { labels.forEach(sp => { const d = camera.position.distanceTo(sp.position), o = Math.max(0, Math.min(1, (d - 12) / 8)); sp.material.opacity = o; sp.visible = o > .02; }); });
    };
