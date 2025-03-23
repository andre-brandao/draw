// types.d.ts
// Base interfaces for shapes
export interface Selectable {
  selected: boolean;
  toggleSelect(): void;
  select(): void;
  deselect(): void;
}

export interface Colorable {
  color: string;
  setColor(color: string): void;
}

export interface Transformable {
  translate(dx: number, dy: number): void;
  rotate(angle: number, origin: {x: number, y: number}): void;
  scale(scaleX: number, scaleY: number, origin: {x: number, y: number}): void;
  reflect(axis: 'x' | 'y' | 'xy', origin: {x: number, y: number}): void;
}

export interface Drawable {
  draw(ctx: CanvasRenderingContext2D): void;
}

// Shape interface combining all capabilities
export interface Shape extends Selectable, Colorable, Transformable, Drawable {
  type: 'point' | 'line' | 'polygon';
  clone(): Shape;
  contains(x: number, y: number, threshold?: number): boolean;
  getBoundingBox(): {x1: number, y1: number, x2: number, y2: number};
}

// Data types for serialization
export interface PointData {
  x: number;
  y: number;
  color?: string;
  selected?: boolean;
}

export interface LineData {
  start: PointData;
  end: PointData;
  color?: string;
  selected?: boolean;
}

export interface PolygonData {
  points: PointData[];
  color?: string;
  selected?: boolean;
}

export type Tool =
  | 'point'
  | 'line' 
  | 'polygon'
  | 'select_box'
  | 'select_cursor'
  | 'move'
  | 'delete'
  | 'cursor';

export type TransformationType = 
  | { type: 'translate', dx: number, dy: number }
  | { type: 'rotate', angle: number, originX: number, originY: number }
  | { type: 'scale', scaleX: number, scaleY: number, originX: number, originY: number }
  | { type: 'reflect', axis: 'x' | 'y' | 'xy', originX: number, originY: number };
