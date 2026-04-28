import { BACKEND_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // ---------------- SAFETY CHECK ----------------
  if (!loginBtn || !emailInput || !passwordInput) {
    console.error("Admin login elements not found in DOM");
    return;
  }

  // ---------------- LOGIN HANDLER ----------------
  loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // UI loading state
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const response = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      // ---------------- ERROR HANDLING ----------------
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Invalid login credentials");
      }

      // ---------------- SAVE AUTH DATA ----------------
      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminEmail", email);
      localStorage.setItem("adminLoginTime", Date.now());

      // ---------------- SUCCESS ----------------
      alert("Login successful!");

      window.location.href = "admin_dashboard.html";
    } catch (err) {
      console.error("Login error:", err);
      alert(err.message);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });
});