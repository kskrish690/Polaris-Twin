import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  WeatherService,
  WeatherData
} from '../../services/weather';

interface EnvironmentalData {
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  pressure: number | null;
  precipitation: number | null;
  cloudCover: number | null;
  weatherCode: number | null;

  seaIce: number;
  snowDepth: number;
  visibility: number;
  airQuality: number;
  solarRadiation: number;
  uvIndex: number;
}

@Component({
  selector: 'app-environment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './environment.html',
  styleUrls: ['./environment.css']
})
export class Environment implements OnInit, OnDestroy {

  currentTime = new Date();

  private clockTimer?: ReturnType<typeof setInterval>;
  private weatherTimer?: ReturnType<typeof setInterval>;
  private simulationTimer?: ReturnType<typeof setInterval>;

  loading = true;
  error = '';

  lastUpdate: Date | null = null;

  readonly latitude = -70.76444;
  readonly longitude = 11.73417;

  stationName = 'MAITRI';
  stationCode = 'MAI';

  environment: EnvironmentalData = {
    temperature: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    pressure: null,
    precipitation: null,
    cloudCover: null,
    weatherCode: null,

    seaIce: 92,
    snowDepth: 68,
    visibility: 78,
    airQuality: 96,
    solarRadiation: 145,
    uvIndex: 1
  };

  ngOnInit(): void {

    this.updateClock();

    this.clockTimer = setInterval(() => {
      this.updateClock();
      this.cdr.detectChanges();
    }, 1000);

    this.loadWeather();

    /*
     * Weather refresh every 5 minutes.
     * Open-Meteo provides near-real-time/model-based weather data.
     */
    this.weatherTimer = setInterval(() => {
      this.loadWeather();
    }, 5 * 60 * 1000);

    /*
     * Environmental indicators below are simulated
     * because they are not connected to station telemetry.
     */
    this.simulationTimer = setInterval(() => {
      this.updateEnvironmentalSimulation();
      this.cdr.detectChanges();
    }, 8000);
  }

  ngOnDestroy(): void {

    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }

    if (this.weatherTimer) {
      clearInterval(this.weatherTimer);
    }

    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
    }
  }

  constructor(
    private weatherService: WeatherService,
    private cdr: ChangeDetectorRef
  ) {}

  private updateClock(): void {
    this.currentTime = new Date();
  }

  loadWeather(): void {

    this.loading = true;
    this.error = '';

    this.weatherService
      .getWeather(this.latitude, this.longitude)
      .subscribe({

        next: (data: WeatherData) => {

          if (!data || !data.current) {
            this.error = 'Invalid weather response.';
            this.loading = false;
            return;
          }

          const current = data.current;

          this.environment.temperature =
            current.temperature_2m;

          this.environment.feelsLike =
            current.apparent_temperature;

          this.environment.humidity =
            current.relative_humidity_2m;

          this.environment.windSpeed =
            current.wind_speed_10m;

          this.environment.windDirection =
            current.wind_direction_10m;

          this.environment.pressure =
            current.surface_pressure;

          this.environment.precipitation =
            current.precipitation;

          this.environment.cloudCover =
            current.cloud_cover;

          this.environment.weatherCode =
            current.weather_code;

          this.loading = false;
          this.lastUpdate = new Date();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Environment weather API error:',
            error
          );

          this.loading = false;
          this.error =
            'Unable to retrieve current weather data.';

          this.cdr.detectChanges();
        }
      });
  }

  updateEnvironmentalSimulation(): void {

    this.environment.seaIce =
      this.randomValue(88, 96);

    this.environment.snowDepth =
      this.randomValue(60, 75);

    this.environment.visibility =
      this.randomValue(65, 95);

    this.environment.airQuality =
      this.randomValue(92, 99);

    this.environment.solarRadiation =
      this.randomValue(110, 190);

    this.environment.uvIndex =
      this.randomValue(0, 2);
  }

  private randomValue(
    min: number,
    max: number
  ): number {

    return Math.round(
      min + Math.random() * (max - min)
    );
  }

  get temperatureDisplay(): string {

    if (this.environment.temperature === null) {
      return '-- °C';
    }

    return `${this.environment.temperature.toFixed(1)} °C`;
  }

  get feelsLikeDisplay(): string {

    if (this.environment.feelsLike === null) {
      return '-- °C';
    }

    return `${this.environment.feelsLike.toFixed(1)} °C`;
  }

  get humidityDisplay(): string {

    if (this.environment.humidity === null) {
      return '--%';
    }

    return `${Math.round(this.environment.humidity)}%`;
  }

  get windDisplay(): string {

    if (this.environment.windSpeed === null) {
      return '-- km/h';
    }

    return `${this.environment.windSpeed.toFixed(1)} km/h`;
  }

  get pressureDisplay(): string {

    if (this.environment.pressure === null) {
      return '-- hPa';
    }

    return `${Math.round(this.environment.pressure)} hPa`;
  }

  get precipitationDisplay(): string {

    if (this.environment.precipitation === null) {
      return '-- mm';
    }

    return `${this.environment.precipitation.toFixed(1)} mm`;
  }

  get cloudDisplay(): string {

    if (this.environment.cloudCover === null) {
      return '--%';
    }

    return `${Math.round(this.environment.cloudCover)}%`;
  }

  getWindDirection(degrees: number | null): string {

    if (degrees === null) {
      return '--';
    }

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
      Math.round(degrees / 45) % 8;

    return directions[index];
  }

  getWeatherDescription(
    code: number | null
  ): string {

    if (code === null) {
      return 'NO DATA';
    }

    if (code === 0) {
      return 'CLEAR SKY';
    }

    if ([1, 2, 3].includes(code)) {
      return 'CLOUDY';
    }

    if ([45, 48].includes(code)) {
      return 'FOG';
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return 'DRIZZLE';
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
      return 'RAIN';
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return 'SNOW';
    }

    if ([80, 81, 82].includes(code)) {
      return 'RAIN SHOWERS';
    }

    if ([95, 96, 99].includes(code)) {
      return 'THUNDERSTORM';
    }

    return 'UNKNOWN';
  }

  getEnvironmentRisk(): number {

    let risk = 0;

    if (
      this.environment.temperature !== null &&
      this.environment.temperature < -25
    ) {
      risk += 25;
    }

    if (
      this.environment.windSpeed !== null &&
      this.environment.windSpeed > 50
    ) {
      risk += 30;
    }

    if (
      this.environment.visibility < 70
    ) {
      risk += 20;
    }

    if (
      this.environment.snowDepth > 72
    ) {
      risk += 10;
    }

    if (risk > 100) {
      risk = 100;
    }

    return risk;
  }

  getRiskLabel(): string {

    const risk = this.getEnvironmentRisk();

    if (risk >= 70) {
      return 'HIGH';
    }

    if (risk >= 40) {
      return 'MODERATE';
    }

    return 'LOW';
  }

  getProgress(
    value: number,
    max: number
  ): number {

    if (max <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (value / max) * 100
      )
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
      parts.find(p => p.type === 'year')?.value;

    const month =
      parts.find(p => p.type === 'month')?.value;

    const day =
      parts.find(p => p.type === 'day')?.value;

    return `${year}-${month}-${day}`;
  }

  get formattedLastUpdate(): string {

    if (!this.lastUpdate) {
      return '--:--:-- IST';
    }

    return (
      new Intl.DateTimeFormat(
        'en-IN',
        {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }
      ).format(this.lastUpdate) +
      ' IST'
    );
  }

  retry(): void {
    this.loadWeather();
  }
}