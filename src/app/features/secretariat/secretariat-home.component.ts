import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-secretariat-home',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzTableModule, NzTagModule, NzAlertModule, NzEmptyModule, NzIconModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Secrétariat Général</h1>

      <nz-card style="margin-bottom: 24px; border-left: 4px solid #f59e0b;">
        <div slot="title"><span nz-icon nzType="bell" style="color:#f59e0b;"></span> Rappels — Réunions à venir (7 jours)</div>
        @if (rappels().length > 0) {
          @for (r of rappels(); track r.id) {
            <div style="padding:10px; border-bottom:1px solid #e5e7eb;">
              <strong>{{ r.titre }}</strong> — {{ r.date | date:'dd/MM/yyyy à HH:mm' }}
              @if (r.lieu) { <span style="color:#6b7280;"> | {{ r.lieu }}</span> }
            </div>
          }
        } @else {
          <nz-empty nzDescription="Aucune réunion à venir"></nz-empty>
        }
      </nz-card>

      <nz-card style="margin-bottom: 24px;" nzTitle="Réunions">
        <nz-table #reunionTable [nzData]="reunions()" [nzPageSize]="20" nzSize="small">
          <thead><tr><th>Titre</th><th>Date</th><th>Lieu</th><th>Statut</th><th>Compte rendu</th></tr></thead>
          <tbody>
            @for (r of reunionTable.data; track r.id) {
              <tr><td>{{ r.titre }}</td><td>{{ r.date | date:'dd/MM/yyyy HH:mm' }}</td><td>{{ r.lieu || '—' }}</td>
                <td><nz-tag [nzColor]="r.statut === 'planifiee' ? 'processing' : 'success'">{{ r.statut }}</nz-tag></td>
                <td>{{ r.compteRendu ? 'Oui' : 'Non' }}</td></tr>
            }
          </tbody>
        </nz-table>
      </nz-card>

      <nz-card nzTitle="Enseignants">
        <nz-table #ensTable [nzData]="enseignants()" [nzPageSize]="20" nzSize="small">
          <thead><tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Statut</th></tr></thead>
          <tbody>
            @for (e of ensTable.data; track e.id) {
              <tr><td>{{ e.nom }}</td><td>{{ e.prenom }}</td><td>{{ e.email }}</td><td>{{ e.telephone || '—' }}</td>
                <td><nz-tag nzColor="success">{{ e.statut }}</nz-tag></td></tr>
            }
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `,
})
export class SecretariatHomeComponent implements OnInit {
  private http = inject(HttpClient);

  reunions = signal<any[]>([]);
  rappels = signal<any[]>([]);
  enseignants = signal<any[]>([]);

  ngOnInit() { this.loadReunions(); this.loadRappels(); this.loadEnseignants(); }

  loadReunions() { this.http.get<any>(`${environment.apiUrl}/secretariat/reunions`).subscribe({ next: (res) => this.reunions.set(res.data || []), error: () => this.reunions.set([]) }); }
  loadRappels() { this.http.get<any[]>(`${environment.apiUrl}/secretariat/reunions/rappels`).subscribe({ next: (d) => this.rappels.set(d), error: () => this.rappels.set([]) }); }
  loadEnseignants() { this.http.get<any[]>(`${environment.apiUrl}/secretariat/enseignants`).subscribe({ next: (d) => this.enseignants.set(d), error: () => this.enseignants.set([]) }); }
}
