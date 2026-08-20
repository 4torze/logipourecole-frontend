import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { AnneeScolaireService } from '../../core/services/annee-scolaire.service';
import { environment } from '../../../environments/environment';
import { BreadcrumbComponent } from '../../shared/ui/breadcrumb.component';

interface ClasseOption {
  classeId: string;
  classe: string;
}

interface AnneeScolaire {
  id: string;
  libelle: string;
  statut: string;
}

interface SuggestionLigne {
  inscriptionId: string;
  etudiantId: string;
  nom: string;
  prenom: string;
  moyenneAnnuelle: number | null;
  decisionFinale: string | null;
  suggestion: 'ADMIS' | 'REDOUBLANT';
  decisionChoisie?: string;
}

const DECISIONS = ['ADMIS', 'REDOUBLANT', 'EXCLU', 'DIPLOME'];

@Component({
  selector: 'app-cloture-annee',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="[{ label: 'Clôture d\\'année' }]"></app-breadcrumb>
      <h1 style="margin:0 0 4px">Clôture d'année — passage et redoublement</h1>
      <p style="margin:0 0 24px;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Décidez du sort de chaque élève en fin d'année, puis réinscrivez en lot les élèves admis vers l'année suivante.</p>

      <div class="gs-panel" style="margin-bottom:20px">
        <div class="gs-panel-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
          <div class="field">
            <label>Classe</label>
            <select [ngModel]="classeId()" (ngModelChange)="onClasseChange($event)" class="input">
              <option value="">Sélectionner...</option>
              @for (c of classes(); track c.classeId) { <option [value]="c.classeId">{{ c.classe }}</option> }
            </select>
          </div>
          <div class="field">
            <label>Année scolaire (à clôturer)</label>
            <select [ngModel]="anneeScolaireId()" (ngModelChange)="onAnneeChange($event)" class="input">
              <option value="">Sélectionner...</option>
              @for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }} @if (a.statut === 'active') { (active) }</option> }
            </select>
          </div>
        </div>
      </div>

      @if (classeId() && anneeScolaireId()) {
        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-head">
            <h3 style="margin:0;font-size:16px">Décisions de fin d'année</h3>
            <button (click)="validerDecisions()" [disabled]="saving() || suggestions().length === 0" class="btn btn-primary btn-sm">
              @if (saving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> }
              Valider les décisions
            </button>
          </div>
          <div class="gs-panel-body">
            @if (loading()) {
              <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:20px 0">
                <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
              </div>
            } @else if (suggestions().length > 0) {
              <div class="table-scroll">
                <table class="table">
                  <thead><tr><th>Élève</th><th>Moyenne annuelle</th><th>Décision</th></tr></thead>
                  <tbody>
                    @for (s of suggestions(); track s.inscriptionId) {
                      <tr>
                        <td style="font-weight:600">{{ s.nom }} {{ s.prenom }}</td>
                        <td>{{ s.moyenneAnnuelle !== null ? s.moyenneAnnuelle.toFixed(2) + '/20' : '—' }}</td>
                        <td>
                          <select [(ngModel)]="s.decisionChoisie" class="input" style="max-width:200px">
                            @for (d of decisions; track d) { <option [value]="d">{{ d }}</option> }
                          </select>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="table-empty">Aucun élève inscrit dans cette classe pour cette année</div>
            }
          </div>
        </div>

        @if (admisCount() > 0) {
          <div class="gs-panel">
            <div class="gs-panel-head">
              <h3 style="margin:0;font-size:16px">Réinscription en lot ({{ admisCount() }} élève(s) admis)</h3>
            </div>
            <div class="gs-panel-body">
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:16px">
                <div class="field">
                  <label>Classe cible</label>
                  <select [(ngModel)]="classeCibleId" class="input">
                    <option value="">Sélectionner...</option>
                    @for (c of classes(); track c.classeId) { <option [value]="c.classeId">{{ c.classe }}</option> }
                  </select>
                </div>
                <div class="field">
                  <label>Année scolaire cible</label>
                  <select [(ngModel)]="anneeScolaireCibleId" class="input">
                    <option value="">Sélectionner...</option>
                    @for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }} @if (a.statut === 'active') { (active) }</option> }
                  </select>
                </div>
              </div>
              <button (click)="reinscrireLot()" [disabled]="reinscribing() || !classeCibleId || !anneeScolaireCibleId" class="btn btn-primary">
                @if (reinscribing()) { <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> }
                Réinscrire les élèves admis
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ClotureAnneeComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private anneeScolaireService = inject(AnneeScolaireService);

  decisions = DECISIONS;

  classes = signal<ClasseOption[]>([]);
  annees = signal<AnneeScolaire[]>([]);
  classeId = signal('');
  anneeScolaireId = signal('');
  suggestions = signal<SuggestionLigne[]>([]);
  loading = signal(false);
  saving = signal(false);
  reinscribing = signal(false);

  classeCibleId = '';
  anneeScolaireCibleId = '';

  admisCount = computed(() => this.suggestions().filter((s) => s.decisionFinale === 'ADMIS').length);

  ngOnInit() {
    this.loadClasses();
    this.loadAnnees();
  }

  loadClasses() {
    this.http.get<{ classes: ClasseOption[] }>(`${environment.apiUrl}/etudes/suivi-scolarite`).subscribe({
      next: (d) => this.classes.set(d?.classes || []),
      error: () => this.classes.set([]),
    });
  }

  loadAnnees() {
    this.anneeScolaireService.findAll().subscribe({
      next: (d) => this.annees.set(d || []),
      error: () => this.annees.set([]),
    });
  }

  onClasseChange(id: string) {
    this.classeId.set(id);
    this.load();
  }

  onAnneeChange(id: string) {
    this.anneeScolaireId.set(id);
    this.load();
  }

  load() {
    if (!this.classeId() || !this.anneeScolaireId()) { this.suggestions.set([]); return; }
    this.loading.set(true);
    this.http.get<SuggestionLigne[]>(`${environment.apiUrl}/etudes/fin-annee/suggestions/${this.classeId()}/${this.anneeScolaireId()}`).subscribe({
      next: (d) => {
        this.suggestions.set((d || []).map((s) => ({ ...s, decisionChoisie: s.decisionFinale || s.suggestion })));
        this.loading.set(false);
      },
      error: (err: any) => { this.loading.set(false); this.alertService.error(err?.error?.message || 'Erreur lors du chargement'); },
    });
  }

  validerDecisions() {
    const decisions = this.suggestions().map((s) => ({ inscriptionId: s.inscriptionId, decisionFinale: s.decisionChoisie || s.suggestion }));
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/etudes/fin-annee/decisions`, { decisions }).subscribe({
      next: () => {
        this.saving.set(false);
        this.alertService.success('Décisions enregistrées');
        this.load();
      },
      error: (err: any) => { this.saving.set(false); this.alertService.error(err?.error?.message || 'Erreur lors de la validation'); },
    });
  }

  reinscrireLot() {
    const inscriptionIds = this.suggestions().filter((s) => s.decisionFinale === 'ADMIS').map((s) => s.inscriptionId);
    if (inscriptionIds.length === 0) return;
    this.reinscribing.set(true);
    this.http.post<{ etudiantId: string; success: boolean; message?: string }[]>(`${environment.apiUrl}/etudes/fin-annee/reinscrire`, {
      inscriptionIds,
      classeCibleId: this.classeCibleId,
      anneeScolaireCibleId: this.anneeScolaireCibleId,
    }).subscribe({
      next: (results) => {
        this.reinscribing.set(false);
        const ok = results.filter((r) => r.success).length;
        const failed = results.length - ok;
        if (failed > 0) {
          this.alertService.error(`${ok} réinscrit(s), ${failed} échec(s)`);
        } else {
          this.alertService.success(`${ok} élève(s) réinscrit(s) avec succès`);
        }
      },
      error: (err: any) => { this.reinscribing.set(false); this.alertService.error(err?.error?.message || 'Erreur lors de la réinscription'); },
    });
  }
}
