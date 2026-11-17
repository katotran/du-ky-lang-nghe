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
| `src/k4_monopoly.js` | Cơ chế mua đất trống → xây làng nghề 3D |
| `src/k5_newmap.js` | Địa hình phẳng kiểu mới, đảo, bờ đất bao quanh biển (thay khung bàn gỗ) |
| `src/k6_tiles_pawns.js` | Bệ địa danh bo tròn, nhân vật chibi cổ phục và hoạt ảnh (thở, chớp mắt, vẫy tay, nhảy mừng) |
| `src/k7_plots.js` | Tiểu cảnh ô đất trống / đất chờ xây: đồ nghề theo từng làng, hàng rào, cây theo vùng miền |
| `tools/build47.rb` | Script dựng `index.html` từ `base/` + `src/` |

## Dựng lại `index.html`

Cần Ruby (có sẵn trên macOS):

```bash
ruby tools/build47.rb base/index_v5_36o.html index.html src
```

Script vá một số chỗ trong bản nền rồi chèn khối `src/*.js` trước `</body>`. Nếu bản nền bị đổi, script dừng với thông báo `missing: …`.
