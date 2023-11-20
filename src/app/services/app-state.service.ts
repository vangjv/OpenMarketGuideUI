import { Injectable, signal } from '@angular/core';
import { AccountInfo } from '@azure/msal-browser';
import { Market } from '../shared/models/market.model';
import { Vendor } from '../shared/models/vendor.model';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  public state = {
    $currentUser: signal<AccountInfo | undefined>(undefined),
    $myMarkets: signal<Market[]>([]),
    $myVendors: signal<Vendor[]>([])
  }

  public setCurrentUser(user: AccountInfo | undefined) {
    this.state.$currentUser.set(user);
  }

  public setMyMarkets(markets: Market[]) {
    this.state.$myMarkets.set(markets);
  }

  public setMyVendors(vendors: Vendor[]) {
    this.state.$myVendors.set(vendors);
  }

  constructor() { }
}
