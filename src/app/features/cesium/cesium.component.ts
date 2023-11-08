import { AfterViewInit, Component, OnInit, Signal, computed, effect, signal } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogsService } from 'src/app/services/dialogs.service';
import { MenuItem, MessageService } from 'primeng/api';
@Component({
  selector: 'app-cesium',
  templateUrl: './cesium.component.html',
  styleUrls: ['./cesium.component.scss']
})
export class CesiumComponent implements AfterViewInit, OnInit {
  items: MenuItem[] = [];
  vendorBoundaryDrawingState:Signal<boolean>;
  adding3DModelState:Signal<boolean>;
  showSaveBoundaryDialog:Signal<boolean> = signal(false);
  vendorLocationForm: FormGroup;
  constructor(private cesiumService:CesiumService, private formBuilder: FormBuilder, private dialogsService:DialogsService,
    private messageService:MessageService) {
    this.vendorLocationForm = this.createVendorLocationForm();
    // this.vendorBoundaryDrawingState = this.cesiumService.vendorBoundaryDrawingState;
    // this.adding3DModelState = this.cesiumService.adding3DModelState;
    this.vendorBoundaryDrawingState = signal(false);
    this.adding3DModelState = signal(false);
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
        console.log("disable adding 3d model");
        this.cesiumService.threeDimensionalModelService.disableAdding3DModel();
      }
    });
    this.items = [
      {
          icon: 'pi pi-pencil',
          command: () => {
              this.messageService.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
          }
      },
      {
          icon: 'pi pi-refresh',
          command: () => {
              this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
          }
      },
      {
          icon: 'pi pi-trash',
          command: () => {
              this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
          }
      },
      {
          icon: 'pi pi-upload',
          routerLink: ['/fileupload']
      },
      {
          icon: 'pi pi-external-link',
          target: '_blank',
          url: 'http://angular.io'
      }
  ];
  }

  createVendorLocationForm(){
    return this.formBuilder.group({
      name: ['', Validators.required],
      color: [{r:255,g:255,b:255}, Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("cesium");
    // this.cesiumService.addCoordinateViewer();
    //this.cesiumService.addCoordinatesOnDoubleClick();
    //this.drawingSignal = this.cesiumService.boundaryService.drawing;
    this.cesiumService.setHomeLocation();
    this.cesiumService.boundaryService.addDrawBoundaryButton();
    this.cesiumService.threeDimensionalModelService.add3DModelButton();
    // this.cesiumService.boundaryService.addDrawPolygonFunctionality();
    //this.cesiumService.addBillboardOnClick();
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

}
