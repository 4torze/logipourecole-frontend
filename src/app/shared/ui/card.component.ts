import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClass">
      @if (title) {
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg text-slate-900">{{ title }}</h3>
            @if (subtitle) {
              <p class="text-sm text-slate-500 mt-0.5">{{ subtitle }}</p>
            }
          </div>
          <ng-content select="[card-actions]" />
        </div>
      }
      <div [class]="bodyClass">
        <ng-content />
      </div>
    </div>
  `,
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() padding = 'p-6';
  @Input() noPadding = false;

  get cardClass(): string {
    return 'bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden';
  }

  get bodyClass(): string {
    return this.noPadding ? '' : this.padding;
  }
}
