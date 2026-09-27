import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

type ReportType =
  | 'executive'
  | 'station'
  | 'weather'
  | 'risk'
  | 'audit-complete'
  | 'audit-supply'
  | 'audit-usage'
  | 'audit-inventory'
  | 'audit-assets'
  | 'audit-resupply';

type KpiTone =
  | 'cyan'
  | 'green'
  | 'amber'
  | 'blue';

interface ReportOption {
  id: ReportType;
  title: string;
  subtitle: string;
  icon: string;
  group: 'operations' | 'audit';
}

interface Kpi {
  label: string;
  value: string;
  note: string;
  tone: KpiTone;
}

interface BarMetric {
  label: string;
  value: number;
  displayValue: string;
}

interface TableRow {
  metric: string;
  bharati: string;
  maitri: string;
  status: string;
}

interface Insight {
  title: string;
  text: string;
  icon: string;
}

interface TrendDot {
  x: number;
  y: number;
  value: number;
}

interface SupplyRecord {
  date: string;
  station: 'BHARATI' | 'MAITRI';
  resource: string;
  quantity: string;
  source: string;
  destination: string;
  status: string;
}

interface UsageRecord {
  date: string;
  time: string;
  station: 'BHARATI' | 'MAITRI';
  resource: string;
  used: string;
  purpose: string;
  remaining: string;
}

interface InventoryRecord {
  resource: string;
  bharati: string;
  maitri: string;
  unit: string;
  status: string;
  coverage: string;
}

interface AssetRecord {
  asset: string;
  station: 'BHARATI' | 'MAITRI';
  category: string;
  quantity: number;
  condition: string;
  inspection: string;
  status: string;
}

interface ResupplyRecord {
  date: string;
  station: 'BHARATI' | 'MAITRI';
  items: string;
  quantity: string;
  receivedBy: string;
  status: string;
}

interface AuditActivity {
  date: string;
  time: string;
  action: string;
  station: string;
  operator: string;
  status: string;
}

interface ResupplyForecast {
  station: 'BHARATI' | 'MAITRI';
  date: string;
  priority: string;
  primaryResource: string;
  estimatedQuantity: string;
  daysRemaining: number;
}

interface AuditData {
  supplies: SupplyRecord[];
  usage: UsageRecord[];
  inventory: InventoryRecord[];
  assets: AssetRecord[];
  resupply: ResupplyRecord[];
  activity: AuditActivity[];
  forecast: ResupplyForecast[];
}

interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  subtitle: string;
  period: string;
  station: string;
  status: string;
  generatedAt: string;

  kpis: Kpi[];
  bars: BarMetric[];
  trend: number[];
  trendLabels: string[];
  table: TableRow[];
  insights: Insight[];

  methodology: string;

  audit: AuditData | null;
}

