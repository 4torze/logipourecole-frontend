import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { AnneeScolaireService } from '../../core/services/annee-scolaire.service';

@Component({
  selector: 'app-dg-eleves',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  styles: [`
    .gs-stat { border:1px solid var(--color-divider); padding:16px; display:flex; flex-direction:column; gap:6px; }
    .gs-stat-label { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:color-mix(in srgb, var(--color-text) 60%, transparent); }
    .gs-stat-num { font-family:var(--font-heading); font-weight:800; font-size:22px; line-height:1; }
  `],
  template: `
    <div class="page-container" style="display:flex;flex-direction:column;gap:24px">
      <h1 style="margin:0">Élèves ({{ filteredEleves().length }})</h1>

      <div class="gs-panel">
        <div class="gs-panel-head">
          <div class="field" style="flex:1;min-width:220px;margin:0">
            <div style="position:relative">
              <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">search</span>
              <input type="text" placeholder="Rechercher par nom, prénom, email ou téléphone..." [ngModel]="search()" (ngModelChange)="search.set($event)" class="input" style="padding-left:34px" />
            </div>
          </div>
          <select [ngModel]="statutFilter()" (ngModelChange)="statutFilter.set($event)" class="input" style="max-width:180px">
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="TRANSFERE">Transféré</option>
            <option value="ABANDON">Abandon</option>
            <option value="REDOUBLANT">Redoublant</option>
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
            <div class="table-scroll">
              <table class="table">
                <thead>
                  <tr><th>Nom</th><th>Prénom</th><th>Classe</th><th>Téléphone</th><th>Statut</th><th>Année en cours</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  @for (e of pagedEleves(); track e.id) {
                    <tr style="cursor:pointer" (click)="openFiche(e)">
                      <td>{{ e.nom }}</td>
                      <td>{{ e.prenom }}</td>
                      <td>
                        @if (classeIdOf(e)) {
                          <a (click)="$event.stopPropagation(); openClasse(classeIdOf(e))" style="color:var(--color-accent);cursor:pointer;text-decoration:underline">{{ classeOf(e) }}</a>
                        } @else { — }
                      </td>
                      <td>{{ e.telephone || '—' }}</td>
                      <td><span class="tag" [class]="e.statut === 'ACTIF' ? 'tag-success' : 'tag-accent'">{{ e.statut }}</span></td>
                      <td><span class="tag" [class]="estInscritAnneeActive(e) ? 'tag-success' : 'tag-neutral'">{{ estInscritAnneeActive(e) ? 'Inscrit' : 'Non inscrit' }}</span></td>
                      <td><button (click)="openFiche(e); $event.stopPropagation()" class="btn btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">visibility</span>Voir la fiche</button></td>
                    </tr>
                  } @empty {
                    <tr><td colspan="7" style="text-align:center;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:32px 0">Aucun élève trouvé</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="filteredEleves().length" (pageChange)="page.set($event)"></app-pagination>
          }
        </div>
      </div>
    </div>
  `,
})
export class DgElevesComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private anneeScolaireService = inject(AnneeScolaireService);

  anneeActiveId = signal<string | null>(null);

  eleves = signal<any[]>([]);
  loading = signal(true);
  search = signal('');
  statutFilter = signal('');
  classeFilter = signal('');
  page = signal(1);
  pageSize = 10;

  classeOf(e: any): string | undefined {
    return e.inscriptions?.[0]?.classe?.nom;
  }

  classeIdOf(e: any): string | undefined {
    return e.inscriptions?.[0]?.classe?.id;
  }

  openClasse(classeId: string | undefined) {
    if (!classeId) return;
    this.router.navigate(['/dsi/classes', classeId]);
  }

  classesOptions = computed(() => {
    const set = new Set<string>();
    for (const e of this.eleves()) {
      const c = this.classeOf(e);
      if (c) set.add(c);
    }
    return Array.from(set).sort();
  });

  filteredEleves = computed(() => {
    let list = this.eleves();
    const s = this.search().toLowerCase().trim();
    if (s) {
      list = list.filter((e) =>
        `${e.nom} ${e.prenom}`.toLowerCase().includes(s) ||
        (e.email || '').toLowerCase().includes(s) ||
        (e.telephone || '').includes(s),
      );
    }
    if (this.statutFilter()) list = list.filter((e) => e.statut === this.statutFilter());
    if (this.classeFilter()) list = list.filter((e) => this.classeOf(e) === this.classeFilter());
    return list;
  });

  pagedEleves = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredEleves().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.load();
    this.anneeScolaireService.findAll().subscribe({
      next: (annees) => this.anneeActiveId.set(annees.find((a: any) => a.statut === 'active')?.id || null),
      error: () => this.anneeActiveId.set(null),
    });
  }

  estInscritAnneeActive(e: any): boolean {
    const anneeId = this.anneeActiveId();
    return !!anneeId && e.inscriptions?.[0]?.anneeScolaireId === anneeId;
  }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({
      next: (res) => { this.eleves.set(res.data || []); this.loading.set(false); },
      error: () => { this.eleves.set([]); this.loading.set(false); this.alertService.error('Erreur lors du chargement des élèves'); },
    });
  }

  openFiche(e: any) {
    this.router.navigate(['/dg/eleves', e.id]);
  }
}
