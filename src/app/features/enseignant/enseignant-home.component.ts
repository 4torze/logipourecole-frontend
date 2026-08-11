import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-enseignant-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NzCardModule, NzButtonModule, NzIconModule, NzTableModule, NzGridModule, NzEmptyModule, NzRadioModule],
  styles: [`
    .cal-wrap { overflow-x: auto; }
    .cal-grid { display: grid; grid-template-columns: 60px repeat(6, 1fr); border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; min-width: 640px; }
    .classe-row { padding:16px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
    .cal-header { padding: 8px 4px; text-align: center; font-weight: 600; background: #fafafa; border-bottom: 2px solid #e5e7eb; border-right: 1px solid #e5e7eb; font-size: 13px; }
    .cal-time { padding: 4px 6px; text-align: right; font-size: 11px; color: #6b7280; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #f0f0f0; display: flex; align-items: flex-start; justify-content: flex-end; }
    .cal-cell { border-right: 1px solid #e5e7eb; border-bottom: 1px solid #f0f0f0; min-height: 52px; padding: 2px; }
    .cal-event { border-radius: 4px; padding: 4px 6px; margin: 2px 0; font-size: 11px; border-left: 3px solid; line-height: 1.4; }
    .cal-event strong { display: block; font-size: 12px; }
    .cal-event-class { color: #374151; }
    .cal-event-time { color: #9ca3af; }
    .cal-event-room { color: #6b7280; }
  `],
  template: `
    <div class="page-container">
      <h1 class="page-title">Mon emploi du temps</h1>

      <nz-card style="margin-bottom: 24px;" nzTitle="Emploi du temps">
        <div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
          <nz-radio-group [(ngModel)]="edtViewModeValue" nzButtonStyle="solid" (ngModelChange)="edtViewMode.set($event)">
            <label nz-radio-button nzValue="calendar"><span nz-icon nzType="calendar"></span> Calendrier</label>
            <label nz-radio-button nzValue="table"><span nz-icon nzType="table"></span> Tableau</label>
          </nz-radio-group>
        </div>
        @if (edtViewMode() === 'calendar') {
          @if (edt().length > 0) {
            <div class="cal-wrap"><div class="cal-grid">
              <div class="cal-header">Heure</div>
              @for (day of edtJours; track day.value) {
                <div class="cal-header">{{ day.label }}</div>
              }
              @for (hour of edtHours; track hour) {
                <div class="cal-time">{{ hour }}</div>
                @for (day of edtJours; track day.value) {
                  <div class="cal-cell">
                    @for (slot of slotsForDayHour(day.value, hour); track slot.id) {
                      <div class="cal-event" [style.background-color]="getEventColor(slot.matiereId).bg" [style.border-left-color]="getEventColor(slot.matiereId).border">
                        <strong>{{ slot.matiere?.nom }}</strong>
                        <div class="cal-event-class">{{ slot.classe?.nom }}</div>
                        <div class="cal-event-time">{{ slot.heureDebut }} - {{ slot.heureFin }}</div>
                        @if (slot.salle?.nom) { <div class="cal-event-room">Salle: {{ slot.salle.nom }}</div> }
                      </div>
                    }
                  </div>
                }
              }
            </div></div>
          } @else {
            <nz-empty nzDescription="Aucun créneau dans votre emploi du temps"></nz-empty>
          }
        } @else {
          @if (edt().length > 0) {
            <nz-table #edtTable [nzData]="edt()" [nzPageSize]="50" nzSize="small">
              <thead><tr><th>Jour</th><th>Heure</th><th>Matière</th><th>Classe</th><th>Salle</th></tr></thead>
              <tbody>
                @for (slot of edtTable.data; track slot.id) {
                  <tr><td>{{ edtJoursLabel[slot.jourSemaine] || '—' }}</td><td>{{ slot.heureDebut }} - {{ slot.heureFin }}</td>
                    <td>{{ slot.matiere?.nom }}</td><td>{{ slot.classe?.nom }}</td><td>{{ slot.salle?.nom || '—' }}</td></tr>
                }
              </tbody>
            </nz-table>
          } @else {
            <nz-empty nzDescription="Aucun créneau dans votre emploi du temps"></nz-empty>
          }
        }
      </nz-card>

      <nz-card style="margin-bottom: 24px;" nzTitle="Mes classes">
        @for (aff of affectations(); track aff.classe.id) {
          <div class="classe-row">
            <div>
              <strong>{{ aff.classe.nom }}</strong> — {{ aff.classe.filiere?.nom }}
              <br /><small style="color:#6b7280;">{{ aff.matieres.length }} matière(s): {{ matieresNames(aff.matieres) }}</small>
            </div>
            <button nz-button nzType="primary" (click)="goToNotes()">Saisir des notes</button>
          </div>
        }
      </nz-card>

    </div>
  `,
})
export class EnseignantHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  affectations = signal<any[]>([]);
  edt = signal<any[]>([]);
  edtViewMode = signal<'calendar' | 'table'>('calendar');
  edtViewModeValue: 'calendar' | 'table' = 'calendar';
  jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  edtJours = [
    { value: 1, label: 'Lundi' }, { value: 2, label: 'Mardi' }, { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' }, { value: 5, label: 'Vendredi' }, { value: 6, label: 'Samedi' },
  ];
  edtJoursLabel: Record<number, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };
  edtHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
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

  slotsForDayHour(day: number, hour: string): any[] {
    const hourNum = parseInt(hour.split(':')[0]);
    return this.edt().filter(s => {
      if (s.jourSemaine !== day) return false;
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

  ngOnInit() { this.loadAffectations(); this.loadEdt(); }

  loadAffectations() { this.http.get<any[]>(`${environment.apiUrl}/enseignant/affectations`).subscribe({ next: (d) => this.affectations.set(d), error: () => this.affectations.set([]) }); }
  loadEdt() { this.http.get<any[]>(`${environment.apiUrl}/enseignant/emploi-du-temps`).subscribe({ next: (d) => this.edt.set(d), error: () => this.edt.set([]) }); }

  goToNotes() { this.router.navigate(['/enseignant/notes']); }
  matieresNames(matieres: any[]): string { return (matieres || []).map((m) => m.nom).join(', '); }
}
