import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { RoleUtilisateur } from '../../core/models';
import { environment } from '../../../environments/environment';

type PresenceStatut = 'PRESENT' | 'ABSENCE' | 'RETARD' | 'DEPART_ANTICIPE';
type StatutAffiche = 'A_RENSEIGNER' | 'RESPECTEE' | 'NON_RESPECTEE';

interface EleveLigne {
  id: string;
  nom: string;
  prenom: string;
  statut: PresenceStatut;
  motif: string | null;
}

interface SeanceDetail {
  emploiDuTempsId: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  matiere: { id: string; nom: string };
  classe: { id: string; nom: string };
  salle?: { nom: string } | null;
  enseignant: { id: string; nom: string; prenom: string };
  seanceId: string | null;
  statut: 'PLANIFIE' | 'EFFECTUE' | 'ANNULE';
  statutAffiche: StatutAffiche;
  contenu: string;
  observations: string;
  infosPedagogiques: string;
  professeurAbsent: boolean;
  motifAbsence: string | null;
  justificatifUrl: string | null;
  eleves: EleveLigne[];
  devoirs: { id: string; titre: string; dateLimite: string; points: number }[];
  appreciations: { id: string; contenu: string; createdAt: string; auteurId: string; auteurRole: string; auteur: { nom: string; prenom: string } }[];
}

