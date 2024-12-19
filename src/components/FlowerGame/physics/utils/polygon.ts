import { Edge } from '../types';

export const getEdgePoints = (vertices: [number, number][], i: number): Edge => {
  const j = (i + 1) % vertices.length;
  return {
    start: { x: vertices[i][0], y: vertices[i][1] },
    end: { x: vertices[j][0], y: vertices[j][1] }
  };
};

export const isPointInsidePolygon = (x: number, y: number, vertices: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0], yi = vertices[i][1];
    const xj = vertices[j][0], yj = vertices[j][1];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};