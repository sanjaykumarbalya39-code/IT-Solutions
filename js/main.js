const preloader = document.querySelector("[data-preloader]");
if (preloader) {
  document.body.classList.add("is-preloading");
  setTimeout(() => {
    preloader.classList.add("is-hidden");
    document.body.classList.remove("is-preloading");
    setTimeout(() => preloader.remove(), 450);
  }, 1000);
}

const heroVideo = document.querySelector(".hero-bg-video");
if (heroVideo) {
  const tryPlayHero = () => {
    heroVideo.play().catch(() => {});
  };
  heroVideo.addEventListener("loadeddata", tryPlayHero);
  heroVideo.addEventListener("canplay", tryPlayHero);
  tryPlayHero();
  window.addEventListener("pageshow", () => {
    if (heroVideo.paused) tryPlayHero();
  });
}

const navbar = document.querySelector(".navbar");
const navLinks = document.querySelector(".nav-links");
const mobileToggle = document.querySelector(".mobile-toggle");
const links = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      navLinks?.classList.remove("open");
    }
  });
});

const activePath = window.location.pathname.split("/").pop() || "index.html";
links.forEach((link) => {
  const href = link.getAttribute("href");
  if (href === activePath) link.classList.add("active");
});

const counters = document.querySelectorAll("[data-counter]");
if (counters.length) {
  const runCounter = (el) => {
    const max = Number(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    let n = 0;
    const step = Math.ceil(max / 80);
    const timer = setInterval(() => {
      n += step;
      if (n >= max) {
        n = max;
        clearInterval(timer);
      }
      el.textContent = `${n.toLocaleString()}${suffix}`;
    }, 20);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const testimonialItems = document.querySelectorAll(
  ".testimonial-wrap:not(.is-grid) .testimonial"
);
let testimonialIndex = 0;
if (testimonialItems.length) {
  testimonialItems[0].classList.add("active");
  setInterval(() => {
    testimonialItems[testimonialIndex].classList.remove("active");
    testimonialIndex = (testimonialIndex + 1) % testimonialItems.length;
    testimonialItems[testimonialIndex].classList.add("active");
  }, 4500);
}

const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

const forms = document.querySelectorAll("[data-validate-form]");
forms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    let valid = true;
    form.querySelectorAll("[data-required]").forEach((field) => {
      const wrap = field.closest(".field-wrap") || field.parentElement;
      const errorEl = wrap?.querySelector(".error");
      let fieldValid = true;
      let msg = "";

      if (field.type === "checkbox") {
        if (!field.checked) {
          fieldValid = false;
          msg = field.dataset.requiredMsg || "This field is required.";
        }
      } else if (field.type === "radio") {
        const group = form.querySelectorAll(
          `input[type="radio"][name="${field.name}"]`
        );
        if (field !== group[0]) return;
        const checked = form.querySelector(
          `input[type="radio"][name="${field.name}"]:checked`
        );
        if (!checked) {
          fieldValid = false;
          msg = "Please select a role.";
        }
      } else if (!field.value.trim()) {
        fieldValid = false;
        msg = field.dataset.requiredMsg || "This field is required.";
      } else if (field.type === "email") {
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (!emailOk) {
          fieldValid = false;
          msg = "Please enter a valid email.";
        }
      } else if (field.dataset.minlength) {
        const minLength = Number(field.dataset.minlength);
        if (field.value.trim().length < minLength) {
          fieldValid = false;
          msg = field.dataset.minlengthMsg || `Minimum ${minLength} characters required.`;
        }
      }

      if (fieldValid && field.dataset.match) {
        const other = form.querySelector(field.dataset.match);
        if (!other || field.value !== other.value) {
          fieldValid = false;
          msg = field.dataset.matchMsg || "Values do not match.";
        }
      }

      if (!fieldValid) {
        valid = false;
        if (errorEl) errorEl.textContent = msg;
      } else if (errorEl) {
        errorEl.textContent = "";
      }
    });

    if (!valid) e.preventDefault();
  });
});

const loginForm = document.querySelector("#loginForm");
if (loginForm) {
  const getLoginStatusEl = () => {
    let statusEl = loginForm.querySelector(".auth-form-status");
    if (!statusEl) {
      statusEl = document.createElement("p");
      statusEl.className = "auth-form-status";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.insertAdjacentElement("afterend", statusEl);
      else loginForm.appendChild(statusEl);
    }
    return statusEl;
  };

  const showLoginStatus = (message, state) => {
    const statusEl = getLoginStatusEl();
    statusEl.textContent = message;
    statusEl.style.marginTop = "12px";
    statusEl.style.fontSize = "0.95rem";
    statusEl.style.color = state === "success" ? "#34d399" : "#fda4af";
  };

  loginForm.addEventListener("submit", (e) => {
    if (e.defaultPrevented) {
      showLoginStatus(
        "Login failed. Please correct the highlighted fields.",
        "error"
      );
      return;
    }

    e.preventDefault();
    const role = loginForm.querySelector('input[name="role"]:checked')?.value;
    showLoginStatus("Login successful. Redirecting...", "success");
    setTimeout(() => {
      if (role === "admin") window.location.href = "admin-dashboard.html";
      else window.location.href = "customer-dashboard.html";
    }, 2000);
  });
}

