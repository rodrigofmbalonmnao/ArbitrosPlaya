// ============================================
// ArbitrosPlaya - test-reglas.js
// Lógica del test de reglas (10 preguntas ALEATORIAS)
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
    // Iniciamos directamente con la advertencia
    showScreen('screenWarning');
  }
})();

function goBack() {
  const screenTest = document.getElementById('screenTest');
  if (screenTest.classList.contains('active')) {
    if (confirm('¿Seguro que quieres salir? Perderás el progreso del test.')) {
      stopTimer();
      window.location.href = '../home.html';
    }
  } else {
    window.location.href = '../home.html';
  }
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
async function startTest() {
  // Seleccionar 10 preguntas aleatorias del banco global (dinámico)
  const allQuestions = await DataService.getQuestionsBank();
  const selectedQuestions = shuffle([...allQuestions]).slice(0, 10);
  
  currentTestData = {
    id: 'random-' + Date.now(),
    nombre: 'Test Reglas Aleatorio',
    preguntas: selectedQuestions
  };

  currentQ = 0;
  userAnswers = currentTestData.preguntas.map(() => new Set());
  timerSeconds = 0;
  currentResultId = null;
  
  startTimer();
  renderQuestion();
  renderDots();
  showScreen('screenTest');
}

// ---- Timer ----
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    timerSeconds++;
    document.getElementById('timer').textContent = DataService.formatTime(timerSeconds);
  }, 1000);
}
function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

// ---- Render question ----
function renderQuestion() {
  const q = currentTestData.preguntas[currentQ];
  const total = currentTestData.preguntas.length;
  document.getElementById('qNumber').textContent = `PREGUNTA ${currentQ + 1}`;
  document.getElementById('qText').textContent = q.texto;
  document.getElementById('progressNum').textContent = `${currentQ + 1} de ${total}`;
  document.getElementById('progressBar').style.width = `${((currentQ + 1) / total) * 100}%`;
  document.getElementById('btnPrev').style.visibility = currentQ === 0 ? 'hidden' : 'visible';
  document.getElementById('btnNext').textContent = currentQ === total - 1 ? 'Finalizar →' : 'Siguiente →';

  const container = document.getElementById('optionsList');
  container.innerHTML = '';
  q.opciones.forEach((opt, idx) => {
    const selected = userAnswers[currentQ].has(idx);
    const item = document.createElement('div');
    item.className = 'option-item' + (selected ? ' selected' : '');
    item.onclick = () => toggleOption(idx);
    item.innerHTML = `
      <input type="checkbox" ${selected ? 'checked' : ''} />
      <div class="option-checkbox"></div>
      <span class="option-label">${opt}</span>
    `;
    container.appendChild(item);
  });
  updateDots();
}

function toggleOption(idx) {
  if (userAnswers[currentQ].has(idx)) userAnswers[currentQ].delete(idx);
  else userAnswers[currentQ].add(idx);
  renderQuestion();
}

function nextQuestion() {
  const total = currentTestData.preguntas.length;
  if (currentQ < total - 1) { currentQ++; renderQuestion(); }
  else finishTest();
}

function prevQuestion() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
}

function goToQuestion(idx) { currentQ = idx; renderQuestion(); }

// ---- Dots ----
function renderDots() {
  const container = document.getElementById('questionDots');
  container.innerHTML = '';
  currentTestData.preguntas.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = 'question-dot';
    dot.onclick = () => goToQuestion(idx);
    container.appendChild(dot);
  });
}
function updateDots() {
  const dots = document.querySelectorAll('.question-dot');
  dots.forEach((d, i) => {
    d.className = 'question-dot';
    if (userAnswers[i] && userAnswers[i].size > 0) d.classList.add('answered');
    if (i === currentQ) d.classList.add('current');
  });
}

