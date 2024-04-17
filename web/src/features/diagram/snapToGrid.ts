export function snapToGrid(coord: number): number {
  return Math.round(coord / 10) * 10;
}
