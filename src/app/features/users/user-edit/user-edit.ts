import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.scss'],
})
export class UserEdit implements OnInit {
  form: any;
  user: User | null = null;
  loading = false;
  loadingUser = false;
  error = '';
  successMessage = '';
  userId: number = 0;

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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      preferred_timezone: ['Asia/Jakarta', [Validators.required]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = parseInt(params['id']);
      if (this.userId) {
        this.loadUser();
      }
    });
  }

  loadUser() {
    this.loadingUser = true;
    this.error = '';

    this.userService.getUserById(this.userId)
      .pipe(finalize(() => {
        this.loadingUser = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.form.patchValue({
            name: user.name,
            preferred_timezone: user.preferred_timezone || 'Asia/Jakarta'
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading user', err);
          this.error = err.error?.error || err.error?.message || 'Gagal memuat data user';
          setTimeout(() => {
            this.router.navigate(['/users']);
          }, 2000);
        }
      });
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

    this.userService.updateUser(this.userId, {
      name: formValue.name,
      preferred_timezone: formValue.preferred_timezone
    })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'User berhasil diupdate';
          setTimeout(() => {
            this.router.navigate(['/users']);
          }, 1500);
        },
        error: (err) => {
          console.error('Update user error', err);
          this.error = err.error?.error || err.error?.message || 'Gagal mengupdate user';
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
      return `${fieldName} wajib diisi`;
    }
    return '';
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
