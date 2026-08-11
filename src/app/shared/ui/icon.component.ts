import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="material-symbols-outlined" [class]="sizeClass" [style.font-variation-settings]="'FILL' + (filled ? 1 : 0) + ', wght' + weight + ', GRAD 0, opsz 24'">{{ name }}</span>`,
})
export class IconComponent {
  @Input() name = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() filled = false;
  @Input() weight = 400;

  get sizeClass(): string {
    const map: Record<string, string> = {
      sm: 'text-[18px]',
      md: 'text-[20px]',
      lg: 'text-[24px]',
      xl: 'text-[32px]',
    };
    return map[this.size] || map['md'];
  }
}
