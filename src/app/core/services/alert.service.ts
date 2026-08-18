import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

export interface ConfirmOptions {
  title: string;
  html?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const PRIMARY = '#f98006';
const DANGER = '#dc2626';
const NEUTRAL = '#78716c';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private toast(icon: SweetAlertIcon, message: string, title?: string) {
    return Swal.fire({
      icon,
      title: title ?? this.defaultTitle(icon),
      text: message,
      confirmButtonColor: PRIMARY,
      timer: icon === 'success' ? 2200 : undefined,
      timerProgressBar: icon === 'success',
      showConfirmButton: icon !== 'success',
    });
  }

  private defaultTitle(icon: SweetAlertIcon): string {
    switch (icon) {
      case 'success': return 'Succès';
      case 'error': return 'Erreur';
      case 'warning': return 'Attention';
      default: return 'Information';
    }
  }

  success(message: string, title?: string) {
    return this.toast('success', message, title);
  }

  error(message: string, title?: string) {
    return this.toast('error', message, title);
  }

  info(message: string, title?: string) {
    return this.toast('info', message, title);
  }

  warning(message: string, title?: string) {
    return this.toast('warning', message, title);
  }

  async confirm(options: ConfirmOptions): Promise<boolean> {
    const res = await Swal.fire({
      icon: options.danger ? 'warning' : 'question',
      title: options.title,
      html: options.html,
      text: options.text,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: options.confirmText || 'Confirmer',
      cancelButtonText: options.cancelText || 'Annuler',
      confirmButtonColor: options.danger ? DANGER : PRIMARY,
      cancelButtonColor: NEUTRAL,
    });
    return res.isConfirmed;
  }
}
