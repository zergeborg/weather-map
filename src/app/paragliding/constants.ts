export var VELOCITY_SCALE = 1 / 30000;           // scale for wind velocity (completely arbitrary--this value looks nice)
export var INTENSITY_SCALE_STEP = 10;            // step size of particle intensity color scale
export var MAX_WIND_INTENSITY = 10;              // wind velocity at which particle intensity is maximum (m/s)
export var MAX_PARTICLE_AGE = 10;                // max number of frames a particle is drawn before regeneration
export var PARTICLE_LINE_WIDTH = 1.1;            // line width of a drawn particle
export var PARTICLE_MULTIPLIER = 6;              // particle count scalar (completely arbitrary--test)
export var PARTICLE_REDUCTION = 0.5;             // reduce particle count to this much of normal for mobile devices
export var FRAME_RATE = 20;                      // desired milliseconds per frame
export var BOUNDARY = 0.45;

export var NULL_WIND_VECTOR = [NaN, NaN, null];  // singleton for no wind in the form: [u, v, magnitude]
export var TRANSPARENT_BLACK = [255, 0, 0, 0];

export var τ = 2 * Math.PI;
export var H = Math.pow(10, -5.2);

declare global {
  interface Array<T> {
    indexFor(m: number): number;
  }
}

export class Constants {}