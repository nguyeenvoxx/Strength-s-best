# Test Cases - Ứng dụng Thực phẩm Chức năng Strength's Best

## Module Đăng nhập và Xác thực

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| AUTH-001 | Đăng ký tài khoản mới | Người dùng có thể đăng ký với email, mật khẩu, họ tên, số điện thoại hợp lệ | | Manual | Manual | Tester | 2024-01-15 | 1. Mở ứng dụng<br>2. Chọn "Đăng ký"<br>3. Điền đầy đủ thông tin<br>4. Nhấn "Đăng ký" | Kiểm tra validation email, độ mạnh mật khẩu |
| AUTH-002 | Đăng nhập tài khoản | Người dùng có thể đăng nhập với email và mật khẩu đúng | | Manual | Manual | Tester | 2024-01-15 | 1. Mở ứng dụng<br>2. Nhập email/mật khẩu<br>3. Nhấn "Đăng nhập" | Kiểm tra token được tạo |
| AUTH-003 | Xác thực email OTP | Người dùng nhận mã OTP và xác thực thành công | | Manual | Manual | Tester | 2024-01-15 | 1. Đăng ký tài khoản<br>2. Kiểm tra email OTP<br>3. Nhập mã 4 số<br>4. Xác thực | Kiểm tra email được gửi |
| AUTH-004 | Quên mật khẩu | Người dùng có thể yêu cầu đặt lại mật khẩu | | Manual | Manual | Tester | 2024-01-15 | 1. Chọn "Quên mật khẩu"<br>2. Nhập email<br>3. Gửi yêu cầu | Kiểm tra email reset |
| AUTH-005 | Đăng xuất | Người dùng có thể đăng xuất và xóa session | | Manual | Manual | Tester | 2024-01-15 | 1. Đăng nhập<br>2. Vào profile<br>3. Chọn "Đăng xuất" | Kiểm tra session bị xóa |

## Module Sản phẩm

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| PROD-001 | Hiển thị danh sách sản phẩm | Hiển thị danh sách sản phẩm từ API với hình ảnh và giá | | Manual | Manual | Tester | 2024-01-15 | 1. Mở trang chủ<br>2. Kiểm tra danh sách sản phẩm | Kiểm tra hình ảnh, giá cả |
| PROD-002 | Tìm kiếm sản phẩm | Tìm kiếm sản phẩm theo tên | | Manual | Manual | Tester | 2024-01-15 | 1. Vào tab tìm kiếm<br>2. Nhập từ khóa<br>3. Kiểm tra kết quả | Test với từ khóa hợp lệ/không hợp lệ |
| PROD-003 | Lọc sản phẩm theo danh mục | Lọc sản phẩm theo danh mục và thương hiệu | | Manual | Manual | Tester | 2024-01-15 | 1. Mở trang sản phẩm<br>2. Chọn danh mục<br>3. Chọn thương hiệu<br>4. Kiểm tra kết quả | Test nhiều bộ lọc |
| PROD-004 | Xem chi tiết sản phẩm | Hiển thị đầy đủ thông tin sản phẩm | | Manual | Manual | Tester | 2024-01-15 | 1. Chọn sản phẩm<br>2. Kiểm tra thông tin chi tiết | Kiểm tra hình ảnh, mô tả, giá |
| PROD-005 | Thêm vào yêu thích | Thêm sản phẩm vào danh sách yêu thích | | Manual | Manual | Tester | 2024-01-15 | 1. Mở chi tiết sản phẩm<br>2. Nhấn icon tim<br>3. Kiểm tra danh sách yêu thích | Yêu cầu đăng nhập |

