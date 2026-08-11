import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SuperAdminTabService } from '../../core/services/super-admin-tab.service';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container">
      @if (activeTab()==='etablissements') {
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-xl font-bold text-slate-900">Établissements inscrits ({{ ecolesTotal() }})</h3>
          <button class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all active:scale-[0.98] text-sm" (click)="showForm.set(true)">
            <span class="material-symbols-outlined text-xl">add</span> Nouvelle école
          </button>
        </div>

        <!-- Create Modal -->
        @if (showForm()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" (click)="showForm.set(false)">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-[780px] mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 class="font-bold text-lg text-slate-900">Créer une nouvelle école</h3>
                <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showForm.set(false)"><span class="material-symbols-outlined">close</span></button>
              </div>
              <form (ngSubmit)="createEcole()" class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-700">Nom de l'établissement <span class="text-red-500">*</span></label>
                    <input type="text" placeholder="Ex: Lycée Jean Moulin" [(ngModel)]="newEcole.nom" name="nom" required class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-700">Sous-domaine <span class="text-red-500">*</span></label>
                    <div class="flex items-stretch h-11 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                      <input type="text" placeholder="mon-ecole" [(ngModel)]="newEcole.sousDomaine" name="sousDomaine" required class="flex-1 px-4 bg-transparent outline-none text-sm placeholder:text-slate-400" />
                      <span class="flex items-center px-3 text-xs text-slate-500 bg-slate-100 border-l border-slate-200 whitespace-nowrap">.logipourecole.com</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-700">Email de contact</label>
                    <input type="email" placeholder="contact@ecole.com" [(ngModel)]="newEcole.email" name="email" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-700">Téléphone</label>
                    <input type="text" placeholder="+33 1 23 45 67 89" [(ngModel)]="newEcole.telephone" name="telephone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400" />
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-semibold text-slate-700">Adresse</label>
                    <input type="text" placeholder="123 rue de l'Éducation, 75001 Paris" [(ngModel)]="newEcole.adresse" name="adresse" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-700">Site web</label>
                    <input type="text" placeholder="https://www.ecole.com" [(ngModel)]="newEcole.siteWeb" name="siteWeb" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-700">Logo de l'établissement</label>
                    <div class="flex items-center gap-3">
                      <label class="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary cursor-pointer flex items-center justify-center bg-slate-50 transition-all relative overflow-hidden">
                        @if (newEcole.logoUrl) {
                          <img [src]="logoPreview()" alt="Logo" class="w-full h-full object-contain" />
                        } @else {
                          <div class="flex flex-col items-center gap-1 text-slate-400">
                            <span class="material-symbols-outlined text-xl">upload</span>
                            <span class="text-[10px]">Téléverser</span>
                          </div>
                        }
                        <input type="file" accept="image/*" class="hidden" (change)="onLogoSelect($event)" />
                      </label>
                      @if (newEcole.logoUrl) {
                        <button type="button" class="text-xs text-red-600 hover:underline" (click)="removeLogo()">Supprimer le logo</button>
                      }
                    </div>
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-semibold text-slate-700">Description</label>
                    <textarea rows="3" placeholder="Brève description de l'établissement..." [(ngModel)]="newEcole.description" name="description" class="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400 resize-none"></textarea>
                  </div>
                </div>
                <div class="flex items-center gap-3 mt-6">
                  <button type="submit" [disabled]="creating()" class="flex items-center gap-2 h-11 px-6 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    @if (creating()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> Création... } @else { Créer l'établissement }
                  </button>
                  <button type="button" (click)="showForm.set(false)" class="h-11 px-6 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Details Modal -->
        @if (showDetails()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" (click)="showDetails.set(false)">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-[640px] mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 class="font-bold text-lg text-slate-900">Détails de l'établissement</h3>
                <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showDetails.set(false)"><span class="material-symbols-outlined">close</span></button>
              </div>
              @if (selectedEcole()) {
                <div class="p-6">
                  <div class="grid grid-cols-2 gap-px bg-slate-200 rounded-lg overflow-hidden">
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Nom</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole().nom }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Sous-domaine</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole().sousDomaine }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Email</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole().email || '—' }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Téléphone</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole().telephone || '—' }}</p></div>
                    <div class="bg-white px-4 py-3 col-span-2"><span class="text-xs text-slate-500">Adresse</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole().adresse || '—' }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Site web</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole().siteWeb || '—' }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Abonnement</span><div class="mt-0.5"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="selectedEcole().statutAbonnement === 'PREMIUM' ? 'bg-green-100 text-green-800' : (selectedEcole().statutAbonnement === 'STANDARD' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800')">{{ selectedEcole().statutAbonnement }}</span></div></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Statut</span><div class="mt-0.5"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="selectedEcole().actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'">{{ selectedEcole().actif ? 'Actif' : 'Bloqué' }}</span></div></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Inscrite le</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole().dateInscription | date:'dd/MM/yyyy' }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Utilisateurs</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole()._count?.utilisateurs || 0 }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Étudiants</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole()._count?.etudiants || 0 }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Classes</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole()._count?.classes || 0 }}</p></div>
                    <div class="bg-white px-4 py-3"><span class="text-xs text-slate-500">Filières</span><p class="text-sm font-semibold text-slate-900 mt-0.5">{{ selectedEcole()._count?.filieres || 0 }}</p></div>
                  </div>

                  @if (selectedEcole().abonnements?.length) {
                    <h4 class="font-bold text-sm text-slate-900 mt-5 mb-3">Historique des abonnements</h4>
                    <div class="overflow-x-auto rounded-lg border border-slate-200">
                      <table class="w-full text-sm">
                        <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-2.5 text-left font-semibold">Plan</th><th class="px-4 py-2.5 text-left font-semibold">Début</th><th class="px-4 py-2.5 text-left font-semibold">Fin</th><th class="px-4 py-2.5 text-left font-semibold">Montant</th><th class="px-4 py-2.5 text-left font-semibold">Statut</th></tr></thead>
                        <tbody class="divide-y divide-slate-50">
                          @for (a of selectedEcole().abonnements; track a.id) {
                            <tr class="hover:bg-slate-50"><td class="px-4 py-2.5">{{ a.plan }}</td><td class="px-4 py-2.5">{{ a.dateDebut | date:'dd/MM/yyyy' }}</td><td class="px-4 py-2.5">{{ a.dateFin ? (a.dateFin | date:'dd/MM/yyyy') : '—' }}</td><td class="px-4 py-2.5">{{ a.montant }}</td><td class="px-4 py-2.5">{{ a.statut }}</td></tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }

                  <div class="mt-5">
                    <button (click)="confirmToggle(selectedEcole())" class="flex items-center gap-2 h-11 px-5 rounded-lg font-semibold transition-all text-sm" [class]="selectedEcole().actif ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 text-white hover:bg-green-700'">
                      <span class="material-symbols-outlined text-xl">{{ selectedEcole().actif ? 'block' : 'check_circle' }}</span>
                      {{ selectedEcole().actif ? 'Bloquer l\\'établissement' : 'Réactiver l\\'établissement' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Ecoles Table -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr><th class="px-4 py-3 text-left font-semibold">École</th><th class="px-4 py-3 text-left font-semibold">Abonnement</th><th class="px-4 py-3 text-left font-semibold">Statut</th><th class="px-4 py-3 text-left font-semibold">Utilisateurs</th><th class="px-4 py-3 text-left font-semibold">Étudiants</th><th class="px-4 py-3 text-left font-semibold">Inscrite le</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                @for (e of ecoles(); track e.id) {

                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3"><strong class="text-slate-900">{{ e.nom }}</strong><br /><span class="text-xs text-slate-500">{{ e.sousDomaine }}.logipourecole.com</span></td>
                    <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="e.statutAbonnement === 'PREMIUM' ? 'bg-green-100 text-green-800' : (e.statutAbonnement === 'STANDARD' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800')">{{ e.statutAbonnement }}</span></td>
                    <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="e.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'">{{ e.actif ? 'Actif' : 'Bloqué' }}</span></td>
                    <td class="px-4 py-3 text-slate-600">{{ e._count?.utilisateurs || 0 }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ e._count?.etudiants || 0 }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ e.dateInscription | date:'dd/MM/yyyy' }}</td>
                    <td class="px-4 py-3"><div class="flex items-center gap-1">
                      <button (click)="openDetails(e)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors" title="Voir les détails"><span class="material-symbols-outlined text-lg">visibility</span></button>
                      <button (click)="confirmToggle(e)" class="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" [class]="e.actif ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'" title="{{ e.actif ? 'Bloquer' : 'Activer' }}"><span class="material-symbols-outlined text-lg">{{ e.actif ? 'block' : 'check_circle' }}</span></button>
                    </div></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-6"><app-pagination [page]="ecolesPage()" [pageSize]="20" [totalItems]="ecolesTotal()" (pageChange)="changeEcolesPage($event)"></app-pagination></div>
        </div>
      }

      @if (activeTab()==='utilisateurs') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Utilisateurs connectés (toutes écoles)</h3></div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Email</th><th class="px-4 py-3 text-left font-semibold">École</th><th class="px-4 py-3 text-left font-semibold">Rôle</th><th class="px-4 py-3 text-left font-semibold">Statut</th><th class="px-4 py-3 text-left font-semibold">Dernière connexion</th></tr></thead>
              <tbody class="divide-y divide-slate-50">
                @for (u of utilisateurs().data || []; track u.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-slate-900">{{ u.nom }} {{ u.prenom }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ u.ecole?.nom || '—' }}</td>
                    <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{{ u.role }}</span></td>
                    <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="u.statut==='ACTIF' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">{{ u.statut }}</span></td>
                    <td class="px-4 py-3 text-slate-600">{{ u.derniereConnexion ? (u.derniereConnexion | date:'dd/MM/yyyy HH:mm') : 'Jamais connecté' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (utilisateurs().totalPages > 1) {
            <div class="flex items-center justify-center gap-4 px-6 py-4 border-t border-slate-100">
              <button [disabled]="usersPage()<=1" (click)="changeUsersPage(usersPage()-1)" class="h-9 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">Précédent</button>
              <span class="text-sm text-slate-600">Page {{ usersPage() }} / {{ utilisateurs().totalPages }}</span>
              <button [disabled]="usersPage()>=utilisateurs().totalPages" (click)="changeUsersPage(usersPage()+1)" class="h-9 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">Suivant</button>
            </div>
          }
        </div>
      }

      @if (activeTab()==='audit') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Journal d'audit (toutes écoles)</h3></div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Date</th><th class="px-4 py-3 text-left font-semibold">École</th><th class="px-4 py-3 text-left font-semibold">Utilisateur</th><th class="px-4 py-3 text-left font-semibold">Action</th><th class="px-4 py-3 text-left font-semibold">Table</th><th class="px-4 py-3 text-left font-semibold">ID</th></tr></thead>
              <tbody class="divide-y divide-slate-50">
                @for (a of audit().data || []; track a.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 text-slate-600">{{ a.date | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ a.ecole?.nom || '—' }}</td>
                    <td class="px-4 py-3 font-medium text-slate-900">{{ a.utilisateur ? (a.utilisateur.nom + ' ' + a.utilisateur.prenom) : 'Système' }}</td>
                    <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{{ a.action }}</span></td>
                    <td class="px-4 py-3 text-slate-600">{{ a.tableName }}</td>
                    <td class="px-4 py-3"><span class="text-xs text-slate-500">{{ a.recordId }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (audit().totalPages > 1) {
            <div class="flex items-center justify-center gap-4 px-6 py-4 border-t border-slate-100">
              <button [disabled]="auditPage()<=1" (click)="changeAuditPage(auditPage()-1)" class="h-9 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">Précédent</button>
              <span class="text-sm text-slate-600">Page {{ auditPage() }} / {{ audit().totalPages }}</span>
              <button [disabled]="auditPage()>=audit().totalPages" (click)="changeAuditPage(auditPage()+1)" class="h-9 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">Suivant</button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SuperAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private tabService = inject(SuperAdminTabService);

  activeTab = this.tabService.activeTab;

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

  newEcole: any = { nom: '', sousDomaine: '', adresse: '', telephone: '', email: '', siteWeb: '', logoUrl: '', description: '' };
  logoUploading = signal(false);
  logoPreview = signal('');

  ngOnInit() {
    this.loadEcoles();
    this.loadUtilisateurs();
    this.loadAudit();
  }

  loadEcoles() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/admin/tenants/ecoles`, { params: { page: this.ecolesPage(), limit: 20 } }).subscribe({
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

  confirmToggle(ecole: any) {
    const msg = ecole.actif ? 'Bloquer cet établissement ?' : 'Réactiver cet établissement ?';
    if (confirm(msg)) this.toggleEcole(ecole);
  }

  removeLogo() {
    this.newEcole.logoUrl = '';
    this.logoPreview.set('');
  }

  createEcole() {
    this.creating.set(true);
    this.http.post(`${environment.apiUrl}/admin/tenants/ecoles`, this.newEcole).subscribe({
      next: () => { this.showForm.set(false); this.newEcole = { nom: '', sousDomaine: '', adresse: '', telephone: '', email: '', siteWeb: '', logoUrl: '', description: '' }; this.logoPreview.set(''); this.creating.set(false); this.loadEcoles(); },
      error: () => this.creating.set(false),
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
      next: () => { this.loadEcoles(); this.showDetails.set(false); },
      error: () => {},
    });
  }

  loadUtilisateurs() {
    this.http.get<any>(`${environment.apiUrl}/admin/tenants/utilisateurs`, { params: { page: this.usersPage(), limit: 20 } }).subscribe({
      next: (res) => this.utilisateurs.set(res),
      error: () => this.utilisateurs.set({ data: [], total: 0, totalPages: 0 }),
    });
  }

  changeUsersPage(page: number) { this.usersPage.set(page); this.loadUtilisateurs(); }

  loadAudit() {
    this.http.get<any>(`${environment.apiUrl}/admin/tenants/audit`, { params: { page: this.auditPage(), limit: 50 } }).subscribe({
      next: (res) => this.audit.set(res),
      error: () => this.audit.set({ data: [], total: 0, totalPages: 0 }),
    });
  }

  changeAuditPage(page: number) { this.auditPage.set(page); this.loadAudit(); }
}
