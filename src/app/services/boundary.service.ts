import { Inject, Injectable, effect, signal } from '@angular/core';
import { CesiumService } from './cesium.service';
import { DialogsService } from './dialogs.service';
import { BehaviorSubject } from 'rxjs';
import { MapMode } from '../shared/models/map-mode.enum';
import { Boundary } from '../shared/models/boundary.model';
import { CoordinateData } from '../shared/models/coordinate-data.model';
import { OMGType } from '../shared/models/omg-type.enum';
declare let Cesium: any;
@Injectable({
  providedIn: 'root'
})
export class BoundaryService {
  private clickHandler:any;
  private temporaryBoundaryPoints:any[] = [];
  private temporaryBoundary:any;
  private temporaryPoints:any[] = [];
  public marketLocation = new BehaviorSubject<any>(undefined);
  public marketLocation$ = this.marketLocation.asObservable();
  public vendorLocation = new BehaviorSubject<any>(undefined);
  public vendorLocation$ = this.vendorLocation.asObservable();
  constructor(@Inject('viewer') private viewer:any, private dialogsService:DialogsService, private cesiumService:CesiumService) { }

  addDrawBoundaryButton(){
    //add button
    const toolbar = document.querySelector("div.cesium-viewer-toolbar");
    const modeButton = document.querySelector("span.cesium-sceneModePicker-wrapper");
    const vendorLocationButton = document.createElement("button");
    vendorLocationButton.id = "drawBoundaryButton";
    vendorLocationButton.classList.add("cesium-button", "cesium-toolbar-button");
    vendorLocationButton.innerHTML = "+";
    if (toolbar) {
      toolbar.insertBefore(vendorLocationButton, modeButton);
    }
    vendorLocationButton.addEventListener("click", () => {
      if (this.cesiumService.vendorBoundaryDrawingState.getValue() == true) {
        this.cesiumService.vendorBoundaryDrawingState.next(false);
      } else {
        this.cesiumService.vendorBoundaryDrawingState.next(true);
      }
    });
  }

  disableVendorLocationDrawingMode(){
    const vendorLocationButton = document.getElementById("drawBoundaryButton");
    if (vendorLocationButton){
      vendorLocationButton.innerHTML = "+";
      this.resetLeftandRightClickHandler();
      this.cesiumService.enableEntitySelectionMode();
    }
  }

