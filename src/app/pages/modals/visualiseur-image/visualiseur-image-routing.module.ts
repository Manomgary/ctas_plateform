import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisualiseurImagePage } from './visualiseur-image.page';

const routes: Routes = [
  {
    path: '',
    component: VisualiseurImagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisualiseurImagePageRoutingModule {}
