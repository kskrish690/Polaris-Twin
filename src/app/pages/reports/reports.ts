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
  | 'risk';

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
  imports: [CommonModule],
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
      subtitle: 'Station operations, infrastructure and system intelligence',
      icon: '◈'
    },
    {
      id: 'station',
      title: 'Station Health Report',
      subtitle: 'Infrastructure condition and station performance',
      icon: '⌁'
    },
    {
      id: 'weather',
      title: 'Weather & Environment Report',
      subtitle: 'Atmospheric and environmental conditions',
      icon: '◌'
    },
    {
      id: 'risk',
      title: 'Risk & Anomaly Report',
      subtitle: 'Risk indicators, anomalies and operational insights',
      icon: '△'
    }
  ];

  recentReports: HistoryItem[] = [
    {
      id: 'initial-executive',
      type: 'executive',
      title: 'Executive Operations Report',
      subtitle: 'Station operations and system intelligence',
      createdAt: 'Available now'
    },
    {
      id: 'initial-station',
      type: 'station',
      title: 'Station Health Report',
      subtitle: 'Infrastructure and station condition',
      createdAt: 'Available now'
    },
    {
      id: 'initial-weather',
      type: 'weather',
      title: 'Weather & Environment Report',
      subtitle: 'Environmental conditions and trends',
      createdAt: 'Available now'
    },
    {
      id: 'initial-risk',
      type: 'risk',
      title: 'Risk & Anomaly Report',
      subtitle: 'Risk indicators and anomaly analysis',
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

  private generationTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly storageKey = 'polaris_twin_reports_v1';

  constructor() {
    this.currentReport = this.buildReport('executive');
    this.updateTrendChart();

    this.loadHistory();
  }

  // ============================================================
  // REPORT TYPE SELECTION
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

  selectReportType(type: ReportType): void {
    if (this.isGenerating) {
      return;
    }

    this.selectedReportType = type;
  }

  // ============================================================
  // REPORT GENERATION
  // ============================================================

  generateReport(type: ReportType): void {
    if (this.isGenerating) {
      return;
    }

    this.selectedReportType = type;
    this.isGenerating = true;
    this.generationError = '';

    if (this.generationTimer) {
      clearTimeout(this.generationTimer);
    }

    this.generationTimer = setTimeout(() => {

      try {

        const report = this.buildReport(type);

        this.currentReport = report;

        this.updateTrendChart();

        this.addToHistory(report);

        this.reportTypeModalOpen = false;
        this.previewModalOpen = true;

      } catch (error) {

        console.error(
          'Report generation failed:',
          error
        );

        this.generationError =
          'Unable to generate the report. Please try again.';

      } finally {

        this.isGenerating = false;
        this.generationTimer = null;

      }

    }, 450);
  }

  // ============================================================
  // VIEW REPORT
  // ============================================================

  viewReport(type: ReportType): void {

    if (this.isGenerating || this.isDownloading) {
      return;
    }

    this.currentReport = this.buildReport(type);

    this.updateTrendChart();

    this.previewModalOpen = true;
    this.downloadError = '';
  }

  closePreview(): void {

    if (this.isDownloading) {
      return;
    }

    this.previewModalOpen = false;
    this.downloadError = '';
  }

  onPreviewBackdrop(
    event: MouseEvent
  ): void {

    if (
      event.target === event.currentTarget &&
      !this.isDownloading
    ) {
      this.closePreview();
    }
  }

  onBuilderBackdrop(
    event: MouseEvent
  ): void {

    if (
      event.target === event.currentTarget &&
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
        existing => existing.type !== report.type
      )
    ].slice(0, 8);

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
        this.recentReports = validItems;
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
        'Current operational period',

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
        '02',
        '03',
        '04',
        '05',
        '06',
        '07'
      ],

      table: [],

      insights: [],

      methodology:
        'This report consolidates available station, environmental and analytical information into a structured operational view.'
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

        base.methodology =
          'Environmental information is presented from the available weather and environmental data pipeline. Values should be interpreted alongside current station observations.';

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
            label: 'Monitoring Coverage',
            value: '95%',
            note: 'Analytical coverage',
            tone: 'blue'
          }
        ];

        base.bars = [
          {
            label: 'Environmental Risk',
            value: 31,
            displayValue: '31'
          },
          {
            label: 'Infrastructure Risk',
            value: 24,
            displayValue: '24'
          },
          {
            label: 'Energy Risk',
            value: 28,
            displayValue: '28'
          },
          {
            label: 'Logistics Risk',
            value: 19,
            displayValue: '19'
          }
        ];

        base.trend = [
          36,
          31,
          34,
          28,
          30,
          25,
          24
        ];

        base.table = [
          {
            metric: 'Environmental risk',
            bharati: '28',
            maitri: '31',
            status: 'WATCH'
          },
          {
            metric: 'Infrastructure risk',
            bharati: '21',
            maitri: '24',
            status: 'STABLE'
          },
          {
            metric: 'Energy risk',
            bharati: '25',
            maitri: '28',
            status: 'WATCH'
          },
          {
            metric: 'Logistics risk',
            bharati: '17',
            maitri: '19',
            status: 'STABLE'
          }
        ];

        base.insights = [
          {
            title: 'Risk movement',
            text:
              'The composite risk indicator shows a downward movement over the current reporting period.',
            icon: '↓'
          },
          {
            title: 'Anomaly review',
            text:
              'Detected deviations should remain under review to determine whether they represent operational changes or transient conditions.',
            icon: '△'
          },
          {
            title: 'Critical status',
            text:
              'No critical event indicator is currently represented in the available analytical snapshot.',
            icon: '✓'
          }
        ];

        base.methodology =
          'Risk indicators represent analytical outputs derived from available operational and environmental inputs. Individual indicators should be reviewed together with source observations and operational context.';

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

    if (!values || values.length === 0) {
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
        (value, index) => {

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
            (bottom - top);

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
  // EXPORT
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

      document.body.appendChild(link);

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

      this.isDownloading = false;

    }
  }

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

          context.fillStyle =
            '#ffffff';

          context.fillRect(
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

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

          const sliceHeightMm =
            (
              sliceHeight /
              canvas.width
            ) *
            printableWidth;

          if (pageNumber > 0) {
            pdf.addPage();
          }

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

      this.isDownloading = false;

    }
  }

  private async captureReport(): Promise<HTMLCanvasElement> {

    const element =
      this.reportDocument?.nativeElement;

    if (!element) {
      throw new Error(
        'Report document is not available.'
      );
    }

    element.classList.add(
      'capture-mode'
    );

    try {

      await this.nextFrame();

      const html2canvasModule =
        await import('html2canvas');

      const html2canvas =
        html2canvasModule.default;

      return await html2canvas(
        element,
        {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: false,
          logging: false,
          imageTimeout: 15000
        }
      );

    } finally {

      element.classList.remove(
        'capture-mode'
      );

    }
  }

  private async ensurePreviewReady(): Promise<void> {

    if (!this.previewModalOpen) {
      this.previewModalOpen = true;
    }

    await this.nextFrame();

    await this.nextFrame();

    if (!this.reportDocument?.nativeElement) {
      throw new Error(
        'Report preview could not be prepared.'
      );
    }
  }

  private nextFrame(): Promise<void> {

    return new Promise(
      resolve => {
        requestAnimationFrame(
          () => resolve()
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
      ) ||
      'polaris-twin-report';
  }

  // ============================================================
  // UI HELPERS
  // ============================================================

  getReportIcon(
    type: ReportType
  ): string {

    const option =
      this.reportOptions.find(
        item => item.id === type
      );

    return option?.icon || '◈';
  }

  getReportLabel(
    type: ReportType
  ): string {

    const option =
      this.reportOptions.find(
        item => item.id === type
      );

    return option?.title ||
      'Operational Report';
  }

  statusClass(
    status: string
  ): string {

    switch (
      status.toUpperCase()
    ) {

      case 'STABLE':
        return 'stable';

      case 'WATCH':
        return 'watch';

      case 'REVIEW':
        return 'review';

      case 'CRITICAL':
        return 'critical';

      default:
        return 'stable';
    }
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

  // ============================================================
  // KEYBOARD
  // ============================================================

  @HostListener(
    'document:keydown.escape'
  )
  handleEscape(): void {

    if (this.isGenerating ||
        this.isDownloading) {
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

  // ============================================================
  // CLEANUP
  // ============================================================

  ngOnDestroy(): void {

    if (this.generationTimer) {
      clearTimeout(
        this.generationTimer
      );

      this.generationTimer = null;
    }
  }
}