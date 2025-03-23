/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import type { Tool, TransformationType } from '../types';
import { geometryStore } from './geometryStore.svelte';
import { Point } from './shapes/Point.svelte';
import { Line } from './shapes/Line.svelte';
import { Polygon } from './shapes/Polygon.svelte';
import { Circle } from './shapes/Circle.svelte';
import { POINT_RADIUS, drawSelectionRect } from './index';

function createState() {
	// Canvas state
	let canvas: HTMLCanvasElement | undefined = $state(undefined);
	let ctx: CanvasRenderingContext2D | undefined = $state(undefined);
	let width = $state(800);
	let height = $state(600);

	// Tools state
	let selectedTool: Tool = $state('cursor');
	let currentColor = $state('#000000');
	let clippingEnabled = $state(false);
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
		tempLine: null as Line | null,
		tempCircle: null as Circle | null
	});

	// Tooltip state
	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		text: '',
		objects: 0
	});

	// Add this to your existing state variables
	let rasterizationAlgorithm: 'dda' | 'bresenham' = $state('dda'); // 'dda', 'bresenham'

	// Snap threshold in pixels
	const SNAP_THRESHOLD = 10;

	// Find a snap point near the given coordinates
	function findSnapPoint(x: number, y: number): { x: number; y: number } | null {
		if (!clippingEnabled) return null;

		// First check for snap to points/vertices
		for (const shape of geometryStore.shapes) {
			switch (shape.type) {
				case 'point': {
					const point = shape as Point;
					if (Math.abs(point.x - x) <= SNAP_THRESHOLD && Math.abs(point.y - y) <= SNAP_THRESHOLD) {
						return { x: point.x, y: point.y };
					}
					break;
				}
				case 'line': {
					const line = shape as Line;
					// Check endpoints first
					if (
						Math.abs(line.start.x - x) <= SNAP_THRESHOLD &&
						Math.abs(line.start.y - y) <= SNAP_THRESHOLD
					) {
						return { x: line.start.x, y: line.start.y };
					}
					if (
						Math.abs(line.end.x - x) <= SNAP_THRESHOLD &&
						Math.abs(line.end.y - y) <= SNAP_THRESHOLD
					) {
						return { x: line.end.x, y: line.end.y };
					}

					// Check for snap to the line segment itself
					const closestPoint = getClosestPointOnLineSegment(
						line.start.x, line.start.y,
						line.end.x, line.end.y,
						x, y
					);
					
					const distance = Math.sqrt(
						Math.pow(closestPoint.x - x, 2) + 
						Math.pow(closestPoint.y - y, 2)
					);
					
					if (distance <= SNAP_THRESHOLD) {
						return closestPoint;
					}
					break;
				}
				case 'polygon': {
					const polygon = shape as Polygon;
					
					// Check vertices first
					for (const pt of polygon.points) {
						if (Math.abs(pt.x - x) <= SNAP_THRESHOLD && Math.abs(pt.y - y) <= SNAP_THRESHOLD) {
							return { x: pt.x, y: pt.y };
						}
						break;
					}
					
					// Check edges
					if (polygon.points.length >= 2) {
						for (let i = 0; i < polygon.points.length; i++) {
							const p1 = polygon.points[i];
							const p2 = polygon.points[(i + 1) % polygon.points.length];
							
							const closestPoint = getClosestPointOnLineSegment(
								p1.x, p1.y, 
								p2.x, p2.y, 
								x, y
							);
							
							const distance = Math.sqrt(
								Math.pow(closestPoint.x - x, 2) + 
								Math.pow(closestPoint.y - y, 2)
							);
							
							if (distance <= SNAP_THRESHOLD) {
								return closestPoint;
							}
						}
					}
					break;
				}
				case 'circle': {
					const circle = shape as Circle;
					
					// Check center first
					if (
						Math.abs(circle.center.x - x) <= SNAP_THRESHOLD &&
						Math.abs(circle.center.y - y) <= SNAP_THRESHOLD
					) {
						return { x: circle.center.x, y: circle.center.y };
						break;
					}
					
					// Check if point is near the perimeter
					const dx = x - circle.center.x;
					const dy = y - circle.center.y;
					const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
					
					if (Math.abs(distanceToCenter - circle.radius) <= SNAP_THRESHOLD) {
						// Project the point onto the circle perimeter
						const angle = Math.atan2(dy, dx);
						return {
							x: circle.center.x + Math.cos(angle) * circle.radius,
							y: circle.center.y + Math.sin(angle) * circle.radius
						};
					}
					break;
				}
			}
		}

		// If clipping is enabled, check for straight line alignment
		if (temp.tempLine) {
			const startX = temp.tempLine.start.x;
			const startY = temp.tempLine.start.y;

			// Check for horizontal alignment
			if (Math.abs(y - startY) <= SNAP_THRESHOLD) {
				return { x: x, y: startY };
			}

			// Check for vertical alignment
			if (Math.abs(x - startX) <= SNAP_THRESHOLD) {
				return { x: startX, y: y };
			}

			// Check for 45-degree diagonal alignment
			const dx = Math.abs(x - startX);
			const dy = Math.abs(y - startY);
			if (Math.abs(dx - dy) <= SNAP_THRESHOLD) {
				const signX = x > startX ? 1 : -1;
				const signY = y > startY ? 1 : -1;
				return { x: startX + signX * dx, y: startY + signY * dx };
			}
		}

		return null;
	}

	// Helper function to get closest point on a line segment
	function getClosestPointOnLineSegment(
		x1: number, y1: number,  // Start of segment
		x2: number, y2: number,  // End of segment
		x: number, y: number     // Point to check
	): { x: number; y: number } {
		const A = x - x1;
		const B = y - y1;
		const C = x2 - x1;
		const D = y2 - y1;
	  
		const dot = A * C + B * D;
		const lenSq = C * C + D * D;
		let param = -1;
	  
		if (lenSq !== 0) param = dot / lenSq;
	  
		let xx, yy;
	  
		if (param < 0) {
		  xx = x1;
		  yy = y1;
		} else if (param > 1) {
		  xx = x2;
		  yy = y2;
		} else {
		  xx = x1 + param * C;
		  yy = y1 + param * D;
		}
	  
		return { x: xx, y: yy };
	  }

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

	// ===== Main Functions =====

	// Redraw the canvas
	function redraw(): void {
		if (!ctx || !canvas) return;

		// Clear the canvas
		ctx.clearRect(0, 0, width, height);

		// Draw all shapes
		geometryStore.draw(ctx);

		// Draw any temporary shapes
		if (temp.tempLine) {
			temp.tempLine.draw(ctx);
		}

		if (temp.currentPolygon) {
			temp.currentPolygon.draw(ctx);

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

		if (temp.tempCircle) {
			temp.tempCircle.draw(ctx);
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
		
		// Check for snap points when starting a shape
		const snapPoint = findSnapPoint(x, y);
		const snapX = snapPoint ? snapPoint.x : x;
		const snapY = snapPoint ? snapPoint.y : y;
		
		interaction.startX = snapX;
		interaction.startY = snapY;
		interaction.currentX = snapX;
		interaction.currentY = snapY;
		interaction.isDrawing = true;
	
		switch (selectedTool) {
			case 'point': {
				const newPoint = geometryStore.addPoint({
					x: snapX,
					y: snapY,
					color: currentColor
				});
				redraw();
				break;
			}
	
			case 'line': {
				const startPoint = new Point({ 
					x: snapX,
					y: snapY,
					color: currentColor
				});
				const endPoint = new Point({ 
					x: snapX,
					y: snapY,
					color: currentColor
				});
				temp.tempLine = new Line({
					start: { x: startPoint.x, y: startPoint.y },
					end: { x: endPoint.x, y: endPoint.y },
					color: currentColor
				});
				break;
			}
	
			case 'polygon': {
				if (!temp.currentPolygon) {
					// Start a new polygon
					temp.currentPolygon = new Polygon({
						points: [{ x: snapX, y: snapY }],
						color: currentColor
					});
				} else {
					// Add a point to the current polygon
					// Check if we're closing the polygon (clicking near the first point)
					const firstPoint = temp.currentPolygon.points[0];
					if (
						temp.currentPolygon.points.length > 2 &&
						Math.abs(snapX - firstPoint.x) < POINT_RADIUS * 2 &&
						Math.abs(snapY - firstPoint.y) < POINT_RADIUS * 2
					) {
						// Complete the polygon
						geometryStore.addPolygon({
							points: temp.currentPolygon.points.map((p) => ({ x: p.x, y: p.y })),
							color: currentColor
						});
						temp.currentPolygon = null;
					} else {
						// Add the new point
						temp.currentPolygon.addPoint({ x: snapX, y: snapY });
					}
				}
				redraw();
				break;
			}
	
			case 'circle': {
				// Start drawing a circle - set the center
				temp.tempCircle = new Circle({
					center: { x: snapX, y: snapY },
					radius: 0,
					color: currentColor
				});
				break;
			}
	
			case 'select_cursor': {
				// Find and select a shape at this position
				const shape = geometryStore.findShapeAt(snapX, snapY);
	
				// Deselect all first if not holding shift
				if (!e.shiftKey) {
					geometryStore.deselectAll();
				}
	
				// Select the found shape if any
				if (shape) {
					geometryStore.selectShape(shape);
				}
	
				redraw();
				break;
			}
	
			case 'select_box':
				// Start drawing selection box
				break;
	
			case 'move': {
				interaction.isDragging = true;
				interaction.lastX = snapX;
				interaction.lastY = snapY;
	
				// If nothing is selected, try to select something under the cursor
				if (geometryStore.selectedShapes.length === 0) {
					const shapeUnderCursor = geometryStore.findShapeAt(snapX, snapY);
					if (shapeUnderCursor) {
						geometryStore.selectShape(shapeUnderCursor);
						redraw();
					}
				}
				break;
			}
	
			case 'delete': {
				// Find a shape at click position and mark it for deletion
				const shapeToDelete = geometryStore.findShapeAt(snapX, snapY);
	
				if (shapeToDelete) {
					geometryStore.selectShape(shapeToDelete);
					geometryStore.deleteSelectedShapes();
					redraw();
				}
				break;
			}
	
			case 'cursor':
			default: {
				// Just a regular cursor click
				const clickedShape = geometryStore.findShapeAt(snapX, snapY);
	
				if (clickedShape) {
					// Start dragging if we clicked on a shape
					interaction.isDragging = true;
					interaction.lastX = snapX;
					interaction.lastY = snapY;
	
					// If the shape is not already selected, select only this shape
					if (!clickedShape.selected) {
						geometryStore.deselectAll();
						geometryStore.selectShape(clickedShape);
						redraw();
					}
				} else {
					// If we clicked on empty space, deselect all
					geometryStore.deselectAll();
					redraw();
				}
				break;
			}
		}
		updateTooltipState();
	}

	// Handle mouse move event
	function handleMouseMove(e: MouseEvent): void {
		const { x, y } = getMousePos(e);
		interaction.currentX = x;
		interaction.currentY = y;

		switch (selectedTool) {
			case 'line':
				// Update the end point of the temporary line
				if (temp.tempLine) {
					// Check for snap points when clipping is enabled
					const snapPoint = findSnapPoint(x, y);
					
					if (snapPoint) {
						temp.tempLine.end.x = snapPoint.x;
						temp.tempLine.end.y = snapPoint.y;
					} else {
						temp.tempLine.end.x = x;
						temp.tempLine.end.y = y;
					}
					redraw();
				}
				break;

			case 'circle':
				// Update the radius of the temporary circle
				if (temp.tempCircle) {
					const dx = x - temp.tempCircle.center.x;
					const dy = y - temp.tempCircle.center.y;
					temp.tempCircle.radius = Math.sqrt(dx * dx + dy * dy);
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
					geometryStore.transformSelectedShapes({
						type: 'translate',
						dx,
						dy
					});

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
		
		// Check for snap points
		const snapPoint = findSnapPoint(x, y);
		const snapX = snapPoint ? snapPoint.x : x;
		const snapY = snapPoint ? snapPoint.y : y;

		switch (selectedTool) {
			case 'line': {
				if (temp.tempLine) {
					// Finalize the line with snapped coordinates if available
					geometryStore.addLine({
						start: { x: temp.tempLine.start.x, y: temp.tempLine.start.y },
						end: { x: snapX, y: snapY },
						color: currentColor
					});
					temp.tempLine = null;
					redraw();
				}
				break;
			}

			case 'circle': {
				if (temp.tempCircle && temp.tempCircle.radius > 2) {
					// Finalize the circle if it has a reasonable radius
					geometryStore.addCircle({
						center: { x: temp.tempCircle.center.x, y: temp.tempCircle.center.y },
						radius: temp.tempCircle.radius,
						color: currentColor
					});
					temp.tempCircle = null;
					redraw();
				} else {
					// Cancel if too small
					temp.tempCircle = null;
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
					geometryStore.deselectAll();
				}

				geometryStore.selectShapesInRect(selectionRect);
				redraw();
				break;
			}
		}

		interaction.isDrawing = false;
		interaction.isDragging = false;
		updateTooltipState();
	}

	// Update the tooltip state
	function updateTooltipState(): void {
		const selectedShapes = geometryStore.selectedShapes;
		const total = selectedShapes.length;

		if (total > 0) {
			// Calculate position (center of selected objects)
			let sumX = 0,
				sumY = 0;

			selectedShapes.forEach((shape) => {
				const bbox = shape.getBoundingBox();
				sumX += (bbox.x1 + bbox.x2) / 2;
				sumY += (bbox.y1 + bbox.y2) / 2;
			});

			// Create tooltip text
			const selectedPoints = selectedShapes.filter((s) => s.type === 'point').length;
			const selectedLines = selectedShapes.filter((s) => s.type === 'line').length;
			const selectedPolygons = selectedShapes.filter((s) => s.type === 'polygon').length;

			let text = `${total} object${total > 1 ? 's' : ''} selected: `;
			if (selectedPoints > 0) text += `${selectedPoints} point${selectedPoints > 1 ? 's' : ''} `;
			if (selectedLines > 0) text += `${selectedLines} line${selectedLines > 1 ? 's' : ''} `;
			if (selectedPolygons > 0)
				text += `${selectedPolygons} polygon${selectedPolygons > 1 ? 's' : ''} `;

			// Update tooltip state
			tooltip = {
				visible: true,
				x: sumX / total,
				y: sumY / total - 30, // Position above the objects
				text,
				objects: total
			};
		} else {
			// Hide tooltip if nothing is selected
			tooltip.visible = false;
		}
	}

	// Reset state
	function resetState(): void {
		geometryStore.clear();

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
			tempLine: null,
			tempCircle: null
		};

		if (ctx && canvas) {
			ctx.clearRect(0, 0, width, height);
		}
	}

	// Transform selected shapes
	function transformSelectedShapes(transformation: TransformationType): void {
		geometryStore.transformSelectedShapes(transformation);
		redraw();
	}

	// Save current drawing to local storage
	function saveDrawing(name: string): boolean {
		const data = geometryStore.serializeShapes();
		try {
			// Get existing saved drawings
			const savedDrawings = localStorage.getItem('deds-paint-drawings') || '{}';
			const drawings = JSON.parse(savedDrawings);

			// Add this drawing with timestamp
			drawings[name] = {
				data: data,
				timestamp: new Date().toISOString()
			};

			// Save back to local storage
			localStorage.setItem('deds-paint-drawings', JSON.stringify(drawings));
			return true;
		} catch (error) {
			console.error('Failed to save drawing:', error);
			return false;
		}
	}

	// Load drawing from local storage
	function loadDrawing(name: string): boolean {
		try {
			const savedDrawings = localStorage.getItem('deds-paint-drawings') || '{}';
			const drawings = JSON.parse(savedDrawings);

			if (drawings[name]) {
				geometryStore.loadShapes(drawings[name].data);
				redraw();
				return true;
			}
			return false;
		} catch (error) {
			console.error('Failed to load drawing:', error);
			return false;
		}
	}

	// Get list of saved drawings
	function getSavedDrawings(): { name: string; timestamp: string }[] {
		try {
			const savedDrawings = localStorage.getItem('deds-paint-drawings') || '{}';
			const drawings = JSON.parse(savedDrawings);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return Object.entries(drawings).map(([name, info]: [string, any]) => ({
				name,
				timestamp: info.timestamp
			}));
		} catch (error) {
			console.error('Failed to get saved drawings:', error);
			return [];
		}
	}

	// Delete a saved drawing
	function deleteSavedDrawing(name: string): boolean {
		try {
			const savedDrawings = localStorage.getItem('deds-paint-drawings') || '{}';
			const drawings = JSON.parse(savedDrawings);

			if (drawings[name]) {
				delete drawings[name];
				localStorage.setItem('deds-paint-drawings', JSON.stringify(drawings));
				return true;
			}
			return false;
		} catch (error) {
			console.error('Failed to delete drawing:', error);
			return false;
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

		// Add these to your existing properties
		get rasterizationAlgorithm() {
			return rasterizationAlgorithm;
		},
		set rasterizationAlgorithm(value) {
			rasterizationAlgorithm = value;
			redraw();
		},

		// Other state getters
		get interaction() {
			return interaction;
		},
		get temp() {
			return temp;
		},
		get tooltip() {
			return tooltip;
		},
    get clippingEnabled() {
      return clippingEnabled;
    },
    set clippingEnabled(value) {
      clippingEnabled = value;
    },

		// Actions
		selectAll: () => {
			geometryStore.selectAll();
			updateTooltipState();
			redraw();
		},
		deselectAll: () => {
			geometryStore.deselectAll();
			updateTooltipState();
			redraw();
		},
		changeColor: (color: string) => {
			currentColor = color;
			geometryStore.setColorForSelectedShapes(color);
			redraw();
		},

		// Transform function
		transformSelectedShapes,

		// Event handlers
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,

		// Canvas drawing
		redraw,
		resetState,
		deleteSelectedShapes: () => {
			geometryStore.deleteSelectedShapes();
			updateTooltipState();
			redraw();
		},

		// Add save/load functions
		saveDrawing,
		loadDrawing,
		getSavedDrawings,
		deleteSavedDrawing
	};
}

export const appState = createState();
