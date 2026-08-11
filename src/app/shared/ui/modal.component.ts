import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalConfig {
  title: string;
  subtitle?: string;
  width?: string;
}

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" (click)="onOverlayClick($event)">
        <div
          class="relative bg-white rounded-xl shadow-modal border border-primary/10 animate-zoom-in w-full"
          [style.max-width]="width"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="p-6 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-slate-900">{{ title }}</h2>
                @if (subtitle) {
                  <p class="text-slate-500 text-sm mt-1">{{ subtitle }}</p>
                }
              </div>
              <button class="text-slate-400 hover:text-slate-600 transition-colors" (click)="close()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <!-- Body -->
          <div class="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <ng-content />
          </div>
          <!-- Footer -->
          @if (showFooter) {
            <div class="p-6 bg-slate-50 flex items-center justify-end gap-4 rounded-b-xl border-t border-slate-100">
              <ng-content select="[modal-footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() width = '560px';
  @Input() showFooter = true;
  @Input() closeOnOverlay = true;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onClose.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (this.closeOnOverlay) {
      this.close();
    }
  }
}
