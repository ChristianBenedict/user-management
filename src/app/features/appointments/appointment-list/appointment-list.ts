import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.scss'],
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.errorMessage = '';
    console.log('Loading appointments...');

    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'Tidak ada token, silakan login ulang';
      this.loading = false;
      return;
    }

    fetch('http://localhost:8000/api/appointments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetch response data:', data);
        this.appointments = Array.isArray(data.data) ? data.data : [];
        this.loading = false;
        console.log('Appointments loaded, count:', this.appointments.length);
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error('Fetch error:', error);
        this.errorMessage = 'Gagal memuat appointment: ' + error.message;
        this.loading = false;
        this.appointments = [];
        this.cdr.detectChanges();
      });
  }

  navigateToCreate() {
    this.router.navigate(['/appointments/create']);
  }

  deleteAppointment(id: number) {
    if (confirm('Apakah Anda yakin ingin menghapus appointment ini?')) {
      this.appointmentService.deleteAppointment(id).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (err) => {
          alert('Gagal menghapus appointment');
          console.error(err);
        }
      });
    }
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}

