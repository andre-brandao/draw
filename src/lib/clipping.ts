/**
 * Cohen-Sutherland line clipping algorithm
 * Clips a line against a rectangular viewport
 */

// Define region codes for Cohen-Sutherland
const INSIDE = 0; // 0000
const LEFT = 1; // 0001
const RIGHT = 2; // 0010
const BOTTOM = 4; // 0100
const TOP = 8; // 1000

/**
 * Compute the bit code for a point (x, y) using the Cohen-Sutherland algorithm
 */
function computeCode(
	x: number,
	y: number,
	xmin: number,
	ymin: number,
	xmax: number,
	ymax: number
): number {
	let code = INSIDE;

	if (x < xmin) {
		code |= LEFT;
	} else if (x > xmax) {
		code |= RIGHT;
	}

	if (y < ymin) {
		code |= BOTTOM;
	} else if (y > ymax) {
		code |= TOP;
	}

	return code;
}

/**
 * Cohen-Sutherland line clipping algorithm
 */
export function cohenSutherland(
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	xmin: number,
	ymin: number,
	xmax: number,
	ymax: number
): { accepted: boolean; x0: number; y0: number; x1: number; y1: number } {
	// Compute region codes for P0, P1
	let code0 = computeCode(x0, y0, xmin, ymin, xmax, ymax);
	let code1 = computeCode(x1, y1, xmin, ymin, xmax, ymax);
	let accepted = false;

	while (true) {
		// Trivially accept: both points inside viewport
		if ((code0 | code1) === 0) {
			accepted = true;
			break;
		}
		// Trivially reject: both points on the same side
		else if ((code0 & code1) !== 0) {
			break;
		}
		// Line needs clipping - at least one point is outside
		else {
			// Pick an outside point
			const code = code0 !== 0 ? code0 : code1;

			// Calculate intersection
			let x = 0,
				y = 0;

			if (code & TOP) {
				x = x0 + ((x1 - x0) * (ymax - y0)) / (y1 - y0);
				y = ymax;
			} else if (code & BOTTOM) {
				x = x0 + ((x1 - x0) * (ymin - y0)) / (y1 - y0);
				y = ymin;
			} else if (code & RIGHT) {
				y = y0 + ((y1 - y0) * (xmax - x0)) / (x1 - x0);
				x = xmax;
			} else if (code & LEFT) {
				y = y0 + ((y1 - y0) * (xmin - x0)) / (x1 - x0);
				x = xmin;
			}

			// Update the outside point with the intersection
			if (code === code0) {
				x0 = x;
				y0 = y;
				code0 = computeCode(x0, y0, xmin, ymin, xmax, ymax);
			} else {
				x1 = x;
				y1 = y;
				code1 = computeCode(x1, y1, xmin, ymin, xmax, ymax);
			}
		}
	}

	return { accepted, x0, y0, x1, y1 };
}

/**
 * Liang-Barsky line clipping algorithm
 */
export function liangBarsky(
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	xmin: number,
	ymin: number,
	xmax: number,
	ymax: number
): { accepted: boolean; x0: number; y0: number; x1: number; y1: number } {
	// Define line as parametric: P = P0 + t(P1 - P0), t ∈ [0,1]
	const dx = x1 - x0;
	const dy = y1 - y0;

	// Initialize parameters
	let tmin = 0;
	let tmax = 1;

	// Check each edge of the clip window
	// p = -dx, q = x0 - xmin for left edge
	const p1 = -dx;
	const q1 = x0 - xmin;

	// p = dx, q = xmax - x0 for right edge
	const p2 = dx;
	const q2 = xmax - x0;

	// p = -dy, q = y0 - ymin for bottom edge
	const p3 = -dy;
	const q3 = y0 - ymin;

	// p = dy, q = ymax - y0 for top edge
	const p4 = dy;
	const q4 = ymax - y0;

	const edges = [
		{ p: p1, q: q1 },
		{ p: p2, q: q2 },
		{ p: p3, q: q3 },
		{ p: p4, q: q4 }
	];

	for (const edge of edges) {
		const { p, q } = edge;

		if (p === 0) {
			// Line is parallel to this edge
			if (q < 0) {
				// Line is outside
				return { accepted: false, x0, y0, x1, y1 };
			}
			// Otherwise line is inside, continue to next edge
		} else {
			const r = q / p;

			if (p < 0) {
				// Line enters the window
				tmin = Math.max(tmin, r);
			} else {
				// Line exits the window
				tmax = Math.min(tmax, r);
			}

			if (tmin > tmax) {
				// Line doesn't intersect the window
				return { accepted: false, x0, y0, x1, y1 };
			}
		}
	}

	// Calculate the clipped points
	const newX0 = x0 + tmin * dx;
	const newY0 = y0 + tmin * dy;
	const newX1 = x0 + tmax * dx;
	const newY1 = y0 + tmax * dy;

	return {
		accepted: true,
		x0: newX0,
		y0: newY0,
		x1: newX1,
		y1: newY1
	};
}

