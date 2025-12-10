import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EdgeApiService } from '../../services/edge-api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private router: Router,
    private apiService: EdgeApiService
  ) { }

  goToHome() {
    this.router.navigate(['/']);
  }

  login() {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.adminLogin(this.username, this.password).subscribe({
      next: (response) => {
        // Store auth token if provided by backend
        if (response.token) {
          localStorage.setItem('adminToken', response.token);
        }
        localStorage.setItem('isAdmin', 'true');
        this.loading = false;
        this.router.navigate(['admin/categories']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.error = 'Invalid username or password.';
        this.loading = false;
      }
    });
  }
}
