import { BACKEND_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!registerBtn || !emailInput || !passwordInput) {
    console.error("❌ Required register elements not found in DOM");
    return;
  }

  registerBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("⚠️ Email and password are required");
      return;
    }

    if (password.length < 6) {
      alert("⚠️ Password must be at least 6 characters");
      return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";

    try {
      const response = await fetch(`${BACKEND_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // safer parsing
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Registration failed");
      }

      alert("✅ Registration successful!");

      emailInput.value = "";
      passwordInput.value = "";

      window.location.href = "admin_login.html";

    } catch (err) {
      console.error("❌ Registration error:", err);
      alert(err.message);
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
    }
  });
});