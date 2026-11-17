(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "learnings-theme";
  var LANGS = { tsx: "typescript", ts: "typescript", js: "javascript", bash: "bash", css: "css", json: "json", html: "xml", text: null };
  var LABELS = { bash: "Terminal", text: "Files" };

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
