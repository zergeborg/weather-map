import * as c from './constants';
import * as u from './util';
import { Windy } from './windy';

export class Animate {
  colorStyles;
  buckets;
  g = this.params.canvas.getContext("2d");
  particles = [];

  constructor(private params, private bounds, private field) {
    this.colorStyles = this.windIntensityColorScale(c.INTENSITY_SCALE_STEP, c.MAX_WIND_INTENSITY);
    this.buckets = this.colorStyles.map(function () { return []; });
    let particleCount = Math.round(bounds.width * c.PARTICLE_MULTIPLIER);
    particleCount *= c.PARTICLE_REDUCTION;

    let fadeFillStyle = "rgba(0, 0, 0, 0.90)";

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(field.randomize({ age: Math.floor(Math.random() * c.MAX_PARTICLE_AGE) + 0 }));
    }

    this.g.lineWidth = c.PARTICLE_LINE_WIDTH;
    this.g.fillStyle = fadeFillStyle;
  }

  animate(windy: Windy) {
    let self = this;
    (function frame() {
      try {
        windy.timer = setTimeout(function () {
          requestAnimationFrame(frame);
          self.evolve(windy);
          self.draw(windy);
        }, 1 * 1000 / c.FRAME_RATE);
      }
      catch (e) {
        console.error(e);
      }
    })();
  }

  evolve(windy: Windy) {
    let self = this;
    this.buckets.forEach(function (bucket) { bucket.length = 0; });
    this.particles.forEach(function (particle) {
      if (particle.age > c.MAX_PARTICLE_AGE) {
        windy.field.randomize(particle).age = 0;
      }
      let x = particle.x;
      let y = particle.y;
      let v = windy.field(x, y);  // vector at current position
      let m = v[2];
      if (m === null) {
        particle.age = c.MAX_PARTICLE_AGE;  // particle has escaped the grid, never to return...
      }
      else {
        let xt = x + v[0];
        let yt = y + v[1];
        if (windy.field(xt, yt)[2] !== null) {
          // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
          particle.xt = xt;
          particle.yt = yt;
          self.buckets[self.colorStyles.indexFor(m)].push(particle);
        }
        else {
          // Particle isn't visible, but it still moves through the field.
          particle.x = xt;
          particle.y = yt;
        }
      }
      particle.age += 1;
    });
  }

  draw(windy: Windy) {
    let self = this;
    // Fade existing particle trails.
    let prev = this.g.globalCompositeOperation;
    this.g.globalCompositeOperation = "destination-in";
    this.g.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    this.g.globalCompositeOperation = prev;

    // Draw new particle trails.
    this.buckets.forEach(function (bucket, i) {
      if (bucket.length > 0) {
        self.g.beginPath();
        self.g.strokeStyle = self.colorStyles[i];
        bucket.forEach(function (particle) {
          self.g.moveTo(particle.x, particle.y);
          self.g.lineTo(particle.xt, particle.yt);
          particle.x = particle.xt;
          particle.y = particle.yt;
        });
        self.g.stroke();
      }
    });
  }

  asColorStyle(r, g, b, a) {
    return "rgba(" + 243 + ", " + 243 + ", " + 238 + ", " + a + ")";
  }

  hexToR(h) { return parseInt((this.cutHex(h)).substring(0, 2), 16) }
  hexToG(h) { return parseInt((this.cutHex(h)).substring(2, 4), 16) }
  hexToB(h) { return parseInt((this.cutHex(h)).substring(4, 6), 16) }
  cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }

  windIntensityColorScale(step, maxWind) {

    let result = [];
    let start_hue = 2 * Math.PI / 3; // 2π/3 = g, 4π/3 = b; g = 
    for (let i = 0; i < 11; i++) {
      let h = start_hue + i * 3.52 / 11; // = 120 / 11
      let rgb_arr = u.interpolate(h, 1, 0.5);
      let r = Math.floor(rgb_arr[0]);
      let g = Math.floor(rgb_arr[1]);
      let b = Math.floor(rgb_arr[2]);
      let rgba_str = "rgba(" + r + ", " + g + ", " + b + ", 0.7)";
      result.push(rgba_str);
    };

    Array.prototype.indexFor = function (m) {  // map wind speed to a style
      return Math.floor(Math.min(m, maxWind) / maxWind * (result.length - 1));
    };

    return result;
  }

}