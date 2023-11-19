import { ContactInfo } from "./contact-info.model";
import { Product } from "./product.model";

export class Vendor {
  vendorId: string;
  name: string;
  primaryContactName: string;
  primaryContactTitle: string;
  category: string[];
  contactInfo: ContactInfo;
  products?: Product[];

  constructor(vendorId: string, name: string, primaryContactName: string, primaryContactTitle: string, category: string[], contactInfo: ContactInfo) {
    this.vendorId = vendorId;
    this.name = name;
    this.primaryContactName = primaryContactName;
    this.primaryContactTitle = primaryContactTitle;
    this.category = category;
    this.contactInfo = contactInfo;
  }
}
