import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CesiumComponent } from './features/cesium/cesium.component';
import { HomeComponent } from './features/home/home.component';
import { GoodsListingComponent } from './features/goods-listing/goods-listing.component';
import { GoodsDetailsComponent } from './features/goods-details/goods-details.component';
import { MarketSetupComponent } from './features/market-setup/market-setup.component';
import { MarketViewerComponent } from './features/market-viewer/market-viewer.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'market-setup', component: MarketSetupComponent },
  { path: 'market-viewer', component: MarketViewerComponent },
  { path: 'map', component: CesiumComponent },
  { path: 'goods-listing', component: GoodsListingComponent },
  { path: 'goods-details', component: GoodsDetailsComponent }

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
