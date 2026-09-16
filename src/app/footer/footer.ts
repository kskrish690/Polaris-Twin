import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterLink
} from '@angular/router';

import { CommonModule } from '@angular/common';

import {
  interval,
  Subscription
} from 'rxjs';

import {
  filter
} from 'rxjs/operators';


@Component({
  selector: 'app-footer',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer implements OnInit, OnDestroy {

  /* =========================================================
     LIVE SYSTEM STATE
  ========================================================= */

  currentTime = new Date();

  isOnline = navigator.onLine;

  apiStatus: 'ONLINE' | 'CHECKING' | 'OFFLINE' = 'ONLINE';

  systemPanelOpen = false;

  selectedStation = 'BHARATI';

  copied = false;

  currentRoute = '';

  private readonly subscriptions = new Subscription();


  /* =========================================================
     FOOTER NAVIGATION
  ========================================================= */

  readonly navigationItems = [
    {
      label: 'OVERVIEW',
      route: '/overview'
    },
    {
      label: 'INFRASTRUCTURE',
      route: '/infrastructure'
    }
  ];


  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}


  /* =========================================================
     INIT
  ========================================================= */

  ngOnInit(): void {

    /*
     * Live clock
     */

    this.subscriptions.add(
      interval(1000).subscribe(() => {

        this.currentTime = new Date();

        this.cdr.detectChanges();

      })
    );


    /*
     * Browser network status
     */

    window.addEventListener(
      'online',
      this.handleOnline
    );

    window.addEventListener(
      'offline',
      this.handleOffline
    );


    /*
     * Track Angular route
     */

    this.subscriptions.add(
      this.router.events
        .pipe(
          filter(
            event => event instanceof NavigationEnd
          )
        )
        .subscribe(
          event => {

            const navigation =
              event as NavigationEnd;

            this.currentRoute =
              navigation.urlAfterRedirects;

            this.cdr.detectChanges();

          }
        )
    );


    /*
     * Initial route
     */

    this.currentRoute =
      this.router.url;


    /*
     * Restore station preference
     */

    const savedStation =
      localStorage.getItem(
        'polaris_footer_station'
      );

    if (
      savedStation === 'BHARATI' ||
      savedStation === 'MAITRI'
    ) {
      this.selectedStation = savedStation;
    }


    /*
     * Simulated API heartbeat.
     *
     * Replace this later with your actual
     * backend health endpoint if required.
     */

    this.checkApiStatus();

    this.subscriptions.add(
      interval(30000).subscribe(() => {

        this.checkApiStatus();

      })
    );

  }


  /* =========================================================
     DESTROY
  ========================================================= */

  ngOnDestroy(): void {

    this.subscriptions.unsubscribe();

    window.removeEventListener(
      'online',
      this.handleOnline
    );

    window.removeEventListener(
      'offline',
      this.handleOffline
    );

  }


  /* =========================================================
     NETWORK EVENTS
  ========================================================= */

  private readonly handleOnline = (): void => {

    this.isOnline = true;

    this.checkApiStatus();

    this.cdr.detectChanges();

  };


  private readonly handleOffline = (): void => {

    this.isOnline = false;

    this.apiStatus = 'OFFLINE';

    this.cdr.detectChanges();

  };


  /* =========================================================
     API STATUS
  ========================================================= */

  checkApiStatus(): void {

    if (!navigator.onLine) {

      this.apiStatus = 'OFFLINE';

      return;

    }

    this.apiStatus = 'CHECKING';

    this.cdr.detectChanges();


    /*
     * Small delay gives the UI a real heartbeat animation.
     *
     * Replace this method with an HttpClient health
     * request later if you want direct backend monitoring.
     */

    setTimeout(() => {

      this.apiStatus =
        navigator.onLine
          ? 'ONLINE'
          : 'OFFLINE';

      this.cdr.detectChanges();

    }, 700);

  }


  /* =========================================================
     SYSTEM PANEL
  ========================================================= */

  toggleSystemPanel(): void {

    this.systemPanelOpen =
      !this.systemPanelOpen;

  }


  closeSystemPanel(): void {

    this.systemPanelOpen = false;

  }


  /* =========================================================
     STATION SELECTOR
  ========================================================= */

  selectStation(
    station: 'BHARATI' | 'MAITRI'
  ): void {

    this.selectedStation = station;

    localStorage.setItem(
      'polaris_footer_station',
      station
    );


    /*
     * Navigate to infrastructure and pass
     * selected station through query params.
     */

    this.router.navigate(
      ['/infrastructure'],
      {
        queryParams: {
          station
        }
      }
    );

  }


  /* =========================================================
     QUICK NAVIGATION
  ========================================================= */

  navigateTo(
    route: string
  ): void {

    this.router.navigate([
      route
    ]);

  }


  /* =========================================================
     WEATHER / API ACTION
  ========================================================= */

  openApiInfo(): void {

    this.systemPanelOpen = true;

  }


  /* =========================================================
     BACK TO TOP
  ========================================================= */

  scrollToTop(): void {

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  /* =========================================================
     COPY COORDINATES
  ========================================================= */

  async copyCoordinates(): Promise<void> {

    const coordinates =
      this.selectedStation === 'BHARATI'
        ? 'BHARATI · 69.406833°S · 76.195333°E'
        : 'MAITRI · 70.755714°S · 11.654676°E';

    try {

      await navigator.clipboard.writeText(
        coordinates
      );

      this.copied = true;

      this.cdr.detectChanges();


      setTimeout(() => {

        this.copied = false;

        this.cdr.detectChanges();

      }, 1800);

    } catch {

      this.copied = false;

    }

  }


  /* =========================================================
     CURRENT TIME
  ========================================================= */

  get formattedTime(): string {

    return this.currentTime.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
      }
    );

  }


  /* =========================================================
     CURRENT DATE
  ========================================================= */

  get formattedDate(): string {

    return this.currentTime.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      }
    );

  }


  /* =========================================================
     STATUS HELPERS
  ========================================================= */

  get apiLabel(): string {

    if (this.apiStatus === 'CHECKING') {
      return 'CHECKING';
    }

    if (this.apiStatus === 'ONLINE') {
      return 'API ONLINE';
    }

    return 'API OFFLINE';

  }


  get systemStatus(): string {

    if (!this.isOnline) {
      return 'NETWORK OFFLINE';
    }

    if (this.apiStatus === 'CHECKING') {
      return 'SYNCING';
    }

    if (this.apiStatus === 'ONLINE') {
      return 'SYSTEM NOMINAL';
    }

    return 'API DEGRADED';

  }


  get stationCoordinates(): string {

    return this.selectedStation === 'BHARATI'
      ? '69.406833°S / 76.195333°E'
      : '70.755714°S / 11.654676°E';

  }

}