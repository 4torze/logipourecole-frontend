import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { filiereLabel } from '../../core/utils/filiere.util';

@Component({
  selector: 'app-dg-professeurs',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  styles: [`
    .gs-panel { border:1px solid var(--color-divider); display:flex; flex-direction:column; }
    .gs-panel-head { padding:16px 20px; border-bottom:2px solid var(--color-divider); display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
    .gs-panel-body { padding:20px; }
    .gs-stat { border:1px solid var(--color-divider); padding:16px; display:flex; flex-direction:column; gap:6px; }
    .gs-stat-label { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:color-mix(in srgb, var(--color-text) 60%, transparent); }
    .gs-stat-num { font-family:var(--font-heading); font-weight:800; font-size:22px; line-height:1; }
  `],
  template: `
    <div class="page-container" style="display:flex;flex-direction:column;gap:24px">
      <h1 style="margin:0">Professeurs ({{ filteredProfs().length }})</h1>

      <div class="gs-panel">
        <div class="gs-panel-head">
          <div class="field" style="flex:1;min-width:220px;margin:0">
            <div style="position:relative">
              <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">search</span>
              <input type="text" placeholder="Rechercher par nom, prénom ou email..." [ngModel]="search()" (ngModelChange)="search.set($event)" class="input" style="padding-left:34px" />
            </div>
          </div>
          <select [ngModel]="statutFilter()" (ngModelChange)="statutFilter.set($event)" class="input" style="max-width:180px">
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
          </select>
          <select [ngModel]="classeFilter()" (ngModelChange)="classeFilter.set($event)" class="input" style="max-width:200px">
            <option value="">Toutes les classes</option>
            @for (c of classesOptions(); track c) { <option [value]="c">{{ c }}</option> }
          </select>
        </div>

        <div class="gs-panel-body">
          @if (loading()) {
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
              <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
            </div>
          } @else {
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Classes</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  @for (p of pagedProfs(); track p.id) {
                    <tr style="cursor:pointer" (click)="openFiche(p)">
                      <td>{{ p.nom }}</td>
                      <td>{{ p.prenom }}</td>
                      <td>{{ p.email }}</td>
                      <td>{{ p.telephone || '—' }}</td>
                      <td>{{ classesOf(p) || '—' }}</td>
                      <td><span class="tag" [class]="p.statut === 'ACTIF' ? 'tag-success' : 'tag-accent'">{{ p.statut }}</span></td>
                      <td><button (click)="openFiche(p); $event.stopPropagation()" class="btn btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">visibility</span>Voir la fiche</button></td>
                    </tr>
                  } @empty {
                    <tr><td colspan="7" style="text-align:center;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:32px 0">Aucun professeur trouvé</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="filteredProfs().length" (pageChange)="page.set($event)"></app-pagination>
          }
        </div>
      </div>

      @if (fiche(); as f) {
        <div class="dialog-backdrop" style="display:flex;justify-content:flex-end;padding:0" (click)="fiche.set(null)">
          <div style="width:100%;max-width:600px;height:100%;overflow-y:auto;background:var(--color-surface);border-left:1px solid var(--color-divider)" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:2px solid var(--color-divider);position:sticky;top:0;background:var(--color-surface);z-index:1">
              <div>
                <h3 style="margin:0">{{ f.prenom }} {{ f.nom }}</h3>
                <p style="margin:4px 0 0;font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ f.email }} · {{ f.telephone || 'Pas de téléphone' }}</p>
              </div>
              <button class="btn btn-icon btn-secondary" (click)="fiche.set(null)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>

            <div style="padding:24px;display:flex;flex-direction:column;gap:24px">
              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
                <div class="gs-stat"><span class="gs-stat-label">Notes saisies</span><span class="gs-stat-num">{{ f._count?.notesSaisies || 0 }}</span></div>
                <div class="gs-stat"><span class="gs-stat-label">Absences saisies</span><span class="gs-stat-num">{{ f._count?.absencesSaisies || 0 }}</span></div>
              </div>

              <div>
                <h4 style="margin:0 0 10px">Affectations ({{ f.affectations?.length || 0 }})</h4>
                <div style="overflow-x:auto">
                  <table class="table">
                    <thead><tr><th>Classe</th><th>Filière</th><th>Matière</th></tr></thead>
                    <tbody>
                      @for (a of f.affectations; track a.id) {
                        <tr><td>{{ a.classe?.nom }}</td><td>{{ filiereLabel(a.classe) || '—' }}</td><td>{{ a.matiere?.nom }}</td></tr>
                      } @empty { <tr><td colspan="3" style="text-align:center;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:16px 0">Aucune affectation</td></tr> }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DgProfesseursComponent implements OnInit {
  filiereLabel = filiereLabel;
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  profs = signal<any[]>([]);
  loading = signal(true);
  search = signal('');
  statutFilter = signal('');
  classeFilter = signal('');
  page = signal(1);
  pageSize = 10;

  fiche = signal<any>(null);

  classesOf(p: any): string {
    const set = new Set<string>((p.affectations || []).map((a: any) => a.classeId));
    return (p.affectations || [])
      .filter((a: any, i: number, arr: any[]) => arr.findIndex((x) => x.classeId === a.classeId) === i)
      .map((a: any) => a.classe?.nom)
      .filter(Boolean)
      .join(', ');
  }

  classesOptions = computed(() => {
    const set = new Set<string>();
    for (const p of this.profs()) {
      for (const a of p.affectations || []) {
        if (a.classe?.nom) set.add(a.classe.nom);
      }
    }
    return Array.from(set).sort();
  });

  filteredProfs = computed(() => {
    let list = this.profs();
    const s = this.search().toLowerCase().trim();
    if (s) {
      list = list.filter((p) =>
        `${p.nom} ${p.prenom}`.toLowerCase().includes(s) ||
        (p.email || '').toLowerCase().includes(s),
      );
    }
    if (this.statutFilter()) list = list.filter((p) => p.statut === this.statutFilter());
    if (this.classeFilter()) list = list.filter((p) => (p.affectations || []).some((a: any) => a.classe?.nom === this.classeFilter()));
    return list;
  });

  pagedProfs = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredProfs().slice(start, start + this.pageSize);
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/users?role=ENSEIGNANT&limit=1000`).subscribe({
      next: (res) => { this.profs.set(res.data || []); this.loading.set(false); },
      error: () => { this.profs.set([]); this.loading.set(false); this.alertService.error('Erreur lors du chargement des professeurs'); },
    });
  }

  openFiche(p: any) {
    this.http.get<any>(`${environment.apiUrl}/users/${p.id}`).subscribe({
      next: (f) => this.fiche.set(f),
      error: () => this.alertService.error('Erreur lors du chargement de la fiche professeur'),
    });
  }
}
