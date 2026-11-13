    /* =================================================================================
     * K. BẢN ĐỒ 47 ĐỊA DANH (theo 47 sa bàn mẫu của nhóm, đúng thứ tự & vị trí địa lý thật)
     *    · Bản đồ phóng to (GEO_K 2.0), mở rộng mép bàn về phía Tây, giữ trọn Biển Đông
     *    · Toạ độ thật của từng làng nghề, tự giãn cách tối thiểu để các sa bàn không chồng nhau
     *    · Thêm nhiều Thẻ Biến Động / Bản Lĩnh · Biển, thuyền, cá, Hoàng Sa, Trường Sa chi tiết
     * ================================================================================= */
    GEO_K = 2.0;
    const KB = { lon0: 99.4, lon1: 114.6, lat0: 7.1, lat1: 24.3 };
    const BOARD_RECT = (() => { const a = geoToBoardXZ(KB.lon0, KB.lat1), b = geoToBoardXZ(KB.lon1, KB.lat0); return { x0: a.x, z0: a.z, x1: b.x, z1: b.z, cx: (a.x + b.x) / 2, cz: (a.z + b.z) / 2, W: b.x - a.x, D: b.z - a.z }; })();
    const HS_GEO = [111.95, 16.45], TS_GEO = [112.95, 9.35];

    TOOL_CATEGORIES.CERAMIC_ART.name = 'Bàn xoay, Đục chạm & Lò rèn';
    TOOL_CATEGORIES.CERAMIC_ART.shortName = 'Công cụ Gốm, Mộc & Rèn';
    TOOL_CATEGORIES.CERAMIC_ART.desc = 'Miễn phí dịch vụ tại Bát Tràng, Đông Hồ, Hương Thủy Xuân, Gốm Thanh Hà, Gốm Chăm Bàu Trúc, Trống Bình An, Đá Bửu Long, Tượng gỗ Jrai, Rèn Phúc Sen.';
    TOOL_CATEGORIES.WEAVING_CRAFT.desc = 'Miễn phí dịch vụ tại Thêu ren Văn Lâm, Chiếu cói Nga Sơn, Nón lá Ba Đồn, Lụa Tân Châu, Thổ cẩm Kon Tum, Khăn Piêu Sơn La, Dệt lanh Lùng Tám.';
    TOOL_CATEGORIES.HIGHLAND_AGRI.name = 'Giàn phơi, Nhà lưới & Chảo sao';
    TOOL_CATEGORIES.HIGHLAND_AGRI.shortName = 'Nông cụ & Bếp nghề';
    TOOL_CATEGORIES.HIGHLAND_AGRI.desc = 'Miễn phí dịch vụ tại Bánh tráng An Ngãi, Kẹo dừa Bến Tre, Bánh tét Trà Cuôn, Bánh pía Vũ Thơm, Hoa Sa Đéc, Bánh tráng Trảng Bàng, Nhà kính Đà Lạt, Cà phê Buôn Ma Thuột, Tương Nam Đàn, Rượu cần Mường Vang, Miến dong Bình Lư, Mỳ Chũ, Chè Tân Cương.';
    TOOL_CATEGORIES.COASTAL_AQUA.desc = 'Miễn phí dịch vụ tại Tỏi Lý Sơn, Yến sào Nha Trang, Nước mắm Phan Thiết, Muối Bạc Liêu, Tôm Cà Mau, Ngọc trai Phú Quốc.';

    // Bảng màu di sản: đỏ son (gốm, mộc, rèn) · nâu gỗ (dệt, đan) · xanh rêu (nông nghiệp) · xanh teal trầm (biển)
    const TOOL_HEX = { CERAMIC_ART: '#a93a2c', WEAVING_CRAFT: '#8b5e3c', HIGHLAND_AGRI: '#4f6b3a', COASTAL_AQUA: '#2f5d62' };
    // Mặt đất phẳng thống nhất: mọi ô, cây, đá đều đặt ở cùng một cao độ mặt đất
    const LAND_H = 0.2, LAND_Y = 0.36 + LAND_H * 0.92;
    const P47 = (name, region, lon, lat, modelType, toolId, price, toolSpec, icon, situation, extra) => Object.assign({ type: 'PROPERTY', name, region, lon, lat, modelType, toolId, price, rent: Math.round(price / 2 / 5) * 5, toolSpec, icon, color: TOOL_HEX[toolId], situation }, extra || {});
    const X47 = (type, name, region, lon, lat, modelType, subtitle, color, icon, desc, extra) => Object.assign({ type, name, region, lon, lat, modelType, subtitle, color, icon, desc }, extra || {});
    const TILES47 = [
        X47('START', 'Lăng Chủ tịch Hồ Chí Minh', 'Ba Đình - Hà Nội', 105.835, 21.037, 'KHUE_VAN_CAC', 'Bến Khởi Hành (+300đ)', '#a93a2c', '🇻🇳', 'Bến Khởi Hành tại Lăng Chủ tịch Hồ Chí Minh - Quảng trường Ba Đình. Mỗi khi đi qua hoặc dừng lại, nhận ngay 300 đồng Tiền Lương.'),
        P47('Làng Gốm Bát Tràng', 'Gia Lâm - Hà Nội', 105.913, 20.976, 'BAT_TRANG_KILN', 'CERAMIC_ART', 100, 'Đất sét trắng & Bàn xoay', '🏺', 'Khách vãng lai phải tự tay chuốt khối đất sét trên bàn xoay và tráng men lam nung trong lò bầu cổ.'),
        P47('Làng Tranh Đông Hồ', 'Thuận Thành - Bắc Ninh', 106.08, 21.06, 'DONG_HO_ART', 'CERAMIC_ART', 105, 'Ván khắc gỗ & Giấy điệp', '🖼️', 'Khách vãng lai phải phết điệp lên giấy dó và in 5 bản khắc màu bức tranh "Vinh Hoa - Phú Quý".'),
        X47('SHOP', 'Thương Cảng Vân Đồn', 'Vân Đồn - Quảng Ninh', 108.05, 20.82, 'HA_LONG_PORT', 'Trạm Công Cụ Đông Bắc', '#c79a3b', '⛵', 'Thương cảng cổ Vân Đồn giữa vịnh Bái Tử Long! Ghé mua Thẻ Công Cụ chuẩn bị cho hành trình xuôi Nam.', { island: true }),
        P47('Làng Thêu Ren Văn Lâm', 'Hoa Lư - Ninh Bình', 105.93, 20.22, 'NINH_BINH_HOA_LU', 'WEAVING_CRAFT', 110, 'Khung thêu & Chỉ tơ', '🪡', 'Khách vãng lai phải thêu một bức ren hoa sen tinh xảo giữa non nước Tràng An.'),
        P47('Làng Chiếu Cói Nga Sơn', 'Nga Sơn - Thanh Hóa', 106.0, 19.98, 'NGA_SON_MAT', 'WEAVING_CRAFT', 115, 'Khung dệt & Cói nhuộm', '🎋', 'Khách vãng lai phải chẻ cói, nhuộm màu điều đỏ thắm và dập khung dệt đôi chiếu hoa.'),
        X47('BIEN_DONG', 'Biến Động Lam Giang', 'Cửa Hội - Nghệ An', 105.72, 18.78, 'LAM_GIANG', 'Bốc Thẻ Biến Động (!)', '#7f2a1f', '❗', 'Cửa sông Lam lộng gió! Bốc 1 Thẻ Biến Động và thực thi ngay lập tức.'),
        P47('Làng Nón Lá Ba Đồn', 'Ba Đồn - Quảng Bình', 106.42, 17.75, 'NON_CHUONG', 'WEAVING_CRAFT', 125, 'Khuôn nón & Lá nón rừng', '👒', 'Khách vãng lai phải sấy lá nón trắng muốt và chằm chiếc nón bên dòng sông Gianh.'),
        P47('Làng Hương Thủy Xuân', 'Cố đô Huế', 107.57, 16.44, 'THUY_XUAN_INCENSE', 'CERAMIC_ART', 130, 'Bột trầm quế & Tâm tre', '💐', 'Khách vãng lai phải se hương trầm ngũ sắc và xếp thành những đóa hoa hương rực rỡ dưới nắng Huế.'),
        X47('SHOP', 'Thương Cảng Tiên Sa', 'Sơn Trà - Đà Nẵng', 108.21, 16.10, 'FAIFO_PORT', 'Trạm Công Cụ Miền Trung', '#c79a3b', '🛠️', 'Thương cảng sầm uất bên bán đảo Sơn Trà! Nơi thương thuyền tấp nập tiếp tế Thẻ Công Cụ.'),
        P47('Làng Gốm Thanh Hà', 'Hội An - Quảng Nam', 108.32, 15.86, 'HOI_AN_ANCIENT', 'CERAMIC_ART', 140, 'Đất sét Thu Bồn & Bàn xoay', '🏮', 'Khách vãng lai phải chuốt gốm đất nung đỏ au bên dòng Thu Bồn, cạnh phố cổ Hội An.'),
        P47('Tỏi Lý Sơn', 'Đảo Lý Sơn - Quảng Ngãi', 109.62, 15.36, 'LY_SON_ISLAND', 'COASTAL_AQUA', 150, 'Cát san hô & Thuyền câu', '🧄', 'Khách vãng lai phải phủ cát san hô trồng tỏi cô đơn trên đảo núi lửa và đóng thuyền khao lề thế lính Hoàng Sa.', { island: true }),
        X47('BAN_LINH', 'Bản Lĩnh Đất Võ Bình Định', 'Tây Sơn - Bình Định', 109.05, 13.88, 'BINH_DINH', 'Bốc Thẻ Bản Lĩnh (?)', '#b07a2a', '❓', 'Miền đất võ Tây Sơn! Bốc 1 Thẻ Bản Lĩnh để nắm giữ đặc quyền chiến thuật.'),
        P47('Yến Sào Nha Trang', 'Nha Trang - Khánh Hòa', 109.18, 12.25, 'NHA_TRANG_AGARWOOD', 'COASTAL_AQUA', 160, 'Thang dây & Giỏ yến', '🪺', 'Khách vãng lai phải leo vách đá Hòn Nội khai thác tổ yến và làm sạch từng sợi yến trắng ngà.'),
        P47('Gốm Chăm Bàu Trúc', 'Phan Rang - Ninh Thuận', 108.93, 11.55, 'BAU_TRUC_CHAM', 'CERAMIC_ART', 165, 'Đất sét sông Quao & Rơm nung', '🏛️', 'Khách vãng lai phải đi vòng quanh bàn gốm không dùng bàn xoay và nung lộ thiên bằng rơm củi.'),
        P47('Nước Mắm Phan Thiết', 'Mũi Né - Bình Thuận', 108.10, 10.95, 'PHAN_THIET_SAUCE', 'COASTAL_AQUA', 170, 'Thùng gỗ ủ chượp & Muối hột', '🫙', 'Khách vãng lai phải ủ cá cơm với muối trong thùng gỗ suốt mùa nắng để rút giọt mắm nhĩ.'),
        P47('Bánh Tráng An Ngãi', 'Long Điền - Bà Rịa Vũng Tàu', 107.24, 10.47, 'AN_NGAI', 'HIGHLAND_AGRI', 170, 'Nồi tráng & Vỉ tre phơi', '🫓', 'Khách vãng lai phải tráng bánh trên bếp củi và xếp kín vỉ tre phơi nắng giữa sân làng.'),
        X47('BIEN_DONG', 'Biến Động Cồn Thới Sơn', 'Cồn Thới Sơn - Tiền Giang', 106.36, 10.34, 'THOI_SON', 'Bốc Thẻ Biến Động (!)', '#7f2a1f', '❗', 'Cồn xanh giữa sông Tiền, đờn ca tài tử vang vọng! Bốc 1 Thẻ Biến Động và thực thi ngay.'),
        P47('Làng Kẹo Dừa Bến Tre', 'Châu Thành - Bến Tre', 106.37, 10.20, 'BEN_TRE_COCONUT', 'HIGHLAND_AGRI', 180, 'Chảo sên & Khuôn cắt kẹo', '🥥', 'Khách vãng lai phải nạo dừa, sên mạch nha trên chảo gang và cắt gói từng viên kẹo dừa.'),
        P47('Bánh Tét Trà Cuôn', 'Cầu Ngang - Trà Vinh', 106.45, 9.80, 'TRA_CUON', 'HIGHLAND_AGRI', 180, 'Lá chuối & Nồi luộc lớn', '🍃', 'Khách vãng lai phải gói đòn bánh tét lá cẩm, nhân đậu thịt và canh nồi luộc suốt đêm.'),
        P47('Bánh Pía Vũ Thơm', 'Vĩnh Châu - Sóc Trăng', 105.97, 9.60, 'VU_THOM', 'HIGHLAND_AGRI', 185, 'Lò than & Khuôn ép', '🥮', 'Khách vãng lai phải cán vỏ bánh ngàn lớp, gói nhân sầu riêng trứng muối và nướng trong lò than.'),
        P47('Cánh Đồng Muối Bạc Liêu', 'Đông Hải - Bạc Liêu', 105.72, 9.28, 'BAC_LIEU_SALT2', 'COASTAL_AQUA', 190, 'Trang cào & Gánh muối', '🧂', 'Khách vãng lai phải dẫn nước biển vào ô kết tinh và cào những đụn muối trắng lấp lánh.'),
        P47('Ao Tôm Cà Mau', 'Đất Mũi - Cà Mau', 104.85, 8.75, 'CA_MAU2', 'COASTAL_AQUA', 195, 'Quạt nước oxy & Lưới đăng', '🦐', 'Khách vãng lai phải vận hành dàn quạt nước nuôi tôm sú dưới tán rừng đước Đất Mũi.'),
        P47('Ngọc Trai Phú Quốc', 'Đảo Phú Quốc - Kiên Giang', 103.72, 10.12, 'PHU_QUOC2', 'COASTAL_AQUA', 220, 'Bè nuôi & Dao cấy ngọc', '🦪', 'Khách vãng lai phải lặn kiểm tra bè nuôi và cấy nhân ngọc vào trai biển giữa làn nước trong xanh.', { island: true }),
        X47('SHOP', 'Chợ Nổi Cái Răng', 'Cái Răng - Cần Thơ', 105.77, 10.02, 'CAI_RANG2', 'Trạm Công Cụ Miền Tây', '#c79a3b', '🛶', 'Ghe xuồng treo "cây bẹo" tấp nập trên sông Hậu! Ghé mua Thẻ Công Cụ cho hành trình ngược lên Bắc.'),
        P47('Làng Lụa Tân Châu', 'Tân Châu - An Giang', 105.24, 10.80, 'TAN_CHAU2', 'WEAVING_CRAFT', 190, 'Trái mặc nưa & Khung dệt lụa', '🧣', 'Khách vãng lai phải nhuộm lụa Lãnh Mỹ A bằng trái mặc nưa và phơi trên bãi cỏ ven sông Tiền.'),
        P47('Làng Hoa Sa Đéc', 'Sa Đéc - Đồng Tháp', 105.76, 10.30, 'SA_DEC2', 'HIGHLAND_AGRI', 195, 'Giàn tre trên nước & Chậu hoa', '🌼', 'Khách vãng lai phải chèo xuồng chăm những giàn cúc mâm xôi đặt trên mặt nước.'),
        P47('Làng Trống Bình An', 'Thủ Thừa - Long An', 106.38, 10.62, 'BINH_AN', 'CERAMIC_ART', 185, 'Gỗ mít & Da trâu', '🥁', 'Khách vãng lai phải ghép thân trống gỗ mít, căng mặt da trâu và thử tiếng trống vang.'),
        P47('Bánh Tráng Phơi Sương Trảng Bàng', 'Trảng Bàng - Tây Ninh', 106.36, 11.03, 'TRANG_BANG2', 'HIGHLAND_AGRI', 180, 'Bếp tráng & Vỉ phơi sương', '🫓', 'Khách vãng lai phải tráng bánh hai lớp, nướng phồng và thức đêm đón sương làm dẻo bánh.'),
        P47('Điêu Khắc Đá Bửu Long', 'Biên Hòa - Đồng Nai', 106.80, 10.96, 'BUU_LONG', 'CERAMIC_ART', 200, 'Đục thép & Đá xanh', '🗿', 'Khách vãng lai phải đục đẽo khối đá xanh thành tượng sư tử dưới chân núi Bửu Long.'),
        X47('BAN_LINH', 'Bản Lĩnh Nam Tây Nguyên', 'Thác Liêng Nung - Đắk Nông', 107.69, 12.00, 'LIENG_NUNG', 'Bốc Thẻ Bản Lĩnh (?)', '#b07a2a', '❓', 'Chinh phục thác Liêng Nung giữa đại ngàn! Bốc 1 Thẻ Bản Lĩnh để nắm giữ đặc quyền chiến thuật.'),
        P47('Nhà Kính Đà Lạt', 'Đà Lạt - Lâm Đồng', 108.44, 11.94, 'DA_LAT2', 'HIGHLAND_AGRI', 210, 'Nhà lồng kính & Tưới nhỏ giọt', '🍓', 'Khách vãng lai phải vận hành nhà kính công nghệ cao chăm dâu tây và hoa cẩm tú cầu.'),
        P47('Cà Phê Buôn Ma Thuột', 'Buôn Ma Thuột - Đắk Lắk', 108.04, 12.67, 'BMT2', 'HIGHLAND_AGRI', 205, 'Sân phơi & Chảo rang củi', '☕', 'Khách vãng lai phải hái cà phê chín đỏ, phơi trên sân đất đỏ bazan và rang mẻ cà phê thơm lừng.'),
        P47('Tượng Gỗ Jrai', 'Ia Nueng - Gia Lai', 107.98, 13.98, 'JRAI', 'CERAMIC_ART', 195, 'Rìu đẽo & Gỗ rừng', '🪵', 'Khách vãng lai phải đẽo tượng nhà mồ Jrai từ thân gỗ nguyên khối bên mái nhà rông.'),
        P47('Thổ Cẩm Kon Tum', 'Kon Tum - Tây Nguyên', 108.0, 14.35, 'KON_TUM2', 'WEAVING_CRAFT', 190, 'Khung dệt lưng & Sợi bông', '🧶', 'Khách vãng lai phải ngồi dệt khung lưng hoa văn Ba Na dưới mái nhà rông cao vút.'),
        X47('BIEN_DONG', 'Biến Động Thành Cổ Quảng Trị', 'Thành Cổ - Quảng Trị', 107.19, 16.75, 'THANH_CO', 'Bốc Thẻ Biến Động (!)', '#7f2a1f', '❗', 'Di tích quốc gia đặc biệt - khát vọng hòa bình! Bốc 1 Thẻ Biến Động và thực thi ngay.'),
        P47('Làng Tương Nam Đàn', 'Nam Đàn - Nghệ An', 105.50, 18.70, 'NAM_DAN', 'HIGHLAND_AGRI', 160, 'Chum sành & Mốc tương', '🫘', 'Khách vãng lai phải rang đậu, ủ mốc xôi và phơi những chum tương dưới nắng gió Lào.'),
        P47('Rượu Cần Mường Vang', 'Lạc Sơn - Hòa Bình', 105.45, 20.45, 'MUONG_VANG', 'HIGHLAND_AGRI', 150, 'Men lá & Ché rượu', '🏺', 'Khách vãng lai phải ủ men lá rừng vào ché sành và mời rượu cần bên nhà sàn Mường.'),
        P47('Khăn Piêu Sơn La', 'Mường Chanh - Sơn La', 103.91, 21.33, 'SON_LA2', 'WEAVING_CRAFT', 155, 'Kim thêu & Chỉ ngũ sắc', '🧕', 'Khách vãng lai phải thêu cút piêu hoa văn sặc sỡ trên nền vải chàm của người Thái.'),
        P47('Miến Dong Bình Lư', 'Tam Đường - Lai Châu', 103.60, 22.33, 'BINH_LU', 'HIGHLAND_AGRI', 150, 'Bột dong & Giàn phơi', '🍜', 'Khách vãng lai phải tráng bột dong, thái sợi và phơi miến trên giàn tre lưng đồi.'),
        X47('SHOP', 'Chợ Phiên Tây Bắc', 'Bắc Hà - Lào Cai', 104.29, 22.54, 'CHO_PHIEN', 'Trạm Công Cụ Tây Bắc', '#c79a3b', '🏔️', 'Chợ phiên vùng cao rực sắc thổ cẩm và hoa đào! Trạm tiếp tế Thẻ Công Cụ trước khi khép vòng về Thủ đô.'),
        P47('Dệt Lanh Lùng Tám', 'Quản Bạ - Hà Giang', 105.0, 23.07, 'LUNG_TAM', 'WEAVING_CRAFT', 160, 'Khung cửi & Chàm nhuộm', '🧵', 'Khách vãng lai phải tước sợi lanh, dệt vải và nhuộm chàm cùng phụ nữ H\'Mông.'),
        P47('Làng Rèn Phúc Sen', 'Quảng Hòa - Cao Bằng', 106.42, 22.53, 'PHUC_SEN', 'CERAMIC_ART', 165, 'Bễ thổi & Đe búa', '⚒️', 'Khách vãng lai phải kéo bễ, quai búa rèn con dao sắc bén của người Nùng An.'),
        X47('BAN_LINH', 'Bản Lĩnh Hòn Vọng Phu', 'Núi Tô Thị - Lạng Sơn', 106.75, 21.85, 'TO_THI', 'Bốc Thẻ Bản Lĩnh (?)', '#b07a2a', '❓', 'Leo núi Tô Thị, viếng thành nhà Mạc! Bốc 1 Thẻ Bản Lĩnh để nắm giữ đặc quyền chiến thuật.'),
        P47('Mỳ Chũ Thủ Dương', 'Chũ - Bắc Giang', 106.57, 21.37, 'MY_CHU', 'HIGHLAND_AGRI', 155, 'Cối xay bột & Giàn phơi', '🍝', 'Khách vãng lai phải xay gạo, tráng bánh và cắt sợi mỳ Chũ phơi trắng sân làng.'),
        P47('Đồi Chè Tân Cương', 'Tân Cương - Thái Nguyên', 105.75, 21.57, 'TAN_CUONG2', 'HIGHLAND_AGRI', 170, 'Gùi tre & Chảo sao chè', '🍵', 'Khách vãng lai phải hái búp chè "một tôm hai lá" và sao chè bằng chảo gang trên bếp củi.')
    ];

    // Giãn cách: giữ gần vị trí thật nhất có thể, mỗi sa bàn cách nhau tối thiểu 2.75 đơn vị
    (function relax47() {
        // Bệ ô là hình vuông cạnh ~2.28 (TILE_R 1.2 × 0.95 × 2): giữ cách nhau theo cả khoảng cách tròn (MIN)
        // lẫn theo cạnh vuông (MINC) để góc các bệ không chồng lên nhau
        const kx = 2.55 * GEO_K, kz = 2.75 * GEO_K, MIN = 2.75, MINC = 2.46, FOOT = 1.2;
        const P = TILES47.map(t => { const q = geoToBoardXZ(t.lon, t.lat); return { x: q.x, z: q.z, ax: q.x, az: q.z, w: t.island ? .25 : 1 }; });
        const land = (x, z) => isPointInPolygon(x / kx + 106.15, 16 - z / kz, VIETNAM_BORDER_LONLAT);
        const RIM = []; for (let k = -2; k <= 2; k++) { const u = k / 2 * FOOT; RIM.push([u, -FOOT], [u, FOOT]); if (k > -2 && k < 2) RIM.push([-FOOT, u], [FOOT, u]); }
        const separate = () => {
            for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
                const a = P[i], b = P[j], dx = b.x - a.x, dz = b.z - a.z, W = a.w + b.w; let L = Math.hypot(dx, dz);
                if (L < MIN) { if (L < 1e-3) L = 1e-3; const m = (MIN - L) / L / W; a.x -= dx * m * a.w; a.z -= dz * m * a.w; b.x += dx * m * b.w; b.z += dz * m * b.w; }
                const ax = Math.abs(b.x - a.x), az = Math.abs(b.z - a.z);
                if (Math.max(ax, az) < MINC) { // đẩy theo trục dễ tách nhất
                    if (ax >= az) { const s = Math.sign(b.x - a.x) || 1, m = (MINC - ax) / W; a.x -= s * m * a.w; b.x += s * m * b.w; }
                    else { const s = Math.sign(b.z - a.z) || 1, m = (MINC - az) / W; a.z -= s * m * a.w; b.z += s * m * b.w; }
                }
            }
        };
        for (let it = 0; it < 520; it++) {
            P.forEach(p => { p.x += (p.ax - p.x) * .03; p.z += (p.az - p.z) * .03; });
            separate();
            P.forEach((p, i) => { if (!TILES47[i].island) keepOnLand(p); });
        }
        // Chốt lại (không kéo về vị trí thật nữa): không chồng nhau và cả mặt bệ ô nằm gọn trong đất liền
        for (let it = 0; it < 300; it++) { separate(); P.forEach((p, i) => { if (!TILES47[i].island) keepOnLand(p); }); }
        function keepOnLand(p) {
            // Lấy mẫu viền vuông của bệ ô; điểm nào rơi xuống biển thì đẩy ô ngược hướng đó vào trong đất liền
            let ox = 0, oz = 0, n = 0;
            RIM.forEach(([dx, dz]) => { if (!land(p.x + dx, p.z + dz)) { ox += dx; oz += dz; n++; } });
            if (!land(p.x, p.z)) { p.x += (p.ax - p.x) * .12 - .05; p.z += (p.az - p.z) * .12; return; }
            if (n) { p.x -= ox / n * .1; p.z -= oz / n * .1; }
        }
        TILES47.forEach((t, i) => { t.realLon = t.lon; t.realLat = t.lat; t.lon = P[i].x / kx + 106.15; t.lat = 16 - P[i].z / kz; t.index = i; });
    })();
    BOARD_TILES.length = 0; TILES47.forEach(t => BOARD_TILES.push(t));

    // Đảo nâng đỡ các ô nằm ngoài khơi (Vân Đồn, Lý Sơn, Phú Quốc) + Côn Đảo, Phú Quý
    // (Đảo mang ô cờ cao bằng mặt đất liền để mọi bệ ô cùng một cao độ)
    const isPQ = t => t.modelType === 'PHU_QUOC2';
    window.__ISLANDS = BOARD_TILES.filter(t => t.island).map(t => ({ lon: t.lon, lat: t.lat, rx: isPQ(t) ? 1.75 : 1.5, rz: isPQ(t) ? 2.1 : 1.5, h: LAND_Y, color: 0x5e7a45 }))
        .concat([{ lon: 106.6, lat: 8.68, rx: .55, rz: .45, h: .34, color: 0x4f6b3a }, { lon: 108.94, lat: 10.52, rx: .32, rz: .28, h: .3, color: 0x4f6b3a }]);

    /* ---------- Thẻ Biến Động & Bản Lĩnh bổ sung ---------- */
    const NEW_BD = [
        { id: 'GIO_LAO', title: 'Gió Lào Khô Nóng', icon: '🔥', desc: 'Gió Lào thổi rát miền Trung, nguyên liệu khô nứt. Nộp 35 đồng mua bạt che và nước tưới.', effectText: 'Trừ 35 đồng' },
        { id: 'LU_MIEN_TRUNG', title: 'Lũ Lụt Miền Trung', icon: '🌧️', desc: 'Mưa lớn kéo dài, nước lũ dâng cao. Nộp 20 đồng cho mỗi ô bạn sở hữu ở miền Trung (tối thiểu 30 đồng) để khắc phục.', effectText: 'Trừ 20đ/ô miền Trung' },
        { id: 'SAT_LO', title: 'Sạt Lở Đèo Tây Bắc', icon: '⛰️', desc: 'Mưa đá và sạt lở chắn đường lên bản. Nộp 40 đồng thuê người mở đường vận chuyển hàng.', effectText: 'Trừ 40 đồng' },
        { id: 'HAN_MAN', title: 'Hạn Mặn Đồng Bằng', icon: '🏜️', desc: 'Nước mặn xâm nhập sâu vào ĐBSCL. Mọi người chơi nộp 15 đồng cho mỗi ô mình có ở miền Tây Nam Bộ.', effectText: 'Chủ ô miền Tây nộp 15đ/ô' },
        { id: 'LI_XI_TET', title: 'Chợ Tết Sum Vầy', icon: '🧧', desc: 'Tết đến xuân về, mọi người lì xì đầu năm! Bạn nhận 25 đồng từ mỗi người chơi khác.', effectText: 'Nhận 25đ từ mỗi người' },
        { id: 'LIVESTREAM', title: 'Livestream Bán Đặc Sản', icon: '📱', desc: 'Phiên livestream chợ quê "cháy hàng"! Nhận 25 đồng cho mỗi ô làng nghề bạn sở hữu (tối thiểu 50 đồng).', effectText: 'Nhận 25đ/ô sở hữu' },
        { id: 'KHACH_QUOC_TE', title: 'Đoàn Khách Quốc Tế', icon: '🧳', desc: 'Đoàn du khách quốc tế ghé thăm và đặt mua quà lưu niệm. Nhận ngay 90 đồng.', effectText: 'Nhận +90 đồng' },
        { id: 'KHAN_HIEM', title: 'Nguyên Liệu Khan Hiếm', icon: '🪵', desc: 'Vùng nguyên liệu mất mùa! Bạn mất 1 Thẻ Công Cụ ngẫu nhiên; nếu không có, nộp 30 đồng.', effectText: 'Mất 1 Thẻ Công Cụ' },
        { id: 'HOI_CHO_OCOP', title: 'Hội Chợ Làng Nghề', icon: '🎪', desc: 'Gian hàng của bạn đắt khách tại hội chợ! Nhận 40 đồng và 1 Thẻ Công Cụ ngẫu nhiên.', effectText: 'Nhận 40đ + 1 Thẻ Công Cụ' },
        { id: 'BAO_BIEN', title: 'Bão Biển - Cấm Tàu Thuyền', icon: '🌀', desc: 'Áp thấp nhiệt đới trên Biển Đông, tàu thuyền phải vào bờ trú ẩn. Chủ các ô biển đảo nộp 20 đồng mỗi ô.', effectText: 'Chủ ô biển đảo nộp 20đ/ô' },
        { id: 'VAY_UU_DAI', title: 'Vốn Vay Ưu Đãi Làng Nghề', icon: '🏦', desc: 'Ngân hàng chính sách hỗ trợ vốn khôi phục nghề truyền thống. Nhận ngay 70 đồng.', effectText: 'Nhận +70 đồng' },
        { id: 'PHI_MOI_TRUONG', title: 'Phí Bảo Vệ Môi Trường', icon: '♻️', desc: 'Xử lý nước thải, khói lò làng nghề. Nộp 10 đồng cho mỗi ô bạn sở hữu (tối thiểu 20 đồng).', effectText: 'Trừ 10đ/ô sở hữu' },
        { id: 'MUA_HOA_TAM_GIAC_MACH', title: 'Mùa Hoa Tam Giác Mạch', icon: '🌸', desc: 'Cao nguyên đá rực hoa, du khách đổ về vùng cao. Chủ các ô Tây Bắc - Đông Bắc nhận 30 đồng mỗi ô.', effectText: 'Chủ ô vùng cao nhận 30đ/ô' },
        { id: 'TRUNG_THU', title: 'Đêm Hội Trăng Rằm', icon: '🥮', desc: 'Phố lồng đèn rực rỡ đêm Trung Thu! Mọi người chơi nhận 30 đồng, riêng bạn nhận 60 đồng.', effectText: 'Bạn +60đ, người khác +30đ' }
    ];
    const NEW_BL = [
        { id: 'GIAY_PHEP_XK', title: 'Giấy Phép Xuất Khẩu', icon: '📜', desc: 'Kích hoạt để nhận 30 đồng cho mỗi ô làng nghề bạn sở hữu (tối thiểu 80 đồng).', usableTiming: 'Kích hoạt ngay trong lượt của bạn' },
        { id: 'CHI_DAN_DIA_LY', title: 'Chỉ Dẫn Địa Lý', icon: '🏅', desc: 'Sản phẩm được bảo hộ thương hiệu vùng miền! Kích hoạt để nhân đôi phí dịch vụ thu về trong 1 vòng.', usableTiming: 'Kích hoạt ngay trong lượt của bạn' },
        { id: 'NGHE_NHAN_UU_TU', title: 'Danh Hiệu Nghệ Nhân Ưu Tú', icon: '🎖️', desc: 'Kích hoạt để nhận 50 đồng và 2 Thẻ Công Cụ ngẫu nhiên.', usableTiming: 'Kích hoạt ngay trong lượt của bạn' },
        { id: 'TOUR_LIEN_KET', title: 'Tour Liên Kết Làng Nghề', icon: '🚌', desc: 'Kích hoạt để thu 20 đồng từ mỗi người chơi khác và nhận thêm 30 đồng từ Ngân hàng.', usableTiming: 'Kích hoạt ngay trong lượt của bạn' },
        { id: 'SAN_TMDT', title: 'Gian Hàng Sàn TMĐT', icon: '🛒', desc: 'Kích hoạt để nhận 40 đồng cộng 15 đồng cho mỗi Thẻ Công Cụ đang có.', usableTiming: 'Kích hoạt ngay trong lượt của bạn' },
        { id: 'QUY_KHOI_NGHIEP', title: 'Quỹ Khởi Nghiệp Sáng Tạo', icon: '💡', desc: 'Dự án làng nghề sáng tạo được rót vốn! Kích hoạt để nhận ngay 120 đồng.', usableTiming: 'Kích hoạt ngay trong lượt của bạn' },
        { id: 'BAO_HIEM_NGHE', title: 'Bảo Hiểm Làng Nghề', icon: '🛡️', desc: 'Kích hoạt để nhận 60 đồng bồi hoàn và bật giảm 30% giá mua ô đất tiếp theo.', usableTiming: 'Kích hoạt ngay trong lượt của bạn' }
    ];
    NEW_BD.forEach(c => BIEN_DONG_CARDS.push(c));
    NEW_BL.forEach(c => BAN_LINH_CARDS.push(c));
    const regionOf = i => { const t = BOARD_TILES[i]; return t.realLat < 11.3 && t.realLon < 107 ? 'MIEN_TAY' : t.realLat >= 20.3 && (t.realLon < 105.6 || t.realLat > 21.3) ? 'VUNG_CAO' : t.realLat >= 14 && t.realLat < 19.2 ? 'MIEN_TRUNG' : 'KHAC'; };
    const owned = (p, f) => p.properties.filter(i => f(i)).length;
    const live = () => PLAYERS.filter(p => p.active && !p.bankrupt);
    const coin = (p, n) => { p.cash += n; try { playSFX('coin'); } catch (e) { } };
    const randTool = () => { const k = Object.keys(TOOL_CATEGORIES); return k[Math.floor(Math.random() * k.length)]; };
    const BD_LOG = (c, txt, ic, cls) => addLog(`❗ <b>[${c.title}]</b> ${txt}`, ic || c.icon, cls || 'text-amber-200 font-semibold');
    const BD_EFFECT = {
        GIO_LAO: async (p, c) => { BD_LOG(c, `${p.shortName} nộp 35 đồng chống nắng gió Lào.`, null, 'text-red-300'); await processPaymentOrBankruptcy(p, null, 35, 'chi phí chống gió Lào'); },
        LU_MIEN_TRUNG: async (p, c) => { const n = Math.max(30, owned(p, i => regionOf(i) === 'MIEN_TRUNG') * 20); BD_LOG(c, `${p.shortName} nộp ${n} đồng khắc phục lũ lụt.`, null, 'text-red-300'); await processPaymentOrBankruptcy(p, null, n, 'khắc phục lũ lụt'); },
        SAT_LO: async (p, c) => { BD_LOG(c, `${p.shortName} nộp 40 đồng mở đường sau sạt lở.`, null, 'text-red-300'); await processPaymentOrBankruptcy(p, null, 40, 'mở đường sau sạt lở'); },
        HAN_MAN: async (p, c) => { BD_LOG(c, `Nước mặn xâm nhập - chủ các ô miền Tây Nam Bộ nộp 15 đồng mỗi ô.`, null, 'text-red-300'); for (const q of live()) { const n = owned(q, i => regionOf(i) === 'MIEN_TAY') * 15; if (n) await processPaymentOrBankruptcy(q, null, n, 'chống hạn mặn'); } },
        LI_XI_TET: async (p, c) => { BD_LOG(c, `${p.shortName} nhận lì xì 25 đồng từ mỗi người chơi khác!`, null, 'text-emerald-300 font-semibold'); for (const q of live()) if (q.id !== p.id) await processPaymentOrBankruptcy(q, p, 25, 'lì xì Tết'); try { playSFX('coin'); } catch (e) { } },
        LIVESTREAM: async (p, c) => { const n = Math.max(50, p.properties.length * 25); coin(p, n); BD_LOG(c, `${p.shortName} chốt đơn livestream, nhận <b>+${n} đồng</b>!`, null, 'text-emerald-300 font-semibold'); },
        KHACH_QUOC_TE: async (p, c) => { coin(p, 90); BD_LOG(c, `${p.shortName} đón đoàn khách quốc tế, nhận <b>+90 đồng</b>!`, null, 'text-emerald-300 font-semibold'); },
        KHAN_HIEM: async (p, c) => { if (p.tools.length) { const k = Math.floor(Math.random() * p.tools.length), t = p.tools.splice(k, 1)[0]; BD_LOG(c, `${p.shortName} mất 1 thẻ <b>${TOOL_CATEGORIES[t].shortName}</b>.`, null, 'text-red-300'); } else { BD_LOG(c, `${p.shortName} không có Thẻ Công Cụ nên nộp 30 đồng.`, null, 'text-red-300'); await processPaymentOrBankruptcy(p, null, 30, 'nguyên liệu khan hiếm'); } },
        HOI_CHO_OCOP: async (p, c) => { const t = randTool(); p.tools.push(t); coin(p, 40); BD_LOG(c, `${p.shortName} nhận <b>+40 đồng</b> và 1 thẻ <b>${TOOL_CATEGORIES[t].shortName}</b>!`, null, 'text-emerald-300 font-semibold'); },
        BAO_BIEN: async (p, c) => { BD_LOG(c, `Tàu thuyền vào bờ tránh bão - chủ các ô biển đảo nộp 20 đồng mỗi ô.`, null, 'text-red-300'); for (const q of live()) { const n = owned(q, i => BOARD_TILES[i].toolId === 'COASTAL_AQUA') * 20; if (n) await processPaymentOrBankruptcy(q, null, n, 'neo trú bão biển'); } },
        VAY_UU_DAI: async (p, c) => { coin(p, 70); BD_LOG(c, `${p.shortName} nhận <b>+70 đồng</b> vốn vay ưu đãi!`, null, 'text-emerald-300 font-semibold'); },
        PHI_MOI_TRUONG: async (p, c) => { const n = Math.max(20, p.properties.length * 10); BD_LOG(c, `${p.shortName} nộp ${n} đồng phí bảo vệ môi trường.`, null, 'text-red-300'); await processPaymentOrBankruptcy(p, null, n, 'phí bảo vệ môi trường'); },
        MUA_HOA_TAM_GIAC_MACH: async (p, c) => { let any = 0; live().forEach(q => { const n = owned(q, i => regionOf(i) === 'VUNG_CAO') * 30; if (n) { q.cash += n; any = 1; } }); if (any) try { playSFX('coin'); } catch (e) { } BD_LOG(c, `Du khách lên vùng cao - chủ các ô Tây Bắc, Đông Bắc nhận 30 đồng mỗi ô!`, null, 'text-emerald-300 font-semibold'); },
        TRUNG_THU: async (p, c) => { live().forEach(q => q.cash += q.id === p.id ? 60 : 30); try { playSFX('coin'); } catch (e) { } BD_LOG(c, `Đêm hội trăng rằm! <b>${p.shortName}</b> nhận <b>+60 đồng</b>, mọi người khác nhận <b>+30 đồng</b>.`, null, 'text-emerald-300 font-semibold'); }
    };
    const BL_EFFECT = {
        GIAY_PHEP_XK: (u, c) => { const n = Math.max(80, u.properties.length * 30); coin(u, n); return `nhận <b>+${n} đồng</b> xuất khẩu`; },
        CHI_DAN_DIA_LY: (u, c) => { u.doubleRentTurns = live().length; return 'nhân đôi phí dịch vụ trong 1 vòng'; },
        NGHE_NHAN_UU_TU: (u, c) => { u.tools.push(randTool(), randTool()); coin(u, 50); return 'nhận <b>+50 đồng</b> & 2 Thẻ Công Cụ'; },
        TOUR_LIEN_KET: (u, c) => { let s = 0; live().forEach(q => { if (q.id !== u.id) { const k = Math.min(20, q.cash); q.cash -= k; s += k; } }); coin(u, s + 30); return `thu <b>+${s + 30} đồng</b> từ tour liên kết`; },
        SAN_TMDT: (u, c) => { const n = 40 + u.tools.length * 15; coin(u, n); return `nhận <b>+${n} đồng</b> từ sàn TMĐT`; },
        QUY_KHOI_NGHIEP: (u, c) => { coin(u, 120); return 'nhận <b>+120 đồng</b> vốn khởi nghiệp'; },
        BAO_HIEM_NGHE: (u, c) => { coin(u, 60); u.discountActive = true; return 'nhận <b>+60 đồng</b> & giảm 30% giá mua đất'; }
    };
    function useNewSkill(u, id) {
        const c = BAN_LINH_CARDS.find(x => x.id === id), f = BL_EFFECT[id]; if (!c || !f) return false;
        const k = u.skills.indexOf(id); if (k >= 0) u.skills.splice(k, 1);
        const txt = f(u, c);
        addLog(`${c.icon} <b>${u.shortName}</b> kích hoạt <b>"${c.title}"</b>: ${txt}!`, c.icon, 'text-amber-300 font-semibold');
        showBanner(`${c.title}!`, c.icon, 1800); updateAllHUD(); return true;
    }
    let __lastCard = null;
    const _pickK0 = pickCardAnimated;
    pickCardAnimated = async function (p, k) { const c = await _pickK0(p, k); __lastCard = c; return c; };
    const _hBD0 = handleBienDongDraw;
    handleBienDongDraw = async function (player) {
        __lastCard = null; await _hBD0(player);
        const c = __lastCard, f = c && BD_EFFECT[c.id];
        if (f) { await f(player, c); updateAllHUD(); await sleep(500); }
    };
    const _hBL0 = handleBanLinhDraw;
    handleBanLinhDraw = async function (player) {
        __lastCard = null; await _hBL0(player);
        const c = __lastCard;
        if (c && BL_EFFECT[c.id] && player.isNPC) { await sleep(400); useNewSkill(player, c.id); await sleep(700); }
    };
    const _actSkill0 = activateUserSkillCard;
    activateUserSkillCard = function (i) {
        const u = PLAYERS[gameState.currentPlayerIdx]; const id = u && u.skills[i];
        if (id && BL_EFFECT[id]) { if (u.isNPC || gameState.isBusy) return; useNewSkill(u, id); return; }
        return _actSkill0(i);
    };
    Object.assign(CARD_FX, {
        GIO_LAO: { fx: 'rise', em: ['🔥', '☀️', '💨'], tint: 'rgba(234,88,12,.18)' }, LU_MIEN_TRUNG: { fx: 'rain', em: ['🌧️'] }, SAT_LO: { fx: 'fall', em: ['🪨', '⛰️'], tint: 'rgba(87,83,78,.2)', heavy: 1 },
        HAN_MAN: { fx: 'waves', em: ['🌊'] }, LI_XI_TET: { fx: 'fall', em: ['🧧', '🌸', '🪙'], tint: 'rgba(220,38,38,.14)' }, LIVESTREAM: { fx: 'burst', em: ['📱', '❤️', '🛍️'] },
        KHACH_QUOC_TE: { fx: 'rise', em: ['🧳', '📸', '✈️'] }, KHAN_HIEM: { fx: 'fall', em: ['🪵', '📉'], tint: 'rgba(30,41,59,.18)' }, HOI_CHO_OCOP: { fx: 'lantern', em: ['🎪', '🏮', '✨'] },
        BAO_BIEN: { fx: 'waves', em: ['🌀'] }, VAY_UU_DAI: { fx: 'burst', em: ['🏦', '🪙', '🪙'] }, PHI_MOI_TRUONG: { fx: 'fall', em: ['♻️', '🍃'] },
        MUA_HOA_TAM_GIAC_MACH: { fx: 'fall', em: ['🌸', '🌸', '💮'], tint: 'rgba(236,72,153,.12)' }, TRUNG_THU: { fx: 'lantern', em: ['🏮', '🥮', '🌕'] },
        GIAY_PHEP_XK: { fx: 'cross', em: ['🚢'], trail: '📜' }, CHI_DAN_DIA_LY: { fx: 'beam', em: ['🏅', '✨'] }, NGHE_NHAN_UU_TU: { fx: 'fall', em: ['🎖️', '🏺', '🧵'] },
        TOUR_LIEN_KET: { fx: 'cross', em: ['🚌'], trail: '💨' }, SAN_TMDT: { fx: 'burst', em: ['🛒', '📦', '🪙'] }, QUY_KHOI_NGHIEP: { fx: 'beam', em: ['💡', '✨', '🪙'] }, BAO_HIEM_NGHE: { fx: 'spin', em: ['🛡️'] }
    });
    Object.assign(FX3_MAP, {
        GIO_LAO: fxPriceUp, LU_MIEN_TRUNG: fxStorm, SAT_LO: fxStorm, HAN_MAN: fxTide, LI_XI_TET: fxLanterns, LIVESTREAM: fxStars, KHACH_QUOC_TE: fxAmbassador, KHAN_HIEM: fxSqueeze,
        HOI_CHO_OCOP: fxLanterns, BAO_BIEN: fxTide, VAY_UU_DAI: fxCoop, PHI_MOI_TRUONG: fxSqueeze, MUA_HOA_TAM_GIAC_MACH: fxHarvest, TRUNG_THU: fxLanterns,
        GIAY_PHEP_XK: fxShip, CHI_DAN_DIA_LY: fxUnesco, NGHE_NHAN_UU_TU: fxTools, TOUR_LIEN_KET: fxTrain, SAN_TMDT: fxStars, QUY_KHOI_NGHIEP: fxStars, BAO_HIEM_NGHE: fxCompass
    });
