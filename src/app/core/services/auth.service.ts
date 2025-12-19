import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';
import { User } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private TOKEN_KEY = 'token';
  private USER_KEY = 'currentUser';

  constructor(private http: HttpClient) { }

  login(username: string) {
    return this.http.post<{ token: string }>('/api/login',
      { username }
    ).pipe(
      tap((res: any) => {
        if (res.data?.token) {
          localStorage.setItem(this.TOKEN_KEY, res.data.token);
        }
        if (res.data?.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.user));
        }
      })
    );
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getCurrentUserName(): string {
    const user = this.getCurrentUser();
    return user?.name || 'User';
  }

  logout() {
    return this.http.post<any>('/api/logout', {}).pipe(
      tap(() => {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
      })
    );
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
