(function ($) {
  "use strict";

  // ================= SPINNER =================
  setTimeout(function () {
    if ($('#spinner').length > 0) {
      $('#spinner').removeClass('show');
    }
  }, 1);

  // ================= WOW =================
  new WOW().init();

  // ================= STICKY NAV =================
  $(window).scroll(function () {
    $('.sticky-top').css('top', $(this).scrollTop() > 300 ? '0px' : '-100px');
  });

  // ================= BACKEND =================
  const BACKEND_URL = "https://fastlaneshipping-backend-i4sw.onrender.com";

  // ================= REQUEST FORM =================
  document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("requestForm");
    const btn = document.getElementById("whatsappBtn");

    if (!form || !btn) {
      console.log("❌ Form or button not found");
      return;
    }

    btn.addEventListener("click", async () => {

      const getValue = (name) => {
        const el = form.querySelector(`[name="${name}"]`);
        return el ? el.value.trim() : "";
      };

      const data = {
        name: getValue("name"),
        email: getValue("email"),
        pickup: getValue("pickup"),
        destination: getValue("destination"),
        weight: getValue("weight"),
        service: getValue("service"),
        details: getValue("details"),
      };

      // ================= VALIDATION =================
      if (!data.name || !data.email || !data.pickup || !data.destination || !data.service) {
        alert("Please fill all required fields");
        return;
      }

      try {
        // ✅ SEND TO BACKEND (ONLY ONCE)
        const res = await fetch(`${BACKEND_URL}/request/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!result.success) {
          throw new Error(result.error || "Request failed");
        }

        // ✅ SUCCESS MESSAGE
        alert("Request submitted successfully!");

        // ================= WHATSAPP MESSAGE =================
        const message = `
Hello Admin,

A new shipment request has been submitted.

Customer Details:
--------------------------
Name: ${data.name}
Email: ${data.email}

Shipment Details:
--------------------------
Pickup Location: ${data.pickup}
Destination: ${data.destination}
Weight: ${data.weight || "N/A"}
Service Type: ${data.service}

Additional Info:
--------------------------
${data.details || "None"}

Please review and respond.
        `;

        const phone = "09040533828"; // change later to admin number

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        console.log("WhatsApp URL:", url);

        window.open(url, "_blank");

        // ✅ RESET FORM
        form.reset();

      } catch (err) {
        console.error("❌ Error:", err.message);
        alert("Failed to send request. Try again.");
      }

    });
  });

  // ================= BACK TO TOP =================
  $(window).scroll(function () {
    $('.back-to-top').fadeToggle($(this).scrollTop() > 300);
  });

  $('.back-to-top').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 1500);
    return false;
  });

})(jQuery);