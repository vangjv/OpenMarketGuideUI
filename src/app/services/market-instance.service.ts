import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Market } from '../shared/models/market.model';
import { MarketInstance } from '../shared/models/market-instance.model';
import { MarketInstanceRequest } from '../shared/models/market-instance-request.model';
import { AssignVendorRequest } from '../shared/models/assign-vendor-request.model';

@Injectable({
  providedIn: 'root'
})
export class MarketInstanceService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getMarketInstancesByMarketId(marketId:string): Observable<MarketInstance[]> {
    return this.http.get<MarketInstance[]>(this.apiUrl + 'marketinstances/bymarketid/' + marketId).pipe(
      map((marketInstances: MarketInstance[]) => {
        // Perform any necessary transformations on the data here
        return marketInstances;
      })
    );
  }

  getMarketInstanceById(marketInstanceId:string): Observable<MarketInstance> {
    return this.http.get<MarketInstance>(this.apiUrl + 'marketinstances/' + marketInstanceId).pipe(
      map((marketInstance: MarketInstance) => {
        // Perform any necessary transformations on the data here
        return marketInstance;
      })
    );
  }

  createMarketInstance(marketId:string, startDate:Date, endDate:Date): Observable<MarketInstance> {
    let marketInstanceRequest:MarketInstanceRequest = {
      marketId: marketId,
      startDate: startDate,
      endDate: endDate
    }
    return this.http.post<MarketInstance>(this.apiUrl + 'marketinstances', marketInstanceRequest).pipe(
      map((marketInstances: MarketInstance) => {
        // Perform any necessary transformations on the data here
        return marketInstances;
      })
    );
  }

  updateMarketInstance(marketInstance: MarketInstance): Observable<MarketInstance> {
    return this.http.put<MarketInstance>(this.apiUrl + 'marketinstances/' + marketInstance.id, marketInstance);
  }

  assignVendorToVendorLocation(marketInstanceId:string, assignVendorRequest: AssignVendorRequest): Observable<MarketInstance> {
    return this.http.post<MarketInstance>(this.apiUrl + 'marketinstances/' + marketInstanceId + "/vendor", assignVendorRequest);
  }

}
