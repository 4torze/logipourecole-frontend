import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnneeScolaire } from '../models';

export interface CreateAnneeScolaireDto {
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

@Injectable({ providedIn: 'root' })
export class AnneeScolaireService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/etudes/annees-scolaires`;

  findAll(): Observable<AnneeScolaire[]> {
    return this.http.get<AnneeScolaire[]>(this.baseUrl);
  }

  create(dto: CreateAnneeScolaireDto): Observable<AnneeScolaire> {
    return this.http.post<AnneeScolaire>(this.baseUrl, dto);
  }
}
