import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-etudiant-home',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzIconModule, NzTagModule, NzStatisticModule, NzGridModule, NzEmptyModule, NzProgressModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Mon espace étudiant</h1>

      <div nz-row [nzGutter]="[16, 16]" style="margin-bottom: 24px;">
        <div nz-col [nzXs]="12" [nzSm]="6"><nz-card><nz-statistic nzTitle="Moyenne générale" [nzValue]="moyenne()" nzSuffix="/20" [nzValueStyle]="{color:'#c2410c',fontWeight:700}"></nz-statistic></nz-card></div>
        <div nz-col [nzXs]="12" [nzSm]="6"><nz-card><nz-statistic nzTitle="Rang" [nzValue]="rang()" [nzValueStyle]="{color:'#059669',fontWeight:700}"></nz-statistic></nz-card></div>
        <div nz-col [nzXs]="12" [nzSm]="6"><nz-card><nz-statistic nzTitle="Absences" [nzValue]="absences()" [nzValueStyle]="{color:'#dc2626',fontWeight:700}"></nz-statistic></nz-card></div>
        <div nz-col [nzXs]="12" [nzSm]="6"><nz-card><nz-statistic nzTitle="Reste à payer" [nzValue]="scolarite()?.reste || 0" nzSuffix="FCFA" [nzValueStyle]="{color:'#f59e0b',fontWeight:700}"></nz-statistic></nz-card></div>
      </div>

      <div nz-row [nzGutter]="[16, 16]" style="margin-bottom: 24px;">
        <div nz-col [nzXs]="24" [nzMd]="8">
          <nz-card nzTitle="Objectif: Scolarité" nzSize="small">
            <div style="display:flex; flex-direction:column; gap:12px;">
              @if (scolarite()) {
                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Progression paiement</span><strong>{{ tauxPaiement() }}%</strong></div><nz-progress [nzPercent]="tauxPaiement()" nzStatus="active"></nz-progress></div>
                <div style="display:flex; justify-content:space-between;"><span>Statut</span><nz-tag [nzColor]="scolarite()?.statut === 'À jour' ? 'success' : 'error'">{{ scolarite()?.statut }}</nz-tag></div>
                <div style="display:flex; justify-content:space-between;"><span>Montant total</span><strong>{{ scolarite()?.montantTotal || 0 | number:'1.0-0':'fr-FR' }} FCFA</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Total payé</span><strong style="color:#059669;">{{ scolarite()?.totalPaye || 0 | number:'1.0-0':'fr-FR' }} FCFA</strong></div>
              }
            </div>
          </nz-card>
        </div>
        <div nz-col [nzXs]="24" [nzMd]="8">
          <nz-card nzTitle="Objectif: Académique" nzSize="small">
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Moyenne /20</span><strong>{{ moyenne() }}</strong></div><nz-progress [nzPercent]="moyenne() * 5" nzStatus="active"></nz-progress></div>
              <div style="display:flex; justify-content:space-between;"><span>Rang en classe</span><strong>{{ rang() }}</strong></div>
              <div style="display:flex; justify-content:space-between;"><span>Devoirs à rendre</span><strong style="color:#f59e0b;">{{ devoirsARendre() }}</strong></div>
              <div style="display:flex; justify-content:space-between;"><span>Absences non justifiées</span><strong style="color:#dc2626;">{{ absences() }}</strong></div>
            </div>
          </nz-card>
        </div>
        <div nz-col [nzXs]="24" [nzMd]="8">
          <nz-card nzTitle="Actions rapides" nzSize="small">
            <div style="display:flex; flex-direction:column; gap:8px;">
              <button nz-button nzType="primary" (click)="goTo('/etudiant/bulletins')"><span nz-icon nzType="file-text"></span> Mes bulletins</button>
              <button nz-button (click)="goTo('/etudiant/paiements')"><span nz-icon nzType="dollar"></span> Mes paiements</button>
              <button nz-button (click)="goTo('/etudiant/parcours')"><span nz-icon nzType="node-index"></span> Mon parcours</button>
            </div>
          </nz-card>
        </div>
      </div>

      <nz-card style="margin-bottom: 24px;" nzTitle="Mon parcours">
        @if (parcours().length > 0) {
          <div style="position:relative; padding-left:24px;">
            @for (event of parcours(); track $index) {
              <div style="position:relative; padding-bottom:20px; border-left:2px solid #e5e7eb; padding-left:16px;">
                <div style="position:absolute; left:-7px; top:4px; width:12px; height:12px; border-radius:50%; background:#c2410c;"></div>
                <div style="font-size:12px; color:#9ca3af;">{{ event.date | date:'dd/MM/yyyy' }}</div>
                <div style="font-weight:500; margin-top:2px;">
                  <nz-tag [nzColor]="event.type === 'inscription' ? 'processing' : (event.type === 'paiement' ? 'success' : 'warning')" style="margin-right:8px;">{{ event.type }}</nz-tag>
                  {{ event.label }}
                </div>
              </div>
            }
          </div>
        } @else {
          <nz-empty nzDescription="Aucun parcours disponible"></nz-empty>
        }
      </nz-card>

      <div nz-row [nzGutter]="[16, 16]">
        <div nz-col [nzXs]="24" [nzSm]="8">
          <nz-card style="text-align:center; cursor:pointer;" (click)="goTo('/etudiant/bulletins')">
            <span nz-icon nzType="file-text" style="font-size:36px; color:#c2410c;"></span>
            <p style="margin-top:8px; font-weight:500;">Mes bulletins</p>
          </nz-card>
        </div>
        <div nz-col [nzXs]="24" [nzSm]="8">
          <nz-card style="text-align:center; cursor:pointer;" (click)="goTo('/etudiant/paiements')">
            <span nz-icon nzType="dollar" style="font-size:36px; color:#059669;"></span>
            <p style="margin-top:8px; font-weight:500;">Mes paiements</p>
          </nz-card>
        </div>
        <div nz-col [nzXs]="24" [nzSm]="8">
          <nz-card style="text-align:center; cursor:pointer;" (click)="goTo('/etudiant/parcours')">
            <span nz-icon nzType="node-index" style="font-size:36px; color:#0f766e;"></span>
            <p style="margin-top:8px; font-weight:500;">Mon parcours</p>
          </nz-card>
        </div>
      </div>
    </div>
  `,
})
export class EtudiantHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  etudiantId = computed(() => this.auth.currentUser()?.etudiantId || '');
  scolarite = signal<any>(null);
  parcours = signal<any[]>([]);
  moyenne = signal<number>(0);
  rang = signal<number>(0);
  absences = signal<number>(0);
  devoirsARendre = signal<number>(0);

  tauxPaiement = computed(() => {
    const s = this.scolarite();
    if (!s || !s.montantTotal) return 0;
    return Math.round((s.totalPaye / s.montantTotal) * 100);
  });

  ngOnInit() {
    if (!this.etudiantId()) return;
    this.loadScolarite(); this.loadParcours(); this.loadAcademic();
  }

  loadScolarite() { this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId()}/scolarite`).subscribe({ next: (d) => this.scolarite.set(d), error: () => this.scolarite.set(null) }); }
  loadParcours() { this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId()}/parcours`).subscribe({ next: (d) => this.parcours.set(d.parcours || []), error: () => this.parcours.set([]) }); }
  loadAcademic() {
    this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId()}/notes`).subscribe({ next: (d) => this.moyenne.set(d?.moyenne || 0), error: () => {} });
    this.http.get<any>(`${environment.apiUrl}/etudiants/${this.etudiantId()}/rang`).subscribe({ next: (d) => this.rang.set(d?.rang || 0), error: () => {} });
    this.http.get<any[]>(`${environment.apiUrl}/absences/etudiant/${this.etudiantId()}`).subscribe({ next: (d) => this.absences.set(d.length), error: () => {} });
  }

  goTo(route: string) { this.router.navigate([route]); }
}
