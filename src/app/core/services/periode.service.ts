import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Periode } from '../models';

export interface CreatePeriodeDto {
  libelle: string;
  type: string;
  dateDebut: string;
  dateFin: string;
}

@Injectable({ providedIn: 'root' })
export class PeriodeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/etudes/periodes`;

  findAll(): Observable<Periode[]> {
    return this.http.get<Periode[]>(this.baseUrl);
  }

  create(dto: CreatePeriodeDto): Observable<Periode> {
    return this.http.post<Periode>(this.baseUrl, dto);
  }
}
