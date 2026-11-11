# Du Ký Làng Nghề – Sa bàn 3D bản đồ di sản Việt Nam

Board game giáo dục 3D chạy trên trình duyệt: người chơi đi vòng quanh **47 địa danh làng nghề** đặt đúng vị trí địa lý trên bản đồ Việt Nam, từ Lăng Bác (Hà Nội) xuôi miền Trung, vượt biển ra Phú Quốc, ngược lên Tây Nguyên và Tây Bắc rồi về lại Hà Nội.

- Một file duy nhất: [`index.html`](index.html) (Three.js r128 + GSAP + Tailwind qua CDN, PeerJS cho chế độ Online).
- 47 sa bàn dựng theo 47 ảnh mẫu của nhóm, bản đồ có biển, thuyền, cá, quần đảo Hoàng Sa – Trường Sa.
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
| `src/k1_data.js` | Dữ liệu 47 ô, thuật toán giãn cách, thẻ bài mới |
| `src/k2_map.js` | Mặt nước, tàu thuyền, sinh vật biển |
| `src/k2b_islands.js` | Hoàng Sa, Trường Sa, camera |
| `src/k3_models.js` | 29 sa bàn làng nghề mới |
| `tools/build47.rb` | Script dựng `index.html` từ `base/` + `src/` |

## Dựng lại `index.html`

Cần Ruby (có sẵn trên macOS):

```bash
ruby tools/build47.rb base/index_v5_36o.html index.html src
```

Script vá một số chỗ trong bản nền rồi chèn khối `src/*.js` trước `</body>`. Nếu bản nền bị đổi, script dừng với thông báo `missing: …`.
