import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
@Component({
  selector: 'app-cesium',
  templateUrl: './cesium.component.html',
  styleUrls: ['./cesium.component.scss']
})
export class CesiumComponent implements AfterViewInit, OnInit {
  constructor(private cesiumService:CesiumService) {
  }
  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("cesium");
    this.cesiumService.addCoordinateViewer();
    //this.cesiumService.addCoordinatesOnDoubleClick();
    this.cesiumService.setHomeLocation();
    this.cesiumService.boundaryService.addDrawPolygonButton();
    // this.cesiumService.boundaryService.addDrawPolygonFunctionality();
    //this.cesiumService.addBillboardOnClick();
  }

  ngOnInit(): void {

    }

}
