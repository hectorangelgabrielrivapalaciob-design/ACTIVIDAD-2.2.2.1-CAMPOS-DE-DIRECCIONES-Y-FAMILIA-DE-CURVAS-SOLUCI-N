// ============================================================================
// 1. INTRO: CÍRCULO HUD -> CONTRACCIÓN + TEMBLOR -> EXPLOSIÓN EN GRANITOS
// ============================================================================
(function initIntro() {
  const overlay = document.getElementById("intro-overlay");
  const hudLoader = document.getElementById("hud-loader");
  const ringTicks = document.getElementById("ring-outer-ticks");
  const fxCanvas = document.getElementById("intro-fx-canvas");
  const pctEl = document.getElementById("loader-pct");
  const statusEl = document.getElementById("loader-status");
  const skipBtn = document.getElementById("skip-intro");
  const replayBtn = document.getElementById("replay-intro-btn");

  // Bloques del anillo exterior
  const totalBlocks = 40;
  for (let i = 0; i < totalBlocks; i++) {
    const angle = (i * 360) / totalBlocks;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "156");
    rect.setAttribute("y", "10");
    rect.setAttribute("width", "8");
    rect.setAttribute("height", "14");
    const isLit = (i >= 3 && i <= 10) || (i >= 23 && i <= 30);
    rect.setAttribute("fill", isLit ? (i % 2 === 0 ? "#00ff88" : "#ffffff") : "transparent");
    rect.setAttribute("stroke", isLit ? "#00ff88" : "rgba(255,255,255,0.35)");
    rect.setAttribute("stroke-width", "1");
    rect.setAttribute("transform", `rotate(${angle} 160 160)`);
    ringTicks.appendChild(rect);
  }

  const ctx = fxCanvas.getContext("2d");
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789∂∫∑λΔΩ";
  let grains = [];
  let drops = [];
  let animId = null;
  let timers = [];
  let mode = "idle"; // "idle" | "explosion_and_rain"

  function resizeFx() {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  }
  resizeFx();
  window.addEventListener("resize", resizeFx);

  function spawnGrainsAndRain() {
    const cx = fxCanvas.width / 2;
    const cy = fxCanvas.height / 2;

    // Granitos / fragmentos que salen disparados y luego caen como lluvia
    grains = Array.from({ length: 160 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 13;
      return {
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.14 + Math.random() * 0.18,
        drag: 0.965,
        size: 2 + Math.random() * 3.5,
        color: Math.random() > 0.38 ? "#00ff88" : "#ffffff",
        alpha: 1
      };
    });

    // Columnas de lluvia japonesa que nacen tras la explosión
    const fontSize = 18;
    const cols = Math.floor(fxCanvas.width / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -18);
  }

  function renderIntroFx() {
    ctx.fillStyle = "rgba(2, 8, 5, 0.16)";
    ctx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);

    if (mode === "explosion_and_rain") {
      // 1. Dibujar lluvia de caracteres japoneses
      const fontSize = 18;
      ctx.font = `bold ${fontSize}px 'Share Tech Mono', monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.8 ? "#ffffff" : "#00ff88";
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > fxCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.85;
      }

      // 2. Dibujar granitos de la explosión cayendo alrededor de la pantalla
      for (let i = 0; i < grains.length; i++) {
        const g = grains[i];
        g.vx *= g.drag;
        g.vy = g.vy * g.drag + g.gravity;
        g.x += g.vx;
        g.y += g.vy;
        g.alpha = Math.max(0, g.alpha - 0.008);

        ctx.globalAlpha = g.alpha;
        ctx.fillStyle = g.color;
        ctx.fillRect(g.x, g.y, g.size, g.size);
      }
      ctx.globalAlpha = 1;
    }

    animId = requestAnimationFrame(renderIntroFx);
  }

  function closeIntro() {
    timers.forEach(clearTimeout);
    timers = [];
    overlay.classList.add("fade-out");
    setTimeout(() => {
      if (animId) cancelAnimationFrame(animId);
      mode = "idle";
    }, 1350);
  }

  function startSequence() {
    timers.forEach(clearTimeout);
    timers = [];
    if (animId) cancelAnimationFrame(animId);

    overlay.classList.remove("fade-out");
    hudLoader.classList.remove("compress-shake");
    ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    statusEl.textContent = "CARGANDO NÚCLEO EDO...";
    mode = "idle";

    let pct = 0;
    const interval = setInterval(() => {
      pct += 2;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
      }
      pctEl.textContent = `${pct}%`;
      if (pct > 65) statusEl.textContent = "COMPRIMIENDO ENERGÍA...";
    }, 45);
    timers.push(interval);

    // Paso 1 (2.1s): El círculo se hace chiquito y tiembla
    timers.push(setTimeout(() => {
      hudLoader.classList.add("compress-shake");
    }, 2100));

    // Paso 2 (3.2s): Explota en granitos alrededor de la pantalla + lluvia japonesa
    timers.push(setTimeout(() => {
      resizeFx();
      spawnGrainsAndRain();
      mode = "explosion_and_rain";
      animId = requestAnimationFrame(renderIntroFx);
    }, 3200));

    // Paso 3 (6.0s): Se desvanece suavemente para revelar toda la página web
    timers.push(setTimeout(() => {
      closeIntro();
    }, 6000));
  }

  skipBtn.addEventListener("click", closeIntro);
  replayBtn.addEventListener("click", startSequence);
  startSequence();
})();

// ============================================================================
// 2. LLUVIA GLOBAL DE CARACTERES EN TODA LA PÁGINA WEB (OPTIMIZADA)
// ============================================================================
(function initGlobalMatrixRain() {
  const canvas = document.getElementById("global-matrix-canvas");
  const ctx = canvas.getContext("2d");
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789∂∫∑λΔΩ";
  let drops = [];
  let lastTime = 0;

  function resizeGlobal() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 18;
    const cols = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * (canvas.height / fontSize));
  }
  resizeGlobal();
  window.addEventListener("resize", resizeGlobal);

  function drawGlobalRain(now) {
    if (now - lastTime > 45) {
      lastTime = now;
      ctx.fillStyle = "rgba(2, 8, 5, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fontSize = 18;
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.84 ? "#ffffff" : "#00ff88";
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.72;
      }
    }
    requestAnimationFrame(drawGlobalRain);
  }
  requestAnimationFrame(drawGlobalRain);
})();

// ============================================================================
// 3. DEFINICIÓN DE LOS 4 ENUNCIADOS DE LA ACTIVIDAD 2.2.2.1
// ============================================================================
const ENUNCIADOS = [
  {
    id: 1,
    tag: "ENUNCIADO 1",
    title: "Difusión de calor (Ley de Enfriamiento de Newton)",
    description:
      "Grafique el campo de direcciones para el modelo de difusión de calor según la Ley de Enfriamiento de Newton. Analice comportamientos para valores de C desde -2 a 2.",
    eqHtml: "dT / dt = -k(T - T<sub>amb</sub>)",
    fnText: "f(x, y) = -k(y - T_amb)",
    view: { xMin: -2, xMax: 6.5, yMin: 17.5, yMax: 22.8 },
    params: [
      { key: "k", label: "Constante de enfriamiento (k)", min: 0.2, max: 2.5, step: 0.1, value: 1.0 },
      { key: "Tamb", label: "Temperatura ambiente (T_amb)", min: 15, max: 25, step: 1, value: 20 }
    ],
    derivative: (x, y, p) => -p.k * (y - p.Tamb),
    presets: (p) => [
      { label: "A", x0: 0, y0: p.Tamb - 2, cVal: -2, color: "#00ff88" },
      { label: "B", x0: 0, y0: p.Tamb - 1, cVal: -1, color: "#80ffc4" },
      { label: "C", x0: 0, y0: p.Tamb,     cVal:  0, color: "#ffffff" },
      { label: "D", x0: 0, y0: p.Tamb + 1, cVal:  1, color: "#4dffaa" },
      { label: "E", x0: 0, y0: p.Tamb + 2, cVal:  2, color: "#19c977" }
    ],
    solFormula: (pt, p) => `${pt.cVal === 0 ? "" : pt.cVal + " "}e^(-${p.k}x) + ${p.Tamb}`,
    analysis: (p) =>
      `Equilibrio en T = ${p.Tamb}. Si C > 0 (puntos D y E), el cuerpo se enfría exponencialmente hacia ${p.Tamb}. Si C < 0 (puntos A y B), absorbe calor hasta estabilizarse en ${p.Tamb}.`
  },
  {
    id: 2,
    tag: "ENUNCIADO 2",
    title: "Flujo en tubería horizontal",
    description:
      "Represente las líneas de flujo de la velocidad del fluido en una tubería horizontal. Explore soluciones para C entre -5 y 5 (donde v es velocidad, f coeficiente de fricción y D diámetro).",
    eqHtml: "dv / dx = -(f / 2D) · v|v|",
    fnText: "f(x, y) = -(f / 2D) · y|y|",
    view: { xMin: -2, xMax: 8, yMin: -6, yMax: 6 },
    params: [
      { key: "f", label: "Coeficiente de fricción (f)", min: 0.05, max: 1.0, step: 0.05, value: 0.3 },
      { key: "D", label: "Diámetro de tubería (D)", min: 0.5, max: 3.0, step: 0.1, value: 1.0 }
    ],
    derivative: (x, y, p) => -(p.f / (2 * p.D)) * y * Math.abs(y),
    presets: () => [
      { label: "A", x0: 0, y0: -5,   cVal: -5,   color: "#19c977" },
      { label: "B", x0: 0, y0: -2.5, cVal: -2.5, color: "#80ffc4" },
      { label: "C", x0: 0, y0: 0,    cVal: 0,    color: "#ffffff" },
      { label: "D", x0: 0, y0: 2.5,  cVal: 2.5,  color: "#4dffaa" },
      { label: "E", x0: 0, y0: 5,    cVal: 5,    color: "#00ff88" }
    ],
    solFormula: (pt, p) =>
      pt.y0 === 0
        ? "0 (Fluido en reposo)"
        : `${pt.y0} / (1 + ${(Math.abs(pt.y0) * p.f / (2 * p.D)).toFixed(2)}x)`,
    analysis: () =>
      "La fricción cuadrática v|v| desacelera el fluido asintóticamente hacia v = 0 sin invertir el sentido del flujo."
  },
  {
    id: 3,
    tag: "ENUNCIADO 3",
    title: "Movimiento bajo fricción lineal",
    description:
      "Grafique el campo de direcciones para el movimiento de una partícula con fricción lineal, donde v es la velocidad, b la constante de fricción y F una fuerza constante.",
    eqHtml: "dv / dt = -bv + F",
    fnText: "f(t, v) = -bv + F",
    view: { xMin: -1.5, xMax: 6.5, yMin: 0, yMax: 12 },
    params: [
      { key: "b", label: "Constante de fricción (b)", min: 0.2, max: 2.0, step: 0.1, value: 0.8 },
      { key: "F", label: "Fuerza constante (F)", min: 1.0, max: 8.0, step: 0.5, value: 4.8 }
    ],
    derivative: (x, y, p) => -p.b * y + p.F,
    presets: (p) => {
      const vt = +(p.F / p.b).toFixed(2);
      return [
        { label: "A", x0: 0, y0: Math.max(0.5, vt - 4), cVal: -4, color: "#19c977" },
        { label: "B", x0: 0, y0: Math.max(0.2, vt - 2), cVal: -2, color: "#80ffc4" },
        { label: "C", x0: 0, y0: vt, cVal: 0, color: "#ffffff" },
        { label: "D", x0: 0, y0: vt + 2, cVal: 2, color: "#4dffaa" },
        { label: "E", x0: 0, y0: vt + 4, cVal: 4, color: "#00ff88" }
      ];
    },
    solFormula: (pt, p) => `${pt.cVal} e^(-${p.b}t) + ${(p.F / p.b).toFixed(2)}`,
    analysis: (p) =>
      `Todas las trayectorias convergen a la velocidad terminal v = F/b = ${(p.F / p.b).toFixed(2)}, donde la fuerza impulsora iguala a la fricción.`
  },
  {
    id: 4,
    tag: "ENUNCIADO 4",
    title: "Crecimiento poblacional logístico",
    description:
      "Represente el campo de trayectorias para el modelo de crecimiento poblacional logístico, donde N es la población, r la tasa de crecimiento y K la capacidad máxima. Analice C desde 0 a 6 en M de personas.",
    eqHtml: "dN / dt = rN(1 - N/K)",
    fnText: "f(t, N) = rN(1 - N/K)",
    view: { xMin: -1, xMax: 8, yMin: -0.5, yMax: 7.2 },
    params: [
      { key: "r", label: "Tasa de crecimiento (r)", min: 0.2, max: 2.0, step: 0.1, value: 0.9 },
      { key: "K", label: "Capacidad máxima (K en M)", min: 3.0, max: 6.5, step: 0.5, value: 5.0 }
    ],
    derivative: (x, y, p) => p.r * y * (1 - y / p.K),
    presets: (p) => [
      { label: "A", x0: 0, y0: 0,   cVal: 0,   color: "#84bfa1" },
      { label: "B", x0: 0, y0: 0.8, cVal: 0.8, color: "#00ff88" },
      { label: "C", x0: 0, y0: 2.2, cVal: 2.2, color: "#80ffc4" },
      { label: "D", x0: 0, y0: p.K, cVal: p.K, color: "#ffffff" },
      { label: "E", x0: 0, y0: 6.0, cVal: 6.0, color: "#4dffaa" }
    ],
    solFormula: (pt, p) =>
      pt.y0 === 0
        ? "0 (Equilibrio inestable)"
        : `${p.K} / (1 + ${((p.K - pt.y0) / pt.y0).toFixed(2)}e^(-${p.r}t))`,
    analysis: (p) =>
      `Las poblaciones iniciales entre 0 y K = ${p.K}M crecen en curva sigmoide (S) hacia ${p.K}M. Si N(0) > K, decrecen hacia la capacidad máxima.`
  }
];

// ============================================================================
// 4. CONSTRUCCIÓN E INTERACTIVIDAD DE CADA TARJETA DE ENUNCIADO
// ============================================================================
const feedContainer = document.getElementById("models-feed");
const instances = [];

ENUNCIADOS.forEach((model) => {
  const state = {
    model,
    params: {},
    view: { ...model.view },
    customPoints: [],
    showField: true,
    showCurves: true
  };
  model.params.forEach((p) => (state.params[p.key] = p.value));

  const section = document.createElement("section");
  section.className = "edo-section-card";
  section.id = `enunciado-${model.id}`;

  section.innerHTML = `
    <div class="enunciado-header">
      <div class="enunciado-title-group">
        <span class="enun-tag">${model.tag}</span>
        <h3>${model.title}</h3>
        <p>${model.description}</p>
      </div>
      <div class="equation-box">
        <small>ECUACIÓN DIFERENCIAL</small>
        <div class="eq-formula-display">${model.eqHtml}</div>
      </div>
    </div>

    <div class="edo-workspace">
      <!-- GRÁFICA INTERACTIVA -->
      <div class="graph-box">
        <div class="graph-toolbar">
          <span class="coords-live" id="coords-${model.id}">X: 0.00 | Y: 0.00 | dy/dx: 0.00</span>
          <div class="graph-btns">
            <button class="tool-btn" data-act="zoom-in" title="Acercar">+ Zoom</button>
            <button class="tool-btn" data-act="zoom-out" title="Alejar">- Zoom</button>
            <button class="tool-btn" data-act="reset" title="Centrar vista">Centrar</button>
            <button class="tool-btn" data-act="clear" title="Borrar curvas extra">Limpiar</button>
          </div>
        </div>
        <div class="canvas-container" id="wrap-${model.id}">
          <canvas class="edo-canvas" id="canvas-${model.id}"></canvas>
        </div>
        <div class="graph-footer-hint">
          Haz clic en cualquier punto de la gráfica para trazar una curva solución nueva // Arrastra para moverte
        </div>
      </div>

      <!-- PARÁMETROS Y FUNCIONES SOLUCIÓN (SIN RIELES DE DESPLAZAMIENTO) -->
      <div class="controls-and-functions">
        <div class="sub-panel">
          <div class="sub-panel-title">PARÁMETROS DE LA ECUACIÓN</div>
          <div id="sliders-${model.id}"></div>
          <div class="check-row">
            <label><input type="checkbox" id="chk-field-${model.id}" checked /> Mostrar campo de direcciones</label>
            <label><input type="checkbox" id="chk-curves-${model.id}" checked /> Mostrar familia de curvas</label>
          </div>
        </div>

        <div class="sub-panel">
          <div class="sub-panel-title">PUNTOS INICIALES Y CURVAS SOLUCIÓN (RESUELVE EDO)</div>
          <div class="functions-list" id="fn-list-${model.id}"></div>
          <div class="add-curve-form">
            <input type="number" step="0.5" id="in-x-${model.id}" placeholder="x₀ (ej. 0)" value="0" />
            <input type="number" step="0.5" id="in-y-${model.id}" placeholder="y₀" />
            <button class="cyber-btn-solid" id="btn-add-${model.id}">+ TRAZAR</button>
          </div>
        </div>

        <div class="conclusion-note" id="note-${model.id}"></div>
      </div>
    </div>
  `;

  feedContainer.appendChild(section);

  const canvas = document.getElementById(`canvas-${model.id}`);
  const ctx = canvas.getContext("2d");
  state.canvas = canvas;
  state.ctx = ctx;

  // Renderizar sliders de parámetros
  const slidersBox = document.getElementById(`sliders-${model.id}`);
  model.params.forEach((p) => {
    const div = document.createElement("div");
    div.className = "slider-group";
    div.innerHTML = `
      <div class="slider-top">
        <span>${p.label}</span>
        <span id="lbl-${model.id}-${p.key}">${p.value}</span>
      </div>
      <input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" />
    `;
    div.querySelector("input").addEventListener("input", (e) => {
      state.params[p.key] = parseFloat(e.target.value);
      document.getElementById(`lbl-${model.id}-${p.key}`).textContent = state.params[p.key];
      updateFunctionsList(state);
      drawGraph(state);
    });
    slidersBox.appendChild(div);
  });

  // Checkboxes
  document.getElementById(`chk-field-${model.id}`).addEventListener("change", (e) => {
    state.showField = e.target.checked;
    drawGraph(state);
  });
  document.getElementById(`chk-curves-${model.id}`).addEventListener("change", (e) => {
    state.showCurves = e.target.checked;
    drawGraph(state);
  });

  // Botones de barra superior de gráfica
  section.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      if (act === "zoom-in") zoomGraph(state, 0.8);
      if (act === "zoom-out") zoomGraph(state, 1.25);
      if (act === "reset") {
        state.view = { ...model.view };
        drawGraph(state);
      }
      if (act === "clear") {
        state.customPoints = [];
        updateFunctionsList(state);
        drawGraph(state);
      }
    });
  });

  // Agregar punto manual
  document.getElementById(`btn-add-${model.id}`).addEventListener("click", () => {
    const x0 = parseFloat(document.getElementById(`in-x-${model.id}`).value) || 0;
    const y0 = parseFloat(document.getElementById(`in-y-${model.id}`).value);
    if (!isNaN(y0)) {
      addCustomCurve(state, x0, y0);
    }
  });

  // Interacción con el mouse en el canvas
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let dragDist = 0;

  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    dragDist = 0;
    dragStart = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = screenToMathX(state, e.clientX - rect.left);
    const my = screenToMathY(state, e.clientY - rect.top);
    const slope = model.derivative(mx, my, state.params);
    document.getElementById(`coords-${model.id}`).textContent =
      `X: ${mx.toFixed(2)} | Y: ${my.toFixed(2)} | dy/dx: ${isFinite(slope) ? slope.toFixed(2) : "∞"}`;

    if (!dragging) return;
    const dxPx = e.clientX - dragStart.x;
    const dyPx = e.clientY - dragStart.y;
    dragDist += Math.hypot(dxPx, dyPx);

    const dxMath = (dxPx / canvas.width) * (state.view.xMax - state.view.xMin);
    const dyMath = (dyPx / canvas.height) * (state.view.yMax - state.view.yMin);

    state.view.xMin -= dxMath;
    state.view.xMax -= dxMath;
    state.view.yMin += dyMath;
    state.view.yMax += dyMath;

    dragStart = { x: e.clientX, y: e.clientY };
    drawGraph(state);
  });

  window.addEventListener("mouseup", (e) => {
    if (dragging && dragDist < 5) {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const mx = screenToMathX(state, e.clientX - rect.left);
        const my = screenToMathY(state, e.clientY - rect.top);
        addCustomCurve(state, mx, my);
      }
    }
    dragging = false;
  });

  instances.push(state);
  updateFunctionsList(state);
});

function addCustomCurve(state, x0, y0) {
  const colors = ["#ffffff", "#00ff88", "#80ffc4", "#39ff14"];
  const idx = state.customPoints.length + 1;
  state.customPoints.push({
    label: `P${idx}`,
    x0,
    y0,
    cVal: +(y0 - (state.params.Tamb || 0)).toFixed(2),
    color: colors[idx % colors.length]
  });
  updateFunctionsList(state);
  drawGraph(state);
}

function updateFunctionsList(state) {
  const { model, params, customPoints } = state;
  const listEl = document.getElementById(`fn-list-${model.id}`);
  const noteEl = document.getElementById(`note-${model.id}`);
  const allPts = [...model.presets(params), ...customPoints];

  let html = `
    <div class="fn-row">
      <span class="fn-color" style="background:#ffffff"></span>
      <div class="fn-text">
        <strong>${model.fnText}</strong>
        <span>→ CampoDirecciones(f)</span>
      </div>
    </div>
  `;

  allPts.forEach((pt) => {
    html += `
      <div class="fn-row">
        <span class="fn-color" style="background:${pt.color}"></span>
        <div class="fn-text">
          <strong>${pt.label} = (${pt.x0.toFixed(1)}, ${pt.y0.toFixed(2)})</strong>
          <span>→ Sol: ${model.solFormula(pt, params)}</span>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  noteEl.textContent = model.analysis(params);
}

function zoomGraph(state, factor) {
  const cx = (state.view.xMin + state.view.xMax) / 2;
  const cy = (state.view.yMin + state.view.yMax) / 2;
  const hw = ((state.view.xMax - state.view.xMin) / 2) * factor;
  const hh = ((state.view.yMax - state.view.yMin) / 2) * factor;
  state.view = { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
  drawGraph(state);
}

function mathToScreenX(state, x) {
  return ((x - state.view.xMin) / (state.view.xMax - state.view.xMin)) * state.canvas.width;
}
function mathToScreenY(state, y) {
  return state.canvas.height - ((y - state.view.yMin) / (state.view.yMax - state.view.yMin)) * state.canvas.height;
}
function screenToMathX(state, px) {
  return state.view.xMin + (px / state.canvas.width) * (state.view.xMax - state.view.xMin);
}
function screenToMathY(state, py) {
  return state.view.yMin + ((state.canvas.height - py) / state.canvas.height) * (state.view.yMax - state.view.yMin);
}

function rk4Integrate(state, x0, y0, dir) {
  const pts = [{ x: x0, y: y0 }];
  let x = x0;
  let y = y0;
  const h = 0.04 * dir;
  const f = state.model.derivative;

  for (let i = 0; i < 260; i++) {
    const k1 = f(x, y, state.params);
    const k2 = f(x + h / 2, y + (h * k1) / 2, state.params);
    const k3 = f(x + h / 2, y + (h * k2) / 2, state.params);
    const k4 = f(x + h, y + h * k3, state.params);
    if (!isFinite(k1) || !isFinite(k2) || !isFinite(k3) || !isFinite(k4)) break;

    x += h;
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    pts.push({ x, y });

    if (
      x < state.view.xMin - 1 ||
      x > state.view.xMax + 1 ||
      y < state.view.yMin - 3 ||
      y > state.view.yMax + 3
    ) {
      break;
    }
  }
  return pts;
}

function drawGraph(state) {
  const wrap = document.getElementById(`wrap-${state.model.id}`);
  const { canvas, ctx, view } = state;
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;

  ctx.fillStyle = "#020a06";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cuadrícula y ejes
  const xSpan = view.xMax - view.xMin;
  const ySpan = view.yMax - view.yMin;
  const xStep = xSpan > 12 ? 2 : 1;
  const yStep = ySpan > 12 ? 2 : 0.5;

  ctx.font = "11px 'Share Tech Mono', monospace";

  for (let x = Math.ceil(view.xMin / xStep) * xStep; x <= view.xMax; x += xStep) {
    const px = mathToScreenX(state, x);
    const isAxis = Math.abs(x) < 1e-6;
    ctx.strokeStyle = isAxis ? "rgba(255,255,255,0.65)" : "rgba(0,255,136,0.12)";
    ctx.lineWidth = isAxis ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();

    if (!isAxis) {
      ctx.fillStyle = "rgba(216,245,231,0.65)";
      const ay = Math.min(Math.max(mathToScreenY(state, 0) + 14, 14), canvas.height - 6);
      ctx.fillText(x.toFixed(1).replace(".0", ""), px + 3, ay);
    }
  }

  for (let y = Math.ceil(view.yMin / yStep) * yStep; y <= view.yMax; y += yStep) {
    const py = mathToScreenY(state, y);
    const isAxis = Math.abs(y) < 1e-6;
    ctx.strokeStyle = isAxis ? "rgba(255,255,255,0.65)" : "rgba(0,255,136,0.12)";
    ctx.lineWidth = isAxis ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();

    if (!isAxis) {
      ctx.fillStyle = "rgba(216,245,231,0.65)";
      const ax = Math.min(Math.max(mathToScreenX(state, 0) + 6, 6), canvas.width - 32);
      ctx.fillText(y.toFixed(1).replace(".0", ""), ax, py - 3);
    }
  }

  // Campo de direcciones
  if (state.showField) {
    const cols = canvas.width < 500 ? 16 : 24;
    const rows = canvas.height < 360 ? 14 : 20;
    const dx = (view.xMax - view.xMin) / cols;
    const dy = (view.yMax - view.yMin) / rows;
    const seg = Math.min(canvas.width / cols, canvas.height / rows) * 0.34;
    const scaleX = canvas.width / (view.xMax - view.xMin);
    const scaleY = canvas.height / (view.yMax - view.yMin);

    ctx.lineWidth = 1.25;
    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = view.xMin + i * dx;
        const y = view.yMin + j * dy;
        const slope = state.model.derivative(x, y, state.params);
        if (!isFinite(slope)) continue;

        const angle = Math.atan(slope * (scaleY / scaleX));
        const cx = mathToScreenX(state, x);
        const cy = mathToScreenY(state, y);
        const vx = Math.cos(angle) * seg;
        const vy = -Math.sin(angle) * seg;

        ctx.strokeStyle = Math.abs(slope) < 0.25 ? "rgba(255,255,255,0.55)" : "rgba(0,255,136,0.45)";
        ctx.beginPath();
        ctx.moveTo(cx - vx, cy - vy);
        ctx.lineTo(cx + vx, cy + vy);
        ctx.stroke();
      }
    }
  }

  // Familia de curvas solución
  if (state.showCurves) {
    const allPts = [...state.model.presets(state.params), ...state.customPoints];
    allPts.forEach((pt) => {
      const fwd = rk4Integrate(state, pt.x0, pt.y0, 1);
      const bwd = rk4Integrate(state, pt.x0, pt.y0, -1);
      const curve = [...bwd.reverse(), ...fwd.slice(1)];

      ctx.strokeStyle = pt.color;
      ctx.lineWidth = pt.color === "#ffffff" ? 2.5 : 2.1;
      ctx.beginPath();
      curve.forEach((p, idx) => {
        const sx = mathToScreenX(state, p.x);
        const sy = mathToScreenY(state, p.y);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();

      // Punto inicial A, B, C...
      const px = mathToScreenX(state, pt.x0);
      const py = mathToScreenY(state, pt.y0);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px 'Orbitron', sans-serif";
      ctx.fillText(pt.label, px + 7, py - 6);
    });
  }
}

function redrawAllGraphs() {
  instances.forEach(drawGraph);
}

window.addEventListener("resize", redrawAllGraphs);
redrawAllGraphs();

// ============================================================================
// 5. GENERADOR DE CÓDIGO QR INTEGRADO PARA GITHUB PAGES
// ============================================================================
(function initQrModal() {
  const modal = document.getElementById("qr-modal");
  const openBtn1 = document.getElementById("btn-open-qr");
  const openBtn2 = document.getElementById("btn-footer-qr");
  const closeBtn = document.getElementById("btn-close-qr");
  const urlInput = document.getElementById("github-url-input");
  const updateBtn = document.getElementById("btn-update-qr");
  const downloadBtn = document.getElementById("btn-download-qr");
  const qrCanvas = document.getElementById("qr-canvas");
  const qrCaption = document.getElementById("qr-url-caption");

  const defaultUrl = window.location.href.startsWith("http")
    ? window.location.href
    : "https://hector-rivapalacio.github.io/actividad-2.2.2.1/";
  urlInput.value = defaultUrl;

  function renderQr(text) {
    qrCaption.textContent = text;
    const ctx = qrCanvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
      ctx.drawImage(img, 10, 10, 200, 200);
    };
    img.onerror = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 220, 220);
      ctx.fillStyle = "#020805";
      ctx.font = "bold 12px monospace";
      ctx.fillText("CONECTA A INTERNET PARA", 22, 100);
      ctx.fillText("GENERAR EL QR DE LA URL", 22, 120);
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=020805&bgcolor=ffffff&data=${encodeURIComponent(text)}`;
  }

  openBtn1.addEventListener("click", () => {
    modal.classList.remove("hidden");
    renderQr(urlInput.value.trim() || defaultUrl);
  });
  openBtn2.addEventListener("click", () => {
    modal.classList.remove("hidden");
    renderQr(urlInput.value.trim() || defaultUrl);
  });
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  updateBtn.addEventListener("click", () => {
    const val = urlInput.value.trim();
    if (val) renderQr(val);
  });

  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "QR-Actividad-2.2.2.1-Hector-Riva-Palacio.png";
    link.href = qrCanvas.toDataURL("image/png");
    link.click();
  });
})();
