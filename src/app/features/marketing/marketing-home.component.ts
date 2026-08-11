import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-marketing-home',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzTableModule, NzStatisticModule, NzGridModule, NzTagModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Direction Marketing</h1>

      <div nz-row [nzGutter]="[16, 16]" style="margin-bottom: 24px;">
        <div nz-col [nzXs]="12" [nzSm]="8" [nzMd]="4"><nz-card><nz-statistic nzTitle="Total prospects" [nzValue]="perf()?.totalProspects || 0"></nz-statistic></nz-card></div>
        <div nz-col [nzXs]="12" [nzSm]="8" [nzMd]="4"><nz-card><nz-statistic nzTitle="Taux conversion" [nzValue]="perf()?.tauxConversion || 0" nzSuffix="%" [nzValueStyle]="{ color: '#059669' }"></nz-statistic></nz-card></div>
        <div nz-col [nzXs]="12" [nzSm]="8" [nzMd]="4"><nz-card><nz-statistic nzTitle="Inscrits" [nzValue]="perf()?.prospectsInscrits || 0"></nz-statistic></nz-card></div>
        <div nz-col [nzXs]="12" [nzSm]="8" [nzMd]="4"><nz-card><nz-statistic nzTitle="Perdus" [nzValue]="perf()?.prospectsPerdus || 0" [nzValueStyle]="{ color: '#dc2626' }"></nz-statistic></nz-card></div>
        <div nz-col [nzXs]="12" [nzSm]="8" [nzMd]="4"><nz-card><nz-statistic nzTitle="Personnel actif" [nzValue]="perf()?.personnelActif || 0"></nz-statistic></nz-card></div>
      </div>

      <nz-card style="margin-bottom: 24px;" nzTitle="Évolution des prospects (6 derniers mois)">
        @if (perf()?.evolution?.length > 0) {
          <div style="display:flex; gap:16px; align-items:flex-end; height:200px; padding:0 20px;">
            @for (m of perf()?.evolution; track m.mois) {
              <div style="flex:1; text-align:center;">
                <div style="display:flex; flex-direction:column; gap:2px; height:180px; justify-content:flex-end;">
                  <div style="background:#059669; height:{{ (m.inscrits / maxEvolution()) * 100 }}%; min-height:2px; border-radius:4px 4px 0 0;" title="Inscrits: {{ m.inscrits }}"></div>
                  <div style="background:#bfdbfe; height:{{ ((m.total - m.inscrits) / maxEvolution()) * 100 }}%; min-height:2px; border-radius:0 0 4px 4px;" title="Total: {{ m.total }}"></div>
                </div>
                <small style="color:#6b7280;">{{ m.mois }}</small>
              </div>
            }
          </div>
          <div style="display:flex; gap:24px; justify-content:center; margin-top:12px;">
            <span><span style="display:inline-block; width:12px; height:12px; background:#059669; border-radius:2px; margin-right:4px;"></span>Inscrits</span>
            <span><span style="display:inline-block; width:12px; height:12px; background:#bfdbfe; border-radius:2px; margin-right:4px;"></span>Prospects (non convertis)</span>
          </div>
        }
      </nz-card>

      <nz-card style="margin-bottom: 24px;" nzTitle="Conversion par canal">
        <nz-table #canalTable [nzData]="conversionParCanal()" [nzPageSize]="20" nzSize="small">
          <thead><tr><th>Canal</th><th>Total</th><th>Inscrits</th><th>Taux</th></tr></thead>
          <tbody>
            @for (c of canalTable.data; track c.canal) {
              <tr><td>{{ c.canal }}</td><td>{{ c.total }}</td><td>{{ c.inscrits }}</td><td><strong>{{ c.taux }}%</strong></td></tr>
            }
          </tbody>
        </nz-table>
      </nz-card>

      <nz-card nzTitle="Personnel marketing">
        <nz-table #persTable [nzData]="personnel()" [nzPageSize]="20" nzSize="small">
          <thead><tr><th>Nom</th><th>Prénom</th><th>Poste</th><th>Contact</th><th>Performance</th><th>Statut</th></tr></thead>
          <tbody>
            @for (p of persTable.data; track p.id) {
              <tr><td>{{ p.nom }}</td><td>{{ p.prenom }}</td><td>{{ p.poste || '—' }}</td><td>{{ p.contact1 }}</td>
                <td>
                  @if (p.notePerformance) {
                    <span [style.color]="p.notePerformance >= 7 ? '#059669' : (p.notePerformance >= 5 ? '#f59e0b' : '#dc2626')">{{ p.notePerformance }}/10</span>
                  } @else { '—' }
                </td>
                <td><nz-tag [nzColor]="p.statut === 'actif' ? 'success' : 'error'">{{ p.statut }}</nz-tag></td></tr>
            }
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `,
})
export class MarketingHomeComponent implements OnInit {
  private http = inject(HttpClient);

  perf = signal<any>(null);
  conversionParCanal = signal<any[]>([]);
  personnel = signal<any[]>([]);

  ngOnInit() { this.loadPerf(); this.loadConversion(); this.loadPersonnel(); }

  maxEvolution() { const evo = this.perf()?.evolution || []; return Math.max(...evo.map((m: any) => m.total), 1); }

  loadPerf() { this.http.get<any>(`${environment.apiUrl}/marketing/performance`).subscribe({ next: (d) => this.perf.set(d), error: () => this.perf.set(null) }); }
  loadConversion() { this.http.get<any[]>(`${environment.apiUrl}/marketing/conversion-par-canal`).subscribe({ next: (d) => this.conversionParCanal.set(d), error: () => this.conversionParCanal.set([]) }); }
  loadPersonnel() { this.http.get<any[]>(`${environment.apiUrl}/marketing/personnel`).subscribe({ next: (d) => this.personnel.set(d), error: () => this.personnel.set([]) }); }
}
