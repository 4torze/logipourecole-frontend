import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-screen">
      <!-- Left brand panel -->
      <div class="hidden lg:flex flex-1 items-center justify-center p-10" style="background: linear-gradient(135deg, #431407 0%, #9a3412 55%, #f98006 100%);">
        <div class="text-center text-white max-w-md">
          <div class="w-18 h-18 mx-auto rounded-2xl bg-white/14 border border-white/25 flex items-center justify-center">
            <span class="material-symbols-outlined text-white" style="font-size: 36px;">menu_book</span>
          </div>
          <h1 class="text-3xl font-extrabold mt-5 tracking-tight">LogiPourEcole</h1>
          <p class="text-base opacity-85 mb-9">SaaS de Gestion Scolaire Multi-Établissements</p>
          <div class="flex flex-col gap-3 text-left">
            <div class="flex items-center gap-3 text-sm bg-white/8 border border-white/14 px-4 py-3 rounded-xl">
              <span class="material-symbols-outlined text-orange-300 text-lg">check_circle</span>
              Gestion des étudiants &amp; classes
            </div>
            <div class="flex items-center gap-3 text-sm bg-white/8 border border-white/14 px-4 py-3 rounded-xl">
              <span class="material-symbols-outlined text-orange-300 text-lg">check_circle</span>
              Notes, bulletins &amp; paiements
            </div>
            <div class="flex items-center gap-3 text-sm bg-white/8 border border-white/14 px-4 py-3 rounded-xl">
              <span class="material-symbols-outlined text-orange-300 text-lg">check_circle</span>
              Tableaux de bord en temps réel
            </div>
          </div>
        </div>
      </div>

      <!-- Right login form -->
      <div class="w-full lg:w-[520px] min-h-screen flex items-center justify-center bg-bg-light p-6 lg:p-10">
        <div class="w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-xl p-9">
          <!-- Header -->
          <div class="text-center mb-7">
            <div class="w-13 h-13 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary" style="font-size: 26px;">verified_user</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mt-3.5">Connexion</h2>
            <p class="text-sm text-slate-500 mt-1">Accédez à votre espace de gestion</p>
          </div>

          <!-- Error alert -->
          @if (error()) {
            <div class="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <span class="material-symbols-outlined text-lg">error</span>
              {{ error() }}
            </div>
          }

          <!-- 2FA info -->
          @if (needs2fa()) {
            <div class="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm">
              <span class="material-symbols-outlined text-lg">info</span>
              Veuillez saisir votre code 2FA
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-700" for="login-email">Email</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">mail</span>
                <input
                  id="login-email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="vous@ecole.edu"
                  autocomplete="email"
                  class="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-700" for="login-password">Mot de passe</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">lock</span>
                <input
                  id="login-password"
                  [type]="hidePassword ? 'password' : 'text'"
                  [(ngModel)]="motDePasse"
                  name="motDePasse"
                  required
                  placeholder="Votre mot de passe"
                  autocomplete="current-password"
                  class="w-full h-12 pl-10 pr-10 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400"
                />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors" (click)="hidePassword = !hidePassword">
                  <span class="material-symbols-outlined text-xl">{{ hidePassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- 2FA code -->
            @if (needs2fa()) {
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-700" for="login-2fa">Code 2FA</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">safety</span>
                  <input
                    id="login-2fa"
                    [(ngModel)]="code2fa"
                    name="code2fa"
                    placeholder="123456"
                    maxlength="6"
                    inputmode="numeric"
                    class="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm text-center font-semibold tracking-[6px] placeholder:text-slate-400 placeholder:tracking-normal"
                  />
                </div>
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loading()"
              class="h-11 mt-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
            >
              @if (loading()) {
                <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                Connexion...
              } @else {
                Se connecter
              }
            </button>
          </form>

          <!-- Demo accounts -->
          <div class="mt-7 pt-5 border-t border-slate-100 text-center">
            <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Comptes de démonstration</span>
            <div class="flex flex-wrap gap-2 justify-center">
              <button class="border border-slate-200 bg-slate-50 text-slate-600 text-xs px-3.5 py-1.5 rounded-full cursor-pointer hover:border-primary hover:text-primary hover:bg-orange-50 transition-all" (click)="fillDemo('superadmin@logipourecole.com', 'superadmin123')">Super Admin</button>
              <button class="border border-slate-200 bg-slate-50 text-slate-600 text-xs px-3.5 py-1.5 rounded-full cursor-pointer hover:border-primary hover:text-primary hover:bg-orange-50 transition-all" (click)="fillDemo('dg@central.edu', 'password123')">DG</button>
              <button class="border border-slate-200 bg-slate-50 text-slate-600 text-xs px-3.5 py-1.5 rounded-full cursor-pointer hover:border-primary hover:text-primary hover:bg-orange-50 transition-all" (click)="fillDemo('daf@central.edu', 'password123')">DAF</button>
              <button class="border border-slate-200 bg-slate-50 text-slate-600 text-xs px-3.5 py-1.5 rounded-full cursor-pointer hover:border-primary hover:text-primary hover:bg-orange-50 transition-all" (click)="fillDemo('enseignant1@central.edu', 'password123')">Enseignant</button>
              <button class="border border-slate-200 bg-slate-50 text-slate-600 text-xs px-3.5 py-1.5 rounded-full cursor-pointer hover:border-primary hover:text-primary hover:bg-orange-50 transition-all" (click)="fillDemo('dsi@central.edu', 'password123')">DSI</button>
            </div>
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
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur de connexion');
        this.loading.set(false);
      },
    });
  }
}
