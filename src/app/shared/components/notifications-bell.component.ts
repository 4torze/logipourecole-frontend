import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:relative" data-notif-dropdown>
      <button
        class="btn btn-icon btn-secondary"
        style="position:relative;border-color:transparent"
        (click)="open = !open"
      >
        <span class="material-symbols-outlined" style="font-size:20px">notifications</span>
        @if (unreadCount() > 0) {
          <span style="position:absolute;top:6px;right:7px;width:8px;height:8px;background:var(--color-accent);border-radius:50%;border:2px solid var(--color-bg)"></span>
        }
      </button>
      @if (open) {
        <div style="position:absolute;right:0;top:100%;margin-top:8px;width:320px;background:var(--color-surface);border:1px solid var(--color-divider);box-shadow:var(--shadow-md);padding:8px 0;z-index:50">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--color-divider)">
            <strong style="font-size:14px">Notifications</strong>
            <button class="btn btn-ghost btn-sm" (click)="markAllRead()">Tout marquer lu</button>
          </div>
          <div style="max-height:320px;overflow-y:auto">
            @if (notifications().length > 0) {
              @for (n of notifications(); track n.id) {
                <div
                  style="padding:12px 16px;border-bottom:1px solid var(--color-divider);cursor:pointer;display:flex;align-items:flex-start;justify-content:space-between;gap:8px"
                  [style.background]="!n.lu ? 'var(--color-accent-100)' : 'transparent'"
                  (click)="openNotification(n)"
                >
                  <div style="flex:1;min-width:0">
                    <div style="font-size:14px;font-weight:500">{{ n.titre }}</div>
                    <div style="font-size:12px;margin-top:2px" class="text-muted">{{ n.message }}</div>
                    <div style="font-size:11px;margin-top:4px" class="text-muted">{{ n.date | date:'dd/MM/yyyy HH:mm' }}</div>
                  </div>
                  @if (n.lien) {
                    <span class="material-symbols-outlined" style="font-size:18px;color:color-mix(in srgb, var(--color-text) 40%, transparent);flex:none">chevron_right</span>
                  }
                </div>
              }
            } @else {
              <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:48px 0" class="text-muted">
                <span class="material-symbols-outlined" style="font-size:36px;opacity:0.5">notifications_off</span>
                <p style="font-size:14px;margin:0">Aucune notification</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class NotificationsBellComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  notifications = signal<any[]>([]);
  unreadCount = signal(0);
  open = false;

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.http.get<any[]>(`${environment.apiUrl}/notifications`).subscribe({
      next: (data) => this.notifications.set(data),
      error: () => this.notifications.set([]),
    });
    this.http.get<any>(`${environment.apiUrl}/notifications/unread-count`).subscribe({
      next: (data) => this.unreadCount.set(data.count || 0),
      error: () => this.unreadCount.set(0),
    });
  }

  markRead(notif: any) {
    if (!notif.lu) {
      this.http.post(`${environment.apiUrl}/notifications/${notif.id}/read`, {}).subscribe({
        next: () => this.loadNotifications(),
      });
    }
  }

  // Marque comme lue (si besoin) puis navigue vers la ressource liée — même
  // sur une notification déjà lue, pour permettre de la rouvrir.
  openNotification(notif: any) {
    this.open = false;
    this.markRead(notif);
    if (notif.lien) {
      this.router.navigateByUrl(notif.lien);
    }
  }

  markAllRead() {
    this.http.post(`${environment.apiUrl}/notifications/read-all`, {}).subscribe({
      next: () => this.loadNotifications(),
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-notif-dropdown]') && this.open) {
      this.open = false;
    }
  }
}
