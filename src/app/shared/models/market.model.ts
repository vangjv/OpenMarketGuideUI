import { BaseEntity } from "./base-entity.model";
import { Boundary } from "./boundary.model";
import { CoordinateData } from "./coordinate-data.model";
import { MarketUser } from "./market-user.model";
import { ThreeDModelEntity } from "./three-d-model-entity.model";
import { VendorLocation } from "./vendor-location.model";
import { Vendor } from "./vendor.model";

export class Market extends BaseEntity {
  name?: string;
  description?: string;
  state?: string;
  location?: CoordinateData;
  marketBoundary?: Boundary;
  vendorLocations?: VendorLocation[] = [];
  threeDModelEntities?: ThreeDModelEntity[] = [];
  vendors?:Vendor[] = [];
  marketUsers?:MarketUser[] = [];

  static buildMarket(name:string, location:CoordinateData, marketBoundary:Boundary, vendorLocations:VendorLocation[], threeDModelEntities?: ThreeDModelEntity[]):Market {
    let market = new Market();
    market.name = name;
    market.location = location;
    market.marketBoundary = marketBoundary;
    market.vendorLocations = vendorLocations;
    market.threeDModelEntities = threeDModelEntities
    return market;
  };

  initialize(name:string, location:CoordinateData, marketBoundary:Boundary) {
    this.name = name;
    this.location = location;
    this.marketBoundary = marketBoundary;
  };

  addVendorLocations(vendorLocations:VendorLocation[]) {
    this.vendorLocations = vendorLocations;
  }

  addThreeDModelEntities(threeDModelEntities:ThreeDModelEntity[]) {
    this.threeDModelEntities = threeDModelEntities;
  }

  addVendor(vendor:Vendor) {
    this.vendors?.push(vendor)
  }

}
