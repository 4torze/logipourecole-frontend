import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-etudiant-devoirs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1 style="margin-bottom:24px">Mes devoirs</h1>

      <div class="gs-panel">
        <div class="gs-panel-body">
          @if (loading()) {
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:24px 0">
              <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement…
            </div>
          } @else if (devoirs().length === 0) {
            <div class="table-empty">
              <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">assignment</span>
              Aucun devoir pour le moment.
            </div>
          } @else {
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>Matière</th><th>Titre</th><th>Description</th><th>Date limite</th><th style="text-align:center">Points</th><th style="text-align:center">Statut</th></tr>
                </thead>
                <tbody>
                  @for (d of devoirs(); track d.id) {
                    <tr [style.background]="d.id === highlightId() ? 'var(--color-accent-100)' : null">
                      <td style="font-weight:600">{{ d.matiere?.nom }}</td>
                      <td>{{ d.titre }}</td>
                      <td style="font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">{{ d.description || '—' }}</td>
                      <td>{{ d.dateLimite | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td style="text-align:center">{{ d.points }}</td>
                      <td style="text-align:center">
                        @if (maSoumission(d)) {
                          <span class="tag tag-success">Soumis</span>
                        } @else {
                          <span class="tag tag-neutral">À rendre</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class EtudiantDevoirsComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  loading = signal(false);
  devoirs = signal<any[]>([]);
  highlightId = signal<string | null>(null);

  ngOnInit() {
    this.highlightId.set(this.route.snapshot.queryParamMap.get('devoirId'));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/devoirs/mes-devoirs`).subscribe({
      next: (d) => { this.devoirs.set(d || []); this.loading.set(false); },
      error: () => { this.devoirs.set([]); this.loading.set(false); },
    });
  }

  maSoumission(devoir: any): boolean {
    const etudiantId = this.authService.currentUser()?.etudiantId;
    return Array.isArray(devoir.soumissions) && devoir.soumissions.some((s: any) => s.etudiantId === etudiantId);
  }
}
