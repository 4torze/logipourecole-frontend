import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { RoleUtilisateur } from '../../core/models';
import { filiereIds } from '../../core/utils/filiere.util';
import { BreadcrumbComponent } from '../../shared/ui/breadcrumb.component';

@Component({
  selector: 'app-dsi-classe-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  styles: [`
    .dtab { padding:10px 16px; font-size:13px; font-weight:600; font-family:var(--font-heading); border:none; background:none; cursor:pointer; color:color-mix(in srgb, var(--color-text) 55%, transparent); border-bottom:2px solid transparent; margin-bottom:-2px; }
    .dtab.active { color:var(--color-accent); border-bottom-color:var(--color-accent); }
    .dtab:hover:not(.active) { color:var(--color-text); }
    .chip-x { background:none; border:none; cursor:pointer; display:inline-flex; color:inherit; padding:0; }
    .chip-x:hover { color:var(--color-accent-700); }
    .edt-row { display:flex; align-items:center; gap:16px; padding:10px 0; border-bottom:1px solid var(--color-divider); }
    .edt-row:last-child { border-bottom:none; }
  `],
  template: `
    <div class="page-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:16px;flex-wrap:wrap">
        <app-breadcrumb [items]="breadcrumbItems()"></app-breadcrumb>
        @if (canSendAnnonce()) {
          <button (click)="showAnnonceForm.set(true)" class="btn btn-secondary btn-sm">
            <span class="material-symbols-outlined" style="font-size:16px">campaign</span> Envoyer une annonce à la classe
          </button>
        }
      </div>

      @if (showAnnonceForm()) {
        <div class="dialog-backdrop" (click)="showAnnonceForm.set(false)">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">Annonce WhatsApp à la classe</span>
              <button class="btn btn-icon btn-secondary" (click)="showAnnonceForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <p class="text-muted" style="font-size:12px;margin:-6px 0 0">Envoyée par WhatsApp à tous les élèves inscrits de cette classe pour l'année active, et enregistrée dans leur boîte de réception.</p>
            <div class="field"><label>Sujet</label><input type="text" [(ngModel)]="annonceForm.sujet" class="input" /></div>
            <div class="field"><label>Contenu</label><textarea [(ngModel)]="annonceForm.contenu" class="input" rows="4"></textarea></div>
            <div class="dialog-actions">
              <button (click)="showAnnonceForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button (click)="sendAnnonceClasse()" [disabled]="sendingAnnonce()" class="btn btn-primary">Envoyer</button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="text-muted" style="display:flex;align-items:center;gap:8px;font-size:13px;padding:40px 0">
          <span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement...
        </div>
      } @else if (!classeDetails()) {
        <div class="gs-panel"><div class="gs-panel-body">Classe introuvable</div></div>
      } @else {
        <!-- KPI + graphiques de la classe -->
        <div class="gs-panel" style="margin-bottom:20px"><div class="gs-panel-body">
          <h3 style="margin:0 0 16px;display:flex;align-items:center;gap:8px;font-size:16px"><span class="material-symbols-outlined" style="font-size:18px">insights</span> Aperçu de la classe</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:16px">
            <div class="gs-stat"><span class="gs-stat-label">Élèves</span><span class="gs-stat-num">{{ (classeDetails()?.etudiants || []).length }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Remplissage</span><span class="gs-stat-num">{{ classeStats().tauxRemplissage }}%</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Notes saisies</span><span class="gs-stat-num">{{ classeStats().totalNotes }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Moyenne générale</span><span class="gs-stat-num">{{ classeStats().totalNotes ? classeStats().moyenneGenerale + '/20' : '—' }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Absences</span><span class="gs-stat-num">{{ classeStats().totalAbsences }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Enseignants</span><span class="gs-stat-num">{{ (classeDetails()?.enseignants || []).length }}</span></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
            <div class="gs-panel">
              <div class="gs-panel-head"><h3 style="margin:0;font-size:14px">Moyenne par matière</h3></div>
              <div class="gs-panel-body">
                @if (matiereMoyenneBars().length > 0) {
                  <svg viewBox="0 0 500 200" style="width:100%;height:auto" preserveAspectRatio="xMidYMid meet">
                    <line x1="30" y1="20" x2="470" y2="20" stroke="var(--color-divider)" stroke-width="1"/>
                    <line x1="30" y1="170" x2="470" y2="170" stroke="var(--color-divider)" stroke-width="1"/>
                    @for (b of matiereMoyenneBars(); track $index) {
                      <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.width" [attr.height]="b.height" [attr.fill]="b.value >= 10 ? '#1a7a3f' : 'var(--color-accent-700)'"/>
                      <text [attr.x]="b.x + b.width / 2" [attr.y]="b.y - 5" text-anchor="middle" font-size="9" fill="color-mix(in srgb, var(--color-text) 70%, transparent)" font-weight="600">{{ b.value }}</text>
                      <text [attr.x]="b.x + b.width / 2" y="185" text-anchor="middle" font-size="9" fill="color-mix(in srgb, var(--color-text) 45%, transparent)">{{ b.label }}</text>
                    }
                  </svg>
                } @else {
                  <div class="text-muted" style="height:160px;display:flex;align-items:center;justify-content:center;font-size:13px">Aucune note saisie</div>
                }
              </div>
            </div>
            <div class="gs-panel">
              <div class="gs-panel-head"><h3 style="margin:0;font-size:14px">Répartition des absences</h3></div>
              <div class="gs-panel-body">
                @if (absencesDonut().length > 0) {
                  <div style="display:flex;align-items:center;gap:16px">
                    <div style="position:relative;flex:none">
                      <svg width="110" height="110" viewBox="0 0 36 36" style="transform:rotate(-90deg)">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-divider)" stroke-width="3.5"/>
                        @for (seg of absencesDonut(); track seg.label) {
                          <circle cx="18" cy="18" r="15.915" fill="none" [attr.stroke]="seg.color" stroke-width="3.5" [attr.stroke-dasharray]="seg.pct + ' ' + (100 - seg.pct)" [attr.stroke-dashoffset]="100 - seg.offset" style="transition: stroke-dasharray 0.5s;"/>
                        }
                      </svg>
                      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                        <span style="font-size:17px;font-family:var(--font-heading);font-weight:800">{{ classeStats().totalAbsences }}</span>
                      </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0">
                      @for (seg of absencesDonut(); track seg.label) {
                        <div style="display:flex;align-items:center;gap:8px;font-size:12px">
                          <span style="width:10px;height:10px;flex:none" [style.background]="seg.color"></span>
                          <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ seg.label }}</span>
                          <strong>{{ seg.value }}</strong>
                        </div>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="text-muted" style="height:110px;display:flex;align-items:center;justify-content:center;width:100%;font-size:13px">Aucune absence enregistrée</div>
                }
              </div>
            </div>
          </div>
        </div></div>

        <div class="gs-panel">
          <div class="gs-panel-head">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <h3 style="margin:0">{{ classeDetails()?.classe?.nom || 'Classe' }}</h3>
              <span class="tag tag-neutral">{{ classeDetails()?.classe?.niveau }}</span>
              @for (cf of classeDetails()?.classe?.filieres || []; track cf.filiereId) {
                <span class="tag tag-neutral" style="display:inline-flex;align-items:center;gap:4px">
                  {{ cf.filiere?.nom }}
                  @if (canEdit()) {
                    <button (click)="removeFiliereFromClasseDetail(cf.filiereId)" class="chip-x" title="Retirer cette filière"><span class="material-symbols-outlined" style="font-size:14px">close</span></button>
                  }
                </span>
              }
              @if (availableFilieresForClasse().length > 0) {
                <select [ngModel]="''" (ngModelChange)="addFiliereToClasseDetail($event)" class="input" style="width:auto;min-height:26px;font-size:11px;padding:2px 6px">
                  <option value="">+ Filière</option>
                  @for (f of availableFilieresForClasse(); track f.id) { <option [value]="f.id">{{ f.nom }}</option> }
                </select>
              }
              @if (classeDetails()?.anneeActive) { <span class="tag tag-outline">{{ classeDetails()?.anneeActive }}</span> }
            </div>
          </div>
          <div style="padding:12px 20px 0;border-bottom:2px solid var(--color-divider);display:flex;gap:4px">
            @for (tab of classeDetailTabs; track tab.key) {
              <button (click)="classeDetailTab.set(tab.key)" class="dtab" [class.active]="classeDetailTab()===tab.key">{{ tab.label }}</button>
            }
          </div>
          <div class="gs-panel-body">
            @if (classeDetailTab()==='eleves') {
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <span class="text-muted" style="font-size:13px">{{ (classeDetails()?.etudiants || []).length }} élève(s) inscrit(s)</span>
                @if (canEdit()) { <button (click)="showAddEleve.set(!showAddEleve())" class="btn btn-primary btn-sm"><span class="material-symbols-outlined" style="font-size:16px">person_add</span> Ajouter un élève</button> }
              </div>
              @if (showAddEleve() && canEdit()) {
                <div class="gs-well" style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
                  <select [(ngModel)]="addEleveId" class="input" style="flex:1">
                    <option value="">Sélectionner un élève...</option>
                    @for (e of eleveCandidats(); track e.id) { <option [value]="e.id">{{ e.nom }} {{ e.prenom }}</option> }
                  </select>
                  <button (click)="addEleveToClasse()" class="btn btn-primary">Inscrire</button>
                  <button (click)="showAddEleve.set(false)" class="btn btn-secondary">Annuler</button>
                </div>
              }
              <div class="table-scroll">
                <table class="table"><thead><tr><th>Nom</th><th>Prénom</th><th>Sexe</th><th>Téléphone</th><th>Email</th><th style="text-align:center;width:80px">Action</th></tr></thead>
                <tbody>
                  @for (e of classeDetails()?.etudiants || []; track e.id) {
                    <tr (click)="openEleveDetail(e.id)" style="cursor:pointer"><td>{{ e.nom }}</td><td>{{ e.prenom }}</td><td>{{ e.sexe || '—' }}</td><td>{{ e.telephone || '—' }}</td><td>{{ e.email || '—' }}</td><td style="text-align:center"><button (click)="$event.stopPropagation(); openEleveDetail(e.id)" class="btn btn-icon btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button></td></tr>
                  } @empty {
                    <tr><td colspan="6" class="table-empty">Aucun élève inscrit</td></tr>
                  }
                </tbody></table>
              </div>
            }
            @if (classeDetailTab()==='enseignants') {
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <span class="text-muted" style="font-size:13px">{{ (classeDetails()?.enseignants || []).length }} affectation(s)</span>
                @if (canEdit()) { <button (click)="showAddProf.set(!showAddProf())" class="btn btn-primary btn-sm"><span class="material-symbols-outlined" style="font-size:16px">person_add</span> Ajouter un professeur</button> }
              </div>
              @if (showAddProf() && canEdit()) {
                <div class="gs-well" style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
                  <select [(ngModel)]="addProfEnseignantId" class="input" style="flex:1">
                    <option value="">Enseignant...</option>
                    @for (p of enseignants(); track p.id) { <option [value]="p.id">{{ p.nom }} {{ p.prenom }}</option> }
                  </select>
                  <select [(ngModel)]="addProfMatiereId" class="input" style="flex:1">
                    <option value="">Matière...</option>
                    @for (m of matieres(); track m.id) { <option [value]="m.id">{{ m.nom }} ({{ m.code }})</option> }
                  </select>
                  <button (click)="addProfToClasse()" class="btn btn-primary" style="flex:none">Affecter</button>
                  <button (click)="showAddProf.set(false)" class="btn btn-secondary" style="flex:none">Annuler</button>
                </div>
              }
              <div class="table-scroll">
                <table class="table"><thead><tr><th>Nom</th><th>Prénom</th><th>Matière</th><th>Email</th><th>Téléphone</th><th>Statut</th></tr></thead>
                <tbody>
                  @for (a of classeDetails()?.enseignants || []; track a.id) {
                    <tr><td>{{ a.enseignant?.nom }}</td><td>{{ a.enseignant?.prenom }}</td><td>{{ a.matiere?.nom }}</td><td>{{ a.enseignant?.email }}</td><td>{{ a.enseignant?.telephone || '—' }}</td>
                      <td><span class="tag" [class]="a.enseignant?.statut==='ACTIF' ? 'tag-success' : 'tag-accent'">{{ a.enseignant?.statut }}</span></td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="table-empty">Aucun enseignant affecté</td></tr>
                  }
                </tbody></table>
              </div>
            }
            @if (classeDetailTab()==='matieres') {
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <span class="text-muted" style="font-size:13px">{{ (classeDetails()?.matieres || []).length }} matière(s) affectée(s)</span>
                @if (canEdit()) { <button (click)="showAddMatiere.set(!showAddMatiere())" class="btn btn-primary btn-sm"><span class="material-symbols-outlined" style="font-size:16px">add</span> Ajouter une matière</button> }
              </div>
              @if (showAddMatiere() && canEdit()) {
                <div class="gs-well" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <select [(ngModel)]="addMatiereId" class="input" style="flex:1">
                    <option value="">Matière...</option>
                    @for (m of matiereCandidats(); track m.id) { <option [value]="m.id">{{ m.nom }} ({{ m.code }})</option> }
                  </select>
                  <input type="number" step="0.5" min="0" placeholder="Coefficient" [(ngModel)]="addMatiereCoefficient" class="input" style="width:130px" />
                  <button (click)="addMatiereToClasse()" class="btn btn-primary" style="flex:none">Affecter</button>
                  <button (click)="showAddMatiere.set(false)" class="btn btn-secondary" style="flex:none">Annuler</button>
                </div>
                <p class="text-muted" style="font-size:11px;margin:0 0 16px">Le coefficient est propre à cette classe : la même matière peut avoir un coefficient différent dans une autre classe.</p>
              }
              <div class="table-scroll">
                <table class="table"><thead><tr><th>Matière</th><th>Code</th><th>Coefficient</th><th>Actions</th></tr></thead>
                <tbody>
                  @for (cm of classeDetails()?.matieres || []; track cm.id) {
                    <tr><td>{{ cm.matiere?.nom }}</td><td>{{ cm.matiere?.code }}</td><td>{{ cm.coefficient }}</td>
                      <td>@if (canEdit()) { <button (click)="removeMatiereFromClasse(cm.id)" class="btn btn-icon btn-danger" title="Retirer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button> }</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="table-empty">Aucune matière affectée</td></tr>
                  }
                </tbody></table>
              </div>
            }
            @if (classeDetailTab()==='edt') {
              @if (classeEdt().length > 0) {
                <div>
                  @for (slot of classeEdt(); track slot.id) {
                    <div class="edt-row">
                      <div style="flex:none;width:96px;text-align:center"><div style="font-size:12px;font-weight:600">{{ jourLabel(slot.jourSemaine) }}</div>@if (slot.dateDebut) { <div class="text-muted" style="font-size:11px">{{ slot.dateDebut | date:'dd/MM/yyyy' }}</div> }</div>
                      <div class="text-muted" style="flex:none;font-size:13px">{{ slot.heureDebut }} — {{ slot.heureFin }}</div>
                      <div style="flex:1"><div style="font-size:13px;font-weight:600">{{ slot.matiere?.nom }}</div><div class="text-muted" style="font-size:12px">{{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }}</div></div>
                      <span class="tag tag-neutral" style="flex:none">{{ slot.salle?.nom || '—' }}</span>
                    </div>
                  }
                </div>
              } @else {
                <div class="table-empty">Aucun créneau d'emploi du temps</div>
              }
              <button (click)="viewClasseEdt()" class="btn btn-primary" style="margin-top:16px"><span class="material-symbols-outlined" style="font-size:18px">calendar_month</span> Voir l'emploi du temps complet</button>
            }
          </div>
        </div>
      }
    </div>

    <!-- Panneau détail élève -->
    @if (eleveDrawerVisible()) {
      <div class="dialog-backdrop" style="display:flex;justify-content:flex-end;padding:0" (click)="eleveDrawerVisible.set(false)">
        <div style="width:100%;max-width:680px;height:100%;overflow-y:auto;background:var(--color-surface);border-left:1px solid var(--color-divider)" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:2px solid var(--color-divider);position:sticky;top:0;background:var(--color-surface);z-index:1">
            <h3 style="margin:0">{{ eleveDrawerTitle() }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="eleveDrawerVisible.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div style="padding:24px">
            @if (loadingEleveDetail()) {
              <div style="display:flex;align-items:center;justify-content:center;padding:40px 0"><span class="material-symbols-outlined text-2xl animate-spin text-muted" style="font-size:28px">progress_activity</span></div>
            } @else if (eleveDetail()) {
              <div class="gs-well" style="margin-bottom:20px;display:flex;gap:24px;flex-wrap:wrap;font-size:13px">
                <div><span class="text-muted">Téléphone :</span> <strong>{{ eleveDetail()?.etudiant?.telephone || '—' }}</strong></div>
                <div><span class="text-muted">Email :</span> <strong>{{ eleveDetail()?.etudiant?.email || '—' }}</strong></div>
              </div>

              <!-- Commentaires des professeurs -->
              <h4 style="margin:0 0 8px;font-size:14px">Commentaires des professeurs ({{ eleveDetail()?.commentaires?.length || 0 }})</h4>
              @if ((eleveDetail()?.commentaires?.length || 0) > 0) {
                <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
                  @for (c of eleveDetail()?.commentaires; track c.id) {
                    <div style="border:1px solid var(--color-divider);border-left:3px solid var(--color-accent);padding:10px 12px;font-size:13px">
                      <p style="margin:0;white-space:pre-wrap">{{ c.contenu }}</p>
                      <div class="text-muted" style="font-size:11px;margin-top:6px">{{ c.enseignant?.prenom }} {{ c.enseignant?.nom }} — {{ c.updatedAt | date:'dd/MM/yyyy à HH:mm' }}</div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-muted" style="font-size:13px;margin-bottom:20px">Aucun commentaire enregistré.</div>
              }

              <!-- Notes -->
              <h4 style="margin:0 0 8px;font-size:14px">Notes</h4>
              <div class="table-scroll" style="margin-bottom:20px">
                <table class="table">
                  <thead><tr><th>Matière</th><th>Période</th><th style="text-align:center">Note</th><th style="text-align:center">Sur</th><th>Date</th></tr></thead>
                  <tbody>
                    @for (n of eleveDetail()?.notes || []; track n.id) {
                      <tr>
                        <td>{{ n.matiere?.nom }}</td>
                        <td>{{ n.periode?.libelle || '—' }}</td>
                        <td style="text-align:center">
                          @if (n.note >= n.sur / 2) {
                            <span class="tag tag-success">{{ n.note }}</span>
                          } @else {
                            <span class="tag tag-danger">{{ n.note }}</span>
                          }
                        </td>
                        <td style="text-align:center">{{ n.sur }}</td>
                        <td>{{ n.dateSaisie | date:'dd/MM/yyyy' }}</td>
                      </tr>
                    } @empty {
                      <tr><td colspan="5" class="table-empty">Aucune note enregistrée.</td></tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Absences -->
              <h4 style="margin:0 0 8px;font-size:14px">Absences &amp; retards</h4>
              <div class="table-scroll">
                <table class="table">
                  <thead><tr><th>Date</th><th>Type</th><th>Matière</th><th>Justifié</th></tr></thead>
                  <tbody>
                    @for (a of eleveDetail()?.absences || []; track a.id) {
                      <tr>
                        <td>{{ a.date | date:'dd/MM/yyyy' }}</td>
                        <td><span class="tag" [class]="a.type === 'ABSENCE' ? 'tag-danger' : 'tag-accent'">{{ a.type === 'ABSENCE' ? 'Absence' : 'Retard' }}</span></td>
                        <td>{{ a.matiere?.nom }}</td>
                        <td>
                          @if (a.justified) {
                            <span class="tag tag-success">Justifié</span>
                          } @else {
                            <span class="tag tag-neutral">Non justifié</span>
                          }
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="4" class="table-empty">Aucune absence enregistrée.</td></tr>
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
export class DsiClasseDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Le DG a un accès lecture seule à cette page (pour l'envoi d'annonces à la
  // classe) — seul le DSI peut retirer une filière/matière d'une classe ici.
  canEdit(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === RoleUtilisateur.DSI || role === RoleUtilisateur.SUPER_ADMIN;
  }

  // L'envoi d'annonce WhatsApp à la classe est réservé au DG (cf. cahier des
  // charges — "cas particulier" section Annonces), pas au DSI.
  canSendAnnonce(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === RoleUtilisateur.DG || role === RoleUtilisateur.SUPER_ADMIN;
  }

  showAnnonceForm = signal(false);
  sendingAnnonce = signal(false);
  annonceForm = { sujet: '', contenu: '' };

  sendAnnonceClasse() {
    if (!this.annonceForm.sujet.trim() || !this.annonceForm.contenu.trim()) {
      this.alertService.error('Le sujet et le contenu sont requis');
      return;
    }
    this.sendingAnnonce.set(true);
    this.http.post(`${environment.apiUrl}/annonces/classe/${this.classeId}`, this.annonceForm).subscribe({
      next: () => {
        this.sendingAnnonce.set(false);
        this.showAnnonceForm.set(false);
        this.annonceForm = { sujet: '', contenu: '' };
        this.alertService.success('Annonce envoyée à la classe');
      },
      error: (err: any) => { this.sendingAnnonce.set(false); this.alertService.error(err?.error?.message || 'Erreur envoi'); },
    });
  }

  classeId = '';
  loading = signal(true);
  classeDetails = signal<any>(null);
  classeDetailTab = signal('eleves');
  classeDetailTabs = [
    { key: 'eleves', label: 'Élèves' },
    { key: 'enseignants', label: 'Enseignants' },
    { key: 'matieres', label: 'Matières' },
    { key: 'edt', label: 'Emploi du temps' },
  ];
  classeEdt = signal<any[]>([]);

  filieres = signal<any[]>([]);
  matieres = signal<any[]>([]);
  enseignants = signal<any[]>([]);
  etudiants = signal<any[]>([]);
  annees = signal<any[]>([]);

  showAddEleve = signal(false);
  addEleveId = '';
  eleveCandidats = computed(() => {
    const inClasse = new Set((this.classeDetails()?.etudiants || []).map((e: any) => e.id));
    return this.etudiants().filter((e: any) => !inClasse.has(e.id));
  });

  eleveDrawerVisible = signal(false);
  loadingEleveDetail = signal(false);
  eleveDetail = signal<any>(null);
  eleveDrawerTitle = signal('');

  openEleveDetail(etudiantId: string) {
    this.eleveDrawerVisible.set(true);
    this.loadingEleveDetail.set(true);
    this.eleveDetail.set(null);
    this.eleveDrawerTitle.set('Détail de l\'élève');

    this.http.get<any>(`${environment.apiUrl}/dsi/eleves/${etudiantId}/details`).subscribe({
      next: (data) => {
        this.eleveDetail.set(data);
        this.eleveDrawerTitle.set(`${data.etudiant?.nom || ''} ${data.etudiant?.prenom || ''}`);
        this.loadingEleveDetail.set(false);
      },
      error: (err: any) => {
        this.loadingEleveDetail.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur chargement détail';
        this.alertService.error(msg);
      },
    });
  }

  showAddProf = signal(false);
  addProfEnseignantId = '';
  addProfMatiereId = '';

  showAddMatiere = signal(false);
  addMatiereId = '';
  addMatiereCoefficient: number = 1;
  matiereCandidats = computed(() => {
    const used = new Set((this.classeDetails()?.matieres || []).map((cm: any) => cm.matiereId));
    return this.matieres().filter((m: any) => !used.has(m.id));
  });

  availableFilieresForClasse = computed(() => {
    const used = new Set(filiereIds(this.classeDetails()?.classe));
    return this.filieres().filter((f: any) => !used.has(f.id));
  });

  classeStats = computed(() => this.classeDetails()?.stats || { totalNotes: 0, moyenneGenerale: 0, moyennesParMatiere: [], totalAbsences: 0, repartitionAbsences: [], tauxRemplissage: 0 });

  matiereMoyenneBars = computed(() => {
    const data = this.classeStats().moyennesParMatiere as { matiere: string; moyenne: number }[];
    if (!data.length) return [];
    const width = 500, height = 200, padding = 20, topMargin = 15;
    const chartHeight = height - padding * 2 - topMargin;
    const max = 20;
    const slot = (width - padding * 2) / data.length;
    const barWidth = Math.min(50, slot * 0.55);
    return data.map((d, i) => {
      const h = (d.moyenne / max) * chartHeight;
      return {
        x: padding + i * slot + (slot - barWidth) / 2,
        y: height - padding - h,
        width: barWidth,
        height: h,
        label: d.matiere,
        value: d.moyenne,
      };
    });
  });

  absencesDonut = computed(() => {
    const colors: Record<string, string> = { ABSENCE: '#ef4444', RETARD: '#f59e0b', DEPART_ANTICIPE: '#6366f1' };
    const labels: Record<string, string> = { ABSENCE: 'Absences', RETARD: 'Retards', DEPART_ANTICIPE: 'Départs anticipés' };
    const data = this.classeStats().repartitionAbsences as { type: string; total: number }[];
    const total = data.reduce((s, r) => s + r.total, 0);
    if (total === 0) return [];
    let offset = 0;
    return data.map((r) => {
      const pct = (r.total / total) * 100;
      const seg = { label: labels[r.type] || r.type, value: r.total, pct, color: colors[r.type] || '#94a3b8', offset };
      offset += pct;
      return seg;
    });
  });

  ngOnInit() {
    this.classeId = this.route.snapshot.paramMap.get('id') || '';
    this.loadSupportingData();
    this.loadDetails();
  }

  breadcrumbItems = computed(() => {
    const role = this.authService.currentUser()?.role;
    const listeLabel = role === RoleUtilisateur.DG ? 'Élèves' : 'Classes';
    const listeRoute = role === RoleUtilisateur.DG ? '/dg/eleves' : '/dsi';
    const nom = this.classeDetails()?.classe?.nom;
    return [
      { label: listeLabel, route: listeRoute },
      { label: nom || '...' },
    ];
  });

  loadSupportingData() {
    this.http.get<any[]>(`${environment.apiUrl}/dsi/filieres`).subscribe({ next: (d) => this.filieres.set(d), error: () => this.filieres.set([]) });
    this.http.get<any[]>(`${environment.apiUrl}/dsi/matieres`).subscribe({ next: (d) => this.matieres.set(d), error: () => this.matieres.set([]) });
    this.http.get<any>(`${environment.apiUrl}/users?limit=1000&role=ENSEIGNANT`).subscribe({ next: (res) => this.enseignants.set(res.data || []), error: () => this.enseignants.set([]) });
    this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({ next: (res) => this.etudiants.set(res.data || []), error: () => this.etudiants.set([]) });
    this.http.get<any[]>(`${environment.apiUrl}/dsi/annees-scolaires`).subscribe({ next: (d) => this.annees.set(d), error: () => this.annees.set([]) });
  }

  loadDetails() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/dsi/classes/${this.classeId}/details`).subscribe({
      next: (d) => { this.classeDetails.set(d); this.loading.set(false); this.loadClasseEdt(); },
      error: () => { this.classeDetails.set(null); this.loading.set(false); },
    });
  }

  refreshClasseDetails() {
    this.http.get<any>(`${environment.apiUrl}/dsi/classes/${this.classeId}/details`).subscribe({
      next: (d) => this.classeDetails.set(d),
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  loadClasseEdt() {
    this.http.get<any[]>(`${environment.apiUrl}/etudes/edt/classe/${this.classeId}`).subscribe({ next: (d) => this.classeEdt.set(d), error: () => this.classeEdt.set([]) });
  }

  viewClasseEdt() {
    this.router.navigate(['/etudes/emploi-du-temps'], { queryParams: { classeId: this.classeId }});
  }

  jourLabel(j: number): string {
    return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][j] || '—';
  }

  addEleveToClasse() {
    const anneeActive = this.annees().find((a: any) => a.statut === 'active');
    if (!this.addEleveId || !anneeActive) { this.alertService.error('Sélectionnez un élève (année scolaire active requise)'); return; }
    this.http.post(`${environment.apiUrl}/etudiants/inscrire`, {
      etudiantId: this.addEleveId,
      classeId: this.classeId,
      anneeScolaireId: anneeActive.id,
    }).subscribe({
      next: () => { this.addEleveId = ''; this.showAddEleve.set(false); this.refreshClasseDetails(); },
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  addProfToClasse() {
    if (!this.addProfEnseignantId || !this.addProfMatiereId) { this.alertService.error('Enseignant et matière requis'); return; }
    this.http.post(`${environment.apiUrl}/etudes/affectations`, {
      enseignantId: this.addProfEnseignantId,
      matiereId: this.addProfMatiereId,
      classeId: this.classeId,
    }).subscribe({
      next: () => { this.addProfEnseignantId = ''; this.addProfMatiereId = ''; this.showAddProf.set(false); this.refreshClasseDetails(); },
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  addFiliereToClasseDetail(filiereId: string) {
    if (!filiereId) return;
    this.http.post(`${environment.apiUrl}/dsi/classes/${this.classeId}/filieres`, { filiereId }).subscribe({
      next: () => this.refreshClasseDetails(),
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  async removeFiliereFromClasseDetail(filiereId: string) {
    const ok = await this.alertService.confirm({ title: 'Retirer cette filière de la classe ?', confirmText: 'Retirer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/dsi/classes/${this.classeId}/filieres/${filiereId}`).subscribe({
      next: () => this.refreshClasseDetails(),
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  addMatiereToClasse() {
    if (!this.addMatiereId || !this.addMatiereCoefficient) { this.alertService.error('Matière et coefficient requis'); return; }
    this.http.post(`${environment.apiUrl}/dsi/classes/${this.classeId}/matieres`, {
      matiereId: this.addMatiereId,
      coefficient: +this.addMatiereCoefficient,
    }).subscribe({
      next: () => { this.addMatiereId = ''; this.addMatiereCoefficient = 1; this.showAddMatiere.set(false); this.refreshClasseDetails(); },
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  async removeMatiereFromClasse(classeMatiereId: string) {
    const ok = await this.alertService.confirm({ title: 'Retirer cette matière de la classe ?', confirmText: 'Retirer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/dsi/classes/${this.classeId}/matieres/${classeMatiereId}`).subscribe({
      next: () => this.refreshClasseDetails(),
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }
}
