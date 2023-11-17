import { AfterViewInit, Component, OnInit, Signal, computed, effect, signal, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogsService } from 'src/app/services/dialogs.service';
import { MenuItem, MessageService } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subject, Subscription } from 'rxjs';
import { MapMode } from 'src/app/shared/models/map-mode.enum';
import { ThreeDModelInfo } from 'src/app/shared/models/three-d-model-info.model';
import { Market } from 'src/app/shared/models/market.model';
import { Boundary } from 'src/app/shared/models/boundary.model';
import { CoordinateData } from 'src/app/shared/models/coordinate-data.model';
import { VendorLocation } from 'src/app/shared/models/vendor-location.model';
import { ThreeDModelEntity } from 'src/app/shared/models/three-d-model-entity.model';
import { MarketService } from 'src/app/services/market.service';
import { Router } from '@angular/router';
import { ThreeDModelCollectionService } from 'src/app/services/three-dimensional-model-collection.service';
import { MarketLocation } from 'src/app/shared/models/market-location.model';
@Component({
  selector: 'app-market-setup',
  templateUrl: './market-setup.component.html',
  styleUrls: ['./market-setup.component.scss']
})
export class MarketSetupComponent implements AfterViewInit, OnInit, OnDestroy {
  items: MenuItem[] = [];
  @ViewChild('speedDial') speedDial!: SpeedDial;
  @ViewChild('opSearch') opSearch!: OverlayPanel;
  @ViewChild('opAddBoundary') opAddBoundary!: OverlayPanel;
  @ViewChild('opAddVendorLocations') opAddVendorLocations!: OverlayPanel;
  @ViewChild('op3DModelPlacement') op3DModelPlacement!: OverlayPanel;
  mapSearchForm: FormGroup;
  marketNameForm: FormGroup;
  showSaveBoundaryDialog:Signal<boolean> = signal(false);
  subscriptions = new Subscription();
  vendorLocationForm: FormGroup;
  searchButton:any;
  speedDialButton:any;
  speedDialOriginalOnClickBehavior:any;
  new3dModel!:any;
  selectedEntity:any;
  showSidebar:boolean = false;
  stepState:number = 1;
  mapMode:MapMode = MapMode.EntitySelection;
  current3dModelSelected:ThreeDModelInfo | undefined = undefined;
  marketLocation!:any;
  vendorLocations:any[] = [];
  threeDModelInfoList:ThreeDModelInfo[] = [];
  threeDModelEntities:any[] = [];
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.cesiumService.handleKeyboardTransformation(event);
  }
  constructor(private cesiumService:CesiumService, private formBuilder: FormBuilder, private dialogsService:DialogsService,
    private messageService:MessageService, private el: ElementRef, private marketService:MarketService, private router:Router,
    private threeDModelCollectionService:ThreeDModelCollectionService) {
    this.mapSearchForm = this.createMapSearchForm();
    this.marketNameForm = this.createMarketNameForm();
    this.vendorLocationForm = this.createVendorLocationForm();
  }


  ngOnInit(): void {
    this.showSaveBoundaryDialog = computed(() => {
      return this.dialogsService.showAddBoundaryDialog();
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
    this.cesiumService.initializeMap("market-setup");
    this.cesiumService.hideDefaultCesiumSearch();
    this.cesiumService.changeCesiumHomeButtonToGoToAppHome();
    this.addSubscriptions();
    const speedDialMenuItems = this.el.nativeElement.querySelectorAll('.p-speeddial-list');
    this.searchButton = speedDialMenuItems[0].children[0];
    const speedDialButton = this.el.nativeElement.querySelectorAll('.p-speeddial-button ');
    this.speedDialButton = speedDialButton[0];
    this.speedDial.onButtonClick = (event) => {
      this.opSearch.show(event, this.speedDialButton);
    };
    this.opSearch.show(null, this.speedDialButton);
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
            this.op3DModelPlacement.show(null, this.speedDialButton);
          };
          console.log("enable3dModelPlacement");
        }
      })
    );
    //monitor market boundary completed
    this.subscriptions.add(
      this.cesiumService.boundaryService.marketLocation$.subscribe((marketLocation) => {
        if(marketLocation){
          this.marketLocation = marketLocation;
          this.opAddBoundary.show(null, this.speedDialButton);
          console.log("marketLocation:", this.marketLocation);
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

  progressStep(event:any){
    this.stepState++;
    if (this.stepState == 2) {
      this.speedDial.onButtonClick = (event) => {
        this.opAddBoundary.show(event, this.speedDialButton);
      };
      this.opAddBoundary.show(event, this.speedDialButton);
    } else if (this.stepState == 3) {
      this.speedDial.onButtonClick = (event) => {
        this.opAddVendorLocations.show(event, this.speedDialButton);
      };
      this.opAddVendorLocations.show(event, this.speedDialButton);
    } else if (this.stepState == 4) {
      this.speedDial.onButtonClick = (event) => {
        this.op3DModelPlacement.show(event, this.speedDialButton);
      };
      this.op3DModelPlacement.show(event, this.speedDialButton);
    } else {
      console.log("marketLocation:",  this.marketLocation);
      console.log("vendorLocations:",  this.vendorLocations);
      console.log("threeDModelEntities:",  this.threeDModelEntities);
    }
  }

  completeMarketSetup(event:any){
    console.log("this.marketLocation):",  this.marketLocation);
    console.log("this.vendorLocations:",  this.vendorLocations);
    console.log("this.threeDModelEntities:",  this.threeDModelEntities);
    let vendorLocations:VendorLocation[] = [];
    this.vendorLocations.forEach((vendorLocation:any) => {
      vendorLocations.push(VendorLocation.fromCesiumEntity(vendorLocation));
    });
    let threeDModelEntities:ThreeDModelEntity[] = [];
    this.threeDModelEntities.forEach((threeDModelEntity:any) => {
      threeDModelEntities.push(ThreeDModelEntity.fromCesiumEntity(threeDModelEntity));
    });
    let marketLocation = MarketLocation.fromCesiumEntity(this.marketLocation);
    console.log("marketLocation:", marketLocation);
    console.log("vendorLocations:", vendorLocations);
    console.log("threeDModelEntities:", threeDModelEntities);
    let market:Market = Market.buildMarket(this.marketNameForm.value.name, CoordinateData.fromCesiumEntity(this.marketLocation),
      marketLocation, vendorLocations, threeDModelEntities);
      console.log("completedMarket:", market);
    this.marketService.createMarket(market).subscribe((market:Market) => {
      console.log("new market:", market);
      this.router.navigate(['/market-viewer/' + market.id ]);
    });
  }

  createVendorLocationForm(){
    return this.formBuilder.group({
      name: ['', Validators.required],
      color: [{r:255,g:255,b:255}, Validators.required]
    });
  }

  createMapSearchForm(){
    return this.formBuilder.group({
      searchString: ['', Validators.required]
    });
  }

  createMarketNameForm(){
    return this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  enableMarketBoundaryDrawingMode(){
    this.cesiumService.mapMode.next(MapMode.MarketBoundaryDrawing);
  }

  enableVendorLocationDrawingMode(){
    this.cesiumService.mapMode.next(MapMode.VendorLocationDrawing);
  }

  openAddMarketBoundaryDialog(marketLocation:any){
    console.log(marketLocation);
    this.marketLocation = marketLocation._polygon._hierarchy._value.positions;
    console.log(this.marketLocation);
    this.opAddBoundary.show(null, this.speedDialButton);
  }

  openAddVendorLocationDialog(){
    this.opAddVendorLocations.show(null, this.speedDialButton);
  }

  saveBoundary(){
    this.dialogsService.toggleShowAddBoundaryDialog(false);
    this.cesiumService.boundaryService.completeVendorBoundary(this.vendorLocationForm.value.name, this.vendorLocationForm.value.color.r, this.vendorLocationForm.value.color.g, this.vendorLocationForm.value.color.b);
    this.vendorLocationForm = this.createVendorLocationForm()
  }

  searchAndZoom() {
    this.cesiumService.searchAndZoom(this.mapSearchForm.get('searchString')?.value);
  }

  resetMarketBoundary(){
    this.marketLocation = undefined;
    this.cesiumService.removeEntityById(this.cesiumService.viewer, "marketLocation");
  }

  update3dModelSelection(threeDModelInfo:ThreeDModelInfo){
    this.current3dModelSelected = threeDModelInfo;
  }

  enable3DModelPlacement(){
    this.cesiumService.mapMode.next(MapMode.ThreeDModelPlacement);
  }
}
