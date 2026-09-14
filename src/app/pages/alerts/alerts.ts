import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AlertItem {
  id: number;
  code: string;
  title: string;
  description: string;

  station: 'MAITRI' | 'BHARATI' | 'NETWORK';
  category:
    | 'WEATHER'
    | 'ENERGY'
    | 'INFRASTRUCTURE'
    | 'LOGISTICS'
    | 'COMMUNICATION'
    | 'ENVIRONMENT';

  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

  timestamp: Date;

  value: string;
  threshold: string;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './alerts.html',
  styleUrls: ['./alerts.css']
})
export class Alerts implements OnInit, OnDestroy {

  /* =========================================================
     CLOCK
  ========================================================= */

  currentTime = new Date();

  private clockTimer?: ReturnType<typeof setInterval>;
  private alertTimer?: ReturnType<typeof setInterval>;


  /* =========================================================
     FILTERS
  ========================================================= */

  searchText = '';

  selectedSeverity:
    | 'ALL'
    | 'CRITICAL'
    | 'WARNING'
    | 'INFO' = 'ALL';

  selectedStation:
    | 'ALL'
    | 'MAITRI'
    | 'BHARATI'
    | 'NETWORK' = 'ALL';

  selectedStatus:
    | 'ALL'
    | 'ACTIVE'
    | 'ACKNOWLEDGED'
    | 'RESOLVED' = 'ALL';


  /* =========================================================
     ALERT DATA
  ========================================================= */

  alerts: AlertItem[] = [
    {
      id: 1,
      code: 'ALT-001',
      title: 'Extreme Wind Conditions',
      description:
        'Wind speed has exceeded the configured operational threshold at Maitri.',
      station: 'MAITRI',
      category: 'WEATHER',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      value: '68 km/h',
      threshold: '> 60 km/h'
    },

    {
      id: 2,
      code: 'ALT-002',
      title: 'Low Temperature Warning',
      description:
        'Ambient temperature has fallen below the predefined monitoring level.',
      station: 'BHARATI',
      category: 'WEATHER',
      severity: 'WARNING',
      status: 'ACTIVE',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      value: '-24.8 °C',
      threshold: '< -22 °C'
    },

    {
      id: 3,
      code: 'ALT-003',
      title: 'Generator Load Anomaly',
      description:
        'Simulated generator load is operating above the normal range.',
      station: 'MAITRI',
      category: 'ENERGY',
      severity: 'WARNING',
      status: 'ACKNOWLEDGED',
      timestamp: new Date(Date.now() - 24 * 60 * 1000),
      value: '91%',
      threshold: '> 85%'
    },

    {
      id: 4,
      code: 'ALT-004',
      title: 'Communication Link Degradation',
      description:
        'Station communication quality has dropped below the desired level.',
      station: 'BHARATI',
      category: 'COMMUNICATION',
      severity: 'WARNING',
      status: 'ACTIVE',
      timestamp: new Date(Date.now() - 31 * 60 * 1000),
      value: '72%',
      threshold: '< 80%'
    },

    {
      id: 5,
      code: 'ALT-005',
      title: 'Fuel Reserve Below Target',
      description:
        'Simulated fuel reserve is approaching the predefined replenishment level.',
      station: 'MAITRI',
      category: 'LOGISTICS',
      severity: 'INFO',
      status: 'ACTIVE',
      timestamp: new Date(Date.now() - 43 * 60 * 1000),
      value: '34%',
      threshold: '< 40%'
    },

    {
      id: 6,
      code: 'ALT-006',
      title: 'Infrastructure Health Deviation',
      description:
        'Digital-twin infrastructure health index has moved outside its expected band.',
      station: 'NETWORK',
      category: 'INFRASTRUCTURE',
      severity: 'WARNING',
      status: 'RESOLVED',
      timestamp: new Date(Date.now() - 70 * 60 * 1000),
      value: '76%',
      threshold: '< 80%'
    },

    {
      id: 7,
      code: 'ALT-007',
      title: 'Visibility Reduction',
      description:
        'Simulated environmental visibility has reduced significantly.',
      station: 'BHARATI',
      category: 'ENVIRONMENT',
      severity: 'INFO',
      status: 'RESOLVED',
      timestamp: new Date(Date.now() - 95 * 60 * 1000),
      value: '1.8 km',
      threshold: '< 2.0 km'
    },

    {
      id: 8,
      code: 'ALT-008',
      title: 'Station Telemetry Delay',
      description:
        'Telemetry packets are arriving later than the configured interval.',
      station: 'NETWORK',
      category: 'COMMUNICATION',
      severity: 'CRITICAL',
      status: 'ACKNOWLEDGED',
      timestamp: new Date(Date.now() - 110 * 60 * 1000),
      value: '18 sec',
      threshold: '> 15 sec'
    }
  ];


  /* =========================================================
     CONSTRUCTOR
  ========================================================= */

