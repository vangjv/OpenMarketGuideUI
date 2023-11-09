import { AfterViewInit, Component, OnInit, Signal, computed, effect, signal, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogsService } from 'src/app/services/dialogs.service';
import { MenuItem, MessageService } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subject, Subscription } from 'rxjs';
import { MapMode } from 'src/app/shared/models/map-mode.enum';
@Component({
  selector: 'app-market-setup',
  templateUrl: './market-setup.component.html',
  styleUrls: ['./market-setup.component.scss']
})
export class MarketSetupComponent implements AfterViewInit, OnInit, OnDestroy {
  items: MenuItem[] = [];
  @ViewChild('speedDial') speedDial!: SpeedDial;
  @ViewChild('op') overlayPanel!: OverlayPanel;
  @ViewChild('opAddBoundary') opAddBoundary!: OverlayPanel;
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
  vendorBoundaries:any[] = [];
  showSidebar:boolean = false;
  nextDisabled:boolean = false;
  stepState:number = 1;
  mapMode:MapMode = MapMode.EntitySelection;
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
    this.subscriptions.add(
      this.cesiumService.mapMode$.subscribe((mode) => {
        console.log("mapMode:", mode);
        if(mode == MapMode.EntitySelection){
          this.cesiumService.setDefaultClickFunctionality();
        } else if (mode == MapMode.MarketBoundaryDrawing) {
          this.cesiumService.boundaryService.enableDrawMarketBoundaryFunctionallity();
          console.log("enableVendorLocationDrawingMode");
        } else if (mode == MapMode.VendorBoundaryDrawing) {
          this.cesiumService.boundaryService.enableVendorLocationDrawingMode();
          console.log("enableVendorLocationDrawingMode");
        } else if (mode == MapMode.ThreeDModelPlacement) {
          this.cesiumService.threeDimensionalModelService.enableAdding3DModel();
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
    this.subscriptions.add(
      this.cesiumService.threeDimensionalModelService.new3dModel$.subscribe((new3dModel) => {
        if(new3dModel){
          this.new3dModel = new3dModel;
          console.log("new3dModel:", this.new3dModel);
        }
      })
    );
    setTimeout(() => {
      const speedDialMenuItems = this.el.nativeElement.querySelectorAll('.p-speeddial-list');
      this.searchButton = speedDialMenuItems[0].children[0];
      const speedDialButton = this.el.nativeElement.querySelectorAll('.p-speeddial-button ');
      this.speedDialButton = speedDialButton[0];
      this.speedDial.onButtonClick = (event) => {
        this.overlayPanel.show(event, this.speedDialButton);
      };
      this.overlayPanel.show(null, this.speedDialButton);
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
    }, 1000);
  }

  progressStep(event:any){
    this.stepState++;
    if (this.stepState == 2) {
      this.speedDial.onButtonClick = (event) => {
        this.opAddBoundary.show(event, this.speedDialButton);
      };
      this.opAddBoundary.show(event, this.speedDialButton);
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

  openAddMarketBoundaryDialog(marketBoundary:any){
    console.log(marketBoundary);
    this.marketBoundary = marketBoundary._polygon._hierarchy._value.positions;
    console.log(this.marketBoundary);
    this.opAddBoundary.show(null, this.speedDialButton);
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

  progressToAddVendorLocations(){

  }
}
