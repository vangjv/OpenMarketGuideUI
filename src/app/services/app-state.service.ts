import { Injectable, signal } from '@angular/core';
import { AccountInfo } from '@azure/msal-browser';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  public state = {
    $currentUser: signal<AccountInfo | undefined>(undefined),
  }

  public setCurrentUser(user: AccountInfo | undefined) {
    this.state.$currentUser.set(user);
  }
  constructor() { }
}
