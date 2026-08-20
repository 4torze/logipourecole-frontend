import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-dg-journal',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="page-container">
      <h1 style="margin:0 0 24px">Journal d'audit</h1>

      <div class="gs-panel">
        <div class="gs-panel-body">
          <div class="table-scroll">
            <table class="table">
              <thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Table</th><th>ID</th></tr></thead>
              <tbody>
                @for (a of audit().data || []; track a.id) {
                  <tr>
                    <td>{{ a.date | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ a.utilisateur?.nom }} {{ a.utilisateur?.prenom }}</td>
                    <td><span class="tag tag-neutral">{{ a.action }}</span></td>
                    <td>{{ a.tableName }}</td>
                    <td class="text-muted" style="font-size:12px">{{ a.recordId }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="table-empty">Aucune entrée dans le journal</td></tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="page()" [pageSize]="pageSize" [totalItems]="audit().total" (pageChange)="changePage($event)"></app-pagination>
        </div>
      </div>
    </div>
  `,
})
export class DgJournalComponent implements OnInit {
  private http = inject(HttpClient);

  audit = signal<any>({ data: [], total: 0, totalPages: 0 });
  page = signal(1);
  pageSize = 50;

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any>(`${environment.apiUrl}/dsi/audit?page=${this.page()}&limit=${this.pageSize}`).subscribe({
      next: (d) => this.audit.set(d),
      error: () => this.audit.set({ data: [], total: 0, totalPages: 0 }),
    });
  }

  changePage(page: number) {
    this.page.set(page);
    this.load();
  }
}
