<script setup>
defineProps({
  breadcrumbs: {
    type: Array,
    required: true,
  },
  visibleMenuItems: {
    type: Array,
    required: true,
  },
  currentPageId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['navigate-breadcrumb', 'select-item'])
</script>

<template>
  <nav class="menu-breadcrumb" aria-label="Percorso menu">
    <template v-for="(crumb, i) in breadcrumbs" :key="crumb.id ?? 'root'">
      <span v-if="i > 0" class="breadcrumb-sep" aria-hidden="true">›</span>
      <button
        v-if="i < breadcrumbs.length - 1"
        type="button"
        class="breadcrumb-item"
        @click="emit('navigate-breadcrumb', i)"
      >{{ crumb.label }}</button>
      <span v-else class="breadcrumb-item breadcrumb-item--current">{{ crumb.label }}</span>
    </template>
  </nav>
  <ul class="menu-list">
    <li v-for="item in visibleMenuItems" :key="item.id">
      <button
        class="menu-item"
        :class="{ 'menu-item--current': item.id === currentPageId }"
        type="button"
        @click="emit('select-item', item)"
      >
        <span>{{ item.label }}</span>
        <span v-if="item.submenus.length" class="submenu-indicator" aria-hidden="true">›</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
/* ── Menu breadcrumb ────────────────────────────────────── */
.menu-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  width: min(100%, 32rem);
}

.breadcrumb-item {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8b949e;
  padding: 0.2rem 0.45rem;
  min-height: unset;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 0.3rem;
  transition: color 0.12s, background 0.12s;
}

.breadcrumb-item:not(.breadcrumb-item--current):hover {
  color: #e6edf3;
  background: #21262d;
  border-color: #30363d;
}

.breadcrumb-item--current {
  color: #e6edf3;
  cursor: default;
  display: inline-flex;
  align-items: center;
}

.breadcrumb-sep {
  color: #484f58;
  font-size: 1rem;
  line-height: 1;
  user-select: none;
}

/* ── Menu list ──────────────────────────────────────────── */
.menu-list {
  width: min(100%, 32rem);
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  overflow-y: auto;
}

.menu-item {
  width: 100%;
  min-height: 3.2rem;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.4rem;
  border: 1px solid var(--border);
  background: var(--bg-btn);
  font-size: 1rem;
  color: var(--text-primary);
}

.menu-item:active {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
}

.menu-item--current {
  border-color: #388bfd;
  background: #388bfd22;
  color: #58a6ff;
}

.submenu-indicator {
  margin-left: 0.65rem;
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1;
}
</style>
