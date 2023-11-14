import { Inject, Injectable } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { RedirectRequest, PopupRequest, InteractionType, AuthenticationResult } from '@azure/msal-browser';
import { environment } from 'src/environments/environment';
import { AppStateService } from './app-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
  private authService: MsalService, private appStateService: AppStateService,
  private msalBroadcastService: MsalBroadcastService) { }

  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();
    if (activeAccount) {
      this.appStateService.setCurrentUser(activeAccount);
    }
    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
        let accounts = this.authService.instance.getAllAccounts();
        this.authService.instance.setActiveAccount(accounts[0]);
        this.appStateService.setCurrentUser(accounts[0]);
    }
}

loginRedirect() {
    if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
    } else {
        this.authService.loginRedirect();
    }
}

login(userFlowRequest?: RedirectRequest | PopupRequest) {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginPopup({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(response.account);
                });
        } else {
            this.authService.loginPopup(userFlowRequest)
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(response.account);
                });
        }
    } else {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
        } else {
            this.authService.loginRedirect(userFlowRequest);
        }
    }
}

logout() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
        this.authService.logoutPopup({
            mainWindowRedirectUri: "/"
        });
    } else {
        this.authService.logoutRedirect();
    }
}

editProfile() {
    let editProfileFlowRequest: RedirectRequest | PopupRequest  = {
        authority: environment.b2cPolicies.authorities.editProfile.authority,
        scopes: [],
    };
    this.login(editProfileFlowRequest);
}

}
