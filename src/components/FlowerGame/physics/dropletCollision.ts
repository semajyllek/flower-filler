import { Droplet } from '../types';
import { CollisionGeometry, SeparationVector, CollisionResponse } from './types';

const getCollisionGeometry = (drop1: Droplet, drop2: Droplet): CollisionGeometry => {
  const dx = drop2.x - drop1.x;
  const dy = drop2.y - drop1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = (drop1.size + drop2.size) / 2;
  
  return { dx, dy, distance, minDistance };
};

const calculateSeparation = (geometry: CollisionGeometry): SeparationVector => {
  const { dx, dy, distance, minDistance } = geometry;
  const overlap = minDistance - distance;
  return {
    x: (dx / distance) * overlap * 0.5,
    y: (dy / distance) * overlap * 0.5
  };
};

const applyDropletSeparation = (
	drop1: Droplet,
	drop2: Droplet,
	separation: SeparationVector
  ) => {
	// Always move drops fully apart when they collide
	// Don't use any partial separation factors
	drop1.x -= separation.x;
	drop1.y -= separation.y;
	drop2.x += separation.x;
	drop2.y += separation.y;
};
  
const calculateCollisionResponse = (
	drop1: Droplet,
	drop2: Droplet,
	geometry: CollisionGeometry
): CollisionResponse | null => {
	const { dx, dy, distance } = geometry;
	const normalX = dx / distance;
	const normalY = dy / distance;
	
	const relativeVelocityX = drop1.vx - drop2.vx;
	const relativeVelocityY = drop1.vy - drop2.vy;
	const relativeSpeed = relativeVelocityX * normalX + relativeVelocityY * normalY;
	
	// Don't allow any penetration by checking earlier
	if (relativeSpeed > -0.1) return null;  // Small negative threshold
	
	const restitution = 0.1;
	const damper = 0.15;
	const impulse = -(1 + restitution) * relativeSpeed * damper;
	
	return { normalX, normalY, impulse };
};

const applyCollisionResponse = (drop1: Droplet, drop2: Droplet, response: CollisionResponse) => {
  const { normalX, normalY, impulse } = response;
  const damping = 0.85;
  
  drop1.vx = (drop1.vx - impulse * normalX) * damping;
  drop1.vy = (drop1.vy - impulse * normalY) * damping;
  drop2.vx = (drop2.vx + impulse * normalX) * damping;
  drop2.vy = (drop2.vy + impulse * normalY) * damping;
};


export const handleDropletCollision = (drop1: Droplet, drop2: Droplet) => {
  if (drop1.collisionCount >= 10 || drop2.collisionCount >= 10) return;

  const geometry = getCollisionGeometry(drop1, drop2);
  
  if (geometry.distance < geometry.minDistance) {
    drop1.collisionCount++;
    drop2.collisionCount++;

    const separation = calculateSeparation(geometry);
    applyDropletSeparation(drop1, drop2, separation);
    
    if (!drop1.isSettled && !drop2.isSettled) {
      const response = calculateCollisionResponse(drop1, drop2, geometry);
      if (response) {
        applyCollisionResponse(drop1, drop2, response);
      }
    }
  }
};