import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CesiumService } from 'src/app/services/cesium.service';
import { ThreeDModelInfo } from 'src/app/shared/models/three-d-model-info.model';

@Component({
  selector: 'app-model-picker',
  templateUrl: './model-picker.component.html',
  styleUrls: ['./model-picker.component.scss']
})
export class ModelPickerComponent implements OnInit {
  @Input() threeDModelInfoList: ThreeDModelInfo[] = [];
  @Output() modelInfoChanged = new EventEmitter<ThreeDModelInfo>();
  currentModelIndex: number = 0;
  constructor(private cesiumService:CesiumService) {

  }

  ngOnInit(): void {
    this.modelInfoChanged.emit(this.threeDModelInfoList[this.currentModelIndex]);
  }

  incrementIndex(){
    this.currentModelIndex++;
    if(this.currentModelIndex >= this.threeDModelInfoList.length){
      this.currentModelIndex = 0;
    }
    this.modelInfoChanged.emit(this.threeDModelInfoList[this.currentModelIndex]);
  }

  decrementIndex(){
    this.currentModelIndex--;
    if(this.currentModelIndex < 0){
      this.currentModelIndex = this.threeDModelInfoList.length-1;
    }
    this.modelInfoChanged.emit(this.threeDModelInfoList[this.currentModelIndex]);
  }

}