const registerForm = document.querySelector("#registerForm");
if (registerForm) {
  const getRegisterStatusEl = () => {
    let statusEl = registerForm.querySelector(".auth-form-status");
    if (!statusEl) {
      statusEl = document.createElement("p");
      statusEl.className = "auth-form-status";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.insertAdjacentElement("afterend", statusEl);
      else registerForm.appendChild(statusEl);
    }
    return statusEl;
  };

  const showRegisterStatus = (message, state) => {
    const statusEl = getRegisterStatusEl();
    statusEl.textContent = message;
    statusEl.style.marginTop = "12px";
    statusEl.style.fontSize = "0.95rem";
    statusEl.style.color =
      state === "success" ? "#34d399" : "#fda4af";
  };

  registerForm.addEventListener("submit", (e) => {
    if (e.defaultPrevented) {
      showRegisterStatus(
        "Registration failed. Please correct the highlighted fields.",
        "error"
      );
      return;
    }

    e.preventDefault();
    showRegisterStatus(
      "Registration successful. Redirecting...",
      "success"
    );
    setTimeout(() => {
      window.location.href = "404.html";
    }, 2000);
  });
}

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  const getContactStatusEl = () => {
    let statusEl = contactForm.querySelector(".contact-form-status");
    if (!statusEl) {
      statusEl = document.createElement("p");
      statusEl.className = "contact-form-status";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.insertAdjacentElement("afterend", statusEl);
      else contactForm.appendChild(statusEl);
    }
    return statusEl;
  };

  const showContactStatus = (message, state) => {
    const statusEl = getContactStatusEl();
    statusEl.textContent = message;
    statusEl.style.marginTop = "12px";
    statusEl.style.fontSize = "0.95rem";
    statusEl.style.color = state === "success" ? "#34d399" : "#fda4af";
  };

  contactForm.addEventListener("submit", (e) => {
    if (e.defaultPrevented) {
      showContactStatus(
        "Request failed. Please correct the highlighted fields.",
        "error"
      );
      return;
    }

    e.preventDefault();
    showContactStatus("Request sent successfully. Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "404.html";
    }, 2000);
  });
}

const newsletterForm = document.querySelector(".newsletter-form");
if (newsletterForm) {
  let newsletterStatusTimer;

  const getNewsletterStatusEl = () => {
    let statusEl = newsletterForm.querySelector(".newsletter-form-status");
    if (!statusEl) {
      statusEl = document.createElement("p");
      statusEl.className = "newsletter-form-status";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
      newsletterForm.insertAdjacentElement("afterbegin", statusEl);
    }
    return statusEl;
  };

  const showNewsletterStatus = (message, state) => {
    const statusEl = getNewsletterStatusEl();
    if (newsletterStatusTimer) {
      clearTimeout(newsletterStatusTimer);
      newsletterStatusTimer = undefined;
    }

    statusEl.style.display = "block";
    statusEl.textContent = message;
    statusEl.style.marginTop = "12px";
    statusEl.style.fontSize = "0.95rem";
    statusEl.style.color = state === "success" ? "#34d399" : "#fda4af";

    if (state === "success") {
      newsletterStatusTimer = setTimeout(() => {
        statusEl.textContent = "";
        statusEl.style.display = "none";
      }, 2000);
    }
  };

  newsletterForm.addEventListener("submit", (e) => {
    if (e.defaultPrevented) {
      showNewsletterStatus(
        "Subscription failed. Please enter a valid email.",
        "error"
      );
      return;
    }

    e.preventDefault();
    showNewsletterStatus("Subscription successful. Thank you!", "success");
    newsletterForm.reset();
  });
}

const reduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll("[data-tech-marquee] .tech-track").forEach((track) => {
  if (track.dataset.cloned === "true") return;
  if (!reduceMotionMq.matches) {
    const items = Array.from(track.children);
    items.forEach((item) => track.appendChild(item.cloneNode(true)));
  }
  track.dataset.cloned = "true";
});

document.querySelectorAll("[data-faq] .faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest("[data-faq]");
    const isOpen = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });
});
