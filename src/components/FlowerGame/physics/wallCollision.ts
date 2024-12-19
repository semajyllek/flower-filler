import { Droplet } from '../types';
import { Normal } from './types';
import { calculateDistance, calculateNormal, findNearestPointOnEdge } from './utils/geometry';
import { getEdgePoints, isPointInsidePolygon } from './utils/polygon';

const findWallNormal = (droplet: Droplet, vertices: [number, number][]) => {
  let minDist = Infinity;
  let closestNormal: Normal = { x: 0, y: 0 };

  vertices.forEach((_, i) => {
    const edge = getEdgePoints(vertices, i);
    const nearestPoint = findNearestPointOnEdge(droplet, edge);
    const distance = calculateDistance(droplet, nearestPoint);

    if (distance < minDist) {
      minDist = distance;
      closestNormal = calculateNormal(edge);
    }
  });

  return { normal: closestNormal, distance: minDist };
};


const pushDropletInsideBoundary = (droplet: Droplet, normal: Normal) => {
	// Check the entire droplet radius, not just the center point
	const pushDistance = droplet.size/2 + 1;
	
	// Push more aggressively to ensure the entire droplet stays inside
	const safetyMultiplier = 1.2; // Push a bit extra to prevent sticking
	droplet.x += normal.x * pushDistance * safetyMultiplier;
	droplet.y += normal.y * pushDistance * safetyMultiplier;
};

  
const calculateBounceVelocity = (droplet: Droplet, normal: Normal) => {
	const dot = droplet.vx * normal.x + droplet.vy * normal.y;
	const dampingFactor = 0.01;  // Very low for quick energy loss

	return {
		vx: (droplet.vx - 2 * dot * normal.x) * dampingFactor,
		vy: (droplet.vy - 2 * dot * normal.y) * dampingFactor
	};
};
  

const shouldStopBouncing = (droplet: Droplet) => {
	return Math.abs(droplet.vy) < 0.3 || droplet.collisionCount >= 3;
};
  

const stopDroplet = (droplet: Droplet) => {
	droplet.vx = 0;
	droplet.vy = 0;
	droplet.isSettled = true;
};
  


export const handleWallCollision = (droplet: Droplet, vertices: [number, number][]) => {
	if (!isPointInsidePolygon(droplet.x, droplet.y, vertices)) {
		const { normal } = findWallNormal(droplet, vertices);
		droplet.lastNormal = normal;
		
		pushDropletInsideBoundary(droplet, normal);
		
		if (!droplet.isSettled) {
			const newVelocity = calculateBounceVelocity(droplet, normal);
			droplet.vx = newVelocity.vx;
			droplet.vy = newVelocity.vy;
			
			droplet.collisionCount++;
			
			if (shouldStopBouncing(droplet)) {
				stopDroplet(droplet);
			}
		} else {
			droplet.vx *= 0.05;
			droplet.vy *= 0.05;
		}
		return true;
	}
	droplet.lastNormal = undefined;
	return false;

};