## Module Giỏ hàng

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| CART-001 | Thêm sản phẩm vào giỏ hàng | Thêm sản phẩm vào giỏ hàng thành công | | Manual | Manual | Tester | 2024-01-15 | 1. Mở chi tiết sản phẩm<br>2. Nhấn "Thêm vào giỏ"<br>3. Kiểm tra giỏ hàng | Kiểm tra số lượng cập nhật |
| CART-002 | Cập nhật số lượng sản phẩm | Tăng/giảm số lượng sản phẩm trong giỏ hàng | | Manual | Manual | Tester | 2024-01-15 | 1. Mở giỏ hàng<br>2. Nhấn nút +/-<br>3. Kiểm tra tổng tiền | Kiểm tra tính toán giá |
| CART-003 | Xóa sản phẩm khỏi giỏ hàng | Xóa sản phẩm khỏi giỏ hàng | | Manual | Manual | Tester | 2024-01-15 | 1. Mở giỏ hàng<br>2. Nhấn nút xóa<br>3. Xác nhận | Kiểm tra giỏ hàng trống |
| CART-004 | Lưu trữ giỏ hàng | Giỏ hàng được lưu trữ sau khi đóng ứng dụng | | Manual | Manual | Tester | 2024-01-15 | 1. Thêm sản phẩm vào giỏ<br>2. Đóng ứng dụng<br>3. Mở lại ứng dụng | Kiểm tra AsyncStorage |
| CART-005 | Tính tổng tiền giỏ hàng | Tính tổng tiền chính xác | | Manual | Manual | Tester | 2024-01-15 | 1. Thêm nhiều sản phẩm<br>2. Kiểm tra tổng tiền | Kiểm tra tính toán giảm giá |

## Module Quản lý Địa chỉ

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| ADDR-001 | Thêm địa chỉ mới | Thêm địa chỉ giao hàng mới | | Manual | Manual | Tester | 2024-01-15 | 1. Vào profile<br>2. Chọn "Quản lý địa chỉ"<br>3. Thêm địa chỉ mới | Kiểm tra validation |
| ADDR-002 | Chỉnh sửa địa chỉ | Chỉnh sửa thông tin địa chỉ | | Manual | Manual | Tester | 2024-01-15 | 1. Mở danh sách địa chỉ<br>2. Chọn chỉnh sửa<br>3. Cập nhật thông tin | Kiểm tra API call |
| ADDR-003 | Xóa địa chỉ | Xóa địa chỉ khỏi danh sách | | Manual | Manual | Tester | 2024-01-15 | 1. Mở danh sách địa chỉ<br>2. Chọn xóa<br>3. Xác nhận | Kiểm tra xóa thành công |
| ADDR-004 | Đặt địa chỉ mặc định | Đặt địa chỉ làm mặc định | | Manual | Manual | Tester | 2024-01-15 | 1. Mở danh sách địa chỉ<br>2. Chọn "Đặt mặc định" | Kiểm tra API update |
| ADDR-005 | Tích hợp API địa chỉ | API địa chỉ hoạt động chính xác | | Automatic | Automatic | Tester | 2024-01-15 | 1. Chạy test-address-api.js<br>2. Kiểm tra console output | Kiểm tra sửa lỗi 404 |

## Module Thanh toán

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| CHECK-001 | Tóm tắt đơn hàng | Hiển thị chi tiết đơn hàng chính xác | | Manual | Manual | Tester | 2024-01-15 | 1. Thêm sản phẩm vào giỏ<br>2. Tiến hành thanh toán<br>3. Kiểm tra tóm tắt | Kiểm tra giá, số lượng |
| CHECK-002 | Chọn địa chỉ giao hàng | Chọn địa chỉ giao hàng | | Manual | Manual | Tester | 2024-01-15 | 1. Vào thanh toán<br>2. Chọn "Chọn địa chỉ"<br>3. Chọn địa chỉ | Kiểm tra dữ liệu địa chỉ |
| CHECK-003 | Chọn phương thức thanh toán | Chọn phương thức thanh toán | | Manual | Manual | Tester | 2024-01-15 | 1. Vào thanh toán<br>2. Chọn phương thức<br>3. Tiếp tục | Test tất cả phương thức |
| CHECK-004 | Áp dụng voucher | Áp dụng voucher giảm giá | | Manual | Manual | Tester | 2024-01-15 | 1. Vào thanh toán<br>2. Chọn "Áp dụng voucher"<br>3. Chọn voucher | Kiểm tra giảm giá |
| CHECK-005 | Kiểm tra đơn hàng | Kiểm tra đơn hàng trước khi gửi | | Manual | Manual | Tester | 2024-01-15 | 1. Thử thanh toán không có địa chỉ<br>2. Kiểm tra thông báo lỗi | Test tất cả validation |

