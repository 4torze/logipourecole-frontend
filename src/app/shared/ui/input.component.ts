import { Component, Input, EventEmitter, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    @if (label) {
      <label class="block text-sm font-semibold text-slate-700 mb-2">{{ label }}</label>
    }
    <div class="relative">
      @if (icon) {
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">{{ icon }}</span>
      }
      <input
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [class]="inputClass"
      />
    </div>
    @if (hint) {
      <p class="text-[11px] text-slate-400 italic mt-1">{{ hint }}</p>
    }
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() disabled = false;
  @Input() icon = '';
  @Input() hint = '';
  @Input() size: 'md' | 'lg' = 'lg';

  value: string = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get inputClass(): string {
    const base = 'w-full rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all placeholder:text-slate-400 disabled:opacity-50';
    const sizes: Record<string, string> = {
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-4 text-sm',
    };
    const padding = this.icon ? 'pl-10 pr-4' : 'px-4';
    return `${base} ${sizes[this.size]} ${padding}`;
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
