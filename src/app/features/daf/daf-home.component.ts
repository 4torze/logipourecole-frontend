import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-daf-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="padding:32px;display:flex;flex-direction:column;gap:28px;max-width:1440px;margin:0 auto">
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <h6 style="margin:0">Indicateurs</h6>
          <button (click)="exportPerformancePdf()" class="btn btn-secondary btn-sm">
            <span class="material-symbols-outlined" style="font-size:16px">picture_as_pdf</span> Exporter PDF
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
          <div class="gs-stat">
            <span class="gs-stat-label">Taux recouvrement</span>
            <span class="gs-stat-num" style="color:var(--color-accent)">{{ perf()?.tauxRecouvrement || 0 }}%</span>
            <div style="height:4px;background:var(--color-neutral-200);margin-top:4px"><div style="height:100%;background:var(--color-accent);transition:width .7s" [style.width.%]="perf()?.tauxRecouvrement || 0"></div></div>
          </div>
          <div class="gs-stat">
            <span class="gs-stat-label">Encaissé</span>
            <span class="gs-stat-num" style="color:var(--color-accent)">{{ formatMontant(perf()?.montantTotalEncaisse) }} FCFA</span>
          </div>
          <div class="gs-stat">
            <span class="gs-stat-label">Restant à recouvrer</span>
            <span class="gs-stat-num" style="color:var(--color-accent)">{{ formatMontant(perf()?.montantTotalRestant) }} FCFA</span>
          </div>
          <div class="gs-stat">
            <span class="gs-stat-label">Montant total à encaisser</span>
            <span class="gs-stat-num">{{ formatMontant(perf()?.montantTotalEncaisser) }} FCFA</span>
          </div>
          <div class="gs-stat">
            <span class="gs-stat-label">Effectif abandons</span>
            <span class="gs-stat-num" style="color:var(--color-accent-700)">{{ perf()?.effectifAbandons || 0 }}</span>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:3fr 2fr;gap:20px">
        <div class="gs-panel">
          <div class="gs-panel-head">
            <h3 style="margin:0;font-size:16px">Évolution des paiements</h3>
            <div style="display:flex;gap:4px">
              @for (g of groupByOptions; track g.key) {
                <button (click)="changeGroupBy(g.key)" class="btn btn-sm" [class.btn-primary]="groupBy() === g.key" [class.btn-secondary]="groupBy() !== g.key">{{ g.label }}</button>
              }
            </div>
          </div>
          <div class="gs-panel-body">
            @if (evolutionLoading()) {
              <div style="height:200px;display:flex;align-items:center;justify-content:center;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)"><span class="material-symbols-outlined animate-spin" style="font-size:18px;margin-right:8px">progress_activity</span> Chargement...</div>
            } @else if (paiementsChart().points.length > 0) {
              <svg viewBox="0 0 500 220" style="width:100%;height:auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="grad-daf-home" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="30" y1="30" x2="470" y2="30" stroke="var(--color-neutral-200)" stroke-width="1"/>
                <line x1="30" y1="110" x2="470" y2="110" stroke="var(--color-neutral-200)" stroke-width="1"/>
                <line x1="30" y1="190" x2="470" y2="190" stroke="var(--color-neutral-300)" stroke-width="1"/>
                @if (paiementsChart().areaPath) {
                  <path [attr.d]="paiementsChart().areaPath" fill="url(#grad-daf-home)"/>
                }
                @if (paiementsChart().linePath) {
                  <path [attr.d]="paiementsChart().linePath" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                }
                @for (p of paiementsChart().points; track $index) {
                  <circle [attr.cx]="p.x" [attr.cy]="p.y" r="4" fill="var(--color-surface)" stroke="var(--color-accent)" stroke-width="2.5"/>
                  <text [attr.x]="p.x" [attr.y]="p.y - 12" text-anchor="middle" font-size="9" fill="var(--color-text)" font-weight="600">{{ p.montant | number:'1.0-0':'fr-FR' }}</text>
                  <text [attr.x]="p.x" y="210" text-anchor="middle" font-size="10" fill="color-mix(in srgb, var(--color-text) 55%, transparent)">{{ p.label }}</text>
                }
              </svg>
            } @else {
              <div style="height:200px;display:flex;align-items:center;justify-content:center;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Aucun paiement enregistré</div>
            }
          </div>
        </div>

        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Taux de recouvrement</h3></div>
          <div class="gs-panel-body" style="display:flex;flex-direction:column;align-items:center;gap:16px">
            <div style="position:relative;flex:none">
              <svg width="140" height="140" viewBox="0 0 36 36" style="transform:rotate(-90deg)">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-neutral-200)" stroke-width="3.5"/>
                <circle cx="18" cy="18" r="15.915" fill="none" [attr.stroke]="(perf()?.tauxRecouvrement || 0) >= 75 ? 'var(--color-accent)' : ((perf()?.tauxRecouvrement || 0) >= 50 ? 'var(--color-accent-2)' : 'var(--color-accent-700)')" stroke-width="3.5" [attr.stroke-dasharray]="(perf()?.tauxRecouvrement || 0) + ' ' + (100 - (perf()?.tauxRecouvrement || 0))" stroke-linecap="round" style="transition: stroke-dasharray 0.5s;"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                <span style="font-size:22px;font-weight:800;font-family:var(--font-heading)">{{ perf()?.tauxRecouvrement || 0 }}%</span>
                <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">recouvré</span>
              </div>
            </div>
            <div style="width:100%;font-size:13px;display:flex;justify-content:space-between"><span style="color:color-mix(in srgb, var(--color-text) 65%, transparent)">Total attendu</span><strong style="font-family:var(--font-heading)">{{ formatMontant(perf()?.montantTotalEncaisser) }}</strong></div>

            <div class="hr" style="width:100%;margin:4px 0"></div>

            <div style="position:relative;flex:none">
              <svg width="120" height="120" viewBox="0 0 36 36" style="transform:rotate(-90deg)">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-neutral-200)" stroke-width="3.5"/>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-accent)" stroke-width="3.5" [attr.stroke-dasharray]="pctPayes() + ' ' + (100 - pctPayes())" stroke-linecap="round"/>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-accent-700)" stroke-width="3.5" [attr.stroke-dasharray]="pctImpayes() + ' ' + (100 - pctImpayes())" [attr.stroke-dashoffset]="-pctPayes()" stroke-linecap="round"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                <span style="font-size:16px;font-weight:800;font-family:var(--font-heading)">{{ (perf()?.effectifEnRegle || 0) + (perf()?.effectifQuiDoivent || 0) }}</span>
                <span style="font-size:10px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">élèves</span>
              </div>
            </div>
            <div style="width:100%;display:flex;flex-direction:column;gap:6px;font-size:12px">
              <div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:var(--color-accent);flex:none"></span><span style="flex:1">Payés</span><strong>{{ perf()?.effectifEnRegle || 0 }}</strong></div>
              <div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:var(--color-accent-700);flex:none"></span><span style="flex:1">Impayés</span><strong>{{ perf()?.effectifQuiDoivent || 0 }}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Objectif: Recouvrement</h3></div>
          <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:14px">
            <div style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Suivi des scolarités pour l'année en cours</div>
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--color-divider)"><span style="width:8px;height:8px;border-radius:50%;background:var(--color-accent);flex:none"></span><span style="flex:1;font-size:13px">Étudiants en règle</span><span style="font-size:18px;font-weight:800;font-family:var(--font-heading)">{{ perf()?.effectifEnRegle || 0 }}</span></div>
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--color-divider)"><span style="width:8px;height:8px;border-radius:50%;background:var(--color-accent-700);flex:none"></span><span style="flex:1;font-size:13px">Étudiants en retard</span><span style="font-size:18px;font-weight:800;font-family:var(--font-heading)">{{ perf()?.effectifQuiDoivent || 0 }}</span></div>
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0"><span style="width:8px;height:8px;border-radius:50%;background:var(--color-text);flex:none"></span><span style="flex:1;font-size:13px">Total inscrits</span><span style="font-size:18px;font-weight:800;font-family:var(--font-heading)">{{ (perf()?.effectifEnRegle || 0) + (perf()?.effectifQuiDoivent || 0) }}</span></div>
          </div>
        </div>
        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
          <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:6px">Accès direct aux tâches fréquentes</div>
            <button (click)="openPaiementForm()" class="btn btn-secondary btn-block">
              <span class="material-symbols-outlined" style="font-size:18px">payments</span>
              <span style="text-align:left">
                <span style="display:block;font-size:13px;font-weight:600">Enregistrer un paiement</span>
                <span style="display:block;font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Nouveau versement étudiant</span>
              </span>
            </button>
            <button (click)="openEtudiantForm()" class="btn btn-secondary btn-block">
              <span class="material-symbols-outlined" style="font-size:18px">person_add</span>
              <span style="text-align:left">
                <span style="display:block;font-size:13px;font-weight:600">Enregistrer un élève</span>
                <span style="display:block;font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Nouveau dossier administratif</span>
              </span>
            </button>
            <button routerLink="/daf/versements" class="btn btn-secondary btn-block">
              <span class="material-symbols-outlined" style="font-size:18px">view_column</span>
              <span style="text-align:left">
                <span style="display:block;font-size:13px;font-weight:600">Gérer les versements</span>
                <span style="display:block;font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Configurer les tranches de paiement</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (showPaiementForm()) {
      <div class="dialog-backdrop" (click)="showPaiementForm.set(false)">
        <div class="dialog" style="width:min(680px,100%);max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
          <div class="dialog-title" style="display:flex;align-items:center;justify-content:space-between">
            Enregistrer un paiement
            <button class="btn btn-icon btn-secondary" (click)="showPaiementForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <form (ngSubmit)="createPaiement()" style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label>Étudiant</label>
              <select [(ngModel)]="newPaiement.etudiantId" name="etudiantId" class="input" required>
                <option value="">Rechercher un étudiant</option>
                @for (e of etudiants(); track e.id) { <option [value]="e.id">{{ e.prenom }} {{ e.nom }} ({{ e.classeNom || '' }})</option> }
              </select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div class="field">
                <label>Montant (FCFA)</label>
                <input type="number" [(ngModel)]="newPaiement.montant" name="montant" required class="input" />
              </div>
              <div class="field">
                <label>Mode</label>
                <select [(ngModel)]="newPaiement.mode" name="mode" class="input">
                  <option value="ESPECES">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Versement</label>
              <select [(ngModel)]="newPaiement.versementId" name="versementId" class="input">
                <option value="">Choisir la tranche</option>
                @for (v of versements(); track v.id) { <option [value]="v.id">{{ v.ordre }} — {{ v.libelle }}</option> }
              </select>
              @if (versements().length === 0) { <div style="font-size:12px;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin-top:6px">Aucune tranche configurée — utilisez « Gérer les versements » pour en créer.</div> }
            </div>
            <div class="dialog-actions">
              <button type="button" (click)="showPaiementForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button type="submit" [disabled]="saving()" class="btn btn-primary">
                @if (saving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> }
                Enregistrer le paiement
              </button>
            </div>
            @if (paiementSuccess()) { <div class="tag tag-success" style="display:flex;align-items:center;gap:6px;padding:8px 12px;font-size:13px"><span class="material-symbols-outlined" style="font-size:18px">check_circle</span> Paiement enregistré — Reçu N° {{ paiementSuccess() }}</div> }
            @if (paiementError()) { <div class="tag tag-danger" style="display:flex;align-items:center;gap:6px;padding:8px 12px;font-size:13px"><span class="material-symbols-outlined" style="font-size:18px">error</span> {{ paiementError() }}</div> }
          </form>
        </div>
      </div>
    }

    @if (showEtudiantForm()) {
      <div class="dialog-backdrop" (click)="showEtudiantForm.set(false)">
        <div class="dialog" style="width:min(720px,100%);max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
          <div class="dialog-title" style="display:flex;align-items:center;justify-content:space-between">
            Enregistrer un élève
            <button class="btn btn-icon btn-secondary" (click)="showEtudiantForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px">
            <div class="field"><label>Nom</label><input type="text" [(ngModel)]="newEtudiant.nom" placeholder="Nom" class="input" /></div>
            <div class="field"><label>Prénom</label><input type="text" [(ngModel)]="newEtudiant.prenom" placeholder="Prénom" class="input" /></div>
            <div class="field"><label>Date de naissance</label><input type="date" [(ngModel)]="newEtudiant.dateNaissance" class="input" /></div>
            <div class="field"><label>Lieu de naissance</label><input type="text" [(ngModel)]="newEtudiant.lieuNaissance" placeholder="Lieu" class="input" /></div>
            <div class="field"><label>Sexe</label><select [(ngModel)]="newEtudiant.sexe" class="input"><option value="">Sexe</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
            <div class="field"><label>Téléphone</label><input type="text" [(ngModel)]="newEtudiant.telephone" placeholder="Téléphone" class="input" /></div>
            <div class="field"><label>Email</label><input type="email" [(ngModel)]="newEtudiant.email" placeholder="Email" class="input" /></div>
            <div class="field"><label>Lieu d'habitation</label><input type="text" [(ngModel)]="newEtudiant.lieuHabitation" placeholder="Lieu d'habitation" class="input" /></div>
            <div class="field"><label>Contact parent</label><input type="text" [(ngModel)]="newEtudiant.contactParentNom" placeholder="Nom du parent" class="input" /></div>
            <div class="field"><label>Tél. parent</label><input type="text" [(ngModel)]="newEtudiant.contactParentTelephone" placeholder="Téléphone parent" class="input" /></div>
            <div class="field"><label>Matricule BAC</label><input type="text" [(ngModel)]="newEtudiant.matriculeBac" placeholder="Matricule" class="input" /></div>
            <div class="field"><label>Matricule MESRS</label><input type="text" [(ngModel)]="newEtudiant.matriculeMesrs" placeholder="Matricule MESRS" class="input" /></div>
            <div class="field"><label>N° table BAC</label><input type="text" [(ngModel)]="newEtudiant.numeroTableBac" placeholder="N° table BAC" class="input" /></div>
            <div class="field"><label>Année BAC</label><input type="text" [(ngModel)]="newEtudiant.anneeBac" placeholder="Année BAC" class="input" /></div>
          </div>
          <div class="dialog-actions">
            <button (click)="showEtudiantForm.set(false)" class="btn btn-secondary">Annuler</button>
            <button (click)="createEtudiant()" [disabled]="etudiantSaving()" class="btn btn-primary">
              @if (etudiantSaving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> }
              Enregistrer
            </button>
          </div>
          @if (etudiantSuccess()) { <div class="tag tag-success" style="display:flex;align-items:center;gap:6px;padding:8px 12px;font-size:13px"><span class="material-symbols-outlined" style="font-size:18px">check_circle</span> {{ etudiantSuccess() }}</div> }
          @if (etudiantError()) { <div class="tag tag-danger" style="display:flex;align-items:center;gap:6px;padding:8px 12px;font-size:13px"><span class="material-symbols-outlined" style="font-size:18px">error</span> {{ etudiantError() }}</div> }
        </div>
      </div>
    }

  `,
})
export class DafHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  auth = inject(AuthService);

  showPaiementForm = signal(false);
  versements = signal<any[]>([]);
  perf = signal<any>(null);
  tableauFinancier = signal<any[]>([]);
  tableLoading = signal(false);
  etudiants = signal<any[]>([]);
  classes = signal<any[]>([]);
  annees = signal<any[]>([]);
  saving = signal(false);
  relanceLoading = signal(false);
  relanceId = signal<string | null>(null);
  paiementSuccess = signal('');
  paiementError = signal('');
  searchEtudiant = signal('');

  filters: any = { classeId: null, anneeScolaireId: null, statutPaiement: null, versementId: null, search: '' };
  private searchTimeout: any = null;

  showEtudiantForm = signal(false);
  etudiantSaving = signal(false);
  etudiantSuccess = signal('');
  etudiantError = signal('');
  newEtudiant: any = { nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '', telephone: '', email: '', lieuHabitation: '', contactParentNom: '', contactParentTelephone: '', matriculeBac: '', matriculeMesrs: '', numeroTableBac: '', anneeBac: '' };

  newPaiement: any = { etudiantId: '', montant: 0, mode: 'ESPECES', versementId: null };

  groupByOptions: { key: 'semaine' | 'mois' | 'annee'; label: string }[] = [
    { key: 'semaine', label: 'Semaine' },
    { key: 'mois', label: 'Mois' },
    { key: 'annee', label: 'Année' },
  ];
  groupBy = signal<'semaine' | 'mois' | 'annee'>('mois');
  evolutionLoading = signal(false);
  evolutionPaiements = signal<any[]>([]);

  ngOnInit() { this.loadPerf(); this.loadEtudiants(); this.loadVersements(); this.loadEvolution(); }

  loadEvolution() {
    this.evolutionLoading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/daf/paiements/evolution`, { params: { groupBy: this.groupBy() } }).subscribe({
      next: (res) => { this.evolutionPaiements.set(res || []); this.evolutionLoading.set(false); },
      error: () => { this.evolutionLoading.set(false); this.alertService.error("Erreur lors du chargement de l'évolution des paiements"); },
    });
  }

  changeGroupBy(key: 'semaine' | 'mois' | 'annee') {
    if (this.groupBy() === key) return;
    this.groupBy.set(key);
    this.loadEvolution();
  }

  paiementsChart = computed(() => {
    const data = this.evolutionPaiements();
    const width = 500;
    const height = 220;
    const padding = 30;
    const topMargin = 16;
    const chartHeight = height - padding * 2 - topMargin;

    if (!data.length) return { points: [] as { x: number; y: number; label: string; montant: number }[], linePath: '', areaPath: '' };

    const max = Math.max(...data.map((d: any) => d.montant || 0), 1);

    let points: { x: number; y: number; label: string; montant: number }[];
    if (data.length === 1) {
      const y = height - padding - (data[0].montant / max) * chartHeight;
      points = [{ x: width / 2, y, label: data[0].label, montant: data[0].montant }];
    } else {
      const stepX = (width - padding * 2) / (data.length - 1);
      points = data.map((d: any, i: number) => ({
        x: padding + i * stepX,
        y: height - padding - (d.montant / max) * chartHeight,
        label: d.label,
        montant: d.montant,
      }));
    }

    let linePath = '';
    let areaPath = '';
    if (points.length > 1) {
      linePath = `M ${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const cx = (p0.x + p1.x) / 2;
        linePath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
      }
      areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;
    }

    return { points, linePath, areaPath };
  });

  pctPayes = computed(() => {
    const p = this.perf();
    const total = (p?.effectifEnRegle || 0) + (p?.effectifQuiDoivent || 0);
    return total > 0 ? Math.round(((p?.effectifEnRegle || 0) / total) * 1000) / 10 : 0;
  });

  pctImpayes = computed(() => Math.max(0, 100 - this.pctPayes()));

  exportPerformancePdf() {
    this.http.get(`${environment.apiUrl}/daf/performance/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'performance-financiere.pdf';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.alertService.error('Erreur lors de l\'export PDF'),
    });
  }

  formatMontant(val: any): string {
    const n = Number(val) || 0;
    return n.toLocaleString('fr-FR');
  }

  loadVersements() {
    this.http.get<any>(`${environment.apiUrl}/daf/versements`).subscribe({ next: (d) => this.versements.set(d || []), error: () => this.versements.set([]) });
  }

  loadPerf() { this.http.get<any>(`${environment.apiUrl}/daf/performance`).subscribe({ next: (d) => this.perf.set(d), error: () => this.perf.set(null) }); }

  loadTableau() {
    this.tableLoading.set(true);
    const params: string[] = [];
    if (this.filters.classeId) params.push(`classeId=${this.filters.classeId}`);
    if (this.filters.anneeScolaireId) params.push(`anneeScolaireId=${this.filters.anneeScolaireId}`);
    if (this.filters.statutPaiement) params.push(`statutPaiement=${this.filters.statutPaiement}`);
    if (this.filters.versementId) params.push(`versementId=${this.filters.versementId}`);
    if (this.filters.search) params.push(`search=${encodeURIComponent(this.filters.search)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    this.http.get<any>(`${environment.apiUrl}/daf/tableau-financier${qs}`).subscribe({
      next: (res) => { this.tableauFinancier.set(res.data || []); this.tableLoading.set(false); },
      error: () => { this.tableauFinancier.set([]); this.tableLoading.set(false); },
    });
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
    this.searchTimeout = setTimeout(() => this.loadTableau(), 400);
  }

  loadEtudiants() {
    this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({
      next: (res) => this.etudiants.set(res.data || res || []),
      error: () => this.etudiants.set([]),
    });
  }

  filterEtudiant(e: any): boolean {
    const s = this.searchEtudiant().toLowerCase();
    if (!s) return true;
    return (e.nom + ' ' + e.prenom + ' ' + (e.classeNom || '')).toLowerCase().includes(s);
  }

  openPaiementForm() {
    this.paiementSuccess.set('');
    this.paiementError.set('');
    this.showPaiementForm.set(true);
  }

  openEtudiantForm() {
    this.newEtudiant = { nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '', telephone: '', email: '', lieuHabitation: '', contactParentNom: '', contactParentTelephone: '', matriculeBac: '', matriculeMesrs: '', numeroTableBac: '', anneeBac: '' };
    this.etudiantSuccess.set('');
    this.etudiantError.set('');
    this.showEtudiantForm.set(true);
  }

  createEtudiant() {
    const d = this.newEtudiant;
    if (!d.nom || !d.prenom) {
      this.etudiantError.set('Nom et prénom sont obligatoires');
      return;
    }
    this.etudiantSaving.set(true);
    this.etudiantSuccess.set('');
    this.etudiantError.set('');
    this.http.post(`${environment.apiUrl}/etudiants`, d).subscribe({
      next: () => {
        this.etudiantSaving.set(false);
        this.etudiantSuccess.set('Élève enregistré avec succès');
        this.loadEtudiants();
        setTimeout(() => this.showEtudiantForm.set(false), 2000);
      },
      error: (err) => {
        this.etudiantSaving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur lors de l\'enregistrement';
        this.etudiantError.set(msg);
      },
    });
  }

  createPaiement() {
    this.saving.set(true); this.paiementSuccess.set(''); this.paiementError.set('');
    this.http.post<any>(`${environment.apiUrl}/daf/paiements`, this.newPaiement).subscribe({
      next: (res) => {
        this.paiementSuccess.set(res.numeroRecu);
        this.saving.set(false);
        this.loadPerf(); this.loadTableau();
        this.newPaiement = { etudiantId: '', montant: 0, mode: 'ESPECES', versementId: null };
      },
      error: (err) => {
        this.saving.set(false);
        this.paiementError.set(err.error?.message || 'Erreur lors de l\'enregistrement du paiement');
      },
    });
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

  relanceEtudiant(etudiantId: string) {
    this.relanceId.set(etudiantId);
    this.http.post<any>(`${environment.apiUrl}/daf/relance-sms`, { etudiantId }).subscribe({
      next: (res) => { this.relanceId.set(null); this.alertService.success(res.message || 'Relance envoyée'); },
      error: (err) => { this.relanceId.set(null); this.alertService.error(err.error?.message || 'Erreur relance'); },
    });
  }

  relanceGroupee() {
    this.relanceLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/daf/relance-groupee`, {}).subscribe({
      next: (res) => { this.relanceLoading.set(false); this.alertService.success(res.message || 'Relances envoyées'); },
      error: (err) => { this.relanceLoading.set(false); this.alertService.error(err.error?.message || 'Erreur relance groupée'); },
    });
  }
}
