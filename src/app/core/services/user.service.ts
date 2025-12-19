import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  username: string;
  preferred_timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
  deleted_by?: string;
  deleted_at?: string;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  preferred_timezone: string;
}

export interface UpdateUserRequest {
  name?: string;
  preferred_timezone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<any>(`/api/users`).pipe(
      map(res => res.data ?? [])
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<any>(`/api/users/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  createUser(data: CreateUserRequest): Observable<any> {
    return this.http.post<any>(`/api/users`, data);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<any> {
    return this.http.put<any>(`/api/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`/api/users/${id}`);
  }
}
