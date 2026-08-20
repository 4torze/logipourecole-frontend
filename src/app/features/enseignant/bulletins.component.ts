import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

interface Affectation {
  classe: { id: string; nom: string };
  matieres: { id: string; nom: string }[];
}

interface Periode {
  id: string;
  libelle: string;
}

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
}

@Component({
  selector: 'app-enseignant-bulletins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1 style="margin:0 0 4px">Bulletins</h1>
      <p style="margin:0 0 24px;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Générez les bulletins de vos élèves — calcul automatique des moyennes à partir des notes saisies.</p>

      <div class="gs-panel" style="margin-bottom:20px">
        <div class="gs-panel-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
          <div class="field">
            <label>Classe</label>
            <select [ngModel]="selectedClasseId()" (ngModelChange)="onClasseChange($event)" class="input">
              <option value="">Sélectionner...</option>
              @for (a of affectations(); track a.classe.id) { <option [value]="a.classe.id">{{ a.classe.nom }}</option> }
            </select>
          </div>
          <div class="field">
            <label>Trimestre / Semestre</label>
            <select [ngModel]="selectedPeriodeId()" (ngModelChange)="onPeriodeChange($event)" class="input">
              <option value="">Sélectionner...</option>
              @for (p of periodes(); track p.id) { <option [value]="p.id">{{ p.libelle }}</option> }
            </select>
          </div>
        </div>
      </div>

      @if (selectedClasseId() && selectedPeriodeId()) {
        <div class="gs-panel">
          <div class="gs-panel-head">
            <h3 style="margin:0;font-size:16px">Élèves</h3>
            <div style="display:flex;gap:8px">
              <button (click)="voirClassement()" class="btn btn-secondary btn-sm">
                <span class="material-symbols-outlined" style="font-size:16px">leaderboard</span> Voir le classement
              </button>
              <button (click)="genererTous()" [disabled]="generatingAll() || eleves().length === 0" class="btn btn-primary btn-sm">
                @if (generatingAll()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> }
                Générer pour toute la classe
              </button>
            </div>
          </div>
          <div class="gs-panel-body">
            @if (loading()) {
              <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:20px 0">
                <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
              </div>
            } @else if (eleves().length > 0) {
              <div class="table-scroll">
                <table class="table">
                  <thead><tr><th>Élève</th><th>Moyenne</th><th>Rang</th><th>Mention</th><th></th></tr></thead>
                  <tbody>
                    @for (e of eleves(); track e.id) {
                      <tr>
                        <td style="font-weight:600">{{ e.nom }} {{ e.prenom }}</td>
                        <td>{{ bulletinFor(e.id)?.moyenneGenerale?.toFixed(2) || '—' }}{{ bulletinFor(e.id) ? '/20' : '' }}</td>
                        <td>{{ bulletinFor(e.id)?.rang || '—' }}</td>
                        <td>@if (bulletinFor(e.id)) { <span class="tag tag-neutral">{{ bulletinFor(e.id)?.mention }}</span> } @else { '—' }</td>
                        <td style="display:flex;gap:6px;justify-content:flex-end">
                          <button (click)="genererUn(e)" [disabled]="generatingId() === e.id" class="btn btn-secondary btn-sm">
                            @if (generatingId() === e.id) { <span class="material-symbols-outlined" style="font-size:14px">progress_activity</span> }
                            {{ bulletinFor(e.id) ? 'Régénérer' : 'Générer' }}
                          </button>
                          @if (bulletinFor(e.id)) {
                            <button (click)="download(e)" class="btn btn-icon btn-secondary" title="Télécharger"><span class="material-symbols-outlined" style="font-size:18px">download</span></button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="table-empty">Aucun élève inscrit dans cette classe</div>
            }
          </div>
        </div>
      } @else {
        <div class="gs-panel"><div class="gs-panel-body">
          <p class="text-muted" style="font-size:13px;margin:0">Sélectionnez une classe et une période pour générer les bulletins.</p>
        </div></div>
      }
    </div>
  `,
})
export class EnseignantBulletinsComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private router = inject(Router);

  affectations = signal<Affectation[]>([]);
  periodes = signal<Periode[]>([]);
  eleves = signal<Eleve[]>([]);
  bulletins = signal<any[]>([]);

  selectedClasseId = signal('');
  selectedPeriodeId = signal('');
  anneeScolaireId = signal('');

  loading = signal(false);
  generatingId = signal<string | null>(null);
  generatingAll = signal(false);

  bulletinFor(etudiantId: string) {
    return this.bulletins().find((b) => b.etudiant?.id === etudiantId);
  }

  ngOnInit() {
    this.loadAffectations();
    this.loadPeriodes();
    this.loadAnneeActive();
  }

  loadAffectations() {
    this.http.get<Affectation[]>(`${environment.apiUrl}/enseignant/affectations`).subscribe({
      next: (d) => this.affectations.set(d),
      error: () => this.affectations.set([]),
    });
  }

  loadPeriodes() {
    this.http.get<Periode[]>(`${environment.apiUrl}/enseignant/periodes`).subscribe({
      next: (d) => this.periodes.set(d),
      error: () => this.periodes.set([]),
    });
  }

  loadAnneeActive() {
    this.http.get<any>(`${environment.apiUrl}/enseignant/annee-active`).subscribe({
      next: (d) => { if (d?.id) this.anneeScolaireId.set(d.id); },
      error: () => {},
    });
  }

  onClasseChange(classeId: string) {
    this.selectedClasseId.set(classeId);
    this.load();
  }

  onPeriodeChange(periodeId: string) {
    this.selectedPeriodeId.set(periodeId);
    this.load();
  }

  load() {
    if (!this.selectedClasseId()) { this.eleves.set([]); this.bulletins.set([]); return; }
    this.loading.set(true);
    this.http.get<Eleve[]>(`${environment.apiUrl}/enseignant/classe/${this.selectedClasseId()}/etudiants`).subscribe({
      next: (d) => { this.eleves.set(d || []); this.loading.set(false); this.loadBulletins(); },
      error: () => { this.eleves.set([]); this.loading.set(false); },
    });
  }

  loadBulletins() {
    if (!this.selectedClasseId() || !this.selectedPeriodeId()) { this.bulletins.set([]); return; }
    this.http.get<any[]>(`${environment.apiUrl}/bulletins/classe/${this.selectedClasseId()}?periodeId=${this.selectedPeriodeId()}`).subscribe({
      next: (d) => this.bulletins.set(d || []),
      error: () => this.bulletins.set([]),
    });
  }

  private payloadFor(etudiantId: string) {
    return {
      etudiantId,
      classeId: this.selectedClasseId(),
      periodeId: this.selectedPeriodeId(),
      anneeScolaireId: this.anneeScolaireId(),
    };
  }

  genererUn(e: Eleve) {
    if (!this.anneeScolaireId()) { this.alertService.error('Aucune année scolaire active'); return; }
    this.generatingId.set(e.id);
    this.http.post(`${environment.apiUrl}/bulletins/generer`, this.payloadFor(e.id)).subscribe({
      next: () => { this.generatingId.set(null); this.loadBulletins(); },
      error: (err: any) => { this.generatingId.set(null); this.alertService.error(err?.error?.message || 'Erreur génération'); },
    });
  }

  async genererTous() {
    if (!this.anneeScolaireId()) { this.alertService.error('Aucune année scolaire active'); return; }
    this.generatingAll.set(true);
    for (const e of this.eleves()) {
      try {
        await this.http.post(`${environment.apiUrl}/bulletins/generer`, this.payloadFor(e.id)).toPromise();
      } catch {
        // un échec isolé ne doit pas interrompre la génération des autres élèves
      }
    }
    this.generatingAll.set(false);
    this.loadBulletins();
    this.alertService.success('Bulletins générés pour la classe');
  }

  voirClassement() {
    if (!this.selectedClasseId() || !this.selectedPeriodeId()) return;
    this.router.navigate(['/classement', this.selectedClasseId(), this.selectedPeriodeId()]);
  }

  download(e: Eleve) {
    this.http.post(`${environment.apiUrl}/bulletins/generer-pdf`, this.payloadFor(e.id), { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulletin-${e.nom}-${e.prenom}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.alertService.error('Erreur lors du téléchargement du bulletin'),
    });
  }
}
