export type StatutSeanceAffiche = 'A_RENSEIGNER' | 'RESPECTEE' | 'NON_RESPECTEE';

export function seanceStatutLabel(statut: StatutSeanceAffiche | undefined | null): string {
  return {
    RESPECTEE: 'Séance respectée',
    NON_RESPECTEE: 'Séance non respectée',
    A_RENSEIGNER: 'À renseigner',
  }[statut || 'A_RENSEIGNER'];
}

export function seanceStatutClass(statut: StatutSeanceAffiche | undefined | null): string {
  return {
    RESPECTEE: 'tag-success',
    NON_RESPECTEE: 'tag-danger',
    A_RENSEIGNER: 'tag-neutral',
  }[statut || 'A_RENSEIGNER'];
}
