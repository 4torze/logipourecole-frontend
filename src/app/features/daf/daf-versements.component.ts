import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-daf-versements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- En-tête -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <div>
          <h1 style="margin:0">Versements &amp; tranches</h1>
          <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Le plan de versements est propre à chaque classe, pour l'année scolaire en cours.</p>
        </div>
        <button (click)="openCreate()" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">add</span> Nouvelle tranche
        </button>
      </div>

      <!-- Barre filtre + export -->
      <div class="gs-panel"><div class="gs-panel-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="material-symbols-outlined" style="font-size:18px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">filter_alt</span>
          <label style="font-size:12px;font-weight:600">Classe</label>
          <select [(ngModel)]="filterClasseId" name="filterClasseId" class="input" style="min-width:200px">
            <option [ngValue]="null">Toutes les classes</option>
            @for (c of classes(); track c.id) {
              <option [ngValue]="c.id">{{ c.nom }}</option>
            }
          </select>
        </div>
        <div style="display:flex;gap:8px">
          @if (filterClasseId) {
            <button (click)="downloadFicheClasse(filterClasseId)" [disabled]="downloadingFiche() === filterClasseId" class="btn btn-secondary">
              @if (downloadingFiche() === filterClasseId) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">description</span> }
              Fiche de cette classe
            </button>
          }
          <button (click)="downloadFicheGlobale()" [disabled]="downloadingFiche() === 'globale'" class="btn btn-secondary">
            @if (downloadingFiche() === 'globale') { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">summarize</span> }
            Fiche globale
          </button>
        </div>
      </div></div>

      <!-- Liste des tranches -->
      <div class="gs-panel">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:18px">Tranches configurées</h3></div>
        <div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead><tr><th>Classe</th><th>Ordre</th><th>Libellé</th><th>Description</th><th>Base de calcul</th><th>Échéance</th><th>Statut</th><th>Paiements</th><th>Actions</th></tr></thead>
              <tbody>
                @for (v of filteredVersements(); track v.id) {
                  <tr><td style="font-weight:500">{{ v.classe?.nom || '—' }}</td><td><span class="tag tag-accent">{{ v.ordre }}</span></td><td>{{ v.libelle }}</td><td>{{ v.description || '—' }}</td><td>{{ v.pourcentage ? v.pourcentage + '% du tarif classe' : (v.montantAttendu ? formatMontant(v.montantAttendu) + ' FCFA/élève' : '—') }}</td><td>{{ v.dateLimite ? (v.dateLimite | date:'dd/MM/yyyy') : '—' }}</td><td><span class="tag" [class]="v.actif ? 'tag-success' : 'tag-neutral'">{{ v.actif ? 'Ouvert' : 'Fermé' }}</span></td><td>{{ v._count?.paiements || 0 }}</td><td><div style="display:flex;gap:4px"><button (click)="openEdit(v)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button><button (click)="confirmDeleteVersement(v)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></div></td></tr>
                } @empty {
                  <tr><td colspan="9" class="table-empty">
                    <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">receipt_long</span>
                    Aucune tranche définie{{ filterClasseId ? ' pour cette classe' : '' }}.
                  </td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal création / modification -->
    @if (showForm()) {
      <div class="dialog-backdrop" (click)="showForm.set(false)">
        <div class="dialog" style="width:min(720px,100%)" (click)="$event.stopPropagation()">
          <div class="dialog-title" style="display:flex;align-items:center;justify-content:space-between">
            {{ editingVersementId() ? 'Modifier la tranche' : 'Nouvelle tranche' }}
            <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="field" style="grid-column:1/-1">
              <label>Classe</label>
              <select [(ngModel)]="versementForm.classeId" (ngModelChange)="onFormClasseChange()" name="classeId" required [disabled]="!!editingVersementId()" class="input">
                <option [ngValue]="null" disabled>Choisir une classe…</option>
                @for (c of classes(); track c.id) { <option [ngValue]="c.id">{{ c.nom }}</option> }
              </select>
            </div>
            <div class="field"><label>Ordre</label><input type="number" min="1" [(ngModel)]="versementForm.ordre" name="ordre" required class="input" /></div>
            <div class="field"><label>Libellé</label><input type="text" [(ngModel)]="versementForm.libelle" name="libelle" placeholder="ex : 1ère tranche" required class="input" /></div>
            <div class="field" style="grid-column:1/-1"><label>Description</label><input type="text" [(ngModel)]="versementForm.description" name="description" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Montant fixe / élève <span style="color:var(--color-accent-700)">*</span></label><input type="number" min="0" [(ngModel)]="versementForm.montantAttendu" name="montantAttendu" placeholder="ex : 200 000" [disabled]="!!versementForm.pourcentage" class="input" /></div>
            <div class="field"><label>% du tarif classe <span style="color:var(--color-accent-700)">*</span></label><input type="number" min="0" max="100" [(ngModel)]="versementForm.pourcentage" name="pourcentage" placeholder="ex : 40" [disabled]="!!versementForm.montantAttendu" class="input" /></div>
            <div class="field"><label>Date limite <span style="color:var(--color-accent-700)">*</span></label><input type="date" [(ngModel)]="versementForm.dateLimite" name="dateLimite" required class="input" /></div>
            <div class="field">
              <label>Statut</label>
              <label style="display:flex;align-items:center;gap:8px;height:36px;cursor:pointer;font-size:14px">
                <input type="checkbox" [(ngModel)]="versementForm.actif" name="actif" style="width:16px;height:16px;accent-color:var(--color-accent)" />
                Tranche ouverte
              </label>
            </div>
          </div>
          <p style="font-size:12px;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin:12px 0 0">Le prix et la date d'échéance sont obligatoires : ils apparaîtront sur la fiche de renseignement remise aux familles. Renseignez soit un montant fixe (identique pour tous), soit un pourcentage du tarif propre à la classe de chaque élève (recommandé si les tarifs varient par classe).</p>
          <div class="dialog-actions">
            <button type="button" (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
            <button type="button" (click)="saveVersement()" [disabled]="versementSaving()" class="btn btn-primary">
              @if (versementSaving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> }
              {{ editingVersementId() ? 'Mettre à jour' : 'Créer la tranche' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DafVersementsComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  versements = signal<any[]>([]);
  classes = signal<any[]>([]);
  versementSaving = signal(false);
  editingVersementId = signal<string | null>(null);
  downloadingFiche = signal<string | null>(null);
  showForm = signal(false);
  filterClasseId: string | null = null;
  versementForm: any = { classeId: null, libelle: '', description: '', ordre: 1, dateLimite: null, montantAttendu: null, pourcentage: null, actif: true };

  // Méthode plutôt que computed() : filterClasseId n'est pas un signal (lié via
  // ngModel), donc un computed() ne se réévaluerait pas quand le filtre change.
  filteredVersements(): any[] {
    const list = this.versements();
    return this.filterClasseId ? list.filter((v) => v.classeId === this.filterClasseId) : list;
  }

  ngOnInit() {
    this.loadClasses();
    this.loadVersements();
  }

  formatMontant(val: any): string {
    const n = Number(val) || 0;
    return n.toLocaleString('fr-FR');
  }

  loadClasses() {
    this.http.get<any[]>(`${environment.apiUrl}/daf/classes`).subscribe({ next: (d) => this.classes.set(d || []), error: () => this.classes.set([]) });
  }

  loadVersements() {
    this.http.get<any>(`${environment.apiUrl}/daf/versements`).subscribe({ next: (d) => this.versements.set(d || []), error: () => this.versements.set([]) });
  }

  onFormClasseChange() {
    this.versementForm.ordre = this.nextOrdreForClasse(this.versementForm.classeId);
  }

  private nextOrdreForClasse(classeId: string | null): number {
    if (!classeId) return 1;
    const forClasse = this.versements().filter((v) => v.classeId === classeId);
    return forClasse.length ? Math.max(...forClasse.map((v) => v.ordre)) + 1 : 1;
  }

  openCreate() {
    this.editingVersementId.set(null);
    const classeId = this.filterClasseId;
    this.versementForm = { classeId, libelle: '', description: '', ordre: this.nextOrdreForClasse(classeId), dateLimite: null, montantAttendu: null, pourcentage: null, actif: true };
    this.showForm.set(true);
  }

  openEdit(v: any) {
    this.editingVersementId.set(v.id);
    this.versementForm = { classeId: v.classeId, libelle: v.libelle, description: v.description || '', ordre: v.ordre, dateLimite: v.dateLimite ? new Date(v.dateLimite) : null, montantAttendu: v.montantAttendu ?? null, pourcentage: v.pourcentage ?? null, actif: v.actif ?? true };
    this.showForm.set(true);
  }

  saveVersement() {
    if (!this.versementForm.classeId || !this.versementForm.libelle || !this.versementForm.ordre) {
      this.alertService.error('Classe, libellé et ordre sont obligatoires');
      return;
    }
    if (!this.versementForm.montantAttendu && !this.versementForm.pourcentage) {
      this.alertService.error('Le prix de la tranche est obligatoire : renseignez un montant fixe ou un pourcentage');
      return;
    }
    if (!this.versementForm.dateLimite) {
      this.alertService.error("La date d'échéance est obligatoire");
      return;
    }
    this.versementSaving.set(true);
    const id = this.editingVersementId();
    const payload: any = { ...this.versementForm };
    if (payload.dateLimite instanceof Date) {
      payload.dateLimite = payload.dateLimite.toISOString();
    }
    const req = id
      ? this.http.patch(`${environment.apiUrl}/daf/versements/${id}`, payload)
      : this.http.post(`${environment.apiUrl}/daf/versements`, payload);
    req.subscribe({
      next: () => {
        this.versementSaving.set(false);
        this.showForm.set(false);
        this.alertService.success(id ? 'Versement mis à jour' : 'Versement créé');
        this.loadVersements();
      },
      error: (err) => {
        this.versementSaving.set(false);
        this.alertService.error(err.error?.message || 'Erreur lors de l\'enregistrement');
      },
    });
  }

  async confirmDeleteVersement(v: any) {
    const ok = await this.alertService.confirm({
      title: 'Supprimer cette tranche ?',
      html: `<strong>${v.libelle}</strong> (${v.classe?.nom || ''}) sera définitivement supprimée.`,
      confirmText: 'Supprimer',
      danger: true,
    });
    if (ok) this.deleteVersement(v);
  }

  deleteVersement(v: any) {
    this.http.delete(`${environment.apiUrl}/daf/versements/${v.id}`).subscribe({
      next: () => { this.alertService.success('Tranche supprimée'); this.loadVersements(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la suppression'),
    });
  }

  private downloadPdf(url: string, filename: string, key: string) {
    this.downloadingFiche.set(key);
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.downloadingFiche.set(null);
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        this.downloadingFiche.set(null);
        this.alertService.error(err.error?.message || 'Erreur lors de la génération du PDF');
      },
    });
  }

  downloadFicheClasse(classeId: string) {
    const classe = this.classes().find((c) => c.id === classeId);
    this.downloadPdf(`${environment.apiUrl}/daf/fiches/classe/${classeId}/pdf`, `fiche_${classe?.nom || 'classe'}.pdf`, classeId);
  }

  downloadFicheGlobale() {
    this.downloadPdf(`${environment.apiUrl}/daf/fiches/globale/pdf`, `fiche_globale.pdf`, 'globale');
  }
}
