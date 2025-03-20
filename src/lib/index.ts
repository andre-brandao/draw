// $lib/index.ts
import type { Point, Line, Polygon } from '../types';

// Constants
export const POINT_RADIUS = 5;
export const SELECTION_COLOR = 'rgba(0, 120, 215, 0.3)';
export const SELECTION_BORDER_COLOR = 'rgba(0, 120, 215, 0.8)';

// Drawing functions
export function drawPoint(ctx: CanvasRenderingContext2D | undefined, point: Point) {
	if (!ctx) return;
	ctx.beginPath();
	ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
	ctx.fillStyle = point.color;
	ctx.fill();

	if (point.selected) {
		ctx.strokeStyle = SELECTION_BORDER_COLOR;
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

export function drawLine(ctx: CanvasRenderingContext2D | undefined, line: Line) {
	if (!ctx) return;
	ctx.beginPath();
	ctx.moveTo(line.start.x, line.start.y);
	ctx.lineTo(line.end.x, line.end.y);
	ctx.strokeStyle = line.color;
	ctx.lineWidth = 2;
	ctx.stroke();

	if (line.selected) {
		ctx.strokeStyle = SELECTION_BORDER_COLOR;
		ctx.lineWidth = 3;
		ctx.stroke();
	}

	// Draw endpoints
	drawPoint(ctx, line.start);
	drawPoint(ctx, line.end);
}

export function drawPolygon(ctx: CanvasRenderingContext2D | undefined, polygon: Polygon) {
	if (!ctx) return;
	if (polygon.points.length < 2) return;

	ctx.beginPath();
	ctx.moveTo(polygon.points[0].x, polygon.points[0].y);

	for (let i = 1; i < polygon.points.length; i++) {
		ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
	}

	if (polygon.points.length > 2) {
		ctx.closePath();
		ctx.fillStyle = polygon.color;
		ctx.fill();
	}

	if (polygon.selected) {
		ctx.strokeStyle = SELECTION_BORDER_COLOR;
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	// Draw vertices
	polygon.points.forEach((point) => drawPoint(ctx, point));
}

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
