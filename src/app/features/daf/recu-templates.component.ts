import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recu-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .rt-card { flex: 0 0 240px; overflow: hidden; transition: transform .15s; }
    .rt-card:hover { transform: translateY(-2px); }
    .rt-preview { width: 100%; height: 200px; overflow: hidden; background: var(--color-neutral-100); border-bottom: 1px solid var(--color-divider); position: relative; }
    .rt-preview iframe { width: 600px; height: 800px; border: none; transform-origin: top left; transform: scale(0.3); pointer-events: none; position: absolute; top: 0; left: 0; }
    .rt-badge { position: absolute; top: 8px; right: 8px; }
    .rt-model-card { border: 2px solid var(--color-divider); padding: 12px; cursor: pointer; text-align: center; transition: border-color .15s, background .15s; }
    .rt-model-card:hover { border-color: var(--color-accent); }
    .rt-model-card.selected { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 8%, transparent); }
    .rt-model-preview { width: 100%; height: 160px; overflow: hidden; background: var(--color-bg); border: 1px solid var(--color-divider); margin-bottom: 10px; position: relative; }
    .rt-model-preview iframe { width: 600px; height: 800px; border: none; transform-origin: top left; transform: scale(0.267); pointer-events: none; position: absolute; top: 0; left: 0; }
    .rt-var-code { background: var(--color-accent-100); color: var(--color-accent-800); padding: 2px 6px; font-size: 11px; margin: 0 2px; }
  `],
  template: `
    <div class="page-container" style="display:flex;flex-direction:column;gap:24px">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 style="margin:0">Templates de Reçu</h1>
          <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Gérez vos modèles de reçus de paiement</p>
        </div>
        <button (click)="openCreate()" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">add</span> Nouveau template
        </button>
      </div>

      <!-- Templates row -->
      @if (templates().length === 0) {
        <div class="gs-panel">
          <div class="gs-panel-body" style="padding:48px;text-align:center">
            <span class="material-symbols-outlined" style="font-size:48px;color:color-mix(in srgb, var(--color-text) 35%, transparent)">description</span>
            <p style="margin-top:12px;font-size:13px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">Aucun template créé. Cliquez sur « Nouveau template » pour commencer.</p>
          </div>
        </div>
      } @else {
        <div style="display:flex;gap:20px;overflow-x:auto;padding-bottom:6px">
          @for (t of templates(); track t.id) {
            <div class="gs-panel rt-card">
              <div class="rt-preview">
                <iframe [srcdoc]="getSafePreviewHtmlForTemplate(t)" sandbox="allow-same-origin"></iframe>
                @if (t.isDefault) {
                  <div class="rt-badge"><span class="tag tag-success"><span class="material-symbols-outlined" style="font-size:14px">check_circle</span> Actif</span></div>
                }
              </div>
              <div class="gs-panel-body">
                <h4 style="font-size:13px;margin:0 0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ t.nom }}</h4>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                  <span class="tag" [class]="t.modele === 'PERSONNALISE' ? 'tag-accent' : 'tag-neutral'">{{ t.modele }}</span>
                  <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">{{ t.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
                <div style="display:flex;gap:6px">
                  <button (click)="editTemplate(t)" class="btn btn-primary btn-sm" style="flex:1"><span class="material-symbols-outlined" style="font-size:16px">edit</span> Modifier</button>
                  <button (click)="previewExisting(t)" class="btn btn-icon btn-secondary" title="Aperçu"><span class="material-symbols-outlined" style="font-size:16px">visibility</span></button>
                  <button (click)="downloadTemplate(t)" class="btn btn-icon btn-secondary" title="Télécharger PDF"><span class="material-symbols-outlined" style="font-size:16px">download</span></button>
                  <button (click)="confirmDeleteTemplate(t)" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:16px">delete</span></button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Model choice modal -->
      @if (showModelChoice()) {
        <div class="dialog-backdrop" (click)="cancelCreate()">
          <div class="dialog" style="width:min(760px,100%);max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
            <div class="dialog-title" style="display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--color-surface);z-index:1">
              Choisir un modèle de base
              <button class="btn btn-icon btn-secondary" (click)="cancelCreate()"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px">
              @for (tpl of predefinedModels(); track tpl.modele) {
                <div class="rt-model-card" [class.selected]="selectedModel() === tpl.modele" (click)="selectedModel.set(tpl.modele)">
                  <div class="rt-model-preview">
                    <iframe [srcdoc]="getSafePreviewHtml(tpl)" sandbox="allow-same-origin"></iframe>
                  </div>
                  <div style="font-size:12px"><span class="tag tag-neutral" style="margin-right:4px">{{ tpl.modele }}</span> {{ tpl.nom }}</div>
                </div>
              }
              <div class="rt-model-card" [class.selected]="selectedModel() === 'PERSONNALISE'" (click)="selectedModel.set('PERSONNALISE')">
                <div class="rt-model-preview" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
                  <span class="material-symbols-outlined" style="font-size:32px;color:color-mix(in srgb, var(--color-text) 40%, transparent)">edit</span>
                  <div style="font-size:12px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">Partir de zéro</div>
                </div>
                <div style="font-size:12px"><span class="tag tag-accent" style="margin-right:4px">PERSO</span> Vide</div>
              </div>
            </div>
            <div class="dialog-actions">
              <button (click)="cancelCreate()" class="btn btn-secondary">Annuler</button>
              <button (click)="confirmModel()" [disabled]="!selectedModel()" class="btn btn-primary">Continuer <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span></button>
            </div>
          </div>
        </div>
      }

      <!-- Editor modal -->
      @if (showEditor()) {
        <div class="dialog-backdrop" (click)="cancelEditor()">
          <div class="dialog" style="width:min(880px,100%);max-height:92vh;overflow-y:auto" (click)="$event.stopPropagation()">
            <div class="dialog-title" style="display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--color-surface);z-index:1">
              {{ editingId ? 'Modifier le template' : 'Nouveau template' }}
              <button class="btn btn-icon btn-secondary" (click)="cancelEditor()"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div style="display:flex;gap:14px;align-items:flex-end">
              <div class="field" style="flex:1;margin:0">
                <label>Nom du template</label>
                <input type="text" [(ngModel)]="editorTemplate.nom" placeholder="Ex: Reçu standard 2024" class="input" />
              </div>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;height:36px">
                <input type="checkbox" [(ngModel)]="editorTemplate.isDefault" style="width:16px;height:16px;accent-color:var(--color-accent)" /> Définir par défaut
              </label>
            </div>
            <div class="gs-well" style="font-size:12px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">
              <span style="font-weight:600;color:var(--color-text)">Variables :</span>
              <code class="rt-var-code">{{ '{{ECOLE_NOM}}' }}</code>
              <code class="rt-var-code">{{ '{{NUMERO_RECU}}' }}</code>
              <code class="rt-var-code">{{ '{{ETUDIANT_NOM}}' }}</code>
              <code class="rt-var-code">{{ '{{ETUDIANT_PRENOM}}' }}</code>
              <code class="rt-var-code">{{ '{{DATE_PAIEMENT}}' }}</code>
              <code class="rt-var-code">{{ '{{MODE_PAIEMENT}}' }}</code>
              <code class="rt-var-code">{{ '{{VERSEMENT}}' }}</code>
              <code class="rt-var-code">{{ '{{MONTANT}}' }}</code>
            </div>
            <textarea [(ngModel)]="editorTemplate.htmlContent" placeholder="HTML du template..." rows="18" class="input" style="font-family:monospace;min-height:320px"></textarea>
            @if (editorError()) { <div class="tag tag-danger" style="display:flex;align-items:center;gap:6px;padding:8px 12px;font-size:13px;margin-top:8px"><span class="material-symbols-outlined" style="font-size:18px">error</span> {{ editorError() }}</div> }
            <div class="dialog-actions" style="position:sticky;bottom:0;background:var(--color-surface);padding-top:8px">
              <button (click)="previewTemplate()" [disabled]="previewing()" class="btn btn-secondary">@if (previewing()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">visibility</span> } Aperçu</button>
              <button (click)="downloadCurrentTemplate()" [disabled]="downloading()" class="btn btn-secondary">@if (downloading()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">download</span> } PDF</button>
              <button (click)="cancelEditor()" class="btn btn-secondary">Annuler</button>
              <button (click)="saveTemplate()" [disabled]="saving()" class="btn btn-primary">@if (saving()) { <span class="material-symbols-outlined" style="font-size:16px">progress_activity</span> } @else { <span class="material-symbols-outlined" style="font-size:18px">save</span> } {{ editingId ? 'Mettre à jour' : 'Enregistrer' }}</button>
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
  private alertService = inject(AlertService);

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

  async confirmDeleteTemplate(t: any) {
    const ok = await this.alertService.confirm({ title: 'Supprimer ce template ?', confirmText: 'Supprimer', danger: true });
    if (ok) this.deleteTemplate(t);
  }

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
        this.alertService.success(this.editingId ? 'Template mis à jour' : 'Template créé');
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
      error: (err) => this.alertService.error(err.error?.message || 'Erreur'),
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
      error: () => { this.previewing.set(false); this.alertService.error('Erreur aperçu'); },
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
      error: () => { this.previewing.set(false); this.alertService.error('Erreur aperçu'); },
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
        this.alertService.error('Erreur téléchargement: ' + (err.status || '') + ' ' + (err.statusText || ''));
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
        this.alertService.error('Erreur téléchargement: ' + (err.status || '') + ' ' + (err.statusText || ''));
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
