import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { filiereLabel } from '../../core/utils/filiere.util';

function getSubdomain(): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const parts = host.split('.');
  if (host === 'localhost' || parts.length < 2) return 'central';
  return parts[0];
}

@Component({
  selector: 'app-public-brochure',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-bg-light">
      @if (loading()) {
        <div class="flex items-center justify-center py-24"><span class="material-symbols-outlined text-3xl text-muted animate-spin">progress_activity</span></div>
      }

      @if (ecole()) {
        <div class="max-w-4xl mx-auto px-4 py-10">
          <div style="padding:32px;text-align:center;color:var(--color-bg);margin-bottom:20px;background:var(--color-accent-800)">
            <h1 style="color:var(--color-bg);margin-bottom:8px">{{ ecole()?.nom }}</h1>
            <p style="opacity:0.9;margin:0">{{ ecole()?.description }}</p>
            <p style="opacity:0.8;margin:8px 0 0;font-size:13px">{{ ecole()?.adresse }} · {{ ecole()?.telephone }} · {{ ecole()?.email }}</p>
          </div>

          <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Filières proposées</h3></div><div class="gs-panel-body">
            @if (ecole()?.filieres?.length) {
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                @for (f of ecole()?.filieres; track f.id) {
                  <div style="padding:16px;border:1px solid var(--color-divider)">
                    <h4 style="color:var(--color-accent);margin-bottom:4px">{{ f.nom }}</h4>
                    <p class="text-xs text-muted">{{ f.description }}</p>
                  </div>
                }
              </div>
            } @else {
              <div class="table-empty">Aucune filière disponible</div>
            }
          </div></div>

          <div class="gs-panel" style="margin-bottom:20px">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:18px">Classes et frais de scolarité</h3></div>
            <div class="gs-panel-body">
              @if (ecole()?.classes?.length) {
                <div class="table-scroll">
                  <table class="table">
                    <thead><tr><th>Classe</th><th>Niveau</th><th>Filière</th><th>Frais</th></tr></thead>
                    <tbody>
                      @for (c of ecole()?.classes || []; track c.id) {
                        <tr><td style="font-weight:500">{{ c.nom }}</td><td>{{ c.niveau }}</td><td>{{ filiereLabel(c) }}</td><td style="font-weight:500">{{ getTarif(c.id) }}</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="table-empty">Aucune classe disponible</div>
              }
            </div>
          </div>

          <div class="flex justify-center gap-3">
            <button (click)="downloadPdf()" class="btn btn-primary"><span class="material-symbols-outlined" style="font-size:18px">download</span> Télécharger la brochure (PDF)</button>
            <button (click)="print()" class="btn btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">print</span> Imprimer</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class PublicBrochureComponent implements OnInit {
  filiereLabel = filiereLabel;
  private http = inject(HttpClient);

  ecole = signal<any>(null);
  loading = signal(true);

  private resolveEcoleId() {
    const subdomain = getSubdomain();
    this.http.get<any>(`${environment.apiUrl}/public/ecoles/by-subdomain/${subdomain}`).subscribe({
      next: (ecole) => {
        this.http.get<any>(`${environment.apiUrl}/public/brochure/${ecole.id}`).subscribe({
          next: (d) => { this.ecole.set(d); this.loading.set(false); },
          error: () => { this.ecole.set(null); this.loading.set(false); },
        });
      },
      error: () => { this.ecole.set(null); this.loading.set(false); },
    });
  }

  ngOnInit() {
    this.resolveEcoleId();
  }

  getTarif(classeId: string): string {
    const tarif = this.ecole()?.grillesTarifaires?.find((t: any) => t.classeId === classeId);
    return tarif ? `${tarif.montantTotal.toLocaleString('fr-FR')} FCFA` : 'Non défini';
  }

  downloadPdf() {
    const ecoleId = this.ecole()?.id;
    if (!ecoleId) return;
    window.open(`${environment.apiUrl}/public/brochure/${ecoleId}/pdf`, '_blank');
  }
  print() { window.print(); }
}
