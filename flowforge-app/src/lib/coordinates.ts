/**
 * Coordinate Transformation Utility
 * Handles conversion between Figma absolute bounding boxes and local canvas coordinates.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasPosition {
  x: number;
  y: number;
}

/**
 * Transforms a Figma absolute bounding box to a relative position within a frame.
 * @param elementBox - The absolute bounding box of the element from Figma API
 * @param frameBox - The absolute bounding box of the parent frame from Figma API
 * @returns BoundingBox relative to the frame (0,0 is top-left of frame)
 */
export function transformToFrameRelative(
  elementBox: BoundingBox,
  frameBox: BoundingBox
): BoundingBox {
  return {
    x: elementBox.x - frameBox.x,
    y: elementBox.y - frameBox.y,
    width: elementBox.width,
    height: elementBox.height,
  };
}

/**
 * Transforms a frame-relative coordinate to a canvas coordinate, accounting for zoom and pan.
 * @param relativeBox - BoundingBox relative to the frame
 * @param zoom - Current canvas zoom level (e.g., 1.5 for 150%)
 * @param panOffset - Current canvas pan offset {x, y}
 * @returns BoundingBox in canvas coordinates
 */
export function transformToCanvas(
  relativeBox: BoundingBox,
  zoom: number,
  panOffset: CanvasPosition
): BoundingBox {
  return {
    x: relativeBox.x * zoom + panOffset.x,
    y: relativeBox.y * zoom + panOffset.y,
    width: relativeBox.width * zoom,
    height: relativeBox.height * zoom,
  };
}

/**
 * Transforms a canvas-coordinate back to frame-relative (useful for manual drawing).
 * @param canvasBox - BoundingBox in canvas coordinates
 * @param zoom - Current canvas zoom level
 * @param panOffset - Current canvas pan offset
 * @returns BoundingBox relative to the frame
 */
export function transformToFrame(
  canvasBox: BoundingBox,
  zoom: number,
  panOffset: CanvasPosition
): BoundingBox {
  return {
    x: (canvasBox.x - panOffset.x) / zoom,
    y: (canvasBox.y - panOffset.y) / zoom,
    width: canvasBox.width / zoom,
    height: canvasBox.height / zoom,
  };
}
