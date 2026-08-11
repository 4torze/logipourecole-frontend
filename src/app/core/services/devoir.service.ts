import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Devoir, SoumissionDevoir } from '../models';

export interface CreateDevoirDto {
  classeId: string;
  matiereId: string;
  titre: string;
  description?: string;
  dateLimite: string;
  points: number;
}

export interface UpdateDevoirDto {
  titre?: string;
  description?: string;
  dateLimite?: string;
  points?: number;
}

export interface NoterSoumissionDto {
  note: number;
  commentaire?: string;
}

function toIsoDateTime(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.includes('Z')) return value;
  if (value.length === 16) return `${value}:00`;
  return value;
}

function handleError(err: HttpErrorResponse) {
  const msg = err.error?.message || err.error?.error?.message || err.message || 'Erreur serveur';
  return throwError(() => new Error(Array.isArray(msg) ? msg.join(', ') : msg));
}

@Injectable({ providedIn: 'root' })
export class DevoirService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/devoirs`;

  findByClasse(classeId: string, matiereId?: string): Observable<Devoir[]> {
    let url = `${this.baseUrl}/classe/${classeId}`;
    if (matiereId) url += `?matiereId=${matiereId}`;
    return this.http.get<Devoir[]>(url);
  }

  findOne(id: string): Observable<Devoir> {
    return this.http.get<Devoir>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateDevoirDto): Observable<Devoir> {
    const payload = { ...dto, dateLimite: toIsoDateTime(dto.dateLimite) };
    return this.http.post<Devoir>(this.baseUrl, payload).pipe(catchError(handleError));
  }

  update(id: string, dto: UpdateDevoirDto): Observable<Devoir> {
    const payload = dto.dateLimite ? { ...dto, dateLimite: toIsoDateTime(dto.dateLimite) } : dto;
    return this.http.patch<Devoir>(`${this.baseUrl}/${id}`, payload).pipe(catchError(handleError));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(handleError));
  }

  noterSoumission(soumissionId: string, dto: NoterSoumissionDto): Observable<SoumissionDevoir> {
    return this.http.post<SoumissionDevoir>(`${this.baseUrl}/soumissions/${soumissionId}/noter`, dto).pipe(catchError(handleError));
  }
}
