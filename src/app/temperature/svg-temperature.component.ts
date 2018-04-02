import { PrefectureService } from '../common/prefecture.service';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators/map';
import { Router } from '@angular/router';

import * as t from './temperature';
import * as geojson from 'geojson';
import * as topojson from 'topojson';
import * as geotiff from 'geotiff';
import * as rms from 'raster-marching-squares';
import * as d3 from 'd3';

@Component({
  selector: 'app-svg-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.scss']
})
export class SVGTemperatureComponent extends t.TemperatureComponent implements OnInit {
  active: boolean;
  g: d3.Selection<any, any, any, any>;
  stateCtrl: FormControl;
  filteredPrefectures: Observable<any[]>;
  selectedPrefecture: string;
  topoFeaturesById: any;

  constructor(
    private ps: PrefectureService,
    private r: Router) {
    super(ps,r);
    this.stateCtrl = new FormControl();
    this.filteredPrefectures = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(state => state ? this.filterPrefectures(state) : this.prefectureList.slice())
      );
  }

  filterPrefectures(name: string) {
    return this.prefectureList.filter(prefecture =>
      prefecture.nam.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  prefectureClicked(prefecture) {
    Observable
    .of(this.topoFeaturesById)
    .map(data => Object.keys(data).reduce((acc, curr) => {
      acc[data[curr].properties.id] = data[curr];
      return acc;
    }, {}))
    .subscribe(data => this.clicked(data[prefecture.id]));
  }

  render(tiffData: ArrayBuffer, svg: d3.Selection<any, any, any, any>, path: any, prefectures) {
    let self = this;
    let tiff = geotiff.parse(tiffData);
    let image = tiff.getImage();
    let rasters = image.readRasters();
    let tiepoint = image.getTiePoints()[0];
    let pixelScale = image.getFileDirectory().ModelPixelScale;
    let geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1 * pixelScale[1]];

    let tempData = this.temperatureData(image, rasters);

    let intervalsTemp = [-22, -19, -16, -13, -10, -7, -4, -1, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38];
    let bandsTemp = rms.isobands(tempData, geoTransform, intervalsTemp);
    let colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([38, -22]);

    svg.append("rect")
      .attr("class", "background")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("click", (path) => { self.clicked(path) });

    let zoom = d3.zoom().scaleExtent([self.height, 8 * self.height]);
    this.g = svg.append("g").call(zoom);
    
    bandsTemp.features.forEach(function (d, i) {
      svg.select("g").insert("path", ".streamline")
        .datum(d)
        .attr("d", path)
        .style("fill", colorScale(intervalsTemp[i]))
        .style("stroke", "None");
    });

    this.topoFeaturesById = (topojson.feature(this.topojson, this.topojson.objects.japan) as any).features as any[];
    let centroids = this.topoFeaturesById.map((feature) => path.centroid(feature));
    let radius = 6, fill = "rgba(255, 49, 255, 0.388)", stroke = "rgba(0, 0, 0, 0.5)", strokeWidth = 0.1;

    this.g.selectAll(".labels")
      .data(this.topoFeaturesById)
      .enter().append("text")
      .attr("class", "labels")
      .style("opacity", "0.5")
      .style("font-size", "0.5em")
      .style("font-weight", "300")
      .attr("x", function (d: any) { return path.centroid(d)[0] - 10; })
      .attr("y", function (d: any) { return path.centroid(d)[1]; })
      .text(function (d: any) { return d.properties.nam; });

    this.drawPrefectures(this.g, this.topoFeaturesById, path, self, svg);

    svg.on("zoom", () => {
      self.projection.translate(d3.event.translate).scale(d3.event.scale);
      svg.selectAll("path").attr("d", path);
    });
  }

  drawPrefectures(g: d3.Selection<d3.BaseType, any, any, any>, topoFeaturesById: any[], path: any, self: this, svg: d3.Selection<any, any, any, any>) {
    g.selectAll(".prefectures")
      .data(topoFeaturesById)
      .enter().append("path")
      .attr("d", path)
      .attr("class", "prefectures")
      .style("opacity", "0.4")
      .on("click", (path) => { self.clicked(path) });
  }

  reset() {
    this.svg.selectAll("g").transition().duration(750).attr("transform", "translate(0,0)scale(1)");
  }

  clicked(d) {
    var x, y, k;

    if (d != undefined) {
      var centroid = this.path.centroid(d);
      x = centroid[0], y = centroid[1], k = 4;
    } else {
      x = this.width / 2, y = this.height / 2, k = 1;
    }

    this.g.selectAll("path");
    this.g.transition()
        .duration(750)
        .attr("transform",
          "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
  }

  getPath(projection: d3.GeoProjection) {
    return d3.geoPath().projection(projection);
  }

  getSvg() {
    let svg = d3.select("#viewport").append("svg") as d3.Selection<any, any, any, any>;
    svg.attr("width", this.width).attr("height", this.height);
    return svg;
  }
}
