# encoding: utf-8
def r(s, a, b, all = false) s.include?(a) or abort("missing: #{a[0,90]}"); all ? s.gsub!(a, b) : s.sub!(a, b) end
src, out, dir = ARGV
s = File.read(src, encoding: "UTF-8")
r s, 'const sgn = area > 0 ? 1 : -1, GROW = 0.45;', 'const sgn = area > 0 ? 1 : -1, GROW = 0.3;'
r s, 'if (Math.abs(lon - q.lon) < .41 && Math.abs(lat - q.lat) < .38) return q.h;', 'if (Math.abs(lon - q.lon) < 1.25 / (2.55 * GEO_K) && Math.abs(lat - q.lat) < 1.25 / (2.75 * GEO_K)) return q.h;'
r s, 'const isIslandTile = tile.index === 3 || tile.index === 11 || tile.index === 20;', 'const isIslandTile = !!tile.island;'
r s, 'const islands = [', 'const islands = window.__ISLANDS || ['
r s, 'const tableBase = new THREE.Mesh(new THREE.BoxGeometry(40, 1.0, 50), woodMat);', 'const tableBase = new THREE.Mesh(new THREE.BoxGeometry(BOARD_RECT.W + 3, 1.0, BOARD_RECT.D + 3), woodMat);'
r s, 'tableBase.position.y = -0.72;', 'tableBase.position.set(BOARD_RECT.cx, -0.72, BOARD_RECT.cz);'
r s, 'new THREE.BoxGeometry(37.8 * GEO_K, 0.36, 47.8 * GEO_K),', 'new THREE.BoxGeometry(BOARD_RECT.W + .8, 0.36, BOARD_RECT.D + .8),'
r s, 'goldRim.position.y = -0.18;', 'goldRim.position.set(BOARD_RECT.cx, -0.18, BOARD_RECT.cz);'
r s, 'const seaGeo = new THREE.BoxGeometry(37.0 * GEO_K, 0.26, 47.0 * GEO_K);', 'const seaGeo = new THREE.BoxGeometry(BOARD_RECT.W, 0.26, BOARD_RECT.D);'
r s, 'seaMesh.position.y = -0.06;', 'seaMesh.position.set(BOARD_RECT.cx, -0.06, BOARD_RECT.cz);'
r s, 'const p = actor(), W = 37 * GEO_K, D = 47 * GEO_K;', 'const p = actor(), W = BOARD_RECT.W, D = BOARD_RECT.D;'
r s, 'const sea = new THREE.Mesh(geo, mat); sea.position.y = .08;', 'const sea = new THREE.Mesh(geo, mat); sea.position.set(BOARD_RECT.cx, .14, BOARD_RECT.cz);'
r s, 'BOARD_TILES.slice(0, 22)', 'BOARD_TILES.slice(0, 24)'
r s, 'const t0 = BOARD_TILES[8]; camFrame', 'const t0 = BOARD_TILES[9]; camFrame'
r s, 'const hl = geoToBoardXZ(108.0, 20.75);', 'const hl = geoToBoardXZ(108.8, 20.35);'
r s, 'forestSpots.filter((_, i) => i % 2 === 0).forEach(', 'forestSpots.filter((s, i) => i % 2 === 0 && !BOARD_TILES.some(t => Math.hypot(geoToBoardXZ(s[0], s[1]).x - t.mapX, geoToBoardXZ(s[0], s[1]).z - t.mapZ) < 2.4)).forEach('
r s, 'karstCoords.forEach(([lon, lat, kh]) => {', 'karstCoords.filter(s => !BOARD_TILES.some(t => Math.hypot(geoToBoardXZ(s[0], s[1]).x - t.mapX, geoToBoardXZ(s[0], s[1]).z - t.mapZ) < 2.0)).forEach(([lon, lat, kh]) => {'
r s, 'const stops = [[22, 74, 40], [30, 92, 44], [40, 110, 48], [58, 128, 52], [80, 146, 56], [104, 164, 62], [132, 182, 68], [160, 198, 78], [188, 210, 96], [212, 218, 118], [230, 222, 146], [242, 228, 170], [250, 236, 190]];',
  'const stops = [[58, 166, 92], [72, 176, 90], [92, 184, 86], [116, 190, 82], [140, 194, 80], [166, 196, 84], [188, 192, 92], [204, 182, 98], [210, 166, 98], [200, 146, 92], [186, 132, 92], [214, 188, 156], [242, 236, 222]];'
