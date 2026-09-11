// Data & LocalStorage Logic for Student Document Request System
// (เริ่มต้นด้วยข้อมูลว่างทั้งหมด รอผู้ใช้กรอกเท่านั้น)

// App State
let currentRole = "student"; // 'student' | 'officer'
let currentUser = null;
let requests = [];
let pendingRejectId = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  renderHistoryTable();
  renderOfficerTable();
});

function loadData() {
  const saved = localStorage.getItem("mockup_requests");
  if (saved) {
    try {
      requests = JSON.parse(saved);
    } catch (e) {
      requests = [];
    }
  } else {
    requests = [];
    saveData();
  }
}

function saveData() {
  localStorage.setItem("mockup_requests", JSON.stringify(requests));
}

function setupEventListeners() {
  // Role selector tab in Login
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRole = btn.dataset.role;

      const labelUsername = document.getElementById("label-username");
      const inputUsername = document.getElementById("username");
      if (currentRole === "student") {
        labelUsername.textContent = "รหัสนักศึกษา";
        inputUsername.placeholder = "เช่น 661234567-8";
        inputUsername.value = "";
      } else {
        labelUsername.textContent = "ชื่อผู้ใช้งานเจ้าหน้าที่";
        inputUsername.placeholder = "เช่น admin หรือ reg_staff";
        inputUsername.value = "";
      }
    });
  });

  // Login Form
  document.getElementById("form-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    currentUser = {
      username: username,
      role: currentRole
    };
    switchView(currentRole);
  });

  // Logout Button
  document.getElementById("btn-logout").addEventListener("click", () => {
    currentUser = null;
    switchView("login");
  });

  // Student Request Submission Form
  document.getElementById("form-request").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("student-name").value.trim();
    const docType = document.getElementById("doc-type").value;
    const qty = parseInt(document.getElementById("doc-qty").value);
    const purpose = document.getElementById("doc-purpose").value.trim();
    const delivery = document.getElementById("delivery-type").value;

    const newReq = {
      id: `REQ-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, "0")}`,
      studentName: name,
      studentId: currentUser ? currentUser.username : "-",
      docType: docType,
      quantity: qty,
      purpose: purpose,
      delivery: delivery,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "PENDING",
      rejectReason: ""
    };

    requests.unshift(newReq);
    saveData();
    renderHistoryTable();
    renderOfficerTable();

    // เคลียร์ช่องเหตุผลหลังจากกดส่ง
    document.getElementById("doc-purpose").value = "";
    document.getElementById("doc-qty").value = 1;

    alert(`ยื่นคำร้องสำเร็จ!\nรหัสคำร้องของคุณคือ: ${newReq.id}`);
  });

  // Officer Filter change
  document.getElementById("filter-status").addEventListener("change", () => {
    renderOfficerTable();
  });

  // Clear All Data Button
  const btnReset = document.getElementById("btn-reset-data");
  if (btnReset) {
    btnReset.textContent = "ล้างข้อมูลทั้งหมด";
    btnReset.addEventListener("click", () => {
      if (confirm("ต้องการลบข้อมูลคำร้องทั้งหมดใช่หรือไม่? (ข้อมูลจะว่างเปล่าทันที)")) {
        requests = [];
        saveData();
        renderOfficerTable();
        renderHistoryTable();
        alert("ล้างข้อมูลเรียบร้อยแล้ว");
      }
    });
  }

  // Modal Cancel & Confirm
  document.getElementById("btn-cancel-reject").addEventListener("click", () => {
    document.getElementById("modal-reject").classList.add("hidden");
    pendingRejectId = null;
  });

  document.getElementById("btn-confirm-reject").addEventListener("click", () => {
    const reason = document.getElementById("reject-reason").value.trim();
    if (!reason) {
      alert("กรุณาระบุเหตุผลในการปฏิเสธคำร้อง");
      return;
    }
    const item = requests.find(r => r.id === pendingRejectId);
    if (item) {
      item.status = "REJECTED";
      item.rejectReason = reason;
      saveData();
      renderOfficerTable();
      renderHistoryTable();
    }
    document.getElementById("modal-reject").classList.add("hidden");
    pendingRejectId = null;
    document.getElementById("reject-reason").value = "";
  });
}

