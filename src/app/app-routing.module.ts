import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { GoodsListingComponent } from './features/goods-listing/goods-listing.component';
import { GoodsDetailsComponent } from './features/goods-details/goods-details.component';
import { MarketSetupComponent } from './features/market-setup/market-setup.component';
import { MarketViewerComponent } from './features/market-viewer/market-viewer.component';
import { MapExplorerComponent } from './features/map-explorer/map-explorer.component';
import { BrowserUtils } from '@azure/msal-browser';
import { MsalGuard } from '@azure/msal-angular';
import { MyMarketsComponent } from './features/my-markets/my-markets.component';
import { MarketInstanceViewerComponent } from './features/market-instance-viewer/market-instance-viewer.component';
import { VendorSignupComponent } from './features/vendor-signup/vendor-signup.component';
import { VendorManagementComponent } from './features/vendor-management/vendor-management.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'market-setup',
    component: MarketSetupComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'vendor-signup',
    component: VendorSignupComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'vendor-management',
    component: VendorManagementComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'market-viewer/:marketid',
    component: MarketViewerComponent
  },
  {
    path: 'market-instance/:marketinstanceid',
    component: MarketInstanceViewerComponent
  },
  {
    path: 'map',
    component: MapExplorerComponent
  },
  {
    path: 'my-markets',
    component: MyMarketsComponent,
    canActivate: [MsalGuard]
   },
  {
    path: 'goods-listing',
    component: GoodsListingComponent
  },
  {
    path: 'goods-details',
    component: GoodsDetailsComponent
  }

];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Don't perform initial navigation in iframes or popups
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' // Set to enabledBlocking to use Angular Universal
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
