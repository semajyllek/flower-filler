import { Droplet, OutlineData } from '../../types';
import { isPointInsidePolygon } from './polygon';

export const calculateFillPercentage = (
  drops: Droplet[], 
  outline: OutlineData
) => {
  const totalArea = outline.area;
  
  const filledArea = drops.reduce((area, drop) => {
    if (isPointInsidePolygon(drop.x, drop.y, outline.vertices)) {
      // Increase the effective radius by 20% to account for overlaps and gaps
      const adjustedRadius = (drop.size / 2) * 1.04;
      const DropletArea = Math.PI * adjustedRadius * adjustedRadius;
      return area + DropletArea;
    }
    return area;
  }, 0);
  
  // Add a small boost factor to the final percentage
  const boostFactor = 1.07; // 15% boost
  console.log('filledArea', filledArea);
  console.log('totalArea', totalArea);
  const percentage = (filledArea / totalArea) * 100 * boostFactor;
  
  return Math.min(100, Math.round(percentage));
};