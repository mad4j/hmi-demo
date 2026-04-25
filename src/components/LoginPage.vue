<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { menuConfig } from '../composables/useMenuConfig.js'
import { useLoginStore } from '../composables/useLoginStore.js'

const { login, isLoginLoading, loginError } = useLoginStore()

const username = ref('')
const password = ref('')
const submitted = ref(false)

const handleSubmit = async () => {
  submitted.value = true
  if (!username.value.trim() || !password.value) return
  await login(username.value.trim(), password.value)
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <AppIcon name="login" :size="32" class="login-icon" />
        <span class="login-title">{{ menuConfig.title }}</span>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="field-group">
          <label class="field-label" for="login-username">Utente</label>
          <input
            id="login-username"
            v-model="username"
            class="field-input"
            type="text"
            autocomplete="username"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            :disabled="isLoginLoading"
            placeholder="admin"
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="login-password">Password</label>
          <input
            id="login-password"
            v-model="password"
            class="field-input"
            type="password"
            autocomplete="current-password"
            :disabled="isLoginLoading"
            placeholder="••••"
          />
        </div>

        <p v-if="loginError" class="login-error" role="alert">{{ loginError }}</p>
        <p
          v-else-if="submitted && (!username.trim() || !password)"
          class="login-error"
          role="alert"
        >Inserire utente e password</p>

        <button
          class="login-btn"
          type="submit"
          :disabled="isLoginLoading || !username.trim() || !password"
        >
          <span v-if="isLoginLoading" class="login-spinner" aria-hidden="true" />
          <span>{{ isLoginLoading ? 'Accesso in corso…' : 'Accedi' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  min-height: 0;
  overflow-y: auto;
}

.login-card {
  width: 100%;
  max-width: 22rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: var(--bg-btn);
  overflow: hidden;
  transition: background 0.25s, border-color 0.25s;
}

.login-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  background: var(--bg-main);
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  transition: background 0.25s, border-color 0.25s, color 0.25s;
}

.login-icon {
  color: var(--text-blue);
  flex-shrink: 0;
}

.login-title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.1rem 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.field-input {
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: var(--bg-main);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, background 0.25s, color 0.25s;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: var(--btn-active-border);
}

.field-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.login-error {
  margin: 0;
  padding: 0.45rem 0.65rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(248, 81, 73, 0.4);
  background: rgba(248, 81, 73, 0.12);
  color: #f85149;
  font-size: 0.8rem;
  font-weight: 600;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: var(--bg-btn);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s, opacity 0.12s;
}

.login-btn:not(:disabled):hover {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
  color: var(--text-blue);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-spinner {
  display: inline-block;
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid var(--border);
  border-top-color: var(--text-blue);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
