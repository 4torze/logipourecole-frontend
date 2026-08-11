import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  statut: 'ACTIF' | 'INACTIF';
}

@Component({
  selector: 'app-dg-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page-container">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
        <button (click)="openForm()" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm">
          <span class="material-symbols-outlined text-xl">person_add</span> Ajouter un utilisateur
        </button>
      </div>

      @if (showForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showForm.set(false)">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-900">Créer un utilisateur</h3>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showForm.set(false)"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="p-6 grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Nom</label><input type="text" [(ngModel)]="form.nom" placeholder="Nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Prénom</label><input type="text" [(ngModel)]="form.prenom" placeholder="Prénom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Email</label><input type="email" [(ngModel)]="form.email" placeholder="Email" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Téléphone</label><input type="text" [(ngModel)]="form.telephone" placeholder="Téléphone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Rôle</label><select [(ngModel)]="form.role" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="DG">Directeur Général</option><option value="DAF">DAF (Finances)</option><!-- <option value="ETUDES">Direction des Études</option> --><option value="DSI">DSI</option><!-- <option value="SECRETAIRE">Secrétariat</option> --><!-- <option value="MARKETING">Marketing</option> --><option value="ENSEIGNANT">Enseignant</option><!-- <option value="ETUDIANT">Étudiant</option> --></select></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Mot de passe</label><input type="password" [(ngModel)]="form.motDePasse" placeholder="Min 6 caractères" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="col-span-2 flex gap-3 mt-2"><button (click)="createUser()" [disabled]="saving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-lg">save</span> } Créer</button><button (click)="showForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
            </div>
          </div>
        </div>
      }

      @if (showEditForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showEditForm.set(false)">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-900">Modifier l'utilisateur</h3>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showEditForm.set(false)"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="p-6 grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Nom</label><input type="text" [(ngModel)]="editForm.nom" placeholder="Nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Prénom</label><input type="text" [(ngModel)]="editForm.prenom" placeholder="Prénom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Email</label><input type="email" [value]="editForm.email" disabled class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-100 outline-none text-sm text-slate-500" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Téléphone</label><input type="text" [(ngModel)]="editForm.telephone" placeholder="Téléphone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Rôle</label><select [(ngModel)]="editForm.role" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="DG">Directeur Général</option><option value="DAF">DAF (Finances)</option><!-- <option value="ETUDES">Direction des Études</option> --><option value="DSI">DSI</option><!-- <option value="SECRETAIRE">Secrétariat</option> --><!-- <option value="MARKETING">Marketing</option> --><option value="ENSEIGNANT">Enseignant</option><!-- <option value="ETUDIANT">Étudiant</option> --></select></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Statut</label><select [(ngModel)]="editForm.statut" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="ACTIF">Actif</option><option value="INACTIF">Bloqué</option></select></div>
              <div class="col-span-2 flex gap-3 mt-2"><button (click)="updateUser()" [disabled]="editSaving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">@if (editSaving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-lg">save</span> } Enregistrer</button><button (click)="showEditForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
            </div>
          </div>
        </div>
      }

      <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Email</th><th class="px-4 py-3 text-left font-semibold">Rôle</th><th class="px-4 py-3 text-left font-semibold">Statut</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (u of pagedUsers(); track u.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-slate-700">{{ u.prenom }} {{ u.nom }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{{ u.role }}</span></td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="u.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'">{{ u.statut === 'ACTIF' ? 'Actif' : 'Bloqué' }}</span></td>
                  <td class="px-4 py-3"><div class="flex items-center gap-2"><button (click)="editUser(u)" class="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"><span class="material-symbols-outlined text-base">edit</span>Modifier</button><button (click)="toggle(u)" [disabled]="loadingId() === u.id" class="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium" [class]="u.statut === 'ACTIF' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'"><span class="material-symbols-outlined text-base">{{ u.statut === 'ACTIF' ? 'lock' : 'lock_open' }}</span>{{ u.statut === 'ACTIF' ? 'Bloquer' : 'Débloquer' }}</button></div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="usersPage()" [pageSize]="pageSize" [totalItems]="users().length" (pageChange)="usersPage.set($event)"></app-pagination>
      </div>
    </div>
  `,
})
export class DgUsersComponent implements OnInit {
  private http = inject(HttpClient);

  users = signal<User[]>([]);
  pageSize = 10;
  usersPage = signal(1);
  pagedUsers = computed(() => {
    const start = (this.usersPage() - 1) * this.pageSize;
    return this.users().slice(start, start + this.pageSize);
  });
  loadingId = signal<string | null>(null);
  showForm = signal(false);
  saving = signal(false);
  form = { nom: '', prenom: '', email: '', telephone: '', role: 'ENSEIGNANT', motDePasse: '' };
  showEditForm = signal(false);
  editSaving = signal(false);
  editForm = { id: '', nom: '', prenom: '', email: '', telephone: '', role: 'ENSEIGNANT', statut: 'ACTIF' as string };

  ngOnInit() { this.load(); }

  openForm() {
    this.form = { nom: '', prenom: '', email: '', telephone: '', role: 'ENSEIGNANT', motDePasse: '' };
    this.showForm.set(true);
  }

  createUser() {
    const d = this.form;
    if (!d.nom || !d.prenom || !d.email || !d.motDePasse || !d.role) {
      alert('Tous les champs obligatoires doivent être remplis');
      return;
    }
    if (d.motDePasse.length < 6) {
      alert('Mot de passe minimum 6 caractères');
      return;
    }
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/users`, d).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        alert('Utilisateur créé avec succès');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur création utilisateur';
        alert(msg);
      },
    });
  }

  editUser(u: User) {
    this.editForm = { id: u.id, nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone || '', role: u.role, statut: u.statut };
    this.showEditForm.set(true);
  }

  updateUser() {
    const d = this.editForm;
    if (!d.nom || !d.prenom) {
      alert('Le nom et le prénom sont obligatoires');
      return;
    }
    this.editSaving.set(true);
    this.http.patch(`${environment.apiUrl}/users/${d.id}`, {
      nom: d.nom,
      prenom: d.prenom,
      telephone: d.telephone || undefined,
      role: d.role,
      statut: d.statut,
    }).subscribe({
      next: () => {
        this.editSaving.set(false);
        this.showEditForm.set(false);
        alert('Utilisateur modifié avec succès');
        this.load();
      },
      error: (err) => {
        this.editSaving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur modification utilisateur';
        alert(msg);
      },
    });
  }

  load() {
    this.http.get<{ data: User[] }>(`${environment.apiUrl}/users?limit=1000`)
      .subscribe({
        next: (res) => this.users.set(res.data || []),
        error: () => alert('Erreur chargement utilisateurs'),
      });
  }

  toggle(u: User) {
    const nextStatut = u.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    this.loadingId.set(u.id);
    this.http.patch(`${environment.apiUrl}/users/${u.id}/statut`, { statut: nextStatut })
      .subscribe({
        next: () => {
          this.loadingId.set(null);
          alert(`Utilisateur ${nextStatut === 'ACTIF' ? 'débloqué' : 'bloqué'}`);
          this.load();
        },
        error: (err) => {
          this.loadingId.set(null);
          alert(err.error?.message || 'Erreur mise à jour');
        },
      });
  }
}
