import { Point, Edge, Normal } from '../types';
import { Droplet } from '../../types';

export const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateNormal = (edge: Edge): Normal => {
  const dx = edge.end.x - edge.start.x;
  const dy = edge.end.y - edge.start.y;
  const edgeLength = Math.sqrt(dx * dx + dy * dy);
  return {
    x: dy / edgeLength,
    y: -dx / edgeLength
  };
};

export const findNearestPointOnEdge = (droplet: Droplet, edge: Edge): Point => {
  const A = droplet.x - edge.start.x;
  const B = droplet.y - edge.start.y;
  const C = edge.end.x - edge.start.x;
  const D = edge.end.y - edge.start.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? Math.max(0, Math.min(1, dot / lenSq)) : 0;

  return {
    x: edge.start.x + param * C,
    y: edge.start.y + param * D
  };
};