import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Absence, TypeAbsence } from '../models';

export interface CreateAbsenceDto {
  etudiantId: string;
  matiereId: string;
  classeId: string;
  type: TypeAbsence;
  date: string;
  justified?: boolean;
  motif?: string;
}

export interface UpdateAbsenceDto {
  type?: TypeAbsence;
  date?: string;
  justified?: boolean;
  motif?: string;
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.includes('T')) return value;
  return `${value}T00:00:00.000Z`;
}

function handleError(err: HttpErrorResponse) {
  const msg = err.error?.message || err.error?.error?.message || err.message || 'Erreur serveur';
  return throwError(() => new Error(Array.isArray(msg) ? msg.join(', ') : msg));
}

@Injectable({ providedIn: 'root' })
export class AbsenceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/absences`;

  findByClasse(classeId: string, matiereId?: string): Observable<Absence[]> {
    let url = `${this.baseUrl}/classe/${classeId}`;
    if (matiereId) url += `?matiereId=${matiereId}`;
    return this.http.get<Absence[]>(url);
  }

  findByEtudiant(etudiantId: string): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.baseUrl}/etudiant/${etudiantId}`);
  }

  create(dto: CreateAbsenceDto): Observable<Absence> {
    const payload = { ...dto, date: toIsoDate(dto.date) };
    return this.http.post<Absence>(this.baseUrl, payload).pipe(catchError(handleError));
  }

  update(id: string, dto: UpdateAbsenceDto): Observable<Absence> {
    const payload = dto.date ? { ...dto, date: toIsoDate(dto.date) } : dto;
    return this.http.patch<Absence>(`${this.baseUrl}/${id}`, payload).pipe(catchError(handleError));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(handleError));
  }
}
