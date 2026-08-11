import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    @if (label) {
      <label class="block text-sm font-semibold text-slate-700 mb-2">{{ label }}</label>
    }
    <div class="relative">
      <select
        [disabled]="disabled"
        (change)="onChange($event)"
        (blur)="onTouched()"
        class="w-full h-12 px-4 pr-10 appearance-none rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all disabled:opacity-50 text-sm"
      >
        @if (placeholder) {
          <option value="" disabled selected>{{ placeholder }}</option>
        }
        @for (opt of options; track opt.value) {
          <option [value]="opt.value" [selected]="opt.value === value">{{ opt.label }}</option>
        }
      </select>
      <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-xl">expand_more</span>
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() options: { value: string; label: string }[] = [];

  value: string = '';
  onChangeFn: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChangeFn(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
