import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-secretariat-courrier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="gs-panel">
        <div class="gs-panel-head">
          <h3 style="margin:0;font-size:18px">Registre du courrier</h3>
          <div style="display:flex;align-items:center;gap:8px">
            <select [(ngModel)]="filterType" (ngModelChange)="loadCourriers()" class="input" style="width:auto">
              <option [ngValue]="null">Tous</option>
              <option value="ENTRANT">Entrant</option>
              <option value="SORTANT">Sortant</option>
            </select>
            <button (click)="openCreate()" class="btn btn-primary">
              <span class="material-symbols-outlined" style="font-size:18px">add</span> Enregistrer
            </button>
          </div>
        </div>
        <div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr><th>Type</th><th>Objet</th><th>Expéditeur/Destinataire</th><th>Destinataire interne</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                @for (c of courriers(); track c.id) {
                  <tr>
                    <td><span class="tag tag-neutral">{{ c.type === 'ENTRANT' ? 'Entrant' : 'Sortant' }}</span></td>
                    <td style="font-weight:500">{{ c.objet }}</td>
                    <td>{{ c.expediteur || c.destinataire || '—' }}</td>
                    <td>{{ c.destinataireInterne ? (c.destinataireInterne.prenom + ' ' + c.destinataireInterne.nom) : '—' }}</td>
                    <td>{{ c.date | date:'dd/MM/yyyy' }}</td>
                    <td><button (click)="confirmDelete(c)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></td>
                  </tr>
                } @empty {
                  <tr><td colspan="6" class="table-empty">
                    <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">mail</span>
                    Aucun courrier enregistré
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
            <h3 class="dialog-title">Enregistrer un courrier</h3>
            <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="save()" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="field" style="grid-column:span 2">
              <label>Type</label>
              <div style="display:flex;gap:8px">
                <button type="button" (click)="form.type = 'ENTRANT'" class="btn" [class.btn-primary]="form.type === 'ENTRANT'" [class.btn-secondary]="form.type !== 'ENTRANT'" style="flex:1">Entrant</button>
                <button type="button" (click)="form.type = 'SORTANT'" class="btn" [class.btn-primary]="form.type === 'SORTANT'" [class.btn-secondary]="form.type !== 'SORTANT'" style="flex:1">Sortant</button>
              </div>
            </div>
            <div class="field" style="grid-column:span 2"><label>Objet</label><input type="text" [(ngModel)]="form.objet" name="objet" required class="input" /></div>
            <div class="field"><label>{{ form.type === 'ENTRANT' ? 'Expéditeur' : 'Destinataire' }}</label><input type="text" [(ngModel)]="form.expediteur" name="expediteur" placeholder="Optionnel" class="input" /></div>
            <div class="field"><label>Référence</label><input type="text" [(ngModel)]="form.reference" name="reference" placeholder="Optionnel" class="input" /></div>
            <div class="field" style="grid-column:span 2">
              <label>Destinataire interne (personnel concerné)</label>
              <select [(ngModel)]="form.destinataireInterneId" name="destinataireInterneId" class="input">
                <option [ngValue]="null">Aucun</option>
                @for (u of annuaire(); track u.id) { <option [ngValue]="u.id">{{ u.prenom }} {{ u.nom }} — {{ u.role }}</option> }
              </select>
            </div>
            <div class="field" style="grid-column:span 2"><label>Date</label><input type="date" [(ngModel)]="form.date" name="date" class="input" /></div>
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
export class SecretariatCourrierComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  annuaire = signal<any[]>([]);
  courriers = signal<any[]>([]);
  filterType: string | null = null;

  showForm = signal(false);
  saving = signal(false);
  form: any = { type: 'ENTRANT', objet: '', expediteur: '', reference: '', destinataireInterneId: null, date: '' };

  ngOnInit() {
    this.loadAnnuaire();
    this.loadCourriers();
  }

  loadAnnuaire() { this.http.get<any[]>(`${environment.apiUrl}/secretariat/annuaire`).subscribe({ next: (d) => this.annuaire.set(d || []), error: () => this.annuaire.set([]) }); }

  loadCourriers() {
    const qs = this.filterType ? `?type=${this.filterType}` : '';
    this.http.get<any>(`${environment.apiUrl}/secretariat/courriers${qs}`).subscribe({ next: (res) => this.courriers.set(res.data || []), error: () => this.courriers.set([]) });
  }

  openCreate() {
    this.form = { type: 'ENTRANT', objet: '', expediteur: '', reference: '', destinataireInterneId: null, date: new Date().toISOString().slice(0, 10) };
    this.showForm.set(true);
  }

  save() {
    if (!this.form.objet) {
      this.alertService.error("L'objet est obligatoire");
      return;
    }
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/secretariat/courriers`, this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.alertService.success('Courrier enregistré');
        this.loadCourriers();
      },
      error: (err) => { this.saving.set(false); this.alertService.error(err.error?.message || "Erreur lors de l'enregistrement"); },
    });
  }

  async confirmDelete(c: any) {
    const ok = await this.alertService.confirm({ title: 'Supprimer ce courrier ?', confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/secretariat/courriers/${c.id}`).subscribe({
      next: () => { this.alertService.success('Courrier supprimé'); this.loadCourriers(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la suppression'),
    });
  }
}
