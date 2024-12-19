import { Droplet } from '../types';
import { GRAVITY, AIR_RESISTANCE, VELOCITY_THRESHOLD, SETTLE_TIME } from './constants';

const SLOPE_THRESHOLD = 0.7; // cos(45 degrees) - helps detect steep slopes

const handleSlopes = (droplet: Droplet, normal: { x: number; y: number }) => {
  // If surface is steep enough (more vertical than horizontal)
  if (Math.abs(normal.x) > SLOPE_THRESHOLD) {
    // Add a sideways force based on gravity and slope
    const slopeForce = GRAVITY * normal.x;
    droplet.vx += slopeForce;
    
    // Reduce settling tendency on slopes
    droplet.isSettled = false;
    droplet.settledTime = 0;
  }
};

const checkSettling = (droplet: Droplet, speed: number, deltaTime: number) => {
  // Only allow settling on nearly horizontal surfaces
  if (speed < VELOCITY_THRESHOLD && Math.abs(droplet.lastNormal?.x || 0) < SLOPE_THRESHOLD) {
    droplet.collisionCount = 0;
    droplet.settledTime += deltaTime;
    if (droplet.settledTime > SETTLE_TIME) {
      droplet.isSettled = true;
    }
  } else {
    droplet.isSettled = false;
    droplet.settledTime = 0;
  }
};

const updateVelocity = (droplet: Droplet) => {
  if (!droplet.isSettled) {
    droplet.vy += GRAVITY;
    droplet.vx *= AIR_RESISTANCE;
    droplet.vy *= AIR_RESISTANCE;

    // Only zero out velocities if droplet is truly at rest
    if (droplet.isSettled && Math.abs(droplet.vx) < VELOCITY_THRESHOLD && Math.abs(droplet.vy) < VELOCITY_THRESHOLD) {
      droplet.vx = 0;
      droplet.vy = 0;
    }
  }
};

export const applyPhysics = (droplet: Droplet, deltaTime: number) => {
  const speed = Math.sqrt(droplet.vx * droplet.vx + droplet.vy * droplet.vy);
  
  if (droplet.lastNormal) {
    handleSlopes(droplet, droplet.lastNormal);
  }
  
  checkSettling(droplet, speed, deltaTime);
  updateVelocity(droplet);
  
  droplet.lastX = droplet.x;
  droplet.lastY = droplet.y;
  
  droplet.x += droplet.vx;
  droplet.y += droplet.vy;
};