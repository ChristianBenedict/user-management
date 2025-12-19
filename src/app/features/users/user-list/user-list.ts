import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';

  showDeleteDialog = false;
  userToDelete: User | null = null;
  successMessage = '';
  deleteLoading = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.load();
  }


  load() {
    this.loading = true;
    this.error = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('getUsers error', err);
        this.error = err.error?.error || err.message || 'Gagal mengambil data user';
        this.users = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/users/create']);
  }

  goToEdit(id: number) {
    this.router.navigate(['/users', id]);
  }

  confirmDelete(user: User) {
    this.userToDelete = user;
    this.showDeleteDialog = true;
  }

  cancelDelete() {
    this.showDeleteDialog = false;
    this.userToDelete = null;
  }

  deleteUser() {
    if (!this.userToDelete) return;

    this.deleteLoading = true;
    this.userService.deleteUser(this.userToDelete.id)
      .pipe(finalize(() => {
        this.deleteLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'User berhasil dihapus';
          this.showDeleteDialog = false;
          this.userToDelete = null;
          this.load();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Delete error', err);
          this.error = err.error?.message || 'Gagal menghapus user';
          this.showDeleteDialog = false;
          this.userToDelete = null;
          setTimeout(() => {
            this.error = '';
            this.cdr.detectChanges();
          }, 3000);
        }
      });
  }

}
