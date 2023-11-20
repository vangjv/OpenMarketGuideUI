import { Injectable, signal } from '@angular/core';
import { BoundaryService } from './boundary.service';
import { DialogsService } from './dialogs.service';
import { ThreeDimensionalModelService } from './three-dimensional-model.service';
import { BehaviorSubject } from 'rxjs';
import { MapMode } from '../shared/models/map-mode.enum';
import { CoordinateData } from '../shared/models/coordinate-data.model';
import { Market } from '../shared/models/market.model';
import { Router } from '@angular/router';
import { MapExplorerService } from './map-explorer.service';
import { MarketInstance } from '../shared/models/market-instance.model';
import { VendorLocation } from '../shared/models/vendor-location.model';

declare let Cesium: any;
// import * as Cesium from '../assets/js/Cesium.js';
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NTMyNWExMC02NzNjLTRjMTUtYWUxMy0xMDg4OTAwMjgyOWMiLCJpZCI6MTc4MDE2LCJpYXQiOjE2OTk5MTQyNDF9.oyFmWXaMENmkFU_YK7pd15LkTE1X34js0Pq6542rnQA";
Cesium.GoogleMaps.defaultApiKey = "AIzaSyCGia9D0eVwiSKfTEHMKIMPecAar40kqoc";

@Injectable()
export class CesiumService {
  public viewer: any;
  public vendorBoundaryDrawingState = new BehaviorSubject<boolean>(false);
  public vendorBoundaryDrawingState$ = this.vendorBoundaryDrawingState.asObservable();
  public marketLocationDrawingState = new BehaviorSubject<boolean>(false);
  public marketLocationDrawingState$ = this.marketLocationDrawingState.asObservable();
  public adding3DModelState = new BehaviorSubject<boolean>(false);
  public adding3DModelState$ = this.adding3DModelState.asObservable();
  public boundaryService!: BoundaryService;
  public threeDimensionalModelService!: ThreeDimensionalModelService;
  public mapExplorerService!: MapExplorerService;
  public selectedEntity = new BehaviorSubject<any>(undefined);
  public selectedEntity$ = this.selectedEntity.asObservable();
  public doubleClickedEntity = new BehaviorSubject<any>(undefined);
  public doubleClickedEntity$ = this.doubleClickedEntity.asObservable();
  public mapMode: BehaviorSubject<MapMode> = new BehaviorSubject<MapMode>(MapMode.EntitySelection);
  public mapMode$ = this.mapMode.asObservable();
  public clickHandler: any;
  public isRotating: boolean = false;
  public initialMousePosition: any = null;
  public initialOrientation: any = null;
  public longPressHoldTimer: any;
  public isDragging:boolean = false;
  constructor(private dialogsService: DialogsService, private router: Router) {

  }

  async initializeMap(div: string) {
    this.viewer = new Cesium.Viewer(div, {
      selectionIndicator: false,
      infoBox: false,
      // terrain: Cesium.Terrain.fromWorldTerrain(),
      sceneModePicker: false,
      globe: false,
      timeline: false,
      animation: false
    });
    this.hideFullScreenButton();
    this.boundaryService = new BoundaryService(this.viewer, this.dialogsService, this);
    this.threeDimensionalModelService = new ThreeDimensionalModelService(this.viewer, this.dialogsService, this);
    this.mapExplorerService = new MapExplorerService(this.viewer, this.dialogsService, this, this.router);
    if (!this.viewer.scene.pickPositionSupported) {
      window.alert("This browser does not support pickPosition.");
    }

    try {
      const tileset = await Cesium.createGooglePhotorealistic3DTileset();
      this.viewer.scene.primitives.add(tileset);
      //this.viewer.scene.globe.show = false; //this conflicts with google photorealistic 3d tileset
    } catch (error) {
      console.log(`Failed to load tileset: ${error}`);
    }

    this.hideCesiumIonLogo();
  };

  //depthTestAgainstTerrain: false
  async initializeMap2(div: string) {
    this.viewer = new Cesium.Viewer(div, {
      selectionIndicator: false,
      infoBox: false,
      terrain: Cesium.Terrain.fromWorldTerrain(),
      sceneModePicker: false,
      timeline: false,
      animation: false
    });
    this.hideFullScreenButton();
    this.boundaryService = new BoundaryService(this.viewer, this.dialogsService, this);
    this.threeDimensionalModelService = new ThreeDimensionalModelService(this.viewer, this.dialogsService, this);
    this.mapExplorerService = new MapExplorerService(this.viewer, this.dialogsService, this, this.router);
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
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
    this.hideCesiumIonLogo();
  };

