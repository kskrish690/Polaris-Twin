import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  WeatherService,
  WeatherData
} from '../../services/weather';


// ============================================================
// STATION INTERFACE
// ============================================================

interface Station {

  name: string;

  code: string;

  latitude: number;

  longitude: number;

  temperature: number | null;

  feelsLike: number | null;

  humidity: number | null;

  windSpeed: number | null;

  windDirection: number | null;

  pressure: number | null;

  precipitation: number | null;

  snowfall: number | null;

  visibility: number | null;

  weatherCode: number | null;

  cloudCover: number | null;

  apiTime: string | null;

  status:
    | 'CONNECTING'
    | 'UPDATING'
    | 'LIVE'
    | 'OFFLINE';

}


// ============================================================
// COMPONENT
// ============================================================

@Component({

  selector: 'app-overview',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './overview.html',

  styleUrls: [
    './overview.css'
  ]

})


export class Overview
  implements OnInit, OnDestroy {


  // ==========================================================
  // CLOCK
  // ==========================================================

  currentTime = new Date();


  // ==========================================================
  // PAGE STATE
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
  // STATIONS
  // ==========================================================

  stations: Station[] = [

    // ========================================================
    // MAITRI
    // ========================================================

    {

      name: 'MAITRI',

      code: 'MAI',

      latitude: -70.76444,

      longitude: 11.73417,

      temperature: null,

      feelsLike: null,

      humidity: null,

      windSpeed: null,

      windDirection: null,

      pressure: null,

      precipitation: null,

      snowfall: null,

      visibility: null,

      weatherCode: null,

      cloudCover: null,

      apiTime: null,

      status: 'CONNECTING'

    },


    // ========================================================
    // BHARATI
    // ========================================================

    {

      name: 'BHARATI',

      code: 'BHA',

      latitude: -69.406833,

      longitude: 76.195333,

      temperature: null,

      feelsLike: null,

      humidity: null,

      windSpeed: null,

      windDirection: null,

      pressure: null,

      precipitation: null,

      snowfall: null,

      visibility: null,

      weatherCode: null,

      cloudCover: null,

      apiTime: null,

      status: 'CONNECTING'

    }

  ];


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


    // --------------------------------------------------------
    // India clock
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
    // First API request
    // --------------------------------------------------------

    this.loadWeather();


    // --------------------------------------------------------
    // Open-Meteo refresh
    // Every 5 minutes
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
  // CLOCK
  // ==========================================================

  private updateClock(): void {

    this.currentTime =
      new Date();

  }


  // ==========================================================
  // LOAD WEATHER
  // ==========================================================

  loadWeather(): void {

    this.loading = true;

    this.error = '';


    this.stations.forEach(
      station => {

        station.status =
          'UPDATING';

      }
    );


    this.cdr.detectChanges();


    let completed = 0;


    // --------------------------------------------------------
    // Request both stations
    // --------------------------------------------------------

    this.stations.forEach(
      station => {

        this.weatherService

          .getWeather(
            station.latitude,
            station.longitude
          )

          .subscribe({

            next:
              (
                data: WeatherData
              ) => {

                this.applyWeatherData(
                  station,
                  data
                );


                station.status =
                  'LIVE';


                completed++;


                if (
                  completed ===
                  this.stations.length
                ) {

                  this.loading =
                    false;

                  this.lastWeatherUpdate =
                    new Date();

                }


                this.cdr.detectChanges();

              },


            error:
              (
                error
              ) => {

                console.error(
                  `${station.name} weather error:`,
                  error
                );


                station.status =
                  'OFFLINE';


                completed++;


                if (
                  completed ===
                  this.stations.length
                ) {

                  this.loading =
                    false;

                  this.lastWeatherUpdate =
                    new Date();


                  const live =
                    this.operationalStations;


                  if (live === 0) {

                    this.error =
                      'Unable to retrieve live weather data from Open-Meteo. Check your internet connection.';

                  }

                  else {

                    this.error =
                      'Some station weather data could not be retrieved.';

                  }

                }


                this.cdr.detectChanges();

              }

          });

      }
    );

  }


  // ==========================================================
  // APPLY OPEN-METEO DATA
  // ==========================================================

  private applyWeatherData(

    station: Station,

    data: WeatherData

  ): void {

    if (
      !data ||
      !data.current
    ) {

      station.status =
        'OFFLINE';

      return;

    }


    const current =
      data.current;


    station.temperature =
      this.safeNumber(
        current.temperature_2m
      );


    station.feelsLike =
      this.safeNumber(
        current.apparent_temperature
      );


    station.humidity =
      this.safeNumber(
        current.relative_humidity_2m
      );


    station.windSpeed =
      this.safeNumber(
        current.wind_speed_10m
      );


    station.windDirection =
      this.safeNumber(
        current.wind_direction_10m
      );


    station.pressure =
      this.safeNumber(
        current.surface_pressure
      );


    station.precipitation =
      this.safeNumber(
        current.precipitation
      );


    station.snowfall =
      this.safeNumber(
        current.snowfall
      );


    station.visibility =
      this.safeNumber(
        current.visibility
      );


    station.weatherCode =
      this.safeNumber(
        current.weather_code
      );


    station.cloudCover =
      this.safeNumber(
        current.cloud_cover
      );


    station.apiTime =
      current.time ?? null;


    station.status =
      'LIVE';

  }


  // ==========================================================
  // SAFE NUMBER
  // ==========================================================

  private safeNumber(

    value:
      number |
      null |
      undefined

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
  // MAITRI
  // ==========================================================

  get maitri(): Station {

    return this.stations[0];

  }


  // ==========================================================
  // BHARATI
  // ==========================================================

  get bharati(): Station {

    return this.stations[1];

  }


  // ==========================================================
  // OPERATIONAL STATIONS
  // ==========================================================

  get operationalStations(): number {

    return this.stations.filter(
      station =>
        station.status === 'LIVE'
    ).length;

  }


  // ==========================================================
  // AVERAGE TEMPERATURE
  // ==========================================================

  get averageTemperature():
    number | null {

    return this.average(
      this.stations.map(
        station =>
          station.temperature
      )
    );

  }


  // ==========================================================
  // AVERAGE WIND
  // ==========================================================

  get averageWindSpeed():
    number | null {

    return this.average(
      this.stations.map(
        station =>
          station.windSpeed
      )
    );

  }


  // ==========================================================
  // AVERAGE PRESSURE
  // ==========================================================

  get averagePressure():
    number | null {

    return this.average(
      this.stations.map(
        station =>
          station.pressure
      )
    );

  }


  // ==========================================================
  // AVERAGE HUMIDITY
  // ==========================================================

  get averageHumidity():
    number | null {

    return this.average(
      this.stations.map(
        station =>
          station.humidity
      )
    );

  }


  // ==========================================================
  // AVERAGE CLOUD COVER
  // ==========================================================

  get averageCloudCover():
    number | null {

    return this.average(
      this.stations.map(
        station =>
          station.cloudCover
      )
    );

  }


  // ==========================================================
  // TOTAL PRECIPITATION
  // ==========================================================

  get totalPrecipitation():
    number | null {

    const values =
      this.stations
        .map(
          station =>
            station.precipitation
        )
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );


    if (
      values.length === 0
    ) {

      return null;

    }


    return values.reduce(
      (
        total,
        value
      ) =>
        total + value,
      0
    );

  }


  // ==========================================================
  // GENERIC AVERAGE
  // ==========================================================

  private average(

    values:
      Array<number | null>

  ): number | null {

    const valid =
      values.filter(
        (
          value
        ): value is number =>
          value !== null
      );


    if (
      valid.length === 0
    ) {

      return null;

    }


    return (
      valid.reduce(
        (
          total,
          value
        ) =>
          total + value,
        0
      ) /
      valid.length
    );

  }


  // ==========================================================
  // FORMATTED DATE
  // ==========================================================

  get formattedDate(): string {

    const parts =
      new Intl.DateTimeFormat(
        'en-CA',
        {

          timeZone:
            'Asia/Kolkata',

          year:
            'numeric',

          month:
            '2-digit',

          day:
            '2-digit'

        }
      ).formatToParts(
        new Date()
      );


    const year =
      parts.find(
        p =>
          p.type === 'year'
      )?.value ?? '----';


    const month =
      parts.find(
        p =>
          p.type === 'month'
      )?.value ?? '--';


    const day =
      parts.find(
        p =>
          p.type === 'day'
      )?.value ?? '--';


    return `${year}-${month}-${day}`;

  }


  // ==========================================================
  // FORMATTED TIME
  // ==========================================================

  get formattedTime(): string {

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
  // LAST WEATHER UPDATE
  // ==========================================================

  get formattedLastUpdate(): string {

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
  // WEATHER DESCRIPTION
  // ==========================================================

  getWeatherDescription(
    code: number | null
  ): string {

    if (
      code === null
    ) {

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


  // ==========================================================
  // SHORT DESCRIPTION
  // ==========================================================

  getWeatherShortDescription(
    code: number | null
  ): string {

    if (
      code === null
    ) {

      return '--';

    }


    if (code === 0) {

      return 'Clear';

    }


    if (
      [1, 2, 3].includes(code)
    ) {

      return 'Cloudy';

    }


    if (
      [45, 48].includes(code)
    ) {

      return 'Fog';

    }


    if (
      [51, 53, 55, 56, 57]
        .includes(code)
    ) {

      return 'Drizzle';

    }


    if (
      [61, 63, 65, 66, 67]
        .includes(code)
    ) {

      return 'Rain';

    }


    if (
      [71, 73, 75, 77, 85, 86]
        .includes(code)
    ) {

      return 'Snow';

    }


    if (
      [80, 81, 82]
        .includes(code)
    ) {

      return 'Showers';

    }


    if (
      [95, 96, 99]
        .includes(code)
    ) {

      return 'Storm';

    }


    return 'Unknown';

  }


  // ==========================================================
  // WIND DIRECTION
  // ==========================================================

  getWindDirection(
    degrees: number | null
  ): string {

    if (
      degrees === null
    ) {

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
  // WIND DISPLAY
  // ==========================================================

  getWindDisplay(
    station: Station
  ): string {

    if (
      station.windSpeed === null
    ) {

      return '--';

    }


    return this.formatNumber(
      station.windSpeed,
      1
    );

  }


  // ==========================================================
  // TEMPERATURE DISPLAY
  // ==========================================================

  getTemperatureDisplay(
    temperature: number | null
  ): string {

    if (
      temperature === null
    ) {

      return '--';

    }


    return this.formatNumber(
      temperature,
      1
    );

  }


  // ==========================================================
  // HUMIDITY DISPLAY
  // ==========================================================

  getHumidityDisplay(
    humidity: number | null
  ): string {

    if (
      humidity === null
    ) {

      return '--';

    }


    return this.formatNumber(
      humidity,
      0
    ) + '%';

  }


  // ==========================================================
  // PRESSURE DISPLAY
  // ==========================================================

  getPressureDisplay(
    pressure: number | null
  ): string {

    if (
      pressure === null
    ) {

      return '--';

    }


    return this.formatNumber(
      pressure,
      0
    );

  }


  // ==========================================================
  // NUMBER FORMAT
  // ==========================================================

  formatNumber(

    value:
      number | null,

    decimals = 1

  ): string {

    if (
      value === null ||
      value === undefined
    ) {

      return '--';

    }


    return Number(value)
      .toFixed(decimals);

  }


  // ==========================================================
  // WIND DIRECTION TEXT
  // ==========================================================

  getWindDirectionText(
    station: Station
  ): string {

    return this.getWindDirection(
      station.windDirection
    );

  }


  // ==========================================================
  // WIND DEGREES
  // ==========================================================

  getWindDegreesDisplay(
    station: Station
  ): string {

    if (
      station.windDirection === null
    ) {

      return '--°';

    }


    return `${this.formatNumber(
      station.windDirection,
      0
    )}°`;

  }


  // ==========================================================
  // WEATHER STATUS
  // ==========================================================

  getStatusClass(
    station: Station
  ): string {

    switch (
      station.status
    ) {

      case 'LIVE':
        return 'status-live';

      case 'UPDATING':
        return 'status-updating';

      case 'OFFLINE':
        return 'status-offline';

      default:
        return 'status-connecting';

    }

  }


  getStatusText(
    station: Station
  ): string {

    return station.status;

  }


  // ==========================================================
  // RETRY
  // ==========================================================

  retryWeather(): void {

    this.loadWeather();

  }

}