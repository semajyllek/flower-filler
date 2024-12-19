export type CollisionGeometry = {
	dx: number;
	dy: number;
	distance: number;
	minDistance: number;
  };
  
  export type SeparationVector = {
	x: number;
	y: number;
  };
  
  export type CollisionResponse = {
	normalX: number;
	normalY: number;
	impulse: number;
  };
  
  export type Point = { x: number; y: number };
  export type Edge = { start: Point; end: Point };
  export type Normal = { x: number; y: number };