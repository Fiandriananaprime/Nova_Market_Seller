   
                                                                     
                                                      
   

const STORAGE_SESSION_ID = "nova_seller_session_id"
const STORAGE_TOUR_PREFIX = "nova_tour_session_"

export const tutorialService = {
     
                                                           
                                                                
     
  getCurrentSessionId(): string {
    let sessionId = localStorage.getItem(STORAGE_SESSION_ID)
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem(STORAGE_SESSION_ID, sessionId)
    }
    return sessionId
  },

  /**
   * Resets the current login session markers (called when seller logs out).
   * Ensures the onboarding tour can appear again on the next login.
   */
  resetSessionOnLogout(): void {
    const currentSessionId = localStorage.getItem(STORAGE_SESSION_ID)
    if (currentSessionId) {
      // Remove all session-bound tour flags
      localStorage.removeItem(`${STORAGE_TOUR_PREFIX}${currentSessionId}_onboarding`)
      localStorage.removeItem(`${STORAGE_TOUR_PREFIX}${currentSessionId}_completed`)
      localStorage.removeItem(STORAGE_SESSION_ID)
    }
  },

  /**
   * Starts a brand new login session (called when seller logs in successfully).
   */
  startNewLoginSession(): string {
    this.resetSessionOnLogout()
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem(STORAGE_SESSION_ID, newSessionId)
    return newSessionId
  },

  /**
   * Checks whether the automatic onboarding tour has already been launched
   * or started during the current login session.
   */
  hasOnboardingLaunchedInCurrentSession(): boolean {
    const sessionId = this.getCurrentSessionId()
    const flag = localStorage.getItem(`${STORAGE_TOUR_PREFIX}${sessionId}_onboarding`)
    return flag === "true"
  },

  /**
   * Marks that the onboarding tour was launched or started in the current session.
   */
  markOnboardingLaunchedInCurrentSession(): void {
    const sessionId = this.getCurrentSessionId()
    localStorage.setItem(`${STORAGE_TOUR_PREFIX}${sessionId}_onboarding`, "true")
  },

  /** Checks whether a tutorial session has been started after successful login. */
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(STORAGE_SESSION_ID))
  },

  /**
   * Polling utility to wait for a DOM element to be mounted before starting Driver.js.
   */
  async waitForElement(selector: string, timeoutMs = 4000): Promise<Element | null> {
    const startTime = Date.now()

    return new Promise((resolve) => {
      const check = () => {
        const el = document.querySelector(selector)
        if (el) {
          resolve(el)
          return
        }

        if (Date.now() - startTime >= timeoutMs) {
          resolve(null)
          return
        }

        requestAnimationFrame(check)
      }

      check()
    })
  },
}
