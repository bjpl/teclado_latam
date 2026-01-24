/**
 * @file lessons.ts
 * @description Complete typing curriculum for LATAM Spanish keyboard.
 *
 * This curriculum follows standard touch typing pedagogy:
 * 1. Home row mastery first (ASDF JKL and n with tilde)
 * 2. Expand to top row (QWERTY)
 * 3. Expand to bottom row (ZXCVB)
 * 4. Numbers and symbols
 * 5. LATAM-specific characters (accents, inverted punctuation)
 * 6. Word and sentence practice
 *
 * Key LATAM keyboard features addressed:
 * - n with tilde (Semicolon key position)
 * - Dead key accents (acute via BracketLeft, dieresis via Shift+BracketLeft)
 * - Inverted question/exclamation marks
 * - Spanish-specific punctuation
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
    'Coloca tu dedo indice izquierdo en la tecla F (tiene una marca tactil)',
    'Mantén los dedos curvados y relajados',
    'No mires el teclado',
  ],
  exercises: [
    ...createDrills([
      'fff fff fff fff fff',
      'jjj jjj jjj jjj jjj',
      'ddd ddd ddd ddd ddd',
      'sss sss sss sss sss',
      'aaa aaa aaa aaa aaa',
      'fdf fdf fdf fdf fdf',
      'sas sas sas sas sas',
      'asdf asdf asdf asdf',
      'fdsa fdsa fdsa fdsa',
      'afsd afsd dfas dfas',
    ], 'hrl'),
    {
      id: 'hrl-combo',
      type: 'drill',
      text: 'asd sad das dsa fad fas saf daf',
      targetAccuracy: 92,
    },
  ],
};

export const LESSON_HOME_ROW_RIGHT: Lesson = {
  id: 'home-row-right',
  name: 'Fila Base - Mano Derecha',
  nameEn: 'Home Row - Right Hand',
  description: 'Aprende las teclas base de la mano derecha: J, K, L, N with tilde',
  descriptionEn: 'Learn the home row keys for the right hand: J, K, L, N with tilde',
  category: 'home-row',
  difficulty: 'beginner',
  keys: ['j', 'k', 'l', '\u00F1'],
  keyCodes: ['KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
  fingers: ['right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: [],
  estimatedMinutes: 5,
  tips: [
    'El dedo indice derecho va en la tecla J (tiene marca tactil)',
    'La n with tilde esta donde estaria el punto y coma en ingles',
    'Practica el movimiento del menique hacia la n with tilde',
  ],
  exercises: [
    ...createDrills([
      'jjj jjj jjj jjj jjj',
      'kkk kkk kkk kkk kkk',
      'lll lll lll lll lll',
      '\u00F1\u00F1\u00F1 \u00F1\u00F1\u00F1 \u00F1\u00F1\u00F1 \u00F1\u00F1\u00F1',
      'jkl jkl jkl jkl jkl',
      'lkj lkj lkj lkj lkj',
      'jk\u00F1 jk\u00F1 k\u00F1l k\u00F1l',
      'l\u00F1j l\u00F1j \u00F1lk \u00F1lk',
    ], 'hrr'),
    {
      id: 'hrr-combo',
      type: 'drill',
      text: 'j\u00F1l k\u00F1j lk\u00F1 jlk \u00F1kj l\u00F1k',
      targetAccuracy: 92,
    },
  ],
};

export const LESSON_HOME_ROW_COMBINED: Lesson = {
  id: 'home-row-combined',
  name: 'Fila Base - Ambas Manos',
  nameEn: 'Home Row - Both Hands',
  description: 'Combina las teclas de ambas manos en la fila base',
  descriptionEn: 'Combine keys from both hands on the home row',
  category: 'home-row',
  difficulty: 'beginner',
  keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', '\u00F1'],
  keyCodes: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['home-row-left', 'home-row-right'],
  estimatedMinutes: 8,
  tips: [
    'Alterna entre manos para desarrollar ritmo',
    'Mantén una postura relajada',
  ],
  exercises: [
    ...createDrills([
      'asdf jkl\u00F1 asdf jkl\u00F1',
      'fjdk sl\u00F1a fjdk sl\u00F1a',
      'alfa alfa alfa alfa',
      'sala sala sala sala',
      'falla falla falla',
      'dada dada dada dada',
      'lass lass lass lass',
    ], 'hrc'),
    {
      id: 'hrc-words',
      type: 'words',
      text: 'ala sal las dad faja falla dalla',
      targetAccuracy: 90,
    },
  ],
};

export const LESSON_HOME_ROW_GH: Lesson = {
  id: 'home-row-gh',
  name: 'Fila Base - G y H',
  nameEn: 'Home Row - G and H',
  description: 'Agrega las teclas G y H usando los dedos indices',
  descriptionEn: 'Add G and H keys using the index fingers',
  category: 'home-row',
  difficulty: 'beginner',
  keys: ['g', 'h'],
  keyCodes: ['KeyG', 'KeyH'],
  fingers: ['left-index', 'right-index'],
  prerequisites: ['home-row-combined'],
  estimatedMinutes: 6,
  tips: [
    'G se alcanza con el indice izquierdo moviéndose a la derecha',
    'H se alcanza con el indice derecho moviéndose a la izquierda',
    'Regresa siempre a F y J después de presionar G o H',
  ],
  exercises: [
    ...createDrills([
      'fgf fgf fgf fgf fgf',
      'jhj jhj jhj jhj jhj',
      'gag gag hah hah',
      'fg hj fg hj fg hj',
      'gala gala gala gala',
      'hada hada hada hada',
      'haga haga haga haga',
    ], 'hrgh'),
    {
      id: 'hrgh-words',
      type: 'words',
      text: 'gala hada halla jagga haga falda',
      targetAccuracy: 90,
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
  estimatedMinutes: 8,
  tips: [
    'Cada dedo sube verticalmente desde la fila base',
    'El indice cubre tanto R como T',
    'Regresa a la fila base después de cada letra',
  ],
  exercises: [
    ...createDrills([
      'aqa aqa sws sws ded ded',
      'frf frf ftf ftf',
      'aqaq swsw eded frfr ftft',
      'qwer qwer qwer qwer',
      'trew trew trew trew',
      'que que que que',
      'tres tres tres tres',
    ], 'trl'),
    {
      id: 'trl-words',
      type: 'words',
      text: 'que este tela rata greta fresa',
      targetAccuracy: 88,
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
  estimatedMinutes: 8,
  tips: [
    'Y y U se presionan con el indice derecho',
    'P requiere estirar el menique hacia arriba',
  ],
  exercises: [
    ...createDrills([
      'jyj jyj juj juj kik kik',
      'lol lol \u00F1p\u00F1 \u00F1p\u00F1',
      'yuio yuio yuio yuio',
      'poiu poiu poiu poiu',
      'yo yo yo yo tu tu tu',
      'piso piso piso piso',
    ], 'trr'),
    {
      id: 'trr-words',
      type: 'words',
      text: 'hijo tipo julio polo yoyo pujo',
      targetAccuracy: 88,
    },
  ],
};

export const LESSON_TOP_ROW_COMBINED: Lesson = {
  id: 'top-row-combined',
  name: 'Fila Superior - Completa',
  nameEn: 'Top Row - Complete',
  description: 'Practica toda la fila superior con palabras reales',
  descriptionEn: 'Practice the entire top row with real words',
  category: 'top-row',
  difficulty: 'intermediate',
  keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  keyCodes: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['top-row-left', 'top-row-right'],
  estimatedMinutes: 10,
  exercises: [
    {
      id: 'trc-drill',
      type: 'drill',
      text: 'qwerty uiop qwerty uiop qwerty',
      targetAccuracy: 90,
    },
    {
      id: 'trc-words',
      type: 'words',
      text: 'equipo puerta tierra poder quieto respeto',
      targetAccuracy: 88,
    },
    {
      id: 'trc-sentences',
      type: 'sentences',
      text: 'El equipo de trabajo hizo su tarea.',
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
  estimatedMinutes: 8,
  tips: [
    'Los dedos bajan diagonalmente desde la fila base',
    'V y B se presionan con el indice izquierdo',
    'Z requiere cuidado con el menique',
  ],
  exercises: [
    ...createDrills([
      'aza aza sxs sxs dcd dcd',
      'fvf fvf fbf fbf',
      'zxcv zxcv zxcv zxcv',
      'bvcx bvcx bvcx bvcx',
      'vez vez vez vez',
      'vaca vaca vaca vaca',
    ], 'brl'),
    {
      id: 'brl-words',
      type: 'words',
      text: 'vez caza brazo exacto cerveza',
      targetAccuracy: 85,
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
  estimatedMinutes: 8,
  tips: [
    'N y M se presionan con el indice derecho',
    'La coma y el punto estan en posiciones naturales',
    'El guion esta junto al Shift derecho',
  ],
  exercises: [
    ...createDrills([
      'jnj jnj jmj jmj k,k k,k',
      'l.l l.l \u00F1-\u00F1 \u00F1-\u00F1',
      'nm,. nm,. nm,. nm,.',
      'man, man, man, man,',
      'no. no. no. no.',
    ], 'brr'),
    {
      id: 'brr-words',
      type: 'words',
      text: 'mano, nada, mono, cama, lana.',
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
  estimatedMinutes: 10,
  exercises: [
    {
      id: 'brc-drill',
      type: 'drill',
      text: 'zxcvbnm,.- zxcvbnm,.- zxcvbnm,.-',
      targetAccuracy: 88,
    },
    {
      id: 'brc-words',
      type: 'words',
      text: 'combinar, cambio, nublado, cerveza, marzo.',
      targetAccuracy: 85,
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
  description: 'Practica todas las letras del alfabeto',
  descriptionEn: 'Practice all letters of the alphabet',
  category: 'words',
  difficulty: 'intermediate',
  keys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', '\u00F1', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  keyCodes: ['KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'Semicolon', 'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ'],
  fingers: ['left-pinky', 'left-index', 'left-middle', 'left-middle', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-middle', 'right-index', 'right-middle', 'right-ring', 'right-index', 'right-index', 'right-pinky', 'right-ring', 'right-pinky', 'left-pinky', 'left-index', 'left-ring', 'left-index', 'right-index', 'left-index', 'left-ring', 'left-ring', 'right-index', 'left-pinky'],
  prerequisites: ['bottom-row-combined'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'alpha-pangram',
      type: 'sentences',
      text: 'El veloz murci\u00E9lago hind\u00FA com\u00EDa feliz cardillo y kiwi.',
      targetAccuracy: 85,
      hint: 'Este es un pangrama que contiene todas las letras',
    },
    {
      id: 'alpha-words',
      type: 'words',
      text: 'alfabeto conjunto ejemplo trabajo jugar',
      targetAccuracy: 88,
    },
  ],
};

// =============================================================================
// Module 5: Shift Key and Capitals
// =============================================================================

export const LESSON_SHIFT_BASIC: Lesson = {
  id: 'shift-basic',
  name: 'May\u00FAsculas B\u00E1sicas',
  nameEn: 'Basic Capitals',
  description: 'Aprende a usar la tecla Shift para may\u00FAsculas',
  descriptionEn: 'Learn to use the Shift key for capitals',
  category: 'punctuation',
  difficulty: 'intermediate',
  keys: ['A', 'S', 'D', 'F', 'J', 'K', 'L', '\u00D1'],
  keyCodes: ['ShiftLeft', 'ShiftRight', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
  fingers: ['left-pinky', 'right-pinky', 'left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['full-alphabet'],
  estimatedMinutes: 8,
  tips: [
    'Usa el Shift opuesto a la letra que escribes',
    'Shift izquierdo para letras de la derecha',
    'Shift derecho para letras de la izquierda',
  ],
  exercises: [
    ...createDrills([
      'Aa Ss Dd Ff Jj Kk Ll \u00D1\u00F1',
      'Ala Sal Dad Faja Jaja Kala Lala',
      'AsDf JkL\u00F1 AsDf JkL\u00F1',
    ], 'shift'),
    {
      id: 'shift-names',
      type: 'words',
      text: 'Ana Juan Sara Luis Marta Pedro',
      targetAccuracy: 90,
    },
  ],
};

export const LESSON_SHIFT_FULL: Lesson = {
  id: 'shift-full',
  name: 'May\u00FAsculas Completas',
  nameEn: 'Full Capitals',
  description: 'Domina las may\u00FAsculas en todo el teclado',
  descriptionEn: 'Master capitals across the keyboard',
  category: 'punctuation',
  difficulty: 'intermediate',
  keys: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', '\u00D1', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  keyCodes: ['ShiftLeft', 'ShiftRight'],
  fingers: ['left-pinky', 'right-pinky'],
  prerequisites: ['shift-basic'],
  estimatedMinutes: 10,
  exercises: [
    {
      id: 'shift-full-sentences',
      type: 'sentences',
      text: 'El Se\u00F1or Garc\u00EDa vive en M\u00E9xico. La Se\u00F1ora L\u00F3pez trabaja en Per\u00FA.',
      targetAccuracy: 88,
    },
    {
      id: 'shift-full-names',
      type: 'words',
      text: 'Buenos Aires Santiago Lima Bogot\u00E1 Caracas Quito',
      targetAccuracy: 85,
    },
  ],
};

// =============================================================================
// Module 6: Numbers
// =============================================================================

export const LESSON_NUMBERS_LEFT: Lesson = {
  id: 'numbers-left',
  name: 'N\u00FAmeros - Mano Izquierda',
  nameEn: 'Numbers - Left Hand',
  description: 'Aprende los n\u00FAmeros 1, 2, 3, 4, 5',
  descriptionEn: 'Learn numbers 1, 2, 3, 4, 5',
  category: 'numbers',
  difficulty: 'intermediate',
  keys: ['1', '2', '3', '4', '5'],
  keyCodes: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'],
  fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index'],
  prerequisites: ['shift-full'],
  estimatedMinutes: 8,
  exercises: [
    ...createDrills([
      'a1a a1a s2s s2s d3d d3d',
      'f4f f4f f5f f5f',
      '12345 12345 12345',
      '54321 54321 54321',
      '135 135 24 24 12 34 45',
    ], 'numl'),
    {
      id: 'numl-mixed',
      type: 'words',
      text: 'Hay 12 casas. Son 345 pesos. Tengo 25 a\u00F1os.',
      targetAccuracy: 88,
    },
  ],
};

export const LESSON_NUMBERS_RIGHT: Lesson = {
  id: 'numbers-right',
  name: 'N\u00FAmeros - Mano Derecha',
  nameEn: 'Numbers - Right Hand',
  description: 'Aprende los n\u00FAmeros 6, 7, 8, 9, 0',
  descriptionEn: 'Learn numbers 6, 7, 8, 9, 0',
  category: 'numbers',
  difficulty: 'intermediate',
  keys: ['6', '7', '8', '9', '0'],
  keyCodes: ['Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
  fingers: ['right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
  prerequisites: ['shift-full'],
  estimatedMinutes: 8,
  exercises: [
    ...createDrills([
      'j6j j6j j7j j7j k8k k8k',
      'l9l l9l \u00F10\u00F1 \u00F10\u00F1',
      '67890 67890 67890',
      '09876 09876 09876',
      '68 79 80 96 70 86',
    ], 'numr'),
    {
      id: 'numr-mixed',
      type: 'words',
      text: 'El tel\u00E9fono es 5678-9012. Cuesta 890 pesos.',
      targetAccuracy: 88,
    },
  ],
};

export const LESSON_NUMBERS_COMBINED: Lesson = {
  id: 'numbers-combined',
  name: 'N\u00FAmeros - Completo',
  nameEn: 'Numbers - Complete',
  description: 'Practica todos los n\u00FAmeros con contexto',
  descriptionEn: 'Practice all numbers in context',
  category: 'numbers',
  difficulty: 'intermediate',
  keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  keyCodes: ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'],
  fingers: ['right-pinky', 'left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-index', 'right-middle', 'right-ring'],
  prerequisites: ['numbers-left', 'numbers-right'],
  estimatedMinutes: 10,
  exercises: [
    {
      id: 'numc-all',
      type: 'drill',
      text: '1234567890 0987654321 1357924680 2468013579',
      targetAccuracy: 90,
    },
    {
      id: 'numc-dates',
      type: 'sentences',
      text: 'Naci\u00F3 el 15 de marzo de 1990. Hoy es 23 de enero de 2026.',
      targetAccuracy: 85,
    },
    {
      id: 'numc-phone',
      type: 'sentences',
      text: 'Mi n\u00FAmero es 555-1234-5678. El c\u00F3digo postal es 06600.',
      targetAccuracy: 85,
    },
  ],
};

// =============================================================================
// Module 7: LATAM Special Characters
// =============================================================================

export const LESSON_ACCENTS_ACUTE: Lesson = {
  id: 'accents-acute',
  name: 'Acentos Agudos',
  nameEn: 'Acute Accents',
  description: 'Aprende a escribir vocales con acento agudo usando dead keys',
  descriptionEn: 'Learn to type accented vowels using dead keys',
  category: 'special',
  difficulty: 'intermediate',
  keys: ['\u00E1', '\u00E9', '\u00ED', '\u00F3', '\u00FA', '\u00C1', '\u00C9', '\u00CD', '\u00D3', '\u00DA'],
  keyCodes: ['BracketLeft', 'KeyA', 'KeyE', 'KeyI', 'KeyO', 'KeyU'],
  fingers: ['right-pinky', 'left-pinky', 'left-middle', 'right-middle', 'right-ring', 'right-index'],
  prerequisites: ['full-alphabet'],
  estimatedMinutes: 12,
  usesDeadKeys: true,
  deadKeyTypes: ['acute'],
  tips: [
    'Primero presiona la tecla del acento (junto a P)',
    'Luego presiona la vocal que quieres acentuar',
    'El acento aparece combinado con la vocal',
    'Para may\u00FAsculas: acento + Shift + vocal',
  ],
  exercises: [
    ...createDrills([
      '\u00E1 \u00E1 \u00E1 \u00E9 \u00E9 \u00E9 \u00ED \u00ED \u00ED',
      '\u00F3 \u00F3 \u00F3 \u00FA \u00FA \u00FA',
      'a\u00E1 e\u00E9 i\u00ED o\u00F3 u\u00FA',
      '\u00C1 \u00C9 \u00CD \u00D3 \u00DA',
    ], 'acute'),
    {
      id: 'acute-words',
      type: 'words',
      text: 'caf\u00E9 sof\u00E1 aqu\u00ED est\u00E1 pap\u00E1 mam\u00E1 com\u00ED sal\u00ED',
      targetAccuracy: 85,
    },
    {
      id: 'acute-sentences',
      type: 'sentences',
      text: 'M\u00E9xico est\u00E1 en Am\u00E9rica. El caf\u00E9 est\u00E1 caliente. \u00C9l vivi\u00F3 aqu\u00ED.',
      targetAccuracy: 82,
    },
  ],
};

export const LESSON_ACCENTS_DIERESIS: Lesson = {
  id: 'accents-dieresis',
  name: 'Di\u00E9resis',
  nameEn: 'Dieresis (Umlaut)',
  description: 'Aprende a escribir la u con di\u00E9resis',
  descriptionEn: 'Learn to type u with dieresis',
  category: 'special',
  difficulty: 'intermediate',
  keys: ['\u00FC', '\u00DC'],
  keyCodes: ['BracketLeft', 'KeyU'],
  fingers: ['right-pinky', 'right-index'],
  prerequisites: ['accents-acute'],
  estimatedMinutes: 6,
  usesDeadKeys: true,
  deadKeyTypes: ['dieresis'],
  tips: [
    'Shift + tecla del acento produce la di\u00E9resis',
    'Luego presiona U',
    'Se usa en palabras como ping\u00FCino, ling\u00FC\u00EDstica',
  ],
  exercises: [
    ...createDrills([
      '\u00FC \u00FC \u00FC \u00DC \u00DC \u00DC',
      'g\u00FCe g\u00FCe g\u00FCi g\u00FCi',
    ], 'dieresis'),
    {
      id: 'dieresis-words',
      type: 'words',
      text: 'ping\u00FCino biling\u00FCe ling\u00FC\u00EDstica verg\u00FCenza cig\u00FCe\u00F1a',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_INVERTED_PUNCTUATION: Lesson = {
  id: 'inverted-punctuation',
  name: 'Signos Invertidos',
  nameEn: 'Inverted Punctuation',
  description: 'Aprende los signos de interrogaci\u00F3n y exclamaci\u00F3n invertidos',
  descriptionEn: 'Learn inverted question and exclamation marks',
  category: 'special',
  difficulty: 'intermediate',
  keys: ['\u00BF', '\u00A1'],
  keyCodes: ['Equal', 'Digit1'],
  fingers: ['right-pinky', 'left-pinky'],
  prerequisites: ['shift-full'],
  estimatedMinutes: 8,
  tips: [
    '\u00BF est\u00E1 junto a la tecla Backspace',
    '\u00A1 se obtiene con Shift+1',
    'Siempre abre con el signo invertido y cierra con el normal',
  ],
  exercises: [
    ...createDrills([
      '\u00BF? \u00BF? \u00BF? \u00A1! \u00A1! \u00A1!',
      '\u00BFC\u00F3mo? \u00BFQu\u00E9? \u00BFD\u00F3nde?',
      '\u00A1Hola! \u00A1Bien! \u00A1Vamos!',
    ], 'inverted'),
    {
      id: 'inverted-questions',
      type: 'sentences',
      text: '\u00BFC\u00F3mo est\u00E1s? \u00BFQu\u00E9 hora es? \u00BFD\u00F3nde vives?',
      targetAccuracy: 85,
    },
    {
      id: 'inverted-exclamations',
      type: 'sentences',
      text: '\u00A1Qu\u00E9 bueno! \u00A1Felicidades! \u00A1Incre\u00EDble!',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_SPECIAL_SYMBOLS: Lesson = {
  id: 'special-symbols',
  name: 'S\u00EDmbolos Especiales',
  nameEn: 'Special Symbols',
  description: 'S\u00EDmbolos comunes en el teclado LATAM',
  descriptionEn: 'Common symbols on the LATAM keyboard',
  category: 'special',
  difficulty: 'advanced',
  keys: ['@', '#', '$', '%', '&', '/', '(', ')', '=', '+', '*'],
  keyCodes: ['Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'BracketRight'],
  fingers: ['left-ring', 'left-middle', 'left-index', 'left-index', 'right-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky', 'right-pinky'],
  prerequisites: ['numbers-combined'],
  estimatedMinutes: 10,
  tips: [
    '@ se obtiene con AltGr+Q o AltGr+2',
    'Los par\u00E9ntesis est\u00E1n en Shift+8 y Shift+9',
    '/ est\u00E1 en Shift+7',
  ],
  exercises: [
    ...createDrills([
      '@ @ # # $ $ % %',
      '& / ( ) = + *',
      'correo@ejemplo.com',
      '100% 50/50 (nota)',
    ], 'symbols'),
    {
      id: 'symbols-email',
      type: 'words',
      text: 'usuario@correo.com info@empresa.mx contacto@web.org',
      targetAccuracy: 85,
    },
    {
      id: 'symbols-math',
      type: 'sentences',
      text: '2 + 2 = 4. 10 / 2 = 5. (3 * 4) + 1 = 13.',
      targetAccuracy: 82,
    },
  ],
};

// =============================================================================
// Module 8: Common Spanish Words
// =============================================================================

export const LESSON_COMMON_WORDS_1: Lesson = {
  id: 'common-words-1',
  name: 'Palabras Frecuentes 1',
  nameEn: 'Common Words 1',
  description: 'Las 50 palabras m\u00E1s usadas en espa\u00F1ol',
  descriptionEn: 'The 50 most common Spanish words',
  category: 'words',
  difficulty: 'intermediate',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['full-alphabet'],
  estimatedMinutes: 10,
  exercises: [
    {
      id: 'cw1-articles',
      type: 'words',
      text: 'el la los las un una unos unas',
      targetAccuracy: 95,
    },
    {
      id: 'cw1-prepositions',
      type: 'words',
      text: 'de en con por para sin sobre entre',
      targetAccuracy: 92,
    },
    {
      id: 'cw1-verbs',
      type: 'words',
      text: 'es ser estar tiene hacer puede',
      targetAccuracy: 90,
    },
    {
      id: 'cw1-mixed',
      type: 'sentences',
      text: 'El ni\u00F1o est\u00E1 en la casa. Ella tiene un libro.',
      targetAccuracy: 88,
    },
  ],
};

export const LESSON_COMMON_WORDS_2: Lesson = {
  id: 'common-words-2',
  name: 'Palabras Frecuentes 2',
  nameEn: 'Common Words 2',
  description: 'M\u00E1s palabras comunes del espa\u00F1ol',
  descriptionEn: 'More common Spanish words',
  category: 'words',
  difficulty: 'intermediate',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['common-words-1'],
  estimatedMinutes: 10,
  exercises: [
    {
      id: 'cw2-pronouns',
      type: 'words',
      text: 'yo t\u00FA \u00E9l ella nosotros ustedes ellos',
      targetAccuracy: 92,
    },
    {
      id: 'cw2-time',
      type: 'words',
      text: 'hoy ma\u00F1ana ayer siempre nunca ahora despu\u00E9s',
      targetAccuracy: 90,
    },
    {
      id: 'cw2-questions',
      type: 'words',
      text: 'qu\u00E9 c\u00F3mo cu\u00E1ndo d\u00F3nde por qu\u00E9 qui\u00E9n',
      targetAccuracy: 88,
    },
  ],
};

// =============================================================================
// Module 9: Full Sentences
// =============================================================================

export const LESSON_SENTENCES_BASIC: Lesson = {
  id: 'sentences-basic',
  name: 'Oraciones B\u00E1sicas',
  nameEn: 'Basic Sentences',
  description: 'Practica oraciones simples en espa\u00F1ol',
  descriptionEn: 'Practice simple Spanish sentences',
  category: 'sentences',
  difficulty: 'intermediate',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['common-words-1', 'inverted-punctuation'],
  estimatedMinutes: 12,
  exercises: [
    {
      id: 'sb-greetings',
      type: 'sentences',
      text: '\u00A1Hola! \u00BFC\u00F3mo est\u00E1s? Estoy bien, gracias. \u00BFY t\u00FA?',
      targetAccuracy: 88,
    },
    {
      id: 'sb-intro',
      type: 'sentences',
      text: 'Me llamo Juan. Soy de M\u00E9xico. Tengo veinticinco a\u00F1os.',
      targetAccuracy: 85,
    },
    {
      id: 'sb-daily',
      type: 'sentences',
      text: 'Hoy es un buen d\u00EDa. El sol brilla en el cielo azul.',
      targetAccuracy: 85,
    },
  ],
};

export const LESSON_SENTENCES_INTERMEDIATE: Lesson = {
  id: 'sentences-intermediate',
  name: 'Oraciones Intermedias',
  nameEn: 'Intermediate Sentences',
  description: 'Oraciones m\u00E1s complejas con vocabulario variado',
  descriptionEn: 'More complex sentences with varied vocabulary',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-basic', 'accents-acute'],
  estimatedMinutes: 15,
  exercises: [
    {
      id: 'si-literature',
      type: 'paragraph',
      text: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, viv\u00EDa un hidalgo de los de lanza en astillero.',
      targetAccuracy: 82,
      hint: 'Inicio de Don Quijote de la Mancha',
    },
    {
      id: 'si-modern',
      type: 'paragraph',
      text: 'La tecnolog\u00EDa ha cambiado nuestra forma de comunicarnos. Hoy podemos hablar con personas de todo el mundo instant\u00E1neamente.',
      targetAccuracy: 80,
    },
  ],
};

export const LESSON_SENTENCES_ADVANCED: Lesson = {
  id: 'sentences-advanced',
  name: 'Oraciones Avanzadas',
  nameEn: 'Advanced Sentences',
  description: 'Textos desafiantes con todo tipo de caracteres',
  descriptionEn: 'Challenging texts with all character types',
  category: 'sentences',
  difficulty: 'advanced',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['sentences-intermediate', 'special-symbols'],
  estimatedMinutes: 15,
  exercises: [
    {
      id: 'sa-complex',
      type: 'paragraph',
      text: '\u00BFSab\u00EDas que el espa\u00F1ol es el segundo idioma m\u00E1s hablado del mundo? \u00A1M\u00E1s de 500 millones de personas lo hablan! Es incre\u00EDble, \u00BFno?',
      targetAccuracy: 80,
    },
    {
      id: 'sa-business',
      type: 'paragraph',
      text: 'Estimado Sr. Garc\u00EDa: Le escribo en relaci\u00F3n a su consulta del 15/03/2026. Por favor, env\u00EDe la informaci\u00F3n a contacto@empresa.com.',
      targetAccuracy: 78,
    },
  ],
};

// =============================================================================
// Module 10: Programming (Optional)
// =============================================================================

export const LESSON_PROGRAMMING_BASIC: Lesson = {
  id: 'programming-basic',
  name: 'Programaci\u00F3n B\u00E1sica',
  nameEn: 'Basic Programming',
  description: 'S\u00EDmbolos comunes en programaci\u00F3n',
  descriptionEn: 'Common programming symbols',
  category: 'programming',
  difficulty: 'advanced',
  keys: ['{', '}', '[', ']', '<', '>', '|', '\\', '`', '~'],
  keyCodes: ['Quote', 'Backslash', 'BracketLeft', 'BracketRight', 'IntlBackslash', 'Backquote'],
  fingers: ['right-pinky', 'right-pinky', 'right-pinky', 'right-pinky', 'left-pinky', 'left-pinky'],
  prerequisites: ['special-symbols'],
  estimatedMinutes: 12,
  tips: [
    '{ y } se obtienen con AltGr+\' y AltGr+\\',
    '[ y ] se obtienen con AltGr+tecla de acento y AltGr++',
    '< y > est\u00E1n junto al Shift izquierdo',
  ],
  exercises: [
    {
      id: 'prog-brackets',
      type: 'drill',
      text: '{ } [ ] < > ( ) { } [ ] < > ( )',
      targetAccuracy: 85,
    },
    {
      id: 'prog-js',
      type: 'code',
      text: 'const mensaje = "Hola, mundo!"; console.log(mensaje);',
      targetAccuracy: 82,
    },
    {
      id: 'prog-html',
      type: 'code',
      text: '<div class="container"><p>Texto</p></div>',
      targetAccuracy: 80,
    },
  ],
};

export const LESSON_PROGRAMMING_INTERMEDIATE: Lesson = {
  id: 'programming-intermediate',
  name: 'C\u00F3digo Intermedio',
  nameEn: 'Intermediate Code',
  description: 'Fragmentos de c\u00F3digo m\u00E1s complejos',
  descriptionEn: 'More complex code snippets',
  category: 'programming',
  difficulty: 'expert',
  keys: [],
  keyCodes: [],
  fingers: [],
  prerequisites: ['programming-basic'],
  estimatedMinutes: 15,
  exercises: [
    {
      id: 'progi-function',
      type: 'code',
      text: 'function calcular(a, b) { return a + b; }',
      targetAccuracy: 80,
    },
    {
      id: 'progi-arrow',
      type: 'code',
      text: 'const suma = (a, b) => a + b; const resultado = suma(5, 3);',
      targetAccuracy: 78,
    },
    {
      id: 'progi-conditional',
      type: 'code',
      text: 'if (edad >= 18) { console.log("Mayor de edad"); } else { console.log("Menor"); }',
      targetAccuracy: 75,
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
  // Module 7: LATAM Special
  LESSON_ACCENTS_ACUTE,
  LESSON_ACCENTS_DIERESIS,
  LESSON_INVERTED_PUNCTUATION,
  LESSON_SPECIAL_SYMBOLS,
  // Module 8: Words
  LESSON_COMMON_WORDS_1,
  LESSON_COMMON_WORDS_2,
  // Module 9: Sentences
  LESSON_SENTENCES_BASIC,
  LESSON_SENTENCES_INTERMEDIATE,
  LESSON_SENTENCES_ADVANCED,
  // Module 10: Programming
  LESSON_PROGRAMMING_BASIC,
  LESSON_PROGRAMMING_INTERMEDIATE,
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