interface HistoryItem {
  id: string;
  type: ReportType;
  title: string;
  subtitle: string;
  createdAt: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnDestroy {

  @ViewChild('reportDocument')
  reportDocument?: ElementRef<HTMLElement>;

  readonly reportOptions: ReportOption[] = [

    {
      id: 'executive',
      title: 'Executive Operations Report',
      subtitle:
        'Station operations, infrastructure and system intelligence',
      icon: '◈',
      group: 'operations'
    },

    {
      id: 'station',
      title: 'Station Health Report',
      subtitle:
        'Infrastructure condition and station performance',
      icon: '⌁',
      group: 'operations'
    },

    {
      id: 'weather',
      title: 'Weather & Environment Report',
      subtitle:
        'Atmospheric and environmental conditions',
      icon: '◌',
      group: 'operations'
    },

    {
      id: 'risk',
      title: 'Risk & Anomaly Report',
      subtitle:
        'Risk indicators, anomalies and operational insights',
      icon: '△',
      group: 'operations'
    },

    {
      id: 'audit-complete',
      title: 'Complete Audit Report',
      subtitle:
        'Supplies, usage, inventory, assets and resupply intelligence',
      icon: '▣',
      group: 'audit'
    },

    {
      id: 'audit-supply',
      title: 'Supply History Report',
      subtitle:
        'Previous supply movements and receiving records',
      icon: '↓',
      group: 'audit'
    },

    {
      id: 'audit-usage',
      title: 'Resource Usage Report',
      subtitle:
        'Resource consumption and remaining quantities',
      icon: '↘',
      group: 'audit'
    },

    {
      id: 'audit-inventory',
      title: 'Remaining Supplies Report',
      subtitle:
        'Current inventory position across both stations',
      icon: '◫',
      group: 'audit'
    },

    {
      id: 'audit-assets',
      title: 'Asset Register Report',
      subtitle:
        'Station assets, condition and inspection records',
      icon: '◆',
      group: 'audit'
    },

    {
      id: 'audit-resupply',
      title: 'Resupply History Report',
      subtitle:
        'Previous deliveries and upcoming resupply requirements',
      icon: '⇢',
      group: 'audit'
    }

  ];

  recentReports: HistoryItem[] = [

    {
      id: 'initial-executive',
      type: 'executive',
      title: 'Executive Operations Report',
      subtitle:
        'Station operations and system intelligence',
      createdAt: 'Available now'
    },

    {
      id: 'initial-station',
      type: 'station',
      title: 'Station Health Report',
      subtitle:
        'Infrastructure and station condition',
      createdAt: 'Available now'
    },

    {
      id: 'initial-weather',
      type: 'weather',
      title: 'Weather & Environment Report',
      subtitle:
        'Environmental conditions and trends',
      createdAt: 'Available now'
    },

    {
      id: 'initial-risk',
      type: 'risk',
      title: 'Risk & Anomaly Report',
      subtitle:
        'Risk indicators and anomaly analysis',
      createdAt: 'Available now'
    },

    {
      id: 'initial-audit',
      type: 'audit-complete',
      title: 'Complete Audit Report',
      subtitle:
        'Supply, usage, inventory, assets and resupply',
      createdAt: 'Available now'
    }

  ];

  reportTypeModalOpen = false;
  previewModalOpen = false;

  isGenerating = false;
  isDownloading = false;

  generationError = '';
  downloadError = '';

  selectedReportType: ReportType = 'executive';

  currentReport: ReportData;

  trendPoints = '';
  trendAreaPoints = '';
  trendDots: TrendDot[] = [];

  private generationTimer:
    ReturnType<typeof setTimeout> | null = null;

  private readonly storageKey =
    'polaris_twin_reports_v2';

  constructor() {

    this.currentReport =
      this.buildReport('executive');

    this.updateTrendChart();

    this.loadHistory();
  }

  // ============================================================
  // REPORT BUILDER
  // ============================================================

  openReportBuilder(): void {

    if (this.isGenerating) {
      return;
    }

    this.generationError = '';

    this.reportTypeModalOpen = true;
  }

  closeReportBuilder(): void {

    if (this.isGenerating) {
      return;
    }

    this.reportTypeModalOpen = false;
  }

  selectReportType(
    type: ReportType
  ): void {

    if (this.isGenerating) {
      return;
    }

    this.selectedReportType = type;
  }

  // ============================================================
  // GENERATE
  // ============================================================

  generateReport(
    type: ReportType
  ): void {

    if (this.isGenerating) {
      return;
    }

    this.selectedReportType = type;

    this.isGenerating = true;

    this.generationError = '';

    if (this.generationTimer) {

      clearTimeout(
        this.generationTimer
      );

    }

    this.generationTimer =
      setTimeout(() => {

        try {

          const report =
            this.buildReport(type);

          this.currentReport =
            report;

          this.updateTrendChart();

          this.addToHistory(report);

          this.reportTypeModalOpen =
            false;

          this.previewModalOpen =
            true;

        } catch (error) {

          console.error(
            'Report generation failed:',
            error
          );

          this.generationError =
            'Unable to generate the report. Please try again.';

        } finally {

          this.isGenerating =
            false;

          this.generationTimer =
            null;

        }

      }, 450);
  }

  // ============================================================
  // VIEW
  // ============================================================

  viewReport(
    type: ReportType
  ): void {

    if (
      this.isGenerating ||
      this.isDownloading
    ) {
      return;
    }

    this.currentReport =
      this.buildReport(type);

    this.updateTrendChart();

    this.previewModalOpen =
      true;

    this.downloadError = '';
  }

  closePreview(): void {

    if (this.isDownloading) {
      return;
    }

    this.previewModalOpen =
      false;

    this.downloadError = '';
  }

  onPreviewBackdrop(
    event: MouseEvent
  ): void {

    if (
      event.target ===
        event.currentTarget &&
      !this.isDownloading
    ) {

      this.closePreview();

    }
  }

  onBuilderBackdrop(
    event: MouseEvent
  ): void {

    if (
      event.target ===
        event.currentTarget &&
      !this.isGenerating
    ) {

      this.closeReportBuilder();

    }
  }

  // ============================================================
  // HISTORY
  // ============================================================

  private addToHistory(
    report: ReportData
  ): void {

    const item: HistoryItem = {

      id: report.id,

      type: report.type,

      title: report.title,

      subtitle: report.subtitle,

      createdAt: report.generatedAt

    };

    this.recentReports = [

      item,

      ...this.recentReports.filter(
        existing =>
          existing.type !== report.type
      )

    ].slice(0, 10);

    this.saveHistory();
  }

  private loadHistory(): void {

    try {

      const stored =
        localStorage.getItem(
          this.storageKey
        );

      if (!stored) {
        return;
      }

      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return;
      }

      const validItems =
        parsed.filter(
          (item: HistoryItem) =>
            item &&
            item.id &&
            item.type &&
            item.title &&
            item.subtitle &&
            item.createdAt
        );

      if (validItems.length > 0) {

        this.recentReports =
          validItems;

      }

    } catch (error) {

      console.warn(
        'Unable to load report history:',
        error
      );

    }
  }

