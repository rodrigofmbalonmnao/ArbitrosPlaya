// ============================================
// ArbitrosPlaya - admin.js
// Lógica del Panel de Administrador PRO (REAL CON SUPABASE)
// ============================================

let activeAdmin = null;

const ALL_FEDERATIONS = [
  "Real Federación Española de Balonmano (RFEBM)",
  "Federación Andaluza de Balonmano",
  "Federación Aragonesa de Balonmano",
  "Federación Asturiana de Balonmano",
  "Federación Balear de Balonmano",
  "Federación Canaria de Balonmano",
  "Federación Cántabra de Balonmano",
  "Federación de Balonmano de Castilla y León",
  "Federación de Balonmano de Castilla-La Mancha",
  "Federación Catalana de Balonmano",
  "Federación de Balonmano de Ceuta",
  "Federación Extremeña de Balonmano",
  "Federación Gallega de Balonmano",
  "Federación Madrileña de Balonmano",
  "Federación de Balonmano de Melilla",
  "Federación de Balonmano de la Región de Murcia",
  "Federación Navarra de Balonmano",
  "Federación Vasca de Balonmano (EHF)",
  "Federación Riojana de Balonmano",
  "Federación Valenciana de Balonmano",
  "Otra..."
];

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
  if (id === 'reglamentos') loadReglamentosList();
}

