
export class CoordinateData {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static fromCesiumPosition(position: any): CoordinateData {
    let coordinateData = new CoordinateData(position.x, position.y, position.z);
    return coordinateData;
  }

  static fromCesiumEntity(entity: any): CoordinateData {
    let coordinateData = new CoordinateData(entity.position.getValue().x, entity.position.getValue().y, entity.position.getValue().z);
    return coordinateData;
  }
}
