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
    <div style="overflow-x:auto">
      <table class="table">
        <thead>
          <tr>
            @for (col of columns; track col.key) {
              <th
                [style.text-align]="col.align || 'left'"
                [style.width]="col.width"
              >
                {{ col.label }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data; track $index) {
            <tr>
              @for (col of columns; track col.key) {
                <td [style.text-align]="col.align || 'left'">
                  <ng-container
                    [ngTemplateOutlet]="getTemplate(col.key)"
                    [ngTemplateOutletContext]="{ $implicit: row, row: row }"
                  />
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns.length" class="table-empty">
                <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:6px;opacity:0.6">inbox</span>
                {{ emptyText }}
              </td>
            </tr>
          }
        </tbody>
      </table>
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
}
