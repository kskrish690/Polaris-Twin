import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../auth/auth.service';

interface NavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {

  currentTime = new Date();

  demoMode = true;

  profileDropdownOpen = false;

  private clockInterval?: ReturnType<typeof setInterval>;

  navItems: NavItem[] = [
    { label: 'Overview', route: '/overview' },
    { label: 'Maitri', route: '/maitri' },
    { label: 'Bharati', route: '/bharati' },
    { label: 'Infrastructure', route: '/infrastructure' },
    { label: 'Energy', route: '/energy' },
    { label: 'Logistics', route: '/logistics' },
    { label: 'Environment', route: '/environment' },
    { label: 'Simulation', route: '/simulation' },
    { label: 'Alerts', route: '/alerts' },
    { label: 'Reports', route: '/reports' }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

  }

  toggleDemoMode(): void {
    this.demoMode = !this.demoMode;
  }

  /* =====================================================
     PROFILE DROPDOWN
     ===================================================== */

  toggleProfileDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  login(): void {

    this.profileDropdownOpen = false;

    this.router.navigate(['/login']);

  }

  signup(): void {

    this.profileDropdownOpen = false;

    this.router.navigate(['/signup']);

  }

  logout(): void {

    this.authService.logout();

    this.profileDropdownOpen = false;

    this.router.navigate(['/']);

  }

  ngOnDestroy(): void {

    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }

  }

}