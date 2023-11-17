import { Boundary } from "./boundary.model";
import { OMGType } from "./omg-type.enum";

export class MarketLocation {
  id?: string;
  name?: string;
  description?: string;
  isAvailable?: boolean;
  boundary?: Boundary;
  omgType: OMGType = OMGType.MarketLocation;
  static fromCesiumEntity(entity: any): MarketLocation {
    let marketLocation = new MarketLocation();
    marketLocation.id = entity.id;
    marketLocation.name = entity.name;
    marketLocation.description = entity.description;
    marketLocation.boundary = Boundary.fromCesiumEntity(entity);
    return marketLocation;
  }
}
