import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

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
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>Nom</th><th>Prénom</th><th>Classe</th><th>Téléphone</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  @for (e of pagedEleves(); track e.id) {
                    <tr style="cursor:pointer" (click)="openFiche(e)">
                      <td>{{ e.nom }}</td>
                      <td>{{ e.prenom }}</td>
                      <td>{{ classeOf(e) || '—' }}</td>
                      <td>{{ e.telephone || '—' }}</td>
                      <td><span class="tag" [class]="e.statut === 'ACTIF' ? 'tag-success' : 'tag-accent'">{{ e.statut }}</span></td>
                      <td><button (click)="openFiche(e); $event.stopPropagation()" class="btn btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">visibility</span>Voir la fiche</button></td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" style="text-align:center;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:32px 0">Aucun élève trouvé</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="filteredEleves().length" (pageChange)="page.set($event)"></app-pagination>
          }
        </div>
      </div>

      @if (fiche(); as f) {
        <div class="dialog-backdrop" style="display:flex;justify-content:flex-end;padding:0" (click)="fiche.set(null)">
          <div style="width:100%;max-width:680px;height:100%;overflow-y:auto;background:var(--color-surface);border-left:1px solid var(--color-divider)" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:2px solid var(--color-divider);position:sticky;top:0;background:var(--color-surface);z-index:1">
              <div>
                <h3 style="margin:0">{{ f.etudiant.prenom }} {{ f.etudiant.nom }}</h3>
                <p style="margin:4px 0 0;font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ f.etudiant.email || 'Pas d\\'email' }} · {{ f.etudiant.telephone || 'Pas de téléphone' }}</p>
              </div>
              <button class="btn btn-icon btn-secondary" (click)="fiche.set(null)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>

            <div style="padding:24px;display:flex;flex-direction:column;gap:24px">
              <!-- Scolarité -->
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
                <div class="gs-stat"><span class="gs-stat-label">Montant total</span><span class="gs-stat-num">{{ f.scolarite.montantTotal | number:'1.0-0':'fr-FR' }}</span></div>
                <div class="gs-stat"><span class="gs-stat-label">Payé</span><span class="gs-stat-num" style="color:#1a7a3f">{{ f.scolarite.totalPaye | number:'1.0-0':'fr-FR' }}</span></div>
                <div class="gs-stat"><span class="gs-stat-label">Reste à payer</span><span class="gs-stat-num" style="color:var(--color-accent-700)">{{ f.scolarite.reste | number:'1.0-0':'fr-FR' }}</span></div>
              </div>

              <!-- Commentaires des professeurs -->
              <div>
                <h4 style="margin:0 0 10px">Commentaires des professeurs ({{ f.commentaires.length }})</h4>
                @if (f.commentaires.length > 0) {
                  <div style="display:flex;flex-direction:column;gap:8px">
                    @for (c of f.commentaires; track c.id) {
                      <div style="border:1px solid var(--color-divider);border-left:3px solid var(--color-accent);padding:10px 12px;font-size:13px">
                        <p style="margin:0;white-space:pre-wrap">{{ c.contenu }}</p>
                        <div style="font-size:11px;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin-top:6px">{{ c.enseignant?.prenom }} {{ c.enseignant?.nom }} — {{ c.updatedAt | date:'dd/MM/yyyy à HH:mm' }}</div>
                      </div>
                    }
                  </div>
                } @else {
                  <div style="font-size:13px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">Aucun commentaire enregistré.</div>
                }
              </div>

              <!-- Paiements -->
              <div>
                <h4 style="margin:0 0 10px">Historique des paiements ({{ f.paiements.length }})</h4>
                <div style="overflow-x:auto">
                  <table class="table">
                    <thead><tr><th>Date</th><th>Montant</th><th>Mode</th><th>Reçu</th></tr></thead>
                    <tbody>
                      @for (p of f.paiements; track p.id) {
                        <tr><td>{{ p.datePaiement | date:'dd/MM/yyyy' }}</td><td>{{ p.montant | number:'1.0-0':'fr-FR' }}</td><td>{{ p.mode }}</td><td>{{ p.numeroRecu }}</td></tr>
                      } @empty { <tr><td colspan="4" style="text-align:center;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:16px 0">Aucun paiement</td></tr> }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <h4 style="margin:0 0 10px">Notes ({{ f.notes.length }})</h4>
                <div style="overflow-x:auto">
                  <table class="table">
                    <thead><tr><th>Date</th><th>Matière</th><th>Type</th><th>Note</th></tr></thead>
                    <tbody>
                      @for (n of f.notes; track n.id) {
                        <tr><td>{{ n.dateSaisie | date:'dd/MM/yyyy' }}</td><td>{{ n.matiere?.nom }}</td><td>{{ n.typeEvaluation }}</td><td [style.color]="n.note >= (n.sur/2) ? '#1a7a3f' : 'var(--color-accent-700)'" style="font-weight:600">{{ n.note }}/{{ n.sur }}</td></tr>
                      } @empty { <tr><td colspan="4" style="text-align:center;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:16px 0">Aucune note</td></tr> }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Absences / retards -->
              <div>
                <h4 style="margin:0 0 10px">Absences &amp; retards ({{ f.absences.length }})</h4>
                <div style="overflow-x:auto">
                  <table class="table">
                    <thead><tr><th>Date</th><th>Type</th><th>Matière</th><th>Justifié</th></tr></thead>
                    <tbody>
                      @for (a of f.absences; track a.id) {
                        <tr><td>{{ a.date | date:'dd/MM/yyyy' }}</td><td><span class="tag" [class]="a.type === 'ABSENCE' ? 'tag-danger' : 'tag-accent'">{{ a.type }}</span></td><td>{{ a.matiere?.nom }}</td><td>{{ a.justified ? 'Oui' : 'Non' }}</td></tr>
                      } @empty { <tr><td colspan="4" style="text-align:center;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:16px 0">Aucune absence enregistrée</td></tr> }
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
export class DgElevesComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  eleves = signal<any[]>([]);
  loading = signal(true);
  search = signal('');
  statutFilter = signal('');
  classeFilter = signal('');
  page = signal(1);
  pageSize = 10;

  fiche = signal<any>(null);

  classeOf(e: any): string | undefined {
    return e.inscriptions?.[0]?.classe?.nom;
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

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({
      next: (res) => { this.eleves.set(res.data || []); this.loading.set(false); },
      error: () => { this.eleves.set([]); this.loading.set(false); this.alertService.error('Erreur lors du chargement des élèves'); },
    });
  }

  openFiche(e: any) {
    this.http.get<any>(`${environment.apiUrl}/etudiants/${e.id}/fiche-complete`).subscribe({
      next: (f) => this.fiche.set(f),
      error: () => this.alertService.error('Erreur lors du chargement de la fiche élève'),
    });
  }
}
