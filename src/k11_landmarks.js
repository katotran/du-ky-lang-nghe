    /* =================================================================================
     * K11. THÔNG TIN ĐỊA DANH (từ file "Thông tin địa danh Game.pdf") · THẺ ĐỊA DANH XOAY MẶT
     *   Nút "Tìm hiểu địa danh" trong thẻ thông tin ô → hiện thẻ: mặt trước = tên địa danh, mặt sau = mô tả (bấm để lật).
     *   Số thứ tự trong PDF = chỉ số ô + 1.
     * ================================================================================= */
    const LANDMARK_INFO = [
        { title: 'Lăng Bác', prov: 'Hà Nội', desc: 'Lăng Chủ tịch Hồ Chí Minh tọa lạc trang nghiêm tại Quảng trường Ba Đình lịch sử – nơi Bác đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa. Công trình mang đậm dấu ấn kiến trúc Việt Nam kết hợp vật liệu quý từ khắp mọi miền đất nước, trở thành biểu tượng thiêng liêng của lòng tôn kính và tinh thần đại đoàn kết dân tộc.' },
        { title: 'Gốm Bát Tràng', prov: 'Hà Nội', desc: 'Nằm bên bờ sông Hồng với lịch sử hơn 500 năm, làng gốm Bát Tràng là một trong những cái nôi gốm sứ lâu đời và nổi tiếng nhất Việt Nam. Qua bàn tay tài hoa của các nghệ nhân, từng khối đất sét thô sơ hóa thành những tác phẩm tinh xảo với nước men đặc trưng, vừa phục vụ đời sống hằng ngày vừa mang giá trị nghệ thuật vươn tầm thế giới.' },
        { title: 'Tranh Đông Hồ', prov: 'Bắc Ninh', desc: 'Làng tranh dân gian Đông Hồ nổi tiếng với dòng tranh khắc gỗ mộc mạc, phản ánh sinh động đời sống lao động, phong tục và ước vọng bình dị của người Việt xưa. Điểm làm nên sức sống bền bỉ của tranh Đông Hồ chính là giấy dó quét điệp lấp lánh cùng bảng màu hoàn toàn tự nhiên từ hoa hòe, lá chàm, than tre và sỏi son.' },
        { title: 'Thương cảng Vân Đồn', prov: 'Quảng Ninh', desc: 'Được thành lập từ năm 1149 dưới triều vua Lý Anh Tông, thương cảng Vân Đồn là hải cảng giao thương quốc tế đầu tiên và sầm uất bậc nhất của Đại Việt trong nhiều thế kỷ. Nằm giữa vùng biển đảo kỳ vĩ của vịnh Bái Tử Long, nơi đây từng là cầu nối đưa gốm sứ, tơ lụa Việt vươn ra biển lớn, ghi dấu một thời kỳ mở cửa đầy hưng thịnh.' },
        { title: 'Thêu ren Văn Lâm', prov: 'Ninh Bình', desc: 'Nằm ngay bên thắng cảnh Tam Cốc – Bích Động, làng nghề thêu ren Văn Lâm có tuổi đời hơn 700 năm, nổi danh với những đường kim mũi chỉ tinh tế và sống động. Từ những tấm khăn trải bàn, bức tranh phong cảnh đến trang phục nghệ thuật, mỗi sản phẩm thêu ren nơi đây đều kết tinh sự kiên nhẫn, khéo léo và gu thẩm mỹ sâu sắc của người thợ cố đô.' },
        { title: 'Chiếu cói Nga Sơn', prov: 'Thanh Hóa', desc: 'Vùng đất ven biển Nga Sơn từ lâu nổi tiếng với những cánh đồng cói bạt ngàn và nghề dệt chiếu truyền thống hàng trăm năm tuổi. Nhờ sợi cói dẻo dai, nhỏ mịn cùng kỹ thuật dệt chắc tay và nhuộm màu bền đẹp, chiếu cói Nga Sơn không chỉ là vật dụng quen thuộc trong mỗi nếp nhà Việt mà còn là niềm tự hào của xứ Thanh.' },
        { title: 'Biến động Lam Giang', prov: 'Nghệ An – Hà Tĩnh', desc: 'Dòng sông Lam (Lam Giang) uốn lượn qua mảnh đất xứ Nghệ địa linh nhân kiệt, chứng kiến bao thăng trầm lịch sử và nuôi dưỡng nên cốt cách kiên trung, hiếu học của con người nơi đây. Từ những câu hò ví, giặm mộc mạc đến nhịp sống đổi thay hai bên bờ sông hôm nay, Lam Giang luôn là biểu tượng cho sức sống bền bỉ và khát vọng vươn lên của miền Trung.' },
        { title: 'Nón lá Ba Đồn', prov: 'Quảng Bình', desc: 'Làng nghề nón lá Ba Đồn gắn bó bao đời với người dân ven sông Gianh, nơi từng chiếc nón được chằm tỉ mỉ từ lá nón non, vành tre vót mỏng và sợi cước mảnh. Không chỉ là vật che nắng che mưa quen thuộc, chiếc nón lá Ba Đồn thanh thoát, bền đẹp còn mang theo nét duyên dáng bình dị của vùng đất gió Lào cát trắng.' },
        { title: 'Hương Thủy Xuân', prov: 'Thừa Thiên Huế', desc: 'Làng hương Thủy Xuân được biết đến với nghề làm hương truyền thống lâu đời ở xứ Huế, nổi tiếng với mùi hương trầm dịu nhẹ, thanh khiết từ nguyên liệu tự nhiên. Nơi đây còn thu hút du khách gần xa bởi khung cảnh rực rỡ của những bó chân hương đa sắc xanh, đỏ, tím, vàng bung xòe như những đóa hoa dưới nắng cố đô.' },
        { title: 'Thương cảng Tiên Sa', prov: 'Đà Nẵng', desc: 'Tiên Sa là khu vực cảng biển quan trọng của Đà Nẵng, nằm bên vịnh Đà Nẵng thơ mộng và gắn liền với vị trí chiến lược của thành phố trong giao thương đường biển. Cảng Tiên Sa ngày nay là một trong những cảng biển lớn của miền Trung, đóng vai trò then chốt trong hoạt động xuất nhập khẩu và kết nối hàng hóa quốc tế.' },
        { title: 'Gốm Thanh Hà', prov: 'Quảng Nam', desc: 'Làng gốm Thanh Hà là làng nghề truyền thống lâu đời ở Hội An, hình thành từ thế kỷ XVI, bắt nguồn từ làng Thanh Chiêm. Làng từng phát triển hưng thịnh vào thế kỷ XVI–XVII, với các sản phẩm gốm mộc sắc đỏ nâu đặc trưng được xem là thổ sản quý dùng để tiến vua. Ngày nay, làng gốm Thanh Hà vẫn gìn giữ kỹ thuật chế tác thủ công và trở thành điểm đến du lịch văn hóa hấp dẫn tại Hội An.' },
        { title: 'Tỏi Lý Sơn', prov: 'Quảng Ngãi', desc: 'Được mệnh danh là "vương quốc tỏi", đảo Lý Sơn nổi tiếng với giống tỏi trồng trên nền đất đỏ bazan pha cát san hô trắng ven biển. Nhờ thổ nhưỡng đặc biệt cùng sự chăm bón kỳ công của người nông dân đảo tiền tiêu, tỏi Lý Sơn có tép nhỏ, trắng bóng, mùi thơm nồng dịu và vị cay thanh khó nơi nào sánh bằng.' },
        { title: 'Bản lĩnh đất võ Bình Định', prov: 'Bình Định', desc: 'Bình Định từ lâu được gọi là miền "đất võ, trời văn", nổi tiếng với truyền thống thượng võ và tinh thần bất khuất của người dân miền Trung. Đây là cái nôi của võ cổ truyền Bình Định, gắn liền với phong trào Tây Sơn và tên tuổi người anh hùng áo vải Quang Trung – Nguyễn Huệ. Ngày nay, võ cổ truyền đã trở thành di sản văn hóa đặc sắc, góp phần tạo nên bản sắc riêng của vùng đất Bình Định.' },
        { title: 'Yến sào Nha Trang', prov: 'Khánh Hòa', desc: 'Nghề khai thác và chế biến yến sào ở Khánh Hòa đã hình thành hàng trăm năm, gắn liền với những hang đảo cheo leo giữa biển khơi Nha Trang. Được thiên nhiên ban tặng nguồn yến đảo giàu dinh dưỡng cùng kỹ thuật thu hoạch, sơ chế công phu của người thợ, yến sào Nha Trang từ lâu đã trở thành thượng phẩm quý giá và niềm tự hào của vùng đất xứ Trầm.' },
        { title: 'Gốm Chăm Bàu Trúc', prov: 'Ninh Thuận', desc: 'Qua hàng trăm năm, gốm Bàu Trúc được hun đúc và gìn giữ tại làng nghề truyền thống cùng tên ở thị trấn Phước Dân, huyện Ninh Phước, tỉnh Ninh Thuận. Với kỹ thuật nặn tay hoàn toàn không dùng bàn xoay và nung lộ thiên độc đáo, đây là một trong những làng gốm Chăm lâu đời nhất Đông Nam Á – một bảo tàng sống động lưu giữ những giá trị văn hóa quý báu của dân tộc Chăm.' },
        { title: 'Nước mắm Phan Thiết', prov: 'Bình Thuận', desc: 'Nước mắm Phan Thiết cho đến tận ngày nay vẫn luôn giữ trọn hương vị truyền thống nguyên chất từ cá cơm tươi và muối biển ủ chượp, dù đã trải qua hơn 300 năm thăng trầm của làng nghề. Với sắc nâu cánh gián đặc trưng cùng vị mặn mà, hậu ngọt đậm đà, nước mắm Phan Thiết đã trở thành gia vị thân thuộc trong mọi gian bếp gia đình Việt.' },
        { title: 'Bánh tráng An Ngãi', prov: 'Bà Rịa – Vũng Tàu', desc: 'Làng nghề bánh tráng An Ngãi (huyện Long Điền) có lịch sử hơn trăm năm và được công nhận là Di sản văn hóa phi vật thể quốc gia. Những chiếc bánh tráng làm từ gạo ngon pha theo tỉ lệ chuẩn, tráng thủ công trên bếp lửa hồng rồi phơi đều trên vỉ tre dưới nắng gió miền biển, mang hương vị dẻo thơm mộc mạc gắn liền với đời sống ẩm thực địa phương.' },
        { title: 'Lồng đèn Phú Bình', prov: 'TP. Hồ Chí Minh', desc: 'Lồng đèn giấy kiếng – một nét đẹp truyền thống gắn liền với những mùa trăng tròn trong ký ức tuổi thơ – vẫn còn được lưu giữ qua bàn tay khéo léo của các nghệ nhân tại làng nghề lồng đèn Phú Bình nổi tiếng của Sài Gòn. Từng khung tre uốn cong, lớp giấy kiếng rực rỡ và nét vẽ tay sinh động đã thắp sáng không khí Trung thu ấm áp qua nhiều thế hệ.' },
        { title: 'Biến động Thới Sơn', prov: 'Tiền Giang', desc: 'Cù lao Thới Sơn (Cồn Lân) tọa lạc tại hạ lưu sông Tiền là một trong những cồn thuộc bộ tứ linh "Long – Lân – Quy – Phụng" trứ danh miền Tây. Sở hữu diện tích rộng lớn lên đến 50ha cùng những vườn cây ăn trái trĩu quả và nhịp sống sông nước êm đềm, cù lao Thới Sơn được người dân nơi đây ví như một hòn ngọc quý.' },
        { title: 'Kẹo dừa Bến Tre', prov: 'Bến Tre', desc: 'Nhắc đến xứ dừa Bến Tre là nhắc ngay đến những viên kẹo dừa béo ngậy, thơm lừng mùi nước cốt dừa tươi và mạch nha dẻo quẹo. Ra đời từ giữa thế kỷ XX, nghề làm kẹo dừa đã đi qua bao đổi thay, sáng tạo thêm nhiều hương vị mới nhưng vẫn giữ nguyên nét ngọt lành, chân chất của người dân miệt vườn.' },
        { title: 'Bánh tét Trà Cuôn', prov: 'Trà Vinh', desc: 'Bánh tét Trà Cuôn là một trong những đặc sản trứ danh của Trà Vinh, ăn một lần là nhớ mãi nhờ sắc xanh mướt từ lá bồ ngót hòa quyện cùng nếp dẻo, đậu xanh, thịt mỡ và trứng muối béo bùi. Để tạo nên một đòn bánh thơm ngon, người thợ phải tỉ mỉ từ khâu chọn nguyên liệu, gói bánh đến nấu bánh – mỗi chiếc bánh như một tác phẩm nghệ thuật thể hiện sự khéo léo và tâm huyết của người nghệ nhân.' },
        { title: 'Bánh Pía Vũng Thơm', prov: 'Sóc Trăng', desc: 'Làng nghề bánh pía Vũng Thơm bắt nguồn từ các gia đình gốc Hoa tại hai làng Phước Tâm và Phú Nổ, khởi đầu từ lò Công Lập Thành của ông Âu Minh Xương rồi lan rộng sang nhiều lò bánh danh tiếng như Thuận Thành, Tân Hưng, Mỹ Hiệp Thành, Tạo Thành... Nhờ hương vị thơm bùi đặc trưng từ đậu xanh, sầu riêng và trứng muối, bánh pía đã trở thành đặc sản làm nên thương hiệu ẩm thực Sóc Trăng.' },
        { title: 'Muối Bạc Liêu', prov: 'Bạc Liêu', desc: 'Bạc Liêu là vùng đất thơ mộng nổi tiếng với nhiều danh thắng như Nhà công tử Bạc Liêu, chùa Xiêm Cán, vườn nhãn cổ… cùng nghề làm muối truyền thống là Di sản văn hóa phi vật thể quốc gia. Cánh đồng muối Bạc Liêu trắng xóa dưới nắng hòa cùng hình ảnh người diêm dân hăng say lao động tạo nên một bức tranh bình dị, để lại nhiều dấu ấn khó quên.' },
        { title: 'Ao tôm Cà Mau', prov: 'Cà Mau', desc: 'Ở vùng đất cực Nam Tổ quốc nơi rừng đước giao hòa cùng biển cả, nghề nuôi tôm sinh thái dưới tán rừng ngập mặn đã trở thành sinh kế chủ lực và nét đặc trưng của Cà Mau. Những vuông tôm trải dài giữa màu xanh bạt ngàn không chỉ mang lại nguồn thủy sản chất lượng cao vươn ra thế giới mà còn thể hiện lối sống thuận thiên bền vững của người dân đất Mũi.' },
        { title: 'Ngọc trai Phú Quốc', prov: 'Kiên Giang', desc: 'Nhờ vùng biển êm ả, nước trong xanh và giàu sinh vật phù du, đảo ngọc Phú Quốc là nơi lý tưởng phát triển nghề nuôi cấy ngọc trai chất lượng cao. Kết hợp giữa kỹ thuật nuôi cấy hiện đại và sự tỉ mỉ trong khâu chế tác, những viên ngọc trai Phú Quốc lấp lánh ánh xà cừ tự nhiên đã trở thành món quà biển cả sang trọng của hòn đảo.' },
        { title: 'Chợ nổi Cái Răng', prov: 'Cần Thơ', desc: 'Được hình thành từ đầu thế kỷ XX, chợ nổi Cái Răng là nơi người dân miền Tây tụ họp trao đổi, mua bán hàng hóa và đặc sản của vùng đồng bằng sông Cửu Long ngay trên sông nước. Với khung cảnh ghe xuồng tấp nập cùng "cây bẹo" treo hàng độc đáo từ sáng tinh mơ, chợ nổi Cái Răng luôn là điểm tham quan quen thuộc trong lịch trình khám phá Cần Thơ.' },
        { title: 'Lụa Tân Châu', prov: 'An Giang', desc: 'Làng nghề dệt lụa Tân Châu từng vang danh khắp Nam Kỳ với dòng lụa Mỹ A trứ danh, nổi bật bởi sắc đen tuyền bóng mượt nhuộm từ trái mặc nưa tự nhiên. Trải qua quy trình dệt và nhuộm phơi công phu hàng chục lần dưới nắng, tấm lụa Tân Châu mềm mại, mát rượi và bền đẹp, trở thành di sản quý báu của vùng đất đầu nguồn sông Tiền.' },
        { title: 'Làng hoa Sa Đéc', prov: 'Đồng Tháp', desc: 'Nằm bên bờ sông Tiền màu mỡ với tuổi đời hơn 100 năm, làng hoa Sa Đéc là một trong những vựa hoa kiểng lớn nhất đồng bằng sông Cửu Long. Điểm độc đáo của làng hoa là những giàn hoa trồng cao trên mặt nước, nơi người nông dân chèo xuồng chăm sóc hàng nghìn loài hoa khoe sắc rực rỡ quanh năm, đặc biệt nhộn nhịp mỗi độ xuân về.' },
        { title: 'Trống Bình An', prov: 'Long An', desc: 'Làng nghề làm trống Bình An (huyện Tân Trụ) có lịch sử gần 200 năm, nổi tiếng khắp miền Tây với những chiếc trống da trâu, gỗ mít cho âm thanh vang rền, trầm ấm. Để làm ra một chiếc trống bền đẹp, người nghệ nhân phải trải qua nhiều công đoạn cầu kỳ từ uốn tang, thuộc da đến bịt trống và canh âm, giữ lửa cho tiếng trống hội truyền thống Nam Bộ.' },
        { title: 'Bánh tráng phơi sương Trảng Bàng', prov: 'Tây Ninh', desc: 'Nhắc đến Tây Ninh không thể bỏ qua bánh tráng phơi sương Trảng Bàng – đặc sản độc đáo được tráng hai lớp, nướng phồng nhẹ rồi đem phơi ngoài sương đêm để đạt độ mềm dẻo vừa phải. Vị mặn nhẹ, thơm mùi gạo mới của bánh khi cuốn cùng thịt luộc và rau rừng tươi mát đã tạo nên sức hút khó cưỡng cho ẩm thực địa phương.' },
        { title: 'Điêu khắc đá Bửu Long', prov: 'Đồng Nai', desc: 'Với lịch sử hơn 300 năm, nghề điêu khắc đá Bửu Long (Biên Hòa, Đồng Nai) gắn liền với cộng đồng người Hoa bang Hẹ di cư đến vùng đất này. Những người thợ khéo léo chế tác nên nhiều sản phẩm tinh xảo như tượng đá, linh vật, đồ thờ cúng và vật dụng sinh hoạt. Qua nhiều thế hệ, nghề điêu khắc đá Bửu Long đã trở thành một nét văn hóa thủ công đặc sắc của vùng đất Đồng Nai.' },
        { title: 'Bản lĩnh Nam Tây Nguyên', prov: 'Đắk Nông', desc: 'Vùng đất Nam Tây Nguyên hiện lên đầy hùng vĩ với những đồi đất đỏ bazan trập trùng, thác nước tung bọt trắng xóa và di sản Công viên địa chất toàn cầu Đắk Nông. Nơi đây còn lưu giữ âm vang cồng chiêng, những thiên sử thi hào hùng và bản lĩnh kiên cường, hào sảng của đồng bào các dân tộc trong hành trình chinh phục thiên nhiên.' },
        { title: 'Nhà kính Đà Lạt', prov: 'Lâm Đồng', desc: 'Giữa cao nguyên Langbiang sương mù quanh năm, những khu nhà kính trải dài trên sườn đồi đã trở thành hình ảnh đặc trưng của nền nông nghiệp công nghệ cao Đà Lạt. Nhờ khí hậu ôn hòa kết hợp kỹ thuật canh tác hiện đại, Đà Lạt trở thành "vương quốc" hoa tươi, dâu tây và rau củ sạch, đồng thời tạo nên khung cảnh lung linh như "kinh đô ánh sáng" mỗi khi đêm xuống.' },
        { title: 'Cà phê Buôn Ma Thuột', prov: 'Đắk Lắk', desc: 'Được mệnh danh là "thủ phủ cà phê Việt Nam", Buôn Ma Thuột sở hữu thổ nhưỡng đất đỏ bazan màu mỡ và khí hậu lý tưởng cho những rẫy cà phê Robusta bạt ngàn. Hạt cà phê nơi đây mang hương thơm nồng nàn, vị đắng đậm đà và hậu vị sâu lắng, không chỉ định hình văn hóa thưởng thức cà phê Việt mà còn đưa thương hiệu nông sản nước nhà vươn tầm quốc tế.' },
        { title: 'Tượng gỗ Jrai', prov: 'Gia Lai', desc: 'Tượng gỗ dân gian là nét nghệ thuật điêu khắc độc đáo bậc nhất của đồng bào Jrai vùng Bắc Tây Nguyên. Chỉ bằng chiếc rìu, con dao thô sơ và những nhát đẽo phóng khoáng không theo khuôn mẫu, người nghệ nhân đã thổi hồn vào từng khúc gỗ rừng để khắc họa sinh động đời sống, tình cảm và thế giới tâm linh sâu sắc của buôn làng.' },
        { title: 'Thổ cẩm Kon Tum', prov: 'Kon Tum', desc: 'Nghề dệt thổ cẩm truyền thống của đồng bào Ba Na, Xơ Đăng, Giẻ Triêng ở Kon Tum là sự kết tinh tuyệt đẹp giữa kỹ thuật thủ công và tâm hồn nghệ sĩ của phụ nữ Tây Nguyên. Trên khung cửi mộc mạc, từng sợi chỉ nhuộm màu tự nhiên đan xen thành những hoa văn hình học, chim muông, nhà rông đầy sắc màu, gửi gắm câu chuyện văn hóa của đại ngàn.' },
        { title: 'Biến động Thành Cổ', prov: 'Quảng Trị', desc: 'Thành cổ Quảng Trị là chứng nhân lịch sử bi tráng gắn liền với 81 ngày đêm chiến đấu kiên cường mùa hè năm 1972. Trải qua mưa bom bão đạn và bao biến động thời cuộc, mảnh đất thiêng bên dòng sông Thạch Hãn hôm nay xanh rì cỏ cây, trở thành biểu tượng bất diệt của lòng yêu nước, sự hy sinh cao cả và khát vọng hòa bình.' },
        { title: 'Tương Nam Đàn', prov: 'Nghệ An', desc: 'Tương Nam Đàn là món chấm dân dã nức tiếng xứ Nghệ, được làm từ những nguyên liệu mộc mạc gồm đậu tương, ngô hoặc nếp, muối trắng và nước sạch. Nhờ quá trình ủ mốc kỳ công và phơi nắng tự nhiên nhiều tháng trời, từng mẻ tương sánh mịn, dậy mùi thơm đặc trưng cùng vị ngọt dịu hài hòa, thấm đẫm hương vị quê hương Bác Hồ.' },
        { title: 'Rượu cần Mường Vang', prov: 'Hòa Bình', desc: 'Rượu cần là thức uống truyền thống không thể thiếu trong các dịp lễ hội, mừng nhà mới hay đón khách quý của người Mường ở vùng Mường Vang (Lạc Sơn, Hòa Bình). Được ủ từ gạo nếp nương và men lá rừng bí truyền trong những ché gốm cổ, rượu cần có vị ngọt thanh, hơi cay nồng ấm áp, là sợi dây gắn kết tình thân bên bếp lửa nhà sàn.' },
        { title: 'Khăn Piêu Sơn La', prov: 'Sơn La', desc: 'Khăn Piêu là niềm tự hào và biểu tượng cho sự khéo léo, đảm đang của người phụ nữ dân tộc Thái ở Sơn La. Trên nền vải chàm mộc mạc, những họa tiết hình học và hoa văn rực rỡ được thêu hoàn toàn bằng tay từ mặt trái vải một cách tinh xảo, không chỉ tô điểm cho nét duyên dáng của thiếu nữ Tây Bắc mà còn mang ý nghĩa sâu sắc trong đời sống tinh thần.' },
        { title: 'Miến dong Bình Lư', prov: 'Lai Châu', desc: 'Nằm giữa thung lũng xanh mát của huyện Tam Đường, làng nghề miến dong Bình Lư nổi tiếng với những sợi miến trong veo, dai giòn và thơm dịu mùi củ dong riềng trồng trên nương cao. Được làm từ nguồn nước suối tinh khiết và phơi khô tự nhiên trên những phên tre trải dài khắp bản, miến dong Bình Lư đã trở thành đặc sản tinh túy của núi rừng Tây Bắc.' },
        { title: 'Chợ phiên Tây Bắc', prov: 'Lào Cai', desc: 'Chợ phiên vùng cao Tây Bắc không chỉ là nơi trao đổi nông sản, thổ cẩm hay nông cụ mà còn là không gian sinh hoạt văn hóa rực rỡ sắc màu của đồng bào các dân tộc thiểu số. Giữa làn sương sớm bảng lảng của núi rừng, tiếng khèn gọi bạn, sắc váy áo thổ cẩm hòa cùng hương thắng cố, rượu ngô tạo nên một bức tranh vùng cao sống động và đầy sức hút.' },
        { title: 'Dệt lanh Lùng Tám', prov: 'Hà Giang', desc: 'Nằm giữa cao nguyên đá Đồng Văn hùng vĩ, hợp tác xã dệt lanh Lùng Tám (Quản Bạ) là nơi những người phụ nữ dân tộc Mông gìn giữ nghề dệt lanh truyền thống qua hàng chục công đoạn thủ công hoàn toàn. Từ việc tước vỏ cây lanh, xe sợi, dệt vải đến vẽ sáp ong và nhuộm chàm tự nhiên, từng tấm vải lanh mang vẻ đẹp mộc mạc, bền chắc và đậm đà bản sắc vùng cực Bắc.' },
        { title: 'Làng rèn Phúc Sen', prov: 'Cao Bằng', desc: 'Làng rèn Phúc Sen (huyện Quảng Hòa) của đồng bào dân tộc Nùng An có lịch sử hơn 300 năm, nổi danh khắp cả nước với những sản phẩm dao, kéo, nông cụ sắc bén và siêu bền. Người thợ nơi đây vẫn giữ kỹ thuật tôi thép thủ công bằng cảm quan tinh tường qua màu lửa và tiếng búa, tạo nên thương hiệu dao Phúc Sen trứ danh.' },
        { title: 'Bản lĩnh Hòn Vọng Phu', prov: 'Lạng Sơn', desc: 'Nằm sừng sững trên đỉnh núi thuộc phường Tam Thanh (TP. Lạng Sơn), Hòn Vọng Phu mang dáng hình người mẹ bồng con hướng về phương xa, gắn liền với truyền thuyết cảm động về lòng thủy chung son sắt. Giữa mây trời biên cương lộng gió, hình ảnh tảng đá nghìn năm đứng vững trước phong ba còn trở thành biểu tượng cho bản lĩnh kiên cường, bền bỉ của con người xứ Lạng.' },
        { title: 'Mỳ Chũ Thủ Dương', prov: 'Bắc Giang', desc: 'Làng nghề Mỳ Chũ Thủ Dương (huyện Lục Ngạn) nổi tiếng với những sợi mỳ gạo trắng ngần, dẻo dai mà không bị nát khi nấu. Bí quyết làm nên danh tiếng mỳ Chũ nằm ở giống gạo Bao Thai Hồng đặc sản địa phương, nguồn nước giếng ngọt lành cùng đôi bàn tay tráng bánh, cắt sợi và phơi nắng khéo léo của người dân vùng đất trung du Bắc Bộ.' },
        { title: 'Đồi chè Tân Cương', prov: 'Thái Nguyên', desc: 'Được mệnh danh là "đệ nhất danh trà", vùng chè Tân Cương gây ấn tượng mạnh với những đồi chè xanh mướt uốn lượn như bát úp dưới chân dãy Tam Đảo. Nhờ khí hậu, thổ nhưỡng đặc thù cùng kỹ thuật sao chè thủ công điêu luyện của người dân địa phương, trà Tân Cương sở hữu hương cốm non thanh tao, vị chát dịu và hậu ngọt sâu lắng khó quên.' },
    ];

    /* ---------- Giao diện: nút "Tìm hiểu thẻ tài sản" + thẻ địa danh lật mặt ---------- */
    (function () {
        const tr = s => (typeof __t === 'function' ? __t(s) : s);
        const css = `
        .lm-overlay{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:16px;background:radial-gradient(ellipse at 50% 40%,rgba(80,36,10,.55),rgba(18,8,3,.86));backdrop-filter:blur(5px);opacity:0;transition:opacity .28s ease}
        .lm-overlay.show{opacity:1}
        .lm-wrap{display:flex;flex-direction:column;align-items:center;gap:14px;animation:lmIn .75s cubic-bezier(.2,.9,.25,1.15) both}
        @keyframes lmIn{0%{transform:translateY(70px) scale(.55) rotate(-8deg);opacity:0}60%{opacity:1}100%{transform:none;opacity:1}}
        .lm-stage{perspective:1500px;width:min(84vw,340px);height:min(68vh,490px);animation:lmFloat 5s ease-in-out 1s infinite}
        @keyframes lmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .lm-card{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .9s cubic-bezier(.45,.05,.15,1);cursor:pointer;-webkit-tap-highlight-color:transparent}
        .lm-card.flipped{transform:rotateY(180deg)}
        .lm-card:hover:not(.flipped){transform:rotateY(-6deg) rotateX(3deg)}
        .lm-face{position:absolute;inset:0;border-radius:24px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 22px 50px rgba(0,0,0,.55),0 0 0 3px #c8963e,0 0 0 7px #6b2a12,inset 0 0 0 2px rgba(255,236,190,.7);display:flex;flex-direction:column;color:#4a2510}
        .lm-front{background:radial-gradient(circle at 50% 38%,#fff6de 0%,#f3dfb2 62%,#e4c88c 100%)}
        .lm-back{transform:rotateY(180deg);background:linear-gradient(180deg,#fff8e6 0%,#f4e3bb 100%)}
        .lm-face:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;background:repeating-linear-gradient(45deg,transparent 0 11px,rgba(160,100,40,.05) 11px 12px),repeating-linear-gradient(-45deg,transparent 0 11px,rgba(160,100,40,.05) 11px 12px)}
        .lm-band{position:relative;padding:13px 16px 10px;text-align:center;color:#fff3cf;font:900 12px/1 "Nunito",sans-serif;letter-spacing:.18em;text-transform:uppercase;background:linear-gradient(180deg,var(--lm-c,#b91c1c),#7f1d1d);border-bottom:3px solid #c8963e}
        .lm-medal{position:relative;margin:26px auto 8px;width:190px;height:190px;border-radius:50%;box-shadow:0 8px 20px rgba(80,40,10,.35),0 0 0 5px #c8963e,0 0 0 8px #6b2a12;overflow:hidden;background:#fdf6e2}
        .lm-medal canvas{width:100%;height:100%;display:block}
        .lm-title{position:relative;margin:14px 18px 0;text-align:center;font:900 27px/1.15 "Baloo 2","Nunito",sans-serif;color:#6b2a12;text-shadow:0 2px 0 rgba(255,255,255,.7)}
        .lm-prov{position:relative;align-self:center;margin-top:10px;padding:5px 15px;border-radius:999px;font:800 13px/1 "Nunito",sans-serif;color:#fff3cf;background:linear-gradient(180deg,#9a3412,#7c2d12);box-shadow:0 2px 0 #4a1a08}
        .lm-orn{position:relative;margin:16px auto 0;width:70%;text-align:center;font:900 13px/1 serif;color:#c8963e;letter-spacing:.5em;display:flex;align-items:center;gap:10px}
        .lm-orn:before,.lm-orn:after{content:"";flex:1;height:2px;background:linear-gradient(90deg,transparent,#c8963e,transparent)}
        .lm-hint{position:relative;margin-top:auto;padding:12px 10px 16px;text-align:center;font:800 12px/1.2 "Nunito",sans-serif;color:#8a5a2b;letter-spacing:.04em}
        .lm-hint b{display:inline-block;animation:lmPulse 1.6s ease-in-out infinite}
        @keyframes lmPulse{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}
        .lm-back-h{position:relative;padding:14px 16px 10px;text-align:center;color:#fff3cf;background:linear-gradient(180deg,var(--lm-c,#b91c1c),#7f1d1d);border-bottom:3px solid #c8963e}
        .lm-back-h .t{font:900 18px/1.15 "Baloo 2","Nunito",sans-serif}
        .lm-back-h .p{margin-top:3px;font:700 11px/1 "Nunito",sans-serif;opacity:.9;letter-spacing:.06em}
        .lm-desc{position:relative;flex:1;overflow-y:auto;padding:16px 20px 8px;font:600 14.5px/1.62 "Nunito",sans-serif;text-align:justify;color:#4a2510}
        .lm-desc:first-letter{font:900 34px/1 "Baloo 2",serif;color:#9a3412;float:left;margin:2px 6px 0 0}
        .lm-foot{position:relative;padding:8px 10px 14px;text-align:center;font:800 11px/1 "Nunito",sans-serif;color:#8a5a2b;letter-spacing:.05em;border-top:1px dashed rgba(139,90,43,.4);margin:0 18px}
        .lm-btns{display:flex;gap:10px}
        .lm-btn{padding:9px 18px;border-radius:14px;font:900 13px/1 "Nunito",sans-serif;cursor:pointer;border:2px solid #c8963e;color:#fff3cf;background:linear-gradient(180deg,#9a3412,#7c2d12);box-shadow:0 3px 0 #4a1a08;transition:transform .12s}
        .lm-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #4a1a08}
        .lm-btn.alt{background:linear-gradient(180deg,#f6e6bd,#e5c98c);color:#6b2a12}
        .lm-learn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:6px;padding:7px 10px;border-radius:12px;font:900 11.5px/1 "Nunito",sans-serif;cursor:pointer;color:#fff3cf;border:2px solid #c8963e;background:linear-gradient(180deg,#9a3412,#7c2d12);box-shadow:0 2px 0 #4a1a08;transition:transform .12s,filter .12s}
        .lm-learn:hover{filter:brightness(1.12)}.lm-learn:active{transform:translateY(1px)}
        .lm-stage{width:min(88vw,380px);height:min(80vh,590px)}
        .lm-face{background:#f8ecc9 var(--lm-bg) center/cover no-repeat}
        .lm-front,.lm-back{background:#f8ecc9 var(--lm-bg) center/cover no-repeat}
        .lm-back{background-image:var(--lm-bg),linear-gradient(180deg,#fff8e6,#f4e3bb)}
        .lm-head{position:relative;padding:13px 14px 12px;text-align:center;color:#fff3cf;background:linear-gradient(180deg,var(--lm-c,#b91c1c),#5a1d12);border-bottom:3px solid #c8963e}
        .lm-head .t{font:800 24px/1.12 "Baloo 2","Nunito",sans-serif;text-shadow:0 2px 0 rgba(0,0,0,.25)}
        .lm-head .p{margin-top:7px;display:flex;justify-content:center}
        .lm-head .p span{padding:5px 16px;border-radius:999px;font:800 13px/1 "Nunito",sans-serif;background:linear-gradient(180deg,#9a3412,#6b2a12);box-shadow:0 2px 0 #3d1508,inset 0 0 0 1px rgba(255,220,150,.35)}
        .lm-medal{width:212px;height:212px;margin:16px auto 4px;flex:none;position:relative;border-radius:50%;box-shadow:0 8px 18px rgba(80,40,10,.35);background:#fdf6e2;overflow:hidden}
        .lm-medal img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%}
        .lm-medal-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:96px}
        .lm-price{position:relative;align-self:center;margin:8px 0 2px;padding:9px 30px;border-radius:999px;font:900 20px/1 "Baloo 2","Nunito",sans-serif;color:#fff3cf;background:linear-gradient(180deg,#a53a14,#7c2d12);box-shadow:0 3px 0 #4a1a08,inset 0 0 0 1px rgba(255,220,150,.35);white-space:pre}
        .lm-fees{position:relative;padding:0 14px;margin-top:2px}
        .lm-row{display:flex;align-items:baseline;gap:8px;padding:2px 0;font:italic 700 15px/1.25 "Baloo 2","Nunito",sans-serif;color:#7c3a12}
        .lm-row b{flex:0 0 118px;font-style:normal;font-weight:800;color:#6b2a12;text-align:right;font-size:14.5px}
        .lm-row span{flex:1;letter-spacing:.01em}
        .lm-stars span{font-size:13px;letter-spacing:.05em}
        .lm-tool{padding:2px 14px 0}
        .lm-tool b{flex:0 0 auto}
        .lm-quote{position:relative;margin:6px 20px 0;text-align:center;font:italic 600 13px/1.35 "Nunito",sans-serif;color:#6b3a14}
        .lm-hint{margin-top:auto}
        .lm-desc{padding:20px 22px 8px;font:700 16.5px/1.62 "Nunito",sans-serif;text-align:left}
        .lm-desc:first-letter{font:900 50px/.9 "Baloo 2",serif;color:#9a3412;float:left;margin:3px 7px 0 0}
        @media (prefers-reduced-motion:reduce){.lm-card{transition-duration:.01s}.lm-stage,.lm-wrap,.lm-hint b{animation:none}}`;
        const cloud = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})" fill="none" stroke="#c9a55f" stroke-width="3" stroke-linecap="round"><path d="M10 70c-12 0-12-20 2-22 0-16 22-22 32-8 8-14 34-10 36 8 18-2 24 22 6 22z" fill="#e7cf99" fill-opacity=".55"/><path d="M26 56c6-8 16-6 18 2M50 52c6-6 16-4 18 4"/><path d="M80 70c20 2 40-6 62-4" /><path d="M140 66c8-2 14 2 12 8"/></g>`;
        const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="590" viewBox="0 0 380 590">${cloud(-10, 110, 1.6)}${cloud(190, 250, 1.3)}${cloud(-30, 400, 1.4)}${cloud(210, 470, 1.2)}<g fill="none" stroke="#c9a55f" stroke-width="2" opacity=".6">${[0,1,2,3,4,5].map(i => [0,1,2,3].map(j => `<path d="M${i*70-20+(j%2)*35} ${600-j*18}a35 35 0 0 1 70 0M${i*70-8+(j%2)*35} ${600-j*18}a23 23 0 0 1 46 0"/>`).join('')).join('')}</g></svg>`;
        const st = document.createElement('style'); st.textContent = '.lm-overlay{--lm-bg:url("data:image/svg+xml,' + encodeURIComponent(bgSvg) + '")}' + css; document.head.appendChild(st);

        let ov = null;
        const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

        function closeLandmarkCard() {
            if (!ov) return;
            const o = ov; ov = null; o.classList.remove('show'); document.removeEventListener('keydown', onKey, true);
            setTimeout(() => o.remove(), 300);
        }
        function onKey(e) {
            if (!ov) return;
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeLandmarkCard(); }
            else if (e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); const c = ov.querySelector('.lm-card'); c && c.classList.toggle('flipped'); }
        }
        function openLandmarkCard(idx) {
            const info = LANDMARK_INFO[idx], tile = BOARD_TILES[idx];
            if (!info || !tile) return;
            if (ov) { ov.remove(); ov = null; }
            const color = tile.color || '#b91c1c';
            ov = el('div', 'lm-overlay'); ov.style.setProperty('--lm-c', color);
            const wrap = el('div', 'lm-wrap'), stage = el('div', 'lm-stage'), card = el('div', 'lm-card');

            const num = idx + 1, hasFee = tile.type === 'PROPERTY' && tile.starCost && tile.starRent;
            const mkHead = cls => { const h = el('div', cls); h.appendChild(el('div', 't', num + '. ' + tr(info.title))); const pv = el('div', 'p'); pv.appendChild(el('span', null, '📍 ' + tr(info.prov))); h.appendChild(pv); return h; };

            // mặt trước: tranh minh họa + bảng giá của thẻ tài sản
            const front = el('div', 'lm-face lm-front');
            front.appendChild(mkHead('lm-head'));
            const medal = el('div', 'lm-medal');
            const img = document.createElement('img'); img.alt = ''; img.draggable = false; img.src = 'assets/landmarks/' + String(num).padStart(2, '0') + '.jpg';
            const fb = el('div', 'lm-medal-fb', tile.icon || '🏯');
            img.onerror = () => { img.remove(); };
            medal.appendChild(fb); medal.appendChild(img); front.appendChild(medal);
            if (hasFee) {
                const cum = []; let acc = 0; for (let s = 1; s <= 5; s++) { acc += tile.starCost[s]; cum.push(acc); }
                front.appendChild(el('div', 'lm-price', tr('Phí đầu tư:') + '  ' + tile.price));
                const tb = el('div', 'lm-fees');
                const stars = el('div', 'lm-row lm-stars'); stars.appendChild(el('span', null, '')); const sv = el('span'); sv.textContent = '⭐ ⭐ ⭐ ⭐ ⭐'; stars.appendChild(sv); tb.appendChild(stars);
                const row = (lab, arr) => { const r = el('div', 'lm-row'); r.appendChild(el('b', null, tr(lab))); r.appendChild(el('span', null, arr.join(' - '))); tb.appendChild(r); };
                row('Phí dịch vụ:', tile.starRent.slice(1));
                row('Phí nâng cấp:', tile.starCost.slice(2));
                row('Giá trị cầm cố:', cum);
                front.appendChild(tb);
                const tl = el('div', 'lm-row lm-tool'); tl.appendChild(el('b', null, tr('Công cụ miễn phí:'))); tl.appendChild(el('span', null, tr(tile.toolSpec))); front.appendChild(tl);
                if (tile.situation) front.appendChild(el('div', 'lm-quote', '\u201c' + tr(tile.situation) + '\u201d'));
            } else {
                if (tile.subtitle) front.appendChild(el('div', 'lm-price', tr(tile.subtitle)));
                if (tile.desc) front.appendChild(el('div', 'lm-quote', tr(tile.desc)));
            }
            const hint = el('div', 'lm-hint'); hint.appendChild(el('span', null, 'Chạm vào thẻ để lật ')); hint.appendChild(el('b', null, '↻')); front.appendChild(hint);

            // mặt sau: lời giới thiệu
            const back = el('div', 'lm-face lm-back');
            back.appendChild(mkHead('lm-head'));
            back.appendChild(el('div', 'lm-desc', tr(info.desc)));
            back.appendChild(el('div', 'lm-foot', 'Chạm để lật lại'));

            card.appendChild(front); card.appendChild(back); stage.appendChild(card); wrap.appendChild(stage);
            const btns = el('div', 'lm-btns'), flip = el('button', 'lm-btn alt', 'Lật thẻ'), close = el('button', 'lm-btn', 'Đóng');
            flip.type = close.type = 'button';
            flip.onclick = e => { e.stopPropagation(); card.classList.toggle('flipped'); try { playSFX('step'); } catch (x) { } };
            close.onclick = e => { e.stopPropagation(); closeLandmarkCard(); };
            btns.appendChild(flip); btns.appendChild(close); wrap.appendChild(btns);
            card.onclick = () => { card.classList.toggle('flipped'); try { playSFX('step'); } catch (x) { } };
            ov.onclick = e => { if (e.target === ov) closeLandmarkCard(); };
            ov.appendChild(wrap); document.body.appendChild(ov);
            document.addEventListener('keydown', onKey, true);
            requestAnimationFrame(() => ov && ov.classList.add('show'));
            try { playSFX('card'); } catch (e) { }
        }
        window.openLandmarkCard = openLandmarkCard; window.closeLandmarkCard = closeLandmarkCard;

        // nút "Tìm hiểu thẻ tài sản" nằm trong thẻ thông tin ô
        function ensureLearnBtn() {
            let b = document.getElementById('insp-learn-btn');
            if (b) return b;
            const wrapEl = document.getElementById('insp-body-wrap'); if (!wrapEl) return null;
            b = el('button', 'lm-learn'); b.id = 'insp-learn-btn'; b.type = 'button';
            b.appendChild(el('span', null, '📖')); b.appendChild(el('span', null, 'Tìm hiểu thẻ tài sản'));
            b.onclick = () => openLandmarkCard(gameState.selectedTileIndex);
            wrapEl.appendChild(b); return b;
        }
        const _upd = updateTileInspector;
        updateTileInspector = function (i) { const r = _upd.apply(this, arguments); ensureLearnBtn(); return r; };
        const boot = () => { ensureLearnBtn(); };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    })();
