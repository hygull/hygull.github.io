/* Step-through diagrams for redis-pubsub.html. Each diagram is a list of steps; see ../../assets/stepper.js. */
(function () {
  "use strict";
  var S = window.Stepper;
  if (!S) return;

  function curve(x1, y1, x2, y2) {
    var mx = (x1 + x2) / 2;
    return "M" + x1 + " " + y1 + " C" + mx + " " + y1 + " " + mx + " " + y2 + " " + x2 + " " + y2;
  }
  function drop(x1, y1, x2, y2) {            // a vertical S-curve
    var my = (y1 + y2) / 2;
    return "M" + x1 + " " + y1 + " C" + x1 + " " + my + " " + x2 + " " + my + " " + x2 + " " + y2;
  }

  /* ------------------------------------------------------------------ 1. the pipe */
  var SUB_Y = { 1: [105], 2: [62, 148], 3: [30, 105, 180] };

  function pipe(p, o) {
    var pubs = o.pubs, subs = o.subs || [], ys = SUB_Y[subs.length] || [];
    var inbound = null;
    pubs.forEach(function (pub) {
      var cy = pub.y + 22;
      var path = cy === 127 ? "M160 127 L230 127" : curve(160, cy, 230, 127);
      p.line(path, { cls: pub.idle ? "dashed" : pub.send ? "hot" : "", dim: pub.idle });
      p.box(20, pub.y, 140, 44, pub.label, { cls: pub.idle ? "dashed" : pub.send ? "hot" : "", dim: pub.idle, sub: pub.idle ? "idle" : pub.sub });
      if (pub.send) inbound = (cy === 127 ? "M160 127" : curve(160, cy, 230, 127)) + " L450 127";
      if (pub.note) p.text(cy === 127 ? 196 : 210, cy === 127 ? cy - 14 : cy + (cy > 127 ? 12 : -12), pub.note, { cls: "hot small" });
    });
    p.pill(230, 110, 220, 34, "news:sports", { cls: o.noPipe ? "dashed" : "fill-hot", dim: o.noPipe });
    subs.forEach(function (sub, i) {
      var cy = ys[i] + 22;
      p.line(curve(450, 127, 540, cy), { cls: sub.fresh ? "hot dashed" : "" });
      p.box(540, ys[i], 130, 44, sub.label, { cls: sub.fresh ? "hot" : "", sub: sub.sub });
      if (sub.fresh) p.text(495, cy + (cy > 127 ? 16 : -14), "plugs in", { cls: "hot small" });
    });
    if (o.caption) p.text(340, 176, o.caption, { cls: o.captionCls || "muted" });
    if (o.caption2) p.text(340, 196, o.caption2, { cls: "muted small" });
    if (o.flight === "deliver" && inbound) {
      p.fly(inbound, 0, 0.55, { still: 0.62 });
      subs.forEach(function (sub, i) { p.fly(curve(450, 127, 540, ys[i] + 22), 0.55, 0.97, { still: false }); });
    }
    if (o.flight === "drop" && inbound) {
      p.fly(inbound, 0, 0.55, { hold: 0.92, still: 0.9 });
      var mark = p.add("g", {});
      p.svg.appendChild(mark);
      var keep = p.svg;
      p.svg = mark; p.cross(472, 127); p.svg = keep;
      p.blink(mark, 0.5, 0.95);
    }
  }

  var ONE = [{ label: "Publisher", y: 105 }];
  var ALICE = { label: "Alice's app", sub: "SUBSCRIBE" };
  var BOB = { label: "Bob, redis-cli", sub: "SUBSCRIBE" };

  S.register("pipe", {
    title: "A channel is a pipe",
    size: [690, 250],
    steps: [
      {
        title: "Nobody subscribed: there is no pipe",
        why: "A channel is not created. It exists only while someone listens, so right now the name means nothing to Redis.",
        code: "> PUBSUB CHANNELS news:*\n(empty array)",
        draw: function (p) { pipe(p, { pubs: ONE, noPipe: true, caption: "no pipe: nobody subscribed" }); }
      },
      {
        title: "Alice's app subscribes",
        why: "The first SUBSCRIBE brings the channel into being. Her connection becomes an outlet at the end of the pipe.",
        code: "> SUBSCRIBE news:sports\n1) \"subscribe\"\n2) \"news:sports\"\n3) (integer) 1",
        draw: function (p) { pipe(p, { pubs: ONE, subs: [{ label: ALICE.label, sub: ALICE.sub, fresh: true }] }); }
      },
      {
        title: "Bob subscribes too",
        why: "A second connection, a second outlet. Redis keeps both in the list for this channel name.",
        code: "> PUBSUB NUMSUB news:sports\n1) \"news:sports\"\n2) (integer) 2",
        draw: function (p) { pipe(p, { pubs: ONE, subs: [ALICE, { label: BOB.label, sub: BOB.sub, fresh: true }] }); }
      },
      {
        title: "Publish: one message in, one copy per subscriber out",
        why: "The publisher sends once. Redis writes a copy down every open subscriber connection and returns how many it wrote.",
        code: "> PUBLISH news:sports \"goal!\"\n(integer) 2\n\neach subscriber receives:\n1) \"message\"\n2) \"news:sports\"\n3) \"goal!\"",
        draw: function (p) {
          pipe(p, { pubs: [{ label: "Publisher", y: 105, send: true, note: "→ 2" }], subs: [ALICE, BOB], flight: "deliver", caption: "1 message in → 2 copies out", captionCls: "hot" });
        }
      },
      {
        title: "Two app servers, one of them publishes",
        why: "Any connection may publish. The pipe and the copies are the same whichever server sent the message.",
        code: "server B> PUBLISH news:sports \"goal!\"\n(integer) 2",
        draw: function (p) {
          pipe(p, { pubs: [{ label: "App server A", y: 58, idle: true }, { label: "App server B", y: 152, send: true, note: "→ 2" }], subs: [ALICE, BOB], flight: "deliver", caption: "same pipe, same copies" });
        }
      },
      {
        title: "A pattern subscriber joins",
        why: "PSUBSCRIBE news:* matches this channel, so it gets a copy as well, marked pmessage with the pattern that matched.",
        code: "> PUBLISH news:sports \"goal!\"\n(integer) 3\n\nthe pattern subscriber receives:\n1) \"pmessage\"\n2) \"news:*\"\n3) \"news:sports\"\n4) \"goal!\"",
        draw: function (p) {
          pipe(p, { pubs: [{ label: "Publisher", y: 105, send: true, note: "→ 3" }], subs: [ALICE, BOB, { label: "Dashboard", sub: "PSUBSCRIBE news:*", fresh: true }], flight: "deliver" });
        }
      },
      {
        title: "Everyone unsubscribes: the message is dropped",
        why: "With the last outlet gone the pipe is gone. PUBLISH still succeeds, returns 0, and the message is stored nowhere.",
        code: "> PUBLISH news:sports \"goal!\"\n(integer) 0",
        draw: function (p) {
          pipe(p, { pubs: [{ label: "Publisher", y: 105, send: true, note: "→ 0" }], noPipe: true, flight: "drop", caption: "dropped → 0", captionCls: "bad", caption2: "in transit, never stored" });
        }
      }
    ]
  });

  /* ------------------------------------------------------------------ 2. routing by exact channel name */
  function routing(p, o) {
    o = o || {};
    p.box(20, 24, 170, 112, "", {});
    p.text(105, 41, "Server A", { cls: "head" });
    p.box(20, 160, 170, 74, "", {});
    p.text(105, 177, "Server B", { cls: "head" });
    var chips = [[36, 56, "job 41"], [36, 94, "job 42"], [36, 192, "job 43"]];
    chips.forEach(function (c, i) {
      var stopped = o.stopped && i === 1;
      p.box(c[0], c[1], 138, 30, stopped ? "job 42 stopped" : c[2], { cls: stopped ? "bad" : (o.hotChip === i ? "hot" : ""), textCls: stopped ? "bad" : "" });
    });
    p.box(270, 24, 240, 150, "", {});
    p.text(390, 41, "Redis: channel → connection", { cls: "small muted" });
    if (o.shared) {
      p.box(282, 96, 216, 28, "jobs:cancel → A, B", { cls: "hot fill-hot", textCls: "mono" });
      p.line(curve(190, 80, 282, 104), { cls: o.deliver ? "hot" : "" });
      p.line(curve(190, 197, 282, 116), { cls: o.deliver ? "hot" : "" });
    } else {
      [["job:41:cancel → A", 62], ["job:42:cancel → A", 96], ["job:43:cancel → B", 130]].forEach(function (r, i) {
        p.box(282, r[1], 216, 28, r[0], { cls: o.hotRow === i ? "hot fill-hot" : "", textCls: "mono" });
      });
      p.line(curve(174, 71, 282, 76), {});
      p.line(curve(174, 109, 282, 110), { cls: o.deliver ? "hot" : "" });
      p.line(curve(174, 207, 282, 144), {});
    }
    if (o.c) {
      p.box(540, 206, 120, 50, "Server C", { cls: o.c === "hot" ? "hot" : "" });
      p.text(600, 192, "cancel job 42", { cls: "small hot" });
      var up = "M540 226 C505 226 545 110 498 110";
      if (o.publish) { p.line(up, { cls: "hot", arrow: true }); p.fly(up, 0.05, 0.9, { still: 0.5 }); }
      if (o.returns) p.text(600, 272, o.returns, { cls: "small " + (o.shared ? "bad" : "ok") });
    }
    if (o.deliver && !o.shared) p.fly(curve(282, 110, 174, 109), 0.05, 0.9, { still: 0.5 });
    if (o.deliver && o.shared) {
      p.fly(curve(282, 104, 190, 80), 0.05, 0.9, { still: 0.5 });
      p.fly(curve(282, 116, 190, 197), 0.05, 0.9, { still: 0.5 });
    }
    if (o.note) p.text(390, 210, o.note, { cls: o.noteCls || "muted" });
  }

  S.register("routing", {
    title: "Routing by exact channel name",
    size: [690, 290],
    steps: [
      {
        title: "Three jobs, three channels",
        why: "Each running job subscribes to its own channel. Redis holds one table row per channel, pointing at the connection that asked.",
        code: "server A> SUBSCRIBE job:41:cancel\nserver A> SUBSCRIBE job:42:cancel\nserver B> SUBSCRIBE job:43:cancel",
        draw: function (p) { routing(p, {}); }
      },
      {
        title: "The cancel request lands on a third server",
        why: "The load balancer sent it to Server C, which is not running job 42 and does not know who is.",
        code: "POST /jobs/42/cancel   → handled by server C",
        draw: function (p) { routing(p, { c: "hot" }); }
      },
      {
        title: "Server C publishes to the job's channel",
        why: "It only needs the channel name, built from the job id. The matching row in the table lights up.",
        code: "server C> SET job:42:status cancelled EX 3600\nserver C> PUBLISH job:42:cancel 1",
        draw: function (p) { routing(p, { c: "hot", publish: true, hotRow: 1 }); }
      },
      {
        title: "Only that subscriber receives it",
        why: "Redis writes the message down the one connection in that row. Jobs 41 and 43 hear nothing.",
        code: "(integer) 1          ← PUBLISH returned 1 receiver",
        draw: function (p) { routing(p, { c: true, hotRow: 1, deliver: true, hotChip: 1, returns: "PUBLISH → 1" }); }
      },
      {
        title: "The job stops itself",
        why: "The code that owns job 42 gets the message and cancels its own task. Nothing had to be looked up or forwarded.",
        code: "job 42: cancelled, saving partial result",
        draw: function (p) { routing(p, { c: true, stopped: true }); }
      },
      {
        title: "Contrast: one shared channel",
        why: "With a single jobs:cancel channel every server receives every cancel and must search its own jobs for the id. More traffic, more code.",
        code: "server C> PUBLISH jobs:cancel 42\n(integer) 2          ← both servers must check \"is 42 mine?\"",
        draw: function (p) { routing(p, { c: "hot", publish: true, shared: true, deliver: true, returns: "PUBLISH → 2", note: "every server gets every message" }); }
      }
    ]
  });

  /* ------------------------------------------------------------------ 3. clients dial Redis */
  function dial(p, o) {
    p.box(30, 40, 170, 50, "Server A", { cls: o.a === "hot" ? "hot" : "", sub: o.aSub });
    p.box(430, 24, 230, 200, "", {});
    p.text(545, 44, "Redis :6379", { cls: "head" });
    p.text(545, 84, "channel → connections", { cls: "small muted" });
    if (o.row) p.box(446, 100, 198, 30, "job:42:cancel → A", { cls: o.row === "hot" ? "hot fill-hot" : "", textCls: "mono" });
    else p.box(446, 100, 198, 30, "(empty)", { cls: "dashed", textCls: "small muted" });
    p.line("M200 65 L430 65", { cls: o.connA === "hot" ? "hot" : "", arrow: true });
    p.text(315, 51, "opened by A", { cls: "small muted" });
    if (o.b) {
      p.box(30, 160, 170, 50, "Server B", { cls: o.b === "hot" ? "hot" : "", sub: o.bSub });
      p.line("M200 185 L430 185", { cls: o.connB === "hot" ? "hot" : "", arrow: true });
      p.text(315, 171, "opened by B", { cls: "small muted" });
    }
    if (o.fly === "a-in") p.fly("M200 65 L430 65", 0.05, 0.9, { still: 0.5 });
    if (o.fly === "b-in") p.fly("M200 185 L430 185", 0.05, 0.9, { still: 0.5 });
    if (o.fly === "a-back") p.fly("M430 65 L200 65", 0.05, 0.9, { still: 0.5 });
    if (o.note) p.text(315, 122, o.note, { cls: o.noteCls || "hot" });
  }

  S.register("dial", {
    title: "Clients dial Redis",
    size: [690, 250],
    steps: [
      {
        title: "Server A opens a connection",
        why: "The arrow shows who dialled. Redis listens on its port and accepts; it does not need A's address.",
        code: "server A: TCP connect to redis:6379",
        draw: function (p) { dial(p, { a: "hot", connA: "hot" }); }
      },
      {
        title: "A subscribes over that connection",
        why: "Redis adds a row to its in-memory table: this channel name, this open connection.",
        code: "server A> SUBSCRIBE job:42:cancel",
        draw: function (p) { dial(p, { a: true, aSub: "SUBSCRIBE", connA: "hot", fly: "a-in", row: "hot" }); }
      },
      {
        title: "Server B dials in and publishes",
        why: "B has its own connection. It names the channel and knows nothing about A.",
        code: "server B> PUBLISH job:42:cancel 1",
        draw: function (p) { dial(p, { a: true, aSub: "SUBSCRIBE", row: true, b: "hot", bSub: "PUBLISH", connB: "hot", fly: "b-in" }); }
      },
      {
        title: "Redis writes the message down A's open connection",
        why: "Delivery reuses the socket A opened earlier. That is why it works across servers, containers and pods with no service discovery.",
        code: "server A receives:\n1) \"message\"\n2) \"job:42:cancel\"\n3) \"1\"",
        draw: function (p) { dial(p, { a: "hot", aSub: "gets the message", row: "hot", b: true, bSub: "PUBLISH", connA: "hot", fly: "a-back", note: "Redis never dials a client" }); }
      }
    ]
  });

  /* ------------------------------------------------------------------ 4. radio vs notice board */
  function lanes(p, n) {
    p.text(20, 80, "Pub/Sub", { anchor: "start", cls: "head" });
    p.text(20, 190, "A key", { anchor: "start", cls: "head" });
    p.line("M110 80 L660 80", { cls: "faint" });
    p.line("M110 190 L660 190", { cls: "faint" });
    p.text(640, 236, "time →", { cls: "small muted" });
    function ev(step, x, y, label, cls) {
      if (n < step) return;
      p.box(x - 52, y - 40, 104, 26, label, { cls: n === step ? cls : "", textCls: "mono small" });
      p.line("M" + x + " " + (y - 14) + " L" + x + " " + y, { cls: n === step ? cls : "" });
    }
    ev(1, 180, 80, "PUBLISH", "bad");
    if (n >= 1) { p.cross(180, 80, 6); p.text(180, 102, "lost", { cls: n === 1 ? "bad" : "muted small" }); }
    ev(2, 180, 190, "SET status", "ok");
    if (n >= 2) { p.line("M180 190 L660 190", { cls: "ok" }); p.text(390, 208, "stays until deleted or expired", { cls: n === 2 ? "ok" : "muted small" }); }
    ev(3, 320, 80, "SUBSCRIBE", "hot");
    if (n >= 3) { p.line("M320 80 L660 80", { cls: "hot" }); p.text(320, 102, "hears nothing", { cls: n === 3 ? "hot" : "muted small" }); }
    ev(4, 460, 80, "PUBLISH", "ok");
    if (n >= 4) p.text(460, 102, "heard", { cls: n === 4 ? "ok" : "muted small" });
    ev(5, 600, 190, "GET status", "ok");
    if (n >= 5) p.text(600, 222, "\"cancelled\"", { cls: "ok mono" });
  }

  S.register("radio", {
    title: "Live radio vs a notice on a board",
    size: [690, 250],
    steps: [
      { title: "Publish while nobody listens", why: "Like speaking on the radio with every set switched off. The words are gone.", code: "> PUBLISH job:42:cancel 1\n(integer) 0", draw: function (p) { lanes(p, 1); } },
      { title: "Write a key at the same moment", why: "A key is a notice pinned to a board. It stays there whether or not anyone is looking.", code: "> SET job:42:status cancelled EX 3600\nOK", draw: function (p) { lanes(p, 2); } },
      { title: "A subscriber tunes in later", why: "It hears only what is said from now on. There is no replay of the earlier message.", code: "> SUBSCRIBE job:42:cancel\n1) \"subscribe\"\n2) \"job:42:cancel\"\n3) (integer) 1", draw: function (p) { lanes(p, 3); } },
      { title: "Publish again: now it is heard", why: "Same command, different outcome, because a listener exists this time.", code: "> PUBLISH job:42:cancel 1\n(integer) 1", draw: function (p) { lanes(p, 4); } },
      { title: "A late reader still finds the key", why: "Anyone can read the notice at any time. Nobody is told when it changes, which is the half that Pub/Sub supplies.", code: "> GET job:42:status\n\"cancelled\"", draw: function (p) { lanes(p, 5); } }
    ]
  });

  /* ------------------------------------------------------------------ 5. key-then-publish race and fix */
  var X = { P: 110, R: 345, S: 580 };
  var BAD = [
    { from: "P", to: "R", y: 86, label: "PUBLISH job:42:cancel" },
    { from: "R", to: "P", y: 122, label: "0 receivers", dashed: true, note: ["R", 146, "dropped", "bad"] },
    { from: "S", to: "R", y: 196, label: "SUBSCRIBE job:42:cancel", note: ["S", 224, "waits for ever", "bad"] }
  ];
  var FIX = [
    { from: "P", to: "R", y: 82, label: "SET job:42:status cancelled" },
    { from: "P", to: "R", y: 118, label: "PUBLISH job:42:cancel", note: ["R", 140, "0 receivers: fine", "muted"] },
    { from: "S", to: "R", y: 182, label: "SUBSCRIBE job:42:cancel" },
    { from: "S", to: "R", y: 218, label: "GET job:42:status", reply: [250, "\"cancelled\""], note: ["S", 276, "acts at once", "ok"] }
  ];

  function sequence(p, list, upto, heading, headingCls) {
    [["P", "Sender"], ["R", "Redis"], ["S", "Receiver"]].forEach(function (lane) {
      p.box(X[lane[0]] - 70, 14, 140, 30, lane[1], {});
      p.line("M" + X[lane[0]] + " 44 L" + X[lane[0]] + " 296", { cls: "faint dashed" });
    });
    p.text(20, 64, heading, { anchor: "start", cls: "small " + headingCls });
    list.forEach(function (m, i) {
      if (i > upto) return;
      var now = i === upto, x1 = X[m.from], x2 = X[m.to];
      p.line("M" + x1 + " " + m.y + " L" + x2 + " " + m.y, { cls: (now ? "hot" : "") + (m.dashed ? " dashed" : ""), arrow: true, dim: !now });
      p.text((x1 + x2) / 2, m.y - 10, m.label, { cls: "mono small" + (now ? " hot" : ""), dim: !now });
      if (m.reply) {
        p.line("M" + x2 + " " + m.reply[0] + " L" + x1 + " " + m.reply[0], { cls: (now ? "ok" : "") + " dashed", arrow: true, dim: !now });
        p.text((x1 + x2) / 2, m.reply[0] - 10, m.reply[1], { cls: "mono small" + (now ? " ok" : ""), dim: !now });
      }
      if (m.note) p.text(X[m.note[0]], m.note[1], m.note[2], { cls: "small " + m.note[3], dim: !now });
    });
  }

  function seqStep(list, i, heading, cls, title, why, code) {
    return { title: title, why: why, code: code, draw: function (p) { sequence(p, list, i, heading, cls); } };
  }

  S.register("race", {
    title: "The lost-message race, then the fix",
    size: [690, 304],
    steps: [
      seqStep(BAD, 0, "the race", "bad", "The sender publishes first", "The other side has not subscribed yet. It is a matter of milliseconds.", "> PUBLISH job:42:cancel 1"),
      seqStep(BAD, 1, "the race", "bad", "Redis has nobody to give it to", "No error, no log line. The only trace is the 0 that the sender probably ignores.", "(integer) 0"),
      seqStep(BAD, 2, "the race", "bad", "The receiver subscribes, too late", "Nothing will ever arrive. The job keeps running although it was cancelled.", "> SUBSCRIBE job:42:cancel\n... no message"),
      seqStep(FIX, 0, "the fix", "ok", "Fix, sender side: write the state first", "The key is the durable record of what happened.", "> SET job:42:status cancelled EX 3600\nOK"),
      seqStep(FIX, 1, "the fix", "ok", "Then publish", "It may reach nobody again. It no longer matters: the message is only a nudge.", "> PUBLISH job:42:cancel 1\n(integer) 0"),
      seqStep(FIX, 2, "the fix", "ok", "Fix, receiver side: subscribe first", "From this point on any new message will be delivered.", "> SUBSCRIBE job:42:cancel"),
      seqStep(FIX, 3, "the fix", "ok", "Then read the state", "Whatever happened before the subscribe is in the key. Earlier or later, the receiver finds out either way.", "> GET job:42:status\n\"cancelled\"")
    ]
  });

  /* ------------------------------------------------------------------ 6. fan-out vs queue */
  function fanq(p, o) {
    p.text(20, 22, "Pub/Sub channel", { anchor: "start", cls: "head" });
    p.text(20, 172, "Work queue (a list)", { anchor: "start", cls: "head" });
    var off = o.offline;
    // row 1
    p.box(20, 60, 130, 40, "PUBLISH", { cls: o.pub ? "hot" : "" });
    p.line("M150 80 L250 80", { cls: o.pub ? "hot" : "", arrow: true });
    p.pill(250, 64, 150, 32, "orders:new", { cls: off ? "dashed" : "fill-hot", dim: off });
    [["Subscriber A", 32], ["Subscriber B", 92]].forEach(function (s) {
      p.line(curve(400, 80, 520, s[1] + 18), { cls: off ? "dashed" : "", dim: off });
      p.box(520, s[1], 150, 36, s[0], { cls: off ? "dashed" : (o.pub ? "hot" : ""), dim: off, sub: off ? "offline" : undefined });
    });
    // row 2
    p.box(20, 210, 130, 40, "LPUSH", { cls: o.push ? "hot" : "" });
    p.line("M150 230 L250 230", { cls: o.push ? "hot" : "", arrow: true });
    p.box(250, 214, 150, 32, o.waiting || "jobs", { rx: 2, cls: o.waiting ? "hot fill-hot" : "", textCls: "mono" });
    [["Worker A", 182, "a"], ["Worker B", 242, "b"]].forEach(function (w) {
      p.line(curve(400, 230, 520, w[1] + 18), { cls: off ? "dashed" : (o.to === w[2] ? "hot" : ""), dim: off });
      p.box(520, w[1], 150, 36, w[0], { cls: off ? "dashed" : (o.to === w[2] ? "hot" : ""), dim: off, sub: off ? "offline" : (o.to === w[2] ? o.push : undefined), subCls: "hot" });
    });
    if (o.pub && !off) {
      p.fly("M150 80 L400 80", 0, 0.45, { still: 0.6 });
      p.fly(curve(400, 80, 520, 50), 0.45, 0.95, { still: false });
      p.fly(curve(400, 80, 520, 110), 0.45, 0.95, { still: false });
      p.text(325, 118, "2 copies", { cls: "hot small" });
    }
    if (o.pub && off) {
      p.fly("M150 80 L400 80", 0, 0.45, { hold: 0.9, still: 0.9 });
      p.cross(420, 80, 7);
      p.text(325, 118, "lost", { cls: "bad small" });
    }
    if (o.push && !off) {
      p.fly("M150 230 L400 230", 0, 0.45, { still: 0.6 });
      p.fly(curve(400, 230, 520, o.to === "a" ? 200 : 260), 0.45, 0.95, { still: false });
      p.text(325, 268, "one worker only", { cls: "hot small" });
    }
    if (o.push && off) {
      p.fly("M150 230 L325 230", 0, 0.5, { hold: 0.98, still: 1 });
      p.text(325, 268, "waits in the list", { cls: "ok small" });
    }
  }

  S.register("fanq", {
    title: "Fan-out vs a work queue",
    size: [690, 290],
    steps: [
      { title: "The same two consumers, wired two ways", why: "Above they subscribe to a channel. Below they pop from a list.", code: "A, B> SUBSCRIBE orders:new\nA, B> BRPOP jobs 0", draw: function (p) { fanq(p, {}); } },
      { title: "Publish: both receive", why: "A broadcast. If these were workers, the order would be processed twice.", code: "> PUBLISH orders:new order-1\n(integer) 2", draw: function (p) { fanq(p, { pub: true }); } },
      { title: "Push a job: one worker takes it", why: "BRPOP removes the item, so nobody else can get it. A ticket at a counter.", code: "> LPUSH jobs job-1\nworker A: (\"jobs\", \"job-1\")", draw: function (p) { fanq(p, { push: "job-1", to: "a" }); } },
      { title: "Push another: the other worker takes it", why: "Work is shared out. Each job is done once.", code: "> LPUSH jobs job-2\nworker B: (\"jobs\", \"job-2\")", draw: function (p) { fanq(p, { push: "job-2", to: "b" }); } },
      { title: "Nobody is listening", why: "The published message is lost. The pushed job waits in the list until a worker returns.", code: "> PUBLISH orders:new order-2\n(integer) 0\n> LPUSH jobs job-3\n(integer) 1", draw: function (p) { fanq(p, { pub: true, push: "job-3", offline: true, waiting: "jobs: job-3" }); } }
    ]
  });

  /* ------------------------------------------------------------------ 7. cache invalidation */
  var SRV = [["Server A", 30], ["Server B", 250], ["Server C", 470]];

  function cacheScene(p, o) {
    p.box(30, 20, 130, 46, "Database", { cls: o.db === "hot" ? "hot" : "", sub: "product:123 = " + o.price, subCls: o.db === "hot" ? "hot" : "muted" });
    p.pill(260, 27, 190, 32, "cache-invalidate", { cls: o.chan ? "hot fill-hot" : "" });
    SRV.forEach(function (s, i) {
      var x = s[1], row = o.rows[i];
      p.line(drop(355, 59, x + 90, 180), { cls: o.fan ? "hot" : "" });
      p.box(x, 180, 180, 92, "", {});
      p.text(x + 90, 197, s[0], { cls: "head" });
      p.box(x + 14, 212, 152, 26, row[0], { cls: row[1], textCls: "mono small" + (row[2] ? " " + row[2] : "") });
      p.text(x + 90, 255, "in-memory cache", { cls: "small muted" });
      if (o.fan) p.fly(drop(355, 59, x + 90, 180), 0.05, 0.9, { still: 0.6 });
    });
    if (o.write) p.line("M60 180 L60 66", { cls: "hot", arrow: true });
    if (o.write) p.text(100, 124, "1. write", { cls: "small hot" });
    if (o.publish) {
      var up = "M150 180 C150 110 300 130 300 59";
      p.line(up, { cls: "hot", arrow: true });
      p.fly(up, 0.05, 0.9, { still: 0.5 });
      p.text(205, 96, "2. publish", { cls: "small hot" });
    }
    if (o.reload) {
      var down = "M160 43 C230 43 230 120 300 180";
      p.line(down, { cls: "ok dashed", arrow: true });
      p.text(212, 84, "reload", { cls: "small ok" });
    }
  }
  var OLD = ["product:123 = 100", "", ""], STALE = ["product:123 = 100", "bad", "bad"], GONE = ["(dropped)", "dashed fill-mute", "muted"];

  S.register("cache", {
    title: "Cache invalidation across three servers",
    size: [690, 290],
    steps: [
      { title: "Every server has its own copy", why: "Each keeps the price in memory so it does not ask the database on every request.", code: "server A, B, C: cache[\"product:123\"] = 100", draw: function (p) { cacheScene(p, { price: 100, rows: [OLD, OLD, OLD] }); } },
      { title: "The price changes in the database", why: "Server A handles the update. All three copies are now wrong, and two servers have no idea.", code: "UPDATE products SET price = 120 WHERE id = 123", draw: function (p) { cacheScene(p, { price: 120, db: "hot", write: true, rows: [STALE, STALE, STALE] }); } },
      { title: "Then A publishes the key name", why: "Database first, publish second. The message carries only which entry to forget, not the new value.", code: "> PUBLISH cache-invalidate product:123\n(integer) 3", draw: function (p) { cacheScene(p, { price: 120, publish: true, chan: true, rows: [STALE, STALE, STALE] }); } },
      { title: "Redis fans it out to all three", why: "Every subscribed server gets a copy and drops that one entry. A itself is just another subscriber.", code: "each server receives:\n1) \"message\"\n2) \"cache-invalidate\"\n3) \"product:123\"", draw: function (p) { cacheScene(p, { price: 120, chan: true, fan: true, rows: [GONE, GONE, GONE] }); } },
      { title: "The next request reloads the entry", why: "A miss sends the server back to the database, the single source of truth. The others reload when they are asked.", code: "server B: loaded product:123 = 120 from the database", draw: function (p) { cacheScene(p, { price: 120, reload: true, rows: [GONE, ["product:123 = 120", "ok", "ok"], GONE] }); } }
    ]
  });

  /* ------------------------------------------------------------------ 8. connection pool filling up */
  function pool(p, slots, o) {
    o = o || {};
    p.text(345, 26, "pool: max_connections = 5", { cls: "mono" });
    p.box(24, 48, 642, 104, "", { cls: "dashed" });
    slots.forEach(function (s, i) {
      var x = 40 + i * 124;
      if (!s) { p.box(x, 64, 112, 72, "free", { cls: "dashed", textCls: "muted small" }); return; }
      var g = p.box(x, 64, 112, 72, s[0], { cls: s[2] || "hot fill-hot", sub: s[1], textCls: "mono small" });
      if (s[3]) p.blink(g, 0.1, 0.55);
    });
    if (o.note) p.text(345, 174, o.note, { cls: o.noteCls || "muted" });
    if (o.fail) {
      p.box(270, 196, 150, 46, "job 6", { cls: "bad", sub: "Too many connections", subCls: "bad" });
      p.line("M345 196 L345 152", { cls: "bad dashed", arrow: true });
    }
  }
  function held(n) { return ["SUBSCRIBE", "job " + n]; }

  S.register("pool", {
    title: "A connection pool filling up",
    size: [690, 256],
    steps: [
      { title: "An empty pool of five", why: "The pool hands out connections and takes them back. Five is the most it will ever open.", code: "pool = redis.ConnectionPool(max_connections=5)", draw: function (p) { pool(p, [null, null, null, null, null]); } },
      { title: "Three jobs, three subscribers", why: "A subscription keeps its connection for as long as the job lives. Normal commands borrow one for a moment and give it back.", code: "p = r.pubsub(); p.subscribe(\"job:1:cancel\")   # holds a connection\nr.get(\"job:1:status\")                         # borrows, returns", draw: function (p) { pool(p, [held(1), held(2), held(3), ["GET", "in and out", "ok", true], null], { note: "subscribers stay, commands come and go" }); } },
      { title: "Five jobs: the pool is full", why: "Every slot is pinned by a long-lived subscriber. There is nothing left even for a GET.", code: "5 subscribers connected", draw: function (p) { pool(p, [held(1), held(2), held(3), held(4), held(5)], { note: "nothing free", noteCls: "bad" }); } },
      { title: "The sixth job fails", why: "redis-py's default pool raises at once when it is full. A blocking pool would wait instead, which only turns the error into a stall.", code: "redis.exceptions.ConnectionError: Too many connections", draw: function (p) { pool(p, [held(1), held(2), held(3), held(4), held(5)], { fail: true }); } },
      { title: "The fix: one shared subscriber", why: "One connection can hold thousands of subscriptions. The process subscribes once and hands each message to the right job.", code: "shared.subscribe(**{f\"job:{n}:cancel\": on_cancel for n in range(1, 101)})\nchannels on one connection: 100", draw: function (p) { pool(p, [["1 subscriber", "100 channels"], null, null, null, null], { note: "4 connections free for commands", noteCls: "ok" }); } }
    ]
  });
})();
