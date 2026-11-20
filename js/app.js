/**
 * Wisma Pinus Kampus - Interactive Logic
 * Anti-slop craftsmanship standard: functional completeness, keyboard navigation, resilience.
 */

document.addEventListener("DOMContentLoaded", function () {
  initThemeToggle();
  initMobileNav();
  initCostCalculator();
  initSurveyForm();
  initPhotoModal();
  initFaqAccordion();
  initCopyAddress();
});

/* 1. Theme Toggle (R-21, R-34) */
function initThemeToggle() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem("wisma_theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? "dark" : "light");
  setTheme(initialTheme);

  toggleBtn.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("wisma_theme", nextTheme);
  });

  function setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      toggleBtn.setAttribute("aria-label", "Beralih ke mode terang");
    } else {
      document.documentElement.removeAttribute("data-theme");
      toggleBtn.setAttribute("aria-label", "Beralih ke mode gelap");
    }
  }
}

/* 2. Mobile Navigation (R-03, R-32) */
function initMobileNav() {
  const toggleBtn = document.getElementById("mobileNavToggle");
  const navMenu = document.getElementById("siteNav");
  if (!toggleBtn || !navMenu) return;

  function toggleMenu(show) {
    const isExpanded = show !== undefined ? show : toggleBtn.getAttribute("aria-expanded") !== "true";
    toggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    if (isExpanded) {
      navMenu.classList.add("is-open");
    } else {
      navMenu.classList.remove("is-open");
    }
  }

  toggleBtn.addEventListener("click", function () {
    toggleMenu();
  });

  // Close on nav link click
  navMenu.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      toggleMenu(false);
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
      toggleMenu(false);
      toggleBtn.focus();
    }
  });
}

/* 3. Cost Calculator (R-26: Functional completeness) */
function initCostCalculator() {
  const form = document.getElementById("costCalcForm");
  if (!form) return;

  const roomRates = {
    standard: 850000,
    deluxe: 1350000
  };

  const depositRate = 300000; // Refundable deposit

  function updateCalculation() {
    const roomTypeInput = form.querySelector('input[name="calcRoom"]:checked');
    const durationInput = form.querySelector('input[name="calcDuration"]:checked');
    const carParking = form.querySelector('input[name="optCar"]:checked');
    const miniFridge = form.querySelector('input[name="optFridge"]:checked');

    if (!roomTypeInput || !durationInput) return;

    const roomType = roomTypeInput.value;
    const duration = parseInt(durationInput.value, 10);
    const baseMonthly = roomRates[roomType] || 850000;

    // Additional monthly addons
    let addonMonthly = 0;
    if (carParking) addonMonthly += 150000;
    if (miniFridge) addonMonthly += 50000;

    // Duration discount logic
    let rentTotal = 0;
    let discountAmount = 0;

    if (duration === 1) {
      rentTotal = (baseMonthly + addonMonthly) * 1;
    } else if (duration === 3) {
      const normalTotal = (baseMonthly + addonMonthly) * 3;
      discountAmount = normalTotal * 0.05; // 5% discount
      rentTotal = normalTotal - discountAmount;
    } else if (duration === 6) {
      const normalTotal = (baseMonthly + addonMonthly) * 6;
      discountAmount = normalTotal * 0.08; // 8% discount
      rentTotal = normalTotal - discountAmount;
    } else if (duration === 12) {
      // Pay 11 months for 12 months stay (1 month free base rent)
      discountAmount = baseMonthly;
      rentTotal = (baseMonthly * 11) + (addonMonthly * 12);
    }

    const grandTotal = rentTotal + depositRate;

    // Render formatted currency
    document.getElementById("calcBaseRate").textContent = formatRupiah(baseMonthly) + " / bln";
    document.getElementById("calcDurationText").textContent = duration + " Bulan";
    document.getElementById("calcRentSubtotal").textContent = formatRupiah(Math.round(rentTotal));
    
    const discountRow = document.getElementById("calcDiscountRow");
    if (discountAmount > 0) {
      discountRow.style.display = "flex";
      document.getElementById("calcDiscountAmount").textContent = "- " + formatRupiah(Math.round(discountAmount));
    } else {
      discountRow.style.display = "none";
    }

    document.getElementById("calcDepositAmount").textContent = formatRupiah(depositRate);
    document.getElementById("calcGrandTotal").textContent = formatRupiah(Math.round(grandTotal));
  }

  form.addEventListener("change", updateCalculation);
  updateCalculation();
}

