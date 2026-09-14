import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

interface InfrastructureItem {
  name: string;
  code: string;
  category: string;
  status: 'OPERATIONAL' | 'MONITORING' | 'MAINTENANCE' | 'OFFLINE';
  health: number;
  utilization: number;
  description: string;
}

interface SystemMetric {
  label: string;
  value: string;
  unit: string;
  percentage: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

@Component({
  selector: 'app-infrastructure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './infrastructure.html',
  styleUrls: ['./infrastructure.css']
})
export class Infrastructure
  implements OnInit, OnDestroy {

  currentTime = new Date();

  private clockTimer?: ReturnType<typeof setInterval>;
  private simulationTimer?: ReturnType<typeof setInterval>;

  infrastructureItems: InfrastructureItem[] = [
    {
      name: 'Main Station Complex',
      code: 'MSC-01',
      category: 'HABITATION',
      status: 'OPERATIONAL',
      health: 96,
      utilization: 72,
      description:
        'Primary habitation and operational facility for station personnel.'
    },
    {
      name: 'Power Generation Unit',
      code: 'PGU-01',
      category: 'ENERGY',
      status: 'OPERATIONAL',
      health: 94,
      utilization: 68,
      description:
        'Primary electrical generation and distribution infrastructure.'
    },
    {
      name: 'Communication Hub',
      code: 'COM-01',
      category: 'COMMUNICATION',
      status: 'OPERATIONAL',
      health: 98,
      utilization: 54,
      description:
        'Satellite communication and station network infrastructure.'
    },
    {
      name: 'Fuel Storage Facility',
      code: 'FSF-01',
      category: 'LOGISTICS',
      status: 'MONITORING',
      health: 91,
      utilization: 63,
      description:
        'Strategic fuel storage and distribution facility.'
    },
    {
      name: 'Water Processing Unit',
      code: 'WPU-01',
      category: 'UTILITIES',
      status: 'OPERATIONAL',
      health: 93,
      utilization: 61,
      description:
        'Water treatment, processing and distribution system.'
    },
    {
      name: 'Waste Management Unit',
      code: 'WMU-01',
      category: 'ENVIRONMENT',
      status: 'MONITORING',
      health: 89,
      utilization: 57,
      description:
        'Station waste processing and environmental management system.'
    },
    {
      name: 'Research Laboratory',
      code: 'LAB-01',
      category: 'RESEARCH',
      status: 'OPERATIONAL',
      health: 97,
      utilization: 76,
      description:
        'Scientific research and sample processing facility.'
    },
    {
      name: 'Emergency Shelter',
      code: 'EMS-01',
      category: 'SAFETY',
      status: 'OPERATIONAL',
      health: 99,
      utilization: 12,
      description:
        'Emergency response and personnel shelter infrastructure.'
    }
  ];

  systemMetrics: SystemMetric[] = [
    {
      label: 'STRUCTURAL HEALTH',
      value: '96',
      unit: '%',
      percentage: 96,
      status: 'NORMAL'
    },
    {
      label: 'POWER CAPACITY',
      value: '68',
      unit: '%',
      percentage: 68,
      status: 'NORMAL'
    },
    {
      label: 'STORAGE CAPACITY',
      value: '63',
      unit: '%',
      percentage: 63,
      status: 'NORMAL'
    },
    {
      label: 'NETWORK LOAD',
      value: '54',
      unit: '%',
      percentage: 54,
      status: 'NORMAL'
    },
    {
      label: 'WATER SYSTEM',
      value: '61',
      unit: '%',
      percentage: 61,
      status: 'NORMAL'
    },
    {
      label: 'WASTE SYSTEM',
      value: '57',
      unit: '%',
      percentage: 57,
      status: 'NORMAL'
    }
  ];

  selectedCategory = 'ALL';

  categories = [
    'ALL',
    'HABITATION',
    'ENERGY',
    'COMMUNICATION',
    'LOGISTICS',
    'UTILITIES',
    'ENVIRONMENT',
    'RESEARCH',
    'SAFETY'
  ];

  ngOnInit(): void {

    this.updateClock();

    this.clockTimer = setInterval(() => {
      this.updateClock();

      this.cdr.detectChanges();

    }, 1000);

    /*
     * Simulated infrastructure telemetry refresh.
     * Replace this section with actual station telemetry
     * when a real infrastructure API is available.
     */

    this.simulationTimer = setInterval(() => {

      this.updateTelemetry();

      this.cdr.detectChanges();

    }, 10000);
  }

  ngOnDestroy(): void {

    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }

    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
    }
  }

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  private updateClock(): void {
    this.currentTime = new Date();
  }

  private updateTelemetry(): void {

    this.systemMetrics =
      this.systemMetrics.map(metric => {

        const variation =
          Math.round(
            (Math.random() - 0.5) * 2
          );

        let percentage =
          Number(metric.value) + variation;

        percentage =
          Math.min(
            100,
            Math.max(0, percentage)
          );

        return {
          ...metric,
          value: percentage.toString(),
          percentage
        };
      });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  get filteredInfrastructure(): InfrastructureItem[] {

    if (this.selectedCategory === 'ALL') {
      return this.infrastructureItems;
    }

    return this.infrastructureItems.filter(
      item =>
        item.category === this.selectedCategory
    );
  }

  get operationalCount(): number {

    return this.infrastructureItems.filter(
      item =>
        item.status === 'OPERATIONAL'
    ).length;
  }

  get monitoringCount(): number {

    return this.infrastructureItems.filter(
      item =>
        item.status === 'MONITORING'
    ).length;
  }

  get maintenanceCount(): number {

    return this.infrastructureItems.filter(
      item =>
        item.status === 'MAINTENANCE'
    ).length;
  }

  get offlineCount(): number {

    return this.infrastructureItems.filter(
      item =>
        item.status === 'OFFLINE'
    ).length;
  }

  get infrastructureHealth(): number {

    if (
      this.infrastructureItems.length === 0
    ) {
      return 0;
    }

    const total =
      this.infrastructureItems.reduce(
        (sum, item) =>
          sum + item.health,
        0
      );

    return Math.round(
      total /
      this.infrastructureItems.length
    );
  }

  get utilizationAverage(): number {

    if (
      this.infrastructureItems.length === 0
    ) {
      return 0;
    }

    const total =
      this.infrastructureItems.reduce(
        (sum, item) =>
          sum + item.utilization,
        0
      );

    return Math.round(
      total /
      this.infrastructureItems.length
    );
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
    ).format(
      this.currentTime
    );
  }

  get formattedDate(): string {

    const parts =
      new Intl.DateTimeFormat(
        'en-IN',
        {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }
      ).formatToParts(
        this.currentTime
      );

    const year =
      parts.find(
        part =>
          part.type === 'year'
      )?.value;

    const month =
      parts.find(
        part =>
          part.type === 'month'
      )?.value;

    const day =
      parts.find(
        part =>
          part.type === 'day'
      )?.value;

    return `${year}-${month}-${day}`;
  }

  getStatusClass(
    status: InfrastructureItem['status']
  ): string {

    switch (status) {

      case 'OPERATIONAL':
        return 'status-operational';

      case 'MONITORING':
        return 'status-monitoring';

      case 'MAINTENANCE':
        return 'status-maintenance';

      case 'OFFLINE':
        return 'status-offline';

      default:
        return '';
    }
  }

  getMetricClass(
    status: SystemMetric['status']
  ): string {

    switch (status) {

      case 'NORMAL':
        return 'metric-normal';

      case 'WARNING':
        return 'metric-warning';

      case 'CRITICAL':
        return 'metric-critical';

      default:
        return '';
    }
  }

  getHealthClass(
    health: number
  ): string {

    if (health >= 90) {
      return 'health-good';
    }

    if (health >= 75) {
      return 'health-warning';
    }

    return 'health-critical';
  }

  getUtilizationWidth(
    value: number
  ): number {

    return Math.min(
      100,
      Math.max(0, value)
    );
  }

  getHealthWidth(
    value: number
  ): number {

    return Math.min(
      100,
      Math.max(0, value)
    );
  }
}