<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const submitted = ref(false)

const handleSubmit = () => {
  submitted.value = true
}
</script>

<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <div class="login-field">
      <label class="field-label" for="login-name">Nome utente</label>
      <input
        id="login-name"
        v-model="username"
        class="field-input"
        type="text"
        autocomplete="username"
        spellcheck="false"
      />
    </div>
    <div class="login-field">
      <label class="field-label" for="login-password">Password</label>
      <input
        id="login-password"
        v-model="password"
        class="field-input"
        type="password"
        autocomplete="current-password"
      />
    </div>
    <button class="login-btn" type="submit">Accedi</button>
    <p v-if="submitted" class="login-status">Accesso effettuato</p>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 22rem;
  margin: auto;
  padding: 1rem 0;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.field-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: var(--bg-btn);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  transition: border-color 0.15s, background 0.25s, color 0.25s;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: var(--btn-active-border);
  background: var(--bg-main);
}

.login-btn {
  margin-top: 0.25rem;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid var(--btn-active-border);
  border-radius: 0.4rem;
  background: var(--btn-active-bg);
  color: var(--text-blue);
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.login-btn:active {
  background: var(--btn-active-border);
  color: var(--bg-bar);
}

.login-status {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-green);
  text-align: center;
  letter-spacing: 0.04em;
}
</style>
