import { Inject, Injectable } from '@angular/core';
import { DialogsService } from './dialogs.service';
declare let Cesium: any;
@Injectable({
  providedIn: 'root'
})
export class ThreeDimensionalModelService {

  constructor(@Inject('viewer') private viewer:any, private dialogsService:DialogsService) { }
  add3DModelButton(){
    //add button
    const toolbar = document.querySelector("div.cesium-viewer-toolbar");
    const modeButton = document.querySelector("span.cesium-sceneModePicker-wrapper");
    const myButton = document.createElement("button");
    const cesiumContainer = document.getElementById('cesium');
    myButton.classList.add("cesium-button", "cesium-toolbar-button");
    myButton.innerHTML = "M";
    if (toolbar) {
      toolbar.insertBefore(myButton, modeButton);
    }

    myButton.addEventListener("click", () => {
      // const position = Cesium.Cartesian3.fromDegrees(-93.34097581368697, 44.765514457141896);
      const heading = Cesium.Math.toRadians(135);
      const pitch = 0;
      const roll = 0;
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      // const orientation = Cesium.Transforms.headingPitchRollQuaternion(
      //   position,
      //   hpr
      // );

      const mouseOverEntity = this.viewer.entities.add({
        name: "Raw",
        // position: position,
        // orientation: orientation,
        model: {
          uri: "./assets/3dmodels/CesiumMilkTruck.glb"
        },
        heighReference:Cesium.HeightReference.CLAMP_TO_GROUND
      });

      let mouseOverModelHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      mouseOverModelHandler.setInputAction((movement:any) => {
        const cartesian = this.viewer.camera.pickEllipsoid(
          movement.endPosition,
          this.viewer.scene.globe.ellipsoid
        );
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(
            cartesian
          );
          const objectsToExclude = [mouseOverEntity];
          //entity.position = cartesian;
          mouseOverEntity.position = this.viewer.scene.clampToHeight(cartesian, objectsToExclude);
          let clickPlaceHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
          clickPlaceHandler.setInputAction((event:any)=> {
            let earthPosition;
            // `earthPosition` will be undefined if our mouse is not over the globe.
            let pickedObject = this.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject)) {
              earthPosition = this.viewer.scene.pickPosition(event.position);
            }
            if (Cesium.defined(earthPosition)) {
              const heading = Cesium.Math.toRadians(135);
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
                  uri: "./assets/3dmodels/CesiumMilkTruck.glb"
                },
                // heighReference:Cesium.HeightReference.RELATIVE_TO_GROUND
                heighReference:Cesium.HeightReference.CLAMP_TO_GROUND
              });
              mouseOverModelHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
              this.viewer.remove(mouseOverEntity)
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        } else {
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      // this.viewer.trackedEntity = entity;
    });

  }
}
