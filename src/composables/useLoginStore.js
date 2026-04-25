import { ref } from 'vue'
import { useDeviceClient } from './useDeviceClient.js'

// ── Singleton state ───────────────────────────────────────
const isLoginLoading = ref(false)
const loginError = ref('')

const { login: deviceLogin, logout: deviceLogout, isLoggedIn } = useDeviceClient()

// ── Exported composable ───────────────────────────────────
export const useLoginStore = () => {
  const login = async (username, password) => {
    loginError.value = ''
    isLoginLoading.value = true
    try {
      const result = await deviceLogin(username, password)
      if (!result.ok) {
        loginError.value = result.message ?? 'Credenziali non valide'
      }
    } catch {
      loginError.value = 'Errore di connessione'
    } finally {
      isLoginLoading.value = false
    }
  }

  const logout = async () => {
    loginError.value = ''
    await deviceLogout()
  }

  return { isLoggedIn, isLoginLoading, loginError, login, logout }
}
