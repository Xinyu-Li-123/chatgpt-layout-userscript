export const STYLE_ID = 'cg-layout-slider-style';
export const PANEL_ID = 'cg-layout-slider-panel';

export const STORAGE_KEYS = {
  left: 'cg-layout-left-padding',
  right: 'cg-layout-right-padding',
  panelOpen: 'cg-layout-panel-open',
} as const;

export const DEFAULTS = {
  left: 0,
  right: 0,
  maxSliderValue: 1200,
} as const;

export const CSS_VARS = {
  leftPadding: '--cg-convo-padding-left',
  rightPadding: '--cg-convo-padding-right',
} as const;
