import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

type TemplateTab = 'recus' | 'bulletins';

@Component({
  selector: 'app-templates-systeme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .ts-card { flex: 0 0 240px; overflow: hidden; transition: transform .15s; }
    .ts-card:hover { transform: translateY(-2px); }
    .ts-preview { width: 100%; height: 200px; overflow: hidden; background: var(--color-neutral-100); border-bottom: 1px solid var(--color-divider); position: relative; }
    .ts-preview iframe { width: 600px; height: 800px; border: none; transform-origin: top left; transform: scale(0.3); pointer-events: none; position: absolute; top: 0; left: 0; }
    .ts-badge { position: absolute; top: 8px; right: 8px; }
    .ts-model-card { border: 2px solid var(--color-divider); padding: 12px; cursor: pointer; text-align: center; transition: border-color .15s, background .15s; }
    .ts-model-card:hover { border-color: var(--color-accent); }
    .ts-model-card.selected { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 8%, transparent); }
    .ts-model-preview { width: 100%; height: 160px; overflow: hidden; background: var(--color-bg); border: 1px solid var(--color-divider); margin-bottom: 10px; position: relative; }
    .ts-model-preview iframe { width: 600px; height: 800px; border: none; transform-origin: top left; transform: scale(0.267); pointer-events: none; position: absolute; top: 0; left: 0; }
    .ts-var-code { background: var(--color-accent-100); color: var(--color-accent-800); padding: 2px 6px; font-size: 11px; margin: 0 2px; }
    .tab-btn { background:none; border:none; padding:10px 16px; font-size:14px; font-weight:600; cursor:pointer; color:color-mix(in srgb, var(--color-text) 55%, transparent); border-bottom:2px solid transparent; margin-bottom:-2px; }
    .tab-btn.active { color:var(--color-accent); border-bottom-color:var(--color-accent); }
  `],
  template: `
    <div class="page-container" style="display:flex;flex-direction:column;gap:20px">
      <div>
        <h1 style="margin:0">Template système</h1>
        <p style="margin:4px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">Gérez les modèles de reçus de paiement et de bulletins de l'école</p>
      </div>

      <div style="display:flex;gap:6px;border-bottom:2px solid var(--color-divider)">
        @if (canReceipts()) {
          <button (click)="activeTab.set('recus')" class="tab-btn" [class.active]="activeTab() === 'recus'">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">description</span> Reçus
          </button>
        }
        @if (canBulletins()) {
          <button (click)="activeTab.set('bulletins')" class="tab-btn" [class.active]="activeTab() === 'bulletins'">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">summarize</span> Bulletins
          </button>
        }
      </div>

      <div style="display:flex;align-items:center;justify-content:flex-end">
        <button (click)="openCreate()" class="btn btn-primary">
          <span class="material-symbols-outlined" style="font-size:18px">add</span> Nouveau template
        </button>
      </div>

      @if (currentTemplates().length === 0) {
        <div class="gs-panel">
          <div class="gs-panel-body" style="padding:48px;text-align:center">
            <span class="material-symbols-outlined" style="font-size:48px;color:color-mix(in srgb, var(--color-text) 35%, transparent)">{{ activeTab() === 'recus' ? 'description' : 'summarize' }}</span>
            <p style="margin-top:12px;font-size:13px;color:color-mix(in srgb, var(--color-text) 45%, transparent)">Aucun template créé{{ activeTab() === 'bulletins' ? ' — le modèle par défaut est utilisé' : '' }}. Cliquez sur « Nouveau template » pour commencer.</p>
          </div>
        </div>
      } @else {
        <div style="display:flex;gap:20px;overflow-x:auto;padding-bottom:6px">
          @for (t of currentTemplates(); track t.id) {
            <div class="gs-panel ts-card">
              <div class="ts-preview">
                <iframe [srcdoc]="getSafePreviewHtmlForTemplate(t)" sandbox="allow-same-origin"></iframe>
                @if (t.isDefault) {
                  <div class="ts-badge"><span class="tag tag-success"><span class="material-symbols-outlined" style="font-size:14px">check_circle</span> Actif</span></div>
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
              @if (activeTab() === 'recus') {
                @for (tpl of predefinedRecuModels(); track tpl.modele) {
                  <div class="ts-model-card" [class.selected]="selectedModel() === tpl.modele" (click)="selectedModel.set(tpl.modele)">
                    <div class="ts-model-preview">
                      <iframe [srcdoc]="getSafePreviewHtml(tpl)" sandbox="allow-same-origin"></iframe>
                    </div>
                    <div style="font-size:12px"><span class="tag tag-neutral" style="margin-right:4px">{{ tpl.modele }}</span> {{ tpl.nom }}</div>
                  </div>
                }
              } @else {
                @if (predefinedBulletinModel()) {
                  <div class="ts-model-card" [class.selected]="selectedModel() === predefinedBulletinModel().modele" (click)="selectedModel.set(predefinedBulletinModel().modele)">
                    <div class="ts-model-preview">
                      <iframe [srcdoc]="getSafePreviewHtml(predefinedBulletinModel())" sandbox="allow-same-origin"></iframe>
                    </div>
                    <div style="font-size:12px">{{ predefinedBulletinModel().nom }}</div>
                  </div>
                }
              }
              <div class="ts-model-card" [class.selected]="selectedModel() === 'PERSONNALISE'" (click)="selectedModel.set('PERSONNALISE')">
                <div class="ts-model-preview" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
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
                <input type="text" [(ngModel)]="editorTemplate.nom" placeholder="Ex: Modèle standard 2024" class="input" />
              </div>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;height:36px">
                <input type="checkbox" [(ngModel)]="editorTemplate.isDefault" style="width:16px;height:16px;accent-color:var(--color-accent)" /> Définir par défaut
              </label>
            </div>
            <div class="gs-well" style="font-size:12px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">
              <span style="font-weight:600;color:var(--color-text)">Variables :</span>
              @if (activeTab() === 'recus') {
                <code class="ts-var-code">{{ '{{ECOLE_NOM}}' }}</code>
                <code class="ts-var-code">{{ '{{NUMERO_RECU}}' }}</code>
                <code class="ts-var-code">{{ '{{ETUDIANT_NOM}}' }}</code>
                <code class="ts-var-code">{{ '{{ETUDIANT_PRENOM}}' }}</code>
                <code class="ts-var-code">{{ '{{DATE_PAIEMENT}}' }}</code>
                <code class="ts-var-code">{{ '{{MODE_PAIEMENT}}' }}</code>
                <code class="ts-var-code">{{ '{{VERSEMENT}}' }}</code>
                <code class="ts-var-code">{{ '{{MONTANT}}' }}</code>
              } @else {
                <code class="ts-var-code">{{ '{{ECOLE_NOM}}' }}</code>
                <code class="ts-var-code">{{ '{{ECOLE_LOGO}}' }}</code>
                <code class="ts-var-code">{{ '{{ETUDIANT_NOM}}' }}</code>
                <code class="ts-var-code">{{ '{{ETUDIANT_PRENOM}}' }}</code>
                <code class="ts-var-code">{{ '{{DATE_NAISSANCE}}' }}</code>
                <code class="ts-var-code">{{ '{{LIEU_NAISSANCE}}' }}</code>
                <code class="ts-var-code">{{ '{{CLASSE_NOM}}' }}</code>
                <code class="ts-var-code">{{ '{{FILIERE_NOM}}' }}</code>
                <code class="ts-var-code">{{ '{{PERIODE_LIBELLE}}' }}</code>
                <code class="ts-var-code">{{ '{{ANNEE_SCOLAIRE}}' }}</code>
                <code class="ts-var-code">{{ '{{TABLE_NOTES}}' }}</code>
                <code class="ts-var-code">{{ '{{MOYENNE_GENERALE}}' }}</code>
                <code class="ts-var-code">{{ '{{RANG}}' }}</code>
                <code class="ts-var-code">{{ '{{MENTION}}' }}</code>
                <code class="ts-var-code">{{ '{{DATE_GENERATION}}' }}</code>
                <div style="margin-top:6px">{{ '{{TABLE_NOTES}}' }} est remplacé par les lignes du tableau de notes — placez-le à l'intérieur de votre balise <code class="ts-var-code">&lt;tbody&gt;</code>.</div>
              }
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
export class TemplatesSystemeComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // Présent uniquement pour un Super Admin choisissant une école précise —
  // absent pour DAF/DG/DSI, qui agissent sur leur propre école (déduite du JWT côté backend).
  private ecoleId: string | null = null;

  activeTab = signal<TemplateTab>('recus');

  predefinedRecuModels = signal<any[]>([]);
  predefinedBulletinModel = signal<any>(null);
  recuTemplates = signal<any[]>([]);
  bulletinTemplates = signal<any[]>([]);
  recuSampleData = signal<any>(null);
  bulletinSampleData = signal<any>(null);

  currentTemplates = computed(() => this.activeTab() === 'recus' ? this.recuTemplates() : this.bulletinTemplates());

  showModelChoice = signal(false);
  showEditor = signal(false);
  selectedModel = signal<string | null>(null);
  saving = signal(false);
  previewing = signal(false);
  downloading = signal(false);
  editorError = signal('');

  editorTemplate: any = { nom: '', modele: '', htmlContent: '', isDefault: false };
  editingId: string | null = null;

  canReceipts(): boolean {
    return this.authService.hasRole('DAF', 'DG', 'SUPER_ADMIN');
  }

  canBulletins(): boolean {
    return this.authService.hasRole('DG', 'DSI', 'SUPER_ADMIN');
  }

  ngOnInit() {
    this.ecoleId = this.route.snapshot.queryParamMap.get('ecoleId');
    this.activeTab.set(this.canReceipts() ? 'recus' : 'bulletins');

    if (this.canReceipts()) {
      this.loadPredefinedRecu();
      this.loadRecuTemplates();
      this.loadRecuSampleData();
    }
    if (this.canBulletins()) {
      this.loadPredefinedBulletin();
      this.loadBulletinTemplates();
      this.loadBulletinSampleData();
    }
  }

  private params(): HttpParams | undefined {
    return this.ecoleId ? new HttpParams().set('ecoleId', this.ecoleId) : undefined;
  }

  async confirmDeleteTemplate(t: any) {
    const ok = await this.alertService.confirm({ title: 'Supprimer ce template ?', confirmText: 'Supprimer', danger: true });
    if (ok) this.deleteTemplate(t);
  }

  // --- Chargement ---
  loadPredefinedRecu() {
    this.http.get<any>(`${environment.apiUrl}/daf/recu-templates/predefined`).subscribe({
      next: (d) => this.predefinedRecuModels.set(d || []),
      error: () => this.predefinedRecuModels.set([]),
    });
  }

  loadRecuSampleData() {
    this.http.get<any>(`${environment.apiUrl}/daf/recu-templates/sample-data`, { params: this.params() }).subscribe({
      next: (d) => this.recuSampleData.set(d),
      error: () => this.recuSampleData.set(null),
    });
  }

  loadRecuTemplates() {
    this.http.get<any>(`${environment.apiUrl}/daf/recu-templates`, { params: this.params() }).subscribe({
      next: (d) => this.recuTemplates.set(d || []),
      error: () => this.recuTemplates.set([]),
    });
  }

  loadPredefinedBulletin() {
    this.http.get<any>(`${environment.apiUrl}/bulletins/templates/predefined`).subscribe({
      next: (d) => this.predefinedBulletinModel.set(d),
      error: () => this.predefinedBulletinModel.set(null),
    });
  }

  loadBulletinSampleData() {
    this.http.get<any>(`${environment.apiUrl}/bulletins/templates/sample-data`, { params: this.params() }).subscribe({
      next: (d) => this.bulletinSampleData.set(d),
      error: () => this.bulletinSampleData.set(null),
    });
  }

  loadBulletinTemplates() {
    this.http.get<any>(`${environment.apiUrl}/bulletins/templates`, { params: this.params() }).subscribe({
      next: (d) => this.bulletinTemplates.set(d || []),
      error: () => this.bulletinTemplates.set([]),
    });
  }

  private reloadCurrentTemplates() {
    if (this.activeTab() === 'recus') this.loadRecuTemplates();
    else this.loadBulletinTemplates();
  }

  // --- Création / édition ---
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
    const isRecu = this.activeTab() === 'recus';

    if (model === 'PERSONNALISE') {
      this.editorTemplate = isRecu ? {
        nom: 'Mon template personnalisé',
        modele: 'PERSONNALISE',
        htmlContent: '<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><style>\n  body { font-family: Arial; padding: 20px; }\n</style></head>\n<body>\n  <h1>{{ECOLE_NOM}}</h1>\n  <p>Reçu N° {{NUMERO_RECU}}</p>\n  <p>Étudiant: {{ETUDIANT_NOM}} {{ETUDIANT_PRENOM}}</p>\n  <p>Montant: {{MONTANT}} FCFA</p>\n</body>\n</html>',
        isDefault: false,
      } : {
        nom: 'Mon template personnalisé',
        modele: 'PERSONNALISE',
        htmlContent: '<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><style>\n  body { font-family: Arial; padding: 20px; }\n  table { width: 100%; border-collapse: collapse; }\n  td, th { border: 1px solid #ddd; padding: 6px; }\n</style></head>\n<body>\n  <h1>{{ECOLE_NOM}}</h1>\n  <p>Bulletin de {{ETUDIANT_NOM}} {{ETUDIANT_PRENOM}} — {{CLASSE_NOM}} — {{PERIODE_LIBELLE}}</p>\n  <table><thead><tr><th>Matière</th><th>Note</th><th>Coef</th><th>Note x Coef</th><th>Appréciation</th></tr></thead><tbody>{{TABLE_NOTES}}</tbody></table>\n  <p>Moyenne générale : {{MOYENNE_GENERALE}}/20 — Rang : {{RANG}} — {{MENTION}}</p>\n</body>\n</html>',
        isDefault: false,
      };
    } else if (isRecu) {
      const predefined = this.predefinedRecuModels().find((t) => t.modele === model);
      this.editorTemplate = { nom: predefined?.nom || model, modele: model, htmlContent: predefined?.html || '', isDefault: false };
    } else {
      const predefined = this.predefinedBulletinModel();
      this.editorTemplate = { nom: predefined?.nom || model, modele: model, htmlContent: predefined?.html || '', isDefault: false };
    }

    this.editingId = null;
    this.editorError.set('');
    this.showModelChoice.set(false);
    this.showEditor.set(true);
  }

  cancelEditor() {
    this.showEditor.set(false);
  }

  private endpointBase(): string {
    return this.activeTab() === 'recus' ? `${environment.apiUrl}/daf/recu-templates` : `${environment.apiUrl}/bulletins/templates`;
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

    const base = this.endpointBase();
    const req = this.editingId
      ? this.http.patch(`${base}/${this.editingId}`, payload, { params: this.params() })
      : this.http.post(base, payload, { params: this.params() });

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.alertService.success(this.editingId ? 'Template mis à jour' : 'Template créé');
        this.showEditor.set(false);
        this.reloadCurrentTemplates();
      },
      error: (err) => {
        this.saving.set(false);
        this.editorError.set(err.error?.message || 'Erreur lors de l\'enregistrement');
      },
    });
  }

  editTemplate(t: any) {
    this.editingId = t.id;
    this.editorTemplate = { nom: t.nom, modele: t.modele, htmlContent: t.htmlContent, isDefault: t.isDefault };
    this.editorError.set('');
    this.showEditor.set(true);
  }

  deleteTemplate(t: any) {
    this.http.delete(`${this.endpointBase()}/${t.id}`, { params: this.params() }).subscribe({
      next: () => { this.reloadCurrentTemplates(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur'),
    });
  }

  previewTemplate() {
    this.previewing.set(true);
    this.http.post(`${this.endpointBase()}/preview`,
      { htmlContent: this.editorTemplate.htmlContent },
      { responseType: 'blob', params: this.params() },
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
    this.http.post(`${this.endpointBase()}/preview`,
      { htmlContent: t.htmlContent },
      { responseType: 'blob', params: this.params() },
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
    const prefix = this.activeTab() === 'recus' ? 'recu' : 'bulletin';
    this.http.post(`${this.endpointBase()}/download`,
      { htmlContent: t.htmlContent, nom: t.nom },
      { responseType: 'blob', params: this.params() },
    ).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix}-template-${t.nom || 'sans-nom'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => this.alertService.error('Erreur téléchargement: ' + (err.status || '') + ' ' + (err.statusText || '')),
    });
  }

  downloadCurrentTemplate() {
    if (!this.editorTemplate.htmlContent) {
      this.editorError.set('Le contenu HTML est vide');
      return;
    }
    const prefix = this.activeTab() === 'recus' ? 'recu' : 'bulletin';
    this.downloading.set(true);
    this.http.post(`${this.endpointBase()}/download`,
      { htmlContent: this.editorTemplate.htmlContent, nom: this.editorTemplate.nom },
      { responseType: 'blob', params: this.params() },
    ).subscribe({
      next: (blob) => {
        this.downloading.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix}-template-${this.editorTemplate.nom || 'sans-nom'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.downloading.set(false);
        this.alertService.error('Erreur téléchargement: ' + (err.status || '') + ' ' + (err.statusText || ''));
      },
    });
  }

  // --- Aperçu (rendu client) ---
  private renderPreviewRecu(html: string): string {
    if (!html) return '';
    const d = this.recuSampleData();
    return html
      .replace(/{{ECOLE_NOM}}/g, d?.ecoleNom || '')
      .replace(/{{NUMERO_RECU}}/g, d?.numeroRecu || '')
      .replace(/{{ETUDIANT_NOM}}/g, d?.etudiantNom || '')
      .replace(/{{ETUDIANT_PRENOM}}/g, d?.etudiantPrenom || '')
      .replace(/{{DATE_PAIEMENT}}/g, d?.datePaiement || '')
      .replace(/{{MODE_PAIEMENT}}/g, d?.modePaiement || '')
      .replace(/{{VERSEMENT}}/g, d?.versement || '')
      .replace(/{{MONTANT}}/g, d?.montant || '');
  }

  private renderPreviewBulletin(html: string): string {
    if (!html) return '';
    const d = this.bulletinSampleData();
    return html
      .replace(/{{ECOLE_NOM}}/g, d?.ecoleNom || '')
      .replace(/{{ECOLE_LOGO}}/g, '')
      .replace(/{{ETUDIANT_NOM}}/g, d?.etudiantNom || '')
      .replace(/{{ETUDIANT_PRENOM}}/g, d?.etudiantPrenom || '')
      .replace(/{{DATE_NAISSANCE}}/g, d?.dateNaissance || '')
      .replace(/{{LIEU_NAISSANCE}}/g, d?.lieuNaissance || '')
      .replace(/{{CLASSE_NOM}}/g, d?.classeNom || '')
      .replace(/{{FILIERE_NOM}}/g, d?.filiereNom || '')
      .replace(/{{PERIODE_LIBELLE}}/g, d?.periodeLibelle || '')
      .replace(/{{ANNEE_SCOLAIRE}}/g, d?.anneeScolaire || '')
      .replace(/{{TABLE_NOTES}}/g, this.renderNotesRowsClientSide(d?.moyennes || []))
      .replace(/{{MOYENNE_GENERALE}}/g, d?.moyenneGenerale || '')
      .replace(/{{RANG}}/g, d?.rang || '')
      .replace(/{{MENTION}}/g, d?.mention || '')
      .replace(/{{DATE_GENERATION}}/g, d?.dateGeneration || '');
  }

  private renderNotesRowsClientSide(moyennes: any[]): string {
    return (moyennes || []).map((m: any) => `
      <tr>
        <td>${m.matiere}</td>
        <td>${m.moyenne?.toFixed ? m.moyenne.toFixed(2) : m.moyenne || '-'}/20</td>
        <td>${m.coefficient}</td>
        <td>${(m.points ?? (m.moyenne || 0) * m.coefficient).toFixed(2)}</td>
        <td>${m.appreciation || ''}</td>
      </tr>
    `).join('');
  }

  getSafePreviewHtml(tpl: any): SafeHtml {
    const html = this.activeTab() === 'recus' ? this.renderPreviewRecu(tpl?.html || '') : this.renderPreviewBulletin(tpl?.html || '');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getSafePreviewHtmlForTemplate(t: any): SafeHtml {
    const html = this.activeTab() === 'recus' ? this.renderPreviewRecu(t?.htmlContent || '') : this.renderPreviewBulletin(t?.htmlContent || '');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
