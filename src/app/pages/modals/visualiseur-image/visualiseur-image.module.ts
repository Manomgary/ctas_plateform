import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisualiseurImagePageRoutingModule } from './visualiseur-image-routing.module';

import { VisualiseurImagePage } from './visualiseur-image.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisualiseurImagePageRoutingModule
  ],
  declarations: [VisualiseurImagePage]
})
export class VisualiseurImagePageModule {}
