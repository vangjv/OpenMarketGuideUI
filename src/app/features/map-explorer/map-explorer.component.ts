import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CesiumService } from 'src/app/services/cesium.service';
import { DialogsService } from 'src/app/services/dialogs.service';

@Component({
  selector: 'app-map-explorer',
  templateUrl: './map-explorer.component.html',
  styleUrls: ['./map-explorer.component.scss'],
  providers: [ CesiumService ]
})
export class MapExplorerComponent implements OnInit, AfterViewInit {
  cesiumService:CesiumService = new CesiumService(this.dialogsService, this.router);
  constructor(private dialogsService:DialogsService, private router:Router) {

  }

  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("cesium");
    this.cesiumService.hideDefaultCesiumSearch();
    this.cesiumService.changeCesiumHomeButtonToGoToAppHome();
    this.cesiumService.mapExplorerService.createAllMarketBillboards();
    this.cesiumService.mapExplorerService.addBillboardPickedClickHandler();
  }

  ngOnInit(): void {
  }


}
