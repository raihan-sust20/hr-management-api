export function parseToInt(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number string: "${value}"`);
  }

  return parsed;
}
