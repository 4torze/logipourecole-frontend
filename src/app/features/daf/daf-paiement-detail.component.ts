import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-daf-paiement-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width:700px">
      <button (click)="router.navigate(['/daf/finance'])" class="btn btn-ghost" style="padding-left:0;margin-bottom:16px">
        <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span> Retour à la finance
      </button>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
          <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
        </div>
      }
      @if (!loading() && paiement(); as p) {
        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-head">
            <h3 style="margin:0;font-size:16px">Reçu N° {{ p.numeroRecu }} @if (p.annule) { <span class="tag tag-danger" style="margin-left:8px">Annulé</span> }</h3>
            <div style="display:flex;gap:8px">
              <button (click)="downloadRecu()" class="btn btn-secondary btn-sm">
                <span class="material-symbols-outlined" style="font-size:16px">download</span> Télécharger le reçu
              </button>
              @if (!p.annule) {
                <button (click)="showAnnuler.set(true)" class="btn btn-danger btn-sm">
                  <span class="material-symbols-outlined" style="font-size:16px">cancel</span> Annuler
                </button>
              }
            </div>
          </div>
          <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:16px">
            @if (p.annule) {
              <div style="padding:12px;border-radius:8px;background:color-mix(in srgb, var(--color-danger) 10%, transparent);font-size:13px">
                Ce paiement a été annulé. @if (p.motifAnnulation) { Motif : {{ p.motifAnnulation }} }
              </div>
            }
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px">
              <div class="gs-stat"><span class="gs-stat-label">Montant</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ p.montant | number:'1.0-0':'fr-FR' }}</span></div>
              <div class="gs-stat"><span class="gs-stat-label">Mode</span><span class="gs-stat-num" style="font-size:16px">{{ p.mode }}</span></div>
              <div class="gs-stat"><span class="gs-stat-label">Date</span><span class="gs-stat-num" style="font-size:16px">{{ p.datePaiement | date:'dd/MM/yyyy' }}</span></div>
            </div>

            <div class="hr"></div>

            <div>
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:6px">Élève</div>
              <a [routerLink]="['/dg/eleves']" style="color:var(--color-accent);text-decoration:underline;font-weight:600">{{ p.etudiant?.prenom }} {{ p.etudiant?.nom }}</a>
              @if (p.etudiant?.inscriptions?.[0]?.classe) {
                <span class="text-muted" style="font-size:13px"> — {{ p.etudiant.inscriptions[0].classe.nom }}</span>
              }
            </div>

            @if (p.versementType) {
              <div>
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:6px">Tranche</div>
                <span>{{ p.versementType.ordre }} — {{ p.versementType.libelle }}</span>
              </div>
            }

            <div>
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:6px">Saisi par</div>
              <span>{{ p.saisisseur?.prenom }} {{ p.saisisseur?.nom }}</span>
            </div>
          </div>
        </div>
      }
      @if (!loading() && !paiement()) {
        <div class="gs-panel"><div class="gs-panel-body">Paiement introuvable</div></div>
      }
    </div>

    @if (showAnnuler()) {
      <div class="dialog-backdrop" (click)="showAnnuler.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span class="dialog-title">Annuler ce paiement ?</span>
            <button class="btn btn-icon btn-secondary" (click)="showAnnuler.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent);margin:0">Le paiement restera visible pour la traçabilité, mais sera exclu des totaux financiers.</p>
          <div class="field"><label>Motif (optionnel)</label><input type="text" [(ngModel)]="motifAnnulation" class="input" /></div>
          <div class="dialog-actions">
            <button (click)="showAnnuler.set(false)" class="btn btn-secondary">Annuler</button>
            <button (click)="confirmAnnuler()" [disabled]="annulerSaving()" class="btn btn-danger">
              @if (annulerSaving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } Confirmer l'annulation
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DafPaiementDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  paiementId = '';
  paiement = signal<any>(null);
  loading = signal(true);
  showAnnuler = signal(false);
  annulerSaving = signal(false);
  motifAnnulation = '';

  ngOnInit() {
    this.paiementId = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    this.http.get<any>(`${environment.apiUrl}/daf/paiements/${this.paiementId}`).subscribe({
      next: (d) => { this.paiement.set(d); this.loading.set(false); },
      error: () => { this.loading.set(false); this.alertService.error('Erreur lors du chargement du paiement'); },
    });
  }

  confirmAnnuler() {
    this.annulerSaving.set(true);
    this.http.patch(`${environment.apiUrl}/daf/paiements/${this.paiementId}/annuler`, { motifAnnulation: this.motifAnnulation || undefined }).subscribe({
      next: () => {
        this.annulerSaving.set(false);
        this.showAnnuler.set(false);
        this.motifAnnulation = '';
        this.alertService.success('Paiement annulé');
        this.load();
      },
      error: (err: any) => { this.annulerSaving.set(false); this.alertService.error(err?.error?.message || 'Erreur lors de l\'annulation'); },
    });
  }

  downloadRecu() {
    this.http.get(`${environment.apiUrl}/daf/paiements/recu/${this.paiementId}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-${this.paiement()?.numeroRecu || this.paiementId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.alertService.error('Erreur lors du téléchargement du reçu'),
    });
  }
}
