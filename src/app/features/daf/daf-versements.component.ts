import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-daf-versements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      @if (versementStats().length > 0) {
        <div class="mb-5">
          <h4 class="text-sm font-semibold text-slate-900 mb-3">Tableau de bord par tranche</h4>
          <div class="flex gap-3 flex-wrap">
            @for (s of versementStats(); track s.id) {
              <div class="flex-1 min-w-[160px] p-3.5 border border-slate-200 rounded-lg bg-white">
                <div class="flex items-center gap-2 mb-2"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">{{ s.ordre }}</span><span class="text-sm font-medium text-slate-900">{{ s.libelle }}</span>@if (!s.actif) { <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Fermée</span> }@if (s.enRetard) { <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">En retard</span> }</div>
                <div class="text-xs text-slate-500 mb-1">Encaissé : <span class="text-emerald-600 font-semibold">{{ formatMontant(s.totalEncaisse) }} FCFA</span></div>
                @if (s.pourcentage) { <div class="text-xs text-slate-500 mb-1">Base : <span class="font-medium">{{ s.pourcentage }}% du tarif de la classe</span></div> }
                @if (s.montantAttenduTotal !== null) { <div class="text-xs text-slate-500 mb-1">Attendu : <span class="font-medium">{{ formatMontant(s.montantAttenduTotal) }} FCFA</span></div><div class="text-xs text-slate-500">Taux : <span class="font-semibold" [class]="s.tauxRecouvrement >= 80 ? 'text-emerald-600' : s.tauxRecouvrement >= 50 ? 'text-amber-500' : 'text-red-600'">{{ s.tauxRecouvrement }}%</span></div> }
                @if (s.dateLimite) { <div class="text-xs text-slate-400 mt-1">Échéance : {{ s.dateLimite | date:'dd/MM/yyyy' }}</div> }
                <div class="text-xs text-slate-400 mt-0.5">{{ s.nbPaiements }} paiement(s) · {{ s.effectifInscrits }} inscrits</div>
              </div>
            }
          </div>
        </div>
      }

      <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
        <h3 class="font-bold text-lg text-slate-900 mb-4">{{ editingVersementId() ? 'Modifier la tranche' : 'Nouvelle tranche' }}</h3>
        <form (ngSubmit)="saveVersement()" class="mb-4">
          <div class="grid grid-cols-2 md:grid-cols-12 gap-3">
            <div class="flex flex-col gap-1.5 md:col-span-1"><label class="text-xs font-semibold text-slate-700">Ordre</label><input type="number" min="1" [(ngModel)]="versementForm.ordre" name="ordre" required class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5 md:col-span-3"><label class="text-xs font-semibold text-slate-700">Libellé</label><input type="text" [(ngModel)]="versementForm.libelle" name="libelle" placeholder="ex : 1ère tranche" required class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5 md:col-span-4"><label class="text-xs font-semibold text-slate-700">Description</label><input type="text" [(ngModel)]="versementForm.description" name="description" placeholder="Optionnel" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5 md:col-span-2"><label class="text-xs font-semibold text-slate-700">Montant fixe / élève</label><input type="number" min="0" [(ngModel)]="versementForm.montantAttendu" name="montantAttendu" placeholder="Optionnel" [disabled]="!!versementForm.pourcentage" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm disabled:opacity-50" /></div>
            <div class="flex flex-col gap-1.5 md:col-span-2"><label class="text-xs font-semibold text-slate-700">% du tarif classe</label><input type="number" min="0" max="100" [(ngModel)]="versementForm.pourcentage" name="pourcentage" placeholder="ex : 40" [disabled]="!!versementForm.montantAttendu" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm disabled:opacity-50" /></div>
            <div class="flex flex-col gap-1.5 md:col-span-1"><label class="text-xs font-semibold text-slate-700">Date limite</label><input type="date" [(ngModel)]="versementForm.dateLimite" name="dateLimite" class="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5 md:col-span-1"><label class="text-xs font-semibold text-slate-700">Actif</label><label class="flex items-center h-11 cursor-pointer"><input type="checkbox" [(ngModel)]="versementForm.actif" name="actif" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/40" /></label></div>
          </div>
          <div class="text-xs text-slate-400 -mt-1 mb-2">Renseignez soit un montant fixe (identique pour tous), soit un pourcentage du tarif propre à la classe de chaque élève (recommandé si les tarifs varient par classe).</div>
          <div class="flex justify-end gap-2 mt-3">@if (editingVersementId()) { <button type="button" (click)="resetVersementForm()" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler la modification</button> }<button type="submit" [disabled]="versementSaving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">@if (versementSaving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> }{{ editingVersementId() ? 'Mettre à jour' : 'Ajouter la tranche' }}</button></div>
        </form>

        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-3 py-3 text-left font-semibold">Ordre</th><th class="px-3 py-3 text-left font-semibold">Libellé</th><th class="px-3 py-3 text-left font-semibold">Description</th><th class="px-3 py-3 text-left font-semibold">Base de calcul</th><th class="px-3 py-3 text-left font-semibold">Échéance</th><th class="px-3 py-3 text-left font-semibold">Statut</th><th class="px-3 py-3 text-left font-semibold">Paiements</th><th class="px-3 py-3 text-left font-semibold">Actions</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (v of versements(); track v.id) {
                <tr class="hover:bg-slate-50"><td class="px-3 py-3"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">{{ v.ordre }}</span></td><td class="px-3 py-3 text-slate-700">{{ v.libelle }}</td><td class="px-3 py-3 text-slate-500">{{ v.description || '—' }}</td><td class="px-3 py-3 text-slate-600">{{ v.pourcentage ? v.pourcentage + '% du tarif classe' : (v.montantAttendu ? formatMontant(v.montantAttendu) + ' FCFA/élève' : '—') }}</td><td class="px-3 py-3 text-slate-500">{{ v.dateLimite ? (v.dateLimite | date:'dd/MM/yyyy') : '—' }}</td><td class="px-3 py-3"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" [class]="v.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">{{ v.actif ? 'Ouvert' : 'Fermé' }}</span></td><td class="px-3 py-3 text-slate-600">{{ v._count?.paiements || 0 }}</td><td class="px-3 py-3"><div class="flex gap-1"><button (click)="editVersement(v)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Modifier"><span class="material-symbols-outlined text-lg">edit</span></button><button (click)="confirmDeleteVersement(v)" class="p-1.5 rounded-lg hover:bg-slate-100 text-red-500" title="Supprimer"><span class="material-symbols-outlined text-lg">delete</span></button></div></td></tr>
              } @empty {
                <tr><td colspan="8" class="text-center text-slate-400 py-6">Aucune tranche définie</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DafVersementsComponent implements OnInit {
  private http = inject(HttpClient);

  versements = signal<any[]>([]);
  versementStats = signal<any[]>([]);
  versementSaving = signal(false);
  editingVersementId = signal<string | null>(null);
  versementForm: any = { libelle: '', description: '', ordre: 1, dateLimite: null, montantAttendu: null, pourcentage: null, actif: true };

  ngOnInit() {
    this.loadVersements();
  }

  formatMontant(val: any): string {
    const n = Number(val) || 0;
    return n.toLocaleString('fr-FR');
  }

  loadVersements() {
    this.http.get<any>(`${environment.apiUrl}/daf/versements`).subscribe({ next: (d) => this.versements.set(d || []), error: () => this.versements.set([]) });
    this.http.get<any>(`${environment.apiUrl}/daf/versements/stats`).subscribe({ next: (d) => this.versementStats.set(d || []), error: () => this.versementStats.set([]) });
  }

  resetVersementForm() {
    this.editingVersementId.set(null);
    const nextOrdre = this.versements().length ? Math.max(...this.versements().map(v => v.ordre)) + 1 : 1;
    this.versementForm = { libelle: '', description: '', ordre: nextOrdre, dateLimite: null, montantAttendu: null, pourcentage: null, actif: true };
  }

  editVersement(v: any) {
    this.editingVersementId.set(v.id);
    this.versementForm = { libelle: v.libelle, description: v.description || '', ordre: v.ordre, dateLimite: v.dateLimite ? new Date(v.dateLimite) : null, montantAttendu: v.montantAttendu ?? null, pourcentage: v.pourcentage ?? null, actif: v.actif ?? true };
  }

  saveVersement() {
    if (!this.versementForm.libelle || !this.versementForm.ordre) {
      alert('Libellé et ordre sont obligatoires');
      return;
    }
    this.versementSaving.set(true);
    const id = this.editingVersementId();
    const payload: any = { ...this.versementForm };
    if (payload.dateLimite instanceof Date) {
      payload.dateLimite = payload.dateLimite.toISOString();
    }
    const req = id
      ? this.http.patch(`${environment.apiUrl}/daf/versements/${id}`, payload)
      : this.http.post(`${environment.apiUrl}/daf/versements`, payload);
    req.subscribe({
      next: () => {
        this.versementSaving.set(false);
        alert(id ? 'Versement mis à jour' : 'Versement créé');
        this.loadVersements();
        this.resetVersementForm();
      },
      error: (err) => {
        this.versementSaving.set(false);
        alert(err.error?.message || 'Erreur lors de l\'enregistrement');
      },
    });
  }

  confirmDeleteVersement(v: any) { if (confirm('Supprimer cette tranche ?')) this.deleteVersement(v); }

  deleteVersement(v: any) {
    this.http.delete(`${environment.apiUrl}/daf/versements/${v.id}`).subscribe({
      next: () => { this.loadVersements(); },
      error: (err) => alert(err.error?.message || 'Erreur lors de la suppression'),
    });
  }
}
