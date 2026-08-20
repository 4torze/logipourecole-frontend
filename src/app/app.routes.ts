import { Routes } from '@angular/router';
import { RoleUtilisateur } from './core/models';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { MustChangePasswordGuard } from './core/guards/must-change-password.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { ChangePasswordComponent } from './features/auth/change-password.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PublicInscriptionComponent } from './features/public/inscription.component';
import { PublicBrochureComponent } from './features/public/brochure.component';
import { SuperAdminComponent } from './features/super-admin/super-admin.component';
import { EnseignantHomeComponent } from './features/enseignant/enseignant-home.component';
import { EnseignantNotesComponent } from './features/enseignant/notes.component';
import { EtudiantHomeComponent } from './features/etudiant/etudiant-home.component';
import { EtudiantBulletinsComponent } from './features/etudiant/bulletins.component';
import { EtudiantDevoirsComponent } from './features/etudiant/devoirs.component';
import { EtudiantPaiementsComponent } from './features/etudiant/paiements.component';
import { EtudiantProgrammeComponent } from './features/etudiant/programme.component';
import { DafHomeComponent } from './features/daf/daf-home.component';
import { DafFinanceComponent } from './features/daf/daf-finance.component';
import { DafTarifsComponent } from './features/daf/daf-tarifs.component';
import { DafVersementsComponent } from './features/daf/daf-versements.component';
import { DafPaiementDetailComponent } from './features/daf/daf-paiement-detail.component';
import { EtudesHomeComponent } from './features/etudes/etudes-home.component';
import { SecretariatReunionsComponent } from './features/secretariat/secretariat-reunions.component';
import { SecretariatVisitesComponent } from './features/secretariat/secretariat-visites.component';
import { SecretariatProspectsComponent } from './features/secretariat/secretariat-prospects.component';
import { SecretariatCourrierComponent } from './features/secretariat/secretariat-courrier.component';
import { SecretariatAnnuaireComponent } from './features/secretariat/secretariat-annuaire.component';
import { SecretariatTachesComponent } from './features/secretariat/secretariat-taches.component';
import { MarketingHomeComponent } from './features/marketing/marketing-home.component';
import { DsiHomeComponent } from './features/dsi/dsi-home.component';
import { DsiClasseDetailComponent } from './features/dsi/dsi-classe-detail.component';
import { DsiParametresComponent } from './features/dsi/dsi-parametres.component';
import { DgUsersComponent } from './features/dg/dg-users.component';
import { DgParametresComponent } from './features/dg/dg-parametres.component';
import { DgJournalComponent } from './features/dg/dg-journal.component';
import { DgElevesComponent } from './features/dg/dg-eleves.component';
import { DgEnseignantsComponent } from './features/dg/dg-enseignants.component';
import { EnseignantDetailComponent } from './features/dg/enseignant-detail.component';
import { EtudiantDetailComponent } from './features/dg/etudiant-detail.component';
import { ClassementComponent } from './features/etudes/classement.component';
import { ClotureAnneeComponent } from './features/etudes/cloture-annee.component';
import { TemplatesSystemeComponent } from './features/templates/templates-systeme.component';
import { MessagerieHomeComponent } from './features/messagerie/messagerie-home.component';
import { ConversationComponent } from './features/messagerie/conversation.component';
import { DgFinanceComponent } from './features/dg/dg-finance.component';
import { AnneesScolairesComponent } from './features/etudes/annees-scolaires.component';
import { AnneeScolaireDetailComponent } from './features/etudes/annee-scolaire-detail.component';
import { PeriodesComponent } from './features/etudes/periodes.component';
import { SallesComponent } from './features/etudes/salles.component';
import { EmploiDuTempsComponent } from './features/etudes/emploi-du-temps.component';
import { AbsencesComponent } from './features/enseignant/absences.component';
import { DevoirsComponent } from './features/enseignant/devoirs.component';
import { ProgrammeComponent } from './features/enseignant/programme.component';
import { EnseignantBulletinsComponent } from './features/enseignant/bulletins.component';
import { EnseignantMesElevesComponent } from './features/enseignant/mes-eleves.component';
import { EnseignantHistoriqueNotesComponent } from './features/enseignant/historique-notes.component';
import { SeancesComponent } from './features/enseignant/seances.component';
import { SeanceDetailComponent } from './features/seances/seance-detail.component';

