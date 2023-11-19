import { Component, OnInit, Input, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from './loading.service';

@Component({
  selector: 'loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit, AfterViewInit, OnDestroy {
  // @Input() loadingModal: boolean = false;
  // @Input() loadingMessage!: string;
  loadingModal:boolean = false;
  loadingMessage:string = "Loading...";
  loadingSubscription!:Subscription;
  constructor(private loadingService:LoadingService, private cd:ChangeDetectorRef) { }
  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.loadingSubscription = this.loadingService.loading$.subscribe(res=>{
      this.loadingModal = res.loading == true ? true : false;
      this.loadingMessage = res.loadingMessage ? res.loadingMessage : "Loading...";
    });
  }

}
