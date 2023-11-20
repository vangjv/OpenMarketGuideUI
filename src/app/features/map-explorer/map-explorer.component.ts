import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CesiumService } from 'src/app/services/cesium.service';

@Component({
  selector: 'app-map-explorer',
  templateUrl: './map-explorer.component.html',
  styleUrls: ['./map-explorer.component.scss'],
  providers: [ CesiumService ]
})
export class MapExplorerComponent implements OnInit, AfterViewInit {
  constructor(private cesiumService:CesiumService) {

  }

  ngAfterViewInit(): void {
    this.cesiumService.initializeMap2("map-explorer");
    this.cesiumService.hideDefaultCesiumSearch();
    this.cesiumService.changeCesiumHomeButtonToGoToAppHome();
    this.cesiumService.mapExplorerService.createAllMarketBillboards();
    this.cesiumService.mapExplorerService.addBillboardPickedClickHandler();
  }

  ngOnInit(): void {
  }


}
