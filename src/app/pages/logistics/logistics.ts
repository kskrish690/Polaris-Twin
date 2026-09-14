import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

interface LogisticsAsset {
  name: string;
  code: string;
  category: string;
  location: string;
  status: 'ACTIVE' | 'IN TRANSIT' | 'STANDBY' | 'MAINTENANCE' | 'OFFLINE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  quantity: number;
  capacity: number;
  description: string;
}

interface LogisticsMetric {
  label: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

@Component({
  selector: 'app-logistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logistics.html',
  styleUrls: ['./logistics.css']
})
export class Logistics implements OnInit, OnDestroy {

  currentTime = new Date();

  private clockTimer?: ReturnType<typeof setInterval>;
  private simulationTimer?: ReturnType<typeof setInterval>;

  /*
   * DEMONSTRATION LOGISTICS DATA
   *
   * These values are simulated for the SIH prototype.
   * Connect this module to actual logistics / inventory /
   * vessel / aircraft telemetry when the backend is available.
   */

  logisticsAssets: LogisticsAsset[] = [

    {
      name: 'Supply Vessel',
      code: 'VES-01',
      category: 'MARITIME',
      location: 'ANTARCTIC SECTOR',
      status: 'IN TRANSIT',
      priority: 'HIGH',
      quantity: 1,
      capacity: 100,
      description:
        'Primary maritime logistics platform supporting station resupply operations.'
    },

    {
      name: 'Cargo Aircraft',
      code: 'AIR-01',
      category: 'AVIATION',
      location: 'POLAR AIR CORRIDOR',
      status: 'STANDBY',
      priority: 'HIGH',
      quantity: 1,
      capacity: 100,
      description:
        'Heavy cargo aircraft designated for personnel and critical material transport.'
    },

    {
      name: 'Fuel Reserve',
      code: 'FUEL-01',
      category: 'FUEL',
      location: 'MAITRI STORAGE',
      status: 'ACTIVE',
      priority: 'HIGH',
      quantity: 72,
      capacity: 100,
      description:
        'Strategic fuel reserve supporting station power generation and operations.'
    },

    {
      name: 'Food Stores',
      code: 'FOOD-01',
      category: 'SUPPLIES',
      location: 'MAITRI WAREHOUSE',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      quantity: 81,
      capacity: 100,
      description:
        'Long-duration food inventory maintained for station personnel.'
    },

    {
      name: 'Scientific Cargo',
      code: 'SCI-01',
      category: 'RESEARCH',
      location: 'RESEARCH STORAGE',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      quantity: 64,
      capacity: 100,
      description:
        'Research equipment, samples and scientific mission supplies.'
    },

    {
      name: 'Emergency Supplies',
      code: 'EMS-01',
      category: 'EMERGENCY',
      location: 'SAFETY STORAGE',
      status: 'STANDBY',
      priority: 'HIGH',
      quantity: 92,
      capacity: 100,
      description:
        'Emergency response supplies reserved for critical operational scenarios.'
    },

    {
      name: 'Snow Vehicle Fleet',
      code: 'SVF-01',
      category: 'GROUND',
      location: 'MAITRI FIELD',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      quantity: 76,
      capacity: 100,
      description:
        'Tracked vehicles used for field transportation and cargo movement.'
    },

    {
      name: 'Communications Cargo',
      code: 'COM-01',
      category: 'EQUIPMENT',
      location: 'TECHNICAL STORAGE',
      status: 'MAINTENANCE',
      priority: 'LOW',
      quantity: 43,
      capacity: 100,
      description:
        'Communication equipment awaiting inspection and deployment.'
    }
  ];


  logisticsMetrics: LogisticsMetric[] = [

    {
      label: 'SUPPLY READINESS',
      value: 84,
      unit: '%',
      status: 'NORMAL'
    },

    {
      label: 'FUEL RESERVE',
      value: 72,
      unit: '%',
      status: 'NORMAL'
    },

    {
      label: 'FOOD RESERVE',
      value: 81,
      unit: '%',
      status: 'NORMAL'
    },

    {
      label: 'CARGO CAPACITY',
      value: 64,
      unit: '%',
      status: 'NORMAL'
    },

    {
      label: 'MISSION READINESS',
      value: 91,
      unit: '%',
      status: 'NORMAL'
    },

    {
      label: 'LOGISTICS RISK',
      value: 18,
      unit: '%',
      status: 'NORMAL'
    }
  ];


  supplyCategories = [
    {
      name: 'FUEL',
      value: 72,
      unit: '%'
    },
    {
      name: 'FOOD',
      value: 81,
      unit: '%'
    },
    {
      name: 'MEDICAL',
      value: 88,
      unit: '%'
    },
    {
      name: 'TECHNICAL',
      value: 63,
      unit: '%'
    },
    {
      name: 'EMERGENCY',
      value: 92,
      unit: '%'
    }
  ];


