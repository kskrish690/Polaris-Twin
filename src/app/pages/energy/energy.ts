import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

interface EnergySource {
  name: string;
  code: string;
  type: string;
  capacity: number;
  output: number;
  efficiency: number;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE' | 'OFFLINE';
  description: string;
}

interface EnergyMetric {
  label: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

@Component({
  selector: 'app-energy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './energy.html',
  styleUrls: ['./energy.css']
})
export class Energy implements OnInit, OnDestroy {

  currentTime = new Date();

  private clockTimer?: ReturnType<typeof setInterval>;
  private simulationTimer?: ReturnType<typeof setInterval>;

  /*
   * DEMO ENERGY MODEL
   *
   * These values are simulated for the SIH prototype.
   * Replace with actual station telemetry when a real
   * energy/SCADA/IoT backend is connected.
   */

  energySources: EnergySource[] = [

    {
      name: 'Diesel Generator A',
      code: 'DGA-01',
      type: 'DIESEL GENERATOR',
      capacity: 180,
      output: 132,
      efficiency: 86,
      status: 'ONLINE',
      description:
        'Primary diesel generation unit supporting continuous station operations.'
    },

    {
      name: 'Diesel Generator B',
      code: 'DGB-01',
      type: 'DIESEL GENERATOR',
      capacity: 180,
      output: 108,
      efficiency: 82,
      status: 'ONLINE',
      description:
        'Secondary generation unit providing operational redundancy and peak-load support.'
    },

    {
      name: 'Solar Array',
      code: 'SOL-01',
      type: 'SOLAR',
      capacity: 40,
      output: 17,
      efficiency: 71,
      status: 'ONLINE',
      description:
        'Supplementary renewable generation system contributing to station energy demand.'
    },

    {
      name: 'Battery Storage',
      code: 'BAT-01',
      type: 'STORAGE',
      capacity: 240,
      output: 96,
      efficiency: 91,
      status: 'STANDBY',
      description:
        'Energy storage system used for load balancing and emergency backup.'
    },

    {
      name: 'Emergency Generator',
      code: 'EMG-01',
      type: 'BACKUP',
      capacity: 120,
      output: 0,
      efficiency: 88,
      status: 'STANDBY',
      description:
        'Emergency generation system reserved for critical station operations.'
    },

    {
      name: 'Research Power Bus',
      code: 'RPB-01',
      type: 'DISTRIBUTION',
      capacity: 300,
      output: 214,
      efficiency: 94,
      status: 'ONLINE',
      description:
        'Dedicated electrical distribution network serving scientific research systems.'
    }
  ];


  energyMetrics: EnergyMetric[] = [

    {
      label: 'TOTAL GENERATION',
      value: 257,
      unit: 'kW',
      status: 'NORMAL'
    },

    {
      label: 'CURRENT DEMAND',
      value: 214,
      unit: 'kW',
      status: 'NORMAL'
    },

    {
      label: 'AVAILABLE CAPACITY',
      value: 129,
      unit: 'kW',
      status: 'NORMAL'
    },

    {
      label: 'GRID LOAD',
      value: 62,
      unit: '%',
      status: 'NORMAL'
    },

    {
      label: 'BATTERY LEVEL',
      value: 78,
      unit: '%',
      status: 'NORMAL'
    },

    {
      label: 'SYSTEM EFFICIENCY',
      value: 87,
      unit: '%',
      status: 'NORMAL'
    }
  ];


  energyFlow = [
    {
      label: 'GENERATION',
      value: 257,
      percentage: 86
    },
    {
      label: 'STATION LOAD',
      value: 214,
      percentage: 72
    },
    {
      label: 'RESEARCH',
      value: 82,
      percentage: 39
    },
    {
      label: 'HABITATION',
      value: 61,
      percentage: 29
    },
    {
      label: 'LIFE SUPPORT',
      value: 43,
      percentage: 20
    },
    {
      label: 'STORAGE',
      value: 71,
      percentage: 28
    }
  ];


