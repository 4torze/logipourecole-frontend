import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    @if (updateAvailable()) {
      <div class="pwa-update-banner">
        <span>Une nouvelle version de RANIAG est disponible.</span>
        <button class="btn btn-primary" type="button" (click)="reload()">Recharger</button>
      </div>
    }
  `,
  styles: [`
    .pwa-update-banner {
      position: fixed;
      left: 50%;
      bottom: 20px;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--color-ink, #1a1816);
      color: #fff;
      padding: 12px 16px;
      z-index: 1000;
      max-width: calc(100vw - 32px);
    }
  `],
})
export class AppComponent {
  updateAvailable = signal(false);

  constructor(private swUpdate: SwUpdate) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable.set(true);
        }
      });
    }
  }

  reload(): void {
    document.location.reload();
  }
}
