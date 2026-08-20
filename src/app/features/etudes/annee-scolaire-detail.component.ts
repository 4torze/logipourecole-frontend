import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { BreadcrumbComponent } from '../../shared/ui/breadcrumb.component';

@Component({
  selector: 'app-annee-scolaire-detail',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="breadcrumbItems()"></app-breadcrumb>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
          <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
        </div>
      }
      @if (!loading() && annee(); as a) {
        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-body" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
            <div>
              <h2 style="margin:0">{{ a.libelle }}</h2>
              <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ a.dateDebut | date:'dd/MM/yyyy' }} — {{ a.dateFin | date:'dd/MM/yyyy' }}</p>
            </div>
            <span class="tag" [class]="a.statut === 'active' ? 'tag-success' : 'tag-neutral'">{{ a.statut }}</span>
          </div>
        </div>

        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Trimestres / Semestres</h3></div>
          <div class="gs-panel-body">
            @if (periodes().length > 0) {
              <div style="display:flex;flex-direction:column;gap:8px">
                @for (p of periodes(); track p.id) {
                  <button (click)="selectPeriode(p.id)" class="btn btn-secondary" style="justify-content:space-between;text-align:left;padding:14px 16px" [class.btn-primary]="selectedPeriodeId() === p.id">
                    <span>{{ p.libelle }} <span class="text-muted" style="font-size:12px">({{ p.type }})</span></span>
                    <span class="material-symbols-outlined" style="font-size:18px">chevron_right</span>
                  </button>
                }
              </div>
            } @else {
              <div class="table-empty">Aucune période enregistrée</div>
            }
          </div>
        </div>

        @if (selectedPeriodeId()) {
          <div class="gs-panel" style="margin-top:20px">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Activités de la période</h3></div>
            <div class="gs-panel-body">
              @if (loadingActivites()) {
                <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:20px 0">
                  <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
                </div>
              } @else {
                <h4 style="margin:0 0 10px">Devoirs ({{ activites()?.devoirs?.length || 0 }})</h4>
                <div class="table-scroll" style="margin-bottom:24px">
                  <table class="table">
                    <thead><tr><th>Titre</th><th>Classe</th><th>Matière</th><th>Enseignant</th><th>Date limite</th></tr></thead>
                    <tbody>
                      @for (d of activites()?.devoirs || []; track d.id) {
                        <tr><td style="font-weight:600">{{ d.titre }}</td><td>{{ d.classe?.nom }}</td><td>{{ d.matiere?.nom }}</td><td>{{ d.enseignant?.nom }} {{ d.enseignant?.prenom }}</td><td>{{ d.dateLimite | date:'dd/MM/yyyy' }}</td></tr>
                      } @empty {
                        <tr><td colspan="5" class="table-empty">Aucun devoir sur cette période</td></tr>
                      }
                    </tbody>
                  </table>
                </div>

                <h4 style="margin:0 0 10px">Programme des enseignants ({{ activites()?.chapitres?.length || 0 }})</h4>
                <div class="table-scroll">
                  <table class="table">
                    <thead><tr><th>Chapitre</th><th>Classe</th><th>Matière</th><th>Enseignant</th></tr></thead>
                    <tbody>
                      @for (c of activites()?.chapitres || []; track c.id) {
                        <tr><td style="font-weight:600">{{ c.titre }}</td><td>{{ c.classe?.nom }}</td><td>{{ c.matiere?.nom }}</td><td>{{ c.enseignant?.nom }} {{ c.enseignant?.prenom }}</td></tr>
                      } @empty {
                        <tr><td colspan="4" class="table-empty">Aucun chapitre enregistré sur cette période</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class AnneeScolaireDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);

  anneeId = '';
  annee = signal<any>(null);
  periodes = signal<any[]>([]);
  loading = signal(true);

  selectedPeriodeId = signal<string>('');
  activites = signal<{ devoirs: any[]; chapitres: any[] } | null>(null);
  loadingActivites = signal(false);

  breadcrumbItems = computed(() => {
    const items: { label: string; route?: any[] }[] = [{ label: 'Années scolaires', route: ['/etudes/annees-scolaires'] }];
    const a = this.annee();
    if (!a) { items.push({ label: '...' }); return items; }
    const periodeId = this.selectedPeriodeId();
    const periode = periodeId ? this.periodes().find((p) => p.id === periodeId) : null;
    items.push({ label: a.libelle, route: periode ? ['/etudes/annees-scolaires', this.anneeId] : undefined });
    if (periode) items.push({ label: periode.libelle });
    return items;
  });

  ngOnInit() {
    this.anneeId = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/etudes/annees-scolaires`).subscribe({
      next: (annees) => {
        this.annee.set(annees.find((a) => a.id === this.anneeId) || null);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.alertService.error('Erreur lors du chargement de l\'année scolaire'); },
    });
    this.http.get<any[]>(`${environment.apiUrl}/etudes/periodes`).subscribe({
      next: (d) => this.periodes.set(d),
      error: () => this.periodes.set([]),
    });
  }

  selectPeriode(periodeId: string) {
    this.selectedPeriodeId.set(periodeId);
    this.loadingActivites.set(true);
    this.http.get<{ devoirs: any[]; chapitres: any[] }>(`${environment.apiUrl}/programme/activites/${periodeId}`).subscribe({
      next: (d) => { this.activites.set(d); this.loadingActivites.set(false); },
      error: () => { this.activites.set({ devoirs: [], chapitres: [] }); this.loadingActivites.set(false); },
    });
  }
}
