(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // WOW animation
    new WOW().init();

    // Sticky Navbar
    $(window).scroll(function () {
        $('.sticky-top').css('top', $(this).scrollTop() > 300 ? '0px' : '-100px');
    });

    // Dropdown hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";

    $(window).on("load resize", function () {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
                function () {
                    $(this).addClass(showClass)
                        .find($dropdownToggle).attr("aria-expanded", "true")
                        .end()
                        .find($dropdownMenu).addClass(showClass);
                },
                function () {
                    $(this).removeClass(showClass)
                        .find($dropdownToggle).attr("aria-expanded", "false")
                        .end()
                        .find($dropdownMenu).removeClass(showClass);
                }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });

    // ================= BACKEND =================
    const BACKEND_URL = "https://fastlaneshipping-backend-i4sw.onrender.com";

    // ================= FORM + WHATSAPP =================
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

            // ✅ Validation
            if (!data.name || !data.email || !data.pickup || !data.destination || !data.service) {
                alert("Fill all required fields");
                return;
            }

            try {
                // ✅ SEND TO BACKEND
                await fetch(`${BACKEND_URL}/request/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

            } catch (err) {
                console.error("Backend error:", err);
            }

            // ✅ SEND TO WHATSAPP
           const message =
`Hello Admin,

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

Please review and respond with payment details.`;

            const phone = "13864174481"; // ✅ your test number

            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            console.log("WhatsApp URL:", url);

            window.open(url, "_blank");

        });
    });

    // Back to top
    $(window).scroll(function () {
        $('.back-to-top').fadeToggle($(this).scrollTop() > 300);
    });

    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500);
        return false;
    });

    // Carousel
    $(".header-carousel").owlCarousel({
        autoplay: false,
        smartSpeed: 1500,
        items: 1,
        dots: false,
        loop: true,
        nav: true,
        navText: [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });

    $(".testimonial-carousel").owlCarousel({
        autoplay: false,
        smartSpeed: 1000,
        center: true,
        dots: true,
        loop: true,
        responsive: {
            0: { items: 1 },
            768: { items: 2 },
            992: { items: 3 }
        }
    });

})(jQuery);