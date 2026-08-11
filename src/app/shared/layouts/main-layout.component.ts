import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { RoleUtilisateur } from '../../core/models';
import { DsiTabService } from '../../core/services/dsi-tab.service';
import { SuperAdminTabService } from '../../core/services/super-admin-tab.service';
import { environment } from '../../../environments/environment';
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
  template: `
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-950 text-white flex flex-col transition-transform duration-300 lg:relative"
        [class.-translate-x-full]="siderCollapsed"
        [class.translate-x-0]="!siderCollapsed"
      >
        <!-- Sidebar Header -->
        <div class="p-6 bg-slate-900/80 flex flex-col items-start gap-1 border-b border-white/5">
          @if (authService.currentUser()?.ecole?.logoUrl && logoLoaded()) {
            <img [src]="ecoleLogoUrl()" alt="Logo" class="w-12 h-12 object-contain rounded-lg mb-1" (error)="logoLoaded.set(false)" />
          } @else {
            <div class="bg-primary p-2 rounded-lg mb-1">
              <span class="material-symbols-outlined text-white text-[28px]">menu_book</span>
            </div>
          }
          <h2 class="text-lg font-bold text-white leading-none tracking-tight">{{ authService.currentUser()?.ecole?.nom || 'LogiPourEcole' }}</h2>
          @if (authService.currentUser()?.ecole) {
            <p class="text-xs text-slate-400 uppercase tracking-wider">{{ authService.currentUser()?.ecole?.sousDomaine }}.logipourecole.com</p>
          }
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          @for (item of visibleNavItems(); track item.label) {
            @if (item.dsiTab) {
              <button
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left"
                [class]="isOnDsiTab(item.dsiTab) ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'"
                (click)="goToDsiTab(item.dsiTab)"
              >
                <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
                <span class="truncate">{{ item.label }}</span>
              </button>
            } @else if (item.saTab) {
              <button
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left"
                [class]="isOnSuperAdminTab(item.saTab) ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'"
                (click)="goToSuperAdminTab(item.saTab)"
              >
                <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
                <span class="truncate">{{ item.label }}</span>
              </button>
            } @else {
              <a
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                [routerLink]="item.route"
                routerLinkActive="bg-primary text-white"
                [routerLinkActiveOptions]="{ exact: true }"
                [class.text-slate-400]="!isRouteActive(item.route)"
                [class.hover:bg-slate-900]="!isRouteActive(item.route)"
                [class.hover:text-white]="!isRouteActive(item.route)"
              >
                <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
                <span class="truncate">{{ item.label }}</span>
              </a>
            }
          }
        </nav>
      </aside>

      <!-- Overlay for mobile -->
      @if (!siderCollapsed) {
        <div class="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" (click)="siderCollapsed = true"></div>
      }

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
          <div class="flex items-center gap-4">
            <button
              class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              (click)="siderCollapsed = !siderCollapsed"
            >
              <span class="material-symbols-outlined">{{ siderCollapsed ? 'menu' : 'menu_open' }}</span>
            </button>
            <h1 class="text-lg font-bold text-slate-900 truncate">{{ pageTitle() }}</h1>
          </div>
          <div class="flex items-center gap-4">
            <app-notifications-bell></app-notifications-bell>
            <div class="h-6 w-px bg-slate-200"></div>
            <!-- User Dropdown -->
            <div class="relative" data-user-dropdown>
              <button
                class="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                (click)="userMenuOpen = !userMenuOpen"
              >
                <div class="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {{ userInitials() }}
                </div>
                <div class="text-left hidden sm:block">
                  <p class="text-xs font-bold text-slate-900">{{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}</p>
                  <p class="text-[10px] text-slate-500">{{ authService.currentUser()?.role }}</p>
                </div>
                <span class="material-symbols-outlined text-slate-400 text-xl">expand_more</span>
              </button>
              @if (userMenuOpen) {
                <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-fade-in">
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    (click)="goToProfile(); userMenuOpen = false"
                  >
                    <span class="material-symbols-outlined text-xl text-slate-400">person</span>
                    Mon profil
                  </button>
                  <div class="h-px bg-slate-100 my-1"></div>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    (click)="logout(); userMenuOpen = false"
                  >
                    <span class="material-symbols-outlined text-xl text-red-400">logout</span>
                    Déconnexion
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto bg-bg-light p-6 lg:p-8">
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
  logoLoaded = signal(true);
  currentUrl = signal(this.router.url);

  private navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', roles: [RoleUtilisateur.DG, RoleUtilisateur.DSI, RoleUtilisateur.ETUDES, RoleUtilisateur.SECRETAIRE, RoleUtilisateur.MARKETING, RoleUtilisateur.SUPER_ADMIN] },
    // Super Admin - direct menu items, each navigates to /super-admin and sets the tab
    { label: 'Établissements', icon: 'account_balance', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'etablissements' },
    { label: 'Utilisateurs connectés', icon: 'groups', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'utilisateurs' },
    { label: "Journal d'audit", icon: 'history', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'audit' },
    { label: 'Utilisateurs', icon: 'groups', route: '/dg/utilisateurs', roles: [RoleUtilisateur.DG] },
    { label: 'Dashboard', icon: 'wallet', route: '/daf', roles: [RoleUtilisateur.DAF] },
    { label: 'Finance', icon: 'receipt_long', route: '/daf/finance', roles: [RoleUtilisateur.DAF] },
    { label: 'Tarifs', icon: 'payments', route: '/daf/tarifs', roles: [RoleUtilisateur.DAF] },
    { label: 'Versements', icon: 'view_column', route: '/daf/versements', roles: [RoleUtilisateur.DAF] },
    { label: 'Templates Reçu', icon: 'description', route: '/daf/recus', roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG] },
    // ETUDES - items for Direction des Études only (not DSI)
    { label: 'Études', icon: 'menu_book', route: '/etudes', roles: [RoleUtilisateur.ETUDES] },
    { label: 'Années scolaires', icon: 'calendar_month', route: '/etudes/annees-scolaires', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DG] },
    { label: 'Périodes', icon: 'schedule', route: '/etudes/periodes', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DG] },
    { label: 'Salles', icon: 'location_on', route: '/etudes/salles', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DG] },
    { label: 'Emploi du temps', icon: 'schedule', route: '/etudes/emploi-du-temps', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG] },
    { label: 'Secrétariat', icon: 'description', route: '/secretariat', roles: [RoleUtilisateur.SECRETAIRE] },
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
    { label: 'Absences & retards', icon: 'error', route: '/enseignant/absences', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Devoirs', icon: 'description', route: '/enseignant/devoirs', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Mes élèves', icon: 'groups', route: '/enseignant/mes-eleves', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Mes notes saisies', icon: 'history', route: '/enseignant/historique-notes', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Espace Étudiant', icon: 'mood', route: '/etudiant', roles: [RoleUtilisateur.ETUDIANT] },
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

  ecoleLogoUrl = computed(() => {
    const logoUrl = this.authService.currentUser()?.ecole?.logoUrl;
    if (!logoUrl) return '';
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${logoUrl}`;
  });

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
    if (url.includes('/enseignant/historique-notes')) return 'Mes notes saisies';
    if (url.includes('/enseignant')) return 'Mon emploi du temps';
    if (url.includes('/secretariat')) return 'Secrétariat';
    if (url.includes('/marketing')) return 'Marketing';
    if (url.includes('/dsi')) {
      const tab = this.dsiTabService.activeTab();
      const found = this.dsiTabService.tabs.find(t => t.key === tab);
      return found ? found.label : 'DSI';
    }
    if (url.includes('/etudiant')) return 'Espace Étudiant';
    return 'LogiPourEcole';
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
