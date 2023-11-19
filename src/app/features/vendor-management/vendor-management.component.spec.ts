import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorManagementComponent } from './vendor-management.component';

describe('VendorManagementComponent', () => {
  let component: VendorManagementComponent;
  let fixture: ComponentFixture<VendorManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorManagementComponent]
    });
    fixture = TestBed.createComponent(VendorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
