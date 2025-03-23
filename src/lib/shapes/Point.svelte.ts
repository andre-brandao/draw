import type { Shape, PointData } from '../../types';
import { POINT_RADIUS, SELECTION_BORDER_COLOR } from '../index';

export class Point implements Shape {
  type = 'point' as const;
  x = $state(0);
  y = $state(0);
  color = $state('#000000');
  selected = $state(false);

  constructor(data: PointData) {
    this.x = data.x;
    this.y = data.y;
    this.color = data.color || '#000000';
    this.selected = data.selected || false;
  }

  // Shape methods
  clone(): Shape {
    return new Point({
      x: this.x,
      y: this.y,
      color: this.color,
      selected: this.selected
    });
  }

  contains(x: number, y: number, threshold = POINT_RADIUS): boolean {
    const dx = x - this.x;
    const dy = y - this.y;
    return dx * dx + dy * dy <= threshold * threshold;
  }

  getBoundingBox() {
    return {
      x1: this.x - POINT_RADIUS,
      y1: this.y - POINT_RADIUS,
      x2: this.x + POINT_RADIUS,
      y2: this.y + POINT_RADIUS
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
  }

  // Transformable methods
  translate(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  rotate(angle: number, origin: {x: number, y: number}): void {
    // Convert to radians
    const angleRad = (angle * Math.PI) / 180;
    
    // Translate point to origin
    const x = this.x - origin.x;
    const y = this.y - origin.y;
    
    // Rotate
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const xNew = x * cos - y * sin;
    const yNew = x * sin + y * cos;
    
    // Translate back
    this.x = xNew + origin.x;
    this.y = yNew + origin.y;
  }

  scale(scaleX: number, scaleY: number, origin: {x: number, y: number}): void {
    this.x = origin.x + (this.x - origin.x) * scaleX;
    this.y = origin.y + (this.y - origin.y) * scaleY;
  }

  reflect(axis: 'x' | 'y' | 'xy', origin: {x: number, y: number}): void {
    // Translate to origin
    const x = this.x - origin.x;
    const y = this.y - origin.y;
    
    let xNew = x;
    let yNew = y;
    
    switch (axis) {
      case 'x':
        // Reflect across x-axis
        yNew = -y;
        break;
      case 'y':
        // Reflect across y-axis
        xNew = -x;
        break;
      case 'xy':
        // Reflect across line y = x
        xNew = y;
        yNew = x;
        break;
    }
    
    // Translate back
    this.x = xNew + origin.x;
    this.y = yNew + origin.y;
  }

  // Drawable method
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, POINT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    if (this.selected) {
      ctx.strokeStyle = SELECTION_BORDER_COLOR;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}