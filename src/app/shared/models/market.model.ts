import { BaseEntity } from "./base-entity.model";
import { Boundary } from "./boundary.model";
import { CoordinateData } from "./coordinate-data.model";
import { ThreeDModelEntity } from "./three-d-model-entity.model";
import { VendorLocation } from "./vendor-location.model";

export class Market extends BaseEntity {
  name?: string;
  description?: string;
  state?: string;
  location?: CoordinateData;
  marketBoundary?: Boundary;
  vendorLocations?: VendorLocation[];
  threeDModelEntities?: ThreeDModelEntity[];

  static buildMarket(name:string, location:CoordinateData, marketBoundary:Boundary, vendorLocations:VendorLocation[], threeDModelEntities?: ThreeDModelEntity[]):Market {
    let market = new Market();
    market.name = name;
    market.location = location;
    market.marketBoundary = marketBoundary;
    market.vendorLocations = vendorLocations;
    market.threeDModelEntities = threeDModelEntities
    return market;
  }
}
