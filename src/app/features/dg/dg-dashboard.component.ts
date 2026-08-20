import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dg-dashboard',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .gs-stat { border:1px solid var(--color-divider); padding:20px; display:flex; flex-direction:column; gap:8px; }
    .gs-stat-label { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:color-mix(in srgb, var(--color-text) 60%, transparent); }
    .gs-stat-num { font-family:var(--font-heading); font-weight:800; font-size:32px; line-height:1; margin-left:-.03em; }
    .gs-panel { border:1px solid var(--color-divider); display:flex; flex-direction:column; }
    .gs-panel-head { padding:16px 20px; border-bottom:2px solid var(--color-divider); display:flex; align-items:center; justify-content:space-between; }
    .gs-panel-body { padding:20px; }
    .gs-bartrack { height:10px; background:var(--color-neutral-200); position:relative; }
    .gs-barfill { height:10px; background:var(--color-accent); position:absolute; left:0; top:0; }
  `],
  template: `
    <div style="padding:32px;display:flex;flex-direction:column;gap:28px;max-width:1440px;margin:0 auto">
      @if (data()) {

        @if (data()?.alertes?.length > 0) {
          <div style="border:1px solid var(--color-divider);border-left:none;background:var(--color-surface);padding:16px 20px;display:flex;gap:12px;align-items:flex-start">
            <span style="width:8px;height:8px;background:var(--color-accent);margin-top:6px;flex:none"></span>
            <div>
              <p style="font-family:var(--font-heading);font-weight:800;font-size:14px;margin:0 0 4px">{{ data()?.alertes?.length }} alerte(s)</p>
              @for (a of data()?.alertes; track $index) {
                <p style="font-size:13px;margin:0 0 4px;color:color-mix(in srgb, var(--color-text) 78%, transparent)">{{ a.message }}</p>
              }
            </div>
          </div>
        }

        <div>
          <h6 style="margin:0 0 12px">Effectifs &amp; académique</h6>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
            <div class="gs-stat"><span class="gs-stat-label">Étudiants</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ data()?.effectifs?.totalEtudiants || 0 }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Enseignants</span><span class="gs-stat-num">{{ data()?.effectifs?.totalEnseignants || 0 }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Classes</span><span class="gs-stat-num">{{ data()?.effectifs?.totalClasses || 0 }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Filières</span><span class="gs-stat-num">{{ data()?.effectifs?.totalFilieres || 0 }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Recouvrement</span><span class="gs-stat-num">{{ data()?.indicateursFinanciers?.tauxRecouvrement || 0 }}%</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Prospects</span><span class="gs-stat-num">{{ data()?.effectifs?.totalProspects || 0 }}</span></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head">
              <h3 style="margin:0;font-size:16px">Évolution des inscriptions</h3>
              <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ evolution().length }} derniers mois</span>
            </div>
            <div class="gs-panel-body">
              @if (evolution().length > 0) {
                <div style="display:flex;align-items:flex-end;gap:14px;height:160px">
                  @for (m of evolution(); track m.mois; let last = $last) {
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1">
                      <div style="width:100%" [style.height.px]="barHeight(m.count)" [style.background]="last ? 'var(--color-accent)' : 'var(--color-neutral-300)'"></div>
                      <span style="font-size:11px" [style.color]="last ? 'var(--color-accent-700)' : 'color-mix(in srgb, var(--color-text) 55%, transparent)'" [style.font-weight]="last ? 600 : 400">{{ m.mois }}</span>
                    </div>
                  }
                </div>
                <div class="hr" style="margin:16px 0 12px"></div>
                <div style="display:flex;justify-content:space-between;font-size:13px">
                  <span style="color:color-mix(in srgb, var(--color-text) 65%, transparent)">Total sur la période</span>
                  <strong style="font-family:var(--font-heading)">{{ totalInscriptions() }} inscriptions</strong>
                </div>
              } @else {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucune donnée disponible.</p>
              }
            </div>
          </div>

          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Répartition par filière</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:14px">
              @for (f of repartitionFilieres(); track f.filiere) {
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>{{ f.filiere }}</span><strong>{{ f.effectif }} · {{ f.pourcentage }}%</strong></div>
                  <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="f.pourcentage"></div></div>
                </div>
              } @empty {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucune donnée disponible.</p>
              }
              <div class="hr" style="margin:2px 0"></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:color-mix(in srgb, var(--color-text) 65%, transparent)">Total étudiants</span><strong>{{ data()?.effectifs?.totalEtudiants || 0 }}</strong></div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Recouvrement</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de recouvrement</span><strong>{{ data()?.indicateursFinanciers?.tauxRecouvrement || 0 }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="data()?.indicateursFinanciers?.tauxRecouvrement || 0"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Encaissé</span><strong>{{ (data()?.indicateursFinanciers?.encaisse || 0).toLocaleString('fr-FR') }} <span style="font-weight:400">FCFA</span></strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Restant</span><strong style="color:var(--color-accent-700)">{{ (data()?.indicateursFinanciers?.restant || 0).toLocaleString('fr-FR') }} <span style="font-weight:400">FCFA</span></strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Académique</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de réussite</span><strong>{{ data()?.indicateursAcademiques?.tauxReussite || 0 }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="data()?.indicateursAcademiques?.tauxReussite || 0"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Bulletins générés</span><strong>{{ data()?.indicateursAcademiques?.bulletinsGeneres || 0 }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Bulletins validés</span><strong>{{ data()?.indicateursAcademiques?.bulletinsValides || 0 }}</strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Marketing</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de conversion</span><strong>{{ data()?.indicateursMarketing?.tauxConversion || 0 }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="data()?.indicateursMarketing?.tauxConversion || 0"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Prospects</span><strong>{{ data()?.indicateursMarketing?.total || 0 }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Inscrits</span><strong>{{ data()?.indicateursMarketing?.inscrits || 0 }}</strong></div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Top 5 classes par effectif</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:14px">
              @for (c of topClasses(); track c.classe) {
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>{{ c.classe }} <span style="color:color-mix(in srgb, var(--color-text) 55%, transparent)">· {{ c.filiere }}</span></span><strong>{{ c.effectif }}/{{ c.capaciteMax }}</strong></div>
                  <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="c.tauxRemplissage"></div></div>
                </div>
              } @empty {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucune donnée disponible.</p>
              }
            </div>
          </div>

          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="goTo('/dg/finance')">Tableau financier</button>
              <button class="btn btn-secondary btn-block" (click)="goTo('/dg/utilisateurs')">Gérer les utilisateurs</button>
              <button class="btn btn-secondary btn-block" (click)="goTo('/templates')">Template système</button>
              <div class="hr"></div>
              <button class="btn btn-secondary btn-block" (click)="exportData('etudiants/csv')">Exporter étudiants (CSV)</button>
              <button class="btn btn-secondary btn-block" (click)="exportData('tableau-financier/pdf')">Exporter tableau financier (PDF)</button>
            </div>
          </div>
        </div>

      } @else {
        <div style="text-align:center;padding:80px 0">
          <span class="material-symbols-outlined" style="font-size:48px;color:var(--color-neutral-400)">progress_activity</span>
          <p style="color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-top:16px">Chargement du tableau de bord...</p>
        </div>
      }
    </div>
  `,
})
export class DgDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  data = signal<any>(null);

  evolution = computed(() => this.data()?.evolutionInscriptions || []);
  totalInscriptions = computed(() => this.evolution().reduce((sum: number, m: any) => sum + m.count, 0));
  maxEvolutionCount = computed(() => Math.max(1, ...this.evolution().map((m: any) => m.count)));

  topClasses = computed(() => (this.data()?.topClasses || []).slice(0, 5));

  repartitionFilieres = computed(() => {
    const rows = this.data()?.repartitionFilieres || [];
    const total = rows.reduce((sum: number, f: any) => sum + f.effectif, 0) || 1;
    return rows.map((f: any) => ({ ...f, pourcentage: Math.round((f.effectif / total) * 100) }));
  });

  ngOnInit() { this.loadDashboard(); }

  loadDashboard() {
    this.http.get<any>(`${environment.apiUrl}/dg/dashboard`).subscribe({
      next: (d) => this.data.set(d),
      error: () => this.data.set(null),
    });
  }

  barHeight(count: number): number {
    return Math.max(6, Math.round((count / this.maxEvolutionCount()) * 160));
  }

  goTo(route: string) { this.router.navigate([route]); }
  exportData(endpoint: string) { window.open(`${environment.apiUrl}/exports/${endpoint}`, '_blank'); }
}
