import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { BreadcrumbComponent } from '../../shared/ui/breadcrumb.component';

@Component({
  selector: 'app-etudiant-paiements',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="[{ label: 'Espace étudiant', route: ['/etudiant'] }, { label: 'Mes paiements' }]"></app-breadcrumb>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
          <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
        </div>
      } @else {
        <div class="gs-panel">
          <div class="gs-panel-body">
            <div class="table-scroll">
              <table class="table">
                <thead><tr><th>N° Reçu</th><th>Tranche</th><th>Date</th><th style="text-align:right">Montant</th><th>Mode</th><th></th></tr></thead>
                <tbody>
                  @for (p of paiements(); track p.id) {
                    <tr>
                      <td style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ p.numeroRecu }}</td>
                      <td>{{ p.versementType ? 'V' + p.versementType.ordre + ' — ' + p.versementType.libelle : '—' }}</td>
                      <td>{{ p.datePaiement | date:'dd/MM/yyyy' }}</td>
                      <td style="text-align:right;font-weight:600">{{ p.montant | number:'1.0-0':'fr-FR' }} FCFA</td>
                      <td><span class="tag tag-neutral">{{ p.mode }}</span></td>
                      <td><button (click)="downloadRecu(p)" class="btn btn-icon btn-secondary" title="Télécharger le reçu"><span class="material-symbols-outlined" style="font-size:18px">download</span></button></td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="table-empty">Aucun paiement enregistré</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class EtudiantPaiementsComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  paiements = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    const etudiantId = this.authService.currentUser()?.etudiantId;
    if (!etudiantId) { this.loading.set(false); return; }
    this.http.get<any[]>(`${environment.apiUrl}/etudiants/${etudiantId}/paiements`).subscribe({
      next: (d) => { this.paiements.set(d || []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.alertService.error('Erreur lors du chargement des paiements'); },
    });
  }

  downloadRecu(p: any) {
    this.http.get(`${environment.apiUrl}/daf/paiements/recu/${p.id}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-${p.numeroRecu}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.alertService.error('Erreur lors du téléchargement du reçu'),
    });
  }
}
