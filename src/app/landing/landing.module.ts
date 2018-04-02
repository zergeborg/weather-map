import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatCardModule,
  MatListModule,
  MatGridListModule,
  MatIconModule,
  MatDividerModule
} from '@angular/material';
import { LandingComponent } from './landing.component';

@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatListModule,
    MatGridListModule,
    MatIconModule,
    MatDividerModule
  ],
  exports: [
    LandingComponent
  ],
})
export class LandingModule { }