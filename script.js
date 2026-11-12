/* =========================================================
   Sy System — interactions
   Everything is driven by IntersectionObserver + a single
   rAF-throttled scroll/pointer handler. No libraries.
   ========================================================= */
(() => {
  "use strict";
  const PLAY = "https://play.google.com/store/apps/details?id=";
  const ICON = "https://play-lh.googleusercontent.com/";

  // ---- Edit this list to add / remove apps ----
  // tone: sun | coral | sage | blue | pink | plum      size: big | wide | (blank)
  const APPS = [
    { name: "Go Programming App & Compiler", id: "org.quarksgo.go_ide", type: "tool", tone: "sun", size: "big",
      desc: "A real Go compiler, Bash shell and package manager — serious dev power on Android.",
      icon: "LtkwyWam17voe7zKHwvipwGejjBP345QqnmJ8FbU4mBakah4UHXDziq1KK2c56b58Q8ujuNJbZg9YC460S1tZw" },
    { name: "Umbrella: Offline AI Chat", id: "com.quarks_umbrella.umbrella_ai", type: "tool", tone: "blue",
      desc: "Private AI chat that runs fully on your device.",
      icon: "wmHkQ20r2_bR0Njp-9SeTJOHFMuFTnvykoRBxv878bk_9XRbK4BKsQg7Uv0KHt7-lDMchRtPyszxSWMugbLO3w" },
    { name: "Immersive Chess PRO", id: "com.syc.chess", type: "game", tone: "coral",
      desc: "Deep, immersive chess. Plan, strike, conquer.",
      icon: "lpyTtEDJzWc-HxqFeJVUDg9tmdRTjaFQijI9w2ll-RPtVNk0HH4svJhrdJXrHMyJ-oQurlckkkvUPyhc-tZR5Q" },
    { name: "Arduino Simulator", id: "com.sytk.tinkerkit", type: "tool", tone: "sage",
      desc: "Build and simulate Arduino circuits with sensors.",
      icon: "TNzArj1BOe7pKKVqAZv1GATaD-Is4tUFc9FsqReOY2_RWF0rLAHzak36yltlxUKdMzb4kzZDP-7zPq7llQ38eGU" },
    { name: "Arrow Puzzle Escape PRO", id: "com.quarksarrow.arrow_puzzle", type: "game", tone: "pink",
      desc: "Clear the path, one arrow at a time.",
      icon: "M5qOaPY06JJWYkNzv9ZlZcHoQDJJFN5Z2uKwHBHOn5wetY6cdugrIierslWNneWi9BekITZM35ZZv2i94SB5YQ" },
    { name: "AI Voice Generator & Caption", id: "com.syvca.video_caption_adder", type: "tool", tone: "plum", size: "wide",
      desc: "Generate natural AI voiceovers and add captions to your videos in a few taps.",
      icon: "sHQ79eoaeQo1PrMWoC5Jk8OF4-xhkIcSZVBsjotULNM8OHgYBMD-irFbj3dii3sdXa2Ry0SV8pQVYJ6dTT9o2g" },
    { name: "Logic Simulator", id: "com.logic.logicsimulator", type: "tool", tone: "sun",
      desc: "Design and test digital logic circuits.",
      icon: "NhgEgkJ89H_2Dq_AfmXWc6V3lnXGzund86aTeaD9NP12Kuqs2VjgHPLEJAmMX9LlF4aG1IOxlRLubcFeN1_2Vg" },
    { name: "WireGuard V2Ray VPN & SSH", id: "org.quarksvpn.vpn_tunnel", type: "tool", tone: "coral",
      desc: "Fast, secure tunnels — WireGuard, V2Ray, SSH.",
      icon: "tk6E5ML1qiXdbaUyUBo1Cz8xRe7mJmetiIu_PsdBZC7Z8eL-dMBre3m1j6Mh6-9hcIQnpLOVnLs7r7hVmfFJ" },
    { name: "Budget Auto Tracker", id: "com.quarks.budgetautotrack", type: "tool", tone: "sage", size: "wide",
      desc: "Track your spending automatically and stay calmly on budget, month after month.",
      icon: "ZMH37vyjdiYL5RhkYBIhv_kmXSGYS8WsJBoJVwYju9hXG0W2lFSrpeoO_X2XVh7nsBosgka67hD51kmqM1M7sBo" },
    { name: "Guess It: Color Match", id: "com.quarkscg.colorguess", type: "game", tone: "blue", size: "wide",
      desc: "Trust your eye. Match colours with speed and precision — a little game that's hard to put down.",
      icon: "D9c1wtK1O8tvpBHGZpy0PP2tyefywVFAkL47xhUDbs4HS6CujBtGde6HFUIGcXGafBGl-3mE3fYAWyjVo22Haw" },
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  $("#year").textContent = `${new Date().getFullYear()} Sy System`;

  /* ---------- Marquee (content duplicated once for a seamless loop) ---------- */
  const words = ["Tool apps", "Games", "Simulators", "Offline AI", "Compilers", "Puzzles", "Made with care"];
  const run = words.map(w => `${w} <b>✺</b>`).join(" ");
  $("#track").innerHTML = `<span>${run}</span><span>${run}</span>`;

  /* ---------- Bento tiles ---------- */
  const bento = $("#bento");
  bento.innerHTML = APPS.map((a, i) => `
    <article class="tile tone-${a.tone} ${a.size || ""}" data-type="${a.type}">
      <div class="tile-top"><span class="n">${String(i + 1).padStart(2, "0")}</span><span>${a.type === "game" ? "Game" : "Tool"}</span></div>
      <img src="${ICON}${a.icon}=s${a.size === "big" ? 224 : 144}" alt="" width="72" height="72" loading="lazy" decoding="async">
      <h3>${esc(a.name)}</h3>
      <p>${esc(a.desc)}</p>
      <span class="go">Google Play <i aria-hidden="true">↗</i></span>
      <a class="tile-link" href="${PLAY}${a.id}" target="_blank" rel="noopener" aria-label="${esc(a.name)} on Google Play"></a>
    </article>`).join("");

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));
  $$(".tile").forEach((el, i) => { el.style.setProperty("--d", `${(i % 4) * 0.06}s`); io.observe(el); });

  /* ---------- Count-up figures ---------- */
  const cio = new IntersectionObserver(es => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      cio.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = reduce ? 1 : 1300;
      const step = t => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* ---------- Statement: split into words for scroll-lit reading ---------- */
  const st = $("#statement");
  const wrap = (text, em) => text.split(/(\s+)/).map(t => /^\s+$/.test(t) || !t ? t : `<span class="w${em ? " em" : ""}">${t}</span>`).join("");
  st.innerHTML = [...st.childNodes].map(n => n.nodeType === 3 ? wrap(n.textContent, false) : wrap(n.textContent, true)).join("");
  const stWords = $$(".w", st);
  let lit = -1;
  const updateStatement = vh => {
    const r = st.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = Math.min(Math.max((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0), 1);
    const n = reduce ? stWords.length : Math.round(p * stWords.length);
    if (n === lit) return;
    for (let i = Math.min(n, lit); i < Math.max(n, lit); i++) if (i >= 0) stWords[i].classList.toggle("lit", i < n);
    lit = n;
  };

  /* ---------- Collage parallax (pointer + scroll), one rAF ---------- */
  const collage = $("#collage");
  let heroVisible = true, px = 0, py = 0, tx = 0, ty = 0, ticking = false, settling = false;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; collage.classList.toggle("paused", !heroVisible); }).observe(collage);

  const nav = $("#nav");
  const frame = () => {
    ticking = false;
    const vh = innerHeight, sy = scrollY;
    nav.classList.toggle("solid", sy > 20);
    updateStatement(vh);
    if (heroVisible && !reduce) {
      px += (tx - px) * 0.08; py += (ty - py) * 0.08;
      collage.style.setProperty("--px", px.toFixed(3));
      collage.style.setProperty("--py", py.toFixed(3));
      collage.style.setProperty("--sy", Math.round(sy));
      settling = Math.abs(tx - px) > 0.002 || Math.abs(ty - py) > 0.002;
      if (settling) request();
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request, { passive: true });
  if (fine) addEventListener("pointermove", e => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; request(); }, { passive: true });
  request();

  /* ---------- Pause marquee & CTA art off-screen ---------- */
  const pauseIO = new IntersectionObserver(es => { for (const e of es) e.target.classList.toggle("paused", !e.isIntersecting); });
  [$(".marquee"), $(".panel")].forEach(el => pauseIO.observe(el));

  /* ---------- Filter chips ---------- */
  $$(".chip").forEach(chip => chip.addEventListener("click", () => {
    $$(".chip").forEach(c => { const on = c === chip; c.classList.toggle("on", on); c.setAttribute("aria-selected", on); });
    const f = chip.dataset.f;
    bento.classList.toggle("filtered", f !== "all");
    let n = 0;
    $$(".tile").forEach(t => {
      const show = f === "all" || t.dataset.type === f;
      t.classList.toggle("hide", !show);
      if (show) { t.style.setProperty("--d", `${(n++ % 6) * 0.05}s`); t.classList.remove("in"); void t.offsetWidth; t.classList.add("in"); }
    });
  }));

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger"), links = $("#links");
  const setMenu = open => {
    links.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
})();
