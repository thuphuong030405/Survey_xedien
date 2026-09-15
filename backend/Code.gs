/**
 * eCommute Vietnam — Khảo Sát Xe Điện Công Sở
 * Backend Google Apps Script:
 *  - Nhận dữ liệu POST (JSON) từ app PWA
 *  - Ghi mỗi phiên khảo sát thành 1 dòng trong Google Sheet
 *  - Nếu có ảnh (base64) thì lưu ảnh vào Google Drive và ghi link vào Sheet
 *
 * HƯỚNG DẪN TRIỂN KHAI:
 * 1. Tạo 1 Google Sheet mới, đặt tên sheet (tab) đầu tiên là "Sessions"
 *    (hoặc đổi biến SHEET_NAME dưới đây cho khớp).
 * 2. Vào Tiện ích mở rộng > Apps Script, xoá code mẫu, dán toàn bộ nội dung file này vào.
 * 3. (Tuỳ chọn) Tạo 1 thư mục trên Google Drive để chứa ảnh, copy ID thư mục
 *    và dán vào biến DRIVE_FOLDER_ID dưới đây. Nếu để trống, ảnh sẽ được lưu
 *    vào thư mục gốc "My Drive" của tài khoản chạy script.
 * 4. Deploy > New deployment > chọn loại "Web app":
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy URL Web App vừa tạo, dán vào biến APPS_SCRIPT_URL trong file app.js.
 */

const SHEET_NAME = "Sessions";
const DRIVE_FOLDER_ID = "1XAfxLQ2kTrAHBTPmyfbnPCIvqZlM9IOC"; // thư mục "image_survey_xedien"

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    let photoUrl = "";
    if (data.photoBase64) {
      photoUrl = savePhotoToDrive(data.photoBase64, data.sessionId);
    }

    const answers = Array.isArray(data.answers) ? data.answers.join(" | ") : "";

    sheet.appendRow([
      data.sessionId || "",
      data.interviewerName || "",
      data.timestamp || "",
      data.latitude || "",
      data.longitude || "",
      answers,
      photoUrl,
      new Date(),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Session ID",
      "Người phỏng vấn",
      "Thời gian",
      "Vĩ độ (Lat)",
      "Kinh độ (Lng)",
      "Câu trả lời",
      "Ảnh hiện trường",
      "Ghi nhận lúc",
    ]);
  }
  return sheet;
}

function savePhotoToDrive(base64Data, sessionId) {
  try {
    const matches = base64Data.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!matches) return "";

    const mimeType = matches[1];
    const rawData = matches[2];
    const extension = mimeType.split("/")[1] || "jpg";
    const blob = Utilities.newBlob(Utilities.base64Decode(rawData), mimeType, sessionId + "." + extension);

    const folder = DRIVE_FOLDER_ID
      ? DriveApp.getFolderById(DRIVE_FOLDER_ID)
      : DriveApp.getRootFolder();

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    return "Lỗi lưu ảnh: " + err.message;
  }
}
