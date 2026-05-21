export function toNumber(value) {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

export function round1(value) {
  return Math.round(value * 10) / 10;
}