(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "learnings-theme";
  var LANGS = { py: "python", tsx: "typescript", ts: "typescript", js: "javascript", bash: "bash", css: "css", json: "json", html: "xml", text: null };
  var LABELS = { bash: "Terminal", text: "Files", py: "Python" };

  function readStore(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked: theme just will not persist */ }
  }

  /* Theme toggle */
  var saved = readStore(THEME_KEY);
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  function isDark() {
    var forced = root.getAttribute("data-theme");
    if (forced) return forced === "dark";
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  var themeBtn = document.getElementById("theme");
  function labelTheme() {
    if (themeBtn) themeBtn.textContent = isDark() ? "Light mode" : "Dark mode";
  }
  if (themeBtn) {
    labelTheme();
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      writeStore(THEME_KEY, next);
      labelTheme();
      drawDiagrams();
    });
  }

  /* Diagrams: figure.diagram > script[type="text/x-mermaid"]. Mermaid is loaded only on pages that have one,
     takes its colours from the page's CSS variables, and is redrawn when the theme changes. */
  var MERMAID_URL = "https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.min.js";
  var diagramSources = Array.prototype.slice.call(document.querySelectorAll('figure.diagram > script[type="text/x-mermaid"]'));
  var diagrams = diagramSources.map(function (src) {
    var canvas = document.createElement("div");
    canvas.className = "diagram-canvas";
    src.parentNode.insertBefore(canvas, src);
    return { figure: src.parentNode, canvas: canvas, text: src.textContent.replace(/^\s*\n/, "").replace(/\s+$/, "") };
  });
  var mermaidState = "idle";   // idle | loading | ready | failed
  var drawCount = 0;
  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }
  function showSource(d, message) {
    var pre = document.createElement("pre");
    pre.textContent = d.text;
    d.canvas.textContent = "";
    d.canvas.appendChild(pre);
    d.figure.setAttribute("data-error", message);
  }
  function renderDiagrams() {
    var m = window.mermaid;
    m.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: cssVar("--font-body"),
      flowchart: { curve: "basis", padding: 12, nodeSpacing: 40, rankSpacing: 48 },
      sequence: { mirrorActors: false, showSequenceNumbers: false },
      themeVariables: {
        darkMode: isDark(),
        background: cssVar("--surface"),
        primaryColor: cssVar("--note-bg"),
        primaryTextColor: cssVar("--fg"),
        primaryBorderColor: cssVar("--accent"),
        secondaryColor: cssVar("--bg"),
        secondaryTextColor: cssVar("--fg"),
        secondaryBorderColor: cssVar("--line"),
        tertiaryColor: cssVar("--bg"),
        tertiaryTextColor: cssVar("--fg"),
        tertiaryBorderColor: cssVar("--line"),
        lineColor: cssVar("--muted"),
        textColor: cssVar("--fg"),
        mainBkg: cssVar("--note-bg"),
        nodeBorder: cssVar("--accent"),
        clusterBkg: cssVar("--bg"),
        clusterBorder: cssVar("--line"),
        titleColor: cssVar("--fg"),
        edgeLabelBackground: cssVar("--surface"),
        actorBkg: cssVar("--note-bg"),
        actorBorder: cssVar("--accent"),
        actorTextColor: cssVar("--fg"),
        actorLineColor: cssVar("--line"),
        signalColor: cssVar("--muted"),
        signalTextColor: cssVar("--fg"),
        labelBoxBkgColor: cssVar("--note-bg"),
        labelBoxBorderColor: cssVar("--line"),
        labelTextColor: cssVar("--fg"),
        loopTextColor: cssVar("--fg"),
        noteBkgColor: cssVar("--bg"),
        noteBorderColor: cssVar("--line"),
        noteTextColor: cssVar("--fg"),
        activationBkgColor: cssVar("--bg"),
        activationBorderColor: cssVar("--accent"),
        classText: cssVar("--fg"),
        fontSize: "14px"
      }
    });
    diagrams.forEach(function (d, i) {
      drawCount += 1;
      m.render("diagram-" + i + "-" + drawCount, d.text).then(function (out) {
        d.canvas.innerHTML = out.svg;
        d.figure.removeAttribute("data-error");
      }, function (err) {
        showSource(d, String(err && err.message ? err.message : err).split("\n")[0]);
      });
    });
  }
  function drawDiagrams() {
    if (!diagrams.length) return;
    if (mermaidState === "ready") { renderDiagrams(); return; }
    if (mermaidState !== "idle") return;
    mermaidState = "loading";
    var tag = document.createElement("script");
    tag.src = MERMAID_URL;
    tag.onload = function () {
      mermaidState = "ready";
      /* Mermaid sizes boxes by measuring text, so the web font must be loaded first or labels get clipped */
      var fonts = document.fonts;
      var wait = fonts && fonts.load
        ? Promise.all([fonts.load('400 14px "Inter"'), fonts.load('600 14px "Inter"'), fonts.ready])
        : Promise.resolve();
      /* never wait on fonts for more than 1.5 s: a blocked or slow font request must not leave diagrams blank */
      var done = false;
      var go = function () { if (!done) { done = true; renderDiagrams(); } };
      /* if the timer won, the boxes were sized with the fallback font: draw once more when the real font arrives */
      wait.then(function () { if (done) renderDiagrams(); else go(); }, go);
      setTimeout(go, 1500);
    };
    tag.onerror = function () {
      mermaidState = "failed";
      diagrams.forEach(function (d) { showSource(d, "diagram library did not load"); });
    };
    document.head.appendChild(tag);
  }
  drawDiagrams();

  /* Back to top: a floating button that appears once the reader has scrolled about a screen down */
  var topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.className = "to-top";
  topBtn.setAttribute("aria-label", "Back to top");
  topBtn.textContent = "\u2191 Top";
  topBtn.hidden = true;
  document.body.appendChild(topBtn);
  topBtn.addEventListener("click", function () {
    window.scrollTo(0, 0);
    var first = document.querySelector(".brand");
    if (first) first.focus({ preventScroll: true });   // keyboard users continue from the top of the page
  });
  var topTicking = false;
  function syncTopBtn() {
    topTicking = false;
    topBtn.hidden = (window.pageYOffset || root.scrollTop) < 700;
  }
  window.addEventListener("scroll", function () {
    if (!topTicking) { topTicking = true; (window.requestAnimationFrame || setTimeout)(syncTopBtn); }
  }, { passive: true });
  syncTopBtn();

  /* Landing page sidebar: highlight the path the reader is currently in
     (the last group whose heading has passed a line 30% down the window) */
  var hubLinks = Array.prototype.slice.call(document.querySelectorAll("#hub-nav a"));
  var hubSections = hubLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  if (hubLinks.length) {
    var pathTicking = false;
    var syncPath = function () {
      pathTicking = false;
      var line = window.innerHeight * 0.3;
      var current = -1;
      hubSections.forEach(function (section, i) {
        if (section && section.getBoundingClientRect().top <= line) current = i;
      });
      hubLinks.forEach(function (a, i) { a.classList.toggle("active", i === current); });
    };
    window.addEventListener("scroll", function () {
      if (!pathTicking) { pathTicking = true; (window.requestAnimationFrame || setTimeout)(syncPath); }
    }, { passive: true });
    window.addEventListener("resize", syncPath);
    syncPath();
  }

  /* Hub layout switch: list, grid or cards, remembered per browser */
  var hub = document.getElementById("hub");
  var viewBtns = Array.prototype.slice.call(document.querySelectorAll("[data-set-view]"));
  if (hub && viewBtns.length) {
    var VIEW_KEY = "learnings-view";
    var setView = function (view) {
      if (view === "list") hub.removeAttribute("data-view"); else hub.setAttribute("data-view", view);
      viewBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-set-view") === view ? "true" : "false");
      });
    };
    var savedView = readStore(VIEW_KEY);
    var asked = /[?&]view=(list|grid|card)\b/.exec(location.search);   // index.html?view=grid links straight to a layout
    if (asked) savedView = asked[1];
    setView(savedView === "grid" || savedView === "card" ? savedView : "list");
    viewBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var view = b.getAttribute("data-set-view");
        setView(view);
        writeStore(VIEW_KEY, view);
      });
    });
  }

  /* Code blocks: <script type="text/plain" data-lang data-file> becomes a highlighted figure */
  function copyText(text, btn, codeEl) {
    function done() {
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = "Copy"; }, 1400);
    }
    function selectFallback() {
      var range = document.createRange();
      range.selectNodeContents(codeEl);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btn.textContent = "Selected, press copy";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, selectFallback);
    } else {
      selectFallback();
    }
  }

  var sources = document.querySelectorAll('script[type="text/plain"]');
  Array.prototype.forEach.call(sources, function (src) {
    var lang = src.getAttribute("data-lang") || "tsx";
    var text = src.textContent.replace(/^\s*\n/, "").replace(/\s+$/, "");
    var fig = document.createElement("figure");
    fig.className = "code";
    var cap = document.createElement("figcaption");
    var name = document.createElement("span");
    name.textContent = src.getAttribute("data-file") || LABELS[lang] || lang.toUpperCase();
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = "Copy";
    cap.appendChild(name);
    cap.appendChild(btn);
    var pre = document.createElement("pre");
    var code = document.createElement("code");
    code.textContent = text;
    var hl = LANGS[lang];
    if (hl && window.hljs) {
      code.className = "language-" + hl;
      try { window.hljs.highlightElement(code); } catch (e) { /* plain text is fine */ }
    }
    pre.appendChild(code);
    fig.appendChild(cap);
    fig.appendChild(pre);
    btn.addEventListener("click", function () { copyText(text, btn, code); });
    src.parentNode.replaceChild(fig, src);
  });

  /* Chapters: sidebar, prev/next, scroll spy, search */
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
  var toc = document.getElementById("toc");
  if (!toc || !chapters.length) return;

  var list = document.createElement("ol");
  var links = {};
  var items = [];
  chapters.forEach(function (ch, i) {
    var title = ch.querySelector("h2").textContent;
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + ch.id;
    a.textContent = title;
    li.appendChild(a);
    if (ch.classList.contains("part")) li.className = "toc-part";
    list.appendChild(li);
    links[ch.id] = a;
    items.push({ chapter: ch, li: li, text: ch.textContent.toLowerCase() });

    var pager = document.createElement("nav");
    pager.className = "pager";
    pager.setAttribute("aria-label", "Chapter navigation");
    if (i > 0) {
      var prev = document.createElement("a");
      prev.href = "#" + chapters[i - 1].id;
      prev.textContent = "< " + chapters[i - 1].querySelector("h2").textContent;
      pager.appendChild(prev);
    }
    if (i < chapters.length - 1) {
      var nx = document.createElement("a");
      nx.className = "nx";
      nx.href = "#" + chapters[i + 1].id;
      nx.textContent = chapters[i + 1].querySelector("h2").textContent + " >";
      pager.appendChild(nx);
    }
    ch.appendChild(pager);
  });
  toc.appendChild(list);
  var noMatch = document.createElement("p");
  noMatch.className = "no-match";
  noMatch.hidden = true;
  toc.appendChild(noMatch);

  function setActive(id) {
    Object.keys(links).forEach(function (key) {
      links[key].classList.toggle("active", key === id);
    });
  }
  setActive((location.hash || "").slice(1) in links ? location.hash.slice(1) : chapters[0].id);
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-15% 0px -75% 0px" });
    chapters.forEach(function (ch) { spy.observe(ch); });
  }

  var menuBtn = document.getElementById("menu");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  list.addEventListener("click", function (event) {
    if (event.target.tagName === "A") document.body.classList.remove("nav-open");
  });

  var search = document.getElementById("q");
  if (search) {
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var match = !q || item.text.indexOf(q) !== -1;
        item.chapter.hidden = !match;
        item.li.hidden = !match;
        if (match) shown += 1;
      });
      noMatch.hidden = shown > 0;
      noMatch.textContent = shown > 0 ? "" : 'No chapter mentions "' + search.value.trim() + '".';
    });
  }
})();
