/**
 * Cohen-Sutherland line clipping algorithm
 * Clips a line against a rectangular viewport
 */

// Define region codes for Cohen-Sutherland
const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

/**
 * Compute the bit code for a point (x, y) using the Cohen-Sutherland algorithm
 */
function computeCode(x: number, y: number, xmin: number, ymin: number, xmax: number, ymax: number): number {
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
  x0: number, y0: number, 
  x1: number, y1: number, 
  xmin: number, ymin: number, 
  xmax: number, ymax: number
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
      let x = 0, y = 0;
      
      if (code & TOP) {
        x = x0 + (x1 - x0) * (ymax - y0) / (y1 - y0);
        y = ymax;
      } else if (code & BOTTOM) {
        x = x0 + (x1 - x0) * (ymin - y0) / (y1 - y0);
        y = ymin;
      } else if (code & RIGHT) {
        y = y0 + (y1 - y0) * (xmax - x0) / (x1 - x0);
        x = xmax;
      } else if (code & LEFT) {
        y = y0 + (y1 - y0) * (xmin - x0) / (x1 - x0);
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
  x0: number, y0: number,
  x1: number, y1: number,
  xmin: number, ymin: number,
  xmax: number, ymax: number
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