// ---- Finish test ----
async function finishTest() {
  stopTimer();
  const preguntas = currentTestData.preguntas;
  let correctCount = 0, incorrectCount = 0, missedCount = 0, score = 0, maxScore = 0;

  preguntas.forEach((q, qi) => {
    const selected = userAnswers[qi];
    q.opciones.forEach((_, oi) => {
      const isCorrect = q.correctas.includes(oi);
      const isSelected = selected.has(oi);
      if (isCorrect) {
        maxScore++;
        if (isSelected) { score++; correctCount++; }
        else { missedCount++; }
      } else {
        if (isSelected) { score--; incorrectCount++; }
      }
    });
  });

  const percentage = maxScore > 0 ? Math.max(0, (score / maxScore) * 100) : 0;

  document.getElementById('resPercent').textContent = percentage.toFixed(1) + '%';
  document.getElementById('resScore').textContent = `${Math.max(0, score)}/${maxScore}`;
  document.getElementById('resTime').textContent = DataService.formatTime(timerSeconds);
  document.getElementById('reviewSection').classList.add('hidden');
  
  const btnRepeat = document.getElementById('btnRepeatSame');
  if (btnRepeat) btnRepeat.style.display = 'inline-block';

  // Save result
  try {
    currentResultId = await DataService.saveTestResult({
      test_nombre: currentTestData.nombre,
      test_type: 'reglas',
      score: Math.max(0, score),
      maxScore,
      percentage: parseFloat(percentage.toFixed(1)),
      time_seconds: timerSeconds,
      answers: preguntas.map((q, qi) => ({ 
        questionId: q.id, 
        selected: Array.from(userAnswers[qi]), 
        correct: q.correctas 
      })),
      sawSolutions: false
    });
  } catch (err) {
    console.error('Error guardando resultado:', err);
  }

  showScreen('screenResults');
  showSolutions(false); // VISTA AUTOMÁTICA (Muestra aciertos/errores del usuario)
}

// ---- Repeat / New ----
function startNewTest() { startTest(); }
function repeatSameTest() {
  if (!currentTestData) return;
  currentQ = 0;
  userAnswers = currentTestData.preguntas.map(() => new Set());
  timerSeconds = 0;
  currentResultId = null;
  startTimer();
  renderQuestion();
  renderDots();
  showScreen('screenTest');
}

// ---- Show solutions ----
async function showSolutions(revealAll = false) {
  if (revealAll) {
    const btnRepeat = document.getElementById('btnRepeatSame');
    if (btnRepeat) btnRepeat.style.display = 'none';
    if (currentResultId) {
      await DataService.markSawSolutions(currentResultId);
    }
  }
  
  const container = document.getElementById('reviewList');
  container.innerHTML = '';
  const preguntas = currentTestData.preguntas;

  preguntas.forEach((q, qi) => {
    const selected = userAnswers[qi];
    
    let ansHTML = '';
    q.opciones.forEach((opt, oi) => {
      const isCorrect = q.correctas.includes(oi);
      const isSelected = selected && selected.has(oi);
      
      let cls = 'neutral';
      
      if (revealAll) {
        // VISTA SOLUCIONES: Solo mostrar correctas en azul
        if (isCorrect) cls = 'correct';
      } else {
        // VISTA AUTOMÁTICA: Mostrar lo que el usuario marcó (Azul/Rojo)
        if (isSelected) {
          cls = isCorrect ? 'correct' : 'incorrect';
        }
      }
      
      ansHTML += `<div class="review-answer-item ${cls}">${opt}</div>`;
    });

    const card = document.createElement('div');
    card.className = 'review-question';
    card.innerHTML = `
      <div class="review-q-header">
        <span class="review-q-num">Pregunta ${qi + 1}</span>
        <span class="review-q-text">${q.texto}</span>
      </div>
      <div class="review-answers">${ansHTML}</div>
    `;
    container.appendChild(card);
  });

  document.getElementById('reviewSection').classList.remove('hidden');
}
