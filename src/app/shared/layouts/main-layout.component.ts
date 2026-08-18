import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { RoleUtilisateur } from '../../core/models';
import { DsiTabService } from '../../core/services/dsi-tab.service';
import { SuperAdminTabService } from '../../core/services/super-admin-tab.service';
import { NotificationsBellComponent } from '../components/notifications-bell.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: RoleUtilisateur[];
  dsiTab?: string;
  saTab?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    NotificationsBellComponent,
  ],
  styles: [`
    .gs-nav-link { display:flex; align-items:center; gap:12px; padding:11px 24px; font-size:14px; font-weight:600; text-decoration:none; color:var(--color-text); border-left:3px solid transparent; background:none; border-top:none; border-right:none; border-bottom:none; width:100%; text-align:left; cursor:pointer; font-family:var(--font-body); }
    .gs-nav-link:hover { background:color-mix(in srgb, var(--color-text) 5%, transparent); }
    .gs-nav-link.active { color:var(--color-accent); border-left-color:var(--color-accent); }
    .gs-mark { width:7px; height:7px; background:transparent; flex:none; border-radius:50%; }
    .gs-nav-link.active .gs-mark { background:var(--color-accent); }
  `],
  template: `
    <div style="display:flex;min-height:100vh;background:var(--color-bg);color:var(--color-text);font-family:var(--font-body);height:100vh;overflow:hidden">

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0"
        style="width:280px;overflow:hidden;flex:none;border-right:2px solid var(--color-divider);background:var(--color-surface);display:flex;flex-direction:column;transition:transform .2s, width .2s"
        [class.-translate-x-full]="siderCollapsed"
        [class.translate-x-0]="!siderCollapsed"
        [class.lg:w-0]="siderCollapsed"
        [class.lg:overflow-hidden]="siderCollapsed"
      >
        <!-- Sidebar Header -->
        <div style="height:64px;box-sizing:border-box;padding:0 24px;border-bottom:2px solid var(--color-divider);display:flex;flex-direction:column;justify-content:center;white-space:nowrap">
          <span style="display:block;font-family:var(--font-heading);font-weight:800;font-size:18px;letter-spacing:-0.015em">{{ authService.currentUser()?.ecole?.nom || 'RANIAG' }}</span>
          @if (authService.currentUser()?.ecole) {
            <span style="font-size:11px;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ authService.currentUser()?.ecole?.sousDomaine }}.raniag.com</span>
          }
        </div>

        <!-- Navigation -->
        <nav style="flex:1;padding:16px 0;display:flex;flex-direction:column;white-space:nowrap;min-width:220px;overflow-y:auto">
          @for (item of visibleNavItems(); track item.label) {
            @if (item.dsiTab) {
              <button class="gs-nav-link" [class.active]="isOnDsiTab(item.dsiTab)" (click)="goToDsiTab(item.dsiTab)">
                <span class="gs-mark"></span>
                <span class="material-symbols-outlined" style="font-size:18px">{{ item.icon }}</span>
                <span class="truncate">{{ item.label }}</span>
              </button>
            } @else if (item.saTab) {
              <button class="gs-nav-link" [class.active]="isOnSuperAdminTab(item.saTab)" (click)="goToSuperAdminTab(item.saTab)">
                <span class="gs-mark"></span>
                <span class="material-symbols-outlined" style="font-size:18px">{{ item.icon }}</span>
                <span class="truncate">{{ item.label }}</span>
              </button>
            } @else {
              <a class="gs-nav-link" [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                <span class="gs-mark"></span>
                <span class="material-symbols-outlined" style="font-size:18px">{{ item.icon }}</span>
                <span class="truncate">{{ item.label }}</span>
              </a>
            }
          }
        </nav>
      </aside>

      <!-- Overlay for mobile -->
      @if (!siderCollapsed) {
        <div class="fixed inset-0 z-40 lg:hidden" style="background:color-mix(in srgb, var(--color-neutral-900) 40%, transparent)" (click)="siderCollapsed = true"></div>
      }

      <!-- Main Content Area -->
      <div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden">
        <!-- Header -->
        <header class="nav" style="justify-content:space-between;background:var(--color-bg);position:sticky;top:0;z-index:30;flex:none;height:64px;box-sizing:border-box">
          <div style="display:flex;align-items:center;gap:16px">
            <button class="btn btn-icon btn-secondary" (click)="siderCollapsed = !siderCollapsed" aria-label="Basculer la navigation">
              <span class="material-symbols-outlined" style="font-size:18px">{{ siderCollapsed ? 'menu' : 'menu_open' }}</span>
            </button>
            <h1 style="font-size:20px;margin:0" class="truncate">{{ pageTitle() }}</h1>
          </div>
          <div style="display:flex;align-items:center;gap:16px;position:relative">
            <app-notifications-bell></app-notifications-bell>
            <span class="tag tag-outline">{{ authService.currentUser()?.role }}</span>
            <div style="height:20px;width:1px;background:var(--color-divider)"></div>
            <div style="position:relative" data-user-dropdown>
              <button (click)="userMenuOpen = !userMenuOpen" style="display:flex;align-items:center;gap:10px;background:none;border:none;cursor:pointer;padding:0;font-family:var(--font-body);color:var(--color-text)">
                <span style="width:34px;height:34px;border:1.5px solid var(--color-accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:13px;color:var(--color-accent)">{{ userInitials() }}</span>
                <span class="hidden sm:block" style="text-align:left">
                  <span style="display:block;font-size:13px;font-weight:600">{{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}</span>
                </span>
                <span class="material-symbols-outlined" style="font-size:18px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">expand_more</span>
              </button>
              @if (userMenuOpen) {
                <div style="position:absolute;right:0;top:44px;width:200px;border:1px solid var(--color-divider);background:var(--color-bg);box-shadow:var(--shadow-md);z-index:10;display:flex;flex-direction:column">
                  <button class="btn" style="justify-content:flex-start;border-radius:0;padding:12px 16px" (click)="goToProfile(); userMenuOpen = false">Mon profil</button>
                  <div class="hr" style="margin:0"></div>
                  <button class="btn" style="justify-content:flex-start;border-radius:0;padding:12px 16px;color:var(--color-accent-700)" (click)="logout(); userMenuOpen = false">Déconnexion</button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main style="flex:1;overflow-y:auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  dsiTabService = inject(DsiTabService);
  superAdminTabService = inject(SuperAdminTabService);
  private router = inject(Router);

  siderCollapsed = false;
  userMenuOpen = false;
  currentUrl = signal(this.router.url);

  private navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', roles: [RoleUtilisateur.DG, RoleUtilisateur.DSI, RoleUtilisateur.ETUDES, RoleUtilisateur.SECRETAIRE, RoleUtilisateur.MARKETING, RoleUtilisateur.SUPER_ADMIN] },
    // Super Admin - direct menu items, each navigates to /super-admin and sets the tab
    { label: 'Établissements', icon: 'account_balance', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'etablissements' },
    { label: 'Utilisateurs connectés', icon: 'groups', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'utilisateurs' },
    { label: "Journal d'audit", icon: 'history', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'audit' },
    { label: 'Style des emails', icon: 'mail', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'emails' },
    { label: 'Utilisateurs', icon: 'groups', route: '/dg/utilisateurs', roles: [RoleUtilisateur.DG] },
    { label: 'Finance', icon: 'account_balance_wallet', route: '/dg/finance', roles: [RoleUtilisateur.DG] },
    { label: 'Élèves', icon: 'school', route: '/dg/eleves', roles: [RoleUtilisateur.DG] },
    { label: 'Professeurs', icon: 'group', route: '/dg/professeurs', roles: [RoleUtilisateur.DG] },
    { label: 'Dashboard', icon: 'wallet', route: '/daf', roles: [RoleUtilisateur.DAF] },
    { label: 'Finance', icon: 'receipt_long', route: '/daf/finance', roles: [RoleUtilisateur.DAF] },
    { label: 'Tarifs', icon: 'payments', route: '/daf/tarifs', roles: [RoleUtilisateur.DAF] },
    { label: 'Versements', icon: 'view_column', route: '/daf/versements', roles: [RoleUtilisateur.DAF] },
    { label: 'Templates Reçu', icon: 'description', route: '/daf/recus', roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG] },
    // ETUDES - items for Direction des Études only (not DSI)
    { label: 'Études', icon: 'menu_book', route: '/etudes', roles: [RoleUtilisateur.ETUDES] },
    { label: 'Années scolaires', icon: 'calendar_month', route: '/etudes/annees-scolaires', roles: [RoleUtilisateur.ETUDES] },
    { label: 'Périodes', icon: 'schedule', route: '/etudes/periodes', roles: [RoleUtilisateur.ETUDES] },
    { label: 'Salles', icon: 'location_on', route: '/etudes/salles', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DG] },
    { label: 'Emploi du temps', icon: 'schedule', route: '/etudes/emploi-du-temps', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SECRETAIRE] },
    // Paramètres reste en dernier dans le menu DG (demande explicite).
    { label: 'Paramètres', icon: 'settings', route: '/dg/parametres', roles: [RoleUtilisateur.DG] },
    // Secrétariat - menus directs (pas d'onglets), demande explicite de l'utilisateur.
    { label: 'Réunions', icon: 'groups', route: '/secretariat/reunions', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Visites & RDV', icon: 'event', route: '/secretariat/visites', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Prospects', icon: 'person_add', route: '/secretariat/prospects', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Courrier', icon: 'mail', route: '/secretariat/courrier', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Annuaire', icon: 'contacts', route: '/secretariat/annuaire', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Mes tâches', icon: 'checklist', route: '/secretariat/taches', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Marketing', icon: 'notifications', route: '/marketing', roles: [RoleUtilisateur.MARKETING] },
    // DSI - direct menu items, each navigates to /dsi and sets the tab
    { label: 'Filières', icon: 'apps', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'filieres' },
    { label: 'Classes', icon: 'category', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'classes' },
    { label: 'Matières', icon: 'book', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'matieres' },
    { label: 'Enseignants', icon: 'person_add', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'enseignants' },
    { label: 'Étudiants', icon: 'groups', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'etudiants' },
    { label: 'Affect. Enseignants', icon: 'group_add', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'affectations-enseignants' },
    { label: 'Années scolaires', icon: 'calendar_month', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'annees' },
    { label: 'Infos', icon: 'account_balance', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'ecole' },
    { label: 'Journal d\'audit', icon: 'history', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'audit' },
    // Enseignant - menu cohérent : 1 seul dashboard + ses outils
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Mon emploi du temps', icon: 'schedule', route: '/enseignant', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Évaluations', icon: 'edit', route: '/enseignant/notes', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Devoirs', icon: 'description', route: '/enseignant/devoirs', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Mes élèves', icon: 'groups', route: '/enseignant/mes-eleves', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Mes séances', icon: 'event_note', route: '/enseignant/seances', roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
    { label: 'Mes notes saisies', icon: 'history', route: '/enseignant/historique-notes', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Espace Étudiant', icon: 'mood', route: '/etudiant', roles: [RoleUtilisateur.ETUDIANT] },
    { label: 'Mes devoirs', icon: 'assignment', route: '/etudiant/devoirs', roles: [RoleUtilisateur.ETUDIANT] },
  ];

  visibleNavItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(user.role);
    });
  });

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.currentUrl.set(this.router.url);
      }
    });
  }

  userInitials = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '?';
    return (u.prenom?.[0] || '') + (u.nom?.[0] || '');
  });

  pageTitle = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/dashboard')) return 'Tableau de bord';
    if (url.includes('/super-admin')) {
      const tab = this.superAdminTabService.activeTab();
      const found = this.superAdminTabService.tabs.find(t => t.key === tab);
      return found ? found.label : 'Super Admin';
    }
    if (url.includes('/dg/utilisateurs')) return 'Gestion des utilisateurs';
    if (url.includes('/dg/finance')) return 'Finance';
    if (url.includes('/dg/eleves')) return 'Élèves';
    if (url.includes('/dg/professeurs')) return 'Professeurs';
    if (url.includes('/dg/parametres')) return 'Paramètres';
    if (url.includes('/dg')) return 'Direction Générale';
    if (url.includes('/daf/recus')) return 'Templates de Reçu';
    if (url.includes('/daf/tarifs')) return 'Tarifs';
    if (url.includes('/daf/versements')) return 'Versements';
    if (url.includes('/daf/finance')) return 'Finance';
    if (url.includes('/daf')) return 'Dashboard';
    if (url.includes('/etudes/annees-scolaires')) return 'Années scolaires';
    if (url.includes('/etudes/periodes')) return 'Périodes scolaires';
    if (url.includes('/etudes/salles')) return 'Salles';
    if (url.includes('/etudes/emploi-du-temps')) return 'Emploi du temps';
    if (url.includes('/etudes')) return 'Direction des Études';
    if (url.includes('/enseignant/notes')) return 'Évaluations';
    if (url.includes('/enseignant/absences')) return 'Absences & retards';
    if (url.includes('/enseignant/devoirs')) return 'Devoirs & soumissions';
    if (url.includes('/enseignant/mes-eleves')) return 'Mes élèves';
    if (url.includes('/enseignant/seances')) return 'Mes séances';
    if (url.includes('/enseignant/historique-notes')) return 'Mes notes saisies';
    if (url.includes('/seance/')) return 'Détail de la séance';
    if (url.includes('/enseignant')) return 'Mon emploi du temps';
    if (url.includes('/secretariat/reunions')) return 'Réunions';
    if (url.includes('/secretariat/visites')) return 'Visites & RDV';
    if (url.includes('/secretariat/prospects')) return 'Prospects';
    if (url.includes('/secretariat/courrier')) return 'Courrier';
    if (url.includes('/secretariat/annuaire')) return 'Annuaire';
    if (url.includes('/secretariat/taches')) return 'Mes tâches';
    if (url.includes('/secretariat')) return 'Secrétariat';
    if (url.includes('/marketing')) return 'Marketing';
    if (url.includes('/dsi/classes/')) return 'Détail de la classe';
    if (url.includes('/dsi')) {
      const tab = this.dsiTabService.activeTab();
      const found = this.dsiTabService.tabs.find(t => t.key === tab);
      return found ? found.label : 'DSI';
    }
    if (url.includes('/etudiant/devoirs')) return 'Mes devoirs';
    if (url.includes('/etudiant')) return 'Espace Étudiant';
    return 'RANIAG';
  });

  goToDsiTab(tab: string) {
    this.dsiTabService.setTab(tab);
    this.router.navigate(['/dsi']);
  }

  isOnDsiTab(tab: string): boolean {
    return this.currentUrl().includes('/dsi') && this.dsiTabService.activeTab() === tab;
  }

  goToSuperAdminTab(tab: string) {
    this.superAdminTabService.setTab(tab);
    this.router.navigate(['/super-admin']);
  }

  isOnSuperAdminTab(tab: string): boolean {
    return this.currentUrl().includes('/super-admin') && this.superAdminTabService.activeTab() === tab;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
  }

  isRouteActive(route: string): boolean {
    return this.currentUrl() === route;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-user-dropdown]') && this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }
}
