import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-dg-finance',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="page-container">
      <h1 style="margin-bottom:24px">Finance de l'établissement</h1>

      @if (loading()) {
        <div class="flex items-center gap-2 text-sm text-muted py-10"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement...</div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div class="gs-stat">
            <span class="gs-stat-label">Taux recouvrement</span>
            <span class="gs-stat-num" style="color:var(--color-accent)">{{ perf().tauxRecouvrement | number:'1.0-1' }}%</span>
          </div>
          <div class="gs-stat">
            <span class="gs-stat-label">Encaissé</span>
            <span class="gs-stat-num" style="color:var(--color-accent)">{{ perf().montantTotalEncaisse | number:'1.0-0':'fr-FR' }}</span>
          </div>
          <div class="gs-stat">
            <span class="gs-stat-label">Restant à recouvrer</span>
            <span class="gs-stat-num" style="color:var(--color-accent)">{{ perf().montantTotalRestant | number:'1.0-0':'fr-FR' }}</span>
          </div>
          <div class="gs-stat">
            <span class="gs-stat-label">Élèves en règle</span>
            <span class="gs-stat-num" style="color:var(--color-accent)">{{ perf().effectifEnRegle }}</span>
          </div>
          <div class="gs-stat">
            <span class="gs-stat-label">Élèves en retard</span>
            <span class="gs-stat-num" style="color:var(--color-accent)">{{ perf().effectifQuiDoivent }}</span>
          </div>
        </div>

        <!-- Charts -->
        <div style="display:grid;grid-template-columns:3fr 2fr;gap:20px;margin-bottom:16px">
          <div class="gs-panel">
            <div class="gs-panel-head">
              <h3 style="margin:0;font-size:16px">Évolution des paiements</h3>
              <div style="display:flex;gap:4px">
                @for (g of groupByOptions; track g.key) {
                  <button (click)="changeGroupBy(g.key)" class="btn btn-sm" [class.btn-primary]="groupBy() === g.key" [class.btn-secondary]="groupBy() !== g.key">{{ g.label }}</button>
                }
              </div>
            </div>
            <div class="gs-panel-body">
              @if (evolutionLoading()) {
                <div style="height:200px;display:flex;align-items:center;justify-content:center;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)"><span class="material-symbols-outlined animate-spin" style="font-size:18px;margin-right:8px">progress_activity</span> Chargement...</div>
              } @else if (paiementsChart().points.length > 0) {
                <svg viewBox="0 0 500 220" style="width:100%;height:auto" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="grad-dg-fin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.25"/>
                      <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <line x1="30" y1="30" x2="470" y2="30" stroke="var(--color-neutral-200)" stroke-width="1"/>
                  <line x1="30" y1="110" x2="470" y2="110" stroke="var(--color-neutral-200)" stroke-width="1"/>
                  <line x1="30" y1="190" x2="470" y2="190" stroke="var(--color-neutral-300)" stroke-width="1"/>
                  @if (paiementsChart().areaPath) {
                    <path [attr.d]="paiementsChart().areaPath" fill="url(#grad-dg-fin)"/>
                  }
                  @if (paiementsChart().linePath) {
                    <path [attr.d]="paiementsChart().linePath" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  }
                  @for (p of paiementsChart().points; track $index) {
                    <circle [attr.cx]="p.x" [attr.cy]="p.y" r="4" fill="var(--color-surface)" stroke="var(--color-accent)" stroke-width="2.5"/>
                    <text [attr.x]="p.x" [attr.y]="p.y - 12" text-anchor="middle" font-size="9" fill="var(--color-text)" font-weight="600">{{ p.montant | number:'1.0-0':'fr-FR' }}</text>
                    <text [attr.x]="p.x" y="210" text-anchor="middle" font-size="10" fill="color-mix(in srgb, var(--color-text) 55%, transparent)">{{ p.label }}</text>
                  }
                </svg>
              } @else {
                <div style="height:200px;display:flex;align-items:center;justify-content:center;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Aucun paiement enregistré</div>
              }
            </div>
          </div>

          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Taux de recouvrement</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;align-items:center;gap:16px">
              <div style="position:relative;flex:none">
                <svg width="150" height="150" viewBox="0 0 36 36" style="transform:rotate(-90deg)">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-neutral-200)" stroke-width="3.5"/>
                  <circle cx="18" cy="18" r="15.915" fill="none" [attr.stroke]="perf().tauxRecouvrement >= 75 ? 'var(--color-accent)' : (perf().tauxRecouvrement >= 50 ? 'var(--color-accent-2)' : 'var(--color-accent-700)')" stroke-width="3.5" [attr.stroke-dasharray]="perf().tauxRecouvrement + ' ' + (100 - perf().tauxRecouvrement)" stroke-linecap="round" style="transition: stroke-dasharray 0.5s;"/>
                </svg>
                <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                  <span style="font-size:24px;font-weight:800;font-family:var(--font-heading)">{{ perf().tauxRecouvrement | number:'1.0-0' }}%</span>
                  <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">recouvré</span>
                </div>
              </div>
              <div style="width:100%;font-size:13px;display:flex;justify-content:space-between"><span style="color:color-mix(in srgb, var(--color-text) 65%, transparent)">Total attendu</span><strong style="font-family:var(--font-heading)">{{ perf().montantTotalEncaisser | number:'1.0-0':'fr-FR' }}</strong></div>
            </div>
          </div>
        </div>

        <!-- Recent payments -->
        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:18px">Paiements récents ({{ paiementsTotal() }})</h3></div>
          <div class="gs-panel-body">
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>Date</th><th>Élève</th><th>Classe</th><th>Montant</th><th>Mode</th><th>Reçu</th></tr>
                </thead>
                <tbody>
                  @for (p of paiementsRecents(); track p.id) {
                    <tr>
                      <td>{{ p.datePaiement | date:'dd/MM/yyyy' }}</td>
                      <td style="font-weight:600">{{ p.etudiant?.prenom }} {{ p.etudiant?.nom }}</td>
                      <td>{{ p.etudiant?.inscriptions?.[0]?.classe?.nom || '—' }}</td>
                      <td style="font-weight:600">{{ p.montant | number:'1.0-0':'fr-FR' }} FCFA</td>
                      <td><span class="tag tag-neutral">{{ p.mode }}</span></td>
                      <td style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ p.numeroRecu }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="table-empty">Aucun paiement enregistré</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pagination [page]="paiementsPage()" [pageSize]="paiementsPageSize" [totalItems]="paiementsTotal()" (pageChange)="changePaiementsPage($event)"></app-pagination>
          </div>
        </div>
      }
    </div>
  `,
})
export class DgFinanceComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  loading = signal(true);
  perf = signal<any>({});

  groupByOptions: { key: 'semaine' | 'mois' | 'annee'; label: string }[] = [
    { key: 'semaine', label: 'Semaine' },
    { key: 'mois', label: 'Mois' },
    { key: 'annee', label: 'Année' },
  ];
  groupBy = signal<'semaine' | 'mois' | 'annee'>('mois');
  evolutionLoading = signal(false);
  evolutionPaiements = signal<any[]>([]);

  paiementsRecents = signal<any[]>([]);
  paiementsPage = signal(1);
  paiementsTotal = signal(0);
  paiementsPageSize = 10;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    Promise.all([
      this.http.get<any>(`${environment.apiUrl}/daf/performance`).toPromise(),
      this.http.get<any[]>(`${environment.apiUrl}/daf/paiements/evolution`, { params: { groupBy: this.groupBy() }}).toPromise(),
      this.http.get<any>(`${environment.apiUrl}/daf/paiements/recents`, { params: { page: this.paiementsPage(), limit: this.paiementsPageSize }}).toPromise(),
    ]).then(([perf, evolution, recents]) => {
      this.perf.set(perf || {});
      this.evolutionPaiements.set(evolution || []);
      this.paiementsRecents.set(recents?.data || []);
      this.paiementsTotal.set(recents?.total || 0);
      this.loading.set(false);
    }).catch(() => {
      this.loading.set(false);
      this.alertService.error('Erreur lors du chargement des données financières');
    });
  }

  changeGroupBy(key: 'semaine' | 'mois' | 'annee') {
    if (this.groupBy() === key) return;
    this.groupBy.set(key);
    this.evolutionLoading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/daf/paiements/evolution`, { params: { groupBy: key }}).subscribe({
      next: (res) => { this.evolutionPaiements.set(res || []); this.evolutionLoading.set(false); },
      error: () => { this.evolutionLoading.set(false); this.alertService.error("Erreur lors du chargement de l'évolution des paiements"); },
    });
  }

  changePaiementsPage(page: number) {
    this.paiementsPage.set(page);
    this.http.get<any>(`${environment.apiUrl}/daf/paiements/recents`, { params: { page, limit: this.paiementsPageSize }}).subscribe({
      next: (res) => { this.paiementsRecents.set(res.data || []); this.paiementsTotal.set(res.total || 0); },
      error: () => this.alertService.error('Erreur lors du chargement des paiements'),
    });
  }

  paiementsChart = computed(() => {
    const data = this.evolutionPaiements();
    const width = 500;
    const height = 220;
    const padding = 30;
    const topMargin = 16; // place pour l'étiquette de valeur au-dessus des points
    const chartHeight = height - padding * 2 - topMargin;

    if (!data.length) return { points: [] as { x: number; y: number; label: string; montant: number }[], linePath: '', areaPath: '' };

    const max = Math.max(...data.map((d: any) => d.montant || 0), 1);

    let points: { x: number; y: number; label: string; montant: number }[];
    if (data.length === 1) {
      // Un seul point : le centrer plutôt que de le coller au bord gauche (sinon quasi invisible).
      const y = height - padding - (data[0].montant / max) * chartHeight;
      points = [{ x: width / 2, y, label: data[0].label, montant: data[0].montant }];
    } else {
      const stepX = (width - padding * 2) / (data.length - 1);
      points = data.map((d: any, i: number) => ({
        x: padding + i * stepX,
        y: height - padding - (d.montant / max) * chartHeight,
        label: d.label,
        montant: d.montant,
      }));
    }

    let linePath = '';
    let areaPath = '';
    if (points.length > 1) {
      linePath = `M ${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const cx = (p0.x + p1.x) / 2;
        linePath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
      }
      areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;
    }

    return { points, linePath, areaPath };
  });
}
