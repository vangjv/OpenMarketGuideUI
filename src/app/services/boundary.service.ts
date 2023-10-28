import { Inject, Injectable } from '@angular/core';
import { TemporaryPolygon } from '../shared/models/temporary-polygon.model';
import { CesiumService } from './cesium.service';
declare let Cesium: any;
@Injectable({
  providedIn: 'root'
})
export class BoundaryService {
  private drawing:boolean = false;
  private positions:any[] = [];
  private polygons:any[] = [];
  private labels:any[] = [];

  private temporaryPolygonPoints:any[] = [];
  private temporaryPolygon:any;
  private drawnPolygon:any;
  private temporaryPoints:any[] = [];
  constructor(@Inject('viewer') private viewer:any) { }

  addDrawPolygonButton(){
    //add button
    const toolbar = document.querySelector("div.cesium-viewer-toolbar");
    const modeButton = document.querySelector("span.cesium-sceneModePicker-wrapper");
    const myButton = document.createElement("button");
    myButton.classList.add("cesium-button", "cesium-toolbar-button");
    myButton.innerHTML = "+";
    if (toolbar) {
      toolbar.insertBefore(myButton, modeButton);
    }

    myButton.addEventListener("click", () => {
      if (this.drawing) {
        this.drawing = false;
        myButton.innerHTML = "+";
        this.removeDrawPolygonFunctionality();
      } else {
        this.drawing = true;
        myButton.innerHTML = "-";
        this.addDrawPolygonFunctionality();
      }
    });

  }

  addDrawPolygonFunctionality(){
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    handler.setInputAction((event:any)=> {
      let earthPosition;
      // `earthPosition` will be undefined if our mouse is not over the globe.
      let pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        earthPosition = this.viewer.scene.pickPosition(event.position);
      }
      if (Cesium.defined(earthPosition)) {
        if (this.temporaryPolygonPoints.length === 0){
          this.temporaryPoints.push(this.createPoint(earthPosition));
          this.temporaryPolygonPoints.push(earthPosition);
          const dynamicPositions = new Cesium.CallbackProperty(()=> {
              return new Cesium.PolygonHierarchy(this.temporaryPolygonPoints);
          }, false);
          this.temporaryPolygon = this.drawPolygon(dynamicPositions);
        } else {
          this.temporaryPolygonPoints.push(earthPosition);
          this.temporaryPoints.push(this.createPoint(earthPosition));
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((event:any)=> {
      this.terminateShape();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  removeDrawPolygonFunctionality(){
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  // Redraw the shape so it's not dynamic and remove the dynamic shape.
  terminateShape() {
    this.drawnPolygon = this.drawPolygon(this.temporaryPolygonPoints);
    this.removeTemporaryPoints();
    this.viewer.entities.remove(this.temporaryPolygon);
    this.temporaryPoints = [];
    this.temporaryPolygon = undefined;
    this.temporaryPolygonPoints = [];
  }

  createPoint(worldPosition:any, guid:string = self.crypto.randomUUID()) {
    const point = this.viewer.entities.add({
      id: guid,
      position: worldPosition,
      point: {
        color: Cesium.Color.WHITE,
        pixelSize: 5,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    return point;
  }

  drawPolygon(positionData:any, guid:string = self.crypto.randomUUID()) {
    let polygon = this.viewer.entities.add({
        id: guid,
        polygon: {
          hierarchy: positionData,
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.WHITE.withAlpha(0.7)
          ),
        },
      });
    return polygon;
  }

  removeTemporaryPoints(){
    this.temporaryPoints.forEach((point:any) => {
      CesiumService.removeEntityById(this.viewer, point.id)
    });
  }


}
