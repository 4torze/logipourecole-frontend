import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { RoleUtilisateur, SuperAdminStats } from '../../core/models';
import { environment } from '../../../environments/environment';
import { SuperAdminTabService } from '../../core/services/super-admin-tab.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .gs-stat { border:1px solid var(--color-divider); padding:20px; display:flex; flex-direction:column; gap:8px; }
    .gs-stat-label { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:color-mix(in srgb, var(--color-text) 60%, transparent); }
    .gs-stat-num { font-family:var(--font-heading); font-weight:800; font-size:32px; line-height:1; margin-left:-.03em; }
    .gs-panel { border:1px solid var(--color-divider); display:flex; flex-direction:column; }
    .gs-panel-head { padding:16px 20px; border-bottom:2px solid var(--color-divider); display:flex; align-items:center; justify-content:space-between; }
    .gs-panel-body { padding:20px; }
    .gs-bartrack { height:10px; background:var(--color-neutral-200); position:relative; }
    .gs-barfill { height:10px; background:var(--color-accent); position:absolute; left:0; top:0; }
  `],
  template: `
    <div style="padding:32px;display:flex;flex-direction:column;gap:28px;max-width:1440px;margin:0 auto">
      <!-- Welcome card -->
      <div style="border:1px solid var(--color-divider);background:var(--color-surface);padding:20px 24px;display:flex;align-items:center;gap:20px">
        <span style="width:52px;height:52px;border:1.5px solid var(--color-accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:20px;color:var(--color-accent);flex:none">{{ userInitials() }}</span>
        <div>
          <h2 style="margin:0">Bienvenue, {{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}</h2>
          <p style="margin:6px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 65%, transparent);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            Vous êtes connecté en tant que
            <span class="tag tag-accent">{{ roleLabel() }}</span>
            @if (authService.currentUser()?.ecole) {
              <span>· École : <strong style="color:var(--color-text)">{{ authService.currentUser()?.ecole?.nom }}</strong></span>
            }
          </p>
        </div>
      </div>

      @if (role() === RoleUtilisateur.SUPER_ADMIN) {
        <!-- SUPER ADMIN DASHBOARD -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
          <div class="gs-stat"><span class="gs-stat-label">Établissements</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().totalEcoles }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Actifs</span><span class="gs-stat-num">{{ kpi().ecolesActives }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Bloqués</span><span class="gs-stat-num" style="color:var(--color-accent-700)">{{ kpi().ecolesBloquees }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Utilisateurs</span><span class="gs-stat-num">{{ kpi().totalUsers }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Étudiants</span><span class="gs-stat-num">{{ kpi().totalEtudiants }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Revenu actif</span><span class="gs-stat-num" style="font-size:22px">{{ kpi().revenuActif | number:'1.0-0':'fr-FR' }}</span></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head">
              <h3 style="margin:0;font-size:16px">Évolution des inscriptions d'écoles</h3>
              <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">6 derniers mois</span>
            </div>
            <div class="gs-panel-body">
              @if (kpi().evolutionInscriptions?.length > 0) {
                <div style="display:flex;align-items:flex-end;gap:14px;height:160px">
                  @for (m of kpi().evolutionInscriptions; track m.mois; let last = $last) {
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1">
                      <div style="width:100%" [style.height.px]="barHeightOf(kpi().evolutionInscriptions, 'total', m.total)" [style.background]="last ? 'var(--color-accent)' : 'var(--color-neutral-300)'"></div>
                      <span style="font-size:11px" [style.color]="last ? 'var(--color-accent-700)' : 'color-mix(in srgb, var(--color-text) 55%, transparent)'" [style.font-weight]="last ? 600 : 400">{{ m.mois }}</span>
                    </div>
                  }
                </div>
              } @else {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucune donnée disponible.</p>
              }
            </div>
          </div>

          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Répartition par abonnement</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:14px">
              @for (seg of abonnementSegments(); track seg.statut) {
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>{{ seg.statut }}</span><strong>{{ seg.total }} · {{ seg.pct.toFixed(0) }}%</strong></div>
                  <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="seg.pct"></div></div>
                </div>
              } @empty {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucune donnée disponible.</p>
              }
              <div class="hr" style="margin:2px 0"></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:color-mix(in srgb, var(--color-text) 65%, transparent)">Total écoles</span><strong>{{ abonnementTotal() }}</strong></div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel" style="grid-column:span 3">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Établissements récents</h3></div>
            <div class="gs-panel-body">
              @if (kpi().ecolesRecentes?.length) {
                <div style="display:flex;flex-direction:column">
                  @for (e of kpi().ecolesRecentes; track e.id) {
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--color-divider)">
                      <div style="display:flex;align-items:center;gap:12px">
                        @if (e.logoUrl) {
                          <img [src]="ecoleLogoUrl(e.logoUrl)" alt="" style="width:32px;height:32px;object-fit:contain" />
                        } @else {
                          <span class="material-symbols-outlined" style="color:var(--color-accent);font-size:20px">account_balance</span>
                        }
                        <div>
                          <strong style="display:block;font-size:13px">{{ e.nom }}</strong>
                          <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ e.sousDomaine }}.raniag.com</span>
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:10px">
                        <span class="tag" [class]="e.actif ? 'tag-success' : 'tag-danger'">{{ e.actif ? 'Actif' : 'Bloqué' }}</span>
                        <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ e._count?.utilisateurs || 0 }} users</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0;text-align:center;padding:24px 0">Aucun établissement</p>
              }
            </div>
          </div>
          <div class="gs-panel" style="grid-column:span 2">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="goToSuperAdminTab('etablissements')">Gérer les établissements</button>
              <button class="btn btn-secondary btn-block" (click)="goToSuperAdminTab('utilisateurs')">Voir les utilisateurs</button>
              <button class="btn btn-secondary btn-block" (click)="goToSuperAdminTab('audit')">Journal d'audit</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/super-admin')">Espace Super Admin</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.DG) {
        <!-- DG DASHBOARD -->
        @if (kpi().alertes?.length > 0) {
          <div style="border:1px solid var(--color-divider);border-left:none;background:var(--color-surface);padding:16px 20px;display:flex;gap:12px;align-items:flex-start">
            <span style="width:8px;height:8px;background:var(--color-accent);margin-top:6px;flex:none"></span>
            <div>
              <p style="font-family:var(--font-heading);font-weight:800;font-size:14px;margin:0 0 4px">{{ kpi().alertes.length }} alerte(s)</p>
              @for (a of kpi().alertes; track $index) {
                <p style="font-size:13px;margin:0 0 4px;color:color-mix(in srgb, var(--color-text) 78%, transparent)">{{ a.message }}</p>
              }
            </div>
          </div>
        }

        <div>
          <h6 style="margin:0 0 12px">Effectifs &amp; académique</h6>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
            <div class="gs-stat"><span class="gs-stat-label">Étudiants</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().etudiants }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Enseignants</span><span class="gs-stat-num">{{ kpi().enseignants }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Classes</span><span class="gs-stat-num">{{ kpi().classes }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Filières</span><span class="gs-stat-num">{{ kpi().filieres }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Recouvrement</span><span class="gs-stat-num">{{ kpi().tauxRecouvrement }}%</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Prospects</span><span class="gs-stat-num">{{ kpi().prospects }}</span></div>
          </div>
        </div>

        <div>
          <h6 style="margin:0 0 12px">Utilisateurs &amp; infrastructure (DSI)</h6>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
            <div class="gs-stat"><span class="gs-stat-label">Utilisateurs</span><span class="gs-stat-num">{{ kpi().dsiTotalUsers }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Salles</span><span class="gs-stat-num">{{ kpi().dsiSalles }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Matières</span><span class="gs-stat-num">{{ kpi().dsiMatieres }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Affectations</span><span class="gs-stat-num">{{ kpi().dsiAffectations }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Encaissé</span><span class="gs-stat-num" style="font-size:22px">{{ kpi().encaisse | number:'1.0-0':'fr-FR' }}</span></div>
            <div class="gs-stat"><span class="gs-stat-label">Restant</span><span class="gs-stat-num" style="font-size:22px;color:var(--color-accent-700)">{{ kpi().restant | number:'1.0-0':'fr-FR' }}</span></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head">
              <h3 style="margin:0;font-size:16px">Évolution des inscriptions</h3>
              <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ kpi().evolutionInscriptions?.length || 0 }} mois</span>
            </div>
            <div class="gs-panel-body">
              @if (kpi().evolutionInscriptions?.length > 0) {
                <div style="display:flex;align-items:flex-end;gap:14px;height:160px">
                  @for (m of kpi().evolutionInscriptions; track m.mois; let last = $last) {
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1">
                      <div style="width:100%" [style.height.px]="evolutionBarHeight(m.count)" [style.background]="last ? 'var(--color-accent)' : 'var(--color-neutral-300)'"></div>
                      <span style="font-size:11px" [style.color]="last ? 'var(--color-accent-700)' : 'color-mix(in srgb, var(--color-text) 55%, transparent)'" [style.font-weight]="last ? 600 : 400">{{ m.mois }}</span>
                    </div>
                  }
                </div>
                <div class="hr" style="margin:16px 0 12px"></div>
                <div style="display:flex;justify-content:space-between;font-size:13px">
                  <span style="color:color-mix(in srgb, var(--color-text) 65%, transparent)">Total sur la période</span>
                  <strong style="font-family:var(--font-heading)">{{ totalInscriptions() }} inscriptions</strong>
                </div>
              } @else {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucune donnée pour l'année active.</p>
              }
            </div>
          </div>

          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Répartition par filière</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:14px">
              @for (seg of donutSegments(); track seg.filiere) {
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>{{ seg.filiere }}</span><strong>{{ seg.effectif }} · {{ seg.pct.toFixed(0) }}%</strong></div>
                  <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="seg.pct"></div></div>
                </div>
              } @empty {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucune donnée disponible.</p>
              }
              <div class="hr" style="margin:2px 0"></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:color-mix(in srgb, var(--color-text) 65%, transparent)">Total étudiants</span><strong>{{ donutTotal() }}</strong></div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Recouvrement</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de recouvrement</span><strong>{{ kpi().tauxRecouvrement }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="kpi().tauxRecouvrement"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Encaissé</span><strong>{{ kpi().encaisse | number:'1.0-0':'fr-FR' }} <span style="font-weight:400">FCFA</span></strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Restant</span><strong style="color:var(--color-accent-700)">{{ kpi().restant | number:'1.0-0':'fr-FR' }} <span style="font-weight:400">FCFA</span></strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>En règle / En retard</span><strong>{{ kpi().enRegle }} / {{ kpi().enRetard }}</strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Académique</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de réussite</span><strong>{{ kpi().tauxReussite }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="kpi().tauxReussite"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Bulletins générés</span><strong>{{ kpi().bulletinsGeneres }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Bulletins validés</span><strong>{{ kpi().bulletinsValides }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Abandons</span><strong style="color:var(--color-accent-700)">{{ kpi().abandons }}</strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Marketing</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de conversion</span><strong>{{ kpi().marketingTauxConversion }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="kpi().marketingTauxConversion"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Prospects</span><strong>{{ kpi().marketingTotal }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Inscrits</span><strong>{{ kpi().marketingInscrits }}</strong></div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Top 5 classes par effectif</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:14px">
              @for (c of kpi().topClasses; track c.classe) {
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>{{ c.classe }} <span style="color:color-mix(in srgb, var(--color-text) 55%, transparent)">· {{ c.filiere }}</span></span><strong>{{ c.effectif }}/{{ c.capaciteMax }}</strong></div>
                  <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="c.tauxRemplissage"></div></div>
                </div>
              } @empty {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucune donnée disponible.</p>
              }
            </div>
          </div>

          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="navigate('/daf')">Tableau financier</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/dg/utilisateurs')">Gérer les utilisateurs</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/daf/recus')">Templates de reçus</button>
              <div class="hr"></div>
              <button class="btn btn-secondary btn-block" (click)="exportData('etudiants/csv')">Exporter étudiants (CSV)</button>
              <button class="btn btn-secondary btn-block" (click)="exportData('tableau-financier/pdf')">Exporter tableau financier (PDF)</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.DAF) {
        <!-- DAF DASHBOARD -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px">
          <div class="gs-stat"><span class="gs-stat-label">Taux recouvrement</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().tauxRecouvrement }}%</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Encaissé</span><span class="gs-stat-num" style="font-size:24px">{{ kpi().encaisse | number:'1.0-0':'fr-FR' }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Restant</span><span class="gs-stat-num" style="font-size:24px;color:var(--color-accent-700)">{{ kpi().restant | number:'1.0-0':'fr-FR' }}</span></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Objectif : Recouvrement</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de recouvrement</span><strong>{{ kpi().tauxRecouvrement }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="kpi().tauxRecouvrement"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Étudiants en règle</span><strong>{{ kpi().enRegle }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Étudiants en retard</span><strong style="color:var(--color-accent-700)">{{ kpi().enRetard }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Étudiants inscrits</span><strong>{{ kpi().etudiants }}</strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="navigate('/daf')">Tableau financier</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/daf')">Enregistrer un élève</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/dg/utilisateurs')">Gérer les utilisateurs</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.DSI) {
        <!-- DSI DASHBOARD -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
          <div class="gs-stat"><span class="gs-stat-label">Utilisateurs</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().totalUsers }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Enseignants</span><span class="gs-stat-num">{{ kpi().enseignants }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Classes</span><span class="gs-stat-num">{{ kpi().classes }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Filières</span><span class="gs-stat-num">{{ kpi().filieres }}</span></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Gestion système</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Utilisateurs actifs</span><strong>{{ kpi().activeUsers }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Utilisateurs bloqués</span><strong style="color:var(--color-accent-700)">{{ kpi().blockedUsers }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Étudiants inscrits</span><strong>{{ kpi().etudiants }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Salles configurées</span><strong>{{ kpi().salles }}</strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="navigate('/dsi')">Créer un enseignant</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/dsi')">Enregistrer un élève</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/dsi')">Affecter les enseignants</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/etudes/emploi-du-temps')">Emploi du temps</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.ETUDES) {
        <!-- ETUDES DASHBOARD -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
          <div class="gs-stat"><span class="gs-stat-label">Étudiants</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().etudiants }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Classes</span><span class="gs-stat-num">{{ kpi().classes }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Filières</span><span class="gs-stat-num">{{ kpi().filieres }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Salles</span><span class="gs-stat-num">{{ kpi().salles }}</span></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Objectifs académiques</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de réussite</span><strong>{{ kpi().tauxReussite }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="kpi().tauxReussite"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Notes saisies</span><strong>{{ kpi().notesSaisies }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Bulletins générés</span><strong>{{ kpi().bulletinsGeneres }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Bulletins validés</span><strong>{{ kpi().bulletinsValides }}</strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="navigate('/etudes')">Direction des études</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/etudes/emploi-du-temps')">Emploi du temps</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/etudes/periodes')">Périodes scolaires</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/etudes/salles')">Salles</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.ENSEIGNANT) {
        <!-- ENSEIGNANT DASHBOARD -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
          <div class="gs-stat"><span class="gs-stat-label">Classes affectées</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().classes }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Matières</span><span class="gs-stat-num">{{ kpi().matieres }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Créneaux/sem</span><span class="gs-stat-num">{{ kpi().creneaux }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Notes saisies</span><span class="gs-stat-num">{{ kpi().notesSaisies }}</span></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Saisie des notes</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Progression saisie</span><strong>{{ kpi().notesSaisies }} notes</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="kpi().progressionSaisie"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Devoirs créés</span><strong>{{ kpi().devoirs }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Devoirs à corriger</span><strong style="color:var(--color-accent-700)">{{ kpi().devoirsACorriger }}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Absences enregistrées</span><strong>{{ kpi().absences }}</strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="navigate('/enseignant/notes')">Saisir des notes</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/enseignant/devoirs')">Gérer les devoirs</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/enseignant/absences')">Saisir les absences</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/enseignant')">Mon emploi du temps</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.ETUDIANT) {
        <!-- ETUDIANT DASHBOARD -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
          <div class="gs-stat"><span class="gs-stat-label">Moyenne générale</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().moyenne }}<span style="font-size:16px">/20</span></span></div>
          <div class="gs-stat"><span class="gs-stat-label">Rang</span><span class="gs-stat-num">{{ kpi().rang }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Absences</span><span class="gs-stat-num">{{ kpi().absences }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Reste à payer</span><span class="gs-stat-num" style="font-size:22px">{{ kpi().reste }}</span></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Mon parcours académique</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Progression scolarité</span><strong>{{ kpi().tauxPaiement }}%</strong></div>
              <div class="gs-bartrack"><div class="gs-barfill" [style.width.%]="kpi().tauxPaiement"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Statut paiement</span><span class="tag" [class]="kpi().reste === 0 ? 'tag-success' : 'tag-accent'">{{ kpi().reste === 0 ? 'À jour' : 'En retard' }}</span></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Devoirs à rendre</span><strong style="color:var(--color-accent-700)">{{ kpi().devoirsARendre }}</strong></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="navigate('/etudiant/bulletins')">Mes bulletins</button>
              <button class="btn btn-secondary btn-block" (click)="navigate('/etudiant')">Mon espace</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.SECRETAIRE) {
        <!-- SECRETAIRE DASHBOARD -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px">
          <div class="gs-stat"><span class="gs-stat-label">Étudiants</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().etudiants }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Inscriptions du jour</span><span class="gs-stat-num">{{ kpi().inscriptionsJour }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Prospects</span><span class="gs-stat-num">{{ kpi().prospects }}</span></div>
        </div>
        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
          <div class="gs-panel-body" style="display:flex;flex-wrap:wrap;gap:10px">
            <button class="btn btn-primary" (click)="navigate('/secretariat')">Secrétariat</button>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.MARKETING) {
        <!-- MARKETING DASHBOARD -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
          <div class="gs-stat"><span class="gs-stat-label">Prospects total</span><span class="gs-stat-num" style="color:var(--color-accent)">{{ kpi().prospects }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Inscrits</span><span class="gs-stat-num">{{ kpi().inscrits }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Perdus</span><span class="gs-stat-num">{{ kpi().perdus }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Taux conversion</span><span class="gs-stat-num">{{ kpi().tauxConversion }}%</span></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Conversion prospects</h3></div>
            <div class="gs-panel-body">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span>Taux de conversion</span><strong>{{ kpi().tauxConversion }}%</strong></div>
              <div class="gs-bartrack" style="margin-top:6px"><div class="gs-barfill" [style.width.%]="kpi().tauxConversion"></div></div>
            </div>
          </div>
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Actions rapides</h3></div>
            <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary btn-block" (click)="navigate('/marketing')">Marketing</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private superAdminTabService = inject(SuperAdminTabService);
  RoleUtilisateur = RoleUtilisateur;

  kpi = signal<any>({});

  role = computed(() => this.authService.currentUser()?.role);

  userInitials = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '?';
    return (u.prenom?.[0] || '') + (u.nom?.[0] || '');
  });

  roleLabel = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrateur',
      DG: 'Directeur Général',
      DAF: 'DAF',
      MARKETING: 'Marketing',
      SECRETAIRE: 'Secrétariat',
      DSI: 'DSI',
      ETUDES: 'Études',
      ENSEIGNANT: 'Enseignant',
      ETUDIANT: 'Étudiant',
    };
    return labels[user.role] || user.role;
  });

  ngOnInit() { this.loadKpi(); }

  loadKpi() {
    const r = this.role();
    if (r === RoleUtilisateur.SUPER_ADMIN) {
      this.http.get<SuperAdminStats>(`${environment.apiUrl}/admin/tenants/stats`).subscribe({
        next: (stats) => this.kpi.update((k) => ({ ...k, ...stats })),
        error: () => {},
      });
      this.http.get<any>(`${environment.apiUrl}/admin/tenants/ecoles`, { params: { limit: 5 }}).subscribe({
        next: (res) => {
          const ecoles = res.data || [];
          this.kpi.update((k) => ({
            ...k,
            ecolesRecentes: ecoles.slice().sort((a: any, b: any) => new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime()).slice(0, 5),
          }));
        },
        error: () => {},
      });
    } else if (r === RoleUtilisateur.DG) {
      this.http.get<any>(`${environment.apiUrl}/dg/dashboard`).subscribe({
        next: (d) => this.kpi.set({
          etudiants: d?.effectifs?.totalEtudiants || 0,
          enseignants: d?.effectifs?.totalEnseignants || 0,
          classes: d?.effectifs?.totalClasses || 0,
          filieres: d?.effectifs?.totalFilieres || 0,
          prospects: d?.effectifs?.totalProspects || 0,
          abandons: d?.effectifs?.totalEtudiantsAbandons || 0,
          tauxRecouvrement: d?.indicateursFinanciers?.tauxRecouvrement || 0,
          encaisse: d?.indicateursFinanciers?.encaisse || 0,
          restant: d?.indicateursFinanciers?.restant || 0,
          enRegle: d?.indicateursFinanciers?.enRegle || 0,
          enRetard: d?.indicateursFinanciers?.enRetard || 0,
          tauxReussite: d?.indicateursAcademiques?.tauxReussite || 0,
          notesSaisies: d?.indicateursAcademiques?.moyennesSaisies || 0,
          bulletinsGeneres: d?.indicateursAcademiques?.bulletinsGeneres || 0,
          bulletinsValides: d?.indicateursAcademiques?.bulletinsValides || 0,
          marketingTotal: d?.indicateursMarketing?.total || 0,
          marketingInscrits: d?.indicateursMarketing?.inscrits || 0,
          marketingPerdus: d?.indicateursMarketing?.perdus || 0,
          marketingTauxConversion: d?.indicateursMarketing?.tauxConversion || 0,
          dsiTotalUsers: d?.indicateursDSI?.totalUsers || 0,
          dsiActiveUsers: d?.indicateursDSI?.activeUsers || 0,
          dsiBlockedUsers: d?.indicateursDSI?.blockedUsers || 0,
          dsiSalles: d?.indicateursDSI?.totalSalles || 0,
          dsiMatieres: d?.indicateursDSI?.totalMatieres || 0,
          dsiAffectations: d?.indicateursDSI?.totalAffectations || 0,
          evolutionInscriptions: d?.evolutionInscriptions || [],
          alertes: d?.alertes || [],
          topClasses: d?.topClasses || [],
          repartitionFilieres: d?.repartitionFilieres || [],
        }),
        error: () => this.kpi.set({}),
      });
    } else if (r === RoleUtilisateur.DAF) {
      this.http.get<any>(`${environment.apiUrl}/daf/performance`).subscribe({
        next: (d) => this.kpi.set({
          tauxRecouvrement: d?.tauxRecouvrement || 0,
          encaisse: d?.montantTotalEncaisse || 0,
          restant: d?.montantTotalRestant || 0,
          enRegle: d?.effectifEnRegle || 0,
          enRetard: d?.effectifQuiDoivent || 0,
          etudiants: d?.effectifTotal || 0,
        }),
        error: () => this.kpi.set({}),
      });
    } else if (r === RoleUtilisateur.DSI) {
      this.http.get<any>(`${environment.apiUrl}/users?limit=1000`).subscribe({
        next: (res) => {
          const users = res.data || [];
          this.kpi.set({
            totalUsers: users.length,
            activeUsers: users.filter((u: any) => u.statut === 'ACTIF').length,
            blockedUsers: users.filter((u: any) => u.statut === 'INACTIF').length,
            enseignants: users.filter((u: any) => u.role === 'ENSEIGNANT').length,
          });
        }, error: () => this.kpi.set({}),
      });
      this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({
        next: (res) => this.kpi.update((k) => ({ ...k, etudiants: (res.data || []).length })),
        error: () => {},
      });
      this.http.get<any[]>(`${environment.apiUrl}/dsi/filieres`).subscribe({
        next: (d) => this.kpi.update((k) => ({ ...k, filieres: d.length })), error: () => {},
      });
      this.http.get<any[]>(`${environment.apiUrl}/dsi/classes`).subscribe({
        next: (d) => this.kpi.update((k) => ({ ...k, classes: d.length })), error: () => {},
      });
      this.http.get<any[]>(`${environment.apiUrl}/etudes/salles`).subscribe({
        next: (d) => this.kpi.update((k) => ({ ...k, salles: d.length })), error: () => {},
      });
    } else if (r === RoleUtilisateur.ETUDES) {
      this.http.get<any>(`${environment.apiUrl}/dg/dashboard`).subscribe({
        next: (d) => this.kpi.set({
          etudiants: d?.effectifs?.totalEtudiants || 0,
          classes: d?.effectifs?.totalClasses || 0,
          filieres: d?.effectifs?.totalFilieres || 0,
          tauxReussite: d?.indicateursAcademiques?.tauxReussite || 0,
          notesSaisies: d?.indicateursAcademiques?.moyennesSaisies || 0,
          bulletinsGeneres: d?.indicateursAcademiques?.bulletinsGeneres || 0,
          bulletinsValides: d?.indicateursAcademiques?.bulletinsValides || 0,
        }), error: () => this.kpi.set({}),
      });
      this.http.get<any[]>(`${environment.apiUrl}/etudes/salles`).subscribe({
        next: (d) => this.kpi.update((k) => ({ ...k, salles: d.length })), error: () => {},
      });
    } else if (r === RoleUtilisateur.ENSEIGNANT) {
      this.http.get<any[]>(`${environment.apiUrl}/enseignant/affectations`).subscribe({
        next: (d) => {
          const matieres = d.reduce((s: number, a: any) => s + (a.matieres?.length || 0), 0);
          this.kpi.set({ classes: d.length, matieres });
        }, error: () => this.kpi.set({}),
      });
      this.http.get<any[]>(`${environment.apiUrl}/enseignant/emploi-du-temps`).subscribe({
        next: (d) => this.kpi.update((k) => ({ ...k, creneaux: d.length })), error: () => {},
      });
      this.http.get<any[]>(`${environment.apiUrl}/enseignant/historique-saisies`).subscribe({
        next: (d) => this.kpi.update((k) => ({ ...k, notesSaisies: d.length, progressionSaisie: Math.min(100, Math.round(d.length / 10)) })), error: () => {},
      });
      this.http.get<any[]>(`${environment.apiUrl}/devoirs?classeId=all`).subscribe({
        next: (d) => this.kpi.update((k) => ({ ...k, devoirs: d.length, devoirsACorriger: d.filter((x: any) => !x.note).length })), error: () => {},
      });
    } else if (r === RoleUtilisateur.ETUDIANT) {
      const etudiantId = this.authService.currentUser()?.etudiantId;
      if (etudiantId) {
        this.http.get<any>(`${environment.apiUrl}/etudiants/${etudiantId}/scolarite`).subscribe({
          next: (d) => this.kpi.set({
            reste: d?.reste || 0,
            tauxPaiement: d?.tauxPaiement || 0,
          }), error: () => this.kpi.set({}),
        });
      }
    } else if (r === RoleUtilisateur.MARKETING) {
      this.http.get<any>(`${environment.apiUrl}/dg/dashboard`).subscribe({
        next: (d) => this.kpi.set({
          prospects: d?.indicateursMarketing?.total || 0,
          inscrits: d?.indicateursMarketing?.inscrits || 0,
          perdus: d?.indicateursMarketing?.perdus || 0,
          tauxConversion: d?.indicateursMarketing?.tauxConversion || 0,
        }), error: () => this.kpi.set({}),
      });
    } else if (r === RoleUtilisateur.SECRETAIRE) {
      this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({
        next: (res) => this.kpi.set({ etudiants: (res.data || []).length }), error: () => this.kpi.set({}),
      });
    }
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  evolutionMax = computed(() => {
    const data = this.kpi()?.evolutionInscriptions || [];
    return data.length ? Math.max(...data.map((d: any) => d.count)) : 0;
  });

  evolutionBarHeight(count: number): number {
    const max = this.evolutionMax();
    return max ? Math.max(6, Math.round((count / max) * 160)) : 6;
  }

  barHeightOf(data: any[], valueKey: string, value: number): number {
    const max = data.length ? Math.max(...data.map((d: any) => d[valueKey] || 0), 1) : 1;
    return Math.max(6, Math.round((value / max) * 160));
  }

  totalInscriptions = computed(() => (this.kpi()?.evolutionInscriptions || []).reduce((s: number, d: any) => s + d.count, 0));

  donutSegments = computed(() => {
    const data = this.kpi()?.repartitionFilieres || [];
    const total = data.reduce((s: number, f: any) => s + (f.effectif || 0), 0);
    if (total === 0) return [];
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];
    let offset = 0;
    return data.map((f: any, i: number) => {
      const pct = ((f.effectif || 0) / total) * 100;
      const seg = { ...f, pct, color: colors[i % colors.length], offset };
      offset += pct;
      return seg;
    });
  });

  donutTotal = computed(() => {
    const data = this.kpi()?.repartitionFilieres || [];
    return data.reduce((s: number, f: any) => s + (f.effectif || 0), 0);
  });

  abonnementColors: Record<string, string> = { GRATUIT: '#94a3b8', STANDARD: '#6366f1', PREMIUM: '#10b981', ACTIF: '#10b981', EXPIRE: '#ef4444', SUSPENDU: '#f59e0b' };

  abonnementSegments = computed(() => {
    const data = this.kpi()?.repartitionAbonnement || [];
    const total = data.reduce((s: number, r: any) => s + (r.total || 0), 0);
    if (total === 0) return [];
    let offset = 0;
    return data.map((r: any) => {
      const pct = ((r.total || 0) / total) * 100;
      const seg = { ...r, pct, color: this.abonnementColors[r.statut] || '#94a3b8', offset };
      offset += pct;
      return seg;
    });
  });

  abonnementTotal = computed(() => {
    const data = this.kpi()?.repartitionAbonnement || [];
    return data.reduce((s: number, r: any) => s + (r.total || 0), 0);
  });

  goToSuperAdminTab(tab: string) {
    this.superAdminTabService.setTab(tab);
    this.router.navigate(['/super-admin']);
  }

  ecoleLogoUrl(logoUrl: string): string {
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${logoUrl}`;
  }

  exportData(endpoint: string) {
    window.open(`${environment.apiUrl}/exports/${endpoint}`, '_blank');
  }
}
