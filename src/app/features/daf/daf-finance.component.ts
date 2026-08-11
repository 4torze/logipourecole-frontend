import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-daf-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="max-w-[1440px] mx-auto">
      <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-lg text-slate-900">Tableau financier</h3>
          <button (click)="relanceGroupee()" [disabled]="relanceLoading()" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50">
            <span class="material-symbols-outlined text-lg">sms</span> Relance SMS groupée
          </button>
        </div>

        <div class="flex gap-2.5 mb-4 flex-wrap">
          <select [(ngModel)]="filters.classeId" (ngModelChange)="onFilterChange()" class="flex-1 min-w-[140px] h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Toutes les classes</option>@for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select>
          <select [(ngModel)]="filters.anneeScolaireId" (ngModelChange)="onFilterChange()" class="flex-1 min-w-[140px] h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Année scolaire</option>@for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }}</option> }</select>
          <select [(ngModel)]="filters.statutPaiement" (ngModelChange)="onFilterChange()" class="flex-1 min-w-[140px] h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Statut paiement</option><option value="solde">Soldé (à jour)</option><option value="retard">En retard</option></select>
          <select [(ngModel)]="filters.versementId" (ngModelChange)="onFilterChange()" class="flex-1 min-w-[140px] h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Tous les versements</option>@for (v of versements(); track v.id) { <option [value]="v.id">{{ v.ordre }} — {{ v.libelle }}</option> }</select>
          <input type="text" [(ngModel)]="filters.search" (ngModelChange)="onSearchChange($event)" placeholder="Rechercher par nom ou téléphone..." class="flex-[2] min-w-[220px] h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
        </div>

        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr><th class="px-4 py-3 text-left font-semibold">Étudiant</th><th class="px-4 py-3 text-left font-semibold">Classe</th><th class="px-4 py-3 text-right font-semibold">Montant total</th><th class="px-4 py-3 text-right font-semibold">Payé</th><th class="px-4 py-3 text-right font-semibold">Reste</th><th class="px-4 py-3 text-left font-semibold">Statut</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (row of tableauFinancier(); track row.etudiantId) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 font-medium text-slate-900">{{ row.nom }} {{ row.prenom }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ row.classeNom || row.niveau || '-' }}</td>
                  <td class="px-4 py-3 text-right tabular-nums text-slate-700">{{ row.montantTotal?.toLocaleString('fr-FR') }}</td>
                  <td class="px-4 py-3 text-right tabular-nums text-emerald-600 font-medium">{{ row.totalPaye?.toLocaleString('fr-FR') }}</td>
                  <td class="px-4 py-3 text-right tabular-nums text-red-600 font-medium">{{ row.reste?.toLocaleString('fr-FR') }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold" [class]="row.statut === 'À jour' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'"><span class="w-1.5 h-1.5 rounded-full" [class]="row.statut === 'À jour' ? 'bg-emerald-600' : 'bg-red-600'"></span>{{ row.statut }}</span></td>
                  <td class="px-4 py-3"><div class="flex gap-1"><button (click)="openPaiementsDrawer(row)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Voir les paiements"><span class="material-symbols-outlined text-lg">visibility</span></button>@if (row.statut !== 'À jour') { <button (click)="relanceEtudiant(row.etudiantId)" [disabled]="relanceId() === row.etudiantId" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50" title="Relance SMS"><span class="material-symbols-outlined text-lg">notifications_active</span></button> }</div></td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center text-slate-400 py-8">@if (tableLoading()) { Chargement... } @else { Aucun étudiant trouvé. Vérifiez qu'une année scolaire est active et qu'il y a des inscriptions. }</td></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="tablePage()" [pageSize]="tablePageSize" [totalItems]="tableTotal()" (pageChange)="onTablePageChange($event)"></app-pagination>
      </div>
    </div>

    @if (drawerVisible()) {
      <div class="fixed inset-0 z-50 flex justify-end bg-black/40" (click)="drawerVisible.set(false)">
        <div class="bg-white w-full max-w-[640px] h-full overflow-y-auto shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-900">{{ drawerTitle() }}</h3>
            <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="drawerVisible.set(false)"><span class="material-symbols-outlined">close</span></button>
          </div>
          <div class="p-6">
            @if (selectedRow()) {
              <div class="flex gap-6 mb-5 p-4 bg-slate-50 rounded-lg">
                <div class="flex flex-col"><span class="text-xs text-slate-500 mb-1">Montant total</span><span class="text-lg font-semibold text-slate-900">{{ selectedRow().montantTotal?.toLocaleString('fr-FR') }} FCFA</span></div>
                <div class="flex flex-col"><span class="text-xs text-slate-500 mb-1">Payé</span><span class="text-lg font-semibold text-emerald-600">{{ selectedRow().totalPaye?.toLocaleString('fr-FR') }} FCFA</span></div>
                <div class="flex flex-col"><span class="text-xs text-slate-500 mb-1">Reste</span><span class="text-lg font-semibold text-red-600">{{ selectedRow().reste?.toLocaleString('fr-FR') }} FCFA</span></div>
              </div>
              <div class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">N° Reçu</th><th class="px-4 py-3 text-left font-semibold">Versement</th><th class="px-4 py-3 text-left font-semibold">Date</th><th class="px-4 py-3 text-right font-semibold">Montant</th><th class="px-4 py-3 text-left font-semibold">Reçu</th></tr></thead>
                  <tbody class="divide-y divide-slate-50">
                    @for (p of selectedRow().versements || []; track p.id) {
                      <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-xs text-slate-500">{{ p.recu || p.numeroRecu || '-' }}</td><td class="px-4 py-3 text-slate-700">V{{ p.versement }}</td><td class="px-4 py-3 text-xs text-slate-600">{{ p.date | date:'dd/MM/yyyy' }}</td><td class="px-4 py-3 text-right font-medium text-slate-900">{{ p.montant?.toLocaleString('fr-FR') }} FCFA</td><td class="px-4 py-3"><button (click)="downloadRecu(p)" class="flex items-center gap-1.5 h-8 px-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-xs" title="Télécharger le reçu"><span class="material-symbols-outlined text-base">download</span></button></td></tr>
                    } @empty {
                      <tr><td colspan="5" class="text-center text-slate-400 py-6">Aucun paiement enregistré pour cet étudiant.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class DafFinanceComponent implements OnInit {
  private http = inject(HttpClient);

  tableauFinancier = signal<any[]>([]);
  tableLoading = signal(false);
  tablePage = signal(1);
  tableTotal = signal(0);
  tablePageSize = 20;
  classes = signal<any[]>([]);
  annees = signal<any[]>([]);
  versements = signal<any[]>([]);
  relanceLoading = signal(false);
  relanceId = signal<string | null>(null);
  drawerVisible = signal(false);
  selectedRow = signal<any>(null);

  drawerTitle = computed(() => {
    const r = this.selectedRow();
    return r ? `Paiements de ${r.prenom} ${r.nom}` : 'Paiements';
  });

  filters: any = { classeId: null, anneeScolaireId: null, statutPaiement: null, versementId: null, search: '' };
  private searchTimeout: any = null;

  ngOnInit() {
    this.loadTableau();
    this.loadClasses();
    this.loadAnnees();
    this.loadVersements();
  }

  loadVersements() {
    this.http.get<any>(`${environment.apiUrl}/daf/versements`).subscribe({
      next: (d) => this.versements.set(d || []),
      error: () => this.versements.set([]),
    });
  }

  loadTableau() {
    this.tableLoading.set(true);
    const params: string[] = [`page=${this.tablePage()}`, `limit=${this.tablePageSize}`];
    if (this.filters.classeId) params.push(`classeId=${this.filters.classeId}`);
    if (this.filters.anneeScolaireId) params.push(`anneeScolaireId=${this.filters.anneeScolaireId}`);
    if (this.filters.statutPaiement) params.push(`statutPaiement=${this.filters.statutPaiement}`);
    if (this.filters.versementId) params.push(`versementId=${this.filters.versementId}`);
    if (this.filters.search) params.push(`search=${encodeURIComponent(this.filters.search)}`);
    const qs = `?${params.join('&')}`;
    this.http.get<any>(`${environment.apiUrl}/daf/tableau-financier${qs}`).subscribe({
      next: (res) => { this.tableauFinancier.set(res.data || []); this.tableTotal.set(res.total || 0); this.tableLoading.set(false); },
      error: () => { this.tableauFinancier.set([]); this.tableTotal.set(0); this.tableLoading.set(false); },
    });
  }

  onTablePageChange(page: number) {
    this.tablePage.set(page);
    this.loadTableau();
  }

  onFilterChange() {
    this.tablePage.set(1);
    this.loadTableau();
  }

  loadClasses() {
    this.http.get<any>(`${environment.apiUrl}/daf/classes`).subscribe({
      next: (d) => this.classes.set(d || []),
      error: () => this.classes.set([]),
    });
  }

  loadAnnees() {
    this.http.get<any>(`${environment.apiUrl}/daf/annees-scolaires`).subscribe({
      next: (d) => this.annees.set(d || []),
      error: () => this.annees.set([]),
    });
  }

  onSearchChange(value: string) {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.tablePage.set(1); this.loadTableau(); }, 400);
  }

  openPaiementsDrawer(row: any) {
    this.selectedRow.set(row);
    this.drawerVisible.set(true);
  }

  downloadRecu(v: any) {
    if (!v?.id) return;
    this.http.get(`${environment.apiUrl}/daf/paiements/recu/${v.id}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-${v.numeroRecu || v.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => alert('Erreur lors du téléchargement du reçu'),
    });
  }

  relanceEtudiant(etudiantId: string) {
    this.relanceId.set(etudiantId);
    this.http.post<any>(`${environment.apiUrl}/daf/relance-sms`, { etudiantId }).subscribe({
      next: (res) => { this.relanceId.set(null); alert(res.message || 'Relance envoyée'); },
      error: (err) => { this.relanceId.set(null); alert(err.error?.message || 'Erreur relance'); },
    });
  }

  relanceGroupee() {
    this.relanceLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/daf/relance-groupee`, {}).subscribe({
      next: (res) => { this.relanceLoading.set(false); alert(res.message || 'Relances envoyées'); },
      error: (err) => { this.relanceLoading.set(false); alert(err.error?.message || 'Erreur relance groupée'); },
    });
  }
}
