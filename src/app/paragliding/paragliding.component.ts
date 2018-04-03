declare let L : any;
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Windy } from './windy';
import { NavigatorComponent } from '../common/navigator.component';

import 'mapbox.js';

declare let windy: any;
declare let $: any;

@Component({
  selector: 'app-paragliding',
  templateUrl: './paragliding.component.html',
  styleUrls: ['./paragliding.component.scss']
})
export class ParaglidingComponent extends NavigatorComponent implements OnInit {
  START_LON = 139.5;
  START_LAT = 34.5;
  START_ZUM = 5;

  WINDY;
  CANVAS;
  MAP;

  constructor(public r: Router) {
    super(r);
  }

  ngOnInit() {
    let self = this;

    // whoa there! No Canvas, no can do!
    if (! document.createElement("canvas").getContext ) return alert("Sorry, this is for Canvas-enabled browsers.");

    // the map and the only baselayer
    self.MAP = L.map('map', {
        attributionControl: false
    }).setView([this.START_LAT, this.START_LON], this.START_ZUM);
    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png').addTo(self.MAP);

    this.initWind();

    self.MAP.on('moveend',function(){
      self.redrawWind();
    });
  }

  initWind() {
    let self = this;

    $.getJSON("data/gfs/20180402-japan-10m-above-ground-wind/20180402-wind.json", function (data) {
      let gfsdata = data;

      self.CANVAS = document.createElement('canvas');

      self.CANVAS.id = "CursorLayer";
      self.CANVAS.width = window.innerWidth;
      self.CANVAS.height = window.innerHeight;
      self.CANVAS.style.zIndex = 9;
      self.CANVAS.style.position = "absolute";
      document.getElementById("map").appendChild(self.CANVAS);

      self.WINDY = new Windy({ canvas: self.CANVAS, data: gfsdata });

      // and kick it off!
      self.redrawWind();
    });
  }

  redrawWind() {
    let self = this;

    self.WINDY.stop();

    let bnds = self.MAP.getBounds();
    let z = self.MAP.getZoom();
    let width = window.innerWidth;
    let height = window.innerHeight;

    self.CANVAS.width = width;
    self.CANVAS.height = window.innerHeight;

    let VELOCITY_SCALE = 1 / (3400 * z * z);              // scale for wind velocity (completely arbitrary--this value looks nice)
    let PARTICLE_LINE_WIDTH = 0.167 * z + 0.267;          // line width of a drawn particle
    let PARTICLE_MULTIPLIER = 32 * Math.pow(z, -1.28);    // particle count scalar (completely arbitrary--test)
    let PARTICLE_REDUCTION = 11.5 * Math.pow(z, -2.4);    // reduce particle count to this much of normal for mobile devices

    self.WINDY.start(
      [[0, 0], [width, height]],
      width,
      height,
      [[bnds.getWest(), bnds.getSouth()], [bnds.getEast(), bnds.getNorth()]]
    );
  }

}
