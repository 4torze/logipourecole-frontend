import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--color-bg);padding:24px">
      <div style="width:100%;max-width:440px;background:var(--color-surface);border:1px solid var(--color-divider);padding:36px">
        <div style="text-align:center;margin-bottom:28px">
          <div style="width:52px;height:52px;margin:0 auto;background:var(--color-accent-100);border:1px solid var(--color-accent-200);display:flex;align-items:center;justify-content:center">
            <span class="material-symbols-outlined" style="font-size:26px;color:var(--color-accent)">password</span>
          </div>
          <h2 style="font-size:24px;margin:14px 0 0">Changement de mot de passe</h2>
          @if (isMandatory()) {
            <p style="font-size:14px;margin:4px 0 0" class="text-muted">
              Pour des raisons de sécurité, vous devez changer le mot de passe temporaire qui vous a été communiqué avant de continuer.
            </p>
          } @else {
            <p style="font-size:14px;margin:4px 0 0" class="text-muted">Choisissez un nouveau mot de passe.</p>
          }
        </div>

        @if (error()) {
          <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;margin-bottom:16px;background:var(--color-accent-100);border:1px solid var(--color-accent-200);color:var(--color-accent-800);font-size:14px">
            <span class="material-symbols-outlined" style="font-size:18px">error</span>
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" style="display:flex;flex-direction:column;gap:16px">
          <div class="field">
            <label for="current-password">Mot de passe actuel</label>
            <input
              id="current-password"
              type="password"
              [(ngModel)]="motDePasseActuel"
              name="motDePasseActuel"
              required
              autocomplete="current-password"
              class="input"
            />
          </div>

          <div class="field">
            <label for="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
              type="password"
              [(ngModel)]="nouveauMotDePasse"
              name="nouveauMotDePasse"
              required
              minlength="6"
              autocomplete="new-password"
              placeholder="Min. 6 caractères"
              class="input"
            />
          </div>

          <div class="field">
            <label for="confirm-password">Confirmer le nouveau mot de passe</label>
            <input
              id="confirm-password"
              type="password"
              [(ngModel)]="confirmation"
              name="confirmation"
              required
              autocomplete="new-password"
              class="input"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="btn btn-primary btn-block"
            style="justify-content:center"
          >
            @if (loading()) {
              <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span>
              Enregistrement...
            } @else {
              Changer le mot de passe
            }
          </button>

          @if (!isMandatory()) {
            <button type="button" (click)="cancel()" class="btn btn-secondary btn-block" style="justify-content:center;margin-top:0">
              Annuler
            </button>
          }
        </form>
      </div>
    </div>
  `,
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  motDePasseActuel = '';
  nouveauMotDePasse = '';
  confirmation = '';
  loading = signal(false);
  error = signal('');

  isMandatory() {
    return !!this.authService.currentUser()?.mustChangePassword;
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }

  onSubmit() {
    this.error.set('');
    if (this.nouveauMotDePasse.length < 6) {
      this.error.set('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (this.nouveauMotDePasse !== this.confirmation) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }
    this.loading.set(true);
    this.authService.changePassword(this.motDePasseActuel, this.nouveauMotDePasse).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur lors du changement de mot de passe');
      },
    });
  }
}
