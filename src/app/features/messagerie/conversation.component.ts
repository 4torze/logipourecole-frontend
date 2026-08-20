import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-messagerie-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container" style="max-width:800px;display:flex;flex-direction:column;height:calc(100vh - 140px)">
      <button (click)="router.navigate(['/messagerie'])" class="btn btn-ghost" style="padding-left:0;margin-bottom:16px;flex:none">
        <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span> Retour aux conversations
      </button>

      <div class="gs-panel" style="flex:1;display:flex;flex-direction:column;min-height:0">
        <div class="gs-panel-body" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px">
          @if (loading()) {
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:20px 0">
              <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
            </div>
          } @else {
            @for (m of messages(); track m.id) {
              <div style="display:flex;flex-direction:column;align-items:{{ isMine(m) ? 'flex-end' : 'flex-start' }}">
                <div [style.background]="isMine(m) ? 'var(--color-accent)' : 'var(--color-neutral-100)'" [style.color]="isMine(m) ? 'var(--color-bg)' : 'var(--color-text)'" style="padding:10px 14px;max-width:75%">
                  @if (!isMine(m)) {
                    <div style="font-size:11px;font-weight:600;margin-bottom:2px;opacity:0.7">{{ senderName(m) }}</div>
                  }
                  <div style="font-size:14px;white-space:pre-line">{{ m.contenu }}</div>
                </div>
                <span style="font-size:10px;color:color-mix(in srgb, var(--color-text) 45%, transparent);margin-top:2px">{{ m.createdAt | date:'dd/MM HH:mm' }}</span>
              </div>
            } @empty {
              <div class="table-empty">Aucun message — démarrez la conversation</div>
            }
          }
        </div>
        <div style="display:flex;gap:8px;padding:16px;border-top:2px solid var(--color-divider);flex:none">
          <input type="text" [(ngModel)]="draft" (keyup.enter)="send()" class="input" placeholder="Votre message..." style="flex:1" />
          <button (click)="send()" [disabled]="sending() || !draft.trim()" class="btn btn-primary">
            <span class="material-symbols-outlined" style="font-size:18px">send</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConversationComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private realtime = inject(RealtimeService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  conversationId = '';
  messages = signal<any[]>([]);
  loading = signal(true);
  draft = '';
  sending = signal(false);

  private onMessage = (m: any) => {
    this.messages.update((list) => (list.some((x) => x.id === m.id) ? list : [...list, m]));
    // La conversation est ouverte : on marque tout de suite comme lu pour
    // éviter que le badge de menu reste incrémenté alors que le message est visible.
    if (!this.isMine(m)) {
      this.http.post(`${environment.apiUrl}/messagerie/conversations/${this.conversationId}/lu`, {}).subscribe({
        next: () => this.realtime.refreshMessagesUnread(),
        error: () => {},
      });
    }
  };

  ngOnInit() {
    this.conversationId = this.route.snapshot.paramMap.get('id') || '';
    this.load();
    this.http.post(`${environment.apiUrl}/messagerie/conversations/${this.conversationId}/lu`, {}).subscribe({
      next: () => this.realtime.refreshMessagesUnread(),
      error: () => {},
    });
    this.realtime.joinConversation(this.conversationId);
    this.realtime.onNewMessage(this.onMessage);
  }

  ngOnDestroy() {
    this.realtime.offNewMessage(this.onMessage);
    this.realtime.leaveConversation(this.conversationId);
  }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/messagerie/conversations/${this.conversationId}/messages`).subscribe({
      next: (d) => { this.messages.set(d.data || []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.alertService.error('Erreur lors du chargement de la conversation'); },
    });
  }

  isMine(m: any): boolean {
    const user = this.authService.currentUser();
    if (user?.etudiantId) return m.expediteurEtudiantId === user.etudiantId;
    return m.expediteurUtilisateurId === user?.id;
  }

  senderName(m: any): string {
    if (m.expediteurUtilisateur) return `${m.expediteurUtilisateur.prenom} ${m.expediteurUtilisateur.nom}`;
    if (m.expediteurEtudiant) return `${m.expediteurEtudiant.prenom} ${m.expediteurEtudiant.nom}`;
    return '';
  }

  send() {
    const contenu = this.draft.trim();
    if (!contenu) return;
    this.sending.set(true);
    this.http.post<any>(`${environment.apiUrl}/messagerie/conversations/${this.conversationId}/messages`, { contenu }).subscribe({
      next: (m) => {
        this.sending.set(false);
        this.draft = '';
        this.messages.update((list) => [...list, m]);
      },
      error: (err: any) => { this.sending.set(false); this.alertService.error(err?.error?.message || 'Erreur envoi'); },
    });
  }
}
