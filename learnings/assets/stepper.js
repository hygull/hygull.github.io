/* Step-through diagrams.
   A page registers a diagram as data:  Stepper.register("name", { title, size: [w, h], steps: [ ... ] })
   and places  <figure class="stepper" data-diagram="name"><figcaption>...</figcaption></figure>.
   Each step is { title, why, code, draw(pen) }. draw() rebuilds the SVG for that step with the Pen helpers,
   so adding a step is one object. Messages that travel are drawn with pen.fly(); with
   prefers-reduced-motion they become a static envelope instead. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var registry = {};
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  function el(tag, attrs, text) {
    var node = document.createElementNS(NS, tag);
    for (var key in attrs || {}) {
      if (attrs[key] !== undefined && attrs[key] !== null) node.setAttribute(key, attrs[key]);
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function Pen(svg) {
    this.svg = svg;
    this.still = !!(reduced && reduced.matches);
    this.dur = 2.6;
  }

  Pen.prototype.add = function (tag, attrs, text) {
    return this.svg.appendChild(el(tag, attrs, text));
  };

  // text: opt.cls is any of "mono small muted hot bad ok head"; opt.anchor is start | middle | end
  Pen.prototype.text = function (x, y, str, opt) {
    opt = opt || {};
    return this.add("text", {
      x: x, y: y, "text-anchor": opt.anchor || "middle", "dominant-baseline": "middle",
      "class": (opt.cls || "") + (opt.dim ? " st-dim" : "")
    }, str);
  };

  // a labelled rectangle. opt: cls ("hot ok bad dashed fill-hot fill-mute"), sub (second line), dim, rx, textCls
  Pen.prototype.box = function (x, y, w, h, label, opt) {
    opt = opt || {};
    var g = this.add("g", { "class": opt.dim ? "st-dim" : "" });
    g.appendChild(el("rect", { x: x, y: y, width: w, height: h, rx: opt.rx === undefined ? 6 : opt.rx, "class": "st-box " + (opt.cls || "") }));
    if (label) {
      var cy = y + h / 2 + (opt.sub ? -8 : 0);
      g.appendChild(el("text", { x: x + w / 2, y: cy, "text-anchor": "middle", "dominant-baseline": "middle", "class": opt.textCls || "" }, label));
    }
    if (opt.sub) {
      g.appendChild(el("text", { x: x + w / 2, y: y + h / 2 + 9, "text-anchor": "middle", "dominant-baseline": "middle", "class": "small " + (opt.subCls || "muted") }, opt.sub));
    }
    return g;
  };

  // a pill: the "pipe" or a channel
  Pen.prototype.pill = function (x, y, w, h, label, opt) {
    opt = opt || {};
    opt.rx = h / 2;
    opt.textCls = opt.textCls || "mono";
    return this.box(x, y, w, h, label, opt);
  };

  // a path. opt: cls ("hot bad ok dashed faint"), arrow (true), dim
  Pen.prototype.line = function (d, opt) {
    opt = opt || {};
    var cls = "st-line " + (opt.cls || "") + (opt.dim ? " st-dim" : "");
    var path = this.add("path", { d: d, "class": cls });
    if (opt.arrow) {
      var len = path.getTotalLength();
      var tip = path.getPointAtLength(len);
      var back = path.getPointAtLength(Math.max(0, len - 9));
      var angle = Math.atan2(tip.y - back.y, tip.x - back.x) * 180 / Math.PI;
      var tone = /hot/.test(cls) ? " hot" : /bad/.test(cls) ? " bad" : /\bok\b/.test(cls) ? " ok" : "";
      this.add("path", {
        d: "M0 0 L-9 -4.5 L-9 4.5 Z", "class": "st-arrowhead" + tone + (opt.dim ? " st-dim" : ""),
        transform: "translate(" + tip.x + " " + tip.y + ") rotate(" + angle + ")"
      });
    }
    return path;
  };

  Pen.prototype.cross = function (x, y, r) {
    r = r || 8;
    this.add("path", { d: "M" + (x - r) + " " + (y - r) + " L" + (x + r) + " " + (y + r) + " M" + (x + r) + " " + (y - r) + " L" + (x - r) + " " + (y + r), "class": "st-cross" });
  };

  function envelope() {
    var g = el("g", { "class": "st-env" });
    g.appendChild(el("rect", { x: -11, y: -7.5, width: 22, height: 15, rx: 2 }));
    g.appendChild(el("polyline", { points: "-11,-7.5 0,2 11,-7.5" }));
    return g;
  }

  function fix(n) { return Math.max(0, Math.min(1, n)).toFixed(3); }

  // An envelope that travels along path d between fractions t0 and t1 of the shared loop.
  // opt.hold: stay visible at the end until this fraction (default t1). opt.still: where to draw it (0..1)
  // when motion is reduced; false = do not draw.
  Pen.prototype.fly = function (d, t0, t1, opt) {
    opt = opt || {};
    var env = envelope();
    if (this.still) {
      if (opt.still === false) return null;
      var probe = el("path", { d: d });
      this.svg.appendChild(probe);
      var p = probe.getPointAtLength(probe.getTotalLength() * (opt.still === undefined ? 0.5 : opt.still));
      this.svg.removeChild(probe);
      env.setAttribute("transform", "translate(" + p.x + " " + p.y + ")");
      this.svg.appendChild(env);
      return env;
    }
    var hold = opt.hold === undefined ? t1 : opt.hold;
    var e = 0.02;
    var dur = this.dur + "s";
    env.setAttribute("opacity", "0");
    env.appendChild(el("animateMotion", {
      path: d, dur: dur, repeatCount: "indefinite", calcMode: "linear",
      keyPoints: "0;0;1;1", keyTimes: "0;" + fix(t0) + ";" + fix(t1) + ";1"
    }));
    env.appendChild(el("animate", {
      attributeName: "opacity", dur: dur, repeatCount: "indefinite",
      values: "0;0;1;1;0;0",
      keyTimes: ["0", fix(t0), fix(t0 + e), fix(hold - e), fix(hold), "1"].join(";")
    }));
    this.svg.appendChild(env);
    return env;
  };

  // Something that fades in for part of the loop (a result mark at the end of a flight)
  Pen.prototype.blink = function (node, t0, t1) {
    if (this.still) return node;
    var e = 0.02;
    node.setAttribute("opacity", "0");
    node.appendChild(el("animate", {
      attributeName: "opacity", dur: this.dur + "s", repeatCount: "indefinite",
      values: "0;0;1;1;0;0", keyTimes: ["0", fix(t0), fix(t0 + e), fix(t1 - e), fix(t1), "1"].join(";")
    }));
    return node;
  };

  function build(figure, spec) {
    var caption = figure.querySelector("figcaption");
    figure.textContent = "";
    figure.tabIndex = 0;
    figure.setAttribute("role", "group");
    figure.setAttribute("aria-label", spec.title + ": step-through diagram");

    function html(tag, cls, text) {
      var node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    var head = html("div", "st-head");
    head.appendChild(html("span", "st-name", spec.title));
    var count = head.appendChild(html("span", "st-count"));
    var rail = html("ol", "st-rail");
    var canvas = html("div", "st-canvas");
    var svg = el("svg", { viewBox: "0 0 " + spec.size[0] + " " + spec.size[1], role: "img" });
    canvas.appendChild(svg);
    var title = html("h4", "st-title");
    var why = html("p", "st-why");
    var code = html("pre", "st-code");
    var nav = html("div", "st-nav");
    var prev = html("button", "btn st-prev", "Previous");
    var next = html("button", "btn st-next", "Next");
    prev.type = next.type = "button";
    nav.appendChild(prev);
    nav.appendChild(next);
    nav.appendChild(html("span", "st-hint", "or focus the diagram and use the ← → keys"));

    var buttons = spec.steps.map(function (step, i) {
      var li = document.createElement("li");
      var b = html("button", "", String(i + 1));
      b.type = "button";
      b.setAttribute("aria-label", "Step " + (i + 1) + ": " + step.title);
      b.addEventListener("click", function () { show(i); });
      li.appendChild(b);
      rail.appendChild(li);
      return b;
    });

    [head, rail, canvas, title, why, code, nav].forEach(function (n) { figure.appendChild(n); });
    if (caption) figure.appendChild(caption);

    var current = 0;
    function show(i) {
      current = Math.max(0, Math.min(spec.steps.length - 1, i));
      var step = spec.steps[current];
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      step.draw(new Pen(svg));
      svg.setAttribute("aria-label", step.title);
      buttons.forEach(function (b, n) {
        b.className = n < current ? "done" : "";
        if (n === current) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      count.textContent = "Step " + (current + 1) + " of " + spec.steps.length;
      title.textContent = (current + 1) + ". " + step.title;
      why.textContent = step.why;
      code.textContent = step.code || "";
      code.hidden = !step.code;
      prev.disabled = current === 0;
      next.disabled = current === spec.steps.length - 1;
    }
    prev.addEventListener("click", function () { show(current - 1); });
    next.addEventListener("click", function () { show(current + 1); });
    figure.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { show(current + 1); event.preventDefault(); }
      if (event.key === "ArrowLeft") { show(current - 1); event.preventDefault(); }
    });
    if (reduced && reduced.addEventListener) reduced.addEventListener("change", function () { show(current); });
    show(0);
    figure.stepper = { show: show, count: spec.steps.length };
  }

  function mount() {
    var figures = document.querySelectorAll("figure.stepper[data-diagram]");
    for (var i = 0; i < figures.length; i++) {
      var spec = registry[figures[i].getAttribute("data-diagram")];
      if (spec && !figures[i].stepper) build(figures[i], spec);
    }
  }

  window.Stepper = {
    register: function (name, spec) { registry[name] = spec; },
    mount: mount
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else setTimeout(mount, 0);
})();
