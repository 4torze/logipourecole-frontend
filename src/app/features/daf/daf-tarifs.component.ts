import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-daf-tarifs',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-bold text-lg text-slate-900">Grilles tarifaires ({{ grilles().length }})</h3>
        <button (click)="showForm.set(true)" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm">
          <span class="material-symbols-outlined text-xl">add</span> Fixer un montant
        </button>
      </div>

      @if (showForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showForm.set(false)">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-900">Nouveau tarif</h3>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showForm.set(false)"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="p-6 grid grid-cols-3 gap-4">
              <select [(ngModel)]="newGrille.classeId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm col-span-3"><option value="">Classe</option>@for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }} ({{ c.filiere?.nom || '' }})</option> }</select>
              <select [(ngModel)]="newGrille.anneeScolaireId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm col-span-3"><option value="">Année scolaire</option>@for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }}</option> }</select>
              <input type="number" placeholder="Montant total (FCFA)" [(ngModel)]="newGrille.montantTotal" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm col-span-3" />
              <div class="col-span-3 flex gap-3"><button (click)="createGrille()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">Créer</button><button (click)="showForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
            </div>
          </div>
        </div>
      }

      <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Classe</th><th class="px-4 py-3 text-left font-semibold">Filière</th><th class="px-4 py-3 text-left font-semibold">Année</th><th class="px-4 py-3 text-left font-semibold">Montant total (FCFA)</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
          <tbody class="divide-y divide-slate-50">
            @for (g of pagedGrilles(); track g.id) {
              <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-700">{{ g.classe?.nom }}</td><td class="px-4 py-3 text-slate-600">{{ g.classe?.filiere?.nom }}</td><td class="px-4 py-3 text-slate-600">{{ g.anneeScolaire?.libelle }}</td><td class="px-4 py-3 font-semibold text-slate-900">{{ g.montantTotal?.toLocaleString('fr-FR') }}</td>
                <td class="px-4 py-3"><button (click)="confirmDeleteGrille(g.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-red-500"><span class="material-symbols-outlined text-lg">delete</span></button></td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="text-center text-slate-400 py-8">Aucune grille tarifaire enregistrée</td></tr>
            }
          </tbody></table>
        </div>
        <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="grilles().length" (pageChange)="page.set($event)"></app-pagination>
      </div>
    </div>
  `,
})
export class DafTarifsComponent implements OnInit {
  private http = inject(HttpClient);

  classes = signal<any[]>([]);
  annees = signal<any[]>([]);
  grilles = signal<any[]>([]);
  showForm = signal(false);
  newGrille: any = { classeId: '', anneeScolaireId: '', montantTotal: 0 };

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

  createGrille() {
    if (!this.newGrille.classeId || !this.newGrille.anneeScolaireId || !this.newGrille.montantTotal) {
      alert('Classe, année et montant requis');
      return;
    }
    this.http.post(`${environment.apiUrl}/dsi/grilles-tarifaires`, { ...this.newGrille, montantTotal: +this.newGrille.montantTotal }).subscribe({
      next: () => {
        this.loadGrilles();
        this.showForm.set(false);
        this.newGrille = { classeId: '', anneeScolaireId: '', montantTotal: 0 };
      },
      error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  confirmDeleteGrille(id: string) {
    if (confirm('Supprimer ?')) this.deleteGrille(id);
  }

  deleteGrille(id: string) {
    this.http.delete(`${environment.apiUrl}/dsi/grilles-tarifaires/${id}`).subscribe({
      next: () => this.loadGrilles(),
      error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')),
    });
  }
}
