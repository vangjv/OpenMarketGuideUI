import { Inject, Injectable } from '@angular/core';
import { DialogsService } from './dialogs.service';
import { CesiumService } from './cesium.service';
declare let Cesium: any;
@Injectable({
  providedIn: 'root'
})
export class ThreeDimensionalModelService {

  constructor(@Inject('viewer') private viewer:any, private dialogsService:DialogsService, private cesiumService:CesiumService) { }

  add3DModelButton(){
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
      if (this.cesiumService.adding3DModelState() == true) {
        this.cesiumService.adding3DModelState.set(false);
      } else {
        this.cesiumService.adding3DModelState.set(true);
      }
    });
  }

  updateModelPosition(modelEntity:any, screenX:any, screenY:any) {
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


  enableAdding3DModel(){
    const add3DModelBtn = document.getElementById("add3DModelBtn");
    if (add3DModelBtn)
    {
      add3DModelBtn.innerHTML = "X";
      const heading = Cesium.Math.toRadians(135);
      const pitch = 0;
      const roll = 0;
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      // const orientation = Cesium.Transforms.headingPitchRollQuaternion(
      //   position,
      //   hpr
      // );

      const mouseOverEntity = this.viewer.entities.add({
        id: "mouseOverEntity",
        name: "Raw",
        // position: position,
        // orientation: orientation,
        model: {
          uri: "./assets/3dmodels/meatmarket.glb"
        },
        clampToGround: true
        // heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
      });

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

      let clickPlaceHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      clickPlaceHandler.setInputAction((event:any)=> {
        if (this.cesiumService.adding3DModelState() == true) {
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
              name: "Raw",
              position: earthPosition,
              orientation: orientation,
              model: {
                uri: "./assets/3dmodels/meatmarket.glb"
              },
              // heighReference:Cesium.HeightReference.RELATIVE_TO_GROUND
              heighReference:Cesium.HeightReference.CLAMP_TO_GROUND
            });
            //mouseOverModelHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
            this.viewer.entities.remove(mouseOverEntity);
            this.cesiumService.adding3DModelState.set(false);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }

  disableAdding3DModel() {
    const add3DModelBtn = document.getElementById("add3DModelBtn");
    if (add3DModelBtn)
    {
      add3DModelBtn.innerHTML = "M";
      this.cesiumService.removeEntityById(this.viewer, "mouseOverEntity");
      this.cesiumService.setDefaultClickFunctionality();
      this.cesiumService.setDefaultHoverFunctionality();
    }
  }
}