import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {

  currentTime = new Date();

  private clockTimer?: ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateClock();

    this.clockTimer = setInterval(() => {
      this.updateClock();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
  }

  private updateClock(): void {
    this.currentTime = new Date();
  }

  enterDashboard(): void {
    this.router.navigate(['/overview']);
  }

  exploreStation(station: string): void {
    if (station === 'MAITRI') {
      this.router.navigate(['/maitri']);
      return;
    }

    if (station === 'BHARATI') {
      this.router.navigate(['/bharati']);
    }
  }

  get formattedTime(): string {
    return new Intl.DateTimeFormat(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
    ).format(this.currentTime);
  }

  get formattedDate(): string {
    const parts = new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).formatToParts(this.currentTime);

    const year =
      parts.find(part => part.type === 'year')?.value ?? '';

    const month =
      parts.find(part => part.type === 'month')?.value ?? '';

    const day =
      parts.find(part => part.type === 'day')?.value ?? '';

    return `${year}-${month}-${day}`;
  }
}