  selectedCategory = 'ALL';


  categories = [
    'ALL',
    'MARITIME',
    'AVIATION',
    'FUEL',
    'SUPPLIES',
    'RESEARCH',
    'EMERGENCY',
    'GROUND',
    'EQUIPMENT'
  ];


  ngOnInit(): void {

    this.updateClock();

    this.clockTimer = setInterval(() => {

      this.updateClock();

      this.cdr.detectChanges();

    }, 1000);


    /*
     * Simulated logistics telemetry refresh.
     * Replace with actual backend telemetry later.
     */

    this.simulationTimer = setInterval(() => {

      this.updateLogisticsSimulation();

      this.cdr.detectChanges();

    }, 8000);

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


  private updateLogisticsSimulation(): void {

    this.logisticsAssets =
      this.logisticsAssets.map(asset => {

        if (
          asset.status === 'OFFLINE' ||
          asset.status === 'MAINTENANCE'
        ) {
          return asset;
        }

        const variation =
          Math.round(
            (Math.random() - 0.5) * 4
          );

        let quantity =
          asset.quantity + variation;

        quantity =
          Math.min(
            asset.capacity,
            Math.max(
              0,
              quantity
            )
          );

        return {
          ...asset,
          quantity
        };

      });


    this.logisticsMetrics =
      this.logisticsMetrics.map(metric => {

        let value = metric.value;

        const variation =
          Math.round(
            (Math.random() - 0.5) * 2
          );

        if (
          metric.label !== 'LOGISTICS RISK'
        ) {

          value += variation;

        } else {

          value += variation;

        }

        value =
          Math.min(
            100,
            Math.max(
              0,
              value
            )
          );

        return {
          ...metric,
          value
        };

      });

  }


  selectCategory(category: string): void {

    this.selectedCategory =
      category;

  }


  get filteredAssets(): LogisticsAsset[] {

    if (
      this.selectedCategory === 'ALL'
    ) {

      return this.logisticsAssets;

    }

    return this.logisticsAssets.filter(
      asset =>
        asset.category ===
        this.selectedCategory
    );

  }


  get activeCount(): number {

    return this.logisticsAssets.filter(
      asset =>
        asset.status === 'ACTIVE'
    ).length;

  }


  get transitCount(): number {

    return this.logisticsAssets.filter(
      asset =>
        asset.status === 'IN TRANSIT'
    ).length;

  }


  get standbyCount(): number {

    return this.logisticsAssets.filter(
      asset =>
        asset.status === 'STANDBY'
    ).length;

  }


  get maintenanceCount(): number {

    return this.logisticsAssets.filter(
      asset =>
        asset.status === 'MAINTENANCE'
    ).length;

  }


  get offlineCount(): number {

    return this.logisticsAssets.filter(
      asset =>
        asset.status === 'OFFLINE'
    ).length;

  }


  get logisticsReadiness(): number {

    if (
      this.logisticsAssets.length === 0
    ) {
      return 0;
    }

    const total =
      this.logisticsAssets.reduce(
        (sum, asset) =>
          sum +
          (
            asset.quantity /
            asset.capacity
          ) * 100,
        0
      );

    return Math.round(
      total /
      this.logisticsAssets.length
    );

  }


  get averageInventory(): number {

    if (
      this.logisticsAssets.length === 0
    ) {
      return 0;
    }

    const total =
      this.logisticsAssets.reduce(
        (sum, asset) =>
          sum + asset.quantity,
        0
      );

    return Math.round(
      total /
      this.logisticsAssets.length
    );

  }


  getStatusClass(
    status: LogisticsAsset['status']
  ): string {

    switch (status) {

      case 'ACTIVE':
        return 'status-active';

      case 'IN TRANSIT':
        return 'status-transit';

      case 'STANDBY':
        return 'status-standby';

      case 'MAINTENANCE':
        return 'status-maintenance';

      case 'OFFLINE':
        return 'status-offline';

      default:
        return '';

    }

  }


  getPriorityClass(
    priority: LogisticsAsset['priority']
  ): string {

    switch (priority) {

      case 'HIGH':
        return 'priority-high';

      case 'MEDIUM':
        return 'priority-medium';

      case 'LOW':
        return 'priority-low';

      default:
        return '';

    }

  }


  getMetricClass(
    status: LogisticsMetric['status']
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


  getInventoryWidth(
    quantity: number,
    capacity: number
  ): number {

    if (capacity <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (quantity / capacity) * 100
      )
    );

  }


  getSupplyClass(
    value: number
  ): string {

    if (value >= 70) {
      return 'supply-good';
    }

    if (value >= 40) {
      return 'supply-warning';
    }

    return 'supply-critical';

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

}