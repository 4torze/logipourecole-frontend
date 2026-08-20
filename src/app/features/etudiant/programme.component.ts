import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { BreadcrumbComponent } from '../../shared/ui/breadcrumb.component';

interface Chapitre {
  id: string;
  titre: string;
  contenu?: string;
  matiere?: { id: string; nom: string };
  enseignant?: { id: string; nom: string; prenom: string };
}

@Component({
  selector: 'app-etudiant-programme',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="[{ label: 'Espace étudiant', route: ['/etudiant'] }, { label: 'Programme' }]"></app-breadcrumb>

      <div class="gs-panel" style="margin-bottom:20px">
        <div class="gs-panel-body">
          <div class="field" style="max-width:300px">
            <label>Trimestre / Semestre</label>
            <select [ngModel]="selectedPeriodeId()" (ngModelChange)="selectedPeriodeId.set($event); load()" class="input">
              <option value="">Sélectionner...</option>
              @for (p of periodes(); track p.id) { <option [value]="p.id">{{ p.libelle }}</option> }
            </select>
          </div>
        </div>
      </div>

      @if (selectedPeriodeId()) {
        @if (loading()) {
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:20px 0">
            <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
          </div>
        } @else if (matieres().length > 0) {
          <div style="display:flex;flex-direction:column;gap:16px">
            @for (matiere of matieres(); track matiere) {
              <div class="gs-panel">
                <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">{{ matiere }}</h3></div>
                <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:8px">
                  @for (c of chapitresParMatiere(matiere); track c.id) {
                    <div style="padding:12px 14px;border:1px solid var(--color-divider)">
                      <strong>{{ c.titre }}</strong>
                      @if (c.contenu) { <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 65%, transparent)">{{ c.contenu }}</p> }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="table-empty">Aucun chapitre enregistré pour cette période</div>
        }
      }
    </div>
  `,
})
export class EtudiantProgrammeComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  periodes = signal<any[]>([]);
  chapitres = signal<Chapitre[]>([]);
  selectedPeriodeId = signal<string>('');
  loading = signal(false);

  matieres = computed(() => {
    const set = new Set<string>();
    for (const c of this.chapitres()) if (c.matiere?.nom) set.add(c.matiere.nom);
    return Array.from(set);
  });

  chapitresParMatiere(matiere: string): Chapitre[] {
    return this.chapitres().filter((c) => c.matiere?.nom === matiere);
  }

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/etudes/periodes`).subscribe({
      next: (d) => this.periodes.set(d),
      error: () => this.periodes.set([]),
    });
  }

  load() {
    if (!this.selectedPeriodeId()) { this.chapitres.set([]); return; }
    this.loading.set(true);
    this.http.get<Chapitre[]>(`${environment.apiUrl}/programme?periodeId=${this.selectedPeriodeId()}`).subscribe({
      next: (d) => { this.chapitres.set(d || []); this.loading.set(false); },
      error: () => { this.chapitres.set([]); this.loading.set(false); },
    });
  }
}
