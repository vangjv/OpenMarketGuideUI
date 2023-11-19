import { NgModule } from '@angular/core';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { DialogModule } from 'primeng/dialog';
import {ProgressSpinnerModule} from 'primeng/progressspinner';

@NgModule({
    imports: [
      DialogModule,
      ProgressSpinnerModule
    ],
    declarations: [
      LoadingSpinnerComponent
    ],
    exports: [
      LoadingSpinnerComponent,
    ]

})

export class LoadingSpinnerModule { }