## Module Thanh toán

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| PAY-001 | Thanh toán VNPay QR | Tạo mã QR VNPay | | Manual | Manual | Tester | 2024-01-15 | 1. Chọn thanh toán VNPay<br>2. Kiểm tra tạo QR | Kiểm tra mã QR |
| PAY-002 | Thanh toán MoMo QR | Tạo mã QR MoMo | | Manual | Manual | Tester | 2024-01-15 | 1. Chọn thanh toán MoMo<br>2. Kiểm tra tạo QR | Kiểm tra mã QR |
| PAY-003 | Thanh toán tiền mặt | Xử lý đơn hàng COD | | Manual | Manual | Tester | 2024-01-15 | 1. Chọn COD<br>2. Hoàn thành đơn hàng<br>3. Kiểm tra xác nhận | Kiểm tra trạng thái đơn hàng |
| PAY-004 | Thanh toán thành công | Xử lý thanh toán thành công | | Manual | Manual | Tester | 2024-01-15 | 1. Hoàn thành thanh toán<br>2. Kiểm tra màn hình thành công<br>3. Kiểm tra đơn hàng | Kiểm tra tạo đơn hàng |
| PAY-005 | Thanh toán thất bại | Xử lý thanh toán thất bại | | Manual | Manual | Tester | 2024-01-15 | 1. Giả lập thanh toán thất bại<br>2. Kiểm tra xử lý lỗi | Kiểm tra thông báo lỗi |

## Module Hồ sơ

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| PROF-001 | Chỉnh sửa hồ sơ | Cập nhật thông tin hồ sơ người dùng | | Manual | Manual | Tester | 2024-01-15 | 1. Vào profile<br>2. Chọn "Chỉnh sửa"<br>3. Cập nhật thông tin | Kiểm tra API call |
| PROF-002 | Đổi mật khẩu | Thay đổi mật khẩu người dùng | | Manual | Manual | Tester | 2024-01-15 | 1. Vào profile<br>2. Chọn "Đổi mật khẩu"<br>3. Nhập mật khẩu mới | Kiểm tra thay đổi mật khẩu |
| PROF-003 | Tải lên avatar | Tải lên ảnh đại diện | | Manual | Manual | Tester | 2024-01-15 | 1. Vào chỉnh sửa hồ sơ<br>2. Chọn avatar<br>3. Chọn ảnh | Kiểm tra tải lên ảnh |
| PROF-004 | Xem lịch sử đơn hàng | Hiển thị lịch sử đơn hàng | | Manual | Manual | Tester | 2024-01-15 | 1. Vào profile<br>2. Chọn "Đơn hàng đã mua"<br>3. Kiểm tra danh sách đơn hàng | Kiểm tra dữ liệu đơn hàng |
| PROF-005 | Đăng xuất | Đăng xuất khỏi ứng dụng | | Manual | Manual | Tester | 2024-01-15 | 1. Vào profile<br>2. Chọn đăng xuất<br>3. Xác nhận | Kiểm tra xóa session |

## Module Thưởng

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| REW-001 | Xem voucher có sẵn | Hiển thị danh sách voucher có sẵn | | Manual | Manual | Tester | 2024-01-15 | 1. Vào tab thưởng<br>2. Kiểm tra danh sách voucher | Kiểm tra dữ liệu API |
| REW-002 | Đổi voucher | Đổi điểm lấy voucher | | Manual | Manual | Tester | 2024-01-15 | 1. Chọn voucher<br>2. Nhấn "Đổi voucher"<br>3. Xác nhận | Kiểm tra trừ điểm |
| REW-003 | Đăng nhập hàng ngày | Nhận điểm cho đăng nhập hàng ngày | | Manual | Manual | Tester | 2024-01-15 | 1. Đăng nhập hàng ngày<br>2. Kiểm tra tăng điểm | Kiểm tra hệ thống điểm |
| REW-004 | Sử dụng voucher | Sử dụng voucher trong thanh toán | | Manual | Manual | Tester | 2024-01-15 | 1. Vào thanh toán<br>2. Áp dụng voucher<br>3. Kiểm tra giảm giá | Kiểm tra giảm giá |
| REW-005 | Lịch sử điểm | Xem lịch sử điểm | | Manual | Manual | Tester | 2024-01-15 | 1. Vào thưởng<br>2. Kiểm tra lịch sử điểm | Kiểm tra log giao dịch |

