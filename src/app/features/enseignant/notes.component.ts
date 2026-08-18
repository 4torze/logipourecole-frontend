import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-enseignant-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1 style="margin-bottom:24px">Évaluations</h1>

      <!-- Étape 1: Sélection du devoir -->
      <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Choisir un devoir à évaluer</h3></div><div class="gs-panel-body">
        @if (loadingDevoirs()) {
          <div class="flex items-center gap-2 text-sm text-muted py-6"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement de vos devoirs...</div>
        } @else if (devoirs().length === 0) {
          <div class="text-center py-8">
            <span class="material-symbols-outlined text-3xl text-muted block mb-2">assignment</span>
            <p class="text-sm text-muted mb-4">Vous n'avez créé aucun devoir. Allez dans « Devoirs » pour en créer un, puis revenez ici pour saisir les notes.</p>
            <button (click)="goToDevoirs()" class="btn btn-primary" style="margin:0 auto">
              <span class="material-symbols-outlined" style="font-size:18px">description</span> Créer un devoir
            </button>
          </div>
        } @else {
          <select [ngModel]="selectedDevoirId()" (ngModelChange)="onDevoirChange($event)" class="input">
            <option value="">Sélectionnez un devoir…</option>
            @for (d of devoirs(); track d.id) {
              <option [value]="d.id">{{ d.titre }} — {{ d.classeNom || '' }} — {{ d.matiere?.nom || '' }}</option>
            }
          </select>

          @if (selectedDevoir()) {
            <div class="flex gap-2 flex-wrap mt-4 gs-well">
              <span class="tag tag-neutral"><strong class="mr-1">Classe :</strong> {{ selectedDevoir()?.classeNom }}</span>
              <span class="tag tag-neutral"><strong style="margin-right:4px">Matière :</strong> {{ selectedDevoir()?.matiere?.nom }}</span>
              <span class="tag tag-accent"><strong class="mr-1">Points :</strong> {{ selectedDevoir()?.points }}</span>
              <span class="tag tag-neutral"><strong style="margin-right:4px">Date limite :</strong> {{ selectedDevoir()?.dateLimite | date:'dd/MM/yyyy' }}</span>
            </div>
          }
        }
      </div></div>

      <!-- Étape 2: Saisie des notes (auto-chargée) -->
      @if (selectedDevoir()) {
        @if (loadingEtudiants()) {
          <div class="gs-panel"><div class="gs-panel-body">
            <div class="flex items-center gap-2 text-sm text-muted py-6"><span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Chargement des étudiants...</div>
          </div></div>
        } @else if (etudiants().length > 0) {
          <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Saisie des notes — {{ etudiants().length }} étudiants</h3></div><div class="gs-panel-body">
            @if (existingNotesCount() > 0) {
              <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-left:3px solid var(--color-text);background:var(--color-neutral-100);font-size:14px;margin-bottom:16px">
                <span class="material-symbols-outlined" style="font-size:18px">info</span>
                {{ existingNotesCount() }} note(s) déjà saisie(s) pour ce devoir. Les notes existantes seront mises à jour.
              </div>
            }
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div class="text-xs text-muted">Note sur {{ selectedDevoir()?.points }} — évaluation : {{ selectedDevoir()?.titre }}</div>
              <div class="flex gap-2">
                <button (click)="fillAllBlank((selectedDevoir()?.points || 20) / 2)" class="btn btn-secondary btn-sm">
                  <span class="material-symbols-outlined" style="font-size:16px">edit</span> Pré-remplir à {{ (selectedDevoir()?.points || 20) / 2 }}
                </button>
                <button (click)="clearAll()" class="btn btn-secondary btn-sm">
                  <span class="material-symbols-outlined" style="font-size:16px">backspace</span> Effacer
                </button>
              </div>
            </div>

            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr>
                    <th style="width:48px">N°</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th style="text-align:center">Note /{{ selectedDevoir()?.points }}</th>
                    <th style="text-align:center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  @for (et of etudiants(); track et.id; let i = $index) {
                    <tr>
                      <td style="color:color-mix(in srgb, var(--color-text) 45%, transparent)">{{ i + 1 }}</td>
                      <td style="font-weight:600">{{ et.nom }}</td>
                      <td>{{ et.prenom }}</td>
                      <td style="text-align:center">
                        <input type="number" min="0" [max]="selectedDevoir()?.points" step="0.25"
                          [ngModel]="notesMap()[et.id]"
                          (ngModelChange)="updateNote(et.id, $event)"
                          placeholder="—"
                          class="input" style="width:80px;text-align:center" />
                      </td>
                      <td style="text-align:center">
                        @if (notesMap()[et.id] !== null && notesMap()[et.id] !== undefined) {
                          @if (notesMap()[et.id]! >= (selectedDevoir()?.points || 20) / 2) {
                            <span class="tag tag-success">{{ notesMap()[et.id] }}</span>
                          } @else {
                            <span class="tag tag-danger">{{ notesMap()[et.id] }}</span>
                          }
                        } @else {
                          <span class="tag tag-neutral">N/A</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px solid var(--color-divider);flex-wrap:wrap;gap:12px">
              <div style="display:flex;gap:24px;font-size:14px">
                <div><span style="color:color-mix(in srgb, var(--color-text) 55%, transparent)">Notes saisies :</span> <strong>{{ notesSaisies() }} / {{ etudiants().length }}</strong></div>
                <div><span style="color:color-mix(in srgb, var(--color-text) 55%, transparent)">Moyenne :</span> <strong>{{ moyenneClasse() }}</strong></div>
              </div>
              <div style="display:flex;align-items:center;gap:12px">
                @if (savedSuccess()) {
                  <span class="tag tag-success"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:-2px">check_circle</span> Notes enregistrées</span>
                }
                @if (errorMessage()) {
                  <span class="tag tag-danger"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:-2px">error</span> {{ errorMessage() }}</span>
                }
                <button (click)="saveNotes()" [disabled]="saving() || notesSaisies() === 0" class="btn btn-primary">
                  @if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> }
                  Enregistrer ({{ notesSaisies() }} notes)
                </button>
              </div>
            </div>
          </div></div>
        } @else {
          <div class="gs-panel"><div class="gs-panel-body">
            <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">group_off</span>
            Aucun étudiant inscrit dans cette classe pour l'année active.
          </div></div>
        }
      }
    </div>
  `,
})
export class EnseignantNotesComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private router = inject(Router);

  devoirs = signal<any[]>([]);
  etudiants = signal<any[]>([]);
  saving = signal(false);
  savedSuccess = signal(false);
  loadingDevoirs = signal(false);
  loadingEtudiants = signal(false);
  errorMessage = signal('');
  existingNotesCount = signal(0);

  notesMap = signal<Record<string, number | null>>({});

  selectedDevoirId = signal('');

  selectedDevoir = computed(() => this.devoirs().find(d => d.id === this.selectedDevoirId()) || null);

  ngOnInit() { this.loadDevoirs(); }

  updateNote(etudiantId: string, value: number | null) {
    this.notesMap.update(map => ({ ...map, [etudiantId]: value }));
  }

  notesSaisies() {
    const nm = this.notesMap();
    return this.etudiants().filter(et => nm[et.id] !== null && nm[et.id] !== undefined).length;
  }

  moyenneClasse() {
    const nm = this.notesMap();
    const notes = this.etudiants()
      .filter(et => nm[et.id] !== null && nm[et.id] !== undefined)
      .map(et => Number(nm[et.id]));
    if (notes.length === 0) return '—';
    return (notes.reduce((s, n) => s + n, 0) / notes.length).toFixed(2);
  }

  loadDevoirs() {
    this.loadingDevoirs.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/enseignant/affectations`).subscribe({
      next: (affectations) => {
        if (!affectations || affectations.length === 0) {
          this.loadingDevoirs.set(false);
          this.alertService.warning('Vous n\'avez aucune classe affectée');
          return;
        }
        let allDevoirs: any[] = [];
        let pending = affectations.length;
        for (const aff of affectations) {
          const classeId = aff.classe.id;
          this.http.get<any[]>(`${environment.apiUrl}/devoirs/classe/${classeId}`).subscribe({
            next: (devoirs) => {
              const enriched = (devoirs || []).map((d: any) => ({
                ...d,
                classeNom: aff.classe.nom,
                classeId: classeId,
              }));
              allDevoirs = [...allDevoirs, ...enriched];
              pending--;
              if (pending === 0) {
                allDevoirs.sort((a, b) => new Date(b.dateLimite).getTime() - new Date(a.dateLimite).getTime());
                this.devoirs.set(allDevoirs);
                this.loadingDevoirs.set(false);
              }
            },
            error: () => {
              pending--;
              if (pending === 0) {
                allDevoirs.sort((a, b) => new Date(b.dateLimite).getTime() - new Date(a.dateLimite).getTime());
                this.devoirs.set(allDevoirs);
                this.loadingDevoirs.set(false);
              }
            },
          });
        }
      },
      error: (err: any) => {
        this.loadingDevoirs.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur chargement affectations';
        this.alertService.error(msg);
      },
    });
  }

  onDevoirChange(devoirId: string) {
    this.selectedDevoirId.set(devoirId || '');
    const devoir = this.selectedDevoir();
    if (!devoir) {
      this.etudiants.set([]);
      return;
    }
    this.loadingEtudiants.set(true);
    this.errorMessage.set('');
    this.http.get<any[]>(`${environment.apiUrl}/enseignant/classe/${devoir.classeId}/etudiants`).subscribe({
      next: (d) => {
        this.etudiants.set(d);
        const map: Record<string, number | null> = {};
        for (const et of d) map[et.id] = null;
        this.notesMap.set(map);
        this.existingNotesCount.set(0);
        this.loadingEtudiants.set(false);
        if (d.length === 0) {
          this.alertService.warning('Aucun étudiant inscrit dans cette classe');
          return;
        }
        // Pré-charger les notes existantes pour ce devoir
        this.http.get<any[]>(`${environment.apiUrl}/notes/devoir/${devoir.id}`).subscribe({
          next: (existingNotes) => {
            const count = (existingNotes || []).length;
            if (count > 0) {
              this.existingNotesCount.set(count);
              this.alertService.info(`${count} note(s) déjà saisie(s) pour ce devoir. Vous pouvez les modifier.`);
              const updatedMap = { ...this.notesMap() };
              for (const n of existingNotes || []) {
                if (updatedMap[n.etudiantId] !== undefined) {
                  updatedMap[n.etudiantId] = n.note;
                }
              }
              this.notesMap.set(updatedMap);
            }
          },
          error: () => {},
        });
      },
      error: (err: any) => {
        this.loadingEtudiants.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur chargement étudiants';
        this.alertService.error(msg);
      },
    });
  }

  fillAllBlank(value: number) {
    const map = { ...this.notesMap() };
    for (const et of this.etudiants()) {
      if (map[et.id] === null || map[et.id] === undefined) {
        map[et.id] = value;
      }
    }
    this.notesMap.set(map);
  }

  clearAll() {
    const map: Record<string, number | null> = {};
    for (const et of this.etudiants()) {
      map[et.id] = null;
    }
    this.notesMap.set(map);
  }

  async saveNotes() {
    const devoir = this.selectedDevoir();
    if (!devoir) return;
    const nm = this.notesMap();
    const notes = this.etudiants()
      .filter((et) => nm[et.id] !== null && nm[et.id] !== undefined)
      .map((et) => ({ etudiantId: et.id, note: Number(nm[et.id]) }));
    if (notes.length === 0) {
      this.errorMessage.set('Aucune note saisie');
      return;
    }

    const doSave = () => {
      this.saving.set(true); this.savedSuccess.set(false); this.errorMessage.set('');
      this.http.post(`${environment.apiUrl}/notes/bulk`, {
        matiereId: devoir.matiere?.id,
        classeId: devoir.classeId,
        periodeId: devoir.periodeId || undefined,
        typeEvaluation: 'devoir',
        devoirId: devoir.id,
        notes,
      }).subscribe({
        next: () => {
          this.saving.set(false);
          this.savedSuccess.set(true);
          this.existingNotesCount.set(notes.length);
          this.alertService.success(`${notes.length} note(s) enregistrée(s)`);
          setTimeout(() => this.savedSuccess.set(false), 3000);
        },
        error: (err: any) => {
          this.saving.set(false);
          const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur enregistrement';
          this.errorMessage.set(msg);
        },
      });
    };

    if (this.existingNotesCount() > 0) {
      const ok = await this.alertService.confirm({
        title: 'Confirmer la mise à jour',
        text: `${this.existingNotesCount()} note(s) existante(s) pour ce devoir. Voulez-vous les mettre à jour ?`,
        confirmText: 'Mettre à jour',
      });
      if (ok) doSave();
    } else {
      doSave();
    }
  }

  goToDevoirs() {
    this.router.navigate(['/enseignant/devoirs']);
  }
}
