import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';

export interface PolarisUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: PolarisUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly tokenKey = 'polaris_token';
  private readonly userKey = 'polaris_user';


  constructor(
    private readonly http: HttpClient
  ) {}


  // ==========================================================
  // SIGN UP
  // ==========================================================

  signup(
    name: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/signup`,
        {
          name,
          email,
          password
        }
      )
      .pipe(
        tap(response => {
          if (response.success) {
            this.saveAuth(response);
          }
        })
      );
  }


  // ==========================================================
  // LOGIN
  // ==========================================================

  login(
    email: string,
    password: string
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        {
          email,
          password
        }
      )
      .pipe(
        tap(response => {
          if (response.success) {
            this.saveAuth(response);
          }
        })
      );
  }


  // ==========================================================
  // SAVE AUTHENTICATION
  // ==========================================================

  private saveAuth(response: AuthResponse): void {

    localStorage.setItem(
      this.tokenKey,
      response.token
    );

    localStorage.setItem(
      this.userKey,
      JSON.stringify(response.user)
    );
  }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  logout(): void {

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }


  // ==========================================================
  // CHECK LOGIN
  // ==========================================================

  isLoggedIn(): boolean {

    return !!localStorage.getItem(this.tokenKey);
  }


  // ==========================================================
  // GET JWT TOKEN
  // ==========================================================

  get token(): string | null {

    return localStorage.getItem(this.tokenKey);
  }


  // ==========================================================
  // GET CURRENT USER
  // ==========================================================

  get currentUser(): PolarisUser | null {

    const user = localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {

      return JSON.parse(user) as PolarisUser;

    } catch {

      return null;
    }
  }


  // ==========================================================
  // GET USER NAME
  // ==========================================================

  get userName(): string {

    return this.currentUser?.name ?? '';
  }


  // ==========================================================
  // GET USER EMAIL
  // ==========================================================

  get userEmail(): string {

    return this.currentUser?.email ?? '';
  }


  // ==========================================================
  // GET USER ROLE
  // ==========================================================

  get userRole(): string {

    return this.currentUser?.role ?? '';
  }
}