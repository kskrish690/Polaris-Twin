import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  AuthResponse,
  PolarisUser
} from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    'http://localhost:3000/api/auth';

  private readonly tokenKey =
    'polaris_twin_token';

  private readonly userKey =
    'polaris_twin_user';

  constructor(
    private http: HttpClient
  ) {}

  get currentUser(): PolarisUser | null {

    const user =
      localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get isLoggedIn(): boolean {
    return !!this.token && !!this.currentUser;
  }

  signup(
    name: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/signup`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password
        }
      )
      .pipe(
        tap(response => {

          if (response.success) {
            this.storeSession(response);
          }

        })
      );
  }

  login(
    email: string,
    password: string
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        {
          email: email.trim().toLowerCase(),
          password
        }
      )
      .pipe(
        tap(response => {

          if (response.success) {
            this.storeSession(response);
          }

        })
      );
  }

  logout(): void {

    localStorage.removeItem(
      this.tokenKey
    );

    localStorage.removeItem(
      this.userKey
    );
  }

  private storeSession(
    response: AuthResponse
  ): void {

    localStorage.setItem(
      this.tokenKey,
      response.token
    );

    localStorage.setItem(
      this.userKey,
      JSON.stringify(response.user)
    );
  }
}