export function randomInteger(low: number, high: number): number {
  const range = Math.round(high - low);
  return Math.round(low) + Math.trunc(Math.random() * range);
}
