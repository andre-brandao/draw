// types.d.ts
export type Selectable = {
	selected: boolean;
};

export type Colorable = {
	color: string;
};

export type Point = Selectable &
	Colorable & {
		x: number;
		y: number;
	};

export type Line = Selectable &
	Colorable & {
		start: Point;
		end: Point;
	};

export type Polygon = Selectable &
	Colorable & {
		points: Point[];
	};

export type Shape = Point | Line | Polygon;

export type Tool =
	| 'point' // add point
	| 'line' // add line
	| 'polygon' // add polygon
	| 'select_box' // select box
	| 'select_cursor' // select individual Selectables
	| 'move' // move Selectables
	| 'delete' // delete Selectables
	| 'cursor'; // default cursor

// Add this type for transformation operations
type Transformation = 
  | { type: 'translate', dx: number, dy: number }
  | { type: 'rotate', angle: number, originX: number, originY: number }
  | { type: 'scale', scaleX: number, scaleY: number, originX: number, originY: number }
  | { type: 'reflect', axis: 'x' | 'y' | 'xy', originX: number, originY: number };
