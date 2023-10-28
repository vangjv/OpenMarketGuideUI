import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  isMapView = signal(false);

  toggleMapView(value:boolean) {
    this.isMapView.set(value);
  }
  // private _isMapView = new BehaviorSubject<boolean>(false);

  // get isMapView(): boolean {
  //   return this._isMapView.value;
  // }

  // set isMapView(value: boolean) {
  //   this._isMapView.next(value);
  // }

  // get isMapViewChanged() {
  //   return this._isMapView.asObservable();
  // }

}