@Component({
  selector: 'app-seance-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <button (click)="goBack()" class="btn btn-ghost" style="padding-left:0;margin-bottom:12px">
        <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span> Retour
      </button>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:24px 0">
          <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement…
        </div>
      }
      @if (!loading() && detail(); as d) {
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <h1 style="margin:0">{{ dateLabel() }}</h1>
            <p style="margin:4px 0 0;font-size:14px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">{{ d.heureDebut }} – {{ d.heureFin }} · {{ d.matiere?.nom }} · {{ d.classe?.nom }}</p>
          </div>
          <span class="tag" [class]="statutClass(d.statutAffiche)">{{ statutLabel(d.statutAffiche) }}</span>
        </div>

        <div class="gs-well" style="margin-bottom:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
          <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Matière</div><div style="font-size:14px;font-weight:600">{{ d.matiere?.nom }}</div></div>
          <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Classe</div><div style="font-size:14px;font-weight:600">{{ d.classe?.nom }}</div></div>
          <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Enseignant</div><div style="font-size:14px;font-weight:600">{{ d.enseignant?.prenom }} {{ d.enseignant?.nom }}</div></div>
          <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Salle</div><div style="font-size:14px;font-weight:600">{{ d.salle?.nom || '—' }}</div></div>
        </div>

        <div style="display:flex;flex-direction:column;gap:20px">

          <!-- Compte-rendu -->
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Compte-rendu de la séance</h3></div>
            <div class="gs-panel-body">
              @if (canEditSeance()) {
                <div style="display:flex;flex-direction:column;gap:14px">
                  <div class="field">
                    <label>Statut</label>
                    <select [(ngModel)]="form.statut" class="input">
                      <option value="PLANIFIE">Planifié</option>
                      <option value="EFFECTUE">Effectué</option>
                      <option value="ANNULE">Annulé</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Contenu / activité réalisée</label>
                    <textarea [(ngModel)]="form.contenu" rows="3" placeholder="Décrivez ce qui a été fait en classe…" class="input" style="resize:none"></textarea>
                  </div>
                  <div class="field">
                    <label>Informations pédagogiques</label>
                    <textarea [(ngModel)]="form.infosPedagogiques" rows="3" placeholder="Chapitre du programme, ressources utilisées…" class="input" style="resize:none"></textarea>
                  </div>
                  <div class="field">
                    <label>Observations</label>
                    <textarea [(ngModel)]="form.observations" rows="2" placeholder="Remarques générales…" class="input" style="resize:none"></textarea>
                  </div>
                </div>
              } @else {
                <div style="display:flex;flex-direction:column;gap:12px;font-size:14px">
                  <div><strong>Contenu :</strong> {{ d.contenu || '—' }}</div>
                  <div><strong>Informations pédagogiques :</strong> {{ d.infosPedagogiques || '—' }}</div>
                  <div><strong>Observations :</strong> {{ d.observations || '—' }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Absence professeur -->
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Absence du professeur</h3></div>
            <div class="gs-panel-body">
              @if (canEditSeance()) {
                <label style="display:flex;align-items:center;gap:8px;font-size:14px;margin-bottom:12px">
                  <input type="checkbox" [(ngModel)]="form.professeurAbsent" style="width:18px;height:18px;accent-color:var(--color-accent)" />
                  Je suis absent(e) pour cette séance
                </label>
                @if (form.professeurAbsent) {
                  <div style="display:flex;flex-direction:column;gap:12px;padding-left:26px">
                    <div class="field">
                      <label>Motif <span style="color:var(--color-accent-700)">*</span></label>
                      <input type="text" [(ngModel)]="form.motifAbsence" placeholder="Ex : Maladie" class="input" />
                      @if (!form.motifAbsence?.trim()) {
                        <p style="font-size:11px;color:var(--color-accent-700);margin:4px 0 0">Le motif est obligatoire.</p>
                      }
                    </div>
                    <div class="field">
                      <label>Justificatif (optionnel)</label>
                      <input type="file" accept="application/pdf,image/*" (change)="onJustificatifSelect($event)" class="input" style="padding:6px" />
                      @if (uploadingJustificatif()) { <p style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:4px 0 0">Envoi en cours…</p> }
                      @if (form.justificatifUrl) {
                        <a [href]="fileUrl(form.justificatifUrl)" target="_blank" style="font-size:12px;display:inline-flex;align-items:center;gap:4px;margin-top:6px">
                          <span class="material-symbols-outlined" style="font-size:16px">attach_file</span> Justificatif joint
                        </a>
                      }
                    </div>
                  </div>
                }
              } @else if (d.professeurAbsent) {
                <div style="font-size:14px;display:flex;flex-direction:column;gap:6px">
                  <span class="tag tag-danger" style="width:fit-content">Enseignant absent</span>
                  <div><strong>Motif :</strong> {{ d.motifAbsence || '—' }}</div>
                  @if (d.justificatifUrl) {
                    <a [href]="fileUrl(d.justificatifUrl)" target="_blank" style="font-size:13px;display:inline-flex;align-items:center;gap:4px">
                      <span class="material-symbols-outlined" style="font-size:16px">attach_file</span> Voir le justificatif
                    </a>
                  }
                </div>
              } @else {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Le professeur n'a pas déclaré d'absence pour cette séance.</p>
              }
            </div>
          </div>

          @if (canEditSeance()) {
            <button (click)="saveAll()" [disabled]="saving() || !canSave()" class="btn btn-primary" style="align-self:flex-start">
              @if (saving()) { <span class="material-symbols-outlined text-sm animate-spin" style="font-size:16px">progress_activity</span> }
              Enregistrer la séance
            </button>
          }

          <!-- Élèves -->
          <div class="gs-panel">
            <div class="gs-panel-head">
              <h3 style="margin:0;font-size:16px">Élèves ({{ d.eleves.length }})</h3>
              @if (canEditSeance()) {
                <div style="display:flex;gap:8px">
                  <button (click)="setAllPresent()" class="btn btn-secondary btn-sm">Tous présents</button>
                  <button (click)="setAllAbsent()" class="btn btn-secondary btn-sm">Tous absents</button>
                </div>
              }
            </div>
            <div class="gs-panel-body">
              @if (d.eleves.length === 0) {
                <div class="table-empty">Aucun élève inscrit dans cette classe.</div>
              } @else {
                <div class="table-scroll">
                  <table class="table">
                    <thead>
                      <tr><th>Élève</th><th style="text-align:center;width:90px">Présent</th><th style="text-align:center;width:90px">Absent</th><th style="text-align:center;width:90px">Retard</th><th>Remarque</th></tr>
                    </thead>
                    <tbody>
                      @for (et of d.eleves; track et.id) {
                        <tr>
                          <td style="font-weight:600">{{ et.nom }} {{ et.prenom }}</td>
                          @if (canEditSeance()) {
                            <td style="text-align:center"><input type="radio" [name]="'statut-' + et.id" value="PRESENT" [ngModel]="presenceMap()[et.id]" (ngModelChange)="setPresence(et.id, $event)" style="width:16px;height:16px;accent-color:var(--color-accent)"></td>
                            <td style="text-align:center"><input type="radio" [name]="'statut-' + et.id" value="ABSENCE" [ngModel]="presenceMap()[et.id]" (ngModelChange)="setPresence(et.id, $event)" style="width:16px;height:16px;accent-color:var(--color-accent)"></td>
                            <td style="text-align:center"><input type="radio" [name]="'statut-' + et.id" value="RETARD" [ngModel]="presenceMap()[et.id]" (ngModelChange)="setPresence(et.id, $event)" style="width:16px;height:16px;accent-color:var(--color-accent)"></td>
                            <td><input type="text" [ngModel]="motifMap()[et.id] || ''" (ngModelChange)="setMotif(et.id, $event)" placeholder="Remarque…" class="input" style="height:32px;padding:0 8px;font-size:12px" /></td>
                          } @else {
                            <td style="text-align:center">@if (presenceMap()[et.id] === 'PRESENT') { <span class="material-symbols-outlined" style="font-size:18px;color:#1a7a3f">check</span> }</td>
                            <td style="text-align:center">@if (presenceMap()[et.id] === 'ABSENCE') { <span class="material-symbols-outlined" style="font-size:18px;color:var(--color-accent-700)">check</span> }</td>
                            <td style="text-align:center">@if (presenceMap()[et.id] === 'RETARD') { <span class="material-symbols-outlined" style="font-size:18px;color:var(--color-accent)">check</span> }</td>
                            <td style="font-size:13px">{{ motifMap()[et.id] || '—' }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>

          <!-- Devoir -->
          <div class="gs-panel">
            <div class="gs-panel-head">
              <h3 style="margin:0;font-size:16px">Devoirs</h3>
              @if (canEditSeance() && !showDevoirForm()) {
                <button (click)="showDevoirForm.set(true)" class="btn btn-secondary btn-sm">
                  <span class="material-symbols-outlined" style="font-size:16px">add</span> Ajouter un devoir
                </button>
              }
            </div>
            <div class="gs-panel-body">
              @if (canEditSeance() && showDevoirForm()) {
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                  <div class="field" style="grid-column:span 2"><label>Titre</label><input type="text" [(ngModel)]="devoirForm.titre" class="input" /></div>
                  <div class="field" style="grid-column:span 2"><label>Description</label><textarea [(ngModel)]="devoirForm.description" rows="2" class="input" style="resize:none"></textarea></div>
                  <div class="field"><label>Date limite</label><input type="datetime-local" [(ngModel)]="devoirForm.dateLimite" class="input" /></div>
                  <div class="field"><label>Points</label><input type="number" [(ngModel)]="devoirForm.points" class="input" /></div>
                  <div style="grid-column:span 2;display:flex;gap:8px">
                    <button (click)="addDevoir()" [disabled]="savingDevoir()" class="btn btn-primary btn-sm">Enregistrer le devoir</button>
                    <button (click)="showDevoirForm.set(false)" class="btn btn-secondary btn-sm">Annuler</button>
                  </div>
                </div>
              }
              @if (d.devoirs.length === 0) {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0">Aucun devoir associé à cette séance.</p>
              } @else {
                <div style="display:flex;flex-direction:column;gap:8px">
                  @for (dev of d.devoirs; track dev.id) {
                    <div style="display:flex;justify-content:space-between;font-size:14px;padding:8px 0;border-bottom:1px solid var(--color-divider)">
                      <span>{{ dev.titre }}</span>
                      <span style="color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ dev.dateLimite | date:'dd/MM/yyyy' }} · {{ dev.points }} pts</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Appréciations -->
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Appréciations ({{ d.appreciations.length }})</h3></div>
            <div class="gs-panel-body">
              @if (d.appreciations.length === 0) {
                <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:0 0 12px">Aucune appréciation pour l'instant.</p>
              } @else {
                <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
                  @for (a of d.appreciations; track a.id) {
                    <div class="gs-well">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:8px">
                        <div style="display:flex;align-items:center;gap:8px">
                          <strong style="font-size:13px">{{ a.auteur?.prenom }} {{ a.auteur?.nom }}</strong>
                          <span class="tag tag-neutral">{{ a.auteurRole }}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px">
                          <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ a.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                          @if (a.auteurId === authService.currentUser()?.id) {
                            <button (click)="removeAppreciation(a.id)" class="btn btn-icon btn-danger" style="width:24px;height:24px"><span class="material-symbols-outlined" style="font-size:14px">delete</span></button>
                          }
                        </div>
                      </div>
                      <p style="font-size:14px;margin:0">{{ a.contenu }}</p>
                    </div>
                  }
                </div>
              }
              @if (canAppreciate()) {
                <div class="field">
                  <label>Ajouter une appréciation</label>
                  <textarea [(ngModel)]="newAppreciation" rows="2" placeholder="Ex : Séance correctement réalisée. Bonne progression sur le programme." class="input" style="resize:none"></textarea>
                </div>
                <button (click)="addAppreciation()" [disabled]="savingAppreciation() || !newAppreciation.trim()" class="btn btn-primary btn-sm" style="margin-top:8px">Ajouter l'appréciation</button>
              }
            </div>
          </div>

        </div>
      }
    </div>
  `,
})
export class SeanceDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private alertService = inject(AlertService);
  authService = inject(AuthService);

  emploiDuTempsId = '';
  date = '';

  loading = signal(true);
  saving = signal(false);
  savingDevoir = signal(false);
  savingAppreciation = signal(false);
  uploadingJustificatif = signal(false);
  showDevoirForm = signal(false);

  detail = signal<SeanceDetail | null>(null);

  form = {
    statut: 'EFFECTUE' as 'PLANIFIE' | 'EFFECTUE' | 'ANNULE',
    contenu: '',
    observations: '',
    infosPedagogiques: '',
    professeurAbsent: false,
    motifAbsence: '',
    justificatifUrl: null as string | null,
  };
  presenceMap = signal<Record<string, PresenceStatut>>({});
  motifMap = signal<Record<string, string>>({});

  devoirForm = { titre: '', description: '', dateLimite: '', points: 20 };
  newAppreciation = '';

  role = computed(() => this.authService.currentUser()?.role);
  canEditSeance = computed(() => {
    const r = this.role();
    return r === RoleUtilisateur.ENSEIGNANT || r === RoleUtilisateur.ETUDES || r === RoleUtilisateur.SUPER_ADMIN;
  });
  canAppreciate = computed(() => {
    const r = this.role();
    return r === RoleUtilisateur.DG || r === RoleUtilisateur.DSI || r === RoleUtilisateur.SUPER_ADMIN;
  });
  canSave = computed(() => !(this.form.professeurAbsent && !this.form.motifAbsence?.trim()));

  ngOnInit() {
    this.emploiDuTempsId = this.route.snapshot.paramMap.get('emploiDuTempsId') || '';
    this.date = this.route.snapshot.paramMap.get('date') || '';
    this.load();
  }

  goBack() { this.location.back(); }

  dateLabel(): string {
    const d = new Date(this.date + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  statutLabel(s: StatutAffiche): string {
    return { RESPECTEE: 'Séance respectée', NON_RESPECTEE: 'Séance non respectée', A_RENSEIGNER: 'À renseigner' }[s];
  }
  statutClass(s: StatutAffiche): string {
    return { RESPECTEE: 'tag-success', NON_RESPECTEE: 'tag-danger', A_RENSEIGNER: 'tag-neutral' }[s];
  }

  fileUrl(url: string): string {
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  private baseUrl(): string {
    return this.canEditSeance() ? `${environment.apiUrl}/enseignant/seances` : `${environment.apiUrl}/seances`;
  }

  load() {
    this.loading.set(true);
    this.http.get<SeanceDetail>(`${this.baseUrl()}/detail?emploiDuTempsId=${this.emploiDuTempsId}&date=${this.date}`).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.form = {
          statut: d.statut,
          contenu: d.contenu || '',
          observations: d.observations || '',
          infosPedagogiques: d.infosPedagogiques || '',
          professeurAbsent: d.professeurAbsent,
          motifAbsence: d.motifAbsence || '',
          justificatifUrl: d.justificatifUrl,
        };
        const pm: Record<string, PresenceStatut> = {};
        const mm: Record<string, string> = {};
        for (const e of d.eleves) {
          pm[e.id] = e.statut;
          if (e.motif) mm[e.id] = e.motif;
        }
        this.presenceMap.set(pm);
        this.motifMap.set(mm);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.alertService.error(err.error?.message || 'Erreur lors du chargement de la séance');
      },
    });
  }

  setPresence(etudiantId: string, value: PresenceStatut) {
    this.presenceMap.update((m) => ({ ...m, [etudiantId]: value }));
  }
  setMotif(etudiantId: string, value: string) {
    this.motifMap.update((m) => ({ ...m, [etudiantId]: value }));
  }
  setAllPresent() {
    const d = this.detail();
    if (!d) return;
    const map: Record<string, PresenceStatut> = {};
    for (const e of d.eleves) map[e.id] = 'PRESENT';
    this.presenceMap.set(map);
  }
  setAllAbsent() {
    const d = this.detail();
    if (!d) return;
    const map: Record<string, PresenceStatut> = {};
    for (const e of d.eleves) map[e.id] = 'ABSENCE';
    this.presenceMap.set(map);
  }

  onJustificatifSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingJustificatif.set(true);
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{ justificatifUrl: string }>(`${environment.apiUrl}/enseignant/seances/justificatif`, formData).subscribe({
      next: (res) => { this.form.justificatifUrl = res.justificatifUrl; this.uploadingJustificatif.set(false); },
      error: (err) => { this.uploadingJustificatif.set(false); this.alertService.error(err.error?.message || "Erreur lors de l'envoi du justificatif"); },
    });
  }

  saveAll() {
    if (!this.canSave()) {
      this.alertService.error("Le motif est obligatoire lorsque vous déclarez être absent à cette séance");
      return;
    }
    this.saving.set(true);
    this.http.post<any>(`${environment.apiUrl}/enseignant/seances`, {
      emploiDuTempsId: this.emploiDuTempsId,
      date: this.date,
      statut: this.form.statut,
      contenu: this.form.contenu,
      observations: this.form.observations,
      infosPedagogiques: this.form.infosPedagogiques,
      professeurAbsent: this.form.professeurAbsent,
      motifAbsence: this.form.professeurAbsent ? this.form.motifAbsence : undefined,
      justificatifUrl: this.form.professeurAbsent ? this.form.justificatifUrl ?? undefined : undefined,
    }).subscribe({
      next: (saved) => {
        const absences = Object.entries(this.presenceMap())
          .filter(([, type]) => type !== 'PRESENT')
          .map(([etudiantId, type]) => ({ etudiantId, type, motif: this.motifMap()[etudiantId] || undefined }));
        this.http.post(`${environment.apiUrl}/enseignant/seances/${saved.id}/absences`, { absences }).subscribe({
          next: () => {
            this.saving.set(false);
            this.alertService.success('Séance enregistrée');
            this.load();
          },
          error: (err) => {
            this.saving.set(false);
            this.alertService.error(err.error?.message || 'Erreur lors de l\'enregistrement des présences');
          },
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.alertService.error(err.error?.message || 'Erreur lors de l\'enregistrement de la séance');
      },
    });
  }

  addDevoir() {
    const d = this.detail();
    if (!d) return;
    if (!this.devoirForm.titre.trim() || !this.devoirForm.dateLimite) {
      this.alertService.error('Titre et date limite sont obligatoires');
      return;
    }
    this.savingDevoir.set(true);
    this.http.post(`${environment.apiUrl}/devoirs`, {
      classeId: d.classe.id,
      matiereId: d.matiere.id,
      seanceId: d.seanceId,
      titre: this.devoirForm.titre,
      description: this.devoirForm.description || undefined,
      dateLimite: this.devoirForm.dateLimite,
      points: this.devoirForm.points,
    }).subscribe({
      next: () => {
        this.savingDevoir.set(false);
        this.showDevoirForm.set(false);
        this.devoirForm = { titre: '', description: '', dateLimite: '', points: 20 };
        this.alertService.success('Devoir ajouté — les élèves de la classe ont été notifiés');
        this.load();
      },
      error: (err) => { this.savingDevoir.set(false); this.alertService.error(err.error?.message || 'Erreur lors de la création du devoir'); },
    });
  }

  addAppreciation() {
    if (!this.newAppreciation.trim()) return;
    this.savingAppreciation.set(true);
    this.http.post(`${environment.apiUrl}/seances/appreciations`, {
      emploiDuTempsId: this.emploiDuTempsId,
      date: this.date,
      contenu: this.newAppreciation.trim(),
    }).subscribe({
      next: () => {
        this.savingAppreciation.set(false);
        this.newAppreciation = '';
        this.alertService.success('Appréciation ajoutée');
        this.load();
      },
      error: (err) => { this.savingAppreciation.set(false); this.alertService.error(err.error?.message || "Erreur lors de l'ajout de l'appréciation"); },
    });
  }

  async removeAppreciation(id: string) {
    const ok = await this.alertService.confirm({ title: 'Supprimer cette appréciation ?', confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.http.delete(`${environment.apiUrl}/seances/appreciations/${id}`).subscribe({
      next: () => { this.alertService.success('Appréciation supprimée'); this.load(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur lors de la suppression'),
    });
  }
}
