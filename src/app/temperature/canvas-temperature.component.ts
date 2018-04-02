import { PrefectureService } from '../common/prefecture.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as t from './temperature';
import * as geojson from 'geojson';
import * as topojson from 'topojson';
import * as geotiff from 'geotiff';
import * as rms from 'raster-marching-squares';
import * as d3 from 'd3';

@Component({
  selector: 'app-canvas-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.scss']
})
export class CanvasTemperatureComponent extends t.TemperatureComponent implements OnInit {

  constructor(
    private ps: PrefectureService,
    private r: Router) {
    super(ps,r);
  }

  render(tiffData: ArrayBuffer, svg: d3.Selection<any, any, any, any>, path: any, prefectures) {
    let context = this.getSvg().node().getContext('2d');
    let tiff = geotiff.parse(tiffData);
    let image = tiff.getImage();
    let rasters = image.readRasters();
    let tiepoint = image.getTiePoints()[0];
    let pixelScale = image.getFileDirectory().ModelPixelScale;
    let geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1*pixelScale[1]];

    let tempData = this.temperatureData(image, rasters);

    context.beginPath();
    context.fillStyle = "#aaa";
    path(prefectures);
    context.fill();

    let intervalsTemp = [-22, -19, -16, -13, -10, -7, -4, -1, 2, 5, 8, 11, 14,17,20,23,26,29, 32, 35, 38];
    let bandsTemp = rms.isobands(tempData, geoTransform, intervalsTemp);
    let colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain([38, -22]);

    bandsTemp.features.forEach(function(d, i) {
        context.beginPath();
        context.globalAlpha = 0.8;
        context.fillStyle = colorScale(intervalsTemp[i]);
        path(d);
        context.fill();
    });

    context.beginPath();
      context.strokeStyle = "#000";
      context.lineWidth = 1.5;
      context.globalAlpha = 0.5;
      path(prefectures);
      context.stroke();
  }

  getPath(projection: d3.GeoProjection) {
    let context = this.getSvg().node().getContext('2d');
    return d3.geoPath().projection(projection).context(context);
  }

  getSvg() {
    let svg = d3.select("#viewport").append("canvas") as d3.Selection<any, any, any, any>;
    svg.attr("width", this.width).attr("height", this.height).attr("style", "width: 100%;height: 100%;");
    return svg;
  }
}
