import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

// Presreće svaki HTTP zahtev i automatski dodaje Authorization heder ako korisnik ima token.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Koristimo novu metodu koja pravilno formatira header
  if (authService.getToken() && !req.headers.has('Authorization')) {
    const authHeaders = authService.getAuthHeaders();
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', authHeaders.get('Authorization') || '')
    });
    return next(clonedReq);
  }

  // Ako ne, samo prosledi originalni zahtev.
  return next(req);
};

