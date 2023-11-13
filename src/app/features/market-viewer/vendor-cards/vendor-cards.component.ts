import { Component, Input } from '@angular/core';
import { Vendor } from 'src/app/shared/models/vendor.model';

@Component({
  selector: 'app-vendor-cards',
  templateUrl: './vendor-cards.component.html',
  styleUrls: ['./vendor-cards.component.scss']
})
export class VendorCardsComponent {
  @Input() vendors: Vendor[] = [];

  viewVendor(vendor:Vendor) {

  }

  assignVendor(vendor:Vendor) {

  }
}

