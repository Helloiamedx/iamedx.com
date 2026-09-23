/**
 * CARD ENTRANCE MOTION — 六种卡片出场动效（原始交接版本，逐字保留）
 *
 * 来源：用户 2026-09-21 提供的 ChatGPT 小组件脚本。
 * 状态：**已收录，未接入站点**。需要时再按 `card-motion.mdc` 的协议移植。
 *
 * 依赖说明（移植时必须替换）：
 * - DOM 契约：根节点 `#card-motion`，卡片 `.cm-card`，
 *   卡片内 `.cm-text` / `.cm-art`，控件 `.cm-choice` / `.cm-current` /
 *   `.cm-detail` / `.cm-replay`。站点目前没有这套结构。
 * - `window.openai.setWidgetState` / `window.openai.widgetState` /
 *   `openai:set_globals`：ChatGPT Apps SDK 的组件状态持久化，站点用不到。
 * - `globalThis.Tweak`：ChatGPT 调试面板的速度滑杆，站点用不到。
 */
(() => {
  const root = document.getElementById("card-motion");
  const cards = [...root.querySelectorAll(".cm-card")];
  const state = { effect: "C02", speed: 1 };
  const effects = {
    C01: ["整组轻升", "同时上移 28px · 1000ms"],
    C02: ["错峰上浮", "依次上移 36px · 间隔 120ms"],
    C03: ["缩放落定", "缩放 94% → 100% · 间隔 100ms"],
    C04: ["横向滑入", "从右侧滑入 56px · 间隔 130ms"],
    C05: ["微倾归位", "倾斜 7° → 0° · 间隔 120ms"],
    C06: ["卡片先行", "卡片先出现 · 内容延后 220ms"],
  };
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let running = [];
  function animate(el, frames, duration, delay = 0) {
    running.push(
      el.animate(frames, {
        duration: duration / state.speed,
        delay: delay / state.speed,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "both",
      }),
    );
  }
  function fadeMove(y) {
    return [
      { opacity: 0, transform: `translateY(${y}px)` },
      { opacity: 1, transform: "translateY(0)" },
    ];
  }
  function render(explicit = false) {
    running.forEach((a) => a.cancel());
    running = [];
    root.querySelector(".cm-current").textContent =
      `${state.effect} · ${effects[state.effect][0]}`;
    root.querySelector(".cm-detail").textContent = effects[state.effect][1];
    root
      .querySelectorAll(".cm-choice")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.effect === state.effect),
        ),
      );
    if (motionPreference.matches && !explicit) return;
    cards.forEach((card, i) => {
      const lead = 140;
      switch (state.effect) {
        case "C01":
          animate(card, fadeMove(28), 1000, lead);
          break;
        case "C02":
          animate(card, fadeMove(36), 1000, lead + i * 120);
          break;
        case "C03":
          animate(
            card,
            [
              { opacity: 0, transform: "scale(.94) translateY(12px)" },
              { opacity: 1, transform: "scale(1) translateY(0)" },
            ],
            1150,
            lead + i * 100,
          );
          break;
        case "C04":
          animate(
            card,
            [
              { opacity: 0, transform: "translateX(56px)" },
              { opacity: 1, transform: "translateX(0)" },
            ],
            1050,
            lead + i * 130,
          );
          break;
        case "C05":
          animate(
            card,
            [
              {
                opacity: 0,
                transform: "translateY(30px) rotateX(7deg) scale(.98)",
              },
              { opacity: 1, transform: "translateY(0) rotateX(0deg) scale(1)" },
            ],
            1200,
            lead + i * 120,
          );
          break;
        case "C06":
          animate(card, fadeMove(24), 900, lead + i * 110);
          animate(
            card.querySelector(".cm-text"),
            fadeMove(14),
            800,
            lead + 220 + i * 110,
          );
          animate(
            card.querySelector(".cm-art"),
            [
              { opacity: 0, filter: "blur(7px)" },
              { opacity: 1, filter: "blur(0)" },
            ],
            1000,
            lead + 300 + i * 110,
          );
          break;
      }
    });
  }
  function save() {
    if (window.openai?.setWidgetState)
      window.openai
        .setWidgetState({
          modelContent: {
            selectedCardEffect: `${state.effect} ${effects[state.effect][0]}`,
          },
          privateContent: { effect: state.effect, speed: state.speed },
        })
        .catch(() => {});
  }
  function restore(saved) {
    const s = saved?.privateContent;
    if (s && effects[s.effect]) state.effect = s.effect;
    if (s && Number.isFinite(s.speed))
      state.speed = Math.max(0.5, Math.min(1.5, s.speed));
  }
  restore(window.openai?.widgetState);
  root.querySelectorAll(".cm-choice").forEach((button) =>
    button.addEventListener("click", () => {
      state.effect = button.dataset.effect;
      render(true);
      save();
    }),
  );
  root.querySelector(".cm-replay").addEventListener("click", () => render(true));
  window.addEventListener("openai:set_globals", (event) => {
    if (event.detail?.globals?.widgetState) {
      restore(event.detail.globals.widgetState);
      render();
    }
  });
  motionPreference.addEventListener("change", () => render());
  render();
  if (globalThis.Tweak) {
    const tweak = new Tweak({
      container: root,
      onChange: () => {
        render(true);
        save();
      },
    });
    tweak.addSlider(state, "speed", {
      label: "卡片出场速度",
      min: 0.5,
      max: 1.5,
      step: 0.1,
      unit: "×",
    });
  }
})();
