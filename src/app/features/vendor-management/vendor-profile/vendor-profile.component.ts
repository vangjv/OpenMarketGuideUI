import { Component, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AppStateService } from 'src/app/services/app-state.service';
import { VendorService } from 'src/app/services/vendor.service';
import { LoadingService } from 'src/app/shared/loadingspinner/loading.service';
import { Vendor } from 'src/app/shared/models/vendor.model';

@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styleUrls: ['./vendor-profile.component.scss']
})
export class VendorProfileComponent implements OnInit {
  vendorProfileForm: FormGroup;
  selectedVendor?:Vendor;
  constructor(private formBuilder: FormBuilder, private vendorService: VendorService, private messageService: MessageService,
    private router:Router, private loadingService: LoadingService, private appStateService:AppStateService) {
      this.vendorProfileForm = this.formBuilder.group({
        id:['', Validators.required],
        name: ['', Validators.required],
        primaryContactName: ['', Validators.required],
        primaryContactTitle: ['', Validators.required],
        phoneNumber: ['', Validators.required],
        emailAddress: ['', Validators.required],
        website: ['', Validators.required],
        categories: [null, Validators.required]
      });
      effect(() => {
        //set first vendor as vendor
        //TODO change this to a vendor selection for users who have multiple vendors tied to their account
        if (this.appStateService.state.$myVendors()[0]) {
          this.selectedVendor = this.appStateService.state.$myVendors()[0];
          this.vendorProfileForm.patchValue(this.selectedVendor);
          this.vendorProfileForm.get('phoneNumber')?.setValue(this.selectedVendor?.contactInfo?.phone);
          this.vendorProfileForm.get('emailAddress')?.setValue(this.selectedVendor?.contactInfo?.email);
          this.vendorProfileForm.get('website')?.setValue(this.selectedVendor?.contactInfo?.website);
        }
      })
  }

  ngOnInit(): void {


  }

  updateProfile(){

  }

}
