/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import type { Tool, Point, Line, Polygon, Shape } from '../types';
import {
	drawPoint,
	drawLine,
	drawPolygon,
	drawSelectionRect,
	POINT_RADIUS,
	SELECTION_COLOR,
	SELECTION_BORDER_COLOR
} from './index';

function createState() {
	// Canvas state
	let canvas: HTMLCanvasElement | undefined = $state(undefined);
	let ctx: CanvasRenderingContext2D | undefined = $state(undefined);
	let width = $state(800);
	let height = $state(600);

	// Tools state
	let selectedTool: Tool = $state('cursor');
	let currentColor = $state('#000000');

	// Geometry state
	let geometry = $state({
		points: [] as Point[],
		lines: [] as Line[],
		polygons: [] as Polygon[]
	});

	// Interaction state
	let interaction = $state({
		isDrawing: false,
		isDragging: false,
		startX: 0,
		startY: 0,
		currentX: 0,
		currentY: 0,
		lastX: 0,
		lastY: 0
	});

	// Temporary drawing state
	let temp = $state({
		currentPolygon: null as Polygon | null,
		tempLine: null as Line | null
	});

	// ===== Helper Functions =====

	// Get mouse position relative to canvas
	function getMousePos(e: MouseEvent) {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}

	// Check if a point is near another point (within a certain radius)
	function isPointNearPoint(
		p1: { x: number; y: number },
		p2: { x: number; y: number },
		radius = POINT_RADIUS
	): boolean {
		const dx = p1.x - p2.x;
		const dy = p1.y - p2.y;
		return dx * dx + dy * dy <= radius * radius;
	}

	// Check if a point is near a line
	function isPointNearLine(point: { x: number; y: number }, line: Line, threshold = 5): boolean {
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

	// Check if a point is inside a polygon
	function isPointInPolygon(point: { x: number; y: number }, polygon: Polygon): boolean {
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

	// Check if a point is within a rectangle
	function isPointInRect(
		point: { x: number; y: number },
		rect: { x1: number; y1: number; x2: number; y2: number }
	): boolean {
		const minX = Math.min(rect.x1, rect.x2);
		const maxX = Math.max(rect.x1, rect.x2);
		const minY = Math.min(rect.y1, rect.y2);
		const maxY = Math.max(rect.y1, rect.y2);

		return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
	}

	// ===== Main Functions =====

	// Find shape at coordinates
	function findShapeAtCoordinates(x: number, y: number): Shape | null {
		// Check points first (they're smaller)
		for (const point of geometry.points) {
			if (isPointNearPoint({ x, y }, point)) {
				return point;
			}
		}

		// Then check polygons (they can contain points)
		for (const polygon of geometry.polygons) {
			if (isPointInPolygon({ x, y }, polygon)) {
				return polygon;
			}
		}

		// Finally check lines
		for (const line of geometry.lines) {
			if (isPointNearLine({ x, y }, line)) {
				return line;
			}
		}

		return null;
	}

	// Select all shapes in rectangle
	function selectShapesInRect(rect: { x1: number; y1: number; x2: number; y2: number }): void {
		// Select points
		geometry.points.forEach((point) => {
			point.selected = isPointInRect(point, rect);
		});

		// Select lines if both endpoints are in the rectangle
		geometry.lines.forEach((line) => {
			line.selected = isPointInRect(line.start, rect) && isPointInRect(line.end, rect);
		});

		// Select polygons if all vertices are in the rectangle
		geometry.polygons.forEach((polygon) => {
			polygon.selected = polygon.points.every((point) => isPointInRect(point, rect));
		});
	}

	// Toggle select all shapes
	function toggleSelectAll(select: boolean): void {
		geometry.points.forEach((point) => {
			point.selected = select;
		});
		geometry.lines.forEach((line) => {
			line.selected = select;
		});
		geometry.polygons.forEach((polygon) => {
			polygon.selected = select;
		});
	}

	// Move selected shapes
	function moveSelectedShapes(dx: number, dy: number): void {
		// Move selected standalone points
		geometry.points.forEach((point) => {
			if (point.selected) {
				point.x += dx;
				point.y += dy;
			}
		});

		// Move selected lines
		geometry.lines.forEach((line) => {
			if (line.selected) {
				line.start.x += dx;
				line.start.y += dy;
				line.end.x += dx;
				line.end.y += dy;
			}
		});

		// Move selected polygons
		geometry.polygons.forEach((polygon) => {
			if (polygon.selected) {
				polygon.points.forEach((point) => {
					point.x += dx;
					point.y += dy;
				});
			}
		});
	}

	// Delete selected shapes
	function deleteSelectedShapes(): void {
		geometry.points = geometry.points.filter((point) => !point.selected);
		geometry.lines = geometry.lines.filter((line) => !line.selected);
		geometry.polygons = geometry.polygons.filter((polygon) => !polygon.selected);
	}

	// Color selected shapes
	function colorSelectedShapes(color: string): void {
		geometry.points.forEach((point) => {
			if (point.selected) {
				point.color = color;
			}
		});

		geometry.lines.forEach((line) => {
			if (line.selected) {
				line.color = color;
			}
		});

		geometry.polygons.forEach((polygon) => {
			if (polygon.selected) {
				polygon.color = color;
			}
		});
	}

	// Redraw the canvas
	function redraw(): void {
		if (!ctx || !canvas) return;

		// Clear the canvas
		ctx.clearRect(0, 0, width, height);

		// Draw all the shapes
		geometry.polygons.forEach((polygon) => drawPolygon(ctx, polygon));
		geometry.lines.forEach((line) => drawLine(ctx, line));
		geometry.points.forEach((point) => drawPoint(ctx, point));

		// Draw any temporary shapes
		if (temp.tempLine) {
			drawLine(ctx, temp.tempLine);
		}

		if (temp.currentPolygon) {
			drawPolygon(ctx, temp.currentPolygon);

			// If we're actively drawing, show a line from the last point to the cursor
			if (temp.currentPolygon.points.length > 0) {
				const lastPoint = temp.currentPolygon.points[temp.currentPolygon.points.length - 1];
				ctx.beginPath();
				ctx.moveTo(lastPoint.x, lastPoint.y);
				ctx.lineTo(interaction.currentX, interaction.currentY);
				ctx.strokeStyle = temp.currentPolygon.color;
				ctx.setLineDash([4, 4]);
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}

		// Draw the selection box if active
		if (interaction.isDrawing && selectedTool === 'select_box') {
			drawSelectionRect(
				ctx,
				interaction.startX,
				interaction.startY,
				interaction.currentX,
				interaction.currentY
			);
		}
	}

	// Handle mouse down event
	function handleMouseDown(e: MouseEvent): void {
		const { x, y } = getMousePos(e);
		interaction.startX = x;
		interaction.startY = y;
		interaction.currentX = x;
		interaction.currentY = y;
		interaction.isDrawing = true;

		switch (selectedTool) {
			case 'point': {
				const newPoint = <Point>{
					x,
					y,
					color: currentColor,
					selected: false
				};
				geometry.points = [...geometry.points, newPoint];
				redraw();
				break;
			}

			case 'line': {
				const startPoint: Point = {
					x,
					y,
					color: currentColor,
					selected: false
				};
				const endPoint: Point = { ...startPoint };
				temp.tempLine = {
					start: startPoint,
					end: endPoint,
					color: currentColor,
					selected: false
				};
				break;
			}

			case 'polygon': {
				if (!temp.currentPolygon) {
					// Start a new polygon
					const firstPoint: Point = {
						x,
						y,
						color: currentColor,
						selected: false
					};
					temp.currentPolygon = {
						points: [firstPoint],
						color: currentColor,
						selected: false
					};
				} else {
					// Add a point to the current polygon
					const newVertex: Point = {
						x,
						y,
						color: currentColor,
						selected: false
					};

					// Check if we're closing the polygon (clicking near the first point)
					const firstPoint = temp.currentPolygon.points[0];
					if (
						temp.currentPolygon.points.length > 2 &&
						Math.abs(x - firstPoint.x) < POINT_RADIUS * 2 &&
						Math.abs(y - firstPoint.y) < POINT_RADIUS * 2
					) {
						// Complete the polygon
						geometry.polygons = [...geometry.polygons, temp.currentPolygon];
						temp.currentPolygon = null;
					} else {
						// Add the new point
						temp.currentPolygon.points = [...temp.currentPolygon.points, newVertex];
					}
				}
				redraw();
				break;
			}

			case 'select_cursor': {
				// Find and select a shape at this position
				const shape = findShapeAtCoordinates(x, y);

				// Deselect all first
				toggleSelectAll(false);

				// Select the found shape if any
				if (shape) {
					shape.selected = true;
				}

				redraw();
				break;
			}

			case 'select_box':
				// Selection box will be drawn during mouse move
				// Actual selection happens on mouse up
				break;

			case 'move': {
				// Start moving selected shapes
				interaction.isDragging = true;
				interaction.lastX = x;
				interaction.lastY = y;

				// If nothing is selected, try to select something under the cursor
				let anySelected = [...geometry.points, ...geometry.lines, ...geometry.polygons].some(
					(item) => item.selected
				);

				if (!anySelected) {
					const shapeUnderCursor = findShapeAtCoordinates(x, y);
					if (shapeUnderCursor) {
						shapeUnderCursor.selected = true;
						redraw();
					}
				}
				break;
			}

			case 'delete': {
				// Find a shape at click position and mark it for deletion
				const shapeToDelete = findShapeAtCoordinates(x, y);

				if (shapeToDelete) {
					shapeToDelete.selected = true;
					deleteSelectedShapes();
					redraw();
				}
				break;
			}

			case 'cursor':
			default: {
				// Just a regular cursor click
				const clickedShape = findShapeAtCoordinates(x, y);

				if (clickedShape) {
					// Start dragging if we clicked on a shape
					interaction.isDragging = true;
					interaction.lastX = x;
					interaction.lastY = y;

					// If the shape is not already selected, select only this shape
					if (!clickedShape.selected) {
						toggleSelectAll(false);
						clickedShape.selected = true;
						redraw();
					}
				} else {
					// If we clicked on empty space, deselect all
					toggleSelectAll(false);
					redraw();
				}
				break;
			}
		}
	}

	// Handle mouse move event
	function handleMouseMove(e: MouseEvent): void {
		if (!interaction.isDrawing && !interaction.isDragging) return;

		const { x, y } = getMousePos(e);
		interaction.currentX = x;
		interaction.currentY = y;

		switch (selectedTool) {
			case 'line':
				// Update the end point of the temporary line
				if (temp.tempLine) {
					temp.tempLine.end.x = x;
					temp.tempLine.end.y = y;
					redraw();
				}
				break;

			case 'select_box':
				// We're drawing a selection box
				redraw();
				break;

			case 'move':
			case 'cursor':
				if (interaction.isDragging) {
					// Calculate the movement delta
					const dx = x - interaction.lastX;
					const dy = y - interaction.lastY;

					// Move all selected shapes
					moveSelectedShapes(dx, dy);

					// Update last position
					interaction.lastX = x;
					interaction.lastY = y;

					redraw();
				}
				break;
		}
	}

	// Handle mouse up event
	function handleMouseUp(e: MouseEvent): void {
		const { x, y } = getMousePos(e);

		switch (selectedTool) {
			case 'line': {
				if (temp.tempLine) {
					// Finalize the line
					geometry.lines = [...geometry.lines, temp.tempLine];
					temp.tempLine = null;
					redraw();
				}
				break;
			}

			case 'select_box': {
				// Select all shapes within the selection box
				const selectionRect = {
					x1: interaction.startX,
					y1: interaction.startY,
					x2: x,
					y2: y
				};

				// Only clear selection if not holding shift
				if (!e.shiftKey) {
					toggleSelectAll(false);
				}

				selectShapesInRect(selectionRect);
				redraw();
				break;
			}
		}

		interaction.isDrawing = false;
		interaction.isDragging = false;
	}

	// Reset state
	function resetState(): void {
		geometry = {
			points: [],
			lines: [],
			polygons: []
		};

		interaction = {
			isDrawing: false,
			isDragging: false,
			startX: 0,
			startY: 0,
			currentX: 0,
			currentY: 0,
			lastX: 0,
			lastY: 0
		};

		temp = {
			currentPolygon: null,
			tempLine: null
		};

		if (ctx && canvas) {
			ctx.clearRect(0, 0, width, height);
		}
	}

	return {
		// Canvas properties
		get canvas() {
			return canvas;
		},
		set canvas(value) {
			canvas = value;
			ctx = canvas?.getContext('2d') ?? undefined;
			redraw();
		},
		get ctx() {
			return ctx;
		},
		get width() {
			return width;
		},
		set width(value) {
			width = value;
			redraw();
		},
		get height() {
			return height;
		},
		set height(value) {
			height = value;
			redraw();
		},

		// Tool properties
		get selectedTool() {
			return selectedTool;
		},
		set selectedTool(value) {
			selectedTool = value;
		},
		get currentColor() {
			return currentColor;
		},
		set currentColor(value) {
			currentColor = value;
		},

		// State getters
		get geometry() {
			return geometry;
		},
		get interaction() {
			return interaction;
		},
		get temp() {
			return temp;
		},

		// Actions
		selectAll: () => toggleSelectAll(true),
		deselectAll: () => toggleSelectAll(false),
		changeColor: (color: string) => {
			currentColor = color;
			colorSelectedShapes(color);
			redraw();
		},

		// Event handlers
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,

		// Canvas drawing
		redraw,
		resetState
	};
}

export const appState = createState();
