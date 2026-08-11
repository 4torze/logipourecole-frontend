import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dg-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1 class="text-2xl font-bold text-slate-900 mb-6">Tableau de Bord — Direction Générale</h1>

      @if (data()) {
        @if (data()?.alertes?.length > 0) {
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
            <span class="material-symbols-outlined text-amber-600 text-xl mt-0.5">warning</span>
            <div>
              <p class="font-semibold text-amber-900 text-sm mb-2">Alertes ({{ data()?.alertes?.length }})</p>
              @for (a of data()?.alertes; track $index) {
                <div class="flex items-center gap-2 py-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" [class]="a.severity === 'high' ? 'bg-red-100 text-red-700' : (a.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')">{{ a.type }}</span>
                  <span class="text-sm text-slate-700">{{ a.message }}</span>
                </div>
              }
            </div>
          </div>
        }

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs text-slate-500 font-medium mb-1">Étudiants</p><p class="text-2xl font-bold text-slate-900">{{ data()?.effectifs?.totalEtudiants || 0 }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs text-slate-500 font-medium mb-1">Enseignants</p><p class="text-2xl font-bold text-slate-900">{{ data()?.effectifs?.totalEnseignants || 0 }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs text-slate-500 font-medium mb-1">Classes</p><p class="text-2xl font-bold text-slate-900">{{ data()?.effectifs?.totalClasses || 0 }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs text-slate-500 font-medium mb-1">Filières</p><p class="text-2xl font-bold text-slate-900">{{ data()?.effectifs?.totalFilieres || 0 }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs text-slate-500 font-medium mb-1">Prospects</p><p class="text-2xl font-bold text-slate-900">{{ data()?.effectifs?.totalProspects || 0 }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs text-slate-500 font-medium mb-1">Abandons</p><p class="text-2xl font-bold text-red-600">{{ data()?.effectifs?.totalEtudiantsAbandons || 0 }}</p></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h3 class="font-bold text-slate-900 mb-4">Indicateurs financiers</h3>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between text-sm"><span class="text-slate-600">Taux de recouvrement</span><strong class="text-emerald-600">{{ data()?.indicateursFinanciers?.tauxRecouvrement }}%</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">Encaissé</span><strong class="text-slate-900">{{ data()?.indicateursFinanciers?.encaisse?.toLocaleString('fr-FR') }} FCFA</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">Restant</span><strong class="text-red-600">{{ data()?.indicateursFinanciers?.restant?.toLocaleString('fr-FR') }} FCFA</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">En règle</span><strong class="text-emerald-600">{{ data()?.indicateursFinanciers?.enRegle }}</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">En retard</span><strong class="text-red-600">{{ data()?.indicateursFinanciers?.enRetard }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h3 class="font-bold text-slate-900 mb-4">Indicateurs académiques</h3>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between text-sm"><span class="text-slate-600">Notes saisies</span><strong class="text-slate-900">{{ data()?.indicateursAcademiques?.moyennesSaisies }}</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">Bulletins générés</span><strong class="text-slate-900">{{ data()?.indicateursAcademiques?.bulletinsGeneres }}</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">Bulletins validés</span><strong class="text-slate-900">{{ data()?.indicateursAcademiques?.bulletinsValides }}</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">Taux de réussite</span><strong class="text-emerald-600">{{ data()?.indicateursAcademiques?.tauxReussite }}%</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h3 class="font-bold text-slate-900 mb-4">Indicateurs marketing</h3>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between text-sm"><span class="text-slate-600">Total prospects</span><strong class="text-slate-900">{{ data()?.indicateursMarketing?.total }}</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">Inscrits</span><strong class="text-emerald-600">{{ data()?.indicateursMarketing?.inscrits }}</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">Perdus</span><strong class="text-red-600">{{ data()?.indicateursMarketing?.perdus }}</strong></div>
              <div class="flex justify-between text-sm"><span class="text-slate-600">Taux de conversion</span><strong class="text-slate-900">{{ data()?.indicateursMarketing?.tauxConversion }}%</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h3 class="font-bold text-slate-900 mb-4">Top 5 classes par effectif</h3>
            @for (c of data()?.topClasses; track c.classe) {
              <div class="flex justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
                <span class="text-slate-700">{{ c.classe }} <span class="text-xs text-slate-400">({{ c.filiere }})</span></span>
                <strong class="text-slate-900">{{ c.effectif }}/{{ c.capaciteMax }}</strong>
              </div>
            }
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6 mt-4">
          <h3 class="font-bold text-slate-900 mb-4">Répartition par filière</h3>
          <div class="flex gap-6 flex-wrap">
            @for (f of data()?.repartitionFilieres; track f.filiere) {
              <div class="text-center min-w-[120px]">
                <div class="text-3xl font-bold text-primary">{{ f.effectif }}</div>
                <div class="text-sm text-slate-500">{{ f.filiere }}</div>
              </div>
            }
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6 mt-4">
          <h3 class="font-bold text-slate-900 mb-4">Exports rapides</h3>
          <div class="flex gap-3 flex-wrap">
            <button (click)="exportData('etudiants/csv')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">download</span> Étudiants (CSV)</button>
            <button (click)="exportData('paiements/csv')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">download</span> Paiements (CSV)</button>
            <button (click)="exportData('prospects/csv')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">download</span> Prospects (CSV)</button>
            <button (click)="exportData('tableau-financier/pdf')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">picture_as_pdf</span> Tableau financier (PDF)</button>
            <button (click)="exportData('liste-etudiants/pdf')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">picture_as_pdf</span> Liste étudiants (PDF)</button>
          </div>
        </div>
      } @else {
        <div class="text-center py-20">
          <span class="material-symbols-outlined text-5xl text-slate-300 animate-spin">progress_activity</span>
          <p class="text-slate-400 mt-4">Chargement du tableau de bord...</p>
        </div>
      }
    </div>
  `,
})
export class DgDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  data = signal<any>(null);

  ngOnInit() { this.loadDashboard(); }

  loadDashboard() {
    this.http.get<any>(`${environment.apiUrl}/dg/dashboard`).subscribe({
      next: (d) => this.data.set(d),
      error: () => this.data.set(null),
    });
  }

  exportData(endpoint: string) { window.open(`${environment.apiUrl}/exports/${endpoint}`, '_blank'); }
}
