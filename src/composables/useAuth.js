/**
 * useAuth.js
 *
 * Authentication state for the HMI shell.
 * In production this would call a real REST endpoint; here the check is
 * simulated with artificial latency so the rest of the application code
 * is structured exactly as it would be against a real server.
 */

import { ref } from 'vue'
import { useDeviceClient } from './useDeviceClient.js'

// ── Singleton authentication state ───────────────────────
const isAuthenticated = ref(false)
const authError = ref(null)

// ── Simulated valid credentials ───────────────────────────
// Replace with a real API call in production.
const VALID_CREDENTIALS = { username: 'admin', password: 'admin' }

const { isLoading } = useDeviceClient()

// ── Composable ────────────────────────────────────────────
export const useAuth = () => {
  /**
   * Attempt to log in with the supplied credentials.
   * Returns true on success, false on failure.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  const login = async (username, password) => {
    authError.value = null
    isLoading.value = true
    try {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 400))
      if (
        username.trim() === VALID_CREDENTIALS.username &&
        password === VALID_CREDENTIALS.password
      ) {
        isAuthenticated.value = true
        return true
      }
      authError.value = 'Credenziali non valide.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    isAuthenticated.value = false
    authError.value = null
  }

  return { isAuthenticated, authError, login, logout }
}
