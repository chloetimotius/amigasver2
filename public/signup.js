const signupForm = document.getElementById('signupForm');
const signupMessage = document.getElementById('signupMessage');
const signupBtn = document.getElementById('signupBtn');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

// Show / hide password for both fields
togglePasswordButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;

    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? 'Hide' : 'Show';
  });
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // reset message + button state
  signupMessage.textContent = '';
  signupMessage.className = 'form-message';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // simple client-side check
  if (password !== confirmPassword) {
    signupMessage.textContent = 'Passwords do not match.';
    signupMessage.classList.add('error');
    return;
  }

  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating account...';

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      signupMessage.textContent = data.error || 'Registration failed.';
      signupMessage.classList.add('error');
      return;
    }

    // success
    signupMessage.textContent = 'Account created! Redirecting...';
    signupMessage.classList.add('success');

    // redirect (session will usually be set server-side)
    window.location.href = '/';
  } catch (err) {
    console.error(err);
    signupMessage.textContent = 'Something went wrong. Please try again.';
    signupMessage.classList.add('error');
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = 'Create account';
  }
});
