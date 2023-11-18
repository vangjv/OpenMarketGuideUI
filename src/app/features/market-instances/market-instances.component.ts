import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketInstanceService } from 'src/app/services/market-instance.service';
import { MarketInstance } from 'src/app/shared/models/market-instance.model';
import { Market } from 'src/app/shared/models/market.model';

@Component({
  selector: 'app-market-instances',
  templateUrl: './market-instances.component.html',
  styleUrls: ['./market-instances.component.scss']
})
export class MarketInstancesComponent implements OnInit{
  @Input() marketId:string | undefined;
  marketInstances: MarketInstance[] = [];
  marketDatesForm: FormGroup = this.formBuilder.group({
    startDate: [null, Validators.required],
    endDate: [null, Validators.required],
  }, { validator: this.dateLessThan('startDate', 'endDate')});
  minDate:Date = new Date();

  constructor(private formBuilder: FormBuilder, private marketInstanceService:MarketInstanceService, private router:Router) { }

  ngOnInit(): void {
    if (this.marketId) {
      this.marketInstanceService.getMarketInstancesByMarketId(this.marketId).subscribe((marketInstances:MarketInstance[]) => {
        this.marketInstances = marketInstances;
      });
    }
  }

  addMarketInstance(){
    if(this.marketDatesForm.valid && this.marketId){
      this.marketInstanceService.createMarketInstance(this.marketId, this.marketDatesForm.get("startDate")?.value, this.marketDatesForm.get("endDate")?.value).subscribe((marketInstance:MarketInstance) => {
        console.log("new marketInstance:", marketInstance);
        this.marketInstances.push(marketInstance);
      });
    }
  }

  navigateToMarketInstance(marketInstance:MarketInstance){
    this.router.navigate(["/market-instance", marketInstance.id]);
  }

  dateLessThan(startDateField: string, endDateField: string) {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const start = formGroup.get(startDateField);
      const end = formGroup.get(endDateField);

      if (start && end && start.value > end.value) {
        return { dateLessThan: true };
      }
      return null;
    };
  }
}
