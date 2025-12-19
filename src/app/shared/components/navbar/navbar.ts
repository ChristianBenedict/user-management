import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.scss'],
})
export class NavbarComponent implements OnInit {
    userName: string = 'User';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.userName = this.authService.getCurrentUserName();
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error('Logout error', err);
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                this.router.navigate(['/login']);
            }
        });
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }
}

