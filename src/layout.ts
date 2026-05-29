import { CSS_VARS } from './constants';

export function setRootVwVar(name: string, value: number): void {
  document.documentElement.style.setProperty(name, `${value}vw`);
}

export function applyPadding(left: number, right: number): void {
  setRootVwVar(CSS_VARS.leftPadding, left);
  setRootVwVar(CSS_VARS.rightPadding, right);
}
