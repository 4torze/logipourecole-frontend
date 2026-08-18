import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnneeScolaireService } from '../../core/services/annee-scolaire.service';
import { AlertService } from '../../core/services/alert.service';
import { AnneeScolaire } from '../../core/models';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-annees-scolaires',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container" style="max-width:1000px">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px">
        <div>
          <h2 style="margin:0 0 4px;font-size:22px">Années scolaires</h2>
          <p style="margin:0;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Gérez les années scolaires de l'établissement</p>
        </div>
        <button (click)="showForm.set(true)" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">add</span> Nouvelle année
        </button>
      </div>

      @if (showForm()) {
        <div class="dialog-backdrop" (click)="showForm.set(false)">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">Nouvelle année scolaire</span>
              <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div class="field"><label>Libellé</label><input type="text" [(ngModel)]="newAnnee.libelle" placeholder="Ex: 2024-2025" class="input" /></div>
            <div class="field"><label>Date début</label><input type="date" [(ngModel)]="newAnnee.dateDebut" class="input" /></div>
            <div class="field"><label>Date fin</label><input type="date" [(ngModel)]="newAnnee.dateFin" class="input" /></div>
            <div class="dialog-actions">
              <button (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button (click)="create()" [disabled]="saving()" class="btn btn-primary">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } Ajouter</button>
            </div>
          </div>
        </div>
      }

      <div class="gs-panel">
        <div class="gs-panel-body">
          <div style="overflow-x:auto">
            <table class="table">
              <thead>
                <tr><th>Libellé</th><th>Début</th><th>Fin</th><th>Statut</th></tr>
              </thead>
              <tbody>
                @for (a of pagedAnnees(); track a.id) {
                  <tr>
                    <td style="font-weight:600">{{ a.libelle }}</td>
                    <td>{{ a.dateDebut | date:'dd/MM/yyyy' }}</td>
                    <td>{{ a.dateFin | date:'dd/MM/yyyy' }}</td>
                    <td><span class="tag" [class]="a.statut === 'active' ? 'tag-success' : 'tag-neutral'">{{ a.statut }}</span></td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="table-empty">Aucune année scolaire enregistrée</td></tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="annees().length" (pageChange)="page.set($event)"></app-pagination>
        </div>
      </div>
    </div>
  `,
})
export class AnneesScolairesComponent implements OnInit {
  private service = inject(AnneeScolaireService);
  private alertService = inject(AlertService);

  annees = signal<AnneeScolaire[]>([]);
  pageSize = 10;
  page = signal(1);
  pagedAnnees = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.annees().slice(start, start + this.pageSize);
  });
  saving = signal(false);
  showForm = signal(false);

  newAnnee = { libelle: '', dateDebut: '', dateFin: '' };

  ngOnInit() { this.load(); }

  load() {
    this.service.findAll().subscribe({
      next: (d) => this.annees.set(d),
      error: () => this.alertService.error('Erreur chargement années scolaires'),
    });
  }

  create() {
    this.saving.set(true);
    this.service.create(this.newAnnee).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.newAnnee = { libelle: '', dateDebut: '', dateFin: '' };
        this.alertService.success('Année scolaire créée');
        this.load();
      },
      error: (err: any) => { this.saving.set(false); this.alertService.error(err?.error?.message || 'Erreur création'); },
    });
  }
}
