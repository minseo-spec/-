import type { ThemeName } from '../types';

export const themeOptions: Array<{ name: ThemeName; label: string; soft: string; strong: string }> = [
  { name: 'green', label: '초록', soft: '#bfe3c8', strong: '#3f8f5b' },
  { name: 'blue', label: '파랑', soft: '#bddbf4', strong: '#3f82bd' },
  { name: 'pink', label: '핑크', soft: '#f0bed1', strong: '#b9577b' },
  { name: 'yellow', label: '노랑', soft: '#ead680', strong: '#a88422' },
  { name: 'purple', label: '보라', soft: '#d1bced', strong: '#7d5fba' },
  { name: 'mint', label: '민트', soft: '#bce5dc', strong: '#3b9689' },
  { name: 'peach', label: '피치', soft: '#f1c2a5', strong: '#be7045' },
  { name: 'gray', label: '흑백', soft: '#d0ccc3', strong: '#6b665d' },
  { name: 'cream', label: '크림', soft: '#e7d39a', strong: '#9f7e35' },
  { name: 'lavender', label: '라벤더', soft: '#cdbce8', strong: '#8067b2' },
];
