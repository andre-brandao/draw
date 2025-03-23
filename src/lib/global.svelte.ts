/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import type { Tool, TransformationType } from '../types';
import { geometryStore } from './geometryStore.svelte';
import { Point } from './shapes/Point.svelte';
import { Line } from './shapes/Line.svelte';
import { Polygon } from './shapes/Polygon.svelte';
import { Circle } from './shapes/Circle.svelte';
import { POINT_RADIUS, drawSelectionRect } from './index';

function createState() {
  // Canvas state
  let canvas: HTMLCanvasElement | undefined = $state(undefined);
  let ctx: CanvasRenderingContext2D | undefined = $state(undefined);
  let width = $state(800);
  let height = $state(600);

  // Tools state
  let selectedTool: Tool = $state('cursor');
  let currentColor = $state('#000000');

  // Interaction state
  let interaction = $state({
    isDrawing: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    lastX: 0,
    lastY: 0
  });

  // Temporary drawing state
  let temp = $state({
    currentPolygon: null as Polygon | null,
    tempLine: null as Line | null,
    tempCircle: null as Circle | null
  });

  // Tooltip state
  let tooltip = $state({
    visible: false,
    x: 0,
    y: 0,
    text: '',
    objects: 0
  });

  // ===== Helper Functions =====

  // Get mouse position relative to canvas
  function getMousePos(e: MouseEvent) {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // ===== Main Functions =====

  // Redraw the canvas
  function redraw(): void {
    if (!ctx || !canvas) return;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all shapes
    geometryStore.draw(ctx);

    // Draw any temporary shapes
    if (temp.tempLine) {
      temp.tempLine.draw(ctx);
    }

    if (temp.currentPolygon) {
      temp.currentPolygon.draw(ctx);

      // If we're actively drawing, show a line from the last point to the cursor
      if (temp.currentPolygon.points.length > 0) {
        const lastPoint = temp.currentPolygon.points[temp.currentPolygon.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(interaction.currentX, interaction.currentY);
        ctx.strokeStyle = temp.currentPolygon.color;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    if (temp.tempCircle) {
      temp.tempCircle.draw(ctx);
    }

    // Draw the selection box if active
    if (interaction.isDrawing && selectedTool === 'select_box') {
      drawSelectionRect(
        ctx,
        interaction.startX,
        interaction.startY,
        interaction.currentX,
        interaction.currentY
      );
    }
  }

  // Handle mouse down event
  function handleMouseDown(e: MouseEvent): void {
    const { x, y } = getMousePos(e);
    interaction.startX = x;
    interaction.startY = y;
    interaction.currentX = x;
    interaction.currentY = y;
    interaction.isDrawing = true;

    switch (selectedTool) {
      case 'point': {
        const newPoint = geometryStore.addPoint({
          x,
          y,
          color: currentColor
        });
        redraw();
        break;
      }

      case 'line': {
        const startPoint = new Point({ 
          x,
          y,
          color: currentColor
        });
        const endPoint = new Point({ 
          x,
          y,
          color: currentColor
        });
        temp.tempLine = new Line({
          start: { x: startPoint.x, y: startPoint.y },
          end: { x: endPoint.x, y: endPoint.y },
          color: currentColor
        });
        break;
      }

      case 'polygon': {
        if (!temp.currentPolygon) {
          // Start a new polygon
          temp.currentPolygon = new Polygon({
            points: [{ x, y }],
            color: currentColor
          });
        } else {
          // Add a point to the current polygon
          // Check if we're closing the polygon (clicking near the first point)
          const firstPoint = temp.currentPolygon.points[0];
          if (
            temp.currentPolygon.points.length > 2 &&
            Math.abs(x - firstPoint.x) < POINT_RADIUS * 2 &&
            Math.abs(y - firstPoint.y) < POINT_RADIUS * 2
          ) {
            // Complete the polygon
            geometryStore.addPolygon({
              points: temp.currentPolygon.points.map(p => ({ x: p.x, y: p.y })),
              color: currentColor
            });
            temp.currentPolygon = null;
          } else {
            // Add the new point
            temp.currentPolygon.addPoint({ x, y });
          }
        }
        redraw();
        break;
      }

      case 'circle': {
        // Start drawing a circle - set the center
        temp.tempCircle = new Circle({
          center: { x, y },
          radius: 0,
          color: currentColor
        });
        break;
      }

      case 'select_cursor': {
        // Find and select a shape at this position
        const shape = geometryStore.findShapeAt(x, y);

        // Deselect all first if not holding shift
        if (!e.shiftKey) {
          geometryStore.deselectAll();
        }

        // Select the found shape if any
        if (shape) {
          geometryStore.selectShape(shape);
        }

        redraw();
        break;
      }

      case 'select_box':
        // Start drawing selection box
        break;

      case 'move': {
        interaction.isDragging = true;
        interaction.lastX = x;
        interaction.lastY = y;

        // If nothing is selected, try to select something under the cursor
        if (geometryStore.selectedShapes.length === 0) {
          const shapeUnderCursor = geometryStore.findShapeAt(x, y);
          if (shapeUnderCursor) {
            geometryStore.selectShape(shapeUnderCursor);
            redraw();
          }
        }
        break;
      }

      case 'delete': {
        // Find a shape at click position and mark it for deletion
        const shapeToDelete = geometryStore.findShapeAt(x, y);

        if (shapeToDelete) {
          geometryStore.selectShape(shapeToDelete);
          geometryStore.deleteSelectedShapes();
          redraw();
        }
        break;
      }

      case 'cursor':
      default: {
        // Just a regular cursor click
        const clickedShape = geometryStore.findShapeAt(x, y);

        if (clickedShape) {
          // Start dragging if we clicked on a shape
          interaction.isDragging = true;
          interaction.lastX = x;
          interaction.lastY = y;

          // If the shape is not already selected, select only this shape
          if (!clickedShape.selected) {
            geometryStore.deselectAll();
            geometryStore.selectShape(clickedShape);
            redraw();
          }
        } else {
          // If we clicked on empty space, deselect all
          geometryStore.deselectAll();
          redraw();
        }
        break;
      }
    }
    updateTooltipState();
  }

  // Handle mouse move event
  function handleMouseMove(e: MouseEvent): void {
    const { x, y } = getMousePos(e);
    interaction.currentX = x;
    interaction.currentY = y;

    switch (selectedTool) {
      case 'line':
        // Update the end point of the temporary line
        if (temp.tempLine) {
          temp.tempLine.end.x = x;
          temp.tempLine.end.y = y;
          redraw();
        }
        break;

      case 'circle':
        // Update the radius of the temporary circle
        if (temp.tempCircle) {
          const dx = x - temp.tempCircle.center.x;
          const dy = y - temp.tempCircle.center.y;
          temp.tempCircle.radius = Math.sqrt(dx * dx + dy * dy);
          redraw();
        }
        break;

      case 'select_box':
        // We're drawing a selection box
        redraw();
        break;

      case 'move':
      case 'cursor':
        if (interaction.isDragging) {
          // Calculate the movement delta
          const dx = x - interaction.lastX;
          const dy = y - interaction.lastY;

          // Move all selected shapes
          geometryStore.transformSelectedShapes({
            type: 'translate',
            dx,
            dy
          });

          // Update last position
          interaction.lastX = x;
          interaction.lastY = y;

          redraw();
        }
        break;
    }
  }

  // Handle mouse up event
  function handleMouseUp(e: MouseEvent): void {
    const { x, y } = getMousePos(e);

    switch (selectedTool) {
      case 'line': {
        if (temp.tempLine) {
          // Finalize the line
          geometryStore.addLine({
            start: { x: temp.tempLine.start.x, y: temp.tempLine.start.y },
            end: { x: temp.tempLine.end.x, y: temp.tempLine.end.y },
            color: currentColor
          });
          temp.tempLine = null;
          redraw();
        }
        break;
      }

      case 'circle': {
        if (temp.tempCircle && temp.tempCircle.radius > 2) {
          // Finalize the circle if it has a reasonable radius
          geometryStore.addCircle({
            center: { x: temp.tempCircle.center.x, y: temp.tempCircle.center.y },
            radius: temp.tempCircle.radius,
            color: currentColor
          });
          temp.tempCircle = null;
          redraw();
        } else {
          // Cancel if too small
          temp.tempCircle = null;
          redraw();
        }
        break;
      }

      case 'select_box': {
        // Select all shapes within the selection box
        const selectionRect = {
          x1: interaction.startX,
          y1: interaction.startY,
          x2: x,
          y2: y
        };

        // Only clear selection if not holding shift
        if (!e.shiftKey) {
          geometryStore.deselectAll();
        }

        geometryStore.selectShapesInRect(selectionRect);
        redraw();
        break;
      }
    }

    interaction.isDrawing = false;
    interaction.isDragging = false;
    updateTooltipState();
  }

  // Update the tooltip state
  function updateTooltipState(): void {
    const selectedShapes = geometryStore.selectedShapes;
    const total = selectedShapes.length;

    if (total > 0) {
      // Calculate position (center of selected objects)
      let sumX = 0, sumY = 0;
      
      selectedShapes.forEach(shape => {
        const bbox = shape.getBoundingBox();
        sumX += (bbox.x1 + bbox.x2) / 2;
        sumY += (bbox.y1 + bbox.y2) / 2;
      });
      
      // Create tooltip text
      const selectedPoints = selectedShapes.filter(s => s.type === 'point').length;
      const selectedLines = selectedShapes.filter(s => s.type === 'line').length;
      const selectedPolygons = selectedShapes.filter(s => s.type === 'polygon').length;
      
      let text = `${total} object${total > 1 ? 's' : ''} selected: `;
      if (selectedPoints > 0) text += `${selectedPoints} point${selectedPoints > 1 ? 's' : ''} `;
      if (selectedLines > 0) text += `${selectedLines} line${selectedLines > 1 ? 's' : ''} `;
      if (selectedPolygons > 0) text += `${selectedPolygons} polygon${selectedPolygons > 1 ? 's' : ''} `;
      
      // Update tooltip state
      tooltip = {
        visible: true,
        x: sumX / total,
        y: sumY / total - 30, // Position above the objects
        text,
        objects: total
      };
    } else {
      // Hide tooltip if nothing is selected
      tooltip.visible = false;
    }
  }

  // Reset state
  function resetState(): void {
    geometryStore.clear();
    
    interaction = {
      isDrawing: false,
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      lastX: 0,
      lastY: 0
    };

    temp = {
      currentPolygon: null,
      tempLine: null,
      tempCircle: null
    };

    if (ctx && canvas) {
      ctx.clearRect(0, 0, width, height);
    }
  }

  // Transform selected shapes
  function transformSelectedShapes(transformation: TransformationType): void {
    geometryStore.transformSelectedShapes(transformation);
    redraw();
  }

  return {
    // Canvas properties
    get canvas() {
      return canvas;
    },
    set canvas(value) {
      canvas = value;
      ctx = canvas?.getContext('2d') ?? undefined;
      redraw();
    },
    get ctx() {
      return ctx;
    },
    get width() {
      return width;
    },
    set width(value) {
      width = value;
      redraw();
    },
    get height() {
      return height;
    },
    set height(value) {
      height = value;
      redraw();
    },
    
    // Tool properties
    get selectedTool() {
      return selectedTool;
    },
    set selectedTool(value) {
      selectedTool = value;
    },
    get currentColor() {
      return currentColor;
    },
    set currentColor(value) {
      currentColor = value;
    },
    
    // Other state getters
    get interaction() {
      return interaction;
    },
    get temp() {
      return temp;
    },
    get tooltip() {
      return tooltip;
    },
    
    // Actions
    selectAll: () => {
      geometryStore.selectAll();
      updateTooltipState();
      redraw();
    },
    deselectAll: () => {
      geometryStore.deselectAll();
      updateTooltipState();
      redraw();
    },
    changeColor: (color: string) => {
      currentColor = color;
      geometryStore.setColorForSelectedShapes(color);
      redraw();
    },
    
    // Transform function
    transformSelectedShapes,
    
    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    
    // Canvas drawing
    redraw,
    resetState,
    deleteSelectedShapes: () => {
      geometryStore.deleteSelectedShapes();
      updateTooltipState();
      redraw();
    }
  };
}

export const appState = createState();
