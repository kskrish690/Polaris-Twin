import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  signup(): void {

    this.errorMessage = '';

    if (
      !this.name ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage =
        'Please complete all fields.';
      return;
    }

    if (
      this.password !==
      this.confirmPassword
    ) {
      this.errorMessage =
        'Passwords do not match.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage =
        'Password must contain at least 8 characters.';
      return;
    }

    this.loading = true;

    this.authService
      .signup(
        this.name,
        this.email,
        this.password
      )
      .subscribe({

        next: (response) => {

          this.loading = false;

          if (response.success) {

            this.router.navigate([
              '/overview'
            ]);

          } else {

            this.errorMessage =
              response.message;
          }
        },

        error: (error) => {

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to create your account.';
        }

      });
  }
}