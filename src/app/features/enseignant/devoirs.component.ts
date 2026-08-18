import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <h1 style="margin:0">Devoirs &amp; soumissions</h1>
        <div style="display:flex;gap:8px">
          <button (click)="showFilters.set(true)" class="btn btn-secondary">
            <span class="material-symbols-outlined" style="font-size:18px">filter_alt</span> Filtres
          </button>
          <button (click)="openCreate()" class="btn btn-primary">
            <span class="material-symbols-outlined" style="font-size:18px">add</span> Nouveau devoir
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
        <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Devoirs</h3></div>
        <div class="gs-panel-body">
          <div style="overflow-x:auto">
          <table class="table">
            <thead>
              <tr><th>Titre</th><th>Description</th><th>Date limite</th><th>Points</th><th>Soumissions</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (d of devoirs(); track d.id) {
                <tr>
                  <td style="font-weight:600">{{ d.titre }}</td>
                  <td>{{ d.description || '—' }}</td>
                  <td>{{ d.dateLimite | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ d.points }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span class="tag tag-neutral">{{ d.soumissions?.length || 0 }}</span>
                      @if (d.soumissions && d.soumissions.length > 0) {
                        <button (click)="viewSoumissions(d)" class="btn btn-secondary btn-sm">Voir</button>
                      }
                    </div>
                  </td>
                  <td>
                    <button (click)="remove(d.id)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="table-empty">
                  <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">assignment</span>
                  Aucun devoir créé pour cette sélection.
                </td></tr>
              }
            </tbody>
          </table>
        </div>
        </div>
      </div>

      @if (selectedDevoir()) {
        <div class="gs-panel">
          <div class="gs-panel-head">
            <h3 style="margin:0;font-size:16px">Soumissions — {{ selectedDevoir()!.titre }}</h3>
            <button (click)="closeSoumissions()" class="btn btn-icon btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div class="gs-panel-body">
          @if (soumissions().length > 0) {
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>Étudiant</th><th>Date</th><th>Contenu</th><th>Note</th><th>Action</th></tr>
                </thead>
                <tbody>
                  @for (s of soumissions(); track s.id) {
                    <tr>
                      <td style="font-weight:600">{{ s.etudiant?.nom }} {{ s.etudiant?.prenom }}</td>
                      <td>{{ s.dateSoumission | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td>{{ s.contenu || s.fichierUrl || '—' }}</td>
                      <td>{{ s.note !== null && s.note !== undefined ? s.note + '/' + selectedDevoir()!.points : '—' }}</td>
                      <td>
                        <button (click)="openNoteModal(s)" [disabled]="s.note !== null && s.note !== undefined" class="btn btn-primary btn-sm">Noter</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="table-empty">
              <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">inbox</span>
              Aucune soumission pour ce devoir
            </div>
          }
          </div>
        </div>
      }
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

    <!-- Modal Nouveau devoir -->
    @if (showCreate()) {
      <div class="dialog-backdrop" (click)="showCreate.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Nouveau devoir</h3>
            <button class="btn btn-icon btn-secondary" (click)="showCreate.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="create()" style="display:flex;flex-direction:column;gap:14px">
            <p style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Choisissez la classe et la matière concernées : vous pouvez créer des devoirs pour chacune de vos classes affectées.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div class="field">
                <label>Classe</label>
                <select [(ngModel)]="newDevoir.classeId" (ngModelChange)="onNewDevoirClasseChange()" name="classeId" required class="input">
                  <option value="" disabled>Choisir…</option>
                  @for (a of affectations(); track a.classe.id) { <option [value]="a.classe.id">{{ a.classe.nom }}</option> }
                </select>
              </div>
              <div class="field">
                <label>Matière</label>
                <select [(ngModel)]="newDevoir.matiereId" name="matiereId" required class="input">
                  <option value="" disabled>Choisir…</option>
                  @for (m of matieresForNewDevoirClasse(); track m.id) { <option [value]="m.id">{{ m.nom }}</option> }
                </select>
              </div>
            </div>
            <div class="field">
              <label>Titre</label>
              <input type="text" [(ngModel)]="newDevoir.titre" name="titre" placeholder="Titre" required class="input" />
            </div>
            <div class="field">
              <label>Description</label>
              <input type="text" [(ngModel)]="newDevoir.description" name="description" placeholder="Optionnel" class="input" />
            </div>
            <div class="field">
              <label>Date limite</label>
              <input type="datetime-local" [(ngModel)]="newDevoir.dateLimite" name="dateLimite" required class="input" />
            </div>
            <div class="field">
              <label>Points</label>
              <input type="number" min="1" [(ngModel)]="newDevoir.points" name="points" placeholder="Points" class="input" />
            </div>
            <div class="dialog-actions">
              <button type="button" (click)="showCreate.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="saving() || !newDevoir.classeId || !newDevoir.matiereId" class="btn btn-primary">
                @if (saving()) { <span class="material-symbols-outlined" style="font-size:14px">progress_activity</span> } Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Noter la soumission -->
    @if (notingSoumission()) {
      <div class="dialog-backdrop" (click)="cancelNote()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Noter la soumission</h3>
            <button class="btn btn-icon btn-secondary" (click)="cancelNote()"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="submitNote()" style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label>Note /{{ selectedDevoir()?.points }}</label>
              <input type="number" min="0" [max]="selectedDevoir()?.points" [(ngModel)]="noteForm.note" name="note" placeholder="Note" class="input" />
            </div>
            <div class="field">
              <label>Commentaire</label>
              <input type="text" [(ngModel)]="noteForm.commentaire" name="commentaire" placeholder="Optionnel" class="input" />
            </div>
            <div class="dialog-actions">
              <button type="button" (click)="cancelNote()" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="notingSaving()" class="btn btn-primary">
                @if (notingSaving()) { <span class="material-symbols-outlined" style="font-size:14px">progress_activity</span> } Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class DevoirsComponent implements OnInit {
  private devoirService = inject(DevoirService);
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

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

  newDevoir: Partial<CreateDevoirDto> = { classeId: '', matiereId: '', titre: '', description: '', dateLimite: '', points: 20 };

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
    this.loadDevoirs();
  }

  loadDevoirs() {
    if (!this.selectedClasseId || !this.selectedMatiereId) return;
    this.devoirService.findByClasse(this.selectedClasseId, this.selectedMatiereId).subscribe({
      next: (d) => this.devoirs.set(d),
      error: () => this.devoirs.set([]),
    });
  }

  matieresForNewDevoirClasse(): { id: string; nom: string }[] {
    return this.affectations().find((a) => a.classe.id === this.newDevoir.classeId)?.matieres || [];
  }

  onNewDevoirClasseChange() {
    const matieres = this.matieresForNewDevoirClasse();
    this.newDevoir.matiereId = matieres.length > 0 ? matieres[0].id : '';
  }

  openCreate() {
    // Pré-sélectionne la classe/matière actuellement filtrée, mais reste modifiable :
    // un professeur affecté à plusieurs classes doit pouvoir choisir explicitement
    // pour quelle classe/matière il crée ce devoir précis.
    this.newDevoir = {
      classeId: this.selectedClasseId || this.affectations()[0]?.classe.id || '',
      matiereId: '',
      titre: '', description: '', dateLimite: '', points: 20,
    };
    this.onNewDevoirClasseChange();
    if (this.selectedMatiereId && this.newDevoir.classeId === this.selectedClasseId) {
      this.newDevoir.matiereId = this.selectedMatiereId;
    }
    this.showCreate.set(true);
  }

  applyFilters() {
    this.showFilters.set(false);
    this.loadDevoirs();
  }

  create() {
    if (!this.newDevoir.classeId || !this.newDevoir.matiereId) return;
    const dto: CreateDevoirDto = {
      classeId: this.newDevoir.classeId,
      matiereId: this.newDevoir.matiereId,
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
        // On bascule le filtre affiché sur la classe/matière du devoir créé, pour que
        // l'enseignant voie immédiatement le résultat même s'il a créé pour une autre classe.
        this.selectedClasseId = dto.classeId;
        const aff = this.affectations().find((a) => a.classe.id === dto.classeId);
        this.matieresForClasse.set(aff?.matieres || []);
        this.selectedMatiereId = dto.matiereId;
        this.loadDevoirs();
        this.alertService.success('Devoir créé');
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur création';
        this.alertService.error(msg);
      },
    });
  }

  async remove(id: string) {
    const ok = await this.alertService.confirm({
      title: 'Supprimer ce devoir ?',
      text: 'Cette action supprimera le devoir et toutes les notes associées. Cette opération est irréversible.',
      confirmText: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    this.devoirService.remove(id).subscribe({
      next: () => { this.alertService.success('Devoir supprimé'); this.loadDevoirs(); },
      error: (err: any) => {
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur suppression';
        this.alertService.error(msg);
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
        this.alertService.success('Note enregistrée');
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
        this.alertService.error(msg);
      },
    });
  }
}
