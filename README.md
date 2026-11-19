# Du Ký Làng Nghề – Sa bàn 3D bản đồ di sản Việt Nam

Board game giáo dục 3D chạy trên trình duyệt: người chơi đi vòng quanh **47 địa danh làng nghề** đặt đúng vị trí địa lý trên bản đồ Việt Nam, từ Lăng Bác (Hà Nội) xuôi miền Trung, vượt biển ra Phú Quốc, ngược lên Tây Nguyên và Tây Bắc rồi về lại Hà Nội.

- Một file duy nhất: [`index.html`](index.html) (Three.js r128 + GSAP + Tailwind qua CDN, PeerJS cho chế độ Online).
- 47 sa bàn dựng theo 47 ảnh mẫu của nhóm, bản đồ có biển, thuyền, cá, quần đảo Hoàng Sa – Trường Sa.
- Bản đồ kiểu hoạt hình theo ảnh mẫu: dải đất chữ S mập, mặt phẳng chia mảng xanh non – vàng cát, biển xanh sáng nằm giữa bờ đất có cây cối, làng xóm.
- 24 thẻ Biến Động, 14 thẻ Bản Lĩnh, 4 Trạm Công Cụ, chơi 1–5 người, có chế độ Online nhiều máy.

## Chạy thử

Mở `index.html` bằng trình duyệt, hoặc chạy server tĩnh:

```bash
ruby -run -e httpd . -p 8766
# rồi mở http://localhost:8766
```

Đưa lên Netlify: kéo thả file `index.html`.

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `index.html` | Bản game hoàn chỉnh (kết quả build) |
| `base/index_v5_36o.html` | Bản nền 36 ô (code gốc của nhóm + FPS, Online, rút bài, hiệu ứng thẻ) |
| `src/k0_shape.js` | Đường viền đất liền & đảo Phú Quốc dò từ ảnh mẫu (toạ độ điểm ảnh → kinh/vĩ độ) |
| `src/k1_data.js` | Dữ liệu 47 ô, thuật toán giãn cách, thẻ bài mới, khung biển |
| `src/k2_map.js` | Mặt nước, tàu thuyền, sinh vật biển |
| `src/k2b_islands.js` | Hoàng Sa, Trường Sa, camera |
| `src/k3_models.js` | 29 sa bàn làng nghề mới |
| `src/k4_monopoly.js` | Cơ chế Đầu tư & Nâng cấp 1-5 Sao (bảng `STAR_CONFIG`), sao vàng 3D trên mô hình |
| `src/k5_newmap.js` | Địa hình phẳng kiểu mới, đảo, bờ đất bao quanh biển (thay khung bàn gỗ) |
| `src/k6_tiles_pawns.js` | Bệ địa danh bo tròn, nhân vật chibi cổ phục và hoạt ảnh (thở, chớp mắt, vẫy tay, nhảy mừng) |
| `src/k10_characters.js` | 5 nhân vật chibi hiện đại kiểu vinyl toy: bộ xương phân cấp (hips/spine/head/vai/khuỷu/cổ tay/đùi/gối/cổ chân), 6 biểu cảm, hệ animation (idle riêng, nhảy giữa ô, tung xúc xắc, thắng/thua, đến làng nghề, tới lượt), chuyển động thứ cấp, bóng mềm, nhãn tên, avatar render từ mô hình 3D. `createCharacter(config, player)` + `CHARACTER_CONFIGS` để thêm nhân vật |
| `src/k9_i18n_ui.js` | Nút chuyển VI/EN, vẽ lại chữ trong cảnh 3D khi đổi ngôn ngữ |
| `src/i18n/*.tsv` | Từ điển tiếng Anh: `mã băm<TAB>bản dịch` (mã băm = FNV-1a của chuỗi gốc đã gộp khoảng trắng); `extra.txt` cho chữ ghép lúc chạy |
| `tools/i18n.js`, `tools/i18n_runtime.js` | Bước dựng thứ hai: bọc chuỗi tiếng Việt bằng `__t`/`__tt`, nhúng từ điển + bộ dịch trình duyệt |
| `src/k8_lobby_ui.js` | Sảnh chờ (tên, chọn nhân vật, luật, đồng hồ 10:00), thẻ thông tin ô theo dữ liệu, nút hành động theo lượt, thu gọn cột phải |
| `tools/build47.rb` | Script dựng `index.html` từ `base/` + `src/` |

## Dựng lại `index.html`

Cần Ruby (có sẵn trên macOS):

```bash
ruby tools/build47.rb base/index_v5_36o.html index.html src
```

Script vá một số chỗ trong bản nền rồi chèn khối `src/*.js` trước `</body>`. Nếu bản nền bị đổi, script dừng với thông báo `missing: …`.

## Đa ngôn ngữ (Tiếng Việt / English)

Nút **VI | EN** nằm ở góc trên bên trái (cạnh tên game) và trong Sảnh chờ; ngôn ngữ được nhớ trong `localStorage`. Đổi ngôn ngữ có hiệu lực ngay, không mất ván đang chơi.

- Bước dựng `build47.rb` tự gọi `node tools/i18n.js build index.html` ở cuối (cần Node, không cần thư viện ngoài). Không có Node thì `index.html` vẫn chạy nhưng chỉ có tiếng Việt.
- Dữ liệu gốc của game luôn là tiếng Việt; bản tiếng Anh nằm trong `src/i18n/*.tsv`.
- Thêm/sửa chuỗi tiếng Việt trong mã: chạy `node tools/i18n.js missing index.html` để xem chuỗi nào chưa có bản dịch (chuỗi chưa dịch sẽ hiện tiếng Việt), hoặc `node tools/i18n.js extract index.html <thư mục>` để xuất theo từng đợt. Thêm nhanh: `node tools/i18n.js add en_09.tsv "câu tiếng Việt=>English sentence"`. Mẫu có biến dùng `{0}`, `{1}`... theo thứ tự `${...}` trong mã; giữ nguyên các thẻ HTML.
- Chữ vẽ lên canvas 3D (bảng tên ô, nhãn quần đảo...) được dịch lúc vẽ và vẽ lại khi đổi ngôn ngữ (`onLangChange`).

## Thêm một nhân vật / cử chỉ mới

- Nhân vật: viết hàm dựng trang phục + tóc + phụ kiện (xem `buildPhotographer` trong `src/k10_characters.js`: gọi `buildSkeleton` rồi gắn tóc/mũ vào `head`), rồi thêm một mục vào `CHARACTER_CONFIGS` (`skin`, `eye`, `build`, `idle` = các cử chỉ idle riêng, `grip` = kiểu cầm vật, `rest` = tư thế tay nghỉ, `arrive` = cử chỉ khi đến làng nghề).
- Cử chỉ idle mới: thêm hàm vào `GESTURES` (ghi tư thế đích vào các kênh khớp như `sRX`, `eR`, `hdRY`; `e` là hệ số vào-giữ-ra). Hành động một lần (tung xúc xắc, thắng, thua...) nằm ở `ACTS`.
- Thử nhanh từ console: `__dkChar.startAct(0, 'win', 0)`, `__dkChar.gesture(0, 'camera')`.
- Mô hình dựng bằng three.js (không dùng GLB). Nếu sau này dùng GLB có xương: nạp bằng `GLTFLoader`, nhân bản bằng `THREE.SkeletonUtils.clone`, rồi map các xương vào đúng các nút `C.hips`, `C.spine`, `C.head`, `C.shoulder[]`, `C.elbow[]`, `C.wrist[]`, `C.thigh[]`, `C.knee[]`, `C.ankle[]` — hệ animation chỉ cần các nút này.
