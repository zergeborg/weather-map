
import {of as observableOf,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';
import { NavigatorComponent } from '../common/navigator.component';
import { PrefectureService } from '../common/prefecture.service';
import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import * as d3 from 'd3';
import * as topojson from 'topojson';

export abstract class TemperatureComponent extends NavigatorComponent {
  prefectures = {};
  prefectureList = [];
  width  = window.innerWidth;
  height = window.innerHeight;
  topoUrl = "https://raw.githubusercontent.com/Fogetti/land/master/japan.topojson";
  temperatureUrl = "data/gfs/20180331-japan-2m-above-ground-temp/gfs.t06z.pgrb2.0p25.geotiff/gfs.t06z.pgrb2.0p25.tif";
  tokyo = [139.7594549, 35.6828387] as [number, number];
  svg: d3.Selection<any, any, any, any>;
  path: d3.GeoPath<any, any>;
  projection = d3.geoMercator().center(this.tokyo).scale(1500).translate([this.width / 2, this.height / 2]);
  topojson: any;
  stateCtrl: FormControl;
  filteredPrefectures: Observable<any[]>;
  selectedPrefecture: string;

  constructor(
    private prefectureService: PrefectureService,
    private rt: Router) {
    super(rt);
    this.stateCtrl = new FormControl();
    this.prefectureService.getJSON().subscribe(data => {
      this.prefectures = data;
      this.makePrefectureList();
    });
   }

  makePrefectureList() {
    observableOf(this.prefectures).pipe(
    map(data => Object.keys(data).map(k => data[k])))
    .subscribe(data => this.prefectureList = data);
  }

  ngOnInit() {
    let self = this;
    self.svg = this.getSvg();  
    d3.buffer(this.temperatureUrl).then(function(tiffData) {
        return d3.json(self.topoUrl).then(function(topojsonData: topojson.Topology) {
          self.topojson = topojsonData;
          let prefectures = topojson.feature(topojsonData, topojsonData.objects.japan);
          self.path = self.getPath(self.projection);
          self.render(tiffData, self.svg, self.path, prefectures);  
        });
    });

    d3.select("#viewport").append("temperature");
  }

  ngOnDestroy() {
    this.svg.remove();
  }
  
  temperatureData(image: any, rasters: any) {
    let tempData = new Array(image.getHeight());
    for (let j = 0; j < image.getHeight(); j++) {
      tempData[j] = new Array(image.getWidth());
      for (let i = 0; i < image.getWidth(); i++) {
        tempData[j][i] = rasters[0][i + j * image.getWidth()];
      }
    }
    return tempData;
  }

  abstract getPath(projection: d3.GeoProjection): d3.GeoPath<any, any>;
  abstract getSvg(): d3.Selection<any, any, any, any>;
  abstract render(tiffData: ArrayBuffer, svg: d3.Selection<any, any, any, any>, path: any, prefectures): void;
}