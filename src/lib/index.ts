/* eslint-disable @typescript-eslint/no-unused-vars */
// place files you want to import through the `$lib` alias in this folder.
// $lib/index.ts
import type { Point, Line, Polygon, Shape, Selectable } from '../types';

// Constants
export const POINT_RADIUS = 5;
export const SELECTION_COLOR = 'rgba(0, 120, 215, 0.3)';
export const SELECTION_BORDER_COLOR = 'rgba(0, 120, 215, 0.8)';

// Helper to check if a point is within a rectangle
export function isPointInRect(
	point: { x: number; y: number },
	rect: { x1: number; y1: number; x2: number; y2: number }
): boolean {
	const minX = Math.min(rect.x1, rect.x2);
	const maxX = Math.max(rect.x1, rect.x2);
	const minY = Math.min(rect.y1, rect.y2);
	const maxY = Math.max(rect.y1, rect.y2);

	return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

// Helper to check if a point is near another point (within a certain radius)
export function isPointNearPoint(
	p1: { x: number; y: number },
	p2: { x: number; y: number },
	radius = POINT_RADIUS
): boolean {
	const dx = p1.x - p2.x;
	const dy = p1.y - p2.y;
	return dx * dx + dy * dy <= radius * radius;
}

// Helper to check if a point is near a line
export function isPointNearLine(
	point: { x: number; y: number },
	line: Line,
	threshold = 5
): boolean {
	const { start, end } = line;

	// Calculate distance from point to line segment
	const A = point.x - start.x;
	const B = point.y - start.y;
	const C = end.x - start.x;
	const D = end.y - start.y;

	const dot = A * C + B * D;
	const lenSq = C * C + D * D;
	let param = -1;

	if (lenSq !== 0) param = dot / lenSq;

	let xx, yy;

	if (param < 0) {
		xx = start.x;
		yy = start.y;
	} else if (param > 1) {
		xx = end.x;
		yy = end.y;
	} else {
		xx = start.x + param * C;
		yy = start.y + param * D;
	}

	const dx = point.x - xx;
	const dy = point.y - yy;

	return Math.sqrt(dx * dx + dy * dy) < threshold;
}

// Helper to check if a point is inside a polygon
export function isPointInPolygon(point: { x: number; y: number }, polygon: Polygon): boolean {
	const { points } = polygon;
	if (points.length < 3) return false;

	let inside = false;
	for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
		const xi = points[i].x;
		const yi = points[i].y;
		const xj = points[j].x;
		const yj = points[j].y;

		const intersect =
			yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

		if (intersect) inside = !inside;
	}

	return inside;
}

// Find a shape at the given coordinates
export function findShapeAtCoordinates(
	x: number,
	y: number,
	points: Point[],
	lines: Line[],
	polygons: Polygon[]
): Shape | null {
	// Check points first (they're smaller)
	for (const point of points) {
		if (isPointNearPoint({ x, y }, point)) {
			return point;
		}
	}

	// Then check polygons (they can contain points)
	for (const polygon of polygons) {
		if (isPointInPolygon({ x, y }, polygon)) {
			return polygon;
		}
	}

	// Finally check lines
	for (const line of lines) {
		if (isPointNearLine({ x, y }, line)) {
			return line;
		}
	}

	return null;
}

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

// Selection utils
export function selectShapesInRect(
	rect: { x1: number; y1: number; x2: number; y2: number },
	points: Point[],
	lines: Line[],
	polygons: Polygon[]
): void {
	// Select points
	points.forEach((point) => {
		point.selected = isPointInRect(point, rect);
	});

	// Select lines if both endpoints are in the rectangle
	lines.forEach((line) => {
		line.selected = isPointInRect(line.start, rect) && isPointInRect(line.end, rect);
	});

	// Select polygons if all vertices are in the rectangle
	polygons.forEach((polygon) => {
		polygon.selected = polygon.points.every((point) => isPointInRect(point, rect));
	});
}

// Toggle select all
export function toggleSelectAll(
	select: boolean,
	points: Point[],
	lines: Line[],
	polygons: Polygon[]
): void {
	points.forEach((point) => {
		point.selected = select;
	});
	lines.forEach((line) => {
		line.selected = select;
	});
	polygons.forEach((polygon) => {
		polygon.selected = select;
	});
}

// Move selected shapes
export function moveSelectedShapes(
	dx: number,
	dy: number,
	points: Point[],
	lines: Line[],
	polygons: Polygon[]
): void {
	// Move selected standalone points
	points.forEach((point) => {
		if (point.selected) {
			point.x += dx;
			point.y += dy;
		}
	});

	// Move selected lines
	lines.forEach((line) => {
		if (line.selected) {
			line.start.x += dx;
			line.start.y += dy;
			line.end.x += dx;
			line.end.y += dy;
		}
	});

	// Move selected polygons
	polygons.forEach((polygon) => {
		if (polygon.selected) {
			polygon.points.forEach((point) => {
				point.x += dx;
				point.y += dy;
			});
		}
	});
}

// Delete selected shapes
export function deleteSelectedShapes(
	points: Point[],
	lines: Line[],
	polygons: Polygon[]
): { points: Point[]; lines: Line[]; polygons: Polygon[] } {
	const newPoints = points.filter((point) => !point.selected);
	const newLines = lines.filter((line) => !line.selected);
	const newPolygons = polygons.filter((polygon) => !polygon.selected);

	return { points: newPoints, lines: newLines, polygons: newPolygons };
}

// Color selected shapes
export function colorSelectedShapes(
	color: string,
	points: Point[],
	lines: Line[],
	polygons: Polygon[]
): void {
	points.forEach((point) => {
		if (point.selected) {
			point.color = color;
		}
	});

	lines.forEach((line) => {
		if (line.selected) {
			line.color = color;
		}
	});

	polygons.forEach((polygon) => {
		if (polygon.selected) {
			polygon.color = color;
		}
	});
}
