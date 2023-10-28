import { Component, OnInit, Signal, computed, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ScreenService } from '../services/screen.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  activeTab = 0;
  isMapView: Signal<boolean> = signal(false);

  constructor(private router:Router, private screenService:ScreenService) { }


  ngOnInit(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      if (url === '/') {
        this.activeTab = 0;
      } else if (url === '/map') {
        this.activeTab = 1;
      } else {
        this.activeTab = 2;
      }
      this.checkMapViewBasedOnTabIndex();
    });
    this.isMapView = computed(() => {
      return this.screenService.isMapView();
    });
  }

  checkMapViewBasedOnTabIndex(){
    if (this.activeTab === 0) {
      this.screenService.toggleMapView(false);
    }
    if (this.activeTab === 1) {
      this.screenService.toggleMapView(true);
    }
    if (this.activeTab === 2) {
      this.screenService.toggleMapView(true);
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
      this.router.navigate(['/map']);
      this.screenService.toggleMapView(true);
    }
  }
}
