import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { environment } from '../../../environments/environment';

function getSubdomain(): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const parts = host.split('.');
  if (host === 'localhost' || parts.length < 2) return 'central';
  return parts[0];
}

@Component({
  selector: 'app-public-brochure',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzIconModule, NzTableModule, NzGridModule, NzEmptyModule, NzSpinModule],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div style="text-align:center; padding:60px;"><nz-spin nzSize="large"></nz-spin></div>
      }

      @if (ecole()) {
        <nz-card style="background: linear-gradient(135deg, #431407, #c2410c); color:white; text-align:center; margin-bottom:24px; border:none;">
          <h1 style="font-size:28px; margin-bottom:8px; color:white;">{{ ecole()?.nom }}</h1>
          <p style="opacity:0.9;">{{ ecole()?.description }}</p>
          <p style="opacity:0.8; margin-top:8px; font-size:14px;">
            {{ ecole()?.adresse }} | {{ ecole()?.telephone }} | {{ ecole()?.email }}
          </p>
        </nz-card>

        <nz-card style="margin-bottom:24px;" nzTitle="Filières proposées">
          @if (ecole()?.filieres?.length) {
            <div nz-row [nzGutter]="[16, 16]">
              @for (f of ecole()?.filieres; track f.id) {
                <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8">
                  <div style="padding:16px; border:1px solid #e5e7eb; border-radius:8px;">
                    <h3 style="color:#c2410c;">{{ f.nom }}</h3>
                    <p style="font-size:13px; color:#6b7280;">{{ f.description }}</p>
                  </div>
                </div>
              }
            </div>
          } @else {
            <nz-empty nzDescription="Aucune filière disponible"></nz-empty>
          }
        </nz-card>

        <nz-card style="margin-bottom:24px;" nzTitle="Classes et frais de scolarité">
          @if (ecole()?.classes?.length) {
            <nz-table #classeTable [nzData]="ecole()?.classes || []" [nzPageSize]="50" nzSize="small">
              <thead><tr><th>Classe</th><th>Niveau</th><th>Filière</th><th>Frais</th></tr></thead>
              <tbody>
                @for (c of classeTable.data; track c.id) {
                  <tr><td>{{ c.nom }}</td><td>{{ c.niveau }}</td><td>{{ c.filiere?.nom }}</td><td>{{ getTarif(c.id) }}</td></tr>
                }
              </tbody>
            </nz-table>
          } @else {
            <nz-empty nzDescription="Aucune classe disponible"></nz-empty>
          }
        </nz-card>

        <div style="text-align:center; margin-top:24px;">
          <button nz-button nzType="primary" (click)="downloadPdf()"><span nz-icon nzType="download"></span> Télécharger la brochure (PDF)</button>
          <button nz-button style="margin-left:12px;" (click)="print()"><span nz-icon nzType="printer"></span> Imprimer</button>
        </div>
      }
    </div>
  `,
})
export class PublicBrochureComponent implements OnInit {
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
    const subdomain = getSubdomain();
    window.open(`${environment.apiUrl}/public/brochure/pdf?subdomain=${subdomain}`, '_blank');
  }
  print() { window.print(); }
}
