import { AfterViewInit, Component, OnInit, Signal, computed, signal } from '@angular/core';
import { CesiumService } from '../../services/cesium.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogsService } from 'src/app/services/dialogs.service';
@Component({
  selector: 'app-cesium',
  templateUrl: './cesium.component.html',
  styleUrls: ['./cesium.component.scss']
})
export class CesiumComponent implements AfterViewInit, OnInit {
  showSaveBoundaryDialog:Signal<boolean> = signal(false);
  boundaryForm: FormGroup;
  constructor(private cesiumService:CesiumService, private formBuilder: FormBuilder, private dialogsService:DialogsService,) {
    this.boundaryForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }
  ngAfterViewInit(): void {
    this.cesiumService.initializeMap("cesium");
    this.cesiumService.addCoordinateViewer();
    //this.cesiumService.addCoordinatesOnDoubleClick();
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
    this.cesiumService.boundaryService.completeShape(this.boundaryForm.value.name);
  }

}
