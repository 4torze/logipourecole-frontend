import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-enseignant-notes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    NzCardModule, NzButtonModule, NzIconModule,
    NzSelectModule, NzTableModule, NzAlertModule, NzTagModule, NzEmptyModule,
    NzModalModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Évaluations</h1>

      <!-- Étape 1: Sélection du devoir -->
      <nz-card style="margin-bottom: 16px;" nzTitle="Choisir un devoir à évaluer">
        @if (loadingDevoirs()) {
          <div style="text-align:center; padding:20px;"><span nz-icon nzType="loading" style="font-size:24px;"></span> Chargement de vos devoirs...</div>
        } @else if (devoirs().length === 0) {
          <nz-empty nzDescription="Vous n'avez créé aucun devoir. Allez dans 'Devoirs' pour en créer un, puis revenez ici pour saisir les notes.">
            <button nz-button nzType="primary" (click)="goToDevoirs()"><span nz-icon nzType="file-text"></span> Créer un devoir</button>
          </nz-empty>
        } @else {
          <nz-select
            [ngModel]="selectedDevoirId()"
            (ngModelChange)="onDevoirChange($event)"
            nzPlaceHolder="Sélectionnez un devoir"
            style="width:100%;"
            nzSize="large"
            nzShowSearch
            nzAllowClear>
            @for (d of devoirs(); track d.id) {
              <nz-option [nzValue]="d.id" [nzLabel]="d.titre + ' — ' + (d.classeNom || '') + ' — ' + (d.matiere?.nom || '')">
              </nz-option>
            }
          </nz-select>

          @if (selectedDevoir()) {
            <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:16px; padding:12px; background:#fafafa; border-radius:8px;">
              <nz-tag nzColor="processing"><strong>Classe:</strong> {{ selectedDevoir()?.classeNom }}</nz-tag>
              <nz-tag nzColor="blue"><strong>Matière:</strong> {{ selectedDevoir()?.matiere?.nom }}</nz-tag>
              <nz-tag nzColor="gold"><strong>Points:</strong> {{ selectedDevoir()?.points }}</nz-tag>
              <nz-tag nzColor="purple"><strong>Date limite:</strong> {{ selectedDevoir()?.dateLimite | date:'dd/MM/yyyy' }}</nz-tag>
            </div>
          }
        }
      </nz-card>

      <!-- Étape 2: Saisie des notes (auto-chargée) -->
      @if (selectedDevoir()) {
        @if (loadingEtudiants()) {
          <nz-card><div style="text-align:center; padding:20px;"><span nz-icon nzType="loading" style="font-size:24px;"></span> Chargement des étudiants...</div></nz-card>
        } @else if (etudiants().length > 0) {
          <nz-card nzTitle="Saisie des notes — {{ etudiants().length }} étudiants">
            @if (existingNotesCount() > 0) {
              <nz-alert
                nzType="info"
                nzShowIcon
                nzMessage="{{ existingNotesCount() }} note(s) déjà saisie(s) pour ce devoir. Les notes existantes seront mises à jour."
                style="margin-bottom:12px;"></nz-alert>
            }
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <div style="font-size:13px; color:#6b7280;">
                Note sur {{ selectedDevoir()?.points }} — évaluation: {{ selectedDevoir()?.titre }}
              </div>
              <div style="display:flex; gap:8px;">
                <button nz-button nzSize="small" (click)="fillAllBlank((selectedDevoir()?.points || 20) / 2)"><span nz-icon nzType="edit"></span> Pré-remplir à {{ (selectedDevoir()?.points || 20) / 2 }}</button>
                <button nz-button nzSize="small" (click)="clearAll()"><span nz-icon nzType="clear"></span> Effacer</button>
              </div>
            </div>

            <nz-table #etTable [nzData]="etudiants()" [nzPageSize]="50" [nzFrontPagination]="false" nzSize="middle">
              <thead><tr>
                <th style="width:50px;">N°</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th style="width:140px; text-align:center;">Note /{{ selectedDevoir()?.points }}</th>
                <th style="width:80px; text-align:center;">Statut</th>
              </tr></thead>
              <tbody>
                @for (et of etTable.data; track et.id; let i = $index) {
                  <tr>
                    <td style="color:#9ca3af;">{{ i + 1 }}</td>
                    <td><strong>{{ et.nom }}</strong></td>
                    <td>{{ et.prenom }}</td>
                    <td style="text-align:center;">
                      <input nz-input type="number" min="0" [max]="selectedDevoir()?.points" step="0.25"
                        [ngModel]="notesMap()[et.id]"
                        (ngModelChange)="updateNote(et.id, $event)"
                        style="width:80px; text-align:center;"
                        [placeholder]="'—'" />
                    </td>
                    <td style="text-align:center;">
                      @if (notesMap()[et.id] !== null && notesMap()[et.id] !== undefined) {
                        @if (notesMap()[et.id]! >= (selectedDevoir()?.points || 20) / 2) {
                          <nz-tag nzColor="success">{{ notesMap()[et.id] }}</nz-tag>
                        } @else {
                          <nz-tag nzColor="error">{{ notesMap()[et.id] }}</nz-tag>
                        }
                      } @else {
                        <nz-tag nzColor="default">N/A</nz-tag>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </nz-table>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:16px; border-top:1px solid #e5e7eb;">
              <div style="display:flex; gap:24px;">
                <div><span style="color:#6b7280; font-size:13px;">Notes saisies:</span> <strong>{{ notesSaisies() }} / {{ etudiants().length }}</strong></div>
                <div><span style="color:#6b7280; font-size:13px;">Moyenne:</span> <strong>{{ moyenneClasse() }}</strong></div>
              </div>
              <div style="display:flex; gap:12px; align-items:center;">
                @if (savedSuccess()) {
                  <nz-alert nzType="success" nzMessage="Notes enregistrées" nzShowIcon style="display:inline-flex;"></nz-alert>
                }
                @if (errorMessage()) {
                  <nz-alert nzType="error" [nzMessage]="errorMessage()" nzShowIcon style="display:inline-flex;"></nz-alert>
                }
                <button nz-button nzType="primary" nzSize="large" (click)="saveNotes()" [disabled]="saving() || notesSaisies() === 0">
                  @if (saving()) { <span nz-icon nzType="loading"></span> }
                  <span nz-icon nzType="save"></span> Enregistrer ({{ notesSaisies() }} notes)
                </button>
              </div>
            </div>
          </nz-card>
        } @else {
          <nz-card>
            <nz-empty nzDescription="Aucun étudiant inscrit dans cette classe pour l'année active."></nz-empty>
          </nz-card>
        }
      }
    </div>
  `,
})
export class EnseignantNotesComponent implements OnInit {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private router = inject(Router);
  private modal = inject(NzModalService);

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
          this.message.warning('Vous n\'avez aucune classe affectée');
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
        this.message.error(msg);
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
          this.message.warning('Aucun étudiant inscrit dans cette classe');
          return;
        }
        // Pré-charger les notes existantes pour ce devoir
        this.http.get<any[]>(`${environment.apiUrl}/notes/devoir/${devoir.id}`).subscribe({
          next: (existingNotes) => {
            const count = (existingNotes || []).length;
            if (count > 0) {
              this.existingNotesCount.set(count);
              this.message.info(`${count} note(s) déjà saisie(s) pour ce devoir. Vous pouvez les modifier.`);
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
        this.message.error(msg);
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

  saveNotes() {
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
          this.message.success(`${notes.length} note(s) enregistrée(s)`);
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
      this.modal.confirm({
        nzTitle: 'Confirmer la mise à jour',
        nzContent: `${this.existingNotesCount()} note(s) existante(s) pour ce devoir. Voulez-vous les mettre à jour ?`,
        nzOkText: 'Mettre à jour',
        nzCancelText: 'Annuler',
        nzOnOk: () => doSave(),
      });
    } else {
      doSave();
    }
  }

  goToDevoirs() {
    this.router.navigate(['/enseignant/devoirs']);
  }
}
