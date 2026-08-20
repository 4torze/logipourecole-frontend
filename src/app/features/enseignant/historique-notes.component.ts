import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-enseignant-historique-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1 style="margin-bottom:24px">Historique des notes</h1>

      @if (loading()) {
        <div class="gs-panel"><div class="gs-panel-body">
          <div class="flex items-center gap-2 text-sm text-muted py-6"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement...</div>
        </div></div>
      } @else if (notes().length === 0) {
        <div class="gs-panel"><div class="gs-panel-body">
          <span class="material-symbols-outlined text-3xl text-muted block mb-2">history_edu</span>
          <p class="text-sm text-muted mb-4">Vous n'avez encore saisi aucune note. Allez dans « Évaluations » pour commencer.</p>
          <button (click)="goToEvaluations()" class="btn btn-primary" style="margin:0 auto">
            <span class="material-symbols-outlined" style="font-size:18px">edit</span> Saisir des notes
          </button>
        </div></div>
      } @else {
        <!-- Filtres -->
        <div class="gs-panel"><div class="gs-panel-body" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <select [ngModel]="filterClasse()" (ngModelChange)="filterClasse.set($event)" class="input" style="width:auto;min-width:200px">
            <option value="">Toutes les classes</option>
            @for (c of classes(); track c) { <option [value]="c">{{ c }}</option> }
          </select>
          <select [ngModel]="filterMatiere()" (ngModelChange)="filterMatiere.set($event)" class="input" style="width:auto;min-width:200px">
            <option value="">Toutes les matières</option>
            @for (m of matieres(); track m) { <option [value]="m">{{ m }}</option> }
          </select>
          <div class="login-input" style="position:relative;flex:1;min-width:220px">
            <span class="material-symbols-outlined" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:color-mix(in srgb, var(--color-text) 45%, transparent);font-size:20px">search</span>
            <input type="text" [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" placeholder="Rechercher un élève..." class="input" style="padding-left:38px" />
          </div>
          <div style="margin-left:auto;font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ filteredNotes().length }} note(s)</div>
        </div></div>

        <!-- Tableau -->
        <div class="gs-panel"><div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:48px">N°</th>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Devoir</th>
                  <th>Période</th>
                  <th style="text-align:center">Note</th>
                  <th style="text-align:center">Sur</th>
                  <th>Date saisie</th>
                </tr>
              </thead>
              <tbody>
                @for (n of filteredNotes(); track n.id; let i = $index) {
                  <tr>
                    <td style="color:color-mix(in srgb, var(--color-text) 45%, transparent)">{{ i + 1 }}</td>
                    <td style="font-weight:600">{{ n.etudiant?.nom }} {{ n.etudiant?.prenom }}</td>
                    <td>{{ n.classe?.nom }}</td>
                    <td>{{ n.matiere?.nom }}</td>
                    <td>{{ n.devoir?.titre || '—' }}</td>
                    <td>{{ n.periode?.libelle || '—' }}</td>
                    <td style="text-align:center">
                      @if (n.note >= n.sur / 2) {
                        <span class="tag tag-success">{{ n.note }}</span>
                      } @else {
                        <span class="tag tag-danger">{{ n.note }}</span>
                      }
                    </td>
                    <td style="text-align:center">{{ n.sur }}</td>
                    <td>{{ n.dateSaisie | date:'dd/MM/yyyy' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="9" class="table-empty">Aucune note ne correspond à ces filtres.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div></div>
      }
    </div>
  `,
})
export class EnseignantHistoriqueNotesComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private router = inject(Router);

  notes = signal<any[]>([]);
  loading = signal(false);
  filterClasse = signal('');
  filterMatiere = signal('');
  searchText = signal('');

  classes = computed(() => {
    const set = new Set<string>();
    for (const n of this.notes()) {
      if (n.classe?.nom) set.add(n.classe.nom);
    }
    return Array.from(set).sort();
  });

  matieres = computed(() => {
    const set = new Set<string>();
    for (const n of this.notes()) {
      if (n.matiere?.nom) set.add(n.matiere.nom);
    }
    return Array.from(set).sort();
  });

  filteredNotes = computed(() => {
    let result = this.notes();
    const fc = this.filterClasse();
    const fm = this.filterMatiere();
    const search = this.searchText().toLowerCase().trim();
    if (fc) result = result.filter(n => n.classe?.nom === fc);
    if (fm) result = result.filter(n => n.matiere?.nom === fm);
    if (search) {
      result = result.filter(n =>
        (n.etudiant?.nom || '').toLowerCase().includes(search) ||
        (n.etudiant?.prenom || '').toLowerCase().includes(search)
      );
    }
    return result;
  });

  ngOnInit() { this.loadNotes(); }

  loadNotes() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/enseignant/historique-saisies`).subscribe({
      next: (d) => {
        this.notes.set(d || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur chargement historique';
        this.alertService.error(msg);
      },
    });
  }

  goToEvaluations() {
    this.router.navigate(['/enseignant/notes']);
  }
}
