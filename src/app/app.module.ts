import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule, BREAKPOINT } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { OutdoorsComponent } from './outdoors/outdoors.component';
import { SVGTemperatureComponent } from './temperature/svg-temperature.component';
import { CanvasTemperatureComponent } from './temperature/canvas-temperature.component';
import { LandingComponent } from './landing/landing.component';
import { LandingModule } from './landing/landing.module';
import { ParaglidingModule } from './paragliding/paragliding.module';
import { TemperatureModule } from './temperature/temperature.module';
import { OutdoorsModule } from './outdoors/outdoors.module';
import { ParaglidingComponent } from './paragliding/paragliding.component';
import { PrefectureService } from './common/prefecture.service';

const appRoutes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: 'tourist', component: SVGTemperatureComponent },
  { path: 'outdoors', component: OutdoorsComponent },
  { path: 'paragliding', component: ParaglidingComponent },
  { path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    BrowserAnimationsModule,
    LandingModule,
    TemperatureModule,
    ParaglidingModule,
    OutdoorsModule,
    FlexLayoutModule,
    HttpClientModule
  ],
  providers: [
    PrefectureService,
    HttpClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
