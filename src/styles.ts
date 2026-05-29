import { STYLE_ID } from './constants';

export function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;

  style.textContent = `
    [class~="@container/main"] {
      box-sizing: border-box !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: var(--cg-convo-padding-left, 0vw) !important;
      padding-right: var(--cg-convo-padding-right, 0vw) !important;
    }

    [class*="--thread-content-max-width"] {
      --thread-content-max-width: 9999px !important;
    }

    #cg-layout-slider-panel {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #111;
    }

    #cg-layout-slider-panel * {
      box-sizing: border-box;
    }

    #cg-layout-slider-panel .cg-icon-button {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(0, 0, 0, 0.16);
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.94);
      color: #111;
      cursor: pointer;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
      backdrop-filter: blur(8px);
    }

    #cg-layout-slider-panel .cg-icon-button:hover {
      background: rgba(245, 245, 245, 0.98);
    }

    #cg-layout-slider-panel .cg-popover {
      position: absolute;
      right: 0;
      bottom: 48px;
      width: 240px;
      padding: 10px;
      border: 1px solid rgba(0, 0, 0, 0.16);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.96);
      color: #111;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
      backdrop-filter: blur(8px);
    }

    #cg-layout-slider-panel .cg-popover[hidden] {
      display: none;
    }

    #cg-layout-slider-panel .cg-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 650;
    }

    #cg-layout-slider-panel .cg-close-button {
      width: 24px;
      height: 24px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      line-height: 1;
    }

    #cg-layout-slider-panel .cg-close-button:hover {
      background: rgba(0, 0, 0, 0.08);
    }

    #cg-layout-slider-panel .cg-control {
      margin: 8px 0;
    }

    #cg-layout-slider-panel label {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 12px;
      opacity: 0.84;
    }

    #cg-layout-slider-panel input[type="range"] {
      width: 100%;
    }

    #cg-layout-slider-panel .cg-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    #cg-layout-slider-panel .cg-reset-button {
      border: 1px solid rgba(0, 0, 0, 0.16);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.04);
      color: inherit;
      padding: 5px 9px;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
    }

    #cg-layout-slider-panel .cg-reset-button:hover {
      background: rgba(0, 0, 0, 0.08);
    }

    @media (prefers-color-scheme: dark) {
      #cg-layout-slider-panel {
        color: #f5f5f5;
      }

      #cg-layout-slider-panel .cg-icon-button,
      #cg-layout-slider-panel .cg-popover {
        background: rgba(32, 33, 35, 0.96);
        color: #f5f5f5;
        border-color: rgba(255, 255, 255, 0.16);
      }

      #cg-layout-slider-panel .cg-icon-button:hover,
      #cg-layout-slider-panel .cg-reset-button:hover,
      #cg-layout-slider-panel .cg-close-button:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      #cg-layout-slider-panel .cg-reset-button {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  `;

  document.documentElement.appendChild(style);
}
