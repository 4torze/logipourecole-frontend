import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-etudiant-bulletins',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzIconModule, NzTableModule, NzTagModule, NzEmptyModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Mes bulletins</h1>

      @if (bulletins().length > 0) {
        <nz-card>
          <nz-table #bulTable [nzData]="bulletins()" [nzPageSize]="20" nzSize="small">
            <thead><tr><th>Période</th><th>Année</th><th>Classe</th><th>Moyenne</th><th>Rang</th><th>Mention</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              @for (b of bulTable.data; track b.id) {
                <tr><td>{{ b.periode?.libelle }}</td><td>{{ b.anneeScolaire?.libelle }}</td><td>{{ b.classe?.nom }}</td>
                  <td><strong>{{ b.moyenneGenerale?.toFixed(2) }}/20</strong></td><td>{{ b.rang || '—' }}</td>
                  <td><nz-tag nzColor="processing">{{ b.mention }}</nz-tag></td>
                  <td>
                    @if (b.validePar) { <nz-tag nzColor="success">Validé</nz-tag> }
                    @else { <nz-tag nzColor="warning">En attente</nz-tag> }
                  </td>
                  <td><button nz-button nzSize="small" nzType="text" (click)="downloadBulletin(b)" nz-tooltip="Télécharger"><span nz-icon nzType="download"></span></button></td></tr>
              }
            </tbody>
          </nz-table>
        </nz-card>
      } @else {
        <nz-card style="text-align:center; padding:40px;">
          <span nz-icon nzType="file-text" style="font-size:48px; color:#d1d5db;"></span>
          <p style="color:#9ca3af; margin-top:16px;">Aucun bulletin disponible pour le moment</p>
        </nz-card>
      }
    </div>
  `,
})
export class EtudiantBulletinsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  etudiantId = computed(() => this.auth.currentUser()?.etudiantId || '');
  bulletins = signal<any[]>([]);

  ngOnInit() { if (this.etudiantId()) this.loadBulletins(); }

  loadBulletins() {
    this.http.get<any[]>(`${environment.apiUrl}/bulletins/etudiant/${this.etudiantId()}`).subscribe({
      next: (d) => this.bulletins.set(d),
      error: () => this.bulletins.set([]),
    });
  }

  downloadBulletin(b: any) {
    window.open(`${environment.apiUrl}/bulletins/generer-pdf?etudiantId=${b.etudiantId}&classeId=${b.classeId}&periodeId=${b.periodeId}&anneeScolaireId=${b.anneeScolaireId}`, '_blank');
  }
}
