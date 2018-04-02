/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
declare module 'geotiff';
declare module 'raster-marching-squares';
declare module 'hammerjs';
declare module 'mapbox.js';