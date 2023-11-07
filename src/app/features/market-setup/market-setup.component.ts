import { AfterViewInit, Component, OnInit, Signal, computed, effect, signal, ViewChild, ElementRef } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogsService } from 'src/app/services/dialogs.service';
import { MenuItem, MessageService } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { OverlayPanel } from 'primeng/overlaypanel';
@Component({
  selector: 'app-market-setup',
  templateUrl: './market-setup.component.html',
  styleUrls: ['./market-setup.component.scss']
})
export class MarketSetupComponent implements AfterViewInit, OnInit {
  items: MenuItem[] = [];
  @ViewChild('speedDial') speedDial!: SpeedDial;
  @ViewChild('op') overlayPanel!: OverlayPanel;
  @ViewChild('opAddBoundary') opAddBoundary!: OverlayPanel;
  mapSearchForm: FormGroup;
  marketNameForm: FormGroup;
  marketBoundaryDrawingState:Signal<boolean>;
  vendorBoundaryDrawingState:Signal<boolean>;
  adding3DModelState:Signal<boolean>;
  showSaveBoundaryDialog:Signal<boolean> = signal(false);
  vendorLocationForm: FormGroup;
  searchButton:any;
  speedDialButton:any;
  speedDialOriginalOnClickBehavior:any;
  constructor(private cesiumService:CesiumService, private formBuilder: FormBuilder, private dialogsService:DialogsService,
    private messageService:MessageService, private el: ElementRef) {
    this.mapSearchForm = this.createMapSearchForm();
    this.marketNameForm = this.createMarketNameForm();
    this.vendorLocationForm = this.createVendorLocationForm();
    this.marketBoundaryDrawingState = this.cesiumService.marketBoundaryDrawingState;
    this.vendorBoundaryDrawingState = this.cesiumService.vendorBoundaryDrawingState;
    this.adding3DModelState = this.cesiumService.adding3DModelState;
    effect(() => {
      if(this.vendorBoundaryDrawingState()==true){
        this.cesiumService.boundaryService.enableVendorLocationDrawingMode();
      } else {
        this.cesiumService.boundaryService.disableVendorLocationDrawingMode();
      }
    });
    effect(() => {
      if(this.adding3DModelState()==true){
        this.cesiumService.threeDimensionalModelService.enableAdding3DModel();
      } else {
        this.cesiumService.threeDimensionalModelService.disableAdding3DModel();
      }
    });
    // effect(() => {
    //   if(this.marketBoundaryDrawingState()==true){
    //     this.cesiumService.boundaryService.addDrawMarketBoundaryFunctionality();
    //   } else {
    //     this.cesiumService.boundaryService.removeDrawMarketBoundaryFunctionality();
    //   }
    // });
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


  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("cesium");
    this.cesiumService.setHomeLocation();
    this.cesiumService.boundaryService.addDrawBoundaryButton();
    this.cesiumService.threeDimensionalModelService.add3DModelButton();
    setTimeout(() => {
      const speedDialMenuItems = this.el.nativeElement.querySelectorAll('.p-speeddial-list');
      this.searchButton = speedDialMenuItems[0].children[0];
      const speedDialButton = this.el.nativeElement.querySelectorAll('.p-speeddial-button ');
      this.speedDialButton = speedDialButton[0];
      this.overlayPanel.show(null, this.speedDialButton);
      this.items = [
        {
          icon: 'pi pi-search',
          command: (click) => {
            const speedDialMenuItems = this.el.nativeElement.querySelectorAll('.p-speeddial-list');
            this.searchButton = speedDialMenuItems[0].children[0];
            this.overlayPanel.show(click.originalEvent, this.speedDialButton);
          }
        },
        {
          icon: 'pi pi-pencil',
          command: (click) => {
            this.opAddBoundary.show(click.originalEvent, this.speedDialButton);
          }
        }
      ];
    }, 1000);
  }

  ngOnInit(): void {
    this.showSaveBoundaryDialog = computed(() => {
      return this.dialogsService.showAddBoundaryDialog();
    });

  }

  saveBoundary(){
    this.dialogsService.toggleShowAddBoundaryDialog(false);
    this.cesiumService.boundaryService.completeVendorBoundary(this.vendorLocationForm.value.name, this.vendorLocationForm.value.color.r, this.vendorLocationForm.value.color.g, this.vendorLocationForm.value.color.b);
    this.vendorLocationForm = this.createVendorLocationForm()
  }

  searchAndZoom() {
    this.cesiumService.searchAndZoom(this.mapSearchForm.get('searchString')?.value);
  }

  progressToAddVendorLocations(){
    this.cesiumService.boundaryService.addDrawMarketBoundaryFunctionality();
  }
}
