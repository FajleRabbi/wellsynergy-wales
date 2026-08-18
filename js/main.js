/* Wellsynergy — motion: preloader, hero entrance, ScrollTrigger fade-ups */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById("preloader");
  const bar = document.getElementById("preloader-bar");
  const count = document.getElementById("preloader-count");

  function finishPreloader() {
    if (!preloader || preloader.classList.contains("done")) return;
    preloader.classList.add("done");
    preloader.setAttribute("aria-hidden", "true");
    gsap.set(preloader, { display: "none", delay: 0.8 });
  }

  if (reduced) {
    if (bar) bar.style.width = "100%";
    if (count) count.textContent = "100%";
    setTimeout(finishPreloader, 250);
    playHero(true);
    return;
  }

  const counter = { v: 0 };
  const drawEls = preloader
    ? preloader.querySelectorAll(".preloader-compass circle, .preloader-compass path")
    : [];

  const preloaderTl = gsap.timeline({ onComplete: finishPreloader });

  preloaderTl
    .to(drawEls, {
      strokeDashoffset: 0,
      duration: 1.15,
      ease: "power2.inOut",
      stagger: 0.09
    }, 0.1)
    .to(counter, {
      v: 100,
      duration: 1.35,
      ease: "power2.inOut",
      onUpdate: function () {
        if (bar) bar.style.width = counter.v + "%";
        if (count) count.textContent = Math.round(counter.v) + "%";
      }
    }, 0.15)
    .add(() => playHero(false));

  /* ---------- Hero entrance ---------- */
  function playHero(isReduced) {
    if (isReduced) {
      gsap.set(
        [".hero-title .line-inner", ".eyebrow", ".hero-sub", ".hero-ctas .btn", ".trust", ".hero-visual"],
        { opacity: 1 }
      );
      return;
    }

    const inner = gsap.utils.toArray(".hero-title .line-inner");

    gsap.timeline({ delay: 0.1 })
      .fromTo(inner,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.14 })
      .fromTo(".eyebrow", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.25)
      .fromTo(".hero-sub", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.45)
      .fromTo(".hero-ctas .btn", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1 }, 0.6)
      .fromTo(".trust", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.75)
      .fromTo(".hero-visual",
        { opacity: 0, y: 36, rotate: 1 },
        { opacity: 1, y: 0, rotate: 0, duration: 0.9, ease: "power3.out" }, 0.45);
  }

  /* ---------- ScrollTrigger fade-ups (once) ---------- */
  if (reduced) return;

  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      }
    );
  });

  /* ---------- Stagger service cards ---------- */
  gsap.utils.toArray(".services-grid").forEach((grid) => {
    const cards = grid.querySelectorAll(".service-card");
    gsap.fromTo(cards,
      { opacity: 0, y: 44 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: grid, start: "top 85%", once: true }
      }
    );
  });

  gsap.utils.toArray(".stories-grid").forEach((grid) => {
    const cards = grid.querySelectorAll(".story-card");
    gsap.fromTo(cards,
      { opacity: 0, y: 44 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: grid, start: "top 85%", once: true }
      }
    );
  });

  /* ---------- Re-measure triggers after every asset loads ---------- */
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);
  window.addEventListener("resize", refresh);
  setTimeout(refresh, 3000);

  /* ---------- Routes rail arrows ---------- */
  const rail = document.querySelector(".routes-rail");
  const prevBtn = document.querySelector(".rail-prev");
  const nextBtn = document.querySelector(".rail-next");
  if (rail && prevBtn && nextBtn) {
    const card = rail.querySelector(".route-card");
    const step = () => (card ? card.getBoundingClientRect().width + 19.2 : 380);
    const updateBtns = () => {
      prevBtn.disabled = rail.scrollLeft <= 2;
      nextBtn.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
    };
    prevBtn.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: "smooth" }));
    nextBtn.addEventListener("click", () => rail.scrollBy({ left: step(), behavior: "smooth" }));
    rail.addEventListener("scroll", updateBtns, { passive: true });
    window.addEventListener("load", updateBtns);
    updateBtns();
  }

  /* ---------- Mouse drag to scroll the rail ---------- */
  if (rail && window.PointerEvent) {
    let isDown = false, startX = 0, startLeft = 0, dragged = false;
    rail.addEventListener("pointerdown", (e) => {
      isDown = true;
      dragged = false;
      startX = e.clientX;
      startLeft = rail.scrollLeft;
      rail.classList.add("dragging");
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) dragged = true;
      rail.scrollLeft = startLeft - dx;
    });
    const endDrag = (e) => {
      if (!isDown) return;
      isDown = false;
      rail.classList.remove("dragging");
      try { rail.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("click", (e) => {
      if (dragged) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = document.getElementById("header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const navMobile = document.getElementById("nav-mobile");
  const navClose = document.getElementById("nav-close");

  function openMenu() {
    if (!navMobile) return;
    navMobile.hidden = false;
    requestAnimationFrame(() => navMobile.classList.add("open"));
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (navClose) navClose.focus();
  }

  function closeMenu() {
    if (!navMobile) return;
    navMobile.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(() => { navMobile.hidden = true; }, 400);
  }

  if (burger && navMobile) {
    burger.addEventListener("click", () => {
      navMobile.classList.contains("open") ? closeMenu() : openMenu();
    });
  }
  if (navClose) navClose.addEventListener("click", closeMenu);
  if (navMobile) {
    navMobile.querySelectorAll(".nav-mobile-link").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
    navMobile.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Magnetic CTA (desktop fine pointers only) ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll(".btn-primary, .btn-outline").forEach((btn) => {
      if (btn.closest(".nav-mobile")) return;
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.16, y: y * 0.16, duration: 0.3, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" });
      });
    });
  }
})();
