import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
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
  imports: [
    CommonModule, FormsModule,
    NzCardModule, NzButtonModule, NzInputModule, NzFormModule, NzSelectModule,
    NzAlertModule, NzGridModule, NzIconModule,
  ],
  template: `
    <div class="page-container" style="max-width:800px;">
      <nz-card style="padding: 16px;">
        <h1 class="page-title" style="text-align:center;">Inscription en ligne</h1>
        <p style="text-align:center; color:#6b7280; margin-bottom:24px;">Remplissez ce formulaire pour soumettre votre candidature</p>

        @if (success()) {
          <nz-alert nzType="success" [nzMessage]="success()" nzShowIcon style="margin-bottom:16px;"></nz-alert>
        }
        @if (error()) {
          <nz-alert nzType="error" [nzMessage]="error()" nzShowIcon style="margin-bottom:16px;"></nz-alert>
        }

        <form (ngSubmit)="onSubmit()">
          <div nz-row [nzGutter]="[16, 16]">
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label nzRequired>Nom</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.nom" name="nom" required /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label nzRequired>Prénom</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.prenom" name="prenom" required /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label>Date de naissance</nz-form-label><nz-form-control><input nz-input type="date" [(ngModel)]="form.dateNaissance" name="dateNaissance" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label>Lieu de naissance</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.lieuNaissance" name="lieuNaissance" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label>Sexe</nz-form-label><nz-form-control>
              <nz-select [(ngModel)]="form.sexe" name="sexe" style="width:100%;">
                <nz-option nzValue="M" nzLabel="Masculin"></nz-option>
                <nz-option nzValue="F" nzLabel="Féminin"></nz-option>
              </nz-select>
            </nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label>Téléphone</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.telephone" name="telephone" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24"><nz-form-item><nz-form-label>Email</nz-form-label><nz-form-control><input nz-input type="email" [(ngModel)]="form.email" name="email" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24"><nz-form-item><nz-form-label>Lieu d'habitation</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.lieuHabitation" name="lieuHabitation" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label>Nom du parent/tuteur</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.contactParentNom" name="contactParentNom" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label>Téléphone parent/tuteur</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.contactParentTelephone" name="contactParentTelephone" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label>Matricule BAC</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.matriculeBac" name="matriculeBac" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24" [nzSm]="12"><nz-form-item><nz-form-label>Année BAC</nz-form-label><nz-form-control><input nz-input [(ngModel)]="form.anneeBac" name="anneeBac" placeholder="ex: 2023" /></nz-form-control></nz-form-item></div>
            <div nz-col [nzXs]="24"><nz-form-item><nz-form-label nzRequired>Classe souhaitée</nz-form-label><nz-form-control>
              <nz-select [(ngModel)]="form.classeId" name="classeId" nzPlaceHolder="Sélectionner" style="width:100%;" required>
                @for (classe of classes(); track classe.id) { <nz-option [nzValue]="classe.id" [nzLabel]="classe.nom + ' (' + classe.niveau + ')'"></nz-option> }
              </nz-select>
            </nz-form-control></nz-form-item></div>
          </div>

          <button nz-button nzType="primary" nzSize="large" nzBlock type="submit" [disabled]="loading()" style="margin-top:8px;">
            @if (loading()) { <span nz-icon nzType="loading"></span> } Soumettre ma candidature
          </button>
        </form>
      </nz-card>
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
