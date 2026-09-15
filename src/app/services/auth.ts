import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly authKey = 'polaris_user';

  isLoggedIn(): boolean {
    return localStorage.getItem(this.authKey) === 'true';
  }

  login(): void {
    localStorage.setItem(this.authKey, 'true');
  }

  signup(): void {
    localStorage.setItem(this.authKey, 'true');
  }

  logout(): void {
    localStorage.removeItem(this.authKey);
  }
}