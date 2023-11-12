import { CesiumColor } from "./cesium-color.model";
import { CoordinateData } from "./coordinate-data.model";

export class ThreeDModelEntity {
  id?:string;
  name?:string;
  model?:ThreeDModel;
  position?:CoordinateData;
  orientation?:Orientation;
  show?:boolean = true;

  static fromCesiumEntity(entity: any): ThreeDModelEntity {
    let threeDModelEntity = new ThreeDModelEntity();
    threeDModelEntity.id = entity.id;
    threeDModelEntity.name = entity.name;
    threeDModelEntity.model = ThreeDModel.fromCesiumEntity(entity);
    threeDModelEntity.position = CoordinateData.fromCesiumPosition(entity.position.getValue());
    threeDModelEntity.orientation = Orientation.fromCesiusmEntity(entity);
    threeDModelEntity.show = entity.show;
    return threeDModelEntity;
  }
}

export class ThreeDModel {
  color:any;
  maxiumumScale:any;
  minimumPixelSize:any;
  scale?:number;
  uri?:string;
  silouetteColor?:any;
  silouetteSize?:any;
  lightColor?:any;
  heightReference?:any;

  static fromCesiumEntity(entity:any) : ThreeDModel {
    let threeDModel = new ThreeDModel();
    threeDModel.color = entity.model.color ?  CesiumColor.fromCesiumColor(entity.model.color.getValue()) : undefined;
    threeDModel.maxiumumScale = entity.model.maximumScale ? entity.model.maximumScale : undefined;
    threeDModel.minimumPixelSize = entity.model.minimumPixelSize ? entity.model.minimumPixelSize : undefined;
    threeDModel.scale = entity.model.scale ? entity.model.scale.getValue() : undefined;
    threeDModel.uri = entity.model.uri ? entity.model.uri.getValue() : undefined;
    threeDModel.silouetteColor = entity.model.silhouetteColor? CesiumColor.fromCesiumColor(entity.model.silhouetteColor.getValue()) : undefined;
    threeDModel.silouetteSize = entity.model.silhouetteSize ? entity.model.silhouetteSize.getValue() : undefined;
    threeDModel.lightColor = entity.model.lightColor ? CesiumColor.fromCesiumColor(entity.model.lightColor.getValue()) : undefined;
    threeDModel.heightReference = entity.model.heightReference ? entity.model.heightReference.getValue() : undefined;
    return threeDModel;
  }
}

export class Orientation {
  x?: number;
  y?: number;
  z?: number;
  w?: number;

  static fromCesiumOrientation(orientation: any): Orientation {
    let orientationData = new Orientation();
    orientationData.x = orientation.x;
    orientationData.y = orientation.y;
    orientationData.z = orientation.z;
    orientationData.w = orientation.w;
    return orientationData;
  }

  static fromCesiusmEntity(entity: any): Orientation {
    let orientationData = new Orientation();
    orientationData.x = entity.orientation.getValue().x;
    orientationData.y = entity.orientation.getValue().y;
    orientationData.z = entity.orientation.getValue().z;
    orientationData.w = entity.orientation.getValue().w;
    return orientationData;
  }
}
