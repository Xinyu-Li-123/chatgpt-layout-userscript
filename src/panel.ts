import { DEFAULTS, PANEL_ID, STORAGE_KEYS } from './constants';
import { slidersIconSvg } from './icons';
import { applyPadding } from './layout';
import { readNumber, saveNumber } from './storage';

type PanelPosition = {
  x: number;
  y: number;
};

type SliderRow = {
  element: HTMLElement;
  setValue: (value: number) => void;
};

const PANEL_EDGE_OFFSET = 16;
const PANEL_VIEWPORT_MARGIN = 8;
const DRAG_THRESHOLD = 4;
const POPOVER_GAP = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function readPanelPosition(): PanelPosition | null {
  const raw = localStorage.getItem(STORAGE_KEYS.panelPosition);
  if (raw === null) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'x' in value &&
      'y' in value
    ) {
      const { x, y } = value as { x: unknown; y: unknown };

      if (typeof x === 'number' && typeof y === 'number') {
        return {
          x: clamp(x, 0, 1),
          y: clamp(y, 0, 1),
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

function savePanelPosition(position: PanelPosition): void {
  localStorage.setItem(STORAGE_KEYS.panelPosition, JSON.stringify(position));
}

function getPanelBounds(root: HTMLElement): {
  minLeft: number;
  maxLeft: number;
  minTop: number;
  maxTop: number;
} {
  const minLeft = PANEL_VIEWPORT_MARGIN;
  const minTop = PANEL_VIEWPORT_MARGIN;
  const maxLeft = Math.max(
    minLeft,
    window.innerWidth - root.offsetWidth - PANEL_VIEWPORT_MARGIN,
  );
  const maxTop = Math.max(
    minTop,
    window.innerHeight - root.offsetHeight - PANEL_VIEWPORT_MARGIN,
  );

  return { minLeft, maxLeft, minTop, maxTop };
}

function panelPositionToPixels(
  root: HTMLElement,
  position: PanelPosition,
): { left: number; top: number } {
  const bounds = getPanelBounds(root);

  return {
    left: bounds.minLeft + position.x * (bounds.maxLeft - bounds.minLeft),
    top: bounds.minTop + position.y * (bounds.maxTop - bounds.minTop),
  };
}

function panelPixelsToPosition(
  root: HTMLElement,
  left: number,
  top: number,
): PanelPosition {
  const bounds = getPanelBounds(root);
  const width = bounds.maxLeft - bounds.minLeft;
  const height = bounds.maxTop - bounds.minTop;

  return {
    x: width === 0 ? 0 : clamp((left - bounds.minLeft) / width, 0, 1),
    y: height === 0 ? 0 : clamp((top - bounds.minTop) / height, 0, 1),
  };
}

function getDefaultPanelPosition(root: HTMLElement): PanelPosition {
  return panelPixelsToPosition(
    root,
    window.innerWidth - root.offsetWidth - PANEL_EDGE_OFFSET,
    window.innerHeight - root.offsetHeight - PANEL_EDGE_OFFSET,
  );
}

function setPanelPixels(root: HTMLElement, left: number, top: number): void {
  const bounds = getPanelBounds(root);

  root.style.left = `${clamp(left, bounds.minLeft, bounds.maxLeft)}px`;
  root.style.top = `${clamp(top, bounds.minTop, bounds.maxTop)}px`;
}

function applyPanelPosition(root: HTMLElement, position: PanelPosition): void {
  const { left, top } = panelPositionToPixels(root, position);
  setPanelPixels(root, left, top);
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

  function updatePopoverPosition(): void {
    const panelRect = root.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const hasSpaceAbove = panelRect.top >= popoverHeight + POPOVER_GAP;
    const hasSpaceBelow =
      window.innerHeight - panelRect.bottom >= popoverHeight + POPOVER_GAP;
    const opensAbove = hasSpaceAbove || !hasSpaceBelow;
    const preferredLeft =
      panelRect.left > window.innerWidth / 2
        ? panelRect.right - popoverWidth
        : panelRect.left;
    const clampedLeft = clamp(
      preferredLeft,
      PANEL_VIEWPORT_MARGIN,
      Math.max(
        PANEL_VIEWPORT_MARGIN,
        window.innerWidth - popoverWidth - PANEL_VIEWPORT_MARGIN,
      ),
    );

    popover.classList.toggle('cg-popover-above', opensAbove);
    popover.classList.toggle('cg-popover-below', !opensAbove);
    popover.style.left = `${clampedLeft - panelRect.left}px`;
  }

  function setPanelOpen(open: boolean): void {
    panelOpen = open;
    popover.hidden = !panelOpen;
    if (panelOpen) updatePopoverPosition();
  }

  let dragState:
    | {
        pointerId: number;
        startPointerX: number;
        startPointerY: number;
        startLeft: number;
        startTop: number;
        moved: boolean;
      }
    | null = null;
  let suppressClick = false;

  iconButton.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;

    const rect = root.getBoundingClientRect();

    dragState = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false,
    };

    iconButton.setPointerCapture(event.pointerId);
  });

  iconButton.addEventListener('pointermove', (event) => {
    if (dragState === null || event.pointerId !== dragState.pointerId) return;

    const deltaX = event.clientX - dragState.startPointerX;
    const deltaY = event.clientY - dragState.startPointerY;

    if (
      !dragState.moved &&
      Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD
    ) {
      dragState.moved = true;
    }

    if (!dragState.moved) return;

    setPanelPixels(
      root,
      dragState.startLeft + deltaX,
      dragState.startTop + deltaY,
    );
    if (panelOpen) updatePopoverPosition();
  });

  iconButton.addEventListener('pointerup', (event) => {
    if (dragState === null || event.pointerId !== dragState.pointerId) return;

    if (dragState.moved) {
      const rect = root.getBoundingClientRect();
      savePanelPosition(panelPixelsToPosition(root, rect.left, rect.top));
      suppressClick = true;
      event.preventDefault();
    }

    if (iconButton.hasPointerCapture(event.pointerId)) {
      iconButton.releasePointerCapture(event.pointerId);
    }

    dragState = null;
  });

  iconButton.addEventListener('pointercancel', (event) => {
    if (dragState === null || event.pointerId !== dragState.pointerId) return;

    if (iconButton.hasPointerCapture(event.pointerId)) {
      iconButton.releasePointerCapture(event.pointerId);
    }

    dragState = null;
  });

  iconButton.addEventListener('click', () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }

    setPanelOpen(!panelOpen);
  });

  closeButton.addEventListener('click', () => {
    setPanelOpen(false);
  });

  actions.append(resetButton);
  popover.append(header, leftRow.element, rightRow.element, actions);
  root.append(iconButton, popover);
  root.style.visibility = 'hidden';

  document.body.appendChild(root);

  applyPanelPosition(root, readPanelPosition() ?? getDefaultPanelPosition(root));
  root.style.visibility = '';

  window.addEventListener('resize', () => {
    const rect = root.getBoundingClientRect();
    const position =
      readPanelPosition() ?? panelPixelsToPosition(root, rect.left, rect.top);

    applyPanelPosition(root, position);
    if (panelOpen) updatePopoverPosition();
  });
}
