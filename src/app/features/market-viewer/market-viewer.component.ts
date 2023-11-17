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
import { ActivatedRoute, Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { AppStateService } from 'src/app/services/app-state.service';
import { OverlayPanel } from 'primeng/overlaypanel';
enum SideBarState {
  Vendors = "Vendors",
  MarketDates = "MarketDates"
}

@Component({
  selector: 'app-market-viewer',
  templateUrl: './market-viewer.component.html',
  styleUrls: ['./market-viewer.component.scss']
})
export class MarketViewerComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('opAddVendorLocations') opAddVendorLocations!: OverlayPanel;
  @ViewChild('op3DModelPlacement') op3DModelPlacement!: OverlayPanel;
  currentUser: AccountInfo | undefined;
  userIsOwner: boolean = false;
  items: MenuItem[] = [];
  @ViewChild('speedDial') speedDial!: SpeedDial;
  SideBarState = SideBarState
  sidebarState:SideBarState = SideBarState.Vendors;
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
  // markets:Market[] = [];
  marketId: string | null = null;
  market:Market | undefined = undefined;
  menuItems:MenuItem[] = [
    {
        icon: 'pi pi-pencil',
        tooltip: 'Add vendor location',
        tooltipOptions: {
          tooltipLabel: 'Add vendor location',
          tooltipEvent: 'hover',
          tooltipPosition: 'bottom'
        },
        command: () => {
          this.messageService.add({ key: 'primary', severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
        }
    },
    {
        icon: 'pi pi-box',
        tooltip: 'Add 3d model',
        tooltipOptions: {
          tooltipEvent: 'hover',
          tooltipPosition: 'bottom',
          tooltipLabel: 'Add 3d model'
        },
        command: () => {
          this.messageService.add({ key: 'primary', severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
        }
    },
    {
        icon: 'pi pi-users',
        tooltip: 'Vendors',
        tooltipOptions: {
          tooltipEvent: 'hover',
          tooltipPosition: 'bottom',
          tooltipLabel: 'Vendors'
        },
        command: () => {
          this.showSidebar = true;
        }
    },
    {
        icon: 'pi pi-calendar',
        tooltip: 'Market dates',
        tooltipOptions: {
          tooltipEvent: 'hover',
          tooltipPosition: 'bottom',
          tooltipLabel: 'Market dates'
        },
        command: () => {
          this.messageService.add({ key: 'primary', severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
        }
    }
  ];
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.cesiumService.handleKeyboardTransformation(event);
  }
  constructor(private cesiumService:CesiumService, private formBuilder: FormBuilder, private router:Router,private appStateService:AppStateService,
    private messageService:MessageService, private marketService:MarketService, private route: ActivatedRoute) {    effect(() => {
      this.currentUser = this.appStateService.state.$currentUser();
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.marketId = params['marketid'];
      console.log('Market ID:', this.marketId);
      // Do something with the market ID
      if (this.marketId == undefined) {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("market-viewer");
    this.cesiumService.hideDefaultCesiumSearch();
    this.cesiumService.changeCesiumHomeButtonToGoToAppHome();
    this.addSubscriptions();
    if (this.marketId) {
      this.subscriptions.add(
        this.marketService.getMarketById(this.marketId).subscribe((market) => {
          console.log("market:", market);
          this.market = market;
          if (market.location) {
            this.cesiumService.flyTo(market.location);
            this.cesiumService.createEntitiesFromMarket(market);
            this.cesiumService.mapMode.next(MapMode.EntitySelection);
          }
          console.log("this.currentUser:", this.currentUser);
          this.setUserAsOwnerIfIsMarketOwner();
        })
      );
    }
  }

  setUserAsOwnerIfIsMarketOwner(){
    if (this.currentUser && this.currentUser.idTokenClaims?.oid) {
      if (this.market?.marketUsers) {
        const owner = this.market?.marketUsers.find(user => user.id === this.currentUser?.idTokenClaims?.oid && user.role === "Owner");
        if (owner) {
          this.userIsOwner = true;
        }
      }
    }
  }

  addSubscriptions(){
    this.subscriptions.add(
      this.cesiumService.mapMode$.subscribe((mode) => {
        console.log("mapMode:", mode);
        this.mapMode = mode;
        if(mode == MapMode.EntitySelection){
          this.cesiumService.resetLeftandRightClickHandlers()
          this.cesiumService.enableEntitySelectionMode();
        } else if (mode == MapMode.MarketBoundaryDrawing) {
          this.cesiumService.resetLeftandRightClickHandlers()
          this.cesiumService.boundaryService.enableDrawMarketBoundaryFunctionallity();
          console.log("enableDrawMarketBoundaryFunctionallity");
        } else if (mode == MapMode.VendorLocationDrawing) {
          this.cesiumService.resetLeftandRightClickHandlers()
          this.cesiumService.boundaryService.enableVendorLocationDrawingMode();
          console.log("enableVendorLocationDrawingMode");
        } else if (mode == MapMode.ThreeDModelPlacement) {
          this.cesiumService.resetLeftandRightClickHandlers()
          console.log("this.current3dModelSelected:", this.current3dModelSelected);
          if (this.current3dModelSelected) {
            this.cesiumService.threeDimensionalModelService.enableAdding3DModel(this.current3dModelSelected.modelUri, this.current3dModelSelected.name,
              this.current3dModelSelected.defaultScale);
          }
          this.speedDial.onButtonClick = (event) => {
            // this.op3DModelPlacement.show(null, this.speedDialButton);
          };
          console.log("enable3dModelPlacement");
        }
      })
    );
    //monitor market boundary completed
    this.subscriptions.add(
      this.cesiumService.boundaryService.marketBoundary$.subscribe((marketBoundary) => {
        if(marketBoundary){
          this.marketBoundary = marketBoundary;
          // this.opAddBoundary.show(null, this.speedDialButton);
          console.log("marketBoundary:", this.marketBoundary);
        }
      })
    );
    //monitor when a new vendor location is added to map
    this.subscriptions.add(
      this.cesiumService.boundaryService.vendorLocation$.subscribe((vendorLocation) => {
        if(vendorLocation){
          this.vendorLocations.push(vendorLocation);
          console.log("vendorLocation:", vendorLocation);
        }
      })
    );
    //monitor when new 3dmodel is added to map
    this.subscriptions.add(
      this.cesiumService.threeDimensionalModelService.new3dModel$.subscribe((new3dModel) => {
        if(new3dModel){
          this.new3dModel = new3dModel;
          this.threeDModelEntities.push(new3dModel);
          console.log("new3dModel:", this.new3dModel);
        }
      })
    );
    //monitor when an entity is selected
    this.subscriptions.add(
      this.cesiumService.selectedEntity$.subscribe((selectedEntity) => {
        if(this.mapMode == MapMode.EntitySelection){
          this.selectedEntity = selectedEntity;
          console.log("selectedEntity:", this.selectedEntity);
          if (this.selectedEntity == undefined) {
            this.cesiumService.removeHighlightFromAllEntities();
          } else {
            if (this.selectedEntity?.model || this.selectedEntity?.polygon) {
              // Highlight the model by changing its color
              this.cesiumService.highlightEntity(this.selectedEntity);
            }
          }
        }
      })
    );
  }

  enableVendorLocationDrawingMode(){
    this.cesiumService.mapMode.next(MapMode.VendorLocationDrawing);
  }

  openAddVendorLocationDialog(){
    this.opAddVendorLocations.show(null, this.speedDialButton);
  }

  update3dModelSelection(threeDModelInfo:ThreeDModelInfo){
    this.current3dModelSelected = threeDModelInfo;
  }

  enable3DModelPlacement(){
    this.cesiumService.mapMode.next(MapMode.ThreeDModelPlacement);
  }


}
