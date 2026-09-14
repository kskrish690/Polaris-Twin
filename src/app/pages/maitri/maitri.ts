import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  WeatherService,
  WeatherData
} from '../../services/weather';


interface MaitriWeather {

  temperature: number | null;

  feelsLike: number | null;

  humidity: number | null;

  windSpeed: number | null;

  windDirection: number | null;

  pressure: number | null;

  precipitation: number | null;

  weatherCode: number | null;

  cloudCover: number | null;

}


type WeatherStatus =
  | 'CONNECTING'
  | 'UPDATING'
  | 'LIVE'
  | 'OFFLINE';


@Component({

  selector: 'app-maitri',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './maitri.html',

  styleUrls: [
    './maitri.css'
  ]

})


export class Maitri
  implements OnInit, OnDestroy {


  // ==========================================================
  // STATION INFORMATION
  // ==========================================================

  readonly stationName = 'MAITRI';

  readonly stationCode = 'MAI';

  readonly location = 'SCHIRMACHER OASIS';

  readonly region = 'CENTRAL DRONNING MAUD LAND';

  readonly latitude = -70.76444;

  readonly longitude = 11.73417;

  readonly latitudeText = '70°45′52″ S';

  readonly longitudeText = '11°44′03″ E';

  readonly elevation = '≈ 50 m';

  readonly stationType =
    'YEAR-ROUND RESEARCH STATION';


  // ==========================================================
  // WEATHER DATA
  // ==========================================================

  weather: MaitriWeather = {

    temperature: null,

    feelsLike: null,

    humidity: null,

    windSpeed: null,

    windDirection: null,

    pressure: null,

    precipitation: null,

    weatherCode: null,

    cloudCover: null

  };


  // ==========================================================
  // PAGE STATE
  // ==========================================================

  loading = true;

  error = '';

  weatherStatus: WeatherStatus =
    'CONNECTING';

  lastUpdate: Date | null = null;

  currentTime = new Date();


  // ==========================================================
  // TIMERS
  // ==========================================================

  private clockTimer?:
    ReturnType<typeof setInterval>;

  private weatherTimer?:
    ReturnType<typeof setInterval>;


  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(

    private readonly weatherService: WeatherService,

    private readonly cdr: ChangeDetectorRef

  ) {}


  // ==========================================================
  // COMPONENT INIT
  // ==========================================================

  ngOnInit(): void {

    this.updateClock();

    this.clockTimer = setInterval(() => {

      this.updateClock();

      this.cdr.detectChanges();

    }, 1000);


    // First weather request

    this.loadWeather();


    // Refresh weather every 5 minutes

    this.weatherTimer = setInterval(() => {

      this.loadWeather();

    }, 5 * 60 * 1000);

  }


  // ==========================================================
  // COMPONENT DESTROY
  // ==========================================================

  ngOnDestroy(): void {

    if (this.clockTimer) {

      clearInterval(
        this.clockTimer
      );

    }


    if (this.weatherTimer) {

      clearInterval(
        this.weatherTimer
      );

    }

  }


  // ==========================================================
  // CLOCK
  // ==========================================================

  private updateClock(): void {

    this.currentTime = new Date();

  }


  // ==========================================================
  // LOAD LIVE WEATHER
  // ==========================================================

  loadWeather(): void {

    this.loading = true;

    this.error = '';

    this.weatherStatus = 'UPDATING';

    this.cdr.detectChanges();


    console.log(
      'Loading live Maitri weather...'
    );


    this.weatherService

      .getWeather(
        this.latitude,
        this.longitude
      )

      .subscribe({

        // ====================================================
        // SUCCESS
        // ====================================================

        next: (
          data: WeatherData
        ) => {

          console.log(
            'MAITRI WEATHER DATA:',
            data
          );


          this.applyWeatherData(
            data
          );


          this.weatherStatus = 'LIVE';

          this.loading = false;

          this.lastUpdate = new Date();

          this.cdr.detectChanges();


          console.log(
            'MAITRI weather updated successfully'
          );

        },


        // ====================================================
        // ERROR
        // ====================================================

        error: (
          error
        ) => {

          console.error(
            'MAITRI WEATHER API ERROR:',
            error
          );


          this.weatherStatus = 'OFFLINE';

          this.loading = false;

          this.error =
            'Unable to retrieve live Maitri weather data.';


          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================================
  // APPLY API DATA
  // ==========================================================

  private applyWeatherData(
    data: WeatherData
  ): void {

    if (
      !data ||
      !data.current
    ) {

      this.weatherStatus = 'OFFLINE';

      this.error =
        'Invalid weather response received.';

      return;

    }


    const current = data.current;


    this.weather = {

      temperature:
        this.safeNumber(
          current.temperature_2m
        ),

      feelsLike:
        this.safeNumber(
          current.apparent_temperature
        ),

      humidity:
        this.safeNumber(
          current.relative_humidity_2m
        ),

      windSpeed:
        this.safeNumber(
          current.wind_speed_10m
        ),

      windDirection:
        this.safeNumber(
          current.wind_direction_10m
        ),

      pressure:
        this.safeNumber(
          current.surface_pressure
        ),

      precipitation:
        this.safeNumber(
          current.precipitation
        ),

      weatherCode:
        this.safeNumber(
          current.weather_code
        ),

      cloudCover:
        this.safeNumber(
          current.cloud_cover
        )

    };

  }


  // ==========================================================
  // SAFE NUMBER
  // ==========================================================

  private safeNumber(
    value: number | null | undefined
  ): number | null {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(value)
    ) {

      return null;

    }

    return Number(value);

  }


  // ==========================================================
  // WEATHER DESCRIPTION
  // ==========================================================

  get weatherDescription(): string {

    const code =
      this.weather.weatherCode;


    if (code === null) {
      return 'NO DATA';
    }


    if (code === 0) {
      return 'CLEAR SKY';
    }


    if (
      [1, 2, 3].includes(code)
    ) {

      return 'CLOUDY';

    }


    if (
      [45, 48].includes(code)
    ) {

      return 'FOG';

    }


    if (
      [51, 53, 55, 56, 57].includes(code)
    ) {

      return 'DRIZZLE';

    }


    if (
      [61, 63, 65, 66, 67].includes(code)
    ) {

      return 'RAIN';

    }


    if (
      [71, 73, 75, 77, 85, 86].includes(code)
    ) {

      return 'SNOW';

    }


    if (
      [80, 81, 82].includes(code)
    ) {

      return 'RAIN SHOWERS';

    }


    if (
      [95, 96, 99].includes(code)
    ) {

      return 'THUNDERSTORM';

    }


    return 'UNKNOWN';

  }


  // ==========================================================
  // WEATHER ICON
  // ==========================================================

  get weatherIcon(): string {

    const code =
      this.weather.weatherCode;


    if (code === null) {
      return '◌';
    }


    if (code === 0) {
      return '☼';
    }


    if (
      [1, 2, 3].includes(code)
    ) {

      return '☁';

    }


    if (
      [45, 48].includes(code)
    ) {

      return '≋';

    }


    if (
      [51, 53, 55, 56, 57].includes(code)
    ) {

      return '╌';

    }


    if (
      [61, 63, 65, 66, 67].includes(code)
    ) {

      return '∴';

    }


    if (
      [71, 73, 75, 77, 85, 86].includes(code)
    ) {

      return '❄';

    }


    if (
      [80, 81, 82].includes(code)
    ) {

      return '◒';

    }


    if (
      [95, 96, 99].includes(code)
    ) {

      return 'ϟ';

    }


    return '◌';

  }


  // ==========================================================
  // WIND DIRECTION
  // ==========================================================

  get windDirectionText(): string {

    const degrees =
      this.weather.windDirection;


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
      Math.round(
        degrees / 45
      ) % 8;


    return directions[index];

  }


  // ==========================================================
  // WIND ROTATION
  // ==========================================================

  get windRotation(): string {

    const degrees =
      this.weather.windDirection;


    if (degrees === null) {

      return 'rotate(0deg)';

    }


    return `rotate(${degrees}deg)`;

  }


  // ==========================================================
  // TEMPERATURE DISPLAY
  // ==========================================================

  get temperatureDisplay(): string {

    const value =
      this.weather.temperature;


    if (value === null) {

      return '--.-°';

    }


    return `${value.toFixed(1)}°`;

  }


  // ==========================================================
  // FEELS LIKE DISPLAY
  // ==========================================================

  get feelsLikeDisplay(): string {

    const value =
      this.weather.feelsLike;


    if (value === null) {

      return '--.- °C';

    }


    return `${value.toFixed(1)} °C`;

  }


  // ==========================================================
  // HUMIDITY DISPLAY
  // ==========================================================

  get humidityDisplay(): string {

    const value =
      this.weather.humidity;


    if (value === null) {

      return '--%';

    }


    return `${Math.round(value)}%`;

  }


  // ==========================================================
  // WIND DISPLAY
  // ==========================================================

  get windDisplay(): string {

    const value =
      this.weather.windSpeed;


    if (value === null) {

      return '--.-';

    }


    return value.toFixed(1);

  }


  // ==========================================================
  // PRESSURE DISPLAY
  // ==========================================================

  get pressureDisplay(): string {

    const value =
      this.weather.pressure;


    if (value === null) {

      return '----';

    }


    return Math.round(value).toString();

  }


  // ==========================================================
  // PRECIPITATION DISPLAY
  // ==========================================================

  get precipitationDisplay(): string {

    const value =
      this.weather.precipitation;


    if (value === null) {

      return '--';

    }


    return value.toFixed(1);

  }


  // ==========================================================
  // CLOUD COVER DISPLAY
  // ==========================================================

  get cloudCoverDisplay(): string {

    const value =
      this.weather.cloudCover;


    if (value === null) {

      return '--%';

    }


    return `${Math.round(value)}%`;

  }


  // ==========================================================
  // WIND DEGREES
  // ==========================================================

  get windDegreesDisplay(): string {

    const value =
      this.weather.windDirection;


    if (value === null) {

      return '---°';

    }


    return `${Math.round(value)}°`;

  }


  // ==========================================================
  // TELEMETRY BAR — TEMPERATURE
  // ==========================================================

  getTemperatureWidth(): number {

    const value =
      this.weather.temperature;


    if (value === null) {

      return 0;

    }


    const percentage =
      ((value + 40) / 60) * 100;


    return this.clamp(
      percentage,
      5,
      100
    );

  }


  // ==========================================================
  // TELEMETRY BAR — WIND
  // ==========================================================

  getWindWidth(): number {

    const value =
      this.weather.windSpeed;


    if (value === null) {

      return 0;

    }


    const percentage =
      (value / 80) * 100;


    return this.clamp(
      percentage,
      0,
      100
    );

  }


  // ==========================================================
  // TELEMETRY BAR — HUMIDITY
  // ==========================================================

  getHumidityWidth(): number {

    const value =
      this.weather.humidity;


    if (value === null) {

      return 0;

    }


    return this.clamp(
      value,
      0,
      100
    );

  }


  // ==========================================================
  // TELEMETRY BAR — CLOUD COVER
  // ==========================================================

  getCloudWidth(): number {

    const value =
      this.weather.cloudCover;


    if (value === null) {

      return 0;

    }


    return this.clamp(
      value,
      0,
      100
    );

  }


  // ==========================================================
  // TELEMETRY BAR — PRECIPITATION
  // ==========================================================

  getPrecipitationWidth(): number {

    const value =
      this.weather.precipitation;


    if (value === null) {

      return 0;

    }


    return this.clamp(
      value * 20,
      0,
      100
    );

  }


  // ==========================================================
  // CLAMP VALUE
  // ==========================================================

  private clamp(
    value: number,
    minimum: number,
    maximum: number
  ): number {

    return Math.min(
      maximum,
      Math.max(
        minimum,
        value
      )
    );

  }


  // ==========================================================
  // WEATHER STATUS TEXT
  // ==========================================================

  get weatherStatusText(): string {

    switch (
      this.weatherStatus
    ) {

      case 'LIVE':
        return 'LIVE';

      case 'UPDATING':
        return 'UPDATING';

      case 'OFFLINE':
        return 'OFFLINE';

      case 'CONNECTING':
      default:
        return 'CONNECTING';

    }

  }


  // ==========================================================
  // WEATHER STATUS CSS CLASS
  // ==========================================================

  get weatherStatusClass(): string {

    switch (
      this.weatherStatus
    ) {

      case 'LIVE':
        return 'is-live';

      case 'UPDATING':
        return 'is-updating';

      case 'OFFLINE':
        return 'is-offline';

      case 'CONNECTING':
      default:
        return 'is-connecting';

    }

  }


  // ==========================================================
  // LAST UPDATE — INDIA TIME
  // ==========================================================

  get lastUpdateDisplay(): string {

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
      ).format(
        this.lastUpdate
      )

      + ' IST'

    );

  }


  // ==========================================================
  // CURRENT TIME — INDIA
  // ==========================================================

  get currentTimeDisplay(): string {

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


  // ==========================================================
  // CURRENT DATE — INDIA
  // ==========================================================

  get currentDateDisplay(): string {

    const parts =
      new Intl.DateTimeFormat(
        'en-CA',
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
      )?.value ?? '----';


    const month =
      parts.find(
        part =>
          part.type === 'month'
      )?.value ?? '--';


    const day =
      parts.find(
        part =>
          part.type === 'day'
      )?.value ?? '--';


    return `${year}-${month}-${day}`;

  }


  // ==========================================================
  // RETRY WEATHER
  // ==========================================================

  retryWeather(): void {

    this.loadWeather();

  }

}