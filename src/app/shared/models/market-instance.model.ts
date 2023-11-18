import { BaseEntity } from "./base-entity.model";
import { CoordinateData } from "./coordinate-data.model";
import { MarketLocation } from "./market-location.model";
import { MarketUser } from "./market-user.model";
import { ThreeDModelEntity } from "./three-d-model-entity.model";
import { VendorLocation } from "./vendor-location.model";
import { Vendor } from "./vendor.model";

export class MarketInstance extends BaseEntity {
  name: string = "";
  marketId?:string;
  description?: string;
  state?: string;
  location?: CoordinateData;
  marketLocation?: MarketLocation;
  vendorLocations?: VendorLocation[] = [];
  threeDModelEntities?: ThreeDModelEntity[] = [];
  vendors?:Vendor[] = [];
  marketUsers?:MarketUser[] = [];
  startDate?:Date;
  endDate?:Date;
}
