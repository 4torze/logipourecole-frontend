import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalleService } from '../../core/services/salle.service';
import { Salle } from '../../core/models';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-salles',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="max-w-[1000px] mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 m-0">Salles</h1>
          <p class="text-sm text-slate-500 mt-1">Gérez les salles de l'établissement</p>
        </div>
        <button (click)="showForm.set(true)" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm">
          <span class="material-symbols-outlined text-lg">add</span> Nouvelle salle
        </button>
      </div>

      @if (showForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showForm.set(false)">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-900">Nouvelle salle</h3>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showForm.set(false)"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="p-6 flex flex-col gap-4">
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Nom</label><input type="text" [(ngModel)]="newSalle.nom" placeholder="Ex: Salle A12" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Code</label><input type="text" [(ngModel)]="newSalle.code" placeholder="Ex: A12" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Capacité</label><input type="number" [(ngModel)]="newSalle.capacite" min="1" placeholder="Capacité" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Bâtiment</label><input type="text" [(ngModel)]="newSalle.batiment" placeholder="Bâtiment" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Étage</label><input type="text" [(ngModel)]="newSalle.etage" placeholder="Étage" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
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
              <tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Code</th><th class="px-4 py-3 text-left font-semibold">Capacité</th><th class="px-4 py-3 text-left font-semibold">Bâtiment</th><th class="px-4 py-3 text-left font-semibold">Étage</th><th class="px-4 py-3 text-left font-semibold">Statut</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (s of pagedSalles(); track s.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 font-medium text-slate-900">{{ s.nom }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ s.code || '—' }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ s.capacite }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ s.batiment || '—' }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ s.etage || '—' }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="s.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">{{ s.actif ? 'Active' : 'Inactive' }}</span></td>
                  <td class="px-4 py-3"><div class="flex gap-1"><button (click)="toggle(s)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Activer/Inactiver"><span class="material-symbols-outlined text-lg">swap_horiz</span></button><button (click)="remove(s.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Supprimer"><span class="material-symbols-outlined text-lg">delete</span></button></div></td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center text-slate-400 py-8">Aucune salle enregistrée</td></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="salles().length" (pageChange)="page.set($event)"></app-pagination>
      </div>
    </div>
  `,
})
export class SallesComponent implements OnInit {
  private service = inject(SalleService);

  salles = signal<Salle[]>([]);
  pageSize = 10;
  page = signal(1);
  pagedSalles = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.salles().slice(start, start + this.pageSize);
  });
  saving = signal(false);
  showForm = signal(false);

  newSalle: any = { nom: '', code: '', capacite: 50, batiment: '', etage: '' };

  ngOnInit() { this.load(); }

  load() {
    this.service.findAll().subscribe({
      next: (d) => this.salles.set(d),
      error: () => alert('Erreur chargement salles'),
    });
  }

  create() {
    this.saving.set(true);
    this.service.create(this.newSalle).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.newSalle = { nom: '', code: '', capacite: 50, batiment: '', etage: '' };
        alert('Salle créée');
        this.load();
      },
      error: (err: any) => { this.saving.set(false); alert(err?.error?.message || 'Erreur création'); },
    });
  }

  toggle(s: Salle) {
    this.service.update(s.id, { actif: !s.actif }).subscribe({
      next: () => { alert('Statut mis à jour'); this.load(); },
      error: (err: any) => alert(err?.error?.message || 'Erreur mise à jour'),
    });
  }

  remove(id: string) {
    if (!confirm('Supprimer cette salle ?')) return;
    this.service.remove(id).subscribe({
      next: () => { alert('Salle supprimée'); this.load(); },
      error: (err: any) => alert(err?.error?.message || 'Erreur suppression'),
    });
  }
}
