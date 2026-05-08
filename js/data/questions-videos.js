// ============================================
// ArbitrosPlaya - Banco de Preguntas: Vídeos
// IHF 2026 - Balonmano Playa
// ============================================

// Usamos vídeos de YouTube (embed) como placeholder.
// Reemplazar las URLs con los vídeos reales.
const PREGUNTAS_VIDEOS = [
  // TEST VÍDEO 1 (preguntas 0-4)
  {
    id: 'v1',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar con vídeo real
    videoTitulo: 'Situación de juego 1',
    opciones: [
      "a) Gol válido, no hay infracción",
      "b) Lanzamiento libre para el equipo defensor por entrada en el área",
      "c) Lanzamiento de 6 metros por falta sobre jugador en clara ocasión de gol",
      "d) El árbitro debe indicar juego pasivo"
    ],
    correctas: [2],
    test: 'video-1'
  },
  {
    id: 'v2',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar con vídeo real
    videoTitulo: 'Situación de juego 2',
    opciones: [
      "a) Gol válido — jugador de campo — 1 punto",
      "b) Gol espectáculo — 2 puntos (giro 360°)",
      "c) Gol no válido, el jugador pisó el área",
      "d) Gol no válido, dobles antes del lanzamiento"
    ],
    correctas: [1],
    test: 'video-1'
  },
  {
    id: 'v3',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar con vídeo real
    videoTitulo: 'Situación de juego 3',
    opciones: [
      "a) Exclusión al defensor por falta sobre clara ocasión de gol",
      "b) Solo tarjeta amarilla",
      "c) Lanzamiento libre, no hay exclusión",
      "d) Tarjeta roja por conducta antideportiva grave"
    ],
    correctas: [0],
    test: 'video-1'
  },
  {
    id: 'v4',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar con vídeo real
    videoTitulo: 'Situación de juego 4',
    opciones: [
      "a) Fuera: el balón salió completamente por la línea lateral",
      "b) Saque de portería: el balón salió por la línea de fondo",
      "c) Lanzamiento de esquina para el equipo atacante",
      "d) El juego continúa, el balón no salió"
    ],
    correctas: [2],
    test: 'video-1'
  },
  {
    id: 'v5',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar con vídeo real
    videoTitulo: 'Situación de juego 5',
    opciones: [
      "a) Gol del portero — 2 puntos",
      "b) El portero no puede anotar gol",
      "c) Gol del portero — 1 punto",
      "d) Gol no válido, el portero no puede lanzar desde dentro del área"
    ],
    correctas: [0],
    test: 'video-1'
  },

  // TEST VÍDEO 2 (preguntas 5-9)
  {
    id: 'v6',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar
    videoTitulo: 'Situación de juego 6',
    opciones: [
      "a) Juego pasivo — señal de advertencia",
      "b) Falta atacante — lanzamiento libre defensor",
      "c) Juego continúa — no hay infracción",
      "d) Tiempo muerto obligatorio"
    ],
    correctas: [0],
    test: 'video-2'
  },
  {
    id: 'v7',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar
    videoTitulo: 'Situación de juego 7',
    opciones: [
      "a) Tarjeta amarilla al jugador que protesta",
      "b) Exclusión directa por conducta antideportiva",
      "c) Solo amonestación verbal",
      "d) Descalificación por insultos graves"
    ],
    correctas: [1],
    test: 'video-2'
  },
  {
    id: 'v8',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar
    videoTitulo: 'Situación de juego 8',
    opciones: [
      "a) Válido — el portero puede bloquear con cualquier parte del cuerpo",
      "b) No válido — el portero usó los pies fuera del área",
      "c) Lanzamiento libre por obstrucción ilegal",
      "d) Juego continúa sin infracción"
    ],
    correctas: [0],
    test: 'video-2'
  },
  {
    id: 'v9',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar
    videoTitulo: 'Situación de juego 9',
    opciones: [
      "a) Gol válido — 1 punto equipo atacante",
      "b) Gol no válido — dobles antes del lanzamiento",
      "c) Gol no válido — el jugador entró en el área",
      "d) Gol espectáculo — 2 puntos (gol entre piernas)"
    ],
    correctas: [3],
    test: 'video-2'
  },
  {
    id: 'v10',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Reemplazar
    videoTitulo: 'Situación de juego 10',
    opciones: [
      "a) El shoot-out es válido — gol",
      "b) No válido — el jugador tardó más de 3 segundos",
      "c) No válido — el jugador no empezó desde la línea de medio campo",
      "d) No válido — el jugador botó el balón antes de lanzar"
    ],
    correctas: [1],
    test: 'video-2'
  }
];

