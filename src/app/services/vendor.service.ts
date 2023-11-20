import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Vendor } from '../shared/models/vendor.model';
import { Product } from '../shared/models/product.model';

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

  addProduct(file:File, vendorId: string, product: Product): Observable<any> {
    const formData = new FormData();
    formData.append('File', file, file.name);
    formData.append('ProductJson', JSON.stringify(product));
    return this.http.post<any>(this.apiUrl + 'vendors/' + vendorId + '/products', formData);
  }

}
