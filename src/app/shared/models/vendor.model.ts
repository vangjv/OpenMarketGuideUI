import { ContactInfo } from "./contact-info.model";
import { Product } from "./product.model";

export class Vendor {
  id?: string;
  name: string;
  primaryContactName: string;
  primaryContactTitle: string;
  categories: string[];
  contactInfo: ContactInfo;
  products?: Product[];
  billboardImageUrl?: string;
  billboardScale?: number;

  constructor(name: string, primaryContactName: string, primaryContactTitle: string, categories: string[], contactInfo: ContactInfo) {
    this.name = name;
    this.primaryContactName = primaryContactName;
    this.primaryContactTitle = primaryContactTitle;
    this.categories = categories;
    this.contactInfo = contactInfo;
  }
}
