import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { RoleUtilisateur } from '../../core/models';
import { environment } from '../../../environments/environment';
import { filiereLabel } from '../../core/utils/filiere.util';
import { BreadcrumbComponent } from '../../shared/ui/breadcrumb.component';

@Component({
  selector: 'app-etudiant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  styles: [`
    .parcours-item { position:relative; padding-left:20px; padding-bottom:20px; border-left:2px solid var(--color-divider); }
    .parcours-item:last-child { padding-bottom:0; }
    .parcours-dot { position:absolute; left:-7px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--color-accent); }
  `],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="breadcrumbItems()"></app-breadcrumb>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
          <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
        </div>
      }
      @if (!loading() && etudiant(); as e) {
        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-body" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
            <div>
              <h2 style="margin:0">{{ e.prenom }} {{ e.nom }}</h2>
              <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ inscriptionActive()?.classe?.nom || 'Aucune inscription active' }}{{ filiereActive() ? ' — ' + filiereActive() : '' }}</p>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="tag" [class]="statutTagClass()">{{ inscriptionActive()?.statut || e.statut }}</span>
              @if (canGererInscriptions() && inscriptionActive()?.statut === 'CANDIDAT') {
                <button (click)="updateStatut('INSCRIT')" [disabled]="updatingStatut()" class="btn btn-primary btn-sm">Inscrire</button>
                <button (click)="updateStatut('REFUSE')" [disabled]="updatingStatut()" class="btn btn-secondary btn-sm">Refuser</button>
              }
            </div>
          </div>
        </div>

        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-head">
            <h3 style="margin:0;font-size:16px">Informations personnelles</h3>
            <button (click)="openEdit()" class="btn btn-secondary btn-sm">
              <span class="material-symbols-outlined" style="font-size:16px">edit</span> Modifier
            </button>
          </div>
          <div class="gs-panel-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;font-size:14px">
            <div><span class="text-muted" style="font-size:12px;display:block">Date de naissance</span><strong>{{ e.dateNaissance ? (e.dateNaissance | date:'dd/MM/yyyy') : '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Lieu de naissance</span><strong>{{ e.lieuNaissance || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Sexe</span><strong>{{ e.sexe || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Lieu d'habitation</span><strong>{{ e.lieuHabitation || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Téléphone</span><strong>{{ e.telephone || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Email</span><strong>{{ e.email || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Contact parent / tuteur</span><strong>{{ e.contactParentNom || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Téléphone parent</span><strong>{{ e.contactParentTelephone || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Matricule BAC</span><strong>{{ e.matriculeBac || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Matricule MESRS</span><strong>{{ e.matriculeMesrs || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">N° table BAC</span><strong>{{ e.numeroTableBac || '—' }}</strong></div>
            <div><span class="text-muted" style="font-size:12px;display:block">Année BAC</span><strong>{{ e.anneeBac || '—' }}</strong></div>
          </div>
        </div>

        @if (showEdit()) {
          <div class="dialog-backdrop" (click)="showEdit.set(false)">
            <div class="dialog" style="width:min(640px,100%);max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span class="dialog-title">Modifier l'élève</span>
                <button class="btn btn-icon btn-secondary" (click)="showEdit.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="field"><label>Nom</label><input type="text" [(ngModel)]="editForm.nom" class="input" /></div>
                <div class="field"><label>Prénom</label><input type="text" [(ngModel)]="editForm.prenom" class="input" /></div>
                <div class="field"><label>Date de naissance</label><input type="date" [(ngModel)]="editForm.dateNaissance" class="input" /></div>
                <div class="field"><label>Lieu de naissance</label><input type="text" [(ngModel)]="editForm.lieuNaissance" class="input" /></div>
                <div class="field"><label>Sexe</label><select [(ngModel)]="editForm.sexe" class="input"><option value="">Sexe</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
                <div class="field"><label>Lieu d'habitation</label><input type="text" [(ngModel)]="editForm.lieuHabitation" class="input" /></div>
                <div class="field"><label>Téléphone</label><input type="text" [(ngModel)]="editForm.telephone" class="input" /></div>
                <div class="field"><label>Email</label><input type="email" [(ngModel)]="editForm.email" class="input" /></div>
                <div class="field"><label>Contact parent</label><input type="text" [(ngModel)]="editForm.contactParentNom" class="input" /></div>
                <div class="field"><label>Tél. parent</label><input type="text" [(ngModel)]="editForm.contactParentTelephone" class="input" /></div>
                <div class="field"><label>Matricule BAC</label><input type="text" [(ngModel)]="editForm.matriculeBac" class="input" /></div>
                <div class="field"><label>Matricule MESRS</label><input type="text" [(ngModel)]="editForm.matriculeMesrs" class="input" /></div>
                <div class="field"><label>N° table BAC</label><input type="text" [(ngModel)]="editForm.numeroTableBac" class="input" /></div>
                <div class="field"><label>Année BAC</label><input type="text" [(ngModel)]="editForm.anneeBac" class="input" /></div>
              </div>
              <div class="dialog-actions">
                <button (click)="showEdit.set(false)" class="btn btn-secondary">Annuler</button>
                <button (click)="saveEdit()" [disabled]="saving()" class="btn btn-primary">
                  @if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } Enregistrer
                </button>
              </div>
            </div>
          </div>
        }

        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Historique des inscriptions ({{ e.inscriptions?.length || 0 }})</h3></div>
          <div class="gs-panel-body">
            <div class="table-scroll">
              <table class="table">
                <thead><tr><th>Année scolaire</th><th>Classe</th><th>Filière</th><th>Statut</th><th>Date</th></tr></thead>
                <tbody>
                  @for (ins of e.inscriptions; track ins.id) {
                    <tr>
                      <td>{{ ins.anneeScolaire?.libelle }}</td>
                      <td>{{ ins.classe?.nom }}</td>
                      <td>{{ filiereLabel(ins.classe) || '—' }}</td>
                      <td><span class="tag" [class]="ins.statut === 'INSCRIT' ? 'tag-success' : (ins.statut === 'CANDIDAT' ? 'tag-accent' : 'tag-neutral')">{{ ins.statut }}</span></td>
                      <td>{{ ins.dateInscription | date:'dd/MM/yyyy' }}</td>
                    </tr>
                  } @empty { <tr><td colspan="5" class="table-empty">Aucune inscription enregistrée</td></tr> }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Parcours</h3></div>
          <div class="gs-panel-body">
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
              <div class="table-empty">Aucun parcours disponible</div>
            }
          </div>
        </div>

        @if (canViewFicheComplete() && ficheComplete(); as f) {
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
            <div class="gs-stat"><span class="gs-stat-label">Montant total</span><span class="gs-stat-num">{{ f.scolarite.montantTotal | number:'1.0-0':'fr-FR' }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Payé</span><span class="gs-stat-num" style="color:#1a7a3f">{{ f.scolarite.totalPaye | number:'1.0-0':'fr-FR' }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Reste à payer</span><span class="gs-stat-num" style="color:var(--color-accent-700)">{{ f.scolarite.reste | number:'1.0-0':'fr-FR' }}</span></div>
          </div>

          <div class="gs-panel" style="margin-bottom:20px">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Commentaires des professeurs ({{ f.commentaires.length }})</h3></div>
            <div class="gs-panel-body">
              @if (f.commentaires.length > 0) {
                <div style="display:flex;flex-direction:column;gap:8px">
                  @for (c of f.commentaires; track c.id) {
                    <div style="border:1px solid var(--color-divider);border-left:3px solid var(--color-accent);padding:10px 12px;font-size:13px">
                      <p style="margin:0;white-space:pre-wrap">{{ c.contenu }}</p>
                      <div style="font-size:11px;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin-top:6px">{{ c.enseignant?.prenom }} {{ c.enseignant?.nom }} — {{ c.updatedAt | date:'dd/MM/yyyy à HH:mm' }}</div>
                    </div>
                  }
                </div>
              } @else {
                <div class="table-empty">Aucun commentaire enregistré</div>
              }
            </div>
          </div>

          <div class="gs-panel" style="margin-bottom:20px">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Historique des paiements ({{ f.paiements.length }})</h3></div>
            <div class="gs-panel-body">
              <div class="table-scroll">
                <table class="table">
                  <thead><tr><th>Date</th><th>Montant</th><th>Mode</th><th>Reçu</th></tr></thead>
                  <tbody>
                    @for (p of f.paiements; track p.id) {
                      <tr><td>{{ p.datePaiement | date:'dd/MM/yyyy' }}</td><td>{{ p.montant | number:'1.0-0':'fr-FR' }}</td><td>{{ p.mode }}</td><td>{{ p.numeroRecu }}</td></tr>
                    } @empty { <tr><td colspan="4" class="table-empty">Aucun paiement</td></tr> }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="gs-panel" style="margin-bottom:20px">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Notes ({{ f.notes.length }})</h3></div>
            <div class="gs-panel-body">
              <div class="table-scroll">
                <table class="table">
                  <thead><tr><th>Date</th><th>Matière</th><th>Type</th><th>Note</th></tr></thead>
                  <tbody>
                    @for (n of f.notes; track n.id) {
                      <tr><td>{{ n.dateSaisie | date:'dd/MM/yyyy' }}</td><td>{{ n.matiere?.nom }}</td><td>{{ n.typeEvaluation }}</td><td [style.color]="n.note >= (n.sur/2) ? '#1a7a3f' : 'var(--color-accent-700)'" style="font-weight:600">{{ n.note }}/{{ n.sur }}</td></tr>
                    } @empty { <tr><td colspan="4" class="table-empty">Aucune note</td></tr> }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Absences &amp; retards ({{ f.absences.length }})</h3></div>
            <div class="gs-panel-body">
              <div class="table-scroll">
                <table class="table">
                  <thead><tr><th>Date</th><th>Type</th><th>Matière</th><th>Justifié</th></tr></thead>
                  <tbody>
                    @for (a of f.absences; track a.id) {
                      <tr><td>{{ a.date | date:'dd/MM/yyyy' }}</td><td><span class="tag" [class]="a.type === 'ABSENCE' ? 'tag-danger' : 'tag-accent'">{{ a.type }}</span></td><td>{{ a.matiere?.nom }}</td><td>{{ a.justified ? 'Oui' : 'Non' }}</td></tr>
                    } @empty { <tr><td colspan="4" class="table-empty">Aucune absence enregistrée</td></tr> }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class EtudiantDetailComponent implements OnInit {
  filiereLabel = filiereLabel;
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  etudiantId = '';
  etudiant = signal<any>(null);
  parcours = signal<any[]>([]);
  ficheComplete = signal<any>(null);
  loading = signal(true);
  updatingStatut = signal(false);
  showEdit = signal(false);
  saving = signal(false);
  editForm: any = {};

  canViewFicheComplete(): boolean {
    return this.authService.hasRole('DG', 'ETUDES', 'SUPER_ADMIN');
  }

  inscriptionActive = computed(() => this.etudiant()?.inscriptions?.[0] || null);
  filiereActive = computed(() => this.filiereLabel(this.inscriptionActive()?.classe));

  statutTagClass = computed(() => {
    const s = this.inscriptionActive()?.statut;
    if (s === 'INSCRIT') return 'tag-success';
    if (s === 'CANDIDAT') return 'tag-accent';
    if (s === 'REFUSE') return 'tag-danger';
    return 'tag-neutral';
  });

  canGererInscriptions(): boolean {
    return this.authService.hasRole('ETUDES', 'SECRETAIRE', 'DG', 'SUPER_ADMIN');
  }

  ngOnInit() {
    this.etudiantId = this.route.snapshot.paramMap.get('id') || '';
    this.loadEtudiant();
    this.loadParcours();
    if (this.canViewFicheComplete()) this.loadFicheComplete();
  }

  loadFicheComplete() {
    this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId}/fiche-complete`).subscribe({
      next: (f) => this.ficheComplete.set(f),
      error: () => this.ficheComplete.set(null),
    });
  }

  loadEtudiant() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId}`).subscribe({
      next: (e) => { this.etudiant.set(e); this.loading.set(false); },
      error: () => { this.loading.set(false); this.alertService.error('Erreur lors du chargement de la fiche étudiant'); },
    });
  }

  loadParcours() {
    this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId}/parcours`).subscribe({
      next: (d) => this.parcours.set(d.parcours || []),
      error: () => this.parcours.set([]),
    });
  }

  openEdit() {
    const e = this.etudiant();
    if (!e) return;
    this.editForm = {
      nom: e.nom, prenom: e.prenom,
      dateNaissance: e.dateNaissance ? new Date(e.dateNaissance).toISOString().slice(0, 10) : '',
      lieuNaissance: e.lieuNaissance || '', sexe: e.sexe || '',
      lieuHabitation: e.lieuHabitation || '', telephone: e.telephone || '', email: e.email || '',
      contactParentNom: e.contactParentNom || '', contactParentTelephone: e.contactParentTelephone || '',
      matriculeBac: e.matriculeBac || '', matriculeMesrs: e.matriculeMesrs || '',
      numeroTableBac: e.numeroTableBac || '', anneeBac: e.anneeBac || '',
    };
    this.showEdit.set(true);
  }

  saveEdit() {
    this.saving.set(true);
    this.http.patch(`${environment.apiUrl}/etudiants/${this.etudiantId}`, this.editForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showEdit.set(false);
        this.alertService.success('Élève modifié');
        this.loadEtudiant();
      },
      error: (err: any) => { this.saving.set(false); this.alertService.error(err?.error?.message || 'Erreur lors de la modification'); },
    });
  }

  updateStatut(statut: 'INSCRIT' | 'REFUSE') {
    const inscriptionId = this.inscriptionActive()?.id;
    if (!inscriptionId) return;
    this.updatingStatut.set(true);
    this.http.patch(`${environment.apiUrl}/etudiants/inscriptions/${inscriptionId}/statut`, { statut }).subscribe({
      next: () => { this.updatingStatut.set(false); this.loadEtudiant(); this.alertService.success(statut === 'INSCRIT' ? 'Étudiant inscrit' : 'Candidature refusée'); },
      error: (err: any) => { this.updatingStatut.set(false); this.alertService.error(err?.error?.message || 'Erreur lors de la mise à jour'); },
    });
  }

  breadcrumbItems = computed(() => {
    const role = this.authService.currentUser()?.role;
    const listeRoute = role === RoleUtilisateur.DSI ? '/dsi' : '/dg/eleves';
    const e = this.etudiant();
    return [
      { label: 'Étudiants', route: listeRoute },
      { label: e ? `${e.prenom} ${e.nom}` : '...' },
    ];
  });
}
