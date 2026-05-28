import { CSS_VARS } from './constants';

export function setRootPxVar(name: string, value: number): void {
  document.documentElement.style.setProperty(name, `${value}px`);
}

export function applyPadding(left: number, right: number): void {
  setRootPxVar(CSS_VARS.leftPadding, left);
  setRootPxVar(CSS_VARS.rightPadding, right);
}
