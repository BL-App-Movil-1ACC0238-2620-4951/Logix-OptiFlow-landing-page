/* OptiFlow · animaciones extra.
   Las animaciones se repiten cada vez que una sección entra en pantalla,
   tanto al bajar como al subir. Se apagan solo si el usuario pidió reducir movimiento. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window) || !("MutationObserver" in window)) return;

  var root = document.documentElement;
  root.classList.add("js-anim");

  /* Dirección de entrada: Misión/Visión desde los lados, bloques grandes con zoom */
  [[".split .card:nth-child(1)", "left"], [".split .card:nth-child(2)", "right"],
   [".banner", "scale"], [".cta", "scale"]].forEach(function (d) {
    document.querySelectorAll(d[0]).forEach(function (el) { el.setAttribute("data-dir", d[1]); });
  });

  /* Cascada: retardo escalonado por posición dentro de cada grupo */
  var step = innerWidth < 768 ? 50 : 90;
  [".stats > .reveal", ".grid-3 > .reveal", ".plans > .reveal", ".team-top > .reveal",
   ".team-bottom > .reveal", ".review"].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.dataset.delay = Math.min(i, 5) * step;
      el.style.transitionDelay = el.dataset.delay + "ms";
    });
  });

  /* Anillos y contador de cifras: se vuelven a dibujar cada vez */
  var LEN = 2 * Math.PI * 42;
  function ring(stat, on) {
    var c = stat.querySelector(".value");
    if (!c) return;
    var p = Number(stat.style.getPropertyValue("--p") || 0);
    c.style.strokeDasharray = String(LEN);
    c.style.strokeDashoffset = String(on ? LEN - (LEN * p) / 100 : LEN);
  }
  function count(stat, on) {
    var strong = stat.querySelector(".ring strong");
    if (!strong || !strong.firstChild || strong.firstChild.nodeType !== 3) return;
    var node = strong.firstChild;
    if (!stat._orig) stat._orig = node.nodeValue;
    var run = (stat._run = (stat._run || 0) + 1);
    if (!on) { node.nodeValue = stat._orig; return; }
    var m = stat._orig.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return;
    var target = parseFloat(m[1].replace(",", ".")), pre = stat._orig.slice(0, m.index),
        suf = stat._orig.slice(m.index + m[1].length), t0 = null, dur = 1200;
    (function frame(t) {
      if (run !== stat._run) return;
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = pre + Math.round(target * e) + suf;
      if (p < 1) requestAnimationFrame(frame); else node.nodeValue = stat._orig;
    })(performance.now());
  }
  var statWatch = new MutationObserver(function (list) {
    list.forEach(function (m) {
      var el = m.target, on = el.classList.contains("is-in");
      if (on === !!el._on) return;
      el._on = on;
      ring(el, on);
      count(el, on);
    });
  });
  document.querySelectorAll(".stat").forEach(function (el) {
    statWatch.observe(el, { attributes: true, attributeFilter: ["class"] });
  });

  /* Entrar / salir de pantalla */
  function play(el) {
    el.classList.add("is-visible");
    if (el.classList.contains("stat")) el.classList.add("is-in");
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.style.transitionDelay = "";
      el.classList.add("revealed");
    }, 1000);
  }
  function stop(el) {
    clearTimeout(el._t);
    el.classList.remove("is-visible", "is-in", "revealed");
    el.style.transitionDelay = el.dataset.delay ? el.dataset.delay + "ms" : "";
  }

  function start() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio >= 0.16) play(e.target);
        else if (!e.isIntersecting) stop(e.target);
      });
    }, { threshold: [0, 0.16], rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* Espera a que termine la pantalla de inicio */
  if (document.body.classList.contains("is-intro")) {
    var w = new MutationObserver(function () {
      if (!document.body.classList.contains("is-intro")) { w.disconnect(); start(); }
    });
    w.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  } else {
    start();
  }
})();
