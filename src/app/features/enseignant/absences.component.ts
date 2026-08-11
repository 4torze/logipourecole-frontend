import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
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
  imports: [
    CommonModule, FormsModule,
    NzCardModule, NzTableModule, NzButtonModule, NzFormModule,
    NzInputModule, NzSelectModule, NzTagModule, NzIconModule, NzCheckboxModule, NzGridModule,
    NzModalModule,
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1 class="page-title" style="margin:0;">Gestion des absences & retards</h1>
        <div class="actions-row" style="margin:0;">
          <button nz-button (click)="showFilters.set(true)"><span nz-icon nzType="filter"></span> Filtres</button>
          <button nz-button nzType="primary" (click)="openForm()"><span nz-icon nzType="plus"></span> Marquer une absence</button>
        </div>
      </div>

      <nz-modal [nzVisible]="showFilters()" (nzVisibleChange)="showFilters.set($event)" nzTitle="Filtres" [nzFooter]="null" (nzOnCancel)="showFilters.set(false)">
        <ng-container *nzModalContent>
          <div nz-row [nzGutter]="[12,12]">
            <div nz-col [nzSpan]="24">
              <nz-select [(ngModel)]="selectedClasseId" (ngModelChange)="onClasseChange()" nzPlaceHolder="Classe" style="width:100%;">
                @for (a of affectations(); track a.classe.id) { <nz-option [nzValue]="a.classe.id" [nzLabel]="a.classe.nom"></nz-option> }
              </nz-select>
            </div>
            <div nz-col [nzSpan]="24">
              <nz-select [(ngModel)]="selectedMatiereId" nzPlaceHolder="Matière" style="width:100%;">
                @for (m of matieresForClasse(); track m.id) { <nz-option [nzValue]="m.id" [nzLabel]="m.nom"></nz-option> }
              </nz-select>
            </div>
          </div>
          <div class="actions-row">
            <button nz-button nzType="primary" (click)="applyFilters()" [disabled]="!selectedClasseId"><span nz-icon nzType="check"></span> Appliquer</button>
            <button nz-button (click)="showFilters.set(false)">Annuler</button>
          </div>
        </ng-container>
      </nz-modal>

      <nz-modal [nzVisible]="showForm()" (nzVisibleChange)="showForm.set($event)" nzTitle="Marquer une absence/retard" [nzFooter]="null" (nzOnCancel)="showForm.set(false)">
        <ng-container *nzModalContent>
          <form (ngSubmit)="create()" nz-form>
            <nz-form-item>
              <nz-form-label>Étudiant</nz-form-label>
              <nz-form-control>
                <nz-select [(ngModel)]="newAbsence.etudiantId" name="etudiantId" style="width:100%;" nzPlaceHolder="Étudiant" required>
                  @for (e of etudiants(); track e.id) { <nz-option [nzValue]="e.id" [nzLabel]="e.nom + ' ' + e.prenom"></nz-option> }
                </nz-select>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label>Type</nz-form-label>
              <nz-form-control>
                <nz-select [(ngModel)]="newAbsence.type" name="type" style="width:100%;" nzPlaceHolder="Type" required>
                  <nz-option nzValue="ABSENCE" nzLabel="Absence"></nz-option>
                  <nz-option nzValue="RETARD" nzLabel="Retard"></nz-option>
                  <nz-option nzValue="EXCLUSION" nzLabel="Exclusion"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item><nz-form-label>Date</nz-form-label><nz-form-control><input nz-input type="date" [(ngModel)]="newAbsence.date" name="date" required /></nz-form-control></nz-form-item>
            <nz-form-item><nz-form-label>Motif</nz-form-label><nz-form-control><input nz-input type="text" [(ngModel)]="newAbsence.motif" name="motif" placeholder="Motif" /></nz-form-control></nz-form-item>
            <nz-form-item><label nz-checkbox [(ngModel)]="newAbsence.justified" name="justified">Justifié</label></nz-form-item>
            <nz-form-item>
              <button nz-button nzType="primary" type="submit" [disabled]="saving() || !selectedClasseId || !selectedMatiereId">
                @if (saving()) { <span nz-icon nzType="loading"></span> } Enregistrer
              </button>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <nz-card nzTitle="Liste des absences/retards">
        <nz-table #table [nzData]="absences()" [nzPageSize]="20" nzSize="small">
          <thead><tr><th>Date</th><th>Étudiant</th><th>Type</th><th>Justifié</th><th>Motif</th><th>Actions</th></tr></thead>
          <tbody>
            @for (a of table.data; track a.id) {
              <tr>
                <td>{{ a.date | date:'dd/MM/yyyy' }}</td>
                <td>{{ a.etudiant?.nom }} {{ a.etudiant?.prenom }}</td>
                <td><nz-tag [nzColor]="a.type === 'ABSENCE' ? 'error' : a.type === 'RETARD' ? 'warning' : 'default'">{{ a.type }}</nz-tag></td>
                <td>{{ a.justified ? 'Oui' : 'Non' }}</td>
                <td>{{ a.motif || '—' }}</td>
                <td>
                  <button nz-button nzType="text" nzSize="small" (click)="toggleJustifie(a)" [disabled]="actionLoading() === 'justify-' + a.id">
                    @if (actionLoading() === 'justify-' + a.id) { <span nz-icon nzType="loading"></span> }
                    justifier
                  </button>
                  <button nz-button nzType="text" nzSize="small" (click)="remove(a.id)" [disabled]="actionLoading() === 'delete-' + a.id">
                    @if (actionLoading() === 'delete-' + a.id) { <span nz-icon nzType="loading"></span> }
                    <span nz-icon nzType="delete" style="color:#dc2626;"></span>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `,
})
export class AbsencesComponent implements OnInit {
  private absenceService = inject(AbsenceService);
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  affectations = signal<Affectation[]>([]);
  matieresForClasse = signal<{ id: string; nom: string }[]>([]);
  etudiants = signal<Etudiant[]>([]);
  absences = signal<Absence[]>([]);
  saving = signal(false);
  actionLoading = signal<string | null>(null);
  showFilters = signal(false);
  showForm = signal(false);

  selectedClasseId = '';
  selectedMatiereId = '';

  newAbsence: Partial<CreateAbsenceDto> = { type: 'ABSENCE', date: '', motif: '', justified: false };

  ngOnInit() {
    this.loadAffectations();
  }

  loadAffectations() {
    this.http.get<any[]>(`${environment.apiUrl}/enseignant/affectations`).subscribe({
      next: (d) => {
        this.affectations.set(d || []);
        if (d && d.length > 0) { this.selectedClasseId = d[0].classe.id; this.onClasseChange(); }
      },
      error: (err: any) => {
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur chargement affectations';
        this.message.error(msg);
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
        this.message.success('Absence/retard enregistré');
        this.loadAbsences();
      },
      error: (err: any) => { this.saving.set(false); const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur enregistrement'; this.message.error(msg); },
    });
  }

  toggleJustifie(a: Absence) {
    this.actionLoading.set('justify-' + a.id);
    this.absenceService.update(a.id, { justified: !a.justified }).subscribe({
      next: () => { this.actionLoading.set(null); this.message.success('Statut mis à jour'); this.loadAbsences(); },
      error: (err: any) => { this.actionLoading.set(null); const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur mise à jour'; this.message.error(msg); },
    });
  }

  remove(id: string) {
    this.modal.confirm({
      nzTitle: 'Supprimer cette absence ?',
      nzContent: 'Cette action est irréversible.',
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () => {
        this.actionLoading.set('delete-' + id);
        this.absenceService.remove(id).subscribe({
          next: () => { this.actionLoading.set(null); this.message.success('Supprimé'); this.loadAbsences(); },
          error: (err: any) => { this.actionLoading.set(null); const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur suppression'; this.message.error(msg); },
        });
      },
    });
  }
}
