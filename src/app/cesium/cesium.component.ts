import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CesiumService } from '../cesium.service';
@Component({
  selector: 'app-cesium',
  templateUrl: './cesium.component.html',
  styleUrls: ['./cesium.component.scss']
})
export class CesiumComponent implements AfterViewInit, OnInit {
  constructor(private cesiumService:CesiumService) {
  }
  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.cesiumService.plotPoints("cesium");
    }

}
