import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SuperAdminTabService {
  activeTab = signal<string>('etablissements');

  tabs = [
    { key: 'etablissements', label: 'Établissements', icon: 'bank' },
    { key: 'utilisateurs', label: 'Utilisateurs connectés', icon: 'team' },
    { key: 'audit', label: "Journal d'audit", icon: 'history' },
  ];

  setTab(key: string) {
    this.activeTab.set(key);
  }
}
