import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

// Presreće svaki HTTP zahtev i automatski dodaje Authorization heder ako korisnik ima token.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  // Ako token postoji i heder već nije postavljen, kloniraj zahtev i dodaj heder.
  if (authToken && !req.headers.has('Authorization')) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', authToken)
    });
    return next(clonedReq);
  }

  // Ako ne, samo prosledi originalni zahtev.
  return next(req);
};

