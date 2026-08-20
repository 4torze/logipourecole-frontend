import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { CreateUserResponse } from '../../core/models';

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
    <div class="page-container" style="display:flex;flex-direction:column;gap:24px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <h1 style="margin:0">Gestion des utilisateurs</h1>
        <button (click)="openForm()" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">person_add</span> Ajouter un utilisateur
        </button>
      </div>

      @if (showForm()) {
        <div class="dialog-backdrop" (click)="showForm.set(false)">
          <div class="dialog" style="width:min(640px,100%)" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">Créer un utilisateur</span>
              <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <p style="margin:0;font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">En tant que DG, vous pouvez créer tout type de compte : DAF, DSI, Secrétariat ou Enseignant. Un mot de passe temporaire sera généré automatiquement et affiché une seule fois : à vous de le communiquer à l'utilisateur, qui devra le changer dès sa première connexion.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="field"><label>Nom</label><input type="text" [(ngModel)]="form.nom" placeholder="Nom" class="input" /></div>
              <div class="field"><label>Prénom</label><input type="text" [(ngModel)]="form.prenom" placeholder="Prénom" class="input" /></div>
              <div class="field"><label>Email</label><input type="email" [(ngModel)]="form.email" placeholder="Email" class="input" /></div>
              <div class="field"><label>Téléphone</label><input type="text" [(ngModel)]="form.telephone" placeholder="Téléphone" class="input" /></div>
              <div class="field" style="grid-column:span 2"><label>Rôle</label><select [(ngModel)]="form.role" class="input"><option value="DAF">DAF (Finances)</option><option value="DSI">DSI</option><option value="SECRETAIRE">Secrétariat</option><option value="ENSEIGNANT">Enseignant</option><option value="ETUDES">Direction des Études</option><option value="MARKETING">Marketing</option></select></div>
            </div>
            <div class="dialog-actions">
              <button (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button (click)="createUser()" [disabled]="saving()" class="btn btn-primary">
                @if (saving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:16px">save</span> } Créer
              </button>
            </div>
          </div>
        </div>
      }

      @if (credentials(); as c) {
        <div class="dialog-backdrop">
          <div class="dialog">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">Utilisateur créé</span>
              <button class="btn btn-icon btn-secondary" (click)="credentials.set(null)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div style="border-left:3px solid var(--color-accent);background:var(--color-accent-100);color:var(--color-accent-800);padding:10px 14px;font-size:13px;display:flex;gap:8px;align-items:flex-start">
              <span class="material-symbols-outlined" style="font-size:18px">info</span>
              Ce mot de passe ne sera plus jamais affiché. Communiquez-le à l'utilisateur ; il devra le changer à sa première connexion.
            </div>
            <div class="field" style="margin:0"><label>Email</label><span style="font-size:14px">{{ c.email }}</span></div>
            <div class="field" style="margin:0">
              <label>Mot de passe temporaire</label>
              <div style="display:flex;align-items:center;gap:8px">
                <code style="flex:1;font-size:13px;font-family:monospace;border:1px solid var(--color-divider);padding:8px 10px;background:var(--color-bg)">{{ c.password }}</code>
                <button (click)="copyPassword(c.password)" class="btn btn-secondary"><span class="material-symbols-outlined" style="font-size:16px">content_copy</span>Copier</button>
              </div>
            </div>
            <div class="dialog-actions">
              <button (click)="credentials.set(null)" class="btn btn-primary">Fermer</button>
            </div>
          </div>
        </div>
      }

      @if (showEditForm()) {
        <div class="dialog-backdrop" (click)="showEditForm.set(false)">
          <div class="dialog" style="width:min(640px,100%)" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">Modifier l'utilisateur</span>
              <button class="btn btn-icon btn-secondary" (click)="showEditForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="field"><label>Nom</label><input type="text" [(ngModel)]="editForm.nom" placeholder="Nom" class="input" /></div>
              <div class="field"><label>Prénom</label><input type="text" [(ngModel)]="editForm.prenom" placeholder="Prénom" class="input" /></div>
              <div class="field"><label>Email</label><input type="email" [value]="editForm.email" disabled class="input" /></div>
              <div class="field"><label>Téléphone</label><input type="text" [(ngModel)]="editForm.telephone" placeholder="Téléphone" class="input" /></div>
              <div class="field"><label>Rôle</label><select [(ngModel)]="editForm.role" class="input"><option value="DAF">DAF (Finances)</option><option value="DSI">DSI</option><option value="SECRETAIRE">Secrétariat</option><option value="ENSEIGNANT">Enseignant</option><option value="ETUDES">Direction des Études</option><option value="MARKETING">Marketing</option></select></div>
              <div class="field"><label>Statut</label><select [(ngModel)]="editForm.statut" class="input"><option value="ACTIF">Actif</option><option value="INACTIF">Bloqué</option></select></div>
            </div>
            <div class="dialog-actions">
              <button (click)="showEditForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button (click)="updateUser()" [disabled]="editSaving()" class="btn btn-primary">
                @if (editSaving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:16px">save</span> } Enregistrer
              </button>
            </div>
          </div>
        </div>
      }

      <div class="gs-panel">
        <div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead>
                <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                @for (u of pagedUsers(); track u.id) {
                  <tr>
                    <td>{{ u.prenom }} {{ u.nom }}</td>
                    <td>{{ u.email }}</td>
                    <td><span class="tag tag-neutral">{{ u.role }}</span></td>
                    <td><span class="tag" [class]="u.statut === 'ACTIF' ? 'tag-success' : 'tag-danger'">{{ u.statut === 'ACTIF' ? 'Actif' : 'Bloqué' }}</span></td>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        <button (click)="editUser(u)" class="btn btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">edit</span>Modifier</button>
                        <button (click)="toggle(u)" [disabled]="loadingId() === u.id" class="btn" [class]="u.statut === 'ACTIF' ? 'btn-danger' : 'btn-secondary'">
                          <span class="material-symbols-outlined" style="font-size:18px">{{ u.statut === 'ACTIF' ? 'lock' : 'lock_open' }}</span>{{ u.statut === 'ACTIF' ? 'Bloquer' : 'Débloquer' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="usersPage()" [pageSize]="pageSize" [totalItems]="users().length" (pageChange)="usersPage.set($event)"></app-pagination>
        </div>
      </div>
    </div>
  `,
})
export class DgUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

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
  form = { nom: '', prenom: '', email: '', telephone: '', role: 'DAF' };
  credentials = signal<{ email: string; password: string } | null>(null);
  showEditForm = signal(false);
  editSaving = signal(false);
  editForm = { id: '', nom: '', prenom: '', email: '', telephone: '', role: 'DAF', statut: 'ACTIF' as string };

  ngOnInit() { this.load(); }

  openForm() {
    this.form = { nom: '', prenom: '', email: '', telephone: '', role: 'DAF' };
    this.showForm.set(true);
  }

  createUser() {
    const d = this.form;
    if (!d.nom || !d.prenom || !d.email || !d.role) {
      this.alertService.error('Tous les champs obligatoires doivent être remplis');
      return;
    }
    this.saving.set(true);
    this.http.post<CreateUserResponse>(`${environment.apiUrl}/users`, d).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.showForm.set(false);
        this.credentials.set({ email: res.user.email, password: res.temporaryPassword });
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur création utilisateur';
        this.alertService.error(msg);
      },
    });
  }

  copyPassword(password: string) {
    navigator.clipboard?.writeText(password);
  }

  editUser(u: User) {
    this.editForm = { id: u.id, nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone || '', role: u.role, statut: u.statut };
    this.showEditForm.set(true);
  }

  updateUser() {
    const d = this.editForm;
    if (!d.nom || !d.prenom) {
      this.alertService.error('Le nom et le prénom sont obligatoires');
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
        this.alertService.success('Utilisateur modifié avec succès');
        this.load();
      },
      error: (err) => {
        this.editSaving.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur modification utilisateur';
        this.alertService.error(msg);
      },
    });
  }

  load() {
    this.http.get<{ data: User[] }>(`${environment.apiUrl}/users?limit=1000`)
      .subscribe({
        next: (res) => this.users.set(res.data || []),
        error: () => this.alertService.error('Erreur chargement utilisateurs'),
      });
  }

  toggle(u: User) {
    const nextStatut = u.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    const doToggle = () => {
      this.loadingId.set(u.id);
      this.http.patch(`${environment.apiUrl}/users/${u.id}/statut`, { statut: nextStatut })
        .subscribe({
          next: () => {
            this.loadingId.set(null);
            this.alertService.success(`Utilisateur ${nextStatut === 'ACTIF' ? 'débloqué' : 'bloqué'}`);
            this.load();
          },
          error: (err) => {
            this.loadingId.set(null);
            this.alertService.error(err.error?.message || 'Erreur mise à jour');
          },
        });
    };

    if (nextStatut === 'INACTIF') {
      this.alertService.confirm({
        title: 'Bloquer cet utilisateur ?',
        html: `<strong>${u.prenom} ${u.nom}</strong> ne pourra plus se connecter.`,
        confirmText: 'Bloquer',
        danger: true,
      }).then((ok) => { if (ok) doToggle(); });
    } else {
      doToggle();
    }
  }
}
