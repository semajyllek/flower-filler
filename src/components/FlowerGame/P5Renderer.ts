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
    this.p.stroke(this.isDarkMode ? 255 : 0);
    this.p.strokeWeight(2);
    this.p.noFill();
    this.p.beginShape();
    this.outlineData.vertices.forEach(([x, y]) => {
      this.p.vertex(x, y);
    });
    this.p.endShape(this.p.CLOSE);
  }

  private drawSpout() {
    this.outlineData.spoutPoints.forEach((spout, index) => {
      this.p.strokeWeight(2);
      
      if (index === this.selectedSpout) {
        // Outer circle
        this.p.stroke(this.isDarkMode ? 255 : 0);
        this.p.noFill();
        this.p.circle(spout[0], spout[1], 12);
        
        // Inner circle in radioactive green
        this.p.stroke('#42ff33');
        this.p.circle(spout[0], spout[1], 6);
      } else {
        // Unselected spout
        this.p.stroke(this.isDarkMode ? 255 : 0);
        this.p.noFill();
        this.p.circle(spout[0], spout[1], 8);
      }
    });
  }

  private updateAndDrawBalls() {
    const currentTime = this.p.millis();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.drops.forEach((droplet, index) => {
      // Apply physics
      applyPhysics(droplet, deltaTime);

      // Check collisions
      for (let i = index + 1; i < this.drops.length; i++) {
        handleDropletCollision(droplet, this.drops[i]);
      }
      handleWallCollision(droplet, this.outlineData.vertices);

      // Draw ball
      this.p.fill(droplet.color);
      this.p.noStroke();
      this.p.circle(droplet.x, droplet.y, droplet.size);
    });
  }

  render() {
    this.p.background(this.isDarkMode ? 0 : 240);

    if (this.hasWon && this.backgroundImage) {
      this.p.image(this.backgroundImage, 0, 0, 800, 600);
    }

    this.drawOutline();
    this.drawSpout();
    this.updateAndDrawBalls();
  }
}