import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { RoleUtilisateur } from '../../core/models';
import { environment } from '../../../environments/environment';
import { SuperAdminTabService } from '../../core/services/super-admin-tab.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <!-- Welcome card -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6 flex items-center gap-5">
        <div class="h-15 w-15 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {{ userInitials() }}
        </div>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Bienvenue, {{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}</h2>
          <p class="text-sm text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap">
            Vous êtes connecté en tant que
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{{ roleLabel() }}</span>
            @if (authService.currentUser()?.ecole) {
              <span>· École : <strong class="text-slate-900">{{ authService.currentUser()?.ecole?.nom }}</strong></span>
            }
          </p>
        </div>
      </div>

      @if (role() === RoleUtilisateur.SUPER_ADMIN) {
        <!-- SUPER ADMIN DASHBOARD -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Établissements</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ kpi().totalEcoles }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actifs</p>
            <p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().ecolesActives }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bloqués</p>
            <p class="text-3xl font-bold text-red-600 mt-2">{{ kpi().ecolesBloquees }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateurs</p>
            <p class="text-3xl font-bold text-teal-600 mt-2">{{ kpi().totalUsers }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <div class="md:col-span-3 bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Établissements récents</h3></div>
            <div class="p-6">
              @if (kpi().ecolesRecentes?.length) {
                <div class="flex flex-col gap-3">
                  @for (e of kpi().ecolesRecentes; track e.id) {
                    <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div class="flex items-center gap-3">
                        @if (e.logoUrl) {
                          <img [src]="ecoleLogoUrl(e.logoUrl)" alt="" class="w-8 h-8 object-contain rounded-md" />
                        } @else {
                          <span class="material-symbols-outlined text-primary text-xl">account_balance</span>
                        }
                        <div>
                          <strong class="text-slate-900 text-sm">{{ e.nom }}</strong>
                          <div class="text-xs text-slate-500">{{ e.sousDomaine }}.logipourecole.com</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="e.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'">{{ e.actif ? 'Actif' : 'Bloqué' }}</span>
                        <span class="text-xs text-slate-500">{{ e._count?.utilisateurs || 0 }} users</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="flex flex-col items-center gap-3 py-12 text-slate-400">
                  <span class="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                  <p class="text-sm">Aucun établissement</p>
                </div>
              }
            </div>
          </div>
          <div class="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all active:scale-[0.98] text-sm" (click)="goToSuperAdminTab('etablissements')">
                <span class="material-symbols-outlined text-xl">account_balance</span> Gérer les établissements
              </button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="goToSuperAdminTab('utilisateurs')">
                <span class="material-symbols-outlined text-xl">groups</span> Voir les utilisateurs
              </button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="goToSuperAdminTab('audit')">
                <span class="material-symbols-outlined text-xl">history</span> Journal d'audit
              </button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/super-admin')">
                <span class="material-symbols-outlined text-xl">apps</span> Espace Super Admin
              </button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.DG) {
        <!-- DG DASHBOARD -->
        @if (kpi().alertes?.length > 0) {
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 flex gap-3">
            <span class="material-symbols-outlined text-amber-600 text-xl mt-0.5">warning</span>
            <div>
              <p class="font-semibold text-amber-900 text-sm mb-2">Alertes ({{ kpi().alertes.length }})</p>
              @for (a of kpi().alertes; track $index) {
                <div class="flex items-center gap-2 py-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" [class]="a.severity === 'high' ? 'bg-red-100 text-red-700' : (a.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')">{{ a.type }}</span>
                  <span class="text-sm text-slate-700">{{ a.message }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- KPI cards row 1: Effectifs globaux -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Étudiants</p><p class="text-3xl font-bold text-primary mt-2">{{ kpi().etudiants }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enseignants</p><p class="text-3xl font-bold text-amber-500 mt-2">{{ kpi().enseignants }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().classes }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filières</p><p class="text-3xl font-bold text-teal-600 mt-2">{{ kpi().filieres }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recouvrement</p><p class="text-3xl font-bold text-red-600 mt-2">{{ kpi().tauxRecouvrement }}%</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prospects</p><p class="text-3xl font-bold text-amber-700 mt-2">{{ kpi().prospects }}</p></div>
        </div>

        <!-- KPI cards row 2: DSI indicators -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateurs</p><p class="text-3xl font-bold text-indigo-600 mt-2">{{ kpi().dsiTotalUsers }}</p><p class="text-xs text-slate-400 mt-1">{{ kpi().dsiActiveUsers }} actifs · {{ kpi().dsiBlockedUsers }} bloqués</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salles</p><p class="text-3xl font-bold text-cyan-600 mt-2">{{ kpi().dsiSalles }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matières</p><p class="text-3xl font-bold text-purple-600 mt-2">{{ kpi().dsiMatieres }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Affectations</p><p class="text-3xl font-bold text-pink-600 mt-2">{{ kpi().dsiAffectations }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Encaissé</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().encaisse | number:'1.0-0':'fr-FR' }}<span class="text-sm"> FCFA</span></p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Restant</p><p class="text-3xl font-bold text-red-600 mt-2">{{ kpi().restant | number:'1.0-0':'fr-FR' }}<span class="text-sm"> FCFA</span></p></div>
        </div>

        <!-- Charts row 1: Evolution inscriptions (courbe) + Evolution paiements (courbe) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 class="font-bold text-lg text-slate-900">Évolution des inscriptions</h3>
              <span class="text-xs text-slate-400">{{ kpi().evolutionInscriptions?.length || 0 }} mois</span>
            </div>
            <div class="p-4">
              @if (kpi().evolutionInscriptions?.length > 0) {
                <svg viewBox="0 0 500 220" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="grad-inscriptions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25"/>
                      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <line x1="30" y1="30" x2="470" y2="30" stroke="#f1f5f9" stroke-width="1"/>
                  <line x1="30" y1="110" x2="470" y2="110" stroke="#f1f5f9" stroke-width="1"/>
                  <line x1="30" y1="190" x2="470" y2="190" stroke="#e2e8f0" stroke-width="1"/>
                  <path [attr.d]="areaChartPath(kpi().evolutionInscriptions, 'count')" fill="url(#grad-inscriptions)"/>
                  <path [attr.d]="lineChartPath(kpi().evolutionInscriptions, 'count')" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  @for (p of lineChartPoints(kpi().evolutionInscriptions, 'count').split(' '); track $index) {
                    <circle [attr.cx]="p.split(',')[0]" [attr.cy]="p.split(',')[1]" r="3.5" fill="#fff" stroke="#6366f1" stroke-width="2"/>
                  }
                  @for (l of chartLabels(kpi().evolutionInscriptions); track $index) {
                    <text [attr.x]="l.x" y="210" text-anchor="middle" font-size="10" fill="#94a3b8">{{ l.label }}</text>
                  }
                </svg>
                <div class="flex items-center justify-between mt-2 px-2">
                  <div class="flex items-center gap-2 text-sm"><span class="w-3 h-3 rounded-full bg-indigo-500"></span><span class="text-slate-600">Inscriptions / mois</span></div>
                  <strong class="text-slate-900">{{ totalInscriptions() }} total</strong>
                </div>
              } @else {
                <div class="h-[200px] flex items-center justify-center text-sm text-slate-400">Aucune donnée pour l'année active</div>
              }
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 class="font-bold text-lg text-slate-900">Évolution des paiements</h3>
              <span class="text-xs text-slate-400">12 derniers mois</span>
            </div>
            <div class="p-4">
              @if (kpi().evolutionPaiements?.length > 0) {
                <svg viewBox="0 0 500 220" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="grad-paiements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
                      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <line x1="30" y1="30" x2="470" y2="30" stroke="#f1f5f9" stroke-width="1"/>
                  <line x1="30" y1="110" x2="470" y2="110" stroke="#f1f5f9" stroke-width="1"/>
                  <line x1="30" y1="190" x2="470" y2="190" stroke="#e2e8f0" stroke-width="1"/>
                  <path [attr.d]="areaChartPath(kpi().evolutionPaiements, 'montant')" fill="url(#grad-paiements)"/>
                  <path [attr.d]="lineChartPath(kpi().evolutionPaiements, 'montant')" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  @for (p of lineChartPoints(kpi().evolutionPaiements, 'montant').split(' '); track $index) {
                    <circle [attr.cx]="p.split(',')[0]" [attr.cy]="p.split(',')[1]" r="3.5" fill="#fff" stroke="#10b981" stroke-width="2"/>
                  }
                  @for (l of chartLabels(kpi().evolutionPaiements); track $index) {
                    <text [attr.x]="l.x" y="210" text-anchor="middle" font-size="10" fill="#94a3b8">{{ l.label }}</text>
                  }
                </svg>
                <div class="flex items-center justify-between mt-2 px-2">
                  <div class="flex items-center gap-2 text-sm"><span class="w-3 h-3 rounded-full bg-emerald-500"></span><span class="text-slate-600">Montant encaissé / mois</span></div>
                  <strong class="text-slate-900">{{ totalPaiements() | number:'1.0-0':'fr-FR' }} FCFA</strong>
                </div>
              } @else {
                <div class="h-[200px] flex items-center justify-center text-sm text-slate-400">Aucun paiement enregistré</div>
              }
            </div>
          </div>
        </div>

        <!-- Charts row 2: Prospects evolution (dual curve) + Filières donut -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 class="font-bold text-lg text-slate-900">Évolution des prospects</h3>
              <span class="text-xs text-slate-400">12 derniers mois</span>
            </div>
            <div class="p-4">
              @if (kpi().evolutionProspects?.length > 0) {
                <svg viewBox="0 0 500 220" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="grad-prospects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2"/>
                      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
                    </linearGradient>
                    <linearGradient id="grad-inscrits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#10b981" stop-opacity="0.2"/>
                      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <line x1="30" y1="30" x2="470" y2="30" stroke="#f1f5f9" stroke-width="1"/>
                  <line x1="30" y1="110" x2="470" y2="110" stroke="#f1f5f9" stroke-width="1"/>
                  <line x1="30" y1="190" x2="470" y2="190" stroke="#e2e8f0" stroke-width="1"/>
                  <path [attr.d]="areaChartPath(kpi().evolutionProspects, 'total')" fill="url(#grad-prospects)"/>
                  <path [attr.d]="lineChartPath(kpi().evolutionProspects, 'total')" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path [attr.d]="lineChartPath(kpi().evolutionProspects, 'inscrits')" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5,3"/>
                  @for (p of lineChartPoints(kpi().evolutionProspects, 'total').split(' '); track $index) {
                    <circle [attr.cx]="p.split(',')[0]" [attr.cy]="p.split(',')[1]" r="3" fill="#fff" stroke="#f59e0b" stroke-width="2"/>
                  }
                  @for (l of chartLabels(kpi().evolutionProspects); track $index) {
                    <text [attr.x]="l.x" y="210" text-anchor="middle" font-size="10" fill="#94a3b8">{{ l.label }}</text>
                  }
                </svg>
                <div class="flex items-center justify-between mt-2 px-2">
                  <div class="flex items-center gap-4 text-sm">
                    <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500"></span><span class="text-slate-600">Prospects</span></div>
                    <div class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-emerald-500"></span><span class="text-slate-600">Inscrits</span></div>
                  </div>
                  <strong class="text-slate-900">{{ totalProspects() }} total</strong>
                </div>
              } @else {
                <div class="h-[200px] flex items-center justify-center text-sm text-slate-400">Aucune donnée</div>
              }
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Répartition par filière</h3></div>
            <div class="p-6 flex items-center gap-6">
              @if (donutSegments().length > 0) {
                <div class="relative shrink-0">
                  <svg width="160" height="160" viewBox="0 0 36 36" class="transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" stroke-width="3.5"/>
                    @for (seg of donutSegments(); track seg.filiere) {
                      <circle cx="18" cy="18" r="15.915" fill="none" [attr.stroke]="seg.color" stroke-width="3.5" [attr.stroke-dasharray]="seg.pct + ' ' + (100 - seg.pct)" [attr.stroke-dashoffset]="100 - seg.offset" style="transition: stroke-dasharray 0.5s;"/>
                    }
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-2xl font-bold text-slate-900">{{ donutTotal() }}</span>
                    <span class="text-xs text-slate-400">étudiants</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-w-0">
                  @for (seg of donutSegments(); track seg.filiere) {
                    <div class="flex items-center gap-2 text-sm">
                      <span class="w-3 h-3 rounded-sm shrink-0" [style.background]="seg.color"></span>
                      <span class="text-slate-700 truncate flex-1">{{ seg.filiere }}</span>
                      <strong class="text-slate-900">{{ seg.effectif }}</strong>
                      <span class="text-xs text-slate-400 w-10 text-right">{{ seg.pct.toFixed(0) }}%</span>
                    </div>
                  }
                </div>
              } @else {
                <div class="h-[160px] flex items-center justify-center w-full text-sm text-slate-400">Aucune donnée</div>
              }
            </div>
          </div>
        </div>

        <!-- Charts row 3: Prospect status breakdown (horizontal bars) + Recouvrement vs Objectif gauge -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Statut des prospects</h3></div>
            <div class="p-6 flex flex-col gap-4">
              @if (kpi().repartitionProspects?.total > 0) {
                <div>
                  <div class="flex justify-between text-sm mb-1.5"><span class="flex items-center gap-2"><span class="w-3 h-3 rounded bg-amber-400"></span>Contactés</span><strong>{{ kpi().repartitionProspects?.contactes || 0 }} <span class="text-slate-400 font-normal">({{ ((kpi().repartitionProspects?.contactes || 0) / kpi().repartitionProspects.total * 100).toFixed(0) }}%)</span></strong></div>
                  <div class="h-3 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-amber-400 rounded-full transition-all" [style.width.%]="(kpi().repartitionProspects?.contactes || 0) / kpi().repartitionProspects.total * 100"></div></div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1.5"><span class="flex items-center gap-2"><span class="w-3 h-3 rounded bg-emerald-500"></span>Inscrits</span><strong>{{ kpi().repartitionProspects?.inscrits || 0 }} <span class="text-slate-400 font-normal">({{ ((kpi().repartitionProspects?.inscrits || 0) / kpi().repartitionProspects.total * 100).toFixed(0) }}%)</span></strong></div>
                  <div class="h-3 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-emerald-500 rounded-full transition-all" [style.width.%]="(kpi().repartitionProspects?.inscrits || 0) / kpi().repartitionProspects.total * 100"></div></div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1.5"><span class="flex items-center gap-2"><span class="w-3 h-3 rounded bg-red-400"></span>Perdus</span><strong>{{ kpi().repartitionProspects?.perdus || 0 }} <span class="text-slate-400 font-normal">({{ ((kpi().repartitionProspects?.perdus || 0) / kpi().repartitionProspects.total * 100).toFixed(0) }}%)</span></strong></div>
                  <div class="h-3 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-red-400 rounded-full transition-all" [style.width.%]="(kpi().repartitionProspects?.perdus || 0) / kpi().repartitionProspects.total * 100"></div></div>
                </div>
                <div class="pt-2 border-t border-slate-100 flex justify-between text-sm">
                  <span class="text-slate-500">Total prospects</span>
                  <strong class="text-slate-900">{{ kpi().repartitionProspects?.total }}</strong>
                </div>
              } @else {
                <div class="h-[120px] flex items-center justify-center text-sm text-slate-400">Aucun prospect enregistré</div>
              }
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Taux de recouvrement</h3></div>
            <div class="p-6 flex items-center gap-6">
              <div class="relative shrink-0">
                <svg width="160" height="160" viewBox="0 0 36 36" class="transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" stroke-width="3.5"/>
                  <circle cx="18" cy="18" r="15.915" fill="none" [attr.stroke]="kpi().tauxRecouvrement >= 75 ? '#10b981' : (kpi().tauxRecouvrement >= 50 ? '#f59e0b' : '#ef4444')" stroke-width="3.5" [attr.stroke-dasharray]="kpi().tauxRecouvrement + ' ' + (100 - kpi().tauxRecouvrement)" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dasharray 0.5s;"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl font-bold text-slate-900">{{ kpi().tauxRecouvrement }}%</span>
                  <span class="text-xs text-slate-400 mt-0.5">recouvré</span>
                </div>
              </div>
              <div class="flex flex-col gap-3 flex-1">
                <div>
                  <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Encaissé</div>
                  <div class="text-xl font-bold text-emerald-600">{{ kpi().encaisse | number:'1.0-0':'fr-FR' }} <span class="text-sm font-normal">FCFA</span></div>
                </div>
                <div>
                  <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Restant</div>
                  <div class="text-xl font-bold text-red-600">{{ kpi().restant | number:'1.0-0':'fr-FR' }} <span class="text-sm font-normal">FCFA</span></div>
                </div>
                <div class="pt-2 border-t border-slate-100">
                  <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">En règle / En retard</div>
                  <div class="text-sm"><strong class="text-emerald-600">{{ kpi().enRegle }}</strong> / <strong class="text-red-600">{{ kpi().enRetard }}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Objectives row: DAF + Académique + Marketing -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Objectifs financiers (DAF)</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div>
                <div class="flex justify-between mb-1.5 text-sm"><span>Taux de recouvrement</span><strong>{{ kpi().tauxRecouvrement }}%</strong></div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full transition-all" [style.width.%]="kpi().tauxRecouvrement"></div></div>
              </div>
              <div class="flex justify-between text-sm"><span>Encaissé</span><strong class="text-green-600">{{ kpi().encaisse | number:'1.0-0':'fr-FR' }} FCFA</strong></div>
              <div class="flex justify-between text-sm"><span>Restant à recouvrer</span><strong class="text-red-600">{{ kpi().restant | number:'1.0-0':'fr-FR' }} FCFA</strong></div>
              <div class="flex justify-between text-sm"><span>Étudiants en règle</span><strong class="text-green-600">{{ kpi().enRegle }}</strong></div>
              <div class="flex justify-between text-sm"><span>Étudiants en retard</span><strong class="text-red-600">{{ kpi().enRetard }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Objectifs académiques</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div>
                <div class="flex justify-between mb-1.5 text-sm"><span>Taux de réussite</span><strong>{{ kpi().tauxReussite }}%</strong></div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-green-500 rounded-full transition-all" [style.width.%]="kpi().tauxReussite"></div></div>
              </div>
              <div class="flex justify-between text-sm"><span>Notes saisies</span><strong>{{ kpi().notesSaisies }}</strong></div>
              <div class="flex justify-between text-sm"><span>Bulletins générés</span><strong>{{ kpi().bulletinsGeneres }}</strong></div>
              <div class="flex justify-between text-sm"><span>Bulletins validés</span><strong class="text-green-600">{{ kpi().bulletinsValides }}</strong></div>
              <div class="flex justify-between text-sm"><span>Abandons</span><strong class="text-red-600">{{ kpi().abandons }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Objectifs marketing</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div class="flex justify-between text-sm"><span>Total prospects</span><strong class="text-slate-900">{{ kpi().marketingTotal }}</strong></div>
              <div class="flex justify-between text-sm"><span>Inscrits</span><strong class="text-green-600">{{ kpi().marketingInscrits }}</strong></div>
              <div class="flex justify-between text-sm"><span>Perdus</span><strong class="text-red-600">{{ kpi().marketingPerdus }}</strong></div>
              <div>
                <div class="flex justify-between mb-1.5 text-sm"><span>Taux de conversion</span><strong>{{ kpi().marketingTauxConversion }}%</strong></div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-amber-500 rounded-full transition-all" [style.width.%]="kpi().marketingTauxConversion"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- DSI system health + Top classes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Système & infrastructure (DSI)</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div>
                <div class="flex justify-between mb-1.5 text-sm"><span>Utilisateurs actifs</span><strong>{{ kpi().dsiActiveUsers }} / {{ kpi().dsiTotalUsers }}</strong></div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-green-500 rounded-full transition-all" [style.width.%]="kpi().dsiTotalUsers > 0 ? (kpi().dsiActiveUsers / kpi().dsiTotalUsers) * 100 : 0"></div></div>
              </div>
              <div class="flex justify-between text-sm"><span>Utilisateurs bloqués</span><strong class="text-red-600">{{ kpi().dsiBlockedUsers }}</strong></div>
              <div class="flex justify-between text-sm"><span>Salles configurées</span><strong>{{ kpi().dsiSalles }}</strong></div>
              <div class="flex justify-between text-sm"><span>Matières</span><strong>{{ kpi().dsiMatieres }}</strong></div>
              <div class="flex justify-between text-sm"><span>Affectations matières</span><strong>{{ kpi().dsiAffectations }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Top 5 classes par effectif</h3></div>
            <div class="p-6">
              @for (c of kpi().topClasses; track c.classe) {
                <div class="py-2 border-b border-slate-100 last:border-0">
                  <div class="flex justify-between text-sm mb-1"><span class="text-slate-700">{{ c.classe }} <span class="text-xs text-slate-400">({{ c.filiere }})</span></span><strong class="text-slate-900">{{ c.effectif }}/{{ c.capaciteMax }}</strong></div>
                  <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full transition-all" [style.width.%]="c.tauxRemplissage"></div></div>
                </div>
              } @empty {
                <p class="text-sm text-slate-400 text-center py-4">Aucune donnée</p>
              }
            </div>
          </div>
        </div>

        <!-- Actions + Exports -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm" (click)="navigate('/daf')"><span class="material-symbols-outlined text-xl">wallet</span> Tableau financier</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/dg/utilisateurs')"><span class="material-symbols-outlined text-xl">groups</span> Gérer les utilisateurs</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/daf/recus')"><span class="material-symbols-outlined text-xl">description</span> Templates de reçus</button>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Exports rapides</h3></div>
            <div class="p-6 flex flex-wrap gap-3">
              <button (click)="exportData('etudiants/csv')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">download</span> Étudiants (CSV)</button>
              <button (click)="exportData('paiements/csv')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">download</span> Paiements (CSV)</button>
              <button (click)="exportData('prospects/csv')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">download</span> Prospects (CSV)</button>
              <button (click)="exportData('tableau-financier/pdf')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">picture_as_pdf</span> Tableau financier (PDF)</button>
              <button (click)="exportData('liste-etudiants/pdf')" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"><span class="material-symbols-outlined text-lg">picture_as_pdf</span> Liste étudiants (PDF)</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.DAF) {
        <!-- DAF DASHBOARD -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taux recouvrement</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().tauxRecouvrement }}%</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Encaissé</p><p class="text-3xl font-bold text-primary mt-2">{{ kpi().encaisse | number:'1.0-0':'fr-FR' }} <span class="text-sm">FCFA</span></p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Restant</p><p class="text-3xl font-bold text-red-600 mt-2">{{ kpi().restant | number:'1.0-0':'fr-FR' }} <span class="text-sm">FCFA</span></p></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Objectif: Recouvrement</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div><div class="flex justify-between mb-1.5 text-sm"><span>Taux de recouvrement</span><strong>{{ kpi().tauxRecouvrement }}%</strong></div><div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-green-500 rounded-full transition-all" [style.width.%]="kpi().tauxRecouvrement"></div></div></div>
              <div class="flex justify-between text-sm"><span>Étudiants en règle</span><strong class="text-green-600">{{ kpi().enRegle }}</strong></div>
              <div class="flex justify-between text-sm"><span>Étudiants en retard</span><strong class="text-red-600">{{ kpi().enRetard }}</strong></div>
              <div class="flex justify-between text-sm"><span>Étudiants inscrits</span><strong>{{ kpi().etudiants }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm" (click)="navigate('/daf')"><span class="material-symbols-outlined text-xl">wallet</span> Tableau financier</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/daf')"><span class="material-symbols-outlined text-xl">person_add</span> Enregistrer un élève</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/dg/utilisateurs')"><span class="material-symbols-outlined text-xl">groups</span> Gérer les utilisateurs</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.DSI) {
        <!-- DSI DASHBOARD -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateurs</p><p class="text-3xl font-bold text-primary mt-2">{{ kpi().totalUsers }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enseignants</p><p class="text-3xl font-bold text-amber-500 mt-2">{{ kpi().enseignants }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().classes }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filières</p><p class="text-3xl font-bold text-teal-600 mt-2">{{ kpi().filieres }}</p></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Gestion système</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div class="flex justify-between text-sm"><span>Utilisateurs actifs</span><strong class="text-green-600">{{ kpi().activeUsers }}</strong></div>
              <div class="flex justify-between text-sm"><span>Utilisateurs bloqués</span><strong class="text-red-600">{{ kpi().blockedUsers }}</strong></div>
              <div class="flex justify-between text-sm"><span>Étudiants inscrits</span><strong>{{ kpi().etudiants }}</strong></div>
              <div class="flex justify-between text-sm"><span>Salles configurées</span><strong>{{ kpi().salles }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm" (click)="navigate('/dsi')"><span class="material-symbols-outlined text-xl">person_add</span> Créer un enseignant</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/dsi')"><span class="material-symbols-outlined text-xl">groups</span> Enregistrer un élève</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/dsi')"><span class="material-symbols-outlined text-xl">link</span> Affecter les enseignants</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/etudes/emploi-du-temps')"><span class="material-symbols-outlined text-xl">schedule</span> Emploi du temps</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.ETUDES) {
        <!-- ETUDES DASHBOARD -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Étudiants</p><p class="text-3xl font-bold text-primary mt-2">{{ kpi().etudiants }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().classes }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filières</p><p class="text-3xl font-bold text-teal-600 mt-2">{{ kpi().filieres }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salles</p><p class="text-3xl font-bold text-amber-700 mt-2">{{ kpi().salles }}</p></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Objectifs académiques</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div><div class="flex justify-between mb-1.5 text-sm"><span>Taux de réussite</span><strong>{{ kpi().tauxReussite }}%</strong></div><div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-green-500 rounded-full transition-all" [style.width.%]="kpi().tauxReussite"></div></div></div>
              <div class="flex justify-between text-sm"><span>Notes saisies</span><strong>{{ kpi().notesSaisies }}</strong></div>
              <div class="flex justify-between text-sm"><span>Bulletins générés</span><strong>{{ kpi().bulletinsGeneres }}</strong></div>
              <div class="flex justify-between text-sm"><span>Bulletins validés</span><strong class="text-green-600">{{ kpi().bulletinsValides }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm" (click)="navigate('/etudes')"><span class="material-symbols-outlined text-xl">menu_book</span> Direction des études</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/etudes/emploi-du-temps')"><span class="material-symbols-outlined text-xl">schedule</span> Emploi du temps</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/etudes/periodes')"><span class="material-symbols-outlined text-xl">event</span> Périodes scolaires</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/etudes/salles')"><span class="material-symbols-outlined text-xl">location_on</span> Salles</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.ENSEIGNANT) {
        <!-- ENSEIGNANT DASHBOARD -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes affectées</p><p class="text-3xl font-bold text-primary mt-2">{{ kpi().classes }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matières</p><p class="text-3xl font-bold text-amber-500 mt-2">{{ kpi().matieres }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Créneaux/sem</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().creneaux }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes saisies</p><p class="text-3xl font-bold text-teal-600 mt-2">{{ kpi().notesSaisies }}</p></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Saisie des notes</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div><div class="flex justify-between mb-1.5 text-sm"><span>Progression saisie</span><strong>{{ kpi().notesSaisies }} notes</strong></div><div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full transition-all" [style.width.%]="kpi().progressionSaisie"></div></div></div>
              <div class="flex justify-between text-sm"><span>Devoirs créés</span><strong>{{ kpi().devoirs }}</strong></div>
              <div class="flex justify-between text-sm"><span>Devoirs à corriger</span><strong class="text-amber-500">{{ kpi().devoirsACorriger }}</strong></div>
              <div class="flex justify-between text-sm"><span>Absences enregistrées</span><strong>{{ kpi().absences }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm" (click)="navigate('/enseignant/notes')"><span class="material-symbols-outlined text-xl">edit</span> Saisir des notes</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/enseignant/devoirs')"><span class="material-symbols-outlined text-xl">description</span> Gérer les devoirs</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/enseignant/absences')"><span class="material-symbols-outlined text-xl">warning</span> Saisir les absences</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/enseignant')"><span class="material-symbols-outlined text-xl">calendar_month</span> Mon emploi du temps</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.ETUDIANT) {
        <!-- ETUDIANT DASHBOARD -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Moyenne générale</p><p class="text-3xl font-bold text-primary mt-2">{{ kpi().moyenne }}<span class="text-sm">/20</span></p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rang</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().rang }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Absences</p><p class="text-3xl font-bold text-red-600 mt-2">{{ kpi().absences }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reste à payer</p><p class="text-3xl font-bold text-amber-500 mt-2">{{ kpi().reste }} <span class="text-sm">FCFA</span></p></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Mon parcours académique</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <div><div class="flex justify-between mb-1.5 text-sm"><span>Progression scolarité</span><strong>{{ kpi().tauxPaiement }}%</strong></div><div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full transition-all" [style.width.%]="kpi().tauxPaiement"></div></div></div>
              <div class="flex justify-between text-sm"><span>Statut paiement</span><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="kpi().reste === 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">{{ kpi().reste === 0 ? 'À jour' : 'En retard' }}</span></div>
              <div class="flex justify-between text-sm"><span>Devoirs à rendre</span><strong class="text-amber-500">{{ kpi().devoirsARendre }}</strong></div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm" (click)="navigate('/etudiant/bulletins')"><span class="material-symbols-outlined text-xl">description</span> Mes bulletins</button>
              <button class="flex items-center gap-2 h-11 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm" (click)="navigate('/etudiant')"><span class="material-symbols-outlined text-xl">home</span> Mon espace</button>
            </div>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.SECRETAIRE) {
        <!-- SECRETAIRE DASHBOARD -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Étudiants</p><p class="text-3xl font-bold text-primary mt-2">{{ kpi().etudiants }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inscriptions du jour</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().inscriptionsJour }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prospects</p><p class="text-3xl font-bold text-amber-500 mt-2">{{ kpi().prospects }}</p></div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden mt-4">
          <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
          <div class="p-6 flex flex-wrap gap-3">
            <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm" (click)="navigate('/secretariat')"><span class="material-symbols-outlined text-xl">description</span> Secrétariat</button>
          </div>
        </div>
      }

      @if (role() === RoleUtilisateur.MARKETING) {
        <!-- MARKETING DASHBOARD -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prospects total</p><p class="text-3xl font-bold text-primary mt-2">{{ kpi().prospects }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inscrits</p><p class="text-3xl font-bold text-green-600 mt-2">{{ kpi().inscrits }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Perdus</p><p class="text-3xl font-bold text-red-600 mt-2">{{ kpi().perdus }}</p></div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-5"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taux conversion</p><p class="text-3xl font-bold text-teal-600 mt-2">{{ kpi().tauxConversion }}%</p></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Conversion prospects</h3></div>
            <div class="p-6"><div class="flex justify-between mb-1.5 text-sm"><span>Taux de conversion</span><strong>{{ kpi().tauxConversion }}%</strong></div><div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full transition-all" [style.width.%]="kpi().tauxConversion"></div></div></div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Actions rapides</h3></div>
            <div class="p-6 flex flex-col gap-3">
              <button class="flex items-center gap-2 h-11 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm" (click)="navigate('/marketing')"><span class="material-symbols-outlined text-xl">campaign</span> Marketing</button>
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
      this.http.get<any>(`${environment.apiUrl}/admin/tenants/ecoles`).subscribe({
        next: (res) => {
          const ecoles = res.data || [];
          this.kpi.set({
            totalEcoles: ecoles.length,
            ecolesActives: ecoles.filter((e: any) => e.actif).length,
            ecolesBloquees: ecoles.filter((e: any) => !e.actif).length,
            ecolesRecentes: ecoles.slice().sort((a: any, b: any) => new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime()).slice(0, 5),
          });
        },
        error: () => this.kpi.set({}),
      });
      this.http.get<any>(`${environment.apiUrl}/admin/tenants/utilisateurs`, { params: { limit: '1' } }).subscribe({
        next: (res) => this.kpi.update((k) => ({ ...k, totalUsers: res.total || 0 })),
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
          evolutionPaiements: d?.evolutionPaiements || [],
          evolutionProspects: d?.evolutionProspects || [],
          repartitionProspects: d?.repartitionProspects || { total: 0, inscrits: 0, contactes: 0, perdus: 0 },
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

  totalInscriptions = computed(() => (this.kpi()?.evolutionInscriptions || []).reduce((s: number, d: any) => s + d.count, 0));
  totalPaiements = computed(() => (this.kpi()?.evolutionPaiements || []).reduce((s: number, d: any) => s + d.montant, 0));
  totalProspects = computed(() => (this.kpi()?.evolutionProspects || []).reduce((s: number, d: any) => s + d.total, 0));

  // --- SVG Line chart helpers ---
  lineChartPoints(data: any[], valueKey: string, width = 500, height = 180, padding = 30): string {
    if (!data.length) return '';
    const max = Math.max(...data.map((d: any) => d[valueKey] || 0), 1);
    const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
    return data.map((d: any, i: number) => {
      const x = padding + i * stepX;
      const y = height - padding - ((d[valueKey] || 0) / max) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  }

  lineChartPath(data: any[], valueKey: string, width = 500, height = 180, padding = 30): string {
    if (!data.length) return '';
    const pts = this.lineChartPoints(data, valueKey, width, height, padding).split(' ');
    let path = `M ${pts[0]}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1].split(',').map(Number);
      const [x, y] = pts[i].split(',').map(Number);
      const cx = (px + x) / 2;
      path += ` C ${cx},${py} ${cx},${y} ${x},${y}`;
    }
    return path;
  }

  areaChartPath(data: any[], valueKey: string, width = 500, height = 180, padding = 30): string {
    if (!data.length) return '';
    const linePath = this.lineChartPath(data, valueKey, width, height, padding);
    const lastX = padding + ((width - padding * 2) / Math.max(data.length - 1, 1)) * (data.length - 1);
    return `${linePath} L ${lastX},${height - padding} L ${padding},${height - padding} Z`;
  }

  chartLabels(data: any[], width = 500, padding = 30): { x: number; label: string }[] {
    if (!data.length) return [];
    const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
    return data.map((d: any, i: number) => ({ x: padding + i * stepX, label: d.mois }));
  }

  chartMax = (data: any[], key: string) => data.length ? Math.max(...data.map((d: any) => d[key] || 0), 1) : 1;

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
