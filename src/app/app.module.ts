import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CesiumComponent } from './features/cesium/cesium.component';
import { StyleClassModule } from 'primeng/styleclass';
import { HomeComponent } from './features/home/home.component';
import { LayoutComponent } from './layout/layout.component';
import { ProductsListingComponent } from './features/products-listing/products-listing.component';
import { GoodsDetailsComponent } from './features/goods-details/goods-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MarketSetupComponent } from './features/market-setup/market-setup.component';
import { ModelPickerComponent } from './features/market-setup/model-picker/model-picker.component';
import { MarketViewerComponent } from './features/market-viewer/market-viewer.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MapExplorerComponent } from './features/map-explorer/map-explorer.component';
import { CesiumService } from './services/cesium.service';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalRedirectComponent, ProtectedResourceScopes } from '@azure/msal-angular';
import { environment } from 'src/environments/environment';
import { MyMarketsComponent } from './features/my-markets/my-markets.component';
import { MarketInstancesComponent } from './features/market-instances/market-instances.component';
import { MarketInstanceViewerComponent } from './features/market-instance-viewer/market-instance-viewer.component';
import { VendorCardsComponent } from './shared/components/vendor-cards/vendor-cards.component';
import { PrimeModule } from './prime/prime.module';
import { MapDetailsComponent } from './shared/components/map-details/map-details.component';
import { OMGRouteReuseStrategy } from './omg-route-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';
import { VendorSignupComponent } from './features/vendor-signup/vendor-signup.component';
import { VendorManagementComponent } from './features/vendor-management/vendor-management.component';
import { LoadingSpinnerModule } from './shared/loadingspinner/loadingspinner.module';
import { VendorProfileComponent } from './features/vendor-management/vendor-profile/vendor-profile.component';
import { VendorProductsComponent } from './features/vendor-management/vendor-products/vendor-products.component';
import { VendorMarketsComponent } from './features/vendor-management/vendor-markets/vendor-markets.component';
import { VendorInvitationsComponent } from './features/vendor-management/vendor-invitations/vendor-invitations.component';
import { VendorNotificationsComponent } from './features/vendor-management/vendor-notifications/vendor-notifications.component';
import { VendorReviewsComponent } from './features/vendor-management/vendor-reviews/vendor-reviews.component';
import { QRCodeModule } from 'angularx-qrcode';

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId,
      authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
      redirectUri: environment.redirectUri,
      postLogoutRedirectUri: '/',
      knownAuthorities: [environment.b2cPolicies.authorityDomain]
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
    system: {
      allowNativeBroker: false, // Disables WAM Broker
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Verbose,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<ProtectedResourceScopes>>();
  //protect only Post requests.  unauthenticated users should be able to get markets
  let protectedResourceScopesPost: ProtectedResourceScopes = {
    httpMethod: "POST",
    scopes: ["https://openmarketguide.onmicrosoft.com/api-access/api-access"]
  };
  let protectedResourceScopesPut: ProtectedResourceScopes = {
    httpMethod: "PUT",
    scopes: ["https://openmarketguide.onmicrosoft.com/api-access/api-access"]
  };
  let protectedResourceScopesGet: ProtectedResourceScopes = {
    httpMethod: "GET",
    scopes: ["https://openmarketguide.onmicrosoft.com/api-access/api-access"]
  };
  protectedResourceMap.set("https://openmarketguideapi.azurewebsites.net/api/markets", [protectedResourceScopesPost, protectedResourceScopesPut]);
  protectedResourceMap.set("https://openmarketguideapi.azurewebsites.net/api/vendors", [protectedResourceScopesPost, protectedResourceScopesPut]);
  protectedResourceMap.set("https://openmarketguideapi.azurewebsites.net/api/marketinstances", [protectedResourceScopesPut, protectedResourceScopesPost]);
  protectedResourceMap.set("https://openmarketguideapi.azurewebsites.net/api/markets/me", [protectedResourceScopesGet]);
  protectedResourceMap.set("https://openmarketguideapi.azurewebsites.net/api/vendors/me", [protectedResourceScopesGet]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...environment.apiConfig.scopes],
    },
    loginFailedRoute: '/login-failed'
  };
}

@NgModule({
  declarations: [
    AppComponent,
    CesiumComponent,
    HomeComponent,
    LayoutComponent,
    ProductsListingComponent,
    GoodsDetailsComponent,
    MarketSetupComponent,
    ModelPickerComponent,
    MarketViewerComponent,
    VendorCardsComponent,
    MapExplorerComponent,
    MyMarketsComponent,
    MarketInstancesComponent,
    MarketInstanceViewerComponent,
    MapDetailsComponent,
    VendorSignupComponent,
    VendorManagementComponent,
    VendorProfileComponent,
    VendorProductsComponent,
    VendorMarketsComponent,
    VendorInvitationsComponent,
    VendorNotificationsComponent,
    VendorReviewsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StyleClassModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    MsalModule,
    PrimeModule,
    LoadingSpinnerModule,
    QRCodeModule
  ],
  providers: [
    CesiumService,
    [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: MsalInterceptor,
        multi: true
      },
      {
        provide: MSAL_INSTANCE,
        useFactory: MSALInstanceFactory
      },
      {
        provide: MSAL_GUARD_CONFIG,
        useFactory: MSALGuardConfigFactory
      },
      {
        provide: MSAL_INTERCEPTOR_CONFIG,
        useFactory: MSALInterceptorConfigFactory
      },
      MsalService,
      MsalGuard,
      MsalBroadcastService
    ],
    { provide: RouteReuseStrategy, useClass: OMGRouteReuseStrategy }
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
