import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-secretariat-prospects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="gs-panel">
        <div class="gs-panel-head">
          <h3 style="margin:0;font-size:18px">Prospects ({{ prospectsTotal() }})</h3>
          <div style="display:flex;align-items:center;gap:8px">
            <select [(ngModel)]="filterStatut" (ngModelChange)="loadProspects()" class="input" style="width:auto">
              <option [ngValue]="null">Tous les statuts</option>
              <option value="CONTACTE">Contacté</option>
              <option value="INSCRIT">Inscrit</option>
              <option value="PERDU">Perdu</option>
            </select>
            <button (click)="openCreate()" class="btn btn-primary">
              <span class="material-symbols-outlined" style="font-size:18px">person_add</span> Ajouter
            </button>
          </div>
        </div>
        <div class="gs-panel-body">
          <div style="overflow-x:auto">
            <table class="table">
            <thead>
              <tr><th>Nom</th><th>Contact</th><th>Filière souhaitée</th><th>Statut</th><th>Relances</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (p of prospects(); track p.id) {
                <tr>
                  <td style="font-weight:500">{{ p.nom }} {{ p.prenom }}</td>
                  <td>{{ p.telephone || p.email || '—' }}</td>
                  <td>{{ p.filiereSouhaitee || '—' }}</td>
                  <td><span class="tag" [class]="prospectBadgeClass(p.statut)">{{ p.statut }}</span></td>
                  <td style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ p.nombreRelances }}@if (p.derniereRelance) { — {{ p.derniereRelance | date:'dd/MM/yy' }} }</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:4px">
                      <button (click)="openRelance(p)" class="btn btn-icon btn-secondary" title="Relancer"><span class="material-symbols-outlined" style="font-size:18px">campaign</span></button>
                      <button (click)="openEdit(p)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
                      <button (click)="confirmDelete(p)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="table-empty">
                  <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">groups</span>
                  Aucun prospect enregistré
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>

    @if (showForm()) {
      <div class="dialog-backdrop" (click)="showForm.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">{{ editingId() ? 'Modifier le prospect' : 'Ajouter un prospect' }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="save()" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="field"><label>Nom</label><input type="text" [(ngModel)]="form.nom" name="nom" required class="input" /></div>
            <div class="field"><label>Prénom</label><input type="text" [(ngModel)]="form.prenom" name="prenom" required class="input" /></div>
            <div class="field"><label>Téléphone</label><input type="text" [(ngModel)]="form.telephone" name="telephone" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Email</label><input type="email" [(ngModel)]="form.email" name="email" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Filière souhaitée</label><input type="text" [(ngModel)]="form.filiereSouhaitee" name="filiereSouhaitee" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Lieu d'habitation</label><input type="text" [(ngModel)]="form.lieuHabitation" name="lieuHabitation" placeholder="Optionnel" class="input" /></div>
            @if (editingId()) {
              <div class="field" style="grid-column:span 2"><label>Statut</label><select [(ngModel)]="form.statut" name="statut" class="input"><option value="CONTACTE">Contacté</option><option value="INSCRIT">Inscrit</option><option value="PERDU">Perdu</option></select></div>
            }
            <div class="field" style="grid-column:span 2"><label>Notes</label><input type="text" [(ngModel)]="form.notes" name="notes" placeholder="Optionnel" class="input" /></div>
            <div class="dialog-actions" style="grid-column:span 2">
              <button type="button" (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="saving()" class="btn btn-primary">
                @if (saving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } {{ editingId() ? 'Mettre à jour' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (relanceTarget(); as p) {
      <div class="dialog-backdrop" (click)="relanceTarget.set(null)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 class="dialog-title">Relancer {{ p.prenom }} {{ p.nom }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="relanceTarget.set(null)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;gap:16px">
              <label class="radio"><input type="checkbox" [(ngModel)]="relanceCanaux.email" [disabled]="!p.email" /><span class="dot"></span> Email {{ !p.email ? '(non renseigné)' : '' }}</label>
              <label class="radio"><input type="checkbox" [(ngModel)]="relanceCanaux.whatsapp" [disabled]="!p.telephone" /><span class="dot"></span> WhatsApp {{ !p.telephone ? '(non renseigné)' : '' }}</label>
            </div>
            <textarea [(ngModel)]="relanceMessage" rows="4" [placeholder]="'Bonjour ' + p.prenom + ', nous n\\'avons pas encore reçu votre confirmation d\\'inscription...'" class="input"></textarea>
            <div class="dialog-actions">
              <button (click)="relanceTarget.set(null)" class="btn btn-secondary">Annuler</button>
              <button (click)="envoyerRelance()" [disabled]="sendingRelance() || (!relanceCanaux.email && !relanceCanaux.whatsapp)" class="btn btn-primary">
                @if (sendingRelance()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } Envoyer la relance
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class SecretariatProspectsComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  prospects = signal<any[]>([]);
  prospectsTotal = signal(0);
  filterStatut: string | null = null;

  showForm = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  form: any = { nom: '', prenom: '', telephone: '', email: '', filiereSouhaitee: '', lieuHabitation: '', notes: '', statut: 'CONTACTE' };

  relanceTarget = signal<any>(null);
  relanceCanaux = { email: false, whatsapp: false };
  relanceMessage = '';
  sendingRelance = signal(false);

  ngOnInit() { this.loadProspects(); }

  prospectBadgeClass(s: string): string {
    return {
      CONTACTE: 'tag-neutral',
      INSCRIT: 'tag-success',
      PERDU: 'tag-danger',
    }[s] || 'tag-neutral';
  }

  loadProspects() {
    const qs = this.filterStatut ? `?statut=${this.filterStatut}&limit=100` : '?limit=100';
    this.http.get<any>(`${environment.apiUrl}/visiteurs${qs}`).subscribe({
      next: (res) => { this.prospects.set(res.data || []); this.prospectsTotal.set(res.total || 0); },
      error: () => { this.prospects.set([]); this.prospectsTotal.set(0); },
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { nom: '', prenom: '', telephone: '', email: '', filiereSouhaitee: '', lieuHabitation: '', notes: '', statut: 'CONTACTE' };
    this.showForm.set(true);
  }

  openEdit(p: any) {
    this.editingId.set(p.id);
    this.form = { nom: p.nom, prenom: p.prenom, telephone: p.telephone || '', email: p.email || '', filiereSouhaitee: p.filiereSouhaitee || '', lieuHabitation: p.lieuHabitation || '', notes: p.notes || '', statut: p.statut };
    this.showForm.set(true);
  }

  save() {
    if (!this.form.nom || !this.form.prenom) {
      this.alertService.error('Nom et prénom sont obligatoires');
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.patch(`${environment.apiUrl}/visiteurs/${id}`, this.form)
      : this.http.post(`${environment.apiUrl}/visiteurs`, this.form);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.alertService.success(id ? 'Prospect mis à jour' : 'Prospect ajouté');
        this.loadProspects();
      },
      error: (err) => { this.saving.set(false); this.alertService.error(err.error?.message || "Erreur lors de l'enregistrement"); },
    });
  }

  async confirmDelete(p: any) {
    const ok = await this.alertService.confirm({ title: 'Supprimer ce prospect ?', html: `<strong>${p.prenom} ${p.nom}</strong> sera définitivement supprimé.`, confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/visiteurs/${p.id}`).subscribe({
      next: () => { this.alertService.success('Prospect supprimé'); this.loadProspects(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la suppression'),
    });
  }

  openRelance(p: any) {
    this.relanceTarget.set(p);
    this.relanceCanaux = { email: !!p.email, whatsapp: !!p.telephone };
    this.relanceMessage = '';
  }

  envoyerRelance() {
    const p = this.relanceTarget();
    if (!p) return;
    this.sendingRelance.set(true);
    this.http.post<any>(`${environment.apiUrl}/visiteurs/${p.id}/relance`, {
      message: this.relanceMessage.trim() || undefined,
      canaux: this.relanceCanaux,
    }).subscribe({
      next: (res) => {
        this.sendingRelance.set(false);
        this.relanceTarget.set(null);
        const echecs = (res.resultats || []).filter((r: any) => !r.sent);
        if (echecs.length > 0) {
          this.alertService.warning(`Relance envoyée avec des échecs : ${echecs.map((e: any) => e.canal + ' — ' + e.error).join(', ')}`);
        } else {
          this.alertService.success('Relance envoyée');
        }
        this.loadProspects();
      },
      error: (err) => { this.sendingRelance.set(false); this.alertService.error(err.error?.message || 'Erreur lors de la relance'); },
    });
  }
}
