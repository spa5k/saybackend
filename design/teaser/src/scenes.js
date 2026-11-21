(() => {
  // src/components/paper/scenes.ts
  var W = 1000;
  var PI = Math.PI;
  var n = (value) => Math.round(value * 10) / 10;
  var clamp = (value) => Math.max(0, Math.min(1, value));
  var seg = (x0, y, x1) => `M${n(x0)} ${y}H${n(x1)}`;
  var rise = (x, y0 = 10, y1 = 190) => `M${n(x)} ${y0}V${y1}`;
  var dot = (x, y) => `M${n(x)} ${n(y)}h0`;
  var NONE = "M-60 0h0";
  var at = (pointer, time, mid, swing, speed) => (pointer ?? mid + swing * Math.sin(time * speed)) * W;
  function curve(y, x0 = 0, x1 = W, step = 10) {
    let d = "";
    for (let x = x0;x <= x1; x += step)
      d += `${d ? "L" : "M"}${x} ${n(y(x))}`;
    return d;
  }
  function bezier(a, b, c, e, u) {
    const v = 1 - u;
    return [
      v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u ** 3 * e[0],
      v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u ** 3 * e[1]
    ];
  }
  var cubic = (a, b, c, e) => `M${a[0]} ${a[1]}C${n(b[0])} ${n(b[1])} ${n(c[0])} ${n(c[1])} ${n(e[0])} ${n(e[1])}`;
  var noise = (a, b = 0) => {
    const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  var rough = (t, p) => {
    const split = at(p, t, 0.4, 0.25, 0.5);
    return [0, 1, 2, 3, 4, 5].map((i) => ({
      k: i === 2 ? "mark" : "line",
      c: "lilac",
      d: curve((x) => {
        const k = clamp((x - split) / 140);
        return 30 + i * 28 + k * (Math.sin(x * 0.045 + i * 2 + t) * 4 + Math.sin(x * 0.015 + i + t * 0.6) * 6);
      })
    }));
  };
  var lanes = (t, p) => {
    const speed = 1 + (p ?? 0) * 3;
    const colours = ["lilac", "blue", "amber", "sage"];
    const lengths = [180, 280, 130, 230];
    const shapes = [];
    for (let i = 0;i < 4; i += 1) {
      const y = 35 + i * 43;
      const head = (t * speed * (110 + i * 35) + i * 260) % (940 + lengths[i]);
      const from = Math.max(0, head - lengths[i]);
      const to = Math.min(940, head);
      shapes.push({ k: "far", d: seg(0, y, 940) });
      shapes.push({
        k: "bar",
        c: colours[i],
        d: to > from ? seg(from, y, to) : NONE
      });
    }
    shapes.push({ k: "bold", d: rise(940, 14, 186) });
    return shapes;
  };
  var prefix = (t, p) => {
    const cut = at(p, t, 0.3, 0.2, 0.6);
    const shapes = [];
    for (let i = 0;i < 5; i += 1) {
      const length = 260 + i * 150;
      const y = 30 + i * 35;
      const cached = Math.min(length, Math.max(0, cut));
      shapes.push({
        k: "bar",
        c: "amber",
        d: cached > 4 ? seg(0, y, cached) : NONE
      });
      shapes.push({
        k: "line",
        d: cached < length ? seg(cached + 12, y, length) : NONE
      });
    }
    shapes.push({ k: "dash", d: rise(cut, 8, 192) });
    return shapes;
  };
  var gate = (t, p) => {
    const g = at(p, t, 0.5, 0.15, 0.5);
    const shapes = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
      k: i === 3 ? "mark" : "line",
      c: "rose",
      d: curve((x) => {
        const k = clamp((g - x) / 130);
        return 25 + i * 25 + k * (Math.sin(x * 0.03 + i * 1.7 - t * 2) * 10 + Math.sin(x * 0.08 + i - t * 3) * 5);
      })
    }));
    shapes.push({ k: "bold", d: rise(g, 8, 192) });
    return shapes;
  };
  var detour = (t, p) => {
    const amount = 1 - (p ?? 0);
    const y = (x) => {
      const u = (x - 60) / 880;
      return 100 + amount * Math.sin(u * PI * 5) * 74 * Math.sin(u * PI);
    };
    const slow = 60 + t * 0.05 % 1 * 880;
    const fast = 60 + t * 0.9 % 1.3 * 880;
    return [
      { k: "far", d: curve(y, 60, 940) },
      { k: "mark", c: "lilac", d: seg(60, 100, 940) },
      { k: "node", d: dot(60, 100) },
      { k: "node", d: dot(940, 100) },
      { k: "dot", c: "sand", d: dot(slow, y(slow)) },
      { k: "dot", c: "lilac", d: fast <= 940 ? dot(fast, 100) : NONE }
    ];
  };
  var merge = (t, p) => {
    const x = at(p, t, 0.5, 0.1, 0.4);
    const shapes = [0, 1, 2, 3, 4].map((i) => ({
      k: "line",
      d: cubic([0, 20 + i * 40], [x * 0.5, 20 + i * 40], [x * 0.6, 100], [x, 100])
    }));
    const step = (W - x) / 3;
    shapes.push({ k: "mark", c: "amber", d: seg(x, 100, W) });
    shapes.push({ k: "run", c: "blue", d: seg(x, 100, W) });
    shapes.push({ k: "node", d: dot(x, 100) });
    shapes.push({ k: "node", d: dot(x + step, 100) });
    shapes.push({ k: "node", d: dot(x + step * 2, 100) });
    return shapes;
  };
  var split = (t, p) => {
    const x = at(p, t, 0.42, 0.1, 0.4);
    const up = [
      [x, 100],
      [x + 150, 100],
      [x + 200, 45],
      [W, 45]
    ];
    const down = [
      [x, 100],
      [x + 150, 100],
      [x + 200, 155],
      [W, 155]
    ];
    return [
      { k: "line", d: seg(0, 100, x) },
      { k: "mark", c: "amber", d: cubic(...up) },
      { k: "mark", c: "blue", d: cubic(...down) },
      { k: "node", d: dot(x, 100) },
      { k: "dot", c: "amber", d: dot(...bezier(...up, t * 0.35 % 1)) },
      { k: "dot", c: "blue", d: dot(...bezier(...down, (t * 0.35 + 0.5) % 1)) }
    ];
  };
  var day = (t, p) => {
    const u = p ?? t * 0.05 % 1;
    const x = u * W;
    return [
      { k: "far", d: curve((px) => 150 - 115 * Math.sin(px / W * PI)) },
      { k: "bar", c: "amber", d: x > 4 ? seg(0, 150, x) : NONE },
      { k: "bold", d: seg(x, 150, W) },
      { k: "dot", c: "amber", d: dot(x, 150 - 115 * Math.sin(u * PI)) }
    ];
  };
  var braid = (t, p) => {
    const x = at(p, t, 0.5, 0.12, 0.4);
    const shapes = [0, 1, 2, 3, 4, 5].map((i) => ({
      k: "dash",
      d: cubic([0, 25 + i * 30], [x * 0.55, 25 + i * 30], [x * 0.7, 100], [x, 100])
    }));
    const part = (W - x) / 4;
    const colours = ["blue", "lilac", "sage", "amber"];
    colours.forEach((c, i) => shapes.push({
      k: "bar",
      c,
      d: seg(x + part * i + 5, 100, x + part * (i + 1) - 5)
    }));
    return shapes;
  };
  var chunks = (t, p) => {
    const size = 70 + (p ?? 0.35 + 0.2 * Math.sin(t * 0.5)) * 230;
    let fixed = "";
    for (let x = 0;x < W; x += size)
      fixed += seg(x, 80, Math.min(W, x + size - 14));
    let even = "";
    let odd = "";
    for (let x = 0, i = 0;x < W; x += size * 0.75, i += 1) {
      const piece = seg(x, i % 2 ? 131 : 121, Math.min(W, x + size));
      if (i % 2)
        odd += piece;
      else
        even += piece;
    }
    let uneven = "";
    for (let x = 0, i = 0;x < W; i += 1) {
      const length = size * (0.5 + noise(i));
      uneven += seg(x, 172, Math.min(W, x + length - 14));
      x += length;
    }
    return [
      { k: "line", d: seg(0, 32, W) },
      { k: "mark", c: "amber", d: fixed },
      { k: "mark", c: "lilac", d: even },
      { k: "mark", c: "blue", d: odd || NONE },
      { k: "mark", c: "sage", d: uneven }
    ];
  };
  var quorum = (t, p) => {
    const leader = p === null ? Math.floor(t / 2.5) % 3 : Math.min(2, Math.floor(p * 3));
    const shapes = [
      { k: "bar", c: "lilac", d: seg(0, 50 + leader * 50, W) }
    ];
    for (let i = 0;i < 3; i += 1) {
      const y = 50 + i * 50;
      shapes.push({ k: "line", d: seg(0, y, W) });
      shapes.push({
        k: "run",
        c: i === leader ? "amber" : "sand",
        d: seg(0, y, W)
      });
    }
    return shapes;
  };
  var shrink = (t, p) => {
    const cut = at(p, t, 0.45, 0.12, 0.4);
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
      const y = 20 + i * 20;
      if (i !== 3 && i !== 5) {
        return {
          k: "far",
          d: seg(0, y, Math.max(8, cut - Math.abs(i - 4) * 28))
        };
      }
      const end = i === 3 ? 85 : 115;
      return {
        k: "mark",
        c: "sage",
        d: `M0 ${y}H${n(cut)}C${n(cut + 90)} ${y} ${n(cut + 90)} ${end} ${n(cut + 180)} ${end}H${W + 200}`
      };
    });
  };
  var pulse = (t, p) => {
    const beat = (x) => {
      const phase = ((x - t * 160) % 260 + 260) % 260;
      if (phase < 12)
        return -62 * phase / 12;
      if (phase < 22)
        return -62 + 92 * (phase - 12) / 10;
      if (phase < 34)
        return 30 - 30 * (phase - 22) / 12;
      return 0;
    };
    const extra = (x) => p === null ? 0 : -52 * Math.exp(-(((x - p * W) / 16) ** 2));
    return [
      { k: "far", d: seg(0, 40, W) },
      { k: "far", d: seg(0, 160, W) },
      {
        k: "mark",
        c: "sage",
        d: curve((x) => 100 + beat(x) + extra(x), 0, W, 4)
      }
    ];
  };
  var stream = (t, p) => {
    const x = at(p, t, 0.5, 0.1, 0.4);
    const path = `M0 70H${n(x - 70)}C${n(x)} 70 ${n(x)} 130 ${n(x + 70)} 130H${W}`;
    return [
      { k: "far", d: path },
      { k: "mark", c: "lilac", d: seg(0, 70, x - 70) },
      { k: "mark", c: "blue", d: seg(x + 70, 130, W) },
      { k: "run", c: "amber", d: path },
      { k: "dash", d: rise(x, 10, 190) }
    ];
  };
  var stairs = (t, p) => {
    const line = at(p, t, 0.55, 0.12, 0.4);
    const shapes = [0, 1, 2, 3, 4, 5].map((i) => ({
      k: "bar",
      c: "sand",
      d: seg(0, 25 + i * 25, Math.max(8, line - 20 - i * 46))
    }));
    shapes.push({ k: "bar", c: "lilac", d: seg(0, 175, W) });
    shapes.push({ k: "dash", d: rise(line, 8, 192) });
    return shapes;
  };
  var orbit = (t, p) => {
    const turn = p === null ? t * 0.25 : p * PI * 2;
    const spots = [0, 1, 2, 3, 4].map((i) => {
      const angle = turn + i * PI * 2 / 5;
      return [500 + Math.cos(angle) * 400, 100 + Math.sin(angle) * 74];
    });
    let ring = "";
    for (let i = 0;i <= 48; i += 1) {
      const angle = i / 48 * PI * 2;
      ring += `${i ? "L" : "M"}${n(500 + Math.cos(angle) * 400)} ${n(100 + Math.sin(angle) * 74)}`;
    }
    return [
      { k: "dash", d: ring },
      ...spots.map(([x, y]) => ({
        k: "far",
        d: `M500 100L${n(x)} ${n(y)}`
      })),
      ...spots.map(([x, y]) => ({
        k: "dot",
        c: "blue",
        d: dot(x, y)
      })),
      { k: "node", d: dot(500, 100) }
    ];
  };
  var url = (t, p) => {
    const lengths = [0, 1, 2].map((i) => 110 + 150 * (i === 0 && p !== null ? p : 0.5 + 0.5 * Math.sin(t * 0.7 + i * 2.1)));
    const colours = ["lilac", "sage", "amber"];
    const shapes = [{ k: "line", d: seg(0, 165, 120) }];
    let x = 136;
    lengths.forEach((length, i) => {
      shapes.push({ k: "bar", c: colours[i], d: seg(0, 35 + i * 35, length) });
      shapes.push({ k: "bar", c: colours[i], d: seg(x, 165, x + length) });
      x += length + 16;
    });
    return shapes;
  };
  var bits = (t, p) => {
    const edge = p ?? 0.45 + 0.1 * Math.sin(t * 0.4);
    const count = 50;
    let sorted = "";
    let random = "";
    for (let i = 0;i < count; i += 1) {
      const x = 10 + i * 20;
      const u = i / count;
      if (u < edge)
        sorted += `M${x} 188V${n(168 - u / edge * 150)}`;
      else
        random += `M${x} 188V${n(168 - noise(i, Math.floor(t * 3)) * 150)}`;
    }
    return [
      { k: "mark", c: "blue", d: sorted || NONE },
      { k: "line", d: random || NONE },
      { k: "dash", d: rise(edge * W + 1, 6, 194) }
    ];
  };
  var hook = (t, p) => {
    const g = at(p, t, 0.55, 0.12, 0.4);
    const shapes = [];
    for (let i = 0;i < 6; i += 1) {
      const y = 30 + i * 28;
      const blocked = i === 1 || i === 4;
      shapes.push(blocked ? { k: "mark", c: "rose", d: seg(0, y, Math.max(8, g - 14)) } : { k: "line", d: seg(0, y, W) });
      shapes.push({
        k: "run",
        c: blocked ? "rose" : "blue",
        d: seg(0, y, blocked ? Math.max(8, g - 14) : W)
      });
    }
    shapes.push({ k: "bold", d: rise(g, 8, 192) });
    return shapes;
  };
  var start = (t, p) => {
    const head = (p ?? t * 0.1 % 1) * W;
    let ticks = "";
    for (let i = 0;i < 12; i += 1)
      ticks += `M${40 + i * 84} 92V108`;
    return [
      { k: "dash", d: seg(0, 100, W) },
      { k: "far", d: ticks },
      {
        k: "mark",
        c: "lilac",
        d: head > 462 ? curve((x) => 100 + Math.sin(x * 0.04 + t) * 3, 460, head, 6) : NONE
      },
      { k: "node", d: dot(460, 100) }
    ];
  };
  var turn = (t, p) => {
    const x = at(p, t, 0.4, 0.15, 0.4);
    const r = 110;
    const loop = `M${n(x)} 140C${n(x + r)} 140 ${n(x + r)} 40 ${n(x)} 40C${n(x - r)} 40 ${n(x - r)} 140 ${n(x)} 140`;
    return [
      { k: "line", d: seg(0, 140, x) },
      { k: "line", d: loop },
      { k: "mark", c: "amber", d: seg(x, 140, W) },
      { k: "run", c: "lilac", d: seg(x, 140, W) }
    ];
  };
  var repack = (t, p) => {
    const cut = at(p, t, 0.45, 0.3, 0.4);
    const shapes = [];
    for (let i = 0;i < 5; i += 1) {
      const y = 30 + i * 35;
      let holes = "";
      for (let slot = Math.ceil((cut + 14) / 50);slot < 20; slot += 1)
        if (noise(i, slot) > 0.42)
          holes += seg(slot * 50 + 4, y, slot * 50 + 44);
      shapes.push({ k: "bar", c: "blue", d: cut > 6 ? seg(0, y, cut - 6) : NONE });
      shapes.push({ k: "line", d: holes || NONE });
    }
    shapes.push({ k: "dash", d: rise(cut, 8, 192) });
    return shapes;
  };
  var adapt = (t, p) => {
    const pick = Math.min(2, Math.floor((p ?? t * 0.25 % 1) * 3));
    const way = (i) => [
      [340, 100],
      [520, 100],
      [560, 40 + i * 60],
      [760, 40 + i * 60]
    ];
    const tail = (i) => `${cubic(...way(i))}H${W}`;
    return [
      { k: "line", d: seg(0, 100, 340) },
      { k: "far", d: tail(0) },
      { k: "far", d: tail(1) },
      { k: "far", d: tail(2) },
      { k: "mark", c: "sage", d: tail(pick) },
      { k: "run", c: "lilac", d: tail(pick) },
      { k: "node", d: dot(340, 100) }
    ];
  };
  var fault = (t, p) => {
    const x = Math.max(430, at(p, t, 0.68, 0.14, 0.5));
    return [
      { k: "line", d: cubic([0, 50], [180, 50], [200, 100], [340, 100]) },
      { k: "line", d: cubic([0, 150], [180, 150], [200, 100], [340, 100]) },
      { k: "mark", c: "amber", d: seg(340, 100, x - 16) },
      { k: "run", c: "lilac", d: seg(340, 100, x - 16) },
      { k: "dash", d: seg(x + 16, 100, W) },
      {
        k: "bold",
        d: `M${n(x - 14)} 93L${n(x + 14)} 107M${n(x + 14)} 93L${n(x - 14)} 107`
      },
      { k: "node", d: dot(340, 100) }
    ];
  };
  var cache = (t, p) => {
    const changed = Math.min(5, Math.floor((p ?? (t * 0.12 + 0.5) % 1) * 6));
    const shapes = [];
    for (let i = 0;i < 6; i += 1) {
      const y = 25 + i * 30;
      const length = 300 + noise(i, 3) * 560;
      const hit = i < changed;
      shapes.push({ k: "far", d: seg(0, y, length) });
      shapes.push({ k: "bar", c: "lilac", d: hit ? seg(0, y, length) : NONE });
      shapes.push({ k: "run", c: "amber", d: hit ? NONE : seg(0, y, length) });
    }
    shapes.push({ k: "bold", d: `M0 ${10 + changed * 30}H${W}` });
    return shapes;
  };
  var edge = (t, p) => {
    const pages = (y, from, to) => {
      let d = "";
      for (let i = from;i < to; i += 1)
        d += seg(i * 62.5 + 5, y, i * 62.5 + 57);
      return d || NONE;
    };
    const random = Math.floor(noise(Math.floor(t * 2.5)) * 16);
    const head = Math.max(1, Math.min(16, Math.ceil((p ?? (t * 0.08 + 0.6) % 1) * 16)));
    return [
      { k: "far", d: pages(60, 0, 16) },
      { k: "bar", c: "rose", d: pages(60, random, random + 1) },
      { k: "far", d: pages(140, 0, 16) },
      { k: "bar", c: "blue", d: pages(140, 0, head) },
      { k: "node", d: dot(head * 62.5 - 5, 140) }
    ];
  };
  var scenes = {
    "postgresql-19-backend-engineers": repack,
    "self-host-nextjs-16-standalone-adapter": adapt,
    "cliproxyapi-setup-fixes-homebrew-codex-claude-code": fault,
    "golang-dockerfile-best-practices": cache,
    "uuidv7-postgres-uuidv7-vs-uuid-generate-v7": edge,
    "saybackend-redesign-paper-marker-pen": rough,
    "faster-github-actions-same-runners": lanes,
    "prompt-caching-agent-harnesses": prefix,
    "lint-ai-generated-code": gate,
    "happycontext-go-performance": detour,
    "codex-subscription-claude-code-conductor": merge,
    "cliproxyapi-factory-droid-byok": split,
    "happymode-macos-appearance-scheduler": day,
    "happycontext-wide-logging-golang": braid,
    "2025-feb-text-chunking-rag-systems": chunks,
    "2025-jan-kafka-docker-kraft-mode": quorum,
    "2024-sep-nextjs-deploy-any-server": shrink,
    "09-nextjs-self-hosted-production": pulse,
    "2024-aug-nextjs-electron-server-components": stream,
    "2024-jun-golang-dockerfile-optimized": stairs,
    "08-kubernetes-cluster-journey": orbit,
    "2023-dec-zustand-url-state-sharing": url,
    "uuidv7-postgres-comparison": bits,
    "recreating-planetscale-pg-strict-in-rust": hook,
    "2024-jun-saybackend-changelog": start,
    "2026-jan-saybackend-changelog": turn
  };
  function sceneOf(slug) {
    return slug ? scenes[slug] : undefined;
  }

  // design/teaser/src/build/entry.ts
  window.sceneOf = sceneOf;
})();
