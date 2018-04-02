import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatSidenavModule,
  MatButtonToggleModule,
  MatButtonModule,
  MatListModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatAutocompleteModule,
  MatOptionModule
} from '@angular/material';
import { CanvasTemperatureComponent } from './canvas-temperature.component';
import { SVGTemperatureComponent } from './svg-temperature.component';

@NgModule({
  declarations: [
    CanvasTemperatureComponent,
    SVGTemperatureComponent
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatOptionModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CanvasTemperatureComponent,
    SVGTemperatureComponent
  ],
})
export class TemperatureModule { }