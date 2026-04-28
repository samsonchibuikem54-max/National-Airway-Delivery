import { BACKEND_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("adminToken");

  // ---------------- AUTH CHECK ----------------
  if (!token) {
    window.location.href = "admin_login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const paymentsTable = document.getElementById("paymentsTable");

  // ---------------- LOGOUT ----------------
  function logout() {
    localStorage.removeItem("adminToken");
    window.location.href = "admin_login.html";
  }

  logoutBtn?.addEventListener("click", logout);
  refreshBtn?.addEventListener("click", loadPendingPayments);

  // ---------------- LOAD PAYMENTS ----------------
  async function loadPendingPayments() {
    try {
      paymentsTable.innerHTML =
        "<tr><td colspan='5'>Loading payments...</td></tr>";

      const res = await fetch(`${BACKEND_URL}/payment/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      paymentsTable.innerHTML = "";

      if (!data.data.length) {
        paymentsTable.innerHTML =
          "<tr><td colspan='5'>No pending payments</td></tr>";
        return;
      }

      data.data.forEach((payment) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${payment.id}</td>
          <td>${payment.name}</td>
          <td>${payment.email || "-"}</td>
          <td>$${payment.amount}</td>
          <td>
            <button class="verifyBtn" data-id="${payment.id}">
              Confirm
            </button>

            <button class="deleteBtn" data-id="${payment.id}">
              Delete
            </button>
          </td>
        `;

        paymentsTable.appendChild(row);
      });

    } catch (err) {
      console.error(err);
      paymentsTable.innerHTML =
        "<tr><td colspan='5'>Error loading payments</td></tr>";
    }
  }

  // ---------------- ACTIONS ----------------
  paymentsTable.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (!id) return;

    // VERIFY
    if (e.target.classList.contains("verifyBtn")) {
      if (!confirm("Confirm this payment?")) return;

      try {
        const res = await fetch(`${BACKEND_URL}/payment/verify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();

        if (!data.success) throw new Error(data.error);

        alert("Verified! Tracking ID: " + data.trackingId);

        loadPendingPayments();
      } catch (err) {
        alert("Verification failed: " + err.message);
      }
    }

    // DELETE
    if (e.target.classList.contains("deleteBtn")) {
      if (!confirm("Delete this payment?")) return;

      try {
        const res = await fetch(`${BACKEND_URL}/payment/delete`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();

        if (!data.success) throw new Error(data.error);

        alert("Deleted successfully");

        loadPendingPayments();
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  });

  // ---------------- INIT ----------------
  loadPendingPayments();
});