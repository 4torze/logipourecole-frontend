import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { RoleUtilisateur } from '../../core/models';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

type MainTab = 'messages' | 'annonces';
type AnnonceTab = 'inbox' | 'nouvelle' | 'historique';

@Component({
  selector: 'app-messagerie-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h1 style="margin:0">Messagerie</h1>
        @if (mainTab() === 'messages' && canCreateConversation()) {
          <button (click)="showNewForm.set(true)" class="btn btn-primary btn-sm">
            <span class="material-symbols-outlined" style="font-size:16px">add</span> Nouvelle conversation
          </button>
        }
      </div>

      <div style="display:flex;gap:6px;margin-bottom:20px;border-bottom:2px solid var(--color-divider)">
        <button (click)="mainTab.set('messages')" class="tab-btn" [class.active]="mainTab() === 'messages'">
          <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">forum</span> Messages
        </button>
        <button (click)="mainTab.set('annonces')" class="tab-btn" [class.active]="mainTab() === 'annonces'">
          <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">campaign</span> Annonces
          @if (unreadAnnonces() > 0) { <span class="tag tag-accent" style="margin-left:6px">{{ unreadAnnonces() }}</span> }
        </button>
      </div>

      @if (mainTab() === 'messages') {
        @if (showNewForm()) {
          <div class="dialog-backdrop" (click)="showNewForm.set(false)">
            <div class="dialog" (click)="$event.stopPropagation()">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span class="dialog-title">Nouvelle conversation</span>
                <button class="btn btn-icon btn-secondary" (click)="showNewForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
              </div>
              <div class="field"><label>Sujet (optionnel)</label><input type="text" [(ngModel)]="newSujet" class="input" /></div>
              <div class="field">
                <label>Participants ({{ selectedIds().size }} sélectionné(s))</label>
                <input type="text" [ngModel]="search()" (ngModelChange)="search.set($event)" class="input" placeholder="Rechercher..." style="margin-bottom:8px" />
                <div style="max-height:240px;overflow-y:auto;border:1px solid var(--color-divider)">
                  @for (u of filteredUsers(); track u.id) {
                    <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--color-divider);cursor:pointer">
                      <input type="checkbox" [checked]="selectedIds().has(u.id)" (change)="toggle(u.id)" />
                      <span>{{ u.prenom }} {{ u.nom }} <span class="text-muted" style="font-size:12px">— {{ u.role }}</span></span>
                    </label>
                  } @empty {
                    <div class="table-empty">Aucun utilisateur trouvé</div>
                  }
                </div>
              </div>
              <div class="dialog-actions">
                <button (click)="showNewForm.set(false)" class="btn btn-secondary">Annuler</button>
                <button (click)="createConversation()" [disabled]="creating()" class="btn btn-primary">Créer</button>
              </div>
            </div>
          </div>
        }

        @if (loadingConversations()) {
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
            <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
          </div>
        } @else if (conversations().length > 0) {
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (c of conversations(); track c.id) {
              <div (click)="openConversation(c.id)" style="padding:16px;border:1px solid var(--color-divider);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px">
                <div>
                  <strong>{{ c.sujet || participantsLabel(c) }}</strong>
                  @if (c.classeId) { <span class="tag tag-neutral" style="margin-left:8px">Groupe classe</span> }
                  @if (c.messages?.[0]) { <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">{{ c.messages[0].contenu }}</p> }
                </div>
                @if (c.unread > 0) { <span class="tag tag-accent">{{ c.unread }}</span> }
              </div>
            }
          </div>
        } @else {
          <div class="table-empty">
            <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">forum</span>
            Aucune conversation
          </div>
        }
      }

      @if (mainTab() === 'annonces') {
        @if (canManageAnnonces()) {
          <div style="display:flex;gap:6px;margin-bottom:16px">
            <button (click)="annonceTab.set('inbox')" class="btn btn-sm" [class.btn-primary]="annonceTab() === 'inbox'" [class.btn-secondary]="annonceTab() !== 'inbox'">Boîte de réception</button>
            <button (click)="annonceTab.set('nouvelle')" class="btn btn-sm" [class.btn-primary]="annonceTab() === 'nouvelle'" [class.btn-secondary]="annonceTab() !== 'nouvelle'">Nouvelle annonce</button>
            <button (click)="openHistorique()" class="btn btn-sm" [class.btn-primary]="annonceTab() === 'historique'" [class.btn-secondary]="annonceTab() !== 'historique'">Historique</button>
          </div>
        }

        @if (annonceTab() === 'inbox') {
          @if (loadingInbox()) {
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
              <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
            </div>
          } @else if (inbox().data.length > 0) {
            <div style="display:flex;flex-direction:column;gap:8px">
              @for (item of inbox().data; track item.id) {
                <div (click)="openAnnonce(item)" style="padding:16px;border:1px solid var(--color-divider);cursor:pointer" [style.background]="item.lu ? 'var(--color-surface)' : 'var(--color-accent-100)'">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                    <strong>{{ item.annonce.sujet }}</strong>
                    @if (!item.lu) { <span class="tag tag-accent">Nouveau</span> }
                  </div>
                  <p style="margin:6px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 65%, transparent)">{{ item.annonce.auteur?.prenom }} {{ item.annonce.auteur?.nom }} · {{ item.annonce.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  @if (expandedId() === item.id) {
                    <p style="margin:12px 0 0;font-size:14px;white-space:pre-line">{{ item.annonce.contenu }}</p>
                  }
                </div>
              }
            </div>
            <app-pagination [page]="inboxPage()" [pageSize]="pageSize" [totalItems]="inbox().total" (pageChange)="changeInboxPage($event)"></app-pagination>
          } @else {
            <div class="table-empty">
              <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">campaign</span>
              Aucune annonce reçue
            </div>
          }
        }

        @if (annonceTab() === 'nouvelle') {
          <div class="gs-panel" style="max-width:800px">
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:16px">
              <div class="field"><label>Sujet</label><input type="text" [(ngModel)]="annonceForm.sujet" class="input" placeholder="Ex: Réunion parents-professeurs" /></div>
              <div class="field"><label>Contenu</label><textarea [(ngModel)]="annonceForm.contenu" class="input" rows="5" placeholder="Contenu de l'annonce..."></textarea></div>
              <div class="field">
                <label>Canal de diffusion</label>
                <select [(ngModel)]="annonceForm.canal" class="input">
                  <option value="EMAIL">Email uniquement</option>
                  <option value="WHATSAPP">WhatsApp uniquement</option>
                  <option value="EMAIL_WHATSAPP">Email + WhatsApp</option>
                </select>
              </div>
              <div class="field">
                <label>Destinataires ({{ annonceSelectedIds().size }} sélectionné(s))</label>
                <input type="text" [ngModel]="annonceSearch()" (ngModelChange)="annonceSearch.set($event)" class="input" placeholder="Rechercher par nom ou rôle..." style="margin-bottom:8px" />
                <div style="max-height:280px;overflow-y:auto;border:1px solid var(--color-divider)">
                  @for (u of filteredAnnonceUsers(); track u.id) {
                    <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--color-divider);cursor:pointer">
                      <input type="checkbox" [checked]="annonceSelectedIds().has(u.id)" (change)="toggleAnnonceDestinataire(u.id)" />
                      <span>{{ u.prenom }} {{ u.nom }} <span class="text-muted" style="font-size:12px">— {{ u.role }}</span></span>
                    </label>
                  } @empty {
                    <div class="table-empty">Aucun utilisateur trouvé</div>
                  }
                </div>
              </div>
              <div style="display:flex;gap:8px">
                <button (click)="sendAnnonce()" [disabled]="sendingAnnonce()" class="btn btn-primary">
                  @if (sendingAnnonce()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } Envoyer l'annonce
                </button>
              </div>
            </div>
          </div>
        }

        @if (annonceTab() === 'historique') {
          <div class="gs-panel">
            <div class="gs-panel-body">
              @if (loadingHistorique()) {
                <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
                  <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
                </div>
              } @else {
                <div class="table-scroll">
                  <table class="table">
                    <thead><tr><th>Sujet</th><th>Auteur</th><th>Classe</th><th>Canal</th><th>Destinataires</th><th>Lues</th><th>Date</th></tr></thead>
                    <tbody>
                      @for (a of historique().data; track a.id) {
                        <tr>
                          <td style="font-weight:600">{{ a.sujet }}</td>
                          <td>{{ a.auteur?.prenom }} {{ a.auteur?.nom }}</td>
                          <td>{{ a.classe?.nom || '—' }}</td>
                          <td><span class="tag tag-neutral">{{ a.canal }}</span></td>
                          <td>{{ a.totalDestinataires }}</td>
                          <td>{{ a.totalLus }} / {{ a.totalDestinataires }}</td>
                          <td>{{ a.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="7" class="table-empty">Aucune annonce envoyée</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
                <app-pagination [page]="historiquePage()" [pageSize]="pageSize" [totalItems]="historique().total" (pageChange)="changeHistoriquePage($event)"></app-pagination>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .tab-btn { background:none; border:none; padding:10px 16px; font-size:14px; font-weight:600; cursor:pointer; color:color-mix(in srgb, var(--color-text) 55%, transparent); border-bottom:2px solid transparent; margin-bottom:-2px; }
    .tab-btn.active { color:var(--color-accent); border-bottom-color:var(--color-accent); }
  `],
})
export class MessagerieHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private realtime = inject(RealtimeService);
  private router = inject(Router);

  pageSize = 20;
  mainTab = signal<MainTab>('messages');
  annonceTab = signal<AnnonceTab>('inbox');

  // --- Messages ---
  conversations = signal<any[]>([]);
  loadingConversations = signal(true);
  users = signal<Utilisateur[]>([]);
  search = signal('');
  selectedIds = signal<Set<string>>(new Set());
  showNewForm = signal(false);
  newSujet = '';
  creating = signal(false);

  filteredUsers = computed(() => {
    const s = this.search().toLowerCase().trim();
    if (!s) return this.users();
    return this.users().filter((u) => `${u.nom} ${u.prenom} ${u.role}`.toLowerCase().includes(s));
  });

  canCreateConversation(): boolean {
    return this.authService.currentUser()?.role !== RoleUtilisateur.ETUDIANT;
  }

  // --- Annonces ---
  inbox = signal<{ data: any[]; total: number; unread: number }>({ data: [], total: 0, unread: 0 });
  loadingInbox = signal(true);
  inboxPage = signal(1);
  expandedId = signal<string | null>(null);

  historique = signal<{ data: any[]; total: number }>({ data: [], total: 0 });
  loadingHistorique = signal(true);
  historiquePage = signal(1);

  annonceForm = { sujet: '', contenu: '', canal: 'EMAIL' as 'EMAIL' | 'WHATSAPP' | 'EMAIL_WHATSAPP' };
  annonceSearch = signal('');
  annonceSelectedIds = signal<Set<string>>(new Set());
  sendingAnnonce = signal(false);

  filteredAnnonceUsers = computed(() => {
    const s = this.annonceSearch().toLowerCase().trim();
    if (!s) return this.users();
    return this.users().filter((u) => `${u.nom} ${u.prenom} ${u.role}`.toLowerCase().includes(s));
  });

  unreadAnnonces = computed(() => this.realtime.unreadAnnonces());

  canManageAnnonces(): boolean {
    return this.authService.hasRole('DG', 'DSI', 'SUPER_ADMIN');
  }

  ngOnInit() {
    this.loadConversations();
    this.loadInbox();
    if (this.canCreateConversation() || this.canManageAnnonces()) {
      this.http.get<any>(`${environment.apiUrl}/users?limit=1000`).subscribe({
        next: (res) => this.users.set(res.data || []),
        error: () => this.users.set([]),
      });
    }
  }

  // --- Messages logic ---
  loadConversations() {
    this.loadingConversations.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/messagerie/conversations`).subscribe({
      next: (d) => { this.conversations.set(d); this.loadingConversations.set(false); },
      error: () => { this.conversations.set([]); this.loadingConversations.set(false); },
    });
  }

  participantsLabel(c: any): string {
    const user = this.authService.currentUser();
    const isSelf = (p: any) => (user?.etudiantId ? p.etudiant?.id === user.etudiantId : p.utilisateur?.id === user?.id);
    return (c.participants || [])
      .filter((p: any) => !isSelf(p))
      .map((p: any) => `${p.utilisateur?.prenom || p.etudiant?.prenom || ''} ${p.utilisateur?.nom || p.etudiant?.nom || ''}`.trim())
      .join(', ') || 'Conversation';
  }

  toggle(id: string) {
    const set = new Set(this.selectedIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.selectedIds.set(set);
  }

  createConversation() {
    if (this.selectedIds().size === 0) {
      this.alertService.error('Sélectionnez au moins un participant');
      return;
    }
    this.creating.set(true);
    this.http.post<any>(`${environment.apiUrl}/messagerie/conversations`, {
      sujet: this.newSujet || undefined,
      utilisateurIds: Array.from(this.selectedIds()),
    }).subscribe({
      next: (c) => {
        this.creating.set(false);
        this.showNewForm.set(false);
        this.newSujet = '';
        this.selectedIds.set(new Set());
        this.router.navigate(['/messagerie', c.id]);
      },
      error: (err: any) => { this.creating.set(false); this.alertService.error(err?.error?.message || 'Erreur création'); },
    });
  }

  openConversation(id: string) {
    this.router.navigate(['/messagerie', id]);
  }

  // --- Annonces logic ---
  loadInbox() {
    this.loadingInbox.set(true);
    this.http.get<any>(`${environment.apiUrl}/annonces/inbox?page=${this.inboxPage()}&limit=${this.pageSize}`).subscribe({
      next: (d) => { this.inbox.set(d); this.loadingInbox.set(false); },
      error: () => { this.inbox.set({ data: [], total: 0, unread: 0 }); this.loadingInbox.set(false); },
    });
  }

  changeInboxPage(page: number) {
    this.inboxPage.set(page);
    this.loadInbox();
  }

  openAnnonce(item: any) {
    this.expandedId.set(this.expandedId() === item.id ? null : item.id);
    if (!item.lu) {
      this.http.post(`${environment.apiUrl}/annonces/${item.id}/lu`, {}).subscribe({
        next: () => {
          item.lu = true;
          this.inbox.update((v) => ({ ...v, unread: Math.max(0, v.unread - 1) }));
          this.realtime.refreshAnnoncesUnread();
        },
        error: () => {},
      });
    }
  }

  openHistorique() {
    this.annonceTab.set('historique');
    this.loadHistorique();
  }

  loadHistorique() {
    this.loadingHistorique.set(true);
    this.http.get<any>(`${environment.apiUrl}/annonces/historique?page=${this.historiquePage()}&limit=${this.pageSize}`).subscribe({
      next: (d) => { this.historique.set(d); this.loadingHistorique.set(false); },
      error: () => { this.historique.set({ data: [], total: 0 }); this.loadingHistorique.set(false); },
    });
  }

  changeHistoriquePage(page: number) {
    this.historiquePage.set(page);
    this.loadHistorique();
  }

  toggleAnnonceDestinataire(id: string) {
    const set = new Set(this.annonceSelectedIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.annonceSelectedIds.set(set);
  }

  sendAnnonce() {
    if (!this.annonceForm.sujet.trim() || !this.annonceForm.contenu.trim()) {
      this.alertService.error('Le sujet et le contenu sont requis');
      return;
    }
    if (this.annonceSelectedIds().size === 0) {
      this.alertService.error('Sélectionnez au moins un destinataire');
      return;
    }
    this.sendingAnnonce.set(true);
    this.http.post(`${environment.apiUrl}/annonces`, {
      sujet: this.annonceForm.sujet,
      contenu: this.annonceForm.contenu,
      canal: this.annonceForm.canal,
      destinataireIds: Array.from(this.annonceSelectedIds()),
    }).subscribe({
      next: () => {
        this.sendingAnnonce.set(false);
        this.alertService.success('Annonce envoyée');
        this.annonceForm = { sujet: '', contenu: '', canal: 'EMAIL' };
        this.annonceSelectedIds.set(new Set());
        this.annonceTab.set('inbox');
        this.loadInbox();
      },
      error: (err: any) => { this.sendingAnnonce.set(false); this.alertService.error(err?.error?.message || 'Erreur envoi'); },
    });
  }
}
