import { CesiumColor } from "./cesium-color.model";
import { CoordinateData } from "./coordinate-data.model";

//Boundary is Cesium's Polygon
export class Boundary {
    boundaryPositions: CoordinateData[] = [];
    outline: boolean = true;
    color:CesiumColor = new CesiumColor();
    outlineColor: CesiumColor = new CesiumColor();
    outlineWidth: number = 1;
    position?: CoordinateData;

    static fromCesiumEntity(entity: any): Boundary {
      let boundary = new Boundary();
      if (entity.polygon.hierarchy.getValue().positions && entity.polygon.hierarchy.getValue().positions.length > 0) {
        entity.polygon.hierarchy.getValue().positions.forEach((position: any) => {
          let coordinateData = new CoordinateData(position.x, position.y, position.z);
          boundary.boundaryPositions.push(coordinateData);
        });
      }
      if (entity.polygon.position?.getValue()) {
        let positionData = new CoordinateData(entity.polygon.position?.getValue().x, entity.polygon.position?.getValue().y, entity.polygon.position?.getValue().z);
        boundary.position = positionData;
      }
      if (entity.polygon.outline.getValue() !== undefined) {
        boundary.outline = entity.polygon.outline.getValue();
      }
      if (entity.polygon.material.getValue().color) {
        boundary.color = CesiumColor.fromCesiumColor(entity.polygon.material.getValue().color);
      }
      if (entity.polygon.outlineColor.getValue()) {
        boundary.outlineColor = CesiumColor.fromCesiumColor(entity.polygon.outlineColor.getValue());
      }
      if (entity.polygon.outlineWidth.getValue()) {
        boundary.outlineWidth = entity.polygon.outlineWidth.getValue();
      }
      return boundary;
    }
}
