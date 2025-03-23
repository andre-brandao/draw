/**
 * Rasterization algorithms for drawing primitives
 */

/**
 * DDA (Digital Differential Analyzer) algorithm for line rasterization
 * @param x0 Starting x coordinate
 * @param y0 Starting y coordinate
 * @param x1 Ending x coordinate
 * @param y1 Ending y coordinate
 * @param plot Function to plot a pixel at (x,y)
 */
export function ddaLine(
  x0: number, 
  y0: number, 
  x1: number, 
  y1: number, 
  plot: (x: number, y: number) => void
): void {
  // Calculate the number of steps based on the greatest distance
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  
  // Calculate the increment in x and y for each step
  const xIncrement = dx / steps;
  const yIncrement = dy / steps;
  
  // Set the initial point
  let x = x0;
  let y = y0;
  
  // Plot the initial point
  plot(Math.round(x), Math.round(y));
  
  // Plot each step
  for (let i = 0; i < steps; i++) {
    x += xIncrement;
    y += yIncrement;
    plot(Math.round(x), Math.round(y));
  }
}

/**
 * Bresenham's line algorithm for line rasterization
 * @param x0 Starting x coordinate
 * @param y0 Starting y coordinate
 * @param x1 Ending x coordinate
 * @param y1 Ending y coordinate
 * @param plot Function to plot a pixel at (x,y)
 */
export function bresenhamLine(
  x0: number, 
  y0: number, 
  x1: number, 
  y1: number, 
  plot: (x: number, y: number) => void
): void {
  // Make sure we're always drawing left to right
  const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
  
  // If the line is steep, swap x and y
  if (steep) {
    [x0, y0] = [y0, x0];
    [x1, y1] = [y1, x1];
  }
  
  // Ensure we're always drawing left to right
  if (x0 > x1) {
    [x0, x1] = [x1, x0];
    [y0, y1] = [y1, y0];
  }
  
  const dx = x1 - x0;
  const dy = Math.abs(y1 - y0);
  const yStep = y0 < y1 ? 1 : -1;
  
  let error = dx / 2;
  let y = y0;
  
  for (let x = x0; x <= x1; x++) {
    plot(steep ? y : x, steep ? x : y);
    error -= dy;
    if (error < 0) {
      y += yStep;
      error += dx;
    }
  }
}

/**
 * Bresenham's circle algorithm for circle rasterization
 * @param xc Center x coordinate
 * @param yc Center y coordinate
 * @param r Radius
 * @param plot Function to plot a pixel at (x,y)
 */
export function bresenhamCircle(
  xc: number,
  yc: number,
  r: number,
  plot: (x: number, y: number) => void
): void {
  let x = 0;
  let y = r;
  let d = 3 - 2 * r;
  
  // Plot the initial points in all octants
  drawCirclePoints(xc, yc, x, y, plot);
  
  while (y >= x) {
    x++;
    
    // Update decision parameter based on Bresenham's algorithm
    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
    
    drawCirclePoints(xc, yc, x, y, plot);
  }
}

/**
 * Helper function to plot points in all octants of a circle
 */
function drawCirclePoints(
  xc: number,
  yc: number,
  x: number,
  y: number,
  plot: (x: number, y: number) => void
): void {
  plot(xc + x, yc + y);
  plot(xc - x, yc + y);
  plot(xc + x, yc - y);
  plot(xc - x, yc - y);
  plot(xc + y, yc + x);
  plot(xc - y, yc + x);
  plot(xc + y, yc - x);
  plot(xc - y, yc - x);
}