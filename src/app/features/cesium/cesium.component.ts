import { AfterViewInit, Component, OnInit, Signal, computed, effect, signal } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogsService } from 'src/app/services/dialogs.service';
@Component({
  selector: 'app-cesium',
  templateUrl: './cesium.component.html',
  styleUrls: ['./cesium.component.scss']
})
export class CesiumComponent implements AfterViewInit, OnInit {
  boundaryDrawingState:Signal<boolean>;
  adding3DModelState:Signal<boolean>;
  showSaveBoundaryDialog:Signal<boolean> = signal(false);
  vendorLocationForm: FormGroup;
  constructor(private cesiumService:CesiumService, private formBuilder: FormBuilder, private dialogsService:DialogsService,) {
    this.vendorLocationForm = this.createVendorLocationForm();
    this.boundaryDrawingState = this.cesiumService.boundaryDrawingState;
    this.adding3DModelState = this.cesiumService.adding3DModelState;
    effect(() => {
      if(this.boundaryDrawingState()==true){
        this.cesiumService.boundaryService.enableDrawingMode();
      } else {
        this.cesiumService.boundaryService.disableDrawingMode();
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
    this.cesiumService.boundaryService.completeBoundary(this.vendorLocationForm.value.name, this.vendorLocationForm.value.color.r, this.vendorLocationForm.value.color.g, this.vendorLocationForm.value.color.b);
    this.vendorLocationForm = this.createVendorLocationForm()
  }

}
