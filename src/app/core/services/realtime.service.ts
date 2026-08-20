import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface AppNotification {
  id: string;
  titre: string;
  message: string;
  type: string;
  lien?: string;
  lu: boolean;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private http = inject(HttpClient);
  private socket: Socket | null = null;

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  // Badges de menu (Messagerie/Annonces) — dérivés du même flux 'notification:new'
  // (type 'message'/'annonce'), mais tenus à jour séparément du compteur générique
  // ci-dessus car ils vivent dans la barre de nav, indépendamment de la cloche.
  unreadMessages = signal(0);
  unreadAnnonces = signal(0);

  connect(token: string) {
    if (this.socket?.connected) return;
    this.socket = io(environment.wsUrl, { auth: { token }, transports: ['websocket', 'polling'] });

    this.socket.on('notification:new', (notif: AppNotification) => {
      this.notifications.update((list) => [notif, ...list].slice(0, 50));
      this.unreadCount.update((n) => n + 1);
      if (notif.type === 'message') this.unreadMessages.update((n) => n + 1);
      if (notif.type === 'annonce') this.unreadAnnonces.update((n) => n + 1);
    });

    this.refreshMessagesUnread();
    this.refreshAnnoncesUnread();
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.unreadMessages.set(0);
    this.unreadAnnonces.set(0);
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('conversation:join', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('conversation:leave', conversationId);
  }

  onNewMessage(handler: (message: any) => void) {
    this.socket?.on('message:new', handler);
  }

  offNewMessage(handler: (message: any) => void) {
    this.socket?.off('message:new', handler);
  }

  setNotifications(notifications: AppNotification[]) {
    this.notifications.set(notifications);
  }

  setUnreadCount(count: number) {
    this.unreadCount.set(count);
  }

  refreshMessagesUnread() {
    this.http.get<{ count: number }>(`${environment.apiUrl}/messagerie/unread-count`).subscribe({
      next: (d) => this.unreadMessages.set(d.count || 0),
      error: () => {},
    });
  }

  refreshAnnoncesUnread() {
    this.http.get<{ count: number }>(`${environment.apiUrl}/annonces/unread-count`).subscribe({
      next: (d) => this.unreadAnnonces.set(d.count || 0),
      error: () => {},
    });
  }
}
