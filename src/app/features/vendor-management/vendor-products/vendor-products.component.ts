import { Component, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppStateService } from 'src/app/services/app-state.service';
import { VendorService } from 'src/app/services/vendor.service';
import { LoadingService } from 'src/app/shared/loadingspinner/loading.service';
import { Product } from 'src/app/shared/models/product.model';
import { Vendor } from 'src/app/shared/models/vendor.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-vendor-products',
  templateUrl: './vendor-products.component.html',
  styleUrls: ['./vendor-products.component.scss']
})
export class VendorProductsComponent implements OnInit {
  addProductForm: FormGroup;
  showAddProduct:boolean = false;
  currentVendor?:Vendor;
  productImageStorageBaseUrl = environment.productImageStorageBaseUrl;
  constructor(private formBuilder: FormBuilder, private vendorService:VendorService, private appStateService:AppStateService,
    private loadingService:LoadingService, private messageService:MessageService) {
    this.addProductForm = this.createAddProductForm();
    effect(() => {
      this.currentVendor = this.appStateService.state?.$myVendors()[0];
    });
  }

  ngOnInit(): void {
  }


  createAddProductForm() {
    return this.formBuilder.group({
      id: [self.crypto.randomUUID(), Validators.required],
      name: ['', Validators.required],
      description: [''],
      imageFile: [''],
      categories: [null],
      price: [null],
      taxPercentage: [null],
      unit: [''],
      availability: [true]
    });
  }

  addProduct(){
    let newProduct: Product = new Product();
    newProduct.id = this.addProductForm.get('id')?.value;
    newProduct.name = this.addProductForm.get('name')?.value;
    newProduct.description = this.addProductForm.get('description')?.value;
    newProduct.categories = this.addProductForm.get('categories')?.value;
    newProduct.price = this.addProductForm.get('price')?.value;
    newProduct.taxPercentage = this.addProductForm.get('taxPercentage')?.value;
    newProduct.unit = this.addProductForm.get('unit')?.value;
    newProduct.availability = this.addProductForm.get('availability')?.value;
    console.log("new product:", newProduct);
    if (this.currentVendor?.id) {
      this.loadingService.incrementLoading();
      this.vendorService.addProduct(this.addProductForm.get('imageFile')?.value, this.currentVendor?.id, newProduct).subscribe({
        next: (updatedVendor) => {
          console.log("updated vendor:", updatedVendor);
          this.showAddProduct = false;
          this.loadingService.decrementLoading();
          this.messageService.add({
            key: 'primary',
            severity: 'custom-2',
            summary: 'Success',
            closable: false,
            detail: 'You product was successfully added',
            contentStyleClass: 'p-0'
          });
          this.appStateService.setMyVendors([updatedVendor]);
          this.addProductForm.reset();
          this.addProductForm = this.createAddProductForm();
        },
        error: (e) => console.error(e)
      });
      this.showAddProduct = false;
    }
  }

  onImageSelected(event: Event) {
    if (event.target) {
      const files = (event.target as HTMLInputElement).files; // Here we use only the first file (single file)
      if (files && files.length > 0) {
        this.addProductForm.get('imageFile')?.setValue(files[0]);
      }
    }
  }
}
