const BACKEND_URL = "https://fastlaneshipping-backend-i4sw.onrender.com/"; // change after deploy

// ---------------- ADMIN LOGIN ----------------
const adminLoginForm = document.querySelector("#adminLoginForm");

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#adminEmail").value;
    const password = document.querySelector("#adminPassword").value;

    try {
      const res = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Login failed");
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("adminToken", data.token);

      alert("Login successful!");
      window.location.href = "admin_dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
}


// ---------------- FORGOT PASSWORD ----------------
const forgotPasswordForm = document.querySelector("#forgotPasswordForm");

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#forgotEmail").value;

    try {
      const res = await fetch(`${BACKEND_URL}/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message || data.error);

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("requestForm");
  const btn = document.getElementById("whatsappBtn");

  if (!form || !btn) {
    console.log("❌ Form or button not found");
    return;
  }

  btn.addEventListener("click", () => {
    const getValue = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      return el ? el.value.trim() : "";
    };

    const name = document.querySelector('[name="name"]').value.trim();
    const email = document.querySelector('[name="email"]').value.trim();
    const pickup = document.querySelector('[name="pickup"]').value.trim();
    const destination = document.querySelector('[name="destination"]').value.trim();
    const weight = document.querySelector('[name="weight"]').value.trim();
    const service = document.querySelector('[name="service"]').value;
    const details = document.querySelector('[name="details"]').value.trim();

    if (!name || !email || !pickup || !destination || !service) {
      alert("Fill all required fields");
      return;
    }

    const message = `Hello, I want to request a payment slip.

Name: ${name}
Email: ${email}
Pickup: ${pickup}
Destination: ${destination}
Weight: ${weight || "N/A"}
Service: ${service}
Details: ${details || "None"}`;

    const phone = "13864174481";

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  });
});

// ---------------- PAYMENT SUBMIT ----------------
const paymentForm = document.querySelector("#paymentForm");

if (paymentForm) {
  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.querySelector("#paymentName").value;
    const email = document.querySelector("#paymentEmail").value;
    const amount = document.querySelector("#paymentAmount").value;
    const method = document.querySelector("#paymentMethod").value;

    try {
      const res = await fetch(`${BACKEND_URL}/payment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, amount, method }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Payment failed");
        return;
      }

      alert("Payment submitted successfully!");

      paymentForm.reset();

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
  console.log("JS LOADED ✅");

  document.getElementById("whatsappBtn")?.addEventListener("click", () => {
    alert("Button is working ✅");
  });
}