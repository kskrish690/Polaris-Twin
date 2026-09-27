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


interface HistoricalEvent {

  year: string;

  title: string;

  description: string;

  category: string;

  source: string;

}


interface PersonnelOverview {

  activePersonnel: number;

  security: number;

  scientists: number;

  researchers: number;

  administration: number;

  engineering: number;

  medical: number;

  logistics: number;

  communications: number;

  support: number;

}


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
  // PERSONNEL OVERVIEW
  // ==========================================================

  readonly personnelOverview: PersonnelOverview = {

    activePersonnel: 42,

    security: 4,

    scientists: 10,

    researchers: 8,

    administration: 3,

    engineering: 6,

    medical: 2,

    logistics: 4,

    communications: 2,

    support: 3

  };


  // ==========================================================
  // TOTAL PERSONNEL
  // ==========================================================

  get totalPersonnel(): number {

    return this.personnelOverview.activePersonnel;

  }


  // ==========================================================
  // HISTORICAL EVENTS
  // ==========================================================

  readonly historicalEvents:
    HistoricalEvent[] = [

    {

      year: '1988',

      title:
        'Schirmacher Oasis Site Selected',

      description:
        'An ice-free rocky area of the Schirmacher Oasis was selected for India’s second Antarctic research station.',

      category:
        'ESTABLISHMENT',

      source:
        'NCPOR'

    },


    {

      year: '1989',

      title:
        'MAITRI Research Station Established',

      description:
        'Maitri was established at the Schirmacher Oasis as India’s second permanent Antarctic research station.',

      category:
        'STATION MILESTONE',

      source:
        'NCPOR · MoES'

    },


    {

      year: '1990',

      title:
        'Dakshin Gangotri Decommissioned',

      description:
        'India’s first Antarctic station, Dakshin Gangotri, was decommissioned after being affected by accumulating ice. Maitri became the continuing permanent research base.',

      category:
        'OPERATIONAL TRANSITION',

      source:
        'NCPOR'

    },


    {

      year: '1999–2000',

      title:
        'Expanded Scientific Operations',

      description:
        'Maitri supported multidisciplinary Antarctic research including atmospheric, geological, biological, environmental, medical, engineering and communication sciences.',

      category:
        'SCIENTIFIC RESEARCH',

      source:
        'MoES'

    },


    {

      year: '2008',

      title:
        'Dedicated Satellite Communication Facility',

      description:
        'A dedicated satellite communication facility was established to provide continuous voice, video and data connectivity between Maitri and mainland India.',

      category:
        'COMMUNICATIONS',

      source:
        'NCPOR'

    },


    {

      year: '2010',

      title:
        'South Pole Expedition',

      description:
        'An eight-member Indian team departed from Maitri for the South Pole. The expedition covered approximately 2,300 km and reached the South Pole on 21 November 2010.',

      category:
        'POLAR EXPEDITION',

      source:
        'NCPOR'

    },


    {

      year: '2010',

      title:
        'Return From South Pole',

      description:
        'The expedition team returned to Maitri on 1 December 2010 with scientific observations and operational experience for future inland Antarctic traverses.',

      category:
        'EXPEDITION MILESTONE',

      source:
        'NCPOR'

    },


    {

      year: '2011–12',

      title:
        'Indian Antarctic Research Network Expanded',

      description:
        'India expanded its permanent Antarctic research infrastructure with Bharati, complementing the long-running scientific operations at Maitri.',

      category:
        'NATIONAL NETWORK',

      source:
        'NCPOR'

    },


    {

      year: 'PRESENT',

      title:
        'Continuing Year-Round Research',

      description:
        'Maitri continues to support Indian Antarctic research and station operations across multiple scientific and technical disciplines.',

      category:
        'ONGOING OPERATIONS',

      source:
        'NCPOR'

    }

  ];


  // ==========================================================
  // WEATHER
  // ==========================================================

  weather:
    WeatherData['current'] = {

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


    this.clockTimer =
      setInterval(

        () => {

          this.updateClock();

          this.cdr.detectChanges();

        },

        1000

      );


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

        next:
          (
            data: WeatherData
          ) => {

            if (
              data &&
              data.current
            ) {

              this.weather =
                data.current;

            }


            this.loading =
              false;

            this.lastWeatherUpdate =
              new Date();

            this.cdr.detectChanges();

          },


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
  // RETRY
  // ==========================================================

  retryWeather(): void {

    this.loadWeather();

  }


  // ==========================================================
  // CLOCK
  // ==========================================================

  private updateClock(): void {

    // Display values are generated by the getters.

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
  // WEATHER STATUS
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
      this.weather.weather_code;


    if (code === null) {

      return '—';

    }


    if (code === 0) {

      return '☼';

    }


    if ([1, 2, 3].includes(code)) {

      return '☁';

    }


    if ([45, 48].includes(code)) {

      return '≋';

    }


    if (
      [
        51, 53, 55, 56, 57,
        61, 63, 65, 66, 67,
        80, 81, 82
      ].includes(code)
    ) {

      return '雨';

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


  get feelsLikeDisplay(): string {

    return this.format(
      this.weather.apparent_temperature,
      1
    ) + '°C';

  }


  getTemperatureWidth(): number {

    const value =
      this.weather.temperature_2m;


    if (value === null) {

      return 0;

    }


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


  get windDirectionText(): string {

    return this.getWindDirection(

      this.weather.wind_direction_10m

    );

  }


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


  get windRotation(): number {

    return (
      this.weather.wind_direction_10m ?? 0
    );

  }


  getWindDirection(
    degrees: number | null
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
      Math.round(degrees / 45) % 8
    ];

  }


  getWindWidth(): number {

    const value =
      this.weather.wind_speed_10m;


    if (value === null) {

      return 0;

    }


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


  getHumidityWidth(): number {

    const value =
      this.weather.relative_humidity_2m;


    if (value === null) {

      return 0;

    }


    return Math.max(
      0,
      Math.min(100, value)
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
  // CLOUD
  // ==========================================================

  get cloudCoverDisplay(): string {

    return this.format(
      this.weather.cloud_cover,
      0
    ) + '%';

  }


  getCloudWidth(): number {

    const value =
      this.weather.cloud_cover;


    if (value === null) {

      return 0;

    }


    return Math.max(
      0,
      Math.min(100, value)
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


  getPrecipitationWidth(): number {

    const value =
      this.weather.precipitation;


    if (value === null) {

      return 0;

    }


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

    if (!this.lastWeatherUpdate) {

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
    value: number | null,
    decimals = 1
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