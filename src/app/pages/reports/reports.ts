import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReportItem {
  id: number;
  reportId: string;
  title: string;
  type: string;
  station: string;
  generatedAt: Date;
  period: string;
  status: 'READY' | 'GENERATING' | 'ARCHIVED';
  size: string;
  records: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit, OnDestroy {

  currentTime = new Date();

  searchTerm = '';
  selectedType = 'ALL';
  selectedStation = 'ALL';

  private clockTimer?: ReturnType<typeof setInterval>;
  private generationTimers: ReturnType<typeof setTimeout>[] = [];

  private nextId = 9;

  reports: ReportItem[] = [
    {
      id: 1,
      reportId: 'RPT-2026-001',
      title: 'Daily Weather Intelligence',
      type: 'WEATHER',
      station: 'MAITRI',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      period: '14 Sep 2026 · 00:00–23:59 UTC',
      status: 'READY',
      size: '2.8 MB',
      records: 18420
    },
    {
      id: 2,
      reportId: 'RPT-2026-002',
      title: 'Bharati Environmental Summary',
      type: 'ENVIRONMENT',
      station: 'BHARATI',
      generatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      period: '14 Sep 2026 · 00:00–23:59 UTC',
      status: 'READY',
      size: '3.4 MB',
      records: 21980
    },
    {
      id: 3,
      reportId: 'RPT-2026-003',
      title: 'Station Energy Performance',
      type: 'ENERGY',
      station: 'MAITRI',
      generatedAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
      period: '13 Sep 2026 · 00:00–23:59 UTC',
      status: 'READY',
      size: '1.9 MB',
      records: 12560
    },
    {
      id: 4,
      reportId: 'RPT-2026-004',
      title: 'Infrastructure Health Report',
      type: 'INFRASTRUCTURE',
      station: 'BHARATI',
      generatedAt: new Date(Date.now() - 15 * 60 * 60 * 1000),
      period: '13 Sep 2026 · Weekly',
      status: 'READY',
      size: '4.1 MB',
      records: 32780
    },
    {
      id: 5,
      reportId: 'RPT-2026-005',
      title: 'Logistics Readiness Assessment',
      type: 'LOGISTICS',
      station: 'NETWORK',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      period: '08–14 Sep 2026',
      status: 'READY',
      size: '2.2 MB',
      records: 14890
    },
    {
      id: 6,
      reportId: 'RPT-2026-006',
      title: 'Incident & Alert Analysis',
      type: 'INCIDENT',
      station: 'NETWORK',
      generatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
      period: '13 Sep 2026 · 00:00–23:59 UTC',
      status: 'ARCHIVED',
      size: '1.6 MB',
      records: 8420
    },
    {
      id: 7,
      reportId: 'RPT-2026-007',
      title: 'Maitri Station Operational Report',
      type: 'DAILY',
      station: 'MAITRI',
      generatedAt: new Date(Date.now() - 42 * 60 * 60 * 1000),
      period: '12 Sep 2026 · 00:00–23:59 UTC',
      status: 'READY',
      size: '2.5 MB',
      records: 17640
    },
    {
      id: 8,
      reportId: 'RPT-2026-008',
      title: 'Bharati Station Operational Report',
      type: 'DAILY',
      station: 'BHARATI',
      generatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      period: '12 Sep 2026 · 00:00–23:59 UTC',
      status: 'ARCHIVED',
      size: '2.7 MB',
      records: 19210
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateClock();

    this.clockTimer = setInterval(() => {
      this.updateClock();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }

    this.generationTimers.forEach(timer => {
      clearTimeout(timer);
    });
  }

  private updateClock(): void {
    this.currentTime = new Date();
  }

  // --------------------------------------------------
  // FILTERED REPORTS
  // --------------------------------------------------

  get filteredReports(): ReportItem[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.reports.filter(report => {

      const matchesSearch =
        !search ||
        report.title.toLowerCase().includes(search) ||
        report.reportId.toLowerCase().includes(search) ||
        report.type.toLowerCase().includes(search) ||
        report.station.toLowerCase().includes(search);

      const matchesType =
        this.selectedType === 'ALL' ||
        report.type === this.selectedType;

      const matchesStation =
        this.selectedStation === 'ALL' ||
        report.station === this.selectedStation;

      return (
        matchesSearch &&
        matchesType &&
        matchesStation
      );
    });
  }

  // --------------------------------------------------
  // SUMMARY COUNTERS
  // --------------------------------------------------

  get totalReports(): number {
    return this.reports.length;
  }

  get readyReports(): number {
    return this.reports.filter(
      report => report.status === 'READY'
    ).length;
  }

  get archivedReports(): number {
    return this.reports.filter(
      report => report.status === 'ARCHIVED'
    ).length;
  }

  get generatingReports(): number {
    return this.reports.filter(
      report => report.status === 'GENERATING'
    ).length;
  }

  get totalRecords(): number {
    return this.reports.reduce(
      (total, report) => total + report.records,
      0
    );
  }

  // --------------------------------------------------
  // FILTER ACTIONS
  // --------------------------------------------------

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = 'ALL';
    this.selectedStation = 'ALL';
  }

  // --------------------------------------------------
  // REPORT GENERATION
  // --------------------------------------------------

  generateReport(): void {

    const newId = this.nextId++;

    const report: ReportItem = {
      id: newId,
      reportId: `RPT-2026-${String(newId).padStart(3, '0')}`,
      title: 'New Station Intelligence Report',
      type: 'DAILY',
      station: 'NETWORK',
      generatedAt: new Date(),
      period: this.getCurrentPeriod(),
      status: 'GENERATING',
      size: '--',
      records: 0
    };

    this.reports.unshift(report);

    this.cdr.detectChanges();

    const timer = setTimeout(() => {

      report.status = 'READY';
      report.size = '2.4 MB';
      report.records = 15320;
      report.generatedAt = new Date();

      this.cdr.detectChanges();

    }, 2500);

    this.generationTimers.push(timer);
  }

  private getCurrentPeriod(): string {

    const parts = new Intl.DateTimeFormat(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).formatToParts(this.currentTime);

    const day =
      parts.find(part => part.type === 'day')?.value ?? '';

    const month =
      parts.find(part => part.type === 'month')?.value ?? '';

    const year =
      parts.find(part => part.type === 'year')?.value ?? '';

    return `${day} ${month} ${year} · Current operational period`;
  }

  // --------------------------------------------------
  // REPORT ACTIONS
  // --------------------------------------------------

  downloadReport(report: ReportItem): void {

    if (report.status !== 'READY') {
      return;
    }

    const content = [
      'POLARIS-TWIN',
      'Digital Twin for India\'s Antarctic Research Stations',
      '',
      `Report ID: ${report.reportId}`,
      `Title: ${report.title}`,
      `Type: ${report.type}`,
      `Station: ${report.station}`,
      `Period: ${report.period}`,
      `Generated: ${this.formatDateTime(report.generatedAt)}`,
      `Records: ${report.records}`,
      `Size: ${report.size}`,
      '',
      'This report is generated by the SIH prototype.'
    ].join('\n');

    const blob = new Blob(
      [content],
      {
        type: 'text/plain;charset=utf-8'
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `${report.reportId}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  viewReport(report: ReportItem): void {

    const message =
      `${report.title}\n\n` +
      `Report ID: ${report.reportId}\n` +
      `Station: ${report.station}\n` +
      `Type: ${this.getTypeLabel(report.type)}\n` +
      `Period: ${report.period}\n` +
      `Records: ${report.records.toLocaleString('en-IN')}\n` +
      `Size: ${report.size}`;

    window.alert(message);
  }

  archiveReport(report: ReportItem): void {

    if (report.status === 'GENERATING') {
      return;
    }

    report.status = 'ARCHIVED';

    this.cdr.detectChanges();
  }

  restoreReport(report: ReportItem): void {

    if (report.status !== 'ARCHIVED') {
      return;
    }

    report.status = 'READY';

    this.cdr.detectChanges();
  }

  // --------------------------------------------------
  // DISPLAY HELPERS
  // --------------------------------------------------

  getTypeLabel(type: string): string {

    switch (type) {
      case 'WEATHER':
        return 'Weather';

      case 'ENVIRONMENT':
        return 'Environment';

      case 'ENERGY':
        return 'Energy';

      case 'INFRASTRUCTURE':
        return 'Infrastructure';

      case 'LOGISTICS':
        return 'Logistics';

      case 'INCIDENT':
        return 'Incident';

      case 'DAILY':
        return 'Daily';

      default:
        return type;
    }
  }

  getTypeIcon(type: string): string {

    switch (type) {
      case 'WEATHER':
        return '◌';

      case 'ENVIRONMENT':
        return '◎';

      case 'ENERGY':
        return 'ϟ';

      case 'INFRASTRUCTURE':
        return '◇';

      case 'LOGISTICS':
        return '◆';

      case 'INCIDENT':
        return '!';

      case 'DAILY':
        return '▣';

      default:
        return '▤';
    }
  }

  getStatusClass(status: string): string {

    switch (status) {
      case 'READY':
        return 'status-ready';

      case 'GENERATING':
        return 'status-generating';

      case 'ARCHIVED':
        return 'status-archived';

      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {

    switch (status) {
      case 'READY':
        return 'READY';

      case 'GENERATING':
        return 'GENERATING';

      case 'ARCHIVED':
        return 'ARCHIVED';

      default:
        return status;
    }
  }

  getTimeAgo(date: Date): string {

    const difference =
      Date.now() - date.getTime();

    const seconds =
      Math.floor(difference / 1000);

    if (seconds < 60) {
      return 'Just now';
    }

    const minutes =
      Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days =
      Math.floor(hours / 24);

    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  formatDateTime(date: Date): string {

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    ).format(date);
  }

  get formattedTime(): string {

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
    ).format(this.currentTime);
  }

  get formattedDate(): string {

    const parts = new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).formatToParts(this.currentTime);

    const year =
      parts.find(part => part.type === 'year')?.value ?? '';

    const month =
      parts.find(part => part.type === 'month')?.value ?? '';

    const day =
      parts.find(part => part.type === 'day')?.value ?? '';

    return `${year}-${month}-${day}`;
  }

  trackByReportId(
    index: number,
    report: ReportItem
  ): number {
    return report.id;
  }
}