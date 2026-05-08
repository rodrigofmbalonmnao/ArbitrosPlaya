// ============================================
// ArbitrosPlaya - home.js
// ============================================
(async function () {
  const user = await DataService.requireAuthHome();
  if (!user) return;

  const headerUser = document.getElementById('headerUser');
  if (headerUser) {
    headerUser.textContent = user.nombre + ' ' + (user.apellido || '');
  }
  
  const welcomeName = document.getElementById('welcomeName');
  if (welcomeName) {
    welcomeName.textContent = user.nombre;
  }

  // Mostrar panel admin si corresponde
  if (user.isAdmin) {
    document.getElementById('adminCard').classList.remove('hidden');
  }
})();

function handleLogout() {
  DataService.logout();
  window.location.href = 'index.html';
}
