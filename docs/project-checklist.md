# Project Checklist

## 1. Clone dự án và refactor base repo theo kiến trúc monorepo

- [ ] Clone dự án base về local.
- [ ] Rà soát cấu trúc hiện tại của repo.
- [ ] Xác định các app/package cần tách trong monorepo.
- [ ] Chuẩn hóa cấu trúc `apps/` và `packages/`.
- [ ] Cấu hình workspace package manager.
- [ ] Cấu hình build/task runner cho monorepo.
- [ ] Chuẩn hóa script dev, build, lint, test ở root.
- [ ] Kiểm tra lại dependency dùng chung giữa các app/package.
- [ ] Verify toàn bộ repo chạy được sau khi refactor monorepo.

## 2. Refactor modules trong API theo kiến trúc Clean Architecture

- [ ] Rà soát toàn bộ modules trong API.
- [ ] Thống nhất cấu trúc module chuẩn.
- [ ] Tách DTO vào folder `dto/`.
- [ ] Tách ORM/database logic vào `repository/`.
- [ ] Tách business/application logic vào `use-cases/`.
- [ ] Tách type/interface vào `types/`.
- [ ] Tách helper injectable vào `utils/`.
- [ ] Tách error message/error factory vào `<domain>.errors.ts`.
- [ ] Controller inject trực tiếp use case.
- [ ] Loại bỏ các `<domain>.service.ts` dạng facade khi module đã refactor xong.
- [ ] Viết test theo từng use case trong folder `test/` của module.
- [ ] Chạy type-check, test và build sau mỗi module.

## 3. Làm và thiết kế lại UI landing page ở main và logo tổng

- [ ] Rà soát UI landing page hiện tại ở app main.
- [ ] Xác định lại visual direction cho landing page.
- [ ] Thiết kế lại layout landing page.
- [ ] Thiết kế lại hệ màu, typography và spacing.
- [ ] Thiết kế lại logo tổng của hệ thống.
- [ ] Cập nhật logo vào các vị trí dùng chung.
- [ ] Implement UI landing page mới.
- [ ] Kiểm tra responsive desktop/tablet/mobile.
- [ ] Kiểm tra accessibility cơ bản.
- [ ] Verify build app main.

## 4. Làm và thiết kế lại UI, API endpoint cho `/dashboard` retail

- [ ] Rà soát dashboard retail hiện tại.
- [ ] Xác định các dữ liệu cần hiển thị trên dashboard.
- [ ] Thiết kế lại layout dashboard.
- [ ] Thiết kế các widget/card/chart cần có.
- [ ] Thiết kế trạng thái loading, empty, error.
- [ ] Xác định API endpoints cần bổ sung hoặc refactor.
- [ ] Implement API endpoints cho dashboard retail.
- [ ] Implement UI dashboard retail.
- [ ] Kết nối UI với API.
- [ ] Viết test cho API endpoints quan trọng.
- [ ] Kiểm tra responsive và performance dashboard.

## 5. Làm và thiết kế 5 trang bán hàng cho tenant retail

- [ ] Xác định danh sách 5 trang bán hàng cần thiết kế.
- [ ] Xác định user flow chính của từng trang.
- [ ] Thiết kế layout và component cho trang 1.
- [ ] Thiết kế layout và component cho trang 2.
- [ ] Thiết kế layout và component cho trang 3.
- [ ] Thiết kế layout và component cho trang 4.
- [ ] Thiết kế layout và component cho trang 5.
- [ ] Implement UI cho 5 trang.
- [ ] Kết nối API/data cho các trang cần dữ liệu động.
- [ ] Thiết kế trạng thái loading, empty, error cho từng trang.
- [ ] Kiểm tra responsive desktop/tablet/mobile.
- [ ] Kiểm tra navigation giữa các trang.
- [ ] Verify build tenant retail.
