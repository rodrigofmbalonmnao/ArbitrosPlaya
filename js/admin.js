// ============================================
// ArbitrosPlaya - admin.js
// Lógica del Panel de Administrador PRO (REAL CON SUPABASE)
// ============================================

let activeAdmin = null;

// ---- Protección de Ruta ----
(async function init() {
  activeAdmin = await DataService.requireAdmin();
  if (activeAdmin) {
    const hu = document.getElementById('headerUser');
    if (hu) hu.textContent = activeAdmin.nombre + ' ' + (activeAdmin.apellido || '');
    initFilters();
    loadStats();
  }
})();

function showAdminSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  
  document.getElementById('section-' + id).classList.add('active');
  event.currentTarget.classList.add('active');

  if (id === 'users') loadUsersList();
}

// ---- Estadísticas ----
function initFilters() {
  const currentYear = new Date().getFullYear();
  const yearSel = document.getElementById('statFilterYear');
  for (let y = currentYear; y >= currentYear - 3; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yearSel.appendChild(opt);
  }

  const feds = [
    "Federación Andaluza de Balonmano", "Federación Madrileña de Balonmano",
    "Federación Catalana de Balonmano", "Federación Valenciana de Balonmano",
    "Federación Gallega de Balonmano", "Otras"
  ];
  const fedSel = document.getElementById('statFilterFed');
  feds.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f; opt.textContent = f;
    fedSel.appendChild(opt);
  });
}

async function loadStats() {
  const year = document.getElementById('statFilterYear').value;
  const month = document.getElementById('statFilterMonth').value;
  const fed = document.getElementById('statFilterFed').value;

  try {
    const stats = await DataService.getAdminStats({ year, month, federacion: fed });
    document.getElementById('statTotalUsers').textContent = stats.totalUsers;
    document.getElementById('statTotalTests').textContent = stats.totalTests;
    document.getElementById('statAvgScore').textContent = stats.avgScore + '%';

    const results = await DataService.getAllResults({ year, month, federacion: fed });
    renderRecentActivity(results.slice(0, 10));
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
  }
}

function renderRecentActivity(results) {
  const tbody = document.getElementById('recentActivityBody');
  tbody.innerHTML = '';
  results.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.profiles ? r.profiles.nombre + ' ' + r.profiles.apellido : 'Usuario'}</td>
      <td>${r.test_nombre}</td>
      <td class="text-center"><span class="score-cell ${r.percentage >= 70 ? 'score-high' : 'score-low'}">${r.percentage}%</span></td>
      <td>${DataService.formatDate(r.created_at)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- Gestión de Usuarios ----
async function loadUsersList() {
  try {
    const users = await DataService.getAllUsers();
    const tbody = document.getElementById('usersListBody');
    tbody.innerHTML = '';

    for (const u of users) {
      if (u.email === activeAdmin.email) continue; // No listarse a sí mismo

      const results = await DataService.getUserResults(u.id);
      const totalTests = results.length;
      const avg = totalTests > 0 ? (results.reduce((s, r) => s + r.percentage, 0) / totalTests).toFixed(1) : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:700">${u.nombre} ${u.apellido}</div>
          <div style="font-size:0.75rem;color:#9E9E9E">${u.email}</div>
        </td>
        <td><span style="font-size:0.8rem">${u.federacion}</span></td>
        <td class="text-center">${totalTests}</td>
        <td class="text-center"><span class="score-cell ${avg >= 70 ? 'score-high' : 'score-low'}">${avg}%</span></td>
        <td><button class="btn btn-secondary btn-sm" onclick="openUserDetail('${u.id}')">Ver Detalle</button></td>
      `;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error('Error cargando usuarios:', err);
  }
}

async function openUserDetail(userId) {
  try {
    const users = await DataService.getAllUsers();
    const user = users.find(u => u.id === userId);
    const results = await DataService.getUserResults(userId);

    document.getElementById('modalUserName').textContent = `${user.nombre} ${user.apellido}`;
    document.getElementById('modalUserInfo').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.9rem">
        <div><strong>Email:</strong> ${user.email}</div>
        <div><strong>Federación:</strong> ${user.federacion}</div>
        <div><strong>Proveedor:</strong> ${user.provider || 'Email'}</div>
        <div><strong>ID Supabase:</strong> <code style="font-size:0.7rem">${user.id}</code></div>
      </div>
      <p style="margin-top:10px;font-size:0.8rem;color:#C8102E">Nota: Por seguridad, las contraseñas están encriptadas en Supabase y no son visibles.</p>
    `;

    const tbody = document.getElementById('modalUserTestsBody');
    tbody.innerHTML = '';
    results.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.test_nombre}</td>
        <td class="text-center"><span class="score-cell ${r.percentage >= 70 ? 'score-high' : 'score-low'}">${r.percentage}%</span></td>
        <td>${DataService.formatTime(r.time_seconds)}</td>
        <td>${DataService.formatDate(r.created_at)}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('modalUserDetail').classList.add('active');
  } catch (err) {
    console.error('Error al abrir detalle:', err);
  }
}

function closeModal() {
  document.getElementById('modalUserDetail').classList.remove('active');
}

// ---- Editor de Contenido (Simulado/Preparado) ----
async function loadQuestionEditor(type) {
  const container = document.getElementById('editorContainer');
  container.innerHTML = '<p style="text-align:center;padding:40px">Cargando banco de datos...</p>';

  try {
    const data = type === 'reglas' ? await DataService.getQuestionsBank() : await DataService.getVideosBank();
    container.innerHTML = `
      <div style="padding:16px;background:#F8F9FA;border-bottom:1px solid #EEE;display:flex;justify-content:space-between;align-items:center">
        <h3 style="font-size:0.9rem">Editando Banco: ${type.toUpperCase()} (${data.length} items)</h3>
        <button class="btn btn-primary btn-sm">+ Añadir Nuevo</button>
      </div>
      <div id="questionsScroll" style="max-height:500px;overflow-y:auto"></div>
    `;

    const list = document.getElementById('questionsScroll');
    data.forEach(q => {
      const card = document.createElement('div');
      card.className = 'q-edit-card';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <strong>ID: ${q.id}</strong>
          <button class="btn btn-secondary btn-sm" style="font-size:0.7rem">Editar</button>
        </div>
        <div style="font-size:0.85rem">${q.texto || q.videoTitulo || 'Sin título'}</div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p style="text-align:center;padding:40px;color:red">Error al cargar datos. Verifica las tablas en Supabase.</p>`;
  }
}