## Module Tích hợp API

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| API-001 | API Sản phẩm | Lấy sản phẩm thành công | | Automatic | Automatic | Tester | 2024-01-15 | 1. Chạy test-products-api.js<br>2. Kiểm tra response | Kiểm tra endpoint API |
| API-002 | API Xác thực | Đăng nhập/đăng xuất hoạt động | | Automatic | Automatic | Tester | 2024-01-15 | 1. Chạy test-login.js<br>2. Kiểm tra token | Kiểm tra luồng xác thực |
| API-003 | API Địa chỉ | Thao tác CRUD địa chỉ | | Automatic | Automatic | Tester | 2024-01-15 | 1. Chạy test-address-api.js<br>2. Kiểm tra CRUD | Kiểm tra sửa lỗi 404 |
| API-004 | API Giỏ hàng | Thao tác giỏ hàng | | Automatic | Automatic | Tester | 2024-01-15 | 1. Chạy test-cart-api.js<br>2. Kiểm tra thao tác | Kiểm tra đồng bộ giỏ hàng |
| API-005 | API Thanh toán | Xử lý thanh toán | | Automatic | Automatic | Tester | 2024-01-15 | 1. Chạy test-payment-api.js<br>2. Kiểm tra thanh toán | Kiểm tra luồng thanh toán |

## Module Giao diện

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| UI-001 | Điều hướng | Điều hướng giữa các màn hình | | Manual | Manual | Tester | 2024-01-15 | 1. Test tất cả điều hướng<br>2. Kiểm tra nút quay lại<br>3. Kiểm tra routing | Test tất cả routes |
| UI-002 | Trạng thái tải | Hiển thị loading indicators | | Manual | Manual | Tester | 2024-01-15 | 1. Kích hoạt API calls<br>2. Kiểm tra loading UI<br>3. Kiểm tra hoàn thành | Test tất cả loading states |
| UI-003 | Xử lý lỗi | Hiển thị thông báo lỗi | | Manual | Manual | Tester | 2024-01-15 | 1. Kích hoạt lỗi<br>2. Kiểm tra error UI<br>3. Kiểm tra khôi phục | Test tất cả error cases |
| UI-004 | Thiết kế responsive | Hoạt động trên các kích thước màn hình | | Manual | Manual | Tester | 2024-01-15 | 1. Test trên các thiết bị<br>2. Kiểm tra layout<br>3. Kiểm tra chức năng | Test iOS/Android |
| UI-005 | Chế độ tối | Chuyển đổi theme chính xác | | Manual | Manual | Tester | 2024-01-15 | 1. Chuyển đổi theme<br>2. Kiểm tra màu sắc<br>3. Kiểm tra tính nhất quán | Test chuyển đổi theme |

## Module Hiệu suất

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| PERF-001 | Khởi động ứng dụng | Ứng dụng khởi động trong 3 giây | | Manual | Manual | Tester | 2024-01-15 | 1. Đo thời gian khởi động<br>2. Kiểm tra splash screen<br>3. Kiểm tra màn hình chính | Test cold/warm start |
| PERF-002 | Phản hồi API | API calls hoàn thành trong 5 giây | | Manual | Manual | Tester | 2024-01-15 | 1. Đo thời gian API calls<br>2. Kiểm tra loading states<br>3. Kiểm tra dữ liệu | Test tất cả API endpoints |
| PERF-003 | Tải hình ảnh | Hình ảnh tải trong 2 giây | | Manual | Manual | Tester | 2024-01-15 | 1. Kiểm tra tải hình ảnh<br>2. Kiểm tra placeholder<br>3. Test caching | Test hình ảnh sản phẩm |
| PERF-004 | Sử dụng bộ nhớ | Ứng dụng không crash khi bộ nhớ thấp | | Manual | Manual | Tester | 2024-01-15 | 1. Sử dụng ứng dụng nhiều<br>2. Kiểm tra sử dụng bộ nhớ<br>3. Kiểm tra ổn định | Test memory leaks |
| PERF-005 | Sử dụng pin | Ứng dụng không tiêu thụ pin quá mức | | Manual | Manual | Tester | 2024-01-15 | 1. Theo dõi sử dụng pin<br>2. Kiểm tra background processes<br>3. Kiểm tra tối ưu hóa | Test tác động pin |

