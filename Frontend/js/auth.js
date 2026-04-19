/**
 * auth.js — Login & Registration logic
 * Works with accueil_authentification_2/code.html
 */

document.addEventListener('DOMContentLoaded', function () {

  /* If already logged in, redirect immediately */
  if (TokenService.isLoggedIn()) {
    var role = TokenService.getRole();
    window.location.href = role === 'promoter'
      ? '../fundbridge_step_2_documents/code.html'
      : '../tableau_de_bord_investisseur_catalogue/code.html';
    return;
  }

  /* ─── SIGNUP ─── */
  var signupBtn = document.getElementById('signup-submit-btn');
  if (signupBtn) {
    signupBtn.addEventListener('click', async function () {
      var email    = document.getElementById('signup-email').value.trim();
      var password = document.getElementById('signup-password').value.trim();
      var role     = document.getElementById('signup-role').value;
      var phone    = document.getElementById('signup-phone') ? document.getElementById('signup-phone').value.trim() : '';
      var whatsapp = document.getElementById('signup-whatsapp') ? document.getElementById('signup-whatsapp').value.trim() : '';

      if (!email || !password) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      signupBtn.disabled = true;
      signupBtn.textContent = 'Creating account…';

      try {
        var result = await apiPost('/api/auth/register', {
          email: email,
          password: password,
          role: role,
          phone_number: phone,
          whatsapp_number: whatsapp
        });

        if (result.status === 201) {
          showToast('Account created! Please log in.', 'success');
          document.getElementById('signup-view').classList.add('hidden-state');
          document.getElementById('login-view').classList.remove('hidden-state');
        } else {
          showToast(result.data.error || 'Registration failed', 'error');
        }
      } catch (e) {
        showToast('Network error — is the server running?', 'error');
      }

      signupBtn.disabled = false;
      signupBtn.textContent = "S'inscrire";
    });
  }

  /* ─── LOGIN ─── */
  var loginBtn = document.getElementById('login-submit-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async function () {
      var email    = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value.trim();

      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      loginBtn.disabled = true;
      loginBtn.textContent = 'Authenticating…';

      try {
        var result = await apiPost('/api/auth/login', {
          email: email,
          password: password
        });

        if (result.status === 200) {
          TokenService.save(result.data);
          showToast('Login successful!', 'success');
          setTimeout(function () {
            window.location.href = result.data.role === 'promoter'
              ? '../fundbridge_step_2_documents/code.html'
              : '../tableau_de_bord_investisseur_catalogue/code.html';
          }, 600);
        } else {
          showToast(result.data.error || 'Invalid credentials', 'error');
          loginBtn.disabled = false;
          loginBtn.textContent = 'Se connecter';
        }
      } catch (e) {
        showToast('Network error — is the server running?', 'error');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Se connecter';
      }
    });
  }
});
