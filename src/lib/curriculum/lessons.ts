/**
 * @file lessons.ts
 * @description Complete typing curriculum for LATAM Spanish keyboard.
 *
 * This curriculum follows standard touch typing pedagogy:
 * 1. Home row mastery first (ASDF JKL and ñ)
 * 2. Expand to top row (QWERTY)
 * 3. Expand to bottom row (ZXCVB)
 * 4. Numbers and symbols
 * 5. LATAM-specific characters (accents, inverted punctuation)
 * 6. Word and sentence practice
 *
 * Key LATAM keyboard features addressed:
 * - Ñ (ñ) at Semicolon key position (direct character, NOT dead key)
 * - Dead key accents (acute via BracketLeft, dieresis via Shift+BracketLeft)
 * - Inverted question/exclamation marks (¿ at Equal, ¡ at Shift+1)
 * - Spanish-specific punctuation and symbol positions
 */

import type { Lesson, Exercise } from './types';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create drill exercises from key patterns
 */
function createDrills(patterns: string[], prefix: string): Exercise[] {
  return patterns.map((text, index) => ({
    id: `${prefix}-drill-${index + 1}`,
    type: 'drill' as const,
    text,
    targetAccuracy: 95,
  }));
}

/**
 * Create word exercises
 */
function createWordExercises(words: string[], prefix: string): Exercise[] {
  return [{
    id: `${prefix}-words`,
    type: 'words' as const,
    text: words.join(' '),
    targetAccuracy: 90,
  }];
}

// =============================================================================
// Module 1: Home Row Foundation
// =============================================================================

