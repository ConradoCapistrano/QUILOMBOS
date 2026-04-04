import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Quilombo {
  id: number;
  codigo?: number;
  nome: string;
  regiao?: string;
  municipio?: string;
  ano?: string;
  familias?: string;
  descricao?: string;
  imagemUrl?: string;
  historia?: string;
  cultura?: string;
  territorio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuilomboService {
  private apiUrl = `${environment.apiUrl}/quilombos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Quilombo[]> {
    return this.http.get<Quilombo[]>(this.apiUrl);
  }

  getById(id: number): Observable<Quilombo> {
    return this.http.get<Quilombo>(`${this.apiUrl}/${id}`);
  }

  create(quilombo: Partial<Quilombo>): Observable<Quilombo> {
    return this.http.post<Quilombo>(this.apiUrl, quilombo);
  }

  update(id: number, quilombo: Partial<Quilombo>): Observable<Quilombo> {
    return this.http.put<Quilombo>(`${this.apiUrl}/${id}`, quilombo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
