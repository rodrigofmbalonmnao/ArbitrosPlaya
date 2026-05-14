// ============================================
// ArbitrosPlaya - videos.js (Banco de Vídeos)
// ============================================
// ---- Auth & User Display ----
(async function initAuth() {
  const user = await DataService.requireAuth();
  if (user) {
    const hu = document.getElementById('headerUser');
    if (hu) hu.textContent = user.nombre + ' ' + (user.apellido || '');
  }
})();

async function initBanco() {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center; padding: 20px;">Cargando vídeos...</div>';
  
  try {
    const cats = await DataService.getCategoriasVideos();
    const vids = await DataService.getVideosDelBanco();
    
    container.innerHTML = '';
    
    cats.forEach((cat, ci) => {
      const catVids = vids.filter(v => v.categoria_id === cat.id);
      
      const item = document.createElement('div');
      item.className = 'category-item';
      item.innerHTML = `
        <div class="category-header" onclick="toggleCategory(this)">
          <div class="category-title-wrapper">
            <span class="category-icon">${cat.icono || '📁'}</span>
            <span>${cat.nombre}</span>
            <span class="category-count">${catVids.length}</span>
          </div>
          <span class="category-arrow">▼</span>
        </div>
        <div class="category-videos" id="cat-${ci}"></div>
      `;
      container.appendChild(item);
      
      const videosDiv = item.querySelector(`#cat-${ci}`);
      catVids.forEach(v => {
        const vItem = document.createElement('div');
        vItem.className = 'video-list-item';
        vItem.onclick = () => openModal(v.titulo, v.video_url);
        vItem.innerHTML = `
          <div class="video-thumb"></div>
          <div class="video-info">
            <div class="video-title">${v.titulo}</div>
          </div>
        `;
        videosDiv.appendChild(vItem);
      });
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="text-align:center; padding: 20px; color: red;">Error al cargar vídeos del banco.</div>';
  }
}

function toggleCategory(header) {
  header.parentElement.classList.toggle('open');
  updateToggleButton();
}

function toggleAllCategories() {
  const items = document.querySelectorAll('.category-item');
  const btn = document.getElementById('btnToggleAll');
  const allOpen = Array.from(items).every(item => item.classList.contains('open'));
  
  items.forEach(item => {
    if (allOpen) {
      item.classList.remove('open');
    } else {
      item.classList.add('open');
    }
  });
  
  updateToggleButton();
}

function updateToggleButton() {
  const items = document.querySelectorAll('.category-item');
  const btn = document.getElementById('btnToggleAll');
  if (!btn) return;
  
  const anyClosed = Array.from(items).some(item => !item.classList.contains('open'));
  btn.textContent = anyClosed ? 'Expandir todo' : 'Colapsar todo';
}

function openModal(title, url) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalPlayer').innerHTML = `
    <video controls autoplay style="width: 100%; height: auto; min-height: 200px; max-height: 70vh; background: #000; border-radius: 8px; margin-bottom: 20px; display: block;">
      <source src="${url}" type="video/mp4">
      Tu navegador no soporta la reproducción de vídeos.
    </video>
  `;
  document.getElementById('videoModal').classList.add('active');
}

function closeModal() {
  document.getElementById('videoModal').classList.remove('active');
  document.getElementById('modalPlayer').innerHTML = '';
}

document.getElementById('videoModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

initBanco();