// Add these functions to your clipping.ts file

import { Circle } from './shapes/Circle.svelte';
import { Polygon } from './shapes/Polygon.svelte';
import { Line } from './shapes/Line.svelte';
import { Point } from './shapes/Point.svelte';
import { SELECTION_BORDER_COLOR } from './index';
import { bresenhamCircle } from './rasterization';
import type { ClippingConfig } from './global.svelte';

/**
 * Clip and draw a circle against a rectangular viewport
 */
export function clipAndDrawCircle(
    circle: Circle,
    ctx: CanvasRenderingContext2D,
    clipConfig: ClippingConfig
): void {
    const { xMin, yMin, xMax, yMax } = clipConfig;
    const { x, y } = circle.center;
    const r = circle.radius;
    
    // Check if circle is completely outside the clipping rectangle
    if (
        x + r < xMin ||  // completely to the left
        x - r > xMax ||  // completely to the right
        y + r < yMin ||  // completely above
        y - r > yMax     // completely below
    ) {
        return; // Don't draw anything
    }
    
    // If completely inside, draw normally
    if (
        x - r >= xMin &&
        x + r <= xMax &&
        y - r >= yMin &&
        y + r <= yMax
    ) {
        circle.draw(ctx);
        return;
    }
    
    // Circle is partially visible - clip by restricting drawing to the viewport
    ctx.save();
    ctx.beginPath();
    ctx.rect(xMin, yMin, xMax - xMin, yMax - yMin);
    ctx.clip();
    
    // Draw the circle
    const plot = (x: number, y: number) => {
        ctx.fillStyle = circle.color;
        ctx.fillRect(x, y, 1, 1);
    };

    bresenhamCircle(
        Math.round(circle.center.x),
        Math.round(circle.center.y),
        Math.round(circle.radius),
        plot
    );

    // Draw fill with semi-transparency if the circle has a radius
    if (circle.radius > 0) {
        ctx.beginPath();
        ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color + '40'; // 25% opacity
        ctx.fill();
    }
    
    // Draw selection indicator if needed
    if (circle.selected) {
        ctx.strokeStyle = SELECTION_BORDER_COLOR;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

/**
 * Clip and draw a polygon against a rectangular viewport
 */
export function clipAndDrawPolygon(
    polygon: Polygon,
    ctx: CanvasRenderingContext2D,
    clipConfig: ClippingConfig
): void {
    if (polygon.points.length < 2) return;
    
    const { xMin, yMin, xMax, yMax } = clipConfig;
    
    // Clip the polygon by clipping each edge
    const clippedEdges: { start: Point; end: Point }[] = [];
    
    for (let i = 0; i < polygon.points.length; i++) {
        const start = polygon.points[i];
        const end = polygon.points[(i + 1) % polygon.points.length];
        
        // Use the selected line clipping algorithm
        let clippedLine;
        if (clipConfig.algorithm === 'cohen-sutherland') {
            clippedLine = cohenSutherland(
                start.x, start.y,
                end.x, end.y,
                xMin, yMin, xMax, yMax
            );
        } else {
            clippedLine = liangBarsky(
                start.x, start.y,
                end.x, end.y,
                xMin, yMin, xMax, yMax
            );
        }
        
        // If the edge is at least partially visible, add it to the list
        if (clippedLine.accepted) {
            clippedEdges.push({
                start: new Point({ x: clippedLine.x0, y: clippedLine.y0, color: polygon.color }),
                end: new Point({ x: clippedLine.x1, y: clippedLine.y1, color: polygon.color })
            });
        }
    }
    
    // If no edges are visible, don't draw anything
    if (clippedEdges.length === 0) return;
    
    // Draw the clipped polygon
    ctx.save();
    ctx.beginPath();
    ctx.rect(xMin, yMin, xMax - xMin, yMax - yMin);
    ctx.clip();
    
    // Draw fill if polygon is closed
    if (clippedEdges.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(clippedEdges[0].start.x, clippedEdges[0].start.y);
        
        for (const edge of clippedEdges) {
            ctx.lineTo(edge.end.x, edge.end.y);
        }
        
        ctx.fillStyle = polygon.color + '80'; // 50% opacity
        ctx.fill();
    }
    
    // Draw edges
    for (const edge of clippedEdges) {
        const tempLine = new Line({
            start: { x: edge.start.x, y: edge.start.y },
            end: { x: edge.end.x, y: edge.end.y },
            color: polygon.color
        });
        tempLine.draw(ctx);
    }
    
    // Draw selection indicator if needed
    if (polygon.selected) {
        ctx.strokeStyle = SELECTION_BORDER_COLOR;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        if (clippedEdges.length > 0) {
            ctx.moveTo(clippedEdges[0].start.x, clippedEdges[0].start.y);
            
            for (const edge of clippedEdges) {
                ctx.lineTo(edge.end.x, edge.end.y);
            }
            
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    ctx.restore();
}
