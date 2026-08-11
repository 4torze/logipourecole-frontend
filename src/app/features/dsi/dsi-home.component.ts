import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { DsiTabService } from '../../core/services/dsi-tab.service';
import { DsiAffectationsComponent } from './dsi-affectations.component';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-dsi-home',
  standalone: true,
  imports: [CommonModule, FormsModule, DsiAffectationsComponent, PaginationComponent],
  template: `
    <div class="page-container">
      @if (activeTab()==='ecole') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <h3 class="font-bold text-lg text-slate-900 mb-5">Paramètres de l'école</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Nom</label><input type="text" [(ngModel)]="ecole.nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Téléphone</label><input type="text" [(ngModel)]="ecole.telephone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Email</label><input type="email" [(ngModel)]="ecole.email" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Site web</label><input type="text" [(ngModel)]="ecole.siteWeb" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Logo URL</label><input type="text" [(ngModel)]="ecole.logoUrl" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm" /></div>
            <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Adresse</label><input type="text" [(ngModel)]="ecole.adresse" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm" /></div>
            <div class="flex flex-col gap-1.5 md:col-span-2"><label class="text-xs font-semibold text-slate-700">Description</label><textarea rows="3" [(ngModel)]="ecole.description" class="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm resize-none"></textarea></div>
          </div>
          <button (click)="saveEcole()" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm mt-5"><span class="material-symbols-outlined text-xl">save</span> Enregistrer</button>
        </div>
      }

      @if (activeTab()==='filieres') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-lg text-slate-900">Filières ({{ filieres().length }})</h3>
            <button (click)="openFiliereForm()" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm"><span class="material-symbols-outlined text-xl">add</span> Ajouter</button>
          </div>
          @if (showFiliereForm()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="cancelFiliereForm()">
              <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">{{ editingFiliere() ? 'Modifier' : 'Nouvelle' }} filière</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="cancelFiliereForm()"><span class="material-symbols-outlined">close</span></button></div>
                <div class="p-6 space-y-4">
                  <input type="text" placeholder="Code" [(ngModel)]="formData.filiere.code" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Nom" [(ngModel)]="formData.filiere.nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Description" [(ngModel)]="formData.filiere.description" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <div class="flex gap-3"><button (click)="saveFiliere()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">{{ editingFiliere() ? 'Modifier' : 'Créer' }}</button><button (click)="cancelFiliereForm()" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
                </div>
              </div>
            </div>
          }
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Code</th><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Description</th><th class="px-4 py-3 text-left font-semibold">Classes</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (f of pagedFilieres(); track f.id) {
                <tr class="hover:bg-slate-50"><td class="px-4 py-3 font-semibold text-slate-900">{{ f.code }}</td><td class="px-4 py-3 text-slate-700">{{ f.nom }}</td><td class="px-4 py-3 text-slate-500">{{ f.description || '—' }}</td><td class="px-4 py-3 text-slate-600">{{ f._count?.classes || 0 }}</td>
                  <td class="px-4 py-3"><div class="flex items-center gap-1"><button (click)="editFiliere(f)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary" title="Modifier"><span class="material-symbols-outlined text-lg">edit</span></button><button (click)="confirmDeleteFiliere(f.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-red-500" title="Supprimer"><span class="material-symbols-outlined text-lg">delete</span></button></div></td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center text-slate-400 py-8">Aucune filière enregistrée</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="filierePage()" [pageSize]="pageSize" [totalItems]="filieres().length" (pageChange)="filierePage.set($event)"></app-pagination>
        </div>
      }

      @if (activeTab()==='classes') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-lg text-slate-900">Classes ({{ classes().length }})</h3>
            <button (click)="openClasseForm()" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm"><span class="material-symbols-outlined text-xl">add</span> Ajouter</button>
          </div>
          @if (showClasseForm()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="cancelClasseForm()">
              <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">{{ editingClasse() ? 'Modifier' : 'Nouvelle' }} classe</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="cancelClasseForm()"><span class="material-symbols-outlined">close</span></button></div>
                <div class="p-6 grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom" [(ngModel)]="formData.classe.nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Niveau" [(ngModel)]="formData.classe.niveau" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <select [(ngModel)]="formData.classe.filiereId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm col-span-2"><option value="">Filière</option>@for (f of filieres(); track f.id) { <option [value]="f.id">{{ f.nom }}</option> }</select>
                  <input type="number" placeholder="Capacité max" [(ngModel)]="formData.classe.capaciteMax" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm col-span-2" />
                  <div class="col-span-2 flex gap-3"><button (click)="saveClasse()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">{{ editingClasse() ? 'Modifier' : 'Créer' }}</button><button (click)="cancelClasseForm()" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
                </div>
              </div>
            </div>
          }
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Niveau</th><th class="px-4 py-3 text-left font-semibold">Filière</th><th class="px-4 py-3 text-left font-semibold">Capacité</th><th class="px-4 py-3 text-left font-semibold">Inscrits</th><th class="px-4 py-3 text-left font-semibold">Matieres</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (c of pagedClasses(); track c.id) {
                <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-700">{{ c.nom }}</td><td class="px-4 py-3 text-slate-600">{{ c.niveau }}</td><td class="px-4 py-3 text-slate-600">{{ c.filiere?.nom }}</td><td class="px-4 py-3 text-slate-600">{{ c.capaciteMax }}</td><td class="px-4 py-3 text-slate-600">{{ c._count?.inscriptions || 0 }}</td><td class="px-4 py-3 text-slate-600">{{ c._count?.classeMatieres || 0 }}</td>
                  <td class="px-4 py-3"><div class="flex items-center gap-1"><button (click)="openClasseDetails(c.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary" title="Détails"><span class="material-symbols-outlined text-lg">visibility</span></button><button (click)="editClasse(c)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary" title="Modifier"><span class="material-symbols-outlined text-lg">edit</span></button><button (click)="confirmDeleteClasse(c.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-red-500" title="Supprimer"><span class="material-symbols-outlined text-lg">delete</span></button></div></td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center text-slate-400 py-8">Aucune classe enregistrée</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="classePage()" [pageSize]="pageSize" [totalItems]="classes().length" (pageChange)="classePage.set($event)"></app-pagination>
        </div>
      }

      @if (showClasseDetails()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="closeClasseDetails()">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div class="flex items-center gap-3">
                <h3 class="font-bold text-slate-900">{{ classeDetails()?.classe?.nom || 'Classe' }}</h3>
                @if (classeDetails()?.classe?.filiere?.nom) { <span class="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{{ classeDetails()?.classe?.filiere?.nom }}</span> }
                @if (classeDetails()?.anneeActive) { <span class="text-xs text-slate-500 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{{ classeDetails()?.anneeActive }}</span> }
              </div>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="closeClasseDetails()"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="px-6 pt-4">
              <div class="flex gap-1 border-b border-slate-100">
                @for (tab of classeDetailTabs; track tab.key) {
                  <button (click)="classeDetailTab.set(tab.key)" class="px-4 py-2.5 text-sm font-medium border-b-2 transition-all" [class]="classeDetailTab()===tab.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'">{{ tab.label }}</button>
                }
              </div>
            </div>
            <div class="p-6">
              @if (classeDetailTab()==='eleves') {
                <div class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Prénom</th><th class="px-4 py-3 text-left font-semibold">Sexe</th><th class="px-4 py-3 text-left font-semibold">Téléphone</th><th class="px-4 py-3 text-left font-semibold">Email</th></tr></thead>
                  <tbody class="divide-y divide-slate-50">
                    @for (e of classeDetails()?.etudiants || []; track e.id) {
                      <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-700">{{ e.nom }}</td><td class="px-4 py-3 text-slate-700">{{ e.prenom }}</td><td class="px-4 py-3 text-slate-600">{{ e.sexe || '—' }}</td><td class="px-4 py-3 text-slate-600">{{ e.telephone || '—' }}</td><td class="px-4 py-3 text-slate-600">{{ e.email || '—' }}</td></tr>
                    } @empty {
                      <tr><td colspan="5" class="text-center text-slate-400 py-8">Aucun élève inscrit</td></tr>
                    }
                  </tbody></table>
                </div>
              }
              @if (classeDetailTab()==='enseignants') {
                <div class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Prénom</th><th class="px-4 py-3 text-left font-semibold">Matière</th><th class="px-4 py-3 text-left font-semibold">Email</th><th class="px-4 py-3 text-left font-semibold">Téléphone</th><th class="px-4 py-3 text-left font-semibold">Statut</th></tr></thead>
                  <tbody class="divide-y divide-slate-50">
                    @for (a of classeDetails()?.enseignants || []; track a.id) {
                      <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-700">{{ a.enseignant?.nom }}</td><td class="px-4 py-3 text-slate-700">{{ a.enseignant?.prenom }}</td><td class="px-4 py-3 text-slate-600">{{ a.matiere?.nom }}</td><td class="px-4 py-3 text-slate-600">{{ a.enseignant?.email }}</td><td class="px-4 py-3 text-slate-600">{{ a.enseignant?.telephone || '—' }}</td>
                        <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="a.enseignant?.statut==='ACTIF' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">{{ a.enseignant?.statut }}</span></td>
                      </tr>
                    } @empty {
                      <tr><td colspan="6" class="text-center text-slate-400 py-8">Aucun enseignant affecté</td></tr>
                    }
                  </tbody></table>
                </div>
              }
              @if (classeDetailTab()==='matieres') {
                <div class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Matière</th><th class="px-4 py-3 text-left font-semibold">Code</th><th class="px-4 py-3 text-left font-semibold">Coefficient</th></tr></thead>
                  <tbody class="divide-y divide-slate-50">
                    @for (cm of classeDetails()?.matieres || []; track cm.id) {
                      <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-700">{{ cm.matiere?.nom }}</td><td class="px-4 py-3 text-slate-600">{{ cm.matiere?.code }}</td><td class="px-4 py-3 text-slate-600">{{ cm.coefficient }}</td></tr>
                    } @empty {
                      <tr><td colspan="3" class="text-center text-slate-400 py-8">Aucune matière affectée</td></tr>
                    }
                  </tbody></table>
                </div>
              }
              @if (classeDetailTab()==='edt') {
                @if (classeEdt().length > 0) {
                  <div class="space-y-3">
                    @for (slot of classeEdt(); track slot.id) {
                      <div class="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                        <div class="flex-shrink-0 w-24 text-center"><div class="text-xs font-semibold text-slate-900">{{ jourLabel(slot.jourSemaine) }}</div>@if (slot.dateDebut) { <div class="text-xs text-slate-500">{{ slot.dateDebut | date:'dd/MM/yyyy' }}</div> }</div>
                        <div class="flex-shrink-0 text-sm text-slate-600">{{ slot.heureDebut }} — {{ slot.heureFin }}</div>
                        <div class="flex-1"><div class="text-sm font-medium text-slate-900">{{ slot.matiere?.nom }}</div><div class="text-xs text-slate-500">{{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }}</div></div>
                        <div class="flex-shrink-0 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{{ slot.salle?.nom || '—' }}</div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center text-slate-400 py-8">Aucun créneau d'emploi du temps</div>
                }
                <button (click)="viewClasseEdt()" class="mt-4 flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm"><span class="material-symbols-outlined text-xl">calendar_month</span> Voir l'emploi du temps complet</button>
              }
            </div>
          </div>
        </div>
      }

      @if (activeTab()==='matieres') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-lg text-slate-900">Matières ({{ filteredMatieres().length }})</h3>
            <button (click)="openMatiereForm()" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm"><span class="material-symbols-outlined text-xl">add</span> Ajouter</button>
          </div>
          <div class="flex items-center gap-3 mb-4">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input type="text" placeholder="Rechercher par code ou nom..." [ngModel]="matiereSearch()" (ngModelChange)="matiereSearch.set($event)" class="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
            </div>
            <select [ngModel]="matiereClasseFilter()" (ngModelChange)="matiereClasseFilter.set($event)" class="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/40 min-w-[180px]">
              <option value="">Toutes les classes</option>
              @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
            </select>
          </div>
          @if (showMatiereForm()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="cancelMatiereForm()">
              <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">{{ editingMatiere() ? 'Modifier' : 'Nouvelle' }} matière</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="cancelMatiereForm()"><span class="material-symbols-outlined">close</span></button></div>
                <div class="p-6 space-y-4">
                  <input type="text" placeholder="Code" [(ngModel)]="formData.matiere.code" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Nom" [(ngModel)]="formData.matiere.nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="number" placeholder="Coefficient" [(ngModel)]="formData.matiere.coefficient" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <div class="flex gap-3"><button (click)="saveMatiere()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">{{ editingMatiere() ? 'Modifier' : 'Créer' }}</button><button (click)="cancelMatiereForm()" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
                </div>
              </div>
            </div>
          }
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Code</th><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Coefficient</th><th class="px-4 py-3 text-left font-semibold">Classes</th><th class="px-4 py-3 text-left font-semibold">Notes</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (m of pagedMatieres(); track m.id) {
                <tr class="hover:bg-slate-50"><td class="px-4 py-3 font-semibold text-slate-900">{{ m.code }}</td><td class="px-4 py-3 text-slate-700">{{ m.nom }}</td><td class="px-4 py-3 text-slate-600">{{ m.coefficient }}</td><td class="px-4 py-3 text-slate-600">{{ m._count?.classeMatieres || 0 }}</td><td class="px-4 py-3 text-slate-600">{{ m._count?.notes || 0 }}</td>
                  <td class="px-4 py-3"><div class="flex items-center gap-1"><button (click)="editMatiere(m)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary" title="Modifier"><span class="material-symbols-outlined text-lg">edit</span></button><button (click)="confirmDeleteMatiere(m.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-red-500" title="Supprimer"><span class="material-symbols-outlined text-lg">delete</span></button></div></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="text-center text-slate-400 py-8">Aucune matière trouvée</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="matierePage()" [pageSize]="pageSize" [totalItems]="filteredMatieres().length" (pageChange)="matierePage.set($event)"></app-pagination>
        </div>
      }

      @if (activeTab()==='enseignants') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-lg text-slate-900">Enseignants ({{ filteredEnseignants().length }})</h3>
            <button (click)="openEnseignantForm()" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm"><span class="material-symbols-outlined text-xl">person_add</span> Ajouter</button>
          </div>
          @if (showEnseignantForm()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showEnseignantForm.set(false)">
              <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">Nouvel enseignant</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showEnseignantForm.set(false)"><span class="material-symbols-outlined">close</span></button></div>
                <div class="p-6 grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom" [(ngModel)]="formData.enseignant.nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Prénom" [(ngModel)]="formData.enseignant.prenom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="email" placeholder="Email" [(ngModel)]="formData.enseignant.email" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Téléphone" [(ngModel)]="formData.enseignant.telephone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="password" placeholder="Mot de passe (min 6 caractères)" [(ngModel)]="formData.enseignant.motDePasse" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm col-span-2" />
                  @if (enseignantClasseFilter()) {
                    <select [ngModel]="enseignantAffectMatiereId()" (ngModelChange)="enseignantAffectMatiereId.set($event)" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm col-span-2">
                      <option value="">Matière à affecter (optionnel)</option>
                      @for (m of matieres(); track m.id) { <option [value]="m.id">{{ m.nom }} ({{ m.code }})</option> }
                    </select>
                  }
                  <div class="col-span-2 flex gap-3"><button (click)="createEnseignant()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">Créer</button><button (click)="showEnseignantForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
                </div>
              </div>
            </div>
          }
          <div class="flex items-center gap-3 mb-4">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input type="text" placeholder="Rechercher par nom, prénom ou email..." [ngModel]="enseignantSearch()" (ngModelChange)="enseignantSearch.set($event)" class="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
            </div>
            <select [ngModel]="enseignantStatutFilter()" (ngModelChange)="enseignantStatutFilter.set($event)" class="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/40 min-w-[150px]">
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
            </select>
            <select [ngModel]="enseignantClasseFilter()" (ngModelChange)="enseignantClasseFilter.set($event)" class="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/40 min-w-[180px]">
              <option value="">Toutes les classes</option>
              @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
            </select>
          </div>
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Prénom</th><th class="px-4 py-3 text-left font-semibold">Email</th><th class="px-4 py-3 text-left font-semibold">Téléphone</th><th class="px-4 py-3 text-left font-semibold">Statut</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (e of pagedEnseignants(); track e.id) {
                <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-700">{{ e.nom }}</td><td class="px-4 py-3 text-slate-700">{{ e.prenom }}</td><td class="px-4 py-3 text-slate-600">{{ e.email }}</td><td class="px-4 py-3 text-slate-600">{{ e.telephone || '—' }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="e.statut==='ACTIF' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">{{ e.statut }}</span></td>
                  <td class="px-4 py-3"><div class="flex items-center gap-1">
                    <button (click)="toggleUserStatut(e)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="{{ e.statut==='ACTIF' ? 'Désactiver' : 'Activer' }}"><span class="material-symbols-outlined text-lg">{{ e.statut==='ACTIF' ? 'block' : 'check_circle' }}</span></button>
                    <button (click)="resetPassword(e.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Reset mot de passe"><span class="material-symbols-outlined text-lg">key</span></button>
                    <button (click)="confirmDeleteUser(e.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-red-500" title="Supprimer"><span class="material-symbols-outlined text-lg">delete</span></button>
                  </div></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="text-center text-slate-400 py-8">Aucun enseignant trouvé</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="enseignantPage()" [pageSize]="pageSize" [totalItems]="filteredEnseignants().length" (pageChange)="enseignantPage.set($event)"></app-pagination>
        </div>
      }

      @if (activeTab()==='utilisateurs') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-lg text-slate-900">Utilisateurs ({{ utilisateurs().length }})</h3>
            <button (click)="openUserForm()" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm"><span class="material-symbols-outlined text-xl">person_add</span> Ajouter</button>
          </div>
          @if (showUserForm()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="cancelUserForm()">
              <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">{{ editingUser() ? 'Modifier' : 'Nouvel' }} utilisateur</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="cancelUserForm()"><span class="material-symbols-outlined">close</span></button></div>
                <div class="p-6 grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom" [(ngModel)]="formData.user.nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Prénom" [(ngModel)]="formData.user.prenom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="email" placeholder="Email" [(ngModel)]="formData.user.email" [disabled]="editingUser()" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm disabled:opacity-60" />
                  <input type="text" placeholder="Téléphone" [(ngModel)]="formData.user.telephone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <select [(ngModel)]="formData.user.role" [disabled]="editingUser()" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm disabled:opacity-60"><option value="DG">Directeur Général</option><option value="DAF">DAF (Finances)</option><option value="ETUDES">Direction des Études</option><option value="MARKETING">Marketing</option><option value="SECRETAIRE">Secrétariat</option><option value="DSI">DSI</option><option value="ENSEIGNANT">Enseignant</option></select>
                  @if (!editingUser()) {
                    <input type="password" placeholder="Mot de passe (min 6)" [(ngModel)]="formData.user.motDePasse" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  }
                  <div class="col-span-2 flex gap-3"><button (click)="saveUser()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">{{ editingUser() ? 'Modifier' : 'Créer' }}</button><button (click)="cancelUserForm()" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
                </div>
              </div>
            </div>
          }
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Prénom</th><th class="px-4 py-3 text-left font-semibold">Email</th><th class="px-4 py-3 text-left font-semibold">Rôle</th><th class="px-4 py-3 text-left font-semibold">Statut</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (u of utilisateurs(); track u.id) {
                <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-700">{{ u.nom }}</td><td class="px-4 py-3 text-slate-700">{{ u.prenom }}</td><td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{{ u.role }}</span></td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="u.statut==='ACTIF' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">{{ u.statut }}</span></td>
                  <td class="px-4 py-3"><div class="flex items-center gap-1">
                    <button (click)="editUser(u)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary" title="Modifier"><span class="material-symbols-outlined text-lg">edit</span></button>
                    <button (click)="toggleUserStatut(u)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="{{ u.statut==='ACTIF' ? 'Désactiver' : 'Activer' }}"><span class="material-symbols-outlined text-lg">{{ u.statut==='ACTIF' ? 'block' : 'check_circle' }}</span></button>
                    <button (click)="resetPassword(u.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Reset mot de passe"><span class="material-symbols-outlined text-lg">key</span></button>
                    <button (click)="confirmDeleteUser(u.id)" class="p-1.5 rounded-lg hover:bg-slate-100 text-red-500" title="Supprimer"><span class="material-symbols-outlined text-lg">delete</span></button>
                  </div></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="text-center text-slate-400 py-8">Aucun utilisateur enregistré</td></tr>
              }
            </tbody></table>
          </div>
        </div>
      }

      @if (activeTab()==='etudiants') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-lg text-slate-900">Étudiants ({{ filteredEtudiants().length }})</h3>
            <button (click)="openEtudiantForm()" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm"><span class="material-symbols-outlined text-xl">person_add</span> Ajouter</button>
          </div>
          @if (showEtudiantForm()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showEtudiantForm.set(false)">
              <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10"><h3 class="font-bold text-slate-900">Nouvel élève</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showEtudiantForm.set(false)"><span class="material-symbols-outlined">close</span></button></div>
                <div class="p-6 grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom" [(ngModel)]="formDataEtudiant.nom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Prénom" [(ngModel)]="formDataEtudiant.prenom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="date" placeholder="Date de naissance" [(ngModel)]="formDataEtudiant.dateNaissance" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Lieu de naissance" [(ngModel)]="formDataEtudiant.lieuNaissance" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <select [(ngModel)]="formDataEtudiant.sexe" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Sexe</option><option value="M">Masculin</option><option value="F">Féminin</option></select>
                  <input type="text" placeholder="Téléphone" [(ngModel)]="formDataEtudiant.telephone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="email" placeholder="Email" [(ngModel)]="formDataEtudiant.email" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Contact parent" [(ngModel)]="formDataEtudiant.contactParentNom" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Tél. parent" [(ngModel)]="formDataEtudiant.contactParentTelephone" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="text" placeholder="Matricule BAC" [(ngModel)]="formDataEtudiant.matriculeBac" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <div class="col-span-2 flex gap-3 mt-2"><button (click)="createEtudiant()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">Créer</button><button (click)="showEtudiantForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
                </div>
              </div>
            </div>
          }
          <div class="flex items-center gap-3 mb-4">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input type="text" placeholder="Rechercher par nom, prénom, email, téléphone ou matricule..." [ngModel]="etudiantSearch()" (ngModelChange)="etudiantSearch.set($event)" class="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
            </div>
            <select [ngModel]="etudiantClasseFilter()" (ngModelChange)="etudiantClasseFilter.set($event)" class="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/40 min-w-[180px]">
              <option value="">Toutes les classes</option>
              @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
            </select>
            <select [ngModel]="etudiantStatutFilter()" (ngModelChange)="etudiantStatutFilter.set($event)" class="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/40 min-w-[150px]">
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="CANDIDAT">Candidat</option>
            </select>
          </div>
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Nom</th><th class="px-4 py-3 text-left font-semibold">Prénom</th><th class="px-4 py-3 text-left font-semibold">Téléphone</th><th class="px-4 py-3 text-left font-semibold">Email</th><th class="px-4 py-3 text-left font-semibold">Classe</th><th class="px-4 py-3 text-left font-semibold">Statut</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (e of pagedEtudiants(); track e.id) {
                <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-700">{{ e.nom }}</td><td class="px-4 py-3 text-slate-700">{{ e.prenom }}</td><td class="px-4 py-3 text-slate-600">{{ e.telephone || '—' }}</td><td class="px-4 py-3 text-slate-600">{{ e.email || '—' }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ e.inscriptions?.[0]?.classe?.nom || '—' }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="e.statut==='ACTIF' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">{{ e.statut }}</span></td>
                  <td class="px-4 py-3"><div class="flex items-center gap-1">
                    <button (click)="openInscriptionForm(e)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary" title="Inscrire dans une classe"><span class="material-symbols-outlined text-lg">school</span></button>
                  </div></td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center text-slate-400 py-8">Aucun étudiant trouvé</td></tr>
              }
            </tbody></table>
          </div>
          <app-pagination [page]="etudiantPage()" [pageSize]="pageSize" [totalItems]="filteredEtudiants().length" (pageChange)="etudiantPage.set($event)"></app-pagination>
          @if (showInscriptionForm()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showInscriptionForm.set(false)">
              <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">Inscrire — {{ inscriptionTarget()?.nom }} {{ inscriptionTarget()?.prenom }}</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showInscriptionForm.set(false)"><span class="material-symbols-outlined">close</span></button></div>
                <div class="p-6 space-y-4">
                  <select [(ngModel)]="inscriptionData.classeId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Classe</option>@for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }} ({{ c.filiere?.nom || '' }})</option> }</select>
                  <select [(ngModel)]="inscriptionData.anneeScolaireId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">Année scolaire</option>@for (a of annees(); track a.id) { <option [value]="a.id">{{ a.libelle }}</option> }</select>
                  <div class="flex gap-3"><button (click)="inscrireEtudiant()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">Inscrire</button><button (click)="showInscriptionForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (activeTab()==='affectations-enseignants') {
        <app-dsi-affectations></app-dsi-affectations>
      }

      @if (activeTab()==='annees') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-lg text-slate-900">Années scolaires ({{ annees().length }})</h3>
            <button (click)="showAnneeForm.set(true)" class="flex items-center gap-2 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm"><span class="material-symbols-outlined text-xl">add</span> Ajouter</button>
          </div>
          @if (showAnneeForm()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showAnneeForm.set(false)">
              <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-slate-900">Nouvelle année scolaire</h3><button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showAnneeForm.set(false)"><span class="material-symbols-outlined">close</span></button></div>
                <div class="p-6 grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Libellé (2024-2025)" [(ngModel)]="newAnnee.libelle" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="date" placeholder="Date début" [(ngModel)]="newAnnee.dateDebut" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <input type="date" placeholder="Date fin" [(ngModel)]="newAnnee.dateFin" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                  <select [(ngModel)]="newAnnee.statut" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="preparation">Préparation</option><option value="active">Active</option><option value="terminee">Terminée</option></select>
                  <div class="col-span-2 flex gap-3"><button (click)="createAnnee()" class="h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">Créer</button><button (click)="showAnneeForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button></div>
                </div>
              </div>
            </div>
          }
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Libellé</th><th class="px-4 py-3 text-left font-semibold">Début</th><th class="px-4 py-3 text-left font-semibold">Fin</th><th class="px-4 py-3 text-left font-semibold">Statut</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (a of annees(); track a.id) {
                <tr class="hover:bg-slate-50"><td class="px-4 py-3 font-semibold text-slate-900">{{ a.libelle }}</td><td class="px-4 py-3 text-slate-600">{{ a.dateDebut | date:'dd/MM/yyyy' }}</td><td class="px-4 py-3 text-slate-600">{{ a.dateFin | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="a.statut==='active' ? 'bg-green-100 text-green-800' : (a.statut==='preparation' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')">{{ a.statut }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="text-center text-slate-400 py-8">Aucune année scolaire enregistrée</td></tr>
              }
            </tbody></table>
          </div>
        </div>
      }

      @if (activeTab()==='audit') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100"><h3 class="font-bold text-lg text-slate-900">Journal d'audit</h3></div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th class="px-4 py-3 text-left font-semibold">Date</th><th class="px-4 py-3 text-left font-semibold">Utilisateur</th><th class="px-4 py-3 text-left font-semibold">Action</th><th class="px-4 py-3 text-left font-semibold">Table</th><th class="px-4 py-3 text-left font-semibold">ID</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              @for (a of audit().data || []; track a.id) {
                <tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-600">{{ a.date | date:'dd/MM/yyyy HH:mm' }}</td><td class="px-4 py-3 text-slate-700">{{ a.utilisateur?.nom }} {{ a.utilisateur?.prenom }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{{ a.action }}</span></td><td class="px-4 py-3 text-slate-600">{{ a.tableName }}</td><td class="px-4 py-3"><span class="text-xs text-slate-500">{{ a.recordId }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center text-slate-400 py-8">Aucune entrée dans le journal</td></tr>
              }
            </tbody></table>
          </div>
          @if (audit().totalPages > 1) {
            <div class="flex items-center justify-center gap-4 px-6 py-4 border-t border-slate-100">
              <button [disabled]="auditPage()<=1" (click)="changeAuditPage(auditPage()-1)" class="h-9 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Précédent</button>
              <span class="text-sm text-slate-600">Page {{ auditPage() }} / {{ audit().totalPages }}</span>
              <button [disabled]="auditPage()>=audit().totalPages" (click)="changeAuditPage(auditPage()+1)" class="h-9 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Suivant</button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DsiHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private dsiTabService = inject(DsiTabService);
  private router = inject(Router);

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
  pagedClasses = computed(() => this.paginate(this.classes(), this.classePage()));
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
  utilisateurs = signal<any[]>([]);
  audit = signal<any>({ data: [], total: 0, totalPages: 0 });
  classeMatieres = signal<any[]>([]);

  showFiliereForm = signal(false);
  showClasseForm = signal(false);
  showMatiereForm = signal(false);
  showEnseignantForm = signal(false);
  showUserForm = signal(false);
  showAnneeForm = signal(false);
  showEtudiantForm = signal(false);
  showAffectForm = signal(false);

  editingFiliere = signal<string | null>(null);
  editingClasse = signal<string | null>(null);
  editingMatiere = signal<string | null>(null);
  editingUser = signal<string | null>(null);

  formData = {
    filiere: { code: '', nom: '', description: '' },
    classe: { nom: '', niveau: '', filiereId: '', capaciteMax: 50 },
    matiere: { code: '', nom: '', coefficient: 1 },
    enseignant: { nom: '', prenom: '', email: '', telephone: '', motDePasse: '' },
    user: { nom: '', prenom: '', email: '', telephone: '', role: 'ENSEIGNANT', motDePasse: '' },
  };
  formDataEtudiant = { nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '', telephone: '', email: '', contactParentNom: '', contactParentTelephone: '', matriculeBac: '' };

  newAnnee: any = { libelle: '', dateDebut: '', dateFin: '', statut: 'preparation' };
  affectMatiere: any = { classeId: '', matiereId: '', coefficient: 1 };
  affectClasseId = signal('');
  auditPage = signal(1);

  showClasseDetails = signal(false);
  classeDetails = signal<any>(null);
  classeDetailTab = signal('eleves');
  classeDetailTabs = [
    { key: 'eleves', label: 'Élèves' },
    { key: 'enseignants', label: 'Enseignants' },
    { key: 'matieres', label: 'Matières' },
    { key: 'edt', label: 'Emploi du temps' },
  ];
  classeEdt = signal<any[]>([]);

  showInscriptionForm = signal(false);
  inscriptionTarget = signal<any>(null);
  inscriptionData = { classeId: '', anneeScolaireId: '' };

  ngOnInit() { this.loadAll(); }

  confirmDeleteFiliere(id: string) { if (confirm('Supprimer ?')) this.deleteFiliere(id); }
  confirmDeleteClasse(id: string) { if (confirm('Supprimer ?')) this.deleteClasse(id); }
  confirmDeleteMatiere(id: string) { if (confirm('Supprimer ?')) this.deleteMatiere(id); }
  confirmRemoveAffectation(id: string) { if (confirm('Retirer ?')) this.removeAffectation(id); }
  confirmDeleteUser(id: string) { if (confirm('Supprimer cet utilisateur ?')) this.deleteUser(id); }

  loadAll() {
    this.loadEcole(); this.loadFilieres(); this.loadClasses(); this.loadMatieres();
    this.loadAnnees(); this.loadEnseignants(); this.loadEtudiants(); this.loadUtilisateurs(); this.loadAudit();
  }

  loadEcole() { this.http.get<any>(`${environment.apiUrl}/dsi/ecole`).subscribe({ next: (d) => this.ecole = d, error: () => {} }); }
  saveEcole() { this.http.patch(`${environment.apiUrl}/dsi/ecole`, this.ecole).subscribe({ next: () => { this.loadEcole(); alert('Paramètres enregistrés'); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) }); }

  loadFilieres() { this.http.get<any[]>(`${environment.apiUrl}/dsi/filieres`).subscribe({ next: (d) => this.filieres.set(d), error: () => this.filieres.set([]) }); }
  openFiliereForm() { this.editingFiliere.set(null); this.formData.filiere = { code: '', nom: '', description: '' }; this.showFiliereForm.set(true); }
  editFiliere(f: any) { this.editingFiliere.set(f.id); this.formData.filiere = { code: f.code, nom: f.nom, description: f.description || '' }; this.showFiliereForm.set(true); }
  cancelFiliereForm() { this.showFiliereForm.set(false); this.editingFiliere.set(null); }
  saveFiliere() {
    if (!this.formData.filiere.code || !this.formData.filiere.nom) { alert('Code et nom requis'); return; }
    if (this.editingFiliere()) {
      this.http.patch(`${environment.apiUrl}/dsi/filieres/${this.editingFiliere()}`, this.formData.filiere).subscribe({ next: () => { this.loadFilieres(); this.cancelFiliereForm(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
    } else {
      this.http.post(`${environment.apiUrl}/dsi/filieres`, this.formData.filiere).subscribe({ next: () => { this.loadFilieres(); this.cancelFiliereForm(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
    }
  }
  deleteFiliere(id: string) { this.http.delete(`${environment.apiUrl}/dsi/filieres/${id}`).subscribe({ next: () => this.loadFilieres(), error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) }); }

  loadClasses() { this.http.get<any[]>(`${environment.apiUrl}/dsi/classes`).subscribe({ next: (d) => this.classes.set(d), error: () => this.classes.set([]) }); }
  openClasseForm() { this.editingClasse.set(null); this.formData.classe = { nom: '', niveau: '', filiereId: '', capaciteMax: 50 }; this.showClasseForm.set(true); }
  editClasse(c: any) { this.editingClasse.set(c.id); this.formData.classe = { nom: c.nom, niveau: c.niveau, filiereId: c.filiereId, capaciteMax: c.capaciteMax }; this.showClasseForm.set(true); }
  cancelClasseForm() { this.showClasseForm.set(false); this.editingClasse.set(null); }
  saveClasse() {
    if (!this.formData.classe.nom || !this.formData.classe.niveau || !this.formData.classe.filiereId) { alert('Nom, niveau et filière requis'); return; }
    if (this.editingClasse()) {
      this.http.patch(`${environment.apiUrl}/dsi/classes/${this.editingClasse()}`, this.formData.classe).subscribe({ next: () => { this.loadClasses(); this.cancelClasseForm(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
    } else {
      this.http.post(`${environment.apiUrl}/dsi/classes`, this.formData.classe).subscribe({ next: () => { this.loadClasses(); this.cancelClasseForm(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
    }
  }
  deleteClasse(id: string) { this.http.delete(`${environment.apiUrl}/dsi/classes/${id}`).subscribe({ next: () => this.loadClasses(), error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) }); }

  openClasseDetails(classeId: string) {
    this.classeDetails.set(null);
    this.classeEdt.set([]);
    this.classeDetailTab.set('eleves');
    this.showClasseDetails.set(true);
    this.http.get<any>(`${environment.apiUrl}/dsi/classes/${classeId}/details`).subscribe({
      next: (d) => { this.classeDetails.set(d); this.loadClasseEdt(classeId); },
      error: (e) => { alert('Erreur: ' + (e.error?.message || 'échec')); this.showClasseDetails.set(false); },
    });
  }
  closeClasseDetails() { this.showClasseDetails.set(false); this.classeDetails.set(null); this.classeEdt.set([]); }
  loadClasseEdt(classeId: string) {
    this.http.get<any[]>(`${environment.apiUrl}/etudes/edt/classe/${classeId}`).subscribe({ next: (d) => this.classeEdt.set(d), error: () => this.classeEdt.set([]) });
  }
  viewClasseEdt() {
    const classeId = this.classeDetails()?.classe?.id;
    if (classeId) {
      this.closeClasseDetails();
      this.router.navigate(['/etudes/emploi-du-temps'], { queryParams: { classeId } });
    }
  }
  jourLabel(j: number): string {
    return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][j] || '—';
  }

  openInscriptionForm(etudiant: any) {
    this.inscriptionTarget.set(etudiant);
    this.inscriptionData = { classeId: '', anneeScolaireId: '' };
    this.showInscriptionForm.set(true);
  }
  inscrireEtudiant() {
    const etudiant = this.inscriptionTarget();
    if (!etudiant || !this.inscriptionData.classeId || !this.inscriptionData.anneeScolaireId) {
      alert('Classe et année scolaire requises'); return;
    }
    this.http.post(`${environment.apiUrl}/etudiants/inscrire`, {
      etudiantId: etudiant.id,
      classeId: this.inscriptionData.classeId,
      anneeScolaireId: this.inscriptionData.anneeScolaireId,
    }).subscribe({
      next: () => { this.loadEtudiants(); this.showInscriptionForm.set(false); alert('Étudiant inscrit avec succès'); },
      error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  loadMatieres() { this.http.get<any[]>(`${environment.apiUrl}/dsi/matieres`).subscribe({ next: (d) => this.matieres.set(d), error: () => this.matieres.set([]) }); }
  openMatiereForm() { this.editingMatiere.set(null); this.formData.matiere = { code: '', nom: '', coefficient: 1 }; this.showMatiereForm.set(true); }
  editMatiere(m: any) { this.editingMatiere.set(m.id); this.formData.matiere = { code: m.code, nom: m.nom, coefficient: m.coefficient }; this.showMatiereForm.set(true); }
  cancelMatiereForm() { this.showMatiereForm.set(false); this.editingMatiere.set(null); }
  saveMatiere() {
    if (!this.formData.matiere.code || !this.formData.matiere.nom) { alert('Code et nom requis'); return; }
    if (this.editingMatiere()) {
      this.http.patch(`${environment.apiUrl}/dsi/matieres/${this.editingMatiere()}`, this.formData.matiere).subscribe({ next: () => { this.loadMatieres(); this.cancelMatiereForm(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
    } else {
      this.http.post<any>(`${environment.apiUrl}/dsi/matieres`, this.formData.matiere).subscribe({
        next: (created) => {
          if (this.matiereClasseFilter()) {
            this.http.post(`${environment.apiUrl}/dsi/classes/${this.matiereClasseFilter()}/matieres`, { matiereId: created.id, coefficient: +this.formData.matiere.coefficient }).subscribe({
              next: () => { this.loadMatieres(); this.cancelMatiereForm(); },
              error: (e) => { this.loadMatieres(); this.cancelMatiereForm(); alert('Matière créée mais affectation échouée: ' + (e.error?.message || 'échec')); },
            });
          } else {
            this.loadMatieres(); this.cancelMatiereForm();
          }
        },
        error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')),
      });
    }
  }
  deleteMatiere(id: string) { this.http.delete(`${environment.apiUrl}/dsi/matieres/${id}`).subscribe({ next: () => this.loadMatieres(), error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) }); }

  onAffectClasseChange(classeId: string) { this.affectClasseId.set(classeId); this.loadClasseMatieres(); }
  assignMatiere() {
    if (!this.affectMatiere.classeId || !this.affectMatiere.matiereId) { alert('Classe et matière requises'); return; }
    this.http.post(`${environment.apiUrl}/dsi/classes/${this.affectMatiere.classeId}/matieres`, { matiereId: this.affectMatiere.matiereId, coefficient: +this.affectMatiere.coefficient }).subscribe({ next: () => { this.showAffectForm.set(false); this.affectClasseId.set(this.affectMatiere.classeId); this.loadClasseMatieres(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
  }
  loadClasseMatieres() { if (!this.affectClasseId()) return; this.http.get<any[]>(`${environment.apiUrl}/dsi/classes/${this.affectClasseId()}/matieres`).subscribe({ next: (d) => this.classeMatieres.set(d), error: () => this.classeMatieres.set([]) }); }
  removeAffectation(affectationId: string) { this.http.delete(`${environment.apiUrl}/dsi/classes/${this.affectClasseId()}/matieres/${affectationId}`).subscribe({ next: () => this.loadClasseMatieres(), error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) }); }

  loadEnseignants() { this.http.get<any>(`${environment.apiUrl}/users?limit=1000&role=ENSEIGNANT`).subscribe({ next: (res) => this.enseignants.set(res.data || []), error: () => this.enseignants.set([]) }); }
  openEnseignantForm() { this.formData.enseignant = { nom: '', prenom: '', email: '', telephone: '', motDePasse: '' }; this.enseignantAffectMatiereId.set(''); this.showEnseignantForm.set(true); }
  createEnseignant() {
    const d = this.formData.enseignant;
    if (!d.nom || !d.prenom || !d.email || !d.motDePasse) { alert('Tous les champs requis'); return; }
    if (d.motDePasse.length < 6) { alert('Mot de passe min 6'); return; }
    this.http.post<any>(`${environment.apiUrl}/users`, { ...d, role: 'ENSEIGNANT' }).subscribe({
      next: (created) => {
        if (this.enseignantClasseFilter() && this.enseignantAffectMatiereId()) {
          this.http.post(`${environment.apiUrl}/etudes/affectations`, {
            enseignantId: created.id,
            matiereId: this.enseignantAffectMatiereId(),
            classeId: this.enseignantClasseFilter(),
          }).subscribe({
            next: () => { this.loadEnseignants(); this.loadUtilisateurs(); this.showEnseignantForm.set(false); },
            error: (e) => { this.loadEnseignants(); this.loadUtilisateurs(); this.showEnseignantForm.set(false); alert('Enseignant créé mais affectation échouée: ' + (e.error?.message || 'échec')); },
          });
        } else {
          this.loadEnseignants(); this.loadUtilisateurs(); this.showEnseignantForm.set(false);
        }
      },
      error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')),
    });
  }

  loadUtilisateurs() { this.http.get<any>(`${environment.apiUrl}/users?limit=100`).subscribe({ next: (res) => this.utilisateurs.set(res.data || []), error: () => this.utilisateurs.set([]) }); }
  openUserForm() { this.editingUser.set(null); this.formData.user = { nom: '', prenom: '', email: '', telephone: '', role: 'ENSEIGNANT', motDePasse: '' }; this.showUserForm.set(true); }
  editUser(u: any) { this.editingUser.set(u.id); this.formData.user = { nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone || '', role: u.role, motDePasse: '' }; this.showUserForm.set(true); }
  cancelUserForm() { this.showUserForm.set(false); this.editingUser.set(null); }
  saveUser() {
    const d = this.formData.user;
    if (!d.nom || !d.prenom || !d.email || !d.role) { alert('Champs requis manquants'); return; }
    if (this.editingUser()) {
      this.http.patch(`${environment.apiUrl}/users/${this.editingUser()}`, { nom: d.nom, prenom: d.prenom, telephone: d.telephone }).subscribe({ next: () => { this.loadUtilisateurs(); this.loadEnseignants(); this.cancelUserForm(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
    } else {
      if (!d.motDePasse || d.motDePasse.length < 6) { alert('Mot de passe min 6'); return; }
      this.http.post(`${environment.apiUrl}/users`, d).subscribe({ next: () => { this.loadUtilisateurs(); this.loadEnseignants(); this.cancelUserForm(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
    }
  }
  deleteUser(id: string) { this.http.delete(`${environment.apiUrl}/users/${id}`).subscribe({ next: () => { this.loadUtilisateurs(); this.loadEnseignants(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) }); }
  toggleUserStatut(u: any) {
    const newStatut = u.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    this.http.patch(`${environment.apiUrl}/users/${u.id}/statut`, { statut: newStatut }).subscribe({ next: () => { this.loadUtilisateurs(); this.loadEnseignants(); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
  }
  resetPassword(id: string) { const pwd = prompt('Nouveau mot de passe (min 6):'); if (!pwd || pwd.length < 6) { if (pwd) alert('Min 6 caractères'); return; } this.http.post(`${environment.apiUrl}/users/${id}/reset-password`, { nouveauMotDePasse: pwd }).subscribe({ next: () => alert('Mot de passe réinitialisé'), error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) }); }

  loadAnnees() { this.http.get<any[]>(`${environment.apiUrl}/dsi/annees-scolaires`).subscribe({ next: (d) => this.annees.set(d), error: () => this.annees.set([]) }); }
  createAnnee() {
    if (!this.newAnnee.libelle || !this.newAnnee.dateDebut || !this.newAnnee.dateFin) { alert('Libellé et dates requis'); return; }
    this.http.post(`${environment.apiUrl}/dsi/annees-scolaires`, this.newAnnee).subscribe({ next: () => { this.loadAnnees(); this.showAnneeForm.set(false); this.newAnnee = { libelle: '', dateDebut: '', dateFin: '', statut: 'preparation' }; }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
  }

  loadEtudiants() { this.http.get<any>(`${environment.apiUrl}/etudiants?limit=1000`).subscribe({ next: (res) => this.etudiants.set(res.data || res || []), error: () => this.etudiants.set([]) }); }
  openEtudiantForm() { this.formDataEtudiant = { nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '', telephone: '', email: '', contactParentNom: '', contactParentTelephone: '', matriculeBac: '' }; this.showEtudiantForm.set(true); }
  createEtudiant() {
    const d = this.formDataEtudiant;
    if (!d.nom || !d.prenom) { alert('Nom et prénom requis'); return; }
    this.http.post(`${environment.apiUrl}/etudiants`, d).subscribe({ next: () => { this.loadEtudiants(); this.showEtudiantForm.set(false); }, error: (e) => alert('Erreur: ' + (e.error?.message || 'échec')) });
  }

  loadAudit() { this.http.get<any>(`${environment.apiUrl}/dsi/audit?page=${this.auditPage()}&limit=50`).subscribe({ next: (d) => this.audit.set(d), error: () => this.audit.set({ data: [], total: 0, totalPages: 0 }) }); }
  changeAuditPage(page: number) { this.auditPage.set(page); this.loadAudit(); }
}
