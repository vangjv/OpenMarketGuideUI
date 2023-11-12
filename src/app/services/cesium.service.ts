import { Injectable, signal } from '@angular/core';
import { BoundaryService } from './boundary.service';
import { DialogsService } from './dialogs.service';
import { ThreeDimensionalModelService } from './three-dimensional-model.service';
import { BehaviorSubject } from 'rxjs';
import { MapMode } from '../shared/models/map-mode.enum';

declare let Cesium: any;
// import * as Cesium from '../assets/js/Cesium.js';
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2MWZlOTZjMy1iYjhiLTRkYjktOWEyYS0xYjllYWM4NmQ3YjYiLCJpZCI6ODM1MzksImlhdCI6MTY2MTU0NTg0MX0.PBHIiiQPO0_kfthCfRxp4VVGlhFZp4BMKIeILBwYuqk";
Cesium.GoogleMaps.defaultApiKey = "AIzaSyCGia9D0eVwiSKfTEHMKIMPecAar40kqoc";

@Injectable({
  providedIn: 'root'
})
export class CesiumService {
  public viewer: any;
  public vendorBoundaryDrawingState = new BehaviorSubject<boolean>(false);
  public vendorBoundaryDrawingState$ = this.vendorBoundaryDrawingState.asObservable();
  public marketBoundaryDrawingState = new BehaviorSubject<boolean>(false);
  public marketBoundaryDrawingState$ = this.marketBoundaryDrawingState.asObservable();
  public adding3DModelState = new BehaviorSubject<boolean>(false);
  public adding3DModelState$ = this.adding3DModelState.asObservable();
  public boundaryService!:BoundaryService;
  public threeDimensionalModelService!:ThreeDimensionalModelService;
  public selectedEntity = new BehaviorSubject<any>(undefined);
  public selectedEntity$ = this.selectedEntity.asObservable();
  public mapMode:BehaviorSubject<MapMode> = new BehaviorSubject<MapMode>(MapMode.EntitySelection);
  public mapMode$ = this.mapMode.asObservable();
  public clickHandler:any;
  public isRotating:boolean = false;
  public initialMousePosition:any = null;
  public initialOrientation:any = null;

  constructor(private dialogsService:DialogsService) {

  }

  async initializeMap(div:string){
    this.viewer = new Cesium.Viewer(div, {
      selectionIndicator: false,
      infoBox: false,
      terrain: Cesium.Terrain.fromWorldTerrain(),
      //globe: false,
      timeline : false,
      animation : false
    });
    this.hideFullScreenButton();
    this.boundaryService = new BoundaryService(this.viewer, this.dialogsService, this);
    this.threeDimensionalModelService = new ThreeDimensionalModelService(this.viewer, this.dialogsService, this);
    if (!this.viewer.scene.pickPositionSupported) {
      window.alert("This browser does not support pickPosition.");
    }

    try {
      const tileset = await Cesium.createGooglePhotorealistic3DTileset();
      this.viewer.scene.primitives.add(tileset);
      this.viewer.scene.globe.show = false; //this conflicts with google photorealistic 3d tileset
    } catch (error) {
      console.log(`Failed to load tileset: ${error}`);
    }
    this.hideCesiumIonLogo();
  };

  searchAndZoom(location: string) {
    let geoCodeService = new Cesium.IonGeocoderService();
    geoCodeService.geocode(location).then((results:any) => {
      console.log("results", results);
      if (results.length > 0) {
        if (results[0].destination.east && results[0].destination.north && results[0].destination.south && results[0].destination.west) {
          const rectangle = new Cesium.Rectangle(
            results[0].destination.west,
            results[0].destination.south,
            results[0].destination.east,
            results[0].destination.north
          );
          console.log("rectangle:", rectangle);
          let rectangleCenter:any = Cesium.Rectangle.center(rectangle);
          //Cesium.Rectangle.center(rectangle, rectangleCenter);
          console.log("rectangleCenter:", rectangleCenter);
          if (rectangleCenter) {
            const destination = Cesium.Cartesian3.fromRadians(rectangleCenter.longitude, rectangleCenter.latitude, 2500);
            console.log("destination:", destination);
            this.viewer.camera.flyTo({
              destination: destination,
            });
          }

        } else {
          const destination = Cesium.Cartesian3.fromDegrees(
            results[0].longitude,
            results[0].latitude
          );
          this.viewer.camera.flyTo({
            destination: destination,
          });
        }
      }
    });
    // const geocoder = new Cesium.Geocoder({
    //   container: 'geocoderContainer',
    //   scene: this.viewer.scene,
    //   autoComplete: true,
    // });

    // const searchPromise = Cesium.GeocoderService.geocode(location);

    // searchPromise.then((result:any) => {
    //   if (result.length > 0) {
    //     const destination = Cesium.Cartesian3.fromDegrees(
    //       result[0].longitude,
    //       result[0].latitude,
    //       result[0].height ? result[0].height + 1000.0 : 1000.0
    //     );
    //     this.viewer.camera.flyTo({
    //       destination: destination,
    //     });
    //   }
    // });
  }

