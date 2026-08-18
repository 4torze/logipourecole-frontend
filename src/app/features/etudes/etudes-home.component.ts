import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { filiereLabel } from '../../core/utils/filiere.util';

@Component({
  selector: 'app-etudes-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1 style="margin-bottom:24px">Direction des Études</h1>

      <div class="gs-panel">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:18px">Suivi de la scolarité par classe</h3></div>
        <div class="gs-panel-body">
          <div style="overflow-x:auto">
          <table class="table">
            <thead>
              <tr><th>Classe</th><th>Filière</th><th>Effectif</th><th>Capacité</th><th>Remplissage</th><th>Notes saisies</th><th>Bulletins</th></tr>
            </thead>
            <tbody>
              @for (c of suivi().classes || []; track c.classe) {
                <tr>
                  <td style="font-weight:500">{{ c.classe }}</td>
                  <td>{{ c.filiere }}</td>
                  <td>{{ c.effectif }}</td>
                  <td>{{ c.capaciteMax }}</td>
                  <td style="min-width:140px">
                    <div class="flex items-center gap-2">
                      <div class="gs-bartrack" style="flex:1">
                        <div class="gs-barfill" [style.background]="c.tauxRemplissage >= 90 ? 'var(--color-accent-700)' : c.tauxRemplissage >= 70 ? 'var(--color-accent)' : '#1a7a3f'" [style.width.%]="c.tauxRemplissage"></div>
                      </div>
                      <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent);width:36px;text-align:right">{{ c.tauxRemplissage }}%</span>
                    </div>
                  </td>
                  <td>{{ c.notesSaisies }}</td>
                  <td>{{ c.bulletinsGeneres }}</td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table-empty">Aucune classe à afficher</td></tr>
              }
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <div class="gs-panel">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:18px">Emploi du temps — Vue globale</h3></div>
        <div class="gs-panel-body">
          @if (edt().length > 0) {
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>Jour</th><th>Heure</th><th>Classe</th><th>Matière</th><th>Enseignant</th><th>Salle</th></tr>
                </thead>
                <tbody>
                  @for (slot of edt(); track slot.id) {
                    <tr>
                      <td>{{ jours[slot.jourSemaine] }}</td>
                      <td>{{ slot.heureDebut }} - {{ slot.heureFin }}</td>
                      <td style="font-weight:500">{{ slot.classe?.nom }}</td>
                      <td>{{ slot.matiere?.nom }}</td>
                      <td>{{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }}</td>
                      <td>{{ slot.salle || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="table-empty">
              <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">event_busy</span>
              Aucun créneau défini
            </div>
          }
        </div>
      </div>

      <div class="gs-panel">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:18px">Affectations enseignants</h3></div>
        <div class="gs-panel-body">
          <div style="overflow-x:auto">
            <table class="table">
              <thead>
                <tr><th>Enseignant</th><th>Classe</th><th>Matière</th><th>Filière</th></tr>
              </thead>
              <tbody>
                @for (a of affectations(); track a.id) {
                  <tr>
                    <td style="font-weight:500">{{ a.enseignant?.nom }} {{ a.enseignant?.prenom }}</td>
                    <td>{{ a.classe?.nom }}</td>
                    <td>{{ a.matiere?.nom }}</td>
                    <td>{{ filiereLabel(a.classe) }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="table-empty">Aucune affectation</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EtudesHomeComponent implements OnInit {
  filiereLabel = filiereLabel;
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
