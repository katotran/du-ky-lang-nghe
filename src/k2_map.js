    window.BOARD_RECT = BOARD_RECT;
    window.DECK = (() => { const q = geoToBoardXZ(100.9, 16.3); return { x: q.x, z: q.z, dx: geoToBoardXZ(101.9, 16).x }; })();
    const HS_XZ = geoToBoardXZ(HS_GEO[0], HS_GEO[1]), TS_XZ = geoToBoardXZ(TS_GEO[0], TS_GEO[1]);
    const kx2 = () => 2.55 * GEO_K, kz2 = () => 2.75 * GEO_K;
    const toGeo = (x, z) => [x / kx2() + 106.15, 16 - z / kz2()];
    const tilesXZ = () => BOARD_TILES.map(t => geoToBoardXZ(t.lon, t.lat));
    function seaAt(x, z, pad) {
        const [lon, lat] = toGeo(x, z), R = BOARD_RECT, m = pad === undefined ? 1.2 : pad;
        if (x < R.x0 + 1 || x > R.x1 - 1 || z < R.z0 + 1 || z > R.z1 - 1) return false;
        if (isPointInPolygon(lon, lat, VIETNAM_BORDER_LONLAT)) return false;
        if (Math.hypot(x - HS_XZ.x, z - HS_XZ.z) < 4.4 || Math.hypot(x - TS_XZ.x, z - TS_XZ.z) < 4.4) return false;
        if ((window.__ISLANDS || []).some(s => { const q = geoToBoardXZ(s.lon, s.lat); return Math.hypot(q.x - x, q.z - z) < Math.max(s.rx, s.rz) + .4; })) return false;
        return !tilesXZ().some(t => Math.hypot(t.x - x, t.z - z) < 1.6 + m);
    }
    function mergeGeos(list) {
        const parts = list.map(g => g.index ? g.toNonIndexed() : g); let n = 0; parts.forEach(g => n += g.attributes.position.count);
        const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
        parts.forEach(g => { g.computeVertexNormals(); pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; });
        const G2 = new THREE.BufferGeometry(); G2.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G2.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return G2;
    }
    const M = (hex, r, m, o) => { const k = 'km' + hex + '_' + r + '_' + m + '_' + (o || ''); return c4(k, () => new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: r === undefined ? .6 : r, metalness: m || 0 }, o || {}))); };
    const textTex = (key, text, w, h, bg, fg, font) => vCanvasTex(key, w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = font || `800 ${Math.round(H * .55)}px "Be Vietnam Pro", Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 1, W - 10); });

    /* ---------- 1. Mặt nước Biển Đông: nông – sâu theo bờ, sóng lấp lánh, bọt trắng ven bờ ---------- */
    function buildWaterSurface() {
        const R = BOARD_RECT, CW = 1024, CH = Math.round(1024 * R.D / R.W);
        const toC = (lon, lat) => { const q = geoToBoardXZ(lon, lat); return [(q.x - R.x0) / R.W * CW, (q.z - R.z0) / R.D * CH]; };
        const landPath = g => { g.beginPath(); VIETNAM_BORDER_LONLAT.forEach(([lo, la], i) => { const [x, y] = toC(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
        const isl = (window.__ISLANDS || []).map(s => { const [x, y] = toC(s.lon, s.lat); return [x, y, s.rx / R.W * CW, s.rz / R.D * CH]; });
        const reefs = [[HS_GEO, 46], [TS_GEO, 50], [[111.6, 16.9], 18], [[112.4, 16.0], 16], [[114.0, 10.3], 18], [[113.8, 8.6], 16], [[111.9, 8.6], 14], [[112.6, 10.6], 15]];
        const color = document.createElement('canvas'); color.width = CW; color.height = CH; const g = color.getContext('2d');
        const gr = g.createLinearGradient(0, 0, CW, CH); gr.addColorStop(0, '#3a6e73'); gr.addColorStop(.5, '#2f5d62'); gr.addColorStop(1, '#22474b'); g.fillStyle = gr; g.fillRect(0, 0, CW, CH);
        const halo = (blur, fill, grow) => { g.filter = `blur(${blur}px)`; g.fillStyle = fill; g.strokeStyle = fill; g.lineWidth = grow; g.lineJoin = 'round'; landPath(g); g.fill(); g.stroke(); isl.forEach(([x, y, rx, ry]) => { g.beginPath(); g.ellipse(x, y, rx + grow / 2, ry + grow / 2, 0, 0, 7); g.fill(); }); reefs.forEach(([p, r]) => { const [x, y] = toC(p[0], p[1]); g.beginPath(); g.arc(x, y, r * (grow / 40 + .4), 0, 7); g.fill(); }); };
        halo(40, 'rgba(70,118,116,.6)', 90); halo(18, 'rgba(92,136,128,.65)', 40); halo(7, 'rgba(150,160,130,.7)', 14);
        g.filter = 'none';
        for (let i = 0; i < 5200; i++) { g.fillStyle = `rgba(230,220,190,${Math.random() * .03})`; g.fillRect(Math.random() * CW, Math.random() * CH, 2 + Math.random() * 6, 1); }
        g.fillStyle = 'rgba(214,190,140,.32)'; g.font = '700 26px "Playfair Display", serif'; g.textAlign = 'center';
        [['BIỂN ĐÔNG', 111.2, 13.4]].forEach(([t, lo, la]) => { const [x, y] = toC(lo, la); g.save(); g.translate(x, y); g.fillText(t, 0, 0); g.restore(); });
        const coast = document.createElement('canvas'); coast.width = CW; coast.height = CH; const c = coast.getContext('2d');
        c.fillStyle = '#000'; c.fillRect(0, 0, CW, CH); c.filter = 'blur(5px)'; c.strokeStyle = '#fff'; c.lineWidth = 11; landPath(c); c.stroke();
        isl.forEach(([x, y, rx, ry]) => { c.beginPath(); c.ellipse(x, y, rx + 2, ry + 2, 0, 0, 7); c.stroke(); });
        c.filter = 'none';
        const tColor = new THREE.CanvasTexture(color), tCoast = new THREE.CanvasTexture(coast);
        const u = { uT: { value: 0 }, uColor: { value: tColor }, uCoast: { value: tCoast }, uSun: { value: new THREE.Vector3(-.45, .8, -.38).normalize() } };
        const mat = new THREE.ShaderMaterial({
            uniforms: u, transparent: true, depthWrite: false,
            vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
            fragmentShader: `uniform float uT; uniform sampler2D uColor,uCoast; uniform vec3 uSun; varying vec2 vUv; varying vec3 vW;
              float h(vec2 p){ return sin(p.x*1.7+uT*1.3)*.5+sin(p.y*2.1-uT*1.1)*.5+sin((p.x+p.y)*3.3+uT*2.2)*.25+sin((p.x-p.y)*5.1-uT*2.9)*.12; }
              void main(){
                vec3 base=texture2D(uColor,vUv).rgb; float cst=texture2D(uCoast,vUv).r;
                vec2 p=vW.xz; float e=.05; vec3 n=normalize(vec3(h(p-vec2(e,0.))-h(p+vec2(e,0.)), 6., h(p-vec2(0.,e))-h(p+vec2(0.,e))));
                vec3 v=normalize(cameraPosition-vW); vec3 r=reflect(-uSun,n); float sp=pow(max(dot(r,v),0.),90.)*1.4;
                float fr=pow(1.-max(dot(n,v),0.),3.)*.35; float dif=.82+.18*dot(n,uSun);
                float foam=cst*smoothstep(.55,1.,sin(cst*22.-uT*2.4)*.5+.5)*.75+smoothstep(.75,1.,cst)*.35;
                vec3 col=base*dif+vec3(.55,.6,.55)*fr*.6+vec3(1.,.86,.62)*sp*.55; col=mix(col,vec3(.82,.78,.66),clamp(foam*.7,0.,1.));
                gl_FragColor=vec4(col,.94); }`
        });
        const geo = new THREE.PlaneGeometry(R.W, R.D, 1, 1); geo.rotateX(-Math.PI / 2);
        const mesh = new THREE.Mesh(geo, mat); mesh.position.set(R.cx, .1, R.cz); mesh.renderOrder = 1; scene.add(mesh);
        _mapAnim.push(t => { u.uT.value = t; });
        window.__waterMesh = mesh;
    }

    /* ---------- 2. Tàu thuyền chi tiết ---------- */
    function hullGeo(L, W, H) { // thân thuyền mũi nhọn, đuôi vuông
        const s = new THREE.Shape(); s.moveTo(-L / 2, -W / 2); s.lineTo(L * .22, -W / 2); s.quadraticCurveTo(L * .44, -W * .42, L / 2, 0); s.quadraticCurveTo(L * .44, W * .42, L * .22, W / 2); s.lineTo(-L / 2, W / 2); s.closePath();
        const g = new THREE.ExtrudeGeometry(s, { depth: H, bevelEnabled: true, bevelThickness: H * .12, bevelSize: W * .06, bevelSegments: 2 }); g.rotateX(-Math.PI / 2); g.translate(0, -H * .1, 0); return g;
    }
    function mkShip(kind) {
        const g = new THREE.Group(), add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
        const box = (w, h, d, mat, x, y, z) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), x, y + h / 2, z);
        const cyl = (r1, r2, h, mat, x, y, z, s) => add(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s || 10), mat), x, y + h / 2, z);
        const hull = (L, W, H, hex, stripe) => { add(new THREE.Mesh(hullGeo(L, W, H), M(hex, .45)), 0, 0, 0); if (stripe) add(new THREE.Mesh(hullGeo(L * 1.01, W * 1.02, H * .18), M(stripe, .4)), 0, H * .78, 0); box(L * .7, .012, W * .8, M(0xb08a5a, .7), -L * .05, H, 0); };
        const vnFlag = (x, y, z, s) => { cyl(.006, .006, .3 * s, M(0xdddddd, .3, .5), x, y, z, 5); const f = new THREE.Mesh(new THREE.PlaneGeometry(.16 * s, .1 * s), c4('vnflag2', () => new THREE.MeshStandardMaterial({ map: vCanvasTex('vnf2', 96, 64, (q) => { q.fillStyle = '#da251d'; q.fillRect(0, 0, 96, 64); q.fillStyle = '#ffde00'; q.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 8 : 20; q.lineTo(48 + Math.cos(a) * r, 33 + Math.sin(a) * r); } q.fill(); }), side: THREE.DoubleSide }))); f.position.set(x - .08 * s, y + .25 * s, z); g.add(f); return f; };
        const crew = (x, z, col) => { cyl(.022, .026, .07, M(col || 0x2f5d8a, .8), x, .2, z, 6); add(new THREE.Mesh(new THREE.SphereGeometry(.022, 8, 6), M(0xe0b48c, .7)), x, .29, z); add(new THREE.Mesh(new THREE.ConeGeometry(.045, .03, 10), M(0xe5d29b, .8)), x, .315, z); };
        const win = (w, h, x, y, z, rotY) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M(0x1d2a3a, .2, .3)); m.position.set(x, y, z); m.rotation.y = rotY || 0; g.add(m); };
        if (kind === 'trawler') { // tàu cá vỏ xanh, cabin trắng, cần lưới
            const hc = [0x1f63c6, 0x2a7fd8, 0x1b8a6b][(Math.random() * 3) | 0];
            hull(1.0, .34, .16, hc, 0xc8231d); box(.28, .17, .26, M(0xf4f4f0, .5), -.22, .17, 0); box(.32, .03, .3, M(0x1f63c6, .5), -.22, .34, 0);
            win(.2, .05, -.22, .29, .131); win(.2, .05, -.22, .29, -.131, Math.PI); win(.2, .05, -.08, .29, 0, Math.PI / 2);
            cyl(.01, .012, .62, M(0x6a5a40, .7), .12, .17, 0, 6); const boom = cyl(.007, .007, .5, M(0x6a5a40, .7), .3, .6, 0, 5); boom.rotation.z = -1.0;
            const net = add(new THREE.Mesh(new THREE.ConeGeometry(.12, .3, 8, 1, true), M(0x3f8a5a, .9, 0, { transparent: true, opacity: .7, side: THREE.DoubleSide })), .48, .44, 0); net.rotation.z = Math.PI;
            [-1, 1].forEach(a => { add(new THREE.Mesh(new THREE.CircleGeometry(.03, 12), M(0xffffff, .5)), .4, .12, a * .155).rotation.y = a > 0 ? 0 : Math.PI; add(new THREE.Mesh(new THREE.CircleGeometry(.014, 10), M(0x111111, .5)), .405, .12, a * .158).rotation.y = a > 0 ? 0 : Math.PI; });
            [0, 1, 2].forEach(i => add(new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), M(0xff8a1c, .5)), .05 + i * .07, .2, .14));
            vnFlag(-.22, .37, 0, 1); crew(.15, -.06); crew(-.02, .07, 0x8a2f2f);
        } else if (kind === 'junk') { // thuyền buồm nâu Hạ Long
            hull(1.15, .36, .2, 0x5a3520); box(.4, .12, .28, M(0x7a4b2a, .7), -.25, .2, 0);
            [-.3, .05, .35].forEach((x, i) => { cyl(.012, .015, .85 - i * .12, M(0x3a2414, .8), x, .2, 0, 6); const s = new THREE.Mesh(new THREE.PlaneGeometry(.34 - i * .04, .58 - i * .1), c4('junkSail', () => new THREE.MeshStandardMaterial({ map: vCanvasTex('jsail', 64, 128, texRibs('#c0582a', '#7e3216'), 1, 1), side: THREE.DoubleSide, roughness: .8 }))); s.rotation.y = Math.PI / 2 - .25; s.rotation.z = .08; s.position.set(x + .06, .62 - i * .06, 0); s.castShadow = true; g.add(s); });
            vnFlag(-.5, .2, 0, 1);
        } else if (kind === 'cargo') { // tàu container
            hull(2.1, .5, .26, 0x9b2a24, 0x232a33); const cc = [0x1f6fbf, 0xe0582c, 0xf2c230, 0x2f9a5a, 0xd8dde3, 0x7b3fa0];
            for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 1 + ((i + j) % 2); k++) box(.22, .11, .19, M(cc[(i * 3 + j * 5 + k) % cc.length], .55), -.25 + i * .24, .27 + k * .11, -.1 + j * .2);
            box(.26, .42, .44, M(0xf4f4f0, .45), -.82, .27, 0); win(.4, .05, -.82, .62, .221); box(.3, .04, .5, M(0xf4f4f0, .45), -.82, .69, 0); cyl(.05, .06, .2, M(0xd23a2a, .5), -.92, .73, 0);
            vnFlag(-1.0, .3, 0, 1.3);
        } else if (kind === 'cruise') {
            hull(2.0, .5, .24, 0xf7f7f5, 0x1e5fb0); [0, 1, 2].forEach(i => { box(1.5 - i * .36, .12, .44 - i * .06, M(0xffffff, .4), -.08 - i * .06, .26 + i * .12, 0); win(1.36 - i * .36, .04, -.08 - i * .06, .32 + i * .12, .221 - i * .03); win(1.36 - i * .36, .04, -.08 - i * .06, .32 + i * .12, -.221 + i * .03, Math.PI); });
            cyl(.06, .07, .22, M(0xd23a2a, .5), -.2, .62, 0); cyl(.12, .12, .01, M(0x2aa7d8, .2), .3, .38, 0, 14);
        } else if (kind === 'coastguard') { // tàu Cảnh sát biển
            hull(1.5, .38, .24, 0xf5f6f7); box(.5, .2, .3, M(0xf5f6f7, .4), -.15, .24, 0); box(.3, .14, .26, M(0xf5f6f7, .4), -.2, .44, 0);
            const band = c4('cgBand', () => new THREE.MeshStandardMaterial({ map: vCanvasTex('cgb', 256, 64, (q, W, H) => { q.fillStyle = '#f5f6f7'; q.fillRect(0, 0, W, H); q.fillStyle = '#c81e1e'; q.beginPath(); q.moveTo(150, 0); q.lineTo(185, 0); q.lineTo(155, H); q.lineTo(120, H); q.fill(); q.fillStyle = '#1d4fa8'; q.beginPath(); q.moveTo(195, 0); q.lineTo(215, 0); q.lineTo(185, H); q.lineTo(165, H); q.fill(); q.fillStyle = '#1d4fa8'; q.font = '800 18px Arial'; q.fillText('CẢNH SÁT BIỂN', 6, 40); }), roughness: .45 }));
            [-1, 1].forEach(a => { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .2), band); p.position.set(.05, .14, a * .193); p.rotation.y = a > 0 ? 0 : Math.PI; g.add(p); });
            win(.26, .05, -.2, .53, .131); cyl(.01, .01, .35, M(0x888888, .4, .4), -.25, .58, 0, 5); add(new THREE.Mesh(new THREE.BoxGeometry(.18, .02, .03), M(0x444444, .4)), -.25, .86, 0); vnFlag(-.7, .24, 0, 1.1);
        } else if (kind === 'navy') { // tàu hải quân xám
            hull(1.8, .4, .24, 0x8b96a0, 0x3a434c); box(.55, .22, .3, M(0x9aa5ae, .45, .2), -.2, .24, 0); box(.3, .18, .24, M(0x9aa5ae, .45, .2), -.25, .46, 0);
            cyl(.08, .09, .08, M(0x7f8a94, .4, .3), .45, .24, 0); const gun = cyl(.012, .012, .3, M(0x55606a, .4, .4), .58, .3, 0, 6); gun.rotation.z = -Math.PI / 2 + .1;
            cyl(.012, .015, .5, M(0x666f78, .4, .4), -.25, .64, 0, 6); const rad = add(new THREE.Mesh(new THREE.BoxGeometry(.2, .03, .04), M(0x444c54, .4)), -.25, 1.0, 0);
            const num = c4('hqNum', () => new THREE.MeshStandardMaterial({ map: textTex('hq', 'HQ-016', 128, 48, '#8b96a0', '#ffffff', '800 30px Arial'), roughness: .5 }));
            [-1, 1].forEach(a => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.26, .1), num); p.position.set(.62, .14, a * .2); p.rotation.y = a > 0 ? 0 : Math.PI; g.add(p); });
            vnFlag(-.8, .24, 0, 1.2); _mapAnim.push(t => { rad.rotation.y = t * 2; });
        } else if (kind === 'basket') { // cụm thúng chai
            [[0, 0], [.32, .18], [-.25, .22]].forEach(([x, z], i) => { add(new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), c4('basketM', () => new THREE.MeshStandardMaterial({ map: vCanvasTex('bweave', 64, 64, (q, W, H) => { q.fillStyle = '#7a5a30'; q.fillRect(0, 0, W, H); q.strokeStyle = 'rgba(40,25,10,.6)'; for (let k = 0; k < W; k += 6) { q.beginPath(); q.moveTo(k, 0); q.lineTo(k + H, H); q.stroke(); q.beginPath(); q.moveTo(k, H); q.lineTo(k + H, 0); q.stroke(); } }), roughness: .9 }))), x, .14, z).rotation.x = Math.PI; crew(x, z, [0x8a2f2f, 0x2f5d8a, 0x3f6e3a][i]); const oar = cyl(.006, .006, .4, M(0x6a4226, .7), x + .1, .15, z, 4); oar.rotation.z = -.9; });
        } else if (kind === 'sail') {
            hull(.9, .3, .14, 0xf6f6f6, 0x2a6fd0); cyl(.01, .01, .95, M(0xdddddd, .3), 0, .14, 0, 6);
            const s1 = add(new THREE.Mesh(new THREE.ConeGeometry(.3, .8, 3), M(0xffffff, .6)), .08, .55, 0); s1.scale.z = .08; const s2 = add(new THREE.Mesh(new THREE.ConeGeometry(.2, .5, 3), M(0xf2c230, .6)), -.18, .42, 0); s2.scale.z = .08;
        } else { // bè gỗ đánh cá
            box(.6, .05, .4, M(0x8a6a3a, .9), 0, .06, 0); box(.24, .2, .2, M(0xc9a35e, .9), -.1, .11, 0); const r = new THREE.Mesh(new THREE.ConeGeometry(.2, .14, 4), M(0x9a7a3a, .95)); r.position.set(-.1, .38, 0); r.rotation.y = Math.PI / 4; g.add(r); crew(.18, .1);
        }
        const wake = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), c4('wakeM', () => new THREE.MeshBasicMaterial({ map: vCanvasTex('wakeT', 128, 64, (q, W, H) => { const gr = q.createLinearGradient(W, 0, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = gr; q.beginPath(); q.moveTo(W, H / 2 - 6); q.lineTo(0, 0); q.lineTo(0, H); q.lineTo(W, H / 2 + 6); q.fill(); }), transparent: true, depthWrite: false }))), 0, .115, 0);
        const L = kind === 'cargo' || kind === 'cruise' ? 2.2 : kind === 'navy' ? 1.9 : kind === 'coastguard' ? 1.6 : 1.1;
        wake.rotation.x = -Math.PI / 2; wake.scale.set(L * 1.1, L * .45, 1); wake.position.x = -L * .95; wake.castShadow = false; wake.renderOrder = 2;
        if (kind === 'basket' || kind === 'raft') wake.visible = false;
        return g;
    }
    function sailLoop(ship, cx, cz, R, Rz, w, ph, bob) {
        ship.position.set(cx + Math.cos(ph) * R, .1, cz + Math.sin(ph) * Rz); scene.add(ship);
        _mapAnim.push(t => { const a = t * w + ph, x = cx + Math.cos(a) * R, z = cz + Math.sin(a) * Rz; const dx = -Math.sin(a) * R * w, dz = Math.cos(a) * Rz * w; ship.position.set(x, .095 + Math.sin(t * 2 + ph) * .012 * (bob || 1), z); ship.rotation.y = Math.atan2(-dz, dx); ship.rotation.z = Math.sin(t * 1.6 + ph) * .035; });
    }
    function ferry(ship, a, b, sp, ph) {
        scene.add(ship);
        _mapAnim.push(t => { const k = (Math.sin(t * sp + ph) + 1) / 2, dir = Math.cos(t * sp + ph) >= 0 ? 1 : -1; ship.position.set(a.x + (b.x - a.x) * k, .095 + Math.sin(t * 2 + ph) * .01, a.z + (b.z - a.z) * k); ship.rotation.y = Math.atan2(-(b.z - a.z) * dir, (b.x - a.x) * dir); ship.rotation.z = Math.sin(t * 1.4 + ph) * .03; });
    }
    function loopOk(cx, cz, R, Rz) { for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; if (!seaAt(cx + Math.cos(a) * R, cz + Math.sin(a) * Rz, .3)) return false; } return true; }

    /* ---------- 3. Sinh vật biển: đàn cá, cá heo, cá voi, rùa, hải âu ---------- */
    function fishGeo(s) { const b = new THREE.SphereGeometry(.05 * s, 8, 6); b.scale(1.9, .62, .7); const t = new THREE.ConeGeometry(.035 * s, .06 * s, 4); t.rotateZ(Math.PI / 2); t.translate(-.11 * s, 0, 0); t.scale(1, 1, .3); const f = new THREE.ConeGeometry(.02 * s, .04 * s, 3); f.translate(0, .035 * s, 0); f.scale(1, 1, .3); return mergeGeos([b, t, f]); }
    function buildMarineLife() {
        // Đàn cá bơi ngay dưới mặt nước trong (nhìn thấy qua làn nước)
        const spots = [[107.6, 19.6], [108.9, 18.0], [109.8, 16.6], [110.4, 14.6], [110.2, 12.8], [109.6, 10.6], [108.0, 9.5], [106.4, 8.2], [104.2, 8.7], [102.9, 10.6], [111.3, 17.4], [112.9, 15.6], [111.2, 9.9], [113.9, 10.9], [113.4, 7.9], [110.8, 19.8], [107.2, 9.1], [111.8, 12.4]];
        const schools = spots.map(([lo, la], i) => { const q = geoToBoardXZ(lo, la); return { x: q.x, z: q.z, r: .7 + (i % 3) * .3, w: (.25 + (i % 4) * .07) * (i % 2 ? 1 : -1), n: 14 + (i % 3) * 4, ph: i * 1.3, col: [0x9fc4d8, 0xf2b13a, 0xc0d6e0, 0xff7a3a, 0x7fb8e0, 0xe8e2c8][i % 6] }; }).filter(s => seaAt(s.x, s.z, .4));
        const total = schools.reduce((a, s) => a + s.n, 0);
        const im = new THREE.InstancedMesh(fishGeo(1.25), new THREE.MeshStandardMaterial({ roughness: .35, metalness: .25 }), total);
        const o = new THREE.Object3D(), col = new THREE.Color(); let k = 0; const list = [];
        schools.forEach(s => { for (let i = 0; i < s.n; i++) { list.push({ s, a0: i / s.n * 6.283, rr: s.r * (.6 + ((i * 37) % 10) / 22), dy: ((i * 13) % 5) * .003 }); im.setColorAt(k++, col.setHex(s.col).multiplyScalar(.85 + ((i * 7) % 5) * .06)); } });
        im.instanceColor.needsUpdate = true; im.frustumCulled = false; scene.add(im);
        _mapAnim.push(t => {
            list.forEach((f, i) => { const s = f.s, a = f.a0 + t * s.w + Math.sin(t * 1.3 + i) * .08, cx = s.x + Math.cos(t * .05 + s.ph) * .6, cz = s.z + Math.sin(t * .04 + s.ph) * .5; o.position.set(cx + Math.cos(a) * f.rr, .083 + f.dy, cz + Math.sin(a) * f.rr * .8); o.rotation.set(0, -a + (s.w > 0 ? -Math.PI / 2 : Math.PI / 2), Math.sin(t * 9 + i) * .15); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
            im.instanceMatrix.needsUpdate = true;
        });
        // Cá chuồn nhảy khỏi mặt nước
        const fj = fishGeo(1.6), fjm = M(0x8fb3cc, .3, .3);
        [[109.3, 17.2], [110.9, 15.2], [109.9, 11.6], [108.4, 8.9], [103.4, 9.4], [112.6, 13.4], [111.0, 18.6], [113.6, 12.0]].forEach(([lo, la], i) => {
            const q = geoToBoardXZ(lo, la); if (!seaAt(q.x, q.z, .3)) return; const m = new THREE.Mesh(fj, fjm); m.castShadow = true; scene.add(m);
            _mapAnim.push(t => { const k = ((t * .45 + i * .27) % 1); m.visible = k < .35; const u = k / .35; m.position.set(q.x + u * 1.1, .1 + Math.sin(u * Math.PI) * .55, q.z + u * .3); m.rotation.set(0, -.27, Math.cos(u * Math.PI) * .8); });
        });
        // Cá heo
        const dGeo = (() => { const b = new THREE.SphereGeometry(.2, 14, 10); b.scale(2, .62, .62); const n = new THREE.ConeGeometry(.06, .2, 8); n.rotateZ(-Math.PI / 2); n.translate(.47, -.02, 0); const f = new THREE.ConeGeometry(.08, .2, 4); f.translate(-.02, .17, 0); f.scale(1, 1, .3); const t1 = new THREE.ConeGeometry(.1, .14, 4); t1.rotateX(Math.PI / 2); t1.translate(-.45, 0, 0); t1.scale(1, .25, 1.6); return mergeGeos([b, n, f, t1]); })();
        const dMat = M(0x6f8fb0, .3, .1), belly = M(0xdfe8ef, .4);
        [[110.4, 17.6], [110.0, 13.6], [108.6, 9.2], [112.2, 11.2]].forEach(([lo, la], i) => {
            const q = geoToBoardXZ(lo, la); if (!seaAt(q.x, q.z, .3)) return;
            for (let j = 0; j < 3; j++) { const d = new THREE.Mesh(dGeo, dMat); d.castShadow = true; scene.add(d); const ph = i * .31 + j * .11;
                _mapAnim.push(t => { const k = ((t * .33 + ph) % 1); d.visible = k < .5; const u = k / .5; d.position.set(q.x + u * 1.6 + j * .25, .06 + Math.sin(u * Math.PI) * .75, q.z + j * .35); d.rotation.z = Math.cos(u * Math.PI) * .95; }); }
        });
        // Cá voi phun nước gần Hoàng Sa
        const wq = geoToBoardXZ(110.9, 17.9);
        if (seaAt(wq.x, wq.z, .3)) {
            const wg = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(.5, 18, 12), M(0x3d4f63, .45)); body.scale.set(2.4, .55, .8); wg.add(body);
            const tail = new THREE.Mesh(new THREE.ConeGeometry(.3, .3, 4), M(0x3d4f63, .45)); tail.rotation.x = Math.PI / 2; tail.scale.set(1, .2, 2); tail.position.set(-1.25, .05, 0); wg.add(tail); scene.add(wg);
            const spout = new THREE.Mesh(new THREE.ConeGeometry(.16, .9, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6, depthWrite: false })); spout.rotation.x = Math.PI; scene.add(spout);
            _mapAnim.push(t => { const k = (t * .12) % 1, up = Math.max(0, Math.sin(k * Math.PI * 2)); wg.position.set(wq.x + Math.cos(t * .05) * 1.2, -.12 + up * .26, wq.z + Math.sin(t * .05) * .6); wg.rotation.y = -t * .05 - Math.PI / 2; tail.rotation.z = Math.sin(t * 2) * .2; spout.position.set(wg.position.x + .3 * Math.sin(t * .05), .55 + up * .2, wg.position.z); spout.visible = up > .6; spout.scale.set(1, .5 + up * .7, 1); spout.material.opacity = .6 * up; });
        }
        // Rùa biển
        [[112.4, 9.0], [106.9, 8.4], [113.4, 10.0]].forEach(([lo, la], i) => {
            const q = geoToBoardXZ(lo, la); if (!seaAt(q.x, q.z, .2)) return; const g = new THREE.Group();
            const sh = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 8), M(0x5a6b3a, .6)); sh.scale.set(1.2, .4, 1); g.add(sh); const hd = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), M(0x8a9a6a, .6)); hd.position.set(.22, 0, 0); g.add(hd);
            const fl = [[.1, .14], [.1, -.14], [-.12, .12], [-.12, -.12]].map(([x, z]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(.14, .015, .05), M(0x8a9a6a, .6)); f.position.set(x, -.01, z); g.add(f); return f; }); scene.add(g);
            _mapAnim.push(t => { const a = t * .08 + i * 2; g.position.set(q.x + Math.cos(a) * .9, .095, q.z + Math.sin(a) * .7); g.rotation.y = -a - Math.PI / 2 + Math.PI; fl.forEach((f, j) => f.rotation.y = Math.sin(t * 3 + j) * .5); });
        });
        // Hải âu bay theo đàn
        const bird = (() => { const w1 = new THREE.BoxGeometry(.2, .008, .05); w1.translate(.1, 0, 0); return w1; })(), bm = M(0xffffff, .6);
        [[108.4, 20.3], [109.4, 15.8], [109.8, 12.4], [106.9, 9.6], [111.95, 16.45], [112.95, 9.35], [104.1, 10.4]].forEach(([lo, la], i) => {
            const q = geoToBoardXZ(lo, la);
            for (let j = 0; j < 4; j++) { const g = new THREE.Group(); const L = new THREE.Mesh(bird, bm), R2 = new THREE.Mesh(bird, bm); R2.rotation.y = Math.PI; g.add(L, R2, new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 4), bm)); scene.add(g); const ph = j * .5 + i;
                _mapAnim.push(t => { const a = t * .25 + ph; g.position.set(q.x + Math.cos(a) * (1.4 + j * .2), 2.4 + j * .15 + Math.sin(t + j) * .1, q.z + Math.sin(a) * (1.1 + j * .2)); g.rotation.y = -a; const f = Math.sin(t * 7 + j) * .5; L.rotation.z = f; R2.rotation.z = -f; }); }
        });
    }

    /* ---------- 4. Thay buildSeaLife cũ ---------- */
    buildSeaLife = function () {
        try { buildWaterSurface(); } catch (e) { console.warn('water', e); }
        const loops = [
            ['cargo', 110.6, 20.2, 1.6, 1.0], ['cruise', 109.6, 18.3, 1.5, 1.1], ['trawler', 107.6, 19.2, .9, .6], ['junk', 108.7, 20.5, .8, .5], ['trawler', 109.0, 17.0, .8, .6],
            ['coastguard', 110.8, 15.6, 1.4, 1.0], ['trawler', 110.4, 13.0, 1.0, .7], ['cargo', 111.5, 13.8, 2.0, 1.3], ['sail', 109.9, 11.6, 1.0, .7], ['trawler', 109.2, 10.2, .9, .6],
            ['basket', 109.85, 12.9, .5, .4], ['cruise', 108.0, 9.0, 1.6, 1.0], ['trawler', 106.8, 8.0, 1.0, .6], ['raft', 105.6, 8.1, .6, .4], ['trawler', 103.0, 9.0, .9, .6],
            ['junk', 102.8, 10.9, .8, .6], ['navy', 112.6, 11.8, 1.6, 1.1], ['coastguard', 113.6, 8.2, 1.3, .9], ['trawler', 111.0, 18.8, 1.0, .7], ['trawler', 112.2, 14.6, 1.0, .7],
            ['basket', 108.9, 15.1, .5, .4], ['sail', 107.9, 10.1, .8, .5], ['cargo', 109.2, 8.4, 1.8, 1.0], ['trawler', 113.8, 12.8, 1.0, .7], ['navy', 110.9, 10.6, 1.4, .9]
        ];
        loops.forEach(([kind, lo, la, R, Rz], i) => { const q = geoToBoardXZ(lo, la), RR = R * GEO_K, RZ = Rz * GEO_K; if (!loopOk(q.x, q.z, RR, RZ)) return; sailLoop(mkShip(kind), q.x, q.z, RR, RZ, (.04 + (i % 4) * .012) * (i % 2 ? 1 : -1) * (kind === 'cargo' || kind === 'cruise' ? .7 : 1), i * 1.9); });
        // Phà ra đảo
        BOARD_TILES.filter(t => t.island).forEach((t, i) => {
            const a = geoToBoardXZ(t.lon, t.lat), dir = t.modelType === 'PHU_QUOC2' ? 1 : -1; let b = null;
            for (let d = 2.4; d < 9; d += .3) { const q = { x: a.x + dir * d, z: a.z + (t.modelType === 'HA_LONG_PORT' ? -.4 : .2) }; if (isPointInPolygon(...toGeo(q.x, q.z), VIETNAM_BORDER_LONLAT)) { b = { x: q.x - dir * 1.2, z: q.z }; break; } }
            if (!b) return; const s = { x: a.x + dir * 2.1, z: a.z + (t.modelType === 'HA_LONG_PORT' ? -.4 : .2) }; if (Math.abs(b.x - s.x) < .8) return;
            ferry(mkShip(i % 2 ? 'trawler' : 'sail'), s, b, .18, i);
        });
        try { buildMarineLife(); } catch (e) { console.warn('marine', e); }
        // Phao tiêu nhấp nháy & hải đăng
        const C = miniCol, T = miniMat;
        [[110.2, 19.2], [110.5, 15.2], [109.9, 11.9], [107.0, 8.9], [104.2, 9.2], [108.6, 18.4], [109.9, 13.0], [112.4, 12.9]].forEach((p, i) => { const c = geoToBoardXZ(p[0], p[1]); if (!seaAt(c.x, c.z, .2)) return; const bu = new THREE.Group(); bu.position.set(c.x, .1, c.z); bu.add(new THREE.Mesh(new THREE.CylinderGeometry(.08, .12, .22, 12), C(i % 2 ? 0xd63a3a : 0xf2f2f2, .4))); const lm = new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffb000, emissiveIntensity: 1 }); const l = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), lm); l.position.y = .28; bu.add(l); scene.add(bu); _mapAnim.push(t => { lm.emissiveIntensity = .3 + Math.abs(Math.sin(t * 2 + i)) * .9; bu.position.y = .1 + Math.sin(t * 2 + i) * .02; bu.rotation.z = Math.sin(t * 1.4 + i) * .1; }); });
        [[108.75, 21.1], [105.45, 8.35], [109.75, 12.05]].forEach((p, i) => { const c = geoToBoardXZ(p[0], p[1]); if (!seaAt(c.x, c.z, 0)) return; const g = new THREE.Group(); g.position.set(c.x, .08, c.z); const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(.5, 1), T('stone', 2, 1)); rk.scale.y = .55; rk.position.y = .1; g.add(rk); [0, 1, 2].forEach(k => { const s = new THREE.Mesh(new THREE.CylinderGeometry(.12 - k * .015, .15 - k * .015, .26, 14), C(k % 2 ? 0xd63a3a : 0xffffff, .5)); s.position.y = .45 + k * .26; g.add(s); }); const lm = new THREE.MeshStandardMaterial({ color: 0xfff0a0, emissive: 0xffc030, emissiveIntensity: 1 }); const lamp = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), lm); lamp.position.y = 1.32; g.add(lamp); const cap = new THREE.Mesh(new THREE.ConeGeometry(.14, .16, 10), C(0xd63a3a)); cap.position.y = 1.47; g.add(cap); g.traverse(m => { if (m.isMesh) m.castShadow = true; }); scene.add(g); _mapAnim.push(t => { lm.emissiveIntensity = .5 + Math.abs(Math.sin(t * 1.5 + i)) * 1.2; }); });
    };
