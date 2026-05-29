export function readNumber(key: string, fallback: number): number {
  const raw = localStorage.getItem(key);
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function saveNumber(key: string, value: number): void {
  localStorage.setItem(key, String(value));
}
