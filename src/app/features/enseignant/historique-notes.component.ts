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
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-enseignant-historique-notes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    NzCardModule, NzButtonModule, NzIconModule, NzSelectModule,
    NzTableModule, NzTagModule, NzEmptyModule, NzInputModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Historique des notes</h1>

      @if (loading()) {
        <nz-card><div style="text-align:center; padding:20px;"><span nz-icon nzType="loading" style="font-size:24px;"></span> Chargement...</div></nz-card>
      } @else if (notes().length === 0) {
        <nz-card>
          <nz-empty nzDescription="Vous n'avez encore saisi aucune note. Allez dans 'Évaluations' pour commencer.">
            <button nz-button nzType="primary" (click)="goToEvaluations()"><span nz-icon nzType="edit"></span> Saisir des notes</button>
          </nz-empty>
        </nz-card>
      } @else {
        <!-- Filtres -->
        <nz-card style="margin-bottom: 16px;">
          <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
            <nz-select
              [ngModel]="filterClasse()"
              (ngModelChange)="filterClasse.set($event)"
              nzPlaceHolder="Toutes les classes"
              style="min-width:200px;"
              nzSize="large"
              nzAllowClear>
              @for (c of classes(); track c) {
                <nz-option [nzValue]="c" [nzLabel]="c"></nz-option>
              }
            </nz-select>
            <nz-select
              [ngModel]="filterMatiere()"
              (ngModelChange)="filterMatiere.set($event)"
              nzPlaceHolder="Toutes les matières"
              style="min-width:200px;"
              nzSize="large"
              nzAllowClear>
              @for (m of matieres(); track m) {
                <nz-option [nzValue]="m" [nzLabel]="m"></nz-option>
              }
            </nz-select>
            <nz-input-group nzSearch style="width:280px;">
              <input type="text" nz-input [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" placeholder="Rechercher un élève..." />
            </nz-input-group>
            <div style="margin-left:auto; font-size:13px; color:#6b7280;">
              {{ filteredNotes().length }} note(s)
            </div>
          </div>
        </nz-card>

        <!-- Tableau -->
        <nz-card>
          <nz-table #tbl [nzData]="filteredNotes()" [nzPageSize]="50" [nzFrontPagination]="true" nzSize="middle">
            <thead><tr>
              <th style="width:50px;">N°</th>
              <th>Élève</th>
              <th>Classe</th>
              <th>Matière</th>
              <th>Devoir</th>
              <th>Période</th>
              <th style="width:100px; text-align:center;">Note</th>
              <th style="width:100px; text-align:center;">Sur</th>
              <th>Date saisie</th>
            </tr></thead>
            <tbody>
              @for (n of tbl.data; track n.id; let i = $index) {
                <tr>
                  <td style="color:#9ca3af;">{{ i + 1 }}</td>
                  <td><strong>{{ n.etudiant?.nom }}</strong> {{ n.etudiant?.prenom }}</td>
                  <td>{{ n.classe?.nom }}</td>
                  <td>{{ n.matiere?.nom }}</td>
                  <td>{{ n.devoir?.titre || '—' }}</td>
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
        </nz-card>
      }
    </div>
  `,
})
export class EnseignantHistoriqueNotesComponent implements OnInit {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private router = inject(Router);

  notes = signal<any[]>([]);
  loading = signal(false);
  filterClasse = signal('');
  filterMatiere = signal('');
  searchText = signal('');

  classes = computed(() => {
    const set = new Set<string>();
    for (const n of this.notes()) {
      if (n.classe?.nom) set.add(n.classe.nom);
    }
    return Array.from(set).sort();
  });

  matieres = computed(() => {
    const set = new Set<string>();
    for (const n of this.notes()) {
      if (n.matiere?.nom) set.add(n.matiere.nom);
    }
    return Array.from(set).sort();
  });

  filteredNotes = computed(() => {
    let result = this.notes();
    const fc = this.filterClasse();
    const fm = this.filterMatiere();
    const search = this.searchText().toLowerCase().trim();
    if (fc) result = result.filter(n => n.classe?.nom === fc);
    if (fm) result = result.filter(n => n.matiere?.nom === fm);
    if (search) {
      result = result.filter(n =>
        (n.etudiant?.nom || '').toLowerCase().includes(search) ||
        (n.etudiant?.prenom || '').toLowerCase().includes(search)
      );
    }
    return result;
  });

  ngOnInit() { this.loadNotes(); }

  loadNotes() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/enseignant/historique-saisies`).subscribe({
      next: (d) => {
        this.notes.set(d || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = typeof err?.error?.message === 'string' ? err.error.message : 'Erreur chargement historique';
        this.message.error(msg);
      },
    });
  }

  goToEvaluations() {
    this.router.navigate(['/enseignant/notes']);
  }
}
