import { Component, OnInit, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ScreenService } from '../services/screen.service';
import { filter } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AppStateService } from '../services/app-state.service';
import { AccountInfo } from '@azure/msal-browser';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  activeTab = 0;
  isMapView: Signal<boolean> = signal(false);
  currentUser: AccountInfo | undefined;
  currentUserInitials: string = "";
  userMenu: MenuItem[] = [
    {
      label: 'Sign in',
      icon: 'pi pi-fw pi-sign-in',
      command: () => {
        this.authService.login();
      }
    }
  ];
  constructor(private router: Router, private screenService: ScreenService, private appStateService: AppStateService, private authService: AuthService) {
    effect(() => {
      this.currentUser = this.appStateService.state.$currentUser();
      this.currentUserInitials = this.getInitialsFromToken(this.currentUser);
      console.log("this.currentUser", this.currentUser);
      if (this.currentUser === undefined) {
        this.setNoLoggedInUserMenu();
      } else {
        this.setLoggedInUserMenu();
      }
    });
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      if (url === '/') {
        this.activeTab = 0;
        this.screenService.toggleMapView(false);
      } else if (url === '/map') {
        this.activeTab = 1;
        this.screenService.toggleMapView(true);
      } else if (url.startsWith ('/market-viewer')) {
        this.screenService.toggleMapView(true);
      } else if (url.startsWith ('/market-instance')) {
        this.screenService.toggleMapView(true);
      } else if (url === '/market-setup') {
        this.activeTab = 2;
        this.screenService.toggleMapView(false);
      } else if (url === '/my-markets') {
        this.activeTab = 3;
        this.screenService.toggleMapView(false);
      } else {
        this.activeTab = 4
        this.screenService.toggleMapView(false);
      }
      //this.checkMapViewBasedOnTabIndex();
    });
    this.isMapView = computed(() => {
      return this.screenService.isMapView();
    });
  }

  getInitialsFromToken(currentUser: AccountInfo | undefined) {
    if (currentUser) {
      if (currentUser.idTokenClaims) {
        let firstName = currentUser.idTokenClaims['given_name'] as string[];
        let lastName = currentUser.idTokenClaims['family_name'] as string[];
        return (firstName[0] + lastName[0]).toUpperCase();
      }
    }
    return "";
  }

  setLoggedInUserMenu() {
    this.userMenu = [];
    this.userMenu.push({
      label: 'Become a Vendor',
      icon: 'pi pi-fw pi-shopping-cart',
      command: () => {
        this.router.navigate(['/vendor-signup']);
      }
    });
    this.userMenu.push({
      label: 'Sign out',
      icon: 'pi pi-fw pi-sign-out',
      command: () => {
        this.authService.logout();
      }
    });
  }

  setNoLoggedInUserMenu() {
    this.userMenu = [
      {
        label: 'Sign in',
        icon: 'pi pi-fw pi-sign-in',
        command: () => {
          this.authService.login();
        }
      }
    ];
  }

  checkMapViewBasedOnTabIndex() {
    if (this.activeTab === 0) {
      this.screenService.toggleMapView(false);
    }
    if (this.activeTab === 1) {
      this.screenService.toggleMapView(true);
    }
    if (this.activeTab === 2) {
      this.screenService.toggleMapView(true);
    }
    if (this.activeTab === 3) {
      this.screenService.toggleMapView(false);
    }
    if (this.activeTab === 4) {
      this.screenService.toggleMapView(false);
    }
  }

  navigateToTab(tabIndex: number) {
    this.activeTab = tabIndex;
    if (tabIndex === 0) {
      this.router.navigate(['/']);
      this.screenService.toggleMapView(false);
    }
    if (tabIndex === 1) {
      this.router.navigate(['/map']);
      this.screenService.toggleMapView(true);
    }
    if (tabIndex === 2) {
      this.router.navigate(['/market-setup']);
      this.screenService.toggleMapView(true);
    }
    if (tabIndex === 3) {
      this.router.navigate(['/my-markets']);
      this.screenService.toggleMapView(false);
    }
  }
}
