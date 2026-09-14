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


@Component({

  selector: 'app-maitri',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './maitri.html',

  styleUrls: [
    './maitri.css'
  ]

})


export class Maitri
  implements OnInit, OnDestroy {


  // ==========================================================
  // STATION
  // ==========================================================

  readonly stationCode =
    'MAI-01';

  readonly stationName =
    'MAITRI';

  readonly location =
    'SCHIRMACHER OASIS';

  readonly region =
    'SCHIRMACHER OASIS';

  readonly elevation =
    '≈ 50 m';

  readonly latitudeText =
    "70°45.52'S";

  readonly longitudeText =
    "11°44.05'E";


  // ==========================================================
  // COORDINATES
  // ==========================================================

  readonly latitude =
    -70.76444;

  readonly longitude =
    11.73417;


  // ==========================================================
  // WEATHER
  // ==========================================================

  weather: WeatherData['current'] = {

    time: '',

    temperature_2m: null,

    apparent_temperature: null,

    relative_humidity_2m: null,

    wind_speed_10m: null,

    wind_direction_10m: null,

    precipitation: null,

    snowfall: null,

    visibility: null,

    cloud_cover: null,

    surface_pressure: null,

    weather_code: null

  };


  // ==========================================================
  // STATE
  // ==========================================================

  loading = true;

  error = '';

  lastWeatherUpdate:
    Date | null = null;


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

    private weatherService:
      WeatherService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // ==========================================================
  // INIT
  // ==========================================================

  ngOnInit(): void {

    this.updateClock();

    this.loadWeather();


    // --------------------------------------------------------
    // LIVE CLOCK
    // --------------------------------------------------------

    this.clockTimer =
      setInterval(

        () => {

          this.updateClock();

          this.cdr.detectChanges();

        },

        1000

      );


    // --------------------------------------------------------
    // WEATHER REFRESH
    // Open-Meteo data refreshed every 5 minutes
    // --------------------------------------------------------

    this.weatherTimer =
      setInterval(

        () => {

          this.loadWeather();

        },

        5 * 60 * 1000

      );

  }


  // ==========================================================
  // DESTROY
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
  // LOAD WEATHER
  // ==========================================================

  loadWeather(): void {

    this.loading = true;

    this.error = '';


    this.weatherService

      .getWeather(

        this.latitude,

        this.longitude

      )

      .subscribe({

        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        next:
          (
            data: WeatherData
          ) => {

            if (data && data.current) {

              this.weather =
                data.current;

            }


            this.loading =
              false;


            this.lastWeatherUpdate =
              new Date();


            this.cdr.detectChanges();

          },


        // ----------------------------------------------------
        // ERROR
        // ----------------------------------------------------

        error:
          (
            error
          ) => {

            console.error(
              'MAITRI Open-Meteo error:',
              error
            );


            this.loading =
              false;


            this.error =
              'Unable to retrieve live MAITRI weather data from Open-Meteo.';


            this.cdr.detectChanges();

          }

      });

  }


  // ==========================================================
  // RETRY WEATHER
  // ==========================================================

  retryWeather(): void {

    this.loadWeather();

  }


  // ==========================================================
  // CLOCK
  // ==========================================================

  private updateClock(): void {

    /*
     * Clock intentionally uses the browser clock.
     *
     * Display methods below convert the current time
     * into Indian Standard Time.
     */

  }


  // ==========================================================
  // CURRENT DATE
  // ==========================================================

  get currentDateDisplay(): string {

    return new Intl.DateTimeFormat(

      'en-IN',

      {

        timeZone:
          'Asia/Kolkata',

        year:
          'numeric',

        month:
          'short',

        day:
          '2-digit'

      }

    ).format(

      new Date()

    );

  }


  // ==========================================================
  // CURRENT TIME
  // ==========================================================

  get currentTimeDisplay(): string {

    return new Intl.DateTimeFormat(

      'en-IN',

      {

        timeZone:
          'Asia/Kolkata',

        hour:
          '2-digit',

        minute:
          '2-digit',

        second:
          '2-digit',

        hour12:
          false

      }

    ).format(

      new Date()

    );

  }


  // ==========================================================
  // WEATHER STATUS CLASS
  // ==========================================================

  get weatherStatusClass(): string {

    if (this.loading) {

      return 'status-updating';

    }


    if (this.error) {

      return 'status-offline';

    }


    return 'status-live';

  }


  // ==========================================================
  // WEATHER STATUS TEXT
  // ==========================================================

  get weatherStatusText(): string {

    if (this.loading) {

      return 'UPDATING';

    }


    if (this.error) {

      return 'OFFLINE';

    }


    return 'LIVE · OPEN-METEO';

  }


  // ==========================================================
  // WEATHER DESCRIPTION
  // ==========================================================

  get weatherDescription(): string {

    return this.getWeatherDescription(

      this.weather.weather_code

    );

  }


  getWeatherDescription(

    code:
      number | null

  ): string {

    if (code === null) {

      return 'NO DATA';

    }


    // --------------------------------------------------------
    // Clear
    // --------------------------------------------------------

    if (code === 0) {

      return 'CLEAR SKY';

    }


    // --------------------------------------------------------
    // Cloudy
    // --------------------------------------------------------

    if (

      [1, 2, 3].includes(code)

    ) {

      return 'CLOUDY';

    }


    // --------------------------------------------------------
    // Fog
    // --------------------------------------------------------

    if (

      [45, 48].includes(code)

    ) {

      return 'FOG';

    }


    // --------------------------------------------------------
    // Drizzle
    // --------------------------------------------------------

    if (

      [

        51,
        53,
        55,
        56,
        57

      ].includes(code)

    ) {

      return 'DRIZZLE';

    }


    // --------------------------------------------------------
    // Rain
    // --------------------------------------------------------

    if (

      [

        61,
        63,
        65,
        66,
        67

      ].includes(code)

    ) {

      return 'RAIN';

    }


    // --------------------------------------------------------
    // Snow
    // --------------------------------------------------------

    if (

      [

        71,
        73,
        75,
        77,
        85,
        86

      ].includes(code)

    ) {

      return 'SNOW';

    }


    // --------------------------------------------------------
    // Rain showers
    // --------------------------------------------------------

    if (

      [

        80,
        81,
        82

      ].includes(code)

    ) {

      return 'RAIN SHOWERS';

    }


    // --------------------------------------------------------
    // Thunderstorm
    // --------------------------------------------------------

    if (

      [

        95,
        96,
        99

      ].includes(code)

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
      this.weather.weather_code;


    if (code === null) {

      return '—';

    }


    // Clear

    if (code === 0) {

      return '☼';

    }


    // Cloud

    if (

      [1, 2, 3].includes(code)

    ) {

      return '☁';

    }


    // Fog

    if (

      [45, 48].includes(code)

    ) {

      return '≋';

    }


    // Rain / drizzle / showers

    if (

      [

        51,
        53,
        55,
        56,
        57,

        61,
        63,
        65,
        66,
        67,

        80,
        81,
        82

      ].includes(code)

    ) {

      return '雨';

    }


    // Snow

    if (

      [

        71,
        73,
        75,
        77,
        85,
        86

      ].includes(code)

    ) {

      return '❄';

    }


    // Thunderstorm

    if (

      [

        95,
        96,
        99

      ].includes(code)

    ) {

      return 'ϟ';

    }


    return '•';

  }


  // ==========================================================
  // TEMPERATURE
  // ==========================================================

  get temperatureDisplay(): string {

    return this.format(

      this.weather.temperature_2m,

      1

    ) + '°C';

  }


  // ==========================================================
  // FEELS LIKE
  // ==========================================================

  get feelsLikeDisplay(): string {

    return this.format(

      this.weather.apparent_temperature,

      1

    ) + '°C';

  }


  // ==========================================================
  // TEMPERATURE BAR
  // ==========================================================

  getTemperatureWidth(): number {

    const value =
      this.weather.temperature_2m;


    if (value === null) {

      return 0;

    }


    /*
     * Visual Antarctic temperature scale:
     *
     * -50°C = 0%
     * +10°C = 100%
     */

    return Math.max(

      0,

      Math.min(

        100,

        ((value + 50) / 60) * 100

      )

    );

  }


  // ==========================================================
  // WIND
  // ==========================================================

  get windDisplay(): string {

    return this.format(

      this.weather.wind_speed_10m,

      1

    );

  }


  // ==========================================================
  // WIND DIRECTION
  // ==========================================================

  get windDirectionText(): string {

    return this.getWindDirection(

      this.weather.wind_direction_10m

    );

  }


  // ==========================================================
  // WIND DEGREES
  // ==========================================================

  get windDegreesDisplay(): string {

    if (

      this.weather.wind_direction_10m === null

    ) {

      return '--°';

    }


    return this.format(

      this.weather.wind_direction_10m,

      0

    ) + '°';

  }


  // ==========================================================
  // WIND ROTATION
  // ==========================================================

  get windRotation(): number {

    return (

      this.weather.wind_direction_10m ?? 0

    );

  }


  // ==========================================================
  // WIND DIRECTION CONVERTER
  // ==========================================================

  getWindDirection(

    degrees:
      number | null

  ): string {

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


    return directions[

      Math.round(
        degrees / 45
      ) % 8

    ];

  }


  // ==========================================================
  // WIND BAR
  // ==========================================================

  getWindWidth(): number {

    const value =
      this.weather.wind_speed_10m;


    if (value === null) {

      return 0;

    }


    /*
     * 0–80 km/h visual scale
     */

    return Math.max(

      0,

      Math.min(

        100,

        (value / 80) * 100

      )

    );

  }


  // ==========================================================
  // HUMIDITY
  // ==========================================================

  get humidityDisplay(): string {

    return this.format(

      this.weather.relative_humidity_2m,

      0

    ) + '%';

  }


  // ==========================================================
  // HUMIDITY BAR
  // ==========================================================

  getHumidityWidth(): number {

    const value =
      this.weather.relative_humidity_2m;


    if (value === null) {

      return 0;

    }


    return Math.max(

      0,

      Math.min(

        100,

        value

      )

    );

  }


  // ==========================================================
  // PRESSURE
  // ==========================================================

  get pressureDisplay(): string {

    return this.format(

      this.weather.surface_pressure,

      0

    );

  }


  // ==========================================================
  // CLOUD COVER
  // ==========================================================

  get cloudCoverDisplay(): string {

    return this.format(

      this.weather.cloud_cover,

      0

    ) + '%';

  }


  // ==========================================================
  // CLOUD COVER BAR
  // ==========================================================

  getCloudWidth(): number {

    const value =
      this.weather.cloud_cover;


    if (value === null) {

      return 0;

    }


    return Math.max(

      0,

      Math.min(

        100,

        value

      )

    );

  }


  // ==========================================================
  // PRECIPITATION
  // ==========================================================

  get precipitationDisplay(): string {

    return this.format(

      this.weather.precipitation,

      2

    );

  }


  // ==========================================================
  // PRECIPITATION BAR
  // ==========================================================

  getPrecipitationWidth(): number {

    const value =
      this.weather.precipitation;


    if (value === null) {

      return 0;

    }


    /*
     * 0–10 mm visual scale.
     */

    return Math.max(

      0,

      Math.min(

        100,

        (value / 10) * 100

      )

    );

  }


  // ==========================================================
  // SNOWFALL
  // ==========================================================

  formatSnowfall(): string {

    return this.format(

      this.weather.snowfall,

      2

    );

  }


  // ==========================================================
  // VISIBILITY
  // ==========================================================

  get visibilityDisplay(): string {

    return this.format(

      this.weather.visibility,

      0

    );

  }


  // ==========================================================
  // WEATHER API TIME
  // ==========================================================

  get weatherApiTimeDisplay(): string {

    if (!this.weather.time) {

      return '--';

    }


    return this.weather.time;

  }


  // ==========================================================
  // LAST UPDATE
  // ==========================================================

  get lastUpdateDisplay(): string {

    if (

      !this.lastWeatherUpdate

    ) {

      return '--:--:-- IST';

    }


    const time =

      new Intl.DateTimeFormat(

        'en-IN',

        {

          timeZone:
            'Asia/Kolkata',

          hour:
            '2-digit',

          minute:
            '2-digit',

          second:
            '2-digit',

          hour12:
            false

        }

      ).format(

        this.lastWeatherUpdate

      );


    return `${time} IST`;

  }


  // ==========================================================
  // NUMBER FORMAT
  // ==========================================================

  private format(

    value:
      number | null,

    decimals =
      1

  ): string {

    if (

      value === null ||

      value === undefined ||

      Number.isNaN(value)

    ) {

      return '--';

    }


    return Number(value)

      .toFixed(decimals);

  }

}