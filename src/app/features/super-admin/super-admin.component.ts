import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { SuperAdminTabService } from '../../core/services/super-admin-tab.service';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { CreateEcoleResponse } from '../../core/models';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container">
      @if (activeTab()==='etablissements') {
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <h3 style="font-size:20px;margin:0">Établissements inscrits ({{ ecolesTotal() }})</h3>
          <button class="btn btn-primary" (click)="showForm.set(true)">
            <span class="material-symbols-outlined" style="font-size:20px">add</span> Nouvelle école
          </button>
        </div>

        <!-- Create Modal -->
        @if (showForm()) {
          <div class="dialog-backdrop" (click)="showForm.set(false)">
            <div class="dialog" style="width:min(780px,100%);max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <h3 class="dialog-title">Créer une nouvelle école</h3>
                <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
              </div>
              <form (ngSubmit)="createEcole()">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div class="field">
                    <label>Nom de l'établissement <span style="color:var(--color-accent)">*</span></label>
                    <input type="text" placeholder="Ex: Lycée Jean Moulin" [(ngModel)]="newEcole.nom" name="nom" required class="input" />
                  </div>
                  <div class="field">
                    <label>Sous-domaine <span style="color:var(--color-accent)">*</span></label>
                    <div style="display:flex;align-items:stretch;border:1px solid var(--color-divider);background:var(--color-surface)">
                      <input type="text" placeholder="mon-ecole" [(ngModel)]="newEcole.sousDomaine" name="sousDomaine" required style="flex:1;padding:0 12px;background:transparent;border:none;outline:none;font:inherit;font-size:14px;color:var(--color-text);min-height:36px" />
                      <span style="display:flex;align-items:center;padding:0 10px;font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent);background:var(--color-neutral-100);border-left:1px solid var(--color-divider);white-space:nowrap">.raniag.com</span>
                    </div>
                  </div>
                  <div class="field">
                    <label>Email de contact</label>
                    <input type="email" placeholder="contact@ecole.com" [(ngModel)]="newEcole.email" name="email" class="input" />
                  </div>
                  <div class="field">
                    <label>Site web</label>
                    <input type="text" placeholder="https://www.ecole.com" [(ngModel)]="newEcole.siteWeb" name="siteWeb" class="input" />
                  </div>
                  <div class="field" style="grid-column:span 2">
                    <label>Adresse</label>
                    <input type="text" placeholder="123 rue de l'Éducation, 75001 Paris" [(ngModel)]="newEcole.adresse" name="adresse" class="input" />
                  </div>

                  <div style="grid-column:span 2;margin-top:8px;padding-top:16px;border-top:1px solid var(--color-divider)">
                    <h4 style="display:flex;align-items:center;gap:8px;font-size:15px;margin:0"><span class="material-symbols-outlined" style="color:var(--color-accent);font-size:18px">badge</span> Directeur Général <span style="color:var(--color-accent)">*</span></h4>
                    <p style="font-size:12px;margin:4px 0 0" class="text-muted">Obligatoire à la création. Son numéro sert de contact initial de l'établissement (il pourra en désigner un autre ensuite). Ses identifiants de connexion lui seront envoyés par email.</p>
                  </div>
                  <div class="field">
                    <label>Nom du DG <span style="color:var(--color-accent)">*</span></label>
                    <input type="text" placeholder="Nom" [(ngModel)]="newEcole.dgNom" name="dgNom" required class="input" />
                  </div>
                  <div class="field">
                    <label>Prénom du DG <span style="color:var(--color-accent)">*</span></label>
                    <input type="text" placeholder="Prénom" [(ngModel)]="newEcole.dgPrenom" name="dgPrenom" required class="input" />
                  </div>
                  <div class="field">
                    <label>Email du DG <span style="color:var(--color-accent)">*</span></label>
                    <input type="email" placeholder="dg@ecole.com" [(ngModel)]="newEcole.dgEmail" name="dgEmail" required class="input" />
                  </div>
                  <div class="field">
                    <label>Téléphone du DG <span style="color:var(--color-accent)">*</span></label>
                    <input type="text" placeholder="+33 1 23 45 67 89" [(ngModel)]="newEcole.dgTelephone" name="dgTelephone" required class="input" />
                  </div>
                  <div class="field">
                    <label>Logo de l'établissement</label>
                    <div style="display:flex;align-items:center;gap:12px">
                      <label style="width:96px;height:96px;border:2px dashed var(--color-divider);cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--color-surface);position:relative;overflow:hidden">
                        @if (newEcole.logoUrl) {
                          <img [src]="logoPreview()" alt="Logo" style="width:100%;height:100%;object-fit:contain" />
                        } @else {
                          <div style="display:flex;flex-direction:column;align-items:center;gap:4px" class="text-muted">
                            <span class="material-symbols-outlined" style="font-size:20px">upload</span>
                            <span style="font-size:10px">Téléverser</span>
                          </div>
                        }
                        <input type="file" accept="image/*" style="display:none" (change)="onLogoSelect($event)" />
                      </label>
                      @if (newEcole.logoUrl) {
                        <button type="button" class="btn btn-ghost btn-sm" (click)="removeLogo()">Supprimer le logo</button>
                      }
                    </div>
                  </div>
                  <div class="field" style="grid-column:span 2">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Brève description de l'établissement..." [(ngModel)]="newEcole.description" name="description" class="input"></textarea>
                  </div>
                </div>
                <div class="dialog-actions" style="justify-content:flex-start;margin-top:24px">
                  <button type="submit" [disabled]="creating()" class="btn btn-primary">
                    @if (creating()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> Création... } @else { Créer l'établissement }
                  </button>
                  <button type="button" (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Credentials reveal modal -->
        @if (credentials(); as c) {
          <div class="dialog-backdrop">
            <div class="dialog" style="width:min(440px,100%)">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <h3 class="dialog-title">École créée avec succès</h3>
                <button class="btn btn-icon btn-secondary" (click)="credentials.set(null)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
              </div>
              <div style="display:flex;flex-direction:column;gap:16px">
                <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--color-accent-100);border:1px solid var(--color-accent-200);color:var(--color-accent-800);font-size:13px">
                  <span class="material-symbols-outlined" style="font-size:18px">info</span>
                  Un email avec ces identifiants a été envoyé au DG. Ce mot de passe ne sera plus jamais affiché ici.
                </div>
                <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px" class="text-muted">DG</span><span style="font-size:14px">{{ c.nom }} — {{ c.email }}</span></div>
                <div style="display:flex;flex-direction:column;gap:4px">
                  <span style="font-size:12px" class="text-muted">Mot de passe temporaire</span>
                  <div style="display:flex;align-items:center;gap:8px">
                    <code style="flex:1;font-size:14px;font-family:monospace;background:var(--color-neutral-100);border:1px solid var(--color-divider);padding:8px 12px">{{ c.password }}</code>
                    <button (click)="copyPassword(c.password)" class="btn btn-secondary btn-sm"><span class="material-symbols-outlined" style="font-size:16px">content_copy</span>Copier</button>
                  </div>
                </div>
                <button (click)="credentials.set(null)" class="btn btn-primary">Fermer</button>
              </div>
            </div>
          </div>
        }

        <!-- Details Modal -->
        @if (showDetails()) {
          <div class="dialog-backdrop" (click)="showDetails.set(false)">
            <div class="dialog" style="width:min(640px,100%);max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <h3 class="dialog-title">Détails de l'établissement</h3>
                <button class="btn btn-icon btn-secondary" (click)="showDetails.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
              </div>
              @if (selectedEcole()) {
                <div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--color-divider);border:1px solid var(--color-divider)">
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Nom</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole().nom }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Sous-domaine</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole().sousDomaine }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Email</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole().email || '—' }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Téléphone</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole().telephone || '—' }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px;grid-column:span 2"><span style="font-size:12px" class="text-muted">Adresse</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole().adresse || '—' }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Site web</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole().siteWeb || '—' }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Abonnement</span><div style="margin-top:2px"><span class="tag" [class]="selectedEcole().statutAbonnement === 'PREMIUM' ? 'tag-success' : (selectedEcole().statutAbonnement === 'STANDARD' ? 'tag-neutral' : 'tag-accent')">{{ selectedEcole().statutAbonnement }}</span></div></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Statut</span><div style="margin-top:2px"><span class="tag" [class]="selectedEcole().actif ? 'tag-success' : 'tag-danger'">{{ selectedEcole().actif ? 'Actif' : 'Bloqué' }}</span></div></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Inscrite le</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole().dateInscription | date:'dd/MM/yyyy' }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Utilisateurs</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole()._count?.utilisateurs || 0 }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Étudiants</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole()._count?.etudiants || 0 }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Classes</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole()._count?.classes || 0 }}</p></div>
                    <div style="background:var(--color-surface);padding:12px 16px"><span style="font-size:12px" class="text-muted">Filières</span><p style="font-size:14px;font-weight:600;margin:2px 0 0">{{ selectedEcole()._count?.filieres || 0 }}</p></div>
                  </div>

                  @if (selectedEcole().abonnements?.length) {
                    <h4 style="font-size:14px;margin:20px 0 12px">Historique des abonnements</h4>
                    <div style="overflow-x:auto">
                      <table class="table">
                        <thead><tr><th>Plan</th><th>Début</th><th>Fin</th><th>Montant</th><th>Statut</th></tr></thead>
                        <tbody>
                          @for (a of selectedEcole().abonnements; track a.id) {
                            <tr><td>{{ a.plan }}</td><td>{{ a.dateDebut | date:'dd/MM/yyyy' }}</td><td>{{ a.dateFin ? (a.dateFin | date:'dd/MM/yyyy') : '—' }}</td><td>{{ a.montant }}</td><td>{{ a.statut }}</td></tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }

                  <div style="margin-top:20px">
                    <button (click)="confirmToggle(selectedEcole())" class="btn" [class.btn-danger]="selectedEcole().actif" [class.btn-secondary]="!selectedEcole().actif">
                      <span class="material-symbols-outlined" style="font-size:20px">{{ selectedEcole().actif ? 'block' : 'check_circle' }}</span>
                      {{ selectedEcole().actif ? 'Bloquer l\\'établissement' : 'Réactiver l\\'établissement' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Ecoles Table -->
        <div class="gs-panel">
          <div class="gs-panel-body">
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>École</th><th>Abonnement</th><th>Statut</th><th>Utilisateurs</th><th>Étudiants</th><th>Inscrite le</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  @for (e of ecoles(); track e.id) {

                    <tr>
                      <td><strong style="font-weight:600">{{ e.nom }}</strong><br /><span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ e.sousDomaine }}.raniag.com</span></td>
                      <td><span class="tag" [class]="e.statutAbonnement === 'PREMIUM' ? 'tag-success' : (e.statutAbonnement === 'STANDARD' ? 'tag-neutral' : 'tag-accent')">{{ e.statutAbonnement }}</span></td>
                      <td><span class="tag" [class]="e.actif ? 'tag-success' : 'tag-danger'">{{ e.actif ? 'Actif' : 'Bloqué' }}</span></td>
                      <td>{{ e._count?.utilisateurs || 0 }}</td>
                      <td>{{ e._count?.etudiants || 0 }}</td>
                      <td>{{ e.dateInscription | date:'dd/MM/yyyy' }}</td>
                      <td><div style="display:flex;align-items:center;gap:4px">
                        <button (click)="openDetails(e)" class="btn btn-icon btn-secondary" title="Voir les détails"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button>
                        <button (click)="confirmToggle(e)" class="btn btn-icon" [class.btn-danger]="e.actif" [class.btn-secondary]="!e.actif" title="{{ e.actif ? 'Bloquer' : 'Activer' }}"><span class="material-symbols-outlined" style="font-size:18px">{{ e.actif ? 'block' : 'check_circle' }}</span></button>
                      </div></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pagination [page]="ecolesPage()" [pageSize]="20" [totalItems]="ecolesTotal()" (pageChange)="changeEcolesPage($event)"></app-pagination>
          </div>
        </div>
      }

      @if (activeTab()==='utilisateurs') {
        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:18px">Utilisateurs connectés (toutes écoles)</h3></div>
          <div class="gs-panel-body">
            <div style="overflow-x:auto">
              <table class="table">
                <thead><tr><th>Nom</th><th>Email</th><th>École</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th></tr></thead>
                <tbody>
                  @for (u of utilisateurs().data || []; track u.id) {
                    <tr>
                      <td style="font-weight:600">{{ u.nom }} {{ u.prenom }}</td>
                      <td>{{ u.email }}</td>
                      <td>{{ u.ecole?.nom || '—' }}</td>
                      <td><span class="tag tag-neutral">{{ u.role }}</span></td>
                      <td><span class="tag" [class]="u.statut==='ACTIF' ? 'tag-success' : 'tag-accent'">{{ u.statut }}</span></td>
                      <td>{{ u.derniereConnexion ? (u.derniereConnexion | date:'dd/MM/yyyy HH:mm') : 'Jamais connecté' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pagination [page]="usersPage()" [pageSize]="20" [totalItems]="utilisateurs().total" (pageChange)="changeUsersPage($event)"></app-pagination>
          </div>
        </div>
      }

      @if (activeTab()==='audit') {
        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:18px">Journal d'audit (toutes écoles)</h3></div>
          <div class="gs-panel-body">
            <div style="overflow-x:auto">
              <table class="table">
                <thead><tr><th>Date</th><th>École</th><th>Utilisateur</th><th>Action</th><th>Table</th><th>ID</th></tr></thead>
                <tbody>
                  @for (a of audit().data || []; track a.id) {
                    <tr>
                      <td>{{ a.date | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td>{{ a.ecole?.nom || '—' }}</td>
                      <td style="font-weight:600">{{ a.utilisateur ? (a.utilisateur.nom + ' ' + a.utilisateur.prenom) : 'Système' }}</td>
                      <td><span class="tag tag-neutral">{{ a.action }}</span></td>
                      <td>{{ a.tableName }}</td>
                      <td style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ a.recordId }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pagination [page]="auditPage()" [pageSize]="50" [totalItems]="audit().total" (pageChange)="changeAuditPage($event)"></app-pagination>
          </div>
        </div>
      }

      @if (activeTab()==='emails') {
        <div style="margin-bottom:20px">
          <h3 style="font-size:20px;margin:0">Style des emails</h3>
          <p style="font-size:14px;margin:4px 0 0" class="text-muted">Personnalisez l'apparence des emails transactionnels envoyés par la plateforme.</p>
        </div>

        @if (emailLoading()) {
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;padding:40px 0" class="text-muted"><span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...</div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="gs-panel"><div class="gs-panel-body">
              <div>
                <h4 style="font-size:14px;margin:0 0 4px">{{ emailTemplateNom() }}</h4>
                <p style="font-size:12px;margin:0" class="text-muted">Envoyé automatiquement à chaque création de compte (DG, DAF, DSI, Enseignant...).</p>
              </div>

              <div class="field">
                <label>Objet de l'email</label>
                <input type="text" [ngModel]="emailSujet()" (ngModelChange)="emailSujet.set($event)" class="input" />
              </div>

              <div class="field">
                <label>Variables disponibles</label>
                <div style="display:flex;flex-wrap:wrap;gap:6px">
                  @for (v of emailVariables(); track v) {
                    <span class="tag tag-neutral" style="font-family:monospace">{{ braced(v) }}</span>
                  }
                </div>
              </div>

              <div class="field">
                <label>Contenu HTML</label>
                <textarea rows="18" [ngModel]="emailHtml()" (ngModelChange)="emailHtml.set($event)" class="input" style="font-family:monospace;font-size:12px" spellcheck="false"></textarea>
              </div>

              <div style="display:flex;gap:12px">
                <button (click)="saveEmailTemplate()" [disabled]="emailSaving()" class="btn btn-primary">
                  @if (emailSaving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } Enregistrer
                </button>
                <button (click)="confirmResetEmailTemplate()" class="btn btn-secondary">Réinitialiser au modèle par défaut</button>
              </div>
            </div></div>

            <div class="gs-panel">
              <div class="gs-panel-head">
                <h4 style="font-size:14px;margin:0">Aperçu en direct</h4>
                <span style="font-size:12px" class="text-muted">Données d'exemple</span>
              </div>
              <div class="gs-panel-body" style="background:var(--color-neutral-100)">
                <iframe [srcdoc]="emailPreviewHtml()" style="width:100%;height:640px;border:1px solid var(--color-divider);background:var(--color-surface)" sandbox="allow-same-origin"></iframe>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class SuperAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private tabService = inject(SuperAdminTabService);
  private alertService = inject(AlertService);
  private sanitizer = inject(DomSanitizer);

  activeTab = this.tabService.activeTab;

  private static readonly EMAIL_TEMPLATE_CLE = 'BIENVENUE_UTILISATEUR';
  private static readonly EMAIL_SAMPLE: Record<string, string> = {
    PRENOM: 'Awa', NOM: 'Diallo', EMAIL: 'awa.diallo@ecole-exemple.com',
    MOT_DE_PASSE: 'X7k#pQ2mZa', ECOLE_NOM: 'Institut Technique Central',
    ROLE: 'DAF', LIEN_CONNEXION: 'https://app.raniag.com/login',
  };

  emailLoading = signal(true);
  emailSaving = signal(false);
  emailTemplateNom = signal('');
  emailSujet = signal('');
  emailHtml = signal('');
  emailVariables = signal<string[]>([]);
  emailPreviewHtml = computed<SafeHtml>(() => {
    const filled = this.emailHtml().replace(/\{\{(\w+)\}\}/g, (m, k) => SuperAdminComponent.EMAIL_SAMPLE[k] ?? m);
    return this.sanitizer.bypassSecurityTrustHtml(filled);
  });

  ecoles = signal<any[]>([]);
  ecolesPage = signal(1);
  ecolesTotal = signal(0);
  loading = signal(true);
  showForm = signal(false);
  creating = signal(false);

  showDetails = signal(false);
  selectedEcole = signal<any>(null);

  utilisateurs = signal<any>({ data: [], total: 0, totalPages: 0 });
  usersPage = signal(1);

  audit = signal<any>({ data: [], total: 0, totalPages: 0 });
  auditPage = signal(1);

  newEcole: any = { nom: '', sousDomaine: '', adresse: '', email: '', siteWeb: '', logoUrl: '', description: '', dgNom: '', dgPrenom: '', dgEmail: '', dgTelephone: '' };
  logoUploading = signal(false);
  logoPreview = signal('');
  credentials = signal<{ nom: string; email: string; password: string } | null>(null);

  ngOnInit() {
    this.loadEcoles();
    this.loadUtilisateurs();
    this.loadAudit();
    this.loadEmailTemplate();
  }

  loadEmailTemplate() {
    this.emailLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/admin/email-templates/${SuperAdminComponent.EMAIL_TEMPLATE_CLE}`).subscribe({
      next: (t) => {
        this.emailTemplateNom.set(t.nom);
        this.emailSujet.set(t.sujet);
        this.emailHtml.set(t.htmlContent);
        this.emailVariables.set(t.variables || []);
        this.emailLoading.set(false);
      },
      error: () => { this.emailLoading.set(false); this.alertService.error('Erreur lors du chargement du template'); },
    });
  }

  saveEmailTemplate() {
    this.emailSaving.set(true);
    this.http.patch<any>(`${environment.apiUrl}/admin/email-templates/${SuperAdminComponent.EMAIL_TEMPLATE_CLE}`, {
      sujet: this.emailSujet(),
      htmlContent: this.emailHtml(),
    }).subscribe({
      next: () => { this.emailSaving.set(false); this.alertService.success('Template email enregistré'); },
      error: (err) => { this.emailSaving.set(false); this.alertService.error(err.error?.message || 'Erreur lors de l\'enregistrement'); },
    });
  }

  braced(v: string) {
    return `{{${v}}}`;
  }

  async confirmResetEmailTemplate() {
    const ok = await this.alertService.confirm({
      title: 'Réinitialiser ce template ?',
      text: 'Le contenu actuel sera remplacé par le modèle par défaut de RANIAG.',
      confirmText: 'Réinitialiser',
      danger: true,
    });
    if (!ok) return;
    this.http.post<any>(`${environment.apiUrl}/admin/email-templates/${SuperAdminComponent.EMAIL_TEMPLATE_CLE}/reset`, {}).subscribe({
      next: (t) => {
        this.emailSujet.set(t.sujet);
        this.emailHtml.set(t.htmlContent);
        this.alertService.success('Template réinitialisé');
      },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la réinitialisation'),
    });
  }

  loadEcoles() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/admin/tenants/ecoles`, { params: { page: this.ecolesPage(), limit: 20 }}).subscribe({
      next: (res) => { this.ecoles.set(res.data || []); this.ecolesTotal.set(res.total || 0); this.loading.set(false); },
      error: () => { this.ecoles.set([]); this.ecolesTotal.set(0); this.loading.set(false); },
    });
  }

  changeEcolesPage(page: number) { this.ecolesPage.set(page); this.loadEcoles(); }

  onLogoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    this.logoUploading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<any>(`${environment.apiUrl}/admin/tenants/upload-logo`, formData).subscribe({
      next: (res) => {
        this.newEcole.logoUrl = res.logoUrl;
        this.logoPreview.set(`${environment.apiUrl.replace('/api', '')}${res.logoUrl}`);
        this.logoUploading.set(false);
      },
      error: () => this.logoUploading.set(false),
    });
  }

  async confirmToggle(ecole: any) {
    const action = ecole.actif ? 'bloquer' : 'réactiver';
    const ok = await this.alertService.confirm({
      title: `${ecole.actif ? 'Bloquer' : 'Réactiver'} cet établissement ?`,
      html: `Vous êtes sur le point de ${action} <strong>${ecole.nom}</strong>.`,
      confirmText: ecole.actif ? 'Bloquer' : 'Réactiver',
      danger: ecole.actif,
    });
    if (ok) this.toggleEcole(ecole);
  }

  removeLogo() {
    this.newEcole.logoUrl = '';
    this.logoPreview.set('');
  }

  copyPassword(password: string) {
    navigator.clipboard?.writeText(password);
  }

  createEcole() {
    const d = this.newEcole;
    if (!d.nom || !d.sousDomaine || !d.dgNom || !d.dgPrenom || !d.dgEmail || !d.dgTelephone) {
      this.alertService.error('Le nom, le sous-domaine et les informations du DG sont obligatoires');
      return;
    }
    this.creating.set(true);
    this.http.post<CreateEcoleResponse>(`${environment.apiUrl}/admin/tenants/ecoles`, this.newEcole).subscribe({
      next: (res) => {
        this.showForm.set(false);
        this.newEcole = { nom: '', sousDomaine: '', adresse: '', email: '', siteWeb: '', logoUrl: '', description: '', dgNom: '', dgPrenom: '', dgEmail: '', dgTelephone: '' };
        this.logoPreview.set('');
        this.creating.set(false);
        this.credentials.set({ nom: `${res.dg.prenom} ${res.dg.nom}`, email: res.dg.email, password: res.temporaryPassword });
        this.loadEcoles();
      },
      error: (err) => {
        this.creating.set(false);
        this.alertService.error(err.error?.message || "Erreur lors de la création de l'établissement");
      },
    });
  }

  openDetails(ecole: any) {
    this.http.get<any>(`${environment.apiUrl}/admin/tenants/ecoles/${ecole.id}`).subscribe({
      next: (d) => { this.selectedEcole.set(d); this.showDetails.set(true); },
      error: () => { this.selectedEcole.set(ecole); this.showDetails.set(true); },
    });
  }

  toggleEcole(ecole: any) {
    this.http.patch(`${environment.apiUrl}/admin/tenants/ecoles/${ecole.id}`, { actif: !ecole.actif }).subscribe({
      next: () => {
        this.loadEcoles();
        this.showDetails.set(false);
        this.alertService.success(ecole.actif ? 'Établissement bloqué' : 'Établissement réactivé');
      },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la mise à jour'),
    });
  }

  loadUtilisateurs() {
    this.http.get<any>(`${environment.apiUrl}/admin/tenants/utilisateurs`, { params: { page: this.usersPage(), limit: 20 }}).subscribe({
      next: (res) => this.utilisateurs.set(res),
      error: () => this.utilisateurs.set({ data: [], total: 0, totalPages: 0 }),
    });
  }

  changeUsersPage(page: number) { this.usersPage.set(page); this.loadUtilisateurs(); }

  loadAudit() {
    this.http.get<any>(`${environment.apiUrl}/admin/tenants/audit`, { params: { page: this.auditPage(), limit: 50 }}).subscribe({
      next: (res) => this.audit.set(res),
      error: () => this.audit.set({ data: [], total: 0, totalPages: 0 }),
    });
  }

  changeAuditPage(page: number) { this.auditPage.set(page); this.loadAudit(); }
}
