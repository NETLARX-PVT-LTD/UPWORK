import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { ChatbotAnalyticsService, DateRange  } from '../shared/services/chatbot-analytics.service';

Chart.register(...registerables);

export interface AnalyticsData {
  chatbotUsers: number;
  humanHelpRequested: number;
  incomingMessages: number;
  outgoingMessages: number;
  dailyUsers: { day: string; users: number }[];
  topMessages: { message: string; count: number }[];
  topCTAs: { buttonTitle: string; count: number; initiated?: string }[];
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
  imports: [CommonModule,FormsModule],
  templateUrl: './chatbot-analytics.component.html',
  styleUrl: './chatbot-analytics.component.scss'
})
export class ChatbotAnalyticsComponent implements OnInit {
  @ViewChild('dailyUsersChart') dailyUsersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('platformChart') platformChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usersReportChart') usersReportChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('platformPieChart') platformPieChartRef!: ElementRef<HTMLCanvasElement>;
hoveredItem: any | null = null; // New property to track the hovered item
  updateDailyUsersChart: any;

  constructor(private analyticsService: ChatbotAnalyticsService) {}
 ngAfterViewInit() {
    this.initializeCharts();
    this.analyticsService.analyticsData$.subscribe(data => {
      this.analyticsData = data;
      this.updateAllCharts();
    });
    this.analyticsService.filterByDateRange(this.startDate, this.endDate);
  }


private platformChart: Chart | undefined;
  startDate: string = '';
  endDate: string = '';
  dailyFilter: string = 'Day';
  platformFilter: string = 'Platform';
  ctaFilter: string = 'Buttons';

  analyticsData: AnalyticsData = {
    chatbotUsers: 2,
    humanHelpRequested: 1,
    incomingMessages: 189,
    outgoingMessages: 277,
    dailyUsers: [
      { day: 'Sunday', users: 0 },
      { day: 'Monday', users: 1 },
      { day: 'Tuesday', users: 0 },
      { day: 'Wednesday', users: 0 },
      { day: 'Thursday', users: 1 },
      { day: 'Friday', users: 0 },
      { day: 'Saturday', users: 0 }
    ],
    topMessages: [
      { message: 'Hello', count: 34 },
      { message: 'story', count: 4 },
      { message: 'menu', count: 4 },
      { message: 'gg', count: 2 },
      { message: 'continue', count: 2 }
    ],
    topCTAs: [
      { buttonTitle: 'Get started', count: 58, initiated: '' },
      { buttonTitle: 'Story', count: 7, initiated: '' },
      { buttonTitle: 'Work', count: 4, initiated: '' },
      { buttonTitle: 'Story', count: 4, initiated: '' },
      { buttonTitle: 'Json Check', count: 4, initiated: 'Media Block 9051' }
    ],
    topStories: [
      { message: '(hello,hi,heyuu),', count: 1 }
    ],
    platformUsers: [
      {
        platform: 'Website', percentage: 100,
        count: 0
      }
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

  ngOnInit() {
    // Set default dates
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = monthAgo.toISOString().split('T')[0];
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.initializeCharts();
  //   }, 0);
  // }

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

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.analyticsData.dailyUsers.map(d => d.day),
        datasets: [{
          data: this.analyticsData.dailyUsers.map(d => d.users),
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
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 0.2
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

private createPlatformChart() {
    const ctx = this.platformChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    this.platformChart = new Chart(ctx, { // Correctly assigns the new chart instance to 'this.platformChart'
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
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    // Fix: Push the correct variable 'this.platformChart' to the array
    this.charts.push(this.platformChart); 
}

  private createUsersReportChart() {
    const ctx = this.usersReportChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
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
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 2,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createPlatformPieChart() {
    const ctx = this.platformPieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
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
        plugins: {
          legend: {
            display: false
          }
        },
        cutout: '70%'
      }
    });

    this.charts.push(chart);
  }

  setDailyFilter(filter: string) {
    this.dailyFilter = filter;
    // Update chart data based on filter
  }

// setPlatformFilter(filter: 'platform' | 'country' | 'state' | 'city') {
//   this.platformFilter = filter;
//   // Get the data from the service based on the filter
//   const filteredData = this.analyticsService.getPlatformFilteredData(filter);
//   // Update the chart and the local data
//   this.updatePlatformChart(filteredData);
// }

// Get filtered data for the HTML template
// In the getFilteredPlatformData() method
getFilteredPlatformData(): LocationData[] {
  switch (this.platformFilter) {
    case 'platform': // This case will now handle system data
      // Check if systemUsers exists, otherwise fallback
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
private updatePlatformChart(data: any[]) {
  // Re-initialize the chart with the new data
  const chart = this.charts.find(c => c.canvas.id === 'platformChart');
  if (chart) {
    chart.data.labels = data.map(d => d.platform || d.country || d.state || d.city);
    chart.data.datasets[0].data = data.map(d => d.count || d.percentage);
    chart.update();
  }
}

  setCTAFilter(filter: string) {
    this.ctaFilter = filter;
    // Update table data based on filter
  }

  getPlatformColor(platform: string): string {
    const colors = {
      'Website': '#06b6d4',
      'Facebook': '#1877f2',
      'WhatsApp': '#25d366',
      'Telegram': '#0088cc'
    };
    return colors[platform as keyof typeof colors] || '#06b6d4';
  }

  // Method to update analytics data (call this when you get new data from your API)
  updateAnalyticsData(newData: Partial<AnalyticsData>) {
    this.analyticsData = { ...this.analyticsData, ...newData };
    this.updateCharts();
  }

  private updateCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
    setTimeout(() => {
      this.initializeCharts();
    }, 0);
  }

  //   getFilteredPlatformData() {
  //   switch (this.platformFilter) {
  //     case 'Platform':
  //       return this.analyticsService.getCurrentData().platformUsers;
  //     case 'Country':
  //       return this.analyticsService.getCurrentData().countryUsers;
  //     case 'State':
  //       return this.analyticsService.getCurrentData().stateUsers;
  //     case 'City':
  //       return this.analyticsService.getCurrentData().cityUsers;
  //     default:
  //       return this.analyticsService.getCurrentData().platformUsers;
  //   }
  // }

  // Hover event methods
  onHover(item: any) {
    this.hoveredItem = item;
  }

  onMouseLeave() {
    this.hoveredItem = null;
  }
   // New method to update all charts with new data
  private updateAllCharts() {
    this.updateDailyUsersChart();
    this.updatePlatformChartData();
    // ... update other charts
  }

  // New method to update the platform chart specifically
  private updatePlatformChartData() {
    if (this.platformChart) {
      const data = this.getFilteredPlatformData();
      const labels = data.map(item => item.system || item.platform || item.country || item.state || item.city || '');
      const chartData = data.map(item => item.count);
     const backgroundColors = data.map(item => {
  // Use a fallback value. If item.platform is undefined, pass an empty string.
  // This will prevent the type error.
  const platformName = item.platform || ''; 
  return this.getPlatformColor(platformName);
});
      this.platformChart.data.labels = labels;
      this.platformChart.data.datasets[0].data = chartData;
      (this.platformChart.data.datasets[0] as any).backgroundColor = backgroundColors;

      // This is the key step: tell Chart.js to re-render
      this.platformChart.update();
    }
  }

  // Corrected setPlatformFilter
  setPlatformFilter(filter: 'platform' | 'country' | 'state' | 'city') {
    this.platformFilter = filter;
    this.updatePlatformChartData();
  }
}