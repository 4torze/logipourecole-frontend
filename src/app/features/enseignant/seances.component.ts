import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { seanceStatutLabel, seanceStatutClass } from '../../core/utils/seance-statut.util';

interface Seance {
  id?: string;
  emploiDuTempsId: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  classe: { id: string; nom: string };
  matiere: { id: string; nom: string };
  salle?: { id?: string; nom?: string };
  statutAffiche: 'A_RENSEIGNER' | 'RESPECTEE' | 'NON_RESPECTEE';
}

@Component({
  selector: 'app-seances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <h1 style="margin:0">Mes séances</h1>
        <div style="display:flex;align-items:center;gap:8px">
          <button (click)="prevDay()" class="btn btn-icon btn-secondary">
            <span class="material-symbols-outlined" style="font-size:18px">chevron_left</span>
          </button>
          <input type="date" [ngModel]="selectedDate()" (ngModelChange)="selectedDate.set($event); loadSeances()" class="input" style="width:auto" />
          <button (click)="today()" class="btn btn-secondary">Aujourd'hui</button>
          <button (click)="nextDay()" class="btn btn-icon btn-secondary">
            <span class="material-symbols-outlined" style="font-size:18px">chevron_right</span>
          </button>
        </div>
      </div>

      <div class="gs-panel">
        <div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Séances du {{ selectedDateLabel() }}</h3></div>
        <div class="gs-panel-body">
          @if (loading()) {
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:color-mix(in srgb, var(--color-text) 45%, transparent);padding:24px 0">
              <span class="material-symbols-outlined" style="font-size:18px">progress_activity</span> Chargement…
            </div>
          } @else if (seances().length === 0) {
            <div class="table-empty">
              <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">event_busy</span>
              Aucune séance prévue ce jour.
            </div>
          } @else {
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
              @for (seance of seances(); track seance.emploiDuTempsId) {
                <div class="card">
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                    <div>
                      <div style="font-family:var(--font-heading);font-weight:800">{{ seance.heureDebut }} – {{ seance.heureFin }}</div>
                      <div style="font-size:14px">{{ seance.matiere?.nom }}</div>
                      <div style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-top:2px">{{ seance.classe?.nom }} @if (seance.salle?.nom) { · Salle {{ seance.salle.nom }} }</div>
                    </div>
                    <span class="tag" [class]="statutClass(seance.statutAffiche)">{{ statutLabel(seance.statutAffiche) }}</span>
                  </div>
                  <button (click)="openSeance(seance)" class="btn btn-primary btn-block" style="margin-top:0">
                    Ouvrir la séance
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class SeancesComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  selectedDate = signal<string>(this.toISODate(new Date()));
  seances = signal<Seance[]>([]);
  loading = signal(false);

  statutLabel = seanceStatutLabel;
  statutClass = seanceStatutClass;

  ngOnInit() { this.loadSeances(); }

  selectedDateLabel() {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  toISODate(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().split('T')[0];
  }

  prevDay() {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    this.selectedDate.set(this.toISODate(d));
    this.loadSeances();
  }

  nextDay() {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    this.selectedDate.set(this.toISODate(d));
    this.loadSeances();
  }

  today() {
    this.selectedDate.set(this.toISODate(new Date()));
    this.loadSeances();
  }

  loadSeances() {
    this.loading.set(true);
    this.http.get<Seance[]>(`${environment.apiUrl}/enseignant/seances?date=${this.selectedDate()}`).subscribe({
      next: (data) => { this.seances.set(data || []); this.loading.set(false); },
      error: () => { this.seances.set([]); this.loading.set(false); },
    });
  }

  openSeance(seance: Seance) {
    this.router.navigate(['/seance', seance.emploiDuTempsId, this.selectedDate()]);
  }
}
