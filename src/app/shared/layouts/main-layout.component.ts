import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { RoleUtilisateur } from '../../core/models';
import { DsiTabService } from '../../core/services/dsi-tab.service';
import { SuperAdminTabService } from '../../core/services/super-admin-tab.service';
import { RealtimeService } from '../../core/services/realtime.service';
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
    CommonModule, RouterOutlet, RouterLink,
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
              <a class="gs-nav-link" [routerLink]="item.route" [class.active]="isNavItemActive(item.route)">
                <span class="gs-mark"></span>
                <span class="material-symbols-outlined" style="font-size:18px">{{ item.icon }}</span>
                <span class="truncate" style="flex:1">{{ item.label }}</span>
                @if (badgeFor(item.route) > 0) {
                  <span class="tag tag-accent" style="flex:none;min-width:18px;text-align:center;padding:1px 6px;font-size:11px">{{ badgeFor(item.route) }}</span>
                }
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
  private realtimeService = inject(RealtimeService);
  private router = inject(Router);

  siderCollapsed = false;
  userMenuOpen = false;
  currentUrl = signal(this.router.url);

  // Ordre pensé par importance/fréquence d'usage réelle pour chaque profil,
  // en respectant deux contraintes qui s'appliquent à TOUT le tableau (donc à
  // la position d'un item, pas juste à son contenu) :
  // 1. Le tableau de bord (ou équivalent : /daf, /etudiant) de chaque profil
  //    est déclaré en premier parmi les blocs ci-dessous, pour s'afficher en
  //    tête de liste quel que soit le rôle.
  // 2. Un "Paramètres" de profil (DG, DSI) est déclaré tout à la fin du
  //    tableau — après absolument tout le reste, y compris les blocs
  //    d'autres profils qui partagent certaines routes avec DG/DSI (études,
  //    emploi du temps...) — pour garantir qu'il reste bien le dernier
  //    élément visible, quels que soient les items partagés ajoutés par la
  //    suite ailleurs dans le tableau.
  // Annonces/Messagerie (outils de communication quotidienne, utilisés par
  // presque tous les profils) sont remontés juste après les tableaux de bord
  // plutôt que relégués en fin de liste comme c'était le cas avant.
  // Chaque icône n'est utilisée qu'une seule fois dans tout ce tableau, tous
  // profils confondus.
  private navItems: NavItem[] = [
    // --- Tableaux de bord (position 1 pour chaque profil) ---
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', roles: [RoleUtilisateur.DG, RoleUtilisateur.DSI, RoleUtilisateur.ETUDES, RoleUtilisateur.SECRETAIRE, RoleUtilisateur.MARKETING, RoleUtilisateur.SUPER_ADMIN] },
    { label: 'Dashboard', icon: 'wallet', route: '/daf', roles: [RoleUtilisateur.DAF] },
    { label: 'Tableau de bord', icon: 'space_dashboard', route: '/dashboard', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Espace Étudiant', icon: 'mood', route: '/etudiant', roles: [RoleUtilisateur.ETUDIANT] },

    // --- Communication (position 2 pour tous les profils qui y ont accès) ---
    // Fusionne messages internes et annonces dans une seule interface à onglets.
    { label: 'Messagerie', icon: 'forum', route: '/messagerie', roles: [RoleUtilisateur.DG, RoleUtilisateur.DAF, RoleUtilisateur.DSI, RoleUtilisateur.ETUDES, RoleUtilisateur.SECRETAIRE, RoleUtilisateur.MARKETING, RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDIANT] },

    // --- Super Admin ---
    { label: 'Établissements', icon: 'account_balance', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'etablissements' },
    { label: 'Utilisateurs connectés', icon: 'groups', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'utilisateurs' },
    { label: "Journal d'audit", icon: 'history', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'audit' },
    { label: 'Style des emails', icon: 'mail', route: '/super-admin', roles: [RoleUtilisateur.SUPER_ADMIN], saTab: 'emails' },

    // --- DG : finances et effectifs d'abord, audit/annonce ensuite, Paramètres tout en bas (voir bloc final) ---
    { label: 'Finance', icon: 'account_balance_wallet', route: '/dg/finance', roles: [RoleUtilisateur.DG] },
    { label: 'Élèves', icon: 'school', route: '/dg/eleves', roles: [RoleUtilisateur.DG] },
    { label: 'Enseignants', icon: 'group', route: '/dg/enseignants', roles: [RoleUtilisateur.DG] },
    { label: 'Utilisateurs', icon: 'manage_accounts', route: '/dg/utilisateurs', roles: [RoleUtilisateur.DG] },
    { label: "Journal d'audit", icon: 'fact_check', route: '/dg/journal', roles: [RoleUtilisateur.DG] },

    // --- DAF : le tableau financier d'abord, la configuration (tarifs/versements/templates) ensuite ---
    { label: 'Finance', icon: 'receipt_long', route: '/daf/finance', roles: [RoleUtilisateur.DAF] },
    { label: 'Versements', icon: 'view_column', route: '/daf/versements', roles: [RoleUtilisateur.DAF] },
    { label: 'Tarifs', icon: 'payments', route: '/daf/tarifs', roles: [RoleUtilisateur.DAF] },
    // Fusionne les templates de reçu et de bulletin dans une seule interface à onglets.
    { label: 'Template système', icon: 'description', route: '/templates', roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG, RoleUtilisateur.DSI] },

    // --- DSI : outils quotidiens (étudiants/enseignants/classes) d'abord, configuration ensuite, Paramètres tout en bas ---
    { label: 'Étudiants', icon: 'backpack', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'etudiants' },
    { label: 'Enseignants', icon: 'badge', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'enseignants' },
    { label: 'Classes', icon: 'category', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'classes' },
    { label: 'Affect. Enseignants', icon: 'group_add', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'affectations-enseignants' },
    { label: 'Matières', icon: 'book', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'matieres' },
    { label: 'Filières', icon: 'apps', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'filieres' },
    { label: 'Années scolaires', icon: 'date_range', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'annees' },
    { label: 'Notes & moyennes', icon: 'leaderboard', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'notes' },
    { label: 'Relances', icon: 'sms', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'relances' },
    { label: 'Infos', icon: 'info', route: '/dsi', roles: [RoleUtilisateur.DSI], dsiTab: 'ecole' },

    // --- Études (partagé ETUDES/DSI/DG/SECRETAIRE selon la route) ---
    { label: 'Études', icon: 'menu_book', route: '/etudes', roles: [RoleUtilisateur.ETUDES] },
    { label: 'Emploi du temps', icon: 'calendar_view_week', route: '/etudes/emploi-du-temps', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SECRETAIRE] },
    { label: 'Années scolaires', icon: 'calendar_month', route: '/etudes/annees-scolaires', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DG] },
    { label: 'Périodes', icon: 'schedule', route: '/etudes/periodes', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG] },
    { label: 'Salles', icon: 'location_on', route: '/etudes/salles', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DG] },
    { label: "Clôture d'année", icon: 'workspace_premium', route: '/etudes/cloture-annee', roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG] },

    // --- Secrétariat : accueil (visites/tâches) d'abord, suivi ensuite, référence en dernier ---
    { label: 'Visites & RDV', icon: 'event', route: '/secretariat/visites', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Mes tâches', icon: 'checklist', route: '/secretariat/taches', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Prospects', icon: 'person_add', route: '/secretariat/prospects', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Réunions', icon: 'diversity_3', route: '/secretariat/reunions', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Courrier', icon: 'local_post_office', route: '/secretariat/courrier', roles: [RoleUtilisateur.SECRETAIRE] },
    { label: 'Annuaire', icon: 'contacts', route: '/secretariat/annuaire', roles: [RoleUtilisateur.SECRETAIRE] },

    { label: 'Marketing', icon: 'notifications', route: '/marketing', roles: [RoleUtilisateur.MARKETING] },

    // --- Enseignant : l'emploi du temps reste le hub, puis évaluation/pédagogie, puis historique/bulletins ---
    { label: 'Mon emploi du temps', icon: 'calendar_today', route: '/enseignant', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Mes séances', icon: 'event_note', route: '/enseignant/seances', roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
    { label: 'Évaluations', icon: 'edit', route: '/enseignant/notes', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Devoirs', icon: 'task', route: '/enseignant/devoirs', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Mes élèves', icon: 'supervisor_account', route: '/enseignant/mes-eleves', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Programme', icon: 'auto_stories', route: '/enseignant/programme', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Bulletins', icon: 'summarize', route: '/enseignant/bulletins', roles: [RoleUtilisateur.ENSEIGNANT] },
    { label: 'Mes notes saisies', icon: 'grading', route: '/enseignant/historique-notes', roles: [RoleUtilisateur.ENSEIGNANT] },

    // --- Élève : devoirs (actionnable) d'abord, puis programme et paiements (référence/périodique) ---
    { label: 'Mes devoirs', icon: 'assignment', route: '/etudiant/devoirs', roles: [RoleUtilisateur.ETUDIANT] },
    { label: 'Mon programme', icon: 'import_contacts', route: '/etudiant/programme', roles: [RoleUtilisateur.ETUDIANT] },
    { label: 'Mes paiements', icon: 'credit_card', route: '/etudiant/paiements', roles: [RoleUtilisateur.ETUDIANT] },

    // --- Paramètres : déclarés en tout dernier pour rester le dernier élément
    // visible de DG et DSI, quels que soient les items partagés ci-dessus. ---
    { label: 'Paramètres', icon: 'settings', route: '/dg/parametres', roles: [RoleUtilisateur.DG] },
    { label: 'Paramètres', icon: 'tune', route: '/dsi/parametres', roles: [RoleUtilisateur.DSI] },
  ];

  visibleNavItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(user.role);
    });
  });

  // Route du menu à surligner pour l'URL courante. Une page de détail sans
  // entrée de menu propre (ex. /daf/paiements/:id, /dsi/enseignants/:id)
  // rattache son surlignage au menu parent le plus proche via la correspondance
  // de préfixe la plus longue — jamais deux entrées en même temps, et jamais
  // aucune tant qu'un parent existe, contrairement à l'ancien `exact: true`
  // qui ne surlignait plus rien dès qu'on quittait la page exacte du menu.
  activeNavRoute = computed(() => {
    const url = this.currentUrl().split('?')[0].split('#')[0];
    const candidates = this.navItems.filter((i) => !i.dsiTab && !i.saTab).map((i) => i.route);
    let best: string | null = null;
    for (const route of candidates) {
      if (url === route || url.startsWith(route + '/')) {
        if (!best || route.length > best.length) best = route;
      }
    }
    return best;
  });

  isNavItemActive(route: string): boolean {
    return this.activeNavRoute() === route;
  }

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
    if (url.includes('/dg/enseignants')) return 'Enseignants';
    if (url.includes('/dsi/enseignants/')) return 'Fiche enseignant';
    if (url.includes('/messagerie')) return 'Messagerie';
    if (url.includes('/dg/journal')) return 'Journal d\'audit';
    if (url.includes('/dg/parametres')) return 'Paramètres';
    if (url.includes('/dg')) return 'Direction Générale';
    if (url.includes('/templates')) return 'Template système';
    if (url.includes('/daf/tarifs')) return 'Tarifs';
    if (url.includes('/daf/versements')) return 'Versements';
    if (url.includes('/daf/paiements/')) return 'Détail du paiement';
    if (url.includes('/daf/finance')) return 'Finance';
    if (url.includes('/daf')) return 'Dashboard';
    if (url.includes('/etudes/annees-scolaires')) return 'Années scolaires';
    if (url.includes('/etudes/periodes')) return 'Périodes scolaires';
    if (url.includes('/etudes/salles')) return 'Salles';
    if (url.includes('/etudes/emploi-du-temps')) return 'Emploi du temps';
    if (url.includes('/etudes/cloture-annee')) return 'Clôture d\'année';
    if (url.includes('/etudes')) return 'Direction des Études';
    if (url.includes('/classement')) return 'Classement de classe';
    if (url.includes('/enseignant/notes')) return 'Évaluations';
    if (url.includes('/enseignant/absences')) return 'Absences & retards';
    if (url.includes('/enseignant/devoirs')) return 'Devoirs & soumissions';
    if (url.includes('/enseignant/mes-eleves')) return 'Mes élèves';
    if (url.includes('/enseignant/programme')) return 'Programme';
    if (url.includes('/enseignant/bulletins')) return 'Bulletins';
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
    if (url.includes('/dsi/parametres')) return 'Paramètres';
    if (url.includes('/dsi')) {
      const tab = this.dsiTabService.activeTab();
      const found = this.dsiTabService.tabs.find(t => t.key === tab);
      return found ? found.label : 'DSI';
    }
    if (url.includes('/etudiant/devoirs')) return 'Mes devoirs';
    if (url.includes('/etudiant/programme')) return 'Mon programme';
    if (url.includes('/etudiant/paiements')) return 'Mes paiements';
    if (url.includes('/etudiant')) return 'Espace Étudiant';
    return 'RANIAG';
  });

  goToDsiTab(tab: string) {
    this.dsiTabService.setTab(tab);
    this.router.navigate(['/dsi']);
  }

  // Comparaison stricte (pas .includes()) : sinon une page complètement
  // distincte comme /dsi/parametres ou /dsi/enseignants/:id — qui contient
  // aussi la sous-chaîne '/dsi' — réactivait à tort le dernier onglet DSI
  // sélectionné en plus de l'entrée de menu réellement correspondante.
  isOnDsiTab(tab: string): boolean {
    return this.currentUrl() === '/dsi' && this.dsiTabService.activeTab() === tab;
  }

  goToSuperAdminTab(tab: string) {
    this.superAdminTabService.setTab(tab);
    this.router.navigate(['/super-admin']);
  }

  isOnSuperAdminTab(tab: string): boolean {
    return this.currentUrl() === '/super-admin' && this.superAdminTabService.activeTab() === tab;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
  }

  badgeFor(route: string): number {
    if (route === '/messagerie') return this.realtimeService.unreadMessages() + this.realtimeService.unreadAnnonces();
    return 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-user-dropdown]') && this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }
}
