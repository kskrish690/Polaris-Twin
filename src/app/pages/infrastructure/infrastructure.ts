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

import * as L from 'leaflet';


/* ============================================================
   INTERFACES
   ============================================================ */

interface InfrastructureItem {
  name: string;
  code: string;
  category: string;

  status:
    | 'OPERATIONAL'
    | 'MONITORING'
    | 'MAINTENANCE'
    | 'OFFLINE';

  health: number;
  utilization: number;
  description: string;
}


interface SystemMetric {
  label: string;
  value: string;
  unit: string;
  percentage: number;

  status:
    | 'NORMAL'
    | 'WARNING'
    | 'CRITICAL';
}


interface AntarcticStation {
  id: 'BHARATI' | 'MAITRI';

  name: string;

  shortName: string;

  region: string;

  latitude: string;

  longitude: string;

  elevation: string;

  commissioned: string;

  description: string;

  coordinates: [number, number];
}


/* ============================================================
   COMPONENT
   ============================================================ */

@Component({
  selector: 'app-infrastructure',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './infrastructure.html',

  styleUrls: [
    './infrastructure.css'
  ]
})
export class Infrastructure
  implements OnInit, AfterViewInit, OnDestroy {


  /* ==========================================================
     MAP
     ========================================================== */

  @ViewChild('stationMap')
  stationMapElement?: ElementRef<HTMLDivElement>;

  private map?: L.Map;

  private stationMarker?: L.CircleMarker;


  /* ==========================================================
     CLOCK
     ========================================================== */

  currentTime = new Date();

  private clockTimer?: ReturnType<typeof setInterval>;

  private simulationTimer?: ReturnType<typeof setInterval>;


  /* ==========================================================
     STATION NETWORK
     ========================================================== */

  stations: AntarcticStation[] = [

    {
      id: 'BHARATI',

      name: 'BHARATI RESEARCH STATION',

      shortName: 'BHARATI',

      region: 'LARSEMANN HILLS',

      latitude: "69°24.41'S",

      longitude: "76°11.72'E",

      elevation: '~35 M ASL',

      commissioned: '18 MAR 2012',

      description:
        "India's permanent Antarctic research station located in the Larsemann Hills region of East Antarctica.",

      coordinates: [
        -69.4068,
        76.1953
      ]
    },

    {
      id: 'MAITRI',

      name: 'MAITRI RESEARCH STATION',

      shortName: 'MAITRI',

      region: 'SCHIRMACHER OASIS',

      latitude: "70°45'57\"S",

      longitude: "11°44'09\"E",

      elevation: '~117 M ASL',

      commissioned: '1989',

      description:
        "India's second permanent Antarctic research station, located in the Schirmacher Oasis of Queen Maud Land.",

      coordinates: [
        -70.7658,
        11.7358
      ]
    }

  ];


  /* ==========================================================
     DEFAULT STATION = BHARATI
     ========================================================== */

  selectedStation: AntarcticStation =
    this.stations[0];


  /* ==========================================================
     INFRASTRUCTURE REGISTRY
     ========================================================== */

  infrastructureItems: InfrastructureItem[] = [

    {
      name: 'Main Station Complex',

      code: 'MSC-01',

      category: 'HABITATION',

      status: 'OPERATIONAL',

      health: 96,

      utilization: 72,

      description:
        'Primary habitation and operational facility for station personnel.'
    },

    {
      name: 'Power Generation Unit',

      code: 'PGU-01',

      category: 'ENERGY',

      status: 'OPERATIONAL',

      health: 94,

      utilization: 68,

      description:
        'Primary electrical generation and distribution infrastructure.'
    },

    {
      name: 'Communication Hub',

      code: 'COM-01',

      category: 'COMMUNICATION',

      status: 'OPERATIONAL',

      health: 98,

      utilization: 54,

      description:
        'Satellite communication and station network infrastructure.'
    },

    {
      name: 'Fuel Storage Facility',

      code: 'FSF-01',

      category: 'LOGISTICS',

      status: 'MONITORING',

      health: 91,

      utilization: 63,

      description:
        'Strategic fuel storage and distribution facility.'
    },

    {
      name: 'Water Processing Unit',

      code: 'WPU-01',

      category: 'UTILITIES',

      status: 'OPERATIONAL',

      health: 93,

      utilization: 61,

      description:
        'Water treatment, processing and distribution system.'
    },

    {
      name: 'Waste Management Unit',

      code: 'WMU-01',

      category: 'ENVIRONMENT',

      status: 'MONITORING',

      health: 89,

      utilization: 57,

      description:
        'Station waste processing and environmental management system.'
    },

    {
      name: 'Research Laboratory',

      code: 'LAB-01',

      category: 'RESEARCH',

      status: 'OPERATIONAL',

      health: 97,

      utilization: 76,

      description:
        'Scientific research and sample processing facility.'
    },

    {
      name: 'Emergency Shelter',

      code: 'EMS-01',

      category: 'SAFETY',

      status: 'OPERATIONAL',

      health: 99,

      utilization: 12,

      description:
        'Emergency response and personnel shelter infrastructure.'
    }

  ];


  /* ==========================================================
     SYSTEM METRICS
     ========================================================== */

  systemMetrics: SystemMetric[] = [

    {
      label: 'STRUCTURAL HEALTH',

      value: '96',

      unit: '%',

      percentage: 96,

      status: 'NORMAL'
    },

    {
      label: 'POWER CAPACITY',

      value: '68',

      unit: '%',

      percentage: 68,

      status: 'NORMAL'
    },

    {
      label: 'STORAGE CAPACITY',

      value: '63',

      unit: '%',

      percentage: 63,

      status: 'NORMAL'
    },

    {
      label: 'NETWORK LOAD',

      value: '54',

      unit: '%',

      percentage: 54,

      status: 'NORMAL'
    },

    {
      label: 'WATER SYSTEM',

      value: '61',

      unit: '%',

      percentage: 61,

      status: 'NORMAL'
    },

    {
      label: 'WASTE SYSTEM',

      value: '57',

      unit: '%',

      percentage: 57,

      status: 'NORMAL'
    }

  ];


  /* ==========================================================
     CATEGORY FILTER
     ========================================================== */

  selectedCategory = 'ALL';

  categories = [

    'ALL',

    'HABITATION',

    'ENERGY',

    'COMMUNICATION',

    'LOGISTICS',

    'UTILITIES',

    'ENVIRONMENT',

    'RESEARCH',

    'SAFETY'

  ];


  /* ==========================================================
     CONSTRUCTOR
     ========================================================== */

  constructor(
    private cdr: ChangeDetectorRef
  ) {}


  /* ==========================================================
     INIT
     ========================================================== */

  ngOnInit(): void {

    this.updateClock();


    this.clockTimer = setInterval(() => {

      this.updateClock();

      this.cdr.detectChanges();

    }, 1000);


    /*
     * Demo telemetry.
     *
     * These values are intentionally labelled as
     * simulated telemetry in the UI.
     *
     * Replace with real station telemetry API
     * when available.
     */

    this.simulationTimer = setInterval(() => {

      this.updateTelemetry();

      this.cdr.detectChanges();

    }, 10000);

  }


  /* ==========================================================
     AFTER VIEW INIT
     * ========================================================== */

  ngAfterViewInit(): void {

    /*
     * Leaflet requires the DOM element to exist.
     */

    setTimeout(() => {

      this.initializeMap();

    }, 0);

  }


  /* ==========================================================
     DESTROY
     ========================================================== */

  ngOnDestroy(): void {

    if (this.clockTimer) {

      clearInterval(
        this.clockTimer
      );

    }


    if (this.simulationTimer) {

      clearInterval(
        this.simulationTimer
      );

    }


    if (this.map) {

      this.map.remove();

    }

  }


  /* ==========================================================
     CLOCK
     ========================================================== */

  private updateClock(): void {

    this.currentTime =
      new Date();

  }


  /* ==========================================================
     LEAFLET MAP INITIALIZATION
     ========================================================== */

  private initializeMap(): void {

    if (!this.stationMapElement) {

      return;

    }


    const element =
      this.stationMapElement.nativeElement;


    /*
     * Create map.
     *
     * BHARATI is the default station.
     */

    this.map = L.map(
      element,
      {
        center:
          this.selectedStation.coordinates,

        zoom: 6,

        zoomControl: false,

        attributionControl: true,

        minZoom: 2,

        maxZoom: 12
      }
    );


    /* ========================================================
       ZOOM CONTROL
       ======================================================== */

    L.control.zoom({
      position: 'topright'
    }).addTo(
      this.map
    );


    /* ========================================================
       OPENSTREETMAP TILES
       ======================================================== */

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,

        attribution:
          '&copy; OpenStreetMap contributors'
      }
    ).addTo(
      this.map
    );


    /* ========================================================
       INITIAL MARKER
       ======================================================== */

    this.createStationMarker(
      this.selectedStation
    );

  }


  /* ==========================================================
     CREATE STATION MARKER
     ========================================================== */

  private createStationMarker(
    station: AntarcticStation
  ): void {

    if (!this.map) {

      return;

    }


    /*
     * Remove previous marker.
     */

    if (this.stationMarker) {

      this.map.removeLayer(
        this.stationMarker
      );

    }


    /*
     * Create cyan station node.
     */

    this.stationMarker =
      L.circleMarker(
        station.coordinates,
        {
          radius: 9,

          color: '#48d9ff',

          weight: 2,

          fillColor: '#0b6f91',

          fillOpacity: 0.95,

          className:
            'polaris-station-marker'
        }
      ).addTo(
        this.map
      );


    /*
     * Popup.
     */

    this.stationMarker.bindPopup(
      `
      <div class="polaris-map-popup">

        <div class="popup-kicker">
          POLARIS-TWIN / GEO NODE
        </div>

        <strong>
          ${station.name}
        </strong>

        <span>
          ${station.region}
        </span>

        <small>
          ${station.latitude}
          ·
          ${station.longitude}
        </small>

      </div>
      `
    );


    /*
     * Open popup automatically.
     */

    this.stationMarker.openPopup();

  }


  /* ==========================================================
     SELECT STATION
     ========================================================== */

  selectStation(
    stationId: 'BHARATI' | 'MAITRI'
  ): void {

    const station =
      this.stations.find(
        item =>
          item.id === stationId
      );


    if (!station) {

      return;

    }


    /*
     * Change selected station.
     */

    this.selectedStation =
      station;


    /*
     * Change Leaflet map.
     */

    this.updateStationMap(
      station
    );


    /*
     * Force Angular refresh.
     */

    this.cdr.detectChanges();

  }


  /* ==========================================================
     UPDATE LEAFLET MAP
     ========================================================== */

  private updateStationMap(
    station: AntarcticStation
  ): void {

    if (!this.map) {

      return;

    }


    const [
      latitude,
      longitude
    ] =
      station.coordinates;


    /*
     * Move map to station.
     */

    this.map.flyTo(
      [
        latitude,
        longitude
      ],

      station.id === 'BHARATI'
        ? 7
        : 7,

      {
        animate: true,

        duration: 1.4
      }
    );


    /*
     * Change marker.
     */

    this.createStationMarker(
      station
    );

  }


  /* ==========================================================
     TELEMETRY
     ========================================================== */

  private updateTelemetry(): void {

    this.systemMetrics =
      this.systemMetrics.map(
        metric => {

          const variation =
            Math.round(
              (Math.random() - 0.5) * 2
            );


          let percentage =
            Number(metric.value)
            +
            variation;


          percentage =
            Math.min(
              100,
              Math.max(
                0,
                percentage
              )
            );


          return {

            ...metric,

            value:
              percentage.toString(),

            percentage

          };

        }
      );

  }


  /* ==========================================================
     CATEGORY
     ========================================================== */

  selectCategory(
    category: string
  ): void {

    this.selectedCategory =
      category;

  }


  get filteredInfrastructure():
    InfrastructureItem[] {

    if (
      this.selectedCategory === 'ALL'
    ) {

      return this.infrastructureItems;

    }


    return this.infrastructureItems.filter(
      item =>
        item.category ===
        this.selectedCategory
    );

  }


  /* ==========================================================
     STATUS COUNTS
     ========================================================== */

  get operationalCount(): number {

    return this.infrastructureItems.filter(
      item =>
        item.status ===
        'OPERATIONAL'
    ).length;

  }


  get monitoringCount(): number {

    return this.infrastructureItems.filter(
      item =>
        item.status ===
        'MONITORING'
    ).length;

  }


  get maintenanceCount(): number {

    return this.infrastructureItems.filter(
      item =>
        item.status ===
        'MAINTENANCE'
    ).length;

  }


  get offlineCount(): number {

    return this.infrastructureItems.filter(
      item =>
        item.status ===
        'OFFLINE'
    ).length;

  }


  /* ==========================================================
     HEALTH
     ========================================================== */

  get infrastructureHealth(): number {

    if (
      this.infrastructureItems.length === 0
    ) {

      return 0;

    }


    const total =
      this.infrastructureItems.reduce(
        (
          sum,
          item
        ) =>
          sum + item.health,

        0
      );


    return Math.round(
      total /
      this.infrastructureItems.length
    );

  }


  /* ==========================================================
     UTILIZATION
     ========================================================== */

  get utilizationAverage(): number {

    if (
      this.infrastructureItems.length === 0
    ) {

      return 0;

    }


    const total =
      this.infrastructureItems.reduce(
        (
          sum,
          item
        ) =>
          sum + item.utilization,

        0
      );


    return Math.round(
      total /
      this.infrastructureItems.length
    );

  }


  /* ==========================================================
     DATE / TIME
     ========================================================== */

  get formattedTime(): string {

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        timeZone:
          'Asia/Kolkata',

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
          timeZone:
            'Asia/Kolkata',

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


  /* ==========================================================
     STATUS CLASSES
     ========================================================== */

  getStatusClass(
    status:
      InfrastructureItem['status']
  ): string {

    switch (status) {

      case 'OPERATIONAL':
        return 'status-operational';

      case 'MONITORING':
        return 'status-monitoring';

      case 'MAINTENANCE':
        return 'status-maintenance';

      case 'OFFLINE':
        return 'status-offline';

      default:
        return '';

    }

  }


  getMetricClass(
    status:
      SystemMetric['status']
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


  getHealthClass(
    health: number
  ): string {

    if (health >= 90) {

      return 'health-good';

    }


    if (health >= 75) {

      return 'health-warning';

    }


    return 'health-critical';

  }


  getUtilizationWidth(
    value: number
  ): number {

    return Math.min(
      100,
      Math.max(
        0,
        value
      )
    );

  }


  getHealthWidth(
    value: number
  ): number {

    return Math.min(
      100,
      Math.max(
        0,
        value
      )
    );

  }

}