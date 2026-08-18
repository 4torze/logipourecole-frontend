import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-secretariat-taches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="gs-panel"><div class="gs-panel-head"><h3 style="margin:0;font-size:16px">Mes tâches du jour</h3></div><div class="gs-panel-body">
        <form (ngSubmit)="create()" style="display:flex;gap:8px;margin-bottom:20px">
          <input type="text" [(ngModel)]="newTitre" name="newTitre" placeholder="Nouvelle tâche..." class="input" style="flex:1" />
          <input type="date" [(ngModel)]="newEcheance" name="newEcheance" class="input" style="width:auto" />
          <button type="submit" class="btn btn-primary">Ajouter</button>
        </form>
        <div style="display:flex;flex-direction:column">
          @for (t of taches(); track t.id) {
            <div style="padding:10px 0;border-bottom:1px solid var(--color-divider);display:flex;align-items:center;gap:12px">
              <input type="checkbox" [checked]="t.terminee" (change)="toggle(t)" style="width:18px;height:18px;accent-color:var(--color-accent)" />
              <div style="flex:1">
                <span style="font-size:14px" [style.color]="t.terminee ? 'color-mix(in srgb, var(--color-text) 40%, transparent)' : 'var(--color-text)'" [style.text-decoration]="t.terminee ? 'line-through' : 'none'">{{ t.titre }}</span>
                @if (t.dateEcheance) { <span style="font-size:11px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-left:8px">{{ t.dateEcheance | date:'dd/MM/yyyy' }}</span> }
              </div>
              <button (click)="remove(t)" class="btn btn-icon btn-danger"><span class="material-symbols-outlined" style="font-size:16px">close</span></button>
            </div>
          } @empty {
            <div class="table-empty" style="font-size:14px">Aucune tâche pour le moment.</div>
          }
        </div>
      </div></div>
    </div>
  `,
})
export class SecretariatTachesComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  taches = signal<any[]>([]);
  newTitre = '';
  newEcheance = '';

  ngOnInit() { this.load(); }

  load() { this.http.get<any[]>(`${environment.apiUrl}/secretariat/taches`).subscribe({ next: (d) => this.taches.set(d || []), error: () => this.taches.set([]) }); }

  create() {
    if (!this.newTitre.trim()) return;
    this.http.post(`${environment.apiUrl}/secretariat/taches`, { titre: this.newTitre.trim(), dateEcheance: this.newEcheance || undefined }).subscribe({
      next: () => { this.newTitre = ''; this.newEcheance = ''; this.load(); },
      error: (err) => this.alertService.error(err.error?.message || 'Erreur'),
    });
  }

  toggle(t: any) {
    this.http.patch(`${environment.apiUrl}/secretariat/taches/${t.id}`, { terminee: !t.terminee }).subscribe({
      next: () => this.load(),
      error: (err) => this.alertService.error(err.error?.message || 'Erreur'),
    });
  }

  remove(t: any) {
    this.http.delete(`${environment.apiUrl}/secretariat/taches/${t.id}`).subscribe({
      next: () => this.load(),
      error: (err) => this.alertService.error(err.error?.message || 'Erreur'),
    });
  }
}
