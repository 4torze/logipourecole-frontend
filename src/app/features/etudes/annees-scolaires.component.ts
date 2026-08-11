import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnneeScolaireService } from '../../core/services/annee-scolaire.service';
import { AnneeScolaire } from '../../core/models';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-annees-scolaires',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="max-w-[1000px] mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 m-0">Années scolaires</h1>
          <p class="text-sm text-slate-500 mt-1">Gérez les années scolaires de l'établissement</p>
        </div>
        <button (click)="showForm.set(true)" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm">
          <span class="material-symbols-outlined text-lg">add</span> Nouvelle année
        </button>
      </div>

      @if (showForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showForm.set(false)">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-900">Nouvelle année scolaire</h3>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showForm.set(false)"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="p-6 flex flex-col gap-4">
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Libellé</label><input type="text" [(ngModel)]="newAnnee.libelle" placeholder="Ex: 2024-2025" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Date début</label><input type="date" [(ngModel)]="newAnnee.dateDebut" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Date fin</label><input type="date" [(ngModel)]="newAnnee.dateFin" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex gap-3 mt-2">
                <button (click)="create()" [disabled]="saving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-lg">save</span> } Ajouter</button>
                <button (click)="showForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr><th class="px-4 py-3 text-left font-semibold">Libellé</th><th class="px-4 py-3 text-left font-semibold">Début</th><th class="px-4 py-3 text-left font-semibold">Fin</th><th class="px-4 py-3 text-left font-semibold">Statut</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (a of pagedAnnees(); track a.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 font-medium text-slate-900">{{ a.libelle }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ a.dateDebut | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ a.dateFin | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="a.statut === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">{{ a.statut }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="text-center text-slate-400 py-8">Aucune année scolaire enregistrée</td></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="annees().length" (pageChange)="page.set($event)"></app-pagination>
      </div>
    </div>
  `,
})
export class AnneesScolairesComponent implements OnInit {
  private service = inject(AnneeScolaireService);

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
      error: () => alert('Erreur chargement années scolaires'),
    });
  }

  create() {
    this.saving.set(true);
    this.service.create(this.newAnnee).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.newAnnee = { libelle: '', dateDebut: '', dateFin: '' };
        alert('Année scolaire créée');
        this.load();
      },
      error: (err: any) => { this.saving.set(false); alert(err?.error?.message || 'Erreur création'); },
    });
  }
}
