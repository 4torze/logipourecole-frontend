import { Injectable, inject } from '@angular/core';
import { CanActivateChild, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MustChangePasswordGuard implements CanActivateChild {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivateChild(): boolean | UrlTree {
    if (this.authService.currentUser()?.mustChangePassword) {
      return this.router.createUrlTree(['/changer-mot-de-passe']);
    }
    return true;
  }
}
