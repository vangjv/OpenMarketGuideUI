import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Vendor } from 'src/app/shared/models/vendor.model';
import { VendorLocation } from '../../models/vendor-location.model';
import { CesiumService } from 'src/app/services/cesium.service';

@Component({
  selector: 'app-vendor-cards',
  templateUrl: './vendor-cards.component.html',
  styleUrls: ['./vendor-cards.component.scss']
})
export class VendorCardsComponent {
  @Input() vendorLocations: VendorLocation[] = [];
  @Output() onVendorLocationSelection: EventEmitter<VendorLocation> = new EventEmitter<VendorLocation>();

  constructor() { }
  viewVendor(vendor:Vendor) {

  }

  assignVendor(vendor:Vendor) {

  }

  addVendor() {
  }

  onVendorLocationClicked(vendorLocation:VendorLocation) {
    this.onVendorLocationSelection.emit(vendorLocation);
  }
}

