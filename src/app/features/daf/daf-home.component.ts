import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-daf-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-[1440px] mx-auto">
      <div class="flex items-center gap-4 mb-7 p-6 bg-white rounded-xl border border-slate-200 shadow-card">
        <div class="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">DAF</div>
        <div class="flex-1"><h1 class="text-xl font-semibold text-slate-900 m-0">Direction Administrative et Financière</h1><div class="text-sm text-slate-500 mt-0.5">{{ auth.currentUser()?.ecole?.nom || '—' }} &middot; Exercice {{ perf()?.anneeScolaire || '—' }}</div></div>
        <div class="px-3 py-1 bg-blue-50 text-blue-900 rounded text-xs font-semibold tracking-wide">DAF</div>
      </div>

      <div class="flex gap-4 mb-6 flex-wrap">
        <div class="flex-1 min-w-[200px] p-6 bg-white rounded-xl border border-slate-200 shadow-card flex flex-col gap-2">
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Taux recouvrement</div>
          <div class="text-3xl font-bold text-slate-900 leading-tight">{{ perf()?.tauxRecouvrement || 0 }}<span class="text-sm font-normal text-slate-400">%</span></div>
          <div class="h-1 bg-slate-100 rounded mt-1 overflow-hidden"><div class="h-full rounded bg-emerald-600 transition-all duration-700" [style.width.%]="perf()?.tauxRecouvrement || 0"></div></div>
        </div>
        <div class="flex-1 min-w-[200px] p-6 bg-white rounded-xl border border-slate-200 shadow-card flex flex-col gap-2">
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Encaissé</div>
          <div class="text-3xl font-bold text-slate-900 leading-tight">{{ formatMontant(perf()?.montantTotalEncaisse) }}<span class="text-sm font-normal text-slate-400"> FCFA</span></div>
        </div>
        <div class="flex-1 min-w-[200px] p-6 bg-white rounded-xl border border-slate-200 shadow-card flex flex-col gap-2">
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Restant à recouvrer</div>
          <div class="text-3xl font-bold text-red-600 leading-tight">{{ formatMontant(perf()?.montantTotalRestant) }}<span class="text-sm font-normal text-slate-400"> FCFA</span></div>
        </div>
      </div>

      <div class="flex gap-4 mb-6 flex-wrap">
        <div class="flex-1 min-w-[280px] bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <h3 class="text-base font-semibold text-slate-900 m-0 mb-1">Objectif: Recouvrement</h3>
          <div class="text-sm text-slate-500 mb-5">Suivi des scolarités pour l'année en cours</div>
          <div class="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"><div class="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0"></div><div class="flex-1 text-sm text-slate-700">Étudiants en règle</div><div class="text-lg font-bold text-emerald-600">{{ perf()?.effectifEnRegle || 0 }}</div></div>
          <div class="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"><div class="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></div><div class="flex-1 text-sm text-slate-700">Étudiants en retard</div><div class="text-lg font-bold text-red-600">{{ perf()?.effectifQuiDoivent || 0 }}</div></div>
          <div class="flex items-center gap-3 py-3"><div class="w-2 h-2 rounded-full bg-blue-900 flex-shrink-0"></div><div class="flex-1 text-sm text-slate-700">Total inscrits</div><div class="text-lg font-bold text-slate-900">{{ (perf()?.effectifEnRegle || 0) + (perf()?.effectifQuiDoivent || 0) }}</div></div>
        </div>
        <div class="flex-1 min-w-[280px] bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <h3 class="text-base font-semibold text-slate-900 m-0 mb-1">Actions rapides</h3>
          <div class="text-sm text-slate-500 mb-5">Accès direct aux tâches fréquentes</div>
          <div (click)="openPaiementForm()" class="flex items-center gap-3 p-3.5 border border-slate-200 rounded-lg mb-2.5 cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-all bg-white">
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-900 flex-shrink-0"><span class="material-symbols-outlined text-xl">payments</span></div>
            <div class="flex-1"><div class="text-sm font-medium text-slate-900">Enregistrer un paiement</div><div class="text-xs text-slate-400 mt-0.5">Nouveau versement étudiant</div></div>
          </div>
          <div (click)="openEtudiantForm()" class="flex items-center gap-3 p-3.5 border border-slate-200 rounded-lg mb-2.5 cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-all bg-white">
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-900 flex-shrink-0"><span class="material-symbols-outlined text-xl">person_add</span></div>
            <div class="flex-1"><div class="text-sm font-medium text-slate-900">Enregistrer un élève</div><div class="text-xs text-slate-400 mt-0.5">Nouveau dossier administratif</div></div>
          </div>
          <div routerLink="/daf/versements" class="flex items-center gap-3 p-3.5 border border-slate-200 rounded-lg mb-2.5 cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-all bg-white">
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-900 flex-shrink-0"><span class="material-symbols-outlined text-xl">view_column</span></div>
            <div class="flex-1"><div class="text-sm font-medium text-slate-900">Gérer les versements</div><div class="text-xs text-slate-400 mt-0.5">Configurer les tranches de paiement</div></div>
          </div>
        </div>
      </div>
    </div>

    @if (showPaiementForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showPaiementForm.set(false)">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-[680px] mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">Enregistrer un paiement</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showPaiementForm.set(false)"><span class="material-symbols-outlined">close</span></button></div>
          <form (ngSubmit)="createPaiement()" class="p-6 space-y-4">
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Étudiant</label><select [(ngModel)]="newPaiement.etudiantId" name="etudiantId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" required><option value="">Rechercher un étudiant</option>@for (e of etudiants(); track e.id) { <option [value]="e.id">{{ e.prenom }} {{ e.nom }} ({{ e.classeNom || '' }})</option> }</select></div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Montant (FCFA)</label><input type="number" [(ngModel)]="newPaiement.montant" name="montant" required class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Mode</label><select [(ngModel)]="newPaiement.mode" name="mode" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="ESPECES">Espèces</option><option value="MOBILE_MONEY">Mobile Money</option><option value="VIREMENT">Virement</option><option value="CHEQUE">Chèque</option></select></div>
            </div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Versement</label><select [(ngModel)]="newPaiement.versementId" name="versementId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Choisir la tranche</option>@for (v of versements(); track v.id) { <option [value]="v.id">{{ v.ordre }} — {{ v.libelle }}</option> }</select>@if (versements().length === 0) { <div class="text-xs text-slate-400 mt-1.5">Aucune tranche configurée — utilisez « Gérer les versements » pour en créer.</div> }</div>
            <div class="flex justify-end gap-2"><button type="button" (click)="showPaiementForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button><button type="submit" [disabled]="saving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } Enregistrer le paiement</button></div>
            @if (paiementSuccess()) { <div class="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800"><span class="material-symbols-outlined text-lg">check_circle</span> Paiement enregistré — Reçu N° {{ paiementSuccess() }}</div> }
            @if (paiementError()) { <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"><span class="material-symbols-outlined text-lg">error</span> {{ paiementError() }}</div> }
          </form>
        </div>
      </div>
    }

    @if (showEtudiantForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showEtudiantForm.set(false)">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-[720px] mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">Enregistrer un élève</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showEtudiantForm.set(false)"><span class="material-symbols-outlined">close</span></button></div>
          <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Nom</label><input type="text" [(ngModel)]="newEtudiant.nom" placeholder="Nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Prénom</label><input type="text" [(ngModel)]="newEtudiant.prenom" placeholder="Prénom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Date de naissance</label><input type="date" [(ngModel)]="newEtudiant.dateNaissance" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Lieu de naissance</label><input type="text" [(ngModel)]="newEtudiant.lieuNaissance" placeholder="Lieu" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Sexe</label><select [(ngModel)]="newEtudiant.sexe" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Sexe</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Téléphone</label><input type="text" [(ngModel)]="newEtudiant.telephone" placeholder="Téléphone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Email</label><input type="email" [(ngModel)]="newEtudiant.email" placeholder="Email" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Contact parent</label><input type="text" [(ngModel)]="newEtudiant.contactParentNom" placeholder="Nom du parent" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Tél. parent</label><input type="text" [(ngModel)]="newEtudiant.contactParentTelephone" placeholder="Téléphone parent" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Matricule BAC</label><input type="text" [(ngModel)]="newEtudiant.matriculeBac" placeholder="Matricule" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
            <div class="col-span-full flex gap-2 mt-2"><button (click)="createEtudiant()" [disabled]="etudiantSaving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">@if (etudiantSaving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-lg">save</span> } Enregistrer</button><button (click)="showEtudiantForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
            @if (etudiantSuccess()) { <div class="col-span-full flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800"><span class="material-symbols-outlined text-lg">check_circle</span> {{ etudiantSuccess() }}</div> }
            @if (etudiantError()) { <div class="col-span-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"><span class="material-symbols-outlined text-lg">error</span> {{ etudiantError() }}</div> }
          </div>
        </div>
      </div>
    }

  `,
})
export class DafHomeComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  showPaiementForm = signal(false);
  versements = signal<any[]>([]);
  perf = signal<any>(null);
  tableauFinancier = signal<any[]>([]);
  tableLoading = signal(false);
  etudiants = signal<any[]>([]);
  classes = signal<any[]>([]);
  annees = signal<any[]>([]);
  saving = signal(false);
  relanceLoading = signal(false);
  relanceId = signal<string | null>(null);
  paiementSuccess = signal('');
  paiementError = signal('');
  searchEtudiant = signal('');

  filters: any = { classeId: null, anneeScolaireId: null, statutPaiement: null, versementId: null, search: '' };
  private searchTimeout: any = null;

  showEtudiantForm = signal(false);
  etudiantSaving = signal(false);
  etudiantSuccess = signal('');
  etudiantError = signal('');
  newEtudiant: any = { nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '', telephone: '', email: '', contactParentNom: '', contactParentTelephone: '', matriculeBac: '' };

  newPaiement: any = { etudiantId: '', montant: 0, mode: 'ESPECES', versementId: null };

  ngOnInit() { this.loadPerf(); this.loadEtudiants(); this.loadVersements(); }

  formatMontant(val: any): string {
    const n = Number(val) || 0;
    return n.toLocaleString('fr-FR');
  }

  loadVersements() {
    this.http.get<any>(`${environment.apiUrl}/daf/versements`).subscribe({ next: (d) => this.versements.set(d || []), error: () => this.versements.set([]) });
  }

  loadPerf() { this.http.get<any>(`${environment.apiUrl}/daf/performance`).subscribe({ next: (d) => this.perf.set(d), error: () => this.perf.set(null) }); }
  
  loadTableau() {
    this.tableLoading.set(true);
    const params: string[] = [];
    if (this.filters.classeId) params.push(`classeId=${this.filters.classeId}`);
    if (this.filters.anneeScolaireId) params.push(`anneeScolaireId=${this.filters.anneeScolaireId}`);
    if (this.filters.statutPaiement) params.push(`statutPaiement=${this.filters.statutPaiement}`);
    if (this.filters.versementId) params.push(`versementId=${this.filters.versementId}`);
    if (this.filters.search) params.push(`search=${encodeURIComponent(this.filters.search)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    this.http.get<any>(`${environment.apiUrl}/daf/tableau-financier${qs}`).subscribe({
      next: (res) => { this.tableauFinancier.set(res.data || []); this.tableLoading.set(false); },
      error: () => { this.tableauFinancier.set([]); this.tableLoading.set(false); },
    });
  }

  loadClasses() {
    this.http.get<any>(`${environment.apiUrl}/daf/classes`).subscribe({
      next: (d) => this.classes.set(d || []),
      error: () => this.classes.set([]),
    });
  }

  loadAnnees() {
    this.http.get<any>(`${environment.apiUrl}/daf/annees-scolaires`).subscribe({
      next: (d) => this.annees.set(d || []),
      error: () => this.annees.set([]),
    });
  }

  onSearchChange(value: string) {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadTableau(), 400);
  }

  loadEtudiants() {
    this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({
      next: (res) => this.etudiants.set(res.data || res || []),
      error: () => this.etudiants.set([]),
    });
  }

  filterEtudiant(e: any): boolean {
    const s = this.searchEtudiant().toLowerCase();
    if (!s) return true;
    return (e.nom + ' ' + e.prenom + ' ' + (e.classeNom || '')).toLowerCase().includes(s);
  }

  openPaiementForm() {
    this.paiementSuccess.set('');
    this.paiementError.set('');
    this.showPaiementForm.set(true);
  }

  openEtudiantForm() {
    this.newEtudiant = { nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '', telephone: '', email: '', contactParentNom: '', contactParentTelephone: '', matriculeBac: '' };
    this.etudiantSuccess.set('');
    this.etudiantError.set('');
    this.showEtudiantForm.set(true);
  }

  createEtudiant() {
    const d = this.newEtudiant;
    if (!d.nom || !d.prenom) {
      this.etudiantError.set('Nom et prénom sont obligatoires');
      return;
    }
    this.etudiantSaving.set(true);
    this.etudiantSuccess.set('');
    this.etudiantError.set('');
    this.http.post(`${environment.apiUrl}/etudiants`, d).subscribe({
      next: () => {
        this.etudiantSaving.set(false);
        this.etudiantSuccess.set('Élève enregistré avec succès');
        this.loadEtudiants();
        setTimeout(() => this.showEtudiantForm.set(false), 2000);
      },
      error: (err) => {
        this.etudiantSaving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur lors de l\'enregistrement';
        this.etudiantError.set(msg);
      },
    });
  }

  createPaiement() {
    this.saving.set(true); this.paiementSuccess.set(''); this.paiementError.set('');
    this.http.post<any>(`${environment.apiUrl}/daf/paiements`, this.newPaiement).subscribe({
      next: (res) => {
        this.paiementSuccess.set(res.numeroRecu);
        this.saving.set(false);
        this.loadPerf(); this.loadTableau();
        this.newPaiement = { etudiantId: '', montant: 0, mode: 'ESPECES', versementId: null };
      },
      error: (err) => {
        this.saving.set(false);
        this.paiementError.set(err.error?.message || 'Erreur lors de l\'enregistrement du paiement');
      },
    });
  }

  downloadRecu(v: any) {
    if (!v?.id) return;
    this.http.get(`${environment.apiUrl}/daf/paiements/recu/${v.id}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-${v.numeroRecu || v.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => alert('Erreur lors du téléchargement du reçu'),
    });
  }

  relanceEtudiant(etudiantId: string) {
    this.relanceId.set(etudiantId);
    this.http.post<any>(`${environment.apiUrl}/daf/relance-sms`, { etudiantId }).subscribe({
      next: (res) => { this.relanceId.set(null); alert(res.message || 'Relance envoyée'); },
      error: (err) => { this.relanceId.set(null); alert(err.error?.message || 'Erreur relance'); },
    });
  }

  relanceGroupee() {
    this.relanceLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/daf/relance-groupee`, {}).subscribe({
      next: (res) => { this.relanceLoading.set(false); alert(res.message || 'Relances envoyées'); },
      error: (err) => { this.relanceLoading.set(false); alert(err.error?.message || 'Erreur relance groupée'); },
    });
  }
}
