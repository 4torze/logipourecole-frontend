import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .mark { display:flex; align-items:center; justify-content:center; background:var(--color-accent); color:var(--color-bg); font-family:var(--font-heading); font-weight:800; flex:none; }
    .demo-chip { border:1px solid var(--color-divider); background:transparent; font-family:var(--font-body); font-size:12px; padding:6px 12px; cursor:pointer; color:var(--color-text); }
    .demo-chip:hover { border-color:var(--color-accent); color:var(--color-accent-700); }
    .login-input { position:relative; }
    .login-input input { padding-left:38px; }
    .login-input .ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none; display:flex; }
    .eye-btn { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:color-mix(in srgb, var(--color-text) 55%, transparent); display:flex; }
    .eye-btn:hover { color:var(--color-accent); }
  `],
  template: `
    <div style="min-height:100vh;background:var(--color-bg);color:var(--color-text);font-family:var(--font-body);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px">

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:36px">
        <div class="mark" style="width:40px;height:40px;font-size:18px">R</div>
        <span style="font-family:var(--font-heading);font-weight:800;font-size:20px;letter-spacing:-0.015em">RANIAG</span>
      </div>

      <div style="width:100%;max-width:420px;border:1px solid var(--color-divider);background:var(--color-surface);box-shadow:var(--shadow-md)">
        <div style="padding:32px 32px 0 32px;text-align:left">
          <h2 style="margin:0 0 6px">Connexion</h2>
          <p style="margin:0 0 24px;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Accédez à votre espace de gestion</p>
        </div>

        @if (error()) {
          <div style="margin:0 32px 16px;padding:12px 14px;border-left:3px solid var(--color-accent);background:var(--color-accent-100);font-size:13px;color:var(--color-accent-800);display:flex;gap:8px">
            <span>{{ error() }}</span>
          </div>
        }

        @if (needs2fa()) {
          <div style="margin:0 32px 16px;padding:12px 14px;border-left:3px solid var(--color-text);background:var(--color-neutral-100);font-size:13px">
            Veuillez saisir votre code 2FA
          </div>
        }

        <form (ngSubmit)="onSubmit()" style="padding:0 32px 32px;display:flex;flex-direction:column;gap:16px">
          <div class="field">
            <label for="login-email">Email</label>
            <div class="login-input">
              <span class="ico"><span class="material-symbols-outlined" style="font-size:18px">mail</span></span>
              <input id="login-email" type="email" class="input" placeholder="vous@ecole.edu" [(ngModel)]="email" name="email" required autocomplete="email" />
            </div>
          </div>

          <div class="field">
            <label for="login-password">Mot de passe</label>
            <div class="login-input">
              <span class="ico"><span class="material-symbols-outlined" style="font-size:18px">lock</span></span>
              <input id="login-password" [type]="hidePassword ? 'password' : 'text'" class="input" style="padding-right:38px" placeholder="Votre mot de passe" [(ngModel)]="motDePasse" name="motDePasse" required autocomplete="current-password" />
              <button type="button" class="eye-btn" (click)="hidePassword = !hidePassword" aria-label="Afficher le mot de passe">
                <span class="material-symbols-outlined" style="font-size:18px">{{ hidePassword ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          </div>

          @if (needs2fa()) {
            <div class="field">
              <label for="login-2fa">Code 2FA</label>
              <input id="login-2fa" class="input" style="text-align:center;letter-spacing:6px;font-weight:600" maxlength="6" inputmode="numeric" placeholder="123456" [(ngModel)]="code2fa" name="code2fa" />
            </div>
          }

          <button type="submit" class="btn btn-primary btn-block" style="justify-content:center;height:44px" [disabled]="loading()">
            {{ loading() ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="hr" style="margin:0"></div>

        <div style="padding:24px 32px 32px">
          <span style="display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:12px">Comptes de démonstration</span>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <button type="button" class="demo-chip" (click)="fillDemo('superadmin@logipourecole.com', 'superadmin123')">Super Admin</button>
            <button type="button" class="demo-chip" (click)="fillDemo('dg@central.edu', 'password123')">DG</button>
            <button type="button" class="demo-chip" (click)="fillDemo('daf@central.edu', 'password123')">DAF</button>
            <button type="button" class="demo-chip" (click)="fillDemo('enseignant1@central.edu', 'password123')">Enseignant</button>
            <button type="button" class="demo-chip" (click)="fillDemo('dsi@central.edu', 'password123')">DSI</button>
            <button type="button" class="demo-chip" (click)="fillDemo('secretaire@central.edu', 'password123')">Secrétaire</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  motDePasse = '';
  code2fa = '';
  hidePassword = true;
  loading = signal(false);
  error = signal('');
  needs2fa = signal(false);

  fillDemo(email: string, mdp: string) {
    this.email = email;
    this.motDePasse = mdp;
  }

  async onSubmit() {
    this.error.set('');
    this.loading.set(true);
    this.authService.login(this.email, this.motDePasse, this.code2fa || undefined).subscribe({
      next: (res) => {
        if (res.requires2fa) {
          this.needs2fa.set(true);
          this.loading.set(false);
          return;
        }
        if (res.user?.mustChangePassword) {
          this.router.navigate(['/changer-mot-de-passe']);
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur de connexion');
        this.loading.set(false);
      },
    });
  }
}
