import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { BreadcrumbComponent } from '../../shared/ui/breadcrumb.component';

interface ClassementLigne {
  etudiantId: string;
  nom: string;
  prenom: string;
  moyenne: number;
  rang: number;
}

@Component({
  selector: 'app-classement',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="[{ label: 'Classement' }]"></app-breadcrumb>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h1 style="margin:0">Classement de classe</h1>
        <button (click)="downloadPdf()" [disabled]="downloading() || classement().length === 0" class="btn btn-primary">
          @if (downloading()) { <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">download</span> }
          Télécharger PDF
        </button>
      </div>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:20px 0">
          <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
        </div>
      } @else if (classement().length > 0) {
        <div class="gs-panel"><div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead><tr><th style="width:80px">Rang</th><th>Nom</th><th>Prénom</th><th style="text-align:right">Moyenne</th></tr></thead>
              <tbody>
                @for (c of classement(); track c.etudiantId) {
                  <tr>
                    <td style="font-weight:800;font-family:var(--font-heading)">{{ c.rang }}</td>
                    <td style="font-weight:600">{{ c.nom }}</td>
                    <td>{{ c.prenom }}</td>
                    <td style="text-align:right;font-weight:600;color:var(--color-accent)">{{ c.moyenne.toFixed(2) }}/20</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div></div>
      } @else {
        <div class="table-empty">Aucune note saisie pour cette classe et cette période</div>
      }
    </div>
  `,
})
export class ClassementComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  classeId = '';
  periodeId = '';
  classement = signal<ClassementLigne[]>([]);
  loading = signal(true);
  downloading = signal(false);

  ngOnInit() {
    this.classeId = this.route.snapshot.paramMap.get('classeId') || '';
    this.periodeId = this.route.snapshot.paramMap.get('periodeId') || '';
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<ClassementLigne[]>(`${environment.apiUrl}/notes/classement/${this.classeId}/${this.periodeId}`).subscribe({
      next: (d) => { this.classement.set(d || []); this.loading.set(false); },
      error: (err: any) => { this.loading.set(false); this.alertService.error(err?.error?.message || 'Erreur lors du chargement du classement'); },
    });
  }

  downloadPdf() {
    this.downloading.set(true);
    this.http.get(`${environment.apiUrl}/notes/classement/${this.classeId}/${this.periodeId}/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.downloading.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'classement.pdf';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => { this.downloading.set(false); this.alertService.error('Erreur lors du téléchargement'); },
    });
  }
}
