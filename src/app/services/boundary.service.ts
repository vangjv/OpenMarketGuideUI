import { Inject, Injectable } from '@angular/core';
import { CesiumService } from './cesium.service';
import { DialogsService } from './dialogs.service';
declare let Cesium: any;
@Injectable({
  providedIn: 'root'
})
export class BoundaryService {
  private drawing:boolean = false;
  private drawHandler:any;
  private temporaryBoundaryPoints:any[] = [];
  private temporaryBoundary:any;
  private drawnBoundary:any;
  private temporaryPoints:any[] = [];
  constructor(@Inject('viewer') private viewer:any, private dialogsService:DialogsService) { }

  addDrawBoundaryButton(){
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
        this.removeDrawBoundaryFunctionality();
        this.setDefaultClickFunctionality();
      } else {
        this.drawing = true;
        myButton.innerHTML = "-";
        this.addDrawBoundaryFunctionality();
      }
    });
  }

  add3DModelButton(){
    //add button
    const toolbar = document.querySelector("div.cesium-viewer-toolbar");
    const modeButton = document.querySelector("span.cesium-sceneModePicker-wrapper");
    const myButton = document.createElement("button");
    myButton.classList.add("cesium-button", "cesium-toolbar-button");
    myButton.innerHTML = "M";
    if (toolbar) {
      toolbar.insertBefore(myButton, modeButton);
    }

    myButton.addEventListener("click", () => {
      const position = Cesium.Cartesian3.fromDegrees(-93.34097581368697, 44.765644457141896, 300)
      const heading = Cesium.Math.toRadians(135);
      const pitch = 0;
      const roll = 0;
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );

      const entity = this.viewer.entities.add({
        name: "Hot Air Balloon",
        position: position,
        orientation: orientation,
        model: {
          uri: "./assets/3dmodels/CesiumAir.glb",
          minimumPixelSize: 128,
          maximumScale: 20000,
        },
      });
      this.viewer.trackedEntity = entity;
    });

  }


  addDrawBoundaryFunctionality(){
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    this.drawHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.drawHandler.setInputAction((event:any)=> {
      let earthPosition;
      // `earthPosition` will be undefined if our mouse is not over the globe.
      let pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        earthPosition = this.viewer.scene.pickPosition(event.position);
      }
      if (Cesium.defined(earthPosition)) {
        if (this.temporaryBoundaryPoints.length === 0){
          this.temporaryPoints.push(this.createPoint(earthPosition));
          this.temporaryBoundaryPoints.push(earthPosition);
          const dynamicPositions = new Cesium.CallbackProperty(()=> {
              return new Cesium.PolygonHierarchy(this.temporaryBoundaryPoints);
          }, false);
          this.temporaryBoundary = this.drawBoundary(dynamicPositions);
        } else {
          this.temporaryBoundaryPoints.push(earthPosition);
          this.temporaryPoints.push(this.createPoint(earthPosition));
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.drawHandler.setInputAction((event:any)=> {
      this.showAddBoundaryDialog();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  setDefaultClickFunctionality(){
    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    handler.setInputAction((event:any)=> {
      let earthPosition;
      // `earthPosition` will be undefined if our mouse is not over the globe.
      let pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        const id = Cesium.defaultValue(pickedObject.id, pickedObject.primitive.id);
        if (id instanceof Cesium.Entity) {
          console.log("object clicked:", id);
          return id;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  removeDrawBoundaryFunctionality(){
    this.drawHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.drawHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  showAddBoundaryDialog(){
    this.removeDrawBoundaryFunctionality();
    this.dialogsService.toggleShowAddBoundaryDialog(true);
  }

  completeShape(name:string) {
    this.drawnBoundary = this.drawBoundary(this.temporaryBoundaryPoints);
    this.drawnBoundary.name = name;
    this.removeTemporaryPoints();
    this.viewer.entities.remove(this.temporaryBoundary);
    this.temporaryPoints = [];
    this.temporaryBoundary = undefined;
    this.temporaryBoundaryPoints = [];
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

  drawBoundary(positionData:any, guid:string = self.crypto.randomUUID()) {
    let polygon = this.viewer.entities.add({
        id: guid,
        polygon: {
          hierarchy: positionData,
          // material: new Cesium.ColorMaterialProperty(
          //   Cesium.Color.WHITE.withAlpha(0.7)
          // ),
          material: Cesium.Color.WHITE.withAlpha(0.7),
          outline: true,
          outlineWidth: 1,
          outlineColor: Cesium.Color.BLACK,
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
