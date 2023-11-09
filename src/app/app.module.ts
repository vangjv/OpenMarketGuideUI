import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CesiumComponent } from './features/cesium/cesium.component';
import {StyleClassModule} from 'primeng/styleclass';
import { HomeComponent } from './features/home/home.component';
import { LayoutComponent } from './layout/layout.component';
import { ButtonModule } from 'primeng/button';
import { GoodsListingComponent } from './features/goods-listing/goods-listing.component';
import { GoodsDetailsComponent } from './features/goods-details/goods-details.component';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SpeedDialModule } from 'primeng/speeddial';
import { MessageService } from 'primeng/api';
import { MarketSetupComponent } from './features/market-setup/market-setup.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SidebarModule } from 'primeng/sidebar';

@NgModule({
  declarations: [
    AppComponent,
    CesiumComponent,
    HomeComponent,
    LayoutComponent,
    GoodsListingComponent,
    GoodsDetailsComponent,
    MarketSetupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StyleClassModule,
    ButtonModule,
    DialogModule,
    DynamicDialogModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    ColorPickerModule,
    SpeedDialModule,
    OverlayPanelModule,
    SidebarModule
  ],
  providers: [
    DialogService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
