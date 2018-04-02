import { Animate } from './animate';
import * as c from './constants';
import * as u from './util';

export class Windy {
  field: any;
  timer: any;

  constructor(private params: any) { }

  start(bounds, width, height, extent) {
    let self = this;
    let mapBounds = {
      south: u.deg2rad(extent[0][1]),
      north: u.deg2rad(extent[1][1]),
      east: u.deg2rad(extent[1][0]),
      west: u.deg2rad(extent[0][0]),
      width: width,
      height: height
    };

    stop();

    // build grid
    this.buildGrid(this.params.data, function (grid) {
      // interpolateField
      u.interpolateField(self, grid, self.buildBounds(bounds, width, height), mapBounds, function (windy, bounds, field) {
        // animate the canvas with random points 
        self.field = field;
        let a = new Animate(self.params, bounds, field);
        a.animate(self);
      });

    });
  };

  stop() {
    if (this.field) this.field.release();
    if (this.timer) clearTimeout(this.timer)
  };

  createWindBuilder(uComp, vComp) {
    let uData = uComp.data, vData = vComp.data;
    return {
      header: uComp.header,
      //recipe: recipeFor("wind-" + uComp.header.surface1Value),
      data: function (i) {
        return [uData[i], vData[i]];
      },
      interpolate: u.bilinearInterpolateVector
    }
  };

  createBuilder(data) {
    let uComp = null, vComp = null, scalar = null;

    data.forEach(function (record) {
      switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
        case "2,2": uComp = record; break;
        case "2,3": vComp = record; break;
        default:
          scalar = record;
      }
    });

    return this.createWindBuilder(uComp, vComp);
  };

  buildGrid(data, callback) {
    let builder = this.createBuilder(data);

    let header = builder.header;
    let λ0 = header.lo1, φ0 = header.la1;  // the grid's origin (e.g., 0.0E, 90.0N)
    let Δλ = header.dx, Δφ = -header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
    let ni = header.nx, nj = header.ny;    // number of grid points W-E and N-S (e.g., 144 x 73)
    let date = new Date(header.refTime);
    date.setHours(date.getHours() + header.forecastTime);

    //debugger;
    // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    let grid = [], p = 0;
    let isContinuous = Math.floor(ni * Δλ) >= 360;
    for (let j = 0; j < nj; j++) {
      let row = [];
      for (let i = 0; i < ni; i++ , p++) {
        row[i] = builder.data(p);
      }
      if (isContinuous) {
        // For wrapped grids, duplicate first column as last column to simplify interpolation logic
        row.push(row[0]);
      }
      grid[j] = row;
    }

    function interpolate(λ, φ) {
      let i = u.floorMod(λ - λ0, 360) / Δλ;  // calculate longitude index in wrapped range [0, 360)
      let j = (φ0 - φ) / Δφ;                 // calculate latitude index in direction +90 to -90

      let fi = Math.floor(i), ci = fi + 1;
      let fj = Math.floor(j), cj = fj + 1;

      let row;
      if ((row = grid[fj])) {
        let g00 = row[fi];
        let g10 = row[ci];
        if (u.isValue(g00) && u.isValue(g10) && (row = grid[cj])) {
          let g01 = row[fi];
          let g11 = row[ci];
          if (u.isValue(g01) && u.isValue(g11)) {
            // All four points found, so interpolate the value.
            return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
          }
        }
      }
      return null;
    }
    callback({
      date: date,
      interpolate: interpolate
    });
  };

  createField(columns, bounds, callback) {

    /**
     * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
     *          is undefined at that point.
     */
    function field(x, y) {
      let column = columns[Math.round(x)];
      return column && column[Math.round(y)] || c.NULL_WIND_VECTOR;
    }

    // Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
    // field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
    (field as any).release = function () {
      columns = [];
    };

    (field as any).randomize = function (o) {  // UNDONE: this method is terrible
      let x, y;
      let safetyNet = 0;
      do {
        x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
        y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y)
      } while (field(x, y)[2] === null && safetyNet++ < 30);
      o.x = x;
      o.y = y;
      return o;
    };

    //field.overlay = mask.imageData;
    //return field;
    callback(this, bounds, field);
  };

  buildBounds(bounds, width, height) {
    let upperLeft = bounds[0];
    let lowerRight = bounds[1];
    let x = Math.round(upperLeft[0]); //Math.max(Math.floor(upperLeft[0], 0), 0);
    let y = Math.max(Math.floor(upperLeft[1]), 0);
    let xMax = Math.min(Math.ceil(lowerRight[0]), width - 1);
    let yMax = Math.min(Math.ceil(lowerRight[1]), height - 1);
    return { x: x, y: y, xMax: width, yMax: yMax, width: width, height: height };
  };

}