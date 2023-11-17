import { Boundary } from "./boundary.model";
import { OMGType } from "./omg-type.enum";

export class VendorLocation {
  id?: string;
  name?: string;
  description?: string;
  isAvailable?: boolean;
  boundary?: Boundary;
  omgType?: OMGType;
  static fromCesiumEntity(entity: any): VendorLocation {
    let vendorLocation = new VendorLocation();
    vendorLocation.id = entity.id;
    vendorLocation.name = entity.name;
    vendorLocation.description = entity.description;
    vendorLocation.boundary = Boundary.fromCesiumEntity(entity);
    vendorLocation.omgType = entity.omgType;
    return vendorLocation;
  }
}
