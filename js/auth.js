// ============================================
// ArbitrosPlaya - auth.js
// Login, Registro, Verificación (REAL CON SUPABASE)
// ============================================

let pendingEmail = '';

// ---- Si ya hay sesión, ir al home ----
(async function () {
  const user = await DataService.getCurrentUser();
  if (user) window.location.href = 'home.html';
})();

// ---- Toggle tabs ----
function showTab(tab) {
  document.getElementById('formLogin').classList.remove('active');
  document.getElementById('formRegister').classList.remove('active');
  document.getElementById('verifyScreen').classList.remove('active');
  document.getElementById('googleExtraScreen').classList.remove('active');
  document.getElementById('authTabs').style.display = 'flex';
  clearError();

  if (tab === 'login') {
    document.getElementById('formLogin').classList.add('active');
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabRegister').classList.remove('active');
  } else {
    document.getElementById('formRegister').classList.add('active');
    document.getElementById('tabRegister').classList.add('active');
    document.getElementById('tabLogin').classList.remove('active');
  }
}

function showVerify(email) {
  pendingEmail = email;
  document.getElementById('formLogin').classList.remove('active');
  document.getElementById('formRegister').classList.remove('active');
  document.getElementById('authTabs').style.display = 'none';
  
  const isDemo = DataService.isDemo;
  document.getElementById('verifyModeDemo').style.display = isDemo ? 'block' : 'none';
  document.getElementById('verifyModeSupabase').style.display = isDemo ? 'none' : 'block';

  if (isDemo) {
    document.getElementById('verifyEmailDisplay').textContent = email;
    // Focus primer dígito
    document.querySelectorAll('.code-digit')[0].focus();
  } else {
    document.getElementById('verifyEmailDisplayReal').textContent = email;
  }

  document.getElementById('verifyScreen').classList.add('active');
}

// ---- Error helpers ----
function showError(msg, targetId = 'authError') {
  const el = document.getElementById(targetId);
  el.textContent = msg;
  el.classList.add('visible');
}

function clearError() {
  document.querySelectorAll('.auth-error').forEach(e => e.classList.remove('visible'));
}

// ---- Validación contraseña numérica ----
function validatePassword(pw) {
  if (!/^\d+$/.test(pw)) return 'La contraseña solo puede contener números.';
  if (pw.length < 6) return 'La contraseña debe tener al menos 6 dígitos.';
  return null;
}

// ---- LOGIN ----
async function handleLogin(e) {
  e.preventDefault();
  clearError();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const pwErr = validatePassword(password);
  if (pwErr) return showError(pwErr);

  const btn = document.getElementById('btnLogin');
  btn.classList.add('btn-loading');
  btn.disabled = true;

  try {
    await DataService.login(email, password);
    window.location.href = 'home.html';
  } catch (err) {
    // El mensaje de error específico ya viene formateado desde DataService
    showError(err.message);
  } finally {
    btn.classList.remove('btn-loading');
    btn.disabled = false;
  }
}

// ---- REGISTRO ----
async function handleRegister(e) {
  e.preventDefault();
  clearError();

  const nombre = document.getElementById('regNombre').value.trim();
  const apellido = document.getElementById('regApellido').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const federacion = document.getElementById('regFederacion').value;
  const password = document.getElementById('regPassword').value.trim();
  const confirm = document.getElementById('regPasswordConfirm').value.trim();

  if (!federacion) return showError('Selecciona tu federación.');
  const pwErr = validatePassword(password);
  if (pwErr) return showError(pwErr);
  if (password !== confirm) return showError('Las contraseñas no coinciden.');

  const btn = document.getElementById('btnRegister');
  btn.classList.add('btn-loading');
  btn.disabled = true;

  try {
    await DataService.register(email, password, { nombre, apellido, federacion });
    
    if (DataService.isDemo) {
      showToast('✅ Registro completado correctamente', 'success');
      setTimeout(() => showTab('login'), 1500);
    } else {
      showVerify(email);
    }
  } catch (err) {
    showError(err.message);
  } finally {
    btn.classList.remove('btn-loading');
    btn.disabled = false;
  }
}

// ---- VERIFICACIÓN ----
async function handleVerify() {
  clearError();
  const digits = document.querySelectorAll('.code-digit');
  const code = Array.from(digits).map(d => d.value).join('');

  if (code.length < 6) return showError('Introduce el código de 6 dígitos.', 'verifyError');

  try {
    await DataService.verifyEmail(pendingEmail, code);
    showToast('✅ Email verificado correctamente', 'success');
    setTimeout(() => showTab('login'), 1200);
  } catch (err) {
    showError(err.message, 'verifyError');
    digits.forEach(d => { d.value = ''; d.classList.remove('filled'); });
    digits[0].focus();
  }
}

// ---- GOOGLE LOGIN ----
async function handleGoogleLogin() {
  clearError();
  try {
    await DataService.loginWithGoogle();
  } catch (err) {
    showError(err.message);
  }
}

// ---- Navegación código por dígitos ----
document.querySelectorAll('.code-digit').forEach((input, idx, inputs) => {
  input.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(-1);
    if (this.value) {
      this.classList.add('filled');
      if (idx < inputs.length - 1) inputs[idx + 1].focus();
    } else {
      this.classList.remove('filled');
    }
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && !this.value && idx > 0) inputs[idx - 1].focus();
  });
});

// ---- Toast ----
function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
