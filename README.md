# ⚡ eCommute Vietnam PWA — Khảo Sát Xe Điện Công Sở

> **Mini-Project 1** — Môn học: **Cross-Platform Mobile App Development (VKU)**
> **Sinh viên thực hiện:** _Trần Thu Phương_ — MSSV: `_(23IT.B172)_`
> **Vai trò:** Full-stack Developer (Đóng góp: 100%)
> **Demo Live:** _(dán link sau khi deploy, ví dụ Cloudflare Pages / Vercel)_
> **Repository:** _(dán link GitHub repo của bạn)_

---

## 📌 Giới thiệu dự án

**eCommute Vietnam** là ứng dụng Web lũy tiến (Progressive Web App - PWA) phục vụ việc điều tra, phỏng vấn khảo sát **nhu cầu sử dụng xe điện của người đi làm** trực tiếp tại hiện trường (công ty, khu công nghiệp, bãi đỗ xe...).

Ứng dụng được thiết kế theo kiến trúc **Offline-First**, cho phép người khảo sát ghi nhận thông tin, lấy tọa độ GPS thời gian thực và chụp ảnh phương tiện/hiện trường ngay cả khi **không có kết nối mạng Internet**. Toàn bộ dữ liệu được lưu trữ an toàn dưới thiết bị (`IndexedDB`) và **tự động đồng bộ** lên Google Sheet & Google Drive ngay khi kết nối mạng được khôi phục.

---

## 🌟 Tính năng chính

- 📝 **Khảo sát hiện trường:** Form nhập thông tin người phỏng vấn, tự động lấy dấu thời gian (timestamp) và bộ 5 câu hỏi về nhu cầu xe điện.
- 📍 **Định vị vị trí (Geolocation):** Tự động thu thập vĩ độ (latitude) và kinh độ (longitude) chính xác thông qua `navigator.geolocation`.
- 📸 **Chụp & Lưu ảnh hiện trường:** Hỗ trợ kích hoạt camera thiết bị (`capture="environment"`), mã hóa ảnh sang chuẩn Base64 để lưu trữ cục bộ.
- 💾 **Lưu trữ Offline Cục bộ:** Sử dụng **IndexedDB** (`sessions` object store) giúp lưu giữ phiên khảo sát ngay tức thì bất kể trạng thái mạng.
- 🔄 **Đồng bộ tự động (Auto-Sync):** Tự động lắng nghe sự kiện `online/offline`. Khi có kết nối mạng, ứng dụng tự động quét và tải các phiên chờ (`synced: false`) lên backend.
- 📊 **Cơ sở dữ liệu Google Sheet & Drive:** Sử dụng Google Apps Script Web App làm backend trung gian: mỗi phiên khảo sát ghi thành **1 dòng** trong Google Sheet, ảnh hiện trường được tải lên Google Drive.
- 🚦 **Thanh trạng thái kết nối:** Thanh hiển thị trạng thái cố định: 🟢 **Online** (Đã kết nối) / 🟠 **Offline** (Chạy ngoại tuyến) / 🔵 **Syncing** (Đang đồng bộ), kèm thông báo khi lưu offline.
- 📲 **Trải nghiệm PWA hoàn chỉnh:** Tích hợp `manifest.json` và Service Worker (`sw.js`) hỗ trợ cache app shell, cho phép cài đặt lên màn hình chính (Add to Home Screen) và chạy độc lập.

---

## 📋 Bộ câu hỏi khảo sát

1. Phương tiện bạn đang dùng để đi làm hiện tại? *(chọn 1)*
2. Quãng đường một chiều từ nhà đến nơi làm việc (km)?
3. Bạn có sẵn sàng chuyển sang xe điện trong 1–2 năm tới không? *(chọn 1)*
4. Yếu tố bạn quan tâm nhất khi chọn xe điện?
5. Khó khăn hoặc lo ngại lớn nhất khi sử dụng xe điện là gì?

Kèm theo: tên người phỏng vấn, thời gian, tọa độ GPS, ảnh phương tiện/hiện trường.

---

## 🏗️ Kiến trúc Kỹ thuật (Offline-First 3 Lớp)

```text
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND PWA                          │
│     (HTML5 / CSS3 / Vanilla JS / Service Worker)        │
└──────────────────────────┬──────────────────────────────┘
                           │ (Lưu trữ trực tiếp)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              LOCAL STORAGE (IndexedDB)                  │
│               [Object Store: "sessions"]                │
└──────────────────────────┬──────────────────────────────┘
                           │ (Tự động đồng bộ khi Online)
                           ▼
┌─────────────────────────────────────────────────────────┐
│             BACKEND (Google Apps Script API)            │
│                 [Web App: Code.gs]                      │
└────────────┬─────────────────────────────┬──────────────┘
             │ (Ghi bản ghi)               │ (Tải ảnh Base64)
             ▼                             ▼
┌─────────────────────────┐   ┌───────────────────────────┐
│   GOOGLE SHEETS (DB)    │   │   GOOGLE DRIVE (Photos)   │
└─────────────────────────┘   └───────────────────────────┘
```

