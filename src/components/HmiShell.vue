<script setup>
defineProps({
  theme: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="hmi-shell" :data-theme="theme">
    <slot name="header" />
    <slot name="notification" />
    <main class="content">
      <slot />
    </main>
    <slot name="footer" />
  </div>
</template>

<style scoped>
/* ── Theme: dark (default) ──────────────────────────────── */
.hmi-shell[data-theme='dark'] {
  --bg-main: #161b22;
  --bg-bar: #0d1117;
  --bg-btn: #21262d;
  --border: #30363d;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-blue: #58a6ff;
  --text-green: #3fb950;
  --status-bg: rgba(35, 134, 54, 0.2);
  --status-border: rgba(63, 185, 80, 0.4);
  --status-color: #3fb950;
  --status-ok-bg: rgba(63, 185, 80, 0.1);
  --status-ok-border: rgba(63, 185, 80, 0.35);
  --status-warning-color: #e3a008;
  --status-warning-bg: rgba(227, 160, 8, 0.12);
  --status-warning-border: rgba(227, 160, 8, 0.4);
  --status-critical-color: #f85149;
  --status-critical-bg: rgba(248, 81, 73, 0.12);
  --status-critical-border: rgba(248, 81, 73, 0.4);
  --btn-active-bg: #388bfd22;
  --btn-active-border: #388bfd;
  --active-border: rgba(63, 185, 80, 0.5);
  --active-name-bg: rgba(35, 134, 54, 0.2);
  --active-name-border: rgba(63, 185, 80, 0.4);
  --active-text: #3fb950;
  --transaction-modified-border: #c99500;
  --transaction-modified-bg: #fff3bf;
  --transaction-modified-text: #5f4300;
  --notification-normal-bg: var(--bg-bar);
  --notification-normal-border: var(--border);
  --notification-normal-text: var(--text-primary);
  --notification-warning-bg: #4a3900;
  --notification-warning-border: #c99500;
  --notification-warning-text: #ffe08a;
  --notification-success-bg: #123a22;
  --notification-success-border: #2ea043;
  --notification-success-text: #b7f5c8;
  --notification-error-bg: #4b141b;
  --notification-error-border: #f85149;
  --notification-error-text: #ffd6d6;
  --scrollbar-track: color-mix(in srgb, var(--bg-main) 72%, black);
  --scrollbar-thumb: color-mix(in srgb, var(--text-secondary) 55%, var(--bg-main));
  --scrollbar-thumb-hover: color-mix(in srgb, var(--text-blue) 55%, var(--text-secondary));
}

/* ── Theme: light ───────────────────────────────────────── */
.hmi-shell[data-theme='light'] {
  --bg-main: #f6f8fa;
  --bg-bar: #ffffff;
  --bg-btn: #f0f3f6;
  --border: #d0d7de;
  --text-primary: #1f2328;
  --text-secondary: #57606a;
  --text-blue: #0550ae;
  --text-green: #1a7f37;
  --status-bg: rgba(31, 136, 61, 0.1);
  --status-border: rgba(31, 136, 61, 0.35);
  --status-color: #1a7f37;
  --status-ok-bg: rgba(31, 136, 61, 0.1);
  --status-ok-border: rgba(31, 136, 61, 0.35);
  --status-warning-color: #d97706;
  --status-warning-bg: rgba(217, 119, 6, 0.1);
  --status-warning-border: rgba(217, 119, 6, 0.4);
  --status-critical-color: #dc2626;
  --status-critical-bg: rgba(220, 38, 38, 0.1);
  --status-critical-border: rgba(220, 38, 38, 0.4);
  --btn-active-bg: rgba(5, 80, 174, 0.1);
  --btn-active-border: #0550ae;
  --active-border: rgba(31, 136, 61, 0.45);
  --active-name-bg: rgba(31, 136, 61, 0.1);
  --active-name-border: rgba(31, 136, 61, 0.35);
  --active-text: #1a7f37;
  --transaction-modified-border: #c99500;
  --transaction-modified-bg: #fff3bf;
  --transaction-modified-text: #5f4300;
  --notification-normal-bg: var(--bg-bar);
  --notification-normal-border: var(--border);
  --notification-normal-text: var(--text-primary);
  --notification-warning-bg: #fff3bf;
  --notification-warning-border: #c99500;
  --notification-warning-text: #5f4300;
  --notification-success-bg: #dcffe4;
  --notification-success-border: #2da44e;
  --notification-success-text: #0f5132;
  --notification-error-bg: #ffe3e3;
  --notification-error-border: #d1242f;
  --notification-error-text: #7f1d1d;
  --scrollbar-track: color-mix(in srgb, var(--bg-main) 92%, black);
  --scrollbar-thumb: color-mix(in srgb, var(--text-secondary) 45%, var(--bg-main));
  --scrollbar-thumb-hover: color-mix(in srgb, var(--text-blue) 45%, var(--text-secondary));
}

/* ── Theme: nvis (Night Vision Imaging System – MIL-L-85762) ── */
/* Low-luminance deep-red palette to minimise NVG bleed.         */
/* Spectral output shifts toward 625-780 nm (red / near-IR),     */
/* replacing all green, blue, and amber hues with dim red tones. */
/* Full MIL-L-85762 certification requires photometric testing   */
/* on physical display hardware.                                  */
.hmi-shell[data-theme='nvis'] {
  --bg-main: #0a0000;
  --bg-bar: #060000;
  --bg-btn: #180500;
  --border: #3d1500;
  --text-primary: #cc2200;
  --text-secondary: #7a1800;
  --text-blue: #aa2200;
  --text-green: #8b1a00;
  --status-bg: rgba(100, 20, 0, 0.3);
  --status-border: rgba(150, 30, 0, 0.5);
  --status-color: #8b1a00;
  --status-ok-bg: rgba(100, 20, 0, 0.2);
  --status-ok-border: rgba(120, 30, 0, 0.4);
  --status-warning-color: #8b3300;
  --status-warning-bg: rgba(80, 30, 0, 0.25);
  --status-warning-border: rgba(100, 40, 0, 0.5);
  --status-critical-color: #8b0000;
  --status-critical-bg: rgba(80, 0, 0, 0.25);
  --status-critical-border: rgba(100, 0, 0, 0.5);
  --btn-active-bg: rgba(150, 30, 0, 0.15);
  --btn-active-border: #aa2200;
  --active-border: rgba(120, 25, 0, 0.5);
  --active-name-bg: rgba(80, 15, 0, 0.3);
  --active-name-border: rgba(120, 25, 0, 0.5);
  --active-text: #8b1a00;
  --transaction-modified-border: #7a3300;
  --transaction-modified-bg: #1a0800;
  --transaction-modified-text: #cc5500;
  --notification-normal-bg: var(--bg-bar);
  --notification-normal-border: var(--border);
  --notification-normal-text: var(--text-primary);
  --notification-warning-bg: #1a0800;
  --notification-warning-border: #7a3300;
  --notification-warning-text: #cc5500;
  --notification-success-bg: #0d0500;
  --notification-success-border: #5a1a00;
  --notification-success-text: #8b3300;
  --notification-error-bg: #1a0000;
  --notification-error-border: #6b0000;
  --notification-error-text: #cc0000;
  --scrollbar-track: #060000;
  --scrollbar-thumb: #3d1500;
  --scrollbar-thumb-hover: #5a2000;
}

/* ── Shell ──────────────────────────────────────────────── */
.hmi-shell {
  display: grid;
  grid-template-rows: 3.5rem auto 1fr 4.5rem;
  width: 100%;
  height: 100%;
  background: var(--bg-main);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: background 0.25s, color 0.25s, border-color 0.25s;
}

/* ── Content ────────────────────────────────────────────── */
.content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

.content::-webkit-scrollbar {
  width: 0.6rem;
}

.content::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 999px;
}

.content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 999px;
  border: 2px solid var(--scrollbar-track);
}

.content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

@media (max-width: 600px), (max-height: 600px) {
  .hmi-shell {
    border-radius: 0;
    border: none;
  }
}
</style>
