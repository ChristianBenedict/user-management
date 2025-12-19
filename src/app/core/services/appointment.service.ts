import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Appointment {
  id: number;
  title: string;
  creator_id: number;
  start: string;
  end: string;
  start_local: string;
  end_local: string;
  creator: UserInfo;
  participants: UserInfo[];
  created_at: string;
}

export interface UserInfo {
  id: number;
  name: string;
  username: string;
  preferred_timezone: string;
}

export interface CreateAppointmentRequest {
  title: string;
  start: string; // ISO 8601 format
  end: string;   // ISO 8601 format
  participant_ids: number[];
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private http: HttpClient) { }

  getAppointments(): Observable<Appointment[]> {
    console.log('AppointmentService.getAppointments() called');
    return this.http.get<any>(`/api/appointments`).pipe(
      map(res => {
        console.log('Raw appointments response:', res);
        if (!res) {
          console.warn('Empty response received');
          return [];
        }
        const data = res.data ?? res ?? [];
        console.log('Processed appointments:', data);
        const result = Array.isArray(data) ? data : [];
        console.log('Returning appointments:', result);
        return result;
      }),
      catchError(error => {
        console.error('AppointmentService error:', error);
        return throwError(() => error);
      })
    );
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<any>(`/api/appointments/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  createAppointment(data: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<any>(`/api/appointments`, data).pipe(
      map(res => res.data ?? res)
    );
  }

  deleteAppointment(id: number): Observable<any> {
    return this.http.delete<any>(`/api/appointments/${id}`);
  }
}

