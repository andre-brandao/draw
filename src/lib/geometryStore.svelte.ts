import { Point } from './shapes/Point.svelte';
import { Line } from './shapes/Line.svelte';
import { Polygon } from './shapes/Polygon.svelte';
import { Circle } from './shapes/Circle.svelte';
import type {
	Shape,
	PointData,
	LineData,
	PolygonData,
	CircleData,
	TransformationType
} from '../types';
import { POINT_RADIUS } from './index';

export class GeometryStore {
	shapes = $state<Shape[]>([]);
	selectedShapes = $state<Shape[]>([]);

	// Add shapes
	addPoint(data: PointData): Point {
		const point = new Point(data);
		this.shapes = [...this.shapes, point];
		return point;
	}

	addLine(data: LineData): Line {
		const line = new Line(data);
		this.shapes = [...this.shapes, line];
		return line;
	}

	addPolygon(data: PolygonData): Polygon {
		const polygon = new Polygon(data);
		this.shapes = [...this.shapes, polygon];
		return polygon;
	}

	addCircle(data: CircleData): Circle {
		const circle = new Circle(data);
		this.shapes = [...this.shapes, circle];
		return circle;
	}

	// Selection methods
	selectShape(shape: Shape): void {
		shape.select();
		this.updateSelectedShapes();
	}

	deselectShape(shape: Shape): void {
		shape.deselect();
		this.updateSelectedShapes();
	}

	selectAll(): void {
		this.shapes.forEach((shape) => shape.select());
		this.updateSelectedShapes();
	}

	deselectAll(): void {
		this.shapes.forEach((shape) => shape.deselect());
		this.updateSelectedShapes();
	}

	toggleSelect(shape: Shape): void {
		shape.toggleSelect();
		this.updateSelectedShapes();
	}

	updateSelectedShapes(): void {
		this.selectedShapes = this.shapes.filter((shape) => shape.selected);
	}

	// Select shapes in a rectangle
	selectShapesInRect(rect: { x1: number; y1: number; x2: number; y2: number }): void {
		const minX = Math.min(rect.x1, rect.x2);
		const maxX = Math.max(rect.x1, rect.x2);
		const minY = Math.min(rect.y1, rect.y2);
		const maxY = Math.max(rect.y1, rect.y2);

		this.shapes.forEach((shape) => {
			const bbox = shape.getBoundingBox();
			if (bbox.x1 >= minX && bbox.x2 <= maxX && bbox.y1 >= minY && bbox.y2 <= maxY) {
				shape.select();
			}
		});

		this.updateSelectedShapes();
	}

	// Find shape at coordinates
	findShapeAt(x: number, y: number, threshold = POINT_RADIUS): Shape | null {
		// Check in reverse order (last drawn is on top)
		for (let i = this.shapes.length - 1; i >= 0; i--) {
			if (this.shapes[i].contains(x, y, threshold)) {
				return this.shapes[i];
			}
		}
		return null;
	}

	// Transform methods
	transformSelectedShapes(transformation: TransformationType): void {
		this.selectedShapes.forEach((shape) => {
			switch (transformation.type) {
				case 'translate':
					shape.translate(transformation.dx, transformation.dy);
					break;
				case 'rotate':
					shape.rotate(transformation.angle, {
						x: transformation.originX,
						y: transformation.originY
					});
					break;
				case 'scale':
					shape.scale(transformation.scaleX, transformation.scaleY, {
						x: transformation.originX,
						y: transformation.originY
					});
					break;
				case 'reflect':
					shape.reflect(transformation.axis, {
						x: transformation.originX,
						y: transformation.originY
					});
					break;
			}
		});
	}

	// Delete selected shapes
	deleteSelectedShapes(): void {
		this.shapes = this.shapes.filter((shape) => !shape.selected);
		this.selectedShapes = [];
	}

	// Set color for selected shapes
	setColorForSelectedShapes(color: string): void {
		this.selectedShapes.forEach((shape) => shape.setColor(color));
	}

	// Draw all shapes
	draw(ctx: CanvasRenderingContext2D): void {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		this.shapes.forEach((s) => s.draw(ctx));
	}

	// Clear all shapes
	clear(): void {
		this.shapes = [];
		this.selectedShapes = [];
	}

	// Serialize all shapes to JSON
	serializeShapes(): string {
		const shapesData = this.shapes.map((shape) => {
			switch (shape.type) {
				case 'point':
					return { type: 'point', data: (shape as Point).serialize() };
				case 'line':
					return { type: 'line', data: (shape as Line).serialize() };
				case 'polygon':
					return { type: 'polygon', data: (shape as Polygon).serialize() };
				case 'circle':
					return { type: 'circle', data: (shape as Circle).serialize() };
			}
		});
		return JSON.stringify(shapesData);
	}

	// Load shapes from JSON
	loadShapes(json: string): void {
		try {
			const shapesData = JSON.parse(json);
			this.clear(); // Clear current shapes first

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			shapesData.forEach((item: any) => {
				switch (item.type) {
					case 'point':
						this.addPoint(item.data);
						break;
					case 'line':
						this.addLine(item.data);
						break;
					case 'polygon':
						this.addPolygon(item.data);
						break;
					case 'circle':
						this.addCircle(item.data);
						break;
				}
			});
		} catch (error) {
			console.error('Failed to load shapes:', error);
		}
	}
}

// Export singleton instance
export const geometryStore = new GeometryStore();
