import { Inject, Injectable } from '@angular/core';
import { CesiumService } from './cesium.service';
import { DialogsService } from './dialogs.service';
import { Router } from '@angular/router';
declare let Cesium: any;

@Injectable({
  providedIn: 'root'
})
export class MapExplorerService {
  marketCollection:any[] = [
    { name: 'Market 1', latitude: 34.05, longitude: -118.25 },
    { name: 'Market 2', latitude: 36.17, longitude: -115.14 },
    { name: 'Market 3', latitude: 33.45, longitude: -112.07 },
    { name: 'Market 4', latitude:  38.981544, longitude: -77.010674 },
    { name: 'Market 5', latitude: 43.680031, longitude:  -70.310425 },
    { name: 'Market 6', latitude: 38.206348, longitude: -84.270172 },
    { name: 'Market 7', latitude: 	37.406769, longitude: 	-94.705528 },
    { name: 'Market 8', latitude: 39.313015, longitude: -94.941147 },
    { name: 'Market 9', latitude: 	41.703957, longitude: 	-93.054817 },
    { name: 'Market 10', latitude: 	34.603817, longitude: 	-86.985039 },
    {"name": 'Market 11', "latitude": 40.712776, "longitude": -74.005974},
    {"name": 'Market 12', "latitude": 41.878113, "longitude": -87.629799},
    {"name": 'Market 13', "latitude": 29.760427, "longitude": -95.369803},
    {"name": 'Market 14', "latitude": 33.448376, "longitude": -112.074036},
    {"name": 'Market 15', "latitude": 39.739236, "longitude": -104.990251},
    {"name": 'Market 16', "latitude": 25.761681, "longitude": -80.191788},
    {"name": 'Market 17', "latitude": 47.606209, "longitude": -122.332069},
    {"name": 'Market 18', "latitude": 44.977753, "longitude": -93.265011},
    {"name": 'Market 19', "latitude": 38.627003, "longitude": -90.199404},
    {"name": 'Market 20', "latitude": 36.162664, "longitude": -86.781602}
  ];
  constructor(@Inject('viewer') private viewer:any, private dialogsService:DialogsService, private cesiumService:CesiumService, private router:Router) { }

  createMarketBillboard(market:any){
    //let url = Cesium.buildModuleUrl("./assets/favicon/favicon-32x32.png");
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(market.longitude, market.latitude),
      billboard: {
        image: "./assets/favicon/favicon-32x32.png",
        width: 32,
        height: 32,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        disableDepthTestDistance: 1.2742018*10**7 //
      },
      label: {
        text: market.name,
        font: '14pt monospace',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        disableDepthTestDistance: 1.2742018*10**7,
        pixelOffset: new Cesium.Cartesian2(0, 32),
      },
    });
  }

  createAllMarketBillboards(){
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.marketCollection.forEach((market:any) => {
      this.createMarketBillboard(market);
    });
    console.log(this.viewer.entities);
  }

  addBillboardPickedClickHandler(){
    let clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    clickHandler.setInputAction((event:any)=> {
      let pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        const id = Cesium.defaultValue(pickedObject.id, pickedObject.primitive.id);
        if (id instanceof Cesium.Entity) {
          console.log("object clicked:", id);
          this.router.navigateByUrl('/market-instance/Neverland:91dd844e-aa86-4c99-a24f-3b9a5a9e637c:201120230810');
          //this.selectedEntity.next(id);
          return id;
        } else {
          //this.selectedEntity.next(undefined);
        }
      } else {
        //this.selectedEntity.next(undefined);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}
