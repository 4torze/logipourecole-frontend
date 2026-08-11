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
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variants: Record<string, string> = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-amber-100 text-amber-800',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-orange-100 text-orange-700',
      neutral: 'bg-slate-100 text-slate-800',
      primary: 'bg-primary/10 text-primary',
    };
    return `${base} ${variants[this.variant]}`;
  }

  get dotClass(): string {
    const dots: Record<string, string> = {
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-primary',
      neutral: 'bg-slate-400',
      primary: 'bg-primary',
    };
    return `size-1.5 rounded-full mr-2 ${dots[this.variant]}`;
  }
}
