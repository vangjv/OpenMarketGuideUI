import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { Vendor } from 'src/app/shared/models/vendor.model';
import { VendorLocation } from '../../models/vendor-location.model';
import { CesiumService } from 'src/app/services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarketInstanceService } from 'src/app/services/market-instance.service';
import { AssignVendorRequest } from '../../models/assign-vendor-request.model';
import { MarketInstance } from '../../models/market-instance.model';

@Component({
  selector: 'app-vendor-cards',
  templateUrl: './vendor-cards.component.html',
  styleUrls: ['./vendor-cards.component.scss']
})
export class VendorCardsComponent implements OnInit {
  @Input() marketInstanceId?:string;
  private _vendorLocations: VendorLocation[] = [];
  @Input()
  get vendorLocations(): VendorLocation[] {
    return this._vendorLocations;
  }
  set vendorLocations(value: VendorLocation[]) {
    this.calculatedRGBVendorColors = [];
    this._vendorLocations = value;
    this._vendorLocations.forEach(vendorLocation =>{
      if (vendorLocation?.boundary?.color) {
        this.calculatedRGBVendorColors.push(CesiumService.cesiumColorToRGB(vendorLocation?.boundary?.color));
      } else {
        this.calculatedRGBVendorColors.push('rgba(0,0,0,.3)');
      }
    });
  }
  @Output() onVendorLocationSelection: EventEmitter<VendorLocation> = new EventEmitter<VendorLocation>();
  @Output() onVendorAssigned: EventEmitter<MarketInstance> = new EventEmitter<MarketInstance>();
  calculatedRGBVendorColors: string[] = [];
  showAddVendor:boolean = false;
  addVendorForm:FormGroup = this.formBuilder.group({
    name: [null, Validators.required],
    categories: [null, Validators.required]
  });
  selectedVendorLocation?:VendorLocation;
  constructor(private formBuilder:FormBuilder, private marketInstanceService:MarketInstanceService) { }

  ngOnInit(): void {
    this.vendorLocations.forEach(vendorLocation =>{
      if (vendorLocation?.boundary?.color) {
        this.calculatedRGBVendorColors.push(CesiumService.cesiumColorToRGB(vendorLocation?.boundary?.color));
      } else {
        this.calculatedRGBVendorColors.push('rgba(0,0,0,.3)');
      }
    });
  }

  viewVendor(vendor:Vendor) {

  }

  assignVendor() {
    let assignVendorRequest:AssignVendorRequest = {
      vendorLocationId: this.selectedVendorLocation?.id,
      name: this.addVendorForm.value.name,
      categories: this.addVendorForm.value.categories
    };
    if (this.marketInstanceId) {
      this.marketInstanceService.assignVendorToVendorLocation(this.marketInstanceId, assignVendorRequest).subscribe((marketInstance) => {
        console.log("updated marketInstance:", marketInstance);
        this.showAddVendor = false;
        this.addVendorForm.reset();
        this.onVendorAssigned.emit(marketInstance);
      });
    }
  }

  showAddVendorForm(vendorLocation:VendorLocation){
    this.selectedVendorLocation = vendorLocation;
    this.addVendorForm.reset();
    this.showAddVendor = true;
  }

  onVendorLocationClicked(vendorLocation:VendorLocation) {
    this.onVendorLocationSelection.emit(vendorLocation);
  }
}

