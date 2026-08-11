import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-dsi-affectations',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-bold text-lg text-slate-900">Affectations enseignants</h3>
        <button (click)="showForm.set(true)" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm">
          <span class="material-symbols-outlined text-xl">add</span> Affecter un enseignant
        </button>
      </div>
      <div class="overflow-x-auto rounded-lg border border-slate-200">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr><th class="px-4 py-3 text-left font-semibold">Enseignant</th><th class="px-4 py-3 text-left font-semibold">Classe</th><th class="px-4 py-3 text-left font-semibold">Matière</th><th class="px-4 py-3 text-left font-semibold">Année</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            @for (a of pagedAffectations(); track a.id) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 text-slate-700">{{ a.enseignant?.prenom }} {{ a.enseignant?.nom }}</td>
                <td class="px-4 py-3 text-slate-600">{{ a.classe?.nom }}</td>
                <td class="px-4 py-3 text-slate-600">{{ a.matiere?.nom }}</td>
                <td class="px-4 py-3 text-slate-600">{{ a.anneeScolaire?.libelle }}</td>
                <td class="px-4 py-3"><button (click)="remove(a.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-red-500"><span class="material-symbols-outlined text-lg">delete</span></button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [page]="affectationPage()" [pageSize]="pageSize" [totalItems]="affectations().length" (pageChange)="affectationPage.set($event)"></app-pagination>
    </div>

    @if (showForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showForm.set(false)">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-900">Affecter un enseignant</h3>
            <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showForm.set(false)"><span class="material-symbols-outlined">close</span></button>
          </div>
          <div class="p-6 space-y-4">
            <select [(ngModel)]="form.enseignantId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Enseignant</option>@for (e of enseignants(); track e.id) { <option [value]="e.id">{{ e.prenom }} {{ e.nom }}</option> }</select>
            <select [(ngModel)]="form.classeId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Classe</option>@for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }} ({{ c.filiere?.nom || '' }})</option> }</select>
            <select [(ngModel)]="form.matiereId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Matière</option>@for (m of matieres(); track m.id) { <option [value]="m.id">{{ m.nom }} ({{ m.code }})</option> }</select>
            <div class="flex gap-3">
              <button (click)="assigner()" [disabled]="saving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">
                @if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-xl">add</span> }
                Affecter
              </button>
              <button (click)="showForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class DsiAffectationsComponent implements OnInit {
  private http = inject(HttpClient);

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
        error: () => alert('Erreur chargement enseignants'),
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
      alert('Veuillez sélectionner un enseignant, une classe et une matière');
      return;
    }
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/etudes/affectations`, { enseignantId, classeId, matiereId })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          alert('Affectation enregistrée');
          this.form = { enseignantId: '', classeId: '', matiereId: '' };
          this.loadAffectations();
        },
        error: (err) => {
          this.saving.set(false);
          alert(err.error?.message || 'Erreur affectation');
        },
      });
  }

  remove(id: string) {
    this.http.delete(`${environment.apiUrl}/etudes/affectations/${id}`)
      .subscribe({
        next: () => { this.loadAffectations(); },
        error: (err) => alert(err.error?.message || 'Erreur suppression'),
      });
  }
}
