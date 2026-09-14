import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  isSignup = false;

  email = '';
  password = '';
  name = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /* =========================
     BACK TO HOME
  ========================= */

  backToHome(): void {
    this.router.navigate(['/']);
  }

  /* =========================
     TOGGLE LOGIN / SIGNUP
  ========================= */

  toggleMode(): void {
    this.isSignup = !this.isSignup;

    this.errorMessage = '';

    this.email = '';
    this.password = '';
    this.name = '';
    this.confirmPassword = '';
  }

  /* =========================
     FORM SUBMIT
  ========================= */

  submit(): void {

    this.errorMessage = '';

    if (this.loading) {
      return;
    }

    /* =========================
       SIGNUP
    ========================= */

    if (this.isSignup) {

      if (
        !this.name.trim() ||
        !this.email.trim() ||
        !this.password ||
        !this.confirmPassword
      ) {
        this.errorMessage =
          'Please complete all required fields.';
        return;
      }

      if (this.password !== this.confirmPassword) {
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

      return;
    }

    /* =========================
       LOGIN
    ========================= */

    if (
      !this.email.trim() ||
      !this.password
    ) {
      this.errorMessage =
        'Please enter your email and password.';
      return;
    }

    this.loading = true;

    this.authService
      .login(
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
            'Invalid email or password.';
        }

      });
  }
}