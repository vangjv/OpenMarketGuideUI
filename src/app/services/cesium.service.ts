import { Injectable } from '@angular/core';
import { BoundaryService } from './boundary.service';
declare let Cesium: any;
// import * as Cesium from '../assets/js/Cesium.js';
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2MWZlOTZjMy1iYjhiLTRkYjktOWEyYS0xYjllYWM4NmQ3YjYiLCJpZCI6ODM1MzksImlhdCI6MTY2MTU0NTg0MX0.PBHIiiQPO0_kfthCfRxp4VVGlhFZp4BMKIeILBwYuqk";
Cesium.GoogleMaps.defaultApiKey = "AIzaSyCGia9D0eVwiSKfTEHMKIMPecAar40kqoc";
@Injectable({
  providedIn: 'root'
})
export class CesiumService {
  private viewer: any;
  private camera:any;
  private scene:any;
  public boundaryService!:BoundaryService;
  constructor() {

  }



  async initializeMap(div:string){
    this.viewer = new Cesium.Viewer(div, {
      selectionIndicator: false,
      infoBox: false,
      //terrain: Cesium.Terrain.fromWorldTerrain(),
    });
    this.boundaryService = new BoundaryService(this.viewer);
    this.camera = this.viewer.camera;
    this.scene = this.viewer.scene;
    if (!this.scene.pickPositionSupported) {
      window.alert("This browser does not support pickPosition.");
    }

    try {
      const tileset = await Cesium.createGooglePhotorealistic3DTileset();
      this.scene.primitives.add(tileset);
    } catch (error) {
      console.log(`Failed to load tileset: ${error}`);
    }
    this.hideAnimationWidget();
    this.hideCesiumIonLogo();
    this.hideTimelineWidget();
  };

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
        this.scene.camera.setView(homeLocation); // Set the new home location
    });
  }

  setCoordinates(longitude:number, latitude:number, height:number) {
    this.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
        }
    });
  }

  addCoordinatesOnDoubleClick(){
    var handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
    handler.setInputAction((click:any)=> {
        var pickedObject = this.scene.pick(click.position);
        if (Cesium.defined(pickedObject)) {
            var cartesian = this.scene.pickPosition(click.position);
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

    let handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
    handler.setInputAction((movement:any) => {
      const cartesian = this.camera.pickEllipsoid(
        movement.endPosition,
        this.scene.globe.ellipsoid
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



  addBillboardOnClick(){
    var handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
    handler.setInputAction((click:any)=> {
      var pickedObject = this.scene.pick(click.position);
      if (Cesium.defined(pickedObject)) {
        var cartesian = this.scene.pickPosition(click.position);
        if (Cesium.defined(cartesian)) {
            this.viewer.entities.add({
                position: cartesian,
                label: {
                    //image: '/assets/images/hero-13.png', // Replace with the URL to your image
                    //width: 32, // Optional: Set width in pixels
                    //height: 32, // Optional: Set height in pixels,
                    // disableDepthTestDistance: 1.2742018*10**7,
                    show:true,
                    text: 'Hello World',
                    font : '14px monospace',
                    disableDepthTestDistance: 1.2742018*10**7
                    // clampToGround: true,
                    // verticalOrigin: Cesium.VerticalOrigin.TOP,
                    // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                }
            });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  public static removeEntityById(viewer:any, entityId:string) {
    const entity = viewer.entities.getById(entityId);
    if (entity) {
      viewer.entities.remove(entity);
    }
  }

}
