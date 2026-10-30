/* Coming soon page: countdown, rotating phone screens, live preview from the form, sticky button. */
(function () {
  "use strict";
  var info = document.getElementById("soon-launch");
  var designs = JSON.parse((document.getElementById("soon-designs") || {}).textContent || "[]");
  if (!info) return;
  var STATIC = info.dataset.static || "/static/";
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* countdown (every [data-countdown] block); at zero the site has launched */
  var end = new Date(info.dataset.launch).getTime();
  var boxes = document.querySelectorAll("[data-countdown]");
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function tick() {
    var left = Math.max(0, end - Date.now()), s = Math.floor(left / 1000);
    var parts = { d: Math.floor(s / 86400), h: pad(Math.floor(s % 86400 / 3600)), m: pad(Math.floor(s % 3600 / 60)), s: pad(s % 60) };
    boxes.forEach(function (box) {
      Object.keys(parts).forEach(function (k) { var el = box.querySelector('[data-unit="' + k + '"]'); if (el) el.textContent = parts[k]; });
    });
    if (left === 0) { clearInterval(timer); setTimeout(function () { location.href = "/"; }, 1500); }
  }
  var timer = setInterval(tick, 1000);
  tick();

  /* hero phones: cross-fade through the designs, each phone on its own offset */
  var screens = document.querySelectorAll("[data-rotate]");
  if (designs.length > 3 && !calm) {
    var step = 0;
    setInterval(function () {
      step++;
      screens.forEach(function (screen, i) {
        var imgs = screen.querySelectorAll("img"), shown = imgs[0].classList.contains("is-hidden") ? imgs[1] : imgs[0];
        var next = shown === imgs[0] ? imgs[1] : imgs[0];
        var d = designs[(step * 3 + i) % designs.length];
        next.onload = function () { next.classList.remove("is-hidden"); shown.classList.add("is-hidden"); };
        next.src = STATIC + d.img;
      });
    }, 3200);
  }

  /* live preview: the phone shows the business name, type and city typed in the form */
  var byKey = {};
  designs.forEach(function (d) { byKey[d.key] = d; });
  function pv(name) { return document.querySelector('[data-pv="' + name + '"]'); }
  var nameIn = document.getElementById("id_business_name"), catIn = document.getElementById("id_business_category"),
      cityIn = document.getElementById("id_city");
  function slug(s) { return s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }
  function initials(s) {
    var w = s.trim().split(/\s+/).filter(Boolean);
    return ((w[0] || "Y").charAt(0) + (w[1] || w[0] || "B").charAt(w[1] ? 0 : 1)).toUpperCase();
  }
  function render() {
    var name = (nameIn && nameIn.value.trim()) || "Your Business Name";
    pv("name").textContent = name;
    pv("name2").textContent = name;
    pv("mark").textContent = initials(name);
    pv("slug").textContent = slug(nameIn && nameIn.value.trim() ? name : "") || "your-business";
    pv("city").textContent = (cityIn && cityIn.value.trim()) || "Your city";
    var d = catIn && byKey[catIn.value];
    if (d) {
      pv("type").textContent = d.title;
      var img = pv("img"), src = STATIC + d.img;
      if (img.getAttribute("src") !== src) { img.src = src; tiles(d); }
    }
  }
  function tiles(d) {   /* real photos from that design's sample site */
    document.querySelectorAll('[data-pv="tile"]').forEach(function (t, i) {
      var url = (d.photos || [])[i];
      t.style.backgroundImage = url ? "url('" + url + "')" : "";
    });
  }
  if (pv("name")) {
    tiles(designs[0] || {});
    [nameIn, catIn, cityIn].forEach(function (el) { if (el) { el.addEventListener("input", render); el.addEventListener("change", render); } });
    render();
  }

  /* sticky "Claim" button on phones: shown after the hero, hidden while the form is on screen */
  var sticky = document.querySelector("[data-sticky]"), hero = document.getElementById("top"), join = document.getElementById("join");
  if (sticky && hero && join && "IntersectionObserver" in window) {
    var heroOut = false, joinIn = false;
    function upd() { sticky.classList.toggle("is-on", heroOut && !joinIn); }
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(function (e) { joinIn = e[0].isIntersecting; upd(); }, { threshold: 0.15 }).observe(join);
  }

  /* join popup: full screen, opens 5 s after load (straight away when its form came back with errors).
     It opens on every page load; it never opens over someone typing in the page form. */
  var jp = document.getElementById("join-popup");
  if (jp) {
    var lastFocus = null;
    var openJp = function () {
      if (!jp.hidden) return;
      lastFocus = document.activeElement;
      jp.hidden = false;
      document.body.classList.add("jp-lock");
      requestAnimationFrame(function () { jp.classList.add("is-in"); });
      var first = jp.querySelector(".is-invalid") || jp.querySelector("input:not([type=hidden]):not([tabindex='-1'])");
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, calm ? 0 : 350);
    };
    var closeJp = function () {
      jp.classList.remove("is-in");
      document.body.classList.remove("jp-lock");
      setTimeout(function () { jp.hidden = true; }, calm ? 0 : 350);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    jp.querySelectorAll("[data-jp-close]").forEach(function (b) { b.addEventListener("click", closeJp); });
    jp.addEventListener("click", function (e) { if (e.target === jp) closeJp(); });
    document.addEventListener("keydown", function (e) {
      if (jp.hidden) return;
      if (e.key === "Escape") closeJp();
      if (e.key === "Tab") {      /* keep focus inside the popup */
        var f = jp.querySelectorAll("button, a[href], input:not([type=hidden]):not([tabindex='-1']), select");
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    var pageForm = join && join.querySelector("form");
    if (jp.dataset.open === "now") openJp();
    else if (jp.dataset.open !== "off") setTimeout(function () {
      if (pageForm && pageForm.contains(document.activeElement)) return;
      openJp();
    }, parseInt(jp.dataset.open, 10) || 5000);
  }
})();
