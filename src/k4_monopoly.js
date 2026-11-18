    /* =================================================================================
     * L. CƠ CHẾ ĐẦU TƯ & NÂNG CẤP SAO (1-5 SAO)
     *    · Toàn bộ sa bàn làng nghề 3D hiện đầy đủ ngay từ đầu ván (không còn ô đất trống)
     *    · [Đầu Tư Làng Nghề]: dừng ở làng chưa có chủ -> làng đạt 1 Sao, thuộc quyền sở hữu, thu phí cơ bản
     *    · [Nâng Cấp Dịch Vụ]: chủ làng dừng lại ở các lượt sau -> 2 → 3 → 4 → 5 Sao (Chuẩn Quốc Tế)
     *    · gameState.propertyBuilt[idx] lưu SỐ SAO (1-5) của ô đã có chủ (giữ tên cũ để đồng bộ Online)
     * ================================================================================= */
    gameState.propertyBuilt = {};
    const tileDioramas = {};
    const tilePlotMarkers = {};           // không còn dùng (giữ để tương thích)
    const tileStarSprites = {};
    window.tileDioramas = tileDioramas;
    window.tilePlotMarkers = tilePlotMarkers;

    // ---------------------------------------------------------------------------------
    // BẢNG CẤU HÌNH SAO — chỉnh ở đây để cân bằng game. Mọi giá đều tính theo % GIÁ GỐC (tile.price) của ô
    //   costMul : chi phí để ĐẠT bậc sao này (bậc 1 = Đầu Tư, bậc 2-5 = Nâng Cấp)
    //   rentMul : phí trải nghiệm khách trả cho chủ khi làng đang ở bậc này
    // Mặc định: đầu tư đủ 5 sao ≈ 3.75× giá gốc; phí sao 5 gấp ~4 lần sao 1.
    // ---------------------------------------------------------------------------------
    const STAR_CONFIG = {
        maxStars: 5,
        levels: [
            null,
            { name: 'Cơ bản',        costMul: 1.00, rentMul: 0.30 },
            { name: 'Khá',           costMul: 0.50, rentMul: 0.45 },
            { name: 'Tốt',           costMul: 0.60, rentMul: 0.70 },
            { name: 'Cao cấp',       costMul: 0.75, rentMul: 1.00 },
            { name: 'Chuẩn Quốc Tế', costMul: 0.90, rentMul: 1.25 }
        ]
    };
    window.STAR_CONFIG = STAR_CONFIG;
    const round5 = v => Math.max(5, Math.round(v / 5) * 5);

    BOARD_TILES.forEach(t => {
        if (t.type === 'PROPERTY') {
            t.starCost = [0];
            t.starRent = [0];
            for (let s = 1; s <= STAR_CONFIG.maxStars; s++) {
                t.starCost[s] = round5(t.price * STAR_CONFIG.levels[s].costMul);
                t.starRent[s] = round5(t.price * STAR_CONFIG.levels[s].rentMul);
            }
            t.rent = t.starRent[1];
        }
    });

    // Số sao hiện tại của ô (0 = chưa có chủ)
    function starsOf(idx) {
        if (gameState.propertyOwners[idx] === undefined) return 0;
        const n = +(gameState.propertyBuilt && gameState.propertyBuilt[idx]) || 1;
        return Math.max(1, Math.min(STAR_CONFIG.maxStars, n));
    }
    window.starsOf = starsOf;
    const starText = n => '★'.repeat(n);
    function propertyValueOf(idx) {
        const t = BOARD_TILES[idx];
        if (!t || t.type !== 'PROPERTY') return 0;
        let v = 0;
        for (let s = 1; s <= starsOf(idx); s++) v += t.starCost[s];
        return v;
    }
    function currentRentOf(idx) {
        const t = BOARD_TILES[idx];
        if (!t || t.type !== 'PROPERTY') return 0;
        return t.starRent[Math.max(1, starsOf(idx))];
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


    // 3. Sao vàng lơ lửng phía trên mô hình làng (1-5 sao) để mọi người nhìn là biết cấp độ
    function makeStarTexture(n) {
        const c = document.createElement('canvas');
        c.width = 400; c.height = 96;
        const g = c.getContext('2d');
        const R = 34, gap = 76, x0 = 200 - (n - 1) * gap / 2;
        for (let i = 0; i < n; i++) {
            const cx = x0 + i * gap, cy = 50;
            g.beginPath();
            for (let k = 0; k < 10; k++) {
                const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? R * 0.46 : R;
                g[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            }
            g.closePath();
            const grad = g.createLinearGradient(0, cy - R, 0, cy + R);
            grad.addColorStop(0, '#fff3a6'); grad.addColorStop(1, '#f5a512');
            g.fillStyle = grad; g.fill();
            g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = '#8a4b05'; g.stroke();
        }
        return new THREE.CanvasTexture(c);
    }
    function updateTileStars(idx, pulse) {
        const item = tileLabelSprites[idx];
        if (!item || !item.sprite || !item.sprite.parent) return;
        const n = starsOf(idx);
        let sp = tileStarSprites[idx];
        if (n === 0) { if (sp) sp.visible = false; return; }
        if (!sp) {
            sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
            sp.position.set(0, 2.75, 0.25);
            sp.renderOrder = 5;
            item.sprite.parent.add(sp);
            tileStarSprites[idx] = sp;
            gsap.to(sp.position, { y: 2.95, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        }
        const old = sp.material.map;
        sp.material.map = makeStarTexture(n);
        sp.material.needsUpdate = true;
        if (old && old.dispose) old.dispose();
        const sx = 1.68, sy = 0.4;   // 400x96 px; các sao luôn cùng cỡ, căn giữa
        sp.scale.set(sx, sy, 1);
        sp.visible = true;
        if (pulse) {
            gsap.fromTo(sp.scale, { x: sx * 1.8, y: sy * 1.8 }, { x: sx, y: sy, duration: 0.8, ease: 'elastic.out(1,0.5)' });
        }
    }

    // 4. Cập nhật huy hiệu 3D phía trước mỗi ô theo trạng thái (Chưa có chủ / n Sao)
    function updateTile3DBadge(idx) {
        const item = tileLabelSprites[idx];
        const tile = BOARD_TILES[idx];
        if (!item || !item.sprite || !tile) return;

        const ownerId = gameState.propertyOwners[idx];
        const owner = ownerId !== undefined ? PLAYERS[ownerId] : null;
        const n = starsOf(idx);
        const shortName = tile.name.replace(/Làng |Vườn |Cánh Đồng |Đồi /g, '');

        const c = document.createElement('canvas');
        c.width = 384;
        c.height = 112;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(28, 18, 10, 0.9)';
        ctx.strokeStyle = n >= 5 ? '#fde047' : (owner ? owner.color : '#fbbf24');
        ctx.lineWidth = 4 + n;
        ctx.beginPath();
        ctx.roundRect(6, 8, 372, 96, 48);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = owner ? owner.color : tile.color;
        ctx.beginPath();
        ctx.arc(54, 56, 38, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 30px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${idx}`, 54, 58);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#fef3c7';
        ctx.font = '800 25px "Nunito", sans-serif';
        ctx.fillText(shortName.slice(0, 16), 104, tile.type === 'PROPERTY' ? 42 : 58);

        if (tile.type === 'PROPERTY') {
            if (n === 0) {
                ctx.fillStyle = '#6ee7b7';
                ctx.font = '700 21px "Nunito", sans-serif';
                ctx.fillText(`Đầu tư: ${tile.starCost[1]}đ`, 104, 76);
            } else {
                ctx.fillStyle = '#fde047';
                ctx.font = '800 20px "Nunito", sans-serif';
                ctx.fillText(`${starText(n)} ${owner.shortName} • Phí ${tile.starRent[n]}đ`, 104, 76);
            }
        }

        const oldMap = item.sprite.material.map;
        item.sprite.material.map = new THREE.CanvasTexture(c);
        item.sprite.material.needsUpdate = true;
        if (oldMap && oldMap.dispose) oldMap.dispose();
    }

    // 5. Đồng bộ trạng thái 3D của 1 ô (mô hình luôn hiện; sao & huy hiệu theo cấp)
    //    animate: 'INVEST' (vừa đầu tư 1 sao) | 'UPGRADE' (vừa nâng sao) | false
    function syncTile3DState(tileIndex, animate) {
        const tile = BOARD_TILES[tileIndex];
        if (!tile || tile.type !== 'PROPERTY') return;

        tile.rent = currentRentOf(tileIndex);
        const ownerId = gameState.propertyOwners[tileIndex];
        const d = tileDioramas[tileIndex];
        if (d) {
            d.visible = true;
            if (!animate && d.scale.x !== 0.95) d.scale.setScalar(0.95);
        }
        const lvl = starsOf(tileIndex);
        if (animate && d && lvl > 0) {
            gsap.fromTo(d.scale, { x: 0.95, y: 0.95, z: 0.95 }, {
                x: 1.06, y: 1.1, z: 1.06, duration: 0.28, yoyo: true, repeat: 1, ease: 'power2.out',
                onComplete: () => { d.scale.setScalar(0.95); if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true; }
            });
            const owner = PLAYERS[ownerId];
            if (owner) tileCelebrate(tileIndex, owner.hex);
            try {
                const topPos = tileTop(tileIndex);
                ring(topPos, 0xfacc15, 1600, 2.6);
                burstSprites(topPos.clone().add(new THREE.Vector3(0, 0.5, 0)), ['⭐', '✨', tile.icon || '🏺'], lvl >= 5 ? 22 : 12, { speed: 2.0, life: 1900 });
            } catch (e) {}
        }

        updateTileStars(tileIndex, !!animate);
        updateTile3DBadge(tileIndex);
        if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
    }
    window.syncTile3DState = syncTile3DState;

    // 6. Cờ sở hữu & Xóa cờ sở hữu
    const _spawnBanner0 = spawnOwnerBannerOnTile;
    spawnOwnerBannerOnTile = function (tileIndex, ownerId) {
        _spawnBanner0(tileIndex, ownerId);
        syncTile3DState(tileIndex, false);
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


    // 8. [ĐẦU TƯ LÀNG NGHỀ] — dừng ở làng chưa có chủ: đạt 1 Sao, thuộc quyền sở hữu, bắt đầu thu phí
    completePropertyPurchase = function (player, tile, pricePaid) {
        player.cash -= pricePaid;
        if (!player.properties.includes(tile.index)) player.properties.push(tile.index);
        gameState.propertyOwners[tile.index] = player.id;
        gameState.propertyBuilt[tile.index] = 1;
        tile.rent = tile.starRent[1];

        playSFX('coin');
        spawnOwnerBannerOnTile(tile.index, player.id);
        syncTile3DState(tile.index, 'INVEST');
        updateAllHUD();
        updateTileInspector(tile.index);

        addLog(`⭐ <b>${player.shortName}</b> chi <b>${pricePaid} đồng</b> đầu tư <b>${tile.name} (${tile.region})</b> đạt <b>1 Sao</b>! Phí trải nghiệm <b>${tile.starRent[1]}đ</b>. <i>(Quay lại ô này ở lượt sau để Nâng Cấp Dịch Vụ lên tối đa 5 Sao)</i>`, '🌱', 'text-emerald-300 font-semibold');
        showBanner(`${player.shortName} đầu tư ${tile.name} ★`, '⭐', 2000);
    };

    handleUnownedProperty = withNetRouting(async function (player, tile) {
        const hasBargainCard = player.skills.includes('THANH_MAC_CA');
        const baseCost = tile.starCost[1];
        const discountedPrice = Math.round(baseCost * 0.7);

        if (player.isNPC) {
            await sleep(900);
            let finalPrice = player.discountActive ? discountedPrice : baseCost;

            if (!player.discountActive && hasBargainCard && player.cash >= discountedPrice + 60) {
                const sIdx = player.skills.indexOf('THANH_MAC_CA');
                player.skills.splice(sIdx, 1);
                finalPrice = discountedPrice;
                addLog(`<b>${player.shortName}</b> tung thẻ <b>"Thánh Mặc Cả"</b> giảm 30% vốn đầu tư ${tile.name} còn <b>${finalPrice} đồng</b>!`, '🏷️', 'text-amber-300');
            }

            if (player.cash - finalPrice >= 70) {
                player.discountActive = false;
                completePropertyPurchase(player, tile, finalPrice);
                await sleep(1000);
            } else {
                addLog(`<b>${player.shortName}</b> cân nhắc dòng tiền và quyết định chưa đầu tư <b>${tile.name}</b>.`, '🤔');
                showBanner(`${player.shortName} giữ tiền mặt dự phòng`, '🤔', 1400);
                await sleep(800);
            }
            return;
        }

        const currentPrice = player.discountActive ? discountedPrice : baseCost;
        const canAfford = player.cash >= currentPrice;
        if (canUseInspectorButtons(player)) {
            const act = await askInInspector(player, tile, 'UNOWNED', {
                cost: currentPrice,
                bargainCost: hasBargainCard && !player.discountActive ? discountedPrice : null
            });
            if (act === 'invest' && player.cash >= currentPrice) {
                player.discountActive = false;
                completePropertyPurchase(player, tile, currentPrice);
            } else if (act === 'bargain' && player.cash >= discountedPrice) {
                const sIdx = player.skills.indexOf('THANH_MAC_CA');
                if (sIdx > -1) player.skills.splice(sIdx, 1);
                completePropertyPurchase(player, tile, discountedPrice);
            } else {
                addLog(`<b>${player.shortName}</b> quyết định giữ tiền mặt, chưa đầu tư <b>${tile.name}</b>.`, '👣');
            }
            return;
        }

        const ladder = [1, 2, 3, 4, 5].map(s => `<span class="inline-block mr-1.5"><b>${s}★</b> ${tile.starRent[s]}đ</span>`).join('');

        return new Promise(resolve => {
            openModal(`
                <div class="text-center">
                    <span class="px-3 py-1 rounded-full bg-emerald-800 text-emerald-100 text-xs font-extrabold uppercase tracking-wider">🌱 Làng Nghề Chưa Có Chủ • ${tile.region}</span>
                    <div class="text-5xl my-3">${tile.icon}</div>
                    <h2 class="font-serif-vn font-extrabold text-2xl text-amber-950">${tile.name}</h2>
                    <p class="text-xs text-amber-900/85 mt-1">Hãy <b>Đầu Tư Làng Nghề</b> để đạt <b>1 Sao</b>, cắm cờ sở hữu và bắt đầu thu phí trải nghiệm. Ở các lượt sau, quay lại để <b>Nâng Cấp Dịch Vụ</b> lên tối đa <b>5 Sao</b>!</p>

                    <div class="bg-amber-900/10 border border-amber-800/30 rounded-2xl p-3.5 my-4 text-left space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">⭐ Vốn Đầu Tư (đạt 1 Sao):</span>
                            <span class="font-black text-base text-emerald-800">${currentPrice} đồng ${player.discountActive ? '(Đã giảm 30%)' : ''}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">💰 Phí trải nghiệm 1 Sao:</span>
                            <span class="font-bold text-amber-800">${tile.starRent[1]} đồng / lượt khách</span>
                        </div>
                        <div class="border-t border-amber-800/15 pt-1.5">
                            <div class="font-semibold text-amber-900 mb-0.5">📈 Phí theo cấp sao:</div>
                            <div class="font-extrabold text-red-700 leading-5">${ladder}</div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">🛠️ Công cụ làng nghề:</span>
                            <span class="font-bold text-teal-900">${tile.toolSpec}</span>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-2.5 justify-center mt-4">
                        ${hasBargainCard && !player.discountActive ? `
                            <button id="modal-btn-bargain" class="bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold px-4 py-2.5 rounded-xl border-2 border-amber-700 text-xs shadow">
                                🏷️ Dùng "Thánh Mặc Cả" (Đầu tư ${discountedPrice}đ)
                            </button>
                        ` : ''}
                        <button id="modal-btn-buy" ${canAfford ? '' : 'disabled'} class="wood-btn px-5 py-2.5 rounded-xl font-extrabold text-sm flex-1">
                            ⭐ Đầu Tư Làng Nghề (${currentPrice}đ)
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
                addLog(`<b>${player.shortName}</b> quyết định giữ tiền mặt, chưa đầu tư <b>${tile.name}</b>.`, '👣');
                resolve();
            };
        });
    });

    // 9. [NÂNG CẤP DỊCH VỤ] — chủ làng dừng lại ở lượt sau: 2 → 3 → 4 → 5 Sao
    function completeVillageBuild(player, tile, costPaid) {
        const nextStar = Math.min(STAR_CONFIG.maxStars, starsOf(tile.index) + 1);
        player.cash -= costPaid;
        gameState.propertyBuilt[tile.index] = nextStar;
        tile.rent = tile.starRent[nextStar];

        playSFX('build');
        syncTile3DState(tile.index, 'UPGRADE');
        updateAllHUD();
        updateTileInspector(tile.index);

        const lvlName = STAR_CONFIG.levels[nextStar].name;
        addLog(`⭐ <b>${player.shortName}</b> chi <b>${costPaid} đồng</b> nâng cấp <b>${tile.name}</b> lên <b>${nextStar} Sao</b> (${lvlName})! Phí trải nghiệm tăng lên <b>${tile.starRent[nextStar]}đ</b>${nextStar >= STAR_CONFIG.maxStars ? ' — <b>CHUẨN QUỐC TẾ!</b>' : ''}`, '🏗️', 'text-amber-300 font-semibold');
        showBanner(`${starText(nextStar)} ${tile.name} lên ${nextStar} Sao!`, tile.icon, 2400);
    }
    window.completeVillageBuild = completeVillageBuild;

    const handleOwnPropertyBuild = withNetRouting(async function (player, tile) {
        const cur = starsOf(tile.index);
        if (cur >= STAR_CONFIG.maxStars) {
            if (canUseInspectorButtons(player)) await askInInspector(player, tile, 'OWN', {});
            tileCelebrate(tile.index, player.hex);
            addLog(`🏯 <b>${player.shortName}</b> ghé thăm Làng nghề <b>${tile.name}</b> đã đạt <b>5 Sao Chuẩn Quốc Tế</b> của chính mình.`, '🏡', 'text-emerald-200');
            await sleep(600);
            return;
        }
        const next = cur + 1;
        const upCost = tile.starCost[next];
        const hasBargainCard = player.skills.includes('THANH_MAC_CA');
        const discountedBuild = Math.round(upCost * 0.7);

        if (player.isNPC) {
            await sleep(900);
            let finalCost = player.discountActive ? discountedBuild : upCost;
            if (!player.discountActive && hasBargainCard && player.cash >= discountedBuild + 50) {
                const sIdx = player.skills.indexOf('THANH_MAC_CA');
                player.skills.splice(sIdx, 1);
                finalCost = discountedBuild;
                addLog(`<b>${player.shortName}</b> dùng thẻ <b>"Thánh Mặc Cả"</b> giảm 30% chi phí nâng cấp ${tile.name} còn <b>${finalCost} đồng</b>!`, '🏷️', 'text-amber-300');
            }

            if (player.cash - finalCost >= 50) {
                player.discountActive = false;
                completeVillageBuild(player, tile, finalCost);
                await sleep(1100);
            } else {
                addLog(`<b>${player.shortName}</b> ghé <b>${tile.name}</b> (${cur} Sao) nhưng tạm giữ tiền mặt, hẹn lượt sau nâng cấp.`, '🏗️');
                showBanner(`${player.shortName} chưa đủ vốn nâng cấp ${tile.name}`, '⏳', 1500);
                await sleep(700);
            }
            return;
        }

        const currentCost = player.discountActive ? discountedBuild : upCost;
        const canAfford = player.cash >= currentCost;

        if (canUseInspectorButtons(player)) {
            const act = await askInInspector(player, tile, 'OWN', {
                cost: currentCost,
                bargainCost: hasBargainCard && !player.discountActive ? discountedBuild : null
            });
            if (act === 'upgrade' && player.cash >= currentCost) {
                player.discountActive = false;
                completeVillageBuild(player, tile, currentCost);
            } else if (act === 'bargain' && player.cash >= discountedBuild) {
                const sIdx = player.skills.indexOf('THANH_MAC_CA');
                if (sIdx > -1) player.skills.splice(sIdx, 1);
                completeVillageBuild(player, tile, discountedBuild);
            } else {
                addLog(`<b>${player.shortName}</b> ghé thăm <b>${tile.name}</b> (${cur} Sao) và để dành vốn nâng cấp vào lượt sau.`, '🏡');
            }
            return;
        }

        return new Promise(resolve => {
            openModal(`
                <div class="text-center">
                    <span class="px-3 py-1 rounded-full bg-amber-600 text-amber-950 text-xs font-extrabold uppercase tracking-wider">⭐ Nâng Cấp Dịch Vụ • Làng Của Bạn</span>
                    <div class="text-5xl my-3">${tile.icon}</div>
                    <h2 class="font-serif-vn font-extrabold text-2xl text-amber-950">${tile.name}</h2>
                    <div class="text-2xl font-black text-amber-500 tracking-widest">${starText(cur)}<span class="text-amber-950/25">${'★'.repeat(STAR_CONFIG.maxStars - cur)}</span></div>
                    <p class="text-xs text-amber-900/85 mt-1">Làng đang ở <b>${cur} Sao</b>. Nâng cấp lên <b>${next} Sao${next >= STAR_CONFIG.maxStars ? ' (Chuẩn Quốc Tế)' : ''}</b> để tăng phí trải nghiệm thu từ khách.</p>

                    <div class="bg-amber-900/15 border-2 border-amber-700/40 rounded-2xl p-3.5 my-4 text-left space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">🏗️ Chi phí nâng lên ${next} Sao:</span>
                            <span class="font-black text-base text-emerald-800">${currentCost} đồng ${player.discountActive ? '(Đã giảm 30%)' : ''}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">📈 Phí trải nghiệm:</span>
                            <span class="font-extrabold text-red-700">${tile.starRent[cur]}đ → ${tile.starRent[next]} đồng / lượt</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-amber-900">💎 Tổng vốn đã đầu tư sau nâng cấp:</span>
                            <span class="font-bold text-amber-950">${propertyValueOf(tile.index) + upCost} đồng</span>
                        </div>
                        <div class="pt-1.5 border-t border-amber-800/20 italic text-amber-950">
                            <b>Tình huống trải nghiệm:</b> "${tile.situation}"
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-2.5 justify-center mt-4">
                        ${hasBargainCard && !player.discountActive ? `
                            <button id="modal-btn-bargain-build" class="bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold px-4 py-2.5 rounded-xl border-2 border-amber-700 text-xs shadow">
                                🏷️ Dùng "Thánh Mặc Cả" (Nâng cấp ${discountedBuild}đ)
                            </button>
                        ` : ''}
                        <button id="modal-btn-build" ${canAfford ? '' : 'disabled'} class="wood-btn px-5 py-2.5 rounded-xl font-extrabold text-sm flex-1">
                            ⭐ Nâng Cấp Dịch Vụ (${currentCost}đ)
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
                addLog(`<b>${player.shortName}</b> ghé thăm <b>${tile.name}</b> (${cur} Sao) và để dành vốn nâng cấp vào lượt sau.`, '🏡');
                resolve();
            };
        });
    });
    window.handleOwnPropertyBuild = handleOwnPropertyBuild;

    // 10. KHÁCH GHÉ THĂM ĐẤT / LÀNG NGHỀ CỦA NGƯỜI KHÁC
    handleVisitorOnOwnedProperty = withNetRouting(async function (visitor, tile, owner) {
        const stars = starsOf(tile.index);
        const isDouble = owner.doubleRentTurns > 0;
        const baseRent = tile.starRent[stars];
        const rentFee = isDouble ? baseRent * 2 : baseRent;
        const matchingToolIdx = visitor.tools.indexOf(tile.toolId);
        const vipSkillIdx = visitor.skills.indexOf('VE_VIP');
        const toolInfo = TOOL_CATEGORIES[tile.toolId];
        const feeLabel = `phí trải nghiệm Làng nghề ${stars} Sao ${tile.name}`;

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

        if (canUseInspectorButtons(visitor)) {
            const act = await askInInspector(visitor, tile, 'VISIT', {
                fee: rentFee,
                toolName: matchingToolIdx > -1 ? toolInfo.shortName : null,
                hasVip: vipSkillIdx > -1
            });
            if (act === 'tool' && matchingToolIdx > -1) {
                visitor.tools.splice(matchingToolIdx, 1);
                playSFX('card');
                addLog(`🛠️ <b>${visitor.shortName}</b> đã dùng thẻ <b>${toolInfo.shortName}</b> hóa giải tình huống tại <b>${tile.name}</b> và bảo toàn tiền mặt!`, '✨', 'text-teal-300 font-semibold');
                showBanner('Hóa giải tình huống -> Miễn phí!', '🛠️', 1800);
                updateAllHUD();
            } else if (act === 'vip' && vipSkillIdx > -1) {
                visitor.skills.splice(vipSkillIdx, 1);
                playSFX('card');
                addLog(`🎫 <b>${visitor.shortName}</b> dùng <b>Vé Tham Quan VIP</b> được miễn phí hoàn toàn tại <b>${tile.name}</b>!`, '🎫', 'text-amber-300 font-semibold');
                showBanner('Vé VIP -> Miễn phí dịch vụ!', '🎫', 1800);
                updateAllHUD();
            } else {
                await processPaymentOrBankruptcy(visitor, owner, rentFee, feeLabel);
            }
            return;
        }

        return new Promise(resolve => {
            openModal(`
                <div class="text-center">
                    <span class="px-3 py-1 rounded-full bg-red-800 text-amber-100 text-xs font-extrabold uppercase">
                        🏯 Làng Nghề ${stars} Sao • Sở hữu bởi ${owner.shortName}
                    </span>
                    <div class="text-5xl my-3">${tile.icon}</div>
                    <h2 class="font-serif-vn font-extrabold text-2xl text-amber-950">${tile.name}</h2>
                    <div class="text-xl font-black text-amber-500 tracking-widest">${starText(stars)}</div>

                    <div class="bg-amber-900/15 border-2 border-amber-800/40 rounded-2xl p-4 my-3 text-left">
                        <div class="text-xs font-extrabold uppercase text-amber-900 mb-1">
                            📜 Tình Huống Trải Nghiệm Làng Nghề:
                        </div>
                        <p class="text-sm font-semibold text-amber-950 italic">
                            "${tile.situation}"
                        </p>
                        <div class="mt-3 pt-2 border-t border-amber-800/20 flex justify-between items-center text-xs">
                            <span>Công cụ hóa giải: <b>${tile.toolSpec}</b></span>
                            <span class="text-red-800 font-extrabold text-sm">Phí ${stars} Sao: ${rentFee}đ ${isDouble ? '(x2 Được mùa)' : ''}</span>
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
                            💸 Trả Phí Trải Nghiệm ${stars} Sao (${rentFee} đồng)
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
                // Chủ làng dừng lại ô của mình: Nâng Cấp Dịch Vụ (hoặc đã 5 Sao thì chỉ ghé thăm)
                await handleOwnPropertyBuild(player, tile);
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
            const keptStars = starsOf(i);
            removeOwnerBannerFromTile(i);
            if (creditor) {
                creditor.properties.push(i);
                gameState.propertyOwners[i] = creditor.id;
                gameState.propertyBuilt[i] = keptStars;
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
        addLog(`💥 <b>${payer.shortName}</b> PHÁ SẢN (${why})! ${creditor ? `Toàn bộ tiền và <b>${props.length} ô di sản</b> chuyển cho <b>${creditor.shortName}</b>.` : `<b>${props.length} ô di sản</b> được trả về thị trường trở lại thị trường chưa có chủ.`}`, '💥', 'text-red-400 font-extrabold');
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
                const stars = starsOf(tIdx);
                const val = propertyValueOf(tIdx);
                return `
                    <div class="bg-amber-950/10 border border-amber-800/30 p-3 rounded-xl flex justify-between items-center">
                        <div class="text-left">
                            <div class="font-bold text-sm text-amber-950">${t.icon} ${t.name} <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-600 text-white">${starText(stars)} ${stars} Sao</span></div>
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
                // NPC ưu tiên bán ô ít sao nhất trước
                payer.properties.sort((a, b) => starsOf(a) - starsOf(b));
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
        const stars = starsOf(tileIndex);
        let ownerText = tile.region || 'Ô Chức Năng';
        if (tile.type === 'PROPERTY') {
            if (ownerId === undefined) ownerText = '🌱 Chưa có chủ';
            else ownerText = `${starText(stars)} ${PLAYERS[ownerId].shortName} (${stars} Sao)`;
        }

        document.getElementById('insp-badge').textContent = `#${tileIndex} • ${ownerText}`;
        document.getElementById('insp-title').textContent = tile.name;

        const statsEl = document.getElementById('insp-stats');
        if (tile.type === 'PROPERTY') {
            const statusLabel = ownerId === undefined
                ? `🌱 Làng nghề chưa có chủ tại ${tile.region}. Dừng chân để Đầu Tư (${tile.starCost[1]}đ) đạt 1 Sao.`
                : (stars < STAR_CONFIG.maxStars
                    ? `${starText(stars)} Của ${PLAYERS[ownerId].shortName} • Chủ làng quay lại để Nâng Cấp Dịch Vụ lên ${stars + 1} Sao (+${tile.starCost[stars + 1]}đ).`
                    : `🏯 Của ${PLAYERS[ownerId].shortName} • Đã đạt 5 Sao Chuẩn Quốc Tế.`);
            document.getElementById('insp-desc').textContent = statusLabel;
            statsEl.classList.remove('hidden');
            document.getElementById('insp-price').textContent = ownerId === undefined ? `Đầu tư ${tile.starCost[1]}đ` : (stars < STAR_CONFIG.maxStars ? `Nâng cấp +${tile.starCost[stars + 1]}đ` : 'Tối đa 5 Sao');
            document.getElementById('insp-rent').textContent = `${tile.starRent[Math.max(1, stars)]}đ (${Math.max(1, stars)} Sao)`;
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
                const stars = starsOf(tIdx);
                document.getElementById('tt-badge').textContent = `Ô #${tIdx} • ${tile.region}`;
                document.getElementById('tt-owner').textContent = ownerId !== undefined
                    ? `${starText(stars)} ${PLAYERS[ownerId].shortName}`
                    : (tile.type === 'PROPERTY' ? '🌱 Chưa có chủ' : 'Chức năng');
                document.getElementById('tt-icon').textContent = tile.icon || '🏯';
                document.getElementById('tt-name').textContent = tile.name;
                document.getElementById('tt-sub').textContent = tile.type === 'PROPERTY'
                    ? (ownerId === undefined
                        ? `Đầu tư 1 Sao: ${tile.starCost[1]}đ • Phí ${tile.starRent[1]}đ`
                        : (stars < STAR_CONFIG.maxStars
                            ? `${stars} Sao • Phí ${tile.starRent[stars]}đ • Nâng cấp +${tile.starCost[stars + 1]}đ`
                            : `🏯 5 Sao Chuẩn Quốc Tế • Phí ${tile.starRent[5]}đ`))
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
                const stars = starsOf(t.index);
                const ownerBadge = ownerId !== undefined
                    ? `<span class="text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold" style="background:${PLAYERS[ownerId].color}">${starText(stars)} ${PLAYERS[ownerId].shortName}</span>`
                    : (t.type === 'PROPERTY'
                        ? `<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-800/15 text-emerald-900 font-bold">🌱 Đầu tư: ${t.starCost[1]}đ</span>`
                        : `<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-800/15 text-amber-900 font-bold">Sự kiện</span>`);

                return `
                    <button onclick="jumpToTileFromDirectory(${t.index})" class="p-2 rounded-xl border border-amber-800/25 bg-amber-50/70 hover:bg-amber-200/80 transition flex items-center justify-between gap-2 text-left">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0" style="background:${t.color}">#${t.index}</span>
                            <span class="text-lg shrink-0">${t.icon}</span>
                            <div class="min-w-0">
                                <div class="font-extrabold text-[11px] text-amber-950 truncate">${t.name}</div>
                                <div class="text-[9px] text-amber-800 truncate">${t.region} ${t.type === 'PROPERTY' ? `• Phí 1★ ${t.starRent[1]}đ` : ''}</div>
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
                            <p class="text-[11px] text-amber-900/80">⭐ Đầu tư làng nghề (1 Sao) → quay lại ở các lượt sau để Nâng Cấp Dịch Vụ lên 5 Sao!</p>
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
            const starSum = p.properties.reduce((t, i) => t + starsOf(i), 0);
            const tsEl = card.querySelector('.text-right .text-\\[9px\\] b');
            if (tsEl) tsEl.textContent = `${totalAsset}đ`;
            const barEl = card.querySelector('.h-full.rounded-full');
            if (barEl) barEl.style.width = `${Math.min(100, Math.round((totalAsset / maxAsset) * 100))}%`;
            const statsSpans = card.querySelectorAll('.mt-1.pt-0\\.5 span');
            if (statsSpans.length >= 2) {
                statsSpans[1].innerHTML = `🏯<b>${p.properties.length}</b> ⭐<b>${starSum}</b> 🛠️<b>${p.tools.length}</b> ⚡<b>${p.skills.length}</b>`;
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
                const was = +oldBuilt[i] || 0, now = +gameState.propertyBuilt[i] || 0;
                syncTile3DState(i, now > was ? (was ? 'UPGRADE' : 'INVEST') : false);
            }
        });
    };

    // 15. Đồng bộ trạng thái ban đầu: mô hình hiện đầy đủ, huy hiệu hiện giá đầu tư
    const _initMonopoly0 = init3DScene;
    init3DScene = function () {
        _initMonopoly0();
        try {
            BOARD_TILES.forEach((tile, idx) => {
                if (tile.type === 'PROPERTY') syncTile3DState(idx, false);
            });
            if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
        } catch (e) {
            console.warn('initMonopoly', e);
        }
    };
