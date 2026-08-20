import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Utilisateur } from '../models';
import { RealtimeService } from './realtime.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private realtimeService = inject(RealtimeService);

  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  currentUser = signal<Utilisateur | null>(null);

  private readonly TOKEN_KEY = 'lpe_token';
  private readonly USER_KEY = 'lpe_user';

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    if (token && userStr) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
      this.currentUser.set(user);
      this.realtimeService.connect(token);
    }
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  get ecoleId(): string | null {
    return this.currentUser()?.ecoleId || null;
  }

  login(email: string, motDePasse: string, code2fa?: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, motDePasse, code2fa })
      .pipe(
        tap((res) => {
          if (res.token) {
            localStorage.setItem(this.TOKEN_KEY, res.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
            this.currentUser.set(res.user);
            this.realtimeService.connect(res.token);
          }
        }),
      );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap((res) => {
          if (res.token) {
            localStorage.setItem(this.TOKEN_KEY, res.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
            this.currentUser.set(res.user);
            this.realtimeService.connect(res.token);
          }
        }),
      );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.realtimeService.disconnect();
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${environment.apiUrl}/auth/profile`);
  }

  updateProfile(data: { nom?: string; prenom?: string; telephone?: string }): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${environment.apiUrl}/auth/profile`, data).pipe(
      tap((updated) => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
        this.currentUserSubject.next(updated);
        this.currentUser.set(updated);
      }),
    );
  }

  changePassword(motDePasseActuel: string, nouveauMotDePasse: string): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}/auth/change-password`, { motDePasseActuel, nouveauMotDePasse })
      .pipe(
        tap(() => {
          const user = this.currentUser();
          if (user) {
            const updated = { ...user, mustChangePassword: false };
            localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
            this.currentUserSubject.next(updated);
            this.currentUser.set(updated);
          }
        }),
      );
  }

  enable2fa(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/2fa/enable`, {});
  }

  confirm2fa(code: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/2fa/confirm`, { code });
  }

  disable2fa(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/2fa/disable`, {});
  }

  hasRole(...roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }
}
