import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { AbsenceService, CreateAbsenceDto } from '../../core/services/absence.service';
import { Absence, Etudiant, TypeAbsence } from '../../core/models';
import { environment } from '../../../environments/environment';

interface Affectation {
  classe: { id: string; nom: string };
  matieres: { id: string; nom: string }[];
}

@Component({
  selector: 'app-absences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <h1 style="margin:0">Absences &amp; retards</h1>
        <div style="display:flex;gap:8px">
          <button (click)="showFilters.set(true)" class="btn btn-secondary">
            <span class="material-symbols-outlined" style="font-size:18px">filter_alt</span> Filtres
          </button>
          <button (click)="openForm()" class="btn btn-primary">
            <span class="material-symbols-outlined" style="font-size:18px">add</span> Marquer une absence
          </button>
        </div>
      </div>

      @if (selectedClasseId || selectedMatiereId) {
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:color-mix(in srgb, var(--color-text) 60%, transparent);margin-bottom:16px">
          <span class="material-symbols-outlined" style="font-size:16px">school</span>
          {{ classeLabel() }} @if (matiereLabel()) { <span>— {{ matiereLabel() }}</span> }
        </div>
      }

      <div class="gs-panel">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Liste des absences/retards</h3></div>
        <div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr><th>Date</th><th>Étudiant</th><th>Type</th><th>Justifié</th><th>Motif</th><th>Actions</th></tr>
              </thead>
              <tbody>
                @for (a of absences(); track a.id) {
                  <tr>
                    <td>{{ a.date | date:'dd/MM/yyyy' }}</td>
                    <td style="font-weight:600">{{ a.etudiant?.nom }} {{ a.etudiant?.prenom }}</td>
                    <td><span class="tag" [class]="a.type === 'ABSENCE' ? 'tag-danger' : a.type === 'RETARD' ? 'tag-accent' : 'tag-neutral'">{{ a.type }}</span></td>
                    <td><span class="tag" [class]="a.justified ? 'tag-success' : 'tag-neutral'">{{ a.justified ? 'Oui' : 'Non' }}</span></td>
                    <td>{{ a.motif || '—' }}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px">
                        <button (click)="openEditAbsence(a)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
                        <button (click)="remove(a.id)" [disabled]="actionLoading() === 'delete-' + a.id" class="btn btn-icon btn-danger" title="Supprimer">
                          @if (actionLoading() === 'delete-' + a.id) { <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">delete</span> }
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="6" style="text-align:center;padding:40px 0;color:color-mix(in srgb, var(--color-text) 45%, transparent)">
                    <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">event_busy</span>
                    Aucune absence ou retard enregistré.
                  </td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Filtres -->
    @if (showFilters()) {
      <div class="dialog-backdrop" (click)="showFilters.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Filtres</h3>
            <button class="btn btn-icon btn-secondary" (click)="showFilters.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div class="field">
            <label>Classe</label>
            <select [(ngModel)]="selectedClasseId" (ngModelChange)="onClasseChange()" class="input">
              @for (a of affectations(); track a.classe.id) { <option [value]="a.classe.id">{{ a.classe.nom }}</option> }
            </select>
          </div>
          <div class="field">
            <label>Matière</label>
            <select [(ngModel)]="selectedMatiereId" class="input">
              @for (m of matieresForClasse(); track m.id) { <option [value]="m.id">{{ m.nom }}</option> }
            </select>
          </div>
          <div class="dialog-actions">
            <button (click)="showFilters.set(false)" class="btn btn-secondary">Annuler</button>
            <button (click)="applyFilters()" [disabled]="!selectedClasseId" class="btn btn-primary">Appliquer</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Nouvelle absence -->
    @if (showForm()) {
      <div class="dialog-backdrop" (click)="showForm.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Marquer une absence/retard</h3>
            <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="create()" style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label>Étudiant</label>
              <select [(ngModel)]="newAbsence.etudiantId" name="etudiantId" required class="input">
                <option value="" disabled>Choisir un étudiant…</option>
                @for (e of etudiants(); track e.id) { <option [value]="e.id">{{ e.nom }} {{ e.prenom }}</option> }
              </select>
            </div>
            <div class="field">
              <label>Type</label>
              <select [(ngModel)]="newAbsence.type" name="type" required class="input">
                <option value="ABSENCE">Absence</option>
                <option value="RETARD">Retard</option>
                <option value="EXCLUSION">Exclusion</option>
              </select>
            </div>
            <div class="field">
              <label>Date</label>
              <input type="date" [(ngModel)]="newAbsence.date" name="date" required class="input" />
            </div>
            <div class="field">
              <label>Motif</label>
              <input type="text" [(ngModel)]="newAbsence.motif" name="motif" placeholder="Optionnel" class="input" />
            </div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
              <input type="checkbox" [(ngModel)]="newAbsence.justified" name="justified" style="width:16px;height:16px;accent-color:var(--color-accent)" />
              Justifié
            </label>
            <div class="dialog-actions">
              <button type="button" (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="saving() || !selectedClasseId || !selectedMatiereId" class="btn btn-primary">
                @if (saving()) { <span class="material-symbols-outlined" style="font-size:14px">progress_activity</span> } Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Modifier absence -->
    @if (showEditAbsence()) {
      <div class="dialog-backdrop" (click)="showEditAbsence.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Modifier l'absence/retard</h3>
            <button class="btn btn-icon btn-secondary" (click)="showEditAbsence.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="saveEditAbsence()" style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label>Type</label>
              <select [(ngModel)]="editAbsenceForm.type" name="type" required class="input">
                <option value="ABSENCE">Absence</option>
                <option value="RETARD">Retard</option>
                <option value="EXCLUSION">Exclusion</option>
              </select>
            </div>
            <div class="field">
              <label>Date</label>
              <input type="date" [(ngModel)]="editAbsenceForm.date" name="date" required class="input" />
            </div>
            <div class="field">
              <label>Motif</label>
              <input type="text" [(ngModel)]="editAbsenceForm.motif" name="motif" placeholder="Optionnel" class="input" />
            </div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
              <input type="checkbox" [(ngModel)]="editAbsenceForm.justified" name="justified" style="width:16px;height:16px;accent-color:var(--color-accent)" />
              Justifié
            </label>
            <div class="dialog-actions">
              <button type="button" (click)="showEditAbsence.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="editSaving()" class="btn btn-primary">
                @if (editSaving()) { <span class="material-symbols-outlined" style="font-size:14px">progress_activity</span> } Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class AbsencesComponent implements OnInit {
  private absenceService = inject(AbsenceService);
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  affectations = signal<Affectation[]>([]);
  matieresForClasse = signal<{ id: string; nom: string }[]>([]);
  etudiants = signal<Etudiant[]>([]);
  absences = signal<Absence[]>([]);
  saving = signal(false);
  actionLoading = signal<string | null>(null);
  showFilters = signal(false);
  showForm = signal(false);
  showEditAbsence = signal(false);
  editSaving = signal(false);
  editAbsenceForm: { id: string; type: TypeAbsence; date: string; motif: string; justified: boolean } = { id: '', type: 'ABSENCE', date: '', motif: '', justified: false };

  selectedClasseId = '';
  selectedMatiereId = '';

  newAbsence: Partial<CreateAbsenceDto> = { type: 'ABSENCE', date: '', motif: '', justified: false };

  ngOnInit() {
    this.loadAffectations();
  }

  classeLabel(): string {
    return this.affectations().find((a) => a.classe.id === this.selectedClasseId)?.classe.nom || '';
  }

  matiereLabel(): string {
    return this.matieresForClasse().find((m) => m.id === this.selectedMatiereId)?.nom || '';
  }

  loadAffectations() {
    this.http.get<any[]>(`${environment.apiUrl}/enseignant/affectations`).subscribe({
      next: (d) => {
        this.affectations.set(d || []);
        if (d && d.length > 0) { this.selectedClasseId = d[0].classe.id; this.onClasseChange(); }
      },
      error: (err: any) => {
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur chargement affectations';
        this.alertService.error(msg);
      },
    });
  }

  onClasseChange() {
    const aff = this.affectations().find((a) => a.classe.id === this.selectedClasseId);
    this.matieresForClasse.set(aff?.matieres || []);
    if (this.matieresForClasse().length > 0) this.selectedMatiereId = this.matieresForClasse()[0].id;
    this.loadEtudiants();
    this.loadAbsences();
  }

  loadEtudiants() {
    this.http.get<Etudiant[]>(`${environment.apiUrl}/enseignant/classe/${this.selectedClasseId}/etudiants`).subscribe({
      next: (d) => this.etudiants.set(d),
      error: () => this.etudiants.set([]),
    });
  }

  loadAbsences() {
    if (!this.selectedClasseId || !this.selectedMatiereId) return;
    this.absenceService.findByClasse(this.selectedClasseId, this.selectedMatiereId).subscribe({
      next: (d) => this.absences.set(d),
      error: () => this.absences.set([]),
    });
  }

  openForm() {
    if (!this.selectedClasseId || !this.selectedMatiereId) {
      this.showFilters.set(true);
      return;
    }
    this.showForm.set(true);
  }

  applyFilters() {
    this.showFilters.set(false);
    this.loadAbsences();
  }

  create() {
    if (!this.newAbsence.etudiantId || !this.selectedClasseId || !this.selectedMatiereId) return;
    const dto: CreateAbsenceDto = {
      etudiantId: this.newAbsence.etudiantId,
      matiereId: this.selectedMatiereId,
      classeId: this.selectedClasseId,
      type: this.newAbsence.type as TypeAbsence,
      date: this.newAbsence.date || '',
      motif: this.newAbsence.motif,
      justified: this.newAbsence.justified,
    };
    this.saving.set(true);
    this.absenceService.create(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.newAbsence = { type: 'ABSENCE', date: '', motif: '', justified: false };
        this.alertService.success('Absence/retard enregistré');
        this.loadAbsences();
      },
      error: (err: any) => { this.saving.set(false); const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur enregistrement'; this.alertService.error(msg); },
    });
  }

  openEditAbsence(a: Absence) {
    this.editAbsenceForm = {
      id: a.id,
      type: a.type,
      date: a.date ? new Date(a.date).toISOString().slice(0, 10) : '',
      motif: a.motif || '',
      justified: !!a.justified,
    };
    this.showEditAbsence.set(true);
  }

  saveEditAbsence() {
    this.editSaving.set(true);
    const { id, ...dto } = this.editAbsenceForm;
    this.absenceService.update(id, dto).subscribe({
      next: () => {
        this.editSaving.set(false);
        this.showEditAbsence.set(false);
        this.alertService.success('Absence modifiée');
        this.loadAbsences();
      },
      error: (err: any) => { this.editSaving.set(false); this.alertService.error(err?.message || 'Erreur lors de la modification'); },
    });
  }

  async remove(id: string) {
    const ok = await this.alertService.confirm({
      title: 'Supprimer cette absence ?',
      text: 'Cette action est irréversible.',
      confirmText: 'Supprimer',
      danger: true,
    });
    if (ok) {
      this.actionLoading.set('delete-' + id);
      this.absenceService.remove(id).subscribe({
        next: () => { this.actionLoading.set(null); this.alertService.success('Supprimé'); this.loadAbsences(); },
        error: (err: any) => { this.actionLoading.set(null); const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur suppression'; this.alertService.error(msg); },
      });
    }
  }
}
