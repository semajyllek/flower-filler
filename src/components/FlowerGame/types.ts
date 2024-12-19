import p5 from 'p5';

export interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lastX: number;
  lastY: number;
  size: number;
  color: p5.Color;
  isSettled: boolean;
  settledTime: number;
  collisionCount: number;
  lastNormal?: { x: number; y: number; };
}

export interface OutlineData {
  vertices: [number, number][];
  spoutPoints: [number, number][];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  area: number;
}