// Organizar por tests de vídeo
const TESTS_VIDEOS = [
  {
    id: 'test-video-1',
    nombre: 'Test Vídeo #1',
    preguntas: PREGUNTAS_VIDEOS.filter(p => p.test === 'video-1')
  },
  {
    id: 'test-video-2',
    nombre: 'Test Vídeo #2',
    preguntas: PREGUNTAS_VIDEOS.filter(p => p.test === 'video-2')
  }
];

// Banco de vídeos por categorías
const BANCO_VIDEOS = [
  {
    categoria: 'Sanciones Disciplinarias',
    icono: '🟨',
    videos: [
      { id: 'bv1', titulo: 'Amonestación (Amarilla)', descripcion: 'Criterio para sanción progresiva', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv2', titulo: 'Exclusión de 2 min', descripcion: 'Infracciones que conllevan exclusión', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv3', titulo: 'Descalificación (Roja)', descripcion: 'Acciones de juego peligrosas', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    categoria: 'Goles de 1 Punto',
    icono: '⚽',
    videos: [
      { id: 'bv4', titulo: 'Gol de campo normal', descripcion: 'Lanzamiento básico sin giro ni fly', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv5', titulo: 'Gol de rebote', descripcion: 'Situaciones de balón dividido', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    categoria: 'Goles Espectáculo (2 Puntos)',
    icono: '🏆',
    videos: [
      { id: 'bv6', titulo: 'Giro de 360° (Pirueta)', descripcion: 'Mecánica correcta del salto y giro', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv7', titulo: 'Fly (In-flight)', descripcion: 'Recepción y lanzamiento en el aire', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv8', titulo: 'Gol del Portero', descripcion: 'Valoración del gol anotado por el portero', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    categoria: '6 Metros y Área',
    icono: '📏',
    videos: [
      { id: 'bv9', titulo: 'Señalización de 6m', descripcion: 'Falta en clara ocasión de gol', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv10', titulo: 'Defensa en el área', descripcion: 'Intervención ilegal del defensor', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    categoria: 'Juego Pasivo',
    icono: '⏳',
    videos: [
      { id: 'bv11', titulo: 'Advertencia de pasivo', descripcion: 'Señal de mano levantada', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv12', titulo: 'Ejecución de pasivo', descripcion: 'Lanzamiento libre tras advertencia', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    categoria: 'Cambios Incorrectos',
    icono: '🔄',
    videos: [
      { id: 'bv13', titulo: 'Falta de cambio', descripcion: 'Entrada/salida por zona incorrecta', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv14', titulo: 'Mal cambio de portero', descripcion: 'Sustitución fuera de tiempo o forma', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    categoria: 'Acciones del Portero',
    icono: '🧤',
    videos: [
      { id: 'bv15', titulo: 'Parada y saque', descripcion: 'Reinicio del juego tras parada', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv16', titulo: 'Portero fuera del área', descripcion: 'Limitaciones y reglas de contacto', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    categoria: 'Señales y Árbitro',
    icono: '🦓',
    videos: [
      { id: 'bv17', titulo: 'Colocación en pista', descripcion: 'Movimiento de los árbitros durante el juego', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'bv18', titulo: 'Gestos de infracción', descripcion: 'Señales manuales oficiales IHF', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  }
];
