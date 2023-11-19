import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { VendorService } from 'src/app/services/vendor.service';
import { ContactInfo } from 'src/app/shared/models/contact-info.model';
import { Vendor } from 'src/app/shared/models/vendor.model';


@Component({
  selector: 'app-vendor-signup',
  templateUrl: './vendor-signup.component.html',
  styleUrls: ['./vendor-signup.component.scss']
})
export class VendorSignupComponent implements OnInit {
  vendorForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private vendorService: VendorService, private messageService: MessageService,
    private router:Router) {
    this.vendorForm = this.formBuilder.group({
      name: ['', Validators.required],
      primaryContactName: ['', Validators.required],
      primaryContactTitle: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      emailAddress: ['', Validators.required],
      website: ['', Validators.required],
      categories: [null, Validators.required]
    });
  }

  ngOnInit() {

  }

  saveVendor() {
    let contactInfo = new ContactInfo();
    contactInfo.phone = this.vendorForm.value.phoneNumber;
    contactInfo.email = this.vendorForm.value.emailAddress;
    contactInfo.website = this.vendorForm.value.website;
    let vendor = new Vendor(this.vendorForm.value.name, this.vendorForm.value.primaryContactName, this.vendorForm.value.primaryContactTitle, this.vendorForm.value.categories, contactInfo);
    console.log("this.vendorForm.value", this.vendorForm.value);
    console.log("vendor:", vendor);
    this.vendorService.submitVendor(vendor).subscribe((data) => {
      this.messageService.add({
        key: 'primary',
        severity: 'custom-2',
        summary: 'Success',
        closable: false,
        detail: 'You have successfully signed up as a vendor',
        contentStyleClass: 'p-0'
      });
      this.router.navigate(['/vendor-management']);
    });
  }

}

