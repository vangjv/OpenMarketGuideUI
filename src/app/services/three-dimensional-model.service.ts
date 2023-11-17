import { Inject, Injectable } from '@angular/core';
import { DialogsService } from './dialogs.service';
import { CesiumService } from './cesium.service';
import { MapMode } from '../shared/models/map-mode.enum';
import { BehaviorSubject } from 'rxjs';
import { ThreeDModelInfo } from '../shared/models/three-d-model-info.model';
import { ThreeDModelEntity } from '../shared/models/three-d-model-entity.model';
import { ThreeDModelCollectionService } from './three-dimensional-model-collection.service';
import { OMGType } from '../shared/models/omg-type.enum';
declare let Cesium: any;
@Injectable({
  providedIn: 'root'
})
export class ThreeDimensionalModelService {
  public new3dModel = new BehaviorSubject<any>(undefined);
  public new3dModel$ = this.new3dModel.asObservable();
  public clickHandler: any;
  constructor(@Inject('viewer') private viewer: any, private dialogsService: DialogsService, private cesiumService: CesiumService) { }

  add3DModelButton() {
    //add button
    const toolbar = document.querySelector("div.cesium-viewer-toolbar");
    const modeButton = document.querySelector("span.cesium-sceneModePicker-wrapper");
    const add3DModelBtn = document.createElement("button");
    add3DModelBtn.id = "add3DModelBtn";
    add3DModelBtn.classList.add("cesium-button", "cesium-toolbar-button");
    add3DModelBtn.innerHTML = "M";
    if (toolbar) {
      toolbar.insertBefore(add3DModelBtn, modeButton);
    }

    add3DModelBtn.addEventListener("click", () => {
      if (this.cesiumService.mapMode.getValue() == MapMode.ThreeDModelPlacement) {
        this.cesiumService.mapMode.next(MapMode.EntitySelection);
      } else {
        this.cesiumService.mapMode.next(MapMode.ThreeDModelPlacement);
      }
    });
  }

  updateModelPosition(modelEntity: any, screenX: any, screenY: any) {
    let mousePosition = new Cesium.Cartesian2(screenX, screenY);
    let ellipsoid = this.viewer.scene.globe.ellipsoid;
    let cartesian = this.viewer.camera.pickEllipsoid(mousePosition, ellipsoid);

    if (cartesian) {
      let cartographic = ellipsoid.cartesianToCartographic(cartesian);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      modelEntity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
      modelEntity.position = this.viewer.scene.clampToHeight(Cesium.Cartesian3.fromDegrees(longitude, latitude), [modelEntity]);
    }
  }


  enableAdding3DModel(modelUri: string, name: string, scale: number) {
    const heading = Cesium.Math.toRadians(135);
    const pitch = 0;
    const roll = 0;
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    // const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    //   position,
    //   hpr
    // );

    // const mouseOverEntity = this.viewer.entities.add({
    //   id: "mouseOverEntity",
    //   name: "Raw",
    //   // position: position,
    //   // orientation: orientation,
    //   model: {
    //     uri: "./assets/3dmodels/meatmarket.glb"
    //   },
    //   clampToGround: true
    //   // heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
    // });

    // let mouseOverModelHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // mouseOverModelHandler.setInputAction((movement:any) => {
    //   if (this.cesiumService.adding3DModelState() == true) {
    //     // const cartesian = this.viewer.camera.pickEllipsoid(
    //     //   movement.endPosition,
    //     //   this.viewer.scene.globe.ellipsoid
    //     // );
    //     // if (cartesian) {
    //     //   const cartographic = Cesium.Cartographic.fromCartesian(
    //     //     cartesian
    //     //   );
    //     //   const objectsToExclude = [mouseOverEntity];
    //     //   //entity.position = cartesian;
    //     //   mouseOverEntity.position = this.viewer.scene.clampToHeight(cartesian, objectsToExclude);
    //     // }
    //     this.updateModelPosition(mouseOverEntity, movement.endPosition.x, movement.endPosition.y);
    //   }
    // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.clickHandler.setInputAction((event: any) => {
      if (this.cesiumService.mapMode.getValue() == MapMode.ThreeDModelPlacement) {
        let earthPosition;
        // `earthPosition` will be undefined if our mouse is not over the globe.
        let pickedObject = this.viewer.scene.pick(event.position);
        if (Cesium.defined(pickedObject)) {
          earthPosition = this.viewer.scene.pickPosition(event.position);
        }
        if (Cesium.defined(earthPosition)) {
          const heading = Cesium.Math.toRadians(90);
          const pitch = 0;
          const roll = 0;
          const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
          const orientation = Cesium.Transforms.headingPitchRollQuaternion(
            earthPosition,
            hpr
          );

          let newEntity = this.viewer.entities.add({
            name: name,
            position: earthPosition,
            orientation: orientation,
            model: {
              uri: modelUri,
              scale: scale
            },
            // heighReference:Cesium.HeightReference.RELATIVE_TO_GROUND
            heighReference: Cesium.HeightReference.CLAMP_TO_GROUND
          });
          this.new3dModel.next(newEntity);
          //mouseOverModelHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
          // this.viewer.entities.remove(mouseOverEntity);
          this.cesiumService.mapMode.next(MapMode.EntitySelection);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  }

  resetLeftandRightClickHandler() {
    if (this.clickHandler) {
      this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
  }

  disableAdding3DModel() {
    const add3DModelBtn = document.getElementById("add3DModelBtn");
    if (add3DModelBtn) {
      add3DModelBtn.innerHTML = "M";
      this.cesiumService.removeEntityById(this.viewer, "mouseOverEntity");
      this.cesiumService.enableEntitySelectionMode();
      this.cesiumService.setDefaultHoverFunctionality();
    }
  }

  create3DModelFrom3DModelEntity(threeDModelEntity: ThreeDModelEntity, isMarket3DModel: boolean = false) {
    let newEntity = this.viewer.entities.add({
      name: threeDModelEntity.name,
      omgType: isMarket3DModel ? OMGType.Market3DModel : OMGType.Vendor3DModel,
      position: new Cesium.ConstantPositionProperty(new Cesium.Cartesian3(threeDModelEntity.position?.x, threeDModelEntity.position?.y, threeDModelEntity.position?.z)),
      orientation: new Cesium.Quaternion(threeDModelEntity.orientation?.x, threeDModelEntity.orientation?.y, threeDModelEntity.orientation?.z, threeDModelEntity.orientation?.w),
      model: {
        uri: threeDModelEntity.model?.uri,
        scale: threeDModelEntity.model?.scale
      },
      // heighReference:Cesium.HeightReference.RELATIVE_TO_GROUND
      heighReference: Cesium.HeightReference.CLAMP_TO_GROUND
    });
  }
}
