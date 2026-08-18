import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass">
      @if (dot) {
        <span [class]="dotClass"></span>
      }
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  @Input() variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' = 'neutral';
  @Input() dot = false;

  get badgeClass(): string {
    const variants: Record<string, string> = {
      success: 'tag tag-success',
      warning: 'tag tag-accent',
      danger: 'tag tag-danger',
      info: 'tag tag-neutral',
      neutral: 'tag tag-neutral',
      primary: 'tag tag-neutral',
    };
    return variants[this.variant];
  }

  get dotClass(): string {
    const colors: Record<string, string> = {
      success: 'var(--color-success)',
      warning: 'var(--color-accent)',
      danger: 'var(--color-danger)',
      info: 'var(--color-primary)',
      neutral: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
      primary: 'var(--color-primary)',
    };
    return `display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:8px;background:${colors[this.variant]}`;
  }
}
