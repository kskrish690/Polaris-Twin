import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

type StationId = 'BHARATI' | 'MAITRI';

type AssetStatus =
  | 'ACTIVE'
  | 'IN TRANSIT'
  | 'STANDBY'
  | 'MAINTENANCE'
  | 'OFFLINE';

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

type ResourceKey =
  | 'FUEL'
  | 'WATER'
  | 'FOOD'
  | 'MEDICAL'
  | 'TECHNICAL'
  | 'EMERGENCY';

interface LogisticsAsset {
  name: string;
  code: string;
  category: string;
  location: string;
  status: AssetStatus;
  priority: Priority;
  quantity: number;
  capacity: number;
  description: string;
}

interface ResourceState {
  key: ResourceKey;
  name: string;
  shortName: string;
  icon: string;
  percentage: number;
  quantity: number;
  capacity: number;
  unit: string;
  dailyConsumption: number;
  nextResupplyDays: number;
  exhaustionDays: number;
  exhaustionDate: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  description: string;
}

interface StationLogisticsData {
  station: StationId;
  stationName: string;
  stationCode: string;
  location: string;
  region: string;
  readiness: number;
  logisticsRisk: number;
  assets: LogisticsAsset[];
  resources: Record<ResourceKey, ResourceState>;
}

interface LogisticsMetric {
  label: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  icon: string;
}

@Component({
  selector: 'app-logistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logistics.html',
  styleUrls: ['./logistics.css']
})
export class Logistics implements OnInit, OnDestroy {

  readonly stationIds: StationId[] = [
    'BHARATI',
    'MAITRI'
  ];

  selectedStation: StationId = 'BHARATI';

  activeFilter = 'ALL';

  currentTime = '--:--:--';
  currentDate = '--';
  lastUpdate = '--:--:--';

  private clockTimer?: ReturnType<typeof setInterval>;
  private telemetryTimer?: ReturnType<typeof setInterval>;

