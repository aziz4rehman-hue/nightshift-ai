// NightShift AI: the animated layer. Everything here is decoration; the page works without it.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // ---------- 1. night sky: twinkling stars, shooting stars, constellations around the cursor ----------
  const sky = $("#sky"), hero = $(".hero");
  if (sky) {
    const ctx = sky.getContext("2d");
    let W = 0, H = 0, stars = [], shooters = [], mouse = { x: -999, y: -999 }, visible = true, nextShoot = 0;
    const DPR = Math.min(devicePixelRatio || 1, 2);
    function size() {
      W = hero.clientWidth; H = hero.clientHeight;
      sky.width = W * DPR; sky.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.round((W * H) / 5200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + 0.2,
        p: Math.random() * Math.PI * 2, s: 0.6 + Math.random() * 1.8, d: 0.2 + Math.random() * 0.8,
      }));
      if (reduce) draw(0);
    }
    hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    hero.addEventListener("pointerleave", () => (mouse = { x: -999, y: -999 }));
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      const near = [];
      for (const s of stars) {
        // gentle parallax away from the cursor
        const ox = mouse.x > -999 ? (mouse.x - W / 2) * -0.012 * s.d : 0;
        const oy = mouse.x > -999 ? (mouse.y - H / 2) * -0.012 * s.d : 0;
        const x = s.x + ox, y = s.y + oy;
        const a = 0.35 + 0.65 * Math.abs(Math.sin(s.p + t * 0.001 * s.s));
        ctx.globalAlpha = a;
        ctx.fillStyle = s.r > 1.2 ? "#d8ccff" : "#ffffff";
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
        const dx = x - mouse.x, dy = y - mouse.y;
        if (dx * dx + dy * dy < 160 * 160) near.push({ x, y, dist: Math.sqrt(dx * dx + dy * dy) });
      }
      // constellation: link the stars closest to the cursor
      near.sort((a, b) => a.dist - b.dist);
      const pts = near.slice(0, 9);
      ctx.lineWidth = 0.7;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d > 110) continue;
          ctx.globalAlpha = (1 - d / 110) * 0.55;
          ctx.strokeStyle = "#a78bfa";
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      // shooting stars
      if (!reduce && t > nextShoot) {
        nextShoot = t + 2600 + Math.random() * 4000;
        shooters.push({ x: Math.random() * W * 0.8 + W * 0.2, y: Math.random() * H * 0.35, vx: -(5 + Math.random() * 4), vy: 2.2 + Math.random() * 1.5, life: 1 });
      }
      for (const s of shooters) {
        s.x += s.vx; s.y += s.vy; s.life -= 0.018;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        g.addColorStop(0, `rgba(255,255,255,${Math.max(s.life, 0)})`); g.addColorStop(1, "rgba(167,139,250,0)");
        ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); ctx.stroke();
      }
      shooters = shooters.filter((s) => s.life > 0);
      ctx.globalAlpha = 1;
    }
    function loop(t) { if (visible) draw(t); requestAnimationFrame(loop); }
    addEventListener("resize", size);
    size();
    if (!reduce) requestAnimationFrame(loop);
  }

  // ---------- 2. the night clock: 9 PM at the top of the page, 7 AM at the bottom ----------
  const clock = $("#nightclock"), dawn = $("#dawn");
  if (clock) {
    const fmt = (m) => { m = Math.round(m / 5) * 5 % 1440; let h = Math.floor(m / 60); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${String(m % 60).padStart(2, "0")} ${ap}`; };
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      $("#ncTime").textContent = fmt(21 * 60 + p * 600);
      const morning = p > 0.86;
      $("#ncIco").textContent = morning ? "☀️" : p > 0.6 ? "🌘" : "🌙";
      $("#ncLbl").textContent = morning ? "Morning! 3 bookings waiting" : "Shop closed · agent on shift";
      clock.classList.toggle("show", scrollY > 300);
      clock.classList.toggle("morning", morning);
      dawn.style.opacity = Math.pow(p, 2.2).toFixed(3);
    };
    addEventListener("scroll", update, { passive: true }); update();
  }

  // ---------- 3. the AI voice orb ----------
  const orb = $("#orb");
  window.orbLevel = 0.15;
  if (orb) {
    const c = orb.getContext("2d"), S = 84, R = 26;
    let level = 0.15;
    function frame(t) {
      level += (window.orbLevel - level) * 0.08;
      c.clearRect(0, 0, S, S);
      const g = c.createRadialGradient(S / 2 - 8, S / 2 - 10, 4, S / 2, S / 2, R + 12);
      g.addColorStop(0, "#e9d5ff"); g.addColorStop(0.45, "#8b5cf6"); g.addColorStop(1, "#22d3ee");
      c.fillStyle = g;
      c.beginPath();
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const wob = Math.sin(a * 3 + t * 0.004) * 0.5 + Math.sin(a * 5 - t * 0.006) * 0.35 + Math.sin(a * 2 + t * 0.0025) * 0.4;
        const r = R + wob * 10 * level + 2;
        const x = S / 2 + Math.cos(a) * r, y = S / 2 + Math.sin(a) * r;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
      c.shadowColor = "rgba(139,92,246,.9)"; c.shadowBlur = 10 + level * 18;
      c.fill();
      c.shadowBlur = 0;
      if (!reduce) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ---------- 4. missed calls flip into bookings ----------
  const notifs = $("#notifs");
  if (notifs) {
    const CALLS = [
      ["8:12 PM", "Unknown caller", "Booked · Beard trim, Thu 10:30 AM"],
      ["8:47 PM", "Sara M.", "Booked · Cut & style, Fri 2 PM"],
      ["9:30 PM", "+44 7700 900•••", "Answered · Opening hours sent"],
      ["10:05 PM", "Daniel K.", "Booked · Kids cut, Sat 11 AM"],
    ];
    notifs.innerHTML = CALLS.map(([time, who, done], i) => `
      <div class="nf" style="--i:${i}">
        <div class="nf-in">
          <div class="nf-face nf-miss"><span class="nf-ic">📵</span><div><b>Missed call</b><small>${who}</small></div><time>${time}</time></div>
          <div class="nf-face nf-ok"><span class="nf-ic">✅</span><div><b>Answered by NightShift AI</b><small>${done}</small></div><time>${time}</time></div>
        </div>
      </div>`).join("");
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      notifs.classList.add("play");
      obs.disconnect();
    }, { threshold: 0.4 }).observe(notifs);
  }

  // ---------- 5. headline words slide up one by one ----------
  const h1 = $(".hero h1");
  if (h1 && !reduce) {
    let n = 0;
    const wrap = (node, grad) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((w) => {
            if (!w.trim()) { frag.append(w); return; }
            const s = document.createElement("span");
            s.className = "w" + (grad ? " grad" : "");
            s.style.animationDelay = `${0.08 + n++ * 0.07}s`;
            s.textContent = w;
            frag.append(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          const g = child.classList.contains("grad");
          if (g) child.classList.remove("grad");
          wrap(child, g || grad);
        }
      }
    };
    wrap(h1, false);
  }

  // ---------- 6. industries become two marquees going opposite ways ----------
  const inds = $(".inds");
  if (inds) {
    const items = inds.innerHTML;
    inds.outerHTML = `<div class="marquee" aria-label="Industries we serve">
      <div class="track">${items}${items}</div>
      <div class="track rev">${items}${items}</div></div>`;
  }

  // ---------- 7. how-it-works line draws in ----------
  const steps = $(".steps");
  if (steps) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { steps.classList.add("drawn"); o.disconnect(); } }, { threshold: 0.35 }).observe(steps);

  if (!fine || reduce) return;

  // ---------- 8. spotlight glow on cards ----------
  $$(".agent, .plan, .pain, .steps li, .why-grid > div").forEach((el) => {
    el.classList.add("spot");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // ---------- 9. 3D tilt on the call card ----------
  const card = $(".callcard"), vis = $(".hero-visual");
  if (card) {
    vis.addEventListener("pointermove", (e) => {
      const r = vis.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
    });
    vis.addEventListener("pointerleave", () => (card.style.transform = ""));
  }

  // ---------- 10. magnetic buttons ----------
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
})();
