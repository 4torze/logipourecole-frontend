import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalItems > 0) {
      <div class="flex items-center justify-between gap-4 px-1 py-3 flex-wrap">
        <div class="text-xs text-slate-500">
          Affichage {{ startIndex + 1 }}–{{ endIndex }} sur {{ totalItems }}
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="page <= 1"
            (click)="goTo(page - 1)">
            <span class="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          @for (p of pagesToShow(); track p) {
            @if (p === -1) {
              <span class="px-1 text-slate-400 text-sm">…</span>
            } @else {
              <button
                type="button"
                class="h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium"
                [class]="p === page ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'"
                (click)="goTo(p)">
                {{ p }}
              </button>
            }
          }
          <button
            type="button"
            class="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="page >= totalPages"
            (click)="goTo(page + 1)">
            <span class="material-symbols-outlined text-lg">chevron_right</span>
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
