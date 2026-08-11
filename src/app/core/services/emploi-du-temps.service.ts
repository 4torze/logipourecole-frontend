import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmploiDuTemps } from '../models';

export interface CreateEmploiDuTempsDto {
  classeId: string;
  matiereId: string;
  enseignantId: string;
  jourSemaine: number;
  dateDebut?: string;
  heureDebut: string;
  heureFin: string;
  salleId?: string;
}

@Injectable({ providedIn: 'root' })
export class EmploiDuTempsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/etudes/edt`;

  findAll(weekStart?: string, weekEnd?: string): Observable<EmploiDuTemps[]> {
    let url = this.baseUrl;
    if (weekStart && weekEnd) {
      url += `?weekStart=${weekStart}&weekEnd=${weekEnd}`;
    }
    return this.http.get<EmploiDuTemps[]>(url);
  }

  findByClasse(classeId: string, weekStart?: string, weekEnd?: string): Observable<EmploiDuTemps[]> {
    let url = `${this.baseUrl}/classe/${classeId}`;
    if (weekStart && weekEnd) {
      url += `?weekStart=${weekStart}&weekEnd=${weekEnd}`;
    }
    return this.http.get<EmploiDuTemps[]>(url);
  }

  create(dto: CreateEmploiDuTempsDto): Observable<EmploiDuTemps> {
    const payload: any = { ...dto, jourSemaine: Number(dto.jourSemaine) };
    if (payload.salleId) {
      payload.salleId = dto.salleId;
    } else {
      delete payload.salleId;
    }
    return this.http.post<EmploiDuTemps>(this.baseUrl, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