---

## 📂 Cấu trúc dự án

```text
survey-pwa/
├── index.html       # Giao diện chính form khảo sát & danh sách phiên
├── style.css        # Giao diện ứng dụng di động (theme xanh điện - xanh lá)
├── app.js           # Xử lý logic IndexedDB, Geolocation, Auto-Sync
├── manifest.json    # Cấu hình Web App Manifest (PWA)
├── sw.js            # Service Worker quản lý Cache App Shell
├── icons/           # Bộ biểu tượng ứng dụng (logo eCommute Vietnam, 192x192, 512x512)
└── backend/
    └── Code.gs      # Mã nguồn Google Apps Script (Deploy dưới dạng Web App)
```

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Phía Client (Frontend)
Do PWA yêu cầu HTTPS hoặc `localhost` để đăng ký Service Worker và truy cập Geolocation API:

1. Giải nén / clone thư mục dự án về máy.
2. Chạy ứng dụng thông qua một Local HTTP Server (ví dụ: Live Server extension trên VS Code, hoặc `http-server`):
   ```bash
   npx http-server . -p 8080
   ```
3. Truy cập địa chỉ `http://localhost:8080` trên trình duyệt.
4. Để test đầy đủ tính năng camera/GPS trên điện thoại, deploy lên một dịch vụ hosting hỗ trợ HTTPS miễn phí như **Cloudflare Pages**, **Vercel**, hoặc **Netlify**, rồi truy cập bằng điện thoại.

---

### 2. Phía Backend (Google Apps Script)

1. Tạo một bảng tính **Google Sheet** mới.
2. Vào **Tiện ích mở rộng (Extensions)** > **Apps Script**.
3. Copy mã nguồn từ file `backend/Code.gs` và dán vào cửa sổ biên dịch (xoá code mẫu có sẵn).
4. (Tuỳ chọn) Tạo một thư mục trên Google Drive để chứa ảnh khảo sát, copy **ID thư mục** (đoạn ký tự trong URL sau `/folders/`) và dán vào biến `DRIVE_FOLDER_ID` trong `Code.gs`.
5. Chọn **Triển khai (Deploy)** > **Triển khai dưới dạng ứng dụng web (New deployment)**:
   - **Thực thi dưới danh nghĩa:** *Tôi (Me)*
   - **Ai có quyền truy cập:** *Bất kỳ ai (Anyone)*
6. Sao chép **URL ứng dụng web** thu được và cập nhật vào hằng số `APPS_SCRIPT_URL` trong file `app.js`.
7. Mỗi lần sửa `Code.gs`, nhớ tạo **New deployment** mới (hoặc Manage deployments > Edit > New version) để URL luôn nhận code mới nhất.

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML5, CSS3, Modern JavaScript (ES6+).
- **Offline & Storage API:** IndexedDB API, Cache API, Service Worker API.
- **Hardware/Device APIs:** Geolocation API, Media API (`input capture`).
- **Backend / Database:** Google Apps Script, Google Sheets API, Google Drive API.
- **Deployment:** Cloudflare Pages / Vercel / Netlify (Frontend Hosting).

---

## 🛠️ Thách thức Kỹ thuật & Giải pháp

| Thách thức | Nguyên nhân | Giải pháp |
| :--- | :--- | :--- |
| **Lỗi Service Worker cache Extension** | Các tiện ích mở rộng (Grammarly, Chrome Extensions) gửi request nền với scheme `chrome-extension://`, bị Cache API từ chối. | Lọc kiểm tra `event.request.url.startsWith("http")` trong sự kiện `fetch` của `sw.js` trước khi thực hiện cache. |
| **Request Google Apps Script `no-cors`** | Apps Script Web App không trả CORS headers chuẩn, buộc dùng `mode: "no-cors"` khiến trình duyệt luôn báo thành công kể cả khi sai URL. | Kiểm tra trực tiếp nhật ký tại mục **Executions** trên Apps Script Editor và sao chép chính xác URL từ cửa sổ *Manage Deployments*. |
| **Ảnh Base64 làm nặng phiên lưu offline** | Ảnh chụp trực tiếp có thể khá lớn khi mã hoá Base64, tốn dung lượng IndexedDB trên các thiết bị cũ. | Có thể nén ảnh (resize) trước khi lưu nếu cần mở rộng; hiện tại backend tự tách ảnh ra Google Drive khi đồng bộ để giảm tải cho Sheet. |

---

## 📝 Thông tin đồ án

- **Trường:** Đại học CNTT & TT Việt - Hàn (VKU)
- **Môn học:** Cross-Platform Mobile App Development
- **Đề tài:** Mini-Project 1 — Khảo sát hiện trường (Point Survey) chọn chủ đề: **Nhu cầu xe điện của người đi làm**
- **Ngày cập nhật:** 15/09/2026
#   S u r v e y _ x e d i e n  
 #   S u r v e y _ x e d i e n  
 