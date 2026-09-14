import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  severity: string;
}

interface SimulationMetric {
  label: string;
  value: number;
  unit: string;
  status: string;
}

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulation.html',
  styleUrls: ['./simulation.css']
})
export class Simulation
  implements OnInit, OnDestroy {

  currentTime = new Date();

  private clockTimer?: ReturnType<typeof setInterval>;
  private simulationTimer?: ReturnType<typeof setInterval>;

  isRunning = false;
  simulationProgress = 0;

  simulationSpeed = 1;

  selectedScenario = 'normal';

  simulationTime = 0;

  readonly simulationDuration = 120;

  scenarios: SimulationScenario[] = [
    {
      id: 'normal',
      name: 'NORMAL OPERATIONS',
      description:
        'Baseline station operating conditions.',
      severity: 'LOW'
    },
    {
      id: 'blizzard',
      name: 'SEVERE BLIZZARD',
      description:
        'High wind, low visibility and extreme cold.',
      severity: 'HIGH'
    },
    {
      id: 'coldwave',
      name: 'EXTREME COLD WAVE',
      description:
        'Rapid temperature decrease affecting station systems.',
      severity: 'HIGH'
    },
    {
      id: 'power',
      name: 'POWER FAILURE',
      description:
        'Primary generation capacity reduced.',
      severity: 'CRITICAL'
    },
    {
      id: 'logistics',
      name: 'LOGISTICS DISRUPTION',
      description:
        'Supply movement and resupply operations affected.',
      severity: 'MEDIUM'
    }
  ];

  temperature = -18;
  windSpeed = 24;
  visibility = 82;

  powerDemand = 68;
  powerAvailable = 94;

  logisticsReadiness = 91;
  personnelSafety = 97;

  environmentalRisk = 18;

  metrics: SimulationMetric[] = [
    {
      label: 'POWER DEMAND',
      value: 68,
      unit: '%',
      status: 'NORMAL'
    },
    {
      label: 'POWER AVAILABLE',
      value: 94,
      unit: '%',
      status: 'STABLE'
    },
    {
      label: 'LOGISTICS READINESS',
      value: 91,
      unit: '%',
      status: 'READY'
    },
    {
      label: 'PERSONNEL SAFETY',
      value: 97,
      unit: '%',
      status: 'SAFE'
    }
  ];

  constructor(
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

    this.stopSimulationTimer();
  }

  private updateClock(): void {
    this.currentTime = new Date();
  }

  startSimulation(): void {

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.stopSimulationTimer();

    this.simulationTimer = setInterval(() => {

      this.runSimulationStep();

      this.cdr.detectChanges();

    }, 1000 / this.simulationSpeed);
  }

  pauseSimulation(): void {

    this.isRunning = false;

    this.stopSimulationTimer();
  }

  resetSimulation(): void {

    this.isRunning = false;

    this.stopSimulationTimer();

    this.simulationProgress = 0;
    this.simulationTime = 0;

    this.temperature = -18;
    this.windSpeed = 24;
    this.visibility = 82;

    this.powerDemand = 68;
    this.powerAvailable = 94;

    this.logisticsReadiness = 91;
    this.personnelSafety = 97;

    this.environmentalRisk = 18;

    this.updateMetrics();

    this.cdr.detectChanges();
  }

  private stopSimulationTimer(): void {

    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = undefined;
    }
  }

  runSimulationStep(): void {

    this.simulationTime += 1;

    this.simulationProgress =
      Math.min(
        100,
        (this.simulationTime /
          this.simulationDuration) * 100
      );

    this.applyScenarioEffects();

    this.addNaturalVariation();

    this.updateMetrics();

    if (
      this.simulationTime >=
      this.simulationDuration
    ) {

      this.isRunning = false;

      this.stopSimulationTimer();
    }
  }

  private applyScenarioEffects(): void {

    switch (this.selectedScenario) {

      case 'normal':

        this.temperature =
          this.approach(
            this.temperature,
            -18,
            0.5
          );

        this.windSpeed =
          this.approach(
            this.windSpeed,
            24,
            1
          );

        this.visibility =
          this.approach(
            this.visibility,
            82,
            2
          );

        this.powerDemand =
          this.approach(
            this.powerDemand,
            68,
            1
          );

        this.powerAvailable =
          this.approach(
            this.powerAvailable,
            94,
            1
          );

        this.logisticsReadiness =
          this.approach(
            this.logisticsReadiness,
            91,
            1
          );

        this.personnelSafety =
          this.approach(
            this.personnelSafety,
            97,
            1
          );

        break;


      case 'blizzard':

        this.temperature =
          this.approach(
            this.temperature,
            -31,
            0.8
          );

        this.windSpeed =
          this.approach(
            this.windSpeed,
            72,
            2
          );

        this.visibility =
          this.approach(
            this.visibility,
            18,
            3
          );

        this.powerDemand =
          this.approach(
            this.powerDemand,
            88,
            2
          );

        this.powerAvailable =
          this.approach(
            this.powerAvailable,
            83,
            1
          );

        this.logisticsReadiness =
          this.approach(
            this.logisticsReadiness,
            42,
            2
          );

        this.personnelSafety =
          this.approach(
            this.personnelSafety,
            58,
            2
          );

        break;


      case 'coldwave':

        this.temperature =
          this.approach(
            this.temperature,
            -42,
            1
          );

        this.windSpeed =
          this.approach(
            this.windSpeed,
            38,
            1
          );

        this.visibility =
          this.approach(
            this.visibility,
            62,
            2
          );

        this.powerDemand =
          this.approach(
            this.powerDemand,
            96,
            2
          );

        this.powerAvailable =
          this.approach(
            this.powerAvailable,
            88,
            1
          );

        this.logisticsReadiness =
          this.approach(
            this.logisticsReadiness,
            67,
            1
          );

        this.personnelSafety =
          this.approach(
            this.personnelSafety,
            74,
            1
          );

        break;


      case 'power':

        this.temperature =
          this.approach(
            this.temperature,
            -21,
            0.5
          );

        this.windSpeed =
          this.approach(
            this.windSpeed,
            29,
            1
          );

        this.visibility =
          this.approach(
            this.visibility,
            76,
            2
          );

        this.powerDemand =
          this.approach(
            this.powerDemand,
            93,
            2
          );

        this.powerAvailable =
          this.approach(
            this.powerAvailable,
            38,
            3
          );

        this.logisticsReadiness =
          this.approach(
            this.logisticsReadiness,
            72,
            1
          );

        this.personnelSafety =
          this.approach(
            this.personnelSafety,
            79,
            1
          );

        break;


      case 'logistics':

        this.temperature =
          this.approach(
            this.temperature,
            -23,
            0.5
          );

        this.windSpeed =
          this.approach(
            this.windSpeed,
            45,
            1
          );

        this.visibility =
          this.approach(
            this.visibility,
            55,
            2
          );

        this.powerDemand =
          this.approach(
            this.powerDemand,
            76,
            1
          );

        this.powerAvailable =
          this.approach(
            this.powerAvailable,
            91,
            1
          );

        this.logisticsReadiness =
          this.approach(
            this.logisticsReadiness,
            35,
            2
          );

        this.personnelSafety =
          this.approach(
            this.personnelSafety,
            82,
            1
          );

        break;
    }

    this.calculateEnvironmentalRisk();
  }

  private addNaturalVariation(): void {

    if (!this.isRunning) {
      return;
    }

    this.temperature +=
      (Math.random() - 0.5) * 0.8;

    this.windSpeed +=
      (Math.random() - 0.5) * 2;

    this.visibility +=
      (Math.random() - 0.5) * 3;

    this.temperature =
      Math.max(-60, Math.min(5, this.temperature));

    this.windSpeed =
      Math.max(0, Math.min(100, this.windSpeed));

    this.visibility =
      Math.max(0, Math.min(100, this.visibility));
  }

  private calculateEnvironmentalRisk(): void {

    let risk = 10;

    if (this.temperature < -30) {
      risk += 25;
    }

    if (this.temperature < -40) {
      risk += 15;
    }

    if (this.windSpeed > 45) {
      risk += 20;
    }

    if (this.windSpeed > 65) {
      risk += 15;
    }

    if (this.visibility < 50) {
      risk += 15;
    }

    if (this.visibility < 25) {
      risk += 15;
    }

    this.environmentalRisk =
      Math.min(100, risk);
  }

  private updateMetrics(): void {

    this.metrics = [

      {
        label: 'POWER DEMAND',
        value: Math.round(this.powerDemand),
        unit: '%',
        status:
          this.powerDemand > 85
            ? 'HIGH'
            : 'NORMAL'
      },

      {
        label: 'POWER AVAILABLE',
        value: Math.round(this.powerAvailable),
        unit: '%',
        status:
          this.powerAvailable < 50
            ? 'CRITICAL'
            : this.powerAvailable < 70
              ? 'WARNING'
              : 'STABLE'
      },

      {
        label: 'LOGISTICS READINESS',
        value: Math.round(this.logisticsReadiness),
        unit: '%',
        status:
          this.logisticsReadiness < 50
            ? 'LOW'
            : 'READY'
      },

      {
        label: 'PERSONNEL SAFETY',
        value: Math.round(this.personnelSafety),
        unit: '%',
        status:
          this.personnelSafety < 60
            ? 'RISK'
            : 'SAFE'
      }
    ];
  }

  private approach(
    current: number,
    target: number,
    step: number
  ): number {

    if (Math.abs(target - current) <= step) {
      return target;
    }

    return current +
      Math.sign(target - current) * step;
  }

  selectScenario(id: string): void {

    this.selectedScenario = id;

    this.resetSimulation();
  }

  setSpeed(speed: number): void {

    this.simulationSpeed = speed;

    if (this.isRunning) {

      this.stopSimulationTimer();

      this.simulationTimer =
        setInterval(() => {

          this.runSimulationStep();

          this.cdr.detectChanges();

        }, 1000 / this.simulationSpeed);
    }
  }

  get selectedScenarioData():
    SimulationScenario {

    return (
      this.scenarios.find(
        scenario =>
          scenario.id === this.selectedScenario
      ) ??
      this.scenarios[0]
    );
  }

  get riskLabel(): string {

    if (this.environmentalRisk >= 70) {
      return 'CRITICAL';
    }

    if (this.environmentalRisk >= 45) {
      return 'HIGH';
    }

    if (this.environmentalRisk >= 25) {
      return 'MODERATE';
    }

    return 'LOW';
  }

  get windDirection(): string {

    const directions = [
      'N',
      'NE',
      'E',
      'SE',
      'S',
      'SW',
      'W',
      'NW'
    ];

    const index =
      Math.round(
        (this.windSpeed * 3) / 45
      ) % 8;

    return directions[index];
  }

  get formattedSimulationTime(): string {

    const minutes =
      Math.floor(this.simulationTime / 60);

    const seconds =
      this.simulationTime % 60;

    return (
      String(minutes).padStart(2, '0') +
      ':' +
      String(seconds).padStart(2, '0')
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
    ).format(this.currentTime);
  }

  get formattedDate(): string {

    const parts =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }
      ).formatToParts(this.currentTime);

    const year =
      parts.find(
        p => p.type === 'year'
      )?.value;

    const month =
      parts.find(
        p => p.type === 'month'
      )?.value;

    const day =
      parts.find(
        p => p.type === 'day'
      )?.value;

    return `${year}-${month}-${day}`;
  }

  getProgress(value: number): number {

    return Math.min(
      100,
      Math.max(0, value)
    );
  }
}