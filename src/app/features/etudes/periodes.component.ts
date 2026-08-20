import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeriodeService } from '../../core/services/periode.service';
import { AlertService } from '../../core/services/alert.service';
import { Periode } from '../../core/models';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-periodes',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container" style="max-width:1000px">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px">
        <div>
          <h2 style="margin:0 0 4px;font-size:22px">Périodes scolaires</h2>
          <p style="margin:0;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Gérez les semestres et trimestres</p>
        </div>
        <button (click)="showForm.set(true)" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">add</span> Nouvelle période
        </button>
      </div>

      @if (showForm()) {
        <div class="dialog-backdrop" (click)="closeForm()">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">{{ editingId() ? 'Modifier la période' : 'Nouvelle période' }}</span>
              <button class="btn btn-icon btn-secondary" (click)="closeForm()"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div class="field"><label>Libellé</label><input type="text" [(ngModel)]="newPeriode.libelle" placeholder="Ex: Semestre 1" class="input" /></div>
            <div class="field"><label>Type</label><select [(ngModel)]="newPeriode.type" class="input"><option value="SEMESTRE">Semestre</option><option value="TRIMESTRE">Trimestre</option></select></div>
            <div class="field"><label>Date début</label><input type="date" [(ngModel)]="newPeriode.dateDebut" class="input" /></div>
            <div class="field"><label>Date fin</label><input type="date" [(ngModel)]="newPeriode.dateFin" class="input" /></div>
            <div class="dialog-actions">
              <button (click)="closeForm()" class="btn btn-secondary">Annuler</button>
              <button (click)="save()" [disabled]="saving()" class="btn btn-primary">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } {{ editingId() ? 'Enregistrer' : 'Ajouter' }}</button>
            </div>
          </div>
        </div>
      }

      <div class="gs-panel">
        <div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr><th>Libellé</th><th>Type</th><th>Début</th><th>Fin</th><th></th></tr>
              </thead>
              <tbody>
                @for (p of pagedPeriodes(); track p.id) {
                  <tr>
                    <td style="font-weight:600">{{ p.libelle }}</td>
                    <td><span class="tag tag-neutral">{{ p.type }}</span></td>
                    <td>{{ p.dateDebut | date:'dd/MM/yyyy' }}</td>
                    <td>{{ p.dateFin | date:'dd/MM/yyyy' }}</td>
                    <td><button (click)="openEdit(p)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button></td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="table-empty">Aucune période enregistrée</td></tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="periodes().length" (pageChange)="page.set($event)"></app-pagination>
        </div>
      </div>
    </div>
  `,
})
export class PeriodesComponent implements OnInit {
  private service = inject(PeriodeService);
  private alertService = inject(AlertService);

  periodes = signal<Periode[]>([]);
  pageSize = 10;
  page = signal(1);
  pagedPeriodes = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.periodes().slice(start, start + this.pageSize);
  });
  saving = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  newPeriode = { libelle: '', type: 'SEMESTRE', dateDebut: '', dateFin: '' };

  ngOnInit() { this.load(); }

  load() {
    this.service.findAll().subscribe({
      next: (d) => this.periodes.set(d),
      error: () => this.alertService.error('Erreur chargement périodes'),
    });
  }

  openEdit(p: Periode) {
    this.editingId.set(p.id);
    this.newPeriode = {
      libelle: p.libelle,
      type: p.type,
      dateDebut: (p.dateDebut || '').slice(0, 10),
      dateFin: (p.dateFin || '').slice(0, 10),
    };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.newPeriode = { libelle: '', type: 'SEMESTRE', dateDebut: '', dateFin: '' };
  }

  save() {
    this.saving.set(true);
    const editingId = this.editingId();
    const req = editingId ? this.service.update(editingId, this.newPeriode) : this.service.create(this.newPeriode);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.alertService.success(editingId ? 'Période modifiée' : 'Période créée');
        this.closeForm();
        this.load();
      },
      error: (err: any) => { this.saving.set(false); this.alertService.error(err?.error?.message || 'Erreur enregistrement'); },
    });
  }
}
