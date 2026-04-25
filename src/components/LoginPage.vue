<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { login, authError } = useAuth()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!username.value.trim() || !password.value) return
  isSubmitting.value = true
  await login(username.value.trim(), password.value)
  isSubmitting.value = false
}
</script>

<template>
  <div class="login-wrapper">
    <form class="login-card" novalidate @submit.prevent="handleSubmit">
      <h1 class="login-title">Accesso</h1>

      <div class="login-field">
        <label class="login-label" for="login-username">Utente</label>
        <input
          id="login-username"
          v-model="username"
          class="login-input"
          type="text"
          autocomplete="username"
          placeholder="Inserire utente"
          :disabled="isSubmitting"
        />
      </div>

      <div class="login-field">
        <label class="login-label" for="login-password">Password</label>
        <input
          id="login-password"
          v-model="password"
          class="login-input"
          type="password"
          autocomplete="current-password"
          placeholder="Inserire password"
          :disabled="isSubmitting"
        />
      </div>

      <p v-if="authError" class="login-error" role="alert">
        {{ authError }}
      </p>

      <button
        class="login-btn"
        type="submit"
        :disabled="isSubmitting || !username.trim() || !password"
      >
        {{ isSubmitting ? 'Attendere…' : 'Accedi' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
/* ── Full-screen centred wrapper ─────────────────────────── */
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--bg-main);
  transition: background 0.25s;
}

/* ── Card ────────────────────────────────────────────────── */
.login-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: min(20rem, 90%);
  padding: 1.5rem;
  background: var(--bg-bar);
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition: background 0.25s, border-color 0.25s;
}

/* ── Title ───────────────────────────────────────────────── */
.login-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  text-align: center;
}

/* ── Field ───────────────────────────────────────────────── */
.login-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.login-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.login-input {
  width: 100%;
  padding: 0.5rem 0.65rem;
  background: var(--bg-btn);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, background 0.15s;
}

.login-input:focus {
  border-color: var(--btn-active-border);
}

.login-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Error message ───────────────────────────────────────── */
.login-error {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #f85149;
  text-align: center;
}

/* ── Submit button ───────────────────────────────────────── */
.login-btn {
  width: 100%;
  padding: 0.55rem;
  background: var(--btn-active-bg);
  border: 1px solid var(--btn-active-border);
  border-radius: 0.4rem;
  color: var(--text-blue);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.12s;
  touch-action: manipulation;
}

.login-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.login-btn:not(:disabled):active {
  opacity: 0.75;
}
</style>
