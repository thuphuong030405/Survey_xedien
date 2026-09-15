// ================== CẤU HÌNH ==================
// Dán URL Web App Google Apps Script của bạn vào đây (xem hướng dẫn trong README.md)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwh-_PUkdvSAbZmQ5rBGgPBPToXrsqFoMdqCvKOfEdSizPNLhqtpuvergk8sYeRW0l4/exec";

const DB_NAME = "ev-survey-db";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

let db;
let currentLocation = null;
let currentPhotoBase64 = null;

// ================== KHỞI TẠO INDEXEDDB ==================
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "sessionId" });
        store.createIndex("synced", "synced", { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function addSession(session) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

function updateSession(session) {
  return addSession(session); // put() ghi đè theo keyPath, dùng chung logic
}

function getAllSessions() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// ================== TRẠNG THÁI MẠNG ==================
const statusBar = document.getElementById("status-bar");
const statusText = document.getElementById("status-text");

function updateStatusBar(mode) {
  statusBar.className = "status-bar";
  if (mode === "online") {
    statusBar.classList.add("status-online");
    statusText.textContent = "ONLINE — dữ liệu mới sẽ tự động đồng bộ";
  } else if (mode === "syncing") {
    statusBar.classList.add("status-syncing");
    statusText.textContent = "ĐANG ĐỒNG BỘ dữ liệu lên Google Sheet...";
  } else {
    statusBar.classList.add("status-offline");
    statusText.textContent = "OFFLINE — dữ liệu được lưu tạm trên máy";
  }
}

function refreshNetworkStatus() {
  if (navigator.onLine) {
    updateStatusBar("online");
    syncPendingSessions();
  } else {
    updateStatusBar("offline");
  }
}

window.addEventListener("online", refreshNetworkStatus);
window.addEventListener("offline", () => updateStatusBar("offline"));

// ================== LẤY VỊ TRÍ ==================
const getLocationBtn = document.getElementById("get-location-btn");
const locationDisplay = document.getElementById("location-display");

getLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationDisplay.textContent = "Thiết bị không hỗ trợ định vị";
    return;
  }
  locationDisplay.textContent = "Đang lấy vị trí...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      locationDisplay.textContent = `📍 ${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`;
    },
    (error) => {
      locationDisplay.textContent = "Không lấy được vị trí (kiểm tra quyền truy cập GPS)";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// ================== CHỤP / CHỌN ẢNH ==================
const photoInput = document.getElementById("photo-input");
const photoPreview = document.getElementById("photo-preview");

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    currentPhotoBase64 = reader.result; // dạng data:image/...;base64,...
    photoPreview.src = currentPhotoBase64;
    photoPreview.hidden = false;
  };
  reader.readAsDataURL(file);
});

// ================== LƯU PHIÊN KHẢO SÁT ==================
const form = document.getElementById("survey-form");
const timestampDisplay = document.getElementById("timestamp-display");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const now = new Date();
  const session = {
    sessionId: "ev_" + now.getTime() + "_" + Math.random().toString(36).slice(2, 8),
    interviewerName: document.getElementById("interviewer-name").value.trim(),
    timestamp: now.toLocaleString("vi-VN"),
    latitude: currentLocation ? currentLocation.lat : "",
    longitude: currentLocation ? currentLocation.lng : "",
    answers: [
      "Phương tiện đang sử dụng: " + document.getElementById("q1").value,
      "Quãng đường đi làm (km/chiều): " + document.getElementById("q2").value,
      "Sẵn sàng chuyển sang xe điện: " + document.getElementById("q3").value,
      "Yếu tố quan tâm khi chọn xe điện: " + document.getElementById("q4").value,
      "Khó khăn / lo ngại: " + document.getElementById("q5").value,
    ],
    photoBase64: currentPhotoBase64,
    synced: false,
  };

  await addSession(session);
  resetForm();
  await renderSessionsList();

  if (navigator.onLine) {
    syncPendingSessions();
  } else {
    alert("Đã lưu phiên khảo sát trên máy. Sẽ tự động gửi lên hệ thống khi có mạng.");
  }
});

function resetForm() {
  form.reset();
  currentLocation = null;
  currentPhotoBase64 = null;
  locationDisplay.textContent = "Chưa lấy vị trí";
  photoPreview.hidden = true;
  timestampDisplay.textContent = "— sẽ tự động lấy khi bấm Lưu phiên —";
}

// ================== HIỂN THỊ DANH SÁCH PHIÊN ==================
const sessionsList = document.getElementById("sessions-list");

async function renderSessionsList() {
  const sessions = await getAllSessions();
  sessionsList.innerHTML = "";

  if (sessions.length === 0) {
    sessionsList.innerHTML = '<li class="empty-state">Chưa có phiên nào.</li>';
    return;
  }

  sessions
    .sort((a, b) => b.sessionId.localeCompare(a.sessionId))
    .forEach((session) => {
      const li = document.createElement("li");
      li.className = "session-item";
      li.innerHTML = `
        <div class="session-info">
          <div class="session-name">${session.interviewerName || "(chưa đặt tên)"}</div>
          <div class="session-time">${session.timestamp}</div>
        </div>
        <span class="badge ${session.synced ? "badge-synced" : "badge-pending"}">
          ${session.synced ? "Đã đồng bộ" : "Chờ đồng bộ"}
        </span>
      `;
      sessionsList.appendChild(li);
    });
}

// ================== ĐỒNG BỘ LÊN GOOGLE SHEET ==================
async function syncPendingSessions() {
  const sessions = await getAllSessions();
  const pending = sessions.filter((s) => !s.synced);
  if (pending.length === 0) return;

  updateStatusBar("syncing");

  for (const session of pending) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script Web App không trả CORS header chuẩn
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(session),
      });
      session.synced = true;
      await updateSession(session);
    } catch (err) {
      console.error("Đồng bộ thất bại cho phiên:", session.sessionId, err);
      // Giữ nguyên trạng thái pending, sẽ thử lại lần sau
    }
  }

  await renderSessionsList();
  refreshNetworkStatus();
}

document.getElementById("sync-now-btn").addEventListener("click", () => {
  if (!navigator.onLine) {
    alert("Chưa có mạng, không thể đồng bộ lúc này.");
    return;
  }
  syncPendingSessions();
});

// ================== SERVICE WORKER ==================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}

// ================== KHỞI ĐỘNG APP ==================
(async function init() {
  db = await openDatabase();
  await renderSessionsList();
  refreshNetworkStatus();
})();
