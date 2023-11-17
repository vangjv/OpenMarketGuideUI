import { BaseEntity } from "./base-entity.model";
import { Boundary } from "./boundary.model";
import { CoordinateData } from "./coordinate-data.model";
import { MarketLocation } from "./market-location.model";
import { MarketUser } from "./market-user.model";
import { OMGType } from "./omg-type.enum";
import { ThreeDModelEntity } from "./three-d-model-entity.model";
import { VendorLocation } from "./vendor-location.model";
import { Vendor } from "./vendor.model";

export class Market extends BaseEntity {
  name: string = "";
  description?: string;
  state?: string;
  location?: CoordinateData;
  marketLocation?: MarketLocation;
  vendorLocations?: VendorLocation[] = [];
  threeDModelEntities?: ThreeDModelEntity[] = [];
  vendors?:Vendor[] = [];
  marketUsers?:MarketUser[] = [];

  static buildMarket(name:string, location:CoordinateData, marketLocation:MarketLocation, vendorLocations:VendorLocation[], threeDModelEntities?: ThreeDModelEntity[]):Market {
    let market = new Market();
    market.name = name;
    market.location = location;
    market.marketLocation = marketLocation;
    market.vendorLocations = vendorLocations;
    market.threeDModelEntities = threeDModelEntities
    return market;
  };

  initialize(name:string, location:CoordinateData, marketLocation:MarketLocation) {
    this.name = name;
    this.location = location;
    this.marketLocation = marketLocation;
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

  static buildUpdatedMarketFromCesiumEntities(market:Market, entities:any[]) {
    let updatedMarket:Market = new Market();
    updatedMarket.id = market.id
    updatedMarket.name = market.name;
    updatedMarket.description = market.description;
    updatedMarket.state = market.state;
    let vendorLocations:VendorLocation[] = [];
    let threeDModelEntities:ThreeDModelEntity[] = [];
    entities.forEach(entity => {
      if (entity.omgType == OMGType.MarketLocation) {
        updatedMarket.marketLocation = MarketLocation.fromCesiumEntity(entity);
      } else if (entity.omgType == OMGType.VendorLocation) {
        vendorLocations.push(VendorLocation.fromCesiumEntity(entity));
      } else if (entity.omgType == OMGType.Market3DModel) {
        threeDModelEntities.push(ThreeDModelEntity.fromCesiumEntity(entity));
      } else if (entity.omgType == OMGType.Vendor3DModel) {
        threeDModelEntities.push(ThreeDModelEntity.fromCesiumEntity(entity));
      }
    });
    updatedMarket.threeDModelEntities = threeDModelEntities;
    updatedMarket.vendorLocations = vendorLocations;
    return updatedMarket;
  }
}
