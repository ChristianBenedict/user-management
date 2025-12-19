import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService, CreateAppointmentRequest } from '../../../core/services/appointment.service';
import { UserService, User } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

export interface TimezonePreview {
  timezone: string;
  userName: string;
  startTime: string;
  endTime: string;
  isValid: boolean;
}

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-create.html',
  styleUrls: ['./appointment-create.scss'],
})
export class AppointmentCreateComponent implements OnInit {
  form!: FormGroup;
  users: User[] = [];
  loading = false;
  errorMessage = '';
  loadingUsers = false;
  timezonePreviews: TimezonePreview[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      participantIds: [[]]
    });
  }

  ngOnInit() {
    this.loadUsers();

    // Update preview when form values change
    this.form.valueChanges.subscribe(() => {
      this.updateTimezonePreview();
    });
  }

  loadUsers() {
    this.loadingUsers = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loadingUsers = false;
      },
      error: (err) => {
        this.errorMessage = 'Gagal memuat daftar user';
        this.loadingUsers = false;
        console.error(err);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { title, startDate, startTime, endDate, endTime, participantIds } = this.form.value;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User tidak ditemukan';
      this.loading = false;
      return;
    }

    // Debug: log the input values
    console.log('DEBUG Frontend - Input values:', {
      startDate,
      startTime,
      endDate,
      endTime,
      creatorTimezone: currentUser.preferred_timezone
    });

    // Ensure time format is correct (HH:mm)
    const startTimeFormatted = startTime.length === 5 ? startTime : startTime.padStart(5, '0');
    const endTimeFormatted = endTime.length === 5 ? endTime : endTime.padStart(5, '0');

    const startISO = `${startDate}T${startTimeFormatted}:00`;
    const endISO = `${endDate}T${endTimeFormatted}:00`;

    console.log('DEBUG Frontend - Sending to backend:', {
      start: startISO,
      end: endISO
    });

    const request: CreateAppointmentRequest = {
      title,
      start: startISO,
      end: endISO,
      participant_ids: participantIds || []
    };

    this.appointmentService.createAppointment(request).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/appointments']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Gagal membuat appointment';
        console.error(err);
      }
    });
  }

  toggleParticipant(userId: number) {
    const participantIds = this.form.get('participantIds')?.value || [];
    const index = participantIds.indexOf(userId);

    if (index > -1) {
      participantIds.splice(index, 1);
    } else {
      participantIds.push(userId);
    }

    this.form.patchValue({ participantIds });
  }

  isParticipantSelected(userId: number): boolean {
    const participantIds = this.form.get('participantIds')?.value || [];
    return participantIds.includes(userId);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError('required')) return 'Field ini wajib diisi';
    return '';
  }

  cancel() {
    this.router.navigate(['/appointments']);
  }

  hasInvalidPreviews(): boolean {
    return this.timezonePreviews.some(p => !p.isValid);
  }

  updateTimezonePreview() {
    const { startDate, startTime, endDate, endTime, participantIds } = this.form.value;
    const currentUser = this.authService.getCurrentUser();

    if (!startDate || !startTime || !endDate || !endTime || !currentUser) {
      this.timezonePreviews = [];
      return;
    }

    const timezones: { timezone: string; userName: string }[] = [
      { timezone: currentUser.preferred_timezone, userName: currentUser.name + ' (Anda)' }
    ];

    const selectedParticipants = this.users.filter(u =>
      participantIds && participantIds.includes(u.id)
    );

    selectedParticipants.forEach(p => {
      if (p.preferred_timezone !== currentUser.preferred_timezone) {
        timezones.push({ timezone: p.preferred_timezone, userName: p.name });
      }
    });

    const creatorTimezone = currentUser.preferred_timezone;
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Create UTC time from local time in creator's timezone
    const startUTC = this.localTimeToUTC(startYear, startMonth - 1, startDay, startHour, startMinute, creatorTimezone);
    const endUTC = this.localTimeToUTC(endYear, endMonth - 1, endDay, endHour, endMinute, creatorTimezone);

    this.timezonePreviews = timezones.map(({ timezone, userName }) => {
      try {
        let displayStartHour: number;
        let displayStartMin: number;
        let displayEndHour: number;
        let displayEndMin: number;

        // For creator timezone, use input time directly (no conversion needed)
        if (timezone === creatorTimezone) {
          displayStartHour = startHour;
          displayStartMin = startMinute;
          displayEndHour = endHour;
          displayEndMin = endMinute;
        } else {
          // Convert UTC to local time in target timezone
          const startLocal = this.utcToLocalTime(startUTC, timezone);
          const endLocal = this.utcToLocalTime(endUTC, timezone);
          displayStartHour = startLocal.getHours();
          displayStartMin = startLocal.getMinutes();
          displayEndHour = endLocal.getHours();
          displayEndMin = endLocal.getMinutes();
        }

        const startTotalMinutes = displayStartHour * 60 + displayStartMin;
        const endTotalMinutes = displayEndHour * 60 + displayEndMin;
        const workingStart = 9 * 60;
        const workingEnd = 17 * 60;

        const isValid = startTotalMinutes >= workingStart &&
          startTotalMinutes <= workingEnd &&
          endTotalMinutes >= workingStart &&
          endTotalMinutes <= workingEnd &&
          endTotalMinutes > startTotalMinutes;

        return {
          timezone,
          userName,
          startTime: `${String(displayStartHour).padStart(2, '0')}:${String(displayStartMin).padStart(2, '0')}`,
          endTime: `${String(displayEndHour).padStart(2, '0')}:${String(displayEndMin).padStart(2, '0')}`,
          isValid
        };
      } catch (error) {
        console.error('Error calculating timezone preview:', error);
        return {
          timezone,
          userName,
          startTime: 'Error',
          endTime: 'Error',
          isValid: false
        };
      }
    });
  }

  // Convert local time in a timezone to UTC
  private localTimeToUTC(year: number, month: number, day: number, hour: number, minute: number, timezone: string): Date {
    // Find UTC time that when converted to timezone shows as our desired local time
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Calculate timezone offset by comparing UTC and local time at a reference point
    // Use the desired time itself as reference
    const referenceUTC = new Date(Date.UTC(year, month, day, hour, minute, 0));
    const referenceParts = formatter.formatToParts(referenceUTC);
    const referenceLocalHour = parseInt(referenceParts.find(p => p.type === 'hour')!.value);
    const referenceLocalMin = parseInt(referenceParts.find(p => p.type === 'minute')!.value);

    // Calculate the difference
    const hourDiff = hour - referenceLocalHour;
    const minDiff = minute - referenceLocalMin;
    const totalDiffMinutes = hourDiff * 60 + minDiff;

    // Adjust UTC time
    const adjustedUTC = new Date(referenceUTC.getTime() - totalDiffMinutes * 60000);

    // Verify
    const verifyParts = formatter.formatToParts(adjustedUTC);
    const verifyHour = parseInt(verifyParts.find(p => p.type === 'hour')!.value);
    const verifyMin = parseInt(verifyParts.find(p => p.type === 'minute')!.value);

    if (verifyHour === hour && verifyMin === minute) {
      return adjustedUTC;
    }

    // If verification fails, fine-tune
    const finalDiff = (hour - verifyHour) * 60 + (minute - verifyMin);
    return new Date(adjustedUTC.getTime() - finalDiff * 60000);
  }

  // Convert UTC time to local time in a timezone
  private utcToLocalTime(utcDate: Date, timezone: string): Date {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(utcDate);
    const year = parseInt(parts.find(p => p.type === 'year')!.value);
    const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
    const day = parseInt(parts.find(p => p.type === 'day')!.value);
    const hour = parseInt(parts.find(p => p.type === 'hour')!.value);
    const minute = parseInt(parts.find(p => p.type === 'minute')!.value);
    const second = parseInt(parts.find(p => p.type === 'second')!.value);

    // Return as local date object (for display purposes only)
    return new Date(year, month, day, hour, minute, second);
  }
}

