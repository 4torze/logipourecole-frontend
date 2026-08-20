import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

interface Affectation {
  classe: { id: string; nom: string };
  matieres: { id: string; nom: string }[];
}

interface Periode {
  id: string;
  libelle: string;
  type: string;
  dateDebut?: string;
  dateFin?: string;
}

interface Chapitre {
  id: string;
  titre: string;
  contenu?: string;
  ordre: number;
}

@Component({
  selector: 'app-enseignant-programme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1 style="margin:0 0 4px">Mon programme</h1>
      <p style="margin:0 0 24px;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Enregistrez les chapitres de votre programme, classe par classe.</p>

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
            <label>Matière</label>
            <select [ngModel]="selectedMatiereId()" (ngModelChange)="selectedMatiereId.set($event); loadChapitres()" class="input" [disabled]="!selectedClasseId()">
              <option value="">Sélectionner...</option>
              @for (m of matieresForClasse(); track m.id) { <option [value]="m.id">{{ m.nom }}</option> }
            </select>
          </div>
          <div class="field">
            <label>Trimestre / Semestre</label>
            <select [ngModel]="selectedPeriodeId()" (ngModelChange)="selectedPeriodeId.set($event); loadChapitres()" class="input">
              <option value="">Sélectionner...</option>
              @for (p of periodes(); track p.id) { <option [value]="p.id">{{ p.libelle }}</option> }
            </select>
          </div>
        </div>
      </div>

      @if (selectedClasseId() && selectedMatiereId() && selectedPeriodeId()) {
        <div class="gs-panel">
          <div class="gs-panel-head">
            <h3 style="margin:0;font-size:16px">Chapitres</h3>
            <button (click)="openNew()" class="btn btn-primary btn-sm">
              <span class="material-symbols-outlined" style="font-size:16px">add</span> Ajouter un chapitre
            </button>
          </div>
          <div class="gs-panel-body">
            @if (showForm()) {
              <div class="gs-well" style="margin-bottom:16px;display:flex;flex-direction:column;gap:12px">
                <div class="field"><label>Titre</label><input type="text" [(ngModel)]="form.titre" placeholder="Ex: Chapitre 1 — Introduction" class="input" /></div>
                <div class="field"><label>Contenu (optionnel)</label><textarea [(ngModel)]="form.contenu" class="input" rows="3" placeholder="Notes, ressources, objectifs..."></textarea></div>
                <div style="display:flex;gap:8px">
                  <button (click)="save()" [disabled]="saving()" class="btn btn-primary">{{ editingId() ? 'Enregistrer' : 'Ajouter' }}</button>
                  <button (click)="closeForm()" class="btn btn-secondary">Annuler</button>
                </div>
              </div>
            }

            @if (chapitres().length > 0) {
              <div style="display:flex;flex-direction:column;gap:8px">
                @for (c of chapitres(); track c.id) {
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px;border:1px solid var(--color-divider)">
                    <div>
                      <strong>{{ c.titre }}</strong>
                      @if (c.contenu) { <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 65%, transparent)">{{ c.contenu }}</p> }
                    </div>
                    <div style="display:flex;gap:4px;flex:none">
                      <button (click)="openEdit(c)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
                      <button (click)="remove(c.id)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="table-empty">
                <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">menu_book</span>
                Aucun chapitre enregistré pour cette classe/période
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="gs-panel"><div class="gs-panel-body">
          <p class="text-muted" style="font-size:13px;margin:0">Sélectionnez une classe, une matière et une période pour gérer le programme.</p>
        </div></div>
      }
    </div>
  `,
})
export class ProgrammeComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  affectations = signal<Affectation[]>([]);
  periodes = signal<Periode[]>([]);
  chapitres = signal<Chapitre[]>([]);

  selectedClasseId = signal<string>('');
  selectedMatiereId = signal<string>('');
  selectedPeriodeId = signal<string>('');

  showForm = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  form = { titre: '', contenu: '' };

  matieresForClasse = computed(() => {
    const aff = this.affectations().find((a) => a.classe.id === this.selectedClasseId());
    return aff?.matieres || [];
  });

  ngOnInit() {
    this.loadAffectations();
    this.loadPeriodes();
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

  onClasseChange(classeId: string) {
    this.selectedClasseId.set(classeId);
    this.selectedMatiereId.set('');
    this.chapitres.set([]);
  }

  loadChapitres() {
    if (!this.selectedClasseId() || !this.selectedPeriodeId()) { this.chapitres.set([]); return; }
    this.http.get<Chapitre[]>(`${environment.apiUrl}/enseignant/programme?classeId=${this.selectedClasseId()}&periodeId=${this.selectedPeriodeId()}`).subscribe({
      next: (d) => this.chapitres.set(d),
      error: () => this.chapitres.set([]),
    });
  }

  openNew() {
    this.editingId.set(null);
    this.form = { titre: '', contenu: '' };
    this.showForm.set(true);
  }

  openEdit(c: Chapitre) {
    this.editingId.set(c.id);
    this.form = { titre: c.titre, contenu: c.contenu || '' };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save() {
    if (!this.form.titre.trim()) { this.alertService.error('Le titre est requis'); return; }
    this.saving.set(true);
    const payload = {
      id: this.editingId() || undefined,
      classeId: this.selectedClasseId(),
      matiereId: this.selectedMatiereId(),
      periodeId: this.selectedPeriodeId(),
      titre: this.form.titre,
      contenu: this.form.contenu || undefined,
      ordre: this.chapitres().length,
    };
    this.http.post(`${environment.apiUrl}/enseignant/programme`, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadChapitres();
      },
      error: (err: any) => { this.saving.set(false); this.alertService.error(err?.error?.message || 'Erreur enregistrement'); },
    });
  }

  async remove(id: string) {
    const ok = await this.alertService.confirm({ title: 'Supprimer ce chapitre ?', confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/enseignant/programme/${id}`).subscribe({
      next: () => this.loadChapitres(),
      error: (err: any) => this.alertService.error(err?.error?.message || 'Erreur suppression'),
    });
  }
}