export const LESSON_HOME_ROW_LEFT: Lesson = {
  id: 'home-row-left',
  name: 'Fila Base - Mano Izquierda',
  nameEn: 'Home Row - Left Hand',
  description: 'Aprende las teclas base de la mano izquierda: A, S, D, F',
  descriptionEn: 'Learn the home row keys for the left hand: A, S, D, F',
  category: 'home-row',
  difficulty: 'beginner',
  keys: ['a', 's', 'd', 'f'],
  keyCodes: ['KeyA', 'KeyS', 'KeyD', 'KeyF'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index'],
  prerequisites: [],
  estimatedMinutes: 5,
  tips: [
    'Coloca tu dedo índice izquierdo en la tecla F (tiene una marca táctil)',
    'Mantén los dedos curvados y relajados',
    'No mires el teclado',
  ],
  exercises: [
    ...createDrills([
      'fff fff fff fff fff',
      'ddd ddd ddd ddd ddd',
      'sss sss sss sss sss',
      'aaa aaa aaa aaa aaa',
      'fdf fdf fdf fdf fdf',
      'sas sas sas sas sas',
      'dfd dfd dfd dfd dfd',
      'asa asa asa asa asa',
      'asdf asdf asdf asdf',
      'fdsa fdsa fdsa fdsa',
      'afsd afsd dfas dfas',
      'sadf sadf dfsa dfsa',
      'fasd fasd dsaf dsaf',
      'sdfa sdfa afds afds',
    ], 'hrl'),
    {
      id: 'hrl-combo',
      type: 'drill',
      text: 'asd sad das dsa fad fas saf daf ads fds sda afs',
      targetAccuracy: 92,
    },
    {
      id: 'hrl-words',
      type: 'words',
      text: 'asa dad fad sad as fa da sa dad fad',
      targetAccuracy: 90,
    },
  ],
};

export const LESSON_HOME_ROW_RIGHT: Lesson = {
  id: 'home-row-right',
  name: 'Fila Base - Mano Derecha',
  nameEn: 'Home Row - Right Hand',
  description: 'Aprende las teclas base de la mano derecha: J, K, L, Ñ. La Ñ está en la posición del punto y coma del teclado inglés.',
  descriptionEn: 'Learn the home row keys for the right hand: J, K, L, Ñ. Ñ is at the semicolon position of English keyboards.',
  category: 'home-row',
  difficulty: 'beginner',
  keys: ['j', 'k', 'l', 'ñ'],
  keyCodes: ['KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
  fingers: ['right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: [],
  estimatedMinutes: 7,
  tips: [
    'El dedo índice derecho va en la tecla J (tiene marca táctil)',
    'La Ñ está donde estaría el punto y coma en inglés - NO es dead key',
    'Practica el movimiento del meñique hacia la Ñ constantemente',
    'La Ñ es una letra directa, no requiere combinación de teclas',
  ],
  exercises: [
    ...createDrills([
      'jjj jjj jjj jjj jjj',
      'kkk kkk kkk kkk kkk',
      'lll lll lll lll lll',
      'ñññ ñññ ñññ ñññ ñññ',
      'jkl jkl jkl jkl jkl',
      'lkj lkj lkj lkj lkj',
      'jkñ jkñ kñl kñl lñj',
      'lñj lñj ñlk ñlk ñkj',
      'jñk jñk kñj kñj lñk',
      'ñjk ñjk ñkl ñkl ñlj',
      // Ñ-focused drills for Spanish fluency
      'ñañ ñañ ñeñ ñeñ ñiñ ñiñ',
      'ñoñ ñoñ ñuñ ñuñ ñañ ñañ',
      'jñj jñj kñk kñk lñl lñl',
      'ñjñ ñjñ ñkñ ñkñ ñlñ ñlñ',
    ], 'hrr'),
    {
      id: 'hrr-combo',
      type: 'drill',
      text: 'jñl kñj lkñ jlk ñkj lñk ñjl kñl jkñ lñj',
      targetAccuracy: 92,
    },
    {
      id: 'hrr-ene-focus',
      type: 'drill',
      text: 'ñ ñ ñ jñ kñ lñ ñj ñk ñl jkñ lkñ ñkj',
      targetAccuracy: 90,
    },
  ],
};

export const LESSON_HOME_ROW_COMBINED: Lesson = {
  id: 'home-row-combined',
  name: 'Fila Base - Ambas Manos',
  nameEn: 'Home Row - Both Hands',
  description: 'Combina las teclas de ambas manos en la fila base, incluyendo la Ñ',
  descriptionEn: 'Combine keys from both hands on the home row, including Ñ',
  category: 'home-row',
  difficulty: 'beginner',
  keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ñ'],
  keyCodes: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['home-row-left', 'home-row-right'],
  estimatedMinutes: 10,
  tips: [
    'Alterna entre manos para desarrollar ritmo',
    'Mantén una postura relajada',
    'La Ñ es fundamental en español - practícala mucho',
  ],
  exercises: [
    ...createDrills([
      'asdf jklñ asdf jklñ',
      'fjdk slña fjdk slña',
      'alfa alfa alfa alfa',
      'sala sala sala sala',
      'falla falla falla',
      'dada dada dada dada',
      'lass lass lass lass',
      'jala jala jala jala',
      'silla silla silla',
      'fila fila fila fila',
      // Ñ words practice
      'daña daña daña daña',
      'saña saña saña saña',
      'aña aña aña aña aña',
      'alas alas dalas dalas',
      'fallas fallas kallas',
    ], 'hrc'),
    {
      id: 'hrc-words',
      type: 'words',
      text: 'ala sal las dad faja falla dalla silla fila',
      targetAccuracy: 90,
    },
    {
      id: 'hrc-ene-words',
      type: 'words',
      text: 'daña saña faña laña jalña aña kaña',
      targetAccuracy: 88,
    },
  ],
};

export const LESSON_HOME_ROW_GH: Lesson = {
  id: 'home-row-gh',
  name: 'Fila Base - G y H',
  nameEn: 'Home Row - G and H',
  description: 'Agrega las teclas G y H usando los dedos índices',
  descriptionEn: 'Add G and H keys using the index fingers',
  category: 'home-row',
  difficulty: 'beginner',
  keys: ['g', 'h'],
  keyCodes: ['KeyG', 'KeyH'],
  fingers: ['left-index', 'right-index'],
  prerequisites: ['home-row-combined'],
  estimatedMinutes: 8,
  tips: [
    'G se alcanza con el índice izquierdo moviéndose a la derecha',
    'H se alcanza con el índice derecho moviéndose a la izquierda',
    'Regresa siempre a F y J después de presionar G o H',
  ],
  exercises: [
    ...createDrills([
      'fgf fgf fgf fgf fgf',
      'jhj jhj jhj jhj jhj',
      'gag gag hah hah gag',
      'fg hj fg hj fg hj',
      'gala gala gala gala',
      'hada hada hada hada',
      'haga haga haga haga',
      'agha agha agha agha',
      'ghgh ghgh hghg hghg',
      'fgh fgh jgh jgh ghj',
      // Ñ combinations with G and H
      'gañ gañ hañ hañ gañ',
      'ñag ñag ñah ñah ñagh',
      'gaña gaña haña haña',
    ], 'hrgh'),
    {
      id: 'hrgh-words',
      type: 'words',
      text: 'gala hada halla jagga haga falda gañas hagas',
      targetAccuracy: 90,
    },
    {
      id: 'hrgh-ene-combo',
      type: 'words',
      text: 'gaña haña leña seña caña dueña enseña peña',
      targetAccuracy: 88,
    },
  ],
};

// =============================================================================
// Module 2: Top Row
// =============================================================================

export const LESSON_TOP_ROW_LEFT: Lesson = {
  id: 'top-row-left',
  name: 'Fila Superior - Mano Izquierda',
  nameEn: 'Top Row - Left Hand',
  description: 'Aprende Q, W, E, R, T',
  descriptionEn: 'Learn Q, W, E, R, T',
  category: 'top-row',
  difficulty: 'beginner',
  keys: ['q', 'w', 'e', 'r', 't'],
  keyCodes: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index'],
  prerequisites: ['home-row-gh'],
  estimatedMinutes: 10,
  tips: [
    'Cada dedo sube verticalmente desde la fila base',
    'El índice cubre tanto R como T',
    'Regresa a la fila base después de cada letra',
  ],
  exercises: [
    ...createDrills([
      'aqa aqa sws sws ded ded',
      'frf frf ftf ftf frf ftf',
      'aqaq swsw eded frfr ftft',
      'qwer qwer qwer qwer',
      'trew trew trew trew',
      'que que que que que',
      'tres tres tres tres',
      'qwe qwe wer wer ert ert',
      'rte rte etr etr trw trw',
      'qwert qwert terwq terwq',
      'querer querer querer',
      'estar estar estar',
      'tarea tarea tarea',
    ], 'trl'),
    {
      id: 'trl-words',
      type: 'words',
      text: 'que este tela rata greta fresa estar querer',
      targetAccuracy: 88,
    },
    {
      id: 'trl-combo',
      type: 'drill',
      text: 'atrás estra reta trae traer estar testa',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_TOP_ROW_RIGHT: Lesson = {
  id: 'top-row-right',
  name: 'Fila Superior - Mano Derecha',
  nameEn: 'Top Row - Right Hand',
  description: 'Aprende Y, U, I, O, P',
  descriptionEn: 'Learn Y, U, I, O, P',
  category: 'top-row',
  difficulty: 'beginner',
  keys: ['y', 'u', 'i', 'o', 'p'],
  keyCodes: ['KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  fingers: ['right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['home-row-gh'],
  estimatedMinutes: 10,
  tips: [
    'Y y U se presionan con el índice derecho',
    'P requiere estirar el meñique hacia arriba',
    'Practica combinaciones con Ñ y vocales',
  ],
  exercises: [
    ...createDrills([
      'jyj jyj juj juj kik kik',
      'lol lol ñpñ ñpñ lol ñpñ',
      'yuio yuio yuio yuio',
      'poiu poiu poiu poiu',
      'yo yo yo yo tu tu tu',
      'piso piso piso piso',
      'yuiop yuiop poiuy poiuy',
      'uiop uiop piou piou',
      'yup yup poi poi oiu oiu',
      'puy puy iyo iyo upo upo',
      // Ñ + vowels practice
      'uñi uñi oñu oñu iño iño',
      'puño puño piño piño',
      'yiñu yiñu uñoy uñoy',
    ], 'trr'),
    {
      id: 'trr-words',
      type: 'words',
      text: 'hijo tipo julio polo yoyo pujo piso tuyo suyo',
      targetAccuracy: 88,
    },
    {
      id: 'trr-ene-words',
      type: 'words',
      text: 'puño cuño piñón uña oñu iñu año niño sueño',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_TOP_ROW_COMBINED: Lesson = {
  id: 'top-row-combined',
  name: 'Fila Superior - Completa',
  nameEn: 'Top Row - Complete',
  description: 'Practica toda la fila superior con palabras reales españolas',
  descriptionEn: 'Practice the entire top row with real Spanish words',
  category: 'top-row',
  difficulty: 'intermediate',
  keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  keyCodes: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['top-row-left', 'top-row-right'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'trc-drill-1',
      type: 'drill',
      text: 'qwerty uiop qwerty uiop qwerty',
      targetAccuracy: 90,
    },
    {
      id: 'trc-drill-2',
      type: 'drill',
      text: 'poiuy trewq poiuy trewq poiuy',
      targetAccuracy: 90,
    },
    {
      id: 'trc-words-1',
      type: 'words',
      text: 'equipo puerta tierra poder quieto respeto',
      targetAccuracy: 88,
    },
    {
      id: 'trc-words-2',
      type: 'words',
      text: 'quiero potrero toquete repertorio territorio',
      targetAccuracy: 85,
    },
    {
      id: 'trc-ene-words',
      type: 'words',
      text: 'pequeño enseñar sueño dueño riñón piñata',
      targetAccuracy: 85,
    },
    {
      id: 'trc-sentences',
      type: 'sentences',
      text: 'El equipo de trabajo hizo su tarea. Quiero aprender a escribir rápido.',
      targetAccuracy: 85,
    },
  ],
};

// =============================================================================
// Module 3: Bottom Row
// =============================================================================

export const LESSON_BOTTOM_ROW_LEFT: Lesson = {
  id: 'bottom-row-left',
  name: 'Fila Inferior - Mano Izquierda',
  nameEn: 'Bottom Row - Left Hand',
  description: 'Aprende Z, X, C, V, B',
  descriptionEn: 'Learn Z, X, C, V, B',
  category: 'bottom-row',
  difficulty: 'beginner',
  keys: ['z', 'x', 'c', 'v', 'b'],
  keyCodes: ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index'],
  prerequisites: ['top-row-combined'],
  estimatedMinutes: 10,
  tips: [
    'Los dedos bajan diagonalmente desde la fila base',
    'V y B se presionan con el índice izquierdo',
    'Z requiere cuidado con el meñique',
  ],
  exercises: [
    ...createDrills([
      'aza aza sxs sxs dcd dcd',
      'fvf fvf fbf fbf fvf fbf',
      'zxcv zxcv zxcv zxcv',
      'bvcx bvcx bvcx bvcx',
      'vez vez vez vez vez',
      'vaca vaca vaca vaca',
      'zxcvb zxcvb bvcxz bvcxz',
      'bxv bxv czv czv xzb xzb',
      'cabo cabo cabo cabo',
      'brazo brazo brazo',
      'caza caza caza caza',
      'cerveza cerveza cerveza',
    ], 'brl'),
    {
      id: 'brl-words',
      type: 'words',
      text: 'vez caza brazo exacto cerveza vaca boca besa',
      targetAccuracy: 85,
    },
    {
      id: 'brl-combo',
      type: 'words',
      text: 'bizcocho cabeza voraz vacío bizarro vocación',
      targetAccuracy: 82,
    },
  ],
};

export const LESSON_BOTTOM_ROW_RIGHT: Lesson = {
  id: 'bottom-row-right',
  name: 'Fila Inferior - Mano Derecha',
  nameEn: 'Bottom Row - Right Hand',
  description: 'Aprende N, M y las comas',
  descriptionEn: 'Learn N, M and commas',
  category: 'bottom-row',
  difficulty: 'beginner',
  keys: ['n', 'm', ',', '.', '-'],
  keyCodes: ['KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
  fingers: ['right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['top-row-combined'],
  estimatedMinutes: 10,
  tips: [
    'N y M se presionan con el índice derecho',
    'La coma y el punto están en posiciones naturales',
    'El guion está junto al Shift derecho',
    'No confundas N (índice) con Ñ (meñique en fila base)',
  ],
  exercises: [
    ...createDrills([
      'jnj jnj jmj jmj k,k k,k',
      'l.l l.l ñ-ñ ñ-ñ l.l ñ-ñ',
      'nm,. nm,. nm,. nm,.',
      'man, man, man, man,',
      'no. no. no. no. no.',
      'nm nm mn mn ,. ,. .- .-',
      'mano. mano. nada, nada,',
      'mono, mono. mama, mama.',
      'cama, lana. mano, mono.',
      // N vs Ñ distinction
      'na ña na ña no ño no ño',
      'ni ñi ni ñi nu ñu nu ñu',
      'ano año ana aña ene eñe',
    ], 'brr'),
    {
      id: 'brr-words',
      type: 'words',
      text: 'mano, nada, mono, cama, lana, mama, pan.',
      targetAccuracy: 85,
    },
    {
      id: 'brr-n-vs-ene',
      type: 'words',
      text: 'nana niña nano niño nona moño nene peña',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_BOTTOM_ROW_COMBINED: Lesson = {
  id: 'bottom-row-combined',
  name: 'Fila Inferior - Completa',
  nameEn: 'Bottom Row - Complete',
  description: 'Domina toda la fila inferior',
  descriptionEn: 'Master the entire bottom row',
  category: 'bottom-row',
  difficulty: 'intermediate',
  keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
  keyCodes: ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['bottom-row-left', 'bottom-row-right'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'brc-drill-1',
      type: 'drill',
      text: 'zxcvbnm,.- zxcvbnm,.- zxcvbnm,.-',
      targetAccuracy: 88,
    },
    {
      id: 'brc-drill-2',
      type: 'drill',
      text: '-.,mnbvcxz -.,mnbvcxz -.,mnbvcxz',
      targetAccuracy: 88,
    },
    {
      id: 'brc-words-1',
      type: 'words',
      text: 'combinar, cambio, nublado, cerveza, marzo.',
      targetAccuracy: 85,
    },
    {
      id: 'brc-words-2',
      type: 'words',
      text: 'nombre, banco, convencer, brazalete, mexicano.',
      targetAccuracy: 85,
    },
    {
      id: 'brc-sentences',
      type: 'sentences',
      text: 'El banco cierra en marzo. México tiene buena comida.',
      targetAccuracy: 82,
    },
  ],
};

// =============================================================================
// Module 4: Full Alphabet
// =============================================================================

export const LESSON_FULL_ALPHABET: Lesson = {
  id: 'full-alphabet',
  name: 'Alfabeto Completo',
  nameEn: 'Full Alphabet',
  description: 'Practica todas las letras del alfabeto español, incluyendo la Ñ',
  descriptionEn: 'Practice all letters of the Spanish alphabet, including Ñ',
  category: 'words',
  difficulty: 'intermediate',
  keys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  keyCodes: ['KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'Semicolon', 'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ'],
  fingers: ['left-pinky', 'left-index', 'left-middle', 'left-middle', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-middle', 'right-index', 'right-middle', 'right-ring', 'right-index', 'right-index', 'right-pinky', 'right-ring', 'right-pinky', 'left-pinky', 'left-index', 'left-ring', 'left-index', 'right-index', 'left-index', 'left-ring', 'left-ring', 'right-index', 'left-pinky'],
  prerequisites: ['bottom-row-combined'],
  estimatedMinutes: 15,
  exercises: [
    {
      id: 'alpha-pangram-1',
      type: 'sentences',
      text: 'El veloz murciélago hindú comía feliz cardillo y kiwi.',
      targetAccuracy: 85,
      hint: 'Este es un pangrama que contiene todas las letras',
    },
    {
      id: 'alpha-pangram-2',
      type: 'sentences',
      text: 'Jovencillo emponzoñado de whisky, ¡qué figurota exhibe!',
      targetAccuracy: 82,
      hint: 'Otro pangrama español con Ñ',
    },
    {
      id: 'alpha-pangram-3',
      type: 'sentences',
      text: 'La cigüeña tocaba el saxofón detrás del palenque de paja.',
      targetAccuracy: 82,
    },
    {
      id: 'alpha-words-1',
      type: 'words',
      text: 'alfabeto conjunto ejemplo trabajo jugar extraño',
      targetAccuracy: 88,
    },
    {
      id: 'alpha-words-2',
      type: 'words',
      text: 'español enseñar mañana pequeño señora compañía',
      targetAccuracy: 85,
    },
    {
      id: 'alpha-ene-focus',
      type: 'words',
      text: 'año niño sueño dueño enseñar cariño español otoño cabaña montaña',
      targetAccuracy: 85,
    },
  ],
};

// =============================================================================
// Module 5: Shift Key and Capitals
// =============================================================================

export const LESSON_SHIFT_BASIC: Lesson = {
  id: 'shift-basic',
  name: 'Mayúsculas Básicas',
  nameEn: 'Basic Capitals',
  description: 'Aprende a usar la tecla Shift para mayúsculas, incluyendo Ñ',
  descriptionEn: 'Learn to use the Shift key for capitals, including Ñ',
  category: 'punctuation',
  difficulty: 'intermediate',
  keys: ['A', 'S', 'D', 'F', 'J', 'K', 'L', 'Ñ'],
  keyCodes: ['ShiftLeft', 'ShiftRight', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
  fingers: ['left-pinky', 'right-pinky', 'left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['full-alphabet'],
  estimatedMinutes: 10,
  tips: [
    'Usa el Shift opuesto a la letra que escribes',
    'Shift izquierdo para letras de la derecha (J, K, L, Ñ)',
    'Shift derecho para letras de la izquierda (A, S, D, F)',
    'Para Ñ mayúscula: Shift izquierdo + Semicolon',
  ],
  exercises: [
    ...createDrills([
      'Aa Ss Dd Ff Jj Kk Ll Ññ',
      'Ala Sal Dad Faja Jaja Kala Lala Ñaña',
      'AsDf JkLñ AsDf JkLñ',
      'Ff Jj Ff Jj Dd Kk Dd Kk',
      'Ss Ll Ss Ll Aa Ññ Aa Ññ',
      'ASDF JKLÑ asdf jklñ',
      // Ñ capital practice
      'Ñ Ñ Ñ Ñoño Ñaña Ñiña',
      'Ñapa Ñato Ñoqui Ñandú',
    ], 'shift'),
    {
      id: 'shift-names',
      type: 'words',
      text: 'Ana Juan Sara Luis Marta Pedro Ñoño Íñigo',
      targetAccuracy: 90,
    },
    {
      id: 'shift-ene-names',
      type: 'words',
      text: 'Señor Señora Niño Niña España Año Mañana Español',
      targetAccuracy: 88,
    },
  ],
};

export const LESSON_SHIFT_FULL: Lesson = {
  id: 'shift-full',
  name: 'Mayúsculas Completas',
  nameEn: 'Full Capitals',
  description: 'Domina las mayúsculas en todo el teclado',
  descriptionEn: 'Master capitals across the keyboard',
  category: 'punctuation',
  difficulty: 'intermediate',
  keys: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  keyCodes: ['ShiftLeft', 'ShiftRight'],
  fingers: ['left-pinky', 'right-pinky'],
  prerequisites: ['shift-basic'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'shift-full-sentences-1',
      type: 'sentences',
      text: 'El Señor García vive en México. La Señora López trabaja en Perú.',
      targetAccuracy: 88,
    },
    {
      id: 'shift-full-sentences-2',
      type: 'sentences',
      text: 'España es un país hermoso. Argentina tiene montañas impresionantes.',
      targetAccuracy: 85,
    },
    {
      id: 'shift-full-names-1',
      type: 'words',
      text: 'Buenos Aires Santiago Lima Bogotá Caracas Quito',
      targetAccuracy: 85,
    },
    {
      id: 'shift-full-names-2',
      type: 'words',
      text: 'América Latina España México Colombia Panamá Ñemby',
      targetAccuracy: 85,
    },
    {
      id: 'shift-full-formal',
      type: 'sentences',
      text: 'Estimado Señor Muñoz: Le escribo desde La Coruña, España.',
      targetAccuracy: 82,
    },
  ],
};

// =============================================================================
// Module 6: Numbers
// =============================================================================

export const LESSON_NUMBERS_LEFT: Lesson = {
  id: 'numbers-left',
  name: 'Números - Mano Izquierda',
  nameEn: 'Numbers - Left Hand',
  description: 'Aprende los números 1, 2, 3, 4, 5',
  descriptionEn: 'Learn numbers 1, 2, 3, 4, 5',
  category: 'numbers',
  difficulty: 'intermediate',
  keys: ['1', '2', '3', '4', '5'],
  keyCodes: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index'],
  prerequisites: ['shift-full'],
  estimatedMinutes: 10,
  tips: [
    'Cada dedo sube verticalmente desde la fila superior',
    'El 1 requiere estiramiento del meñique',
    'El índice cubre el 4 y el 5',
  ],
  exercises: [
    ...createDrills([
      'a1a a1a s2s s2s d3d d3d',
      'f4f f4f f5f f5f f4f f5f',
      '12345 12345 12345 12345',
      '54321 54321 54321 54321',
      '135 135 24 24 12 34 45',
      '1 2 3 4 5 1 2 3 4 5',
      '12 23 34 45 51 12 23 34',
      '15 24 35 41 52 13 25 34',
      '111 222 333 444 555',
      '123 234 345 451 512',
    ], 'numl'),
    {
      id: 'numl-mixed-1',
      type: 'words',
      text: 'Hay 12 casas. Son 345 pesos. Tengo 25 años.',
      targetAccuracy: 88,
    },
    {
      id: 'numl-mixed-2',
      type: 'sentences',
      text: 'El niño tiene 5 años. La señora cumple 45 mañana.',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_NUMBERS_RIGHT: Lesson = {
  id: 'numbers-right',
  name: 'Números - Mano Derecha',
  nameEn: 'Numbers - Right Hand',
  description: 'Aprende los números 6, 7, 8, 9, 0',
  descriptionEn: 'Learn numbers 6, 7, 8, 9, 0',
  category: 'numbers',
  difficulty: 'intermediate',
  keys: ['6', '7', '8', '9', '0'],
  keyCodes: ['Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
  fingers: ['right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['shift-full'],
  estimatedMinutes: 10,
  exercises: [
    ...createDrills([
      'j6j j6j j7j j7j k8k k8k',
      'l9l l9l ñ0ñ ñ0ñ l9l ñ0ñ',
      '67890 67890 67890 67890',
      '09876 09876 09876 09876',
      '68 79 80 96 70 86 97',
      '6 7 8 9 0 6 7 8 9 0',
      '67 78 89 90 06 67 78 89',
      '666 777 888 999 000',
      '678 789 890 906 067',
    ], 'numr'),
    {
      id: 'numr-mixed-1',
      type: 'words',
      text: 'El teléfono es 5678-9012. Cuesta 890 pesos.',
      targetAccuracy: 88,
    },
    {
      id: 'numr-mixed-2',
      type: 'sentences',
      text: 'Son 67 años de matrimonio. La empresa tiene 890 empleados.',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_NUMBERS_COMBINED: Lesson = {
  id: 'numbers-combined',
  name: 'Números - Completo',
  nameEn: 'Numbers - Complete',
  description: 'Practica todos los números con contexto',
  descriptionEn: 'Practice all numbers in context',
  category: 'numbers',
  difficulty: 'intermediate',
  keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  keyCodes: ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'],
  fingers: ['right-pinky', 'left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-index', 'right-middle', 'right-ring'],
  prerequisites: ['numbers-left', 'numbers-right'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'numc-all',
      type: 'drill',
      text: '1234567890 0987654321 1357924680 2468013579',
      targetAccuracy: 90,
    },
    {
      id: 'numc-mixed',
      type: 'drill',
      text: '10 20 30 40 50 60 70 80 90 100 200 500',
      targetAccuracy: 88,
    },
    {
      id: 'numc-dates',
      type: 'sentences',
      text: 'Nació el 15 de marzo de 1990. Hoy es 23 de enero de 2026.',
      targetAccuracy: 85,
    },
    {
      id: 'numc-phone',
      type: 'sentences',
      text: 'Mi número es 555-1234-5678. El código postal es 06600.',
      targetAccuracy: 85,
    },
    {
      id: 'numc-prices',
      type: 'sentences',
      text: 'El precio es $1,250.00 pesos. La oferta es $899.99 hoy.',
      targetAccuracy: 82,
    },
    {
      id: 'numc-ene-combo',
      type: 'sentences',
      text: 'El niño tiene 8 años. Cumplió 50 años. Somos 15 compañeros.',
      targetAccuracy: 85,
    },
  ],
};

// =============================================================================
// Module 7: LATAM Special Characters (EXPANDED)
// =============================================================================

export const LESSON_ACCENTS_ACUTE: Lesson = {
  id: 'accents-acute',
  name: 'Acentos Agudos',
  nameEn: 'Acute Accents',
  description: 'Aprende a escribir vocales con acento agudo usando dead keys. Presiona BracketLeft, luego la vocal.',
  descriptionEn: 'Learn to type accented vowels using dead keys. Press BracketLeft, then the vowel.',
  category: 'special',
  difficulty: 'intermediate',
  keys: ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú'],
  keyCodes: ['BracketLeft', 'KeyA', 'KeyE', 'KeyI', 'KeyO', 'KeyU'],
  fingers: ['right-pinky', 'left-pinky', 'left-middle', 'right-middle', 'right-ring', 'right-index'],
  prerequisites: ['full-alphabet'],
  estimatedMinutes: 15,
  usesDeadKeys: true,
  deadKeyTypes: ['acute'],
  tips: [
    'Primero presiona la tecla del acento (junto a P) - es una dead key',
    'Luego presiona la vocal que quieres acentuar',
    'El acento aparece combinado con la vocal',
    'Para mayúsculas: acento + Shift + vocal',
    'Practica el ritmo: acento-vocal, acento-vocal',
  ],
  exercises: [
    // Individual vowel drills
    ...createDrills([
      'á á á á á á á á á á',
      'é é é é é é é é é é',
      'í í í í í í í í í í',
      'ó ó ó ó ó ó ó ó ó ó',
      'ú ú ú ú ú ú ú ú ú ú',
      'aá eé ií oó uú aá eé ií oó uú',
      'á é í ó ú á é í ó ú á é í',
      'Á É Í Ó Ú Á É Í Ó Ú',
      // á words
      'papá mamá sofá allá acá está detrás además jamás',
      'cámara lámpara página fábrica máquina plátano sábana ráfaga',
      // é words
      'café qué porqué después también José Andrés inglés',
      'teléfono célebre éxito médico débil pérdida miércoles',
      // í words
      'aquí allí sí así maíz país raíz oír freír',
      'difícil típico físico química político fantástico artístico',
      // ó words
      'avión camión corazón canción razón pasión ocasión',
      'teléfono información educación comunicación operación',
      // ú words
      'tú menú púa última único común algún ningún',
      'música público república súbito fútbol útil túnel',
    ], 'acute'),
    {
      id: 'acute-words-mixed',
      type: 'words',
      text: 'café sofá aquí está papá mamá salí comí tú él también',
      targetAccuracy: 85,
    },
    {
      id: 'acute-words-advanced',
      type: 'words',
      text: 'teléfono rápido médico fácil difícil música público república',
      targetAccuracy: 82,
    },
    {
      id: 'acute-sentences-1',
      type: 'sentences',
      text: 'México está en América. El café está caliente. Él vivió aquí.',
      targetAccuracy: 82,
    },
    {
      id: 'acute-sentences-2',
      type: 'sentences',
      text: '¿Qué pasó? Papá llegó después. Mamá preparó el almuerzo.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-sentences-3',
      type: 'sentences',
      text: 'La música está muy buena. Tú eres fantástico. Él estudió medicina.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-sentences-4',
      type: 'sentences',
      text: 'José compró un teléfono. María está allá. Andrés llegó rápido.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-paragraph',
      type: 'paragraph',
      text: 'Aquí en México, la música está presente en todas partes. José tomó café mientras Mamá preparó el almuerzo. Papá llegó después del trabajo.',
      targetAccuracy: 78,
    },
    // === EXPANDED DRILLS ===
    // More á words - family, location, future tense
    ...createDrills([
      'está estará será irá tendrá vendrá podrá saldrá',
      'más atrás detrás través jamás además demás compás',
      'cárcel ángel árbol cáncer cálculo cámara cándido',
      'acá allá papá mamá sofá maná Panamá Canadá',
    ], 'acute'),
    // More é words - nationalities, foods, professions
    ...createDrills([
      'qué porqué porque después también José Andrés',
      'inglés francés portugués japonés holandés escocés',
      'bebé café fé puré purée consomé canapé',
      'telégrafo telémetro teléfono telépata vehículo',
      'décimo undécimo duodécimo vigésimo trigésimo',
    ], 'acute'),
    // More í words - location, verbs, adjectives
    ...createDrills([
      'aquí allí ahí así sí mí ti',
      'país maíz raíz oír reír freír sonreír',
      'vivir salir partir escribir recibir prohibir',
      'difícil fácil útil hábil dócil frágil ágil',
      'química física matemática gramática semántica',
    ], 'acute'),
    // More ó words - augmentatives, abstract nouns, verbs
    ...createDrills([
      'avión camión millón billón trillón escalón',
      'corazón razón canción pasión nación estación',
      'religión región legión ocasión decisión división',
      'información comunicación educación operación',
      'terminó comenzó empezó llegó salió partió',
    ], 'acute'),
    // More ú words - pronouns, adjectives, nouns
    ...createDrills([
      'tú menú tabú bambú champú hindú tribu',
      'común algún ningún según aún',
      'último púa baúl ataúd laúd baúles',
      'único público república súbito cúmulo húmedo',
      'fútbol túnel púlpito cúpula cúspide múltiple',
    ], 'acute'),
    // Mixed accent sentences with ñ and inverted punctuation
    {
      id: 'acute-expanded-sentence-1',
      type: 'sentences',
      text: '¿Dónde está José? Él tomó café después del almuerzo.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-expanded-sentence-2',
      type: 'sentences',
      text: 'Mamá compró más plátanos en el supermercado de allá.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-expanded-sentence-3',
      type: 'sentences',
      text: 'Andrés estudió inglés y francés en la universidad pública.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-expanded-sentence-4',
      type: 'sentences',
      text: 'El avión salió rápido. Llegará mañana según el itinerario.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-expanded-sentence-5',
      type: 'sentences',
      text: 'Aquí en el país hay música típica muy difícil de tocar.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-expanded-sentence-6',
      type: 'sentences',
      text: '¡Qué pequeño es el niño! Mañana cumple años.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-expanded-sentence-7',
      type: 'sentences',
      text: 'Tú serás médico algún día. ¿Qué carrera estudiarás?',
      targetAccuracy: 80,
    },
    {
      id: 'acute-expanded-sentence-8',
      type: 'sentences',
      text: 'El último café de papá estaba frío. Mamá preparó más.',
      targetAccuracy: 80,
    },
    {
      id: 'acute-expanded-paragraph-1',
      type: 'paragraph',
      text: 'Papá y mamá están en el sofá. Él tomó café mientras ella preparó té. José llegó después con Andrés. Compraron plátanos y maíz en el mercado de allá. ¡Qué rico almuerzo tendrán!',
      targetAccuracy: 78,
    },
    {
      id: 'acute-expanded-paragraph-2',
      type: 'paragraph',
      text: 'Tú eres único. Algún día serás médico o físico. La química también es difícil pero útil. Según mamá, el éxito está en la educación pública. ¿Qué opinas tú?',
      targetAccuracy: 78,
    },
  ],
};

export const LESSON_ACCENTS_DIERESIS: Lesson = {
  id: 'accents-dieresis',
  name: 'Diéresis',
  nameEn: 'Dieresis (Umlaut)',
  description: 'Aprende a escribir la ü con diéresis. Se usa en español para pronunciar la U en güe/güi.',
  descriptionEn: 'Learn to type ü with dieresis. Used in Spanish to pronounce U in güe/güi.',
  category: 'special',
  difficulty: 'intermediate',
  keys: ['ü', 'Ü'],
  keyCodes: ['BracketLeft', 'KeyU'],
  fingers: ['right-pinky', 'right-index'],
  prerequisites: ['accents-acute'],
  estimatedMinutes: 10,
  usesDeadKeys: true,
  deadKeyTypes: ['dieresis'],
  tips: [
    'Shift + tecla del acento produce la diéresis (dead key)',
    'Luego presiona U para obtener ü',
    'Se usa principalmente en güe y güi',
    'Ejemplos: pingüino, lingüística, bilingüe',
  ],
  exercises: [
    // Diéresis drills
    ...createDrills([
      'ü ü ü ü ü ü ü ü ü ü',
      'Ü Ü Ü Ü Ü Ü Ü Ü Ü Ü',
      'güe güe güe güe güe',
      'güi güi güi güi güi',
      'güe güi güe güi güe',
      'agüe agüi ogüe ogüi',
      // güe words
      'güero cigüeña antigüedad halagüeño paragüero agüero',
      'desagüe lengüeta pedigüeño piragüero santigüe',
      // güi words
      'pingüino lingüística lingüista argüir güiro',
      'güisqui antigüísimo ambigüidad trilingüismo',
    ], 'dieresis'),
    {
      id: 'dieresis-words-1',
      type: 'words',
      text: 'pingüino bilingüe lingüística vergüenza cigüeña antigüedad',
      targetAccuracy: 85,
    },
    {
      id: 'dieresis-words-2',
      type: 'words',
      text: 'nicaragüense halagüeño paragüero desagüe ungüento agüero',
      targetAccuracy: 82,
    },
    {
      id: 'dieresis-sentences-1',
      type: 'sentences',
      text: 'El pingüino es bilingüe. La cigüeña vuela alto.',
      targetAccuracy: 82,
    },
    {
      id: 'dieresis-sentences-2',
      type: 'sentences',
      text: 'Estudia lingüística. Es un asunto antigüísimo. ¡Qué vergüenza!',
      targetAccuracy: 80,
    },
    {
      id: 'dieresis-sentences-3',
      type: 'sentences',
      text: 'La nicaragüense habla tres idiomas. El paragüero está roto.',
      targetAccuracy: 80,
    },
    {
      id: 'dieresis-paragraph',
      type: 'paragraph',
      text: 'El pingüino bilingüe estudia lingüística en la universidad. La cigüeña antigua vive cerca del desagüe. Es una escena vergüenzosa pero halagüeña.',
      targetAccuracy: 78,
    },
    // === EXPANDED DRILLS ===
    // More güe combinations and verb conjugations
    ...createDrills([
      'güe güe güe agüe egüe igüe ogüe ugüe',
      'pingüe lengüe mengüe fragüe fragüen',
      'averigüe apacigüe santigüe amortigüe',
      'nicaragüense pedigüeña lengüetazo yegüero',
    ], 'dieresis'),
    // More güi combinations
    ...createDrills([
      'güi güi güi agüi egüi igüi ogüi ugüi',
      'pingüino argüir güiro agüita güisqui',
      'lingüístico multilingüismo exigüidad',
      'contigüidad ambigüidades antigüísimos',
    ], 'dieresis'),
    // Advanced güe words - verbs and conjugations
    ...createDrills([
      'paragüero desagüe lengüeta pedigüeño',
      'piragüero santigüe averigüemos apacigüemos',
      'amortigüen atestigüen fragüen argüen',
      'agüero güero cigüeñal antigüedad',
    ], 'dieresis'),
    // Advanced güi words - linguistics and more
    ...createDrills([
      'bilingüismo monolingüismo plurilingüismo',
      'exigüidad contigüidad propincüidad',
      'pingüinos lingüistas multilingües',
      'antigüísimo vergüenzoso ambigüidades',
    ], 'dieresis'),
    // New expanded sentences
    {
      id: 'dieresis-expanded-sentence-1',
      type: 'sentences',
      text: 'El pingüino nicaragüense es muy vergüenzoso.',
      targetAccuracy: 82,
    },
    {
      id: 'dieresis-expanded-sentence-2',
      type: 'sentences',
      text: 'Averigüe si la cigüeña llegó al paragüero antiguo.',
      targetAccuracy: 80,
    },
    {
      id: 'dieresis-expanded-sentence-3',
      type: 'sentences',
      text: 'El lingüista estudia el bilingüismo y el trilingüismo.',
      targetAccuracy: 80,
    },
    {
      id: 'dieresis-expanded-sentence-4',
      type: 'sentences',
      text: 'La ambigüedad lingüística es un tema antigüísimo.',
      targetAccuracy: 80,
    },
    {
      id: 'dieresis-expanded-sentence-5',
      type: 'sentences',
      text: '¡Que apacigüen a la yegüera! El desagüe está roto.',
      targetAccuracy: 80,
    },
    // Sentences combining ü with ñ and inverted punctuation
    {
      id: 'dieresis-combined-sentence-1',
      type: 'sentences',
      text: '¿El niño vio al pingüino? ¡Qué vergüenza!',
      targetAccuracy: 80,
    },
    {
      id: 'dieresis-combined-sentence-2',
      type: 'sentences',
      text: '¡El pequeño lingüista es español! Mañana estudia más.',
      targetAccuracy: 80,
    },
    {
      id: 'dieresis-combined-sentence-3',
      type: 'sentences',
      text: '¿Cuántos pingüinos vio el niño en la mañana de otoño?',
      targetAccuracy: 80,
    },
    // Expanded paragraphs
    {
      id: 'dieresis-expanded-paragraph-1',
      type: 'paragraph',
      text: 'El pingüino bilingüe vive cerca de la cigüeña nicaragüense. Ambos estudian lingüística con vergüenza. El paragüero antiguo está junto al desagüe halagüeño.',
      targetAccuracy: 78,
    },
    {
      id: 'dieresis-expanded-paragraph-2',
      type: 'paragraph',
      text: 'Averigüe usted si el lingüista argüe sobre la ambigüedad. Es un tema antigüísimo de exigüidad conceptual. El trilingüismo es halagüeño para los nicaragüenses.',
      targetAccuracy: 78,
    },
  ],
};

export const LESSON_INVERTED_PUNCTUATION: Lesson = {
  id: 'inverted-punctuation',
  name: 'Signos Invertidos',
  nameEn: 'Inverted Punctuation',
  description: 'Aprende los signos de interrogación y exclamación invertidos. ¿ está en Equal, ¡ en Shift+1.',
  descriptionEn: 'Learn inverted question and exclamation marks. ¿ is at Equal, ¡ at Shift+1.',
  category: 'special',
  difficulty: 'intermediate',
  keys: ['¿', '¡'],
  keyCodes: ['Equal', 'Digit1'],
  fingers: ['right-pinky', 'left-pinky'],
  prerequisites: ['shift-full'],
  estimatedMinutes: 12,
  tips: [
    '¿ está junto a la tecla Backspace (posición de =)',
    '¡ se obtiene con Shift+1',
    'Siempre abre con el signo invertido y cierra con el normal',
    'Los signos invertidos son exclusivos del español',
  ],
  exercises: [
    // Basic drills
    ...createDrills([
      '¿? ¿? ¿? ¿? ¿? ¿?',
      '¡! ¡! ¡! ¡! ¡! ¡!',
      '¿?¡! ¿?¡! ¿?¡! ¿?¡!',
      '¡!¿? ¡!¿? ¡!¿? ¡!¿?',
      // Question words
      '¿Qué? ¿Cómo? ¿Cuándo? ¿Dónde?',
      '¿Por qué? ¿Quién? ¿Cuál? ¿Cuánto?',
      '¿Adónde? ¿De quién? ¿Para qué? ¿Con quién?',
      '¿Qué tal? ¿Qué pasa? ¿Qué hora es?',
      // Exclamations
      '¡Hola! ¡Adiós! ¡Bien! ¡Gracias! ¡Por favor!',
      '¡Excelente! ¡Fantástico! ¡Increíble! ¡Perfecto!',
      '¡Bravo! ¡Viva! ¡Arriba! ¡Ánimo! ¡Adelante!',
      '¡Cuidado! ¡Atención! ¡Socorro! ¡Auxilio!',
      '¡Felicidades! ¡Enhorabuena! ¡Feliz cumpleaños!',
    ], 'inverted'),
    {
      id: 'inverted-questions-1',
      type: 'sentences',
      text: '¿Cómo estás? ¿Qué hora es? ¿Dónde vives?',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-questions-2',
      type: 'sentences',
      text: '¿Cuántos años tienes? ¿De dónde eres? ¿Cómo te llamas?',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-questions-3',
      type: 'sentences',
      text: '¿Por qué llegaste tarde? ¿Cuándo vienes? ¿Quién llamó?',
      targetAccuracy: 82,
    },
    {
      id: 'inverted-exclamations-1',
      type: 'sentences',
      text: '¡Qué bueno! ¡Felicidades! ¡Increíble! ¡Fantástico!',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-exclamations-2',
      type: 'sentences',
      text: '¡Qué lindo día! ¡Cuánto tiempo sin verte! ¡Qué sorpresa!',
      targetAccuracy: 82,
    },
    {
      id: 'inverted-mixed-1',
      type: 'sentences',
      text: '¡Hola! ¿Cómo estás? ¡Qué gusto verte! ¿Qué cuentas?',
      targetAccuracy: 82,
    },
    {
      id: 'inverted-mixed-2',
      type: 'sentences',
      text: '¿Viste eso? ¡Increíble! ¿Quién lo diría? ¡Asombroso!',
      targetAccuracy: 80,
    },
    {
      id: 'inverted-conversation',
      type: 'paragraph',
      text: '¡Hola, María! ¿Cómo estás? ¡Muy bien, gracias! ¿Y tú? ¡Excelente! ¿Qué planes tienes? ¡Vamos al cine! ¿Te animas?',
      targetAccuracy: 78,
    },
    {
      id: 'inverted-complex',
      type: 'paragraph',
      text: '¿Sabías que el español es el único idioma que usa ¿ y ¡? ¡Qué interesante! ¿Verdad? Estos signos nos ayudan a saber la entonación desde el principio. ¡Es muy útil!',
      targetAccuracy: 75,
    },
    // Extended question word drills
    {
      id: 'inverted-que-drills',
      type: 'sentences',
      text: '¿Qué? ¿Qué hora es? ¿Qué pasa? ¿Qué tal? ¿Qué quieres? ¿Qué haces?',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-como-drills',
      type: 'sentences',
      text: '¿Cómo? ¿Cómo estás? ¿Cómo te llamas? ¿Cómo llegaste? ¿Cómo funciona?',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-donde-drills',
      type: 'sentences',
      text: '¿Dónde? ¿Dónde vives? ¿Dónde trabajas? ¿Dónde está? ¿Dónde queda?',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-cuando-drills',
      type: 'sentences',
      text: '¿Cuándo? ¿Cuándo vienes? ¿Cuándo empezamos? ¿Cuándo termina? ¿Cuándo llegó?',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-quien-drills',
      type: 'sentences',
      text: '¿Quién? ¿Quién es? ¿Quién llamó? ¿Quién viene? ¿De quién es? ¿Con quién vas?',
      targetAccuracy: 85,
    },
    // Extended exclamation drills
    {
      id: 'inverted-greetings-exclaim',
      type: 'sentences',
      text: '¡Hola! ¡Adiós! ¡Gracias! ¡Por favor! ¡Salud! ¡Bienvenido! ¡Hasta luego!',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-que-exclaim',
      type: 'sentences',
      text: '¡Qué bueno! ¡Qué lindo! ¡Qué rico! ¡Qué pena! ¡Qué lástima! ¡Qué bien!',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-positive-exclaim',
      type: 'sentences',
      text: '¡Increíble! ¡Fantástico! ¡Excelente! ¡Perfecto! ¡Maravilloso! ¡Genial!',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-urgent-exclaim',
      type: 'sentences',
      text: '¡Cuidado! ¡Atención! ¡Socorro! ¡Auxilio! ¡Ayuda! ¡Peligro! ¡Alto!',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-celebrations',
      type: 'sentences',
      text: '¡Felicidades! ¡Feliz cumpleaños! ¡Feliz Navidad! ¡Feliz Año Nuevo! ¡Enhorabuena!',
      targetAccuracy: 82,
    },
    // Mixed conversations
    {
      id: 'inverted-convo-greeting',
      type: 'paragraph',
      text: '¡Hola! ¿Cómo estás? ¡Muy bien! ¿Y tú? ¡Excelente, gracias! ¿Qué cuentas?',
      targetAccuracy: 80,
    },
    {
      id: 'inverted-convo-surprise',
      type: 'paragraph',
      text: '¿Viste eso? ¡Increíble! ¿Quién lo hizo? ¡No sé! ¿En serio? ¡Sí, de verdad!',
      targetAccuracy: 80,
    },
    {
      id: 'inverted-convo-arrival',
      type: 'paragraph',
      text: '¡Qué sorpresa! ¿Cuándo llegaste? ¡Hace una hora! ¿En serio? ¡Sí! ¿Por qué no avisaste?',
      targetAccuracy: 78,
    },
    {
      id: 'inverted-convo-plans',
      type: 'paragraph',
      text: '¿Tienes planes? ¡Sí! ¿Qué harás? ¡Voy al parque! ¿Puedo ir? ¡Claro que sí! ¡Genial!',
      targetAccuracy: 78,
    },
    // Formal usage
    {
      id: 'inverted-formal-requests',
      type: 'sentences',
      text: '¿Podría ayudarme? ¡Con mucho gusto! ¿Tiene usted tiempo? ¡Por supuesto!',
      targetAccuracy: 82,
    },
    {
      id: 'inverted-formal-polite',
      type: 'sentences',
      text: '¿Me permite? ¡Adelante! ¿Sería tan amable? ¡Faltaba más! ¿Disculpe? ¡No hay problema!',
      targetAccuracy: 80,
    },
    {
      id: 'inverted-formal-business',
      type: 'paragraph',
      text: '¡Buenos días! ¿En qué puedo servirle? ¿Tienen disponibilidad? ¡Sí, pase adelante! ¿Cuánto cuesta? ¡Permítame verificar!',
      targetAccuracy: 78,
    },
    // Advanced mixed practice
    {
      id: 'inverted-rapid-fire',
      type: 'paragraph',
      text: '¿Sí? ¡No! ¿Por qué? ¡Porque sí! ¿Seguro? ¡Segurísimo! ¿Cuándo? ¡Ahora! ¿Dónde? ¡Aquí!',
      targetAccuracy: 80,
    },
    {
      id: 'inverted-emotions',
      type: 'paragraph',
      text: '¡Qué alegría! ¿No es maravilloso? ¡Estoy tan feliz! ¿Cómo no estarlo? ¡La vida es bella! ¿Verdad que sí?',
      targetAccuracy: 78,
    },
    {
      id: 'inverted-storytelling',
      type: 'paragraph',
      text: '¿Sabes qué pasó? ¡No me digas! ¡Sí, increíble! ¿Quién lo hubiera pensado? ¡Nadie! ¿Y luego qué? ¡Se fue! ¿Así nomás? ¡Así nomás!',
      targetAccuracy: 75,
    },
  ],
};

export const LESSON_SPECIAL_SYMBOLS: Lesson = {
  id: 'special-symbols',
  name: 'Símbolos Especiales',
  nameEn: 'Special Symbols',
  description: 'Símbolos comunes en el teclado LATAM: @, #, $, %, &, /, (, ), =, +',
  descriptionEn: 'Common symbols on the LATAM keyboard: @, #, $, %, &, /, (, ), =, +',
  category: 'special',
  difficulty: 'advanced',
  keys: ['@', '#', '$', '%', '&', '/', '(', ')', '=', '+', '*'],
  keyCodes: ['Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'BracketRight'],
  fingers: ['left-ring', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky', 'right-pinky'],
  prerequisites: ['numbers-combined'],
  estimatedMinutes: 12,
  tips: [
    '@ se obtiene con AltGr+Q o AltGr+2',
    'Los paréntesis están en Shift+8 y Shift+9',
    '/ está en Shift+7',
    '= está en Shift+0',
    '+ está en la tecla junto a Enter',
  ],
  exercises: [
    ...createDrills([
      '@ @ @ @ # # # # $ $ $ $',
      '% % % % & & & & / / / /',
      '( ( ( ( ) ) ) ) = = = =',
      '+ + + + * * * * @ @ # #',
      '@ # $ % & / ( ) = + *',
      '(@) (#) ($) (%) (&)',
      '100% 50/50 (nota) @usuario',
      '1+1=2 3*3=9 10/2=5',
      'correo@ejemplo.com',
      'usuario@dominio.mx',
      '#hashtag #tema #español',
      '$100 $250 $500 $1,000',
    ], 'symbols'),
    {
      id: 'symbols-email',
      type: 'words',
      text: 'usuario@correo.com info@empresa.mx contacto@web.org admin@sitio.es',
      targetAccuracy: 85,
    },
    {
      id: 'symbols-math',
      type: 'sentences',
      text: '2 + 2 = 4. 10 / 2 = 5. (3 * 4) + 1 = 13. 100% completo.',
      targetAccuracy: 82,
    },
    {
      id: 'symbols-social',
      type: 'sentences',
      text: 'Sígueme en @usuario. Usa el #hashtag. El precio es $199.99 (oferta).',
      targetAccuracy: 80,
    },
    {
      id: 'symbols-business',
      type: 'sentences',
      text: 'Envía el informe a ventas@empresa.mx. El presupuesto es $50,000 (+ IVA).',
      targetAccuracy: 78,
    },
  ],
};

// =============================================================================
// Module 8: Ñ Mastery (NEW - Dedicated Ñ Practice)
// =============================================================================

export const LESSON_ENE_MASTERY: Lesson = {
  id: 'ene-mastery',
  name: 'Dominio de la Ñ',
  nameEn: 'Ñ Mastery',
  description: 'Práctica intensiva de la Ñ, la letra más característica del español.',
  descriptionEn: 'Intensive practice of Ñ, the most characteristic letter of Spanish.',
  category: 'special',
  difficulty: 'intermediate',
  keys: ['ñ', 'Ñ'],
  keyCodes: ['Semicolon'],
  fingers: ['right-pinky'],
  prerequisites: ['home-row-right'],
  estimatedMinutes: 15,
  tips: [
    'La Ñ está en la posición del ; del teclado inglés',
    'Es una tecla directa, NO una dead key',
    'El meñique derecho la presiona desde la posición base',
    'Practica palabras comunes con Ñ constantemente',
  ],
  exercises: [
    // Pure Ñ drills
    ...createDrills([
      'ñ ñ ñ ñ ñ ñ ñ ñ ñ ñ',
      'Ñ Ñ Ñ Ñ Ñ Ñ Ñ Ñ Ñ Ñ',
      'ña ñe ñi ño ñu ña ñe ñi',
      'Ña Ñe Ñi Ño Ñu Ña Ñe Ñi',
      'añ eñ iñ oñ uñ añ eñ iñ',
      'aña eñe iñi oño uñu aña',
      'ñañ ñeñ ñiñ ñoñ ñuñ ñañ',
      // Common endings
      'año baño caño daño paño taño',
      'niño piño tiño viño riño ciño',
      'sueño dueño empeño pequeño diseño',
      'leña peña seña greña breña',
      'uña cuña puña zuña muña',
      // Common words by category
      'señor señora señorita señorito',
      'niño niña niñez niñero niñera',
      'mañana mañanita mañanero ayer',
      'español española españolito',
      'compañero compañera compañía',
      'enseñar enseñanza enseñador',
      'cariño cariñoso cariñosa',
      'pequeño pequeña pequeñito',
      'montaña montañés montañoso',
      'cabaña cabañita cabañero',
      'campaña campañero campeonato',
    ], 'ene'),
    {
      id: 'ene-common-words',
      type: 'words',
      text: 'año niño sueño dueño español mañana señor cariño pequeño otoño',
      targetAccuracy: 90,
    },
    {
      id: 'ene-more-words',
      type: 'words',
      text: 'enseñar compañero montaña cabaña campaña España leña uña cuñado',
      targetAccuracy: 88,
    },
    {
      id: 'ene-sentences-1',
      type: 'sentences',
      text: 'El niño pequeño sueña con España. La señora enseña español.',
      targetAccuracy: 85,
    },
    {
      id: 'ene-sentences-2',
      type: 'sentences',
      text: 'Mañana es el cumpleaños del señor García. Tiene cincuenta años.',
      targetAccuracy: 85,
    },
    {
      id: 'ene-sentences-3',
      type: 'sentences',
      text: 'Mi compañero trabaja en la montaña. La cabaña es pequeña pero cariñosa.',
      targetAccuracy: 82,
    },
    {
      id: 'ene-paragraph-1',
      type: 'paragraph',
      text: 'España es un país hermoso. Los españoles son muy cariñosos. Mañana visitaré a mi cuñado en la montaña. Él tiene una cabaña pequeña.',
      targetAccuracy: 80,
    },
    {
      id: 'ene-paragraph-2',
      type: 'paragraph',
      text: 'El señor Muñoz enseña español a los niños pequeños. Cada año en otoño organiza una campaña especial. Sus compañeros lo consideran muy dedicado.',
      targetAccuracy: 78,
    },
  ],
};

// =============================================================================
// Module 9: Common Spanish Words (EXPANDED)
// =============================================================================

export const LESSON_COMMON_WORDS_1: Lesson = {
  id: 'common-words-1',
  name: 'Palabras Frecuentes 1',
  nameEn: 'Common Words 1',
  description: 'Las 50 palabras más usadas en español',
  descriptionEn: 'The 50 most common Spanish words',
  category: 'words',
  difficulty: 'intermediate',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['full-alphabet'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'cw1-articles',
      type: 'words',
      text: 'el la los las un una unos unas al del',
      targetAccuracy: 95,
    },
    {
      id: 'cw1-prepositions',
      type: 'words',
      text: 'de en con por para sin sobre entre desde hasta',
      targetAccuracy: 92,
    },
    {
      id: 'cw1-verbs-1',
      type: 'words',
      text: 'es ser estar tiene hacer puede haber ir dar ver',
      targetAccuracy: 90,
    },
    {
      id: 'cw1-verbs-2',
      type: 'words',
      text: 'soy eres somos son está están tengo tiene quiero',
      targetAccuracy: 88,
    },
    {
      id: 'cw1-ene-words',
      type: 'words',
      text: 'año niño niña señor señora mañana español pequeño sueño cariño',
      targetAccuracy: 90,
      hint: 'Palabras frecuentes con ñ',
    },
    {
      id: 'cw1-accent-words',
      type: 'words',
      text: 'está más también después aquí sí qué cómo dónde cuándo',
      targetAccuracy: 90,
    },
    {
      id: 'cw1-conjunctions',
      type: 'words',
      text: 'y o pero porque aunque si cuando donde como que',
      targetAccuracy: 92,
    },
    {
      id: 'cw1-daily-verbs',
      type: 'words',
      text: 'soy estoy tengo voy hago digo quiero puedo debo necesito',
      targetAccuracy: 90,
    },
    {
      id: 'cw1-mixed',
      type: 'sentences',
      text: 'El niño está en la casa. Ella tiene un libro. ¿Quieres ir?',
      targetAccuracy: 88,
    },
    // LATAM Geography with Special Characters
    {
      id: 'cw1-latam-geo-ene',
      type: 'words',
      text: 'España Coruña Ñemby Añasco Logroño Peñíscola Cataluña',
      targetAccuracy: 85,
      hint: 'Lugares con ñ - LATAM y España',
    },
    // Nature vocabulary with ñ
    {
      id: 'cw1-nature-ene',
      type: 'words',
      text: 'montaña cabaña araña piña leña viña caña cigüeña',
      targetAccuracy: 88,
      hint: 'Naturaleza con ñ',
    },
    // Essential ñ verbs
    {
      id: 'cw1-verbs-ene',
      type: 'words',
      text: 'soñar bañar enseñar diseñar dañar empeñar reñir gruñir',
      targetAccuracy: 88,
      hint: 'Verbos esenciales con ñ',
    },
  ],
};

export const LESSON_COMMON_WORDS_2: Lesson = {
  id: 'common-words-2',
  name: 'Palabras Frecuentes 2',
  nameEn: 'Common Words 2',
  description: 'Más palabras comunes del español',
  descriptionEn: 'More common Spanish words',
  category: 'words',
  difficulty: 'intermediate',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['common-words-1'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'cw2-pronouns',
      type: 'words',
      text: 'yo tú él ella nosotros ustedes ellos ellas usted',
      targetAccuracy: 92,
    },
    {
      id: 'cw2-time',
      type: 'words',
      text: 'hoy mañana ayer siempre nunca ahora después antes pronto',
      targetAccuracy: 90,
    },
    {
      id: 'cw2-questions',
      type: 'words',
      text: 'qué cómo cuándo dónde por qué quién cuál cuánto',
      targetAccuracy: 88,
    },
    {
      id: 'cw2-adjectives',
      type: 'words',
      text: 'bueno malo grande pequeño nuevo viejo mejor peor',
      targetAccuracy: 90,
    },
    {
      id: 'cw2-numbers-words',
      type: 'words',
      text: 'uno dos tres cuatro cinco diez cien mil primero',
      targetAccuracy: 88,
    },
    {
      id: 'cw2-family',
      type: 'words',
      text: 'mamá papá niño niña abuelo abuela hermano hermana tío tía primo',
      targetAccuracy: 90,
    },
    {
      id: 'cw2-places',
      type: 'words',
      text: 'casa escuela trabajo tienda hospital iglesia parque calle ciudad país',
      targetAccuracy: 88,
    },
    {
      id: 'cw2-latam-countries',
      type: 'words',
      text: 'México Perú Panamá Colombia Argentina Chile Ecuador Bolivia Uruguay Paraguay',
      targetAccuracy: 85,
    },
    {
      id: 'cw2-latam-cities',
      type: 'words',
      text: 'Bogotá Medellín Cancún Lima Quito Santiago Montevideo Asunción La Paz',
      targetAccuracy: 85,
    },
    {
      id: 'cw2-mixed',
      type: 'sentences',
      text: '¿Cómo estás hoy? Mañana será mejor. Siempre llegas tarde.',
      targetAccuracy: 85,
    },
    // Expanded LATAM cities with accents
    {
      id: 'cw2-latam-cities-expanded',
      type: 'words',
      text: 'Córdoba Mérida Valparaíso Cartagena Cusco Guadalajara Maracaibo Tegucigalpa',
      targetAccuracy: 85,
      hint: 'Ciudades importantes de LATAM',
    },
    // Central American geography
    {
      id: 'cw2-centroamerica',
      type: 'words',
      text: 'Guatemala Panamá Nicaragua Managua San José Belice Honduras',
      targetAccuracy: 88,
    },
    // Technology vocabulary with accents
    {
      id: 'cw2-tech-accents',
      type: 'words',
      text: 'teléfono música cámara plástico automático electrónico tecnológico',
      targetAccuracy: 85,
      hint: 'Tecnología con acentos',
    },
    // Family vocabulary with ñ
    {
      id: 'cw2-family-ene',
      type: 'words',
      text: 'cuñado cuñada compañero compañera dueño dueña pañuelo cariño',
      targetAccuracy: 88,
      hint: 'Familia y relaciones con ñ',
    },
    // Extended time vocabulary with ñ
    {
      id: 'cw2-time-ene',
      type: 'words',
      text: 'año mañana otoño cumpleaños añejo añorar antaño engaño',
      targetAccuracy: 88,
    },
    // Superlatives with accents
    {
      id: 'cw2-superlatives',
      type: 'words',
      text: 'felicísimo contentísimo tristísimo enojadísimo buenísimo malísimo',
      targetAccuracy: 82,
      hint: 'Superlativos con acentos',
    },
  ],
};

export const LESSON_COMMON_WORDS_3: Lesson = {
  id: 'common-words-3',
  name: 'Palabras Frecuentes 3',
  nameEn: 'Common Words 3',
  description: 'Vocabulario esencial con Ñ y acentos',
  descriptionEn: 'Essential vocabulary with Ñ and accents',
  category: 'words',
  difficulty: 'intermediate',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['common-words-2', 'accents-acute'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'cw3-ene-family',
      type: 'words',
      text: 'niño niña señor señora cuñado cuñada compañero compañera',
      targetAccuracy: 88,
    },
    {
      id: 'cw3-ene-time',
      type: 'words',
      text: 'año mañana otoño cumpleaños anteaño',
      targetAccuracy: 88,
    },
    {
      id: 'cw3-accents-common',
      type: 'words',
      text: 'también después aquí allí así más aún todavía además',
      targetAccuracy: 85,
    },
    {
      id: 'cw3-mixed',
      type: 'sentences',
      text: 'El niño está aquí. Mañana será mi cumpleaños. También viene mi cuñado.',
      targetAccuracy: 82,
    },
    {
      id: 'cw3-conversation',
      type: 'paragraph',
      text: '¡Hola, señora! ¿Cómo está su niño? Muy bien, gracias. Mañana cumple años. ¡Qué bueno! También mi compañero celebra mañana.',
      targetAccuracy: 80,
    },
    // Food vocabulary with ñ
    {
      id: 'cw3-food-ene',
      type: 'words',
      text: 'piña champiñón jalapeño caña moño puño ñoquis rebaño',
      targetAccuracy: 85,
      hint: 'Comida y cocina con ñ',
    },
    // Actions and verbs with ñ
    {
      id: 'cw3-actions-ene',
      type: 'words',
      text: 'enseñar soñar bañar diseñar dañar empeñar reñir gruñir señalar',
      targetAccuracy: 85,
    },
    // Words with dieresis (ü)
    {
      id: 'cw3-dieresis',
      type: 'words',
      text: 'pingüino cigüeña vergüenza agüero bilingüe antigüedad lingüística',
      targetAccuracy: 82,
      hint: 'Palabras con diéresis (ü)',
    },
    // Mexican expressions
    {
      id: 'cw3-mexican-expressions',
      type: 'sentences',
      text: '¿Qué onda? ¡Órale! ¡Ándale! ¡No manches! ¡Híjole!',
      targetAccuracy: 80,
      hint: 'Expresiones mexicanas',
    },
    // Argentine expressions
    {
      id: 'cw3-argentine-expressions',
      type: 'sentences',
      text: '¡Che! ¿Vos tenés? ¡Qué bárbaro! ¡Dale! ¡Mirá!',
      targetAccuracy: 80,
      hint: 'Expresiones argentinas',
    },
    // Colombian expressions
    {
      id: 'cw3-colombian-expressions',
      type: 'sentences',
      text: '¿Qué más? ¡Qué chimba! ¡Parce! ¡Bacano! ¡Chévere!',
      targetAccuracy: 80,
      hint: 'Expresiones colombianas',
    },
    // Caribbean Spanish
    {
      id: 'cw3-caribbean-expressions',
      type: 'sentences',
      text: '¡Wepa! ¿Qué lo qué? ¡Chévere! ¡Qué nota! ¡Mira!',
      targetAccuracy: 80,
      hint: 'Expresiones del Caribe',
    },
    // Common accented time words
    {
      id: 'cw3-time-accents',
      type: 'words',
      text: 'después todavía también aún hoy mañana aquí allá acá',
      targetAccuracy: 88,
    },
    // ñ mastery drill
    {
      id: 'cw3-ene-mastery',
      type: 'words',
      text: 'niño niña año sueño dueño peña caña baño paño muñeca piñata señal',
      targetAccuracy: 88,
      hint: 'Dominio de la ñ',
    },
    // Full LATAM country practice with all special chars
    {
      id: 'cw3-latam-countries-full',
      type: 'sentences',
      text: 'México, Perú, Panamá y España tienen la ñ. ¿Cuál es más grande? ¡Quién sabe!',
      targetAccuracy: 82,
    },
    // Natural landmarks with ñ
    {
      id: 'cw3-landmarks-ene',
      type: 'words',
      text: 'montaña cordillera peñón cañón cañada viñedo piñar castaño',
      targetAccuracy: 85,
      hint: 'Geografía natural con ñ',
    },
    // Professional vocabulary with ñ
    {
      id: 'cw3-professional-ene',
      type: 'words',
      text: 'diseñador enseñanza compañía albañil ingeniero coreógrafo',
      targetAccuracy: 85,
      hint: 'Vocabulario profesional',
    },
    // LATAM conversation paragraph
    {
      id: 'cw3-latam-conversation',
      type: 'paragraph',
      text: '¡Hola, compañero! ¿Cómo está tu cuñada? Ella viajó a Perú el año pasado. Visitó Machu Picchu y las montañas. ¡Qué hermoso! Mañana regresa a México.',
      targetAccuracy: 78,
    },
  ],
};

// =============================================================================
// Module 10: Full Sentences (EXPANDED)
// =============================================================================

export const LESSON_SENTENCES_BASIC: Lesson = {
  id: 'sentences-basic',
  name: 'Oraciones Básicas',
  nameEn: 'Basic Sentences',
  description: 'Practica oraciones simples en español',
  descriptionEn: 'Practice simple Spanish sentences',
  category: 'sentences',
  difficulty: 'intermediate',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['common-words-1', 'inverted-punctuation'],
  estimatedMinutes: 15,
  exercises: [
    {
      id: 'sb-greetings-1',
      type: 'sentences',
      text: '¡Hola! ¿Cómo estás? Estoy bien, gracias. ¿Y tú?',
      targetAccuracy: 88,
    },
    {
      id: 'sb-greetings-2',
      type: 'sentences',
      text: '¡Buenos días! ¿Qué tal? Muy bien. ¡Hasta luego!',
      targetAccuracy: 88,
    },
    {
      id: 'sb-intro-1',
      type: 'sentences',
      text: '¡Hola! Me llamo María. Soy de México. Tengo veinticinco años.',
      targetAccuracy: 85,
    },
    {
      id: 'sb-intro-2',
      type: 'sentences',
      text: '¿Cómo te llamas? ¿De dónde eres? ¿Cuántos años tienes?',
      targetAccuracy: 85,
    },
    {
      id: 'sb-daily-1',
      type: 'sentences',
      text: 'Hoy es un día bonito. El sol brilla y hace calor.',
      targetAccuracy: 88,
    },
    {
      id: 'sb-daily-2',
      type: 'sentences',
      text: 'Mañana voy a trabajar. Después voy a la tienda.',
      targetAccuracy: 86,
    },
    {
      id: 'sb-family',
      type: 'sentences',
      text: 'Mi mamá cocina muy bien. Mi papá trabaja en una oficina.',
      targetAccuracy: 86,
    },
    {
      id: 'sb-polite',
      type: 'sentences',
      text: '¡Mucho gusto! ¿Cómo está usted? Muy bien, gracias. ¿Y usted?',
      targetAccuracy: 85,
    },
    {
      id: 'sb-food',
      type: 'sentences',
      text: '¿Qué quieres comer? Quiero tacos y un café, por favor.',
      targetAccuracy: 82,
    },
    // EXPANDED: More basic sentences with LATAM keyboard specifics
    {
      id: 'sb-greetings-3',
      type: 'sentences',
      text: '¡Buenas noches, señora! ¿Cómo está su niño? Él está muy bien.',
      targetAccuracy: 86,
    },
    {
      id: 'sb-greetings-4',
      type: 'sentences',
      text: '¿Qué tal, compañero? ¡Cuánto tiempo sin verte! ¿Qué hay de nuevo?',
      targetAccuracy: 85,
    },
    {
      id: 'sb-intro-3',
      type: 'sentences',
      text: 'Me llamo José Muñoz. Soy español pero vivo en México desde hace años.',
      targetAccuracy: 84,
    },
    {
      id: 'sb-intro-4',
      type: 'sentences',
      text: '¿Conoces al señor Peña? Él es el dueño de la tienda de la esquina.',
      targetAccuracy: 84,
    },
    {
      id: 'sb-daily-3',
      type: 'sentences',
      text: 'Cada mañana me despierto a las ocho. Después tomo café con leche.',
      targetAccuracy: 86,
    },
    {
      id: 'sb-daily-4',
      type: 'sentences',
      text: 'El niño pequeño juega en el jardín. ¡Qué alegría verlo tan feliz!',
      targetAccuracy: 85,
    },
    {
      id: 'sb-family-2',
      type: 'sentences',
      text: 'Mi cuñado vive en España. Su esposa es una señora muy amable.',
      targetAccuracy: 84,
    },
    {
      id: 'sb-weather',
      type: 'sentences',
      text: '¿Cómo está el clima hoy? Hace frío en la montaña y calor en la playa.',
      targetAccuracy: 85,
    },
    {
      id: 'sb-shopping',
      type: 'sentences',
      text: '¿Cuánto cuesta esto? Cuesta cincuenta pesos. ¡Qué barato! Lo compro.',
      targetAccuracy: 84,
    },
    {
      id: 'sb-directions',
      type: 'sentences',
      text: '¿Dónde está la cabaña del señor García? Está cerca de la montaña.',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_SENTENCES_INTERMEDIATE: Lesson = {
  id: 'sentences-intermediate',
  name: 'Oraciones Intermedias',
  nameEn: 'Intermediate Sentences',
  description: 'Oraciones más complejas con vocabulario variado',
  descriptionEn: 'More complex sentences with varied vocabulary',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-basic', 'accents-acute'],
  estimatedMinutes: 18,
  exercises: [
    {
      id: 'si-literature',
      type: 'paragraph',
      text: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, vivía un hidalgo de los de lanza en astillero.',
      targetAccuracy: 82,
      hint: 'Inicio de Don Quijote de la Mancha',
    },
    {
      id: 'si-modern',
      type: 'paragraph',
      text: 'La tecnología ha cambiado nuestra forma de comunicarnos. Hoy podemos hablar con personas de todo el mundo instantáneamente.',
      targetAccuracy: 80,
    },
    {
      id: 'si-travel',
      type: 'paragraph',
      text: 'El año pasado viajé a México. Visité las pirámides de Teotihuacán y las playas de Cancún. ¡Qué experiencia tan increíble! La comida mexicana es deliciosa.',
      targetAccuracy: 80,
    },
    {
      id: 'si-work',
      type: 'paragraph',
      text: 'Mi compañero de trabajo es muy simpático. Él enseña español en la universidad. Los estudiantes aprenden gramática, vocabulario y conversación.',
      targetAccuracy: 80,
    },
    {
      id: 'si-culture',
      type: 'paragraph',
      text: 'La música latinoamericana es famosa en todo el mundo. Desde el tango argentino hasta la cumbia colombiana, cada país tiene su estilo único.',
      targetAccuracy: 78,
    },
    {
      id: 'si-proverbs',
      type: 'sentences',
      text: 'El que mucho abarca, poco aprieta. No hay mal que por bien no venga. Más vale tarde que nunca.',
      targetAccuracy: 82,
    },
    {
      id: 'si-ene-focus',
      type: 'paragraph',
      text: 'El señor Peña enseña español a los niños pequeños. Cada año en otoño organiza una campaña especial para las familias de la montaña.',
      targetAccuracy: 80,
    },
    // EXPANDED: Travel in LATAM
    {
      id: 'si-travel-mexico',
      type: 'paragraph',
      text: '¡México es un país increíble! En Oaxaca probé el mole más delicioso. El guía nos llevó a las ruinas de Palenque donde aprendimos sobre la civilización maya.',
      targetAccuracy: 78,
    },
    {
      id: 'si-travel-peru',
      type: 'paragraph',
      text: '¿Has visitado Perú alguna vez? El Machu Picchu es impresionante. También navegamos por el lago Titicaca y conocimos a los señores que viven en las islas flotantes.',
      targetAccuracy: 78,
    },
    {
      id: 'si-travel-argentina',
      type: 'paragraph',
      text: 'En Argentina bailé tango en Buenos Aires. ¡Qué difícil es! Mi compañera de baile era una señora muy paciente que me enseñó los pasos básicos.',
      targetAccuracy: 78,
    },
    // EXPANDED: Family stories
    {
      id: 'si-family-1',
      type: 'paragraph',
      text: 'Mi cuñado y mi cuñada celebran su aniversario mañana. El señor Martínez preparará una cena especial. Los niños están muy emocionados por la fiesta.',
      targetAccuracy: 78,
    },
    {
      id: 'si-family-2',
      type: 'paragraph',
      text: 'La señora Ordóñez es la abuela de mis sobrinos. Ella cocina unas empanadas deliciosas cada año para Navidad. ¡Qué rica tradición familiar!',
      targetAccuracy: 78,
    },
    {
      id: 'si-family-3',
      type: 'paragraph',
      text: '¿Conoces a mi sobrino pequeño? Cumple cinco años mañana. Su padrino le regalará una piñata con forma de dinosaurio. ¡Qué emoción!',
      targetAccuracy: 79,
    },
    // EXPANDED: Work scenarios
    {
      id: 'si-work-1',
      type: 'paragraph',
      text: 'Mi compañero de trabajo diseña páginas web. Él me enseña a usar nuevas herramientas. Mañana tenemos una reunión importante con el señor director.',
      targetAccuracy: 78,
    },
    {
      id: 'si-work-2',
      type: 'paragraph',
      text: 'La señorita González trabaja en recursos humanos. Ella organiza las campañas de capacitación. Este año contrató a veinte empleados nuevos.',
      targetAccuracy: 77,
    },
    {
      id: 'si-work-3',
      type: 'paragraph',
      text: '¿Cuántos años llevas trabajando aquí? Yo llevo ocho años. Mi jefa, la señora Núñez, me ha enseñado mucho sobre gestión de proyectos.',
      targetAccuracy: 78,
    },
  ],
};

export const LESSON_SENTENCES_ADVANCED: Lesson = {
  id: 'sentences-advanced',
  name: 'Oraciones Avanzadas',
  nameEn: 'Advanced Sentences',
  description: 'Textos desafiantes con todo tipo de caracteres LATAM',
  descriptionEn: 'Challenging texts with all LATAM character types',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-intermediate', 'special-symbols'],
  estimatedMinutes: 20,
  exercises: [
    {
      id: 'sa-news',
      type: 'paragraph',
      text: 'Según las estadísticas, más de quinientos millones de personas hablan español como lengua materna o segunda lengua. Es el segundo idioma más hablado del mundo después del chino mandarín.',
      targetAccuracy: 78,
    },
    {
      id: 'sa-academic',
      type: 'paragraph',
      text: 'La lingüística es el estudio científico del lenguaje. Los lingüistas analizan la gramática, la fonología, la semántica y la pragmática de los idiomas.',
      targetAccuracy: 76,
    },
    {
      id: 'sa-business-email',
      type: 'paragraph',
      text: 'Estimado Señor García: Le escribo en relación a su consulta del quince de marzo. Adjunto encontrará la información solicitada. Quedo a su disposición para cualquier pregunta. Atentamente, María López.',
      targetAccuracy: 75,
    },
    {
      id: 'sa-literature',
      type: 'paragraph',
      text: 'Cien años de soledad es una novela del escritor colombiano Gabriel García Márquez. Publicada en mil novecientos sesenta y siete, es considerada una obra maestra de la literatura latinoamericana.',
      targetAccuracy: 75,
    },
    {
      id: 'sa-complex-dieresis',
      type: 'paragraph',
      text: 'El pingüino bilingüe estudia lingüística en la universidad. La cigüeña antigua vive cerca. ¡Qué vergüenza hablar de esto!',
      targetAccuracy: 78,
    },
    {
      id: 'sa-full-latam',
      type: 'paragraph',
      text: '¡Hola, señor Muñoz! ¿Cómo está su cuñado? Él trabaja en la campaña de montaña. Mañana cumple 50 años. ¡Qué alegría! También viene mi compañera María.',
      targetAccuracy: 75,
    },
    {
      id: 'sa-literature-2',
      type: 'paragraph',
      text: 'Érase una vez un pequeño niño que soñaba con montañas lejanas. Cada mañana, al despertar, pensaba en aquella cabaña donde vivía con su cuñado. ¡Qué tiempos aquellos!',
      targetAccuracy: 75,
    },
    // EXPANDED: News articles style
    {
      id: 'sa-news-2',
      type: 'paragraph',
      text: 'El presidente inauguró la nueva campaña de educación bilingüe. ¿Cuántos niños se beneficiarán? Según las autoridades, más de un millón de estudiantes en todo el país.',
      targetAccuracy: 76,
    },
    {
      id: 'sa-news-3',
      type: 'paragraph',
      text: 'La economía latinoamericana mostró señales de recuperación este año. Los expertos señalan que el crecimiento superó las expectativas. ¡Qué buenas noticias para la región!',
      targetAccuracy: 75,
    },
    // EXPANDED: Formal business correspondence
    {
      id: 'sa-business-2',
      type: 'paragraph',
      text: 'Estimada Señora Núñez: Por medio de la presente, le comunico que su solicitud ha sido aprobada. Adjunto encontrará la documentación correspondiente. Sin otro particular, le saluda atentamente.',
      targetAccuracy: 74,
    },
    {
      id: 'sa-business-3',
      type: 'paragraph',
      text: 'A quien corresponda: El señor José María Ordóñez solicita una prórroga para la entrega del proyecto. ¿Sería posible extender el plazo hasta el próximo viernes? Quedamos a la espera de su respuesta.',
      targetAccuracy: 73,
    },
    // EXPANDED: Literature excerpts
    {
      id: 'sa-literature-3',
      type: 'paragraph',
      text: 'Aquella mañana de otoño, el viento traía consigo el aroma de las montañas lejanas. La señora Castaño observaba desde su cabaña cómo los niños jugaban bajo la lluvia. ¡Qué felicidad tan sencilla!',
      targetAccuracy: 74,
    },
    {
      id: 'sa-literature-4',
      type: 'paragraph',
      text: '¿Quién podría olvidar aquellos años de juventud? El señor Ibáñez recordaba con nostalgia las tardes en el campo, cuando su abuelo le enseñaba los secretos de la viña.',
      targetAccuracy: 74,
    },
    // EXPANDED: Academic writing
    {
      id: 'sa-academic-2',
      type: 'paragraph',
      text: 'La investigación lingüística contemporánea analiza fenómenos como el bilingüismo y la adquisición del lenguaje. Los científicos utilizan métodos cuantitativos y cualitativos en sus estudios.',
      targetAccuracy: 73,
    },
    {
      id: 'sa-academic-3',
      type: 'paragraph',
      text: 'La bibliografía consultada incluye artículos de revistas especializadas en neurología y psicología cognitiva. ¿Cuál es la relación entre el cerebro bilingüe y la memoria?',
      targetAccuracy: 72,
    },
    // EXPANDED: Technical/programming context in Spanish
    {
      id: 'sa-tech-spanish',
      type: 'paragraph',
      text: 'La función calcularPrecioConDescuento recibe dos parámetros: precio y porcentaje. ¿Qué valor retorna si el porcentaje es mayor a cien? Debemos validar los datos de entrada.',
      targetAccuracy: 74,
    },
    {
      id: 'sa-tech-spanish-2',
      type: 'paragraph',
      text: 'El método obtenerInformaciónUsuario devuelve un objeto con nombre, dirección y teléfono. La señal de error indica que la conexión falló. ¡Revisar la configuración del servidor!',
      targetAccuracy: 73,
    },
  ],
};

// =============================================================================
// Module 12: Professional Contexts (NEW)
// =============================================================================

export const LESSON_PROFESSIONAL_BUSINESS: Lesson = {
  id: 'professional-business',
  name: 'Contexto Profesional - Negocios',
  nameEn: 'Professional Context - Business',
  description: 'Correos formales, comunicación empresarial y documentos oficiales',
  descriptionEn: 'Formal emails, business communication and official documents',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-advanced'],
  estimatedMinutes: 18,
  exercises: [
    {
      id: 'pb-email-1',
      type: 'paragraph',
      text: 'Estimado Señor Director: Me dirijo a usted para solicitar información sobre el programa de capacitación. ¿Cuándo comienza el próximo ciclo? Agradezco de antemano su atención.',
      targetAccuracy: 74,
    },
    {
      id: 'pb-email-2',
      type: 'paragraph',
      text: 'Distinguida Señora Vicepresidenta: Adjunto el informe trimestral de ventas. Los números muestran un crecimiento del quince por ciento. ¡Excelentes resultados para el equipo!',
      targetAccuracy: 74,
    },
    {
      id: 'pb-email-3',
      type: 'paragraph',
      text: 'Atención Departamento de Recursos Humanos: El señor Toño Peña presenta su renuncia efectiva a partir del próximo mes. ¿Cuál es el procedimiento para la entrega de documentos?',
      targetAccuracy: 73,
    },
    {
      id: 'pb-meeting',
      type: 'paragraph',
      text: '¿Podríamos agendar una reunión para el miércoles? Mi compañero y yo queremos presentar el nuevo diseño. El señor Ordóñez también estará disponible para responder preguntas técnicas.',
      targetAccuracy: 75,
    },
    {
      id: 'pb-report',
      type: 'paragraph',
      text: 'Según el análisis de datos, la campaña publicitaria alcanzó a más de un millón de usuarios. ¡Qué éxito tan impresionante! La inversión inicial se recuperó en solo tres meses.',
      targetAccuracy: 74,
    },
    {
      id: 'pb-contract',
      type: 'paragraph',
      text: 'Las cláusulas del contrato establecen que ambas partes deberán cumplir con las obligaciones señaladas. ¿Está de acuerdo con los términos propuestos? Favor de firmar al calce.',
      targetAccuracy: 73,
    },
    {
      id: 'pb-memo',
      type: 'paragraph',
      text: 'Memorándum: Se informa a todo el personal que mañana habrá mantenimiento en el edificio. El horario de trabajo será de diez a seis. ¡Gracias por su comprensión!',
      targetAccuracy: 75,
    },
    {
      id: 'pb-customer',
      type: 'paragraph',
      text: '¡Bienvenido a nuestra tienda, señor! ¿En qué puedo ayudarle hoy? Tenemos ofertas especiales en toda la mercancía. Si tiene alguna pregunta, no dude en consultarme.',
      targetAccuracy: 76,
    },
  ],
};

export const LESSON_PROFESSIONAL_ACADEMIC: Lesson = {
  id: 'professional-academic',
  name: 'Contexto Profesional - Académico',
  nameEn: 'Professional Context - Academic',
  description: 'Escritura académica, investigación y terminología universitaria',
  descriptionEn: 'Academic writing, research and university terminology',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-advanced'],
  estimatedMinutes: 18,
  exercises: [
    {
      id: 'pa-thesis-1',
      type: 'paragraph',
      text: 'La hipótesis de esta investigación plantea que el bilingüismo temprano mejora las habilidades cognitivas. ¿Cuáles son las implicaciones pedagógicas de estos hallazgos?',
      targetAccuracy: 72,
    },
    {
      id: 'pa-thesis-2',
      type: 'paragraph',
      text: 'El capítulo tercero analiza la metodología empleada. Se utilizaron entrevistas semiestructuradas con veinte participantes. La muestra incluyó estudiantes bilingües de español e inglés.',
      targetAccuracy: 72,
    },
    {
      id: 'pa-linguistics',
      type: 'paragraph',
      text: 'La fonología del español presenta características únicas como la distinción entre la ñ y la n. ¿Cómo adquieren los hablantes nativos estas diferencias fonémicas?',
      targetAccuracy: 73,
    },
    {
      id: 'pa-bibliography',
      type: 'paragraph',
      text: 'Referencias bibliográficas: García Márquez, Gabriel. Cien años de soledad. Buenos Aires: Editorial Sudamericana, mil novecientos sesenta y siete. Páginas uno a cuatrocientos.',
      targetAccuracy: 71,
    },
    {
      id: 'pa-abstract',
      type: 'paragraph',
      text: 'Resumen: Esta investigación examina la adquisición de la ortografía en niños hispanohablantes. Los resultados sugieren que la instrucción explícita mejora significativamente el desempeño.',
      targetAccuracy: 72,
    },
    {
      id: 'pa-seminar',
      type: 'paragraph',
      text: '¿Cuál es su opinión sobre la teoría presentada? El señor profesor Ibáñez argumenta que la gramática generativa no explica todos los fenómenos lingüísticos observados.',
      targetAccuracy: 73,
    },
    {
      id: 'pa-conference',
      type: 'paragraph',
      text: 'El próximo congreso de lingüística se celebrará en la Universidad Autónoma de México. ¡Qué oportunidad tan valiosa para presentar nuestra investigación sobre bilingüismo!',
      targetAccuracy: 74,
    },
    {
      id: 'pa-review',
      type: 'paragraph',
      text: 'La revisión de literatura incluye artículos publicados entre dos mil diez y dos mil veinticinco. ¿Dónde se puede consultar la bibliografía completa? En el apéndice número tres.',
      targetAccuracy: 73,
    },
  ],
};

export const LESSON_PROFESSIONAL_MEDICAL: Lesson = {
  id: 'professional-medical',
  name: 'Contexto Profesional - Médico',
  nameEn: 'Professional Context - Medical',
  description: 'Terminología médica, diagnósticos y comunicación sanitaria',
  descriptionEn: 'Medical terminology, diagnoses and healthcare communication',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-advanced'],
  estimatedMinutes: 18,
  exercises: [
    {
      id: 'pm-diagnosis-1',
      type: 'paragraph',
      text: 'El diagnóstico preliminar indica una infección respiratoria. ¿Cuántos días lleva con estos síntomas? Le recetaré medicación antibiótica por siete días.',
      targetAccuracy: 74,
    },
    {
      id: 'pm-diagnosis-2',
      type: 'paragraph',
      text: 'Según los análisis de sangre, los niveles de glucosa están elevados. Es necesario realizar estudios adicionales. ¿Tiene antecedentes familiares de diabetes?',
      targetAccuracy: 73,
    },
    {
      id: 'pm-surgery',
      type: 'paragraph',
      text: 'La cirugía está programada para el próximo miércoles a las ocho de la mañana. El señor anestesiólogo revisará su historial médico. ¡No coma ni beba nada después de medianoche!',
      targetAccuracy: 73,
    },
    {
      id: 'pm-prescription',
      type: 'paragraph',
      text: 'Tome esta medicación cada ocho horas con alimentos. Si presenta náuseas o mareos, suspenda el tratamiento y llámenos inmediatamente. ¿Tiene alguna alergia conocida?',
      targetAccuracy: 74,
    },
    {
      id: 'pm-consultation',
      type: 'paragraph',
      text: '¡Buenos días, señora! ¿Cómo se siente hoy? El doctor Núñez revisará sus estudios de laboratorio. La enfermera le tomará la presión arterial mientras esperamos.',
      targetAccuracy: 75,
    },
    {
      id: 'pm-emergency',
      type: 'paragraph',
      text: '¡Atención! El paciente presenta dificultad respiratoria aguda. Administrar oxígeno inmediatamente. ¿Cuál es su número de expediente? Preparar el equipo de reanimación.',
      targetAccuracy: 73,
    },
    {
      id: 'pm-followup',
      type: 'paragraph',
      text: 'Su próxima cita de seguimiento será en cuatro semanas. Es importante que continúe con la rehabilitación física. ¿Tiene preguntas sobre los ejercicios recomendados?',
      targetAccuracy: 74,
    },
    {
      id: 'pm-record',
      type: 'paragraph',
      text: 'Historia clínica del señor González: paciente masculino de cincuenta y ocho años. Antecedentes de hipertensión arterial. Medicación actual: losartán cincuenta miligramos diarios.',
      targetAccuracy: 72,
    },
  ],
};

export const LESSON_PROFESSIONAL_LEGAL: Lesson = {
  id: 'professional-legal',
  name: 'Contexto Profesional - Legal',
  nameEn: 'Professional Context - Legal',
  description: 'Terminología jurídica, documentos legales y procedimientos',
  descriptionEn: 'Legal terminology, legal documents and procedures',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-advanced'],
  estimatedMinutes: 18,
  exercises: [
    {
      id: 'pl-court-1',
      type: 'paragraph',
      text: '¡Con su venia, señoría! El acusado niega los cargos presentados en su contra. Solicitamos que se le permita declarar antes de que el juez emita su resolución.',
      targetAccuracy: 73,
    },
    {
      id: 'pl-court-2',
      type: 'paragraph',
      text: 'La jurisdicción de este tribunal abarca todo el territorio nacional. ¿Cuál es la legislación aplicable en este caso? El artículo cuarenta y cinco del código penal establece...',
      targetAccuracy: 72,
    },
    {
      id: 'pl-contract-1',
      type: 'paragraph',
      text: 'Las partes contratantes, representadas por el señor licenciado Peña y la señora notaria Ordóñez, acuerdan los siguientes términos y condiciones para la compraventa del inmueble.',
      targetAccuracy: 72,
    },
    {
      id: 'pl-contract-2',
      type: 'paragraph',
      text: 'Cláusula décima: En caso de incumplimiento, la parte afectada podrá rescindir el contrato. ¿Cuál es el plazo para presentar la demanda? Treinta días hábiles a partir de la notificación.',
      targetAccuracy: 71,
    },
    {
      id: 'pl-testimony',
      type: 'paragraph',
      text: '¿Jura decir la verdad, toda la verdad y nada más que la verdad? El testigo señaló que vio al acusado salir del edificio a las nueve de la noche aproximadamente.',
      targetAccuracy: 74,
    },
    {
      id: 'pl-appeal',
      type: 'paragraph',
      text: 'Por medio del presente escrito, interpongo recurso de apelación contra la sentencia emitida el quince de marzo. ¡Esta resolución vulnera los derechos de mi representado!',
      targetAccuracy: 72,
    },
    {
      id: 'pl-notary',
      type: 'paragraph',
      text: 'Ante mí, notario público número ochocientos veintitrés, compareció el señor Ibáñez para otorgar testamento. ¿Están presentes los testigos requeridos por la legislación vigente?',
      targetAccuracy: 71,
    },
    {
      id: 'pl-verdict',
      type: 'paragraph',
      text: 'Considerando los argumentos presentados y las pruebas exhibidas, este tribunal resuelve: se declara culpable al acusado. La sentencia será de cinco años de prisión.',
      targetAccuracy: 73,
    },
  ],
};

// =============================================================================
// Module 13: Programming (EXPANDED with LATAM layout symbols)
// =============================================================================

export const LESSON_PROGRAMMING_BASIC: Lesson = {
  id: 'programming-basic',
  name: 'Programación Básica',
  nameEn: 'Basic Programming',
  description: 'Símbolos comunes en programación con teclado LATAM',
  descriptionEn: 'Common programming symbols on LATAM keyboard',
  category: 'programming',
  difficulty: 'advanced',
  keys: ['{', '}', '[', ']', '<', '>', '|', '\\', '`', '~'],
  keyCodes: ['Quote', 'Backslash', 'BracketLeft', 'BracketRight', 'IntlBackslash', 'Backquote'],
  fingers: ['right-pinky', 'right-pinky', 'right-pinky', 'right-pinky', 'left-pinky', 'left-pinky'],
  prerequisites: ['special-symbols'],
  estimatedMinutes: 15,
  tips: [
    '{ se obtiene con AltGr+\' (apostrofe)',
    '} se obtiene con AltGr+\\ (barra invertida)',
    '[ se obtiene con AltGr+tecla de acento',
    '] se obtiene con AltGr++ (más)',
    '< y > están junto al Shift izquierdo',
    '/ está en Shift+7',
    '( y ) están en Shift+8 y Shift+9',
  ],
  exercises: [
    {
      id: 'prog-brackets-1',
      type: 'drill',
      text: '{ } [ ] < > ( ) { } [ ] < > ( )',
      targetAccuracy: 85,
    },
    {
      id: 'prog-brackets-2',
      type: 'drill',
      text: '{{ }} [[ ]] << >> (( )) { [ < ( ) > ] }',
      targetAccuracy: 82,
    },
    {
      id: 'prog-symbols',
      type: 'drill',
      text: '; : = + - * / % & | ! ? . ,',
      targetAccuracy: 85,
    },
    {
      id: 'prog-js-1',
      type: 'code',
      text: 'const mensaje = "Hola, mundo!"; console.log(mensaje);',
      targetAccuracy: 82,
    },
    {
      id: 'prog-js-2',
      type: 'code',
      text: 'const nombre = "María"; const edad = 25;',
      targetAccuracy: 82,
    },
    {
      id: 'prog-html-1',
      type: 'code',
      text: '<div class="container"><p>Texto</p></div>',
      targetAccuracy: 80,
    },
    {
      id: 'prog-html-2',
      type: 'code',
      text: '<h1>¡Hola Mundo!</h1><p>Bienvenido a España</p>',
      targetAccuracy: 80,
    },
  ],
};

export const LESSON_PROGRAMMING_INTERMEDIATE: Lesson = {
  id: 'programming-intermediate',
  name: 'Código Intermedio',
  nameEn: 'Intermediate Code',
  description: 'Fragmentos de código más complejos',
  descriptionEn: 'More complex code snippets',
  category: 'programming',
  difficulty: 'expert',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['programming-basic'],
  estimatedMinutes: 18,
  exercises: [
    {
      id: 'progi-function-1',
      type: 'code',
      text: 'function calcular(a, b) { return a + b; }',
      targetAccuracy: 80,
    },
    {
      id: 'progi-function-2',
      type: 'code',
      text: 'function saludar(nombre) { return "¡Hola, " + nombre + "!"; }',
      targetAccuracy: 78,
    },
    {
      id: 'progi-arrow-1',
      type: 'code',
      text: 'const suma = (a, b) => a + b; const resultado = suma(5, 3);',
      targetAccuracy: 78,
    },
    {
      id: 'progi-arrow-2',
      type: 'code',
      text: 'const usuarios = ["María", "José", "Señor García"];',
      targetAccuracy: 78,
    },
    {
      id: 'progi-conditional',
      type: 'code',
      text: 'if (edad >= 18) { console.log("Mayor de edad"); } else { console.log("Menor"); }',
      targetAccuracy: 75,
    },
    {
      id: 'progi-loop',
      type: 'code',
      text: 'for (let i = 0; i < 10; i++) { console.log("Número: " + i); }',
      targetAccuracy: 75,
    },
    {
      id: 'progi-object',
      type: 'code',
      text: 'const persona = { nombre: "José", año: 1990, país: "España" };',
      targetAccuracy: 75,
    },
    {
      id: 'progi-spanish-vars',
      type: 'code',
      text: 'const añoNacimiento = 1995; const cumpleaños = "15 de marzo";',
      targetAccuracy: 75,
    },
  ],
};

export const LESSON_PROGRAMMING_ADVANCED: Lesson = {
  id: 'programming-advanced',
  name: 'Código Avanzado',
  nameEn: 'Advanced Code',
  description: 'Patrones de código complejos con caracteres LATAM',
  descriptionEn: 'Complex code patterns with LATAM characters',
  category: 'programming',
  difficulty: 'expert',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['programming-intermediate'],
  estimatedMinutes: 20,
  exercises: [
    {
      id: 'proga-class',
      type: 'code',
      text: 'class Señor { constructor(nombre) { this.nombre = nombre; } saludar() { return "¡Hola!"; } }',
      targetAccuracy: 72,
    },
    {
      id: 'proga-async',
      type: 'code',
      text: 'async function obtenerDatos() { const respuesta = await fetch("/api/usuarios"); return respuesta.json(); }',
      targetAccuracy: 72,
    },
    {
      id: 'proga-template',
      type: 'code',
      text: 'const mensaje = `¡Hola, ${nombre}! Tienes ${edad} años.`;',
      targetAccuracy: 75,
    },
    {
      id: 'proga-destructure',
      type: 'code',
      text: 'const { nombre, año, país } = persona; console.log(`${nombre} nació en ${año}`);',
      targetAccuracy: 72,
    },
    {
      id: 'proga-array-methods',
      type: 'code',
      text: 'const mayores = usuarios.filter(u => u.edad >= 18).map(u => u.nombre);',
      targetAccuracy: 70,
    },
  ],
};

// =============================================================================
// Module 12: Real-World Practice (NEW)
// =============================================================================

export const LESSON_REALWORLD_EMAILS: Lesson = {
  id: 'realworld-emails',
  name: 'Correos Electrónicos',
  nameEn: 'Emails',
  description: 'Practica escribiendo correos formales e informales',
  descriptionEn: 'Practice writing formal and informal emails',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-intermediate', 'special-symbols'],
  estimatedMinutes: 15,
  exercises: [
    {
      id: 'email-formal-1',
      type: 'paragraph',
      text: 'Estimado Señor García: Le escribo para informarle sobre la reunión del próximo viernes. Por favor, confirme su asistencia. Saludos cordiales.',
      targetAccuracy: 78,
    },
    {
      id: 'email-formal-2',
      type: 'paragraph',
      text: 'Estimada Señora Muñoz: Adjunto el informe solicitado. Si tiene alguna pregunta, no dude en contactarme a mi correo: info@empresa.mx. Atentamente.',
      targetAccuracy: 75,
    },
    {
      id: 'email-informal-1',
      type: 'paragraph',
      text: '¡Hola, María! ¿Cómo estás? ¿Qué tal el fin de semana? Yo estuve con mi cuñado en la montaña. ¡Estuvo genial! Hablamos pronto. ¡Besos!',
      targetAccuracy: 78,
    },
    {
      id: 'email-informal-2',
      type: 'paragraph',
      text: '¡Oye! ¿Ya viste el correo de Juan? Dice que mañana es el cumpleaños de Señor Peña. ¿Vamos a la fiesta? ¡Avísame! Un abrazo.',
      targetAccuracy: 78,
    },
  ],
};

export const LESSON_REALWORLD_SOCIAL: Lesson = {
  id: 'realworld-social',
  name: 'Redes Sociales',
  nameEn: 'Social Media',
  description: 'Practica escribiendo publicaciones y mensajes',
  descriptionEn: 'Practice writing posts and messages',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-basic', 'special-symbols'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'social-post-1',
      type: 'sentences',
      text: '¡Qué hermoso día! ☀️ Disfrutando en la montaña con mi familia. #vacaciones #españa',
      targetAccuracy: 80,
    },
    {
      id: 'social-post-2',
      type: 'sentences',
      text: '¿Alguien sabe dónde está el mejor café de la ciudad? ¡Necesito uno! @cafe_bueno',
      targetAccuracy: 80,
    },
    {
      id: 'social-message-1',
      type: 'paragraph',
      text: '¡Hola! ¿Viste las fotos del cumpleaños de María? ¡Estuvo increíble! El señor García llevó un pastel enorme. ¿Cuándo nos vemos?',
      targetAccuracy: 78,
    },
    {
      id: 'social-comment',
      type: 'sentences',
      text: '¡Felicidades por tu logro! 🎉 ¿Cuántos años llevas trabajando en eso? ¡Qué orgullo! @amigo_juan',
      targetAccuracy: 78,
    },
  ],
};

// =============================================================================
// Export All Lessons
// =============================================================================

/**
 * All lessons in the curriculum
 */
export const ALL_LESSONS: Lesson[] = [
  // Module 1: Home Row
  LESSON_HOME_ROW_LEFT,
  LESSON_HOME_ROW_RIGHT,
  LESSON_HOME_ROW_COMBINED,
  LESSON_HOME_ROW_GH,
  // Module 2: Top Row
  LESSON_TOP_ROW_LEFT,
  LESSON_TOP_ROW_RIGHT,
  LESSON_TOP_ROW_COMBINED,
  // Module 3: Bottom Row
  LESSON_BOTTOM_ROW_LEFT,
  LESSON_BOTTOM_ROW_RIGHT,
  LESSON_BOTTOM_ROW_COMBINED,
  // Module 4: Full Alphabet
  LESSON_FULL_ALPHABET,
  // Module 5: Shift
  LESSON_SHIFT_BASIC,
  LESSON_SHIFT_FULL,
  // Module 6: Numbers
  LESSON_NUMBERS_LEFT,
  LESSON_NUMBERS_RIGHT,
  LESSON_NUMBERS_COMBINED,
  // Module 7: LATAM Special Characters
  LESSON_ACCENTS_ACUTE,
  LESSON_ACCENTS_DIERESIS,
  LESSON_INVERTED_PUNCTUATION,
  LESSON_SPECIAL_SYMBOLS,
  // Module 8: Ñ Mastery
  LESSON_ENE_MASTERY,
  // Module 9: Words
  LESSON_COMMON_WORDS_1,
  LESSON_COMMON_WORDS_2,
  LESSON_COMMON_WORDS_3,
  // Module 10: Sentences
  LESSON_SENTENCES_BASIC,
  LESSON_SENTENCES_INTERMEDIATE,
  LESSON_SENTENCES_ADVANCED,
  // Module 11: Professional Contexts (NEW)
  LESSON_PROFESSIONAL_BUSINESS,
  LESSON_PROFESSIONAL_ACADEMIC,
  LESSON_PROFESSIONAL_MEDICAL,
  LESSON_PROFESSIONAL_LEGAL,
  // Module 12: Programming
  LESSON_PROGRAMMING_BASIC,
  LESSON_PROGRAMMING_INTERMEDIATE,
  LESSON_PROGRAMMING_ADVANCED,
  // Module 13: Real-World Practice
  LESSON_REALWORLD_EMAILS,
  LESSON_REALWORLD_SOCIAL,
];

/**
 * Lessons indexed by ID for quick lookup
 */
export const LESSONS_BY_ID: Record<string, Lesson> = ALL_LESSONS.reduce(
  (acc, lesson) => {
    acc[lesson.id] = lesson;
    return acc;
  },
  {} as Record<string, Lesson>
);

/**
 * Recommended lesson order (progression path)
 */
export const RECOMMENDED_PATH: string[] = ALL_LESSONS.map((l) => l.id);