  ngOnInit(): void {

    this.updateClock();

    this.clockTimer = setInterval(() => {

      this.updateClock();

      this.cdr.detectChanges();

    }, 1000);


    /*
     * Simulated energy telemetry.
     *
     * This creates movement in the dashboard for the
     * demonstration. It is NOT real station telemetry.
     */

    this.simulationTimer = setInterval(() => {

      this.updateEnergySimulation();

      this.cdr.detectChanges();

    }, 5000);
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


  private updateEnergySimulation(): void {

    this.energySources =
      this.energySources.map(source => {

        if (
          source.status === 'OFFLINE' ||
          source.status === 'STANDBY'
        ) {
          return source;
        }

        const variation =
          Math.round(
            (Math.random() - 0.5) * 12
          );

        let output =
          source.output + variation;

        output =
          Math.max(
            0,
            Math.min(
              source.capacity,
              output
            )
          );

        return {
          ...source,
          output
        };

      });


    this.energyMetrics =
      this.energyMetrics.map(metric => {

        let value = metric.value;

        if (
          metric.label === 'TOTAL GENERATION'
        ) {

          value =
            this.totalGeneration;

        }

        if (
          metric.label === 'CURRENT DEMAND'
        ) {

          value =
            this.currentDemand;

        }

        if (
          metric.label === 'AVAILABLE CAPACITY'
        ) {

          value =
            Math.max(
              0,
              this.totalCapacity - this.totalGeneration
            );

        }

        if (
          metric.label === 'GRID LOAD'
        ) {

          value =
            this.gridLoad;

        }

        if (
          metric.label === 'BATTERY LEVEL'
        ) {

          value =
            Math.max(
              60,
              Math.min(
                95,
                metric.value +
                Math.round(
                  (Math.random() - 0.5) * 2
                )
              )
            );

        }

        if (
          metric.label === 'SYSTEM EFFICIENCY'
        ) {

          value =
            this.systemEfficiency;

        }

        return {
          ...metric,
          value: Math.round(value)
        };

      });


    this.energyFlow =
      this.energyFlow.map(flow => {

        let value = flow.value;

        if (flow.label === 'GENERATION') {
          value = this.totalGeneration;
        }

        if (flow.label === 'STATION LOAD') {
          value = this.currentDemand;
        }

        const percentage =
          Math.min(
            100,
            Math.max(
              5,
              Math.round(
                (value / Math.max(this.totalCapacity, 1)) * 100
              )
            )
          );

        return {
          ...flow,
          value: Math.round(value),
          percentage
        };

      });

  }


  get totalCapacity(): number {

    return this.energySources
      .filter(
        source =>
          source.type !== 'STORAGE' &&
          source.type !== 'DISTRIBUTION'
      )
      .reduce(
        (sum, source) =>
          sum + source.capacity,
        0
      );

  }


  get totalGeneration(): number {

    return this.energySources
      .filter(
        source =>
          source.status === 'ONLINE'
      )
      .reduce(
        (sum, source) =>
          sum + source.output,
        0
      );

  }


  get currentDemand(): number {

    const generation =
      this.totalGeneration;

    return Math.round(
      generation * 0.83
    );

  }


  get availableCapacity(): number {

    return Math.max(
      0,
      this.totalCapacity -
      this.totalGeneration
    );

  }


  get gridLoad(): number {

    if (this.totalCapacity === 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (
          this.currentDemand /
          this.totalCapacity
        ) * 100
      )
    );

  }


  get batteryLevel(): number {

    const battery =
      this.energySources.find(
        source =>
          source.code === 'BAT-01'
      );

    if (!battery) {
      return 0;
    }

    return Math.round(
      (
        battery.output /
        battery.capacity
      ) * 100
    );

  }


  get systemEfficiency(): number {

    const activeSources =
      this.energySources.filter(
        source =>
          source.status === 'ONLINE'
      );

    if (
      activeSources.length === 0
    ) {
      return 0;
    }

    const total =
      activeSources.reduce(
        (sum, source) =>
          sum + source.efficiency,
        0
      );

    return Math.round(
      total /
      activeSources.length
    );

  }


  get onlineCount(): number {

    return this.energySources.filter(
      source =>
        source.status === 'ONLINE'
    ).length;

  }


  get standbyCount(): number {

    return this.energySources.filter(
      source =>
        source.status === 'STANDBY'
    ).length;

  }


  get maintenanceCount(): number {

    return this.energySources.filter(
      source =>
        source.status === 'MAINTENANCE'
    ).length;

  }


  get offlineCount(): number {

    return this.energySources.filter(
      source =>
        source.status === 'OFFLINE'
    ).length;

  }


  getStatusClass(
    status: EnergySource['status']
  ): string {

    switch (status) {

      case 'ONLINE':
        return 'status-online';

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


  getMetricClass(
    status: EnergyMetric['status']
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


  getOutputWidth(
    output: number,
    capacity: number
  ): number {

    if (capacity <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (output / capacity) * 100
      )
    );

  }


  getEfficiencyClass(
    efficiency: number
  ): string {

    if (efficiency >= 85) {
      return 'efficiency-good';
    }

    if (efficiency >= 70) {
      return 'efficiency-warning';
    }

    return 'efficiency-critical';

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