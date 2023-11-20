import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Vendor } from '../shared/models/vendor.model';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  submitVendor(vendor: Vendor): Observable<Vendor> {
    return this.http.post<Vendor>(this.apiUrl + 'vendors', vendor);
  }

  getVendorsByCurrentUser(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.apiUrl + 'vendors/me').pipe(
      map((vendors: Vendor[]) => {
        return vendors;
      })
    );
  }

}
