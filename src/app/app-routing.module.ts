import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CesiumComponent } from './features/cesium/cesium.component';
import { HomeComponent } from './features/home/home.component';
import { GoodsListingComponent } from './features/goods-listing/goods-listing.component';
import { GoodsDetailsComponent } from './features/goods-details/goods-details.component';
import { MarketSetupComponent } from './features/market-setup/market-setup.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'marketsetup', component: MarketSetupComponent },
  { path: 'map', component: CesiumComponent },
  { path: 'goodslisting', component: GoodsListingComponent },
  { path: 'goodsdetails', component: GoodsDetailsComponent }

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
