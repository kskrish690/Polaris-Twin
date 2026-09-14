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

@Component({
  selector: 'app-bharati',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './bharati.html',
  styleUrls: ['./bharati.css']
})
export class Bharati implements OnInit, OnDestroy {

  // ============================================================
  // STATION INFORMATION
  // ============================================================

  readonly stationName = 'BHARATI';

  readonly stationCode = 'BHA-01';

  readonly latitude = -69.406833;

  readonly longitude = 76.195333;

  readonly latitudeText = "69°24.41'S";

  readonly longitudeText = "76°11.72'E";

  readonly elevation = '~35 M ASL';

  readonly location =
    'Larsemann Hills, East Antarctica';

  readonly region =
    'PRYDZ BAY / LARSEMANN HILLS';


  // ============================================================
  // WEATHER DATA
  // ============================================================

  weather: WeatherData = {
    latitude: this.latitude,
    longitude: this.longitude,

    current: {
      time: '',
      interval: 0,

      temperature_2m: null,
      apparent_temperature: null,

      relative_humidity_2m: null,

      wind_speed_10m: null,
      wind_direction_10m: null,

      surface_pressure: null,

      precipitation: null,
      snowfall: null,

      cloud_cover: null,

      visibility: null,

      weather_code: null
    }
  };


  // ============================================================
  // PAGE STATE
  // ============================================================

  loading = true;

  error = '';

  lastUpdate: Date | null = null;


  // ============================================================
  // TIMERS
  // ============================================================

  private weatherTimer?: ReturnType<typeof setInterval>;

  private clockTimer?: ReturnType<typeof setInterval>;


  // ============================================================
  // CURRENT DATE/TIME
  // ============================================================

  currentDateDisplay = '--';

