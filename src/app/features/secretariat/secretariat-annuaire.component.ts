import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-secretariat-annuaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="gs-panel">
        <div class="gs-panel-head">
          <h3 style="margin:0;font-size:16px">Annuaire du personnel ({{ filteredAnnuaire().length }})</h3>
          <input type="text" [(ngModel)]="search" placeholder="Rechercher par nom..." class="input" style="min-width:240px;width:auto" />
        </div>
        <div class="gs-panel-body table-scroll">
          <table class="table">
            <thead>
              <tr><th>Nom</th><th>Rôle</th><th>Email</th><th>Téléphone</th><th>Statut</th></tr>
            </thead>
            <tbody>
              @for (u of filteredAnnuaire(); track u.id) {
                <tr>
                  <td style="font-weight:600">{{ u.prenom }} {{ u.nom }}</td>
                  <td><span class="tag tag-neutral">{{ u.role }}</span></td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.telephone || '—' }}</td>
                  <td><span class="tag" [class]="u.statut === 'ACTIF' ? 'tag-success' : 'tag-danger'">{{ u.statut }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="5" style="text-align:center;padding:32px 0;color:color-mix(in srgb, var(--color-text) 50%, transparent)">Aucun résultat</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class SecretariatAnnuaireComponent implements OnInit {
  private http = inject(HttpClient);

  annuaire = signal<any[]>([]);
  search = '';

  // Méthode plutôt que computed() : `search` n'est pas un signal (lié via
  // ngModel), donc un computed() ne se réévaluerait pas à la frappe.
  filteredAnnuaire(): any[] {
    const s = this.search.toLowerCase().trim();
    if (!s) return this.annuaire();
    return this.annuaire().filter((u) => `${u.prenom} ${u.nom}`.toLowerCase().includes(s));
  }

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/secretariat/annuaire`).subscribe({ next: (d) => this.annuaire.set(d || []), error: () => this.annuaire.set([]) });
  }
}
