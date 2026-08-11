import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              @for (col of columns; track col.key) {
                <th
                  [class]="thClass(col)"
                  [style.width]="col.width"
                >
                  {{ col.label }}
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (row of data; track $index) {
              <tr class="hover:bg-slate-50/80 transition-colors">
                @for (col of columns; track col.key) {
                  <td [class]="tdClass(col)">
                    <ng-container
                      [ngTemplateOutlet]="getTemplate(col.key)"
                      [ngTemplateOutletContext]="{ $implicit: row, row: row }"
                    />
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columns.length" class="px-6 py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center gap-3">
                    <span class="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                    <p class="text-sm">{{ emptyText }}</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() emptyText = 'Aucune donnée disponible';

  @Input() cellTemplates: { [key: string]: any } = {};

  getTemplate(key: string) {
    return this.cellTemplates[key] || null;
  }

  thClass(col: TableColumn): string {
    const base = 'px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider';
    const align: Record<string, string> = {
      left: 'text-left',
      right: 'text-right',
      center: 'text-center',
    };
    return `${base} ${align[col.align || 'left']}`;
  }

  tdClass(col: TableColumn): string {
    const base = 'px-6 py-5 text-sm text-slate-600';
    const align: Record<string, string> = {
      left: 'text-left',
      right: 'text-right',
      center: 'text-center',
    };
    return `${base} ${align[col.align || 'left']}`;
  }
}
