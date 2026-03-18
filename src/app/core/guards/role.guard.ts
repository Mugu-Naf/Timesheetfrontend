import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] ?? [];

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = auth.role();
  if (allowedRoles.length && !allowedRoles.includes(userRole ?? '')) {
    auth.redirectByRole();
    return false;
  }

  return true;
};
