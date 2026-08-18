import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';
import { filiereLabel } from '../../core/utils/filiere.util';

@Component({
  selector: 'app-enseignant-mes-eleves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1 style="margin:0 0 24px">Mes élèves</h1>

      @if (loading()) {
        <div class="gs-panel"><div class="gs-panel-body">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:24px 0"><span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...</div>
        </div></div>
      } @else if (classes().length === 0) {
        <div class="gs-panel"><div class="gs-panel-body">
          <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">school</span>
          Vous n'avez aucune classe affectée.
        </div></div>
      } @else {
        <!-- Filtre par classe -->
        <div class="gs-panel"><div class="gs-panel-body" style="display:flex;gap:12px;flex-wrap:wrap">
          <select [ngModel]="selectedClasseId()" (ngModelChange)="onClasseChange($event)" class="input" style="width:auto;min-width:260px">
            <option value="">Toutes mes classes</option>
            @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }} — {{ filiereLabel(c) }}</option> }
          </select>
          <input type="text" [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" placeholder="Rechercher un élève..." class="input" style="flex:1;min-width:220px" />
        </div></div>

        <!-- Vue par classe avec onglets -->
        @if (!selectedClasseId()) {
          <div class="gs-panel">
            <div class="gs-panel-body">
              <div style="display:flex;gap:4px;border-bottom:1px solid var(--color-divider);margin:-20px -20px 16px;padding:0 20px;flex-wrap:wrap">
                @for (c of classes(); track c.id) {
                  <button (click)="activeTabClasseId.set(c.id)" style="padding:12px 16px;font-size:13px;font-weight:600;font-family:var(--font-heading);border-bottom:2px solid transparent;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer" [style.border-bottom-color]="activeTabClasseId() === c.id ? 'var(--color-accent)' : 'transparent'" [style.color]="activeTabClasseId() === c.id ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 55%, transparent)'">
                    {{ c.nom }} ({{ elevesParClasse()[c.id]?.length || 0 }})
                  </button>
                }
              </div>
              @if ((elevesParClasse()[activeTabClasseId()]?.length || 0) > 0) {
                <div style="overflow-x:auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th style="width:48px">N°</th>
                        <th style="cursor:pointer;user-select:none" (click)="sortEleves(activeTabClasseId(), 'nom')">Nom <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle" [style.color]="sortField() === 'nom' ? 'var(--color-accent)' : 'var(--color-neutral-300)'">{{ sortIcon('nom') }}</span></th>
                        <th style="cursor:pointer;user-select:none" (click)="sortEleves(activeTabClasseId(), 'prenom')">Prénom <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle" [style.color]="sortField() === 'prenom' ? 'var(--color-accent)' : 'var(--color-neutral-300)'">{{ sortIcon('prenom') }}</span></th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th style="text-align:center;width:80px">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (et of elevesParClasse()[activeTabClasseId()]; track et.id; let i = $index) {
                        <tr (click)="openEleveDetail(et.id)" style="cursor:pointer">
                          <td style="color:color-mix(in srgb, var(--color-text) 45%, transparent)">{{ i + 1 }}</td>
                          <td style="font-weight:600">{{ et.nom }}</td>
                          <td>{{ et.prenom }}</td>
                          <td>{{ et.telephone || '—' }}</td>
                          <td>{{ et.email || '—' }}</td>
                          <td style="text-align:center"><button (click)="$event.stopPropagation(); openEleveDetail(et.id)" class="btn btn-icon btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="table-empty">
                  <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">group_off</span>
                  Aucun élève inscrit dans cette classe.
                </div>
              }
            </div>
          </div>
        } @else {
          <!-- Vue d'une seule classe -->
          <div class="gs-panel">
            <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">{{ selectedClasseLabel() }}</h3></div>
            <div class="gs-panel-body">
            @if (filteredEleves().length > 0) {
              <div style="overflow-x:auto">
                <table class="table">
                  <thead>
                    <tr>
                      <th style="width:48px">N°</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Téléphone</th>
                      <th>Email</th>
                      <th style="text-align:center;width:80px">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (et of filteredEleves(); track et.id; let i = $index) {
                      <tr (click)="openEleveDetail(et.id)" style="cursor:pointer">
                        <td style="color:color-mix(in srgb, var(--color-text) 45%, transparent)">{{ i + 1 }}</td>
                        <td style="font-weight:600">{{ et.nom }}</td>
                        <td>{{ et.prenom }}</td>
                        <td>{{ et.telephone || '—' }}</td>
                        <td>{{ et.email || '—' }}</td>
                        <td style="text-align:center"><button (click)="$event.stopPropagation(); openEleveDetail(et.id)" class="btn btn-icon btn-secondary"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="table-empty">
                <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">group_off</span>
                Aucun élève trouvé.
              </div>
            }
          </div>
        </div>
      }
    }
    </div>

    <!-- Panneau détail élève -->
    @if (drawerVisible()) {
      <div class="dialog-backdrop" style="justify-items:end;align-items:stretch;padding:0" (click)="drawerVisible.set(false)">
        <div class="dialog" style="width:min(640px, 100%);height:100%;max-height:100%;border-radius:0;overflow-y:auto;border-left:1px solid var(--color-divider)" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--color-surface);padding-bottom:12px;border-bottom:1px solid var(--color-divider);margin-bottom:4px">
            <h3 class="dialog-title">{{ drawerTitle() }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="drawerVisible.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          @if (loadingDetail()) {
            <div style="display:flex;align-items:center;justify-content:center;padding:40px 0"><span class="material-symbols-outlined" style="font-size:24px;opacity:0.5">progress_activity</span></div>
          } @else if (eleveDetail()) {
            <!-- Infos élève -->
            <div class="gs-well" style="display:flex;gap:24px;flex-wrap:wrap;font-size:14px">
              <div><span class="text-muted">Nom :</span> <strong>{{ eleveDetail()?.etudiant?.nom }}</strong></div>
              <div><span class="text-muted">Prénom :</span> <strong>{{ eleveDetail()?.etudiant?.prenom }}</strong></div>
              <div><span class="text-muted">Téléphone :</span> <strong>{{ eleveDetail()?.etudiant?.telephone || '—' }}</strong></div>
              <div><span class="text-muted">Email :</span> <strong>{{ eleveDetail()?.etudiant?.email || '—' }}</strong></div>
            </div>

            <!-- Mon commentaire sur cet élève -->
            <div style="display:flex;align-items:center;justify-content:space-between">
              <h4 style="margin:0;font-size:14px">Mon commentaire</h4>
              @if (!editingComment()) {
                <button (click)="startEditComment()" class="btn btn-secondary btn-sm">
                  <span class="material-symbols-outlined" style="font-size:16px">{{ eleveDetail()?.monCommentaire ? 'edit' : 'add_comment' }}</span>
                  {{ eleveDetail()?.monCommentaire ? 'Modifier' : 'Ajouter un commentaire' }}
                </button>
              }
            </div>
            @if (editingComment()) {
              <div style="border:1px solid var(--color-divider);padding:12px">
                <textarea [(ngModel)]="commentDraft" rows="3" placeholder="Votre commentaire sur cet élève..." class="input" style="resize:none"></textarea>
                <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
                  <button (click)="cancelEditComment()" class="btn btn-secondary btn-sm">Annuler</button>
                  <button (click)="saveComment()" [disabled]="savingComment() || !commentDraft.trim()" class="btn btn-primary btn-sm">
                    @if (savingComment()) { <span class="material-symbols-outlined" style="font-size:14px">progress_activity</span> } Enregistrer
                  </button>
                </div>
              </div>
            } @else if (eleveDetail()?.monCommentaire) {
              <div class="gs-well" style="font-size:13px;white-space:pre-wrap">{{ eleveDetail()?.monCommentaire?.contenu }}
                <div style="font-size:11px;color:color-mix(in srgb, var(--color-text) 45%, transparent);margin-top:6px">Modifié le {{ eleveDetail()?.monCommentaire?.updatedAt | date:'dd/MM/yyyy à HH:mm' }}</div>
              </div>
            } @else {
              <div style="font-size:13px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">Aucun commentaire pour le moment.</div>
            }

            <!-- Mes notes pour cet élève -->
            <h4 style="margin:0;font-size:14px">Mes notes saisies</h4>
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>Devoir</th><th>Matière</th><th>Période</th><th style="text-align:center">Note</th><th style="text-align:center">Sur</th><th>Date</th></tr>
                </thead>
                <tbody>
                  @for (n of eleveDetail()?.notes || []; track n.id) {
                    <tr>
                      <td>{{ n.devoir?.titre || '—' }}</td>
                      <td>{{ n.matiere?.nom }}</td>
                      <td>{{ n.periode?.libelle || '—' }}</td>
                      <td style="text-align:center">
                        @if (n.note >= n.sur / 2) {
                          <span class="tag tag-success">{{ n.note }}</span>
                        } @else {
                          <span class="tag tag-danger">{{ n.note }}</span>
                        }
                      </td>
                      <td style="text-align:center">{{ n.sur }}</td>
                      <td>{{ n.dateSaisie | date:'dd/MM/yyyy' }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="table-empty">Aucune note saisie par vous pour cet élève.</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Mes absences pour cet élève -->
            <h4 style="margin:0;font-size:14px">Absences &amp; retards (mes matières)</h4>
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Matière</th><th>Justifié</th><th>Motif</th></tr>
                </thead>
                <tbody>
                  @for (a of eleveDetail()?.absences || []; track a.id) {
                    <tr>
                      <td>{{ a.date | date:'dd/MM/yyyy' }}</td>
                      <td>
                        @if (a.type === 'ABSENCE') {
                          <span class="tag tag-danger">Absence</span>
                        } @else {
                          <span class="tag tag-accent">Retard</span>
                        }
                      </td>
                      <td>{{ a.matiere?.nom }}</td>
                      <td>
                        @if (a.justified) {
                          <span class="tag tag-success">Justifié</span>
                        } @else {
                          <span class="tag tag-neutral">Non justifié</span>
                        }
                      </td>
                      <td>{{ a.motif || '—' }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="table-empty">Aucune absence ou retard enregistré par vous pour cet élève.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class EnseignantMesElevesComponent implements OnInit {
  filiereLabel = filiereLabel;
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  classes = signal<any[]>([]);
  elevesParClasse = signal<Record<string, any[]>>({});
  loading = signal(false);
  selectedClasseId = signal('');
  searchText = signal('');
  sortField = signal<'nom' | 'prenom'>('nom');
  sortAsc = signal(true);
  activeTabClasseId = signal('');
  drawerVisible = signal(false);
  loadingDetail = signal(false);
  eleveDetail = signal<any>(null);
  drawerTitle = signal('');
  currentEtudiantId = '';
  editingComment = signal(false);
  savingComment = signal(false);
  commentDraft = '';

  ngOnInit() { this.loadClasses(); }

  selectedClasseLabel() {
    const c = this.classes().find(c => c.id === this.selectedClasseId());
    return c ? c.nom : '';
  }

  filteredEleves = computed(() => {
    const classeId = this.selectedClasseId();
    if (!classeId) return [];
    const eleves = this.elevesParClasse()[classeId] || [];
    const search = this.searchText().toLowerCase().trim();
    if (!search) return eleves;
    return eleves.filter(e =>
      (e.nom || '').toLowerCase().includes(search) ||
      (e.prenom || '').toLowerCase().includes(search)
    );
  });

  loadClasses() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/enseignant/affectations`).subscribe({
      next: (affectations) => {
        const classesMap: Record<string, any> = {};
        for (const aff of affectations || []) {
          if (!classesMap[aff.classe.id]) {
            classesMap[aff.classe.id] = { ...aff.classe };
          }
        }
        const classesList = Object.values(classesMap);
        this.classes.set(classesList);
        if (classesList.length > 0) this.activeTabClasseId.set(classesList[0].id);
        this.loading.set(false);

        for (const c of classesList) {
          this.http.get<any[]>(`${environment.apiUrl}/enseignant/classe/${c.id}/etudiants`).subscribe({
            next: (eleves) => {
              const sorted = [...(eleves || [])].sort((a, b) =>
                (a.nom || '').localeCompare(b.nom || '')
              );
              this.elevesParClasse.update(prev => ({ ...prev, [c.id]: sorted }));
            },
            error: () => {
              this.elevesParClasse.update(prev => ({ ...prev, [c.id]: [] }));
            },
          });
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur chargement classes';
        this.alertService.error(msg);
      },
    });
  }

  onClasseChange(classeId: string) {
    this.selectedClasseId.set(classeId || '');
  }

  sortEleves(classeId: string, field: 'nom' | 'prenom') {
    const currentField = this.sortField();
    const currentAsc = this.sortAsc();
    const asc = currentField === field ? !currentAsc : true;
    this.sortField.set(field);
    this.sortAsc.set(asc);
    const eleves = this.elevesParClasse()[classeId] || [];
    const sorted = [...eleves].sort((a, b) => {
      const cmp = (a[field] || '').localeCompare(b[field] || '');
      return asc ? cmp : -cmp;
    });
    this.elevesParClasse.update(prev => ({ ...prev, [classeId]: sorted }));
  }

  sortIcon(field: 'nom' | 'prenom'): string {
    if (this.sortField() !== field) return 'sort';
    return this.sortAsc() ? 'arrow_upward' : 'arrow_downward';
  }

  openEleveDetail(etudiantId: string) {
    this.currentEtudiantId = etudiantId;
    this.drawerVisible.set(true);
    this.loadingDetail.set(true);
    this.eleveDetail.set(null);
    this.editingComment.set(false);
    this.drawerTitle.set('Détail de l\'élève');

    this.http.get<any>(`${environment.apiUrl}/enseignant/eleve/${etudiantId}/details`).subscribe({
      next: (data) => {
        this.eleveDetail.set(data);
        this.drawerTitle.set(`${data.etudiant?.nom || ''} ${data.etudiant?.prenom || ''}`);
        this.loadingDetail.set(false);
      },
      error: (err: any) => {
        this.loadingDetail.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur chargement détail';
        this.alertService.error(msg);
      },
    });
  }

  startEditComment() {
    this.commentDraft = this.eleveDetail()?.monCommentaire?.contenu || '';
    this.editingComment.set(true);
  }

  cancelEditComment() {
    this.editingComment.set(false);
    this.commentDraft = '';
  }

  saveComment() {
    if (!this.commentDraft.trim() || !this.currentEtudiantId) return;
    this.savingComment.set(true);
    this.http.post<any>(`${environment.apiUrl}/enseignant/eleve/${this.currentEtudiantId}/commentaire`, { contenu: this.commentDraft.trim() }).subscribe({
      next: (commentaire) => {
        this.savingComment.set(false);
        this.editingComment.set(false);
        this.eleveDetail.update((d: any) => ({ ...d, monCommentaire: commentaire }));
        this.alertService.success('Commentaire enregistré');
      },
      error: (err: any) => {
        this.savingComment.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur enregistrement du commentaire';
        this.alertService.error(msg);
      },
    });
  }
}
