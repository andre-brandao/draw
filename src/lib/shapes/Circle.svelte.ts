/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Shape, CircleData, PointData } from '../../types';
import { SELECTION_BORDER_COLOR, POINT_RADIUS } from '../index';
import { Point } from './Point.svelte';
import { bresenhamCircle } from '../rasterization';

export class Circle implements Shape {
  type = 'circle' as const;
  center = $state<Point>(new Point({ x: 0, y: 0 }));
  radius = $state(0);
  color = $state('#000000');
  selected = $state(false);

  constructor(data: CircleData) {
    this.center = new Point({ 
      x: data.center.x, 
      y: data.center.y,
      color: data.color || '#000000'
    });
    
    this.radius = data.radius;
    this.color = data.color || '#000000';
    this.selected = data.selected || false;
  }

  // Shape methods
  clone(): Shape {
    return new Circle({
      center: { 
        x: this.center.x, 
        y: this.center.y
      },
      radius: this.radius,
      color: this.color,
      selected: this.selected
    });
  }

  contains(x: number, y: number, threshold = 5): boolean {
    // Calculate distance from point to center
    const dx = x - this.center.x;
    const dy = y - this.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if point is within threshold of the circle's boundary
    return Math.abs(distance - this.radius) <= threshold;
  }

  getBoundingBox() {
    return {
      x1: this.center.x - this.radius,
      y1: this.center.y - this.radius,
      x2: this.center.x + this.radius,
      y2: this.center.y + this.radius
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
    this.center.setColor(color);
  }

  // Transformable methods
  translate(dx: number, dy: number): void {
    this.center.translate(dx, dy);
  }

  rotate(angle: number, origin: {x: number, y: number}): void {
    // Only the center point needs to rotate, radius stays the same
    this.center.rotate(angle, origin);
  }

  scale(scaleX: number, scaleY: number, origin: {x: number, y: number}): void {
    // Move the center point
    this.center.scale(scaleX, scaleY, origin);
    
    // Scale the radius (use average of scaleX and scaleY)
    const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
    this.radius *= avgScale;
  }

  reflect(axis: 'x' | 'y' | 'xy', origin: {x: number, y: number}): void {
    // Only need to reflect the center point
    this.center.reflect(axis, origin);
  }

  // Drawable method
  draw(ctx: CanvasRenderingContext2D): void {
    // Use Bresenham's circle algorithm
    const plot = (x: number, y: number) => {
      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, 1, 1);
    };
    
    bresenhamCircle(
      Math.round(this.center.x), 
      Math.round(this.center.y), 
      Math.round(this.radius), 
      plot
    );
    
    // Optional: Fill the circle with a semi-transparent color
    if (this.radius > 0) {
      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + '40'; // 25% opacity
      ctx.fill();
    }

    // Draw center point and selection indicator
    if (this.selected) {
      ctx.strokeStyle = SELECTION_BORDER_COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw center point when selected
      this.center.draw(ctx);
    }
  }
}