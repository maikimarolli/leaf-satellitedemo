import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private apiUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  login(email: any, password: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'create_token', {
      email: email,
      password: password,
    });
  }

  loadFields(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'monitored_fields');
  }

  loadImages(fieldId: any, startDate: any, endDate: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'field_images', {
      id: fieldId,
      startDate: startDate,
      endDate: endDate,
    });
  }

  createField(
    fieldId: any,
    daysBefore: any,
    bounderyType: any,
    fieldBoundery: any,
    provider: any
  ): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'create_field', {
      field_name: fieldId,
      boundery_type: bounderyType,
      field_boundery: fieldBoundery,
      days_before: daysBefore
    });
  }
}
