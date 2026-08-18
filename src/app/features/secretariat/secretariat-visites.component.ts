import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-secretariat-visites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      @if (rdvDuJour().length > 0) {
        <div class="gs-panel" style="margin-bottom:24px"><div class="gs-panel-body">
          <h3 style="display:flex;align-items:center;gap:8px;font-size:16px;margin-bottom:12px"><span class="material-symbols-outlined" style="color:var(--color-accent);font-size:20px">today</span> Aujourd'hui ({{ rdvDuJour().length }})</h3>
          <div style="display:flex;flex-direction:column">
            @for (r of rdvDuJour(); track r.id) {
              <div style="padding:10px 0;font-size:14px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--color-divider)">
                <div>
                  <strong>{{ r.nom }}</strong>
                  <span class="text-muted"> — {{ r.dateHeure | date:'HH:mm' }} · {{ r.motif }}</span>
                  @if (r.personneConcernee) { <span class="text-muted"> · pour {{ r.personneConcernee.prenom }} {{ r.personneConcernee.nom }}</span> }
                </div>
                <span class="tag" [class]="statutBadgeClass(r.statut)">{{ statutLabel(r.statut) }}</span>
              </div>
            }
          </div>
        </div></div>
      }

      <div class="gs-panel"><div class="gs-panel-body">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px">
          <h3 style="font-size:18px;margin:0">Visites &amp; rendez-vous</h3>
          <div style="display:flex;align-items:center;gap:8px">
            <select [(ngModel)]="filterStatut" (ngModelChange)="loadRendezVous()" class="input" style="width:auto">
              <option [ngValue]="null">Tous les statuts</option>
              <option value="PLANIFIE">Planifié</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="ANNULE">Annulé</option>
            </select>
            <button (click)="openCreate()" class="btn btn-primary">
              <span class="material-symbols-outlined" style="font-size:18px">add</span> Enregistrer
            </button>
          </div>
        </div>
        <div style="overflow-x:auto">
          <table class="table">
            <thead>
              <tr><th>Nom</th><th>Type</th><th>Motif</th><th>Concerné</th><th>Date/heure</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (r of rendezVous(); track r.id) {
                <tr>
                  <td style="font-weight:500">{{ r.nom }}</td>
                  <td>{{ r.type === 'RENDEZ_VOUS' ? 'Rendez-vous' : 'Visite' }}</td>
                  <td>{{ r.motif }}</td>
                  <td>{{ r.personneConcernee ? (r.personneConcernee.prenom + ' ' + r.personneConcernee.nom) : '—' }}</td>
                  <td>{{ r.dateHeure | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td><span class="tag" [class]="statutBadgeClass(r.statut)">{{ statutLabel(r.statut) }}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:4px">
                      @if (r.statut === 'PLANIFIE') {
                        <button (click)="marquerArrivee(r)" class="btn btn-icon btn-secondary" title="Marquer l'arrivée"><span class="material-symbols-outlined" style="font-size:18px">login</span></button>
                      }
                      @if (r.statut === 'EN_COURS') {
                        <button (click)="marquerDepart(r)" class="btn btn-icon btn-secondary" title="Marquer le départ"><span class="material-symbols-outlined" style="font-size:18px">logout</span></button>
                      }
                      <button (click)="confirmDelete(r)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table-empty">
                  <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">person_search</span>
                  Aucune visite ni rendez-vous enregistré
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      </div></div>
    </div>

    @if (showForm()) {
      <div class="dialog-backdrop" (click)="showForm.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Enregistrer une visite / un rendez-vous</h3>
            <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="save()" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="field" style="grid-column:span 2">
              <label>Type</label>
              <div style="display:flex;gap:8px">
                <button type="button" (click)="form.type = 'VISITE'" class="btn" [class.btn-primary]="form.type === 'VISITE'" [class.btn-secondary]="form.type !== 'VISITE'" style="flex:1">Visite (maintenant)</button>
                <button type="button" (click)="form.type = 'RENDEZ_VOUS'" class="btn" [class.btn-primary]="form.type === 'RENDEZ_VOUS'" [class.btn-secondary]="form.type !== 'RENDEZ_VOUS'" style="flex:1">Rendez-vous (planifié)</button>
              </div>
            </div>
            <div class="field" style="grid-column:span 2"><label>Nom du visiteur</label><input type="text" [(ngModel)]="form.nom" name="nom" required class="input" /></div>
            <div class="field"><label>Téléphone</label><input type="text" [(ngModel)]="form.telephone" name="telephone" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Email</label><input type="email" [(ngModel)]="form.email" name="email" placeholder="Optionnel" class="input" /></div>
            <div class="field" style="grid-column:span 2"><label>Motif</label><input type="text" [(ngModel)]="form.motif" name="motif" required class="input" /></div>
            <div class="field" style="grid-column:span 2">
              <label>Personne concernée</label>
              <select [(ngModel)]="form.personneConcerneeId" name="personneConcerneeId" class="input">
                <option [ngValue]="null">Aucune (accueil général)</option>
                @for (u of annuaire(); track u.id) { <option [ngValue]="u.id">{{ u.prenom }} {{ u.nom }} — {{ u.role }}</option> }
              </select>
              <p style="font-size:12px;margin:4px 0 0" class="text-muted">Si renseignée, elle recevra une notification.</p>
            </div>
            <div class="field" style="grid-column:span 2"><label>{{ form.type === 'RENDEZ_VOUS' ? 'Date et heure planifiées' : 'Date et heure' }}</label><input type="datetime-local" [(ngModel)]="form.dateHeure" name="dateHeure" required class="input" /></div>
            <div class="dialog-actions" style="grid-column:span 2">
              <button type="button" (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="saving()" class="btn btn-primary">
                @if (saving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class SecretariatVisitesComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  annuaire = signal<any[]>([]);
  rendezVous = signal<any[]>([]);
  rdvDuJour = signal<any[]>([]);
  filterStatut: string | null = null;

  showForm = signal(false);
  saving = signal(false);
  form: any = { nom: '', telephone: '', email: '', motif: '', personneConcerneeId: null, dateHeure: '', type: 'VISITE' };

  ngOnInit() {
    this.loadAnnuaire();
    this.loadRendezVous();
    this.loadRdvDuJour();
  }

  statutLabel(s: string): string {
    return { PLANIFIE: 'Planifié', EN_COURS: 'En cours', TERMINE: 'Terminé', ANNULE: 'Annulé' }[s] || s;
  }
  statutBadgeClass(s: string): string {
    return {
      PLANIFIE: 'tag-neutral',
      EN_COURS: 'tag-accent',
      TERMINE: 'tag-success',
      ANNULE: 'tag-danger',
    }[s] || 'tag-neutral';
  }

  loadAnnuaire() { this.http.get<any[]>(`${environment.apiUrl}/secretariat/annuaire`).subscribe({ next: (d) => this.annuaire.set(d || []), error: () => this.annuaire.set([]) }); }

  loadRendezVous() {
    const qs = this.filterStatut ? `?statut=${this.filterStatut}` : '';
    this.http.get<any>(`${environment.apiUrl}/secretariat/rendez-vous${qs}`).subscribe({ next: (res) => this.rendezVous.set(res.data || []), error: () => this.rendezVous.set([]) });
  }
  loadRdvDuJour() {
    this.http.get<any[]>(`${environment.apiUrl}/secretariat/rendez-vous/jour`).subscribe({ next: (d) => this.rdvDuJour.set(d || []), error: () => this.rdvDuJour.set([]) });
  }

  openCreate() {
    this.form = { nom: '', telephone: '', email: '', motif: '', personneConcerneeId: null, dateHeure: '', type: 'VISITE' };
    this.showForm.set(true);
  }

  save() {
    if (!this.form.nom || !this.form.motif || !this.form.dateHeure) {
      this.alertService.error('Nom, motif et date/heure sont obligatoires');
      return;
    }
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/secretariat/rendez-vous`, this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.alertService.success(this.form.personneConcerneeId ? 'Enregistré, personne concernée notifiée' : 'Enregistré');
        this.loadRendezVous();
        this.loadRdvDuJour();
      },
      error: (err) => { this.saving.set(false); this.alertService.error(err.error?.message || "Erreur lors de l'enregistrement"); },
    });
  }

  marquerArrivee(r: any) {
    this.http.post(`${environment.apiUrl}/secretariat/rendez-vous/${r.id}/arrivee`, {}).subscribe({
      next: () => { this.alertService.success('Arrivée enregistrée'); this.loadRendezVous(); this.loadRdvDuJour(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur'),
    });
  }

  marquerDepart(r: any) {
    this.http.post(`${environment.apiUrl}/secretariat/rendez-vous/${r.id}/depart`, {}).subscribe({
      next: () => { this.alertService.success('Départ enregistré'); this.loadRendezVous(); this.loadRdvDuJour(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur'),
    });
  }

  async confirmDelete(r: any) {
    const ok = await this.alertService.confirm({ title: 'Supprimer cet enregistrement ?', confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/secretariat/rendez-vous/${r.id}`).subscribe({
      next: () => { this.alertService.success('Supprimé'); this.loadRendezVous(); this.loadRdvDuJour(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la suppression'),
    });
  }
}
