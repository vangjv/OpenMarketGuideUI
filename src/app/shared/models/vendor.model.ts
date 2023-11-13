import { ContactInfo } from "./contact-info.model";

export class Vendor {
  vendorId: string;
  name: string;
  primaryContactName: string;
  primaryContactTitle: string;
  category: string;
  contactInfo: ContactInfo;

  constructor(vendorId: string, name: string, primaryContactName: string, primaryContactTitle: string, category: string, contactInfo: ContactInfo) {
    this.vendorId = vendorId;
    this.name = name;
    this.primaryContactName = primaryContactName;
    this.primaryContactTitle = primaryContactTitle;
    this.category = category;
    this.contactInfo = contactInfo;
  }
}
