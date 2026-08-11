import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recu-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-[1200px] mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 m-0">Templates de Reçu</h1>
          <p class="text-sm text-slate-500 mt-1">Gérez vos modèles de reçus de paiement</p>
        </div>
        <button (click)="openCreate()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all active:scale-[0.98] text-sm">
          <span class="material-symbols-outlined text-lg">add</span> Nouveau template
        </button>
      </div>

      <!-- Templates row -->
      @if (templates().length === 0) {
        <div class="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center">
          <span class="material-symbols-outlined text-5xl text-slate-300">description</span>
          <p class="text-slate-400 mt-3 text-sm">Aucun template créé. Cliquez sur « Nouveau template » pour commencer.</p>
        </div>
      } @else {
        <div class="flex gap-5 overflow-x-auto pb-4">
          @for (t of templates(); track t.id) {
            <div class="flex-[0_0_240px] bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div class="w-full h-[200px] overflow-hidden bg-slate-50 border-b border-slate-100 relative">
                <iframe [srcdoc]="getSafePreviewHtmlForTemplate(t)" class="w-[600px] h-[800px] border-none origin-top-left pointer-events-none absolute top-0 left-0" style="transform: scale(0.3);" sandbox="allow-same-origin"></iframe>
                @if (t.isDefault) {
                  <div class="absolute top-2 right-2"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm"><span class="material-symbols-outlined text-sm">check_circle</span> Actif</span></div>
                }
              </div>
              <div class="p-4">
                <h4 class="text-sm font-semibold text-slate-900 m-0 truncate mb-2">{{ t.nom }}</h4>
                <div class="flex items-center gap-2 mb-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" [class]="t.modele === 'PERSONNALISE' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'">{{ t.modele }}</span>
                  <span class="text-xs text-slate-400">{{ t.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="flex gap-1.5">
                  <button (click)="editTemplate(t)" class="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-xs"><span class="material-symbols-outlined text-base">edit</span> Modifier</button>
                  <button (click)="previewExisting(t)" class="flex items-center justify-center w-9 h-9 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" title="Aperçu"><span class="material-symbols-outlined text-base">visibility</span></button>
                  <button (click)="downloadTemplate(t)" class="flex items-center justify-center w-9 h-9 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" title="Télécharger PDF"><span class="material-symbols-outlined text-base">download</span></button>
                  <button (click)="confirmDeleteTemplate(t)" class="flex items-center justify-center w-9 h-9 border border-slate-200 text-red-500 rounded-lg hover:bg-red-50" title="Supprimer"><span class="material-symbols-outlined text-base">delete</span></button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Model choice modal -->
      @if (showModelChoice()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="cancelCreate()">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 class="font-bold text-slate-900">Choisir un modèle de base</h3>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="cancelCreate()"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                @for (tpl of predefinedModels(); track tpl.modele) {
                  <div class="border-2 rounded-xl p-3 cursor-pointer transition-all text-center" [class]="selectedModel() === tpl.modele ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary hover:-translate-y-0.5 hover:shadow-md'" (click)="selectedModel.set(tpl.modele)">
                    <div class="w-full h-[160px] overflow-hidden rounded-lg bg-white border border-slate-100 mb-2.5 relative">
                      <iframe [srcdoc]="getSafePreviewHtml(tpl)" class="w-[600px] h-[800px] border-none origin-top-left pointer-events-none absolute top-0 left-0" style="transform: scale(0.267);" sandbox="allow-same-origin"></iframe>
                    </div>
                    <div class="text-xs font-medium text-slate-700"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 mr-1">{{ tpl.modele }}</span> {{ tpl.nom }}</div>
                  </div>
                }
                <div class="border-2 rounded-xl p-3 cursor-pointer transition-all text-center" [class]="selectedModel() === 'PERSONNALISE' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary hover:-translate-y-0.5 hover:shadow-md'" (click)="selectedModel.set('PERSONNALISE')">
                  <div class="w-full h-[160px] overflow-hidden rounded-lg bg-slate-50 border border-slate-100 mb-2.5 flex flex-col items-center justify-center">
                    <span class="material-symbols-outlined text-slate-400" style="font-size:32px;">edit</span>
                    <div class="mt-1.5 text-xs text-slate-400">Partir de zéro</div>
                  </div>
                  <div class="text-xs font-medium text-slate-700"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 mr-1">PERSO</span> Vide</div>
                </div>
              </div>
              <div class="mt-5 flex gap-2 justify-end">
                <button (click)="cancelCreate()" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button>
                <button (click)="confirmModel()" [disabled]="!selectedModel()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">Continuer <span class="material-symbols-outlined text-lg">arrow_forward</span></button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Editor modal -->
      @if (showEditor()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="cancelEditor()">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[92vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 class="font-bold text-slate-900">{{ editingId ? 'Modifier le template' : 'Nouveau template' }}</h3>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="cancelEditor()"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="p-6">
              <div class="flex gap-3 mb-4 items-center">
                <div class="flex-1 flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-700">Nom du template</label>
                  <input type="text" [(ngModel)]="editorTemplate.nom" placeholder="Ex: Reçu standard 2024" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" />
                </div>
                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mt-6"><input type="checkbox" [(ngModel)]="editorTemplate.isDefault" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/40" /> Définir par défaut</label>
              </div>
              <div class="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                <span class="font-semibold text-slate-700">Variables :</span>
                <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs text-blue-900 mx-0.5">{{ '{{ECOLE_NOM}}' }}</code>
                <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs text-blue-900 mx-0.5">{{ '{{NUMERO_RECU}}' }}</code>
                <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs text-blue-900 mx-0.5">{{ '{{ETUDIANT_NOM}}' }}</code>
                <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs text-blue-900 mx-0.5">{{ '{{ETUDIANT_PRENOM}}' }}</code>
                <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs text-blue-900 mx-0.5">{{ '{{DATE_PAIEMENT}}' }}</code>
                <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs text-blue-900 mx-0.5">{{ '{{MODE_PAIEMENT}}' }}</code>
                <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs text-blue-900 mx-0.5">{{ '{{VERSEMENT}}' }}</code>
                <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs text-blue-900 mx-0.5">{{ '{{MONTANT}}' }}</code>
              </div>
              <textarea [(ngModel)]="editorTemplate.htmlContent" placeholder="HTML du template..." rows="18" class="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm font-mono"></textarea>
              @if (editorError()) { <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mt-3"><span class="material-symbols-outlined text-lg">error</span> {{ editorError() }}</div> }
            </div>
            <div class="flex gap-2 justify-end px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
              <button (click)="previewTemplate()" [disabled]="previewing()" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50">@if (previewing()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-lg">visibility</span> } Aperçu</button>
              <button (click)="downloadCurrentTemplate()" [disabled]="downloading()" class="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50">@if (downloading()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-lg">download</span> } PDF</button>
              <button (click)="cancelEditor()" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button>
              <button (click)="saveTemplate()" [disabled]="saving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-lg">save</span> } {{ editingId ? 'Mettre à jour' : 'Enregistrer' }}</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RecuTemplatesComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  predefinedModels = signal<any[]>([]);
  templates = signal<any[]>([]);
  sampleData = signal<any>(null);
  defaultTemplate = computed(() => this.templates().find((t) => t.isDefault) || null);
  showModelChoice = signal(false);
  showEditor = signal(false);
  selectedModel = signal<string | null>(null);
  saving = signal(false);
  previewing = signal(false);
  downloading = signal(false);
  editorError = signal('');

  editorTemplate: any = { nom: '', modele: '', htmlContent: '', isDefault: false };
  editingId: string | null = null;

  ngOnInit() {
    this.loadPredefined();
    this.loadTemplates();
    this.loadSampleData();
  }

  confirmDeleteTemplate(t: any) { if (confirm('Supprimer ?')) this.deleteTemplate(t); }

  loadPredefined() {
    this.http.get<any>(`${environment.apiUrl}/daf/recu-templates/predefined`).subscribe({
      next: (d) => this.predefinedModels.set(d || []),
      error: () => this.predefinedModels.set([]),
    });
  }

  loadSampleData() {
    this.http.get<any>(`${environment.apiUrl}/daf/recu-templates/sample-data`).subscribe({
      next: (d) => this.sampleData.set(d),
      error: () => this.sampleData.set(null),
    });
  }

  loadTemplates() {
    this.http.get<any>(`${environment.apiUrl}/daf/recu-templates`).subscribe({
      next: (d) => this.templates.set(d || []),
      error: () => this.templates.set([]),
    });
  }

  openCreate() {
    this.selectedModel.set(null);
    this.showModelChoice.set(true);
    this.showEditor.set(false);
  }

  cancelCreate() {
    this.showModelChoice.set(false);
  }

  confirmModel() {
    const model = this.selectedModel();
    if (!model) return;

    if (model === 'PERSONNALISE') {
      this.editorTemplate = {
        nom: 'Mon template personnalisé',
        modele: 'PERSONNALISE',
        htmlContent: '<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><style>\n  body { font-family: Arial; padding: 20px; }\n</style></head>\n<body>\n  <h1>{{ECOLE_NOM}}</h1>\n  <p>Reçu N° {{NUMERO_RECU}}</p>\n  <p>Étudiant: {{ETUDIANT_NOM}} {{ETUDIANT_PRENOM}}</p>\n  <p>Montant: {{MONTANT}} FCFA</p>\n</body>\n</html>',
        isDefault: false,
      };
    } else {
      const predefined = this.predefinedModels().find((t) => t.modele === model);
      this.editorTemplate = {
        nom: predefined?.nom || model,
        modele: model,
        htmlContent: predefined?.html || '',
        isDefault: false,
      };
    }

    this.editingId = null;
    this.editorError.set('');
    this.showModelChoice.set(false);
    this.showEditor.set(true);
  }

  cancelEditor() {
    this.showEditor.set(false);
  }

  saveTemplate() {
    if (!this.editorTemplate.nom || !this.editorTemplate.htmlContent) {
      this.editorError.set('Le nom et le contenu HTML sont obligatoires');
      return;
    }
    this.saving.set(true);
    this.editorError.set('');

    const payload = {
      nom: this.editorTemplate.nom,
      modele: this.editorTemplate.modele,
      htmlContent: this.editorTemplate.htmlContent,
      isDefault: this.editorTemplate.isDefault,
    };

    const req = this.editingId
      ? this.http.patch(`${environment.apiUrl}/daf/recu-templates/${this.editingId}`, payload)
      : this.http.post(`${environment.apiUrl}/daf/recu-templates`, payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        alert(this.editingId ? 'Template mis à jour' : 'Template créé');
        this.showEditor.set(false);
        this.loadTemplates();
      },
      error: (err) => {
        this.saving.set(false);
        this.editorError.set(err.error?.message || 'Erreur lors de l\'enregistrement');
      },
    });
  }

  editTemplate(t: any) {
    this.editingId = t.id;
    this.editorTemplate = {
      nom: t.nom,
      modele: t.modele,
      htmlContent: t.htmlContent,
      isDefault: t.isDefault,
    };
    this.editorError.set('');
    this.showEditor.set(true);
  }

  deleteTemplate(t: any) {
    this.http.delete(`${environment.apiUrl}/daf/recu-templates/${t.id}`).subscribe({
      next: () => { this.loadTemplates(); },
      error: (err) => alert(err.error?.message || 'Erreur'),
    });
  }

  previewTemplate() {
    this.previewing.set(true);
    this.http.post(`${environment.apiUrl}/daf/recu-templates/preview`,
      { htmlContent: this.editorTemplate.htmlContent },
      { responseType: 'blob' },
    ).subscribe({
      next: (blob) => {
        this.previewing.set(false);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => { this.previewing.set(false); alert('Erreur aperçu'); },
    });
  }

  previewExisting(t: any) {
    this.previewing.set(true);
    this.http.post(`${environment.apiUrl}/daf/recu-templates/preview`,
      { htmlContent: t.htmlContent },
      { responseType: 'blob' },
    ).subscribe({
      next: (blob) => {
        this.previewing.set(false);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => { this.previewing.set(false); alert('Erreur aperçu'); },
    });
  }

  downloadTemplate(t: any) {
    this.http.post(`${environment.apiUrl}/daf/recu-templates/download`,
      { htmlContent: t.htmlContent, nom: t.nom },
      { responseType: 'blob' },
    ).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-template-${t.nom || 'sans-nom'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download error:', err);
        alert('Erreur téléchargement: ' + (err.status || '') + ' ' + (err.statusText || ''));
      },
    });
  }

  downloadCurrentTemplate() {
    if (!this.editorTemplate.htmlContent) {
      this.editorError.set('Le contenu HTML est vide');
      return;
    }
    this.downloading.set(true);
    this.http.post(`${environment.apiUrl}/daf/recu-templates/download`,
      { htmlContent: this.editorTemplate.htmlContent, nom: this.editorTemplate.nom },
      { responseType: 'blob' },
    ).subscribe({
      next: (blob) => {
        this.downloading.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-template-${this.editorTemplate.nom || 'sans-nom'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.downloading.set(false);
        console.error('Download error:', err);
        alert('Erreur téléchargement: ' + (err.status || '') + ' ' + (err.statusText || ''));
      },
    });
  }

  getPreviewHtml(tpl: any): string {
    if (!tpl.html) return '';
    const d = this.sampleData();
    return tpl.html
      .replace(/{{ECOLE_NOM}}/g, d?.ecoleNom || '')
      .replace(/{{NUMERO_RECU}}/g, d?.numeroRecu || '')
      .replace(/{{ETUDIANT_NOM}}/g, d?.etudiantNom || '')
      .replace(/{{ETUDIANT_PRENOM}}/g, d?.etudiantPrenom || '')
      .replace(/{{DATE_PAIEMENT}}/g, d?.datePaiement || '')
      .replace(/{{MODE_PAIEMENT}}/g, d?.modePaiement || '')
      .replace(/{{VERSEMENT}}/g, d?.versement || '')
      .replace(/{{MONTANT}}/g, d?.montant || '');
  }

  getSafePreviewHtml(tpl: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.getPreviewHtml(tpl));
  }

  getPreviewHtmlForTemplate(t: any): string {
    if (!t.htmlContent) return '';
    const d = this.sampleData();
    return t.htmlContent
      .replace(/{{ECOLE_NOM}}/g, d?.ecoleNom || '')
      .replace(/{{NUMERO_RECU}}/g, d?.numeroRecu || '')
      .replace(/{{ETUDIANT_NOM}}/g, d?.etudiantNom || '')
      .replace(/{{ETUDIANT_PRENOM}}/g, d?.etudiantPrenom || '')
      .replace(/{{DATE_PAIEMENT}}/g, d?.datePaiement || '')
      .replace(/{{MODE_PAIEMENT}}/g, d?.modePaiement || '')
      .replace(/{{VERSEMENT}}/g, d?.versement || '')
      .replace(/{{MONTANT}}/g, d?.montant || '');
  }

  getSafePreviewHtmlForTemplate(t: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.getPreviewHtmlForTemplate(t));
  }
}