s.sub!(/const baseMat = new THREE\.MeshStandardMaterial\(\{\s*color: 0x059669,/) { |m| m.sub('0x059669', '0x7c6a4a') } or abort('baseMat')
r s, 'bankGroup.position.set(-10.5, 0.25, -4.5);', 'bankGroup.position.set(DECK.x, 0.25, DECK.z - 4.5);'
r s, 'bienDongDeck.position.set(-10.5, 0.3, 0.5);', 'bienDongDeck.position.set(DECK.x, 0.3, DECK.z + 0.5);'
r s, 'banLinhDeck.position.set(-10.5, 0.3, 4.8);', 'banLinhDeck.position.set(DECK.x, 0.3, DECK.z + 4.8);'
r s, 'diceMesh.position.set(-7.2, 1.1, -1.5);', 'diceMesh.position.set(DECK.dx, 1.1, DECK.z - 1.5);'
r s, 'x: -7.2 + (Math.random() - 0.5) * 1.6, z: -1.5 + (Math.random() - 0.5) * 1.6', 'x: DECK.dx + (Math.random() - 0.5) * 1.6, z: DECK.z - 1.5 + (Math.random() - 0.5) * 1.6'
r s, '<i class="fa-solid fa-compass"></i> 36 Địa Danh', '<i class="fa-solid fa-compass"></i> 46 Địa Danh'
r s, 'Danh Mục 36 Địa Danh', 'Danh Mục 46 Địa Danh'
r s, 'Hành Trình Vòng Tròn Khép Kín 36 Địa Danh', 'Hành Trình Vòng Tròn Khép Kín 46 Địa Danh'
s.sub!(/(Mỗi người khởi nghiệp với <b>300 đồng<\/b>\. )Quân cờ đi theo vòng tròn khép kín.*?<\/p>/m) { $1 + 'Quân cờ đi theo vòng tròn khép kín qua <b>46 địa danh đặt đúng vị trí địa lý</b>: từ <b>Lăng Bác - Hà Nội (#0)</b> xuôi Duyên hải Bắc Bộ, miền Trung (ra đảo Lý Sơn #11) xuống Nam Bộ, vượt biển sang <b>Phú Quốc (#23)</b> → ngược lên Miền Tây, Đông Nam Bộ, Tây Nguyên (#24–#34) → Thành Cổ Quảng Trị, Nghệ An, Tây Bắc, Đông Bắc (#35–#45) rồi khép vòng về Hà Nội. Có 6 ô Biến Động / Bản Lĩnh và 4 Trạm Công Cụ (Vân Đồn, Tiên Sa, Cái Răng, Chợ phiên Tây Bắc).</p>' } or abort('rules')
r s, '• <b>Đất Trống:</b> Dùng tiền mặt đầu tư mua làng nghề để cắm cờ thương hiệu.<br>', '• <b>Bước 1 - Mua Đất Trống:</b> Lúc đầu các ô di sản đều là đất trống. Dừng tại ô chưa có chủ, bạn chi tiền <b>Mua Đất</b> để cắm cờ sở hữu và thu phí thuê đất cơ bản.<br>• <b>Bước 2 - Xây Dựng Làng Nghề 3D:</b> Khi đi hết vòng và <b>dẫm lại đúng vào ô đất của mình ở lượt sau</b>, bạn được quyền đầu tư <b>Xây dựng Làng nghề</b> — mô hình kiến trúc 3D của làng nghề sẽ mọc lên trên bản đồ và phí dịch vụ tăng vọt!<br>'
# Mặt đất phẳng thống nhất: bỏ sông ngòi, cây/đá bám đúng mặt đất, bệ ô cùng kích thước
r s, 'RIVERS.forEach(pts => {', '(window.__RIVERS || RIVERS).forEach(pts => {'
r s, 'const h = sampleVietnamElevation(lon, lat), delta = lat < 10.9 && lon > 104.7;', 'const h = (window.__elevShape || sampleVietnamElevation)(lon, lat), delta = lat < 10.9 && lon > 104.7;'
r s, 'kinds[k].pts.push([q.x, .36 + h * .92, q.z, k === 2 ? 1 : 0]);', 'kinds[k].pts.push([q.x, landY(lon, lat), q.z, k === 2 ? 1 : 0]);'
r s, "col: [0x2fa04a, 0x45b85a] },", "col: [0x3f5a30, 0x4f6b3a] },"
r s, "col: [0x5cc24a, 0x7ad85a, 0x3fae45] },", "col: [0x5e7a45, 0x6b7f48, 0x4f6b3a] },"
r s, "col: [0x6b4f2a] },", "col: [0x5a3e2b] },"
r s, "col: [0x2f9f5a, 0x3fb36a] }", "col: [0x46603a, 0x55703f] }"
r s, 'new THREE.MeshStandardMaterial({ color: 0x2f8f3a, roughness: .8 }), K.pts.length); K.pts', 'new THREE.MeshStandardMaterial({ color: 0x4f6b3a, roughness: .8 }), K.pts.length); K.pts'
r s, 'const tree = create3DTreeCluster(x, 0.36 + h * 0.9, z, type, sc);', 'const tree = create3DTreeCluster(x, landY(lon, lat), z, type, sc);'
r s, 'kGroup.position.set(x, 0.12, z);', 'kGroup.position.set(x, landY(lon, lat) - .02, z);'
r s, "const baseRadius = tile.type === 'START' || tile.type === 'SHOP' ? 1.28 : 1.15;", 'const baseRadius = TILE_R;'
k = %w[k1_data.js k2_map.js k2b_islands.js k3_models.js k4_monopoly.js k5_polish.js].map { |f| File.read(File.join(dir, f), encoding: "UTF-8") }.join("\n")
block = "\n    <script>\n    /* ===== K. 46 ĐỊA DANH · BẢN ĐỒ MỞ RỘNG · BIỂN & HOÀNG SA – TRƯỜNG SA ===== */\n    (function () {\n" + k + "\n    })();\n    </script>\n"
idx = s.rindex("</body>") or abort("body")
s.insert(idx, block)
File.write(out, s); puts "ok #{s.bytesize}"
