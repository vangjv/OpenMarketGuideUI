import { Inject, Injectable } from '@angular/core';
import { DialogsService } from './dialogs.service';
import { CesiumService } from './cesium.service';
import { MapMode } from '../shared/models/map-mode.enum';
import { BehaviorSubject } from 'rxjs';
import { ThreeDModelInfo } from '../shared/models/three-d-model-info.model';
declare let Cesium: any;
@Injectable({
  providedIn: 'root'
})
export class ThreeDimensionalModelService {
  public new3dModel = new BehaviorSubject<any>(undefined);
  public new3dModel$ = this.new3dModel.asObservable();
  public clickHandler:any;
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
      if (this.cesiumService.mapMode.getValue() == MapMode.ThreeDModelPlacement) {
        this.cesiumService.mapMode.next(MapMode.EntitySelection);
      } else {
        this.cesiumService.mapMode.next(MapMode.ThreeDModelPlacement);
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


  enableAdding3DModel(modelUri:string){
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
      this.clickHandler.setInputAction((event:any)=> {
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
              name: "Raw",
              position: earthPosition,
              orientation: orientation,
              model: {
                uri: modelUri,
                scale: 1
              },
              // heighReference:Cesium.HeightReference.RELATIVE_TO_GROUND
              heighReference:Cesium.HeightReference.CLAMP_TO_GROUND
            });
            this.new3dModel.next(newEntity);
            //mouseOverModelHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
            // this.viewer.entities.remove(mouseOverEntity);
            this.cesiumService.mapMode.next(MapMode.EntitySelection);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }

  resetLeftandRightClickHandler(){
    if (this.clickHandler) {
      this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
  }

  disableAdding3DModel() {
    const add3DModelBtn = document.getElementById("add3DModelBtn");
    if (add3DModelBtn)
    {
      add3DModelBtn.innerHTML = "M";
      this.cesiumService.removeEntityById(this.viewer, "mouseOverEntity");
      this.cesiumService.enableEntitySelectionMode();
      this.cesiumService.setDefaultHoverFunctionality();
    }
  }

  get3dModels():ThreeDModelInfo[]{
    return [
      {
        "name" : "ATM",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/ATM.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/ATM.glb"
      },
      {
        "name" : "Avocados and Bananas",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/AvocadosandBananas.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/AvocadosandBananas.glb"
      },
      {
        "name" : "Garden Table",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/GardenTable.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/GardenTable.glb"
      },
      {
        "name" : "Market Tent",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/MarketTent.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/MarketTent.glb"
      },
      {
        "name" : "Medical Kit",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/MedicalKit.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/MedicalKit.glb"
      },
      {
        "name" : "Out House",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/OutHouse.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/OutHouse.glb"
      },
      {
        "name" : "Picnic Table",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/PicnicTable.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/PicnicTable.glb"
      },
      {
        "name" : "Plants",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/Plants.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/Plants.glb"
      },
      {
        "name" : "Pumpkin",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/Pumpkin.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/Pumpkin.glb"
      },
      {
        "name" : "Pumpkin Table",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/PumpkinTable.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/PumpkinTable.glb"
      },
      {
        "name" : "Shopping Cart",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/ShoppingCart.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/ShoppingCart.glb"
      },
      {
        "name" : "Side Table",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/SideTable.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/SideTable.glb"
      },
      {
        "name" : "White Apples",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/WhiteApples.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/WhiteApples.glb"
      },
      {
        "name" : "Wide Table",
        "previewFile" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/WideTable.webp",
        "modelUri" : "https://omgmodelstorage.blob.core.windows.net/3dmodels/WideTable.glb"
      }
    ]
  }
}
