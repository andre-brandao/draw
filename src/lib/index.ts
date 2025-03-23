export * from './shapes/Point.svelte';
export * from './shapes/Line.svelte';
export * from './shapes/Polygon.svelte';
export * from './geometryStore.svelte';

// Constants
export const POINT_RADIUS = 5;
export const SELECTION_COLOR = 'rgba(0, 120, 215, 0.3)';
export const SELECTION_BORDER_COLOR = 'rgba(0, 120, 215, 0.8)';

// Helper drawing functions
export function drawSelectionRect(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  ctx.fillStyle = SELECTION_COLOR;
  ctx.fillRect(x, y, width, height);
  
  ctx.strokeStyle = SELECTION_BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
}