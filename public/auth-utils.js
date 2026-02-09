// ================================================
// SHARED AUTHENTICATION UTILITIES
// ================================================

/*
 * Updates the navigation UI based on user authentication status
 */
async function updateAuthUI() {
  try {
    const response = await fetch('/auth/me');
    if (response.ok) {
      const data = await response.json();

      if (data.loggedIn) {
        // User is logged in - show profile and logout
        const profileLink = document.getElementById('profileLink');
        const loginLink = document.getElementById('loginLink');
        const signupLink = document.getElementById('signupLink');
        const userGreeting = document.getElementById('userGreeting');
        const logoutContainer = document.getElementById('logoutContainer');

        if (profileLink) profileLink.style.display = 'block';
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (userGreeting) {
          userGreeting.style.display = 'block';
          userGreeting.textContent = `Hi, ${data.name}!`;
        }
        if (logoutContainer) logoutContainer.style.display = 'block';
      } else {
        // User is not logged in - show login and signup
        const profileLink = document.getElementById('profileLink');
        const loginLink = document.getElementById('loginLink');
        const signupLink = document.getElementById('signupLink');
        const userGreeting = document.getElementById('userGreeting');
        const logoutContainer = document.getElementById('logoutContainer');

        if (profileLink) profileLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        if (userGreeting) userGreeting.style.display = 'none';
        if (logoutContainer) logoutContainer.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    // Default to logged out state
    const profileLink = document.getElementById('profileLink');
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const userGreeting = document.getElementById('userGreeting');
    const logoutContainer = document.getElementById('logoutContainer');

    if (profileLink) profileLink.style.display = 'none';
    if (loginLink) loginLink.style.display = 'block';
    if (signupLink) signupLink.style.display = 'block';
    if (userGreeting) userGreeting.style.display = 'none';
    if (logoutContainer) logoutContainer.style.display = 'none';
  }
}

/**
 * Sets up logout button event listener
 */
function setupLogoutHandler() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/auth/logout', { method: 'POST' });
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
        window.location.reload();
      }
    });
  }
}

/**
 * Initialize authentication UI when page loads
 */
function initAuthUI() {
  updateAuthUI();
  setupLogoutHandler();
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}