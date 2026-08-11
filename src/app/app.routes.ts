import { Routes } from '@angular/router';
import { RoleUtilisateur } from './core/models';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PublicInscriptionComponent } from './features/public/inscription.component';
import { PublicBrochureComponent } from './features/public/brochure.component';
import { SuperAdminComponent } from './features/super-admin/super-admin.component';
import { EnseignantHomeComponent } from './features/enseignant/enseignant-home.component';
import { EnseignantNotesComponent } from './features/enseignant/notes.component';
import { EtudiantHomeComponent } from './features/etudiant/etudiant-home.component';
import { EtudiantBulletinsComponent } from './features/etudiant/bulletins.component';
import { DafHomeComponent } from './features/daf/daf-home.component';
import { DafFinanceComponent } from './features/daf/daf-finance.component';
import { DafTarifsComponent } from './features/daf/daf-tarifs.component';
import { DafVersementsComponent } from './features/daf/daf-versements.component';
import { RecuTemplatesComponent } from './features/daf/recu-templates.component';
import { EtudesHomeComponent } from './features/etudes/etudes-home.component';
import { SecretariatHomeComponent } from './features/secretariat/secretariat-home.component';
import { MarketingHomeComponent } from './features/marketing/marketing-home.component';
import { DsiHomeComponent } from './features/dsi/dsi-home.component';
import { DgUsersComponent } from './features/dg/dg-users.component';
import { AnneesScolairesComponent } from './features/etudes/annees-scolaires.component';
import { PeriodesComponent } from './features/etudes/periodes.component';
import { SallesComponent } from './features/etudes/salles.component';
import { EmploiDuTempsComponent } from './features/etudes/emploi-du-temps.component';
import { AbsencesComponent } from './features/enseignant/absences.component';
import { DevoirsComponent } from './features/enseignant/devoirs.component';
import { EnseignantMesElevesComponent } from './features/enseignant/mes-eleves.component';
import { EnseignantHistoriqueNotesComponent } from './features/enseignant/historique-notes.component';

export const routes: Routes = [
  // Routes publiques (sans auth)
  { path: 'login', component: LoginComponent },
  { path: 'inscription', component: PublicInscriptionComponent },
  { path: 'brochure', component: PublicBrochureComponent },

  // Routes authentifiées (avec layout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'super-admin',
        component: SuperAdminComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace Enseignant
      {
        path: 'enseignant',
        component: EnseignantHomeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'enseignant/notes',
        component: EnseignantNotesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'enseignant/absences',
        component: AbsencesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'enseignant/devoirs',
        component: DevoirsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'enseignant/mes-eleves',
        component: EnseignantMesElevesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'enseignant/historique-notes',
        component: EnseignantHistoriqueNotesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace Étudiant
      {
        path: 'etudiant',
        component: EtudiantHomeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDIANT, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'etudiant/bulletins',
        component: EtudiantBulletinsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDIANT, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace DAF
      {
        path: 'daf',
        component: DafHomeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'daf/finance',
        component: DafFinanceComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'daf/tarifs',
        component: DafTarifsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'daf/versements',
        component: DafVersementsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'daf/recus',
        component: RecuTemplatesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace Direction des Études
      {
        path: 'etudes',
        component: EtudesHomeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'etudes/annees-scolaires',
        component: AnneesScolairesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'etudes/periodes',
        component: PeriodesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'etudes/salles',
        component: SallesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'etudes/emploi-du-temps',
        component: EmploiDuTempsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace Secrétariat
      {
        path: 'secretariat',
        component: SecretariatHomeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.SECRETAIRE, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace Marketing
      {
        path: 'marketing',
        component: MarketingHomeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.MARKETING, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace DSI
      {
        path: 'dsi',
        component: DsiHomeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DSI, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace DG (utilisateurs uniquement — le dashboard est unifié sur /dashboard)
      {
        path: 'dg/utilisateurs',
        component: DgUsersComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
    ],
  },

  // Redirect
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
