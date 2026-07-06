"use strict";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// Loading screen and persistent interface behavior.
window.addEventListener("load", () => setTimeout(() => $("#loader").classList.add("hidden"), 350));
$("#year").textContent = new Date().getFullYear();

const header = $("#siteHeader");
const menuToggle = $("#menuToggle");
const navMenu = $("#navMenu");

const closeMenu = () => {
  menuToggle.classList.remove("open");
  navMenu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
};

menuToggle.addEventListener("click", () => {
  const open = !navMenu.classList.contains("open");
  menuToggle.classList.toggle("open", open);
  navMenu.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
$$('.nav-menu a').forEach(link => link.addEventListener("click", closeMenu));

const sections = $$("main section[id]");
const navLinks = $$(".nav-menu a");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
  const current = sections.reduce((active, section) => window.scrollY >= section.offsetTop - 140 ? section.id : active, "home");
  navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
}, { passive: true });

// Hero typing effect.
const phrases = ["LED TV", "Air Conditioner", "Refrigerator", "Washing Machine", "Electrical Services"];
const typedText = $("#typedText");
let phraseIndex = 0;
let charIndex = phrases[0].length;
let deleting = true;
function typeLoop() {
  const phrase = phrases[phraseIndex];
  charIndex += deleting ? -1 : 1;
  typedText.textContent = phrase.slice(0, charIndex);
  let delay = deleting ? 45 : 85;
  if (!deleting && charIndex === phrase.length) { deleting = true; delay = 1450; }
  if (deleting && charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 300; }
  setTimeout(typeLoop, delay);
}
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setTimeout(typeLoop, 1300);

// Reveal and counter animations.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
$$('.reveal').forEach(item => revealObserver.observe(item));

const formatNumber = value => value >= 1000 ? value.toLocaleString("en-IN") : value;
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1500;
    const update = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${formatNumber(Math.round(target * eased))}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    counterObserver.unobserve(el);
  });
}, { threshold: .5 });
$$('.counter').forEach(counter => counterObserver.observe(counter));

// Testimonial carousel.
const track = $("#testimonialTrack");
const dots = $$("#sliderDots button");
let slide = 0;
let sliderTimer;
function showSlide(index) {
  slide = (index + 3) % 3;
  const visible = window.innerWidth <= 560 ? 1 : window.innerWidth <= 1020 ? 2 : 3;
  const maxSlide = Math.max(0, 3 - visible);
  const effective = Math.min(slide, maxSlide);
  const item = $(".testimonial", track);
  const width = item ? item.getBoundingClientRect().width + 18 : 0;
  track.style.transform = `translateX(-${effective * width}px)`;
  dots.forEach((dot, i) => dot.classList.toggle("active", i === slide));
}
function restartSlider() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => showSlide(slide + 1), 4800);
}
$("#prevReview").addEventListener("click", () => { showSlide(slide - 1); restartSlider(); });
$("#nextReview").addEventListener("click", () => { showSlide(slide + 1); restartSlider(); });
dots.forEach((dot, i) => dot.addEventListener("click", () => { showSlide(i); restartSlider(); }));
window.addEventListener("resize", () => showSlide(slide));
restartSlider();

// Accessible FAQ accordion.
$$('.faq-item button').forEach(button => button.addEventListener("click", () => {
  const item = button.closest(".faq-item");
  const willOpen = !item.classList.contains("open");
  $$('.faq-item').forEach(other => {
    other.classList.remove("open");
    $("button", other).setAttribute("aria-expanded", "false");
    $("button b", other).textContent = "+";
  });
  if (willOpen) {
    item.classList.add("open");
    button.setAttribute("aria-expanded", "true");
    $("b", button).textContent = "−";
  }
}));

// Promotional offer appears on every page load, intentionally without storage.
const promo = $("#promoOverlay");
const promoClose = $("#promoClose");
let lastFocused;
function openPromo() {
  lastFocused = document.activeElement;
  promo.classList.add("show");
  promo.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => promoClose.focus(), 50);
}
function closePromo() {
  promo.classList.remove("show");
  promo.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocused) lastFocused.focus();
}
setTimeout(openPromo, 800);
promoClose.addEventListener("click", closePromo);
$("#promoBook").addEventListener("click", closePromo);
promo.addEventListener("click", event => { if (event.target === promo) closePromo(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && promo.classList.contains("show")) closePromo();
  if (event.key === "Tab" && promo.classList.contains("show")) {
    const focusable = $$("button, a", promo);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

// Convert the booking form into a prefilled WhatsApp conversation.
const form = $("#bookingForm");
const toast = $("#toast");
form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const message = `Hi Sonu Electronics, I need ${data.get("service")} service. My name is ${data.get("name")} and my phone number is ${data.get("phone")}.`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
  setTimeout(() => window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, "_blank", "noopener"), 350);
});
