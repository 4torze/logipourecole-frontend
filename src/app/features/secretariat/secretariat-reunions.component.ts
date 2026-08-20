import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-secretariat-reunions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      @if (rappels().length > 0) {
        <div class="gs-panel" style="margin-bottom:24px"><div class="gs-panel-body">
          <h3 style="display:flex;align-items:center;gap:8px;font-size:16px;margin-bottom:12px"><span class="material-symbols-outlined" style="color:var(--color-accent);font-size:20px">notifications_active</span> Rappels — Réunions à venir (7 jours)</h3>
          <div style="display:flex;flex-direction:column">
            @for (r of rappels(); track r.id) {
              <div style="padding:10px 0;font-size:14px;border-top:1px solid var(--color-divider)">
                <strong>{{ r.titre }}</strong>
                <span class="text-muted"> — {{ r.date | date:'dd/MM/yyyy à HH:mm' }}</span>
                @if (r.lieu) { <span class="text-muted"> · {{ r.lieu }}</span> }
              </div>
            }
          </div>
        </div></div>
      }

      <div class="gs-panel"><div class="gs-panel-body">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h3 style="font-size:18px;margin:0">Réunions</h3>
          <button (click)="openCreate()" class="btn btn-primary">
            <span class="material-symbols-outlined" style="font-size:18px">add</span> Planifier une réunion
          </button>
        </div>
        <div class="table-scroll">
          <table class="table">
            <thead>
              <tr><th>Titre</th><th>Date</th><th>Lieu</th><th>Participants</th><th>Statut</th><th>Compte rendu</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (r of reunions(); track r.id) {
                <tr>
                  <td style="font-weight:500">{{ r.titre }}</td>
                  <td>{{ r.date | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ r.lieu || '—' }}</td>
                  <td>{{ (r.participants?.membres || []).length }}</td>
                  <td><span class="tag" [class]="r.statut === 'planifiee' ? 'tag-neutral' : 'tag-success'">{{ r.statut }}</span></td>
                  <td>{{ r.compteRendu ? 'Oui' : 'Non' }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:4px">
                      <button (click)="openEdit(r)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
                      <button (click)="openCompteRendu(r)" class="btn btn-icon btn-secondary" title="Compte rendu"><span class="material-symbols-outlined" style="font-size:18px">description</span></button>
                      <button (click)="confirmDelete(r)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table-empty">
                  <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">event</span>
                  Aucune réunion planifiée
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      </div></div>
    </div>

    @if (showForm()) {
      <div class="dialog-backdrop" (click)="showForm.set(false)">
        <div class="dialog" style="max-height:85vh;overflow-y:auto" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">{{ editingId() ? 'Modifier la réunion' : 'Planifier une réunion' }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="save()" style="display:flex;flex-direction:column;gap:16px">
            <div class="field"><label>Titre</label><input type="text" [(ngModel)]="form.titre" name="titre" required class="input" /></div>
            <div class="field"><label>Sujet</label><input type="text" [(ngModel)]="form.sujet" name="sujet" placeholder="Optionnel" class="input" /></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="field"><label>Date &amp; heure</label><input type="datetime-local" [(ngModel)]="form.date" name="date" required class="input" /></div>
              <div class="field"><label>Lieu</label><input type="text" [(ngModel)]="form.lieu" name="lieu" placeholder="Optionnel" class="input" /></div>
            </div>
            @if (editingId()) {
              <div class="field"><label>Statut</label><select [(ngModel)]="form.statut" name="statut" class="input"><option value="planifiee">Planifiée</option><option value="terminee">Terminée</option><option value="annulee">Annulée</option></select></div>
            }
            <div class="field">
              <label>Participants concernés</label>
              <p style="font-size:12px;margin:-4px 0 6px" class="text-muted">Une notification (in-app, email et/ou WhatsApp selon les paramètres) leur sera envoyée.</p>
              <div style="max-height:160px;overflow-y:auto;border:1px solid var(--color-divider)">
                @for (u of annuaire(); track u.id) {
                  <label style="display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:14px;cursor:pointer;border-top:1px solid var(--color-divider)">
                    <input type="checkbox" [checked]="isParticipant(u.id)" (change)="toggleParticipant(u.id)" style="width:16px;height:16px" />
                    <span>{{ u.prenom }} {{ u.nom }}</span>
                    <span class="text-muted" style="font-size:12px;margin-left:auto">{{ u.role }}</span>
                  </label>
                }
              </div>
            </div>
            <div class="dialog-actions">
              <button type="button" (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="saving()" class="btn btn-primary">
                @if (saving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } {{ editingId() ? 'Mettre à jour' : 'Planifier' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showCompteRendu()) {
      <div class="dialog-backdrop" (click)="showCompteRendu.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Compte rendu — {{ compteRenduTarget()?.titre }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="showCompteRendu.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px">
            <textarea [(ngModel)]="compteRenduText" rows="6" placeholder="Résumé de la réunion..." class="input"></textarea>
            <div class="dialog-actions">
              <button (click)="showCompteRendu.set(false)" class="btn btn-secondary">Annuler</button>
              <button (click)="saveCompteRendu()" [disabled]="savingCompteRendu() || !compteRenduText.trim()" class="btn btn-primary">
                @if (savingCompteRendu()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class SecretariatReunionsComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  annuaire = signal<any[]>([]);
  reunions = signal<any[]>([]);
  rappels = signal<any[]>([]);

  showForm = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  form: any = { titre: '', sujet: '', date: '', lieu: '', statut: 'planifiee', participants: { membres: [] }};

  showCompteRendu = signal(false);
  savingCompteRendu = signal(false);
  compteRenduTarget = signal<any>(null);
  compteRenduText = '';

  ngOnInit() {
    this.loadAnnuaire();
    this.loadReunions();
    this.loadRappels();
  }

  loadAnnuaire() { this.http.get<any[]>(`${environment.apiUrl}/secretariat/annuaire`).subscribe({ next: (d) => this.annuaire.set(d || []), error: () => this.annuaire.set([]) }); }
  loadReunions() { this.http.get<any>(`${environment.apiUrl}/secretariat/reunions`).subscribe({ next: (res) => this.reunions.set(res.data || []), error: () => this.reunions.set([]) }); }
  loadRappels() { this.http.get<any[]>(`${environment.apiUrl}/secretariat/reunions/rappels`).subscribe({ next: (d) => this.rappels.set(d), error: () => this.rappels.set([]) }); }

  openCreate() {
    this.editingId.set(null);
    this.form = { titre: '', sujet: '', date: '', lieu: '', statut: 'planifiee', participants: { membres: [] }};
    this.showForm.set(true);
  }

  openEdit(r: any) {
    this.editingId.set(r.id);
    this.form = {
      titre: r.titre, sujet: r.sujet || '', date: r.date ? r.date.slice(0, 16) : '', lieu: r.lieu || '',
      statut: r.statut || 'planifiee', participants: { membres: [...(r.participants?.membres || [])] },
    };
    this.showForm.set(true);
  }

  isParticipant(userId: string): boolean {
    return (this.form.participants?.membres || []).includes(userId);
  }

  toggleParticipant(userId: string) {
    const membres: string[] = this.form.participants?.membres || [];
    this.form.participants = {
      membres: membres.includes(userId) ? membres.filter((id) => id !== userId) : [...membres, userId],
    };
  }

  save() {
    if (!this.form.titre || !this.form.date) {
      this.alertService.error('Titre et date sont obligatoires');
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.patch(`${environment.apiUrl}/secretariat/reunions/${id}`, this.form)
      : this.http.post(`${environment.apiUrl}/secretariat/reunions`, this.form);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.alertService.success(id ? 'Réunion mise à jour' : 'Réunion planifiée, participants notifiés');
        this.loadReunions();
        this.loadRappels();
      },
      error: (err) => { this.saving.set(false); this.alertService.error(err.error?.message || "Erreur lors de l'enregistrement"); },
    });
  }

  openCompteRendu(r: any) {
    this.compteRenduTarget.set(r);
    this.compteRenduText = r.compteRendu || '';
    this.showCompteRendu.set(true);
  }

  saveCompteRendu() {
    const r = this.compteRenduTarget();
    if (!r || !this.compteRenduText.trim()) return;
    this.savingCompteRendu.set(true);
    this.http.post(`${environment.apiUrl}/secretariat/reunions/${r.id}/compte-rendu`, { compteRendu: this.compteRenduText.trim() }).subscribe({
      next: () => {
        this.savingCompteRendu.set(false);
        this.showCompteRendu.set(false);
        this.alertService.success('Compte rendu enregistré');
        this.loadReunions();
      },
      error: (err) => { this.savingCompteRendu.set(false); this.alertService.error(err.error?.message || "Erreur lors de l'enregistrement"); },
    });
  }

  async confirmDelete(r: any) {
    const ok = await this.alertService.confirm({ title: 'Supprimer cette réunion ?', html: `<strong>${r.titre}</strong> sera définitivement supprimée.`, confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/secretariat/reunions/${r.id}`).subscribe({
      next: () => { this.alertService.success('Réunion supprimée'); this.loadReunions(); this.loadRappels(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la suppression'),
    });
  }
}
