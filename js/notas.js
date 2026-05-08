// ============================================
// ArbitrosPlaya - notas.js
// ============================================

let activeUser = null;

(async function init() {
  activeUser = await DataService.requireAuth();
  if (!activeUser) return;

  // Actualizar header con nombre
  const headerUser = document.getElementById('headerUser');
  if (headerUser) headerUser.textContent = activeUser.nombre + ' ' + (activeUser.apellido || '');

  initYears();
  await loadNotas();
})();

function initYears() {
  const sel = document.getElementById('filterYear');
  if (!sel) return;
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    sel.appendChild(opt);
  }
}

async function loadNotas() {
  if (!activeUser) return;
  
  const year = document.getElementById('filterYear').value;
  const month = document.getElementById('filterMonth').value;
  const type = document.getElementById('filterType').value;
  
  try {
    const results = await DataService.getUserResults(activeUser.id, { year, month, type });

    // Stats
    const total = results.length;
    const avg = total > 0 ? (results.reduce((s, r) => s + (r.percentage || 0), 0) / total) : 0;
    const best = total > 0 ? Math.max(...results.map(r => r.percentage || 0)) : 0;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statMedia').textContent = avg.toFixed(1) + '%';
    document.getElementById('statBest').textContent = best.toFixed(1) + '%';

    // Color stats
    const mediaEl = document.getElementById('statMedia');
    mediaEl.className = 'nota-stat-value ' + (avg >= 70 ? 'score-high' : avg >= 50 ? 'score-mid' : 'score-low');

    // Table
    const tbody = document.getElementById('notasBody');
    const noRes = document.getElementById('noResults');
    tbody.innerHTML = '';

    if (total === 0) {
      noRes.classList.remove('hidden');
      return;
    }
    noRes.classList.add('hidden');

    results.forEach(r => {
      const tr = document.createElement('tr');
      const rType = r.test_type || r.testType;
      const typeClass = rType === 'reglas' ? 'type-reglas' : 'type-video';
      const typeIcon = rType === 'reglas' ? '📋' : '🎬';
      const typeLabel = rType === 'reglas' ? 'Reglas' : 'Vídeo';
      const scoreClass = r.percentage >= 70 ? 'score-high' : r.percentage >= 50 ? 'score-mid' : 'score-low';
      
      tr.innerHTML = `
        <td><span class="type-badge ${typeClass}">${typeIcon} ${typeLabel}</span></td>
        <td>${r.test_nombre || 'Test'}</td>
        <td class="score-cell ${scoreClass}">${(r.percentage || 0).toFixed(1)}%</td>
        <td>${DataService.formatTime(r.time_seconds || 0)}</td>
        <td>${DataService.formatDate(r.created_at)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando notas:', err);
  }
}
