import { Component } from '@angular/core';

export enum VendorTab {
  Profile = "Profile",
  Products = "Products",
  Markets = "Markets",
  Invitations = "Invitations",
  Notifications = "Notifications",
  Reviews = "Reviews"
}

@Component({
  selector: 'app-vendor-management',
  templateUrl: './vendor-management.component.html',
  styleUrls: ['./vendor-management.component.scss']
})
export class VendorManagementComponent {
  VendorTab = VendorTab;
  activeTab: VendorTab = VendorTab.Profile;
}
