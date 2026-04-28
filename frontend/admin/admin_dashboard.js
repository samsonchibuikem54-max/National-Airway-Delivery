// admin_dashboard.js
import { BACKEND_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("adminToken");

  // AUTH
  if (!token) {
    window.location.href = "admin_login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const paymentsTable = document.getElementById("paymentsTable");

  function logout() {
    localStorage.removeItem("adminToken");
    window.location.href = "admin_login.html";
  }

  logoutBtn?.addEventListener("click", logout);
  refreshBtn?.addEventListener("click", loadPendingQuotes);

  // LOAD QUOTES (renamed from payments)
  async function loadPendingQuotes() {
    try {
      paymentsTable.innerHTML =
        "<tr><td colspan='5'>Loading quotes...</td></tr>";

      const res = await fetch(`${BACKEND_URL}/quotes`, {
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
          "<tr><td colspan='5'>No pending quotes</td></tr>";
        return;
      }

      data.data.forEach((quote) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${quote.id}</td>
          <td>${quote.name}</td>
          <td>${quote.email || "-"}</td>
          <td>${quote.weight ?? quote.amount ?? ""}</td>
          <td>
            <button class="verifyBtn" data-id="${quote.id}">
              Verify
            </button>

            <button class="deleteBtn" data-id="${quote.id}">
              Delete
            </button>
          </td>
        `;

        paymentsTable.appendChild(row);
      });

    } catch (err) {
      console.error(err);
      paymentsTable.innerHTML =
        "<tr><td colspan='5'>Error loading quotes</td></tr>";
    }
  }

  // ACTIONS
  paymentsTable.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    // VERIFY
    if (e.target.classList.contains("verifyBtn")) {
      if (!confirm("Verify this quote?")) return;

      try {
        const res = await fetch(`${BACKEND_URL}/quote/verify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        alert("Verified! Tracking ID: " + data.tracking_id);
        loadPendingQuotes();
      } catch (err) {
        alert("Verification failed: " + err.message);
      }
    }

    // DELETE
    if (e.target.classList.contains("deleteBtn")) {
      if (!confirm("Delete this quote?")) return;

      try {
        const res = (`${BACKEND_URL}/quote/delete`, {
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
        loadPendingQuotes();
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  });

  // INIT
  loadPendingQuotes();
});
