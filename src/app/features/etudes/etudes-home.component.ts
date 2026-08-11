import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-etudes-home',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzTableModule, NzProgressModule, NzEmptyModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Direction des Études</h1>

      <nz-card style="margin-bottom: 24px;" nzTitle="Suivi de la scolarité par classe">
        <nz-table #suiviTable [nzData]="suivi().classes || []" [nzPageSize]="20" nzSize="small">
          <thead><tr><th>Classe</th><th>Filière</th><th>Effectif</th><th>Capacité</th><th>Remplissage</th><th>Notes saisies</th><th>Bulletins</th></tr></thead>
          <tbody>
            @for (c of suiviTable.data; track c.classe) {
              <tr>
                <td>{{ c.classe }}</td><td>{{ c.filiere }}</td><td>{{ c.effectif }}</td><td>{{ c.capaciteMax }}</td>
                <td style="min-width:140px;"><nz-progress [nzPercent]="c.tauxRemplissage" nzSize="small"></nz-progress></td>
                <td>{{ c.notesSaisies }}</td><td>{{ c.bulletinsGeneres }}</td>
              </tr>
            }
          </tbody>
        </nz-table>
      </nz-card>

      <nz-card style="margin-bottom: 24px;" nzTitle="Emploi du temps — Vue globale">
        @if (edt().length > 0) {
          <nz-table #edtTable [nzData]="edt()" [nzPageSize]="50" nzSize="small">
            <thead><tr><th>Jour</th><th>Heure</th><th>Classe</th><th>Matière</th><th>Enseignant</th><th>Salle</th></tr></thead>
            <tbody>
              @for (slot of edtTable.data; track slot.id) {
                <tr><td>{{ jours[slot.jourSemaine] }}</td><td>{{ slot.heureDebut }} - {{ slot.heureFin }}</td>
                  <td>{{ slot.classe?.nom }}</td><td>{{ slot.matiere?.nom }}</td>
                  <td>{{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }}</td><td>{{ slot.salle || '—' }}</td></tr>
              }
            </tbody>
          </nz-table>
        } @else {
          <nz-empty nzDescription="Aucun créneau défini"></nz-empty>
        }
      </nz-card>

      <nz-card nzTitle="Affectations enseignants">
        <nz-table #affTable [nzData]="affectations()" [nzPageSize]="50" nzSize="small">
          <thead><tr><th>Enseignant</th><th>Classe</th><th>Matière</th><th>Filière</th></tr></thead>
          <tbody>
            @for (a of affTable.data; track a.id) {
              <tr><td>{{ a.enseignant?.nom }} {{ a.enseignant?.prenom }}</td><td>{{ a.classe?.nom }}</td>
                <td>{{ a.matiere?.nom }}</td><td>{{ a.classe?.filiere?.nom }}</td></tr>
            }
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `,
})
export class EtudesHomeComponent implements OnInit {
  private http = inject(HttpClient);

  suivi = signal<any>({ classes: [] });
  edt = signal<any[]>([]);
  affectations = signal<any[]>([]);
  jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  ngOnInit() { this.loadSuivi(); this.loadEdt(); this.loadAffectations(); }

  loadSuivi() { this.http.get<any>(`${environment.apiUrl}/etudes/suivi-scolarite`).subscribe({ next: (d) => this.suivi.set(d), error: () => this.suivi.set({ classes: [] }) }); }
  loadEdt() { this.http.get<any[]>(`${environment.apiUrl}/etudes/edt`).subscribe({ next: (d) => this.edt.set(d), error: () => this.edt.set([]) }); }
  loadAffectations() { this.http.get<any[]>(`${environment.apiUrl}/etudes/affectations`).subscribe({ next: (d) => this.affectations.set(d), error: () => this.affectations.set([]) }); }
}
