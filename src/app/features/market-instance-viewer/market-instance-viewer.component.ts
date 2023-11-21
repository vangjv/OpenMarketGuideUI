import { AfterViewInit, Component, OnInit, Signal, computed, effect, signal, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { Subject, Subscription } from 'rxjs';
import { MapMode } from 'src/app/shared/models/map-mode.enum';
import { ThreeDModelInfo } from 'src/app/shared/models/three-d-model-info.model';
import { Market } from 'src/app/shared/models/market.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { AppStateService } from 'src/app/services/app-state.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ThreeDModelCollectionService } from 'src/app/services/three-dimensional-model-collection.service';
import { MarketInstance } from 'src/app/shared/models/market-instance.model';
import { MarketInstanceService } from 'src/app/services/market-instance.service';
import { VendorLocation } from 'src/app/shared/models/vendor-location.model';
enum SideBarState {
  VendorLocations = "VendorLocations",
  MarketDates = "MarketDates"
}

@Component({
  selector: 'app-market-instance-viewer',
  templateUrl: './market-instance-viewer.component.html',
  styleUrls: ['./market-instance-viewer.component.scss']
})
export class MarketInstanceViewerComponent implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild('opAddVendorLocations') opAddVendorLocations!: OverlayPanel;
  @ViewChild('op3DModelPlacement') op3DModelPlacement!: OverlayPanel;
  @ViewChild('marketinstanceviewer') marketinstanceviewer!: ElementRef;
  currentUser: AccountInfo | undefined;
  userIsOwner: boolean = false;
  items: MenuItem[] = [];
  @ViewChild('speedDial') speedDial!: SpeedDial;
  SideBarState = SideBarState
  sidebarState: SideBarState = SideBarState.VendorLocations;
  subscriptions = new Subscription();
  searchButton: any;
  speedDialButton: any;
  speedDialOriginalOnClickBehavior: any;
  new3dModel!: any;
  selectedEntity: any;
  doubleClickedEntity: any;
  showSidebar: boolean = false;
  stepState: number = 1;
  mapMode: MapMode = MapMode.EntitySelection;
  current3dModelSelected: ThreeDModelInfo | undefined = undefined;
  marketBoundary!: any;
  vendorLocations: any[] = [];
  threeDModelInfoList: ThreeDModelInfo[] = [];
  threeDModelEntities: any[] = [];
  // markets:Market[] = [];
  marketInstanceId?: string;
  marketInstance: MarketInstance | undefined = undefined;
  menuItems: MenuItem[];
  showLabels: boolean = true;
  show3DModels: boolean = true;
  showVendorLocations: boolean = true;
  showVendorBar: boolean = false;
  showQRCode: boolean = false;
  urlForQRCode: string = "";
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.cesiumService.handleKeyboardTransformation(event);
  }
  constructor(private cesiumService: CesiumService, private formBuilder: FormBuilder, private router: Router, private appStateService: AppStateService,
    private messageService: MessageService, private marketInstanceService: MarketInstanceService, private route: ActivatedRoute,
    private threeDModelCollectionService:ThreeDModelCollectionService) {
    effect(() => {
      this.currentUser = this.appStateService.state.$currentUser();
    });
    this.menuItems = this.generateMenuItems();
    this.urlForQRCode = window.location.href;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.marketInstanceId = params['marketinstanceid'];
      console.log('Market Instance ID:', this.marketInstanceId);
      // Do something with the market ID
      if (this.marketInstanceId == undefined) {
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

  async ngAfterViewInit(): Promise<void> {
    await this.cesiumService.initializeMap("marketinstanceviewer");
    this.cesiumService.hideDefaultCesiumSearch();
    this.cesiumService.changeCesiumHomeButtonToGoToAppHome();
    this.addSubscriptions();
    if (this.marketInstanceId) {
      this.subscriptions.add(
        this.marketInstanceService.getMarketInstanceById(this.marketInstanceId).subscribe((marketInstance) => {
          console.log("marketInstance:", marketInstance);
          this.marketInstance = marketInstance;
          if (marketInstance.location) {
            this.cesiumService.flyTo(marketInstance.location);
            this.cesiumService.createEntitiesFromMarket(marketInstance);
            this.cesiumService.mapMode.next(MapMode.EntitySelection);
            if (this.marketInstance?.vendorLocations) {
              this.cesiumService.createVendorLabelsForEntities(this.marketInstance?.vendorLocations);
              this.cesiumService.createBillboardsForVendorLocations(this.marketInstance?.vendorLocations);
            }
            this.cesiumService.addQRButton("marketinstanceviewer");
          }
          this.setUserAsOwnerIfIsMarketOwner();
          this.addSubscriptions();
          this.cesiumService.enableEntityDoubleClickedMode();
        })
      );
    }
  }

  setUserAsOwnerIfIsMarketOwner() {
    if (this.currentUser && this.currentUser.idTokenClaims?.oid) {
      if (this.marketInstance?.marketUsers) {
        const owner = this.marketInstance?.marketUsers.find(user => user.id === this.currentUser?.idTokenClaims?.oid && user.role === "Owner");
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
    //monitor when entity is doubleclicked
    this.subscriptions.add(
      this.cesiumService.doubleClickedEntity$.subscribe((doubleClickedEntity) => {
        if (this.mapMode == MapMode.EntitySelection) {
          this.doubleClickedEntity = doubleClickedEntity;
          console.log("doubleClickedEntity:", this.doubleClickedEntity);
          if (doubleClickedEntity != undefined) {
            this.showVendorBar = true;
          }
        }
      })
    );
    //monitor qrcode button clicked
    this.subscriptions.add(
      this.cesiumService.qrCodeButtonPressed$.subscribe((clicked) => {
        if (clicked) {
          this.showQRCode = true;
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

  generateMenuItems(): MenuItem[] {
    return [
      // {
      //   icon: 'pi pi-pencil',
      //   tooltip: 'Add vendor location',
      //   tooltipOptions: {
      //     tooltipLabel: 'Add vendor location',
      //     tooltipEvent: 'hover',
      //     tooltipPosition: 'bottom'
      //   },
      //   command: () => {
      //     this.messageService.add({
      //       key: 'primary',
      //       severity: 'custom-2',
      //       summary: 'Message Title',
      //       closable: false,
      //       detail: 'Sagittis eu volutpat odio facilisis mauris sit amet. Sed velit dignissim sodales ut eu sem integer.',
      //       contentStyleClass: 'p-0'
      //     });
      //   }
      // },
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
      {
        icon: 'pi pi-tags',
        tooltip: 'Vendors Locations',
        tooltipOptions: {
          tooltipEvent: 'hover',
          tooltipPosition: 'bottom',
          tooltipLabel: 'Vendors'
        },
        command: () => {
          this.sidebarState = SideBarState.VendorLocations;
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
          this.sidebarState = SideBarState.MarketDates;
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
          console.log("Market Instance:", this.marketInstance);
        }
      }
    ];
  }

  saveChanges(){
    console.log("this.cesiumService.viewer.entities.values:", this.cesiumService.viewer.entities.values);
    let updatedMarketInstance = Market.buildUpdatedMarketFromCesiumEntities(this.marketInstance!, this.cesiumService.viewer.entities.values);
    console.log(updatedMarketInstance);
    this.marketInstanceService.updateMarketInstance(updatedMarketInstance).subscribe((marketInstance:MarketInstance) => {
      console.log("updated market instance:", updatedMarketInstance);
      this.messageService.add({
        key: 'primary',
        severity: 'custom-2',
        summary: 'Success',
        closable: false,
        detail: 'The market instance was successfully updated',
        contentStyleClass: 'p-0'
      });
    });
  }

  zoomToVendorLocation(vendorLocation: VendorLocation) {
    this.cesiumService.searchAndZoomToLocation(vendorLocation);
  }

  onVendorAssigned(marketInstance: MarketInstance) {
    this.marketInstance = marketInstance;
    this.messageService.add({
      key: 'primary',
      severity: 'custom-2',
      summary: 'Success',
      closable: false,
      detail: 'The vendor was assigned successfully.',
      contentStyleClass: 'p-0'
    });
  }
}
