import { AfterViewInit, Component, OnInit, Signal, computed, effect, signal, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogsService } from 'src/app/services/dialogs.service';
import { MenuItem, MessageService } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { Subject, Subscription } from 'rxjs';
import { MapMode } from 'src/app/shared/models/map-mode.enum';
import { ThreeDModelInfo } from 'src/app/shared/models/three-d-model-info.model';
import { MarketService } from 'src/app/services/market.service';
import { Market } from 'src/app/shared/models/market.model';
@Component({
  selector: 'app-market-viewer',
  templateUrl: './market-viewer.component.html',
  styleUrls: ['./market-viewer.component.scss']
})
export class MarketViewerComponent implements AfterViewInit, OnInit, OnDestroy {
  items: MenuItem[] = [];
  @ViewChild('speedDial') speedDial!: SpeedDial;
  subscriptions = new Subscription();
  searchButton:any;
  speedDialButton:any;
  speedDialOriginalOnClickBehavior:any;
  new3dModel!:any;
  selectedEntity:any;
  showSidebar:boolean = false;
  stepState:number = 1;
  mapMode:MapMode = MapMode.EntitySelection;
  current3dModelSelected:ThreeDModelInfo | undefined = undefined;
  marketBoundary!:any;
  vendorLocations:any[] = [];
  threeDModelInfoList:ThreeDModelInfo[] = [];
  threeDModelEntities:any[] = [];
  markets:Market[] = [];
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.cesiumService.handleKeyboardTransformation(event);
  }
  constructor(private cesiumService:CesiumService, private formBuilder: FormBuilder, private dialogsService:DialogsService,
    private messageService:MessageService, private marketService:MarketService) {
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("cesium");
    this.cesiumService.setHomeLocation();
    this.subscriptions.add(
      this.marketService.getMarkets().subscribe((markets) => {
        console.log("markets:", markets);
        this.markets = markets;
        if (markets[0].location) {
          this.cesiumService.flyTo(markets[0].location);
          this.cesiumService.createEntitiesFromMarket(markets[0]);
        }
      })
    );
  }


}
