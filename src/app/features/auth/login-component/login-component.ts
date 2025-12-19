import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss'],
})
export class LoginComponent {
  loading = false;
  errorMessage = '';
  form: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { username } = this.form.value;

    this.auth.login(username!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/appointments']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Username tidak ditemukan';
      }
    });
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if(control?.hasError('required')) return 'Username wajib diisi';
    return '';
  }

}
