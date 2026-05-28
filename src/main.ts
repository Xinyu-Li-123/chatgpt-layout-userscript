import { DEFAULTS, STORAGE_KEYS } from './constants';
import { applyPadding } from './layout';
import { injectPanel } from './panel';
import { injectStyles } from './styles';
import { readNumber } from './storage';

function init(): void {
  injectStyles();

  const left = readNumber(STORAGE_KEYS.left, DEFAULTS.left);
  const right = readNumber(STORAGE_KEYS.right, DEFAULTS.right);

  applyPadding(left, right);
  injectPanel();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