  constructor(
    private cdr: ChangeDetectorRef
  ) {}


  /* =========================================================
     INIT
  ========================================================= */

  ngOnInit(): void {

    this.updateClock();

    /*
     * India Standard Time clock refresh
     */
    this.clockTimer = setInterval(() => {

      this.updateClock();

      this.cdr.detectChanges();

    }, 1000);


    /*
     * Simulated incoming alert stream
     *
     * This is intentionally simulated and should NOT
     * be presented as live NCPOR telemetry.
     */
    this.alertTimer = setInterval(() => {

      this.generateSimulatedAlert();

    }, 15000);
  }


  /* =========================================================
     CLEANUP
  ========================================================= */

  ngOnDestroy(): void {

    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }

    if (this.alertTimer) {
      clearInterval(this.alertTimer);
    }
  }


  /* =========================================================
     CLOCK HELPERS
  ========================================================= */

  private updateClock(): void {

    this.currentTime = new Date();
  }


  get formattedTime(): string {

    return new Intl.DateTimeFormat('en-IN', {

      timeZone: 'Asia/Kolkata',

      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',

      hour12: false

    }).format(this.currentTime);
  }


  get formattedDate(): string {

    const parts = new Intl.DateTimeFormat('en-CA', {

      timeZone: 'Asia/Kolkata',

      year: 'numeric',
      month: '2-digit',
      day: '2-digit'

    }).formatToParts(this.currentTime);


    const year =
      parts.find(p => p.type === 'year')?.value ?? '';

    const month =
      parts.find(p => p.type === 'month')?.value ?? '';

    const day =
      parts.find(p => p.type === 'day')?.value ?? '';


    return `${year}-${month}-${day}`;
  }


  /* =========================================================
     FILTERED ALERTS
  ========================================================= */

  get filteredAlerts(): AlertItem[] {

    const search =
      this.searchText.trim().toLowerCase();


    return this.alerts.filter(alert => {

      const matchesSearch =
        !search ||
        alert.title.toLowerCase().includes(search) ||
        alert.description.toLowerCase().includes(search) ||
        alert.code.toLowerCase().includes(search) ||
        alert.station.toLowerCase().includes(search) ||
        alert.category.toLowerCase().includes(search);


      const matchesSeverity =
        this.selectedSeverity === 'ALL' ||
        alert.severity === this.selectedSeverity;


      const matchesStation =
        this.selectedStation === 'ALL' ||
        alert.station === this.selectedStation;


      const matchesStatus =
        this.selectedStatus === 'ALL' ||
        alert.status === this.selectedStatus;


      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStation &&
        matchesStatus
      );
    });
  }


  /* =========================================================
     COUNTERS
  ========================================================= */

  get activeCount(): number {

    return this.alerts.filter(
      alert => alert.status === 'ACTIVE'
    ).length;
  }


  get criticalCount(): number {

    return this.alerts.filter(
      alert =>
        alert.severity === 'CRITICAL' &&
        alert.status !== 'RESOLVED'
    ).length;
  }


  get warningCount(): number {

    return this.alerts.filter(
      alert =>
        alert.severity === 'WARNING' &&
        alert.status !== 'RESOLVED'
    ).length;
  }


  get acknowledgedCount(): number {

    return this.alerts.filter(
      alert => alert.status === 'ACKNOWLEDGED'
    ).length;
  }


  get resolvedCount(): number {

    return this.alerts.filter(
      alert => alert.status === 'RESOLVED'
    ).length;
  }


  get totalCount(): number {

    return this.alerts.length;
  }


  /* =========================================================
     ALERT ACTIONS
  ========================================================= */

  acknowledgeAlert(alert: AlertItem): void {

    if (alert.status !== 'ACTIVE') {
      return;
    }

    alert.status = 'ACKNOWLEDGED';

    this.cdr.detectChanges();
  }


  resolveAlert(alert: AlertItem): void {

    alert.status = 'RESOLVED';

    this.cdr.detectChanges();
  }


  reopenAlert(alert: AlertItem): void {

    alert.status = 'ACTIVE';

    alert.timestamp = new Date();

    this.cdr.detectChanges();
  }


  /* =========================================================
     FILTER ACTIONS
  ========================================================= */

  clearFilters(): void {

    this.searchText = '';

    this.selectedSeverity = 'ALL';

    this.selectedStation = 'ALL';

    this.selectedStatus = 'ALL';
  }


  /* =========================================================
     CSS CLASS HELPERS
  ========================================================= */

  getAlertClass(alert: AlertItem): string {

    switch (alert.severity) {

      case 'CRITICAL':
        return 'severity-critical';

      case 'WARNING':
        return 'severity-warning';

      case 'INFO':
        return 'severity-info';

      default:
        return '';
    }
  }


  getStatusClass(alert: AlertItem): string {

    switch (alert.status) {

      case 'ACTIVE':
        return 'status-active';

      case 'ACKNOWLEDGED':
        return 'status-acknowledged';

      case 'RESOLVED':
        return 'status-resolved';

      default:
        return '';
    }
  }


  /* =========================================================
     LABEL HELPERS
  ========================================================= */

  getSeverityLabel(
    severity: AlertItem['severity']
  ): string {

    switch (severity) {

      case 'CRITICAL':
        return 'CRITICAL';

      case 'WARNING':
        return 'WARNING';

      case 'INFO':
        return 'INFO';

      default:
        return severity;
    }
  }


  getStatusLabel(
    status: AlertItem['status']
  ): string {

    switch (status) {

      case 'ACTIVE':
        return 'ACTIVE';

      case 'ACKNOWLEDGED':
        return 'ACKNOWLEDGED';

      case 'RESOLVED':
        return 'RESOLVED';

      default:
        return status;
    }
  }


  /* =========================================================
     TIME AGO
  ========================================================= */

  getTimeAgo(timestamp: Date): string {

    const difference =
      Date.now() - timestamp.getTime();


    const seconds =
      Math.floor(difference / 1000);


    if (seconds < 60) {

      return `${seconds}s ago`;
    }


    const minutes =
      Math.floor(seconds / 60);


    if (minutes < 60) {

      return `${minutes}m ago`;
    }


    const hours =
      Math.floor(minutes / 60);


    if (hours < 24) {

      return `${hours}h ago`;
    }


    const days =
      Math.floor(hours / 24);


    return `${days}d ago`;
  }


  /* =========================================================
     CATEGORY ICON
  ========================================================= */

  getCategoryIcon(
    category: AlertItem['category']
  ): string {

    switch (category) {

      case 'WEATHER':
        return '◉';

      case 'ENERGY':
        return 'ϟ';

      case 'INFRASTRUCTURE':
        return '▦';

      case 'LOGISTICS':
        return '◇';

      case 'COMMUNICATION':
        return '⌁';

      case 'ENVIRONMENT':
        return '◎';

      default:
        return '•';
    }
  }


  /* =========================================================
     SIMULATED ALERT GENERATOR
  ========================================================= */

  private generateSimulatedAlert(): void {

    /*
     * Only generate occasionally.
     */
    const shouldGenerate =
      Math.random() < 0.35;


    if (!shouldGenerate) {
      return;
    }


    const stations:
      Array<'MAITRI' | 'BHARATI'> = [
        'MAITRI',
        'BHARATI'
      ];


    const station =
      stations[
        Math.floor(
          Math.random() * stations.length
        )
      ];


    const alertTemplates = [

      {
        title: 'Wind Speed Variation',
        description:
          'Simulated wind monitoring value has crossed the warning band.',
        category: 'WEATHER' as const,
        severity: 'WARNING' as const,
        value: '61 km/h',
        threshold: '> 60 km/h'
      },

      {
        title: 'Temperature Threshold',
        description:
          'Simulated temperature value has moved outside the configured range.',
        category: 'WEATHER' as const,
        severity: 'INFO' as const,
        value: '-21.5 °C',
        threshold: '< -20 °C'
      },

      {
        title: 'Energy Load Variation',
        description:
          'Simulated station energy load requires attention.',
        category: 'ENERGY' as const,
        severity: 'WARNING' as const,
        value: '87%',
        threshold: '> 85%'
      },

      {
        title: 'Telemetry Delay',
        description:
          'Simulated telemetry delivery interval has increased.',
        category: 'COMMUNICATION' as const,
        severity: 'CRITICAL' as const,
        value: '17 sec',
        threshold: '> 15 sec'
      }

    ];


    const template =
      alertTemplates[
        Math.floor(
          Math.random() * alertTemplates.length
        )
      ];


    const newId =
      this.alerts.length > 0
        ? Math.max(
            ...this.alerts.map(alert => alert.id)
          ) + 1
        : 1;


    const newAlert: AlertItem = {

      id: newId,

      code:
        `ALT-${String(newId).padStart(3, '0')}`,

      title: template.title,

      description: template.description,

      station,

      category: template.category,

      severity: template.severity,

      status: 'ACTIVE',

      timestamp: new Date(),

      value: template.value,

      threshold: template.threshold
    };


    this.alerts.unshift(newAlert);


    /*
     * Keep the simulated list manageable.
     */
    if (this.alerts.length > 30) {

      this.alerts =
        this.alerts.slice(0, 30);
    }


    this.cdr.detectChanges();
  }


  /* =========================================================
     MANUAL SIMULATION
  ========================================================= */

  generateTestAlert(): void {

    this.generateSimulatedAlert();
  }


  /* =========================================================
     TRACK BY
  ========================================================= */

  trackByAlertId(
    index: number,
    alert: AlertItem
  ): number {

    return alert.id;
  }
}