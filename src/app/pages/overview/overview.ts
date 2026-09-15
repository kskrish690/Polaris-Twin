import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

import * as L from 'leaflet';

type StationId = 'BHARATI' | 'MAITRI';

interface WeatherStation {
  id: StationId;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  region: string;
  location: string;
  elevation: string;
}

interface WeatherData {
  loading: boolean;
  online: boolean;

  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;

  windSpeed: number | null;
  windDirection: number | null;

  precipitation: number | null;
  snowfall: number | null;
  visibility: number | null;

  cloudCover: number | null;
  pressure: number | null;

  weatherCode: number | null;

  lastUpdated: Date | null;
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number;

  current: {
    time: string;
    interval: number;

    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;

    wind_speed_10m: number;
    wind_direction_10m: number;

    precipitation: number;
    snowfall: number;
    visibility: number;

    cloud_cover: number;
    surface_pressure: number;

    weather_code: number;
  };
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class Overview
  implements OnInit, AfterViewInit, OnDestroy {

  // ============================================================
  // SATELLITE MAP
  // ============================================================

  @ViewChild('satelliteMap')
  satelliteMapElement?: ElementRef<HTMLDivElement>;

  private satelliteMap?: L.Map;
  private satelliteLayer?: L.TileLayer;

  private stationMarkers: Record<
    StationId,
    L.CircleMarker | undefined
  > = {
    BHARATI: undefined,
    MAITRI: undefined
  };

  // ============================================================
  // MAP STATE
  // ============================================================

  mapMode: 'network' | 'satellite' = 'network';

  selectedStation: StationId = 'BHARATI';

  // ============================================================
  // STATION REGISTRY
  // ============================================================

  readonly stations: Record<StationId, WeatherStation> = {

    BHARATI: {
      id: 'BHARATI',
      name: 'BHARATI',
      code: 'BRI-01',
      latitude: -69.406833,
      longitude: 76.195333,
      region: 'LARSEMANN HILLS',
      location: 'PRYDZ BAY / LARSEMANN HILLS',
      elevation: '~35 M ASL'
    },

    MAITRI: {
      id: 'MAITRI',
      name: 'MAITRI',
      code: 'MAI-01',
      latitude: -70.755714,
      longitude: 11.654676,
      region: 'SCHIRMACHER OASIS',
      location: 'SCHIRMACHER OASIS',
      elevation: '~114 M ASL'
    }

  };

  // ============================================================
  // WEATHER
  // ============================================================

  weather: Record<StationId, WeatherData> = {
    BHARATI: this.createEmptyWeather(),
    MAITRI: this.createEmptyWeather()
  };

  // ============================================================
  // TELEMETRY
  // Non-weather digital twin values remain simulated
  // ============================================================

  telemetry = {
    power: 94,
    network: 98,
    cpu: 41,
    storage: 68,
    battery: 87,
    thermal: -18
  };

  private weatherRefreshSubscription?: Subscription;
  private telemetrySubscription?: Subscription;

  private satelliteInitialized = false;

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // ============================================================
  // INITIALIZATION
  // ============================================================

  ngOnInit(): void {

    /*
     * IMPORTANT:
     * Weather loading starts here rather than waiting for a
     * button click or map interaction.
     */

    this.loadAllWeather();

    /*
     * Refresh Open-Meteo every 5 minutes.
     */

    this.weatherRefreshSubscription = interval(5 * 60 * 1000)
      .subscribe(() => {
        this.loadAllWeather();
      });

    /*
     * Digital twin telemetry remains simulated.
     */

    this.telemetrySubscription = interval(5000)
      .subscribe(() => {
        this.updateTelemetry();
      });

    /*
     * Make initial LOADING state visible immediately.
     */

    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {

    /*
     * If the page starts directly in satellite mode,
     * initialize the map.
     */

    if (this.mapMode === 'satellite') {
      setTimeout(() => {
        this.initializeSatelliteMap();
      }, 100);
    }
  }

  ngOnDestroy(): void {

    this.weatherRefreshSubscription?.unsubscribe();

    this.telemetrySubscription?.unsubscribe();

    if (this.satelliteMap) {
      this.satelliteMap.remove();
    }
  }

  // ============================================================
  // WEATHER
  // ============================================================

  loadAllWeather(): void {

    /*
     * Set both stations to LOADING first.
     *
     * This is important:
     * loading !== offline
     */

    this.setStationLoading('BHARATI');
    this.setStationLoading('MAITRI');

    this.loadStationWeather('BHARATI');
    this.loadStationWeather('MAITRI');

    this.cdr.detectChanges();
  }

  private loadStationWeather(
    stationId: StationId
  ): void {

    const station = this.stations[stationId];

    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${station.latitude}` +
      `&longitude=${station.longitude}` +
      '&current=' +
      [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'wind_speed_10m',
        'wind_direction_10m',
        'precipitation',
        'snowfall',
        'visibility',
        'cloud_cover',
        'surface_pressure',
        'weather_code'
      ].join(',') +
      '&timezone=UTC';

    this.http
      .get<OpenMeteoResponse>(url)
      .subscribe({

        next: (response) => {

          const current = response.current;

          this.weather[stationId] = {

            loading: false,
            online: true,

            temperature: current.temperature_2m,

            apparentTemperature:
              current.apparent_temperature,

            humidity:
              current.relative_humidity_2m,

            windSpeed:
              current.wind_speed_10m,

            windDirection:
              current.wind_direction_10m,

            precipitation:
              current.precipitation,

            snowfall:
              current.snowfall,

            visibility:
              current.visibility,

            cloudCover:
              current.cloud_cover,

            pressure:
              current.surface_pressure,

            weatherCode:
              current.weather_code,

            lastUpdated:
              new Date()

          };

          /*
           * Force Angular to immediately refresh
           * the dashboard after the HTTP callback.
           */

          this.cdr.detectChanges();

          /*
           * Update satellite marker if map is active.
           */

          this.updateStationMarker(stationId);
        },

        error: (error) => {

          console.error(
            `Open-Meteo error for ${stationId}:`,
            error
          );

          this.weather[stationId] = {

            ...this.weather[stationId],

            loading: false,

            online: false

          };

          this.cdr.detectChanges();

          this.updateStationMarker(stationId);
        }

      });
  }

  private setStationLoading(
    stationId: StationId
  ): void {

    this.weather[stationId] = {

      ...this.weather[stationId],

      loading: true,

      online: false

    };
  }

  // ============================================================
  // WEATHER HELPERS
  // ============================================================

  getWeatherDescription(
    code: number | null
  ): string {

    if (code === null) {
      return 'DATA UNAVAILABLE';
    }

    switch (code) {

      case 0:
        return 'CLEAR SKY';

      case 1:
      case 2:
      case 3:
        return 'PARTLY CLOUDY';

      case 45:
      case 48:
        return 'FOG';

      case 51:
      case 53:
      case 55:
        return 'DRIZZLE';

      case 56:
      case 57:
        return 'FREEZING DRIZZLE';

      case 61:
      case 63:
      case 65:
        return 'RAIN';

      case 66:
      case 67:
        return 'FREEZING RAIN';

      case 71:
      case 73:
      case 75:
      case 77:
        return 'SNOW';

      case 80:
      case 81:
      case 82:
        return 'RAIN SHOWERS';

      case 85:
      case 86:
        return 'SNOW SHOWERS';

      case 95:
        return 'THUNDERSTORM';

      case 96:
      case 99:
        return 'THUNDERSTORM / HAIL';

      default:
        return 'UNKNOWN';
    }
  }

  getWindDirection(
    degrees: number | null
  ): string {

    if (degrees === null) {
      return '—';
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

  // ============================================================
  // KPI GETTERS
  // ============================================================

  get activeStationCount(): number {

    return [
      this.weather.BHARATI,
      this.weather.MAITRI
    ].filter(
      station => station.online
    ).length;
  }

  get networkAvailability(): number {

    const total = 2;

    const online =
      this.activeStationCount;

    return Math.round(
      (online / total) * 100
    );
  }

  get meanTemperature(): number | null {

    const temperatures = [
      this.weather.BHARATI.temperature,
      this.weather.MAITRI.temperature
    ].filter(
      (value): value is number =>
        typeof value === 'number' &&
        Number.isFinite(value)
    );

    if (!temperatures.length) {
      return null;
    }

    return temperatures.reduce(
      (sum, value) => sum + value,
      0
    ) / temperatures.length;
  }

  get systemReadiness(): number {

    const weatherAvailability =
      this.networkAvailability;

    /*
     * Digital twin infrastructure is still modelled.
     * Weather availability contributes to overall readiness.
     */

    return Math.round(
      0.65 * 95 +
      0.35 * weatherAvailability
    );
  }

  get apiStatus(): string {

    if (
      this.weather.BHARATI.loading ||
      this.weather.MAITRI.loading
    ) {
      return 'LOADING';
    }

    if (
      this.weather.BHARATI.online ||
      this.weather.MAITRI.online
    ) {
      return 'API';
    }

    return 'OFFLINE';
  }

  get apiStatusClass(): string {

    if (
      this.weather.BHARATI.loading ||
      this.weather.MAITRI.loading
    ) {
      return 'loading';
    }

    if (
      this.weather.BHARATI.online ||
      this.weather.MAITRI.online
    ) {
      return 'online';
    }

    return 'offline';
  }

  get selectedStationData(): WeatherStation {

    return this.stations[
      this.selectedStation
    ];
  }

  get selectedWeather(): WeatherData {

    return this.weather[
      this.selectedStation
    ];
  }

  // ============================================================
  // ALERTS
  // ============================================================

  get alertCount(): number {

    let count = 0;

    const stations: StationId[] = [
      'BHARATI',
      'MAITRI'
    ];

    for (const stationId of stations) {

      const weather =
        this.weather[stationId];

      if (!weather.online) {
        continue;
      }

      if (
        weather.temperature !== null &&
        weather.temperature < -30
      ) {
        count++;
      }

      if (
        weather.windSpeed !== null &&
        weather.windSpeed > 70
      ) {
        count++;
      }

    }

    return count;
  }

  // ============================================================
  // STATION SELECTOR
  // ============================================================

  selectStation(
    stationId: StationId
  ): void {

    this.selectedStation = stationId;

    if (this.mapMode === 'satellite') {

      this.focusSatelliteStation(
        stationId
      );

    }

    this.cdr.detectChanges();
  }

  // ============================================================
  // MAP MODE
  // ============================================================

  setMapMode(
    mode: 'network' | 'satellite'
  ): void {

    this.mapMode = mode;

    this.cdr.detectChanges();

    if (mode === 'satellite') {

      setTimeout(() => {

        this.initializeSatelliteMap();

        this.satelliteMap?.invalidateSize();

        this.focusSatelliteStation(
          this.selectedStation
        );

      }, 100);

    }
  }

  // ============================================================
  // LEAFLET SATELLITE MAP
  // ============================================================

  private initializeSatelliteMap(): void {

    if (
      this.satelliteInitialized ||
      !this.satelliteMapElement
    ) {
      return;
    }

    const element =
      this.satelliteMapElement.nativeElement;

    this.satelliteMap =
      L.map(element, {
        zoomControl: true,
        attributionControl: true
      });

    /*
     * Real Esri World Imagery.
     *
     * This is satellite/aerial imagery.
     */

    this.satelliteLayer =
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution:
            'Tiles © Esri'
        }
      );

    this.satelliteLayer.addTo(
      this.satelliteMap
    );

    /*
     * Add both research stations.
     */

    this.createStationMarker('BHARATI');
    this.createStationMarker('MAITRI');

    this.satelliteInitialized = true;

    this.satelliteMap.invalidateSize();

    this.cdr.detectChanges();
  }

  private createStationMarker(
    stationId: StationId
  ): void {

    if (!this.satelliteMap) {
      return;
    }

    const station =
      this.stations[stationId];

    const marker =
      L.circleMarker(
        [
          station.latitude,
          station.longitude
        ],
        {
          radius:
            stationId === this.selectedStation
              ? 9
              : 7,

          color: '#45d9ff',

          fillColor:
            this.weather[stationId].online
              ? '#00ff9d'
              : '#ff5d78',

          fillOpacity: 1,

          weight: 2
        }
      );

    marker.addTo(
      this.satelliteMap
    );

    marker.bindPopup(
      this.createPopupContent(
        stationId
      )
    );

    marker.on(
      'click',
      () => {

        this.selectedStation =
          stationId;

        this.cdr.detectChanges();

        this.refreshMarkerStyles();
      }
    );

    this.stationMarkers[
      stationId
    ] = marker;
  }

  private updateStationMarker(
    stationId: StationId
  ): void {

    const marker =
      this.stationMarkers[stationId];

    if (!marker) {
      return;
    }

    const weather =
      this.weather[stationId];

    marker.setStyle({

      fillColor:
        weather.online
          ? '#00ff9d'
          : '#ff5d78'

    });

    marker.setPopupContent(
      this.createPopupContent(
        stationId
      )
    );
  }

  private refreshMarkerStyles(): void {

    for (
      const stationId of
      ['BHARATI', 'MAITRI'] as StationId[]
    ) {

      const marker =
        this.stationMarkers[stationId];

      if (!marker) {
        continue;
      }

      marker.setStyle({

        radius:
          stationId === this.selectedStation
            ? 9
            : 7,

        fillColor:
          this.weather[stationId].online
            ? '#00ff9d'
            : '#ff5d78'

      });

    }
  }

  private focusSatelliteStation(
    stationId: StationId
  ): void {

    if (!this.satelliteMap) {
      return;
    }

    const station =
      this.stations[stationId];

    this.satelliteMap.setView(
      [
        station.latitude,
        station.longitude
      ],
      6,
      {
        animate: true
      }
    );

    this.refreshMarkerStyles();
  }

  private createPopupContent(
    stationId: StationId
  ): string {

    const station =
      this.stations[stationId];

    const weather =
      this.weather[stationId];

    const temperature =
      weather.temperature === null
        ? '—'
        : `${weather.temperature.toFixed(1)} °C`;

    const wind =
      weather.windSpeed === null
        ? '—'
        : `${weather.windSpeed.toFixed(0)} km/h`;

    const humidity =
      weather.humidity === null
        ? '—'
        : `${weather.humidity.toFixed(0)}%`;

    const status =
      weather.loading
        ? 'LOADING'
        : weather.online
          ? 'ONLINE'
          : 'OFFLINE';

    return `
      <div style="
        min-width:220px;
        font-family:Arial,sans-serif;
      ">
        <strong style="
          font-size:16px;
          letter-spacing:1px;
        ">
          ${station.name}
        </strong>

        <div style="
          margin-top:8px;
          font-size:12px;
        ">
          STATUS · ${status}
        </div>

        <div style="
          margin-top:8px;
        ">
          TEMP · ${temperature}
        </div>

        <div>
          WIND · ${wind}
        </div>

        <div>
          HUMIDITY · ${humidity}
        </div>

        <div style="
          margin-top:8px;
          font-size:10px;
          opacity:.65;
        ">
          OPEN-METEO · API WEATHER
        </div>
      </div>
    `;
  }

  // ============================================================
  // TELEMETRY
  // ============================================================

  private updateTelemetry(): void {

    this.telemetry.power =
      this.randomAround(
        this.telemetry.power,
        0.8,
        96
      );

    this.telemetry.network =
      this.randomAround(
        this.telemetry.network,
        0.5,
        100
      );

    this.telemetry.cpu =
      this.randomAround(
        this.telemetry.cpu,
        3,
        85
      );

    this.telemetry.storage =
      this.randomAround(
        this.telemetry.storage,
        0.3,
        100
      );

    this.telemetry.battery =
      this.randomAround(
        this.telemetry.battery,
        0.2,
        100
      );

    this.cdr.detectChanges();
  }

  private randomAround(
    current: number,
    variation: number,
    max: number
  ): number {

    const value =
      current +
      (Math.random() - 0.5) *
      variation;

    return Math.max(
      0,
      Math.min(
        max,
        Math.round(value * 10) / 10
      )
    );
  }

  // ============================================================
  // EMPTY WEATHER
  // ============================================================

  private createEmptyWeather(): WeatherData {

    return {

      loading: true,

      online: false,

      temperature: null,

      apparentTemperature: null,

      humidity: null,

      windSpeed: null,

      windDirection: null,

      precipitation: null,

      snowfall: null,

      visibility: null,

      cloudCover: null,

      pressure: null,

      weatherCode: null,

      lastUpdated: null

    };
  }
}