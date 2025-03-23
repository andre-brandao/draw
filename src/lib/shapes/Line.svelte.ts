/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Shape, LineData } from '../../types';
import { SELECTION_BORDER_COLOR } from '../index';
import { Point } from './Point.svelte';
import { ddaLine, bresenhamLine } from '../rasterization';
import { appState } from '$lib/global.svelte';

const algo: 'DDA' | 'Bresenham' = 'Bresenham';

export class Line implements Shape {
	type = 'line' as const;
	start = $state<Point>(new Point({ x: 0, y: 0 }));
	end = $state<Point>(new Point({ x: 0, y: 0 }));
	color = $state('#000000');
	selected = $state(false);

	constructor(data: LineData) {
		this.start = new Point({
			x: data.start.x,
			y: data.start.y,
			color: data.color || '#000000'
		});

		this.end = new Point({
			x: data.end.x,
			y: data.end.y,
			color: data.color || '#000000'
		});

		this.color = data.color || '#000000';
		this.selected = data.selected || false;
	}

	// Shape methods
	clone(): Shape {
		return new Line({
			start: {
				x: this.start.x,
				y: this.start.y,
				color: this.start.color
			},
			end: {
				x: this.end.x,
				y: this.end.y,
				color: this.end.color
			},
			color: this.color,
			selected: this.selected
		});
	}

	contains(x: number, y: number, threshold = 5): boolean {
		const { start, end } = this;

		// Calculate distance from point to line segment
		const A = x - start.x;
		const B = y - start.y;
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

		const dx = x - xx;
		const dy = y - yy;

		return Math.sqrt(dx * dx + dy * dy) < threshold;
	}

	getBoundingBox() {
		return {
			x1: Math.min(this.start.x, this.end.x),
			y1: Math.min(this.start.y, this.end.y),
			x2: Math.max(this.start.x, this.end.x),
			y2: Math.max(this.start.y, this.end.y)
		};
	}

	// Selectable methods
	toggleSelect(): void {
		this.selected = !this.selected;
	}

	select(): void {
		this.selected = true;
	}

	deselect(): void {
		this.selected = false;
	}

	// Colorable methods
	setColor(color: string): void {
		this.color = color;
		this.start.setColor(color);
		this.end.setColor(color);
	}

	// Transformable methods
	translate(dx: number, dy: number): void {
		this.start.translate(dx, dy);
		this.end.translate(dx, dy);
	}

	rotate(angle: number, origin: { x: number; y: number }): void {
		this.start.rotate(angle, origin);
		this.end.rotate(angle, origin);
	}

	scale(scaleX: number, scaleY: number, origin: { x: number; y: number }): void {
		this.start.scale(scaleX, scaleY, origin);
		this.end.scale(scaleX, scaleY, origin);
	}

	reflect(axis: 'x' | 'y' | 'xy', origin: { x: number; y: number }): void {
		this.start.reflect(axis, origin);
		this.end.reflect(axis, origin);
	}

	// Drawable method
	draw(ctx: CanvasRenderingContext2D): void {
		if (appState.rasterizationAlgorithm === 'dda') {
			const plotDDA = (x: number, y: number) => {
				ctx.fillStyle = this.color;
				ctx.fillRect(x, y, 1, 1);
			};

			ddaLine(
				Math.round(this.start.x),
				Math.round(this.start.y),
				Math.round(this.end.x),
				Math.round(this.end.y),
				plotDDA
			);
		} else {
			const plotBresenham = (x: number, y: number) => {
				ctx.fillStyle = this.color;
				ctx.fillRect(x, y, 1, 1);
			};

			bresenhamLine(
				Math.round(this.start.x),
				Math.round(this.start.y),
				Math.round(this.end.x),
				Math.round(this.end.y),
				plotBresenham
			);
		}

		// Still draw endpoints using built-in methods
		this.start.draw(ctx);
		this.end.draw(ctx);

		// Draw selection indicator if selected
		if (this.selected) {
			ctx.strokeStyle = SELECTION_BORDER_COLOR;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(this.start.x, this.start.y);
			ctx.lineTo(this.end.x, this.end.y);
			ctx.stroke();
		}
	}
}
