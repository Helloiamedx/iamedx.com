# Card entrance motion — 六种卡片出场动效

**状态：已收录，未接入站点。** 需要时按 `.cursor/rules/card-motion.mdc` 的协议移植。

站点当前在用的是 **Apple 出场**（`lib/appleCardReveal.ts`，首页三个卡片 band）。
这里存档的 C 系列是另一套协议，**没有站点实现**：早期曾有一份
`lib/cardMotion.ts`，在首页改用 Apple 出场后已被用户要求删除。
要恢复 C 系列就从本目录重新移植，不要去 import 已经不存在的模块。

## 文件

- `card-entrance.js` — 用户提供的原始脚本，逐字保留（含中文注释）

## 固定映射

| 编号 | 名称 | 参数 |
| --- | --- | --- |
| C01 | 整组轻升 | 同时上移 28px · 1000ms（无错开） |
| C02 | 错峰上浮 | 依次上移 36px · 1000ms · 间隔 120ms（默认） |
| C03 | 缩放落定 | `scale(.94) translateY(12px)` → `scale(1) translateY(0)` · 1150ms · 间隔 100ms |
| C04 | 横向滑入 | 从右 `translateX(56px)` → 0 · 1050ms · 间隔 130ms |
| C05 | 微倾归位 | `translateY(30px) rotateX(7deg) scale(.98)` → 归零 · 1200ms · 间隔 120ms |
| C06 | 卡片先行 | 卡片 24px/900ms；`.cm-text` 14px 延后 +220ms/800ms；`.cm-art` blur 7→0 延后 +300ms/1000ms。间隔 110ms |

公共参数：

- 基础延迟 `lead = 140ms`
- 缓动 `cubic-bezier(.22,1,.36,1)`（所有效果统一）
- `fill: 'both'`，重播前 `cancel()` 全部动画
- 速度倍率 `speed`：0.5×–1.5×，`duration` 与 `delay` 同时除以 `speed`
- 尊重 `prefers-reduced-motion`：命中时不播（`explicit` 手动触发除外）

## DOM 契约（站点目前没有，移植时要建立）

```
#card-motion
  .cm-current / .cm-detail / .cm-replay / .cm-choice[data-effect]
  .cm-card            ← 每个卡片
    .cm-text          ← C06 用
    .cm-art           ← C06 用
```

## 移植时需要替换的部分

1. **`window.openai.setWidgetState` / `window.openai.widgetState` / `openai:set_globals`**
   → ChatGPT Apps SDK 的组件状态持久化。站点无用，删掉 `save()` 与 `restore()`，
   或在站点侧换成 React state / sessionStorage。
2. **`globalThis.Tweak`** → ChatGPT 调试面板的速度滑杆。站点无用，删掉该分支。
3. **`#card-motion` / `.cm-*` 类名** → 换成目标组件自己的类名。
4. **`speed` 倍数** → 若站点沿用 `<HeadlineMotion>` 的 `speed` 约定（>1 更快），
   这里的语义一致，可直接映射。

## 与 headline-motion 的关系

两套是**独立协议**，编号前缀不同、不要混用：

- 标题出场：`01`–`07` → `lib/headlineMotion.ts` + `components/HeadlineMotion.tsx`
- 卡片出场 — Apple 出场（站点在用）→ `lib/appleCardReveal.ts`
- 卡片出场 — `C01`–`C06`（存档，未接入）→ 本目录
