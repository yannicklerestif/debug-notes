export interface MoveEvent {
  x: number | undefined,
  y: number | undefined,
  oldX: number,
  oldY: number,
  diagramId: string,
  id: string,
  type: 'clazz' | 'method',
}