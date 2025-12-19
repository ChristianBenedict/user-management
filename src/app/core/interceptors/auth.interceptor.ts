import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  console.log('Interceptor - Request URL:', req.url);
  return next(req).pipe(
    tap({
      next: (response) => console.log('Interceptor - Response received:', response),
      error: (error) => console.error('Interceptor - Error:', error)
    })
  );
};
