import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  private clockInterval?: ReturnType<typeof setInterval>;

  navItems: NavItem[] = [
    {
      label: 'Overview',
      route: '/overview'
    },
    {
      label: 'Maitri',
      route: '/maitri'
    },
    {
      label: 'Bharati',
      route: '/bharati'
    },
    {
      label: 'Infrastructure',
      route: '/infrastructure'
    },
    {
      label: 'Energy',
      route: '/energy'
    },
    {
      label: 'Logistics',
      route: '/logistics'
    },
    {
      label: 'Environment',
      route: '/environment'
    },
    {
      label: 'Simulation',
      route: '/simulation'
    },
    {
      label: 'Alerts',
      route: '/alerts'
    },
    {
      label: 'Reports',
      route: '/reports'
    }
  ];

  ngOnInit(): void {
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  toggleDemoMode(): void {
    this.demoMode = !this.demoMode;
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }
}