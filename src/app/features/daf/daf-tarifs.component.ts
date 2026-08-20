import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { filiereLabel } from '../../core/utils/filiere.util';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-daf-tarifs',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h3 style="margin:0">Grilles tarifaires ({{ grilles().length }})</h3>
        <button (click)="openCreate()" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">add</span> Fixer un montant
        </button>
      </div>

      @if (showForm()) {
        <div class="dialog-backdrop" (click)="showForm.set(false)">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div class="dialog-title" style="display:flex;align-items:center;justify-content:space-between">
              Nouveau tarif
              <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div class="field">
              <label>Classe</label>
              <select [(ngModel)]="newGrille.classeId" class="input">
                <option value="">Classe</option>
                @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }} ({{ filiereLabel(c) }})</option> }
              </select>
            </div>
            <div class="field">
              <label>Année scolaire</label>
              <select [(ngModel)]="newGrille.anneeScolaireId" class="input">
                <option value="">Année scolaire</option>
                @for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }}</option> }
              </select>
            </div>
            <div class="field">
              <label>Montant total (FCFA)</label>
              <input type="number" placeholder="Montant total (FCFA)" [(ngModel)]="newGrille.montantTotal" class="input" />
            </div>
            <div class="dialog-actions">
              <button (click)="createGrille()" class="btn btn-primary">Créer</button>
              <button (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
            </div>
          </div>
        </div>
      }

      @if (showEditForm(); as g) {
        <div class="dialog-backdrop" (click)="showEditForm.set(null)">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div class="dialog-title" style="display:flex;align-items:center;justify-content:space-between">
              Modifier le tarif
              <button class="btn btn-icon btn-secondary" (click)="showEditForm.set(null)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div class="gs-well">
              <div style="font-weight:600">{{ g.classe?.nom }} ({{ filiereLabel(g.classe) }})</div>
              <div style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-top:2px">{{ g.anneeScolaire?.libelle }}</div>
            </div>
            <div class="field">
              <label>Montant total (FCFA)</label>
              <input type="number" placeholder="Montant total (FCFA)" [(ngModel)]="editMontant" class="input" />
            </div>
            <div class="dialog-actions">
              <button (click)="updateGrille()" [disabled]="editSaving()" class="btn btn-primary">
                @if (editSaving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> }
                Enregistrer
              </button>
              <button (click)="showEditForm.set(null)" class="btn btn-secondary">Annuler</button>
            </div>
          </div>
        </div>
      }

      <div class="gs-panel"><div class="gs-panel-body">
        <div class="table-scroll">
          <table class="table"><thead><tr><th>Classe</th><th>Filière</th><th>Année</th><th>Montant total (FCFA)</th><th>Actions</th></tr></thead>
          <tbody>
            @for (g of pagedGrilles(); track g.id) {
              <tr><td>{{ g.classe?.nom }}</td><td>{{ filiereLabel(g.classe) }}</td><td>{{ g.anneeScolaire?.libelle }}</td><td style="font-weight:600">{{ g.montantTotal?.toLocaleString('fr-FR') }}</td>
                <td><div style="display:flex;gap:4px"><button (click)="openEdit(g)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button><button (click)="confirmDeleteGrille(g)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></div></td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="table-empty">Aucune grille tarifaire enregistrée</td></tr>
            }
          </tbody></table>
        </div>
        <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="grilles().length" (pageChange)="page.set($event)"></app-pagination>
      </div></div>
    </div>
  `,
})
export class DafTarifsComponent implements OnInit {
  filiereLabel = filiereLabel;
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  classes = signal<any[]>([]);
  annees = signal<any[]>([]);
  grilles = signal<any[]>([]);
  showForm = signal(false);
  newGrille: any = { classeId: '', anneeScolaireId: '', montantTotal: 0 };

  showEditForm = signal<any | null>(null);
  editSaving = signal(false);
  editMontant: number = 0;

  pageSize = 10;
  page = signal(1);
  pagedGrilles = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.grilles().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.loadClasses();
    this.loadAnnees();
    this.loadGrilles();
  }

  loadClasses() {
    this.http.get<any[]>(`${environment.apiUrl}/daf/classes`).subscribe({
      next: (d) => this.classes.set(d || []),
      error: () => this.classes.set([]),
    });
  }

  loadAnnees() {
    this.http.get<any[]>(`${environment.apiUrl}/daf/annees-scolaires`).subscribe({
      next: (d) => this.annees.set(d || []),
      error: () => this.annees.set([]),
    });
  }

  loadGrilles() {
    this.http.get<any[]>(`${environment.apiUrl}/dsi/grilles-tarifaires`).subscribe({
      next: (d) => this.grilles.set(d || []),
      error: () => this.grilles.set([]),
    });
  }

  openCreate() {
    this.newGrille = { classeId: '', anneeScolaireId: '', montantTotal: 0 };
    this.showForm.set(true);
  }

  createGrille() {
    if (!this.newGrille.classeId || !this.newGrille.anneeScolaireId || !this.newGrille.montantTotal) {
      this.alertService.error('Classe, année et montant requis');
      return;
    }
    this.http.post(`${environment.apiUrl}/dsi/grilles-tarifaires`, { ...this.newGrille, montantTotal: +this.newGrille.montantTotal }).subscribe({
      next: () => {
        this.alertService.success('Grille tarifaire créée');
        this.loadGrilles();
        this.showForm.set(false);
      },
      error: (e) => this.alertService.error(e.error?.message || 'Erreur lors de la création'),
    });
  }

  openEdit(g: any) {
    this.editMontant = g.montantTotal;
    this.showEditForm.set(g);
  }

  updateGrille() {
    const g = this.showEditForm();
    if (!g) return;
    if (!this.editMontant || this.editMontant <= 0) {
      this.alertService.error('Le montant doit être supérieur à 0');
      return;
    }
    this.editSaving.set(true);
    this.http.patch(`${environment.apiUrl}/dsi/grilles-tarifaires/${g.id}`, { montantTotal: +this.editMontant }).subscribe({
      next: () => {
        this.editSaving.set(false);
        this.alertService.success('Tarif mis à jour');
        this.showEditForm.set(null);
        this.loadGrilles();
      },
      error: (e) => {
        this.editSaving.set(false);
        this.alertService.error(e.error?.message || 'Erreur lors de la mise à jour');
      },
    });
  }

  async confirmDeleteGrille(g: any) {
    const ok = await this.alertService.confirm({
      title: 'Supprimer cette grille tarifaire ?',
      html: `Le tarif de <strong>${g.classe?.nom || ''}</strong> pour <strong>${g.anneeScolaire?.libelle || ''}</strong> sera définitivement supprimé.`,
      confirmText: 'Supprimer',
      danger: true,
    });
    if (ok) this.deleteGrille(g.id);
  }

  deleteGrille(id: string) {
    this.http.delete(`${environment.apiUrl}/dsi/grilles-tarifaires/${id}`).subscribe({
      next: () => { this.alertService.success('Grille tarifaire supprimée'); this.loadGrilles(); },
      error: (e) => this.alertService.error(e.error?.message || 'Erreur lors de la suppression'),
    });
  }
}
