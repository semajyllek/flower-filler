import p5 from 'p5';
import { Droplet, OutlineData } from './types';
import { handleDropletCollision, handleWallCollision, applyPhysics } from './physics';

export class P5Renderer {
  private backgroundImage: p5.Image | null = null;
  private lastUpdateTime: number;
  private hasWon: boolean = false;
  private isDarkMode: boolean = false;

  constructor(
    private p: p5,
    private outlineData: OutlineData,
    private drops: Droplet[],
    private selectedSpout: number
  ) {
    this.lastUpdateTime = p.millis();
  }

  loadImage(imageUrl: string) {
    this.p.loadImage(imageUrl, (img) => {
      this.backgroundImage = img;
    });
  }

  setWinState(hasWon: boolean) {
    this.hasWon = hasWon;
  }

  setDarkMode(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode;
  }

  createRandomColor(): p5.Color {
    return this.p.color(
      this.p.random(100, 255),
      this.p.random(100, 255),
      this.p.random(100, 255),
      200
    );
  }

  private drawOutline() {
    // Ensure stroke is visible
    const strokeColor = this.isDarkMode ? 255 : 0;
    this.p.stroke(strokeColor);
    this.p.strokeWeight(2);
    this.p.noFill();
    
    // Debug logging
    console.log('Drawing outline:', {
      vertices: this.outlineData.vertices,
      strokeColor,
      isDarkMode: this.isDarkMode
    });
    
    this.p.beginShape();
    for (let vertex of this.outlineData.vertices) {
      this.p.vertex(vertex[0], vertex[1]);
    }
    this.p.endShape(this.p.CLOSE);
  }

  private drawSpout() {
    const strokeColor = this.isDarkMode ? 255 : 0;
    
    this.outlineData.spoutPoints.forEach((spout, index) => {
      this.p.strokeWeight(2);
      
      if (index === this.selectedSpout) {
        this.p.stroke(strokeColor);
        this.p.noFill();
        this.p.circle(spout[0], spout[1], 12);
        
        this.p.stroke('#42ff33');
        this.p.circle(spout[0], spout[1], 6);
      } else {
        this.p.stroke(strokeColor);
        this.p.noFill();
        this.p.circle(spout[0], spout[1], 8);
      }
    });
  }

  render() {
    // Clear background
    this.p.background(this.isDarkMode ? 0 : 240);

    // Only draw image if we've won
    if (this.hasWon && this.backgroundImage) {
      this.p.image(this.backgroundImage, 0, 0, 800, 600);
    }

    // Draw game elements
    this.drawOutline();
    this.drawSpout();

    // Update and draw droplets
    const currentTime = this.p.millis();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.drops.forEach((droplet, index) => {
      applyPhysics(droplet, deltaTime);

      for (let i = index + 1; i < this.drops.length; i++) {
        handleDropletCollision(droplet, this.drops[i]);
      }
      handleWallCollision(droplet, this.outlineData.vertices);

      this.p.fill(droplet.color);
      this.p.noStroke();
      this.p.circle(droplet.x, droplet.y, droplet.size);
    });
  }
}