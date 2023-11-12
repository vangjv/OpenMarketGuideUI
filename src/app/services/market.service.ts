import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Market } from '../shared/models/market.model';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getMarkets(): Observable<Market[]> {
    return this.http.get<Market[]>(this.apiUrl + 'markets').pipe(
      map((markets: Market[]) => {
        // Perform any necessary transformations on the data here
        return markets;
      })
    );
  }

}
