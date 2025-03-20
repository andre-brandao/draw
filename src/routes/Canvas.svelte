<script lang="ts">
	import { onMount } from 'svelte';
	import type { Tool, Point, Line, Polygon } from '../types';
	import {
		drawPoint,
		drawLine,
		drawPolygon,
		drawSelectionRect,
		findShapeAtCoordinates,
		selectShapesInRect,
		toggleSelectAll,
		moveSelectedShapes,
		deleteSelectedShapes,
		colorSelectedShapes,
		POINT_RADIUS
	} from '$lib';

	// Canvas props using Svelte 5 syntax
	let {
		width = $bindable<number>(600),
		height = $bindable<number>(600),
		selectedTool = $bindable<Tool>('cursor'),
		currentColor = $bindable<string>('#000000')
	} = $props<{
		width?: number;
		height?: number;
		selectedTool?: Tool;
		currentColor?: string;
	}>();

	// Canvas element
	let canvas: HTMLCanvasElement | undefined = $state();
	let ctx: CanvasRenderingContext2D | undefined = $state();

	// Shapes data
	let points: Point[] = $state([]);
	let lines: Line[] = $state([]);
	let polygons: Polygon[] = $state([]);

	// Interaction state
	let isDrawing = $state(false);
	let isDragging = $state(false);
	let startX = $state(0);
	let startY = $state(0);
	let currentX = $state(0);
	let currentY = $state(0);
	let lastX = $state(0);
	let lastY = $state(0);

	// Temporary drawing state
	let currentPolygon: Polygon | null = $state(null);
	let tempLine: Line | null = $state(null);

	// Initialize canvas on mount
	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d') || undefined;
			redraw();
		}
	});

	// Public methods
	export function selectAll() {
		toggleSelectAll(true, points, lines, polygons);
		redraw();
	}

	export function deselectAll() {
		toggleSelectAll(false, points, lines, polygons);
		redraw();
	}

	export function changeColor(color: string) {
		colorSelectedShapes(color, points, lines, polygons);
		redraw();
	}

	// Get mouse position relative to canvas
	function getMousePos(e: MouseEvent) {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}

	// Handle mouse down event
	function handleMouseDown(e: MouseEvent) {
		const { x, y } = getMousePos(e);
		startX = x;
		startY = y;
		currentX = x;
		currentY = y;
		isDrawing = true;

		switch (selectedTool) {
			case 'point':
				const newPoint: Point = {
					x,
					y,
					color: currentColor,
					selected: false
				};
				points = [...points, newPoint];
				redraw();
				break;

			case 'line':
				const startPoint: Point = {
					x,
					y,
					color: currentColor,
					selected: false
				};
				const endPoint: Point = { ...startPoint };
				tempLine = {
					start: startPoint,
					end: endPoint,
					color: currentColor,
					selected: false
				};
				break;

			case 'polygon':
				if (!currentPolygon) {
					// Start a new polygon
					const firstPoint: Point = {
						x,
						y,
						color: currentColor,
						selected: false
					};
					currentPolygon = {
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
					const firstPoint = currentPolygon.points[0];
					if (
						currentPolygon.points.length > 2 &&
						Math.abs(x - firstPoint.x) < POINT_RADIUS * 2 &&
						Math.abs(y - firstPoint.y) < POINT_RADIUS * 2
					) {
						// Complete the polygon
						polygons = [...polygons, currentPolygon];
						currentPolygon = null;
					} else {
						// Add the new point
						currentPolygon.points = [...currentPolygon.points, newVertex];
					}
				}
				redraw();
				break;

			case 'select_cursor':
				// Find and select a shape at this position
				const shape = findShapeAtCoordinates(x, y, points, lines, polygons);

				// Deselect all first
				toggleSelectAll(false, points, lines, polygons);

				// Select the found shape if any
				if (shape) {
					shape.selected = true;
				}

				redraw();
				break;

			case 'select_box':
				// Selection box will be drawn during mouse move
				// Actual selection happens on mouse up
				break;

			case 'move':
				// Start moving selected shapes
				isDragging = true;
				lastX = x;
				lastY = y;

				// If nothing is selected, try to select something under the cursor
				let anySelected = [...points, ...lines, ...polygons].some((item) => item.selected);
				if (!anySelected) {
					const shapeUnderCursor = findShapeAtCoordinates(x, y, points, lines, polygons);
					if (shapeUnderCursor) {
						shapeUnderCursor.selected = true;
						redraw();
					}
				}
				break;

			case 'delete':
				// Find a shape at click position and mark it for deletion
				const shapeToDelete = findShapeAtCoordinates(x, y, points, lines, polygons);

				if (shapeToDelete) {
					shapeToDelete.selected = true;
					const {
						points: newPoints,
						lines: newLines,
						polygons: newPolygons
					} = deleteSelectedShapes(points, lines, polygons);

					points = newPoints;
					lines = newLines;
					polygons = newPolygons;
					redraw();
				}
				break;

			case 'cursor':
			default:
				// Just a regular cursor click
				const clickedShape = findShapeAtCoordinates(x, y, points, lines, polygons);

				if (clickedShape) {
					// Start dragging if we clicked on a shape
					isDragging = true;
					lastX = x;
					lastY = y;

					// If the shape is not already selected, select only this shape
					if (!clickedShape.selected) {
						toggleSelectAll(false, points, lines, polygons);
						clickedShape.selected = true;
						redraw();
					}
				} else {
					// If we clicked on empty space, deselect all
					toggleSelectAll(false, points, lines, polygons);
					redraw();
				}
				break;
		}
	}

	// Handle mouse move event
	function handleMouseMove(e: MouseEvent) {
		if (!isDrawing && !isDragging) return;

		const { x, y } = getMousePos(e);
		currentX = x;
		currentY = y;

		switch (selectedTool) {
			case 'line':
				// Update the end point of the temporary line
				if (tempLine) {
					tempLine.end.x = x;
					tempLine.end.y = y;
					redraw();
				}
				break;

			case 'select_box':
				// We're drawing a selection box
				redraw();
				break;

			case 'move':
			case 'cursor':
				if (isDragging) {
					// Calculate the movement delta
					const dx = x - lastX;
					const dy = y - lastY;

					// Move all selected shapes
					moveSelectedShapes(dx, dy, points, lines, polygons);

					// Update last position
					lastX = x;
					lastY = y;

					redraw();
				}
				break;
		}
	}

	// Handle mouse up event
	function handleMouseUp(e: MouseEvent) {
		const { x, y } = getMousePos(e);

		switch (selectedTool) {
			case 'line':
				if (tempLine) {
					// Finalize the line
					lines = [...lines, tempLine];
					tempLine = null;
					redraw();
				}
				break;

			case 'select_box':
				// Select all shapes within the selection box
				const selectionRect = {
					x1: startX,
					y1: startY,
					x2: x,
					y2: y
				};

				// Only clear selection if not holding shift
				if (!e.shiftKey) {
					toggleSelectAll(false, points, lines, polygons);
				}

				selectShapesInRect(selectionRect, points, lines, polygons);
				redraw();
				break;
		}

		isDrawing = false;
		isDragging = false;
	}

	// Handle click (for point-specific actions)
	function handleClick(e: MouseEvent) {
		// Most actions are handled in mouseDown/mouseUp
	}

	// Redraw the canvas
	function redraw() {
		if (!ctx || !canvas) return;

		// Clear the canvas
		ctx.clearRect(0, 0, width, height);

		// Draw all the shapes
		polygons.forEach((polygon) => drawPolygon(ctx, polygon));
		lines.forEach((line) => drawLine(ctx, line));
		points.forEach((point) => drawPoint(ctx, point));

		// Draw any temporary shapes
		if (tempLine) {
			drawLine(ctx, tempLine);
		}

		if (currentPolygon) {
			drawPolygon(ctx, currentPolygon);

			// If we're actively drawing, show a line from the last point to the cursor
			if (currentPolygon.points.length > 0) {
				const lastPoint = currentPolygon.points[currentPolygon.points.length - 1];
				ctx.beginPath();
				ctx.moveTo(lastPoint.x, lastPoint.y);
				ctx.lineTo(currentX, currentY);
				ctx.strokeStyle = currentPolygon.color;
				ctx.setLineDash([4, 4]);
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}

		// Draw the selection box if active
		if (isDrawing && selectedTool === 'select_box') {
			drawSelectionRect(ctx, startX, startY, currentX, currentY);
		}
	}
</script>

<canvas
	bind:this={canvas}
	{width}
	{height}
	on:mousedown={handleMouseDown}
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
	on:click={handleClick}
></canvas>

<style>
	canvas {
		border: 1px solid #ccc;
		background-color: white;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
</style>
