import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EmploiDuTempsService, CreateEmploiDuTempsDto } from '../../core/services/emploi-du-temps.service';
import { SalleService } from '../../core/services/salle.service';
import { EmploiDuTemps, Salle } from '../../core/models';
import { environment } from '../../../environments/environment';

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
    .cal-grid { display: grid; grid-template-columns: 70px repeat(6, 1fr); border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; min-width: 700px; }
    .cal-header { padding: 8px 4px; text-align: center; font-weight: 600; background: #f8fafc; border-bottom: 2px solid #e5e7eb; border-right: 1px solid #e5e7eb; font-size: 13px; }
    .cal-header .date { font-size: 10px; color: #94a3b8; font-weight: 400; margin-top: 2px; }
    .cal-header.today { background: #eef2ff; }
    .cal-time { padding: 4px 6px; text-align: right; font-size: 11px; color: #6b7280; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #f0f0f0; display: flex; align-items: flex-start; justify-content: flex-end; }
    .cal-cell { border-right: 1px solid #e5e7eb; border-bottom: 1px solid #f0f0f0; min-height: 52px; padding: 2px; }
    .cal-event { border-radius: 4px; padding: 4px 6px; margin: 2px 0; font-size: 11px; border-left: 3px solid; line-height: 1.4; }
    .cal-event strong { display: block; font-size: 12px; }
    .cal-event-class { color: #374151; }
    .cal-event-teacher { color: #6b7280; }
    .cal-event-time { color: #9ca3af; }
    .cal-event-room { color: #6b7280; }
  `],
  template: `
    <div class="max-w-[1200px] mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 m-0">Emploi du temps</h1>
          <p class="text-sm text-slate-500 mt-1">Gérez les créneaux de cours</p>
        </div>
        <button (click)="showForm.set(true)" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all text-sm">
          <span class="material-symbols-outlined text-lg">add</span> Nouveau créneau
        </button>
      </div>

      <!-- Week navigation -->
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <button (click)="prevWeek()" class="flex items-center gap-1.5 h-10 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">
            <span class="material-symbols-outlined text-lg">chevron_left</span> Précédent
          </button>
          <div class="px-4 py-2 bg-white border border-slate-200 rounded-lg">
            <span class="text-sm font-semibold text-slate-900">{{ weekRangeLabel() }}</span>
          </div>
          <button (click)="nextWeek()" class="flex items-center gap-1.5 h-10 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">
            Suivant <span class="material-symbols-outlined text-lg">chevron_right</span>
          </button>
          <button (click)="goToday()" class="flex items-center gap-1.5 h-10 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm">
            <span class="material-symbols-outlined text-lg">today</span> Cette semaine
          </button>
        </div>
        <span class="text-xs text-slate-400">{{ weekOffset() === 0 ? 'Semaine courante' : (weekOffset() > 0 ? 'Semaine +' + weekOffset() : 'Semaine ' + weekOffset()) }}</span>
      </div>

      <!-- Indicators -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-4"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Créneaux</p><p class="text-2xl font-bold text-primary mt-1">{{ totalCreneaux() }}</p></div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-4"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Heures / semaine</p><p class="text-2xl font-bold text-amber-500 mt-1">{{ totalHeures() }}h</p></div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-4"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes</p><p class="text-2xl font-bold text-green-600 mt-1">{{ totalClasses() }}</p></div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-4"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enseignants</p><p class="text-2xl font-bold text-purple-600 mt-1">{{ totalEnseignants() }}</p></div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-4"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salles utilisées</p><p class="text-2xl font-bold text-cyan-600 mt-1">{{ totalSalles() }}</p></div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-4"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matières</p><p class="text-2xl font-bold text-pink-600 mt-1">{{ totalMatieres() }}</p></div>
      </div>

      <!-- Per-day breakdown -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
        @for (day of jours; track day.value) {
          <div class="bg-white rounded-xl border border-slate-200 shadow-card p-3 text-center">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ day.label }}</p>
            <p class="text-lg font-bold text-slate-900 mt-1">{{ creneauxParJour(day.value) }}</p>
            <p class="text-xs text-slate-400">créneaux · {{ heuresParJour(day.value) }}h</p>
          </div>
        }
      </div>

      @if (showForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showForm.set(false)">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 class="font-bold text-slate-900">Nouveau créneau</h3>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" (click)="showForm.set(false)"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="p-6 grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5 col-span-2"><label class="text-xs font-semibold text-slate-700">Classe</label><select [(ngModel)]="newSlot.classeId" (ngModelChange)="onClasseChange()" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm">@for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Matière</label><select [(ngModel)]="newSlot.matiereId" (ngModelChange)="onMatiereChange()" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm">@for (m of matieresForClasse(); track m.id) { <option [value]="m.id">{{ m.nom }}</option> }</select></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Enseignant</label><select [(ngModel)]="newSlot.enseignantId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm">@for (e of enseignantsForClasseMatiere(); track e.id) { <option [value]="e.id">{{ e.nom }} {{ e.prenom }}</option> }</select></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Jour</label><select [(ngModel)]="newSlot.jourSemaine" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm">@for (j of jours; track j.value) { <option [value]="j.value">{{ j.label }}</option> }</select></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Salle</label><select [(ngModel)]="newSlot.salleId" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"><option value="">—</option>@for (s of salles(); track s.id) { <option [value]="s.id">{{ s.nom }}</option> }</select></div>
              <div class="flex flex-col gap-1.5 col-span-2"><label class="text-xs font-semibold text-slate-700">Date (optionnel — pour un créneau spécifique à une semaine)</label><input type="date" [(ngModel)]="newSlotDate" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /><p class="text-xs text-slate-400">Laisser vide pour un créneau récurrent (toutes les semaines)</p></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Heure début</label><input type="time" [(ngModel)]="newSlot.heureDebut" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold text-slate-700">Heure fin</label><input type="time" [(ngModel)]="newSlot.heureFin" class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" /></div>
              <div class="col-span-2 flex gap-3 mt-2">
                <button (click)="create()" [disabled]="saving()" class="flex items-center gap-2 h-10 px-5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover text-sm disabled:opacity-50">@if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> } @else { <span class="material-symbols-outlined text-lg">save</span> } Ajouter</button>
                <button (click)="showForm.set(false)" class="h-10 px-5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div class="inline-flex rounded-lg border border-slate-200 overflow-hidden">
          <button (click)="viewMode.set('calendar')" class="flex items-center gap-1.5 h-9 px-4 text-sm font-medium transition-colors" [class]="viewMode() === 'calendar' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"><span class="material-symbols-outlined text-base">calendar_month</span> Calendrier</button>
          <button (click)="viewMode.set('table')" class="flex items-center gap-1.5 h-9 px-4 text-sm font-medium transition-colors" [class]="viewMode() === 'table' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"><span class="material-symbols-outlined text-base">table_rows</span> Tableau</button>
        </div>
        @if (viewMode() === 'calendar') {
          <select [(ngModel)]="filterClasseId" class="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/40">
            <option [ngValue]="null">Toutes les classes</option>
            @for (c of classes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
          </select>
        }
      </div>

      @if (viewMode() === 'calendar') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card p-4">
          <div class="cal-wrap"><div class="cal-grid">
            <div class="cal-header">Heure</div>
            @for (day of jours; track day.value) {
              <div class="cal-header" [class.today]="isToday(day.value)">{{ day.label }}<div class="date">{{ dateForDay(day.value) }}</div></div>
            }
            @for (hour of hours; track hour) {
              <div class="cal-time">{{ hour }}</div>
              @for (day of jours; track day.value) {
                <div class="cal-cell">
                  @for (slot of slotsForDayHour(day.value, hour); track slot.id) {
                    <div class="cal-event" [style.background-color]="getEventColor(slot.matiereId).bg" [style.border-left-color]="getEventColor(slot.matiereId).border">
                      <strong>{{ slot.matiere?.nom }}</strong>
                      @if (!filterClasseId()) { <div class="cal-event-class">{{ slot.classe?.nom }}</div> }
                      <div class="cal-event-teacher">{{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }}</div>
                      <div class="cal-event-time">{{ slot.heureDebut }} - {{ slot.heureFin }}</div>
                      @if (slot.salle?.nom) { <div class="cal-event-room">Salle: {{ slot.salle.nom }}</div> }
                    </div>
                  }
                </div>
              }
            }
          </div></div>
        </div>
      } @else {
        <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr><th class="px-4 py-3 text-left font-semibold">Jour</th><th class="px-4 py-3 text-left font-semibold">Date</th><th class="px-4 py-3 text-left font-semibold">Heure</th><th class="px-4 py-3 text-left font-semibold">Classe</th><th class="px-4 py-3 text-left font-semibold">Matière</th><th class="px-4 py-3 text-left font-semibold">Enseignant</th><th class="px-4 py-3 text-left font-semibold">Salle</th><th class="px-4 py-3 text-left font-semibold">Actions</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                @for (slot of edt(); track slot.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium text-slate-900">{{ joursLabel[slot.jourSemaine] }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ slot.dateDebut ? (slot.dateDebut | date:'dd/MM/yyyy') : 'Récurrent' }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ slot.heureDebut }} - {{ slot.heureFin }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ slot.classe?.nom }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ slot.matiere?.nom }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ slot.enseignant?.nom }} {{ slot.enseignant?.prenom }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ slot.salle?.nom || '—' }}</td>
                    <td class="px-4 py-3"><button (click)="remove(slot.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Supprimer"><span class="material-symbols-outlined text-lg">delete</span></button></td>
                  </tr>
                } @empty {
                  <tr><td colspan="8" class="text-center text-slate-400 py-8">Aucun créneau enregistré</td></tr>
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

  hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  eventColors = [
    { bg: '#ffedd5', border: '#c2410c' },
    { bg: '#f6ffed', border: '#52c41a' },
    { bg: '#fff7e6', border: '#fa8c16' },
    { bg: '#fff1f0', border: '#f5222d' },
    { bg: '#f9f0ff', border: '#722ed1' },
    { bg: '#e6fffb', border: '#13c2c2' },
    { bg: '#fcffe6', border: '#a0d911' },
    { bg: '#fffbe6', border: '#d4b106' },
  ];

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
    const monday = this.currentWeekStart();
    const date = new Date(monday);
    date.setDate(monday.getDate() + (jourSemaine - 1));
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
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

  private slotJour(s: any): number {
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

  getEventColor(matiereId: string): { bg: string; border: string } {
    let hash = 0;
    for (let i = 0; i < (matiereId || '').length; i++) {
      hash = ((hash << 5) - hash) + (matiereId || '').charCodeAt(i);
      hash |= 0;
    }
    return this.eventColors[Math.abs(hash) % this.eventColors.length];
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
      error: (err: any) => { const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur chargement affectations'; alert(msg); },
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
        alert('Créneau ajouté');
        this.loadEdt();
      },
      error: (err: any) => {
        this.saving.set(false);
        const raw = err?.error;
        if (raw?.conflits && Array.isArray(raw.conflits)) {
          alert(raw.conflits.join('\n'));
        } else if (typeof raw?.message === 'string') {
          alert(raw.message);
        } else if (typeof err?.message === 'string') {
          alert(err.message);
        } else {
          alert('Erreur lors de la création du créneau');
        }
      },
    });
  }

  remove(id: string) {
    if (!confirm('Supprimer ce créneau ?')) return;
    this.edtService.remove(id).subscribe({
      next: () => { alert('Créneau supprimé'); this.loadEdt(); },
      error: (err: any) => { const msg = typeof err?.error?.message === 'string' ? err.error.message : typeof err?.message === 'string' ? err.message : 'Erreur suppression'; alert(msg); },
    });
  }
}
