import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

// Presreće svaki HTTP zahtev i automatski dodaje Authorization heder ako korisnik ima token.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  console.log('🚀 Auth interceptor pozvan za URL:', req.url);
  const token = authService.getToken();
  console.log('🔑 Token iz localStorage:', token ? token.substring(0, 20) + '...' : 'NEMA TOKENA');
  console.log('📦 useJwt signal:', authService.useJwt());
  
  // Koristimo novu metodu koja pravilno formatira header
  if (token && !req.headers.has('Authorization')) {
    const authHeaders = authService.getAuthHeaders();
    const authHeader = authHeaders.get('Authorization');
    console.log('📋 Authorization header koji će biti dodat:', authHeader);
    
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', authHeader || '')
    });
    return next(clonedReq);
  }

  console.log('❌ Token nije dodat - token:', !!token, ', already has auth:', req.headers.has('Authorization'));
  // Ako ne, samo prosledi originalni zahtev.
  return next(req);
};

