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

  constructor(id: string, name: string, primaryContactName: string, primaryContactTitle: string, categories: string[], contactInfo: ContactInfo) {
    this.id = id;
    this.name = name;
    this.primaryContactName = primaryContactName;
    this.primaryContactTitle = primaryContactTitle;
    this.categories = categories;
    this.contactInfo = contactInfo;
  }
}