  searchAndZoom(location: string) {
    let geoCodeService = new Cesium.IonGeocoderService();
    geoCodeService.geocode(location).then((results: any) => {
      if (results.length > 0) {
        if (results[0].destination.east && results[0].destination.north && results[0].destination.south && results[0].destination.west) {
          const rectangle = new Cesium.Rectangle(
            results[0].destination.west,
            results[0].destination.south,
            results[0].destination.east,
            results[0].destination.north
          );
          let rectangleCenter: any = Cesium.Rectangle.center(rectangle);
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

  createEntitiesFromMarket(market: Market | MarketInstance) {
    //create market boundary
    if (market.marketLocation && market.marketLocation.boundary) {
      this.boundaryService.createBoundaryFromBoundaryObject(market.marketLocation.boundary, market.marketLocation.name, market.marketLocation.id, true);
    }
    //create vendor locations
    if (market.vendorLocations && market.vendorLocations.length > 0) {
      market.vendorLocations.forEach((vendorLocation) => {
        if (vendorLocation.boundary) {
          this.boundaryService.createBoundaryFromBoundaryObject(vendorLocation.boundary, vendorLocation.name, vendorLocation.id, false);
        }
      });
    }
    //create 3d models
    if (market.threeDModelEntities && market.threeDModelEntities.length > 0) {
      market.threeDModelEntities.forEach((threeDModelEntity) => {
        if (threeDModelEntity) {
          this.threeDimensionalModelService.create3DModelFrom3DModelEntity(threeDModelEntity, true);
        }
      });
    }
    console.log("all entities", this.viewer.entities.values);
  }

  flyTo(location: CoordinateData) {
    let destination = new Cesium.Cartesian3(location.x, location.y, location.z);
    console.log("destination:", destination);
    this.viewer.camera.flyTo({
      destination: destination,
      complete: () => {
        this.viewer.camera.zoomOut(1000);
      }
    });
  }

  setHomeLocation() {
    var homeLocation = {
      destination: Cesium.Cartesian3.fromDegrees(-93.34097581368697, 44.765644457141896, 500), // Long, Lat, Height
      orientation: {
        heading: Cesium.Math.toRadians(0),
        roll: 0.0
      }
    };
    // Override the home button behavior
    this.viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e: any) => {
      e.cancel = true; // Cancel the default home button behavior
      this.viewer.scene.camera.setView(homeLocation); // Set the new home location
    });
  }

  setCoordinates(longitude: number, latitude: number, height: number) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
  }

  addCoordinatesOnDoubleClick() {
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((click: any) => {
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

  addCoordinateViewer() {
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
        disableDepthTestDistance: 1.2742018 * 10 ** 7
      },
    });

    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
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

  hideAnimationWidget() {
    this.viewer.animation.container.style.visibility = 'hidden';
  }

  hideCredits() {
    this.viewer._cesiumWidget._creditContainer.style.display = "none";
  }

  hideCesiumIonLogo() {
    if (document.getElementsByClassName("cesium-credit-logoContainer")[0]) {
      document.getElementsByClassName("cesium-credit-logoContainer")[0].remove();
    }
  }

  hideDefaultCesiumSearch() {
    document.getElementsByClassName("cesium-viewer-geocoderContainer")[0].remove();
  }

  changeCesiumHomeButtonToGoToAppHome() {
    document.getElementsByClassName("cesium-home-button")[0].addEventListener("click", () => {
      this.router.navigate(['/']);
    });
  }

  hideFullScreenButton() {
    this.viewer._fullscreenButton._container.style.visibility = 'hidden';
  }

  enableEntitySelectionMode() {
    if (this.clickHandler) {
      this.addEntityPickedClickHandler(this.clickHandler);
    } else {
      this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      this.addEntityPickedClickHandler(this.clickHandler);
    }
  }

  enableEntityDoubleClickedMode() {
    if (this.clickHandler) {
      this.addEntityDoubleClickedHandler(this.clickHandler);
      this.addLongPressHandler(this.clickHandler);
      // this.addEntityTouchDoubleTappedHandler(this.clickHandler);
    } else {
      this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      this.addEntityDoubleClickedHandler(this.clickHandler);
      this.addLongPressHandler(this.clickHandler);
      // this.addEntityTouchDoubleTappedHandler(this.clickHandler);
    }
  }

  addEntityPickedClickHandler(clickHandler: any) {
    clickHandler.setInputAction((event: any) => {
      let pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        const id = Cesium.defaultValue(pickedObject.id, pickedObject.primitive.id);
        if (id instanceof Cesium.Entity) {
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

  addLongPressHandler(clickHandler: any) {
    clickHandler.setInputAction((event: any) => {
      this.longPressHoldTimer = new Date().getTime();
      this.isDragging = false;
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    // Detect mouse move
    clickHandler.setInputAction((event:any) => {
      this.isDragging = true;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    clickHandler.setInputAction((event: any) => {
      let endHoldTime = new Date().getTime();
      if (endHoldTime - this.longPressHoldTimer > 1000 && !this.isDragging) { // 1000 milliseconds for 1 second
        //long press detected
        let pickedObject = this.viewer.scene.pick(event.position);
        if (Cesium.defined(pickedObject)) {
          const id = Cesium.defaultValue(pickedObject.id, pickedObject.primitive.id);
          if (id instanceof Cesium.Entity) {
            this.doubleClickedEntity.next(id);
            return id;
          } else {
            this.doubleClickedEntity.next(undefined);
          }
        } else {
          this.doubleClickedEntity.next(undefined);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  addEntityDoubleClickedHandler(clickHandler: any) {
    clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    clickHandler.setInputAction((event: any) => {
      let pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        const id = Cesium.defaultValue(pickedObject.id, pickedObject.primitive.id);
        if (id instanceof Cesium.Entity) {
          this.doubleClickedEntity.next(id);
          return id;
        } else {
          this.doubleClickedEntity.next(undefined);
        }
      } else {
        this.doubleClickedEntity.next(undefined);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  addEntityTouchDoubleTappedHandler(clickHandler: any) {
    clickHandler.setInputAction((event: any) => {
      let pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        const id = Cesium.defaultValue(pickedObject.id, pickedObject.primitive.id);
        if (id instanceof Cesium.Entity) {
          this.doubleClickedEntity.next(id);
          return id;
        } else {
          this.doubleClickedEntity.next(undefined);
        }
      } else {
        this.doubleClickedEntity.next(undefined);
      }
    }, Cesium.ScreenSpaceEventType.PINCH_END);
  }

  enable3dModelRotation() {
    if (this.clickHandler) {
      this.addRotationClickHandlers();
    } else {
      this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      this.addRotationClickHandlers();
    }
  }

  addRotationClickHandlers() {
    this.setLeftDownRotateHandler(this.clickHandler);
    // Rotate the model as the mouse moves
    this.setMouseMoveRotateHandler(this.clickHandler);
    // Stop rotating the model on left click release
    this.setLeftUpRotateHandler(this.clickHandler);
  }

  setMouseMoveRotateHandler(clickHandler: any) {
    clickHandler.setInputAction((movement: any) => {
      if (this.isRotating) {
        this.rotateModel(movement);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  setLeftDownRotateHandler(clickHandler: any) {
    clickHandler.setInputAction((click: any) => {
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

  setLeftUpRotateHandler(clickHandler: any) {
    clickHandler.setInputAction(() => {
      if (this.isRotating) {
        this.isRotating = false;
        this.initialMousePosition = null;
        this.initialOrientation = null;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  handleKeyboardTransformation(event: any) {
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

  rotateModel(movement: any) {
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


  setDefaultHoverFunctionality() {
    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  removeEntityById(viewer: any, entityId: string) {
    const entity = viewer.entities.getById(entityId);
    if (entity) {
      viewer.entities.remove(entity);
    }
  }

  highlightEntity(entity: any) {
    if (entity.model) {
      entity.model.silhouetteColor = Cesium.Color.WHITE; // Silhouette color
      entity.model.silhouetteSize = 2.0; // Silhouette size
      this.removeHighlightFromAllButSelectedEntity(entity.id);
    } else {
      this.removeHighlightFromAllButSelectedEntity(entity.id);
    }
  }

  removeHighlightFromAllEntities() {
    if (this.viewer.entities._entities._array.length > 0) {
      this.viewer.entities._entities._array.forEach((entity: any) => {
        if (entity.model) {
          entity.model.silhouetteColor = Cesium.Color.TRANSPARENT; // Silhouette color
          entity.model.silhouetteSize = 0.0; // Silhouette size
        }
      });
    }
  }

  removeHighlightFromAllButSelectedEntity(entityId: string) {
    if (this.viewer.entities._entities._array.length > 0) {
      this.viewer.entities._entities._array.forEach((entity: any) => {
        if (entity.id != entityId && entity.model != undefined) {
          entity.model.silhouetteColor = Cesium.Color.TRANSPARENT; // Silhouette color
          entity.model.silhouetteSize = 0.0; // Silhouette size
        }
      });
    }
  }


  resetLeftandRightClickHandlers() {
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
  public static pickEntity(viewer: any, windowPosition: any) {
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
  public static drillPickEntities(viewer: any, windowPosition: any) {
    let picked, entity, i;
    const pickedPrimitives = viewer.scene.drillPick(windowPosition);
    const length = pickedPrimitives.length;
    const result = [];
    const hash: any = {};

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

  public static cesiumColorToRGB(cesiumColor: any) {
    var r = Math.round(cesiumColor.red * 255);
    var g = Math.round(cesiumColor.green * 255);
    var b = Math.round(cesiumColor.blue * 255);
    var a = cesiumColor.alpha.toFixed(2);;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  public static cesiumColorToHex(cesiumColor: any) {
    var r = Math.round(cesiumColor.red * 255).toString(16).padStart(2, '0');
    var g = Math.round(cesiumColor.green * 255).toString(16).padStart(2, '0');
    var b = Math.round(cesiumColor.blue * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  searchAndZoomToLocation(vendorLocation: VendorLocation) {
    //find entities in viewer.entities with vendorLocation.id
    let entities = this.viewer.entities.values;
    let entity = entities.find((entity: any) => {
      return entity.id == vendorLocation.id;
    });
    var boundingSphere = Cesium.BoundingSphere.fromPoints(entity.polygon.hierarchy.getValue().positions);

    // Get the center of the bounding sphere
    var center = boundingSphere.center;
    var centerCartographic = Cesium.Cartographic.fromCartesian(center);

    // Convert the center position to longitude and latitude in degrees
    var longitude = Cesium.Math.toDegrees(centerCartographic.longitude);
    var latitude = Cesium.Math.toDegrees(centerCartographic.latitude);

    // Set the height to zoom in, e.g., 100 meters above the ground
    var height = 300;

    // Fly the camera to the center of the polygon
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: {
        heading: Cesium.Math.toRadians(0),   // North
        pitch: Cesium.Math.toRadians(-90),   // Looking straight down
        roll: 0.0
      }
    });
  }

  createVendorLabelsForEntities(vendorLocations: VendorLocation[]) {
    this.viewer.entities.values.forEach((entity: any) => {
      if (entity.polygon) {
        // Entity is a polygon
        let center = this.computeCenter(entity.polygon);
        let locationName = entity.name;
        console.log(locationName + " center:", center);
        //match vendorlocation name
        let vendorAtLocation = vendorLocations.find((vendorLocation) => {
          return vendorLocation.name == locationName;
        });
        //check if vendor is assigned at location
        let vendorName = undefined;
        if (vendorAtLocation && vendorAtLocation.assignedVendor && vendorAtLocation.assignedVendor.name) {
          vendorName = vendorAtLocation.assignedVendor.name;
        }
        // Create a label
        let label = this.viewer.entities.add({
          position: center,
          label: {
            text: vendorName ? vendorName : entity.name
          }
        });
      }
    });
  }

  createLabelsForVendorLocations() {
    this.viewer.entities.values.forEach((entity: any) => {
      if (entity.polygon && entity.omgType == "VendorLocation") {
        // Entity is a polygon
        let center = this.computeCenter(entity.polygon);
        // Create a label
        let label = this.viewer.entities.add({
          position: center,
          label: {
            text: entity.name
          }
        });
      }
    });
  }

  createBillboardsForVendorLocations() {
    this.viewer.entities.values.forEach((entity: any) => {
      if (entity.polygon && entity.omgType == "VendorLocation") {
        // Entity is a polygon
        let center = this.computeCenter(entity.polygon);
        // Create a label
        let billboard = this.viewer.entities.add({
          position: center,
          billboard: {
            // image: "./assets/images/produce.png",
            image: "./assets/images/flowershop-sm.jpg",
            scale: 0.05,
            // scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
            sizeInMeters: true,
          },
        });
        console.log("billboard", billboard);
      }
    });
  }

  computeCenter(polygon: any) {
    let vertices = polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
    let numberOfVertices = vertices.length;
    let sumLongitude = 0.0;
    let sumLatitude = 0.0;
    let sumHeight = 940.0;

    for (let i = 0; i < numberOfVertices; i++) {
      let cartographic = Cesium.Cartographic.fromCartesian(vertices[i]);
      sumLongitude += Cesium.Math.toDegrees(cartographic.longitude);
      sumLatitude += Cesium.Math.toDegrees(cartographic.latitude);
      sumHeight += cartographic.height;
    }
    return Cesium.Cartesian3.fromDegrees(
      sumLongitude / numberOfVertices,
      sumLatitude / numberOfVertices,
      sumHeight / numberOfVertices
    );
  }

  toggleLabels(show: boolean) {
    var entities = this.viewer.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        if (entity.label) {
            entity.label.show = show;
        }
    }
  }

  toggle3DModels(show: boolean) {
    var entities = this.viewer.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        if (entity.model) {
            entity.model.show = show;
        }
    }
  }

  toggleVendorLocations(show: boolean) {
    var entities = this.viewer.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        if (entity.polygon) {
            entity.polygon.show = show;
        }
    }
  }
}
