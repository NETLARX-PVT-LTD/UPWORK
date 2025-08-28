import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { ChatbotAnalyticsService, DateRange } from '../shared/services/chatbot-analytics.service';

Chart.register(...registerables);

export interface AnalyticsData {
  chatbotUsers: number;
  humanHelpRequested: number;
  incomingMessages: number;
  outgoingMessages: number;
  dailyUsers: { day: string; users: number; date: string }[];
  hourlyUsers: { hour: string; users: number; timestamp: string }[];
  topMessages: { message: string; count: number }[];
  topCTAs: { buttonTitle: string; count: number; initiated?: string; type?: 'button' | 'quick_reply' }[];
  topStories: { message: string; count: number }[];
  platformUsers: { platform: string; percentage: number; count: number }[];
  usersByTime: { time: string; users: number }[];
}

export interface LocationData {
  platform?: string;
  country?: string;
  state?: string;
  city?: string;
  percentage: number;
  count: number;
  system?: string;
}

@Component({
  selector: 'app-chatbot-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-analytics.component.html',
  styleUrl: './chatbot-analytics.component.scss'
})
export class ChatbotAnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dailyUsersChart') dailyUsersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('platformChart') platformChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usersReportChart') usersReportChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('platformPieChart') platformPieChartRef!: ElementRef<HTMLCanvasElement>;

  hoveredItem: any | null = null;
  private platformChart: Chart | undefined;
  private dailyUsersChart: Chart | undefined;
  private usersReportChart: Chart | undefined;
  private platformPieChart: Chart | undefined;

  // Toggle states for dropdown menus
  showDailyChartMenu: boolean = false;
  showPlatformChartMenu: boolean = false;
  showUsersReportMenu: boolean = false;
  showPlatformPieMenu: boolean = false;

  startDate: string = '';
  endDate: string = '';
  dailyFilter: string = 'Day';
  platformFilter: string = 'platform';
  ctaFilter: string = 'Buttons';

  analyticsData: AnalyticsData = {
    chatbotUsers: 2,
    humanHelpRequested: 1,
    incomingMessages: 189,
    outgoingMessages: 277,
    dailyUsers: [
      { day: 'Sunday', users: 0, date: '2025-08-24' },
      { day: 'Monday', users: 1, date: '2025-08-25' },
      { day: 'Tuesday', users: 0, date: '2025-08-26' },
      { day: 'Wednesday', users: 0, date: '2025-08-27' },
      { day: 'Thursday', users: 1, date: '2025-08-28' },
      { day: 'Friday', users: 0, date: '2025-08-29' },
      { day: 'Saturday', users: 0, date: '2025-08-30' }
    ],
    hourlyUsers: [
      { hour: '09:00', users: 1, timestamp: '2025-08-28T09:00:00Z' },
      { hour: '10:00', users: 1, timestamp: '2025-08-28T10:00:00Z' },
      { hour: '11:00', users: 0, timestamp: '2025-08-28T11:00:00Z' }
    ],
    topMessages: [
      { message: 'Hello', count: 34 },
      { message: 'story', count: 4 },
      { message: 'menu', count: 4 },
      { message: 'gg', count: 2 },
      { message: 'continue', count: 2 }
    ],
    topCTAs: [
      { buttonTitle: 'Get started', count: 58, initiated: '', type: 'button' },
      { buttonTitle: 'Story', count: 7, initiated: '', type: 'button' },
      { buttonTitle: 'Work', count: 4, initiated: '', type: 'quick_reply' },
      { buttonTitle: 'Help', count: 4, initiated: '', type: 'quick_reply' },
      { buttonTitle: 'Json Check', count: 4, initiated: 'Media Block 9051', type: 'button' }
    ],
    topStories: [
      { message: '(hello,hi,heyuu),', count: 1 }
    ],
    platformUsers: [
      { platform: 'Website', percentage: 100, count: 0 }
    ],
    usersByTime: [
      { time: '07:30', users: 0 },
      { time: '08:00', users: 0 },
      { time: '08:30', users: 1 },
      { time: '09:00', users: 1 },
      { time: '09:30', users: 0 },
      { time: '10:00', users: 0 }
    ]
  };

  private charts: Chart[] = [];

  constructor(private analyticsService: ChatbotAnalyticsService) {}

  ngOnInit() {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = monthAgo.toISOString().split('T')[0];
  }

  ngAfterViewInit() {
    this.initializeCharts();
    this.analyticsService.analyticsData$.subscribe(data => {
      this.analyticsData = data;
      this.updateAllCharts();
    });
    this.analyticsService.filterByDateRange(this.startDate, this.endDate);
  }

  ngOnDestroy() {
    this.charts.forEach(chart => chart.destroy());
  }

  private initializeCharts() {
    this.createDailyUsersChart();
    this.createPlatformChart();
    this.createUsersReportChart();
    this.createPlatformPieChart();
  }

  private createDailyUsersChart() {
    const ctx = this.dailyUsersChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.getDailyChartData();

    this.dailyUsersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
          borderWidth: 1,
          barThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (context) => {
                if (this.dailyFilter === 'Hour') {
                  return `${context[0].label}`;
                }
                return context[0].label;
              },
              label: (context) => {
                const percentage = data.percentages?.[context.dataIndex] || 0;
                return `Users: ${percentage.toFixed(2)}%`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(...data.values) * 1.2,
            ticks: { stepSize: this.dailyFilter === 'Hour' ? 0.2 : 1 }
          }
        }
      }
    });

    this.charts.push(this.dailyUsersChart);
  }

  private getDailyChartData() {
    if (this.dailyFilter === 'Hour') {
      const hourlyData = this.analyticsData.hourlyUsers || [];
      const totalUsers = hourlyData.reduce((sum, h) => sum + h.users, 0);
      
      return {
        labels: hourlyData.map(h => h.hour),
        values: hourlyData.map(h => h.users),
        percentages: hourlyData.map(h => totalUsers > 0 ? (h.users / totalUsers) * 100 : 0)
      };
    } else {
      const dailyData = this.analyticsData.dailyUsers || [];
      const totalUsers = dailyData.reduce((sum, d) => sum + d.users, 0);
      
      return {
        labels: dailyData.map(d => d.day),
        values: dailyData.map(d => d.users),
        percentages: dailyData.map(d => totalUsers > 0 ? (d.users / totalUsers) * 100 : 0)
      };
    }
  }

  private createPlatformChart() {
    const ctx = this.platformChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.platformChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
          barThickness: 60
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, max: 100 }
        }
      }
    });

    this.charts.push(this.platformChart);
  }

  private createUsersReportChart() {
    const ctx = this.usersReportChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.usersReportChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.analyticsData.usersByTime.map(d => d.time),
        datasets: [{
          data: this.analyticsData.usersByTime.map(d => d.users),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#8b5cf6',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            mode: 'nearest',
            intersect: false,
            callbacks: {
              title: (context) => {
                return `Time: ${context[0].label}`;
              },
              label: (context) => {
                return `Users: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, max: 2, ticks: { stepSize: 1 } },
          x: {
            ticks: {
              maxTicksLimit: 8
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    this.charts.push(this.usersReportChart);
  }

  private createPlatformPieChart() {
    const ctx = this.platformPieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.platformPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.analyticsData.platformUsers.map(p => p.platform),
        datasets: [{
          data: this.analyticsData.platformUsers.map(p => p.percentage),
          backgroundColor: ['#06b6d4'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '70%'
      }
    });

    this.charts.push(this.platformPieChart);
  }

  setDailyFilter(filter: string) {
    this.dailyFilter = filter;
    this.updateDailyUsersChart();
    this.showDailyChartMenu = false;
  }

  private updateDailyUsersChart() {
    if (this.dailyUsersChart) {
      const data = this.getDailyChartData();
      
      this.dailyUsersChart.data.labels = data.labels;
      this.dailyUsersChart.data.datasets[0].data = data.values;
      this.dailyUsersChart.options!.scales!['y']!.max = Math.max(...data.values) * 1.2;
      this.dailyUsersChart.update();
    }
  }

  getFilteredPlatformData(): LocationData[] {
    switch (this.platformFilter) {
      case 'platform':
        return this.analyticsService.getCurrentData().systemUsers || this.analyticsService.getCurrentData().platformUsers;
      case 'country':
        return this.analyticsService.getCurrentData().countryUsers;
      case 'state':
        return this.analyticsService.getCurrentData().stateUsers;
      case 'city':
        return this.analyticsService.getCurrentData().cityUsers;
      default:
        return this.analyticsService.getCurrentData().systemUsers || this.analyticsService.getCurrentData().platformUsers;
    }
  }

  // Get filtered CTAs based on type
  getFilteredCTAs() {
    if (this.ctaFilter === 'Quick Replies') {
      return this.analyticsData.topCTAs.filter(cta => cta.type === 'quick_reply');
    }
    return this.analyticsData.topCTAs.filter(cta => cta.type === 'button' || !cta.type);
  }

  private updatePlatformChartData() {
    if (this.platformChart) {
      const data = this.getFilteredPlatformData();
      const labels = data.map(item => item.system || item.platform || item.country || item.state || item.city || '');
      const chartData = data.map(item => item.count);
      const backgroundColors = data.map(item => {
        const platformName = item.platform || '';
        return this.getPlatformColor(platformName);
      });

      this.platformChart.data.labels = labels;
      this.platformChart.data.datasets[0].data = chartData;
      (this.platformChart.data.datasets[0] as any).backgroundColor = backgroundColors;
      this.platformChart.update();
    }
  }

  setPlatformFilter(filter: 'platform' | 'country' | 'state' | 'city') {
    this.platformFilter = filter;
    this.updatePlatformChartData();
    this.showPlatformChartMenu = false;
  }

  setCTAFilter(filter: string) {
    this.ctaFilter = filter;
  }

  getPlatformColor(platform: string): string {
    const colors = {
      'Website': '#06b6d4',
      'Facebook': '#1877f2',
      'WhatsApp': '#25d366',
      'Telegram': '#0088cc',
      'Windows 10': '#0078d4',
      'Mac': '#000000',
      'Android': '#3ddc84',
      'iOS': '#007aff'
    };
    return colors[platform as keyof typeof colors] || '#06b6d4';
  }

  private updateAllCharts() {
    this.updateDailyUsersChart();
    this.updatePlatformChartData();
    this.updateUsersReportChart();
    this.updatePlatformPieChart();
  }

  private updateUsersReportChart() {
    if (this.usersReportChart) {
      this.usersReportChart.data.labels = this.analyticsData.usersByTime.map(d => d.time);
      this.usersReportChart.data.datasets[0].data = this.analyticsData.usersByTime.map(d => d.users);
      this.usersReportChart.update();
    }
  }

  private updatePlatformPieChart() {
    if (this.platformPieChart) {
      this.platformPieChart.data.labels = this.analyticsData.platformUsers.map(p => p.platform);
      this.platformPieChart.data.datasets[0].data = this.analyticsData.platformUsers.map(p => p.percentage);
      this.platformPieChart.update();
    }
  }

  // Toggle menu methods
  toggleDailyChartMenu() {
    this.showDailyChartMenu = !this.showDailyChartMenu;
    this.showPlatformChartMenu = false;
    this.showUsersReportMenu = false;
    this.showPlatformPieMenu = false;
  }

  togglePlatformChartMenu() {
    this.showPlatformChartMenu = !this.showPlatformChartMenu;
    this.showDailyChartMenu = false;
    this.showUsersReportMenu = false;
    this.showPlatformPieMenu = false;
  }

  toggleUsersReportMenu() {
    this.showUsersReportMenu = !this.showUsersReportMenu;
    this.showDailyChartMenu = false;
    this.showPlatformChartMenu = false;
    this.showPlatformPieMenu = false;
  }

  togglePlatformPieMenu() {
    this.showPlatformPieMenu = !this.showPlatformPieMenu;
    this.showDailyChartMenu = false;
    this.showPlatformChartMenu = false;
    this.showUsersReportMenu = false;
  }

  // Export methods for charts
  downloadSVG(chartType: string) {
    let chart: Chart | undefined;
    let filename = '';

    switch (chartType) {
      case 'daily-users':
        chart = this.dailyUsersChart;
        filename = 'daily-users-chart.svg';
        break;
      case 'platform':
        chart = this.platformChart;
        filename = 'platform-chart.svg';
        break;
      case 'users-report':
        chart = this.usersReportChart;
        filename = 'users-report-chart.svg';
        break;
      case 'platform-pie':
        chart = this.platformPieChart;
        filename = 'platform-pie-chart.svg';
        break;
    }

    if (chart) {
      const svgString = chart.toBase64Image('image/svg+xml', 1);
      this.downloadFile(svgString, filename, 'image/svg+xml');
    }
  }

  downloadPNG(chartType: string) {
    let chart: Chart | undefined;
    let filename = '';

    switch (chartType) {
      case 'daily-users':
        chart = this.dailyUsersChart;
        filename = 'daily-users-chart.png';
        break;
      case 'platform':
        chart = this.platformChart;
        filename = 'platform-chart.png';
        break;
      case 'users-report':
        chart = this.usersReportChart;
        filename = 'users-report-chart.png';
        break;
      case 'platform-pie':
        chart = this.platformPieChart;
        filename = 'platform-pie-chart.png';
        break;
    }

    if (chart) {
      const pngString = chart.toBase64Image('image/png', 1);
      this.downloadFile(pngString, filename, 'image/png');
    }
  }

  downloadCSV(chartType: string) {
    let data: any[] = [];
    let filename = '';

    switch (chartType) {
      case 'daily-users':
        data = this.dailyFilter === 'Hour' ? this.analyticsData.hourlyUsers : this.analyticsData.dailyUsers;
        filename = `${this.dailyFilter.toLowerCase()}-users-data.csv`;
        break;
      case 'platform':
        data = this.getFilteredPlatformData();
        filename = `${this.platformFilter}-data.csv`;
        break;
      case 'users-report':
        data = this.analyticsData.usersByTime;
        filename = 'users-report-data.csv';
        break;
      case 'platform-pie':
        data = this.analyticsData.platformUsers;
        filename = 'platform-users-data.csv';
        break;
    }

    if (data.length > 0) {
      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  // Download methods for data tables
  downloadMessagesData() {
    const csv = this.convertToCSV(this.analyticsData.topMessages);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'top-messages.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  downloadCTAsData() {
    const filteredCTAs = this.getFilteredCTAs();
    const csv = this.convertToCSV(filteredCTAs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `top-${this.ctaFilter.toLowerCase().replace(' ', '-')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  downloadStoriesData() {
    const csv = this.convertToCSV(this.analyticsData.topStories);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'top-stories.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private downloadFile(dataUrl: string, filename: string, mimeType: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  onHover(item: any) {
    this.hoveredItem = item;
  }

  onMouseLeave() {
    this.hoveredItem = null;
  }
}