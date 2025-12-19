import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
  styleUrls: ['./user-create.scss'],
})
export class UserCreate implements OnInit {
  form: any;
  loading = false;
  error = '';
  successMessage = '';
  
  commonTimezones = [
    'Asia/Jakarta',
    'Asia/Singapore',
    'Asia/Bangkok',
    'Asia/Manila',
    'Asia/Hong_Kong',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'UTC'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      preferred_timezone: ['Asia/Jakarta', [Validators.required]]
    });
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const formValue = this.form.value;

    this.userService.createUser({
      name: formValue.name,
      username: formValue.username,
      preferred_timezone: formValue.preferred_timezone
    })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'User berhasil dibuat';
          setTimeout(() => {
            this.router.navigate(['/users']);
          }, 1500);
        },
        error: (err) => {
          console.error('Create user error', err);
          this.error = err.error?.error || err.error?.message || 'Gagal membuat user';
          setTimeout(() => {
            this.error = '';
            this.cdr.detectChanges();
          }, 5000);
        }
      });
  }


  markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required') && control?.touched) {
      return 'Field ini wajib diisi';
    }
    return '';
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
