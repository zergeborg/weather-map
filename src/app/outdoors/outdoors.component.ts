import { NavigatorComponent } from '../common/navigator.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import UrlTile from 'ol/source/urltile';
import LayerTile from 'ol/layer/tile';
import SourceOSM from 'ol/source/osm';
import Map from 'ol/map';
import Control from 'ol/control';
import View from 'ol/view';
import Extent from 'ol/extent';
import ProjProjection from 'ol/proj/projection';
import * as proj from 'ol/proj';
import LayerImage from 'ol/layer/image';
import SourceImageCanvas from 'ol/source/imagecanvas';

import * as d3 from 'd3';
import * as geojson from 'geojson';
import * as topojson from 'topojson';

@Component({
  selector: 'app-outdoors',
  templateUrl: './outdoors.component.html',
  styleUrls: ['./outdoors.component.scss']
})
export class OutdoorsComponent extends NavigatorComponent implements OnInit {

  constructor(public r: Router) {
    super(r);
  }

  ngOnInit() {
    let openOutdoorsLayer = new LayerTile({
      source: new SourceOSM({
        attributions: [
          'All maps © <a href="http://www.thunderforest.com/">Thunderforest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
          SourceOSM.ATTRIBUTION
        ] as ol.Attribution[],
        url: 'https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png' +
            '?apikey=3a4bba40613f436a8a550277e8bfcb54'
      })
    });
  
  let map = new Map({
      layers: [
        openOutdoorsLayer
      ],
      target: 'map',
      controls: Control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }),
      view: new View({
        maxZoom: 18,
        center: proj.default.fromLonLat([139.7594549, 35.6828387]),
        zoom: 5
      })
    });

  let path = d3.geoPath();

  let url = "https://raw.githubusercontent.com/Fogetti/land/master/japan.topojson"
  d3.json(url).then(function(topology: topojson.Topology) {

    console.log("topojson", topology)
    let geojson = topojson.feature(topology, topology.objects.japan) as geojson.Feature<any, any>;
    console.log("geojson", geojson)

    /**
      * This function uses d3 to render the topojson features to a canvas.
      * @param {ol.Extent} extent Extent.
      * @param {number} resolution Resolution.
      * @param {number} pixelRatio Pixel ratio.
      * @param {ol.Size} size Size.
      * @param {Projection} projection Projection.
      * @return {HTMLCanvasElement} A canvas element.
      */
    let japan = function(extent, resolution, pixelRatio, size, projection) {

        let canvasWidth = size[0];
        let canvasHeight = size[1];

        let svg = d3.select(document.createElement('canvas'));
        svg.attr("width", canvasWidth).attr("height", canvasHeight);

        let context = svg.node().getContext('2d');

        let d3Projection = d3.geoMercator().scale(1).translate([0, 0]);
        let d3Path = d3.geoPath().projection(d3Projection);

        let pixelBounds = d3Path.bounds(geojson);
        let pixelBoundsWidth = pixelBounds[1][0] - pixelBounds[0][0];
        let pixelBoundsHeight = pixelBounds[1][1] - pixelBounds[0][1];

        let geoBounds = d3.geoBounds(geojson);
        let geoBoundsLeftBottom = proj.default.transform(
            geoBounds[0], 'EPSG:4326', projection);
        let geoBoundsRightTop = proj.default.transform(
            geoBounds[1], 'EPSG:4326', projection);
        let geoBoundsWidth = geoBoundsRightTop[0] - geoBoundsLeftBottom[0];
        if (geoBoundsWidth < 0) {
          geoBoundsWidth += Extent.getWidth(projection.getExtent());
        }
        let geoBoundsHeight = geoBoundsRightTop[1] - geoBoundsLeftBottom[1];

        let widthResolution = geoBoundsWidth / pixelBoundsWidth;
        let heightResolution = geoBoundsHeight / pixelBoundsHeight;
        let r = Math.max(widthResolution, heightResolution);
        let scale = r / (resolution / pixelRatio);

        let center = proj.default.transform(Extent.getCenter(extent), projection, 'EPSG:4326');
        d3Projection.scale(scale).center(center).translate([canvasWidth / 2, canvasHeight / 2]);
        d3Path = d3Path.projection(d3Projection).context(context);
        d3Path(geojson);
        context.stroke();

        return svg.node();
      }

      let layer = new LayerImage({
        source: new SourceImageCanvas({
          canvasFunction: japan,
          projection: 'EPSG:3857'
        })
      });
      map.addLayer(layer);
    });

  }
}
