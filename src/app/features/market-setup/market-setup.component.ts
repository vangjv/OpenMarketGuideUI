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
  marketBoundary!:any;
  new3dModel!:any;
  selectedEntity:any;
  vendorLocations:any[] = [];
  showSidebar:boolean = false;
  nextDisabled:boolean = false;
  stepState:number = 1;
  mapMode:MapMode = MapMode.EntitySelection;
  current3dModelSelected:ThreeDModelInfo | undefined = undefined;
  threeDModelInfoList:ThreeDModelInfo[] = [];
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.cesiumService.handleKeyboardTransformation(event);
  }
  constructor(private cesiumService:CesiumService, private formBuilder: FormBuilder, private dialogsService:DialogsService,
    private messageService:MessageService, private el: ElementRef) {
    this.mapSearchForm = this.createMapSearchForm();
    this.marketNameForm = this.createMarketNameForm();
    this.vendorLocationForm = this.createVendorLocationForm();
  }


  ngOnInit(): void {
    this.showSaveBoundaryDialog = computed(() => {
      return this.dialogsService.showAddBoundaryDialog();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("cesium");
    this.cesiumService.setHomeLocation();
    this.cesiumService.boundaryService.addDrawBoundaryButton();
    this.cesiumService.threeDimensionalModelService.add3DModelButton();
    // this.cesiumService.enable3dModelRotation();
    this.addSubscriptions();
    const speedDialMenuItems = this.el.nativeElement.querySelectorAll('.p-speeddial-list');
    this.searchButton = speedDialMenuItems[0].children[0];
    const speedDialButton = this.el.nativeElement.querySelectorAll('.p-speeddial-button ');
    this.speedDialButton = speedDialButton[0];
    this.speedDial.onButtonClick = (event) => {
      // this.opSearch.show(event, this.speedDialButton);
      this.op3DModelPlacement.show(null, this.speedDialButton);
    };
    //load 3d models
    this.threeDModelInfoList = this.cesiumService.threeDimensionalModelService.get3dModels();
    // this.opSearch.show(null, this.speedDialButton);
    this.op3DModelPlacement.show(null, this.speedDialButton);


    // this.items = [
    //   {
    //     icon: 'pi pi-search',
    //     command: (click) => {
    //       const speedDialMenuItems = this.el.nativeElement.querySelectorAll('.p-speeddial-list');
    //       this.searchButton = speedDialMenuItems[0].children[0];
    //       this.overlayPanel.show(click.originalEvent, this.speedDialButton);
    //     },
    //     tooltipOptions: {
    //       tooltipLabel: 'Map search'
    //     },
    //   },
    //   {
    //     icon: 'pi pi-pencil',
    //     command: (click) => {
    //       this.opAddBoundary.show(click.originalEvent, this.speedDialButton);
    //     },
    //     tooltipOptions: {
    //       tooltipLabel: 'Draw market boundary'
    //     },
    //   }
    // ];
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
            this.cesiumService.threeDimensionalModelService.enableAdding3DModel(this.current3dModelSelected.modelUri);
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
      this.cesiumService.boundaryService.marketBoundary$.subscribe((marketBoundary) => {
        if(marketBoundary){
          this.marketBoundary = marketBoundary;
          this.opAddBoundary.show(null, this.speedDialButton);
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
    }
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

  openAddMarketBoundaryDialog(marketBoundary:any){
    console.log(marketBoundary);
    this.marketBoundary = marketBoundary._polygon._hierarchy._value.positions;
    console.log(this.marketBoundary);
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
    this.marketBoundary = undefined;
    this.cesiumService.removeEntityById(this.cesiumService.viewer, "marketBoundary");
  }

  update3dModelSelection(threeDModelInfo:ThreeDModelInfo){
    this.current3dModelSelected = threeDModelInfo;
  }

  enable3DModelPlacement(){
    this.cesiumService.mapMode.next(MapMode.ThreeDModelPlacement);
  }
}
