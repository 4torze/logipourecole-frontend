import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DsiTabService {
  activeTab = signal<string>('ecole');

  tabs = [
    { key: 'ecole', label: 'École', icon: 'account_balance' },
    { key: 'filieres', label: 'Filières', icon: 'apps' },
    { key: 'classes', label: 'Classes', icon: 'category' },
    { key: 'matieres', label: 'Matières', icon: 'book' },
    { key: 'enseignants', label: 'Enseignants', icon: 'person_add' },
    { key: 'etudiants', label: 'Étudiants', icon: 'groups' },
    { key: 'affectations-enseignants', label: 'Affect. Enseignants', icon: 'group_add' },
    { key: 'annees', label: 'Années scolaires', icon: 'calendar_month' },
    { key: 'audit', label: "Journal d'audit", icon: 'history' },
  ];

  setTab(key: string) {
    this.activeTab.set(key);
  }
}
