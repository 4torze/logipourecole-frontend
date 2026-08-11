import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-enseignant-mes-eleves',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    NzCardModule, NzButtonModule, NzIconModule, NzSelectModule,
    NzTableModule, NzTagModule, NzTabsModule, NzEmptyModule, NzInputModule, NzDrawerModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Mes élèves</h1>

      @if (loading()) {
        <nz-card><div style="text-align:center; padding:20px;"><span nz-icon nzType="loading" style="font-size:24px;"></span> Chargement...</div></nz-card>
      } @else if (classes().length === 0) {
        <nz-card>
          <nz-empty nzDescription="Vous n'avez aucune classe affectée."></nz-empty>
        </nz-card>
      } @else {
        <!-- Filtre par classe -->
        <nz-card style="margin-bottom: 16px;">
          <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <nz-select
              [ngModel]="selectedClasseId()"
              (ngModelChange)="onClasseChange($event)"
              nzPlaceHolder="Toutes mes classes"
              style="min-width:280px;"
              nzSize="large"
              nzShowSearch
              nzAllowClear>
              @for (c of classes(); track c.id) {
                <nz-option [nzValue]="c.id" [nzLabel]="c.nom + ' — ' + (c.filiere?.nom || '')"></nz-option>
              }
            </nz-select>
            <nz-input-group nzSearch [nzAddOnAfter]="suffixBtn" style="width:300px;">
              <input type="text" nz-input [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" placeholder="Rechercher un élève..." />
            </nz-input-group>
            <ng-template #suffixBtn>
              <button nz-button nzType="primary" nzSearch><span nz-icon nzType="search"></span></button>
            </ng-template>
          </div>
        </nz-card>

        <!-- Vue par classe avec onglets -->
        @if (!selectedClasseId()) {
          <nz-tabset nzType="card">
            @for (c of classes(); track c.id) {
              <nz-tab [nzTitle]="c.nom + ' (' + (elevesParClasse()[c.id]?.length || 0) + ')'">
                <ng-template nz-tab>
                  @if (elevesParClasse()[c.id]?.length > 0) {
                    <nz-table #tbl [nzData]="elevesParClasse()[c.id]" [nzPageSize]="50" [nzFrontPagination]="true" nzSize="middle">
                      <thead><tr>
                        <th style="width:50px;">N°</th>
                        <th>Nom <span nz-icon [nzType]="sortIcon('nom')" [style.color]="sortIconColor('nom')" style="cursor:pointer;" (click)="sortEleves(c.id, 'nom')"></span></th>
                        <th>Prénom <span nz-icon [nzType]="sortIcon('prenom')" [style.color]="sortIconColor('prenom')" style="cursor:pointer;" (click)="sortEleves(c.id, 'prenom')"></span></th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th style="width:80px; text-align:center;">Action</th>
                      </tr></thead>
                      <tbody>
                        @for (et of tbl.data; track et.id; let i = $index) {
                          <tr style="cursor:pointer;" (click)="openEleveDetail(et.id)">
                            <td style="color:#9ca3af;">{{ i + 1 }}</td>
                            <td><strong>{{ et.nom }}</strong></td>
                            <td>{{ et.prenom }}</td>
                            <td>{{ et.telephone || '—' }}</td>
                            <td>{{ et.email || '—' }}</td>
                            <td style="text-align:center;"><button nz-button nzType="link" nzSize="small" (click)="$event.stopPropagation(); openEleveDetail(et.id)"><span nz-icon nzType="eye"></span></button></td>
                          </tr>
                        }
                      </tbody>
                    </nz-table>
                  } @else {
                    <nz-empty nzDescription="Aucun élève inscrit dans cette classe."></nz-empty>
                  }
                </ng-template>
              </nz-tab>
            }
          </nz-tabset>
        } @else {
          <!-- Vue d'une seule classe -->
          <nz-card [nzTitle]="selectedClasseLabel()">
            @if (filteredEleves().length > 0) {
              <nz-table #tbl2 [nzData]="filteredEleves()" [nzPageSize]="50" [nzFrontPagination]="true" nzSize="middle">
                <thead><tr>
                  <th style="width:50px;">N°</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th style="width:80px; text-align:center;">Action</th>
                </tr></thead>
                <tbody>
                  @for (et of tbl2.data; track et.id; let i = $index) {
                    <tr style="cursor:pointer;" (click)="openEleveDetail(et.id)">
                      <td style="color:#9ca3af;">{{ i + 1 }}</td>
                      <td><strong>{{ et.nom }}</strong></td>
                      <td>{{ et.prenom }}</td>
                      <td>{{ et.telephone || '—' }}</td>
                      <td>{{ et.email || '—' }}</td>
                      <td style="text-align:center;"><button nz-button nzType="link" nzSize="small" (click)="$event.stopPropagation(); openEleveDetail(et.id)"><span nz-icon nzType="eye"></span></button></td>
                    </tr>
                  }
                </tbody>
              </nz-table>
            } @else {
              <nz-empty nzDescription="Aucun élève trouvé."></nz-empty>
            }
          </nz-card>
        }
      }

      <!-- Drawer détail élève -->
      <nz-drawer
        [nzVisible]="drawerVisible()"
        (nzOnClose)="drawerVisible.set(false)"
        [nzWidth]="640"
        [nzTitle]="drawerTitle()">
        <ng-template nzDrawerContent>
          @if (loadingDetail()) {
            <div style="text-align:center; padding:40px;"><span nz-icon nzType="loading" style="font-size:24px;"></span></div>
          } @else if (eleveDetail()) {
            <!-- Infos élève -->
            <nz-card style="margin-bottom:16px;" nzSize="small">
              <div style="display:flex; gap:24px; flex-wrap:wrap;">
                <div><strong>Nom:</strong> {{ eleveDetail()?.etudiant?.nom }}</div>
                <div><strong>Prénom:</strong> {{ eleveDetail()?.etudiant?.prenom }}</div>
                <div><strong>Téléphone:</strong> {{ eleveDetail()?.etudiant?.telephone || '—' }}</div>
                <div><strong>Email:</strong> {{ eleveDetail()?.etudiant?.email || '—' }}</div>
              </div>
            </nz-card>

            <!-- Mes notes pour cet élève -->
            <nz-card style="margin-bottom:16px;" nzTitle="Mes notes saisies" nzSize="small">
              @if (eleveDetail()?.notes?.length > 0) {
                <nz-table #notesTbl [nzData]="eleveDetail()?.notes || []" [nzPageSize]="20" [nzFrontPagination]="false" nzSize="small">
                  <thead><tr>
                    <th>Devoir</th>
                    <th>Matière</th>
                    <th>Période</th>
                    <th style="width:80px; text-align:center;">Note</th>
                    <th style="width:60px; text-align:center;">Sur</th>
                    <th>Date</th>
                  </tr></thead>
                  <tbody>
                    @for (n of notesTbl.data; track n.id) {
                      <tr>
                        <td>{{ n.devoir?.titre || '—' }}</td>
                        <td>{{ n.matiere?.nom }}</td>
                        <td>{{ n.periode?.libelle || '—' }}</td>
                        <td style="text-align:center;">
                          @if (n.note >= n.sur / 2) {
                            <nz-tag nzColor="success">{{ n.note }}</nz-tag>
                          } @else {
                            <nz-tag nzColor="error">{{ n.note }}</nz-tag>
                          }
                        </td>
                        <td style="text-align:center;">{{ n.sur }}</td>
                        <td style="color:#6b7280;">{{ n.dateSaisie | date:'dd/MM/yyyy' }}</td>
                      </tr>
                    }
                  </tbody>
                </nz-table>
              } @else {
                <nz-empty nzDescription="Aucune note saisie par vous pour cet élève."></nz-empty>
              }
            </nz-card>

            <!-- Mes absences pour cet élève -->
            <nz-card nzTitle="Absences & retards (mes matières)" nzSize="small">
              @if (eleveDetail()?.absences?.length > 0) {
                <nz-table #absTbl [nzData]="eleveDetail()?.absences || []" [nzPageSize]="20" [nzFrontPagination]="false" nzSize="small">
                  <thead><tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Matière</th>
                    <th>Justifié</th>
                    <th>Motif</th>
                  </tr></thead>
                  <tbody>
                    @for (a of absTbl.data; track a.id) {
                      <tr>
                        <td>{{ a.date | date:'dd/MM/yyyy' }}</td>
                        <td>
                          @if (a.type === 'ABSENCE') {
                            <nz-tag nzColor="error">Absence</nz-tag>
                          } @else {
                            <nz-tag nzColor="warning">Retard</nz-tag>
                          }
                        </td>
                        <td>{{ a.matiere?.nom }}</td>
                        <td>
                          @if (a.justified) {
                            <nz-tag nzColor="success">Justifié</nz-tag>
                          } @else {
                            <nz-tag nzColor="default">Non justifié</nz-tag>
                          }
                        </td>
                        <td>{{ a.motif || '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </nz-table>
              } @else {
                <nz-empty nzDescription="Aucune absence ou retard enregistré par vous pour cet élève."></nz-empty>
              }
            </nz-card>
          }
        </ng-template>
      </nz-drawer>
    </div>
  `,
})
export class EnseignantMesElevesComponent implements OnInit {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);

  classes = signal<any[]>([]);
  elevesParClasse = signal<Record<string, any[]>>({});
  loading = signal(false);
  selectedClasseId = signal('');
  searchText = signal('');
  sortField = signal<'nom' | 'prenom'>('nom');
  sortAsc = signal(true);
  drawerVisible = signal(false);
  loadingDetail = signal(false);
  eleveDetail = signal<any>(null);
  drawerTitle = signal('');

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
        this.message.error(msg);
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

  sortIcon(field: 'nom' | 'prenom') {
    if (this.sortField() !== field) return 'sort-ascending';
    return this.sortAsc() ? 'sort-ascending' : 'sort-descending';
  }

  sortIconColor(field: 'nom' | 'prenom') {
    return this.sortField() === field ? '#1677ff' : '#d9d9d9';
  }

  openEleveDetail(etudiantId: string) {
    this.drawerVisible.set(true);
    this.loadingDetail.set(true);
    this.eleveDetail.set(null);
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
        this.message.error(msg);
      },
    });
  }
}
