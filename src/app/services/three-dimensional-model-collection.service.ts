import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ThreeDModelCollection } from '../shared/models/three-d-model-collection.model';
import { ThreeDModelInfo } from '../shared/models/three-d-model-info.model';

@Injectable({
  providedIn: 'root'
})
export class ThreeDModelCollectionService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getPublic3DModels(): Observable<ThreeDModelInfo[]> {
    return this.http.get<ThreeDModelCollection>(this.apiUrl + 'models').pipe(
      map((models: ThreeDModelCollection) => {
        // Perform any necessary transformations on the data here
        return models.models;
      })
    );
  }
}
