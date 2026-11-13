    /* =================================================================================
     * L. CƠ CHẾ CỜ TỶ PHÚ 2 BƯỚC: BẢN ĐỒ ĐẤT TRỐNG BAN ĐẦU -> MUA ĐẤT -> XÂY DỰNG LÀNG NGHỀ 3D
     *    · Lúc đầu toàn bộ 37 ô tài sản (PROPERTY) là Đất Trống (chưa hiện sa bàn làng nghề 3D)
     *    · Bước 1 (Lần đầu dừng ở ô đất trống): Mua Đất Quy Hoạch -> cắm cờ sở hữu, thu phí thuê đất cơ bản
     *    · Bước 2 (Khi đi hết vòng và dẫm lại vào ô đất của mình ở lượt sau): Xây Dựng Làng Nghề 3D
     *      -> Sa bàn kiến trúc 3D của làng nghề mọc lên trên bản đồ, phí dịch vụ tăng mạnh!
     * ================================================================================= */
    gameState.propertyBuilt = {};
    const tileDioramas = {};
    const tilePlotMarkers = {};
    window.tileDioramas = tileDioramas;
    window.tilePlotMarkers = tilePlotMarkers;

    // 1. Thiết lập bảng giá 2 bước cho từng ô tài sản (PROPERTY)
    BOARD_TILES.forEach(t => {
        if (t.type === 'PROPERTY') {
            t.landPrice = t.price;
            t.buildCost = Math.round(t.price * 0.65 / 5) * 5;
            t.landRent = Math.max(15, Math.round(t.price * 0.3 / 5) * 5);
            t.builtRent = Math.round(t.price * 0.85 / 5) * 5;
            t.rent = t.landRent;
        }
    });

    function isTileBuilt(idx) {
        return !!(gameState.propertyBuilt && gameState.propertyBuilt[idx]);
    }
    function propertyValueOf(idx) {
        const t = BOARD_TILES[idx];
        if (!t || t.type !== 'PROPERTY') return 0;
        return t.price + (isTileBuilt(idx) ? t.buildCost : 0);
    }
    function currentRentOf(idx) {
        const t = BOARD_TILES[idx];
        if (!t || t.type !== 'PROPERTY') return 0;
        return isTileBuilt(idx) ? t.builtRent : t.landRent;
    }

    // 2. Giữ từng sa bàn làng nghề thành nhóm riêng khi gộp khối (mergeStaticMeshes)
    //    để có thể ẩn lúc đầu và bật hiệu ứng mọc 3D khi xây dựng làng nghề
    const _createDioramaK0 = createBespokeTileDiorama;
    createBespokeTileDiorama = function (tile) {
        const g = _createDioramaK0(tile);
        tileDioramas[tile.index] = g;
        if (tile && tile.type === 'PROPERTY') {
            animatedElements.push({ type: 'DIORAMA', mesh: g });
        }
        return g;
    };

    // 3. Mô hình 3D Ô Đất Trống & Khu Đất Đã Mua Chờ Xây Làng Nghề
    function createPlotMarker3D(tile) {
        const root = new THREE.Group();
        const woodM = S(0x7a4b2a, 0.8);
        const ropeM = S(0xd6b04a, 0.6);
        const stoneM = S(0x9a968c, 0.9);

        // --- A. Nhóm hiển thị khi ĐẤT TRỐNG CHƯA CÓ CHỦ ---
        const unowned = new THREE.Group();
        const K1 = kit(unowned);
        const R = 0.74;
        [[-R, -R], [R, -R], [-R, R], [R, R]].forEach(([x, z]) => {
            K1.cyl(0.022, 0.026, 0.22, woodM, x, 0, z, 6);
            K1.sph(0.028, ropeM, x, 0.23, z, 0);
        });
        // Dây ranh giới 4 cạnh
        K1.box(R * 2, 0.012, 0.012, ropeM, 0, 0.15, -R);
        K1.box(R * 2, 0.012, 0.012, ropeM, 0, 0.15, R);
        K1.box(0.012, 0.012, R * 2, ropeM, -R, 0.15, 0);
        K1.box(0.012, 0.012, R * 2, ropeM, R, 0.15, 0);

        // Biển gỗ "ĐẤT TRỐNG" ở giữa ô
        K1.cyl(0.018, 0.02, 0.34, woodM, -0.22, 0, -0.1, 6);
        K1.cyl(0.018, 0.02, 0.34, woodM, 0.22, 0, -0.1, 6);
        const signTex = vCanvasTex('empty_plot_' + tile.index, 256, 112, (g, w, h) => {
            g.fillStyle = '#fdf3d7';
            g.fillRect(0, 0, w, h);
            g.strokeStyle = '#7a4b2a';
            g.lineWidth = 8;
            g.strokeRect(4, 4, w - 8, h - 8);
            g.fillStyle = '#7c2d12';
            g.font = '800 26px "Be Vietnam Pro", Arial';
            g.textAlign = 'center';
            g.fillText('🌱 ĐẤT TRỐNG', w / 2, 42);
            g.fillStyle = '#065f46';
            g.font = '900 28px "Be Vietnam Pro", Arial';
            g.fillText(`MUA ĐẤT: ${tile.price}Đ`, w / 2, 84);
        });
        const signBoard = new THREE.Mesh(
            new THREE.BoxGeometry(0.56, 0.24, 0.025),
            new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
        );
        signBoard.position.set(0, 0.24, -0.1);
        signBoard.castShadow = true;
        unowned.add(signBoard);

        // Đá cuội & cỏ nhỏ tự nhiên trên nền đất trống
        [[-0.45, 0.35, 0.05], [0.48, 0.28, 0.04], [-0.35, -0.45, 0.045]].forEach(([x, z, r]) => {
            const st = K1.sph(r, stoneM, x, r * 0.4, z, 0);
            st.scale.y = 0.6;
        });

        // --- B. Nhóm hiển thị khi ĐÃ MUA ĐẤT (CHỜ XÂY DỰNG LÀNG NGHỀ) ---
        const owned = new THREE.Group();
        owned.visible = false;
        const K2 = kit(owned);
        const ownerTrimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4, metalness: 0.2 });

        // Nền móng đá quy hoạch ở giữa ô đất
        K2.box(1.24, 0.035, 0.96, stoneM, 0, 0, -0.05);
        K2.box(1.16, 0.02, 0.88, S(0xd6cfc2, 0.85), 0, 0.035, -0.05);
        // Viền móng mang màu của chủ đất
        K2.box(1.26, 0.025, 0.04, ownerTrimMat, 0, 0.03, -0.52);
        K2.box(1.26, 0.025, 0.04, ownerTrimMat, 0, 0.03, 0.42);
        K2.box(0.04, 0.025, 0.96, ownerTrimMat, -0.62, 0.03, -0.05);
        K2.box(0.04, 0.025, 0.96, ownerTrimMat, 0.62, 0.03, -0.05);

        // Vật tư tập kết chờ khởi công (gạch nung, gỗ, bao vữa)
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                K2.box(0.11, 0.045, 0.07, S(0xb55338, 0.8), -0.42 + i * 0.12, 0.045 + j * 0.046, 0.18);
            }
        }
        for (let i = 0; i < 4; i++) {
            const log = K2.cyl(0.022, 0.022, 0.34, woodM, 0.38, 0.06 + (i > 2 ? 0.04 : 0), 0.12 + (i % 3) * 0.05, 8);
            log.rotation.z = Math.PI / 2;
        }

        // Bảng "ĐẤT ĐÃ MUA - CHỜ XÂY LÀNG NGHỀ"
        K2.cyl(0.02, 0.022, 0.42, woodM, -0.28, 0.04, -0.22, 6);
        K2.cyl(0.02, 0.022, 0.42, woodM, 0.28, 0.04, -0.22, 6);
        const ownedSignTex = vCanvasTex('owned_plot_' + tile.index, 320, 128, (g, w, h) => {
            g.fillStyle = '#fef3c7';
            g.fillRect(0, 0, w, h);
            g.strokeStyle = '#92400e';
            g.lineWidth = 8;
            g.strokeRect(4, 4, w - 8, h - 8);
            g.fillStyle = '#991b1b';
            g.font = '800 24px "Be Vietnam Pro", Arial';
            g.textAlign = 'center';
            g.fillText('🏳️ ĐẤT ĐÃ CÓ CHỦ', w / 2, 38);
            g.fillStyle = '#1e3a8a';
            g.font = '800 22px "Be Vietnam Pro", Arial';
            g.fillText('Chờ xây dựng Làng nghề', w / 2, 72);
            g.fillStyle = '#065f46';
            g.font = '900 22px "Be Vietnam Pro", Arial';
            g.fillText(`Phí xây: ${tile.buildCost}đ -> Thu: ${tile.builtRent}đ`, w / 2, 106);
        });
        const ownedBoard = new THREE.Mesh(
            new THREE.BoxGeometry(0.68, 0.28, 0.03),
            new THREE.MeshStandardMaterial({ map: ownedSignTex, roughness: 0.45 })
        );
        ownedBoard.position.set(0, 0.3, -0.22);
        ownedBoard.castShadow = true;
        owned.add(ownedBoard);

        const roofCap = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.035, 0.09), ownerTrimMat);
        roofCap.position.set(0, 0.455, -0.22);
        owned.add(roofCap);

        root.add(unowned, owned);
        root.userData = { unowned, owned, ownerTrimMat };
        return root;
    }

    // 4. Cập nhật huy hiệu 3D phía trước mỗi ô theo trạng thái (Đất trống / Đã mua đất / Đã xây làng nghề)
    function updateTile3DBadge(idx) {
        const item = tileLabelSprites[idx];
        const tile = BOARD_TILES[idx];
        if (!item || !item.sprite || !tile) return;

        const ownerId = gameState.propertyOwners[idx];
        const owner = ownerId !== undefined ? PLAYERS[ownerId] : null;
        const built = isTileBuilt(idx);
        const shortName = tile.name.replace(/Làng |Vườn |Cánh Đồng |Đồi /g, '');

        const c = document.createElement('canvas');
        c.width = 384;
        c.height = 112;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(28, 18, 10, 0.9)';
        ctx.strokeStyle = built ? '#fde047' : (owner ? owner.color : '#fbbf24');
        ctx.lineWidth = built ? 8 : 6;
        ctx.beginPath();
        ctx.roundRect(6, 8, 372, 96, 48);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = owner ? owner.color : tile.color;
        ctx.beginPath();
        ctx.arc(54, 56, 38, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 30px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(built ? '🏯' : `${idx}`, 54, 58);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#fef3c7';
        ctx.font = '800 25px "Be Vietnam Pro", sans-serif';
        ctx.fillText(shortName.slice(0, 16), 104, tile.type === 'PROPERTY' ? 42 : 58);

        if (tile.type === 'PROPERTY') {
            if (owner === null) {
                ctx.fillStyle = '#6ee7b7';
                ctx.font = '700 21px "Be Vietnam Pro", sans-serif';
                ctx.fillText(`Đất trống: ${tile.price}đ`, 104, 76);
            } else if (!built) {
                ctx.fillStyle = '#fcd34d';
                ctx.font = '700 20px "Be Vietnam Pro", sans-serif';
                ctx.fillText(`Đất ${owner.shortName} • Thuê ${tile.landRent}đ`, 104, 76);
            } else {
                ctx.fillStyle = '#fde047';
                ctx.font = '800 20px "Be Vietnam Pro", sans-serif';
                ctx.fillText(`Làng nghề • Phí ${tile.builtRent}đ`, 104, 76);
            }
        }

        const oldMap = item.sprite.material.map;
        item.sprite.material.map = new THREE.CanvasTexture(c);
        item.sprite.material.needsUpdate = true;
        if (oldMap && oldMap.dispose) oldMap.dispose();
    }

    // 5. Đồng bộ trạng thái 3D của 1 ô (Ẩn/Hiện sa bàn Làng nghề 3D & Cọc mốc đất trống)
    function syncTile3DState(tileIndex, animateBuild) {
        const tile = BOARD_TILES[tileIndex];
        if (!tile || tile.type !== 'PROPERTY') return;

        tile.rent = currentRentOf(tileIndex);
        const ownerId = gameState.propertyOwners[tileIndex];
        const built = isTileBuilt(tileIndex);
        const d = tileDioramas[tileIndex];
        const pm = tilePlotMarkers[tileIndex];

        if (ownerId === undefined) {
            if (d) d.visible = false;
            if (pm) {
                pm.visible = true;
                pm.userData.unowned.visible = true;
                pm.userData.owned.visible = false;
            }
        } else if (!built) {
            if (d) d.visible = false;
            if (pm) {
                pm.visible = true;
                pm.userData.unowned.visible = false;
                pm.userData.owned.visible = true;
                const owner = PLAYERS[ownerId];
                if (owner && pm.userData.ownerTrimMat) {
                    pm.userData.ownerTrimMat.color.setHex(owner.hex);
                }
                if (animateBuild === 'LAND') {
                    pm.userData.owned.scale.set(0.01, 0.01, 0.01);
                    gsap.to(pm.userData.owned.scale, {
                        x: 1, y: 1, z: 1, duration: 0.65, ease: 'back.out(1.6)',
                        onComplete: () => { if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true; }
                    });
                } else {
                    pm.userData.owned.scale.set(1, 1, 1);
                }
            }
        } else {
            if (pm) pm.visible = false;
            if (d) {
                d.visible = true;
                if (animateBuild === 'VILLAGE' || animateBuild === true) {
                    d.scale.set(0.01, 0.01, 0.01);
                    gsap.to(d.scale, {
                        x: 0.95, y: 0.95, z: 0.95,
                        duration: 0.95,
                        ease: 'elastic.out(1, 0.55)',
                        onUpdate: () => { if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true; },
                        onComplete: () => { if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true; }
                    });
                    const owner = PLAYERS[ownerId];
                    if (owner) tileCelebrate(tileIndex, owner.hex);
                    try {
                        const topPos = tileTop(tileIndex);
                        ring(topPos, 0xfacc15, 1600, 2.6);
                        burstSprites(topPos.clone().add(new THREE.Vector3(0, 0.5, 0)), ['🏗️', '🏯', '✨', tile.icon || '🏺'], 16, { speed: 2.0, life: 1900 });
                    } catch (e) {}
                } else {
                    d.scale.setScalar(0.95);
                }
            }
            // Thêm đỉnh sao vàng trên cờ thương hiệu khi đã xây dựng Làng nghề
            const fg = ownerFlags[tileIndex];
            if (fg && !fg.userData.hasStar) {
                const star = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.16, 0),
                    new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.2 })
                );
                star.position.set(0, 1.78, 0);
                fg.add(star);
                fg.userData.hasStar = true;
            }
        }

        updateTile3DBadge(tileIndex);
        if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
    }
    window.syncTile3DState = syncTile3DState;

    // 6. Cờ sở hữu & Xóa cờ sở hữu
    const _spawnBanner0 = spawnOwnerBannerOnTile;
    spawnOwnerBannerOnTile = function (tileIndex, ownerId) {
        _spawnBanner0(tileIndex, ownerId);
        syncTile3DState(tileIndex, isTileBuilt(tileIndex) ? false : 'LAND');
    };

    const _removeBanner0 = removeOwnerBannerFromTile;
    removeOwnerBannerFromTile = function (tileIndex) {
        if ( gameState.propertyBuilt ) delete gameState.propertyBuilt[tileIndex];
        _removeBanner0(tileIndex);
        syncTile3DState(tileIndex, false);
    };

    // 7. Hỗ trợ định tuyến hộp thoại cho chế độ Online nhiều máy
    function withNetRouting(fn) {
        return async function (player) {
            const prev = NET.routed;
            NET.routed = (NET.role === 'host' && player && player.remote) ? player : (prev && player === prev ? prev : null);
            try { return await fn.apply(this, arguments); } finally { NET.routed = prev; }
        };
    }

    // 8. BƯỚC 1: MUA ĐẤT QUY HOẠCH (Khi dừng ở ô đất trống chưa có chủ)
    completePropertyPurchase = function (player, tile, pricePaid) {
        player.cash -= pricePaid;
        if (!player.properties.includes(tile.index)) player.properties.push(tile.index);
        gameState.propertyOwners[tile.index] = player.id;
        delete gameState.propertyBuilt[tile.index];
        tile.rent = tile.landRent;

        playSFX('coin');
        spawnOwnerBannerOnTile(tile.index, player.id);
        updateAllHUD();
        updateTileInspector(tile.index);

        addLog(`🏳️ <b>${player.shortName}</b> chi <b>${pricePaid} đồng</b> mua đất quy hoạch tại <b>${tile.name} (${tile.region})</b>! <i>(Quay lại ô này ở vòng sau để Xây dựng Làng nghề 3D)</i>`, '🌱', 'text-emerald-300 font-semibold');
        showBanner(`${player.shortName} đã mua đất ${tile.name}!`, '🏳️', 2000);
    };

    handleUnownedProperty = withNetRouting(async function (player, tile) {
        const hasBargainCard = player.skills.includes('THANH_MAC_CA');
        const discountedPrice = Math.round(tile.price * 0.7);

        if (player.isNPC) {
            await sleep(900);
            let finalPrice = player.discountActive ? discountedPrice : tile.price;

            if (!player.discountActive && hasBargainCard && player.cash >= discountedPrice + 60) {
                const sIdx = player.skills.indexOf('THANH_MAC_CA');
                player.skills.splice(sIdx, 1);
                finalPrice = discountedPrice;
                addLog(`<b>${player.shortName}</b> tung thẻ <b>"Thánh Mặc Cả"</b> giảm 30% giá mua đất ${tile.name} còn <b>${finalPrice} đồng</b>!`, '🏷️', 'text-amber-300');
            }

            if (player.cash - finalPrice >= 70) {
                player.discountActive = false;
                completePropertyPurchase(player, tile, finalPrice);
                await sleep(1000);
            } else {
                addLog(`<b>${player.shortName}</b> cân nhắc dòng tiền và quyết định chưa mua đất <b>${tile.name}</b>.`, '🤔');
                showBanner(`${player.shortName} giữ tiền mặt dự phòng`, '🤔', 1400);
                await sleep(800);
            }
            return;
        }

        const currentPrice = player.discountActive ? discountedPrice : tile.price;
        const canAfford = player.cash >= currentPrice;

        return new Promise(resolve => {
            openModal(`
                <div class="text-center">
                    <span class="px-3 py-1 rounded-full bg-emerald-800 text-emerald-100 text-xs font-extrabold uppercase tracking-wider">🌱 Bước 1: Ô Đất Trống • ${tile.region}</span>
                    <div class="text-5xl my-3">${tile.icon}</div>
                    <h2 class="font-serif-vn font-extrabold text-2xl text-amber-950">${tile.name}</h2>
                    <p class="text-xs text-amber-900/85 mt-1">Mảnh đất này đang trống! Hãy <b>Mua đất</b> để cắm cờ chủ quyền. Khi đi hết vòng và quay lại ô đất này ở lượt sau, bạn sẽ được <b>Xây dựng Làng nghề 3D</b>!</p>

                    <div class="bg-amber-900/10 border border-amber-800/30 rounded-2xl p-3.5 my-4 text-left space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">🌱 Giá Mua Đất (Bước 1):</span>
                            <span class="font-black text-base text-emerald-800">${currentPrice} đồng ${player.discountActive ? '(Đã giảm 30%)' : ''}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">🏳️ Phí cho thuê đất trống:</span>
                            <span class="font-bold text-amber-800">${tile.landRent} đồng / lượt khách</span>
                        </div>
                        <div class="flex justify-between items-center border-t border-amber-800/15 pt-1.5">
                            <span class="font-semibold text-amber-900">🏯 Xây Làng nghề ở vòng sau (Bước 2):</span>
                            <span class="font-extrabold text-red-700">+${tile.buildCost}đ → Thu ${tile.builtRent}đ/lượt</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">🛠️ Công cụ làng nghề:</span>
                            <span class="font-bold text-teal-900">${tile.toolSpec}</span>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-2.5 justify-center mt-4">
                        ${hasBargainCard && !player.discountActive ? `
                            <button id="modal-btn-bargain" class="bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold px-4 py-2.5 rounded-xl border-2 border-amber-700 text-xs shadow">
                                🏷️ Dùng "Thánh Mặc Cả" (Mua đất ${discountedPrice}đ)
                            </button>
                        ` : ''}
                        <button id="modal-btn-buy" ${canAfford ? '' : 'disabled'} class="wood-btn px-5 py-2.5 rounded-xl font-extrabold text-sm flex-1">
                            🌱 Mua Đất Quy Hoạch (${currentPrice}đ)
                        </button>
                        <button id="modal-btn-pass" class="bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold px-4 py-2.5 rounded-xl text-sm">
                            Bỏ Qua
                        </button>
                    </div>
                </div>
            `);

            const bargainBtn = document.getElementById('modal-btn-bargain');
            if (bargainBtn) {
                bargainBtn.onclick = () => {
                    if (player.cash < discountedPrice) return;
                    const sIdx = player.skills.indexOf('THANH_MAC_CA');
                    if (sIdx > -1) player.skills.splice(sIdx, 1);
                    closeModal();
                    completePropertyPurchase(player, tile, discountedPrice);
                    resolve();
                };
            }

            document.getElementById('modal-btn-buy').onclick = () => {
                if (player.cash < currentPrice) return;
                player.discountActive = false;
                closeModal();
                completePropertyPurchase(player, tile, currentPrice);
                resolve();
            };

            document.getElementById('modal-btn-pass').onclick = () => {
                closeModal();
                addLog(`<b>${player.shortName}</b> quyết định giữ tiền mặt, chưa mua đất tại <b>${tile.name}</b>.`, '👣');
                resolve();
            };
        });
    });

    // 9. BƯỚC 2: XÂY DỰNG LÀNG NGHỀ 3D (Khi đi hết vòng và dẫm lại đúng vào ô đất của mình)
    function completeVillageBuild(player, tile, costPaid) {
        player.cash -= costPaid;
        gameState.propertyBuilt[tile.index] = true;
        tile.rent = tile.builtRent;

        playSFX('build');
        syncTile3DState(tile.index, 'VILLAGE');
        updateAllHUD();
        updateTileInspector(tile.index);

        addLog(`🏯 <b>${player.shortName}</b> đầu tư <b>${costPaid} đồng</b> chính thức <b>Xây dựng ${tile.name}</b>! Mô hình kiến trúc 3D đã hiện lên trên bản đồ (Phí dịch vụ tăng lên <b>${tile.builtRent}đ</b>)!`, '🏗️', 'text-amber-300 font-semibold');
        showBanner(`🏯 Đã xây dựng ${tile.name}!`, tile.icon, 2400);
    }
    window.completeVillageBuild = completeVillageBuild;

    const handleOwnPropertyBuild = withNetRouting(async function (player, tile) {
        const hasBargainCard = player.skills.includes('THANH_MAC_CA');
        const discountedBuild = Math.round(tile.buildCost * 0.7);

        if (player.isNPC) {
            await sleep(900);
            let finalCost = player.discountActive ? discountedBuild : tile.buildCost;
            if (!player.discountActive && hasBargainCard && player.cash >= discountedBuild + 50) {
                const sIdx = player.skills.indexOf('THANH_MAC_CA');
                player.skills.splice(sIdx, 1);
                finalCost = discountedBuild;
                addLog(`<b>${player.shortName}</b> dùng thẻ <b>"Thánh Mặc Cả"</b> giảm 30% chi phí xây dựng ${tile.name} còn <b>${finalCost} đồng</b>!`, '🏷️', 'text-amber-300');
            }

            if (player.cash - finalCost >= 50) {
                player.discountActive = false;
                completeVillageBuild(player, tile, finalCost);
                await sleep(1100);
            } else {
                addLog(`<b>${player.shortName}</b> quay lại mảnh đất <b>${tile.name}</b> nhưng tạm giữ tiền mặt, hẹn lượt sau xây dựng Làng nghề.`, '🏗️');
                showBanner(`${player.shortName} chưa đủ vốn xây ${tile.name}`, '⏳', 1500);
                await sleep(700);
            }
            return;
        }

        const currentCost = player.discountActive ? discountedBuild : tile.buildCost;
        const canAfford = player.cash >= currentCost;

        return new Promise(resolve => {
            openModal(`
                <div class="text-center">
                    <span class="px-3 py-1 rounded-full bg-amber-600 text-amber-950 text-xs font-extrabold uppercase tracking-wider">🏗️ Bước 2: Xây Dựng Làng Nghề 3D • Đất Của Bạn</span>
                    <div class="text-5xl my-3">${tile.icon}</div>
                    <h2 class="font-serif-vn font-extrabold text-2xl text-amber-950">Khởi Công ${tile.name}</h2>
                    <p class="text-xs text-amber-900/85 mt-1">Bạn đã hoàn thành vòng đi và quay trở lại mảnh đất của mình! Hãy đầu tư <b>Xây dựng Làng nghề</b> để dựng mô hình kiến trúc 3D trên bản đồ và nâng cấp phí dịch vụ.</p>

                    <div class="bg-amber-900/15 border-2 border-amber-700/40 rounded-2xl p-3.5 my-4 text-left space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">🏗️ Chi phí Xây dựng Làng nghề:</span>
                            <span class="font-black text-base text-emerald-800">${currentCost} đồng ${player.discountActive ? '(Đã giảm 30%)' : ''}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">📈 Phí thu khách nâng cấp:</span>
                            <span class="font-extrabold text-red-700">Từ ${tile.landRent}đ → ${tile.builtRent} đồng / lượt</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">💎 Tổng giá trị di sản sau xây:</span>
                            <span class="font-bold text-amber-950">${tile.price + tile.buildCost} đồng</span>
                        </div>
                        <div class="pt-1.5 border-t border-amber-800/20 italic text-amber-950">
                            <b>Tình huống mở khóa khi xây xong:</b> "${tile.situation}"
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-2.5 justify-center mt-4">
                        ${hasBargainCard && !player.discountActive ? `
                            <button id="modal-btn-bargain-build" class="bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold px-4 py-2.5 rounded-xl border-2 border-amber-700 text-xs shadow">
                                🏷️ Dùng "Thánh Mặc Cả" (Xây giá ${discountedBuild}đ)
                            </button>
                        ` : ''}
                        <button id="modal-btn-build" ${canAfford ? '' : 'disabled'} class="wood-btn px-5 py-2.5 rounded-xl font-extrabold text-sm flex-1">
                            🏯 Xây Dựng Làng Nghề 3D (${currentCost}đ)
                        </button>
                        <button id="modal-btn-pass" class="bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold px-4 py-2.5 rounded-xl text-sm">
                            Để Lượt Sau
                        </button>
                    </div>
                </div>
            `);

            const bargainBtn = document.getElementById('modal-btn-bargain-build');
            if (bargainBtn) {
                bargainBtn.onclick = () => {
                    if (player.cash < discountedBuild) return;
                    const sIdx = player.skills.indexOf('THANH_MAC_CA');
                    if (sIdx > -1) player.skills.splice(sIdx, 1);
                    closeModal();
                    completeVillageBuild(player, tile, discountedBuild);
                    resolve();
                };
            }

            document.getElementById('modal-btn-build').onclick = () => {
                if (player.cash < currentCost) return;
                player.discountActive = false;
                closeModal();
                completeVillageBuild(player, tile, currentCost);
                resolve();
            };

            document.getElementById('modal-btn-pass').onclick = () => {
                closeModal();
                addLog(`<b>${player.shortName}</b> ghé thăm mảnh đất <b>${tile.name}</b> và để dành vốn xây dựng Làng nghề vào lượt sau.`, '🏡');
                resolve();
            };
        });
    });
    window.handleOwnPropertyBuild = handleOwnPropertyBuild;

    // 10. KHÁCH GHÉ THĂM ĐẤT / LÀNG NGHỀ CỦA NGƯỜI KHÁC
    handleVisitorOnOwnedProperty = withNetRouting(async function (visitor, tile, owner) {
        const built = isTileBuilt(tile.index);
        const isDouble = owner.doubleRentTurns > 0;
        const baseRent = built ? tile.builtRent : tile.landRent;
        const rentFee = isDouble ? baseRent * 2 : baseRent;
        const matchingToolIdx = visitor.tools.indexOf(tile.toolId);
        const vipSkillIdx = visitor.skills.indexOf('VE_VIP');
        const toolInfo = TOOL_CATEGORIES[tile.toolId];
        const feeLabel = built ? `phí trải nghiệm Làng nghề ${tile.name}` : `phí thuê đất tại ${tile.name}`;

        if (visitor.isNPC) {
            await sleep(1000);
            if (matchingToolIdx > -1) {
                visitor.tools.splice(matchingToolIdx, 1);
                playSFX('card');
                addLog(`🛠️ <b>${visitor.shortName}</b> bước vào <b>${tile.name}</b> và tung thẻ <b>"${toolInfo.shortName}"</b> tự giải quyết tình huống làm nghề -> <b>Miễn phí!</b>`, '✨', 'text-teal-300 font-semibold');
                showBanner(`${visitor.shortName} dùng Công cụ -> Miễn phí!`, '🛠️', 2000);
                updateAllHUD();
                await sleep(1000);
                return;
            }
            if (vipSkillIdx > -1) {
                visitor.skills.splice(vipSkillIdx, 1);
                playSFX('card');
                addLog(`🎫 <b>${visitor.shortName}</b> trình <b>"Vé Tham Quan VIP"</b> tại <b>${tile.name}</b> -> <b>Miễn phí!</b>`, '🎫', 'text-amber-300 font-semibold');
                showBanner(`${visitor.shortName} dùng Vé VIP -> Miễn phí!`, '🎫', 2000);
                updateAllHUD();
                await sleep(1000);
                return;
            }
            await processPaymentOrBankruptcy(visitor, owner, rentFee, feeLabel);
            return;
        }

        return new Promise(resolve => {
            openModal(`
                <div class="text-center">
                    <span class="px-3 py-1 rounded-full ${built ? 'bg-red-800 text-amber-100' : 'bg-amber-800 text-amber-100'} text-xs font-extrabold uppercase">
                        ${built ? `🏯 Làng Nghề Đã Xây Dựng • Sở hữu bởi ${owner.shortName}` : `🏳️ Đất Đã Có Chủ (Chưa xây Làng nghề) • Sở hữu bởi ${owner.shortName}`}
                    </span>
                    <div class="text-5xl my-3">${tile.icon}</div>
                    <h2 class="font-serif-vn font-extrabold text-2xl text-amber-950">${tile.name}</h2>

                    <div class="bg-amber-900/15 border-2 border-amber-800/40 rounded-2xl p-4 my-3 text-left">
                        <div class="text-xs font-extrabold uppercase text-amber-900 mb-1">
                            ${built ? '📜 Tình Huống Trải Nghiệm Làng Nghề:' : '🌱 Khu Đất Quy Hoạch Làng Nghề:'}
                        </div>
                        <p class="text-sm font-semibold text-amber-950 italic">
                            ${built ? `"${tile.situation}"` : `"Mảnh đất tại ${tile.name} đã thuộc quyền sở hữu của ${owner.shortName} nhưng chưa xây dựng Làng nghề nên chỉ thu phí thuê đất cơ bản."`}
                        </p>
                        <div class="mt-3 pt-2 border-t border-amber-800/20 flex justify-between items-center text-xs">
                            <span>Công cụ hóa giải: <b>${tile.toolSpec}</b></span>
                            <span class="text-red-800 font-extrabold text-sm">${built ? 'Phí Làng nghề' : 'Phí thuê đất'}: ${rentFee}đ ${isDouble ? '(x2 Được mùa)' : ''}</span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2.5 mt-4">
                        ${matchingToolIdx > -1 ? `
                            <button id="modal-use-tool" class="bg-teal-700 hover:bg-teal-600 text-white font-extrabold px-5 py-3 rounded-xl border-2 border-teal-300 shadow-lg text-sm">
                                🛠️ Tung Thẻ "${toolInfo.shortName}" -> Tự Làm Nghề & MIỄN PHÍ (0đ)
                            </button>
                        ` : ''}
                        ${vipSkillIdx > -1 ? `
                            <button id="modal-use-vip" class="bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold px-5 py-3 rounded-xl border-2 border-amber-800 shadow-lg text-sm">
                                🎫 Dùng Thẻ "Vé Tham Quan VIP" -> MIỄN PHÍ (0đ)
                            </button>
                        ` : ''}
                        <button id="modal-pay-rent" class="wood-btn px-5 py-3 rounded-xl font-extrabold text-sm">
                            💸 Trả ${built ? 'Phí Dịch Vụ Làng Nghề' : 'Phí Thuê Đất'} (${rentFee} đồng)
                        </button>
                    </div>
                </div>
            `);

            const btnTool = document.getElementById('modal-use-tool');
            if (btnTool) {
                btnTool.onclick = () => {
                    visitor.tools.splice(matchingToolIdx, 1);
                    playSFX('card');
                    closeModal();
                    addLog(`🛠️ <b>${visitor.shortName}</b> đã dùng thẻ <b>${toolInfo.shortName}</b> hóa giải tình huống tại <b>${tile.name}</b> và bảo toàn tiền mặt!`, '✨', 'text-teal-300 font-semibold');
                    showBanner('Hóa giải tình huống -> Miễn phí!', '🛠️', 1800);
                    updateAllHUD();
                    resolve();
                };
            }

            const btnVip = document.getElementById('modal-use-vip');
            if (btnVip) {
                btnVip.onclick = () => {
                    visitor.skills.splice(vipSkillIdx, 1);
                    playSFX('card');
                    closeModal();
                    addLog(`🎫 <b>${visitor.shortName}</b> dùng <b>Vé Tham Quan VIP</b> được miễn phí hoàn toàn tại <b>${tile.name}</b>!`, '🎫', 'text-amber-300 font-semibold');
                    showBanner('Vé VIP -> Miễn phí dịch vụ!', '🎫', 1800);
                    updateAllHUD();
                    resolve();
                };
            }

            document.getElementById('modal-pay-rent').onclick = async () => {
                closeModal();
                await processPaymentOrBankruptcy(visitor, owner, rentFee, feeLabel);
                resolve();
            };
        });
    });

    // 11. Xử lý khi dừng tại một ô trên bàn cờ (Kết nối Bước 1 & Bước 2)
    resolveTileTouchpoint = async function (player, tile) {
        if (tile.type === 'START') {
            await sleep(500);
            return;
        }
        if (tile.type === 'PROPERTY') {
            const ownerId = gameState.propertyOwners[tile.index];
            if (ownerId === undefined) {
                await handleUnownedProperty(player, tile);
            } else if (ownerId !== player.id) {
                await handleVisitorOnOwnedProperty(player, tile, PLAYERS[ownerId]);
            } else {
                // Chủ đất dẫm lại vào ô đất của chính mình ở vòng sau!
                if (!isTileBuilt(tile.index)) {
                    await handleOwnPropertyBuild(player, tile);
                } else {
                    tileCelebrate(tile.index, player.hex);
                    addLog(`🏯 <b>${player.shortName}</b> ghé thăm Làng nghề <b>${tile.name}</b> trù phú của chính mình.`, '🏡', 'text-emerald-200');
                    await sleep(600);
                }
            }
            return;
        }
        if (tile.type === 'SHOP') {
            await handleToolShopVisit(player, tile);
            return;
        }
        if (tile.type === 'BIEN_DONG') {
            await handleBienDongDraw(player);
            return;
        }
        if (tile.type === 'BAN_LINH') {
            await handleBanLinhDraw(player);
            return;
        }
    };

    // 12. Cập nhật Giá trị tài sản, Thế chấp, Phá sản & Kiểm kê cuối ván
    netWorth = function (p) {
        return p.cash + p.properties.reduce((t, i) => t + propertyValueOf(i), 0);
    };

    declareBankruptcy = withNetRouting(async function (payer, creditor, why) {
        payer.bankrupt = true;
        const props = [...payer.properties];
        payer.properties = []; payer.tools = []; payer.skills = [];
        if (creditor) creditor.cash += payer.cash;
        payer.cash = 0;
        props.forEach(i => {
            const wasBuilt = isTileBuilt(i);
            removeOwnerBannerFromTile(i);
            if (creditor) {
                creditor.properties.push(i);
                gameState.propertyOwners[i] = creditor.id;
                if (wasBuilt) gameState.propertyBuilt[i] = true;
                spawnOwnerBannerOnTile(i, creditor.id);
                syncTile3DState(i, false);
            } else {
                delete gameState.propertyOwners[i];
                delete gameState.propertyBuilt[i];
                syncTile3DState(i, false);
            }
        });
        playSFX('penalty');
        const pw = playerPawns[payer.id];
        gsap.to(pw.rotation, { y: '+=12', duration: 1.2 });
        gsap.to(pw.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.2, ease: 'back.in(2)', onComplete: () => { pw.visible = false; } });
        addLog(`💥 <b>${payer.shortName}</b> PHÁ SẢN (${why})! ${creditor ? `Toàn bộ tiền và <b>${props.length} ô di sản</b> chuyển cho <b>${creditor.shortName}</b>.` : `<b>${props.length} ô di sản</b> được trả về thị trường thành Đất trống.`}`, '💥', 'text-red-400 font-extrabold');
        showBanner(`${payer.shortName} đã phá sản!`, '💥', 2500);
        updateAllHUD();
        await sleep(1400);
        const survivors = PLAYERS.filter(p => p.active && !p.bankrupt);
        if (survivors.length <= 1) { finishGameAndAudit('Chỉ còn 1 người chơi trụ lại trên bàn cờ!', survivors[0] && survivors[0].id); return; }
        if (!payer.isNPC && PLAYERS.some(p => p.active && !p.isNPC && !p.bankrupt)) return;
        if (!payer.isNPC) {
            openModal(`<div class="text-center"><div class="text-5xl">💀</div>
                <h2 class="font-serif-vn font-extrabold text-2xl text-red-900 mt-2">${payer.shortName} đã phá sản!</h2>
                <p class="text-xs text-amber-950 mt-1">Bạn không còn đủ tiền và di sản để thanh toán. Ván đấu vẫn tiếp tục giữa các thương khách còn lại.</p>
                <button onclick="closeModal()" class="wood-btn mt-4 py-3 rounded-xl font-extrabold text-sm w-full">👁️ Xem Tiếp Ván Đấu</button></div>`);
        }
    });

    promptUserMortgageModal = withNetRouting(function (user, neededAmount) {
        return new Promise(resolve => {
            const listHTML = user.properties.map(tIdx => {
                const t = BOARD_TILES[tIdx];
                const built = isTileBuilt(tIdx);
                const val = propertyValueOf(tIdx);
                return `
                    <div class="bg-amber-950/10 border border-amber-800/30 p-3 rounded-xl flex justify-between items-center">
                        <div class="text-left">
                            <div class="font-bold text-sm text-amber-950">${t.icon} ${t.name} <span class="text-[10px] px-1.5 py-0.5 rounded-full ${built ? 'bg-amber-600 text-white' : 'bg-stone-500 text-white'}">${built ? '🏯 Đã xây Làng nghề' : '🏳️ Đất trống'}</span></div>
                            <div class="text-xs text-amber-900/70">Giá trị thu hồi từ Ngân hàng: <b class="text-emerald-800">+${val} đồng</b></div>
                        </div>
                        <button onclick="confirmUserMortgage(${tIdx})" class="wood-btn px-3.5 py-2 rounded-xl text-xs font-extrabold">
                            Bán Thế Chấp (+${val}đ)
                        </button>
                    </div>
                `;
            }).join('');

            openModal(`
                <div class="text-center">
                    <span class="px-3 py-1 rounded-full bg-red-800 text-white text-xs font-extrabold uppercase">Cảnh Báo Thanh Khoản</span>
                    <h2 class="font-serif-vn font-extrabold text-2xl text-red-900 mt-2">Thiếu Tiền Mặt Thanh Toán!</h2>
                    <p class="text-xs text-amber-950 mt-1">Bạn còn thiếu <b class="text-red-700 text-sm">${neededAmount} đồng</b>. Hãy chọn bán thế chấp một Ô Di Sản lại cho Ngân hàng:</p>
                    <div class="space-y-2 my-4 max-h-60 overflow-y-auto pr-1">
                        ${listHTML}
                    </div>
                </div>
            `);

            window.confirmUserMortgage = (tileIdx) => {
                const idxInArr = user.properties.indexOf(tileIdx);
                if (idxInArr > -1) user.properties.splice(idxInArr, 1);
                const t = BOARD_TILES[tileIdx];
                const val = propertyValueOf(tileIdx);
                user.cash += val;
                delete gameState.propertyOwners[tileIdx];
                delete gameState.propertyBuilt[tileIdx];
                removeOwnerBannerFromTile(tileIdx);
                playSFX('coin');
                addLog(`🏦 <b>${user.shortName}</b> đã bán thế chấp <b>${t.name}</b> cho Ngân hàng để nhận <b>+${val} đồng</b> thanh khoản.`, '🏦', 'text-amber-300');
                closeModal();
                updateAllHUD();
                resolve();
            };
        });
    });

    processPaymentOrBankruptcy = async function (payer, receiver, amount, reasonText) {
        if (netWorth(payer) < amount) {
            addLog(`⚠️ <b>${payer.shortName}</b> không đủ khả năng chi trả <b>${amount} đồng</b> (${reasonText}).`, '⚠️', 'text-red-300');
            await declareBankruptcy(payer, receiver, reasonText);
            return;
        }
        while (payer.cash < amount && payer.properties.length > 0) {
            if (payer.isNPC) {
                // NPC ưu tiên bán ô đất chưa xây làng nghề trước
                payer.properties.sort((a, b) => (isTileBuilt(a) ? 1 : 0) - (isTileBuilt(b) ? 1 : 0));
                const soldTileIdx = payer.properties.shift();
                const soldTile = BOARD_TILES[soldTileIdx];
                const val = propertyValueOf(soldTileIdx);
                payer.cash += val;
                delete gameState.propertyOwners[soldTileIdx];
                delete gameState.propertyBuilt[soldTileIdx];
                removeOwnerBannerFromTile(soldTileIdx);
                addLog(`🏦 Do thiếu tiền mặt, <b>${payer.shortName}</b> phải bán thế chấp <b>${soldTile.name}</b> lại cho Ngân hàng thu về <b>${val} đồng</b>.`, '⚠️', 'text-amber-300');
                updateAllHUD();
                await sleep(800);
            } else {
                await promptUserMortgageModal(payer, amount - payer.cash);
            }
        }
        if (payer.cash >= amount) {
            payer.cash -= amount;
            if (receiver) {
                receiver.cash += amount;
                playSFX('coin');
                addLog(`💸 <b>${payer.shortName}</b> trả <b>${amount} đồng</b> ${reasonText} cho <b>${receiver.shortName}</b>.`, '💸');
                showBanner(`${payer.shortName} trả ${amount}đ cho ${receiver.shortName}`, '💸', 1800);
            } else {
                playSFX('penalty');
                addLog(`🏦 <b>${payer.shortName}</b> nộp <b>${amount} đồng</b> (${reasonText}) vào Ngân hàng.`, '🏦');
            }
            updateAllHUD();
            await sleep(700);
        } else {
            await declareBankruptcy(payer, receiver, reasonText);
        }
    };

    // 13. Cập nhật giao diện Inspector, Tooltip rê chuột, Danh mục 47 địa danh & Luật chơi
    updateTileInspector = function (tileIndex) {
        gameState.selectedTileIndex = tileIndex;
        const tile = BOARD_TILES[tileIndex];
        const canvas = document.getElementById('insp-Disconnect-canvas');
        renderTileArtToCanvas(tile, canvas);

        const ownerId = gameState.propertyOwners[tileIndex];
        const built = isTileBuilt(tileIndex);
        let ownerText = tile.region || 'Ô Chức Năng';
        if (tile.type === 'PROPERTY') {
            if (ownerId === undefined) ownerText = '🌱 Đất trống chưa mua';
            else if (!built) ownerText = `🏳️ Đất: ${PLAYERS[ownerId].shortName} (Chờ xây)`;
            else ownerText = `🏯 Làng nghề: ${PLAYERS[ownerId].shortName}`;
        }

        document.getElementById('insp-badge').textContent = `#${tileIndex} • ${ownerText}`;
        document.getElementById('insp-title').textContent = tile.name;

        const statsEl = document.getElementById('insp-stats');
        if (tile.type === 'PROPERTY') {
            const statusLabel = ownerId === undefined
                ? `🌱 Đất trống quy hoạch tại ${tile.region}.`
                : (!built
                    ? `🏳️ Đất của ${PLAYERS[ownerId].shortName} • Quay lại lượt sau để xây Làng nghề (+${tile.buildCost}đ).`
                    : `🏯 Làng nghề 3D đã xây dựng bởi ${PLAYERS[ownerId].shortName}.`);
            document.getElementById('insp-desc').textContent = statusLabel;
            statsEl.classList.remove('hidden');
            document.getElementById('insp-price').textContent = `Đất ${tile.price}đ + Xây ${tile.buildCost}đ`;
            document.getElementById('insp-rent').textContent = `${built ? tile.builtRent : tile.landRent}đ ${built ? '(Làng nghề)' : '(Đất trống)'}`;
            document.getElementById('insp-tool').textContent = `${tile.toolSpec} (${TOOL_CATEGORIES[tile.toolId].shortName})`;
            document.getElementById('insp-situation').textContent = `"${tile.situation}"`;
        } else {
            document.getElementById('insp-desc').textContent = tile.desc;
            statsEl.classList.add('hidden');
        }
    };

    onCanvasPointerMove = function (event) {
        const tooltip = document.getElementById('tile-hover-tooltip');
        if (!tooltip || !raycaster || !camera) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(tileMeshes, true);

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && obj.userData.tileIndex === undefined) {
                obj = obj.parent;
            }
            if (obj && obj.userData.tileIndex !== undefined) {
                const tIdx = obj.userData.tileIndex;
                const tile = BOARD_TILES[tIdx];
                renderer.domElement.style.cursor = 'pointer';

                tooltip.style.left = `${event.clientX}px`;
                tooltip.style.top = `${event.clientY - 10}px`;
                tooltip.classList.remove('hidden', 'opacity-0');
                tooltip.classList.add('opacity-100');

                const ownerId = gameState.propertyOwners[tIdx];
                const built = isTileBuilt(tIdx);
                document.getElementById('tt-badge').textContent = `Ô #${tIdx} • ${tile.region}`;
                document.getElementById('tt-owner').textContent = ownerId !== undefined
                    ? (built ? `🏯 Làng nghề: ${PLAYERS[ownerId].shortName}` : `🏳️ Đất: ${PLAYERS[ownerId].shortName}`)
                    : (tile.type === 'PROPERTY' ? '🌱 Đất trống' : 'Chức năng');
                document.getElementById('tt-icon').textContent = tile.icon || '🏯';
                document.getElementById('tt-name').textContent = tile.name;
                document.getElementById('tt-sub').textContent = tile.type === 'PROPERTY'
                    ? (ownerId === undefined
                        ? `Mua đất: ${tile.price}đ • Xây làng nghề: +${tile.buildCost}đ`
                        : (!built
                            ? `Thuê đất: ${tile.landRent}đ • Xây làng nghề: +${tile.buildCost}đ`
                            : `🏯 Phí dịch vụ Làng nghề: ${tile.builtRent}đ`))
                    : (tile.subtitle || tile.desc.slice(0, 36));
                return;
            }
        }

        renderer.domElement.style.cursor = 'grab';
        tooltip.classList.add('opacity-0', 'hidden');
    };

    openDirectoryModal = function () {
        if (NET.routed) return _showBanner0('Đang chờ người chơi online quyết định…', '⏳', 1500);
        NET.forceLocal = true;
        try {
            const itemsHTML = BOARD_TILES.map(t => {
                const ownerId = gameState.propertyOwners[t.index];
                const built = isTileBuilt(t.index);
                const ownerBadge = ownerId !== undefined
                    ? `<span class="text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold" style="background:${PLAYERS[ownerId].color}">${built ? '🏯 ' : '🏳️ '}${PLAYERS[ownerId].shortName}</span>`
                    : (t.type === 'PROPERTY'
                        ? `<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-800/15 text-emerald-900 font-bold">🌱 Đất: ${t.price}đ</span>`
                        : `<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-800/15 text-amber-900 font-bold">Sự kiện</span>`);

                return `
                    <button onclick="jumpToTileFromDirectory(${t.index})" class="p-2 rounded-xl border border-amber-800/25 bg-amber-50/70 hover:bg-amber-200/80 transition flex items-center justify-between gap-2 text-left">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0" style="background:${t.color}">#${t.index}</span>
                            <span class="text-lg shrink-0">${t.icon}</span>
                            <div class="min-w-0">
                                <div class="font-extrabold text-[11px] text-amber-950 truncate">${t.name}</div>
                                <div class="text-[9px] text-amber-800 truncate">${t.region} ${t.type === 'PROPERTY' ? `• Xây +${t.buildCost}đ` : ''}</div>
                            </div>
                        </div>
                        <div class="shrink-0">${ownerBadge}</div>
                    </button>
                `;
            }).join('');

            openModal(`
                <div class="text-left">
                    <div class="flex items-center justify-between border-b border-amber-800/30 pb-2 mb-3">
                        <div>
                            <h2 class="font-serif-vn font-extrabold text-xl text-amber-950">🧭 Danh Mục 47 Địa Danh Làng Nghề Việt Nam</h2>
                            <p class="text-[11px] text-amber-900/80">🌱 Đất trống → 🏳️ Mua đất → 🏯 Quay lại ở vòng sau để Xây dựng Làng nghề 3D!</p>
                        </div>
                        <button onclick="closeModal()" class="text-amber-900 hover:text-red-700 text-lg font-bold"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
                        ${itemsHTML}
                    </div>
                </div>
            `);
        } finally {
            NET.forceLocal = false;
        }
    };

    const _finishK0 = finishGameAndAudit;
    finishGameAndAudit = function (reasonText, forcedWinnerId) {
        const saved = {};
        BOARD_TILES.forEach((t, i) => {
            if (t.type === 'PROPERTY') {
                saved[i] = t.price;
                t.price = propertyValueOf(i);
            }
        });
        try {
            return _finishK0(reasonText, forcedWinnerId);
        } finally {
            Object.keys(saved).forEach(i => { BOARD_TILES[i].price = saved[i]; });
        }
    };

    const _updHUDK0 = updateAllHUD;
    updateAllHUD = function () {
        _updHUDK0();
        // Cập nhật lại Tổng Tài Sản (TS) và số Làng nghề đã xây (🏯) trên thẻ người chơi
        const maxAsset = Math.max(300, ...PLAYERS.filter(p => p.active).map(p => netWorth(p)));
        document.querySelectorAll('#players-panel > div').forEach(card => {
            const m = (card.getAttribute('onclick') || '').match(/focusCameraOnPlayer\((\d+)\)/);
            if (!m) return;
            const p = PLAYERS[+m[1]];
            if (!p) return;
            const totalAsset = netWorth(p);
            const builtCount = p.properties.filter(i => isTileBuilt(i)).length;
            const tsEl = card.querySelector('.text-right .text-\\[9px\\] b');
            if (tsEl) tsEl.textContent = `${totalAsset}đ`;
            const barEl = card.querySelector('.h-full.rounded-full');
            if (barEl) barEl.style.width = `${Math.min(100, Math.round((totalAsset / maxAsset) * 100))}%`;
            const statsSpans = card.querySelectorAll('.mt-1.pt-0\\.5 span');
            if (statsSpans.length >= 2) {
                statsSpans[1].innerHTML = `🏳️<b>${p.properties.length}</b> 🏯<b>${builtCount}</b> 🛠️<b>${p.tools.length}</b> ⚡<b>${p.skills.length}</b>`;
            }
        });
    };

    // 14. Đồng bộ Online cho propertyBuilt
    if (typeof G_FIELDS !== 'undefined' && !G_FIELDS.includes('propertyBuilt')) {
        G_FIELDS.push('propertyBuilt');
    }
    const _snapK0 = snapshot;
    snapshot = function () {
        const s = _snapK0();
        s.gs.propertyBuilt = Object.assign({}, gameState.propertyBuilt || {});
        return s;
    };
    const _applySnapK0 = applySnap;
    applySnap = function (s) {
        const oldBuilt = Object.assign({}, gameState.propertyBuilt || {});
        gameState.propertyBuilt = Object.assign({}, (s.gs && s.gs.propertyBuilt) || {});
        _applySnapK0(s);
        BOARD_TILES.forEach((t, i) => {
            if (t.type === 'PROPERTY') {
                const newlyBuilt = !oldBuilt[i] && gameState.propertyBuilt[i];
                syncTile3DState(i, newlyBuilt ? 'VILLAGE' : false);
            }
        });
    };

    // 15. Khởi tạo bản đồ ở trạng thái Đất Trống ngay sau khi init3DScene hoàn tất
    const _initMonopoly0 = init3DScene;
    init3DScene = function () {
        _initMonopoly0();
        try {
            BOARD_TILES.forEach((tile, idx) => {
                if (tile.type === 'PROPERTY') {
                    const d = tileDioramas[idx];
                    if (d && d.parent) {
                        const pm = createPlotMarker3D(tile);
                        pm.position.set(0, 0.15, 0);
                        d.parent.add(pm);
                        tilePlotMarkers[idx] = pm;
                    }
                    syncTile3DState(idx, false);
                }
            });
            if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
        } catch (e) {
            console.warn('initMonopoly', e);
        }
    };
