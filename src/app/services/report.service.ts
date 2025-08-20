import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = `${environment.apiUrl}/report`;

  constructor(private http: HttpClient) {}

  downloadLowInventory(): Observable<Blob> {
    return this.http.get(`${this.base}/low-inventory`, { responseType: 'blob' });
  }
}
