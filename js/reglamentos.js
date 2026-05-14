// ============================================
// ArbitrosPlaya - reglamentos.js
// ============================================

(async function () {
  try {
    const user = await DataService.requireAuth();
    if (!user) return;

    // Actualizar header con nombre
    const hu = document.getElementById('headerUser');
    if (hu) {
      hu.textContent = user.nombre + ' ' + (user.apellido || '');
    }

    const regs = await DataService.getReglamentos();
    const grid = document.getElementById('reglamentosGrid');
    
    if (!grid) return;

    if (!regs || regs.length === 0) {
      grid.innerHTML = '<div class="no-pdfs"><div class="icon">📄</div><p>No hay reglamentos disponibles aún.</p></div>';
      return;
    }
    
    grid.innerHTML = '';
    regs.forEach(r => {
      const card = document.createElement('div');
      card.className = 'pdf-card';
      card.innerHTML = `
        <div class="pdf-card-top">
          <div class="pdf-icon">${r.icono || '📋'}</div>
          <div>
            <div class="pdf-card-title">${r.titulo}</div>
            <div class="pdf-card-desc">${r.descripcion}</div>
          </div>
        </div>
        <div class="pdf-actions">
          <a href="${r.pdfUrl}" target="_blank" class="btn-pdf-view">📖 Consultar</a>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error en reglamentos.js:", err);
  }
})();
