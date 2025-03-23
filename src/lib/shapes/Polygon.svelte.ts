import type { Shape, PolygonData, PointData } from '../../types';
import { SELECTION_BORDER_COLOR } from '../index';
import { Point } from './Point.svelte';
import { appState } from '../global.svelte';
import {ddaLine, bresenhamLine} from '../rasterization'

export class Polygon implements Shape {
  type = 'polygon' as const;
  points = $state<Point[]>([]);
  color = $state('#000000');
  selected = $state(false);

  constructor(data: PolygonData) {
    this.points = data.points.map(p => new Point({
      x: p.x,
      y: p.y,
      color: data.color || '#000000'
    }));
    
    this.color = data.color || '#000000';
    this.selected = data.selected || false;
  }

  // Shape methods
  clone(): Shape {
    return new Polygon({
      points: this.points.map(p => ({ x: p.x, y: p.y })),
      color: this.color,
      selected: this.selected
    });
  }

  serialize(): PolygonData {
    return {
      points: this.points.map(p => ({ x: p.x, y: p.y })),
      color: this.color,
      selected: this.selected
    };
  }

  contains(x: number, y: number): boolean {
    if (this.points.length < 3) return false;

    let inside = false;
    for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
      const xi = this.points[i].x;
      const yi = this.points[i].y;
      const xj = this.points[j].x;
      const yj = this.points[j].y;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }

  getBoundingBox() {
    if (this.points.length === 0) {
      return { x1: 0, y1: 0, x2: 0, y2: 0 };
    }
    
    let minX = this.points[0].x;
    let minY = this.points[0].y;
    let maxX = minX;
    let maxY = minY;
    
    for (const point of this.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
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
    this.points.forEach(p => p.setColor(color));
  }

  // Transformable methods
  translate(dx: number, dy: number): void {
    this.points.forEach(p => p.translate(dx, dy));
  }

  rotate(angle: number, origin: {x: number, y: number}): void {
    this.points.forEach(p => p.rotate(angle, origin));
  }

  scale(scaleX: number, scaleY: number, origin: {x: number, y: number}): void {
    this.points.forEach(p => p.scale(scaleX, scaleY, origin));
  }

  reflect(axis: 'x' | 'y' | 'xy', origin: {x: number, y: number}): void {
    this.points.forEach(p => p.reflect(axis, origin));
  }

  // Drawable method
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.points.length < 2) return;
    
    // Draw filled polygon using built-in methods (filling with rasterization is complex)
    if (this.points.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      
      ctx.closePath();
      ctx.fillStyle = this.color + '80'; // 50% opacity
      ctx.fill();
    }
    
    // Draw edges using rasterization
    for (let i = 0; i < this.points.length; i++) {
      const start = this.points[i];
      const end = this.points[(i + 1) % this.points.length];
      
      if (appState.rasterizationAlgorithm === 'dda') {
        const plotDDA = (x: number, y: number) => {
          ctx.fillStyle = this.color;
          ctx.fillRect(x, y, 1, 1);
        };
        
        ddaLine(
          Math.round(start.x),
          Math.round(start.y),
          Math.round(end.x),
          Math.round(end.y),
          plotDDA
        );
      } else {
        const plotBresenham = (x: number, y: number) => {
          ctx.fillStyle = this.color;
          ctx.fillRect(x, y, 1, 1);
        };
        
        bresenhamLine(
          Math.round(start.x),
          Math.round(start.y),
          Math.round(end.x),
          Math.round(end.y),
          plotBresenham
        );
      }
    }
    
    // Draw selection indicator if selected
    if (this.selected) {
      ctx.strokeStyle = SELECTION_BORDER_COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      
      if (this.points.length >= 3) {
        ctx.closePath();
      }
      
      ctx.stroke();
    }
    
    // Draw all points
    this.points.forEach(p => p.draw(ctx));
  }

  // Additional polygon methods
  addPoint(point: PointData): void {
    this.points = [...this.points, new Point({
      x: point.x,
      y: point.y,
      color: this.color
    })];
  }

  closePolygon(): void {
    // Just a helper method, actual drawing closure happens in draw()
  }
}