  currentTimeDisplay = '--:--:--';


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private weatherService: WeatherService,
    private cdr: ChangeDetectorRef
  ) {}


  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.updateClock();

    this.clockTimer = setInterval(() => {

      this.updateClock();

      this.cdr.detectChanges();

    }, 1000);


    this.loadWeather();


    // Refresh Open-Meteo data every 5 minutes

    this.weatherTimer = setInterval(() => {

      this.loadWeather();

    }, 5 * 60 * 1000);
  }


  // ============================================================
  // DESTROY
  // ============================================================

  ngOnDestroy(): void {

    if (this.weatherTimer) {

      clearInterval(
        this.weatherTimer
      );
    }


    if (this.clockTimer) {

      clearInterval(
        this.clockTimer
      );
    }
  }


  // ============================================================
  // CLOCK
  // ============================================================

  private updateClock(): void {

    const now = new Date();


    this.currentDateDisplay =
      new Intl.DateTimeFormat(
        'en-IN',
        {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }
      ).format(now);


    this.currentTimeDisplay =
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
  }


  // ============================================================
  // LOAD WEATHER
  // ============================================================

  loadWeather(): void {

    this.loading = true;

    this.error = '';

    this.cdr.detectChanges();


    this.weatherService
      .getWeather(
        this.latitude,
        this.longitude
      )
      .subscribe({

        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        next: (data: WeatherData) => {

          console.log(
            'BHARATI OPEN-METEO DATA:',
            data
          );


          if (
            !data ||
            !data.current
          ) {

            this.error =
              'Invalid weather data received from Open-Meteo.';

            this.loading = false;

            this.cdr.detectChanges();

            return;
          }


          this.weather = data;

          this.loading = false;

          this.lastUpdate = new Date();


          this.cdr.detectChanges();
        },


        // ------------------------------------------------------
        // ERROR
        // ------------------------------------------------------

        error: (err) => {

          console.error(
            'BHARATI WEATHER ERROR:',
            err
          );


          this.loading = false;

          this.error =
            'Unable to retrieve live Bharati weather data from Open-Meteo.';


          this.cdr.detectChanges();
        }

      });
  }


  // ============================================================
  // RETRY
  // ============================================================

  retryWeather(): void {

    this.loadWeather();
  }


  // ============================================================
  // WEATHER STATUS
  // ============================================================

  get weatherStatusClass(): string {

    if (this.loading) {

      return 'status-updating';
    }


    if (
      this.error ||
      !this.hasWeatherData
    ) {

      return 'status-offline';
    }


    return 'status-live';
  }


  get weatherStatusText(): string {

    if (this.loading) {

      return 'UPDATING';
    }


    if (
      this.error ||
      !this.hasWeatherData
    ) {

      return 'OFFLINE';
    }


    return 'LIVE';
  }


  // ============================================================
  // WEATHER AVAILABLE
  // ============================================================

  get hasWeatherData(): boolean {

    return (
      this.weather?.current?.temperature_2m !== null &&
      this.weather?.current?.temperature_2m !== undefined
    );
  }


  // ============================================================
  // CURRENT TEMPERATURE
  // ============================================================

  get temperature(): number | null {

    return this.safeNumber(
      this.weather?.current?.temperature_2m
    );
  }


  get temperatureDisplay(): string {

    const value = this.temperature;

    if (value === null) {

      return '-- °C';
    }


    return `${value.toFixed(1)} °C`;
  }


  // ============================================================
  // FEELS LIKE
  // ============================================================

  get feelsLike(): number | null {

    return this.safeNumber(
      this.weather?.current?.apparent_temperature
    );
  }


  get feelsLikeDisplay(): string {

    const value = this.feelsLike;

    if (value === null) {

      return '-- °C';
    }


    return `${value.toFixed(1)} °C`;
  }


  // ============================================================
  // HUMIDITY
  // ============================================================

  get humidity(): number | null {

    return this.safeNumber(
      this.weather?.current?.relative_humidity_2m
    );
  }


  get humidityDisplay(): string {

    const value = this.humidity;

    if (value === null) {

      return '--%';
    }


    return `${value.toFixed(0)}%`;
  }


  // ============================================================
  // WIND SPEED
  // ============================================================

  get windSpeed(): number | null {

    return this.safeNumber(
      this.weather?.current?.wind_speed_10m
    );
  }


  get windDisplay(): string {

    const value = this.windSpeed;

    if (value === null) {

      return '--';
    }


    return value.toFixed(1);
  }


  // ============================================================
  // WIND DIRECTION
  // ============================================================

  get windDirection(): number | null {

    return this.safeNumber(
      this.weather?.current?.wind_direction_10m
    );
  }


  get windDirectionText(): string {

    const degrees = this.windDirection;

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


  get windDegreesDisplay(): string {

    const degrees = this.windDirection;

    if (degrees === null) {

      return '--°';
    }


    return `${Math.round(degrees)}°`;
  }


  get windRotation(): string {

    const degrees = this.windDirection;

    if (degrees === null) {

      return 'rotate(0deg)';
    }


    return `rotate(${degrees}deg)`;
  }


  // ============================================================
  // PRESSURE
  // ============================================================

  get pressure(): number | null {

    return this.safeNumber(
      this.weather?.current?.surface_pressure
    );
  }


  get pressureDisplay(): string {

    const value = this.pressure;

    if (value === null) {

      return '--';
    }


    return value.toFixed(0);
  }


  // ============================================================
  // CLOUD COVER
  // ============================================================

  get cloudCover(): number | null {

    return this.safeNumber(
      this.weather?.current?.cloud_cover
    );
  }


  get cloudCoverDisplay(): string {

    const value = this.cloudCover;

    if (value === null) {

      return '--%';
    }


    return `${value.toFixed(0)}%`;
  }


  // ============================================================
  // PRECIPITATION
  // ============================================================

  get precipitation(): number | null {

    return this.safeNumber(
      this.weather?.current?.precipitation
    );
  }


  get precipitationDisplay(): string {

    const value = this.precipitation;

    if (value === null) {

      return '--';
    }


    return value.toFixed(2);
  }


  // ============================================================
  // SNOWFALL
  // ============================================================

  get snowfall(): number | null {

    return this.safeNumber(
      this.weather?.current?.snowfall
    );
  }


  // ============================================================
  // VISIBILITY
  // ============================================================

  get visibility(): number | null {

    return this.safeNumber(
      this.weather?.current?.visibility
    );
  }


  // ============================================================
  // WEATHER CODE
  // ============================================================

  get weatherCode(): number | null {

    return this.safeNumber(
      this.weather?.current?.weather_code
    );
  }


  // ============================================================
  // WEATHER DESCRIPTION
  // ============================================================

  get weatherDescription(): string {

    const code = this.weatherCode;


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


    if (
      [51, 53, 55, 56, 57]
        .includes(code)
    ) {

      return 'DRIZZLE';
    }


    if (
      [61, 63, 65, 66, 67]
        .includes(code)
    ) {

      return 'RAIN';
    }


    if (
      [71, 73, 75, 77, 85, 86]
        .includes(code)
    ) {

      return 'SNOW';
    }


    if (
      [80, 81, 82]
        .includes(code)
    ) {

      return 'RAIN SHOWERS';
    }


    if (
      [95, 96, 99]
        .includes(code)
    ) {

      return 'THUNDERSTORM';
    }


    return 'UNKNOWN';
  }


  // ============================================================
  // WEATHER ICON
  // ============================================================

  get weatherIcon(): string {

    const code = this.weatherCode;


    if (code === null) {

      return '◌';
    }


    if (code === 0) {

      return '☀';
    }


    if ([1, 2, 3].includes(code)) {

      return '☁';
    }


    if ([45, 48].includes(code)) {

      return '≋';
    }


    if (
      [51, 53, 55, 56, 57].includes(code)
    ) {

      return '☂';
    }


    if (
      [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
    ) {

      return '☂';
    }


    if (
      [71, 73, 75, 77, 85, 86].includes(code)
    ) {

      return '❄';
    }


    if (
      [95, 96, 99].includes(code)
    ) {

      return 'ϟ';
    }


    return '◌';
  }


  // ============================================================
  // LAST UPDATE DISPLAY
  // ============================================================

  get lastUpdateDisplay(): string {

    if (!this.lastUpdate) {

      return 'WAITING FOR DATA';
    }


    const time =
      new Intl.DateTimeFormat(
        'en-IN',
        {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }
      ).format(this.lastUpdate);


    return `${time} IST`;
  }


  // ============================================================
  // OPEN-METEO TIMESTAMP
  // ============================================================

  get weatherSourceTime(): string {

    const value =
      this.weather?.current?.time;


    if (!value) {

      return '--';
    }


    return value;
  }


  // ============================================================
  // PROGRESS BARS
  // ============================================================

  getTemperatureWidth(): number {

    const value = this.temperature;

    if (value === null) {

      return 0;
    }


    /*
     * Antarctic visual scale:
     * -50°C = 0%
     * +10°C = 100%
     */

    const width =
      ((value + 50) / 60) * 100;


    return this.clamp(
      width,
      0,
      100
    );
  }


  getHumidityWidth(): number {

    const value = this.humidity;

    if (value === null) {

      return 0;
    }


    return this.clamp(
      value,
      0,
      100
    );
  }


  getWindWidth(): number {

    const value = this.windSpeed;

    if (value === null) {

      return 0;
    }


    /*
     * Visual scale:
     * 0–100 km/h
     */

    return this.clamp(
      (value / 100) * 100,
      0,
      100
    );
  }


  getCloudWidth(): number {

    const value = this.cloudCover;

    if (value === null) {

      return 0;
    }


    return this.clamp(
      value,
      0,
      100
    );
  }


  getPrecipitationWidth(): number {

    const value = this.precipitation;

    if (value === null) {

      return 0;
    }


    /*
     * 0–10 mm visual scale.
     */

    return this.clamp(
      (value / 10) * 100,
      0,
      100
    );
  }


  // ============================================================
  // SAFE NUMBER
  // ============================================================

  private safeNumber(
    value: number | null | undefined
  ): number | null {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {

      return null;
    }


    return Number(value);
  }


  // ============================================================
  // CLAMP
  // ============================================================

  private clamp(
    value: number,
    min: number,
    max: number
  ): number {

    return Math.min(
      Math.max(
        value,
        min
      ),
      max
    );
  }
}