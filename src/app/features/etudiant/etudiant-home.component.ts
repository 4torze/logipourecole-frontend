import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-etudiant-home',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .parcours-item { position:relative; padding-left:20px; padding-bottom:20px; border-left:2px solid var(--color-divider); }
    .parcours-item:last-child { padding-bottom:0; }
    .parcours-dot { position:absolute; left:-7px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--color-accent); }
  `],
  template: `
    <div class="page-container">
      <h1 style="margin-bottom:24px">Mon espace étudiant</h1>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div class="gs-stat"><span class="gs-stat-label">Moyenne générale</span><span class="gs-stat-num">{{ moyenne() }}<span class="text-sm text-muted font-medium">/20</span></span></div>
        <div class="gs-stat"><span class="gs-stat-label">Rang</span><span class="gs-stat-num">{{ rang() }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Absences</span><span class="gs-stat-num">{{ absences() }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Reste à payer</span><span class="gs-stat-num">{{ scolarite()?.reste || 0 | number:'1.0-0':'fr-FR' }}<span class="text-sm text-muted font-medium"> FCFA</span></span></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Scolarité</h3></div><div class="gs-panel-body">
          @if (scolarite()) {
            <div style="display:flex;flex-direction:column;gap:12px;font-size:14px">
              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span class="text-muted">Progression paiement</span><strong>{{ tauxPaiement() }}%</strong></div>
                <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="tauxPaiement()"></div></div>
              </div>
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Statut</span><span class="tag" [class]="scolarite()?.statut === 'À jour' ? 'tag-success' : 'tag-danger'">{{ scolarite()?.statut }}</span></div>
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Montant total</span><strong>{{ scolarite()?.montantTotal || 0 | number:'1.0-0':'fr-FR' }} FCFA</strong></div>
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Total payé</span><strong style="color:#1a7a3f">{{ scolarite()?.totalPaye || 0 | number:'1.0-0':'fr-FR' }} FCFA</strong></div>
            </div>
          }
        </div></div>
        <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Académique</h3></div><div class="gs-panel-body">
          <div style="display:flex;flex-direction:column;gap:12px;font-size:14px">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span class="text-muted">Moyenne /20</span><strong>{{ moyenne() }}</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="moyenne() * 5"></div></div>
            </div>
            <div style="display:flex;justify-content:space-between"><span class="text-muted">Rang en classe</span><strong>{{ rang() }}</strong></div>
            <div style="display:flex;justify-content:space-between"><span class="text-muted">Absences non justifiées</span><strong style="color:var(--color-accent-700)">{{ absences() }}</strong></div>
          </div>
        </div></div>
        <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div><div class="gs-panel-body">
          <div class="flex flex-col gap-2">
            <button (click)="goTo('/etudiant/bulletins')" class="btn btn-primary">
              <span class="material-symbols-outlined" style="font-size:18px">description</span> Mes bulletins
            </button>
          </div>
        </div></div>
      </div>

      <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Mon parcours</h3></div><div class="gs-panel-body">
        @if (parcours().length > 0) {
          <div style="display:flex;flex-direction:column">
            @for (event of parcours(); track $index) {
              <div class="parcours-item">
                <div class="parcours-dot"></div>
                <div style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ event.date | date:'dd/MM/yyyy' }}</div>
                <div style="margin-top:4px">
                  <span class="tag" style="margin-right:8px" [class]="event.type === 'inscription' ? 'tag-neutral' : event.type === 'paiement' ? 'tag-success' : 'tag-accent'">{{ event.type }}</span>
                  <span style="font-size:14px">{{ event.label }}</span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="table-empty">
            <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">timeline</span>
            Aucun parcours disponible
          </div>
        }
      </div></div>
    </div>
  `,
})
export class EtudiantHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  etudiantId = computed(() => this.auth.currentUser()?.etudiantId || '');
  scolarite = signal<any>(null);
  parcours = signal<any[]>([]);
  moyenne = signal<number>(0);
  rang = signal<number>(0);
  absences = signal<number>(0);

  tauxPaiement = computed(() => {
    const s = this.scolarite();
    if (!s || !s.montantTotal) return 0;
    return Math.round((s.totalPaye / s.montantTotal) * 100);
  });

  ngOnInit() {
    if (!this.etudiantId()) return;
    this.loadScolarite(); this.loadParcours(); this.loadAcademic();
  }

  loadScolarite() { this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId()}/scolarite`).subscribe({ next: (d) => this.scolarite.set(d), error: () => this.scolarite.set(null) }); }
  loadParcours() { this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId()}/parcours`).subscribe({ next: (d) => this.parcours.set(d.parcours || []), error: () => this.parcours.set([]) }); }
  loadAcademic() {
    this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId()}/notes`).subscribe({ next: (d) => this.moyenne.set(d?.moyenne || 0), error: () => {} });
    this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId()}/rang`).subscribe({ next: (d) => this.rang.set(d?.rang || 0), error: () => {} });
    this.http.get<any[]>(`${environment.apiUrl}/absences/etudiant/${this.etudiantId()}`).subscribe({ next: (d) => this.absences.set(d.length), error: () => {} });
  }

  goTo(route: string) { this.router.navigate([route]); }
}
