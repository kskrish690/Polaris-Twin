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

  weatherCode: number | null;

  cloudCover: number | null;

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
  // CURRENT TIME
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

    // --------------------------------------------------------
    // MAITRI
    // --------------------------------------------------------

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

      weatherCode: null,

      cloudCover: null,

      status: 'CONNECTING'

    },


    // --------------------------------------------------------
    // BHARATI
    // --------------------------------------------------------

    {

      name: 'BHARATI',

      code: 'BHA',

      latitude: -69.40683,

      longitude: 76.19533,

      temperature: null,

      feelsLike: null,

      humidity: null,

      windSpeed: null,

      windDirection: null,

      pressure: null,

      precipitation: null,

      weatherCode: null,

      cloudCover: null,

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
  // COMPONENT INIT
  // ==========================================================

  ngOnInit(): void {


    // --------------------------------------------------------
    // Start India clock
    // --------------------------------------------------------

    this.updateClock();


    this.clockTimer =
      setInterval(() => {

        this.updateClock();

        this.cdr.detectChanges();

      }, 1000);


    // --------------------------------------------------------
    // Load weather immediately
    // --------------------------------------------------------

    this.loadWeather();


    // --------------------------------------------------------
    // Refresh weather every 5 minutes
    // --------------------------------------------------------

    this.weatherTimer =
      setInterval(() => {

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
  // UPDATE CLOCK
  // ==========================================================

  private updateClock(): void {

    this.currentTime =
      new Date();

  }


  // ==========================================================
  // LOAD LIVE WEATHER
  // ==========================================================

  loadWeather(): void {


    this.loading = true;

    this.error = '';


    // Update UI immediately

    this.cdr.detectChanges();


    let completed = 0;


    // --------------------------------------------------------
    // Set stations to updating
    // --------------------------------------------------------

    this.stations.forEach(
      station => {

        station.status =
          'UPDATING';

      }
    );


    this.cdr.detectChanges();


    // --------------------------------------------------------
    // Request weather for every station
    // --------------------------------------------------------

    this.stations.forEach(
      station => {


        console.log(
          `Loading weather for ${station.name}...`
        );


        this.weatherService

          .getWeather(

            station.latitude,

            station.longitude

          )

          .subscribe({

            // =================================================
            // SUCCESS
            // =================================================

            next: (
              data: WeatherData
            ) => {


              console.log(
                `${station.name} WEATHER DATA:`,
                data
              );


              // Update station

              this.applyWeatherData(
                station,
                data
              );


              station.status =
                'LIVE';


              completed++;


              // ------------------------------------------------
              // All stations finished
              // ------------------------------------------------

              if (
                completed ===
                this.stations.length
              ) {

                this.loading =
                  false;

                this.lastWeatherUpdate =
                  new Date();

              }


              // ------------------------------------------------
              // IMPORTANT:
              // Force Angular UI refresh
              // ------------------------------------------------

              this.cdr.detectChanges();


              console.log(
                `${station.name} updated successfully`,
                station
              );

            },


            // =================================================
            // ERROR
            // =================================================

            error: (
              error
            ) => {


              console.error(

                `${station.name} WEATHER API ERROR:`,

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


                const liveCount =
                  this.operationalStations;


                if (
                  liveCount === 0
                ) {

                  this.error =
                    'Unable to retrieve live weather data. Check your internet connection or API connection.';

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
  // APPLY WEATHER DATA
  // ==========================================================

  private applyWeatherData(

    station: Station,

    data: WeatherData

  ): void {


    // --------------------------------------------------------
    // Validate response
    // --------------------------------------------------------

    if (
      !data ||
      !data.current
    ) {


      console.error(

        `Invalid weather response for ${station.name}`,

        data

      );


      station.status =
        'OFFLINE';


      return;

    }


    const current =
      data.current;


    // --------------------------------------------------------
    // Temperature
    // --------------------------------------------------------

    station.temperature =
      this.safeNumber(
        current.temperature_2m
      );


    // --------------------------------------------------------
    // Feels like
    // --------------------------------------------------------

    station.feelsLike =
      this.safeNumber(
        current.apparent_temperature
      );


    // --------------------------------------------------------
    // Humidity
    // --------------------------------------------------------

    station.humidity =
      this.safeNumber(
        current.relative_humidity_2m
      );


    // --------------------------------------------------------
    // Wind speed
    // --------------------------------------------------------

    station.windSpeed =
      this.safeNumber(
        current.wind_speed_10m
      );


    // --------------------------------------------------------
    // Wind direction
    // --------------------------------------------------------

    station.windDirection =
      this.safeNumber(
        current.wind_direction_10m
      );


    // --------------------------------------------------------
    // Pressure
    // --------------------------------------------------------

    station.pressure =
      this.safeNumber(
        current.surface_pressure
      );


    // --------------------------------------------------------
    // Precipitation
    // --------------------------------------------------------

    station.precipitation =
      this.safeNumber(
        current.precipitation
      );


    // --------------------------------------------------------
    // Weather code
    // --------------------------------------------------------

    station.weatherCode =
      this.safeNumber(
        current.weather_code
      );


    // --------------------------------------------------------
    // Cloud cover
    // --------------------------------------------------------

    station.cloudCover =
      this.safeNumber(
        current.cloud_cover
      );


    // --------------------------------------------------------
    // Mark live
    // --------------------------------------------------------

    station.status =
      'LIVE';


    console.log(

      `${station.name} VALUES UPDATED:`,

      {

        temperature:
          station.temperature,

        feelsLike:
          station.feelsLike,

        humidity:
          station.humidity,

        wind:
          station.windSpeed,

        windDirection:
          station.windDirection,

        pressure:
          station.pressure,

        precipitation:
          station.precipitation,

        weatherCode:
          station.weatherCode,

        cloudCover:
          station.cloudCover

      }

    );

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
  // REPORTING PERCENTAGE
  // ==========================================================

  get reportingPercentage(): number {


    if (
      this.stations.length === 0
    ) {

      return 0;

    }


    return Math.round(

      (

        this.operationalStations /

        this.stations.length

      ) * 100

    );

  }


  // ==========================================================
  // AVERAGE TEMPERATURE
  // ==========================================================

  get averageTemperature():
    number | null {


    const values =

      this.stations

        .map(
          station =>
            station.temperature
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


    return (

      values.reduce(

        (
          total,
          value
        ) =>

          total + value,

        0

      ) /

      values.length

    );

  }


  // ==========================================================
  // AVERAGE WIND
  // ==========================================================

  get averageWindSpeed():
    number | null {


    const values =

      this.stations

        .map(
          station =>
            station.windSpeed
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


    return (

      values.reduce(

        (
          total,
          value
        ) =>

          total + value,

        0

      ) /

      values.length

    );

  }


  // ==========================================================
  // AVERAGE PRESSURE
  // ==========================================================

  get averagePressure():
    number | null {


    const values =

      this.stations

        .map(
          station =>
            station.pressure
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


    return (

      values.reduce(

        (
          total,
          value
        ) =>

          total + value,

        0

      ) /

      values.length

    );

  }


  // ==========================================================
  // AVERAGE HUMIDITY
  // ==========================================================

  get averageHumidity():
    number | null {


    const values =

      this.stations

        .map(
          station =>
            station.humidity
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


    return (

      values.reduce(

        (
          total,
          value
        ) =>

          total + value,

        0

      ) /

      values.length

    );

  }


  // ==========================================================
  // AVERAGE CLOUD COVER
  // ==========================================================

  get averageCloudCover():
    number | null {


    const values =

      this.stations

        .map(
          station =>
            station.cloudCover
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


    return (

      values.reduce(

        (
          total,
          value
        ) =>

          total + value,

        0

      ) /

      values.length

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
  // INDIA DATE
  //
  // YYYY-MM-DD
  //
  // Example:
  // 2026-09-14
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


    return (
      `${year}-${month}-${day}`
    );

  }


  // ==========================================================
  // INDIA TIME
  //
  // HH:MM:SS
  //
  // Example:
  // 18:34:25
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
  // LAST UPDATE — INDIA TIME
  //
  // Example:
  // 18:34:25 IST
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

    code:
      number | null

  ): string {


    if (
      code === null
    ) {

      return 'NO DATA';

    }


    // Clear sky

    if (
      code === 0
    ) {

      return 'CLEAR SKY';

    }


    // Mainly clear / partly cloudy / overcast

    if (
      [1, 2, 3].includes(code)
    ) {

      return 'CLOUDY';

    }


    // Fog

    if (
      [45, 48].includes(code)
    ) {

      return 'FOG';

    }


    // Drizzle

    if (
      [51, 53, 55, 56, 57]
        .includes(code)
    ) {

      return 'DRIZZLE';

    }


    // Rain

    if (
      [61, 63, 65, 66, 67]
        .includes(code)
    ) {

      return 'RAIN';

    }


    // Snow

    if (
      [71, 73, 75, 77, 85, 86]
        .includes(code)
    ) {

      return 'SNOW';

    }


    // Rain showers

    if (
      [80, 81, 82]
        .includes(code)
    ) {

      return 'RAIN SHOWERS';

    }


    // Thunderstorm

    if (
      [95, 96, 99]
        .includes(code)
    ) {

      return 'THUNDERSTORM';

    }


    return 'UNKNOWN';

  }


  // ==========================================================
  // SHORT WEATHER DESCRIPTION
  // ==========================================================

  getWeatherShortDescription(

    code:
      number | null

  ): string {


    if (
      code === null
    ) {

      return '--';

    }


    if (
      code === 0
    ) {

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

    degrees:
      number | null

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

    station:
      Station

  ): string {


    if (
      station.windSpeed === null
    ) {

      return '-- km/h';

    }


    return (

      this.formatNumber(

        station.windSpeed,

        1

      ) +

      ' km/h ' +

      this.getWindDirection(

        station.windDirection

      )

    );

  }


  // ==========================================================
  // TEMPERATURE DISPLAY
  // ==========================================================

  getTemperatureDisplay(

    temperature:
      number | null

  ): string {


    if (
      temperature === null
    ) {

      return '-- °C';

    }


    return (

      this.formatNumber(

        temperature,

        1

      ) +

      ' °C'

    );

  }


  // ==========================================================
  // HUMIDITY DISPLAY
  // ==========================================================

  getHumidityDisplay(

    humidity:
      number | null

  ): string {


    if (
      humidity === null
    ) {

      return '--%';

    }


    return (

      this.formatNumber(

        humidity,

        0

      ) +

      '%'

    );

  }


  // ==========================================================
  // PRESSURE DISPLAY
  // ==========================================================

  getPressureDisplay(

    pressure:
      number | null

  ): string {


    if (
      pressure === null
    ) {

      return '-- hPa';

    }


    return (

      this.formatNumber(

        pressure,

        0

      ) +

      ' hPa'

    );

  }


  // ==========================================================
  // NUMBER FORMATTER
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
  // STATUS CLASS
  // ==========================================================

  getStatusClass(

    station:
      Station

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


  // ==========================================================
  // STATUS TEXT
  // ==========================================================

  getStatusText(

    station:
      Station

  ): string {


    switch (
      station.status
    ) {


      case 'LIVE':

        return 'LIVE';


      case 'UPDATING':

        return 'UPDATING';


      case 'OFFLINE':

        return 'OFFLINE';


      default:

        return 'CONNECTING';

    }

  }


  // ==========================================================
  // RETRY WEATHER
  // ==========================================================

  retryWeather(): void {

    this.loadWeather();

  }

}