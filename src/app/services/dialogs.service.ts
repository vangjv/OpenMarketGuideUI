import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogsService {
  showAddBoundaryDialog = signal(false);
  constructor() { }

  toggleShowAddBoundaryDialog(value:boolean) {
    this.showAddBoundaryDialog.set(value);
  }
}
