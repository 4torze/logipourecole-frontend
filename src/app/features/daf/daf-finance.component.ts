import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-daf-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container">
      <div class="gs-panel">
        <div class="gs-panel-head">
          <h3 style="margin:0;font-size:18px">Tableau financier</h3>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary" (click)="exportPdf()">
              <span class="material-symbols-outlined" style="font-size:18px">picture_as_pdf</span> Exporter PDF
            </button>
            <button class="btn btn-secondary" (click)="openRelanceDialog(null)" [disabled]="relanceLoading()">
              <span class="material-symbols-outlined" style="font-size:18px">sms</span> Relance SMS groupée
            </button>
          </div>
        </div>
        <div class="gs-panel-body">
          <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
            <select [(ngModel)]="filters.classeId" (ngModelChange)="onFilterClasseChange()" class="input" style="flex:1;min-width:140px">
              <option value="">Toutes les classes</option>
              @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
            </select>
            <select [(ngModel)]="filters.anneeScolaireId" (ngModelChange)="onFilterChange()" class="input" style="flex:1;min-width:140px">
              <option value="">Année scolaire</option>
              @for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }}</option> }
            </select>
            <select [(ngModel)]="filters.statutPaiement" (ngModelChange)="onFilterChange()" class="input" style="flex:1;min-width:140px">
              <option value="">Statut paiement</option>
              <option value="solde">Soldé (à jour)</option>
              <option value="retard">En retard</option>
            </select>
            <select [(ngModel)]="filters.versementId" (ngModelChange)="onFilterChange()" class="input" style="flex:1;min-width:140px">
              <option value="">Tous les versements</option>
              @for (v of versements(); track v.id) { <option [value]="v.id">{{ v.ordre }} — {{ v.libelle }}</option> }
            </select>
            <input type="text" [(ngModel)]="filters.search" (ngModelChange)="onSearchChange($event)" placeholder="Rechercher par nom ou téléphone..." class="input" style="flex:2;min-width:220px" />
          </div>

          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr>
                  <th rowspan="2">Étudiant</th>
                  <th rowspan="2">Classe</th>
                  <th rowspan="2">Filière</th>
                  <th rowspan="2">Niveau</th>
                  <th rowspan="2">Contact</th>
                  <th rowspan="2">Contact parent</th>
                  <th rowspan="2" style="text-align:right">Montant total</th>
                  <th colspan="3" style="text-align:center">1er versement</th>
                  <th colspan="3" style="text-align:center">2e versement</th>
                  <th colspan="3" style="text-align:center">3e versement</th>
                  <th rowspan="2" style="text-align:right">Payé</th>
                  <th rowspan="2" style="text-align:right">Reste</th>
                  <th rowspan="2">Statut</th>
                  <th rowspan="2">Actions</th>
                </tr>
                <tr>
                  <th style="text-align:right">Date</th><th>N° Reçu</th><th style="text-align:right">Montant</th>
                  <th style="text-align:right">Date</th><th>N° Reçu</th><th style="text-align:right">Montant</th>
                  <th style="text-align:right">Date</th><th>N° Reçu</th><th style="text-align:right">Montant</th>
                </tr>
              </thead>
              <tbody>
                @for (row of tableauFinancier(); track row.etudiantId) {
                  <tr>
                    <td style="font-weight:600">{{ row.nom }} {{ row.prenom }}</td>
                    <td style="color:color-mix(in srgb, var(--color-text) 60%, transparent)">{{ row.classeNom || row.niveau || '-' }}</td>
                    <td>{{ row.filiere || '—' }}</td>
                    <td>{{ row.niveau || '—' }}</td>
                    <td>{{ row.contact || '—' }}</td>
                    <td>{{ row.contactParent || '—' }}</td>
                    <td style="text-align:right">{{ row.montantTotal?.toLocaleString('fr-FR') }}</td>
                    @for (v of [row.versement1, row.versement2, row.versement3]; track $index) {
                      <td style="font-size:12px">{{ v?.date ? (v.date | date:'dd/MM/yyyy') : '—' }}</td>
                      <td style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ v?.recu || '—' }}</td>
                      <td style="text-align:right">{{ v?.montant ? v.montant.toLocaleString('fr-FR') : '—' }}</td>
                    }
                    <td style="text-align:right;font-weight:600;color:#1a7a3f">{{ row.totalPaye?.toLocaleString('fr-FR') }}</td>
                    <td style="text-align:right;font-weight:600;color:var(--color-accent-700)">{{ row.reste?.toLocaleString('fr-FR') }}</td>
                    <td><span class="tag" [class]="row.statut === 'À jour' ? 'tag-success' : 'tag-danger'">{{ row.statut }}</span></td>
                    <td>
                      <div style="display:flex;gap:4px">
                        <button class="btn btn-icon btn-secondary" (click)="openPaiementsDrawer(row)" title="Voir les paiements"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button>
                        @if (row.statut !== 'À jour') {
                          <button class="btn btn-icon btn-secondary" (click)="openRelanceDialog(row.etudiantId)" [disabled]="relanceId() === row.etudiantId" title="Relance SMS"><span class="material-symbols-outlined" style="font-size:18px">notifications_active</span></button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="17" style="text-align:center;padding:32px 0;color:color-mix(in srgb, var(--color-text) 50%, transparent)">@if (tableLoading()) { Chargement... } @else { Aucun étudiant trouvé. Vérifiez qu'une année scolaire est active et qu'il y a des inscriptions. }</td></tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="tablePage()" [pageSize]="tablePageSize" [totalItems]="tableTotal()" (pageChange)="onTablePageChange($event)"></app-pagination>
        </div>
      </div>

      <div class="gs-panel" style="margin-top:20px">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Historique des relances</h3></div>
        <div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead><tr><th>Étudiant</th><th>Téléphone</th><th>Message</th><th>Date d'envoi</th><th>Statut</th></tr></thead>
              <tbody>
                @for (r of relances(); track r.id) {
                  <tr>
                    <td style="font-weight:600">{{ r.etudiant?.nom }} {{ r.etudiant?.prenom }}</td>
                    <td>{{ r.etudiant?.telephone || '—' }}</td>
                    <td style="max-width:320px;white-space:normal">{{ r.message }}</td>
                    <td>{{ r.dateEnvoi | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td><span class="tag" [class]="r.aPayeDepuis ? 'tag-success' : 'tag-neutral'">{{ r.aPayeDepuis ? 'A payé depuis' : 'Sans suite' }}</span></td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="table-empty">Aucune relance envoyée</td></tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="relancePage()" [pageSize]="relancePageSize" [totalItems]="relanceTotal()" (pageChange)="onRelancePageChange($event)"></app-pagination>
        </div>
      </div>
    </div>

    @if (relanceDialogOpen()) {
      <div class="dialog-backdrop" (click)="relanceDialogOpen.set(false)">
        <div class="dialog" style="width:min(480px, 100%)" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span class="dialog-title">{{ relanceEtudiantId() ? 'Relance SMS' : 'Relance SMS groupée' }}</span>
            <button class="btn btn-icon btn-secondary" (click)="relanceDialogOpen.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div class="field">
            <label>Message (optionnel — laisser vide pour le message par défaut personnalisé)</label>
            <textarea [(ngModel)]="relanceMessage" class="input" rows="4" placeholder="Message personnalisé..."></textarea>
          </div>
          <div class="dialog-actions">
            <button (click)="relanceDialogOpen.set(false)" class="btn btn-secondary">Annuler</button>
            <button (click)="confirmRelance()" [disabled]="relanceLoading() || relanceId() !== null" class="btn btn-primary">Envoyer</button>
          </div>
        </div>
      </div>
    }

    @if (drawerVisible()) {
      <div class="dialog-backdrop" style="justify-content:flex-end;align-items:stretch;padding:0" (click)="drawerVisible.set(false)">
        <div style="width:min(640px,100%);height:100%;overflow-y:auto;background:var(--color-surface);border-left:1px solid var(--color-divider);box-shadow:var(--shadow-lg)" (click)="$event.stopPropagation()">
          <div style="padding:20px 24px;border-bottom:2px solid var(--color-divider);display:flex;align-items:center;justify-content:space-between">
            <span class="dialog-title">{{ drawerTitle() }}</span>
            <button class="btn btn-icon btn-secondary" (click)="drawerVisible.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div style="padding:24px">
            @if (selectedRow()) {
              <div style="display:flex;gap:24px;margin-bottom:20px;padding:16px;border:1px solid var(--color-divider)">
                <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Montant total</span><span style="font-size:17px;font-weight:700">{{ selectedRow().montantTotal?.toLocaleString('fr-FR') }} FCFA</span></div>
                <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Payé</span><span style="font-size:17px;font-weight:700;color:#1a7a3f">{{ selectedRow().totalPaye?.toLocaleString('fr-FR') }} FCFA</span></div>
                <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Reste</span><span style="font-size:17px;font-weight:700;color:var(--color-accent-700)">{{ selectedRow().reste?.toLocaleString('fr-FR') }} FCFA</span></div>
              </div>
              <div class="table-scroll">
                <table class="table">
                  <thead><tr><th>N° Reçu</th><th>Versement</th><th>Date</th><th style="text-align:right">Montant</th><th>Reçu</th></tr></thead>
                  <tbody>
                    @for (p of selectedRow().versements || []; track p.id) {
                      <tr style="cursor:pointer" (click)="router.navigate(['/daf/paiements', p.id])" [style.opacity]="p.annule ? 0.55 : 1">
                        <td style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ p.recu || p.numeroRecu || '-' }} @if (p.annule) { <span class="tag tag-danger" style="margin-left:4px">Annulé</span> }</td>
                        <td>V{{ p.versement }}</td>
                        <td style="font-size:12px">{{ p.date | date:'dd/MM/yyyy' }}</td>
                        <td style="text-align:right;font-weight:600">{{ p.montant?.toLocaleString('fr-FR') }} FCFA</td>
                        <td><button class="btn btn-primary" style="height:32px;padding:0 12px;font-size:12px" (click)="$event.stopPropagation(); downloadRecu(p)" title="Télécharger le reçu"><span class="material-symbols-outlined" style="font-size:16px">download</span></button></td>
                      </tr>
                    } @empty {
                      <tr><td colspan="5" style="text-align:center;padding:24px 0;color:color-mix(in srgb, var(--color-text) 50%, transparent)">Aucun paiement enregistré pour cet étudiant.</td></tr>
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
  private alertService = inject(AlertService);
  router = inject(Router);

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
    this.loadRelances();
  }

  relances = signal<any[]>([]);
  relancePage = signal(1);
  relanceTotal = signal(0);
  relancePageSize = 20;
  loadRelances() {
    this.http.get<any>(`${environment.apiUrl}/daf/relances?page=${this.relancePage()}&limit=${this.relancePageSize}`).subscribe({
      next: (d) => { this.relances.set(d.data || []); this.relanceTotal.set(d.total || 0); },
      error: () => { this.relances.set([]); this.relanceTotal.set(0); },
    });
  }
  onRelancePageChange(page: number) {
    this.relancePage.set(page);
    this.loadRelances();
  }

  loadVersements() {
    const qs = this.filters.classeId ? `?classeId=${this.filters.classeId}` : '';
    this.http.get<any>(`${environment.apiUrl}/daf/versements${qs}`).subscribe({
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

  onFilterClasseChange() {
    this.filters.versementId = null;
    this.loadVersements();
    this.onFilterChange();
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
      error: () => this.alertService.error('Erreur lors du téléchargement du reçu'),
    });
  }

  relanceDialogOpen = signal(false);
  relanceEtudiantId = signal<string | null>(null);
  relanceMessage = '';

  openRelanceDialog(etudiantId: string | null) {
    this.relanceEtudiantId.set(etudiantId);
    this.relanceMessage = '';
    this.relanceDialogOpen.set(true);
  }

  confirmRelance() {
    const etudiantId = this.relanceEtudiantId();
    this.relanceDialogOpen.set(false);
    if (etudiantId) this.relanceEtudiant(etudiantId, this.relanceMessage);
    else this.relanceGroupee(this.relanceMessage);
  }

  relanceEtudiant(etudiantId: string, message?: string) {
    this.relanceId.set(etudiantId);
    this.http.post<any>(`${environment.apiUrl}/daf/relance-sms`, { etudiantId, message: message || undefined }).subscribe({
      next: (res) => { this.relanceId.set(null); this.alertService.success(res.message || 'Relance envoyée'); this.loadRelances(); },
      error: (err) => { this.relanceId.set(null); this.alertService.error(err.error?.message || 'Erreur relance'); },
    });
  }

  relanceGroupee(message?: string) {
    this.relanceLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/daf/relance-groupee`, { message: message || undefined }).subscribe({
      next: (res) => { this.relanceLoading.set(false); this.alertService.success(res.message || 'Relances envoyées'); this.loadRelances(); },
      error: (err) => { this.relanceLoading.set(false); this.alertService.error(err.error?.message || 'Erreur relance groupée'); },
    });
  }

  exportPdf() {
    this.http.get(`${environment.apiUrl}/exports/tableau-financier/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tableau-financier.pdf';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.alertService.error('Erreur lors de l\'export PDF'),
    });
  }
}
