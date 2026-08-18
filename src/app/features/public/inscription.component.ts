import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

function getSubdomain(): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const parts = host.split('.');
  if (host === 'localhost' || parts.length < 2) return 'central';
  return parts[0];
}

@Component({
  selector: 'app-public-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-bg-light py-10 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="gs-panel">
          <div class="gs-panel-body">
            <h1 style="font-size:22px;font-weight:800;text-align:center;margin:0 0 4px">Inscription en ligne</h1>
            <p style="font-size:13px;text-align:center;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0 0 24px">Remplissez ce formulaire pour soumettre votre candidature</p>

            @if (success()) {
              <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-left:3px solid var(--color-accent);background:var(--color-accent-100);color:var(--color-accent-800);font-size:14px;margin-bottom:20px">
                <span class="material-symbols-outlined" style="font-size:18px">check_circle</span> {{ success() }}
              </div>
            }
            @if (error()) {
              <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-left:3px solid var(--color-text);background:var(--color-neutral-100);font-size:14px;margin-bottom:20px">
                <span class="material-symbols-outlined" style="font-size:18px">error</span> {{ error() }}
              </div>
            }

            <form (ngSubmit)="onSubmit()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Nom <span style="color:var(--color-accent-700)">*</span></label><input type="text" [(ngModel)]="form.nom" name="nom" required class="input" /></div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Prénom <span style="color:var(--color-accent-700)">*</span></label><input type="text" [(ngModel)]="form.prenom" name="prenom" required class="input" /></div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Date de naissance</label><input type="date" [(ngModel)]="form.dateNaissance" name="dateNaissance" class="input" /></div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Lieu de naissance</label><input type="text" [(ngModel)]="form.lieuNaissance" name="lieuNaissance" class="input" /></div>
              <div class="flex flex-col gap-1.5">
                <label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Sexe</label>
                <select [(ngModel)]="form.sexe" name="sexe" class="input">
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Téléphone</label><input type="text" [(ngModel)]="form.telephone" name="telephone" class="input" /></div>
              <div class="flex flex-col gap-1.5 sm:col-span-2"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Email</label><input type="email" [(ngModel)]="form.email" name="email" class="input" /></div>
              <div class="flex flex-col gap-1.5 sm:col-span-2"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Lieu d'habitation</label><input type="text" [(ngModel)]="form.lieuHabitation" name="lieuHabitation" class="input" /></div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Nom du parent/tuteur</label><input type="text" [(ngModel)]="form.contactParentNom" name="contactParentNom" class="input" /></div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Téléphone parent/tuteur</label><input type="text" [(ngModel)]="form.contactParentTelephone" name="contactParentTelephone" class="input" /></div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Matricule BAC</label><input type="text" [(ngModel)]="form.matriculeBac" name="matriculeBac" class="input" /></div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Année BAC</label><input type="text" [(ngModel)]="form.anneeBac" name="anneeBac" placeholder="ex : 2023" class="input" /></div>
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Classe souhaitée <span style="color:var(--color-accent-700)">*</span></label>
                <select [(ngModel)]="form.classeId" name="classeId" required class="input">
                  <option value="" disabled>Sélectionner…</option>
                  @for (classe of classes(); track classe.id) { <option [value]="classe.id">{{ classe.nom }} ({{ classe.niveau }})</option> }
                </select>
              </div>

              <button type="submit" [disabled]="loading()" class="btn btn-primary sm:col-span-2" style="justify-content:center;height:48px;margin-top:8px">
                @if (loading()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } Soumettre ma candidature
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PublicInscriptionComponent implements OnInit {
  private http = inject(HttpClient);

  ecoleId = signal('');
  classes = signal<any[]>([]);
  loading = signal(false);
  success = signal('');
  error = signal('');

  form: any = {
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '',
    telephone: '', email: '', lieuHabitation: '', contactParentNom: '',
    contactParentTelephone: '', matriculeBac: '', matriculeMesrs: '',
    numeroTableBac: '', anneeBac: '', classeId: '',
  };

  ngOnInit() { this.resolveEcoleId(); }

  private resolveEcoleId() {
    const subdomain = getSubdomain();
    this.http.get<any>(`${environment.apiUrl}/public/ecoles/by-subdomain/${subdomain}`).subscribe({
      next: (ecole) => {
        this.ecoleId.set(ecole.id);
        this.loadClasses();
      },
      error: () => { this.ecoleId.set(''); this.classes.set([]); },
    });
  }

  loadClasses() {
    if (!this.ecoleId()) { this.classes.set([]); return; }
    this.http.get<any>(`${environment.apiUrl}/public/brochure/${this.ecoleId()}`).subscribe({
      next: (d) => this.classes.set(d.classes || []),
      error: () => { this.classes.set([]); },
    });
  }

  onSubmit() {
    if (!this.ecoleId()) { this.error.set('École introuvable'); return; }
    this.loading.set(true); this.success.set(''); this.error.set('');
    this.http.post(`${environment.apiUrl}/public/inscription/${this.ecoleId()}`, this.form).subscribe({
      next: () => { this.success.set('Votre candidature a été soumise avec succès ! Nous vous contacterons bientôt.'); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Erreur lors de la soumission'); this.loading.set(false); },
    });
  }
}
