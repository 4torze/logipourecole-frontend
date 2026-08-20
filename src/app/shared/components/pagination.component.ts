import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .page-btn { width: 32px; height: 32px; padding: 0; }
    @media (max-width: 640px) {
      .page-btn { width: 44px; height: 44px; }
    }
  `],
  template: `
    @if (totalItems > 0) {
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 4px;flex-wrap:wrap">
        <div style="font-size:12px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">
          Affichage {{ startIndex + 1 }}–{{ endIndex }} sur {{ totalItems }}
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <button
            type="button"
            class="btn btn-icon btn-secondary"
            [disabled]="page <= 1"
            (click)="goTo(page - 1)">
            <span class="material-symbols-outlined" style="font-size:18px">chevron_left</span>
          </button>
          @for (p of pagesToShow(); track p) {
            @if (p === -1) {
              <span style="padding:0 4px;color:color-mix(in srgb, var(--color-text) 45%, transparent);font-size:14px">…</span>
            } @else {
              <button
                type="button"
                class="btn page-btn"
                [class.btn-primary]="p === page"
                [class.btn-secondary]="p !== page"
                (click)="goTo(p)">
                {{ p }}
              </button>
            }
          }
          <button
            type="button"
            class="btn btn-icon btn-secondary"
            [disabled]="page >= totalPages"
            (click)="goTo(page + 1)">
            <span class="material-symbols-outlined" style="font-size:18px">chevron_right</span>
          </button>
        </div>
      </div>
    }
  `,
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() totalItems = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startIndex(): number {
    return (this.page - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.totalItems, this.page * this.pageSize);
  }

  pagesToShow(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const pages: number[] = [];
    const windowSize = 1;

    pages.push(1);
    if (current - windowSize > 2) pages.push(-1);
    for (let p = Math.max(2, current - windowSize); p <= Math.min(total - 1, current + windowSize); p++) {
      pages.push(p);
    }
    if (current + windowSize < total - 1) pages.push(-1);
    if (total > 1) pages.push(total);

    return pages;
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }
}
