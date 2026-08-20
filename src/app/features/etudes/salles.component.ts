import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalleService } from '../../core/services/salle.service';
import { AlertService } from '../../core/services/alert.service';
import { Salle } from '../../core/models';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-salles',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container" style="max-width:1000px">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px">
        <div>
          <h2 style="margin:0 0 4px;font-size:22px">Salles</h2>
          <p style="margin:0;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Gérez les salles de l'établissement</p>
        </div>
        <button (click)="showForm.set(true)" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">add</span> Nouvelle salle
        </button>
      </div>

      @if (showForm()) {
        <div class="dialog-backdrop" (click)="showForm.set(false)">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">Nouvelle salle</span>
              <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div class="field"><label>Nom</label><input type="text" [(ngModel)]="newSalle.nom" placeholder="Ex: Salle A12" class="input" /></div>
            <div class="field"><label>Code</label><input type="text" [(ngModel)]="newSalle.code" placeholder="Ex: A12" class="input" /></div>
            <div class="field"><label>Capacité</label><input type="number" [(ngModel)]="newSalle.capacite" min="1" placeholder="Capacité" class="input" /></div>
            <div class="field"><label>Bâtiment</label><input type="text" [(ngModel)]="newSalle.batiment" placeholder="Bâtiment" class="input" /></div>
            <div class="field"><label>Étage</label><input type="text" [(ngModel)]="newSalle.etage" placeholder="Étage" class="input" /></div>
            <div class="dialog-actions">
              <button (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button (click)="create()" [disabled]="saving()" class="btn btn-primary">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } Ajouter</button>
            </div>
          </div>
        </div>
      }

      @if (showEdit()) {
        <div class="dialog-backdrop" (click)="showEdit.set(false)">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">Modifier la salle</span>
              <button class="btn btn-icon btn-secondary" (click)="showEdit.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div class="field"><label>Nom</label><input type="text" [(ngModel)]="editSalle.nom" placeholder="Ex: Salle A12" class="input" /></div>
            <div class="field"><label>Code</label><input type="text" [(ngModel)]="editSalle.code" placeholder="Ex: A12" class="input" /></div>
            <div class="field"><label>Capacité</label><input type="number" [(ngModel)]="editSalle.capacite" min="1" placeholder="Capacité" class="input" /></div>
            <div class="field"><label>Bâtiment</label><input type="text" [(ngModel)]="editSalle.batiment" placeholder="Bâtiment" class="input" /></div>
            <div class="field"><label>Étage</label><input type="text" [(ngModel)]="editSalle.etage" placeholder="Étage" class="input" /></div>
            <div class="dialog-actions">
              <button (click)="showEdit.set(false)" class="btn btn-secondary">Annuler</button>
              <button (click)="saveEdit()" [disabled]="editSaving()" class="btn btn-primary">@if (editSaving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } Enregistrer</button>
            </div>
          </div>
        </div>
      }

      <div class="gs-panel">
        <div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr><th>Nom</th><th>Code</th><th>Capacité</th><th>Bâtiment</th><th>Étage</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                @for (s of pagedSalles(); track s.id) {
                  <tr>
                    <td style="font-weight:600">{{ s.nom }}</td>
                    <td>{{ s.code || '—' }}</td>
                    <td>{{ s.capacite }}</td>
                    <td>{{ s.batiment || '—' }}</td>
                    <td>{{ s.etage || '—' }}</td>
                    <td><span class="tag" [class]="s.actif ? 'tag-success' : 'tag-danger'">{{ s.actif ? 'Active' : 'Inactive' }}</span></td>
                    <td><div style="display:flex;gap:4px"><button (click)="openEdit(s)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button><button (click)="toggle(s)" class="btn btn-icon btn-secondary" title="Activer/Inactiver"><span class="material-symbols-outlined" style="font-size:18px">swap_horiz</span></button><button (click)="remove(s.id)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></div></td>
                  </tr>
                } @empty {
                  <tr><td colspan="7" class="table-empty">Aucune salle enregistrée</td></tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="salles().length" (pageChange)="page.set($event)"></app-pagination>
        </div>
      </div>
    </div>
  `,
})
export class SallesComponent implements OnInit {
  private service = inject(SalleService);
  private alertService = inject(AlertService);

  salles = signal<Salle[]>([]);
  pageSize = 10;
  page = signal(1);
  pagedSalles = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.salles().slice(start, start + this.pageSize);
  });
  saving = signal(false);
  showForm = signal(false);
  showEdit = signal(false);
  editSaving = signal(false);

  newSalle: any = { nom: '', code: '', capacite: 50, batiment: '', etage: '' };
  editSalle: any = { id: '', nom: '', code: '', capacite: 50, batiment: '', etage: '' };

  ngOnInit() { this.load(); }

  load() {
    this.service.findAll().subscribe({
      next: (d) => this.salles.set(d),
      error: () => this.alertService.error('Erreur chargement salles'),
    });
  }

  create() {
    this.saving.set(true);
    this.service.create(this.newSalle).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.newSalle = { nom: '', code: '', capacite: 50, batiment: '', etage: '' };
        this.alertService.success('Salle créée');
        this.load();
      },
      error: (err: any) => { this.saving.set(false); this.alertService.error(err?.error?.message || 'Erreur création'); },
    });
  }

  openEdit(s: Salle) {
    this.editSalle = { id: s.id, nom: s.nom, code: s.code || '', capacite: s.capacite, batiment: s.batiment || '', etage: s.etage || '' };
    this.showEdit.set(true);
  }

  saveEdit() {
    this.editSaving.set(true);
    const { id, ...dto } = this.editSalle;
    this.service.update(id, dto).subscribe({
      next: () => {
        this.editSaving.set(false);
        this.showEdit.set(false);
        this.alertService.success('Salle modifiée');
        this.load();
      },
      error: (err: any) => { this.editSaving.set(false); this.alertService.error(err?.error?.message || 'Erreur lors de la modification'); },
    });
  }

  toggle(s: Salle) {
    this.service.update(s.id, { actif: !s.actif }).subscribe({
      next: () => { this.alertService.success('Statut mis à jour'); this.load(); },
      error: (err: any) => this.alertService.error(err?.error?.message || 'Erreur mise à jour'),
    });
  }

  async remove(id: string) {
    const ok = await this.alertService.confirm({ title: 'Supprimer cette salle ?', confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.service.remove(id).subscribe({
      next: () => { this.alertService.success('Salle supprimée'); this.load(); },
      error: (err: any) => this.alertService.error(err?.error?.message || 'Erreur suppression'),
    });
  }
}
