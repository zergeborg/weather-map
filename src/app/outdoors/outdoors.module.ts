import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
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