import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorReviewsComponent } from './vendor-reviews.component';

describe('VendorReviewsComponent', () => {
  let component: VendorReviewsComponent;
  let fixture: ComponentFixture<VendorReviewsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorReviewsComponent]
    });
    fixture = TestBed.createComponent(VendorReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
