export enum RoleUtilisateur {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DG = 'DG',
  DAF = 'DAF',
  MARKETING = 'MARKETING',
  SECRETAIRE = 'SECRETAIRE',
  DSI = 'DSI',
  ETUDES = 'ETUDES',
  ENSEIGNANT = 'ENSEIGNANT',
  ETUDIANT = 'ETUDIANT',
  VISITEUR = 'VISITEUR',
}

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: RoleUtilisateur;
  statut: string;
  photoUrl?: string;
  ecoleId?: string;
  etudiantId?: string;
  deuxFaActive?: boolean;
  mustChangePassword?: boolean;
  derniereConnexion?: string;
  ecole?: Ecole;
}

export interface Ecole {
  id: string;
  nom: string;
  sousDomaine: string;
  logoUrl?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  description?: string;
  statutAbonnement: string;
  actif: boolean;
  dateInscription: string;
}

export interface Filiere {
  id: string;
  nom: string;
  code: string;
  description?: string;
}

export interface Classe {
  id: string;
  nom: string;
  niveau: string;
  capaciteMax: number;
  filiere?: Filiere;
}

export interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  sexe?: string;
  telephone?: string;
  email?: string;
  lieuHabitation?: string;
  contactParentNom?: string;
  contactParentTelephone?: string;
  matriculeBac?: string;
  matriculeMesrs?: string;
  numeroTableBac?: string;
  anneeBac?: string;
  statut: string;
}

export interface Paiement {
  id: string;
  etudiantId: string;
  montant: number;
  numeroRecu: string;
  datePaiement: string;
  mode: string;
  versement: number;
  recuPdfUrl?: string;
}

export interface Note {
  id: string;
  etudiantId: string;
  matiereId: string;
  classeId: string;
  periodeId: string;
  typeEvaluation: string;
  note: number;
  sur: number;
  coefficient: number;
  dateSaisie: string;
}

export interface Visiteur {
  id: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  filiereSouhaitee?: string;
  lieuHabitation?: string;
  statut: string;
  dateContact: string;
  notes?: string;
}

export interface AuthResponse {
  user: Utilisateur;
  token: string;
  requires2fa?: boolean;
  message?: string;
}

export interface CreateUserResponse {
  user: Utilisateur;
  temporaryPassword: string;
}

export interface CreateEcoleResponse {
  ecole: Ecole;
  dg: Utilisateur;
  temporaryPassword: string;
}

export interface SuperAdminStats {
  totalEcoles: number;
  ecolesActives: number;
  ecolesBloquees: number;
  totalUsers: number;
  totalEtudiants: number;
  revenuActif: number;
  repartitionAbonnement: { statut: string; total: number }[];
  evolutionInscriptions: { mois: string; total: number }[];
  topEcoles: { id: string; nom: string; sousDomaine: string; _count: { utilisateurs: number; etudiants: number } }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnneeScolaire {
  id: string;
  libelle: string;
  dateDebut?: string;
  dateFin?: string;
  statut: string;
}

export interface Periode {
  id: string;
  libelle: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  anneeScolaireId?: string;
}

export interface Salle {
  id: string;
  nom: string;
  code?: string;
  capacite: number;
  batiment?: string;
  etage?: string;
  equipements?: Record<string, any>;
  actif: boolean;
}

export interface EmploiDuTemps {
  id: string;
  classeId: string;
  matiereId: string;
  enseignantId: string;
  jourSemaine: number;
  dateDebut?: string;
  heureDebut: string;
  heureFin: string;
  salleId?: string;
  salle?: Salle;
  classe?: Classe;
  matiere?: any;
  enseignant?: { id: string; nom: string; prenom: string };
}

export type TypeAbsence = 'ABSENCE' | 'RETARD' | 'EXCLUSION';

export interface Absence {
  id: string;
  etudiantId: string;
  matiereId: string;
  classeId: string;
  enseignantId: string;
  type: TypeAbsence;
  date: string;
  justified: boolean;
  motif?: string;
  justificatifUrl?: string;
}

export interface Devoir {
  id: string;
  classeId: string;
  matiereId: string;
  enseignantId: string;
  titre: string;
  description?: string;
  dateLimite: string;
  points: number;
}

export interface SoumissionDevoir {
  id: string;
  devoirId: string;
  etudiantId: string;
  contenu?: string;
  fichierUrl?: string;
  dateSoumission: string;
  note?: number;
  commentaire?: string;
  dateNotation?: string;
}
