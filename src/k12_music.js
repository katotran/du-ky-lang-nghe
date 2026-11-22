    /* =================================================================================
     * K12. NHẠC NỀN CÓ SẴN (assets/music/*.m4a, tách âm thanh từ 2 video của nhóm)
     *   Bài 1 (THINH_VUONG_CHAMBER) = "Thịnh Vượng Việt Nam Sáng Ngời" giao hưởng hòa tấu
     *   Bài 2 (NGHE_XUA_HON_NAY)    = "Hello Vietnam" – Phạm Quỳnh Anh
     *   Nút bật/tắt và nút "Đổi Bài" trên thanh trên dùng đúng 2 bài này; file tự nạp khi bấm phát (preload none).
     *   Muốn đổi bài: thay file trong assets/music và giữ nguyên tên (hoặc sửa đường dẫn bên dưới).
     * ================================================================================= */
    (function () {
        const mkTrack = src => { const a = new Audio(); a.preload = 'none'; a.loop = true; a.volume = .85; a.src = src; return a; };
        uploadedTracks.THINH_VUONG_CHAMBER = mkTrack('assets/music/thinh-vuong.m4a');
        uploadedTracks.NGHE_XUA_HON_NAY = mkTrack('assets/music/hello-vietnam.m4a');
    })();

    /* ---------- Nút dừng / tiếp tục + thanh chỉnh âm lượng (thanh trên, cạnh nút loa) ---------- */
    (function () {
        const tracks = () => [uploadedTracks.THINH_VUONG_CHAMBER, uploadedTracks.NGHE_XUA_HON_NAY].filter(Boolean);
        let vol = .85;
        try { const v = parseFloat(localStorage.getItem('dkln_music_vol')); if (v >= 0 && v <= 1) vol = v; } catch (e) { }
        const applyVol = () => { tracks().forEach(t => { t.volume = vol; }); try { localStorage.setItem('dkln_music_vol', String(vol)); } catch (e) { } };
        applyVol();

        function build() {
            const speaker = document.getElementById('btn-audio');
            if (!speaker || document.getElementById('btn-music-pause')) return;
            const pause = document.createElement('button');
            pause.id = 'btn-music-pause'; pause.type = 'button'; pause.title = 'Dừng / Tiếp tục nhạc';
            pause.className = 'hover:text-amber-300 transition px-1 font-semibold';
            pause.innerHTML = '<i class="fa-solid fa-pause"></i>';
            const wrap = document.createElement('label');
            wrap.className = 'flex items-center gap-1 px-1'; wrap.title = 'Âm lượng nhạc nền';
            const slider = document.createElement('input');
            slider.id = 'music-volume'; slider.type = 'range'; slider.min = 0; slider.max = 100; slider.step = 1; slider.value = Math.round(vol * 100);
            slider.setAttribute('aria-label', 'Âm lượng nhạc nền');
            slider.style.cssText = 'width:64px;height:4px;accent-color:#fbbf24;cursor:pointer';
            wrap.appendChild(slider);
            speaker.insertAdjacentElement('afterend', wrap);
            speaker.insertAdjacentElement('afterend', pause);

            const icon = () => pause.firstChild;
            const playing = () => !!activeMediaElement && !activeMediaElement.paused;
            const refresh = () => {
                icon().className = playing() ? 'fa-solid fa-pause' : 'fa-solid fa-play';
                pause.style.opacity = (bgmEnabled || activeMediaElement) ? '1' : '.55';
                const ic = document.getElementById('audio-icon');
                if (ic && vol === 0 && bgmEnabled) ic.className = 'fa-solid fa-volume-off text-amber-300';
                else if (ic && bgmEnabled && playing()) ic.className = 'fa-solid fa-volume-high text-emerald-400';
            };
            pause.onclick = () => {
                if (playing()) { activeMediaElement.pause(); }
                else {
                    if (!bgmEnabled) { bgmEnabled = true; startSelectedMusicSource(); }
                    else if (activeMediaElement) activeMediaElement.play().catch(() => { });
                    else startSelectedMusicSource();
                    const ic = document.getElementById('audio-icon'); if (ic) ic.className = 'fa-solid fa-volume-high text-emerald-400';
                }
                refresh();
            };
            slider.oninput = () => { vol = slider.value / 100; applyVol(); refresh(); };
            tracks().forEach(t => { t.addEventListener('play', refresh); t.addEventListener('pause', refresh); });
            document.getElementById('btn-audio').addEventListener('click', () => setTimeout(refresh, 60));
            setInterval(refresh, 1500);
            refresh();
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
    })();
