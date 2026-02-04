const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealTargets = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealTargets.forEach((target) => observer.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const yearEl = document.querySelector("[data-year]");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const loader = document.getElementById("page-loader");
if (loader) {
  window.addEventListener("load", () => {
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 1100);
  });
}

const sliders = document.querySelectorAll("[data-slider]");
sliders.forEach((slider) => {
  const track = slider.querySelector("[data-slider-track]");
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const prevBtn = slider.querySelector("[data-prev]");
  const nextBtn = slider.querySelector("[data-next]");
  if (!track || slides.length === 0) return;

  let index = 0;
  let autoTimer = null;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  const goTo = (newIndex) => {
    index = (newIndex + slides.length) % slides.length;
    update();
  };

  const startAuto = () => {
    autoTimer = setInterval(() => {
      goTo(index + 1);
    }, 5000);
  };

  const stopAuto = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goTo(index - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goTo(index + 1);
    });
  }

  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);

  update();
  startAuto();
});

const availability = document.querySelector("[data-availability]");
if (availability) {
  const dateInput = availability.querySelector("#date");
  const statusEl = availability.querySelector("[data-status]");
  const blockedDates = (availability.dataset.blocked || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (dateInput) {
    const today = new Date();
    dateInput.min = today.toISOString().split("T")[0];

    dateInput.addEventListener("change", () => {
      if (!statusEl) return;
      const selected = dateInput.value;
      if (!selected) {
        statusEl.textContent = "Select a date to check availability.";
        statusEl.classList.remove("blocked");
        return;
      }

      if (blockedDates.includes(selected)) {
        statusEl.textContent = "Selected date is currently booked. Pick another day.";
        statusEl.classList.add("blocked");
      } else {
        statusEl.textContent = "Date looks open. We will confirm within 24-48 hours.";
        statusEl.classList.remove("blocked");
      }
    });
  }
}
