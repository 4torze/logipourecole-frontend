/**
 * Une classe peut être associée à plusieurs filières (relation many-to-many) :
 * le backend renvoie `classe.filieres` = ClasseFiliere[] avec `.filiere` imbriqué.
 * Ce helper affiche leurs noms joints, quel que soit l'endroit d'où vient l'objet classe.
 */
export function filiereLabel(classe: any): string {
  if (!classe) return '';
  if (Array.isArray(classe.filieres)) {
    return classe.filieres.map((cf: any) => cf.filiere?.nom).filter(Boolean).join(', ');
  }
  return classe.filiere?.nom || '';
}

export function filiereIds(classe: any): string[] {
  if (!classe || !Array.isArray(classe.filieres)) return [];
  return classe.filieres.map((cf: any) => cf.filiereId || cf.filiere?.id).filter(Boolean);
}