  private readonly stationData: Record<
    StationId,
    StationLogisticsData
  > = {

    BHARATI: {
      station: 'BHARATI',
      stationName: 'BHARATI',
      stationCode: 'BHA-01',
      location: 'Larsemann Hills',
      region: 'PRYDZ BAY / EAST ANTARCTICA',
      readiness: 91,
      logisticsRisk: 14,

      resources: {

        FUEL: {
          key: 'FUEL',
          name: 'Fuel Reserve',
          shortName: 'FUEL',
          icon: '◈',
          percentage: 74,
          quantity: 18420,
          capacity: 24900,
          unit: 'L',
          dailyConsumption: 615,
          nextResupplyDays: 25,
          exhaustionDays: 30,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Power generation and station mobility reserve'
        },

        WATER: {
          key: 'WATER',
          name: 'Water Reserve',
          shortName: 'WATER',
          icon: '◉',
          percentage: 68,
          quantity: 8420,
          capacity: 12400,
          unit: 'L',
          dailyConsumption: 280,
          nextResupplyDays: 22,
          exhaustionDays: 30,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Processed and stored station water reserve'
        },

        FOOD: {
          key: 'FOOD',
          name: 'Food Reserve',
          shortName: 'FOOD',
          icon: '◆',
          percentage: 81,
          quantity: 2140,
          capacity: 2640,
          unit: 'KG',
          dailyConsumption: 34,
          nextResupplyDays: 38,
          exhaustionDays: 63,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Long-duration food and nutritional reserve'
        },

        MEDICAL: {
          key: 'MEDICAL',
          name: 'Medical Reserve',
          shortName: 'MEDICAL',
          icon: '✚',
          percentage: 88,
          quantity: 420,
          capacity: 480,
          unit: 'KG',
          dailyConsumption: 1.4,
          nextResupplyDays: 74,
          exhaustionDays: 300,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Medical and emergency healthcare supplies'
        },

        TECHNICAL: {
          key: 'TECHNICAL',
          name: 'Technical Stores',
          shortName: 'TECHNICAL',
          icon: '◇',
          percentage: 63,
          quantity: 315,
          capacity: 500,
          unit: 'UNITS',
          dailyConsumption: 2.2,
          nextResupplyDays: 29,
          exhaustionDays: 143,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Engineering spares and technical components'
        },

        EMERGENCY: {
          key: 'EMERGENCY',
          name: 'Emergency Reserve',
          shortName: 'EMERGENCY',
          icon: '△',
          percentage: 92,
          quantity: 460,
          capacity: 500,
          unit: 'UNITS',
          dailyConsumption: 0.5,
          nextResupplyDays: 90,
          exhaustionDays: 900,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Contingency reserve for critical operations'
        }
      },

      assets: [

        {
          name: 'Generator Array 01',
          code: 'GEN-BH-01',
          category: 'POWER',
          location: 'POWER MODULE',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 4,
          capacity: 4,
          description: 'Primary electrical generation system'
        },

        {
          name: 'Fuel Distribution Unit',
          code: 'FDU-BH-01',
          category: 'FUEL',
          location: 'FUEL FARM',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 3,
          capacity: 3,
          description: 'Fuel storage and controlled distribution'
        },

        {
          name: 'Snow Vehicle Fleet',
          code: 'SNV-BH-02',
          category: 'TRANSPORT',
          location: 'VEHICLE BAY',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 6,
          capacity: 7,
          description: 'Tracked transport vehicles for station operations'
        },

        {
          name: 'Water Processing Unit',
          code: 'WPU-BH-01',
          category: 'WATER',
          location: 'UTILITY MODULE',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 2,
          capacity: 2,
          description: 'Water processing and purification system'
        },

        {
          name: 'Cargo Handling System',
          code: 'CHS-BH-01',
          category: 'CARGO',
          location: 'LOGISTICS BAY',
          status: 'IN TRANSIT',
          priority: 'MEDIUM',
          quantity: 5,
          capacity: 6,
          description: 'Cargo movement and handling equipment'
        },

        {
          name: 'Emergency Response Unit',
          code: 'ERU-BH-01',
          category: 'SAFETY',
          location: 'EMERGENCY BAY',
          status: 'STANDBY',
          priority: 'HIGH',
          quantity: 3,
          capacity: 3,
          description: 'Emergency response and recovery equipment'
        },

        {
          name: 'Communications Array',
          code: 'COM-BH-03',
          category: 'COMMUNICATION',
          location: 'COMMS MODULE',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 4,
          capacity: 4,
          description: 'Long-range station communications infrastructure'
        },

        {
          name: 'Maintenance Platform',
          code: 'MNT-BH-02',
          category: 'ENGINEERING',
          location: 'WORKSHOP',
          status: 'MAINTENANCE',
          priority: 'MEDIUM',
          quantity: 2,
          capacity: 3,
          description: 'Engineering maintenance and repair platform'
        }
      ]
    },

    MAITRI: {
      station: 'MAITRI',
      stationName: 'MAITRI',
      stationCode: 'MAI-01',
      location: 'Schirmacher Oasis',
      region: 'QUEEN MAUD LAND / EAST ANTARCTICA',
      readiness: 86,
      logisticsRisk: 21,

      resources: {

        FUEL: {
          key: 'FUEL',
          name: 'Fuel Reserve',
          shortName: 'FUEL',
          icon: '◈',
          percentage: 63,
          quantity: 15840,
          capacity: 25100,
          unit: 'L',
          dailyConsumption: 540,
          nextResupplyDays: 29,
          exhaustionDays: 29,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Power generation and station mobility reserve'
        },

        WATER: {
          key: 'WATER',
          name: 'Water Reserve',
          shortName: 'WATER',
          icon: '◉',
          percentage: 55,
          quantity: 6840,
          capacity: 12400,
          unit: 'L',
          dailyConsumption: 250,
          nextResupplyDays: 24,
          exhaustionDays: 27,
          exhaustionDate: '',
          status: 'WARNING',
          description: 'Processed and stored station water reserve'
        },

        FOOD: {
          key: 'FOOD',
          name: 'Food Reserve',
          shortName: 'FOOD',
          icon: '◆',
          percentage: 72,
          quantity: 1870,
          capacity: 2600,
          unit: 'KG',
          dailyConsumption: 31,
          nextResupplyDays: 35,
          exhaustionDays: 60,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Long-duration food and nutritional reserve'
        },

        MEDICAL: {
          key: 'MEDICAL',
          name: 'Medical Reserve',
          shortName: 'MEDICAL',
          icon: '✚',
          percentage: 79,
          quantity: 380,
          capacity: 480,
          unit: 'KG',
          dailyConsumption: 1.3,
          nextResupplyDays: 68,
          exhaustionDays: 292,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Medical and emergency healthcare supplies'
        },

        TECHNICAL: {
          key: 'TECHNICAL',
          name: 'Technical Stores',
          shortName: 'TECHNICAL',
          icon: '◇',
          percentage: 58,
          quantity: 290,
          capacity: 500,
          unit: 'UNITS',
          dailyConsumption: 2.0,
          nextResupplyDays: 27,
          exhaustionDays: 145,
          exhaustionDate: '',
          status: 'WARNING',
          description: 'Engineering spares and technical components'
        },

        EMERGENCY: {
          key: 'EMERGENCY',
          name: 'Emergency Reserve',
          shortName: 'EMERGENCY',
          icon: '△',
          percentage: 89,
          quantity: 445,
          capacity: 500,
          unit: 'UNITS',
          dailyConsumption: 0.5,
          nextResupplyDays: 86,
          exhaustionDays: 890,
          exhaustionDate: '',
          status: 'NORMAL',
          description: 'Contingency reserve for critical operations'
        }
      },

      assets: [

        {
          name: 'Generator Array 02',
          code: 'GEN-MA-02',
          category: 'POWER',
          location: 'POWER MODULE',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 3,
          capacity: 4,
          description: 'Primary electrical generation system'
        },

        {
          name: 'Fuel Distribution Unit',
          code: 'FDU-MA-02',
          category: 'FUEL',
          location: 'FUEL FARM',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 2,
          capacity: 3,
          description: 'Fuel storage and controlled distribution'
        },

        {
          name: 'Snow Vehicle Fleet',
          code: 'SNV-MA-01',
          category: 'TRANSPORT',
          location: 'VEHICLE BAY',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 5,
          capacity: 6,
          description: 'Tracked transport vehicles for station operations'
        },

        {
          name: 'Water Processing Unit',
          code: 'WPU-MA-02',
          category: 'WATER',
          location: 'UTILITY MODULE',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 2,
          capacity: 2,
          description: 'Water processing and purification system'
        },

        {
          name: 'Cargo Handling System',
          code: 'CHS-MA-02',
          category: 'CARGO',
          location: 'LOGISTICS BAY',
          status: 'IN TRANSIT',
          priority: 'MEDIUM',
          quantity: 4,
          capacity: 5,
          description: 'Cargo movement and handling equipment'
        },

        {
          name: 'Emergency Response Unit',
          code: 'ERU-MA-02',
          category: 'SAFETY',
          location: 'EMERGENCY BAY',
          status: 'STANDBY',
          priority: 'HIGH',
          quantity: 3,
          capacity: 3,
          description: 'Emergency response and recovery equipment'
        },

        {
          name: 'Communications Array',
          code: 'COM-MA-02',
          category: 'COMMUNICATION',
          location: 'COMMS MODULE',
          status: 'ACTIVE',
          priority: 'HIGH',
          quantity: 3,
          capacity: 4,
          description: 'Long-range station communications infrastructure'
        },

        {
          name: 'Maintenance Platform',
          code: 'MNT-MA-01',
          category: 'ENGINEERING',
          location: 'WORKSHOP',
          status: 'MAINTENANCE',
          priority: 'MEDIUM',
          quantity: 2,
          capacity: 3,
          description: 'Engineering maintenance and repair platform'
        }
      ]
    }
  };