  setHomeLocation(){
    var homeLocation = {
      destination: Cesium.Cartesian3.fromDegrees(-93.34097581368697, 44.765644457141896, 500), // Long, Lat, Height
      orientation: {
          heading: Cesium.Math.toRadians(0),
          roll: 0.0
      }
    };
    // Override the home button behavior
    this.viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e:any)=> {
        e.cancel = true; // Cancel the default home button behavior
        this.viewer.scene.camera.setView(homeLocation); // Set the new home location
    });
  }

  setCoordinates(longitude:number, latitude:number, height:number) {
    this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
        }
    });
  }

  addCoordinatesOnDoubleClick(){
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((click:any)=> {
        var pickedObject = this.viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject)) {
            var cartesian = this.viewer.scene.pickPosition(click.position);
            if (cartesian) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                alert('Longitude: ' + longitude + '\nLatitude: ' + latitude);
                console.log('Longitude: ' + longitude + '\nLatitude: ' + latitude);
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  addCoordinateViewer(){
    const entity = this.viewer.entities.add({
      label: {
        show: false,
        showBackground: true,
        font: "14px monospace",
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10.0),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0.0, -20.0),
        pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
        1.5e2,
        3.0,
        1.5e7,
        0.5
        ),
        disableDepthTestDistance: 1.2742018*10**7
      },
    });

    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((movement:any) => {
      const cartesian = this.viewer.camera.pickEllipsoid(
        movement.endPosition,
        this.viewer.scene.globe.ellipsoid
      );
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(
          cartesian
        );
        const longitudeString = Cesium.Math.toDegrees(
          cartographic.longitude
        );
        const latitudeString = Cesium.Math.toDegrees(
          cartographic.latitude
        );

        entity.position = cartesian;
        entity.label.show = true;
        entity.label.text =
          `Lon: ${`   ${longitudeString}`}\u00B0` +
          `\nLat: ${`   ${latitudeString}`}\u00B0`;
      } else {
        entity.label.show = false;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  hideTimelineWidget() {
    this.viewer.timeline.container.style.visibility = 'hidden';
  }

  hideAnimationWidget(){
    this.viewer.animation.container.style.visibility = 'hidden';
  }

  hideCredits(){
    this.viewer._cesiumWidget._creditContainer.style.display = "none";
  }

  hideCesiumIonLogo(){
    document.getElementsByClassName("cesium-credit-logoContainer")[0].remove();
  }

  hideFullScreenButton(){
    this.viewer._fullscreenButton._container.style.visibility = 'hidden';
  }

  enableEntitySelectionMode(){
    if (this.clickHandler) {
      this.addEntityPickedClickHandler(this.clickHandler);
    } else {
      this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      this.addEntityPickedClickHandler(this.clickHandler);
    }
  }

  addEntityPickedClickHandler(clickHandler:any){
    clickHandler.setInputAction((event:any)=> {
      let pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        const id = Cesium.defaultValue(pickedObject.id, pickedObject.primitive.id);
        if (id instanceof Cesium.Entity) {
          console.log("object clicked:", id);
          this.selectedEntity.next(id);
          return id;
        } else {
          this.selectedEntity.next(undefined);
        }
      } else {
        this.selectedEntity.next(undefined);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  enable3dModelRotation(){
    if (this.clickHandler) {
      this.addRotationClickHandlers();
    } else {
      this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      this.addRotationClickHandlers();
    }
  }

  addRotationClickHandlers(){
    this.setLeftDownRotateHandler(this.clickHandler);
    // Rotate the model as the mouse moves
    this.setMouseMoveRotateHandler(this.clickHandler);
    // Stop rotating the model on left click release
    this.setLeftUpRotateHandler(this.clickHandler);
  }

  setMouseMoveRotateHandler(clickHandler:any){
    clickHandler.setInputAction((movement:any) => {
      if (this.isRotating) {
        this.rotateModel(movement);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  setLeftDownRotateHandler(clickHandler:any){
    clickHandler.setInputAction((click:any) => {
      const pickedObject = this.viewer.scene.pick(click.position);
      console.log("pickedObject", pickedObject);
      console.log("this.selectedEntity.getValue()", this.selectedEntity.getValue());
      if (Cesium.defined(pickedObject) && this.selectedEntity.getValue() != undefined && pickedObject.id == this.selectedEntity.getValue()) {
          this.isRotating = true;
          this.initialMousePosition = click.position;
          this.initialOrientation = Cesium.Matrix3.clone(
              Cesium.Matrix3.fromQuaternion(this.selectedEntity.getValue().orientation.getValue(this.viewer.clock.currentTime))
          );
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  }

  setLeftUpRotateHandler(clickHandler:any) {
    clickHandler.setInputAction(() => {
      if (this.isRotating) {
          this.isRotating = false;
          this.initialMousePosition = null;
          this.initialOrientation = null;
      }
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  handleKeyboardTransformation(event:any){
    if (this.selectedEntity.getValue() && this.selectedEntity.getValue().position && this.selectedEntity.getValue().orientation) {
      var position = this.selectedEntity.getValue().position.getValue(this.viewer.clock.currentTime);
      var orientation = this.selectedEntity.getValue().orientation.getValue(this.viewer.clock.currentTime);
      console.log(event.key);
      switch (event.key) {
        case 'ArrowUp':    // Move up
          position = Cesium.Cartesian3.add(position, new Cesium.Cartesian3(0, 1, 0), position);
          break;
        case 'ArrowDown':  // Move down
          position = Cesium.Cartesian3.add(position, new Cesium.Cartesian3(0, -1, 0), position);
          break;
        case 'ArrowLeft':  // Move left
          position = Cesium.Cartesian3.add(position, new Cesium.Cartesian3(-1, 0, 0), position);
          break;
        case 'ArrowRight': // Move right
          position = Cesium.Cartesian3.add(position, new Cesium.Cartesian3(1, 0, 0), position);
          break;
        case 'PageUp':    // Move up
          position = Cesium.Cartesian3.add(position, new Cesium.Cartesian3(0, 0, 1), position);
          break;
        case 'PageDown':  // Move down
          position = Cesium.Cartesian3.add(position, new Cesium.Cartesian3(0, 0, -1), position);
          break;
        case ',':          // Rotate left
          orientation = Cesium.Quaternion.multiply(orientation, Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(1)), orientation);
          break;
        case '.':          // Rotate right
          orientation = Cesium.Quaternion.multiply(orientation, Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, -Cesium.Math.toRadians(1)), orientation);
          break;
        case '=':          // Scale up
          console.log("this.selectedEntity.getValue().model.scale ", this.selectedEntity.getValue().model.scale);
          this.selectedEntity.getValue().model.scale = this.selectedEntity.getValue().model.scale + 0.1;
          break;
        case '-':          // Scale down
          this.selectedEntity.getValue().model.scale = this.selectedEntity.getValue().model.scale - 0.1;
          break;
      }

      this.selectedEntity.getValue().position = new Cesium.ConstantPositionProperty(position);
      this.selectedEntity.getValue().orientation = new Cesium.ConstantProperty(orientation);
    }
  }

  rotateModel(movement:any) {
    if (this.selectedEntity.getValue() && this.isRotating) {
      // console.log("movement:", movement);
      // console.log("this.initialMousePosition", this.initialMousePosition);
      // const deltaPhi = (movement.endPosition.x - this.initialMousePosition.x) * 0.1;
      // const deltaTheta = (movement.endPosition.y - this.initialMousePosition.y) * 0.1;

      // const orientation = Cesium.Matrix3.fromQuaternion(this.initialOrientation);
      // const rotationX = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(deltaTheta));
      // const rotationY = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(deltaPhi));

      // const finalOrientation = Cesium.Matrix3.multiply(orientation, rotationY, new Cesium.Matrix3());
      // console.log("before multiply");
      // Cesium.Matrix3.multiply(finalOrientation, rotationX, finalOrientation);
      // console.log("this.selectedEntity.getValue().orientation", this.selectedEntity.getValue().orientation);
      // this.selectedEntity.getValue().orientation = Cesium.Quaternion.fromRotationMatrix(finalOrientation);

      ////////////////////////////////////////////

      // const currentPosition = new Cesium.Cartesian2(movement.endPosition.x, movement.endPosition.y);
      // const deltaX = currentPosition.x - this.initialMousePosition.x;
      // // Convert deltaX to an angle
      // const angle = Cesium.Math.toRadians(deltaX / 10); // This scaling factor adjusts sensitivity

      // // Apply rotation to the model
      // this.selectedEntity.getValue()._model.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
      //   this.selectedEntity.getValue().modelMatrix,
      //   Cesium.Matrix3.fromRotationZ(angle),
      //   new Cesium.Matrix4()
      // );

      // this.initialMousePosition = currentPosition;


      /////////////////


      const deltaX = movement.endPosition.x - this.initialMousePosition.x;
      const deltaAngle = Cesium.Math.toRadians(deltaX / 10);

      // Get the current orientation of the entity
      const orientation = this.selectedEntity.getValue().orientation.getValue(this.viewer.clock.currentTime);
      const headingPitchRoll = Cesium.HeadingPitchRoll.fromQuaternion(orientation);

      // Apply the delta rotation to the heading
      headingPitchRoll.heading += deltaAngle;

      // Update the entity's orientation
      this.selectedEntity.getValue().orientation = Cesium.Transforms.headingPitchRollQuaternion(this.selectedEntity.getValue().position.getValue(this.viewer.clock.currentTime), headingPitchRoll);

      this.initialMousePosition = movement.endPosition.x;
    }
  }


  setDefaultHoverFunctionality(){
    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  removeEntityById(viewer:any, entityId:string) {
    const entity = viewer.entities.getById(entityId);
    if (entity) {
      viewer.entities.remove(entity);
    }
  }

  highlightEntity(entity:any) {
    if (entity.model) {
      entity.model.silhouetteColor = Cesium.Color.WHITE; // Silhouette color
      entity.model.silhouetteSize = 2.0; // Silhouette size
      this.removeHighlightFromAllButSelectedEntity(entity.id);
    }
  }

  removeHighlightFromAllEntities() {
    if (this.viewer.entities._entities._array.length > 0 ) {
      this.viewer.entities._entities._array.forEach((entity:any) => {
        if (entity.model) {
          entity.model.silhouetteColor = Cesium.Color.TRANSPARENT; // Silhouette color
          entity.model.silhouetteSize = 0.0; // Silhouette size
        }
      });
    }
  }

  removeHighlightFromAllButSelectedEntity(entityId:string) {
    if (this.viewer.entities._entities._array.length > 0 ) {
      this.viewer.entities._entities._array.forEach((entity:any) => {
        if (entity.id != entityId && entity.model != undefined) {
          entity.model.silhouetteColor = Cesium.Color.TRANSPARENT; // Silhouette color
          entity.model.silhouetteSize = 0.0; // Silhouette size
        }
      });
    }
  }


  resetLeftandRightClickHandlers(){
    if (this.clickHandler) {
      this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    this.boundaryService.resetLeftandRightClickHandler();
    this.threeDimensionalModelService.resetLeftandRightClickHandler();
  }


  /**
   * Returns the top-most entity at the provided window coordinates
   * or undefined if no entity is at that location.
   *
   * @param {Cartesian2} windowPosition The window coordinates.
   * @returns {Entity} The picked entity or undefined.
   */
  public static pickEntity(viewer:any, windowPosition:any) {
    const picked = viewer.scene.pick(windowPosition);
    if (Cesium.defined(picked)) {
      const id = Cesium.defaultValue(picked.id, picked.primitive.id);
      if (id instanceof Cesium.Entity) {
        return id;
      }
    }
    return undefined;
  }

  /**
   * Returns the list of entities at the provided window coordinates.
   * The entities are sorted front to back by their visual order.
   *
   * @param {Cartesian2} windowPosition The window coordinates.
   * @returns {Entity[]} The picked entities or undefined.
   */
  public static drillPickEntities(viewer:any, windowPosition:any) {
    let picked, entity, i;
    const pickedPrimitives = viewer.scene.drillPick(windowPosition);
    const length = pickedPrimitives.length;
    const result = [];
    const hash:any = {};

    for (i = 0; i < length; i++) {
      picked = pickedPrimitives[i];
      entity = Cesium.defaultValue(picked.id, picked.primitive.id);
      if (entity instanceof Cesium.Entity && !Cesium.defined(hash[entity.id])) {
        result.push(entity);
        hash[entity.id] = true;
      }
    }
    return result;
  }

}
