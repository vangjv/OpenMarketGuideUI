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
import { ThreeDModelCollectionService } from 'src/app/services/three-dimensional-model-collection.service';
import { MarketInstance } from 'src/app/shared/models/market-instance.model';
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
  @ViewChild('marketviewer') marketviewer!: ElementRef;
  currentUser: AccountInfo | undefined;
  userIsOwner: boolean = false;
  items: MenuItem[] = [];
  @ViewChild('speedDial') speedDial!: SpeedDial;
  SideBarState = SideBarState
  sidebarState: SideBarState = SideBarState.Vendors;
  subscriptions = new Subscription();
  searchButton: any;
  speedDialButton: any;
  speedDialOriginalOnClickBehavior: any;
  new3dModel!: any;
  selectedEntity: any;
  showSidebar: boolean = false;
  stepState: number = 1;
  mapMode: MapMode = MapMode.EntitySelection;
  current3dModelSelected: ThreeDModelInfo | undefined = undefined;
  marketBoundary!: any;
  vendorLocations: any[] = [];
  threeDModelInfoList: ThreeDModelInfo[] = [];
  threeDModelEntities: any[] = [];
  // markets:Market[] = [];
  marketId?: string;
  market: Market | undefined = undefined;
  showLabels:boolean = true;
  show3DModels: boolean = true;
  showVendorLocations: boolean = true;
  menuItems: MenuItem[] = [
    {
      icon: 'pi pi-pencil',
      tooltip: 'Add vendor location',
      tooltipOptions: {
        tooltipLabel: 'Add vendor location',
        tooltipEvent: 'hover',
        tooltipPosition: 'bottom'
      },
      command: () => {
        this.messageService.add({
          key: 'primary',
          severity: 'custom-2',
          summary: 'Message Title',
          closable: false,
          detail: 'Sagittis eu volutpat odio facilisis mauris sit amet. Sed velit dignissim sodales ut eu sem integer.',
          contentStyleClass: 'p-0'
        });
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
      command: (event) => {
        console.log("event:", event);
        this.op3DModelPlacement.show(event.originalEvent, this.speedDialButton);
      }
    },
    // {
    //   icon: 'pi pi-users',
    //   tooltip: 'Vendors',
    //   tooltipOptions: {
    //     tooltipEvent: 'hover',
    //     tooltipPosition: 'bottom',
    //     tooltipLabel: 'Vendors'
    //   },
    //   command: () => {
    //     this.showSidebar = true;
    //   }
    // },
    {
      icon: 'pi pi-calendar',
      tooltip: 'Market instances',
      tooltipOptions: {
        tooltipEvent: 'hover',
        tooltipPosition: 'bottom',
        tooltipLabel: 'Market instances'
      },
      command: () => {
        this.showSidebar = true;
      }
    },
    {
      icon: 'pi pi-save',
      tooltip: 'Save',
      tooltipOptions: {
        tooltipEvent: 'hover',
        tooltipPosition: 'bottom',
        tooltipLabel: 'Save changes'
      },
      command: () => {
        this.saveChanges();
      }
    },
    {
      icon: 'pi pi-eye',
      tooltip: 'Show/Hide Labels',
      tooltipOptions: {
        tooltipEvent: 'hover',
        tooltipPosition: 'bottom',
        tooltipLabel: 'Show/Hide Labels'
      },
      command: () => {
        if (this.showLabels == true) {
          this.cesiumService.toggleLabels(false);
          this.showLabels = false;
        } else {
          this.cesiumService.toggleLabels(true);
          this.showLabels = true;
        }
      }
    },
    {
      icon: 'pi pi-eye-slash',
      tooltip: 'Show/Hide 3D Models',
      tooltipOptions: {
        tooltipEvent: 'hover',
        tooltipPosition: 'bottom',
        tooltipLabel: 'Show/Hide 3D Models'
      },
      command: () => {
        if (this.show3DModels == true) {
          this.cesiumService.toggle3DModels(false);
          this.show3DModels = false;
        } else {
          this.cesiumService.toggle3DModels(true);
          this.show3DModels = true;
        }
      }
    },
    {
      icon: 'pi pi-shopping-cart',
      tooltip: 'Show/Hide Vendor Locations',
      tooltipOptions: {
        tooltipEvent: 'hover',
        tooltipPosition: 'bottom',
        tooltipLabel: 'Show/Hide Vendor Locations'
      },
      command: () => {
        if (this.showVendorLocations == true) {
          this.cesiumService.toggleVendorLocations(false);
          this.showVendorLocations = false;
        } else {
          this.cesiumService.toggleVendorLocations(true);
          this.showVendorLocations = true;
        }
      }
    },
    {
      icon: 'pi pi-database',
      tooltip: 'Log entities',
      tooltipOptions: {
        tooltipEvent: 'hover',
        tooltipPosition: 'bottom',
        tooltipLabel: 'Console log entities'
      },
      command: () => {
        console.log("Entities:", this.cesiumService.viewer.entities.values);
      }
    }
  ];
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.cesiumService.handleKeyboardTransformation(event);
  }
  constructor(private cesiumService: CesiumService, private formBuilder: FormBuilder, private router: Router, private appStateService: AppStateService,
    private messageService: MessageService, private marketService: MarketService, private route: ActivatedRoute,
    private threeDModelCollectionService:ThreeDModelCollectionService) {
    effect(() => {
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
    //load 3dmodels
    this.threeDModelCollectionService.getPublic3DModels().subscribe((threeDModelInfoList:ThreeDModelInfo[]) => {
      this.threeDModelInfoList = threeDModelInfoList;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("marketviewer");
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
            this.cesiumService.createLabelsForVendorLocations();
          }
          this.setUserAsOwnerIfIsMarketOwner();
          this.addSubscriptions();
        })
      );
    }
  }

  setUserAsOwnerIfIsMarketOwner() {
    if (this.currentUser && this.currentUser.idTokenClaims?.oid) {
      if (this.market?.marketUsers) {
        const owner = this.market?.marketUsers.find(user => user.id === this.currentUser?.idTokenClaims?.oid && user.role === "Owner");
        if (owner) {
          this.userIsOwner = true;
        }
      }
    }
  }

  addSubscriptions() {
    this.subscriptions.add(
      this.cesiumService.mapMode$.subscribe((mode) => {
        console.log("mapMode:", mode);
        this.mapMode = mode;
        if (mode == MapMode.EntitySelection) {
          this.cesiumService.resetLeftandRightClickHandlers()
          this.cesiumService.enableEntitySelectionMode();
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
        }
      })
    );
    //monitor when an entity is selected
    this.subscriptions.add(
      this.cesiumService.selectedEntity$.subscribe((selectedEntity) => {
        if (this.mapMode == MapMode.EntitySelection) {
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

  enableVendorLocationDrawingMode() {
    this.cesiumService.mapMode.next(MapMode.VendorLocationDrawing);
  }

  openAddVendorLocationDialog() {
    this.opAddVendorLocations.show(null, this.speedDialButton);
  }

  update3dModelSelection(threeDModelInfo: ThreeDModelInfo) {
    this.current3dModelSelected = threeDModelInfo;
  }

  enable3DModelPlacement() {
    this.cesiumService.mapMode.next(MapMode.ThreeDModelPlacement);
  }

  saveChanges(){
    console.log("this.cesiumService.viewer.entities.values:", this.cesiumService.viewer.entities.values);
    let updatedMarket = Market.buildUpdatedMarketFromCesiumEntities(this.market!, this.cesiumService.viewer.entities.values);
    console.log(updatedMarket);
    this.marketService.updateMarket(updatedMarket).subscribe((market:Market) => {
      console.log("updated market:", updatedMarket);
      this.messageService.add({
        key: 'primary',
        severity: 'custom-2',
        summary: 'Success',
        closable: false,
        detail: 'The market was successfully updated',
        contentStyleClass: 'p-0'
      });
    });
  }


}
