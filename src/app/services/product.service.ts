import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base);
  }

  create(p: Product): Observable<Product> {
    return this.http.post<Product>(this.base, p);
  }

  update(id: number, p: Product): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, p);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