## Module Bảo mật

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| SEC-001 | Bảo mật token | Token được lưu trữ an toàn | | Manual | Manual | Tester | 2024-01-15 | 1. Kiểm tra lưu trữ token<br>2. Kiểm tra mã hóa<br>3. Test hết hạn token | Test AsyncStorage |
| SEC-002 | Validation đầu vào | Validate tất cả đầu vào người dùng | | Manual | Manual | Tester | 2024-01-15 | 1. Test form inputs<br>2. Kiểm tra validation<br>3. Kiểm tra sanitization | Test XSS prevention |
| SEC-003 | Bảo mật API | API calls được xác thực | | Manual | Manual | Tester | 2024-01-15 | 1. Test không có token<br>2. Kiểm tra 401 responses<br>3. Kiểm tra auth headers | Test unauthorized access |
| SEC-004 | Bảo mật dữ liệu | Dữ liệu người dùng được bảo vệ | | Manual | Manual | Tester | 2024-01-15 | 1. Kiểm tra lưu trữ dữ liệu<br>2. Kiểm tra mã hóa<br>3. Test xóa dữ liệu | Test GDPR compliance |
| SEC-005 | Bảo mật mạng | HTTPS được sử dụng cho tất cả API calls | | Manual | Manual | Tester | 2024-01-15 | 1. Kiểm tra network calls<br>2. Kiểm tra HTTPS<br>3. Test certificate validation | Test SSL/TLS |

## Module Đa nền tảng

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| CROSS-001 | Tương thích iOS | Ứng dụng hoạt động trên thiết bị iOS | | Manual | Manual | Tester | 2024-01-15 | 1. Test trên iOS simulator<br>2. Test trên thiết bị thật<br>3. Kiểm tra tính năng iOS | Test iOS 14+ |
| CROSS-002 | Tương thích Android | Ứng dụng hoạt động trên thiết bị Android | | Manual | Manual | Tester | 2024-01-15 | 1. Test trên Android emulator<br>2. Test trên thiết bị thật<br>3. Kiểm tra tính năng Android | Test Android 8+ |
| CROSS-003 | Kích thước màn hình | Ứng dụng thích ứng với các kích thước màn hình | | Manual | Manual | Tester | 2024-01-15 | 1. Test trên các thiết bị<br>2. Kiểm tra responsive design<br>3. Kiểm tra layout | Test các độ phân giải |
| CROSS-004 | Hướng màn hình | Ứng dụng xử lý thay đổi hướng màn hình | | Manual | Manual | Tester | 2024-01-15 | 1. Xoay thiết bị<br>2. Kiểm tra layout<br>3. Kiểm tra chức năng | Test portrait/landscape |
| CROSS-005 | API nền tảng | API nền tảng hoạt động | | Manual | Manual | Tester | 2024-01-15 | 1. Test camera access<br>2. Test file picker<br>3. Test permissions | Test native features |

## Module Hồi quy

| ID | Title | Expected Result | Actual Result | Run Type | Manual/Automatic | Test By | Date Started | Steps | Notes |
|---|---|---|---|---|---|---|---|---|
| REG-001 | Sửa lỗi địa chỉ 404 | API địa chỉ hoạt động không lỗi 404 | | Automatic | Automatic | Tester | 2024-01-15 | 1. Chạy test-fix-404.js<br>2. Kiểm tra API responses<br>3. Kiểm tra CRUD địa chỉ | Test sửa lỗi 404 |
| REG-002 | Sửa lỗi giá thanh toán | Thanh toán hiển thị giá chính xác | | Manual | Manual | Tester | 2024-01-15 | 1. Thêm sản phẩm vào giỏ<br>2. Vào thanh toán<br>3. Kiểm tra tính toán giá | Test logic giá |
| REG-003 | Lưu trữ giỏ hàng | Sản phẩm giỏ hàng được lưu trữ chính xác | | Manual | Manual | Tester | 2024-01-15 | 1. Thêm sản phẩm vào giỏ<br>2. Khởi động lại ứng dụng<br>3. Kiểm tra sản phẩm giỏ hàng | Test AsyncStorage |
| REG-004 | Luồng xác thực | Đăng nhập/đăng xuất hoạt động chính xác | | Manual | Manual | Tester | 2024-01-15 | 1. Test luồng đăng nhập<br>2. Test đăng xuất<br>3. Kiểm tra xử lý token | Test auth state |
| REG-005 | Hiển thị sản phẩm | Sản phẩm hiển thị chính xác | | Manual | Manual | Tester | 2024-01-15 | 1. Duyệt sản phẩm<br>2. Kiểm tra hình ảnh/giá<br>3. Kiểm tra chi tiết | Test dữ liệu sản phẩm |

## Ghi chú:
- Tất cả test thủ công nên được thực hiện trên cả thiết bị iOS và Android
- Test tự động có thể chạy bằng các script test được cung cấp
- Test API yêu cầu backend server đang chạy
- Test hiệu suất nên được thực hiện trên thiết bị thật
- Test bảo mật nên bao gồm penetration testing
- Test đa nền tảng nên bao gồm các loại thiết bị và phiên bản OS chính 