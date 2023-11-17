import { Component, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from 'src/app/services/app-state.service';
import { Market } from 'src/app/shared/models/market.model';

@Component({
  selector: 'app-my-markets',
  templateUrl: './my-markets.component.html',
  styleUrls: ['./my-markets.component.scss']
})
export class MyMarketsComponent implements OnInit {
  myMarkets: Market[] = [];
  constructor(private appStateService:AppStateService, private router:Router) {
    effect(() => {
      this.myMarkets = this.appStateService.state.$myMarkets();
    });
   }

  ngOnInit(): void {
    console.log("mymarkets:", this.myMarkets);
  }

  navigateToMarket(market: Market) {
    this.router.navigate(['/market-viewer', market.id]);
  }
}
