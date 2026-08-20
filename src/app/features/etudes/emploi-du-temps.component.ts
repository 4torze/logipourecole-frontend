import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { EmploiDuTempsService, CreateEmploiDuTempsDto } from '../../core/services/emploi-du-temps.service';
import { SalleService } from '../../core/services/salle.service';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { RoleUtilisateur } from '../../core/models';
import { EmploiDuTemps, Salle } from '../../core/models';
import { environment } from '../../../environments/environment';
import { seanceStatutLabel, seanceStatutClass, StatutSeanceAffiche } from '../../core/utils/seance-statut.util';

interface Affectation {
  id?: string;
  classe: { id: string; nom: string };
  matiere: { id: string; nom: string };
  enseignant: { id: string; nom: string; prenom: string };
}

@Component({
  selector: 'app-emploi-du-temps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .cal-wrap { overflow-x: auto; }
    .cal-grid { display: grid; grid-template-columns: 70px repeat(6, 1fr); border: 1px solid var(--color-divider); min-width: 700px; }
    .cal-header { padding: 8px 4px; text-align: center; font-weight: 600; background: var(--color-neutral-100); border-bottom: 2px solid var(--color-divider); border-right: 1px solid var(--color-divider); font-size: 13px; font-family: var(--font-heading); }
    .cal-header .date { font-size: 10px; color: color-mix(in srgb, var(--color-text) 55%, transparent); font-weight: 400; margin-top: 2px; }
    .cal-header.today { background: var(--color-accent-100); }
    .cal-time { padding: 4px 6px; text-align: right; font-size: 11px; color: color-mix(in srgb, var(--color-text) 55%, transparent); border-right: 1px solid var(--color-divider); border-bottom: 1px solid var(--color-divider); display: flex; align-items: flex-start; justify-content: flex-end; }
    .cal-cell { border-right: 1px solid var(--color-divider); border-bottom: 1px solid var(--color-divider); min-height: 52px; padding: 2px; }
    .cal-event { background: var(--color-neutral-100); border-left: 3px solid var(--color-accent); padding: 4px 8px; margin: 2px 0; font-size: 10.5px; line-height: 1.3; }
    .cal-event strong { display: block; font-family: var(--font-heading); font-weight: 800; font-size: 11.5px; }
    .cal-event-class, .cal-event-teacher, .cal-event-time, .cal-event-room { color: color-mix(in srgb, var(--color-text) 65%, transparent); }
    .gs-seg { display: inline-flex; overflow: hidden; border: 1px solid var(--color-divider); }
    .gs-seg-btn { padding: 8px 16px; font-size: 13px; font-weight: 600; font-family: var(--font-heading); background: none; border: none; cursor: pointer; color: color-mix(in srgb, var(--color-text) 60%, transparent); }
    .gs-seg-btn.active { background: var(--color-accent); color: var(--color-bg); }
    .gs-seg-btn + .gs-seg-btn { border-left: 1px solid var(--color-divider); }

    /* Vue agenda mobile — bascule pure CSS, pas de détection JS de largeur */
    .agenda-mobile { display: none; }
    @media (max-width: 768px) {
      .cal-desktop { display: none; }
      .agenda-mobile { display: block; }
    }
    .agenda-day-picker { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; }
    .agenda-day-btn { flex: none; padding: 10px 14px; min-height: 44px; border: 1px solid var(--color-divider); background: var(--color-surface); font-family: var(--font-heading); font-weight: 600; font-size: 13px; cursor: pointer; text-align: center; }
    .agenda-day-btn .date { font-size: 11px; font-weight: 400; color: color-mix(in srgb, var(--color-text) 55%, transparent); margin-top: 2px; }
    .agenda-day-btn.today { border-color: var(--color-accent); }
    .agenda-day-btn.active { background: var(--color-accent); color: var(--color-bg); }
    .agenda-day-btn.active .date { color: var(--color-bg); opacity: 0.85; }
    .agenda-event { padding: 14px; margin-bottom: 10px; border: 1px solid var(--color-divider); border-left: 4px solid var(--color-accent); cursor: pointer; background: var(--color-surface); }
    .agenda-event strong { display: block; font-family: var(--font-heading); font-weight: 800; font-size: 15px; }
    .agenda-event-meta { font-size: 13px; color: color-mix(in srgb, var(--color-text) 65%, transparent); margin-top: 4px; }
  `],
  template: `
    <div class="page-container" style="max-width:1200px">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px">
        <div>
          <h2 style="margin:0 0 4px;font-size:22px">Emploi du temps</h2>
          <p style="margin:0;font-size:13px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">{{ canEdit() ? 'Gérez les créneaux de cours' : 'Consultation de l\'emploi du temps complet' }}</p>
        </div>
        @if (canEdit()) {
          <button (click)="showForm.set(true)" class="btn btn-primary">
            <span class="material-symbols-outlined" style="font-size:18px">add</span> Nouveau créneau
          </button>
        }
      </div>

      <!-- Week navigation -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;border-top:2px solid var(--color-divider);border-bottom:2px solid var(--color-divider);padding:14px 0;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px">
          <button (click)="prevWeek()" class="btn btn-secondary">
            <span class="material-symbols-outlined" style="font-size:18px">chevron_left</span> Précédent
          </button>
          <span style="font-size:13px;font-weight:600;padding:0 8px">{{ weekRangeLabel() }}</span>
          <button (click)="nextWeek()" class="btn btn-secondary">
            Suivant <span class="material-symbols-outlined" style="font-size:18px">chevron_right</span>
          </button>
          <button (click)="goToday()" class="btn btn-primary">
            <span class="material-symbols-outlined" style="font-size:18px">today</span> Cette semaine
          </button>
        </div>
        <span style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">{{ weekOffset() === 0 ? 'Semaine courante' : (weekOffset() > 0 ? 'Semaine +' + weekOffset() : 'Semaine ' + weekOffset()) }}</span>
      </div>

      <!-- Indicators -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:16px">
        <div class="gs-stat"><span class="gs-stat-label">Créneaux</span><span class="gs-stat-num">{{ totalCreneaux() }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Heures / semaine</span><span class="gs-stat-num">{{ totalHeures() }}h</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Classes</span><span class="gs-stat-num">{{ totalClasses() }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Enseignants</span><span class="gs-stat-num">{{ totalEnseignants() }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Salles utilisées</span><span class="gs-stat-num">{{ totalSalles() }}</span></div>
        <div class="gs-stat"><span class="gs-stat-label">Matières</span><span class="gs-stat-num">{{ totalMatieres() }}</span></div>
      </div>

      <!-- Per-day breakdown -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:16px">
        @for (day of jours; track day.value) {
          <div class="gs-stat" style="text-align:center">
            <span class="gs-stat-label">{{ day.label }}</span>
            <span class="gs-stat-num" style="font-size:20px">{{ creneauxParJour(day.value) }}</span>
            <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 50%, transparent)">créneaux · {{ heuresParJour(day.value) }}h</span>
          </div>
        }
      </div>

      @if (showForm() && canEdit()) {
        <div class="dialog-backdrop" (click)="showForm.set(false)">
          <div class="dialog" style="width:min(560px, 100%);max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="dialog-title">Nouveau créneau</span>
              <button class="btn btn-icon btn-secondary" (click)="showForm.set(false)"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="field" style="grid-column:span 2"><label>Classe</label><select [(ngModel)]="newSlot.classeId" (ngModelChange)="onClasseChange()" class="input">@for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></div>
              <div class="field"><label>Matière</label><select [(ngModel)]="newSlot.matiereId" (ngModelChange)="onMatiereChange()" class="input">@for (m of matieresForClasse(); track m.id) { <option [value]="m.id">{{ m.nom }}</option> }</select></div>
              <div class="field"><label>Enseignant</label><select [(ngModel)]="newSlot.enseignantId" class="input">@for (e of enseignantsForClasseMatiere(); track e.id) { <option [value]="e.id">{{ e.nom }} {{ e.prenom }}</option> }</select></div>
              <div class="field"><label>Jour</label><select [(ngModel)]="newSlot.jourSemaine" class="input">@for (j of jours; track j.value) { <option [value]="j.value">{{ j.label }}</option> }</select></div>
              <div class="field"><label>Salle</label><select [(ngModel)]="newSlot.salleId" class="input"><option value="">—</option>@for (s of salles(); track s.id) { <option [value]="s.id">{{ s.nom }}</option> }</select></div>
              <div class="field" style="grid-column:span 2"><label>Date (optionnel — pour un créneau spécifique à une semaine)</label><input type="date" [(ngModel)]="newSlotDate" class="input" /><p style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:4px 0 0">Laisser vide pour un créneau récurrent (toutes les semaines)</p></div>
              <div class="field"><label>Heure début</label><input type="time" [(ngModel)]="newSlot.heureDebut" class="input" /></div>
              <div class="field"><label>Heure fin</label><input type="time" [(ngModel)]="newSlot.heureFin" class="input" /></div>
            </div>
            <div class="dialog-actions">
              <button (click)="showForm.set(false)" class="btn btn-secondary">Annuler</button>
              <button (click)="create()" [disabled]="saving()" class="btn btn-primary">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } Ajouter</button>
            </div>
          </div>
        </div>
      }

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:16px">
        <div class="gs-seg">
          <button class="gs-seg-btn" [class.active]="viewMode() === 'calendar'" (click)="viewMode.set('calendar')"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">calendar_month</span> Calendrier</button>
          <button class="gs-seg-btn" [class.active]="viewMode() === 'table'" (click)="viewMode.set('table')"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">table_rows</span> Tableau</button>
        </div>
        @if (viewMode() === 'calendar') {
          <select [(ngModel)]="filterClasseId" class="input" style="width:220px">
            <option [ngValue]="null">Toutes les classes</option>
            @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
          </select>
        }
      </div>

      @if (viewMode() === 'calendar') {
        <div class="gs-panel">
          <div class="gs-panel-body">
            <div class="cal-desktop"><div class="cal-wrap"><div class="cal-grid">
              <div class="cal-header">Heure</div>
              @for (day of jours; track day.value) {
                <div class="cal-header" [class.today]="isToday(day.value)">{{ day.label }}<div class="date">{{ dateForDay(day.value) }}</div></div>
              }
              @for (hour of hours; track hour) {
                <div class="cal-time">{{ hour }}</div>
                @for (day of jours; track day.value) {
                  <div class="cal-cell">
                    @for (slot of slotsForDayHour(day.value, hour); track slot.id) {
                      <div class="cal-event" style="cursor:pointer" (click)="openSeance(slot, day.value)">
                        <strong>{{ slot.matiere?.nom }}</strong>
                        @if (!filterClasseId()) { <div class="cal-event-class">{{ slot.classe?.nom }}</div> }
                        <div class="cal-event-teacher">{{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }}</div>
                        <div class="cal-event-time">{{ slot.heureDebut }} - {{ slot.heureFin }}</div>
                        @if (slot.salle?.nom) { <div class="cal-event-room">Salle: {{ slot.salle.nom }}</div> }
                        <span class="tag" [class]="statutClass(slot, day.value)" style="margin-top:4px;font-size:10px">{{ statutLabel(slot, day.value) }}</span>
                      </div>
                    }
                  </div>
                }
              }
            </div></div></div>

            <div class="agenda-mobile">
              <div class="agenda-day-picker">
                @for (day of jours; track day.value) {
                  <button type="button" class="agenda-day-btn" [class.today]="isToday(day.value)" [class.active]="selectedDayMobile() === day.value" (click)="selectedDayMobile.set(day.value)">
                    {{ day.label }}
                    <div class="date">{{ dateForDay(day.value) }}</div>
                  </button>
                }
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <button type="button" class="btn btn-secondary btn-sm" (click)="prevDayMobile()">
                  <span class="material-symbols-outlined" style="font-size:16px">chevron_left</span>
                </button>
                <span style="font-size:13px;font-weight:600">{{ joursLabel[selectedDayMobile()] }} {{ dateForDay(selectedDayMobile()) }}</span>
                <button type="button" class="btn btn-secondary btn-sm" (click)="nextDayMobile()">
                  <span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>
                </button>
              </div>
              @if (slotsForDay(selectedDayMobile()).length > 0) {
                @for (slot of slotsForDay(selectedDayMobile()); track slot.id) {
                  <div class="agenda-event" (click)="openSeance(slot, selectedDayMobile())">
                    <strong>{{ slot.matiere?.nom }}</strong>
                    <div class="agenda-event-meta">{{ slot.classe?.nom }} · {{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }} · {{ slot.heureDebut }} - {{ slot.heureFin }}@if (slot.salle?.nom) {<span> · Salle {{ slot.salle.nom }}</span>}</div>
                    <span class="tag" [class]="statutClass(slot, selectedDayMobile())" style="margin-top:8px">{{ statutLabel(slot, selectedDayMobile()) }}</span>
                  </div>
                }
              } @else {
                <div class="table-empty">
                  <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">event_busy</span>
                  Aucun créneau ce jour-là
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="gs-panel">
          <div class="gs-panel-body table-scroll">
            <table class="table">
              <thead>
                <tr><th>Jour</th><th>Date</th><th>Heure</th><th>Classe</th><th>Matière</th><th>Enseignant</th><th>Salle</th><th>Statut</th>@if (canEdit()) { <th>Actions</th> }</tr>
              </thead>
              <tbody>
                @for (slot of edt(); track slot.id) {
                  <tr style="cursor:pointer" (click)="openSeance(slot, slotJour(slot))">
                    <td style="font-weight:600">{{ joursLabel[slot.jourSemaine] }}</td>
                    <td>{{ slot.dateDebut ? (slot.dateDebut | date:'dd/MM/yyyy') : 'Récurrent' }}</td>
                    <td>{{ slot.heureDebut }} - {{ slot.heureFin }}</td>
                    <td>{{ slot.classe?.nom }}</td>
                    <td>{{ slot.matiere?.nom }}</td>
                    <td>{{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }}</td>
                    <td>{{ slot.salle?.nom || '—' }}</td>
                    <td><span class="tag" [class]="statutClass(slot, slotJour(slot))">{{ statutLabel(slot, slotJour(slot)) }}</span></td>
                    @if (canEdit()) { <td><button (click)="remove(slot.id); $event.stopPropagation()" class="btn btn-icon btn-danger" title="Supprimer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button></td> }
                  </tr>
                } @empty {
                  <tr><td colspan="9" class="table-empty">Aucun créneau enregistré</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class EmploiDuTempsComponent implements OnInit {
  private edtService = inject(EmploiDuTempsService);
  private salleService = inject(SalleService);
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private router = inject(Router);

  canEdit(): boolean {
    return this.authService.currentUser()?.role !== RoleUtilisateur.SECRETAIRE;
  }

  edt = signal<EmploiDuTemps[]>([]);
  salles = signal<Salle[]>([]);
  affectations = signal<Affectation[]>([]);
  classes = signal<{ id: string; nom: string }[]>([]);
  matieresForClasse = signal<{ id: string; nom: string }[]>([]);
  enseignantsForClasseMatiere = signal<{ id: string; nom: string; prenom: string }[]>([]);
  saving = signal(false);
  showForm = signal(false);
  viewMode = signal<'calendar' | 'table'>('calendar');
  filterClasseId = signal<string | null>(null);
  weekOffset = signal(0);
  statuts = signal<Map<string, StatutSeanceAffiche>>(new Map());

  hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  filteredEdt = computed(() => {
    const filter = this.filterClasseId();
    if (!filter) return this.edt();
    return this.edt().filter(s => s.classeId === filter);
  });

  // --- Week navigation ---
  prevWeek() { this.weekOffset.update(v => v - 1); this.loadEdt(); }
  nextWeek() { this.weekOffset.update(v => v + 1); this.loadEdt(); }
  goToday() { this.weekOffset.set(0); this.loadEdt(); }

  currentWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + this.weekOffset() * 7);
    return monday;
  }

  dateForDay(jourSemaine: number): string {
    const [y, m, d] = this.isoDateForDay(jourSemaine).split('-');
    return `${d}/${m}/${y}`;
  }

  isoDateForDay(jourSemaine: number): string {
    const monday = this.currentWeekStart();
    const date = new Date(monday);
    date.setDate(monday.getDate() + (jourSemaine - 1));
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  }

  statutFor(slot: any, jourSemaine: number): StatutSeanceAffiche {
    return this.statuts().get(`${slot.id}|${this.isoDateForDay(jourSemaine)}`) || 'A_RENSEIGNER';
  }
  statutLabel(slot: any, jourSemaine: number): string { return seanceStatutLabel(this.statutFor(slot, jourSemaine)); }
  statutClass(slot: any, jourSemaine: number): string { return seanceStatutClass(this.statutFor(slot, jourSemaine)); }

  openSeance(slot: any, jourSemaine: number) {
    this.router.navigate(['/seance', slot.id, this.isoDateForDay(jourSemaine)]);
  }

  weekRangeLabel = computed(() => {
    this.weekOffset(); // dependency
    const monday = this.currentWeekStart();
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    const fmt = (dt: Date) => {
      const d = String(dt.getDate()).padStart(2, '0');
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const y = dt.getFullYear();
      return `${d}/${m}/${y}`;
    };
    return `${fmt(monday)} — ${fmt(saturday)}`;
  });

  isToday(jourSemanae: number): boolean {
    if (this.weekOffset() !== 0) return false;
    const now = new Date();
    const day = now.getDay();
    const todayJour = day === 0 ? 7 : day; // 1=Monday...7=Sunday
    return todayJour === jourSemanae;
  }

  // --- Indicators ---
  totalCreneaux = computed(() => this.filteredEdt().length);

  totalHeures = computed(() => {
    return this.filteredEdt().reduce((sum, s) => {
      const start = parseInt((s.heureDebut || '0').split(':')[0]) + parseInt((s.heureDebut || '0').split(':')[1]) / 60;
      const end = parseInt((s.heureFin || '0').split(':')[0]) + parseInt((s.heureFin || '0').split(':')[1]) / 60;
      return sum + Math.max(0, end - start);
    }, 0);
  });

  totalClasses = computed(() => new Set(this.filteredEdt().map(s => s.classeId)).size);
  totalEnseignants = computed(() => new Set(this.filteredEdt().map(s => s.enseignantId)).size);
  totalSalles = computed(() => new Set(this.filteredEdt().filter(s => s.salleId).map(s => s.salleId)).size);
  totalMatieres = computed(() => new Set(this.filteredEdt().map(s => s.matiereId)).size);

  creneauxParJour(jour: number): number {
    return this.filteredEdt().filter(s => this.slotJour(s) === jour).length;
  }

  heuresParJour(jour: number): number {
    return this.filteredEdt().filter(s => this.slotJour(s) === jour).reduce((sum, s) => {
      const start = parseInt((s.heureDebut || '0').split(':')[0]) + parseInt((s.heureDebut || '0').split(':')[1]) / 60;
      const end = parseInt((s.heureFin || '0').split(':')[0]) + parseInt((s.heureFin || '0').split(':')[1]) / 60;
      return sum + Math.max(0, end - start);
    }, 0);
  }

  slotJour(s: any): number {
    if (s.dateDebut) {
      const dt = new Date(s.dateDebut);
      const js = dt.getDay();
      return js === 0 ? 7 : js;
    }
    return s.jourSemaine;
  }

  slotsForDayHour(day: number, hour: string): any[] {
    const hourNum = parseInt(hour.split(':')[0]);
    return this.filteredEdt().filter(s => {
      if (this.slotJour(s) !== day) return false;
      const slotStartHour = parseInt((s.heureDebut || '').split(':')[0]);
      return slotStartHour === hourNum;
    });
  }

  // --- Vue agenda mobile (jour par jour) ---
  selectedDayMobile = signal<number>(this.defaultMobileDay());

  private defaultMobileDay(): number {
    const day = new Date().getDay(); // 0=dimanche..6=samedi
    return day === 0 ? 1 : day;
  }

  slotsForDay(day: number): any[] {
    return this.filteredEdt()
      .filter(s => this.slotJour(s) === day)
      .sort((a, b) => (a.heureDebut || '').localeCompare(b.heureDebut || ''));
  }

  prevDayMobile() {
    const d = this.selectedDayMobile();
    if (d <= 1) { this.prevWeek(); this.selectedDayMobile.set(6); }
    else { this.selectedDayMobile.set(d - 1); }
  }

  nextDayMobile() {
    const d = this.selectedDayMobile();
    if (d >= 6) { this.nextWeek(); this.selectedDayMobile.set(1); }
    else { this.selectedDayMobile.set(d + 1); }
  }

  jours = [
    { value: 1, label: 'Lundi' }, { value: 2, label: 'Mardi' }, { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' }, { value: 5, label: 'Vendredi' }, { value: 6, label: 'Samedi' },
  ];
  joursLabel: Record<number, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };

  newSlot: CreateEmploiDuTempsDto = { classeId: '', matiereId: '', enseignantId: '', jourSemaine: 1, heureDebut: '08:00', heureFin: '10:00' };
  newSlotDate: string | null = null;

  ngOnInit() {
    this.loadEdt();
    this.loadSalles();
    this.loadAffectations();
  }

  loadEdt() {
    const monday = this.currentWeekStart();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (dt: Date) => {
      const d = String(dt.getDate()).padStart(2, '0');
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const y = dt.getFullYear();
      return `${y}-${m}-${d}`;
    };
    const weekStart = fmt(monday);
    const weekEnd = fmt(sunday);
    this.edtService.findAll(weekStart, weekEnd).subscribe({ next: (d) => this.edt.set(d), error: () => this.edt.set([]) });
    this.loadStatuts(weekStart, weekEnd);
  }

  loadStatuts(weekStart: string, weekEnd: string) {
    this.http.get<{ emploiDuTempsId: string; date: string; statutAffiche: StatutSeanceAffiche }[]>(
      `${environment.apiUrl}/seances/statuts?weekStart=${weekStart}&weekEnd=${weekEnd}`,
    ).subscribe({
      next: (d) => this.statuts.set(new Map((d || []).map(x => [`${x.emploiDuTempsId}|${x.date}`, x.statutAffiche]))),
      error: () => this.statuts.set(new Map()),
    });
  }

  loadSalles() {
    this.salleService.findAll().subscribe({ next: (d) => this.salles.set(d), error: () => this.salles.set([]) });
  }

  loadAffectations() {
    this.http.get<Affectation[]>(`${environment.apiUrl}/etudes/affectations`).subscribe({
      next: (d) => {
        this.affectations.set(d);
        const uniqueClasses = Array.from(new Map(d.map((a) => [a.classe.id, a.classe])).values());
        this.classes.set(uniqueClasses);
        if (uniqueClasses.length > 0) { this.newSlot.classeId = uniqueClasses[0].id; this.onClasseChange(); }
      },
      error: (err: any) => { const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur chargement affectations'; this.alertService.error(msg); },
    });
  }

  onClasseChange() {
    const mats = this.affectations().filter((a) => a.classe.id === this.newSlot.classeId);
    const uniqueMats = Array.from(new Map(mats.map((a) => [a.matiere.id, a.matiere])).values());
    this.matieresForClasse.set(uniqueMats);
    if (uniqueMats.length > 0) { this.newSlot.matiereId = uniqueMats[0].id; this.onMatiereChange(); }
  }

  onMatiereChange() {
    const profs = this.affectations()
      .filter((a) => a.classe.id === this.newSlot.classeId && a.matiere.id === this.newSlot.matiereId)
      .map((a) => a.enseignant);
    this.enseignantsForClasseMatiere.set(profs);
    if (profs.length > 0) this.newSlot.enseignantId = profs[0].id;
  }

  create() {
    this.saving.set(true);
    const payload = { ...this.newSlot, dateDebut: this.newSlotDate || undefined };
    this.edtService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.newSlotDate = null;
        this.alertService.success('Créneau ajouté');
        this.loadEdt();
      },
      error: (err: any) => {
        this.saving.set(false);
        const raw = err?.error;
        if (raw?.conflits && Array.isArray(raw.conflits)) {
          this.alertService.error(raw.conflits.join(', '), 'Conflit de créneau');
        } else if (typeof raw?.message === 'string') {
          this.alertService.error(raw.message);
        } else if (typeof err?.message === 'string') {
          this.alertService.error(err.message);
        } else {
          this.alertService.error('Erreur lors de la création du créneau');
        }
      },
    });
  }

  async remove(id: string) {
    const ok = await this.alertService.confirm({ title: 'Supprimer ce créneau ?', confirmText: 'Supprimer', danger: true });
    if (!ok) return;
    this.edtService.remove(id).subscribe({
      next: () => { this.alertService.success('Créneau supprimé'); this.loadEdt(); },
      error: (err: any) => { const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur suppression'; this.alertService.error(msg); },
    });
  }
}
