readme_content = """# 🚗⚡ eCommute Vietnam — Field Survey PWA
> **Mini-Project 2:** Khảo sát hiện trường Nhu cầu sử dụng xe điện của người đi làm  
> **Môn học:** Cross-Platform Mobile App Development — Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-brightgreen.svg?style=for-the-badge&logo=pwa)](https://survey-xedien.thuphuong030405.workers.dev/)
[![Hosting](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare)](https://survey-xedien.thuphuong030405.workers.dev/)
[![Database](https://img.shields.io/badge/Google%20Sheets-Backend-34A853?style=for-the-badge&logo=googlesheets)](https://script.google.com)
[![Storage](https://img.shields.io/badge/Google%20Drive-Photos-4285F4?style=for-the-badge&logo=googledrive)](https://drive.google.com)

---

## 📌 1. THÔNG TIN CHUNG & DELIVERABLE LINKS

* **Sinh viên thực hiện:** Trần Thu Phương
* **Mã sinh viên:** 23IT.B172
* **Vai trò:** Full-stack Developer (Frontend PWA + Backend Apps Script + Offline Architecture)
* **Đóng góp:** 100%
* **Ngày hoàn thành:** 15/09/2026
* **🔗 Live Demo App:** [https://survey-xedien.thuphuong030405.workers.dev/](https://survey-xedien.thuphuong030405.workers.dev/)
* **💻 GitHub Repository:** [https://github.com/thuphuong030405/Survey_xedien](https://github.com/thuphuong030405/Survey_xedien)

---

## 🌟 2. GIỚI THIỆU SẢN PHẨM

**eCommute Vietnam** là ứng dụng Web Khảo sát Hiện trường dạng **Progressive Web App (PWA)** theo kiến trúc **Offline-First**. Ứng dụng được thiết kế tối ưu cho các điều kiện khảo sát thực địa (không có sóng 3G/4G/Wi-Fi hoặc kết nối chập chờn). 

Toàn bộ dữ liệu nhập form, vị trí tọa độ GPS và hình ảnh chụp tại hiện trường sẽ được lưu trữ an toàn ngay trên thiết bị di động (IndexedDB) và tự động đồng bộ lên **Google Sheets & Google Drive** ngay khi thiết bị kết nối Internet trở lại.

---

## 🔥 3. TÍNH NĂNG NỔI BẬT

- ✅ **Kiến trúc Offline-First:** Lưu trữ 100% phiên khảo sát vào `IndexedDB` mà không cần kết nối mạng. Không mất dữ liệu kể cả khi tắt trình duyệt hoặc khởi động lại máy.
- 🔄 **Tự động đồng bộ (Auto-Sync):** Lắng nghe sự kiện `online` / `offline` của trình duyệt. Ngay khi có mạng, hệ thống tự động quét và đẩy các phiên chưa đồng bộ (`synced: false`) lên Server.
- 📍 **Định vị GPS chính xác (Geolocation API):** Lấy chính xác Vĩ độ (Latitude) & Kinh độ (Longitude) hiện trường qua `navigator.geolocation` với thuộc tính `enableHighAccuracy`.
- 📷 **Chụp & Xử lý ảnh hiện trường:** Tự động mở Camera sau (`capture="environment"`), chuyển đổi ảnh sang chuỗi **Base64** lưu offline và tải lên thư mục **Google Drive** khi đồng bộ.
- 📊 **Cơ sở dữ liệu đám mây miễn phí:** Sử dụng **Google Apps Script Web App** làm Backend API, ghi nhận từng phiên khảo sát thành từng dòng dữ liệu trong **Google Sheets**.
- 🟢 **Thanh trạng thái đa năng (Status Bar):** Cập nhật thời gian thực 3 trạng thái kết nối: `🟢 Online` / `🟠 Offline` / `🔵 Đang đồng bộ`.
- 📱 **PWA Chuẩn mực:** Đầy đủ `manifest.json` và `sw.js` (Service Worker) hỗ trợ tính năng *"Add to Home Screen"* và mở ứng dụng độc lập như ứng dụng Native.

---

## 🏗️ 4. KIẾN TRÚC KỸ THUẬT & DỒNG DỮ LIỆU

### Mô hình 3 Lớp (Offline-First)

```text
[ FRONTEND PWA ]
 (HTML5 / CSS3 / Vanilla JS / Service Worker)
        │
        │ 1. Lưu trực tiếp phiên khảo sát (kể cả ảnh Base64)
        ▼
[ LOCAL STORAGE ]
 IndexedDB (database: "ev-survey-db", objectStore: "sessions")
        │
        │ 2. Tự động quét & gửi payload JSON khi phát hiện Online
        ▼
[ BACKEND APPS SCRIPT ]
 Google Apps Script Web App (backend/Code.gs)
        ├──► [Ghi dữ liệu phiên] ──► GOOGLE SHEETS (Database)
        └──► [Lưu file ảnh]      ──► GOOGLE DRIVE (Folder: image_survey_xedien)
