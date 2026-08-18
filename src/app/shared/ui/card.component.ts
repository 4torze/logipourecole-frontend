import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gs-panel">
      @if (title) {
        <div class="gs-panel-head">
          <div>
            <h3 style="margin:0;font-size:16px">{{ title }}</h3>
            @if (subtitle) {
              <p style="font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin:2px 0 0">{{ subtitle }}</p>
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
  @Input() padding = 'gs-panel-body';
  @Input() noPadding = false;

  get bodyClass(): string {
    return this.noPadding ? '' : this.padding;
  }
}
