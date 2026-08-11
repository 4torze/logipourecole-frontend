import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="buttonClass"
      (click)="onClick.emit($event)"
    >
      @if (icon) {
        <ui-icon [name]="icon" size="sm" />
      }
      @if (loading) {
        <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon = '';
  @Input() fullWidth = false;
  @Output() onClick = new EventEmitter<MouseEvent>();

  get buttonClass(): string {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
    const sizes: Record<string, string> = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-sm',
    };
    const variants: Record<string, string> = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      ghost: 'text-slate-600 hover:bg-slate-100',
      danger: 'bg-danger text-white hover:bg-red-600',
      outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white',
    };
    return `${base} ${sizes[this.size]} ${variants[this.variant]} ${this.fullWidth ? 'w-full' : ''}`;
  }
}
