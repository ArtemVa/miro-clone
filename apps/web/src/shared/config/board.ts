export const STICKY_COLORS = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple', 'gray', 'white'] as const;
export type StickyColor = (typeof STICKY_COLORS)[number];

/** Цвет участника: var(--presence-1…8), выдаётся по кругу при входе в пространство */
export const PRESENCE_COUNT = 8;
export const presenceColor = (index: number) => `var(--presence-${(index % PRESENCE_COUNT) + 1})`;

export const BOARD = {
  grid: 20, // шаг точечной сетки в координатах доски
  zoom: { min: 0.1, max: 4, step: 1.2 },
  sticky: { width: 160, height: 140 },
  shape: { width: 180, height: 70, kinds: ['rect', 'pill', 'ellipse'] },
  text: { width: 260, sizes: { S: 14, M: 18, L: 26, XL: 40 } },
  minNodeSize: { width: 40, height: 28 },
  image: { maxBytes: 10 * 1024 * 1024, maxWidth: 360 },
  export: { maxSide: 8000, scales: [1, 2, 3], formats: ['png', 'jpg'] },
} as const;

export const TIMINGS = {
  savingIndicator: 600, // «Сохранение…» после последней правки
  autoVersion: 10 * 60_000, // автоверсия каждые 10 минут работы
  versionTtlDays: 90,
  toast: 4000,
  toastWithUndo: 6000,
} as const;

export const MOTION = {
  fast: 150, // hover, нажатия
  base: 220, // появление поповеров и панелей
  camera: 380, // «Показать всё», переход к комментарию — ease-out cubic
  aiMove: 480, // ИИ переставляет стикеры
} as const;

/** z-index слоёв интерфейса над холстом: чем больше, тем выше */
export const Z_INDEX_LAYERS = {
  canvas: 0,
  overlay: 10, // выделение, курсоры, пины комментариев
  followFrame: 15,
  islands: 20, // шапка, тулбар, зум
  contextBar: 25,
  panels: 30, // комментарии, история, ИИ
  thread: 35,
  popover: 40,
  menu: 50,
  tooltip: 70,
  toast: 100,
} as const;

/**
 * Горячие клавиши. Сравнивать с event.code, а не event.key:
 * в русской раскладке V, N, T приходят как «м», «т», «е».
 */
export const HOTKEYS = {
  select: 'KeyV',
  hand: 'KeyH', // или зажатый пробел
  sticky: 'KeyN',
  text: 'KeyT',
  shape: 'KeyR',
  connector: 'KeyL',
  image: 'KeyI',
  comment: 'KeyC',
  ai: 'Slash',
  shortcuts: 'Shift+Slash',
  fit: 'Shift+Digit1',
  zoomReset: 'Mod+Digit0',
  zoomIn: 'Mod+Equal',
  zoomOut: 'Mod+Minus',
  undo: 'Mod+KeyZ', // отменяет только свои операции
  redo: 'Mod+Shift+KeyZ',
  duplicate: 'Mod+KeyD',
  group: 'Mod+KeyG',
  ungroup: 'Mod+Shift+KeyG',
  selectAll: 'Mod+KeyA',
  exportImage: 'Mod+Shift+KeyE',
} as const;