  enableVendorLocationDrawingMode(){
    console.log("addDrawVendorLocationFunctionality");
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.clickHandler.setInputAction((event:any)=> {
      console.log("addDrawVendorLocationFunctionality left click");
      if (this.cesiumService.mapMode.getValue() == MapMode.VendorLocationDrawing) {
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
            this.temporaryBoundary = this.drawBoundary(dynamicPositions, "temporaryBoundary", Cesium.Color.WHITE.withAlpha(0.7));
          } else {
            this.temporaryBoundaryPoints.push(earthPosition);
            this.temporaryPoints.push(this.createPoint(earthPosition));
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.clickHandler.setInputAction((event:any)=> {
      console.log("addDrawVendorLocationFunctionality right click");
      if (this.cesiumService.mapMode.getValue() == MapMode.VendorLocationDrawing) {
        event.cancel = true; // Cancel right click dialog
        this.showAddVendorBoundaryDialog();
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  enableDrawMarketBoundaryFunctionallity(){
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.clickHandler.setInputAction((event:any)=> {
      if (this.cesiumService.mapMode.getValue() == MapMode.MarketBoundaryDrawing) {
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
            this.temporaryBoundary = this.drawBoundary(dynamicPositions, "temporaryMarketBoundary", Cesium.Color.WHITE.withAlpha(0.3));
          } else {
            this.temporaryBoundaryPoints.push(earthPosition);
            this.temporaryPoints.push(this.createPoint(earthPosition));
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.clickHandler.setInputAction((event:any)=> {
      if (this.cesiumService.mapMode.getValue() == MapMode.MarketBoundaryDrawing) {
        event.cancel = true; // Cancel right click dialog
        this.completeMarketBoundary();
        this.cesiumService.marketLocationDrawingState.next(false);
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  resetLeftandRightClickHandler(){
    if (this.clickHandler) {
      this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
  }

  showAddVendorBoundaryDialog(){
    this.resetLeftandRightClickHandler();
    this.dialogsService.toggleShowAddBoundaryDialog(true);
  }

  completeMarketBoundary() {
    let color = new Cesium.Color(1, 1, 1, 0.3);
    this.removeTemporaryPoints();
    const drawnBoundary = this.drawBoundary(this.temporaryBoundaryPoints, "MarketBoundary", color, true, "marketLocation");
    this.viewer.entities.remove(this.temporaryBoundary);
    this.temporaryPoints = [];
    this.temporaryBoundary = undefined;
    this.temporaryBoundaryPoints = [];
    this.cesiumService.mapMode.next(MapMode.EntitySelection);
    this.marketLocation.next(drawnBoundary);
    return drawnBoundary;
  }

  completeVendorBoundary(name:string, r:number, g:number, b:number) {
    let color = new Cesium.Color(1, 1, 1, 0.7);
    Cesium.Color.fromBytes(r, g, b, 200, color);
    this.removeTemporaryPoints();
    const drawnBoundary = this.drawBoundary(this.temporaryBoundaryPoints, name, color, true);
    this.viewer.entities.remove(this.temporaryBoundary);
    this.temporaryPoints = [];
    this.temporaryBoundary = undefined;
    this.temporaryBoundaryPoints = [];
    this.cesiumService.mapMode.next(MapMode.EntitySelection);
    this.vendorLocation.next(drawnBoundary);
    return drawnBoundary;
  }

  createPoint(worldPosition:any, guid:string = self.crypto.randomUUID()) {
    const point = this.viewer.entities.add({
      id: guid,
      position: worldPosition,
      point: {
        color: Cesium.Color.WHITE,
        pixelSize: 10,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    return point;
  }

  drawBoundary(positionData:any, name:string, color:any, addLabel:boolean = false, guid:string = self.crypto.randomUUID()) {
    let polygon = this.viewer.entities.add({
      id: guid,
      name:name,
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          color
        ),
        //material: color,
        outline: true,
        outlineWidth: 1,
        outlineColor: Cesium.Color.BLACK,
      },
    });
    if (addLabel == true) {
      let polygonCenter = Cesium.BoundingSphere.fromPoints(positionData).center;
      Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polygonCenter, polygonCenter);
      polygon.position = polygonCenter;
      //Set up the label.
      let label = new Cesium.LabelGraphics();
      label.text = new Cesium.ConstantProperty(name);
      label.font = new Cesium.ConstantProperty("14px monospace");
      label.showBackground = new Cesium.ConstantProperty(true);
      label.fillColor = new Cesium.ConstantProperty(Cesium.Color.WHITE);
      label.outlineColor = new Cesium.ConstantProperty(Cesium.Color.BLACK);
      label.outlineWidth = new Cesium.ConstantProperty(1);
      label.style = new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE);
      label.disableDepthTestDistance= 1.2742018*10**7;
      label.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
      // label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
      label.eyeOffset = new Cesium.Cartesian3(0.0, 0.0, -10.0);
      label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
      label.pixelOffset = new Cesium.Cartesian2(0.0, -20.0);
      label.pixelOffsetScaleByDistance = new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5);
      //label.eyeOffset = new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -100000));
      polygon.label = label;
      // console.log("polygonCenter:", polygonCenter);
      // let labelEntity = this.viewer.entities.add({
      //   position: polygonCenter,
      //   label: {
      //     text: "test",
      //   },
      // });
      // labelEntity.disableDepthTestDistance= 1.2742018*10**7;
      // labelEntity.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
      // let philadelphia = this.viewer.entities.add({
      //   position: Cesium.Cartesian3.fromDegrees(-75.1641667, 39.9522222),
      //   label: {
      //     text: "Philadelphia",
      //   },
      // });
      // console.log("labelEntity:", labelEntity);
      // this.viewer.zoomTo(labelEntity);
    }
    return polygon;
  }

  removeTemporaryPoints(){
    this.temporaryPoints.forEach((point:any) => {
      this.cesiumService.removeEntityById(this.viewer, point.id)
    });
  }

  createBoundaryFromBoundaryObject(boundaryObject:Boundary, name?:string, id?:string, isMarketLocation:boolean = false) {
    let positions:any[] = [];
    boundaryObject.boundaryPositions.forEach((position:CoordinateData) => {
      positions.push(new Cesium.Cartesian3(position.x, position.y, position.z));
    });
    let boundary = this.viewer.entities.add({
      id: id ? id : self.crypto.randomUUID(),
      omgType: isMarketLocation ? OMGType.MarketLocation : OMGType.VendorLocation,
      name: name,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: new Cesium.ColorMaterialProperty(
          new Cesium.Color(boundaryObject.color.red, boundaryObject.color.green, boundaryObject.color.blue, boundaryObject.color.alpha)
        ),
        outline: boundaryObject.outline,
        outlineWidth: boundaryObject.outlineWidth,
        outlineColor:  new Cesium.Color(boundaryObject.outlineColor.red, boundaryObject.outlineColor.green, boundaryObject.outlineColor.blue, boundaryObject.outlineColor.alpha)
      },
    });
  }

}
