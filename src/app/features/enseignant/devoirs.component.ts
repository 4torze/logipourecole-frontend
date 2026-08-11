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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DevoirService, CreateDevoirDto } from '../../core/services/devoir.service';
import { Devoir } from '../../core/models';
import { environment } from '../../../environments/environment';

interface Affectation {
  classe: { id: string; nom: string };
  matieres: { id: string; nom: string }[];
}

@Component({
  selector: 'app-devoirs',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    NzCardModule, NzTableModule, NzButtonModule, NzFormModule,
    NzInputModule, NzSelectModule, NzTagModule, NzIconModule, NzInputNumberModule, NzGridModule, NzEmptyModule,
    NzModalModule,
  ],
  template: `
    <div class="page-container">
      <div class="section-header">
        <h1 class="page-title" style="margin:0;">Devoirs & soumissions</h1>
        <div class="actions-row" style="margin:0;">
          <button nz-button (click)="showFilters.set(true)"><span nz-icon nzType="filter"></span> Filtres</button>
          <button nz-button nzType="primary" (click)="openCreate()"><span nz-icon nzType="plus"></span> Nouveau devoir</button>
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

      <nz-modal [nzVisible]="showCreate()" (nzVisibleChange)="showCreate.set($event)" nzTitle="Nouveau devoir" [nzFooter]="null" (nzOnCancel)="showCreate.set(false)">
        <ng-container *nzModalContent>
          <form (ngSubmit)="create()" nz-form>
            <nz-form-item><nz-form-label>Titre</nz-form-label><nz-form-control><input nz-input type="text" [(ngModel)]="newDevoir.titre" name="titre" placeholder="Titre" required /></nz-form-control></nz-form-item>
            <nz-form-item><nz-form-label>Description</nz-form-label><nz-form-control><input nz-input type="text" [(ngModel)]="newDevoir.description" name="description" placeholder="Description" /></nz-form-control></nz-form-item>
            <nz-form-item><nz-form-label>Date limite</nz-form-label><nz-form-control><input nz-input type="datetime-local" [(ngModel)]="newDevoir.dateLimite" name="dateLimite" required /></nz-form-control></nz-form-item>
            <nz-form-item><nz-form-label>Points</nz-form-label><nz-form-control><nz-input-number [(ngModel)]="newDevoir.points" name="points" [nzMin]="1" [nzPlaceHolder]="'Points'" style="width:100%;"></nz-input-number></nz-form-control></nz-form-item>
            <nz-form-item>
              <button nz-button nzType="primary" type="submit" [disabled]="saving() || !selectedClasseId || !selectedMatiereId">
                @if (saving()) { <span nz-icon nzType="loading"></span> } Créer
              </button>
              <button nz-button type="button" (click)="showCreate.set(false)" style="margin-left:8px;">Annuler</button>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <nz-card nzTitle="Devoirs">
        <nz-table #table [nzData]="devoirs()" [nzPageSize]="20" nzSize="small">
          <thead><tr><th>Titre</th><th>Description</th><th>Date limite</th><th>Points</th><th>Soumissions</th><th>Actions</th></tr></thead>
          <tbody>
            @for (d of table.data; track d.id) {
              <tr>
                <td>{{ d.titre }}</td>
                <td>{{ d.description || '—' }}</td>
                <td>{{ d.dateLimite | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ d.points }}</td>
                <td>
                  <nz-tag>{{ d.soumissions?.length || 0 }}</nz-tag>
                  @if (d.soumissions && d.soumissions.length > 0) {
                    <button nz-button nzType="link" nzSize="small" (click)="viewSoumissions(d)">Voir</button>
                  }
                </td>
                <td>
                  <button nz-button nzType="text" nzSize="small" (click)="remove(d.id)"><span nz-icon nzType="delete" style="color:#dc2626;"></span></button>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      </nz-card>

      @if (selectedDevoir()) {
        <nz-card style="margin-top:24px;" [nzTitle]="'Soumissions — ' + selectedDevoir()!.titre">
          @if (soumissions().length > 0) {
            <nz-table #subTable [nzData]="soumissions()" [nzPageSize]="20" nzSize="small">
              <thead><tr><th>Étudiant</th><th>Date</th><th>Contenu</th><th>Note</th><th>Action</th></tr></thead>
              <tbody>
                @for (s of subTable.data; track s.id) {
                  <tr>
                    <td>{{ s.etudiant?.nom }} {{ s.etudiant?.prenom }}</td>
                    <td>{{ s.dateSoumission | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ s.contenu || s.fichierUrl || '—' }}</td>
                    <td>{{ s.note !== null && s.note !== undefined ? s.note + '/' + selectedDevoir()!.points : '—' }}</td>
                    <td>
                      <button nz-button nzType="primary" nzSize="small" (click)="openNoteModal(s)" [disabled]="s.note !== null && s.note !== undefined">
                        Noter
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </nz-table>
          } @else {
            <nz-empty nzDescription="Aucune soumission pour ce devoir"></nz-empty>
          }
          <button nz-button (click)="closeSoumissions()" style="margin-top:12px;">Fermer</button>
        </nz-card>
      }

      <nz-modal [nzVisible]="notingSoumission()" (nzVisibleChange)="notingSoumission.set($event)" nzTitle="Noter la soumission" [nzFooter]="null" (nzOnCancel)="cancelNote()">
        <ng-container *nzModalContent>
          <form (ngSubmit)="submitNote()" nz-form>
            <nz-form-item><nz-form-label>Note /{{ selectedDevoir()?.points }}</nz-form-label><nz-form-control><nz-input-number [(ngModel)]="noteForm.note" name="note" [nzMin]="0" [nzMax]="selectedDevoir()!.points" [nzPlaceHolder]="'Note'" style="width:100%;"></nz-input-number></nz-form-control></nz-form-item>
            <nz-form-item><nz-form-label>Commentaire</nz-form-label><nz-form-control><input nz-input type="text" [(ngModel)]="noteForm.commentaire" name="commentaire" placeholder="Commentaire" /></nz-form-control></nz-form-item>
            <nz-form-item>
              <button nz-button nzType="primary" type="submit" [disabled]="notingSaving()">
                @if (notingSaving()) { <span nz-icon nzType="loading"></span> } Enregistrer
              </button>
              <button nz-button type="button" (click)="cancelNote()" style="margin-left:8px;">Annuler</button>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
})
export class DevoirsComponent implements OnInit {
  private devoirService = inject(DevoirService);
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  affectations = signal<Affectation[]>([]);
  matieresForClasse = signal<{ id: string; nom: string }[]>([]);
  devoirs = signal<Devoir[]>([]);
  saving = signal(false);
  selectedDevoir = signal<any>(null);
  soumissions = signal<any[]>([]);
  notingSoumission = signal(false);
  notingSaving = signal(false);
  showFilters = signal(false);
  showCreate = signal(false);
  noteForm: { note: number | null; commentaire: string } = { note: null, commentaire: '' };
  private currentSoumissionId = '';

  selectedClasseId = '';
  selectedMatiereId = '';

  newDevoir: Partial<CreateDevoirDto> = { titre: '', description: '', dateLimite: '', points: 20 };

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
    this.loadDevoirs();
  }

  loadDevoirs() {
    if (!this.selectedClasseId || !this.selectedMatiereId) return;
    this.devoirService.findByClasse(this.selectedClasseId, this.selectedMatiereId).subscribe({
      next: (d) => this.devoirs.set(d),
      error: () => this.devoirs.set([]),
    });
  }

  openCreate() {
    if (!this.selectedClasseId || !this.selectedMatiereId) {
      this.showFilters.set(true);
      return;
    }
    this.showCreate.set(true);
  }

  applyFilters() {
    this.showFilters.set(false);
    this.loadDevoirs();
  }

  create() {
    if (!this.selectedClasseId || !this.selectedMatiereId) return;
    const dto: CreateDevoirDto = {
      classeId: this.selectedClasseId,
      matiereId: this.selectedMatiereId,
      titre: this.newDevoir.titre || '',
      description: this.newDevoir.description,
      dateLimite: this.newDevoir.dateLimite || '',
      points: this.newDevoir.points || 20,
    };
    this.saving.set(true);
    this.devoirService.create(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreate.set(false);
        this.newDevoir = { titre: '', description: '', dateLimite: '', points: 20 };
        this.message.success('Devoir créé');
        this.loadDevoirs();
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur création';
        this.message.error(msg);
      },
    });
  }

  remove(id: string) {
    this.modal.confirm({
      nzTitle: 'Supprimer ce devoir ?',
      nzContent: 'Cette action supprimera le devoir et toutes les notes associées. Cette opération est irréversible.',
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () => {
        this.devoirService.remove(id).subscribe({
          next: () => { this.message.success('Devoir supprimé'); this.loadDevoirs(); },
          error: (err: any) => {
            const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur suppression';
            this.message.error(msg);
          },
        });
      },
    });
  }

  viewSoumissions(devoir: any) {
    this.selectedDevoir.set(devoir);
    this.soumissions.set(devoir.soumissions || []);
  }

  closeSoumissions() {
    this.selectedDevoir.set(null);
    this.soumissions.set([]);
    this.notingSoumission.set(false);
  }

  openNoteModal(soumission: any) {
    this.currentSoumissionId = soumission.id;
    this.noteForm = { note: soumission.note ?? null, commentaire: soumission.commentaire || '' };
    this.notingSoumission.set(true);
  }

  cancelNote() {
    this.notingSoumission.set(false);
    this.currentSoumissionId = '';
    this.noteForm = { note: null, commentaire: '' };
  }

  submitNote() {
    if (this.noteForm.note === null || this.noteForm.note === undefined || !this.currentSoumissionId) return;
    this.notingSaving.set(true);
    this.devoirService.noterSoumission(this.currentSoumissionId, {
      note: this.noteForm.note,
      commentaire: this.noteForm.commentaire || undefined,
    }).subscribe({
      next: () => {
        this.notingSaving.set(false);
        this.notingSoumission.set(false);
        this.message.success('Note enregistrée');
        this.currentSoumissionId = '';
        this.noteForm = { note: null, commentaire: '' };
        this.loadDevoirs();
        if (this.selectedDevoir()) {
          this.devoirService.findOne(this.selectedDevoir().id).subscribe({
            next: (d: any) => { this.selectedDevoir.set(d); this.soumissions.set(d.soumissions || []); },
            error: () => {},
          });
        }
      },
      error: (err: any) => {
        this.notingSaving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur notation';
        this.message.error(msg);
      },
    });
  }
}
