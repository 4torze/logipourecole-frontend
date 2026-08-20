import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dg-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .gs-seg-btn-tab { padding:10px 16px; font-size:14px; font-weight:600; font-family:var(--font-heading); background:none; border:none; border-bottom:2px solid transparent; margin-bottom:-2px; cursor:pointer; color:color-mix(in srgb, var(--color-text) 55%, transparent); }
    .gs-seg-btn-tab.active { color:var(--color-accent); border-bottom-color:var(--color-accent); }
    .gs-seg-btn-tab:hover:not(.active) { color:var(--color-text); }
  `],
  template: `
    <div class="page-container">
      <h1 style="margin-bottom:24px">Paramètres</h1>

      <div style="display:flex;gap:4px;border-bottom:2px solid var(--color-divider);margin-bottom:24px">
        @for (t of tabs; track t.key) {
          <button (click)="activeTab.set(t.key)" class="gs-seg-btn-tab" [class.active]="activeTab() === t.key">
            {{ t.label }}
          </button>
        }
      </div>

      @if (activeTab() === 'profil') {
        <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Mes informations personnelles</h3></div><div class="gs-panel-body">
          <p style="font-size:14px;color:color-mix(in srgb, var(--color-text) 60%, transparent);margin-bottom:20px">Ces informations vous identifient sur RANIAG.</p>
          @if (profileLoading()) {
            <div class="flex items-center gap-2 text-sm text-muted py-6"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement...</div>
          } @else {
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Nom</label><input type="text" [(ngModel)]="profileForm.nom" class="input" /></div>
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Prénom</label><input type="text" [(ngModel)]="profileForm.prenom" class="input" /></div>
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Téléphone personnel</label><input type="text" [(ngModel)]="profileForm.telephone" placeholder="+221 77 000 00 00" class="input" /></div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Email</label><input type="email" [value]="authService.currentUser()?.email" disabled class="input" style="background:var(--color-neutral-200);color:color-mix(in srgb, var(--color-text) 55%, transparent)" /></div>
              </div>
              <div>
                <button (click)="saveProfile()" [disabled]="profileSaving()" class="btn btn-primary">
                  @if (profileSaving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } Enregistrer
                </button>
              </div>
            </div>
          }
        </div></div>
      }

      @if (activeTab() === 'ecole') {
        <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Informations de l'établissement</h3></div><div class="gs-panel-body">
          <p style="font-size:14px;color:color-mix(in srgb, var(--color-text) 60%, transparent);margin-bottom:20px">
            À la création de l'école, le numéro de contact affiché est celui du DG. Vous pouvez le remplacer par un autre numéro dédié à l'établissement.
          </p>
          @if (ecoleLoading()) {
            <div class="flex items-center gap-2 text-sm text-muted py-6"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement...</div>
          } @else {
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Nom de l'établissement</label><input type="text" [(ngModel)]="ecoleForm.nom" class="input" /></div>
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Numéro de contact</label><input type="text" [(ngModel)]="ecoleForm.telephone" placeholder="+221 77 000 00 00" class="input" /></div>
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Email de contact</label><input type="email" [(ngModel)]="ecoleForm.email" class="input" /></div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Adresse</label><input type="text" [(ngModel)]="ecoleForm.adresse" class="input" /></div>
                <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Site web</label><input type="text" [(ngModel)]="ecoleForm.siteWeb" placeholder="https://www.ecole.com" class="input" /></div>
              </div>
              <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Description</label><textarea rows="3" [(ngModel)]="ecoleForm.description" class="input" style="resize:vertical;min-height:90px"></textarea></div>
              <div>
                <button (click)="saveEcole()" [disabled]="ecoleSaving()" class="btn btn-primary">
                  @if (ecoleSaving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } Enregistrer
                </button>
              </div>
            </div>
          }
        </div></div>
      }

      @if (activeTab() === 'securite') {
        <div class="gs-panel"><div class="gs-panel-body">
          <div>
            <h3 style="margin-bottom:4px">Sécurité du compte</h3>
            <p style="font-size:14px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">Gérez votre mot de passe et la double authentification.</p>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border:1px solid var(--color-divider)">
            <div>
              <p style="font-size:14px;font-weight:600">Mot de passe</p>
              <p style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-top:2px">Changez régulièrement votre mot de passe pour sécuriser votre compte.</p>
            </div>
            <button (click)="goToChangePassword()" class="btn btn-secondary btn-sm">Changer</button>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border:1px solid var(--color-divider)">
            <div>
              <p style="font-size:14px;font-weight:600">Authentification à deux facteurs (2FA)</p>
              <p style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-top:2px">{{ authService.currentUser()?.deuxFaActive ? 'Activée sur votre compte.' : 'Non activée — ajoutez une couche de sécurité supplémentaire.' }}</p>
            </div>
            <span class="tag" style="flex:none" [class]="authService.currentUser()?.deuxFaActive ? 'tag-success' : 'tag-neutral'">{{ authService.currentUser()?.deuxFaActive ? 'Activée' : 'Désactivée' }}</span>
          </div>
        </div></div>
      }

      @if (activeTab() === 'notifications') {
        <div class="flex flex-col gap-6 w-full">
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Fournisseur d'envoi des emails</h3></div>
            <div class="gs-panel-body">
              <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0 0 16px">Choisissez si les emails partent du système Raniag ou de votre propre configuration SMTP.</p>
              <div class="field" style="max-width:420px">
                <label>Mode d'envoi</label>
                <select [(ngModel)]="emailForm.provider" class="input">
                  <option value="RANIAG">Mail (Raniag) — envoi par le système par défaut</option>
                  <option value="CUSTOM">Mon système — envoi par ma propre configuration SMTP</option>
                </select>
              </div>
              <div style="margin-top:16px">
                <button (click)="saveProvider()" [disabled]="providerSaving()" class="btn btn-primary">
                  @if (providerSaving()) { <span class="material-symbols-outlined" style="font-size:18px;animation:spin 1s linear infinite">progress_activity</span> } Enregistrer le choix
                </button>
              </div>
            </div>
          </div>

          <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Paramètres de notification</h3></div><div class="gs-panel-body">
            <p style="font-size:14px;color:color-mix(in srgb, var(--color-text) 60%, transparent);margin-bottom:20px">Choisissez, pour chaque type d'événement, par quel(s) canal(aux) les personnes concernées sont notifiées (en plus de la notification dans l'application, toujours active).</p>
            @if (notifConfigLoading()) {
              <div class="flex items-center gap-2 text-sm text-muted py-6"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement...</div>
            } @else {
              <div class="table-scroll">
                <table class="table">
                  <thead>
                    <tr><th>Événement</th><th style="text-align:center">Email</th><th style="text-align:center">WhatsApp</th></tr>
                  </thead>
                  <tbody>
                    @for (c of notifConfigs(); track c.typeEvenement) {
                      <tr>
                        <td style="font-weight:500">{{ c.label }}</td>
                        <td style="text-align:center"><input type="checkbox" [(ngModel)]="c.canaux.email" (ngModelChange)="saveNotifConfig(c)" style="width:20px;height:20px;accent-color:var(--color-accent);cursor:pointer" /></td>
                        <td style="text-align:center"><input type="checkbox" [(ngModel)]="c.canaux.whatsapp" (ngModelChange)="saveNotifConfig(c)" style="width:20px;height:20px;accent-color:var(--color-accent);cursor:pointer" /></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <p style="font-size:12px;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin-top:12px">Chaque canal utilise la configuration email et WhatsApp propre à votre établissement, ci-dessous.</p>
            }
          </div></div>

          <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Email professionnel (SMTP)</h3></div><div class="gs-panel-body">
            <p style="font-size:14px;color:color-mix(in srgb, var(--color-text) 60%, transparent);margin-bottom:20px">Configurez l'adresse email professionnelle de votre établissement pour l'envoi des notifications par email.</p>
            @if (emailConfigLoading()) {
              <div class="flex items-center gap-2 text-sm text-muted py-6"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement...</div>
            } @else {
              <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Hôte SMTP</label><input type="text" [(ngModel)]="emailForm.host" placeholder="smtp.hostinger.com" class="input" /></div>
                  <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Port</label><input type="number" [(ngModel)]="emailForm.port" placeholder="465" class="input" /></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Utilisateur SMTP</label><input type="text" [(ngModel)]="emailForm.user" placeholder="contact@monecole.com" class="input" /></div>
                  <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Mot de passe {{ emailConfigured() ? '(laisser vide pour conserver)' : '' }}</label><input type="password" [(ngModel)]="emailForm.pass" placeholder="••••••••" class="input" /></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Email d'expédition</label><input type="email" [(ngModel)]="emailForm.fromEmail" placeholder="contact@monecole.com" class="input" /></div>
                  <div class="flex flex-col gap-1.5"><label style="font-size:12px;font-weight:600;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Nom d'expédition</label><input type="text" [(ngModel)]="emailForm.fromName" placeholder="Mon École" class="input" /></div>
                </div>
                <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" [(ngModel)]="emailForm.secure" style="width:16px;height:16px;accent-color:var(--color-accent)" /> Connexion sécurisée (SSL/TLS — généralement activé pour le port 465)</label>
                <div style="display:flex;align-items:center;gap:8px;padding-top:8px;border-top:1px solid var(--color-divider)">
                  <button (click)="saveEmailConfig()" [disabled]="emailSaving()" class="btn btn-primary">
                    @if (emailSaving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } Enregistrer
                  </button>
                  @if (emailConfigured()) {
                    <button (click)="testEmailConfig()" [disabled]="emailTesting()" class="btn btn-secondary">
                      @if (emailTesting()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } Envoyer un test
                    </button>
                  }
                </div>
              </div>
            }
          </div></div>

          <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Connexion WhatsApp</h3></div><div class="gs-panel-body">
            <p style="font-size:14px;color:color-mix(in srgb, var(--color-text) 60%, transparent);margin-bottom:20px">Connectez le numéro WhatsApp de votre établissement pour l'envoi des notifications.</p>
            <div class="flex items-center justify-between mb-5">
              <span style="font-size:14px;font-weight:600">Statut</span>
              <span class="tag" [class]="waStatusBadgeClass()" style="gap:6px">
                <span style="width:8px;height:8px;border-radius:50%" [style.background]="waStatusDotColor()"></span>
                {{ waStatusLabel() }}
              </span>
            </div>

            @if (waStatus() === 'QR' && waQr()) {
              <div class="flex flex-col items-center gap-3 py-4">
                <img [src]="waQr()" alt="QR Code WhatsApp" style="width:224px;height:224px;border:1px solid var(--color-divider)" />
                <p style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent);text-align:center">Scannez ce code avec WhatsApp (Paramètres → Appareils connectés) sur le téléphone qui enverra les notifications.</p>
              </div>
            }

            @if (waStatus() === 'CONNECTING') {
              <div class="flex items-center justify-center gap-2 text-sm text-muted py-10"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Connexion en cours...</div>
            }

            @if (waStatus() === 'DISCONNECTED') {
              <div class="text-center py-6">
                <span class="material-symbols-outlined" style="font-size:40px;display:block;margin-bottom:8px;opacity:0.6">chat</span>
                <p style="font-size:14px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:16px">Aucune session WhatsApp active.</p>
                <button (click)="connectWhatsapp()" [disabled]="waConnecting()" class="btn btn-primary" style="margin:0 auto">
                  @if (waConnecting()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } Connecter WhatsApp
                </button>
              </div>
            }

            @if (waStatus() === 'CONNECTED') {
              <div class="text-center py-6">
                <span class="material-symbols-outlined text-4xl text-emerald-500 block mb-2">check_circle</span>
                <p style="font-size:14px;margin-bottom:16px">WhatsApp est connecté et prêt à envoyer des notifications.</p>
                <button (click)="disconnectWhatsapp()" class="btn btn-danger">Déconnecter</button>
              </div>
            }
          </div></div>
        </div>
      }
    </div>
  `,
})
export class DgParametresComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private alertService = inject(AlertService);
  authService = inject(AuthService);

  tabs = [
    { key: 'profil', label: 'Mon profil' },
    { key: 'ecole', label: 'Établissement' },
    { key: 'securite', label: 'Sécurité' },
    { key: 'notifications', label: 'Notifications' },
  ];
  activeTab = signal('profil');

  notifConfigLoading = signal(false);
  notifConfigs = signal<any[]>([]);

  profileLoading = signal(false);
  profileSaving = signal(false);
  profileForm = { nom: '', prenom: '', telephone: '' };

  ecoleLoading = signal(true);
  ecoleSaving = signal(false);
  ecoleForm: any = { nom: '', telephone: '', email: '', adresse: '', siteWeb: '', description: '' };

  ngOnInit() {
    const user = this.authService.currentUser();
    this.profileForm = { nom: user?.nom || '', prenom: user?.prenom || '', telephone: user?.telephone || '' };
    this.loadEcole();
    this.loadNotifConfigs();
    this.loadEmailConfig();
    this.loadWhatsappStatus();
  }

  ngOnDestroy() {
    this.stopWaPolling();
  }

  loadNotifConfigs() {
    this.notifConfigLoading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/notifications/config`).subscribe({
      next: (d) => { this.notifConfigs.set(d || []); this.notifConfigLoading.set(false); },
      error: () => { this.notifConfigs.set([]); this.notifConfigLoading.set(false); },
    });
  }

  saveNotifConfig(c: any) {
    this.http.post(`${environment.apiUrl}/notifications/config/${c.typeEvenement}`, { canaux: c.canaux, active: true }).subscribe({
      next: () => this.alertService.success(`Canaux mis à jour pour « ${c.label} »`),
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la mise à jour'),
    });
  }

  // --- Email professionnel (SMTP propre à l'école) ---

  emailConfigLoading = signal(false);
  emailSaving = signal(false);
  emailTesting = signal(false);
  emailConfigured = signal(false);
  emailForm: any = { provider: 'RANIAG', host: '', port: 465, secure: true, user: '', pass: '', fromEmail: '', fromName: '', active: true };

  loadEmailConfig() {
    this.emailConfigLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/notifications/config/email`).subscribe({
      next: (d) => {
        this.emailConfigured.set(!!d.configured);
        if (d.configured) {
          this.emailForm = { provider: d.provider || 'RANIAG', host: d.host, port: d.port, secure: d.secure, user: d.user, pass: '', fromEmail: d.fromEmail, fromName: d.fromName || '', active: d.active };
        }
        this.emailConfigLoading.set(false);
      },
      error: () => this.emailConfigLoading.set(false),
    });
  }

  saveEmailConfig() {
    if (!this.emailForm.host || !this.emailForm.user || !this.emailForm.fromEmail) {
      this.alertService.error('Hôte, utilisateur et email d\'expédition sont obligatoires');
      return;
    }
    if (!this.emailConfigured() && !this.emailForm.pass) {
      this.alertService.error('Le mot de passe est requis lors de la première configuration');
      return;
    }
    this.emailSaving.set(true);
    const payload = { ...this.emailForm, pass: this.emailForm.pass || undefined };
    this.http.post<any>(`${environment.apiUrl}/notifications/config/email`, payload).subscribe({
      next: () => {
        this.emailSaving.set(false);
        this.emailForm.pass = '';
        this.emailConfigured.set(true);
        this.alertService.success('Configuration email enregistrée');
      },
      error: (err) => { this.emailSaving.set(false); this.alertService.error(err.error?.message || 'Erreur lors de l\'enregistrement'); },
    });
  }

  testEmailConfig() {
    const to = this.authService.currentUser()?.email;
    if (!to) return;
    this.emailTesting.set(true);
    this.http.post<any>(`${environment.apiUrl}/notifications/config/email/test`, { to }).subscribe({
      next: (d) => {
        this.emailTesting.set(false);
        if (d.sent) this.alertService.success(`Email de test envoyé à ${to}`);
        else this.alertService.error(d.error || 'Échec de l\'envoi du test');
      },
      error: (err) => { this.emailTesting.set(false); this.alertService.error(err.error?.message || 'Erreur lors du test'); },
    });
  }

  providerSaving = signal(false);

  saveProvider() {
    const provider = this.emailForm.provider || 'RANIAG';
    this.providerSaving.set(true);
    this.http.patch<any>(`${environment.apiUrl}/notifications/config/email/provider`, { provider }).subscribe({
      next: () => {
        this.providerSaving.set(false);
        this.alertService.success(provider === 'CUSTOM' ? 'Envoi par votre propre système activé' : 'Envoi par Raniag activé');
      },
      error: (err) => { this.providerSaving.set(false); this.alertService.error(err.error?.message || 'Erreur lors de la mise à jour'); },
    });
  }

  // --- Connexion WhatsApp (propre à l'école) ---

  waStatus = signal<'DISCONNECTED' | 'CONNECTING' | 'QR' | 'CONNECTED'>('DISCONNECTED');
  waQr = signal<string | null>(null);
  waConnecting = signal(false);
  private waPollHandle: ReturnType<typeof setInterval> | null = null;

  waStatusLabel(): string {
    return { DISCONNECTED: 'Déconnecté', CONNECTING: 'Connexion...', QR: 'En attente du scan', CONNECTED: 'Connecté' }[this.waStatus()];
  }
  waStatusBadgeClass(): string {
    return {
      DISCONNECTED: 'tag-neutral',
      CONNECTING: 'tag-accent',
      QR: 'tag-accent',
      CONNECTED: 'tag-success',
    }[this.waStatus()];
  }
  waStatusDotColor(): string {
    return {
      DISCONNECTED: 'var(--color-neutral-500)',
      CONNECTING: 'var(--color-accent)',
      QR: 'var(--color-accent)',
      CONNECTED: '#1a7a3f',
    }[this.waStatus()];
  }

  loadWhatsappStatus() {
    this.http.get<any>(`${environment.apiUrl}/notifications/whatsapp/status`).subscribe({
      next: (d) => {
        this.waStatus.set(d.status);
        this.waQr.set(d.qr);
        if (d.status === 'CONNECTING' || d.status === 'QR') this.startWaPolling();
      },
      error: () => {},
    });
  }

  connectWhatsapp() {
    this.waConnecting.set(true);
    this.http.post<any>(`${environment.apiUrl}/notifications/whatsapp/connect`, {}).subscribe({
      next: (d) => {
        this.waConnecting.set(false);
        this.waStatus.set(d.status);
        this.waQr.set(d.qr);
        this.startWaPolling();
      },
      error: (err) => { this.waConnecting.set(false); this.alertService.error(err.error?.message || 'Erreur lors de la connexion'); },
    });
  }

  async disconnectWhatsapp() {
    const ok = await this.alertService.confirm({
      title: 'Déconnecter WhatsApp ?',
      text: 'Les notifications WhatsApp ne pourront plus être envoyées tant que la connexion ne sera pas rétablie.',
      confirmText: 'Déconnecter',
      danger: true,
    });
    if (!ok) return;
    this.http.post<any>(`${environment.apiUrl}/notifications/whatsapp/disconnect`, {}).subscribe({
      next: (d) => { this.waStatus.set(d.status); this.waQr.set(d.qr); this.stopWaPolling(); this.alertService.success('WhatsApp déconnecté'); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la déconnexion'),
    });
  }

  private startWaPolling() {
    if (this.waPollHandle) return;
    this.waPollHandle = setInterval(() => {
      this.http.get<any>(`${environment.apiUrl}/notifications/whatsapp/status`).subscribe({
        next: (d) => {
          this.waStatus.set(d.status);
          this.waQr.set(d.qr);
          if (d.status === 'CONNECTED' || d.status === 'DISCONNECTED') this.stopWaPolling();
        },
        error: () => {},
      });
    }, 3000);
  }

  private stopWaPolling() {
    if (this.waPollHandle) {
      clearInterval(this.waPollHandle);
      this.waPollHandle = null;
    }
  }

  saveProfile() {
    if (!this.profileForm.nom || !this.profileForm.prenom) {
      this.alertService.error('Le nom et le prénom sont obligatoires');
      return;
    }
    this.profileSaving.set(true);
    this.authService.updateProfile(this.profileForm).subscribe({
      next: () => { this.profileSaving.set(false); this.alertService.success('Profil mis à jour'); },
      error: (err) => { this.profileSaving.set(false); this.alertService.error(err.error?.message || 'Erreur lors de la mise à jour'); },
    });
  }

  loadEcole() {
    this.ecoleLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/dg/parametres`).subscribe({
      next: (d) => {
        this.ecoleForm = { nom: d.nom || '', telephone: d.telephone || '', email: d.email || '', adresse: d.adresse || '', siteWeb: d.siteWeb || '', description: d.description || '' };
        this.ecoleLoading.set(false);
      },
      error: () => { this.ecoleLoading.set(false); this.alertService.error('Erreur lors du chargement des informations de l\'école'); },
    });
  }

  saveEcole() {
    if (!this.ecoleForm.nom || !this.ecoleForm.telephone) {
      this.alertService.error("Le nom et le numéro de contact de l'établissement sont obligatoires");
      return;
    }
    this.ecoleSaving.set(true);
    this.http.patch<any>(`${environment.apiUrl}/dg/parametres/ecole`, this.ecoleForm).subscribe({
      next: () => { this.ecoleSaving.set(false); this.alertService.success('Informations de l\'établissement mises à jour'); },
      error: (err) => { this.ecoleSaving.set(false); this.alertService.error(err.error?.message || 'Erreur lors de la mise à jour'); },
    });
  }

  goToChangePassword() {
    this.router.navigate(['/changer-mot-de-passe']);
  }
}
