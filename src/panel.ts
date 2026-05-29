import { DEFAULTS, PANEL_ID, STORAGE_KEYS } from './constants';
import { slidersIconSvg } from './icons';
import { applyPadding } from './layout';
import { readNumber, saveNumber } from './storage';

type SliderRow = {
  element: HTMLElement;
  setValue: (value: number) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatBrowserWindowWidth(value: number): string {
  return `${Number(value.toFixed(2))}% of page width`;
}

function createSliderRow(options: {
  labelText: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}): SliderRow {
  const { labelText, value, max, onChange } = options;

  const wrapper = document.createElement('div');
  wrapper.className = 'cg-control';

  const label = document.createElement('label');

  const labelName = document.createElement('span');
  labelName.textContent = labelText;

  const valueText = document.createElement('span');
  valueText.textContent = formatBrowserWindowWidth(value);

  label.append(labelName, valueText);

  const range = document.createElement('input');
  range.type = 'range';
  range.min = '0';
  range.max = String(max);
  range.step = '0.25';
  range.value = String(value);

  function setValue(nextValue: number): void {
    const normalized = clamp(nextValue, 0, max);

    range.value = String(normalized);
    valueText.textContent = formatBrowserWindowWidth(normalized);
    onChange(normalized);
  }

  range.addEventListener('input', () => {
    setValue(Number(range.value));
  });

  wrapper.append(label, range);

  return {
    element: wrapper,
    setValue,
  };
}

export function injectPanel(): void {
  if (document.getElementById(PANEL_ID)) return;

  let left = readNumber(STORAGE_KEYS.left, DEFAULTS.left);
  let right = readNumber(STORAGE_KEYS.right, DEFAULTS.right);
  let panelOpen = false;

  applyPadding(left, right);

  const root = document.createElement('div');
  root.id = PANEL_ID;

  const iconButton = document.createElement('button');
  iconButton.type = 'button';
  iconButton.className = 'cg-icon-button';
  iconButton.title = 'ChatGPT layout';
  iconButton.setAttribute('aria-label', 'Toggle ChatGPT layout controls');
  iconButton.innerHTML = slidersIconSvg;

  const popover = document.createElement('div');
  popover.className = 'cg-popover';
  popover.hidden = !panelOpen;

  const header = document.createElement('div');
  header.className = 'cg-header';

  const title = document.createElement('div');
  title.textContent = 'ChatGPT Layout';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'cg-close-button';
  closeButton.textContent = '×';
  closeButton.title = 'Close';
  closeButton.setAttribute('aria-label', 'Close layout controls');

  header.append(title, closeButton);

  const leftRow = createSliderRow({
    labelText: 'Left space',
    value: left,
    max: DEFAULTS.maxSliderValue,
    onChange: (value) => {
      left = value;
      saveNumber(STORAGE_KEYS.left, left);
      applyPadding(left, right);
    },
  });

  const rightRow = createSliderRow({
    labelText: 'Right space',
    value: right,
    max: DEFAULTS.maxSliderValue,
    onChange: (value) => {
      right = value;
      saveNumber(STORAGE_KEYS.right, right);
      applyPadding(left, right);
    },
  });

  const actions = document.createElement('div');
  actions.className = 'cg-actions';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'cg-reset-button';
  resetButton.textContent = 'Reset';

  resetButton.addEventListener('click', () => {
    left = DEFAULTS.left;
    right = DEFAULTS.right;

    leftRow.setValue(left);
    rightRow.setValue(right);

    saveNumber(STORAGE_KEYS.left, left);
    saveNumber(STORAGE_KEYS.right, right);
    applyPadding(left, right);
  });

  function setPanelOpen(open: boolean): void {
    panelOpen = open;
    popover.hidden = !panelOpen;
  }

  iconButton.addEventListener('click', () => {
    setPanelOpen(!panelOpen);
  });

  closeButton.addEventListener('click', () => {
    setPanelOpen(false);
  });

  actions.append(resetButton);
  popover.append(header, leftRow.element, rightRow.element, actions);
  root.append(iconButton, popover);

  document.body.appendChild(root);
}
