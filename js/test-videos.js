// ============================================
// ArbitrosPlaya - test-videos.js
// Lógica del test de vídeos (8 vídeos ALEATORIOS)
// ============================================

let currentTestData = null;
let currentQ = 0;
let userAnswers = [];
let timerInterval = null;
let timerSeconds = 0;
let currentResultId = null;
let activeUser = null;

// ---- Init: Cargar usuario y preparar test ----
(async function init() {
  activeUser = await DataService.requireAuth();
  if (activeUser) {
    const hu = document.getElementById('headerUser');
    if (hu) hu.textContent = activeUser.nombre + ' ' + (activeUser.apellido || '');
    showScreen('screenWarning');
  }
})();

function goBackVideo() {
  const s = document.getElementById('screenTest');
  if (s.classList.contains('active')) {
    if (confirm('¿Salir? Perderás el progreso.')) { stopTimer(); window.location.href = '../home.html'; }
  } else { window.location.href = '../home.html'; }
}

function showScreen(id) {
  document.querySelectorAll('.test-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---- Helper: Shuffle array ----
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ---- Start test ----
function startVideoTest() {
  const allQuestions = [...PREGUNTAS_VIDEOS];
  const selectedQuestions = shuffle(allQuestions).slice(0, 8); // Ahora 8 vídeos
  
  currentTestData = {
    id: 'random-vid-' + Date.now(),
    nombre: 'Test Vídeos Aleatorio',
    preguntas: selectedQuestions
  };

  currentQ = 0;
  userAnswers = currentTestData.preguntas.map(() => new Set());
  timerSeconds = 0;
  currentResultId = null;
  
  startTimer();
  renderQ();
  renderDots();
  showScreen('screenTest');
}

function startTimer() { 
  stopTimer(); 
  timerInterval = setInterval(() => { 
    timerSeconds++; 
    document.getElementById('timer').textContent = DataService.formatTime(timerSeconds); 
  }, 1000); 
}
function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

function renderQ() {
  const q = currentTestData.preguntas[currentQ];
  const total = currentTestData.preguntas.length;
  document.getElementById('qNumber').textContent = `PREGUNTA ${currentQ+1}`;
  document.getElementById('progressNum').textContent = `${currentQ+1} de ${total}`;
  document.getElementById('progressBar').style.width = `${((currentQ+1)/total)*100}%`;
  document.getElementById('btnPrev').style.visibility = currentQ === 0 ? 'hidden' : 'visible';
  document.getElementById('btnNext').textContent = currentQ === total-1 ? 'Finalizar →' : 'Siguiente →';
  
  // Vídeo
  document.getElementById('videoContainer').innerHTML = `<iframe src="${q.videoUrl}" allowfullscreen></iframe>`;
  
  // Opciones
  const c = document.getElementById('optionsList');
  c.innerHTML = '';
  q.opciones.forEach((opt, idx) => {
    const sel = userAnswers[currentQ].has(idx);
    const item = document.createElement('div');
    item.className = 'option-item' + (sel ? ' selected' : '');
    item.onclick = () => toggleOpt(idx);
    item.innerHTML = `<input type="checkbox" ${sel?'checked':''}/><div class="option-checkbox"></div><span class="option-label">${opt}</span>`;
    c.appendChild(item);
  });
  updateDots();
}

function toggleOpt(i) { if (userAnswers[currentQ].has(i)) userAnswers[currentQ].delete(i); else userAnswers[currentQ].add(i); renderQ(); }
function nextQ() { if (currentQ < currentTestData.preguntas.length-1) { currentQ++; renderQ(); } else finishVideoTest(); }
function prevQ() { if (currentQ > 0) { currentQ--; renderQ(); } }
function goToQ(i) { currentQ = i; renderQ(); }

function renderDots() {
  const c = document.getElementById('questionDots'); c.innerHTML = '';
  currentTestData.preguntas.forEach((_, i) => { 
    const d = document.createElement('div'); 
    d.className = 'question-dot'; 
    d.onclick = () => goToQ(i); 
    c.appendChild(d); 
  });
}
function updateDots() { 
  document.querySelectorAll('.question-dot').forEach((d,i) => { 
    d.className = 'question-dot'; 
    if (userAnswers[i]&&userAnswers[i].size>0) d.classList.add('answered'); 
    if (i===currentQ) d.classList.add('current'); 
  }); 
}

async function finishVideoTest() {
  stopTimer();
  const preguntas = currentTestData.preguntas;
  let correctCount=0, incorrectCount=0, missedCount=0, score=0, maxScore=0;
  
  preguntas.forEach((q,qi) => {
    const sel = userAnswers[qi];
    q.opciones.forEach((_,oi) => {
      const isC = q.correctas.includes(oi), isS = sel.has(oi);
      if (isC) { maxScore++; if (isS) { score++; correctCount++; } else missedCount++; }
      else { if (isS) { score--; incorrectCount++; } }
    });
  });

  const pct = maxScore > 0 ? Math.max(0,(score/maxScore)*100) : 0;
  
  document.getElementById('resPercent').textContent = pct.toFixed(1)+'%';
  document.getElementById('resScore').textContent = `${Math.max(0,score)}/${maxScore}`;
  document.getElementById('resTime').textContent = DataService.formatTime(timerSeconds);
  document.getElementById('resCorrect').textContent = correctCount;
  document.getElementById('resIncorrect').textContent = incorrectCount;
  document.getElementById('resMissed').textContent = missedCount;
  document.getElementById('reviewSection').classList.add('hidden');

  try {
    currentResultId = await DataService.saveTestResult({ 
      testNombre: currentTestData.nombre, 
      testType: 'video', 
      score: Math.max(0,score), 
      maxScore, 
      percentage: parseFloat(pct.toFixed(1)), 
      timeSeconds: timerSeconds, 
      answers: preguntas.map((q,qi)=>({
        questionId:q.id,
        selected:Array.from(userAnswers[qi]),
        correct:q.correctas
      })), 
      sawSolutions:false 
    });
  } catch (err) {
    console.error('Error guardando resultado:', err);
  }

  showScreen('screenResults');
}

function repeatVideoTest() { startVideoTest(); }

async function showVideoSolutions() {
  if (currentResultId) await DataService.markSawSolutions(currentResultId);
  
  const c = document.getElementById('reviewList'); c.innerHTML = '';
  currentTestData.preguntas.forEach((q,qi) => {
    const sel = userAnswers[qi];
    let html = '';
    q.opciones.forEach((opt,oi) => {
      const isC = q.correctas.includes(oi), isS = sel.has(oi);
      let cls='neutral';
      if (isS&&isC) cls='correct'; // Azul
      else if (isS&&!isC) cls='incorrect'; // Rojo
      else if (!isS&&isC) cls='correct'; // Azul
      
      html += `<div class="review-answer-item ${cls}">${opt}</div>`;
    });
    const card = document.createElement('div'); card.className = 'review-question';
    card.innerHTML = `<div class="review-q-header"><span class="review-q-num">Vídeo ${qi+1}</span><span class="review-q-text">${q.videoTitulo||'Situación de juego'}</span></div><div class="review-answers">${html}</div>`;
    c.appendChild(card);
  });
  document.getElementById('reviewSection').classList.remove('hidden');
}