// ---- Gestión de Reglamentos ----
async function handleUploadReg() {
  const title = document.getElementById('regTitle').value;
  const desc = document.getElementById('regDesc').value;
  const icon = document.getElementById('regIcon').value;
  const fileInput = document.getElementById('regFile');
  const file = fileInput.files[0];

  if (!title || !file) return alert('El título y el archivo PDF son obligatorios.');

  const btn = event.currentTarget;
  btn.disabled = true;
  btn.textContent = '⏳ Subiendo...';

  try {
    await DataService.uploadReglamento(file, { titulo: title, descripcion: desc, icono: icon });
    alert('Reglamento subido con éxito.');
    // Limpiar campos
    document.getElementById('regTitle').value = '';
    document.getElementById('regDesc').value = '';
    document.getElementById('regIcon').value = '';
    fileInput.value = '';
    loadReglamentosList();
  } catch (err) {
    alert('Error al subir reglamento: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Subir Reglamento';
  }
}

async function loadReglamentosList() {
  try {
    const regs = await DataService.getReglamentos();
    window.currentRegs = regs; // Guardar para edición
    const tbody = document.getElementById('reglamentosListBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    regs.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:700">${r.icono || '📋'} ${r.titulo}</div>
          <div style="font-size:0.75rem;color:#9E9E9E">${r.descripcion || ''}</div>
        </td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" 
              onclick="openEditReg('${r.id}')">✏️ Editar</button>
            <button class="btn btn-secondary btn-sm" style="background:#FDECEA;color:#D32F2F;border-color:#FFCDD2" 
              onclick="handleDeleteReg('${r.id}')">🗑️ Eliminar</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando lista de reglamentos:', err);
  }
}

function openEditReg(id) {
  if (!window.currentRegs) return;
  const reg = window.currentRegs.find(r => r.id.toString() === id.toString());
  if (!reg) return;

  document.getElementById('editRegId').value = reg.id;
  document.getElementById('editRegTitle').value = reg.titulo || '';
  document.getElementById('editRegDesc').value = reg.descripcion || '';
  document.getElementById('editRegIcon').value = reg.icono || '';

  document.getElementById('modalReglamentoEditor').classList.add('active');
}

function closeEditReg() {
  document.getElementById('modalReglamentoEditor').classList.remove('active');
}

async function handleSaveRegEdit() {
  const id = document.getElementById('editRegId').value;
  const title = document.getElementById('editRegTitle').value;
  const desc = document.getElementById('editRegDesc').value;
  const icon = document.getElementById('editRegIcon').value;

  if (!title) return alert('El título es obligatorio.');

  const btn = document.getElementById('btnSaveRegEdit');
  btn.disabled = true;
  btn.textContent = '⏳ Guardando...';

  try {
    await DataService.updateReglamento(id, { titulo: title, descripcion: desc, icono: icon });
    alert('Reglamento actualizado con éxito.');
    closeEditReg();
    loadReglamentosList();
  } catch (err) {
    alert('Error al actualizar reglamento: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Guardar cambios';
  }
}

async function handleDeleteReg(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este reglamento?')) return;
  try {
    await DataService.deleteReglamento(id);
    loadReglamentosList();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
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

  const fedSel = document.getElementById('statFilterFed');
  ALL_FEDERATIONS.forEach(f => {
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
      <td>${r.test_nombre || r.testNombre || 'Test'}</td>
      <td class="text-center"><span class="score-cell ${r.percentage >= 70 ? 'score-high' : 'score-low'}">${r.percentage}%</span></td>
      <td>${DataService.formatDate(r.created_at)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- Gestión de Usuarios ----
async function loadUsersList() {
  try {
    const fed = document.getElementById('userFilterFed').value;
    let users = await DataService.getAllUsers();
    
    if (fed) {
      users = users.filter(u => u.federacion === fed);
    }

    const tbody = document.getElementById('usersListBody');
    tbody.innerHTML = '';

    for (const u of users) {
      if (u.email === activeAdmin.email) continue; // No listarse a sí mismo

      const results = await DataService.getUserResults(u.id);
      const totalTests = results.length;
      const avg = totalTests > 0 ? (results.reduce((s, r) => s + r.percentage, 0) / totalTests).toFixed(1) : 0;
      const avgTimeSec = totalTests > 0 ? (results.reduce((s, r) => s + (r.time_seconds || r.timeSeconds || 0), 0) / totalTests) : 0;
      const avgTimeStr = DataService.formatTime(Math.round(avgTimeSec));

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:700">${u.nombre} ${u.apellido}</div>
          <div style="font-size:0.75rem;color:#9E9E9E">${u.email}</div>
        </td>
        <td><span style="font-size:0.8rem">${u.federacion}</span></td>
        <td class="text-center">${totalTests}</td>
        <td class="text-center"><span class="score-cell ${avg >= 70 ? 'score-high' : 'score-low'}">${avg}%</span></td>
        <td class="text-center" style="font-size:0.85rem;color:#616161">${avgTimeStr}</td>
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

    const passwordHtml = user.password ? `<div><strong>Contraseña:</strong> <span style="background:#EEE;padding:2px 6px;border-radius:4px;font-family:monospace">${user.password}</span></div>` : '';

    document.getElementById('modalUserName').textContent = `${user.nombre} ${user.apellido}`;
    document.getElementById('modalUserInfo').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.9rem">
        <div><strong>Email:</strong> ${user.email}</div>
        <div id="fedDisplay"><strong>Federación:</strong> ${user.federacion}</div>
        ${passwordHtml}
        <div><strong>ID Usuario:</strong> <code style="font-size:0.7rem">${user.id}</code></div>
      </div>
      
      <div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:10px;padding-top:15px;border-top:1px solid #EEE">
        <button class="btn btn-secondary btn-sm" onclick="handleResetPassword('${user.id}', '${user.email}')">🔄 Cambiar Contraseña</button>
        <button class="btn btn-secondary btn-sm" id="btnChangeFed" onclick="showFedSelector('${user.id}', '${user.federacion}')">📍 Cambiar Federación</button>
        <button class="btn btn-primary btn-sm" style="background:#C8102E;border-color:#C8102E" onclick="handleDeleteUser('${user.id}')">🗑️ Eliminar Usuario</button>
      </div>
      
      <div id="fedSelectorContainer" style="margin-top:10px; display:none; background:#F5F5F5; padding:10px; border-radius:8px;">
        <label style="display:block;font-size:0.8rem;margin-bottom:5px">Seleccionar nueva federación:</label>
        <select id="newFedSelect" class="select-field" style="width:100%;margin-bottom:10px">
          ${ALL_FEDERATIONS.map(f => `<option value="${f}" ${f === user.federacion ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
        <div style="display:flex;gap:5px">
          <button class="btn btn-primary btn-sm" onclick="handleUpdateFederation('${user.id}')">Guardar</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('fedSelectorContainer').style.display='none'">Cancelar</button>
        </div>
      </div>
    `;

    const tbody = document.getElementById('modalUserTestsBody');
    tbody.innerHTML = '';
    results.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.test_nombre || 'Test'}</td>
        <td class="text-center"><span class="score-cell ${r.percentage >= 70 ? 'score-high' : 'score-low'}">${r.percentage}%</span></td>
        <td>${DataService.formatTime(r.time_seconds || 0)}</td>
        <td>${DataService.formatDate(r.created_at)}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('modalUserDetail').classList.add('active');
  } catch (err) {
    console.error('Error al abrir detalle:', err);
  }
}

async function handleDeleteUser(userId) {
  if (!confirm('¿Estás seguro de eliminar este usuario y todos sus resultados? Esta acción no se puede deshacer.')) return;
  try {
    await DataService.deleteUser(userId);
    closeModal();
    loadUsersList();
    loadStats();
  } catch (err) {
    alert('Error al eliminar usuario');
  }
}

async function handleResetPassword(userId, email = null) {
  const isSupabase = !DataService.isDemo;
  let newPass = null;
  
  if (!isSupabase) {
    newPass = prompt('Introduce la nueva contraseña para el usuario:');
    if (!newPass) return;
  } else {
    if (!confirm(`¿Enviar un email de recuperación de contraseña a ${email}?`)) return;
  }

  try {
    await DataService.resetPassword(userId, newPass, email);
    if (isSupabase) {
      alert(`Se ha enviado un email de recuperación a ${email}`);
    } else {
      alert('Contraseña actualizada correctamente.');
    }
    openUserDetail(userId);
  } catch (err) {
    alert('Error al procesar la solicitud: ' + err.message);
  }
}

function showFedSelector() {
  document.getElementById('fedSelectorContainer').style.display = 'block';
}

async function handleUpdateFederation(userId) {
  const newFed = document.getElementById('newFedSelect').value;
  if (!newFed) return;
  
  try {
    await DataService.updateUserFederation(userId, newFed);
    alert('Federación actualizada correctamente.');
    loadUsersList(); // Recargar lista para ver cambio
    openUserDetail(userId); // Refrescar modal
  } catch (err) {
    alert('Error al actualizar federación');
  }
}

function closeModal() {
  document.getElementById('modalUserDetail').classList.remove('active');
}

let currentEditingType = 'reglas';
let currentQuestionId = null;

async function loadQuestionEditor(type) {
  currentEditingType = type;
  const container = document.getElementById('editorContainer');
  container.innerHTML = '<p style="text-align:center;padding:40px">Cargando banco de datos...</p>';

  try {
    const data = type === 'reglas' ? await DataService.getQuestionsBank() : await DataService.getVideosBank();
    container.innerHTML = `
      <div style="padding:16px;background:#F8F9FA;border-bottom:1px solid #EEE;display:flex;justify-content:space-between;align-items:center;border-radius:12px 12px 0 0">
        <h3 style="font-size:0.9rem">Editando Banco: ${type.toUpperCase()} (${data.length} items)</h3>
        <button class="btn btn-primary btn-sm" onclick="openQModal()">➕ Añadir Nuevo</button>
      </div>
      <div id="questionsScroll" style="max-height:500px;overflow-y:auto;background:white"></div>
    `;

    const list = document.getElementById('questionsScroll');
    data.forEach(q => {
      const card = document.createElement('div');
      card.className = 'q-edit-card';
      card.style = "padding:16px; border-bottom:1px solid #EEE; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s";
      card.innerHTML = `
        <div style="flex:1; padding-right:20px">
          <div style="font-size:0.75rem; color:#9E9E9E; margin-bottom:4px">ID: ${q.id}</div>
          <div style="font-size:0.9rem; font-weight:600; color:#1A1A1A">${q.texto || q.videoTitulo || 'Sin título'}</div>
        </div>
        <div style="display:flex; gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="openQModal('${q.id}')">✏️ Editar</button>
          <button class="btn btn-secondary btn-sm" style="color:#C8102E" onclick="handleDeleteQuestion('${q.id}')">🗑️ Borrar</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p style="text-align:center;padding:40px;color:red">Error al cargar datos.</p>`;
  }
}

async function openQModal(id = null) {
  currentQuestionId = id;
  const modal = document.getElementById('modalQuestionEditor');
  const title = document.getElementById('qModalTitle');
  const text = document.getElementById('qText');
  const container = document.getElementById('qOptionsContainer');
  const videoGroup = document.getElementById('qVideoGroup');
  const videoInput = document.getElementById('qVideoFile');
  
  container.innerHTML = '';
  text.value = '';
  if (videoInput) videoInput.value = '';

  // Mostrar u ocultar campo de video según el banco
  if (videoGroup) {
    videoGroup.style.display = currentEditingType === 'videos' ? 'block' : 'none';
  }

  if (id) {
    title.textContent = 'Editar Pregunta';
    const bank = currentEditingType === 'reglas' ? await DataService.getQuestionsBank() : await DataService.getVideosBank();
    const q = bank.find(item => item.id === id || item.id.toString() === id.toString());
    if (q) {
      text.value = q.texto || q.videoTitulo || '';
      // Cargar opciones
      if (q.opciones) {
        q.opciones.forEach((opt, idx) => {
          const isCorrect = q.correctas && q.correctas.includes(idx);
          addOptionField(opt, isCorrect);
        });
      }
    }
  } else {
    title.textContent = 'Nueva Pregunta';
    addOptionField('', false);
    addOptionField('', false);
  }

  modal.classList.add('active');
}

function addOptionField(value = '', isCorrect = false) {
  const container = document.getElementById('qOptionsContainer');
  const div = document.createElement('div');
  div.className = 'q-option-row';
  div.style = "display:flex; align-items:center; gap:10px; margin-bottom:10px; background:#F9F9F9; padding:8px; border-radius:8px";
  div.innerHTML = `
    <input type="checkbox" class="q-opt-correct" ${isCorrect ? 'checked' : ''} title="Marcar como correcta">
    <input type="text" class="select-field q-opt-text" value="${value}" placeholder="Texto de la opción..." style="margin-bottom:0; flex:1">
    <button class="btn btn-secondary btn-sm" onclick="this.parentElement.remove()" style="padding:5px 8px; color:#C8102E">✕</button>
  `;
  container.appendChild(div);
}

function closeQModal() {
  document.getElementById('modalQuestionEditor').classList.remove('active');
}

async function handleSaveQuestion() {
  const texto = document.getElementById('qText').value;
  const optionRows = document.querySelectorAll('.q-option-row');
  const videoFile = document.getElementById('qVideoFile').files[0];
  
  if (!texto) return alert('La pregunta debe tener un texto o título.');
  if (optionRows.length < 2) return alert('Debes añadir al menos 2 opciones.');

  const opciones = [];
  const correctas = [];
  
  optionRows.forEach((row, idx) => {
    const val = row.querySelector('.q-opt-text').value;
    const isCorrect = row.querySelector('.q-opt-correct').checked;
    opciones.push(val);
    if (isCorrect) correctas.push(idx);
  });

  if (correctas.length === 0) return alert('Debes marcar al menos una opción como correcta.');

  const question = {
    id: currentQuestionId,
    opciones: opciones,
    correctas: correctas
  };

  if (currentEditingType === 'reglas') {
    question.texto = texto;
  } else {
    question.videoTitulo = texto;
    question.test = 'custom'; // Por defecto
  }

  const btn = document.getElementById('btnSaveQuestion');
  btn.disabled = true;
  btn.textContent = '⏳ Guardando...';

  try {
    if (currentEditingType === 'reglas') {
      await DataService.saveQuestion(question);
    } else {
      await DataService.saveVideoQuestion(question, videoFile);
    }
    alert('Pregunta guardada correctamente.');
    closeQModal();
    loadQuestionEditor(currentEditingType);
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Guardar Pregunta';
  }
}

async function handleDeleteQuestion(id) {
  if (!confirm('¿Estás seguro de que quieres borrar esta pregunta?')) return;
  try {
    if (currentEditingType === 'reglas') {
      await DataService.deleteQuestion(id);
    } else {
      await DataService.deleteVideoQuestion(id);
    }
    loadQuestionEditor(currentEditingType);
  } catch (err) {
    alert('Error al borrar: ' + err.message);
  }
}
