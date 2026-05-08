// ============================================
// ArbitrosPlaya - Banco de Preguntas: Reglas
// IHF 2026 - Balonmano Playa
// ============================================

const PREGUNTAS_REGLAS = [
  // TEST 1 (preguntas 0-9)
  {
    id: 1,
    texto: "¿Cuántos jugadores puede tener un equipo en el campo durante el juego en balonmano playa?",
    opciones: [
      "a) 4 jugadores (3 de campo + 1 portero)",
      "b) 5 jugadores (4 de campo + 1 portero)",
      "c) 6 jugadores (5 de campo + 1 portero)",
      "d) 7 jugadores (6 de campo + 1 portero)"
    ],
    correctas: [0],
    test: 1
  },
  {
    id: 2,
    texto: "¿Cuál es la duración de cada tiempo en un partido de balonmano playa?",
    opciones: [
      "a) 10 minutos",
      "b) 12 minutos",
      "c) 15 minutos",
      "d) 20 minutos"
    ],
    correctas: [1],
    test: 1
  },
  {
    id: 3,
    texto: "¿Cuántos puntos vale un gol marcado por un jugador de campo en balonmano playa?",
    opciones: [
      "a) 1 punto",
      "b) 2 puntos",
      "c) 3 puntos",
      "d) Depende de cómo se marque"
    ],
    correctas: [0],
    test: 1
  },
  {
    id: 4,
    texto: "¿Cuántos puntos vale un gol de espectáculo (alley-oop, giro 360°, entre piernas, etc.)?",
    opciones: [
      "a) 1 punto",
      "b) 2 puntos",
      "c) 3 puntos",
      "d) Ninguno, no existe esta regla"
    ],
    correctas: [1],
    test: 1
  },
  {
    id: 5,
    texto: "¿Qué sucede si el marcador está igualado al finalizar los dos tiempos reglamentarios?",
    opciones: [
      "a) Se juega una prórroga de 5 minutos",
      "b) Se lanza un shoot-out (serie de penaltis)",
      "c) Se declara empate",
      "d) Se juega un golden goal"
    ],
    correctas: [1],
    test: 1
  },
  {
    id: 6,
    texto: "¿Qué dimensiones tiene el área de portería en balonmano playa?",
    opciones: [
      "a) 6 metros de radio",
      "b) 5 metros de radio",
      "c) 4 metros de radio",
      "d) 3 metros de radio"
    ],
    correctas: [0],
    test: 1
  },
  {
    id: 7,
    texto: "En balonmano playa, ¿puede el portero salir del área de portería con el balón en la mano?",
    opciones: [
      "a) Sí, sin restricciones",
      "b) Sí, pero solo para lanzar",
      "c) No, nunca puede salir del área con el balón",
      "d) Sí, pero solo cuando hay un lanzamiento de 6 metros"
    ],
    correctas: [1],
    test: 1
  },
  {
    id: 8,
    texto: "¿Cuántos tiempos muertos (time-out) puede pedir cada equipo por tiempo de juego?",
    opciones: [
      "a) Ninguno",
      "b) 1 tiempo muerto",
      "c) 2 tiempos muertos",
      "d) 3 tiempos muertos"
    ],
    correctas: [1],
    test: 1
  },
  {
    id: 9,
    texto: "¿Cuánto tiempo dura un tiempo muerto en balonmano playa?",
    opciones: [
      "a) 30 segundos",
      "b) 1 minuto",
      "c) 2 minutos",
      "d) No tienen límite de tiempo"
    ],
    correctas: [1],
    test: 1
  },
  {
    id: 10,
    texto: "En el shoot-out de balonmano playa, ¿qué distancia recorre el jugador antes de lanzar?",
    opciones: [
      "a) Desde la línea de 6 metros, estático",
      "b) Desde la línea de 9 metros con carrera",
      "c) Desde el centro del campo",
      "d) Desde la línea de medio campo con 3 segundos para lanzar"
    ],
    correctas: [3],
    test: 1
  },

  // TEST 2 (preguntas 10-19)
  {
    id: 11,
    texto: "¿Cuándo se produce una exclusión (2 minutos) en balonmano playa?",
    opciones: [
      "a) Solo cuando hay una infracción grave",
      "b) Después de recibir una tarjeta amarilla",
      "c) Después de la tercera advertencia progresiva",
      "d) En cualquier momento que el árbitro lo decida sin advertencia previa"
    ],
    correctas: [1],
    test: 2
  },
  {
    id: 12,
    texto: "¿Puede un portero de balonmano playa anotar un gol directamente con un lanzamiento desde su área?",
    opciones: [
      "a) No, el portero no puede anotar",
      "b) Sí, y vale 1 punto",
      "c) Sí, y vale 2 puntos",
      "d) Sí, pero solo si lanza desde fuera del área"
    ],
    correctas: [2],
    test: 2
  },
  {
    id: 13,
    texto: "¿Cuál es la sanción por una entrada irregular que impide una clara ocasión de gol?",
    opciones: [
      "a) Tarjeta amarilla + lanzamiento libre",
      "b) Exclusión directa + lanzamiento de 6 metros",
      "c) Solo lanzamiento de 6 metros",
      "d) Descalificación directa"
    ],
    correctas: [1],
    test: 2
  },
  {
    id: 14,
    texto: "En balonmano playa, ¿qué ocurre cuando hay una infracción dentro del área de portería del equipo atacante?",
    opciones: [
      "a) Saque de portería",
      "b) Lanzamiento libre desde el punto de la infracción",
      "c) Lanzamiento libre desde la línea del área",
      "d) Se concede un lanzamiento de 6 metros"
    ],
    correctas: [2],
    test: 2
  },
  {
    id: 15,
    texto: "¿Cuántos pasos puede dar un jugador sin botar el balón en balonmano playa?",
    opciones: [
      "a) 2 pasos",
      "b) 3 pasos",
      "c) 4 pasos",
      "d) No existe límite de pasos"
    ],
    correctas: [1],
    test: 2
  },
  {
    id: 16,
    texto: "¿Cuántos segundos puede retener el balón un jugador sin botar ni pasar en balonmano playa?",
    opciones: [
      "a) 2 segundos",
      "b) 3 segundos",
      "c) 4 segundos",
      "d) 5 segundos"
    ],
    correctas: [1],
    test: 2
  },
  {
    id: 17,
    texto: "¿Puede un jugador de campo entrar en el área de portería rival?",
    opciones: [
      "a) Sí, siempre que no tenga el balón",
      "b) No, bajo ninguna circunstancia",
      "c) Solo para rematar de cabeza",
      "d) Solo si el portero rival no está en el área"
    ],
    correctas: [1],
    test: 2
  },
  {
    id: 18,
    texto: "En balonmano playa, ¿qué significa cuando el árbitro hace la señal de «brazos cruzados»?",
    opciones: [
      "a) Falta atacante",
      "b) Dobles",
      "c) Pasivos",
      "d) Fuera de tiempo"
    ],
    correctas: [2],
    test: 2
  },
  {
    id: 19,
    texto: "¿Cómo se reanuda el juego después de un gol en balonmano playa?",
    opciones: [
      "a) Saque de centro desde el medio campo",
      "b) El equipo que recibió el gol saca desde cualquier punto del área de portería",
      "c) El equipo que recibió el gol saca desde el centro del campo",
      "d) El árbitro lanza el balón al aire"
    ],
    correctas: [1],
    test: 2
  },
  {
    id: 20,
    texto: "¿Cuántos jugadores componen como máximo la lista de un equipo en balonmano playa?",
    opciones: [
      "a) 6 jugadores",
      "b) 8 jugadores",
      "c) 10 jugadores",
      "d) 12 jugadores"
    ],
    correctas: [2],
    test: 2
  },

  // TEST 3 (preguntas 20-29)
  {
    id: 21,
    texto: "¿Cuáles de las siguientes acciones son consideradas «goles de espectáculo» que valen 2 puntos? (Pueden ser varias respuestas correctas)",
    opciones: [
      "a) Gol marcado en suspensión",
      "b) Gol marcado con un giro de 360°",
      "c) Gol marcado entre las piernas",
      "d) Gol marcado con la cabeza"
    ],
    correctas: [1, 2],
    test: 3
  },
  {
    id: 22,
    texto: "¿En qué situaciones puede el árbitro conceder un lanzamiento de 6 metros directamente? (Pueden ser varias respuestas correctas)",
    opciones: [
      "a) Falta sobre un jugador en clara ocasión de gol",
      "b) Obstrucción ilegal al portero rival",
      "c) Entrada irregular sobre cualquier jugador en el área",
      "d) Penalti por conducta antideportiva grave"
    ],
    correctas: [0, 3],
    test: 3
  },
  {
    id: 23,
    texto: "¿Qué dimensiones tiene el campo de balonmano playa?",
    opciones: [
      "a) 27 × 15 metros",
      "b) 27 × 12 metros",
      "c) 40 × 20 metros",
      "d) 24 × 12 metros"
    ],
    correctas: [0],
    test: 3
  },
  {
    id: 24,
    texto: "¿Cuánto mide la portería en balonmano playa?",
    opciones: [
      "a) 2 m de alto × 3 m de ancho",
      "b) 2,5 m de alto × 3 m de ancho",
      "c) 2 m de alto × 2,5 m de ancho",
      "d) 3 m de alto × 2 m de ancho"
    ],
    correctas: [0],
    test: 3
  },
  {
    id: 25,
    texto: "¿Puede el portero de balonmano playa interceptar el balón fuera de su área de portería con el pie?",
    opciones: [
      "a) Sí, libremente",
      "b) Sí, pero solo si está dentro del área",
      "c) No, fuera del área se considera jugador de campo",
      "d) Solo puede hacerlo en el shoot-out"
    ],
    correctas: [2],
    test: 3
  },
  {
    id: 26,
    texto: "¿Cuándo se debe mostrar una tarjeta roja en balonmano playa? (Pueden ser varias respuestas correctas)",
    opciones: [
      "a) Por conducta antideportiva muy grave",
      "b) Por agresión a un rival",
      "c) Por insultos al árbitro",
      "d) Por protestar una decisión arbitral por primera vez"
    ],
    correctas: [0, 1, 2],
    test: 3
  },
  {
    id: 27,
    texto: "¿Cuándo puede un jugador excluido volver al campo?",
    opciones: [
      "a) Después de 1 minuto de juego efectivo",
      "b) Cuando lo indique el anotador/cronometrador",
      "c) Nunca puede volver en ese tiempo",
      "d) Cuando el equipo contrario marque un gol"
    ],
    correctas: [1],
    test: 3
  },
  {
    id: 28,
    texto: "En el shoot-out, ¿cuántos segundos tiene el jugador para lanzar una vez que el árbitro pita?",
    opciones: [
      "a) 3 segundos",
      "b) 4 segundos",
      "c) 5 segundos",
      "d) Sin límite de tiempo"
    ],
    correctas: [0],
    test: 3
  },
  {
    id: 29,
    texto: "¿Qué ocurre si un equipo no tiene al menos 3 jugadores disponibles para comenzar el partido?",
    opciones: [
      "a) Se da el partido por perdido",
      "b) Se espera 10 minutos y luego se pierde",
      "c) Se juega igualmente con los disponibles",
      "d) Se pospone el partido"
    ],
    correctas: [0],
    test: 3
  },
  {
    id: 30,
    texto: "¿Qué es el juego pasivo en balonmano playa?",
    opciones: [
      "a) Retener el balón sin intentar atacar para ganar tiempo",
      "b) Jugar con 2 jugadores menos en el campo",
      "c) No defender activamente",
      "d) Realizar más de 3 pases seguidos sin lanzar"
    ],
    correctas: [0],
    test: 3
  }
];

// Organizar por tests
const TESTS_REGLAS = [
  {
    id: 'test-reglas-1',
    nombre: 'Test Reglas #1',
    preguntas: PREGUNTAS_REGLAS.filter(p => p.test === 1)
  },
  {
    id: 'test-reglas-2',
    nombre: 'Test Reglas #2',
    preguntas: PREGUNTAS_REGLAS.filter(p => p.test === 2)
  },
  {
    id: 'test-reglas-3',
    nombre: 'Test Reglas #3',
    preguntas: PREGUNTAS_REGLAS.filter(p => p.test === 3)
  }
];

// Calcular puntos máximos posibles de un test
function calcularPuntosMaximos(preguntas) {
  return preguntas.reduce((total, p) => total + p.correctas.length, 0);
}
