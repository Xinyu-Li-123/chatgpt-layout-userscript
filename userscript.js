// ==UserScript==
// @name         Adjustable ChatGPT Conversation Width
// @namespace    https://chat.openai.com/
// @version      0.1.0
// @description  Make ChatGPT conversation content wider and control left/right padding with sliders.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const STORAGE_KEYS = {
    left: 'cg-layout-left-padding',
    right: 'cg-layout-right-padding',
    panelCollapsed: 'cg-layout-panel-collapsed',
  };

  const DEFAULTS = {
    left: 0,
    right: 0,
    maxSliderValue: 1200,
  };

  function readNumber(key, fallback) {
    const raw = localStorage.getItem(key);
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
  }

  function saveNumber(key, value) {
    localStorage.setItem(key, String(value));
  }

  function setRootVar(name, value) {
    document.documentElement.style.setProperty(name, `${value}px`);
  }

  function applyPadding(left, right) {
    setRootVar('--cg-convo-padding-left', left);
    setRootVar('--cg-convo-padding-right', right);
  }

  function injectLayoutCss() {
    const existing = document.getElementById('cg-layout-slider-style');
    if (existing) return;

    const style = document.createElement('style');
    style.id = 'cg-layout-slider-style';
    style.textContent = `
      /*
        Main ChatGPT conversation container.
        This class currently appears as @container/main in ChatGPT's DOM.
      */
      [class~="@container/main"] {
        box-sizing: border-box !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding-left: var(--cg-convo-padding-left, 0px) !important;
        padding-right: var(--cg-convo-padding-right, 0px) !important;
      }

      /*
        Message/thread width controller.
        ChatGPT commonly stores the thread width in this CSS variable.
      */
      [class*="--thread-content-max-width"] {
        --thread-content-max-width: 9999px !important;
      }

      #cg-layout-slider-panel {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 2147483647;
        width: 280px;
        padding: 12px;
        border: 1px solid rgba(0, 0, 0, 0.16);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.94);
        color: #111;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.16);
        backdrop-filter: blur(8px);
      }

      @media (prefers-color-scheme: dark) {
        #cg-layout-slider-panel {
          background: rgba(32, 33, 35, 0.94);
          color: #f5f5f5;
          border-color: rgba(255, 255, 255, 0.16);
        }

        #cg-layout-slider-panel button {
          background: rgba(255, 255, 255, 0.08);
          color: #f5f5f5;
          border-color: rgba(255, 255, 255, 0.2);
        }

        #cg-layout-slider-panel input[type="number"] {
          background: rgba(255, 255, 255, 0.08);
          color: #f5f5f5;
          border-color: rgba(255, 255, 255, 0.2);
        }
      }

      #cg-layout-slider-panel.cg-collapsed .cg-layout-body {
        display: none;
      }

      #cg-layout-slider-panel .cg-layout-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 10px;
        font-weight: 650;
      }

      #cg-layout-slider-panel .cg-layout-title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      #cg-layout-slider-panel .cg-layout-row {
        display: grid;
        grid-template-columns: 1fr 64px;
        gap: 8px;
        align-items: center;
        margin: 10px 0;
      }

      #cg-layout-slider-panel label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        opacity: 0.82;
      }

      #cg-layout-slider-panel input[type="range"] {
        width: 100%;
      }

      #cg-layout-slider-panel input[type="number"] {
        width: 64px;
        box-sizing: border-box;
        padding: 4px 6px;
        border: 1px solid rgba(0, 0, 0, 0.18);
        border-radius: 6px;
        font: inherit;
      }

      #cg-layout-slider-panel .cg-layout-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
      }

      #cg-layout-slider-panel button {
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.16);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.04);
        color: #111;
        padding: 5px 9px;
        font: inherit;
      }

      #cg-layout-slider-panel button:hover {
        background: rgba(0, 0, 0, 0.08);
      }

      @media (prefers-color-scheme: dark) {
        #cg-layout-slider-panel button:hover {
          background: rgba(255, 255, 255, 0.14);
        }
      }
    `;

    document.documentElement.appendChild(style);
  }

  function createSliderRow({ labelText, value, max, onChange }) {
    const wrapper = document.createElement('div');

    const label = document.createElement('label');
    label.textContent = labelText;

    const row = document.createElement('div');
    row.className = 'cg-layout-row';

    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = String(max);
    range.step = '1';
    range.value = String(value);

    const number = document.createElement('input');
    number.type = 'number';
    number.min = '0';
    number.max = String(max);
    number.step = '1';
    number.value = String(value);

    function setValue(nextValue) {
      const clamped = Math.max(0, Math.min(max, Number(nextValue) || 0));
      range.value = String(clamped);
      number.value = String(clamped);
      onChange(clamped);
    }

    range.addEventListener('input', () => setValue(range.value));
    number.addEventListener('input', () => setValue(number.value));

    row.append(range, number);
    wrapper.append(label, row);

    return {
      element: wrapper,
      setValue,
    };
  }

  function injectPanel() {
    const existing = document.getElementById('cg-layout-slider-panel');
    if (existing) return;

    let left = readNumber(STORAGE_KEYS.left, DEFAULTS.left);
    let right = readNumber(STORAGE_KEYS.right, DEFAULTS.right);

    applyPadding(left, right);

    const panel = document.createElement('div');
    panel.id = 'cg-layout-slider-panel';

    const wasCollapsed = localStorage.getItem(STORAGE_KEYS.panelCollapsed) === 'true';
    if (wasCollapsed) {
      panel.classList.add('cg-collapsed');
    }

    const header = document.createElement('div');
    header.className = 'cg-layout-header';

    const title = document.createElement('div');
    title.className = 'cg-layout-title';
    title.textContent = 'ChatGPT Layout';

    const collapseButton = document.createElement('button');
    collapseButton.type = 'button';
    collapseButton.textContent = wasCollapsed ? 'Show' : 'Hide';

    collapseButton.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('cg-collapsed');
      collapseButton.textContent = collapsed ? 'Show' : 'Hide';
      localStorage.setItem(STORAGE_KEYS.panelCollapsed, String(collapsed));
    });

    header.append(title, collapseButton);

    const body = document.createElement('div');
    body.className = 'cg-layout-body';

    const leftRow = createSliderRow({
      labelText: 'Left padding',
      value: left,
      max: DEFAULTS.maxSliderValue,
      onChange: (value) => {
        left = value;
        saveNumber(STORAGE_KEYS.left, left);
        applyPadding(left, right);
      },
    });

    const rightRow = createSliderRow({
      labelText: 'Right padding',
      value: right,
      max: DEFAULTS.maxSliderValue,
      onChange: (value) => {
        right = value;
        saveNumber(STORAGE_KEYS.right, right);
        applyPadding(left, right);
      },
    });

    const actions = document.createElement('div');
    actions.className = 'cg-layout-actions';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
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

    actions.append(resetButton);
    body.append(leftRow.element, rightRow.element, actions);
    panel.append(header, body);

    document.body.appendChild(panel);
  }

  function init() {
    injectLayoutCss();

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
})();
