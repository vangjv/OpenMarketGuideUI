
import { Component, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'app-map-details',
  templateUrl: './map-details.component.html',
  styleUrls: ['./map-details.component.scss']
})
export class MapDetailsComponent {
  @Input() targetElement!: ElementRef<any>;
  isVisible: boolean = true;
}