/* 4. Real Survey Booking Form (R-26, R-27: Multi-state) */
function initSurveyForm() {
  const form = document.getElementById("surveyBookingForm");
  const formCard = document.getElementById("surveyFormCard");
  const loadingState = document.getElementById("surveyLoadingState");
  const successState = document.getElementById("surveySuccessState");
  const resetBtn = document.getElementById("surveyResetBtn");

  if (!form || !formCard || !loadingState || !successState) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Basic validation
    let hasError = false;
    const requiredInputs = form.querySelectorAll("[required]");

    requiredInputs.forEach(function (input) {
      const group = input.closest(".form-group");
      if (!input.value.trim()) {
        group.classList.add("has-error");
        hasError = true;
      } else {
        group.classList.remove("has-error");
      }
    });

    const phoneInput = document.getElementById("surveyPhone");
    if (phoneInput && phoneInput.value) {
      const cleanPhone = phoneInput.value.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 9) {
        phoneInput.closest(".form-group").classList.add("has-error");
        hasError = true;
      }
    }

    if (hasError) return;

    // Collect data
    const name = document.getElementById("surveyName").value.trim();
    const phone = document.getElementById("surveyPhone").value.trim();
    const roomSelect = document.getElementById("surveyRoomType");
    const roomText = roomSelect.options[roomSelect.selectedIndex].text;
    const date = document.getElementById("surveyDate").value;
    const note = document.getElementById("surveyNotes").value.trim();

    // 1. Show loading state (R-27)
    form.style.display = "none";
    loadingState.style.display = "flex";

    setTimeout(function () {
      // 2. Show success state (R-27)
      loadingState.style.display = "none";
      successState.style.display = "flex";

      document.getElementById("successDetailName").textContent = name;
      document.getElementById("successDetailRoom").textContent = roomText;
      document.getElementById("successDetailDate").textContent = formatDateIndo(date);

      // Pre-compose WhatsApp direct link
      const waBtn = document.getElementById("successWaBtn");
      if (waBtn) {
        const textMsg = encodeURIComponent(
          "Halo Pengelola Wisma Pinus Kampus,\n\nSaya ingin konfirmasi janji survei kamar:\n" +
          "• Nama: " + name + "\n" +
          "• No WhatsApp: " + phone + "\n" +
          "• Tipe Kamar: " + roomText + "\n" +
          "• Rencana Tanggal Survei: " + date + "\n" +
          (note ? "• Catatan: " + note + "\n" : "") +
          "\nApakah jadwal tersebut tersedia? Terima kasih."
        );
        waBtn.href = "https://wa.me/6281234567890?text=" + textMsg;
      }
    }, 600);
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.style.display = "flex";
      loadingState.style.display = "none";
      successState.style.display = "none";
    });
  }
}

/* 5. Photo Lightbox Modal (R-26, R-32) */
function initPhotoModal() {
  const modal = document.getElementById("photoModalBackdrop");
  const modalImg = document.getElementById("modalMainImg");
  const modalTitle = document.getElementById("modalRoomTitle");
  const thumbsContainer = document.getElementById("modalThumbs");
  const closeBtn = document.getElementById("modalCloseBtn");

  if (!modal || !modalImg || !closeBtn) return;

  const roomGalleries = {
    standard: {
      title: "Foto Detail: Kamar Standar (3x3m)",
      photos: [
        {
          src: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
          alt: "Kamar tidur minimalis dengan meja belajar dan jendela sirkulasi udara"
        },
        {
          src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80",
          alt: "Meja belajar kayu dengan pencahayaan alami"
        },
        {
          src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
          alt: "Kamar mandi luar bersih dengan kloset duduk dan shower"
        }
      ]
    },
    deluxe: {
      title: "Foto Detail: Kamar Deluxe AC + KM Dalam (3.5x3.5m)",
      photos: [
        {
          src: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
          alt: "Kamar Deluxe dengan kasur spring bed, AC dan meja belajar luas"
        },
        {
          src: "https://images.unsplash.com/photo-1540518614846-7ede433c4570?auto=format&fit=crop&w=1000&q=80",
          alt: "Sudut ruang kerja dan lemari pakaian 2 pintu"
        },
        {
          src: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=80",
          alt: "Kamar mandi dalam dengan shower air bersih dan kloset duduk"
        }
      ]
    }
  };

  document.querySelectorAll("[data-open-gallery]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const roomKey = btn.getAttribute("data-open-gallery");
      const data = roomGalleries[roomKey];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalImg.src = data.photos[0].src;
      modalImg.alt = data.photos[0].alt;

      // Render thumbs
      thumbsContainer.innerHTML = "";
      data.photos.forEach(function (photo, idx) {
        const thumbBtn = document.createElement("button");
        thumbBtn.className = "thumb-btn" + (idx === 0 ? " is-active" : "");
        thumbBtn.type = "button";
        thumbBtn.setAttribute("aria-label", "Pilih foto " + (idx + 1));
        thumbBtn.innerHTML = '<img src="' + photo.src + '" alt="' + photo.alt + '" width="72" height="48">';

        thumbBtn.addEventListener("click", function () {
          modalImg.src = photo.src;
          modalImg.alt = photo.alt;
          thumbsContainer.querySelectorAll(".thumb-btn").forEach(function (b) {
            b.classList.remove("is-active");
          });
          thumbBtn.classList.add("is-active");
        });

        thumbsContainer.appendChild(thumbBtn);
      });

      modal.classList.add("is-open");
      closeBtn.focus();
    });
  });

  function closeModal() {
    modal.classList.remove("is-open");
  }

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

/* 6. Real FAQ Accordion (R-28, R-32) */
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll(".faq-question-btn");
  if (!faqButtons.length) return;

  faqButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const answer = document.getElementById(btn.getAttribute("aria-controls"));
      if (!answer) return;

      if (isExpanded) {
        btn.setAttribute("aria-expanded", "false");
        answer.hidden = true;
      } else {
        btn.setAttribute("aria-expanded", "true");
        answer.hidden = false;
      }
    });
  });
}

/* 7. Copy Address Clipboard Tool (R-26, R-39: Resilient fallback) */
function initCopyAddress() {
  const copyBtn = document.getElementById("copyAddressBtn");
  const toast = document.getElementById("toastNotice");
  if (!copyBtn || !toast) return;

  copyBtn.addEventListener("click", function () {
    const address = "Jl. Flamboyan No. 14, Pogung Kidul, Sinduadi, Mlati, Sleman, D.I. Yogyakarta 55284";

    function showToast() {
      toast.classList.add("is-visible");
      setTimeout(function () {
        toast.classList.remove("is-visible");
      }, 3000);
    }

    function fallbackCopy() {
      const textarea = document.createElement("textarea");
      textarea.value = address;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {}
      document.body.removeChild(textarea);
      showToast();
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(showToast).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
}

/* Utilities */
function formatRupiah(amount) {
  return "Rp " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDateIndo(dateStr) {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  return day + " " + (months[monthIdx] || parts[1]) + " " + year;
}
