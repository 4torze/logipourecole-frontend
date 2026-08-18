import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AlertService } from '../../core/services/alert.service';
import { DsiTabService } from '../../core/services/dsi-tab.service';
import { DsiAffectationsComponent } from './dsi-affectations.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { CreateUserResponse } from '../../core/models';
import { filiereLabel, filiereIds } from '../../core/utils/filiere.util';

@Component({
  selector: 'app-dsi-home',
  standalone: true,
  imports: [CommonModule, FormsModule, DsiAffectationsComponent, PaginationComponent],
  template: `
    <div class="page-container">
      @if (activeTab()==='ecole') {
        <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Paramètres de l'école</h3></div><div class="gs-panel-body">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
            <div class="field"><label>Nom</label><input type="text" [(ngModel)]="ecole.nom" class="input" /></div>
            <div class="field"><label>Téléphone</label><input type="text" [(ngModel)]="ecole.telephone" class="input" /></div>
            <div class="field"><label>Email</label><input type="email" [(ngModel)]="ecole.email" class="input" /></div>
            <div class="field"><label>Site web</label><input type="text" [(ngModel)]="ecole.siteWeb" class="input" /></div>
            <div class="field"><label>Logo URL</label><input type="text" [(ngModel)]="ecole.logoUrl" class="input" /></div>
            <div class="field"><label>Adresse</label><input type="text" [(ngModel)]="ecole.adresse" class="input" /></div>
            <div class="field" style="grid-column:1/-1"><label>Description</label><textarea rows="3" [(ngModel)]="ecole.description" class="input"></textarea></div>
          </div>
          <button (click)="saveEcole()" class="btn btn-primary" style="margin-top:20px"><span class="material-symbols-outlined" style="font-size:18px">save</span> Enregistrer</button>
        </div></div>
      }

      @if (activeTab()==='filieres') {
        <div class="gs-panel"><div class="gs-panel-body">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h3 style="margin:0">Filières ({{ filieres().length }})</h3>
            <button (click)="openFiliereForm()" class="btn btn-primary"><span class="material-symbols-outlined" style="font-size:18px">add</span> Ajouter</button>
          </div>
          @if (showFiliereForm()) {
            <div class="dialog-backdrop" (click)="cancelFiliereForm()">
              <div class="dialog" (click)="$event.stopPropagation()">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span class="dialog-title">{{ editingFiliere() ? 'Modifier' : 'Nouvelle' }} filière</span>
                  <button class="btn btn-icon btn-secondary" (click)="cancelFiliereForm()"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
                </div>
                <div class="field"><label>Code</label><input type="text" placeholder="Code" [(ngModel)]="formData.filiere.code" class="input" /></div>
                <div class="field"><label>Nom</label><input type="text" placeholder="Nom" [(ngModel)]="formData.filiere.nom" class="input" /></div>
                <div class="field"><label>Description</label><input type="text" placeholder="Description" [(ngModel)]="formData.filiere.description" class="input" /></div>
                <div class="dialog-actions">
                  <button (click)="cancelFiliereForm()" class="btn btn-secondary">Annuler</button>
                  <button (click)="saveFiliere()" class="btn btn-primary">{{ editingFiliere() ? 'Modifier' : 'Créer' }}</button>
                </div>
              </div>
            </div>
          }
          <div style="overflow-x:auto">
            <table class="table"><thead><tr><th>Code</th><th>Nom</th><th>Description</th><th>Classes</th><th>Actions</th></tr></thead>
            <tbody>
              @for (f of pagedFilieres(); track f.id) {
                <tr><td style="font-weight:600">{{ f.code }}</td><td>{{ f.nom }}</td><td>{{ f.description || '—' }}</td><td>{{ f._count?.classes || 0 }}</td>
                  <td><div style="display:flex;gap:4px"><button (click)="editFiliere(f)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button><button (click)="confirmDeleteFiliere(f.id)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></div></td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="table-empty">Aucune filière enregistrée</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="filierePage()" [pageSize]="pageSize" [totalItems]="filieres().length" (pageChange)="filierePage.set($event)"></app-pagination>
        </div></div>
      }

      @if (activeTab()==='classes') {
        <div class="gs-panel"><div class="gs-panel-body">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h3 style="margin:0">Classes ({{ filteredClasses().length }})</h3>
            <button (click)="openClasseForm()" class="btn btn-primary"><span class="material-symbols-outlined" style="font-size:18px">add</span> Ajouter</button>
          </div>

          <!-- KPI + graphiques (pliable) -->
          <div class="gs-panel" style="margin-bottom:20px">
            <button (click)="showClasseStats.set(!showClasseStats())" class="gs-panel-head" style="width:100%;cursor:pointer;border:none;border-bottom:2px solid var(--color-divider);background:none;text-align:left;font:inherit;color:inherit">
              <span style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;font-family:var(--font-heading)"><span class="material-symbols-outlined" style="font-size:18px">insights</span> Aperçu des classes</span>
              <span class="material-symbols-outlined text-muted" style="transition:transform .2s" [style.transform]="showClasseStats() ? 'rotate(180deg)' : 'rotate(0deg)'">expand_more</span>
            </button>
            @if (showClasseStats()) {
              <div class="gs-panel-body" style="display:flex;flex-direction:column;gap:16px">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
                  <div class="gs-stat"><span class="gs-stat-label">Classes</span><span class="gs-stat-num">{{ classeKpis().totalClasses }}</span></div>
                  <div class="gs-stat"><span class="gs-stat-label">Élèves inscrits</span><span class="gs-stat-num">{{ classeKpis().totalInscrits }}</span></div>
                  <div class="gs-stat"><span class="gs-stat-label">Capacité totale</span><span class="gs-stat-num">{{ classeKpis().capaciteTotale }}</span></div>
                  <div class="gs-stat"><span class="gs-stat-label">Taux de remplissage</span><span class="gs-stat-num">{{ classeKpis().tauxRemplissage }}%</span></div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
                  <div class="gs-panel">
                    <div class="gs-panel-head"><h3 style="margin:0;font-size:14px">Effectifs par classe</h3></div>
                    <div class="gs-panel-body">
                      @if (classeEffectifsBars().length > 0) {
                        <svg viewBox="0 0 500 200" style="width:100%;height:auto" preserveAspectRatio="xMidYMid meet">
                          <line x1="30" y1="20" x2="470" y2="20" stroke="var(--color-divider)" stroke-width="1"/>
                          <line x1="30" y1="170" x2="470" y2="170" stroke="var(--color-divider)" stroke-width="1"/>
                          @for (b of classeEffectifsBars(); track $index) {
                            <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.width" [attr.height]="b.height" fill="var(--color-accent)"/>
                            <text [attr.x]="b.x + b.width / 2" [attr.y]="b.y - 5" text-anchor="middle" font-size="9" fill="color-mix(in srgb, var(--color-text) 70%, transparent)" font-weight="600">{{ b.value }}</text>
                            <text [attr.x]="b.x + b.width / 2" y="185" text-anchor="middle" font-size="9" fill="color-mix(in srgb, var(--color-text) 45%, transparent)">{{ b.label }}</text>
                          }
                        </svg>
                      } @else {
                        <div class="text-muted" style="height:160px;display:flex;align-items:center;justify-content:center;font-size:13px">Aucune classe</div>
                      }
                    </div>
                  </div>
                  <div class="gs-panel">
                    <div class="gs-panel-head"><h3 style="margin:0;font-size:14px">Répartition par filière</h3></div>
                    <div class="gs-panel-body">
                      @if (classeFiliereDonut().length > 0) {
                        <div style="display:flex;align-items:center;gap:16px">
                          <div style="position:relative;flex:none">
                            <svg width="110" height="110" viewBox="0 0 36 36" style="transform:rotate(-90deg)">
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-divider)" stroke-width="3.5"/>
                              @for (seg of classeFiliereDonut(); track seg.label) {
                                <circle cx="18" cy="18" r="15.915" fill="none" [attr.stroke]="seg.color" stroke-width="3.5" [attr.stroke-dasharray]="seg.pct + ' ' + (100 - seg.pct)" [attr.stroke-dashoffset]="100 - seg.offset" style="transition: stroke-dasharray 0.5s;"/>
                              }
                            </svg>
                            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                              <span style="font-size:17px;font-family:var(--font-heading);font-weight:800">{{ classeKpis().totalClasses }}</span>
                            </div>
                          </div>
                          <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0">
                            @for (seg of classeFiliereDonut(); track seg.label) {
                              <div style="display:flex;align-items:center;gap:8px;font-size:12px">
                                <span style="width:10px;height:10px;flex:none" [style.background]="seg.color"></span>
                                <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ seg.label }}</span>
                                <strong>{{ seg.value }}</strong>
                              </div>
                            }
                          </div>
                        </div>
                      } @else {
                        <div class="text-muted" style="height:110px;display:flex;align-items:center;justify-content:center;width:100%;font-size:13px">Aucune donnée</div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="position:relative;flex:1">
              <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">search</span>
              <input type="text" placeholder="Rechercher une classe..." [ngModel]="classeSearch()" (ngModelChange)="classeSearch.set($event)" class="input" style="padding-left:34px" />
            </div>
            <select [ngModel]="classeNiveauFilter()" (ngModelChange)="classeNiveauFilter.set($event)" class="input" style="max-width:170px">
              <option value="">Tous les niveaux</option>
              @for (n of niveauxOptions(); track n) { <option [value]="n">{{ n }}</option> }
            </select>
            <select [ngModel]="classeFiliereFilter()" (ngModelChange)="classeFiliereFilter.set($event)" class="input" style="max-width:200px">
              <option value="">Toutes les filières</option>
              @for (f of filieres(); track f.id) { <option [value]="f.id">{{ f.nom }}</option> }
            </select>
          </div>

          @if (showClasseForm()) {
            <div class="dialog-backdrop" (click)="cancelClasseForm()">
              <div class="dialog" style="width:min(560px, 100%)" (click)="$event.stopPropagation()">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span class="dialog-title">{{ editingClasse() ? 'Modifier' : 'Nouvelle' }} classe</span>
                  <button class="btn btn-icon btn-secondary" (click)="cancelClasseForm()"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div class="field"><label>Nom</label><input type="text" placeholder="Nom" [(ngModel)]="formData.classe.nom" class="input" /></div>
                  <div class="field"><label>Niveau</label><input type="text" placeholder="Niveau" [(ngModel)]="formData.classe.niveau" class="input" /></div>
                  <div class="field" style="grid-column:1/-1">
                    <label>Filières <span style="color:var(--color-accent-700)">*</span> <span class="text-muted" style="font-weight:400">(une classe peut appartenir à plusieurs filières)</span></label>
                    <div class="gs-well" style="display:flex;flex-wrap:wrap;gap:8px">
                      @for (f of filieres(); track f.id) {
                        <button type="button" (click)="toggleClasseFiliere(f.id)" class="btn btn-sm" [class]="formData.classe.filiereIds.includes(f.id) ? 'btn-primary' : 'btn-secondary'">{{ f.nom }}</button>
                      } @empty {
                        <span class="text-muted" style="font-size:12px">Aucune filière créée — ajoutez-en une dans l'onglet Filières.</span>
                      }
                    </div>
                  </div>
                  <div class="field" style="grid-column:1/-1"><label>Capacité max</label><input type="number" placeholder="Capacité max" [(ngModel)]="formData.classe.capaciteMax" class="input" /></div>
                </div>
                <div class="dialog-actions">
                  <button (click)="cancelClasseForm()" class="btn btn-secondary">Annuler</button>
                  <button (click)="saveClasse()" class="btn btn-primary">{{ editingClasse() ? 'Modifier' : 'Créer' }}</button>
                </div>
              </div>
            </div>
          }
          <div style="overflow-x:auto">
            <table class="table"><thead><tr><th>Nom</th><th>Niveau</th><th>Filière</th><th>Capacité</th><th>Inscrits</th><th>Matieres</th><th>Actions</th></tr></thead>
            <tbody>
              @for (c of pagedClasses(); track c.id) {
                <tr><td>{{ c.nom }}</td><td>{{ c.niveau }}</td><td><div style="display:flex;flex-wrap:wrap;gap:4px">@for (cf of c.filieres; track cf.filiereId) { <span class="tag tag-neutral">{{ cf.filiere?.nom }}</span> }</div></td><td>{{ c.capaciteMax }}</td><td>{{ c._count?.inscriptions || 0 }}</td><td>{{ c._count?.classeMatieres || 0 }}</td>
                  <td><div style="display:flex;gap:4px"><button (click)="goToClasseDetails(c.id)" class="btn btn-icon btn-secondary" title="Détails"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button><button (click)="editClasse(c)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button><button (click)="confirmDeleteClasse(c.id)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></div></td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table-empty">Aucune classe enregistrée</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="classePage()" [pageSize]="pageSize" [totalItems]="filteredClasses().length" (pageChange)="classePage.set($event)"></app-pagination>
        </div></div>
      }

      @if (activeTab()==='matieres') {
        <div class="gs-panel"><div class="gs-panel-body">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h3 style="margin:0">Matières ({{ filteredMatieres().length }})</h3>
            <button (click)="openMatiereForm()" class="btn btn-primary"><span class="material-symbols-outlined" style="font-size:18px">add</span> Ajouter</button>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="position:relative;flex:1">
              <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">search</span>
              <input type="text" placeholder="Rechercher par code ou nom..." [ngModel]="matiereSearch()" (ngModelChange)="matiereSearch.set($event)" class="input" style="padding-left:34px" />
            </div>
            <select [ngModel]="matiereClasseFilter()" (ngModelChange)="matiereClasseFilter.set($event)" class="input" style="max-width:200px">
              <option value="">Toutes les classes</option>
              @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
            </select>
          </div>
          @if (showMatiereForm()) {
            <div class="dialog-backdrop" (click)="cancelMatiereForm()">
              <div class="dialog" (click)="$event.stopPropagation()">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span class="dialog-title">{{ editingMatiere() ? 'Modifier' : 'Nouvelle' }} matière</span>
                  <button class="btn btn-icon btn-secondary" (click)="cancelMatiereForm()"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
                </div>
                <div class="field"><label>Code</label><input type="text" placeholder="Code" [(ngModel)]="formData.matiere.code" class="input" /></div>
                <div class="field"><label>Nom</label><input type="text" placeholder="Nom" [(ngModel)]="formData.matiere.nom" class="input" /></div>
                <div class="field"><label>Coefficient</label><input type="number" placeholder="Coefficient" [(ngModel)]="formData.matiere.coefficient" class="input" /></div>
                <div class="dialog-actions">
                  <button (click)="cancelMatiereForm()" class="btn btn-secondary">Annuler</button>
                  <button (click)="saveMatiere()" class="btn btn-primary">{{ editingMatiere() ? 'Modifier' : 'Créer' }}</button>
                </div>
              </div>
            </div>
          }
          <div style="overflow-x:auto">
            <table class="table"><thead><tr><th>Code</th><th>Nom</th><th>Coefficient</th><th>Classes</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              @for (m of pagedMatieres(); track m.id) {
                <tr><td style="font-weight:600">{{ m.code }}</td><td>{{ m.nom }}</td><td>{{ m.coefficient }}</td><td>{{ m._count?.classeMatieres || 0 }}</td><td>{{ m._count?.notes || 0 }}</td>
                  <td><div style="display:flex;gap:4px"><button (click)="editMatiere(m)" class="btn btn-icon btn-secondary" title="Modifier"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button><button (click)="confirmDeleteMatiere(m.id)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></div></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="table-empty">Aucune matière trouvée</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="matierePage()" [pageSize]="pageSize" [totalItems]="filteredMatieres().length" (pageChange)="matierePage.set($event)"></app-pagination>
        </div></div>
      }

      @if (activeTab()==='enseignants') {
        <div class="gs-panel"><div class="gs-panel-body">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h3 style="margin:0">Enseignants ({{ filteredEnseignants().length }})</h3>
            <button (click)="openEnseignantForm()" class="btn btn-primary"><span class="material-symbols-outlined" style="font-size:18px">person_add</span> Ajouter</button>
          </div>
          @if (showEnseignantForm()) {
            <div class="dialog-backdrop" (click)="showEnseignantForm.set(false)">
              <div class="dialog" style="width:min(560px, 100%)" (click)="$event.stopPropagation()">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span class="dialog-title">Nouvel enseignant</span>
                  <button class="btn btn-icon btn-secondary" (click)="showEnseignantForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
                </div>
                <p class="text-muted" style="font-size:12px;margin:-6px 0 0">Un mot de passe temporaire sera généré automatiquement et affiché une seule fois : à vous de le communiquer à l'enseignant, qui devra le changer dès sa première connexion.</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div class="field"><label>Nom</label><input type="text" placeholder="Nom" [(ngModel)]="formData.enseignant.nom" class="input" /></div>
                  <div class="field"><label>Prénom</label><input type="text" placeholder="Prénom" [(ngModel)]="formData.enseignant.prenom" class="input" /></div>
                  <div class="field"><label>Email</label><input type="email" placeholder="Email" [(ngModel)]="formData.enseignant.email" class="input" /></div>
                  <div class="field"><label>Téléphone</label><input type="text" placeholder="Téléphone" [(ngModel)]="formData.enseignant.telephone" class="input" /></div>
                  @if (enseignantClasseFilter()) {
                    <div class="field" style="grid-column:1/-1">
                      <label>Matière à affecter (optionnel)</label>
                      <select [ngModel]="enseignantAffectMatiereId()" (ngModelChange)="enseignantAffectMatiereId.set($event)" class="input">
                        <option value="">Matière à affecter (optionnel)</option>
                        @for (m of matieres(); track m.id) { <option [value]="m.id">{{ m.nom }} ({{ m.code }})</option> }
                      </select>
                    </div>
                  }
                </div>
                <div class="dialog-actions">
                  <button (click)="showEnseignantForm.set(false)" class="btn btn-secondary">Annuler</button>
                  <button (click)="createEnseignant()" class="btn btn-primary">Créer</button>
                </div>
              </div>
            </div>
          }
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="position:relative;flex:1">
              <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">search</span>
              <input type="text" placeholder="Rechercher par nom, prénom ou email..." [ngModel]="enseignantSearch()" (ngModelChange)="enseignantSearch.set($event)" class="input" style="padding-left:34px" />
            </div>
            <select [ngModel]="enseignantStatutFilter()" (ngModelChange)="enseignantStatutFilter.set($event)" class="input" style="max-width:170px">
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
            </select>
            <select [ngModel]="enseignantClasseFilter()" (ngModelChange)="enseignantClasseFilter.set($event)" class="input" style="max-width:200px">
              <option value="">Toutes les classes</option>
              @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
            </select>
          </div>
          <div style="overflow-x:auto">
            <table class="table"><thead><tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              @for (e of pagedEnseignants(); track e.id) {
                <tr><td>{{ e.nom }}</td><td>{{ e.prenom }}</td><td>{{ e.email }}</td><td>{{ e.telephone || '—' }}</td>
                  <td><span class="tag" [class]="e.statut==='ACTIF' ? 'tag-success' : 'tag-accent'">{{ e.statut }}</span></td>
                  <td><div style="display:flex;gap:4px">
                    <button (click)="toggleUserStatut(e)" class="btn btn-icon btn-secondary" title="{{ e.statut==='ACTIF' ? 'Désactiver' : 'Activer' }}"><span class="material-symbols-outlined" style="font-size:18px">{{ e.statut==='ACTIF' ? 'block' : 'check_circle' }}</span></button>
                    <button (click)="resetPassword(e.id)" class="btn btn-icon btn-secondary" title="Reset mot de passe"><span class="material-symbols-outlined" style="font-size:18px">key</span></button>
                    <button (click)="confirmDeleteUser(e.id)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
                  </div></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="table-empty">Aucun enseignant trouvé</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="enseignantPage()" [pageSize]="pageSize" [totalItems]="filteredEnseignants().length" (pageChange)="enseignantPage.set($event)"></app-pagination>
        </div></div>
      }

      @if (credentials(); as c) {
        <div class="dialog-backdrop">
          <div class="dialog">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">{{ c.label }}</span>
              <button class="btn btn-icon btn-secondary" (click)="credentials.set(null)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div class="gs-well" style="display:flex;align-items:center;gap:8px;color:var(--color-accent-700);font-size:13px">
              <span class="material-symbols-outlined" style="font-size:18px">info</span>
              Ce mot de passe ne sera plus jamais affiché. Communiquez-le à l'utilisateur ; il devra le changer dès sa première connexion.
            </div>
            <div class="field"><label>Email</label><div style="font-size:14px">{{ c.email }}</div></div>
            <div class="field">
              <label>Mot de passe temporaire</label>
              <div style="display:flex;align-items:center;gap:8px">
                <code style="flex:1;font-size:13px;font-family:monospace;background:color-mix(in srgb, var(--color-text) 4%, transparent);border:1px solid var(--color-divider);padding:8px 12px">{{ c.password }}</code>
                <button (click)="copyPassword(c.password)" class="btn btn-secondary btn-sm"><span class="material-symbols-outlined" style="font-size:16px">content_copy</span>Copier</button>
              </div>
            </div>
            <div class="dialog-actions">
              <button (click)="credentials.set(null)" class="btn btn-primary">Fermer</button>
            </div>
          </div>
        </div>
      }

      @if (activeTab()==='etudiants') {
        <div class="gs-panel"><div class="gs-panel-body">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h3 style="margin:0">Étudiants ({{ filteredEtudiants().length }})</h3>
            <button (click)="openEtudiantForm()" class="btn btn-primary"><span class="material-symbols-outlined" style="font-size:18px">person_add</span> Ajouter</button>
          </div>
          @if (showEtudiantForm()) {
            <div class="dialog-backdrop" (click)="showEtudiantForm.set(false)">
              <div class="dialog" style="width:min(640px, 100%);max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span class="dialog-title">Nouvel élève</span>
                  <button class="btn btn-icon btn-secondary" (click)="showEtudiantForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div class="field"><label>Nom</label><input type="text" placeholder="Nom" [(ngModel)]="formDataEtudiant.nom" class="input" /></div>
                  <div class="field"><label>Prénom</label><input type="text" placeholder="Prénom" [(ngModel)]="formDataEtudiant.prenom" class="input" /></div>
                  <div class="field"><label>Date de naissance</label><input type="date" placeholder="Date de naissance" [(ngModel)]="formDataEtudiant.dateNaissance" class="input" /></div>
                  <div class="field"><label>Lieu de naissance</label><input type="text" placeholder="Lieu de naissance" [(ngModel)]="formDataEtudiant.lieuNaissance" class="input" /></div>
                  <div class="field"><label>Sexe</label><select [(ngModel)]="formDataEtudiant.sexe" class="input"><option value="">Sexe</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
                  <div class="field"><label>Téléphone</label><input type="text" placeholder="Téléphone" [(ngModel)]="formDataEtudiant.telephone" class="input" /></div>
                  <div class="field"><label>Email</label><input type="email" placeholder="Email" [(ngModel)]="formDataEtudiant.email" class="input" /></div>
                  <div class="field"><label>Contact parent</label><input type="text" placeholder="Contact parent" [(ngModel)]="formDataEtudiant.contactParentNom" class="input" /></div>
                  <div class="field"><label>Tél. parent</label><input type="text" placeholder="Tél. parent" [(ngModel)]="formDataEtudiant.contactParentTelephone" class="input" /></div>
                  <div class="field"><label>Matricule BAC</label><input type="text" placeholder="Matricule BAC" [(ngModel)]="formDataEtudiant.matriculeBac" class="input" /></div>
                </div>
                <div class="dialog-actions">
                  <button (click)="showEtudiantForm.set(false)" class="btn btn-secondary">Annuler</button>
                  <button (click)="createEtudiant()" class="btn btn-primary">Créer</button>
                </div>
              </div>
            </div>
          }
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="position:relative;flex:1">
              <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:18px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">search</span>
              <input type="text" placeholder="Rechercher par nom, prénom, email, téléphone ou matricule..." [ngModel]="etudiantSearch()" (ngModelChange)="etudiantSearch.set($event)" class="input" style="padding-left:34px" />
            </div>
            <select [ngModel]="etudiantClasseFilter()" (ngModelChange)="etudiantClasseFilter.set($event)" class="input" style="max-width:200px">
              <option value="">Toutes les classes</option>
              @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
            </select>
            <select [ngModel]="etudiantStatutFilter()" (ngModelChange)="etudiantStatutFilter.set($event)" class="input" style="max-width:170px">
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="CANDIDAT">Candidat</option>
            </select>
          </div>
          <div style="overflow-x:auto">
            <table class="table"><thead><tr><th>Nom</th><th>Prénom</th><th>Téléphone</th><th>Email</th><th>Classe</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              @for (e of pagedEtudiants(); track e.id) {
                <tr><td>{{ e.nom }}</td><td>{{ e.prenom }}</td><td>{{ e.telephone || '—' }}</td><td>{{ e.email || '—' }}</td>
                  <td>{{ e.inscriptions?.[0]?.classe?.nom || '—' }}</td>
                  <td><span class="tag" [class]="e.statut==='ACTIF' ? 'tag-success' : 'tag-accent'">{{ e.statut }}</span></td>
                  <td><div style="display:flex;gap:4px">
                    <button (click)="openInscriptionForm(e)" class="btn btn-icon btn-secondary" title="Inscrire dans une classe"><span class="material-symbols-outlined" style="font-size:18px">school</span></button>
                  </div></td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table-empty">Aucun étudiant trouvé</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="etudiantPage()" [pageSize]="pageSize" [totalItems]="filteredEtudiants().length" (pageChange)="etudiantPage.set($event)"></app-pagination>
          @if (showInscriptionForm()) {
            <div class="dialog-backdrop" (click)="showInscriptionForm.set(false)">
              <div class="dialog" (click)="$event.stopPropagation()">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span class="dialog-title">Inscrire — {{ inscriptionTarget()?.nom }} {{ inscriptionTarget()?.prenom }}</span>
                  <button class="btn btn-icon btn-secondary" (click)="showInscriptionForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
                </div>
                <div class="field"><label>Classe</label><select [(ngModel)]="inscriptionData.classeId" class="input"><option value="">Classe</option>@for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }} ({{ filiereLabel(c) }})</option> }</select></div>
                <div class="field"><label>Année scolaire</label><select [(ngModel)]="inscriptionData.anneeScolaireId" class="input"><option value="">Année scolaire</option>@for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }}</option> }</select></div>
                <div class="dialog-actions">
                  <button (click)="showInscriptionForm.set(false)" class="btn btn-secondary">Annuler</button>
                  <button (click)="inscrireEtudiant()" class="btn btn-primary">Inscrire</button>
                </div>
              </div>
            </div>
          }
        </div></div>
      }

      @if (activeTab()==='affectations-enseignants') {
        <app-dsi-affectations></app-dsi-affectations>
      }

      @if (activeTab()==='annees') {
        <div class="gs-panel"><div class="gs-panel-body">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h3 style="margin:0">Années scolaires ({{ annees().length }})</h3>
            <button (click)="showAnneeForm.set(true)" class="btn btn-primary"><span class="material-symbols-outlined" style="font-size:18px">add</span> Ajouter</button>
          </div>
          @if (showAnneeForm()) {
            <div class="dialog-backdrop" (click)="showAnneeForm.set(false)">
              <div class="dialog" style="width:min(560px, 100%)" (click)="$event.stopPropagation()">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span class="dialog-title">Nouvelle année scolaire</span>
                  <button class="btn btn-icon btn-secondary" (click)="showAnneeForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div class="field" style="grid-column:1/-1"><label>Libellé</label><input type="text" placeholder="Libellé (2024-2025)" [(ngModel)]="newAnnee.libelle" class="input" /></div>
                  <div class="field"><label>Date début</label><input type="date" placeholder="Date début" [(ngModel)]="newAnnee.dateDebut" class="input" /></div>
                  <div class="field"><label>Date fin</label><input type="date" placeholder="Date fin" [(ngModel)]="newAnnee.dateFin" class="input" /></div>
                  <div class="field" style="grid-column:1/-1"><label>Statut</label><select [(ngModel)]="newAnnee.statut" class="input"><option value="preparation">Préparation</option><option value="active">Active</option><option value="terminee">Terminée</option></select></div>
                </div>
                <div class="dialog-actions">
                  <button (click)="showAnneeForm.set(false)" class="btn btn-secondary">Annuler</button>
                  <button (click)="createAnnee()" class="btn btn-primary">Créer</button>
                </div>
              </div>
            </div>
          }
          <div style="overflow-x:auto">
            <table class="table"><thead><tr><th>Libellé</th><th>Début</th><th>Fin</th><th>Statut</th></tr></thead>
            <tbody>
              @for (a of annees(); track a.id) {
                <tr><td style="font-weight:600">{{ a.libelle }}</td><td>{{ a.dateDebut | date:'dd/MM/yyyy' }}</td><td>{{ a.dateFin | date:'dd/MM/yyyy' }}</td>
                  <td><span class="tag" [class]="a.statut==='active' ? 'tag-success' : (a.statut==='preparation' ? 'tag-accent' : 'tag-neutral')">{{ a.statut }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="table-empty">Aucune année scolaire enregistrée</td></tr>
              }
            </tbody></table>
          </div>
        </div></div>
      }

      @if (activeTab()==='audit') {
        <div class="gs-panel">
          <div class="gs-panel-head"><h3 style="margin:0">Journal d'audit</h3></div>
          <div class="gs-panel-body">
            <div style="overflow-x:auto">
              <table class="table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Table</th><th>ID</th></tr></thead>
              <tbody>
                @for (a of audit().data || []; track a.id) {
                  <tr><td>{{ a.date | date:'dd/MM/yyyy HH:mm' }}</td><td>{{ a.utilisateur?.nom }} {{ a.utilisateur?.prenom }}</td>
                    <td><span class="tag tag-neutral">{{ a.action }}</span></td><td>{{ a.tableName }}</td><td class="text-muted" style="font-size:12px">{{ a.recordId }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="table-empty">Aucune entrée dans le journal</td></tr>
                }
              </tbody></table>
            </div>
            @if (audit().totalPages > 1) {
              <div style="display:flex;align-items:center;justify-content:center;gap:16px;padding-top:16px;margin-top:16px;border-top:1px solid var(--color-divider)">
                <button [disabled]="auditPage()<=1" (click)="changeAuditPage(auditPage()-1)" class="btn btn-secondary btn-sm">Précédent</button>
                <span style="font-size:13px">Page {{ auditPage() }} / {{ audit().totalPages }}</span>
                <button [disabled]="auditPage()>=audit().totalPages" (click)="changeAuditPage(auditPage()+1)" class="btn btn-secondary btn-sm">Suivant</button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DsiHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private dsiTabService = inject(DsiTabService);
  private router = inject(Router);

  filiereLabel = filiereLabel;
  activeTab = this.dsiTabService.activeTab;

  pageSize = 10;
  filierePage = signal(1);
  classePage = signal(1);
  matierePage = signal(1);
  enseignantPage = signal(1);
  etudiantPage = signal(1);

  private paginate<T>(list: T[], page: number): T[] {
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  ecole: any = { nom: '', telephone: '', email: '', siteWeb: '', adresse: '', description: '', logoUrl: '' };
  filieres = signal<any[]>([]);
  pagedFilieres = computed(() => this.paginate(this.filieres(), this.filierePage()));
  classes = signal<any[]>([]);
  classeSearch = signal('');
  classeNiveauFilter = signal('');
  classeFiliereFilter = signal('');
  showClasseStats = signal(true);

  niveauxOptions = computed(() => {
    const set = new Set(this.classes().map((c: any) => c.niveau).filter(Boolean));
    return Array.from(set).sort();
  });

  filteredClasses = computed(() => {
    let list = this.classes();
    const s = this.classeSearch().toLowerCase().trim();
    if (s) list = list.filter((c: any) => c.nom.toLowerCase().includes(s));
    const nf = this.classeNiveauFilter();
    if (nf) list = list.filter((c: any) => c.niveau === nf);
    const ff = this.classeFiliereFilter();
    if (ff) list = list.filter((c: any) => (c.filieres || []).some((cf: any) => cf.filiereId === ff));
    return list;
  });
  pagedClasses = computed(() => this.paginate(this.filteredClasses(), this.classePage()));

  classeKpis = computed(() => {
    const list = this.classes();
    const totalClasses = list.length;
    const totalInscrits = list.reduce((s: number, c: any) => s + (c._count?.inscriptions || 0), 0);
    const capaciteTotale = list.reduce((s: number, c: any) => s + (c.capaciteMax || 0), 0);
    const tauxRemplissage = capaciteTotale > 0 ? Math.round((totalInscrits / capaciteTotale) * 100) : 0;
    return { totalClasses, totalInscrits, capaciteTotale, tauxRemplissage };
  });

  classeEffectifsBars = computed(() => {
    const data = this.classes();
    if (!data.length) return [];
    const width = 500, height = 200, padding = 20, topMargin = 15;
    const chartHeight = height - padding * 2 - topMargin;
    const max = Math.max(...data.map((c: any) => c._count?.inscriptions || 0), 1);
    const slot = (width - padding * 2) / data.length;
    const barWidth = Math.min(40, slot * 0.55);
    return data.map((c: any, i: number) => {
      const value = c._count?.inscriptions || 0;
      const h = (value / max) * chartHeight;
      return {
        x: padding + i * slot + (slot - barWidth) / 2,
        y: height - padding - h,
        width: barWidth,
        height: h,
        label: c.nom,
        value,
      };
    });
  });

  classeFiliereDonut = computed(() => {
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];
    const counts = new Map<string, number>();
    for (const c of this.classes()) {
      for (const cf of c.filieres || []) {
        const nom = cf.filiere?.nom;
        if (!nom) continue;
        counts.set(nom, (counts.get(nom) || 0) + 1);
      }
    }
    const total = Array.from(counts.values()).reduce((s, v) => s + v, 0);
    if (total === 0) return [];
    let offset = 0;
    return Array.from(counts.entries()).map(([label, value], i) => {
      const pct = (value / total) * 100;
      const seg = { label, value, pct, color: colors[i % colors.length], offset };
      offset += pct;
      return seg;
    });
  });
  matieres = signal<any[]>([]);
  matiereSearch = signal('');
  matiereClasseFilter = signal('');
  filteredMatieres = computed(() => {
    let list = this.matieres();
    const s = this.matiereSearch().trim().toLowerCase();
    if (s) {
      list = list.filter(m => m.code?.toLowerCase().includes(s) || m.nom?.toLowerCase().includes(s));
    }
    const cf = this.matiereClasseFilter();
    if (cf) {
      list = list.filter(m => m.classeMatieres?.some((cm: any) => cm.classeId === cf));
    }
    return list;
  });
  pagedMatieres = computed(() => this.paginate(this.filteredMatieres(), this.matierePage()));
  annees = signal<any[]>([]);
  enseignants = signal<any[]>([]);
  enseignantSearch = signal('');
  enseignantStatutFilter = signal('');
  enseignantClasseFilter = signal('');
  enseignantAffectMatiereId = signal('');
  filteredEnseignants = computed(() => {
    let list = this.enseignants();
    const s = this.enseignantSearch().trim().toLowerCase();
    if (s) {
      list = list.filter(e => e.nom?.toLowerCase().includes(s) || e.prenom?.toLowerCase().includes(s) || e.email?.toLowerCase().includes(s));
    }
    const sf = this.enseignantStatutFilter();
    if (sf) {
      list = list.filter(e => e.statut === sf);
    }
    const cf = this.enseignantClasseFilter();
    if (cf) {
      list = list.filter(e => e.affectations?.some((a: any) => a.classeId === cf));
    }
    return list;
  });
  pagedEnseignants = computed(() => this.paginate(this.filteredEnseignants(), this.enseignantPage()));
  etudiants = signal<any[]>([]);
  etudiantSearch = signal('');
  etudiantClasseFilter = signal('');
  etudiantStatutFilter = signal('');
  filteredEtudiants = computed(() => {
    let list = this.etudiants();
    const s = this.etudiantSearch().trim().toLowerCase();
    if (s) {
      list = list.filter(e => e.nom?.toLowerCase().includes(s) || e.prenom?.toLowerCase().includes(s) || e.email?.toLowerCase().includes(s) || e.telephone?.includes(s) || e.matriculeBac?.toLowerCase().includes(s));
    }
    const cf = this.etudiantClasseFilter();
    if (cf) {
      list = list.filter(e => e.inscriptions?.some((i: any) => i.classe?.id === cf));
    }
    const sf = this.etudiantStatutFilter();
    if (sf) {
      list = list.filter(e => e.statut === sf);
    }
    return list;
  });
  pagedEtudiants = computed(() => this.paginate(this.filteredEtudiants(), this.etudiantPage()));
  audit = signal<any>({ data: [], total: 0, totalPages: 0 });
  credentials = signal<{ label: string; email: string; password: string } | null>(null);

  showFiliereForm = signal(false);
  showClasseForm = signal(false);
  showMatiereForm = signal(false);
  showEnseignantForm = signal(false);
  showAnneeForm = signal(false);
  showEtudiantForm = signal(false);

  editingFiliere = signal<string | null>(null);
  editingClasse = signal<string | null>(null);
  editingMatiere = signal<string | null>(null);

  formData = {
    filiere: { code: '', nom: '', description: '' },
    classe: { nom: '', niveau: '', filiereIds: [] as string[], capaciteMax: 50 },
    matiere: { code: '', nom: '', coefficient: 1 },
    enseignant: { nom: '', prenom: '', email: '', telephone: '' },
  };
  formDataEtudiant = { nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '', telephone: '', email: '', contactParentNom: '', contactParentTelephone: '', matriculeBac: '' };

  newAnnee: any = { libelle: '', dateDebut: '', dateFin: '', statut: 'preparation' };
  auditPage = signal(1);

  showInscriptionForm = signal(false);
  inscriptionTarget = signal<any>(null);
  inscriptionData = { classeId: '', anneeScolaireId: '' };

  ngOnInit() { this.loadAll(); }

  async confirmDeleteFiliere(id: string) { if (await this.alertService.confirm({ title: 'Supprimer cette filière ?', confirmText: 'Supprimer', danger: true })) this.deleteFiliere(id); }
  async confirmDeleteClasse(id: string) { if (await this.alertService.confirm({ title: 'Supprimer cette classe ?', confirmText: 'Supprimer', danger: true })) this.deleteClasse(id); }
  async confirmDeleteMatiere(id: string) { if (await this.alertService.confirm({ title: 'Supprimer cette matière ?', confirmText: 'Supprimer', danger: true })) this.deleteMatiere(id); }
  async confirmDeleteUser(id: string) { if (await this.alertService.confirm({ title: 'Supprimer cet utilisateur ?', confirmText: 'Supprimer', danger: true })) this.deleteUser(id); }

  loadAll() {
    this.loadEcole(); this.loadFilieres(); this.loadClasses(); this.loadMatieres();
    this.loadAnnees(); this.loadEnseignants(); this.loadEtudiants(); this.loadAudit();
  }

  loadEcole() { this.http.get<any>(`${environment.apiUrl}/dsi/ecole`).subscribe({ next: (d) => this.ecole = d, error: () => {} }); }
  saveEcole() { this.http.patch(`${environment.apiUrl}/dsi/ecole`, this.ecole).subscribe({ next: () => { this.loadEcole(); this.alertService.success('Paramètres enregistrés'); }, error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) }); }

  loadFilieres() { this.http.get<any[]>(`${environment.apiUrl}/dsi/filieres`).subscribe({ next: (d) => this.filieres.set(d), error: () => this.filieres.set([]) }); }
  openFiliereForm() { this.editingFiliere.set(null); this.formData.filiere = { code: '', nom: '', description: '' }; this.showFiliereForm.set(true); }
  editFiliere(f: any) { this.editingFiliere.set(f.id); this.formData.filiere = { code: f.code, nom: f.nom, description: f.description || '' }; this.showFiliereForm.set(true); }
  cancelFiliereForm() { this.showFiliereForm.set(false); this.editingFiliere.set(null); }
  saveFiliere() {
    if (!this.formData.filiere.code || !this.formData.filiere.nom) { this.alertService.error('Code et nom requis'); return; }
    if (this.editingFiliere()) {
      this.http.patch(`${environment.apiUrl}/dsi/filieres/${this.editingFiliere()}`, this.formData.filiere).subscribe({ next: () => { this.loadFilieres(); this.cancelFiliereForm(); }, error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) });
    } else {
      this.http.post(`${environment.apiUrl}/dsi/filieres`, this.formData.filiere).subscribe({ next: () => { this.loadFilieres(); this.cancelFiliereForm(); }, error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) });
    }
  }
  deleteFiliere(id: string) { this.http.delete(`${environment.apiUrl}/dsi/filieres/${id}`).subscribe({ next: () => this.loadFilieres(), error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) }); }

  loadClasses() { this.http.get<any[]>(`${environment.apiUrl}/dsi/classes`).subscribe({ next: (d) => this.classes.set(d), error: () => this.classes.set([]) }); }
  openClasseForm() { this.editingClasse.set(null); this.formData.classe = { nom: '', niveau: '', filiereIds: [], capaciteMax: 50 }; this.showClasseForm.set(true); }
  editClasse(c: any) { this.editingClasse.set(c.id); this.formData.classe = { nom: c.nom, niveau: c.niveau, filiereIds: filiereIds(c), capaciteMax: c.capaciteMax }; this.showClasseForm.set(true); }
  cancelClasseForm() { this.showClasseForm.set(false); this.editingClasse.set(null); }
  toggleClasseFiliere(filiereId: string) {
    const ids = this.formData.classe.filiereIds;
    const i = ids.indexOf(filiereId);
    if (i >= 0) ids.splice(i, 1); else ids.push(filiereId);
  }
  saveClasse() {
    if (!this.formData.classe.nom || !this.formData.classe.niveau || this.formData.classe.filiereIds.length === 0) { this.alertService.error('Nom, niveau et au moins une filière requis'); return; }
    if (this.editingClasse()) {
      this.http.patch(`${environment.apiUrl}/dsi/classes/${this.editingClasse()}`, this.formData.classe).subscribe({ next: () => { this.loadClasses(); this.cancelClasseForm(); }, error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) });
    } else {
      this.http.post(`${environment.apiUrl}/dsi/classes`, this.formData.classe).subscribe({ next: () => { this.loadClasses(); this.cancelClasseForm(); }, error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) });
    }
  }
  deleteClasse(id: string) { this.http.delete(`${environment.apiUrl}/dsi/classes/${id}`).subscribe({ next: () => this.loadClasses(), error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) }); }
  goToClasseDetails(classeId: string) { this.router.navigate(['/dsi/classes', classeId]); }

  loadMatieres() { this.http.get<any[]>(`${environment.apiUrl}/dsi/matieres`).subscribe({ next: (d) => this.matieres.set(d), error: () => this.matieres.set([]) }); }
  openMatiereForm() { this.editingMatiere.set(null); this.formData.matiere = { code: '', nom: '', coefficient: 1 }; this.showMatiereForm.set(true); }
  editMatiere(m: any) { this.editingMatiere.set(m.id); this.formData.matiere = { code: m.code, nom: m.nom, coefficient: m.coefficient }; this.showMatiereForm.set(true); }
  cancelMatiereForm() { this.showMatiereForm.set(false); this.editingMatiere.set(null); }
  saveMatiere() {
    if (!this.formData.matiere.code || !this.formData.matiere.nom) { this.alertService.error('Code et nom requis'); return; }
    if (this.editingMatiere()) {
      this.http.patch(`${environment.apiUrl}/dsi/matieres/${this.editingMatiere()}`, this.formData.matiere).subscribe({ next: () => { this.loadMatieres(); this.cancelMatiereForm(); }, error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) });
    } else {
      this.http.post<any>(`${environment.apiUrl}/dsi/matieres`, this.formData.matiere).subscribe({
        next: (created) => {
          if (this.matiereClasseFilter()) {
            this.http.post(`${environment.apiUrl}/dsi/classes/${this.matiereClasseFilter()}/matieres`, { matiereId: created.id, coefficient: +this.formData.matiere.coefficient }).subscribe({
              next: () => { this.loadMatieres(); this.cancelMatiereForm(); },
              error: (e) => { this.loadMatieres(); this.cancelMatiereForm(); this.alertService.error('Matière créée mais affectation échouée: ' + (e.error?.message || 'échec')); },
            });
          } else {
            this.loadMatieres(); this.cancelMatiereForm();
          }
        },
        error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
      });
    }
  }
  deleteMatiere(id: string) { this.http.delete(`${environment.apiUrl}/dsi/matieres/${id}`).subscribe({ next: () => this.loadMatieres(), error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) }); }

  loadEnseignants() { this.http.get<any>(`${environment.apiUrl}/users?limit=1000&role=ENSEIGNANT`).subscribe({ next: (res) => this.enseignants.set(res.data || []), error: () => this.enseignants.set([]) }); }
  openEnseignantForm() { this.formData.enseignant = { nom: '', prenom: '', email: '', telephone: '' }; this.enseignantAffectMatiereId.set(''); this.showEnseignantForm.set(true); }
  createEnseignant() {
    const d = this.formData.enseignant;
    if (!d.nom || !d.prenom || !d.email) { this.alertService.error('Tous les champs requis'); return; }
    this.http.post<CreateUserResponse>(`${environment.apiUrl}/users`, { ...d, role: 'ENSEIGNANT' }).subscribe({
      next: (res) => {
        const created = res.user;
        this.credentials.set({ label: 'Enseignant créé', email: created.email, password: res.temporaryPassword });
        if (this.enseignantClasseFilter() && this.enseignantAffectMatiereId()) {
          this.http.post(`${environment.apiUrl}/etudes/affectations`, {
            enseignantId: created.id,
            matiereId: this.enseignantAffectMatiereId(),
            classeId: this.enseignantClasseFilter(),
          }).subscribe({
            next: () => { this.loadEnseignants(); this.showEnseignantForm.set(false); },
            error: (e) => { this.loadEnseignants(); this.showEnseignantForm.set(false); this.alertService.error('Enseignant créé mais affectation échouée: ' + (e.error?.message || 'échec')); },
          });
        } else {
          this.loadEnseignants(); this.showEnseignantForm.set(false);
        }
      },
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  copyPassword(password: string) { navigator.clipboard?.writeText(password); }

  deleteUser(id: string) { this.http.delete(`${environment.apiUrl}/users/${id}`).subscribe({ next: () => this.loadEnseignants(), error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) }); }
  toggleUserStatut(u: any) {
    const newStatut = u.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    this.http.patch(`${environment.apiUrl}/users/${u.id}/statut`, { statut: newStatut }).subscribe({ next: () => this.loadEnseignants(), error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) });
  }
  async resetPassword(id: string) {
    const ok = await this.alertService.confirm({ title: 'Générer un nouveau mot de passe temporaire pour cet utilisateur ?', confirmText: 'Générer' });
    if (!ok) return;
    this.http.post<{ message: string; temporaryPassword: string }>(`${environment.apiUrl}/users/${id}/reset-password`, {}).subscribe({
      next: (res) => this.credentials.set({ label: 'Mot de passe réinitialisé', email: this.enseignants().find(e => e.id === id)?.email || '', password: res.temporaryPassword }),
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  loadAnnees() { this.http.get<any[]>(`${environment.apiUrl}/dsi/annees-scolaires`).subscribe({ next: (d) => this.annees.set(d), error: () => this.annees.set([]) }); }
  createAnnee() {
    if (!this.newAnnee.libelle || !this.newAnnee.dateDebut || !this.newAnnee.dateFin) { this.alertService.error('Libellé et dates requis'); return; }
    this.http.post(`${environment.apiUrl}/dsi/annees-scolaires`, this.newAnnee).subscribe({ next: () => { this.loadAnnees(); this.showAnneeForm.set(false); this.newAnnee = { libelle: '', dateDebut: '', dateFin: '', statut: 'preparation' }; }, error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) });
  }

  loadEtudiants() { this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({ next: (res) => this.etudiants.set(res.data || res || []), error: () => this.etudiants.set([]) }); }
  openInscriptionForm(etudiant: any) {
    this.inscriptionTarget.set(etudiant);
    this.inscriptionData = { classeId: '', anneeScolaireId: '' };
    this.showInscriptionForm.set(true);
  }
  inscrireEtudiant() {
    const etudiant = this.inscriptionTarget();
    if (!etudiant || !this.inscriptionData.classeId || !this.inscriptionData.anneeScolaireId) {
      this.alertService.error('Classe et année scolaire requises'); return;
    }
    this.http.post(`${environment.apiUrl}/etudiants/inscrire`, {
      etudiantId: etudiant.id,
      classeId: this.inscriptionData.classeId,
      anneeScolaireId: this.inscriptionData.anneeScolaireId,
    }).subscribe({
      next: () => { this.loadEtudiants(); this.showInscriptionForm.set(false); this.alertService.success('Étudiant inscrit avec succès'); },
      error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')),
    });
  }
  openEtudiantForm() { this.formDataEtudiant = { nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '', telephone: '', email: '', contactParentNom: '', contactParentTelephone: '', matriculeBac: '' }; this.showEtudiantForm.set(true); }
  createEtudiant() {
    const d = this.formDataEtudiant;
    if (!d.nom || !d.prenom) { this.alertService.error('Nom et prénom requis'); return; }
    this.http.post(`${environment.apiUrl}/etudiants`, d).subscribe({ next: () => { this.loadEtudiants(); this.showEtudiantForm.set(false); }, error: (e) => this.alertService.error('Erreur: ' + (e.error?.message || 'échec')) });
  }

  loadAudit() { this.http.get<any>(`${environment.apiUrl}/dsi/audit?page=${this.auditPage()}&limit=50`).subscribe({ next: (d) => this.audit.set(d), error: () => this.audit.set({ data: [], total: 0, totalPages: 0 }) }); }
  changeAuditPage(page: number) { this.auditPage.set(page); this.loadAudit(); }
}
