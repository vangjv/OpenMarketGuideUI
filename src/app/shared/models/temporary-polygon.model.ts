export class TemporaryPolygon {
  id:string = "";
  activeShapePoints:any[] = [];
  constructor(){
    this.id =  self.crypto.randomUUID();
  }
}

