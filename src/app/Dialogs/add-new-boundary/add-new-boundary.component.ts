import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoundaryService } from 'src/app/services/boundary.service';

@Component({
  selector: 'app-add-new-boundary',
  templateUrl: './add-new-boundary.component.html',
  styleUrls: ['./add-new-boundary.component.scss']
})
export class AddNewBoundaryComponent {
  boundaryForm: FormGroup;
  @Output() onClose = new EventEmitter<string>();

    constructor(
      private formBuilder: FormBuilder
    ) {
      this.boundaryForm = this.formBuilder.group({
        name: ['', Validators.required]
      });
    }

    saveBoundary() {
      //this.boundaryService.completeShape(this.boundaryForm.value.name);
      this.onClose.emit(this.boundaryForm.value.name);
    }
  }

