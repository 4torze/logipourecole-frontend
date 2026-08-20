import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string | any[];
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;font-size:13px;margin-bottom:16px;color:color-mix(in srgb, var(--color-text) 60%, transparent)">
      @for (item of items; track $index; let last = $last) {
        @if (item.route && !last) {
          <a [routerLink]="item.route" style="color:var(--color-accent);text-decoration:none">{{ item.label }}</a>
        } @else {
          <span [style.font-weight]="last ? 600 : 400" [style.color]="last ? 'var(--color-text)' : 'inherit'">{{ item.label }}</span>
        }
        @if (!last) {
          <span class="material-symbols-outlined" style="font-size:16px;opacity:0.5">chevron_right</span>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
