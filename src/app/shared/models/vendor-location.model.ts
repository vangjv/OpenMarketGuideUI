import { Boundary } from "./boundary.model";

export class VendorLocation {
  id?: string;
  name?: string;
  description?: string;
  isAvailable?: boolean;
  boundary?: Boundary;

  static fromCesiumEntity(entity: any): VendorLocation {
    let vendorLocation = new VendorLocation();
    vendorLocation.id = entity.id;
    vendorLocation.name = entity.name;
    vendorLocation.description = entity.description;
    vendorLocation.boundary = Boundary.fromCesiumEntity(entity);
    return vendorLocation;
  }
}
