import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DsiTabService } from '../../core/services/dsi-tab.service';

@Component({
  selector: 'app-dsi-parametres',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <h1 style="margin:0 0 4px">Paramètres</h1>
      <p style="margin:0 0 24px;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Réglages de fonctionnement propres au DSI</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
        <a routerLink="/etudes/annees-scolaires" class="card" style="text-decoration:none;color:inherit;border:1px solid var(--color-divider)">
          <span class="material-symbols-outlined" style="font-size:28px;color:var(--color-accent)">calendar_month</span>
          <span class="card-title">Années scolaires</span>
          <p class="card-body">Créer et consulter les années scolaires de l'établissement.</p>
        </a>
        <a routerLink="/etudes/periodes" class="card" style="text-decoration:none;color:inherit;border:1px solid var(--color-divider)">
          <span class="material-symbols-outlined" style="font-size:28px;color:var(--color-accent)">schedule</span>
          <span class="card-title">Trimestres / Semestres</span>
          <p class="card-body">Définir le découpage de l'année (type et dates de chaque période).</p>
        </a>
        <a (click)="goToEcoleInfos()" class="card" style="text-decoration:none;color:inherit;border:1px solid var(--color-divider);cursor:pointer">
          <span class="material-symbols-outlined" style="font-size:28px;color:var(--color-accent)">school</span>
          <span class="card-title">Infos établissement</span>
          <p class="card-body">Coordonnées et informations générales de l'école.</p>
        </a>
      </div>
    </div>
  `,
})
export class DsiParametresComponent {
  private router = inject(Router);
  private dsiTabService = inject(DsiTabService);

  goToEcoleInfos() {
    this.dsiTabService.setTab('ecole');
    this.router.navigateByUrl('/dsi');
  }
}