  private saveHistory(): void {

    try {

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(
          this.recentReports
        )
      );

    } catch (error) {

      console.warn(
        'Unable to save report history:',
        error
      );

    }
  }

  // ============================================================
  // HARDCODED AUDIT DATA
  // ============================================================

  private getAuditData(): AuditData {

    return {

      supplies: [

        {
          date: '18 Sep 2026',
          station: 'BHARATI',
          resource: 'Diesel Fuel',
          quantity: '+12,000 L',
          source: 'Resupply Convoy',
          destination: 'Main Fuel Storage',
          status: 'RECEIVED'
        },

        {
          date: '15 Sep 2026',
          station: 'MAITRI',
          resource: 'Potable Water',
          quantity: '+8,000 L',
          source: 'Water Transfer Unit',
          destination: 'Water Storage',
          status: 'RECEIVED'
        },

        {
          date: '09 Sep 2026',
          station: 'BHARATI',
          resource: 'Food Supplies',
          quantity: '+2,400 kg',
          source: 'Scheduled Resupply',
          destination: 'Cold Storage',
          status: 'RECEIVED'
        },

        {
          date: '04 Sep 2026',
          station: 'MAITRI',
          resource: 'Technical Supplies',
          quantity: '+520 kg',
          source: 'Logistics Transfer',
          destination: 'Technical Store',
          status: 'RECEIVED'
        },

        {
          date: '28 Aug 2026',
          station: 'BHARATI',
          resource: 'Medical Supplies',
          quantity: '+460 kg',
          source: 'Medical Logistics',
          destination: 'Medical Store',
          status: 'RECEIVED'
        },

        {
          date: '21 Aug 2026',
          station: 'MAITRI',
          resource: 'Diesel Fuel',
          quantity: '+10,500 L',
          source: 'Fuel Resupply',
          destination: 'Main Fuel Storage',
          status: 'RECEIVED'
        },

        {
          date: '12 Aug 2026',
          station: 'BHARATI',
          resource: 'Potable Water',
          quantity: '+7,200 L',
          source: 'Water Transfer Unit',
          destination: 'Water Storage',
          status: 'RECEIVED'
        },

        {
          date: '03 Aug 2026',
          station: 'MAITRI',
          resource: 'Food Supplies',
          quantity: '+2,150 kg',
          source: 'Scheduled Resupply',
          destination: 'Cold Storage',
          status: 'RECEIVED'
        }

      ],

      usage: [

        {
          date: '22 Sep 2026',
          time: '14:18',
          station: 'BHARATI',
          resource: 'Diesel Fuel',
          used: '1,180 L',
          purpose: 'Power generation',
          remaining: '18,420 L'
        },

        {
          date: '22 Sep 2026',
          time: '12:42',
          station: 'MAITRI',
          resource: 'Potable Water',
          used: '420 L',
          purpose: 'Station operations',
          remaining: '6,920 L'
        },

        {
          date: '21 Sep 2026',
          time: '19:25',
          station: 'BHARATI',
          resource: 'Food Supplies',
          used: '86 kg',
          purpose: 'Personnel provisioning',
          remaining: '2,180 kg'
        },

        {
          date: '21 Sep 2026',
          time: '16:10',
          station: 'MAITRI',
          resource: 'Diesel Fuel',
          used: '960 L',
          purpose: 'Power generation',
          remaining: '15,860 L'
        },

        {
          date: '20 Sep 2026',
          time: '11:35',
          station: 'BHARATI',
          resource: 'Potable Water',
          used: '510 L',
          purpose: 'Station operations',
          remaining: '8,640 L'
        },

        {
          date: '19 Sep 2026',
          time: '20:08',
          station: 'MAITRI',
          resource: 'Food Supplies',
          used: '72 kg',
          purpose: 'Personnel provisioning',
          remaining: '1,940 kg'
        },

        {
          date: '18 Sep 2026',
          time: '09:42',
          station: 'BHARATI',
          resource: 'Technical Supplies',
          used: '24 kg',
          purpose: 'Infrastructure maintenance',
          remaining: '318 kg'
        },

        {
          date: '17 Sep 2026',
          time: '15:26',
          station: 'MAITRI',
          resource: 'Medical Supplies',
          used: '8 kg',
          purpose: 'Medical operations',
          remaining: '382 kg'
        }

      ],

      inventory: [

        {
          resource: 'Diesel Fuel',
          bharati: '18,420',
          maitri: '15,860',
          unit: 'L',
          status: 'STABLE',
          coverage: '27 days'
        },

        {
          resource: 'Potable Water',
          bharati: '8,640',
          maitri: '6,920',
          unit: 'L',
          status: 'STABLE',
          coverage: '24 days'
        },

        {
          resource: 'Food Supplies',
          bharati: '2,180',
          maitri: '1,940',
          unit: 'kg',
          status: 'STABLE',
          coverage: '31 days'
        },

        {
          resource: 'Medical Supplies',
          bharati: '426',
          maitri: '382',
          unit: 'kg',
          status: 'STABLE',
          coverage: '68 days'
        },

        {
          resource: 'Technical Supplies',
          bharati: '318',
          maitri: '294',
          unit: 'kg',
          status: 'WATCH',
          coverage: '22 days'
        },

        {
          resource: 'Emergency Batteries',
          bharati: '84',
          maitri: '72',
          unit: 'units',
          status: 'STABLE',
          coverage: '45 days'
        }

      ],

      assets: [

        {
          asset: 'Generator Unit 01',
          station: 'BHARATI',
          category: 'Power',
          quantity: 1,
          condition: 'Good',
          inspection: '20 Sep 2026',
          status: 'OPERATIONAL'
        },

        {
          asset: 'Generator Unit 02',
          station: 'MAITRI',
          category: 'Power',
          quantity: 1,
          condition: 'Good',
          inspection: '19 Sep 2026',
          status: 'OPERATIONAL'
        },

        {
          asset: 'Snow Vehicle 01',
          station: 'BHARATI',
          category: 'Transport',
          quantity: 1,
          condition: 'Maintenance',
          inspection: '21 Sep 2026',
          status: 'SERVICE'
        },

        {
          asset: 'Snow Vehicle 02',
          station: 'MAITRI',
          category: 'Transport',
          quantity: 1,
          condition: 'Good',
          inspection: '18 Sep 2026',
          status: 'OPERATIONAL'
        },

        {
          asset: 'Communications Unit 03',
          station: 'MAITRI',
          category: 'Communications',
          quantity: 1,
          condition: 'Good',
          inspection: '20 Sep 2026',
          status: 'OPERATIONAL'
        },

        {
          asset: 'Emergency Power Pack',
          station: 'BHARATI',
          category: 'Emergency',
          quantity: 4,
          condition: 'Good',
          inspection: '17 Sep 2026',
          status: 'READY'
        },

        {
          asset: 'Water Treatment Module',
          station: 'BHARATI',
          category: 'Utilities',
          quantity: 1,
          condition: 'Good',
          inspection: '16 Sep 2026',
          status: 'OPERATIONAL'
        },

        {
          asset: 'Water Treatment Module',
          station: 'MAITRI',
          category: 'Utilities',
          quantity: 1,
          condition: 'Good',
          inspection: '16 Sep 2026',
          status: 'OPERATIONAL'
        },

        {
          asset: 'Satellite Communications Terminal',
          station: 'BHARATI',
          category: 'Communications',
          quantity: 2,
          condition: 'Good',
          inspection: '15 Sep 2026',
          status: 'OPERATIONAL'
        },

        {
          asset: 'Satellite Communications Terminal',
          station: 'MAITRI',
          category: 'Communications',
          quantity: 2,
          condition: 'Good',
          inspection: '15 Sep 2026',
          status: 'OPERATIONAL'
        }

      ],

      resupply: [

        {
          date: '18 Sep 2026',
          station: 'BHARATI',
          items: 'Diesel Fuel',
          quantity: '12,000 L',
          receivedBy: 'Logistics Control',
          status: 'COMPLETED'
        },

        {
          date: '15 Sep 2026',
          station: 'MAITRI',
          items: 'Potable Water',
          quantity: '8,000 L',
          receivedBy: 'Station Operations',
          status: 'COMPLETED'
        },

        {
          date: '09 Sep 2026',
          station: 'BHARATI',
          items: 'Food Supplies',
          quantity: '2,400 kg',
          receivedBy: 'Station Operations',
          status: 'COMPLETED'
        },

        {
          date: '04 Sep 2026',
          station: 'MAITRI',
          items: 'Technical Supplies',
          quantity: '520 kg',
          receivedBy: 'Engineering Control',
          status: 'COMPLETED'
        },

        {
          date: '28 Aug 2026',
          station: 'BHARATI',
          items: 'Medical Supplies',
          quantity: '460 kg',
          receivedBy: 'Medical Operations',
          status: 'COMPLETED'
        },

        {
          date: '21 Aug 2026',
          station: 'MAITRI',
          items: 'Diesel Fuel',
          quantity: '10,500 L',
          receivedBy: 'Logistics Control',
          status: 'COMPLETED'
        }

      ],

      activity: [

        {
          date: '22 Sep 2026',
          time: '14:32',
          action: 'Supply record updated',
          station: 'BHARATI',
          operator: 'Operations Control',
          status: 'RECORDED'
        },

        {
          date: '22 Sep 2026',
          time: '13:48',
          action: 'Fuel usage recorded',
          station: 'MAITRI',
          operator: 'Energy Control',
          status: 'RECORDED'
        },

        {
          date: '22 Sep 2026',
          time: '11:20',
          action: 'Asset inspection completed',
          station: 'BHARATI',
          operator: 'Engineering Control',
          status: 'COMPLETED'
        },

        {
          date: '21 Sep 2026',
          time: '18:40',
          action: 'Resource balance verified',
          station: 'MAITRI',
          operator: 'Logistics Control',
          status: 'VERIFIED'
        },

        {
          date: '21 Sep 2026',
          time: '15:05',
          action: 'Resupply schedule reviewed',
          station: 'NETWORK',
          operator: 'Mission Control',
          status: 'REVIEWED'
        },

        {
          date: '20 Sep 2026',
          time: '16:18',
          action: 'Technical inventory updated',
          station: 'BHARATI',
          operator: 'Engineering Control',
          status: 'UPDATED'
        },

        {
          date: '20 Sep 2026',
          time: '10:52',
          action: 'Water consumption recorded',
          station: 'MAITRI',
          operator: 'Station Operations',
          status: 'RECORDED'
        },

        {
          date: '19 Sep 2026',
          time: '19:10',
          action: 'Asset condition reviewed',
          station: 'MAITRI',
          operator: 'Engineering Control',
          status: 'VERIFIED'
        }

      ],

      forecast: [

        {
          station: 'BHARATI',
          date: '17 Oct 2026',
          priority: 'PLANNED',
          primaryResource: 'Diesel Fuel',
          estimatedQuantity: '12,000 L',
          daysRemaining: 25
        },

        {
          station: 'MAITRI',
          date: '24 Oct 2026',
          priority: 'PLANNED',
          primaryResource: 'Potable Water',
          estimatedQuantity: '8,000 L',
          daysRemaining: 32
        }

      ]

    };
  }

  // ============================================================
  // REPORT DATA
  // ============================================================

  private buildReport(
    type: ReportType
  ): ReportData {

    const generatedAt =
      new Date().toLocaleString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    const base: ReportData = {

      id:
        `report-${type}-${Date.now()}`,

      type,

      title: '',

      subtitle: '',

      period:
        '01 Sep 2026 — 22 Sep 2026',

      station:
        'BHARATI + MAITRI',

      status:
        'OPERATIONAL',

      generatedAt,

      kpis: [],

      bars: [],

      trend: [],

      trendLabels: [
        '01',
        '04',
        '08',
        '12',
        '16',
        '20',
        '22'
      ],

      table: [],

      insights: [],

      methodology:
        'This report consolidates available station, environmental and operational information into a structured intelligence document.',

      audit: null

    };

    switch (type) {

      case 'executive':

        base.title =
          'Executive Operations Report';

        base.subtitle =
          'Integrated operational overview of Antarctic research stations';

        base.kpis = [

          {
            label: 'Station Availability',
            value: '98.4%',
            note: 'Network availability',
            tone: 'green'
          },

          {
            label: 'Operational Readiness',
            value: '94%',
            note: 'Current readiness index',
            tone: 'cyan'
          },

          {
            label: 'Active Alerts',
            value: '03',
            note: 'Requires monitoring',
            tone: 'amber'
          },

          {
            label: 'Data Coverage',
            value: '96.8%',
            note: 'Available observations',
            tone: 'blue'
          }

        ];

        base.bars = [

          {
            label: 'Station Operations',
            value: 94,
            displayValue: '94%'
          },

          {
            label: 'Infrastructure',
            value: 91,
            displayValue: '91%'
          },

          {
            label: 'Energy Systems',
            value: 88,
            displayValue: '88%'
          },

          {
            label: 'Logistics',
            value: 82,
            displayValue: '82%'
          }

        ];

        base.trend = [
          72,
          78,
          75,
          84,
          81,
          89,
          94
        ];

        base.table = [

          {
            metric: 'Operational readiness',
            bharati: '96%',
            maitri: '92%',
            status: 'STABLE'
          },

          {
            metric: 'Energy availability',
            bharati: '91%',
            maitri: '86%',
            status: 'STABLE'
          },

          {
            metric: 'Environmental status',
            bharati: '88%',
            maitri: '83%',
            status: 'WATCH'
          },

          {
            metric: 'Logistics readiness',
            bharati: '84%',
            maitri: '79%',
            status: 'WATCH'
          }

        ];

        base.insights = [

          {
            title: 'Operational continuity',
            text:
              'Both research stations maintain continuous operational coverage with monitored infrastructure systems.',
            icon: '↗'
          },

          {
            title: 'Energy monitoring',
            text:
              'Energy availability remains within the current operational range, with additional attention required at Maitri.',
            icon: '⚡'
          },

          {
            title: 'Environmental conditions',
            text:
              'Environmental indicators remain actively monitored to support station planning and operational decisions.',
            icon: '◌'
          }

        ];

        break;

      case 'station':

        base.title =
          'Station Health Report';

        base.subtitle =
          'Infrastructure condition and station performance assessment';

        base.kpis = [

          {
            label: 'Overall Health',
            value: '92%',
            note: 'Combined station index',
            tone: 'green'
          },

          {
            label: 'Infrastructure',
            value: '91%',
            note: 'Condition indicator',
            tone: 'cyan'
          },

          {
            label: 'Energy Systems',
            value: '88%',
            note: 'Availability indicator',
            tone: 'blue'
          },

          {
            label: 'Maintenance Items',
            value: '07',
            note: 'Under observation',
            tone: 'amber'
          }

        ];

        base.bars = [

          {
            label: 'BHARATI',
            value: 94,
            displayValue: '94%'
          },

          {
            label: 'MAITRI',
            value: 90,
            displayValue: '90%'
          },

          {
            label: 'Power Systems',
            value: 88,
            displayValue: '88%'
          },

          {
            label: 'Support Systems',
            value: 93,
            displayValue: '93%'
          }

        ];

        base.trend = [
          88,
          90,
          89,
          91,
          90,
          93,
          92
        ];

        base.table = [

          {
            metric: 'Station systems',
            bharati: '94%',
            maitri: '90%',
            status: 'STABLE'
          },

          {
            metric: 'Power infrastructure',
            bharati: '91%',
            maitri: '86%',
            status: 'WATCH'
          },

          {
            metric: 'Communications',
            bharati: '97%',
            maitri: '94%',
            status: 'STABLE'
          },

          {
            metric: 'Support infrastructure',
            bharati: '93%',
            maitri: '91%',
            status: 'STABLE'
          }

        ];

        base.insights = [

          {
            title: 'Station condition',
            text:
              'Infrastructure indicators show stable operating conditions across the monitored station systems.',
            icon: '⌁'
          },

          {
            title: 'Maintenance focus',
            text:
              'A limited set of maintenance observations should remain under routine operational review.',
            icon: '◆'
          },

          {
            title: 'System availability',
            text:
              'Core communications and support systems continue to show strong availability indicators.',
            icon: '✓'
          }

        ];

        break;

      case 'weather':

        base.title =
          'Weather & Environment Report';

        base.subtitle =
          'Environmental conditions and atmospheric trend overview';

        base.kpis = [

          {
            label: 'Temperature',
            value: '-17°C',
            note: 'Current station reference',
            tone: 'cyan'
          },

          {
            label: 'Wind Speed',
            value: '61 km/h',
            note: 'Current atmospheric condition',
            tone: 'blue'
          },

          {
            label: 'Cloud Cover',
            value: '97%',
            note: 'Observed cloud condition',
            tone: 'amber'
          },

          {
            label: 'Precipitation',
            value: '0 mm',
            note: 'Current period',
            tone: 'green'
          }

        ];

        base.bars = [

          {
            label: 'Atmospheric Stability',
            value: 78,
            displayValue: '78%'
          },

          {
            label: 'Visibility',
            value: 86,
            displayValue: '86%'
          },

          {
            label: 'Wind Conditions',
            value: 64,
            displayValue: '64%'
          },

          {
            label: 'Environmental Coverage',
            value: 96,
            displayValue: '96%'
          }

        ];

        base.trend = [
          61,
          64,
          58,
          69,
          65,
          73,
          68
        ];

        base.table = [

          {
            metric: 'Temperature',
            bharati: '-18°C',
            maitri: '-17°C',
            status: 'WATCH'
          },

          {
            metric: 'Wind',
            bharati: '54 km/h',
            maitri: '61 km/h',
            status: 'WATCH'
          },

          {
            metric: 'Cloud cover',
            bharati: '91%',
            maitri: '97%',
            status: 'WATCH'
          },

          {
            metric: 'Precipitation',
            bharati: '0 mm',
            maitri: '0 mm',
            status: 'STABLE'
          }

        ];

        base.insights = [

          {
            title: 'Cold conditions',
            text:
              'Low temperatures remain a defining environmental factor for station operations and planning.',
            icon: '❄'
          },

          {
            title: 'Wind activity',
            text:
              'Elevated wind conditions should be considered when planning outdoor activities and logistics.',
            icon: '↝'
          },

          {
            title: 'Environmental coverage',
            text:
              'Environmental observations provide a continuous reference for operational planning.',
            icon: '◌'
          }

        ];

        break;

      case 'risk':

        base.title =
          'Risk & Anomaly Report';

        base.subtitle =
          'Operational risk indicators and anomaly analysis';

        base.kpis = [

          {
            label: 'Risk Index',
            value: '24',
            note: 'Current composite indicator',
            tone: 'amber'
          },

          {
            label: 'Anomalies',
            value: '04',
            note: 'Items requiring review',
            tone: 'cyan'
          },

          {
            label: 'Critical Events',
            value: '00',
            note: 'Current period',
            tone: 'green'
          },

          {
            label: 'Monitored Signals',
            value: '128',
            note: 'Active analytical inputs',
            tone: 'blue'
          }

        ];

        base.bars = [

          {
            label: 'Energy Risk',
            value: 22,
            displayValue: '22'
          },

          {
            label: 'Weather Risk',
            value: 38,
            displayValue: '38'
          },

          {
            label: 'Logistics Risk',
            value: 29,
            displayValue: '29'
          },

          {
            label: 'Infrastructure Risk',
            value: 17,
            displayValue: '17'
          }

        ];

        base.trend = [
          31,
          29,
          34,
          28,
          26,
          25,
          24
        ];

        base.table = [

          {
            metric: 'Energy risk',
            bharati: '18',
            maitri: '26',
            status: 'WATCH'
          },

          {
            metric: 'Weather risk',
            bharati: '34',
            maitri: '42',
            status: 'WATCH'
          },

          {
            metric: 'Logistics risk',
            bharati: '22',
            maitri: '31',
            status: 'STABLE'
          },

          {
            metric: 'Infrastructure risk',
            bharati: '15',
            maitri: '19',
            status: 'STABLE'
          }

        ];

        base.insights = [

          {
            title: 'Risk concentration',
            text:
              'Current indicators show the highest monitored pressure in weather and logistics conditions.',
            icon: '△'
          },

          {
            title: 'Anomaly review',
            text:
              'Detected deviations should remain under review to determine whether they represent operational changes or transient conditions.',
            icon: '↓'
          },

          {
            title: 'Critical status',
            text:
              'No critical event indicator is currently represented in the available operational snapshot.',
            icon: '✓'
          }

        ];

        base.methodology =
          'Risk indicators represent analytical outputs derived from available operational and environmental inputs. Individual indicators should be reviewed together with source observations and operational context.';

        break;

      case 'audit-complete':
      case 'audit-supply':
      case 'audit-usage':
      case 'audit-inventory':
      case 'audit-assets':
      case 'audit-resupply':

        base.audit =
          this.getAuditData();

        base.station =
          'BHARATI + MAITRI';

        base.period =
          '01 Aug 2026 — 22 Sep 2026';

        base.status =
          'AUDIT READY';

        base.trend = [
          62,
          67,
          71,
          74,
          79,
          84,
          89
        ];

        base.trendLabels = [
          'AUG 01',
          'AUG 12',
          'AUG 24',
          'SEP 05',
          'SEP 12',
          'SEP 18',
          'SEP 22'
        ];

        base.kpis = [

          {
            label: 'Fuel Remaining',
            value: '34,280 L',
            note: 'BHARATI + MAITRI',
            tone: 'cyan'
          },

          {
            label: 'Water Remaining',
            value: '15,560 L',
            note: 'Current inventory',
            tone: 'blue'
          },

          {
            label: 'Assets Tracked',
            value: '14',
            note: 'Registered equipment',
            tone: 'green'
          },

          {
            label: 'Audit Events',
            value: '08',
            note: 'Recent recorded activity',
            tone: 'amber'
          }

        ];

        base.bars = [

          {
            label: 'Supply Records',
            value: 92,
            displayValue: '92%'
          },

          {
            label: 'Inventory Coverage',
            value: 88,
            displayValue: '88%'
          },

          {
            label: 'Asset Verification',
            value: 96,
            displayValue: '96%'
          },

          {
            label: 'Resupply Planning',
            value: 84,
            displayValue: '84%'
          }

        ];

        base.table = [

          {
            metric: 'Fuel inventory',
            bharati: '18,420 L',
            maitri: '15,860 L',
            status: 'STABLE'
          },

          {
            metric: 'Water inventory',
            bharati: '8,640 L',
            maitri: '6,920 L',
            status: 'STABLE'
          },

          {
            metric: 'Food inventory',
            bharati: '2,180 kg',
            maitri: '1,940 kg',
            status: 'STABLE'
          },

          {
            metric: 'Technical supplies',
            bharati: '318 kg',
            maitri: '294 kg',
            status: 'WATCH'
          }

        ];

        base.insights = [

          {
            title: 'Supply continuity',
            text:
              'Recent supply movements show active replenishment across both research stations with fuel, water, food and technical resources being tracked.',
            icon: '↓'
          },

          {
            title: 'Inventory position',
            text:
              'Current balances remain suitable for continued operations, with technical supplies receiving additional monitoring.',
            icon: '◫'
          },

          {
            title: 'Resupply planning',
            text:
              'The next planned replenishment windows are currently recorded for Bharati on 17 October and Maitri on 24 October 2026.',
            icon: '⇢'
          }

        ];

        base.methodology =
          'The audit document consolidates supply movements, resource consumption, current inventory, registered assets, resupply records and operational audit activity into a single station-level intelligence view.';

        if (type === 'audit-complete') {

          base.title =
            'Complete Audit & Resource Report';

          base.subtitle =
            'Supplies, resource usage, inventory, assets, resupply and audit activity';

        }

        if (type === 'audit-supply') {

          base.title =
            'Supply History Report';

          base.subtitle =
            'Previous supply movements and receiving records';

        }

        if (type === 'audit-usage') {

          base.title =
            'Resource Usage Report';

          base.subtitle =
            'Resource consumption and remaining quantities';

        }

        if (type === 'audit-inventory') {

          base.title =
            'Remaining Supplies Report';

          base.subtitle =
            'Current inventory position across both stations';

        }

        if (type === 'audit-assets') {

          base.title =
            'Asset Register Report';

          base.subtitle =
            'Station assets, condition and inspection records';

        }

        if (type === 'audit-resupply') {

          base.title =
            'Resupply History Report';

          base.subtitle =
            'Previous deliveries and upcoming resupply requirements';

        }

        break;
    }

    return base;
  }

  // ============================================================
  // CHART
  // ============================================================

  private updateTrendChart(): void {

    const values =
      this.currentReport.trend;

    if (
      !values ||
      values.length === 0
    ) {

      this.trendPoints = '';

      this.trendAreaPoints = '';

      this.trendDots = [];

      return;
    }

    const width = 560;

    const bottom = 154;

    const top = 24;

    const minValue =
      Math.min(...values);

    const maxValue =
      Math.max(...values);

    const range =
      Math.max(
        maxValue - minValue,
        1
      );

    this.trendDots =
      values.map(
        (
          value,
          index
        ) => {

          const x =
            values.length === 1
              ? width / 2
              : 20 +
                (
                  index *
                  (
                    (width - 40) /
                    (values.length - 1)
                  )
                );

          const normalized =
            (
              value -
              minValue
            ) / range;

          const y =
            bottom -
            normalized *
            (
              bottom -
              top
            );

          return {
            x,
            y,
            value
          };

        }
      );

    this.trendPoints =
      this.trendDots
        .map(
          dot =>
            `${dot.x.toFixed(1)},${dot.y.toFixed(1)}`
        )
        .join(' ');

    this.trendAreaPoints =
      `20,${bottom} ` +
      this.trendPoints +
      ` ${width},${bottom}`;
  }

  // ============================================================
  // EXPORT PNG
  // ============================================================

  async downloadPng(): Promise<void> {

    if (this.isDownloading) {
      return;
    }

    this.isDownloading = true;

    this.downloadError = '';

    try {

      await this.ensurePreviewReady();

      const canvas =
        await this.captureReport();

      const link =
        document.createElement('a');

      link.download =
        `${this.slugify(
          this.currentReport.title
        )}.png`;

      link.href =
        canvas.toDataURL(
          'image/png'
        );

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

    } catch (error) {

      console.error(
        'PNG export failed:',
        error
      );

      this.downloadError =
        'PNG export failed. Please try again.';

    } finally {

      this.isDownloading =
        false;

    }
  }

  // ============================================================
  // EXPORT PDF
  // ============================================================

  async downloadPdf(): Promise<void> {

    if (this.isDownloading) {
      return;
    }

    this.isDownloading = true;

    this.downloadError = '';

    try {

      await this.ensurePreviewReady();

      const canvas =
        await this.captureReport();

      const jspdfModule =
        await import('jspdf');

      const JsPDF =
        jspdfModule.jsPDF;

      const pdf =
        new JsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

      const pageWidth = 210;

      const pageHeight = 297;

      const margin = 8;

      const printableWidth =
        pageWidth -
        margin * 2;

      const printableHeight =
        pageHeight -
        margin * 2;

      const imageHeight =
        (
          canvas.height /
          canvas.width
        ) *
        printableWidth;

      if (
        imageHeight <=
        printableHeight
      ) {

        pdf.addImage(
          canvas.toDataURL(
            'image/jpeg',
            0.95
          ),
          'JPEG',
          margin,
          margin,
          printableWidth,
          imageHeight
        );

      } else {

        const pageHeightPx =
          Math.floor(
            canvas.width *
            (
              printableHeight /
              printableWidth
            )
          );

        let offsetY = 0;

        let pageNumber = 0;

        while (
          offsetY <
          canvas.height
        ) {

          const sliceHeight =
            Math.min(
              pageHeightPx,
              canvas.height -
              offsetY
            );

          const pageCanvas =
            document.createElement(
              'canvas'
            );

          pageCanvas.width =
            canvas.width;

          pageCanvas.height =
            sliceHeight;

          const context =
            pageCanvas.getContext(
              '2d'
            );

          if (!context) {

            throw new Error(
              'Unable to create PDF canvas.'
            );

          }

          context.drawImage(
            canvas,
            0,
            offsetY,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );

          if (pageNumber > 0) {
            pdf.addPage();
          }

          const sliceHeightMm =
            (
              sliceHeight /
              canvas.width
            ) *
            printableWidth;

          pdf.addImage(
            pageCanvas.toDataURL(
              'image/jpeg',
              0.95
            ),
            'JPEG',
            margin,
            margin,
            printableWidth,
            sliceHeightMm
          );

          offsetY +=
            sliceHeight;

          pageNumber++;
        }

      }

      pdf.save(
        `${this.slugify(
          this.currentReport.title
        )}.pdf`
      );

    } catch (error) {

      console.error(
        'PDF export failed:',
        error
      );

      this.downloadError =
        'PDF export failed. Please try again.';

    } finally {

      this.isDownloading =
        false;

    }
  }

  // ============================================================
  // CAPTURE
  // ============================================================

  private async captureReport(): Promise<HTMLCanvasElement> {

    if (!this.reportDocument) {

      throw new Error(
        'Report document is not available.'
      );

    }

    const html2canvasModule =
      await import(
        'html2canvas'
      );

    const html2canvas =
      html2canvasModule.default;

    const element =
      this.reportDocument.nativeElement;

    const previousWidth =
      element.style.width;

    const previousMinWidth =
      element.style.minWidth;

    element.classList.add(
      'capture-mode'
    );

    element.style.width =
      '794px';

    element.style.minWidth =
      '794px';

    try {

      return await html2canvas(
        element,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794
        }
      );

    } finally {

      element.classList.remove(
        'capture-mode'
      );

      element.style.width =
        previousWidth;

      element.style.minWidth =
        previousMinWidth;

    }
  }

  private async ensurePreviewReady(): Promise<void> {

    await new Promise<void>(
      resolve => {

        requestAnimationFrame(
          () => {

            requestAnimationFrame(
              () => resolve()
            );

          }
        );

      }
    );
  }

  private slugify(
    value: string
  ): string {

    return value
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )
      .replace(
        /^-+|-+$/g,
        ''
      );
  }

  // ============================================================
  // UI HELPERS
  // ============================================================

  getReportIcon(
    type: ReportType
  ): string {

    const option =
      this.reportOptions.find(
        item =>
          item.id === type
      );

    return option?.icon || '◈';
  }

  getReportLabel(
    type: ReportType
  ): string {

    const option =
      this.reportOptions.find(
        item =>
          item.id === type
      );

    return option?.title ||
      'Operational Report';
  }

  statusClass(
    status: string
  ): string {

    const normalized =
      status.toLowerCase();

    if (
      normalized.includes(
        'stable'
      ) ||
      normalized.includes(
        'operational'
      ) ||
      normalized.includes(
        'received'
      ) ||
      normalized.includes(
        'completed'
      ) ||
      normalized.includes(
        'verified'
      ) ||
      normalized.includes(
        'ready'
      ) ||
      normalized.includes(
        'recorded'
      ) ||
      normalized.includes(
        'updated'
      ) ||
      normalized.includes(
        'reviewed'
      )
    ) {

      return 'status-good';
    }

    if (
      normalized.includes(
        'watch'
      ) ||
      normalized.includes(
        'service'
      ) ||
      normalized.includes(
        'planned'
      )
    ) {

      return 'status-watch';
    }

    return 'status-neutral';
  }

  trackByReport(
    index: number,
    report: HistoryItem
  ): string {

    return report.id;
  }

  trackByKpi(
    index: number,
    kpi: Kpi
  ): string {

    return kpi.label;
  }

  trackByBar(
    index: number,
    bar: BarMetric
  ): string {

    return bar.label;
  }

  trackByRow(
    index: number,
    row: TableRow
  ): string {

    return row.metric;
  }

  trackByInsight(
    index: number,
    insight: Insight
  ): string {

    return insight.title;
  }

  trackBySupply(
    index: number,
    item: SupplyRecord
  ): string {

    return `${item.date}-${item.station}-${item.resource}`;
  }

  trackByUsage(
    index: number,
    item: UsageRecord
  ): string {

    return `${item.date}-${item.time}-${item.station}-${item.resource}`;
  }

  trackByInventory(
    index: number,
    item: InventoryRecord
  ): string {

    return item.resource;
  }

  trackByAsset(
    index: number,
    item: AssetRecord
  ): string {

    return `${item.station}-${item.asset}-${index}`;
  }

  trackByResupply(
    index: number,
    item: ResupplyRecord
  ): string {

    return `${item.date}-${item.station}-${item.items}`;
  }

  trackByActivity(
    index: number,
    item: AuditActivity
  ): string {

    return `${item.date}-${item.time}-${item.action}`;
  }

  trackByForecast(
    index: number,
    item: ResupplyForecast
  ): string {

    return item.station;
  }

  // ============================================================
  // KEYBOARD
  // ============================================================

  @HostListener(
    'document:keydown.escape'
  )
  handleEscape(): void {

    if (
      this.isDownloading ||
      this.isGenerating
    ) {
      return;
    }

    if (this.previewModalOpen) {

      this.closePreview();

      return;
    }

    if (this.reportTypeModalOpen) {

      this.closeReportBuilder();

    }
  }

  ngOnDestroy(): void {

    if (this.generationTimer) {

      clearTimeout(
        this.generationTimer
      );

      this.generationTimer =
        null;
    }
  }
}