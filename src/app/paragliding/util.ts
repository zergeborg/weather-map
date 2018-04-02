import * as c from './constants';
import { Windy } from './windy';

/**
https://github.com/mapbox/fischer-color/blob/master/index.js
  * @param h hue in range of [0..2π]
  * @param c chroma in [0..1]
  * @param l luminosity in range of [0..1]
  * @returns Array of [r, g, b] values.
  */
export function interpolate(h, c, l): number[] {
  'use strict';

  // unpack for the lazy
  if (Array.isArray(h)) {
    c = h[1]; l = h[2]; h = h[0];
  }

  // put red at the right
  h = h + (Math.PI / 2 - (Math.PI - 2));

  // keep chroma in range for this lightness
  if (c > 1 - 2 * Math.abs(l - 0.5)) {
    c = 1 - 2 * Math.abs(l - 0.5);
  }

  let r1 = Math.sin(h + Math.PI - 2.0) * 0.417211 * c + l,
    g1 = Math.sin(h + Math.PI + 1.5) * 0.158136 * c + l,
    b1 = Math.sin(h + Math.PI) * 0.455928 * c + l;

  return [
    // red
    Math.exp(Math.log(r1 * 0.923166 + 0.0791025) * 1.25) * 255,
    // green
    Math.exp(Math.log(g1 * 0.923166 + 0.0791025) * 1.25) * 255,
    // blue
    Math.exp(Math.log(b1 * 0.923166 + 0.0791025) * 1.25) * 255];
}

export function interpolateField(windy: Windy, grid, bounds, extent, callback) {
  let self = this;
  let projection = {};
  let velocityScale = bounds.height * c.VELOCITY_SCALE;

  let columns = [];
  let x = bounds.x;

  function interpolateColumn(x) {
    let column = [];
    for (let y = bounds.y; y <= bounds.yMax; y += 2) {
      let coord = self.invert(x, y, extent);
      if (coord) {
        let λ = coord[0], φ = coord[1];
        if (isFinite(λ)) {
          let wind = grid.interpolate(λ, φ);
          if (wind) {
            wind = self.distort(projection, λ, φ, x, y, velocityScale, wind, extent);
            column[y + 1] = column[y] = wind;

          }
        }
      }
    }
    columns[x + 1] = columns[x] = column;
  }

  (function batchInterpolate() {
    let start = Date.now();
    while (x < bounds.width) {
      interpolateColumn(x);
      x += 2;
      if ((Date.now() - start) > 1000) { //MAX_TASK_TIME) {
        setTimeout(batchInterpolate, 25);
        return;
      }
    }
    windy.createField(columns, bounds, callback);
  })();
};

/**
 * @returns {Boolean} true if the specified value is not null and not undefined.
 */
export function isValue(x) {
  return x !== null && x !== undefined;
}

/**
 * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
 *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
 */
export function floorMod(a, n) {
  return a - n * Math.floor(a / n);
}

/**
 * @returns {Number} the value x clamped to the range [low, high].
 */
export function clamp(x, range) {
  return Math.max(range[0], Math.min(x, range[1]));
}

/**
 * @returns {Boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
 */
export function isMobile() {
  return (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i).test(navigator.userAgent);
}

/**
 * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
 * vector is modified in place and returned by this function.
 */
export function distort(projection, λ, φ, x, y, scale, wind, windy) {
  let u = wind[0] * scale;
  let v = wind[1] * scale;
  let d = this.distortion(projection, λ, φ, x, y, windy);

  // Scale distortion vectors by u and v, then add.
  wind[0] = d[0] * u + d[2] * v;
  wind[1] = d[1] * u + d[3] * v;
  return wind;
};

export function distortion(projection, λ, φ, x, y, windy) {
  let τ = 2 * Math.PI;
  let H = Math.pow(10, -5.2);
  let hλ = λ < 0 ? H : -H;
  let hφ = φ < 0 ? H : -H;

  let pλ = this.project(φ, λ + hλ, windy);
  let pφ = this.project(φ + hφ, λ, windy);

  // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1º λ
  // changes depending on φ. Without this, there is a pinching effect at the poles.
  let k = Math.cos(φ / 360 * τ);
  return [
    (pλ[0] - x) / hλ / k,
    (pλ[1] - y) / hλ / k,
    (pφ[0] - x) / hφ,
    (pφ[1] - y) / hφ
  ];
};

// interpolation for vectors like wind (u,v,m)
export function bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
  let rx = (1 - x);
  let ry = (1 - y);
  let a = rx * ry, b = x * ry, c = rx * y, d = x * y;
  let u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
  let v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
  return [u, v, Math.sqrt(u * u + v * v)];
};

export function deg2rad(deg) {
  return (deg / 180) * Math.PI;
};

export function rad2deg(ang) {
  return ang / (Math.PI / 180.0);
};

export function invert(x, y, windy) {
  let mapLonDelta = windy.east - windy.west;
  let worldMapRadius = windy.width / this.rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
  let mapOffsetY = (worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south))));
  let equatorY = windy.height + mapOffsetY;
  let a = (equatorY - y) / worldMapRadius;

  let lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
  let lon = this.rad2deg(windy.west) + x / windy.width * this.rad2deg(mapLonDelta);
  return [lon, lat];
};

export function mercY(lat) {
  return Math.log(Math.tan(lat / 2 + Math.PI / 4));
};

export function project(lat, lon, windy) { // both in radians, use deg2rad if neccessary
  let ymin = this.mercY(windy.south);
  let ymax = this.mercY(windy.north);
  let xFactor = windy.width / (windy.east - windy.west);
  let yFactor = windy.height / (ymax - ymin);

  let y = this.mercY(this.deg2rad(lat));
  let x = (this.deg2rad(lon) - windy.west) * xFactor;
  y = (ymax - y) * yFactor; // y points south
  return [x, y];
};