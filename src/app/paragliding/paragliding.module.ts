import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatCardModule,
  MatListModule,
  MatSidenavModule,
  MatDividerModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';
import { ParaglidingComponent } from './paragliding.component';

@NgModule({
  declarations: [
    ParaglidingComponent
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    ParaglidingComponent
  ],
})
export class ParaglidingModule { }