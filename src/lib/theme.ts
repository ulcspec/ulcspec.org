// Theme bootstrap + toggle share this key. The bootstrap script in main.astro
// also references this constant via `define:vars` so the literal string is
// declared once.
export const THEME_STORAGE_KEY = 'ulc-theme';

export type ThemeName = 'light' | 'dark';
