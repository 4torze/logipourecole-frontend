import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" data-notif-dropdown>
      <button
        class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-colors"
        (click)="open = !open"
      >
        <span class="material-symbols-outlined text-xl">notifications</span>
        @if (unreadCount() > 0) {
          <span class="absolute top-1.5 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        }
      </button>
      @if (open) {
        <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-fade-in z-50">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <strong class="text-sm font-bold text-slate-900">Notifications</strong>
            <button class="text-xs font-semibold text-primary hover:underline" (click)="markAllRead()">Tout marquer lu</button>
          </div>
          <div class="max-h-80 overflow-y-auto">
            @if (notifications().length > 0) {
              @for (n of notifications(); track n.id) {
                <div
                  class="px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors"
                  [class.bg-orange-50]="!n.lu"
                  (click)="markRead(n)"
                >
                  <div class="text-sm font-medium text-slate-900">{{ n.titre }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">{{ n.message }}</div>
                  <div class="text-[11px] text-slate-400 mt-1">{{ n.date | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>
              }
            } @else {
              <div class="flex flex-col items-center gap-3 py-12 text-slate-400">
                <span class="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
                <p class="text-sm">Aucune notification</p>
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
