import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class LoadingService {
  private readonly loadingStatus = new BehaviorSubject<LoadingOptions>(new LoadingOptions());
  loadingIncrementer:number = 0;
  readonly loading$ = this.loadingStatus.asObservable();

  get getLoadingStatus(): boolean {
    return this.loadingStatus.getValue().loading!;
  }

  public incrementLoading(loadingMessage?:string){
    this.loadingIncrementer++
    this.loadingStatus.next(new LoadingOptions(this.loadingIncrementer > 0,  loadingMessage));
  }

  public decrementLoading(){
    this.loadingIncrementer--
    this.loadingStatus.next(new LoadingOptions(this.loadingIncrementer > 0));
  }

  public loading(loadingMessage?:string) {
    this.loadingStatus.next(new LoadingOptions(true,  loadingMessage));
  }

  public notLoading() {
    this.loadingStatus.next(new LoadingOptions(false));
  }

}

export class LoadingOptions {
  loading?: boolean;
  loadingMessage? :string;

  constructor (loading?:boolean, loadingMessage?:string){
    this.loading = (loading == undefined ? false : loading);
    this.loadingMessage = (loadingMessage == undefined ? "Loading..." : loadingMessage);
  }
}
