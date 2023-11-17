import { Injectable, signal } from '@angular/core';
import { AccountInfo } from '@azure/msal-browser';
import { Market } from '../shared/models/market.model';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  public state = {
    $currentUser: signal<AccountInfo | undefined>(undefined),
    $myMarkets: signal<Market[]>([])
  }

  public setCurrentUser(user: AccountInfo | undefined) {
    this.state.$currentUser.set(user);
  }

  public setMyMarkets(markets: Market[]) {
    this.state.$myMarkets.set(markets);
  }

  constructor() { }
}
