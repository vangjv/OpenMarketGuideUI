import { Injectable } from '@angular/core';
declare let Cesium: any;
// import * as Cesium from '../assets/js/Cesium.js';
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2MWZlOTZjMy1iYjhiLTRkYjktOWEyYS0xYjllYWM4NmQ3YjYiLCJpZCI6ODM1MzksImlhdCI6MTY2MTU0NTg0MX0.PBHIiiQPO0_kfthCfRxp4VVGlhFZp4BMKIeILBwYuqk";
Cesium.GoogleMaps.defaultApiKey = "AIzaSyCGia9D0eVwiSKfTEHMKIMPecAar40kqoc";
@Injectable({
  providedIn: 'root'
})
export class CesiumService {
constructor() { }
  private viewer: any;
  async plotPoints(div:string){
    this.viewer = new Cesium.Viewer(div, {
      globe: false
    });

    try {
      const tileset = await Cesium.createGooglePhotorealistic3DTileset();
      this.viewer.scene.primitives.add(tileset);
    } catch (error) {
      console.log(`Failed to load tileset: ${error}`);
    }

    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
      point: {
        color: Cesium.Color.RED,
        pixelSize: 16,
      },
    });
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(-80.5, 35.14),
      point: {
        color: Cesium.Color.BLUE,
        pixelSize: 16,
      },
    });
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(-80.12, 25.46),
      point: {
        color: Cesium.Color.YELLOW,
        pixelSize: 16,
      },
    });
    this.viewer.animation.container.style.visibility = 'hidden';
    this.viewer.timeline.container.style.visibility = 'hidden';
    this.viewer._cesiumWidget._creditContainer.style.display = "none";
  }

  createPoint(worldPosition:any) {
    const point = this.viewer.entities.add({
      position: worldPosition,
      point: {
        color: Cesium.Color.WHITE,
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    return point;
  }

}
