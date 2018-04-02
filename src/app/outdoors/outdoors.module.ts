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
import { OutdoorsComponent } from './outdoors.component';

@NgModule({
  declarations: [
    OutdoorsComponent
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
    OutdoorsComponent
  ],
})
export class OutdoorsModule { }