function switchView(viewName) {
  const viewLogin = document.getElementById("view-login");
  const viewStudent = document.getElementById("view-student");
  const viewOfficer = document.getElementById("view-officer");
  const userBar = document.getElementById("user-profile-bar");
  const displayUser = document.getElementById("display-username");

  viewLogin.classList.add("hidden");
  viewStudent.classList.add("hidden");
  viewOfficer.classList.add("hidden");

  if (viewName === "login") {
    viewLogin.classList.remove("hidden");
    userBar.classList.add("hidden");
  } else if (viewName === "student") {
    viewStudent.classList.remove("hidden");
    userBar.classList.remove("hidden");
    displayUser.textContent = `นักศึกษา: ${currentUser.username}`;
    renderHistoryTable();
  } else if (viewName === "officer") {
    viewOfficer.classList.remove("hidden");
    userBar.classList.remove("hidden");
    displayUser.textContent = `เจ้าหน้าที่: ${currentUser.username}`;
    renderOfficerTable();
  }
}

function renderHistoryTable() {
  const tbody = document.getElementById("student-history-table");
  if (!tbody) return;
  tbody.innerHTML = "";

  // แสดงเฉพาะคำร้องของรหัสนักศึกษาที่กำลังล็อกอินอยู่
  const studentId = currentUser ? currentUser.username : "";
  const userRequests = requests.filter(r => r.studentId === studentId);

  if (userRequests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:24px;">ยังไม่มีประวัติการยื่นคำร้อง (รอการกรอกข้อมูล)</td></tr>`;
    return;
  }

  userRequests.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.id}</strong></td>
      <td>${item.docType} (${item.quantity} ฉบับ)</td>
      <td>${item.date}</td>
      <td>${getStatusBadge(item.status, item.rejectReason)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderOfficerTable() {
  const tbody = document.getElementById("officer-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const filter = document.getElementById("filter-status") ? document.getElementById("filter-status").value : "ALL";
  let filtered = requests;
  if (filter !== "ALL") {
    filtered = requests.filter(r => r.status === filter);
  }

  // อัปเดตตัวเลขนับสถิติบน Dashboard
  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const approvedCount = requests.filter(r => r.status === "APPROVED").length;
  const rejectedCount = requests.filter(r => r.status === "REJECTED").length;

  const statPending = document.getElementById("stat-pending");
  const statApproved = document.getElementById("stat-approved");
  const statRejected = document.getElementById("stat-rejected");

  if (statPending) statPending.textContent = pendingCount;
  if (statApproved) statApproved.textContent = approvedCount;
  if (statRejected) statRejected.textContent = rejectedCount;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:24px;">ยังไม่มีรายการคำร้องในระบบ</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    let actionButtons = "";
    if (item.status === "PENDING") {
      actionButtons = `
        <div class="table-actions">
          <button class="btn btn-sm btn-success" onclick="approveRequest('${item.id}')">อนุมัติ</button>
          <button class="btn btn-sm btn-danger" onclick="openRejectModal('${item.id}')">ปฏิเสธ</button>
        </div>
      `;
    } else {
      actionButtons = `<span style="font-size:0.8rem; color:#94a3b8;">เสร็จสิ้น</span>`;
    }

    tr.innerHTML = `
      <td><strong>${item.id}</strong></td>
      <td>
        <div><strong>${item.studentName}</strong></div>
        <small style="color:#64748b;">รหัส: ${item.studentId}</small>
      </td>
      <td>
        <div>${item.docType}</div>
        <small style="color:#64748b;">เหตุผล: ${item.purpose}</small>
      </td>
      <td>${item.quantity} ฉบับ</td>
      <td>${item.date}</td>
      <td>${getStatusBadge(item.status, item.rejectReason)}</td>
      <td>${actionButtons}</td>
    `;
    tbody.appendChild(tr);
  });
}

function getStatusBadge(status, reason) {
  if (status === "APPROVED") {
    return `<span class="badge badge-approved">อนุมัติแล้ว</span>`;
  } else if (status === "REJECTED") {
    return `<span class="badge badge-rejected" title="${reason || 'ไม่ระบุเหตุผล'}">ปฏิเสธ (${reason || 'ไม่ผ่าน'})</span>`;
  } else {
    return `<span class="badge badge-pending">รอตรวจสอบ</span>`;
  }
}

window.approveRequest = function(id) {
  const item = requests.find(r => r.id === id);
  if (item) {
    item.status = "APPROVED";
    saveData();
    renderOfficerTable();
    renderHistoryTable();
  }
};

window.openRejectModal = function(id) {
  pendingRejectId = id;
  document.getElementById("modal-req-id").textContent = `เลขที่คำร้อง: #${id}`;
  document.getElementById("modal-reject").classList.remove("hidden");
};