export const routes: Routes = [
  // Routes publiques (sans auth)
  { path: 'login', component: LoginComponent },
  { path: 'inscription', component: PublicInscriptionComponent },
  { path: 'brochure', component: PublicBrochureComponent },

  // Changement de mot de passe : hors layout principal pour éviter toute boucle
  // avec MustChangePasswordGuard (qui protège les routes ci-dessous).
  {
    path: 'changer-mot-de-passe',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
  },

  // Routes authentifiées (avec layout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [MustChangePasswordGuard],
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
        // Retiré du menu enseignant : les absences se gèrent désormais depuis
        // la séance (voir /seance/:emploiDuTempsId/:date). Route conservée
        // pour d'éventuelles corrections administratives (ÉTUDES).
        path: 'enseignant/absences',
        component: AbsencesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
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
      {
        path: 'enseignant/seances',
        component: SeancesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'enseignant/programme',
        component: ProgrammeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'enseignant/bulletins',
        component: EnseignantBulletinsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Détail d'une séance — page centrale de l'activité pédagogique,
      // accessible en lecture-écriture pour l'enseignant/ÉTUDES, et en lecture
      // seule + appréciation pour DG/DSI/Secrétaire.
      {
        path: 'seance/:emploiDuTempsId/:date',
        component: SeanceDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.DG, RoleUtilisateur.DSI, RoleUtilisateur.SECRETAIRE, RoleUtilisateur.SUPER_ADMIN] },
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
      {
        path: 'etudiant/devoirs',
        component: EtudiantDevoirsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDIANT, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'etudiant/paiements',
        component: EtudiantPaiementsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDIANT, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'etudiant/programme',
        component: EtudiantProgrammeComponent,
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
        data: { roles: [RoleUtilisateur.DAF, RoleUtilisateur.SUPER_ADMIN] },
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
        path: 'daf/paiements/:id',
        component: DafPaiementDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'daf/recus',
        redirectTo: 'templates',
        pathMatch: 'full',
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
        path: 'etudes/annees-scolaires/:id',
        component: AnneeScolaireDetailComponent,
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
        data: { roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SECRETAIRE, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace Secrétariat
      {
        path: 'secretariat/reunions',
        component: SecretariatReunionsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.SECRETAIRE, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'secretariat/visites',
        component: SecretariatVisitesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.SECRETAIRE, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'secretariat/prospects',
        component: SecretariatProspectsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.SECRETAIRE, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'secretariat/courrier',
        component: SecretariatCourrierComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.SECRETAIRE, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'secretariat/annuaire',
        component: SecretariatAnnuaireComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.SECRETAIRE, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'secretariat/taches',
        component: SecretariatTachesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.SECRETAIRE, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'secretariat',
        redirectTo: 'secretariat/reunions',
        pathMatch: 'full',
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
      {
        path: 'dsi/classes/:id',
        component: DsiClasseDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dsi/parametres',
        component: DsiParametresComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DSI, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'bulletins/templates',
        redirectTo: 'templates',
        pathMatch: 'full',
      },
      {
        path: 'templates',
        component: TemplatesSystemeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DAF, RoleUtilisateur.DG, RoleUtilisateur.DSI, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'classement/:classeId/:periodeId',
        component: ClassementComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'etudes/cloture-annee',
        component: ClotureAnneeComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.ETUDES, RoleUtilisateur.DSI, RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Espace DG (utilisateurs + paramètres — le dashboard est unifié sur /dashboard)
      {
        path: 'dg/utilisateurs',
        component: DgUsersComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dg/parametres',
        component: DgParametresComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dg/finance',
        component: DgFinanceComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dg/journal',
        component: DgJournalComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dg/eleves',
        component: DgElevesComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dg/eleves/:id',
        component: EtudiantDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dsi/etudiants/:id',
        component: EtudiantDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DSI, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dg/enseignants',
        component: DgEnseignantsComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dg/enseignants/:id',
        component: EnseignantDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DG, RoleUtilisateur.SUPER_ADMIN] },
      },
      {
        path: 'dsi/enseignants/:id',
        component: EnseignantDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: [RoleUtilisateur.DSI, RoleUtilisateur.SUPER_ADMIN] },
      },
      // Messagerie — fusionne messages internes et annonces dans une seule
      // interface à onglets ; ouverte à tous les rôles authentifiés, l'envoi
      // et l'historique d'annonces restent réservés à DG/DSI en interne.
      {
        path: 'annonces',
        redirectTo: 'messagerie',
        pathMatch: 'full',
      },
      {
        path: 'annonces/nouvelle',
        redirectTo: 'messagerie',
        pathMatch: 'full',
      },
      {
        path: 'annonces/historique',
        redirectTo: 'messagerie',
        pathMatch: 'full',
      },
      {
        path: 'messagerie',
        component: MessagerieHomeComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [
            RoleUtilisateur.DG,
            RoleUtilisateur.DAF,
            RoleUtilisateur.DSI,
            RoleUtilisateur.ETUDES,
            RoleUtilisateur.SECRETAIRE,
            RoleUtilisateur.MARKETING,
            RoleUtilisateur.ENSEIGNANT,
            RoleUtilisateur.ETUDIANT,
            RoleUtilisateur.SUPER_ADMIN,
          ],
        },
      },
      {
        path: 'messagerie/:id',
        component: ConversationComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [
            RoleUtilisateur.DG,
            RoleUtilisateur.DAF,
            RoleUtilisateur.DSI,
            RoleUtilisateur.ETUDES,
            RoleUtilisateur.SECRETAIRE,
            RoleUtilisateur.MARKETING,
            RoleUtilisateur.ENSEIGNANT,
            RoleUtilisateur.ETUDIANT,
            RoleUtilisateur.SUPER_ADMIN,
          ],
        },
      },
    ],
  },

  // Redirect
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
