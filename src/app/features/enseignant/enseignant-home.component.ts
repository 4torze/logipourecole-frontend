import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { filiereLabel } from '../../core/utils/filiere.util';
import { seanceStatutLabel, seanceStatutClass, StatutSeanceAffiche } from '../../core/utils/seance-statut.util';

@Component({
  selector: 'app-enseignant-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .cal-wrap { overflow-x: auto; }
    .cal-grid { display: grid; grid-template-columns: 60px repeat(6, 1fr); border: 1px solid var(--color-divider); overflow: hidden; min-width: 640px; }
    .cal-header { padding: 8px 4px; text-align: center; font-weight: 600; background: var(--color-neutral-100); border-bottom: 2px solid var(--color-divider); border-right: 1px solid var(--color-divider); font-size: 13px; }
    .cal-header.today { background: var(--color-accent-100); }
    .cal-header .date { font-size: 10px; color: color-mix(in srgb, var(--color-text) 55%, transparent); font-weight: 400; margin-top: 2px; }
    .cal-time { padding: 4px 6px; text-align: right; font-size: 11px; color: color-mix(in srgb, var(--color-text) 50%, transparent); border-right: 1px solid var(--color-divider); border-bottom: 1px solid var(--color-divider); display: flex; align-items: flex-start; justify-content: flex-end; }
    .cal-cell { border-right: 1px solid var(--color-divider); border-bottom: 1px solid var(--color-divider); min-height: 60px; padding: 2px; }
    .cal-event { padding: 4px 6px; margin: 2px 0; font-size: 11px; border-left: 3px solid; line-height: 1.4; cursor: pointer; }
    .cal-event:hover { background: color-mix(in srgb, var(--color-text) 4%, transparent); }
    .cal-event strong { display: block; font-size: 12px; }
    .cal-event-class { color: color-mix(in srgb, var(--color-text) 75%, transparent); }
    .cal-event-time { color: color-mix(in srgb, var(--color-text) 45%, transparent); }
    .cal-event-room { color: color-mix(in srgb, var(--color-text) 60%, transparent); }
    .gs-seg { display: inline-flex; overflow: hidden; border: 1px solid var(--color-divider); }
    .gs-seg-btn { padding: 8px 14px; font-size: 12px; font-weight: 600; font-family: var(--font-heading); background: none; border: none; cursor: pointer; color: color-mix(in srgb, var(--color-text) 60%, transparent); display: inline-flex; align-items: center; gap: 6px; }
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
    .agenda-event strong { display: block; font-size: 15px; }
    .agenda-event-meta { font-size: 13px; color: color-mix(in srgb, var(--color-text) 65%, transparent); margin-top: 4px; }
  `],
  template: `
    <div class="page-container">
      <h1 style="margin:0 0 24px">Mon emploi du temps</h1>

      <div class="gs-panel"><div class="gs-panel-body">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px">
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
          <div class="gs-seg">
            <button (click)="edtViewMode.set('calendar')" class="gs-seg-btn" [class.active]="edtViewMode() === 'calendar'">
              <span class="material-symbols-outlined" style="font-size:16px">calendar_month</span> Calendrier
            </button>
            <button (click)="edtViewMode.set('table')" class="gs-seg-btn" [class.active]="edtViewMode() === 'table'">
              <span class="material-symbols-outlined" style="font-size:16px">table_rows</span> Tableau
            </button>
          </div>
        </div>

        @if (edtViewMode() === 'calendar') {
          @if (edt().length > 0) {
            <div class="cal-desktop"><div class="cal-wrap"><div class="cal-grid">
              <div class="cal-header">Heure</div>
              @for (day of edtJours; track day.value) {
                <div class="cal-header" [class.today]="isToday(day.value)">{{ day.label }}<div class="date">{{ dateForDay(day.value) }}</div></div>
              }
              @for (hour of edtHours; track hour) {
                <div class="cal-time">{{ hour }}</div>
                @for (day of edtJours; track day.value) {
                  <div class="cal-cell">
                    @for (slot of slotsForDayHour(day.value, hour); track slot.id) {
                      <div class="cal-event" [style.background]="'var(--color-neutral-100)'" [style.border-left-color]="'var(--color-accent)'" (click)="openSeance(slot, day.value)">
                        <strong>{{ slot.matiere?.nom }}</strong>
                        <div class="cal-event-class">{{ slot.classe?.nom }}</div>
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
                @for (day of edtJours; track day.value) {
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
                <span style="font-size:13px;font-weight:600">{{ edtJoursLabel[selectedDayMobile()] }} {{ dateForDay(selectedDayMobile()) }}</span>
                <button type="button" class="btn btn-secondary btn-sm" (click)="nextDayMobile()">
                  <span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>
                </button>
              </div>
              @if (slotsForDay(selectedDayMobile()).length > 0) {
                @for (slot of slotsForDay(selectedDayMobile()); track slot.id) {
                  <div class="agenda-event" (click)="openSeance(slot, selectedDayMobile())">
                    <strong>{{ slot.matiere?.nom }}</strong>
                    <div class="agenda-event-meta">{{ slot.classe?.nom }} · {{ slot.heureDebut }} - {{ slot.heureFin }}@if (slot.salle?.nom) {<span> · Salle {{ slot.salle.nom }}</span>}</div>
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
          } @else {
            <div class="table-empty">
              <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">event_busy</span>
              Aucun créneau dans votre emploi du temps
            </div>
          }
        } @else {
          @if (edt().length > 0) {
            <div class="table-scroll">
              <table class="table">
                <thead>
                  <tr><th>Jour</th><th>Heure</th><th>Matière</th><th>Classe</th><th>Salle</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  @for (slot of edt(); track slot.id) {
                    <tr style="cursor:pointer" (click)="openSeance(slot, slot.jourSemaine)">
                      <td>{{ edtJoursLabel[slot.jourSemaine] || '—' }}</td>
                      <td>{{ slot.heureDebut }} - {{ slot.heureFin }}</td>
                      <td style="font-weight:600">{{ slot.matiere?.nom }}</td>
                      <td>{{ slot.classe?.nom }}</td>
                      <td>{{ slot.salle?.nom || '—' }}</td>
                      <td><span class="tag" [class]="statutClass(slot, slot.jourSemaine)">{{ statutLabel(slot, slot.jourSemaine) }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="table-empty">
              <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">event_busy</span>
              Aucun créneau dans votre emploi du temps
            </div>
          }
        }
      </div></div>

      <div class="gs-panel"><div class="gs-panel-head">
        <h3 style="margin:0;font-size:16px">Mes classes</h3>
        <button (click)="goToSeances()" class="btn btn-secondary btn-sm">
          <span class="material-symbols-outlined" style="font-size:16px">event_note</span> Mes séances
        </button>
      </div><div class="gs-panel-body">
        <div style="display:flex;flex-direction:column;gap:8px">
          @for (aff of affectations(); track aff.classe.id) {
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px;border:1px solid var(--color-divider)">
              <div>
                <strong>{{ aff.classe.nom }}</strong> <span class="text-muted">— {{ filiereLabel(aff.classe) }}</span>
                <div style="font-size:12px;color:color-mix(in srgb, var(--color-text) 45%, transparent);margin-top:2px">{{ aff.matieres.length }} matière(s) : {{ matieresNames(aff.matieres) }}</div>
              </div>
              <button (click)="goToNotes()" class="btn btn-primary btn-sm">Saisir des notes</button>
            </div>
          } @empty {
            <div class="table-empty">
              <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">school</span>
              Aucune classe affectée.
            </div>
          }
        </div>
      </div></div>
    </div>
  `,
})
export class EnseignantHomeComponent implements OnInit {
  filiereLabel = filiereLabel;
  private http = inject(HttpClient);
  private router = inject(Router);

  affectations = signal<any[]>([]);
  edt = signal<any[]>([]);
  edtViewMode = signal<'calendar' | 'table'>('calendar');
  weekOffset = signal(0);
  statuts = signal<Map<string, StatutSeanceAffiche>>(new Map());

  edtJours = [
    { value: 1, label: 'Lundi' }, { value: 2, label: 'Mardi' }, { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' }, { value: 5, label: 'Vendredi' }, { value: 6, label: 'Samedi' },
  ];
  edtJoursLabel: Record<number, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };
  edtHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  slotsForDayHour(day: number, hour: string): any[] {
    const hourNum = parseInt(hour.split(':')[0]);
    return this.edt().filter(s => {
      if (s.jourSemaine !== day) return false;
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
    return this.edt()
      .filter(s => s.jourSemaine === day)
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

  ngOnInit() { this.loadAffectations(); this.loadEdt(); this.loadStatuts(); }

  loadAffectations() { this.http.get<any[]>(`${environment.apiUrl}/enseignant/affectations`).subscribe({ next: (d) => this.affectations.set(d), error: () => this.affectations.set([]) }); }
  loadEdt() { this.http.get<any[]>(`${environment.apiUrl}/enseignant/emploi-du-temps`).subscribe({ next: (d) => this.edt.set(d), error: () => this.edt.set([]) }); }

  loadStatuts() {
    const monday = this.currentWeekStart();
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    const weekStart = this.toISODate(monday);
    const weekEnd = this.toISODate(saturday);
    this.http.get<{ emploiDuTempsId: string; date: string; statutAffiche: StatutSeanceAffiche }[]>(
      `${environment.apiUrl}/enseignant/seances/semaine?weekStart=${weekStart}&weekEnd=${weekEnd}`,
    ).subscribe({
      next: (d) => this.statuts.set(new Map((d || []).map(x => [`${x.emploiDuTempsId}|${x.date}`, x.statutAffiche]))),
      error: () => this.statuts.set(new Map()),
    });
  }

  statutFor(slot: any, jourSemaine: number): StatutSeanceAffiche {
    return this.statuts().get(`${slot.id}|${this.isoDateForDay(jourSemaine)}`) || 'A_RENSEIGNER';
  }
  statutLabel(slot: any, jourSemaine: number): string { return seanceStatutLabel(this.statutFor(slot, jourSemaine)); }
  statutClass(slot: any, jourSemaine: number): string { return seanceStatutClass(this.statutFor(slot, jourSemaine)); }

  openSeance(slot: any, jourSemaine: number) {
    this.router.navigate(['/seance', slot.id, this.isoDateForDay(jourSemaine)]);
  }

  goToNotes() { this.router.navigate(['/enseignant/notes']); }
  goToSeances() { this.router.navigate(['/enseignant/seances']); }
  matieresNames(matieres: any[]): string { return (matieres || []).map((m) => m.nom).join(', '); }

  // --- Navigation semaine (même logique que etudes/emploi-du-temps.component.ts) ---
  prevWeek() { this.weekOffset.update(v => v - 1); this.loadStatuts(); }
  nextWeek() { this.weekOffset.update(v => v + 1); this.loadStatuts(); }
  goToday() { this.weekOffset.set(0); this.loadStatuts(); }

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

  toISODate(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  }

  isoDateForDay(jourSemaine: number): string {
    const monday = this.currentWeekStart();
    const date = new Date(monday);
    date.setDate(monday.getDate() + (jourSemaine - 1));
    return this.toISODate(date);
  }

  dateForDay(jourSemaine: number): string {
    const iso = this.isoDateForDay(jourSemaine);
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
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

  isToday(jourSemaine: number): boolean {
    if (this.weekOffset() !== 0) return false;
    const now = new Date();
    const day = now.getDay();
    const todayJour = day === 0 ? 7 : day;
    return todayJour === jourSemaine;
  }
}
