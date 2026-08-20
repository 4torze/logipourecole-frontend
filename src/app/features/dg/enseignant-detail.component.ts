import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { AnneeScolaireService } from '../../core/services/annee-scolaire.service';
import { RoleUtilisateur } from '../../core/models';
import { environment } from '../../../environments/environment';
import { filiereLabel } from '../../core/utils/filiere.util';
import { BreadcrumbComponent } from '../../shared/ui/breadcrumb.component';

@Component({
  selector: 'app-enseignant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="breadcrumbItems()"></app-breadcrumb>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);padding:40px 0">
          <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement...
        </div>
      }
      @if (!loading() && fiche(); as f) {
        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-body" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
            <div>
              <h2 style="margin:0">{{ f.prenom }} {{ f.nom }}</h2>
              <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ f.email }} · {{ f.telephone || 'Pas de téléphone' }}</p>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span class="tag" [class]="f.statut === 'ACTIF' ? 'tag-success' : 'tag-accent'">{{ f.statut }}</span>
              <button (click)="openEdit()" class="btn btn-secondary btn-sm">
                <span class="material-symbols-outlined" style="font-size:16px">edit</span> Modifier
              </button>
            </div>
          </div>
        </div>

        @if (showEdit()) {
          <div class="dialog-backdrop" (click)="showEdit.set(false)">
            <div class="dialog" (click)="$event.stopPropagation()">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span class="dialog-title">Modifier l'enseignant</span>
                <button class="btn btn-icon btn-secondary" (click)="showEdit.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
              </div>
              <div class="field"><label>Nom</label><input type="text" [(ngModel)]="editForm.nom" class="input" /></div>
              <div class="field"><label>Prénom</label><input type="text" [(ngModel)]="editForm.prenom" class="input" /></div>
              <div class="field"><label>Téléphone</label><input type="text" [(ngModel)]="editForm.telephone" class="input" /></div>
              <div class="field"><label>Statut</label><select [(ngModel)]="editForm.statut" class="input"><option value="ACTIF">Actif</option><option value="INACTIF">Bloqué</option></select></div>
              <div class="dialog-actions">
                <button (click)="showEdit.set(false)" class="btn btn-secondary">Annuler</button>
                <button (click)="saveEdit()" [disabled]="saving()" class="btn btn-primary">
                  @if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } Enregistrer
                </button>
              </div>
            </div>
          </div>
        }

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px">
          <div class="gs-stat"><span class="gs-stat-label">Notes saisies</span><span class="gs-stat-num">{{ f._count?.notesSaisies || 0 }}</span></div>
          <div class="gs-stat"><span class="gs-stat-label">Absences saisies</span><span class="gs-stat-num">{{ f._count?.absencesSaisies || 0 }}</span></div>
        </div>

        <div class="gs-panel" style="margin-bottom:20px">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Classes assignées ({{ f.affectations?.length || 0 }})</h3></div>
          <div class="gs-panel-body">
            <div class="table-scroll">
              <table class="table">
                <thead><tr><th>Classe</th><th>Filière</th><th>Matière</th></tr></thead>
                <tbody>
                  @for (a of f.affectations; track a.id) {
                    <tr><td>{{ a.classe?.nom }}</td><td>{{ filiereLabel(a.classe) || '—' }}</td><td>{{ a.matiere?.nom }}</td></tr>
                  } @empty { <tr><td colspan="3" style="text-align:center;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:16px 0">Aucune affectation</td></tr> }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Programme pédagogique</h3></div>
          <div class="gs-panel-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:16px">
              <div class="field">
                <label>Année scolaire</label>
                <select [ngModel]="selectedAnneeId()" (ngModelChange)="selectedAnneeId.set($event)" class="input">
                  <option value="">Sélectionner...</option>
                  @for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }}</option> }
                </select>
              </div>
              <div class="field">
                <label>Classe</label>
                <select [ngModel]="selectedClasseId()" (ngModelChange)="onClasseChange($event)" class="input" [disabled]="!selectedAnneeId()">
                  <option value="">Sélectionner...</option>
                  @for (a of f.affectations; track a.classeId) { <option [value]="a.classeId">{{ a.classe?.nom }}</option> }
                </select>
              </div>
              <div class="field">
                <label>Trimestre / Semestre</label>
                <select [ngModel]="selectedPeriodeId()" (ngModelChange)="selectedPeriodeId.set($event); loadChapitres()" class="input" [disabled]="!selectedClasseId()">
                  <option value="">Sélectionner...</option>
                  @for (p of periodes(); track p.id) { <option [value]="p.id">{{ p.libelle }}</option> }
                </select>
              </div>
            </div>

            @if (selectedClasseId() && selectedPeriodeId()) {
              @if (chapitres().length > 0) {
                <div style="display:flex;flex-direction:column;gap:8px">
                  @for (c of chapitres(); track c.id) {
                    <div style="padding:14px;border:1px solid var(--color-divider)">
                      <strong>{{ c.titre }}</strong>
                      @if (c.contenu) { <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 65%, transparent)">{{ c.contenu }}</p> }
                    </div>
                  }
                </div>
              } @else {
                <div class="table-empty">Aucun chapitre enregistré pour cette classe/période</div>
              }
            } @else {
              <p class="text-muted" style="font-size:13px;margin:0">Sélectionnez une classe et une période pour voir le programme.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class EnseignantDetailComponent implements OnInit {
  filiereLabel = filiereLabel;
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private anneeScolaireService = inject(AnneeScolaireService);
  private route = inject(ActivatedRoute);

  enseignantId = '';
  fiche = signal<any>(null);
  loading = signal(true);

  annees = signal<any[]>([]);
  periodes = signal<any[]>([]);
  chapitres = signal<any[]>([]);

  selectedAnneeId = signal<string>('');
  selectedClasseId = signal<string>('');
  selectedPeriodeId = signal<string>('');

  showEdit = signal(false);
  saving = signal(false);
  editForm = { nom: '', prenom: '', telephone: '', statut: 'ACTIF' };

  ngOnInit() {
    this.enseignantId = this.route.snapshot.paramMap.get('id') || '';
    this.loadFiche();
    this.loadAnnees();
    this.loadPeriodes();
  }

  loadFiche() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/users/${this.enseignantId}`).subscribe({
      next: (f) => { this.fiche.set(f); this.loading.set(false); },
      error: () => { this.loading.set(false); this.alertService.error('Erreur lors du chargement de la fiche enseignant'); },
    });
  }

  loadAnnees() {
    this.anneeScolaireService.findAll().subscribe({
      next: (d) => {
        this.annees.set(d);
        const active = d.find((a: any) => a.statut === 'active');
        if (active) this.selectedAnneeId.set(active.id);
      },
      error: () => this.annees.set([]),
    });
  }

  loadPeriodes() {
    this.http.get<any[]>(`${environment.apiUrl}/etudes/periodes`).subscribe({
      next: (d) => this.periodes.set(d),
      error: () => this.periodes.set([]),
    });
  }

  onClasseChange(classeId: string) {
    this.selectedClasseId.set(classeId);
    this.selectedPeriodeId.set('');
    this.chapitres.set([]);
  }

  loadChapitres() {
    if (!this.selectedClasseId() || !this.selectedPeriodeId()) { this.chapitres.set([]); return; }
    this.http.get<any[]>(`${environment.apiUrl}/programme?enseignantId=${this.enseignantId}&classeId=${this.selectedClasseId()}&periodeId=${this.selectedPeriodeId()}`).subscribe({
      next: (d) => this.chapitres.set(d),
      error: () => this.chapitres.set([]),
    });
  }

  openEdit() {
    const f = this.fiche();
    if (!f) return;
    this.editForm = { nom: f.nom, prenom: f.prenom, telephone: f.telephone || '', statut: f.statut };
    this.showEdit.set(true);
  }

  saveEdit() {
    this.saving.set(true);
    this.http.patch(`${environment.apiUrl}/users/${this.enseignantId}`, this.editForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showEdit.set(false);
        this.alertService.success('Enseignant modifié');
        this.loadFiche();
      },
      error: (err: any) => { this.saving.set(false); this.alertService.error(err?.error?.message || 'Erreur lors de la modification'); },
    });
  }

  breadcrumbItems = computed(() => {
    const role = this.authService.currentUser()?.role;
    const listeRoute = role === RoleUtilisateur.DSI ? '/dsi' : '/dg/enseignants';
    const f = this.fiche();
    return [
      { label: 'Enseignants', route: listeRoute },
      { label: f ? `${f.prenom} ${f.nom}` : '...' },
    ];
  });
}
