// ---- Your contact details: the form sends enquiries here ----
const CONTACT = {
  email: "",     // e.g. "hello@yourdomain.com"
  whatsapp: "",  // international format, digits only, e.g. "923001234567"
};

const $ = (s) => document.querySelector(s);
$("#year").textContent = new Date().getFullYear();

// nav: background on scroll, mobile menu
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 10);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
$("#burger").addEventListener("click", () => $("#links").classList.toggle("open"));
document.querySelectorAll("#links a").forEach((a) => a.addEventListener("click", () => $("#links").classList.remove("open")));

// reveal sections as they scroll into view
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".pain, .agent, .steps li, .ind, .why-grid > div, .plan, details, .sec-head")
  .forEach((el) => { el.classList.add("reveal"); io.observe(el); });

// hero: an example call that plays on a loop
const SCRIPT = [
  ["ai", "Thanks for calling Fade & Co., this is Ava, the salon's AI assistant. How can I help?"],
  ["me", "Hi, can I get a skin fade tomorrow morning?"],
  ["ai", "Sure! Tomorrow morning I have 10 AM, 11:30 AM or 12 PM. Any preference?"],
  ["me", "11:30 with Jade please"],
  ["ai", "Jade's free at 11:30. Can I get your name?"],
  ["me", "It's Omar"],
  ["ai", "You're all set, Omar! Skin fade with Jade tomorrow at 11:30. I'll text you a confirmation now."],
];
const body = $("#ccBody"), booked = $("#booked");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let t0 = Date.now();
setInterval(() => {
  const s = Math.floor((Date.now() - t0) / 1000);
  $("#ccTime").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}, 500);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function bubble(who, text) {
  const d = document.createElement("div");
  d.className = "bub " + who;
  d.textContent = text;
  body.appendChild(d);
  while (body.children.length > 8) body.firstChild.remove();
  return d;
}
async function play() {
  if (reduce) { SCRIPT.forEach(([w, t]) => bubble(w, t)); booked.classList.add("show"); return; }
  for (;;) {
    body.innerHTML = ""; booked.classList.remove("show"); t0 = Date.now();
    await sleep(600);
    for (const [who, text] of SCRIPT) {
      const typing = bubble(who, "•••");
      typing.classList.add("typing");
      await sleep(who === "ai" ? 900 : 700);
      typing.classList.remove("typing");
      typing.textContent = text;
      await sleep(900 + text.length * 22);
    }
    booked.classList.add("show");
    await sleep(4500);
  }
}
play();

// pricing buttons pre-select the plan in the form
document.querySelectorAll("[data-plan]").forEach((b) =>
  b.addEventListener("click", () => { $("#planSel").value = b.dataset.plan; }));

// direct contact buttons
const direct = $("#direct");
if (CONTACT.whatsapp) direct.insertAdjacentHTML("beforeend",
  `<a href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener">🟢 Chat on WhatsApp</a>`);
if (CONTACT.email) direct.insertAdjacentHTML("beforeend",
  `<a href="mailto:${CONTACT.email}">✉️ ${CONTACT.email}</a>`);

// the form opens WhatsApp or email with the enquiry already written
$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const text = `Hi NightShift AI! I'd like a free demo.\n\nName: ${f.get("name")}\nBusiness: ${f.get("business")} (${f.get("type")})\n` +
    `Interested in: ${f.get("plan")}\nContact: ${f.get("reach")}` + (f.get("msg") ? `\n\n${f.get("msg")}` : "");
  const note = $("#formNote");
  if (CONTACT.whatsapp) {
    open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    note.textContent = "Opening WhatsApp. Just press send!";
  } else if (CONTACT.email) {
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Free demo request: " + f.get("business"))}&body=${encodeURIComponent(text)}`;
    note.textContent = "Opening your email app. Just press send!";
  } else {
    note.textContent = "Thanks! Our contact details are being set up. Please check back soon.";
  }
});
