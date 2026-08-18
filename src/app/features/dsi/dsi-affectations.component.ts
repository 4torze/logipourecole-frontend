import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../core/services/alert.service';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { filiereLabel } from '../../core/utils/filiere.util';

@Component({
  selector: 'app-dsi-affectations',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="gs-panel"><div class="gs-panel-body">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="margin:0">Affectations enseignants</h3>
        <button (click)="showForm.set(true)" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">add</span> Affecter un enseignant
        </button>
      </div>
      <div style="overflow-x:auto">
        <table class="table">
          <thead>
            <tr><th>Enseignant</th><th>Classe</th><th>Matière</th><th>Année</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (a of pagedAffectations(); track a.id) {
              <tr>
                <td>{{ a.enseignant?.prenom }} {{ a.enseignant?.nom }}</td>
                <td>{{ a.classe?.nom }}</td>
                <td>{{ a.matiere?.nom }}</td>
                <td>{{ a.anneeScolaire?.libelle }}</td>
                <td><button (click)="remove(a.id)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="table-empty">Aucune affectation enregistrée</td></tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [page]="affectationPage()" [pageSize]="pageSize" [totalItems]="affectations().length" (pageChange)="affectationPage.set($event)"></app-pagination>
    </div></div>

    @if (showForm()) {
      <div class="dialog-backdrop" (click)="showForm.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span class="dialog-title">Affecter un enseignant</span>
            <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div class="field"><label>Enseignant</label><select [(ngModel)]="form.enseignantId" class="input"><option value="">Enseignant</option>@for (e of enseignants(); track e.id) { <option [value]="e.id">{{ e.prenom }} {{ e.nom }}</option> }</select></div>
          <div class="field"><label>Classe</label><select [(ngModel)]="form.classeId" class="input"><option value="">Classe</option>@for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }} ({{ filiereLabel(c) }})</option> }</select></div>
          <div class="field"><label>Matière</label><select [(ngModel)]="form.matiereId" class="input"><option value="">Matière</option>@for (m of matieres(); track m.id) { <option [value]="m.id">{{ m.nom }} ({{ m.code }})</option> }</select></div>
          <div class="dialog-actions">
            <button (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
            <button (click)="assigner()" [disabled]="saving()" class="btn btn-primary">
              @if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">add</span> }
              Affecter
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DsiAffectationsComponent implements OnInit {
  filiereLabel = filiereLabel;
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  enseignants = signal<any[]>([]);
  classes = signal<any[]>([]);
  matieres = signal<any[]>([]);
  affectations = signal<any[]>([]);
  pageSize = 10;
  affectationPage = signal(1);
  pagedAffectations = computed(() => {
    const start = (this.affectationPage() - 1) * this.pageSize;
    return this.affectations().slice(start, start + this.pageSize);
  });
  saving = signal(false);
  showForm = signal(false);

  form = { enseignantId: '', classeId: '', matiereId: '' };

  ngOnInit() {
    this.loadEnseignants();
    this.loadClasses();
    this.loadMatieres();
    this.loadAffectations();
  }

  loadEnseignants() {
    this.http.get<any>(`${environment.apiUrl}/users?limit=1000`)
      .subscribe({
        next: (res) => this.enseignants.set((res.data || []).filter((u: any) => u.role === 'ENSEIGNANT' && u.statut === 'ACTIF')),
        error: () => this.alertService.error('Erreur chargement enseignants'),
      });
  }

  loadClasses() {
    this.http.get<any[]>(`${environment.apiUrl}/dsi/classes`)
      .subscribe({ next: (d) => this.classes.set(d), error: () => this.classes.set([]) });
  }

  loadMatieres() {
    this.http.get<any[]>(`${environment.apiUrl}/dsi/matieres`)
      .subscribe({ next: (d) => this.matieres.set(d), error: () => this.matieres.set([]) });
  }

  loadAffectations() {
    this.http.get<any[]>(`${environment.apiUrl}/etudes/affectations`)
      .subscribe({ next: (d) => this.affectations.set(d), error: () => this.affectations.set([]) });
  }

  assigner() {
    const { enseignantId, classeId, matiereId } = this.form;
    if (!enseignantId || !classeId || !matiereId) {
      this.alertService.error('Veuillez sélectionner un enseignant, une classe et une matière');
      return;
    }
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/etudes/affectations`, { enseignantId, classeId, matiereId })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.alertService.success('Affectation enregistrée');
          this.form = { enseignantId: '', classeId: '', matiereId: '' };
          this.loadAffectations();
        },
        error: (err) => {
          this.saving.set(false);
          this.alertService.error(err.error?.message || 'Erreur affectation');
        },
      });
  }

  async remove(id: string) {
    const ok = await this.alertService.confirm({ title: 'Supprimer cette affectation ?', confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/etudes/affectations/${id}`)
      .subscribe({
        next: () => { this.loadAffectations(); },
        error: (err) => this.alertService.error(err.error?.message || 'Erreur suppression'),
      });
  }
}
