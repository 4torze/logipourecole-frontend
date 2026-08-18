import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-marketing-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1 style="margin:0 0 24px">Direction Marketing</h1>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:20px">
        <div class="gs-stat"><span class="gs-stat-label">Total prospects</span><span class="gs-stat-num">{{ perf()?.totalProspects || 0 }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Taux conversion</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ perf()?.tauxConversion || 0 }}%</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Inscrits</span><span class="gs-stat-num">{{ perf()?.prospectsInscrits || 0 }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Perdus</span><span class="gs-stat-num">{{ perf()?.prospectsPerdus || 0 }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Personnel actif</span><span class="gs-stat-num">{{ perf()?.personnelActif || 0 }}</span></div>
      </div>

      <div class="gs-panel">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Évolution des prospects (6 derniers mois)</h3></div>
        <div class="gs-panel-body">
        @if (perf()?.evolution?.length > 0) {
          <div style="display:flex;gap:16px;align-items:flex-end;padding:0 16px;height:200px">
            @for (m of perf()?.evolution; track m.mois) {
              <div style="flex:1;text-align:center">
                <div style="display:flex;flex-direction:column;gap:2px;justify-content:flex-end;height:180px">
                  <div style="background:var(--color-accent);min-height:2px" [style.height.%]="(m.inscrits / maxEvolution()) * 100" [title]="'Inscrits: ' + m.inscrits"></div>
                  <div style="background:var(--color-neutral-300);min-height:2px" [style.height.%]="((m.total - m.inscrits) / maxEvolution()) * 100" [title]="'Total: ' + m.total"></div>
                </div>
                <small style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ m.mois }}</small>
              </div>
            }
          </div>
          <div style="display:flex;gap:24px;justify-content:center;margin-top:16px;font-size:12px;color:color-mix(in srgb, var(--color-text) 65%, transparent)">
            <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:12px;height:12px;background:var(--color-accent);display:inline-block"></span>Inscrits</span>
            <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:12px;height:12px;background:var(--color-neutral-300);display:inline-block"></span>Prospects (non convertis)</span>
          </div>
        } @else {
          <div class="table-empty">Aucune donnée pour la période</div>
        }
        </div>
      </div>

      <div class="gs-panel">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Conversion par canal</h3></div>
        <div class="gs-panel-body">
          <div style="overflow-x:auto">
          <table class="table">
            <thead><tr><th>Canal</th><th>Total</th><th>Inscrits</th><th>Taux</th></tr></thead>
            <tbody>
              @for (c of conversionParCanal(); track c.canal) {
                <tr><td style="font-weight:600">{{ c.canal }}</td><td>{{ c.total }}</td><td>{{ c.inscrits }}</td><td style="font-weight:600">{{ c.taux }}%</td></tr>
              } @empty {
                <tr><td colspan="4" class="table-empty">Aucune donnée</td></tr>
              }
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <div class="gs-panel">
        <div class="gs-panel-head">
          <h3 style="margin:0;font-size:16px">Personnel marketing</h3>
          <button (click)="openCreatePersonnel()" class="btn btn-primary btn-sm">
            <span class="material-symbols-outlined" style="font-size:16px">person_add</span> Ajouter
          </button>
        </div>
        <div class="gs-panel-body">
        <div style="overflow-x:auto">
          <table class="table">
            <thead><tr><th>Nom</th><th>Prénom</th><th>Poste</th><th>Contact</th><th>Performance</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              @for (p of personnel(); track p.id) {
                <tr>
                  <td style="font-weight:600">{{ p.nom }}</td>
                  <td>{{ p.prenom }}</td>
                  <td>{{ p.poste || '—' }}</td>
                  <td>{{ p.contact1 }}</td>
                  <td>
                    @if (p.notePerformance) {
                      <span class="tag" [class]="p.notePerformance >= 7 ? 'tag-success' : p.notePerformance >= 5 ? 'tag-accent' : 'tag-danger'">{{ p.notePerformance }}/10</span>
                    } @else { <span class="text-muted">—</span> }
                  </td>
                  <td><span class="tag" [class]="p.statut === 'actif' ? 'tag-success' : 'tag-danger'">{{ p.statut }}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <button (click)="openEditPersonnel(p)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
                      <button (click)="confirmDeletePersonnel(p)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table-empty">Aucun membre du personnel</td></tr>
              }
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <div class="gs-panel">
        <div class="gs-panel-head">
          <h3 style="margin:0;font-size:16px">Activités marketing</h3>
          <button (click)="openCreateActivite()" class="btn btn-primary btn-sm">
            <span class="material-symbols-outlined" style="font-size:16px">add</span> Nouvelle activité
          </button>
        </div>
        <div class="gs-panel-body">
        <div style="overflow-x:auto">
          <table class="table">
            <thead><tr><th>Titre</th><th>Type</th><th>Période</th><th>Budget</th><th>Statut</th></tr></thead>
            <tbody>
              @for (a of activites(); track a.id) {
                <tr>
                  <td style="font-weight:600">{{ a.titre }}</td>
                  <td>{{ a.type || '—' }}</td>
                  <td>{{ a.dateDebut ? (a.dateDebut | date:'dd/MM/yy') : '—' }}@if (a.dateFin) { – {{ a.dateFin | date:'dd/MM/yy' }} }</td>
                  <td>{{ a.budget ? (a.budget | number:'1.0-0':'fr-FR') + ' FCFA' : '—' }}</td>
                  <td><span class="tag tag-neutral">{{ a.statut }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="table-empty">Aucune activité enregistrée</td></tr>
              }
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>

    <!-- Modal personnel -->
    @if (showPersonnelForm()) {
      <div class="dialog-backdrop" (click)="showPersonnelForm.set(false)">
        <div class="dialog" style="width:min(560px, 100%)" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">{{ editingPersonnelId() ? 'Modifier le membre' : 'Ajouter un membre du personnel' }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="showPersonnelForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="savePersonnel()" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="field"><label>Nom</label><input type="text" [(ngModel)]="personnelForm.nom" name="nom" required class="input" /></div>
            <div class="field"><label>Prénom</label><input type="text" [(ngModel)]="personnelForm.prenom" name="prenom" required class="input" /></div>
            <div class="field"><label>Contact</label><input type="text" [(ngModel)]="personnelForm.contact1" name="contact1" required class="input" /></div>
            <div class="field"><label>Email</label><input type="email" [(ngModel)]="personnelForm.email" name="email" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Poste</label><input type="text" [(ngModel)]="personnelForm.poste" name="poste" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Note performance /10</label><input type="number" min="0" max="10" [(ngModel)]="personnelForm.notePerformance" name="notePerformance" placeholder="Optionnel" class="input" /></div>
            @if (editingPersonnelId()) {
              <div class="field" style="grid-column:1 / -1"><label>Statut</label><select [(ngModel)]="personnelForm.statut" name="statut" class="input"><option value="actif">Actif</option><option value="inactif">Inactif</option></select></div>
            }
            <div class="dialog-actions" style="grid-column:1 / -1">
              <button type="button" (click)="showPersonnelForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="savingPersonnel()" class="btn btn-primary">
                @if (savingPersonnel()) { <span class="material-symbols-outlined" style="font-size:14px">progress_activity</span> } {{ editingPersonnelId() ? 'Mettre à jour' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal activité -->
    @if (showActiviteForm()) {
      <div class="dialog-backdrop" (click)="showActiviteForm.set(false)">
        <div class="dialog" style="width:min(560px, 100%)" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Nouvelle activité marketing</h3>
            <button class="btn btn-icon btn-secondary" (click)="showActiviteForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="saveActivite()" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="field" style="grid-column:1 / -1"><label>Titre</label><input type="text" [(ngModel)]="activiteForm.titre" name="titre" required class="input" /></div>
            <div class="field"><label>Type</label><input type="text" [(ngModel)]="activiteForm.type" name="type" placeholder="ex : Salon, Publicité" class="input" /></div>
            <div class="field"><label>Budget (FCFA)</label><input type="number" min="0" [(ngModel)]="activiteForm.budget" name="budget" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Date début</label><input type="date" [(ngModel)]="activiteForm.dateDebut" name="dateDebut" class="input" /></div>
            <div class="field"><label>Date fin</label><input type="date" [(ngModel)]="activiteForm.dateFin" name="dateFin" class="input" /></div>
            <div class="field" style="grid-column:1 / -1"><label>Description</label><input type="text" [(ngModel)]="activiteForm.description" name="description" placeholder="Optionnel" class="input" /></div>
            <div class="dialog-actions" style="grid-column:1 / -1">
              <button type="button" (click)="showActiviteForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="savingActivite()" class="btn btn-primary">
                @if (savingActivite()) { <span class="material-symbols-outlined" style="font-size:14px">progress_activity</span> } Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class MarketingHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  perf = signal<any>(null);
  conversionParCanal = signal<any[]>([]);
  personnel = signal<any[]>([]);
  activites = signal<any[]>([]);

  showPersonnelForm = signal(false);
  savingPersonnel = signal(false);
  editingPersonnelId = signal<string | null>(null);
  personnelForm: any = { nom: '', prenom: '', contact1: '', email: '', poste: '', notePerformance: null, statut: 'actif' };

  showActiviteForm = signal(false);
  savingActivite = signal(false);
  activiteForm: any = { titre: '', type: '', budget: null, dateDebut: '', dateFin: '', description: '' };

  ngOnInit() { this.loadPerf(); this.loadConversion(); this.loadPersonnel(); this.loadActivites(); }

  maxEvolution() { const evo = this.perf()?.evolution || []; return Math.max(...evo.map((m: any) => m.total), 1); }

  loadPerf() { this.http.get<any>(`${environment.apiUrl}/marketing/performance`).subscribe({ next: (d) => this.perf.set(d), error: () => this.perf.set(null) }); }
  loadConversion() { this.http.get<any[]>(`${environment.apiUrl}/marketing/conversion-par-canal`).subscribe({ next: (d) => this.conversionParCanal.set(d), error: () => this.conversionParCanal.set([]) }); }
  loadPersonnel() { this.http.get<any[]>(`${environment.apiUrl}/marketing/personnel`).subscribe({ next: (d) => this.personnel.set(d), error: () => this.personnel.set([]) }); }
  loadActivites() { this.http.get<any[]>(`${environment.apiUrl}/marketing/activites`).subscribe({ next: (d) => this.activites.set(d), error: () => this.activites.set([]) }); }

  openCreatePersonnel() {
    this.editingPersonnelId.set(null);
    this.personnelForm = { nom: '', prenom: '', contact1: '', email: '', poste: '', notePerformance: null, statut: 'actif' };
    this.showPersonnelForm.set(true);
  }

  openEditPersonnel(p: any) {
    this.editingPersonnelId.set(p.id);
    this.personnelForm = { nom: p.nom, prenom: p.prenom, contact1: p.contact1 || '', email: p.email || '', poste: p.poste || '', notePerformance: p.notePerformance ?? null, statut: p.statut || 'actif' };
    this.showPersonnelForm.set(true);
  }

  savePersonnel() {
    if (!this.personnelForm.nom || !this.personnelForm.prenom || !this.personnelForm.contact1) {
      this.alertService.error('Nom, prénom et contact sont obligatoires');
      return;
    }
    this.savingPersonnel.set(true);
    const id = this.editingPersonnelId();
    const req = id
      ? this.http.patch(`${environment.apiUrl}/marketing/personnel/${id}`, this.personnelForm)
      : this.http.post(`${environment.apiUrl}/marketing/personnel`, this.personnelForm);
    req.subscribe({
      next: () => {
        this.savingPersonnel.set(false);
        this.showPersonnelForm.set(false);
        this.alertService.success(id ? 'Membre mis à jour' : 'Membre ajouté');
        this.loadPersonnel();
        this.loadPerf();
      },
      error: (err) => { this.savingPersonnel.set(false); this.alertService.error(err.error?.message || 'Erreur lors de l\'enregistrement'); },
    });
  }

  async confirmDeletePersonnel(p: any) {
    const ok = await this.alertService.confirm({
      title: 'Retirer ce membre ?',
      html: `<strong>${p.prenom} ${p.nom}</strong> sera retiré du personnel marketing.`,
      confirmText: 'Retirer',
      danger: true,
    });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/marketing/personnel/${p.id}`).subscribe({
      next: () => { this.alertService.success('Membre retiré'); this.loadPersonnel(); this.loadPerf(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la suppression'),
    });
  }

  openCreateActivite() {
    this.activiteForm = { titre: '', type: '', budget: null, dateDebut: '', dateFin: '', description: '' };
    this.showActiviteForm.set(true);
  }

  saveActivite() {
    if (!this.activiteForm.titre) {
      this.alertService.error('Le titre est obligatoire');
      return;
    }
    this.savingActivite.set(true);
    this.http.post(`${environment.apiUrl}/marketing/activites`, this.activiteForm).subscribe({
      next: () => {
        this.savingActivite.set(false);
        this.showActiviteForm.set(false);
        this.alertService.success('Activité créée');
        this.loadActivites();
      },
      error: (err) => { this.savingActivite.set(false); this.alertService.error(err.error?.message || 'Erreur lors de la création'); },
    });
  }
}
