import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-etudiant-bulletins',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1 style="margin-bottom:24px">Mes bulletins</h1>

      <div class="gs-panel"><div class="gs-panel-body">
        @if (bulletins().length > 0) {
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr><th>Période</th><th>Année</th><th>Classe</th><th>Moyenne</th><th>Rang</th><th>Mention</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                @for (b of bulletins(); track b.id) {
                  <tr>
                    <td>{{ b.periode?.libelle }}</td>
                    <td>{{ b.anneeScolaire?.libelle }}</td>
                    <td>{{ b.classe?.nom }}</td>
                    <td style="font-weight:600">{{ b.moyenneGenerale?.toFixed(2) }}/20</td>
                    <td>{{ b.rang || '—' }}</td>
                    <td><span class="tag tag-neutral">{{ b.mention }}</span></td>
                    <td>
                      @if (b.validePar) { <span class="tag tag-success">Validé</span> }
                      @else { <span class="tag tag-accent">En attente</span> }
                    </td>
                    <td><button (click)="downloadBulletin(b)" class="btn btn-icon btn-secondary" title="Télécharger"><span class="material-symbols-outlined" style="font-size:18px">download</span></button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="table-empty">
            <span class="material-symbols-outlined" style="font-size:40px;display:block;margin-bottom:8px;opacity:0.6">description</span>
            Aucun bulletin disponible pour le moment
          </div>
        }
      </div></div>
    </div>
  `,
})
export class EtudiantBulletinsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private alertService = inject(AlertService);

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
    this.http.post(`${environment.apiUrl}/bulletins/generer-pdf`, {
      etudiantId: b.etudiantId,
      classeId: b.classeId,
      periodeId: b.periodeId,
      anneeScolaireId: b.anneeScolaireId,
    }, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulletin-${b.periode?.libelle || ''}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.alertService.error('Erreur lors du téléchargement du bulletin'),
    });
  }
}
