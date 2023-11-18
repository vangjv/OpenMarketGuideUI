import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy,} from '@angular/router';
import { MarketViewerComponent } from './features/market-viewer/market-viewer.component';
import { MarketInstanceViewerComponent } from './features/market-instance-viewer/market-instance-viewer.component';

export class OMGRouteReuseStrategy implements RouteReuseStrategy {
  private routeStore = new Map<string, DetachedRouteHandle>();

  // Determines if a route should be stored
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  // Stores the provided route for later retrieval
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {

  }

  // Determines if a stored route should be attached
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  // Retrieves a stored route
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.routeStore.get(route.routeConfig?.path || "") as DetachedRouteHandle;
  }
  // Determines if a route should be reused
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (future.routeConfig && (future.routeConfig.component === MarketViewerComponent || future.routeConfig.component === MarketInstanceViewerComponent)) {
      return false;
    }
    return future.routeConfig === curr.routeConfig;
  }
}