  readonly resourceOrder: ResourceKey[] = [
    'FUEL',
    'WATER',
    'FOOD',
    'MEDICAL',
    'TECHNICAL',
    'EMERGENCY'
  ];

  constructor(
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.calculateAllResourceDates();

    this.updateClock();

    this.clockTimer = setInterval(() => {
      this.updateClock();
      this.cdr.detectChanges();
    }, 1000);

    this.telemetryTimer = setInterval(() => {
      this.updateOperationalData();
    }, 5000);
  }

  ngOnDestroy(): void {

    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }

    if (this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
    }
  }

  get station(): StationLogisticsData {
    return this.stationData[this.selectedStation];
  }

  get resources(): ResourceState[] {
    return this.resourceOrder.map(
      key => this.station.resources[key]
    );
  }

  get filteredAssets(): LogisticsAsset[] {

    if (this.activeFilter === 'ALL') {
      return this.station.assets;
    }

    return this.station.assets.filter(
      asset => asset.category === this.activeFilter
    );
  }

  get categories(): string[] {

    const categories = this.station.assets.map(
      asset => asset.category
    );

    return [
      'ALL',
      ...Array.from(new Set(categories))
    ];
  }

  get metrics(): LogisticsMetric[] {

    const assets = this.station.assets;

    const active = assets.filter(
      asset => asset.status === 'ACTIVE'
    ).length;

    const transit = assets.filter(
      asset => asset.status === 'IN TRANSIT'
    ).length;

    const maintenance = assets.filter(
      asset => asset.status === 'MAINTENANCE'
    ).length;

    const availability =
      assets.length > 0
        ? Math.round(
            (active / assets.length) * 100
          )
        : 0;

    const resourceAverage =
      this.resources.reduce(
        (sum, resource) =>
          sum + resource.percentage,
        0
      ) / this.resources.length;

    const networkIntegrity = Math.round(
      Math.max(
        94,
        Math.min(
          100,
          availability +
            resourceAverage / 20
        )
      )
    );

    return [

      {
        label: 'Asset Availability',
        value: availability,
        unit: '%',
        status:
          availability >= 80
            ? 'NORMAL'
            : availability >= 60
              ? 'WARNING'
              : 'CRITICAL',
        icon: '◈'
      },

      {
        label: 'Resource Readiness',
        value: Math.round(resourceAverage),
        unit: '%',
        status:
          resourceAverage >= 70
            ? 'NORMAL'
            : resourceAverage >= 50
              ? 'WARNING'
              : 'CRITICAL',
        icon: '◎'
      },

      {
        label: 'Network Integrity',
        value: networkIntegrity,
        unit: '%',
        status: 'NORMAL',
        icon: '⌁'
      },

      {
        label: 'Maintenance Load',
        value: Math.round(
          (maintenance / assets.length) * 100
        ),
        unit: '%',
        status:
          maintenance <= 1
            ? 'NORMAL'
            : maintenance <= 2
              ? 'WARNING'
              : 'CRITICAL',
        icon: '⚙'
      },

      {
        label: 'Transit Assets',
        value: transit,
        unit: 'UNITS',
        status:
          transit <= 2
            ? 'NORMAL'
            : 'WARNING',
        icon: '→'
      }
    ];
  }

  selectStation(
    station: StationId
  ): void {

    this.selectedStation = station;

    this.activeFilter = 'ALL';

    this.calculateAllResourceDates();

    this.cdr.detectChanges();
  }

  setFilter(
    filter: string
  ): void {

    this.activeFilter = filter;

    this.cdr.detectChanges();
  }

  private updateClock(): void {

    const now = new Date();

    this.currentDate =
      new Intl.DateTimeFormat(
        'en-IN',
        {
          timeZone: 'Asia/Kolkata',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      ).format(now);

    this.currentTime =
      new Intl.DateTimeFormat(
        'en-IN',
        {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }
      ).format(now);

    this.lastUpdate = this.currentTime;
  }

  private updateOperationalData(): void {

    const data = this.stationData[this.selectedStation];

    this.resourceOrder.forEach(
      key => {

        const resource = data.resources[key];

        const movement =
          key === 'FUEL'
            ? this.randomNumber(-1.4, 0.8)
            : key === 'WATER'
              ? this.randomNumber(-1.1, 0.7)
              : key === 'FOOD'
                ? this.randomNumber(-0.7, 0.5)
                : key === 'MEDICAL'
                  ? this.randomNumber(-0.3, 0.25)
                  : key === 'TECHNICAL'
                    ? this.randomNumber(-0.8, 0.4)
                    : this.randomNumber(-0.2, 0.15);

        resource.percentage = this.clamp(
          resource.percentage + movement,
          5,
          98
        );

        resource.quantity =
          resource.capacity *
          resource.percentage /
          100;

        resource.exhaustionDays =
          Math.max(
            1,
            Math.round(
              resource.quantity /
              Math.max(
                resource.dailyConsumption,
                0.01
              )
            )
          );

        resource.exhaustionDate =
          this.calculateFutureDate(
            resource.exhaustionDays
          );

        resource.status =
          this.getResourceStatus(
            resource.percentage
          );
      }
    );

    data.readiness = this.calculateReadiness(
      data
    );

    data.logisticsRisk =
      Math.max(
        4,
        Math.min(
          42,
          100 - data.readiness +
            this.randomNumber(-3, 3)
        )
      );

    data.assets.forEach(
      asset => {

        const fluctuation =
          Math.random();

        if (
          asset.status === 'ACTIVE' &&
          fluctuation < 0.06
        ) {
          asset.quantity =
            Math.max(
              1,
              Math.min(
                asset.capacity,
                asset.quantity +
                  (Math.random() > 0.5
                    ? 1
                    : -1)
              )
            );
        }

        if (
          asset.status === 'IN TRANSIT' &&
          fluctuation < 0.04
        ) {
          asset.status = 'ACTIVE';
        }
      }
    );

    this.updateClock();

    this.cdr.detectChanges();
  }

  private calculateAllResourceDates(): void {

    this.resourceOrder.forEach(
      key => {

        const resource =
          this.station.resources[key];

        resource.quantity =
          resource.capacity *
          resource.percentage /
          100;

        resource.exhaustionDays =
          Math.max(
            1,
            Math.round(
              resource.quantity /
              Math.max(
                resource.dailyConsumption,
                0.01
              )
            )
          );

        resource.exhaustionDate =
          this.calculateFutureDate(
            resource.exhaustionDays
          );

        resource.status =
          this.getResourceStatus(
            resource.percentage
          );
      }
    );
  }

  private calculateReadiness(
    data: StationLogisticsData
  ): number {

    const average =
      this.resourceOrder.reduce(
        (sum, key) =>
          sum +
          data.resources[key].percentage,
        0
      ) / this.resourceOrder.length;

    const activeAssets =
      data.assets.filter(
        asset =>
          asset.status === 'ACTIVE'
      ).length;

    const assetAvailability =
      data.assets.length > 0
        ? activeAssets /
          data.assets.length *
          100
        : 0;

    return Math.round(
      average * 0.7 +
      assetAvailability * 0.3
    );
  }

  private getResourceStatus(
    percentage: number
  ): 'NORMAL' | 'WARNING' | 'CRITICAL' {

    if (percentage < 35) {
      return 'CRITICAL';
    }

    if (percentage < 60) {
      return 'WARNING';
    }

    return 'NORMAL';
  }

  private calculateFutureDate(
    days: number
  ): string {

    const date = new Date();

    date.setDate(
      date.getDate() + days
    );

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(date);
  }

  getResource(
    key: ResourceKey
  ): ResourceState {

    return this.station.resources[key];
  }

  getResourceClass(
    resource: ResourceState
  ): string {

    return `resource-${resource.status.toLowerCase()}`;
  }

  getStatusClass(
    status: AssetStatus
  ): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  getPriorityClass(
    priority: Priority
  ): string {

    return priority.toLowerCase();
  }

  getMetricClass(
    status: LogisticsMetric['status']
  ): string {

    return status.toLowerCase();
  }

  getAvailability(
    asset: LogisticsAsset
  ): number {

    if (!asset.capacity) {
      return 0;
    }

    return Math.round(
      (asset.quantity /
        asset.capacity) *
      100
    );
  }

  getNextResupply(): ResourceState {

    return this.resources.reduce(
      (closest, resource) =>
        resource.nextResupplyDays <
        closest.nextResupplyDays
          ? resource
          : closest
    );
  }

  getCriticalResource(): ResourceState {

    return this.resources.reduce(
      (lowest, resource) =>
        resource.percentage <
        lowest.percentage
          ? resource
          : lowest
    );
  }

  trackByResource(
    index: number,
    resource: ResourceState
  ): string {

    return resource.key;
  }

  trackByAsset(
    index: number,
    asset: LogisticsAsset
  ): string {

    return asset.code;
  }

  trackByMetric(
    index: number,
    metric: LogisticsMetric
  ): string {

    return metric.label;
  }

  trackByCategory(
    index: number,
    category: string
  ): string {

    return category;
  }

  private randomNumber(
    min: number,
    max: number
  ): number {

    return (
      Math.random() *
      (max - min) +
      min
    );
  }

  private clamp(
    value: number,
    min: number,
    max: number
  ): number {

    return Math.min(
      Math.max(value, min),
      max
    );
  }
}