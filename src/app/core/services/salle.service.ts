import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Salle } from '../models';

export interface CreateSalleDto {
  nom: string;
  code?: string;
  capacite: number;
  batiment?: string;
  etage?: string;
  actif?: boolean;
}

export interface UpdateSalleDto {
  nom?: string;
  code?: string;
  capacite?: number;
  batiment?: string;
  etage?: string;
  actif?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SalleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/salles`;

  findAll(): Observable<Salle[]> {
    return this.http.get<Salle[]>(this.baseUrl);
  }

  create(dto: CreateSalleDto): Observable<Salle> {
    return this.http.post<Salle>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateSalleDto): Observable<Salle> {
    return this.http.patch<Salle>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
