import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface AnalyticsData {
  chatbotUsers: number;
  humanHelpRequested: number;
  incomingMessages: number;
  outgoingMessages: number;
  dailyUsers: { day: string; users: number; date: string }[];
  hourlyUsers: { hour: string; users: number; timestamp: string }[];
  topMessages: { message: string; count: number; percentage: number }[];
  topCTAs: { buttonTitle: string; count: number; initiated?: string; type: 'button' | 'quick_reply' }[];
  topStories: { message: string; count: number; flowName: string }[];
  platformUsers: { platform: string; percentage: number; count: number }[];
  countryUsers: { country: string; percentage: number; count: number }[];
  stateUsers: { state: string; percentage: number; count: number }[];
  cityUsers: { city: string; percentage: number; count: number }[];
  usersByTime: { time: string; users: number; timestamp: string }[];
  csatFeedbacks: { rating: number; feedback: string; date: string; userId: string }[];
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  systemUsers: { system: string; percentage: number; count: number }[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotAnalyticsService {
  private analyticsDataSubject = new BehaviorSubject<AnalyticsData>(this.getInitialData());
  public analyticsData$ = this.analyticsDataSubject.asObservable();

  private baseUrl = 'https://api.yourbot.com/analytics'; // Replace with your actual API

  constructor(private http: HttpClient) {
    this.startRealTimeUpdates();
  }

  private getInitialData(): AnalyticsData {
    return {
      chatbotUsers: 0,
      humanHelpRequested: 0,
      incomingMessages: 0,
      outgoingMessages: 0,
      dailyUsers: [],
      hourlyUsers: [],
      topMessages: [],
      topCTAs: [],
      topStories: [],
      platformUsers: [],
      countryUsers: [],
      systemUsers: [], 
      stateUsers: [],
      cityUsers: [],
      usersByTime: [],
      csatFeedbacks: [],
      conversionRate: 0,
      averageSessionDuration: 0,
      bounceRate: 0
    };
  }

  // Fetch analytics data from API
  fetchAnalyticsData(dateRange: DateRange): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.baseUrl}/data`, {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    });
  }

  // Add a new method to generate mock system user data
  private generateSystemUsers(): any[] {
    const systems = [
      { system: 'Windows 10', count: Math.floor(Math.random() * 500) + 100 },
      { system: 'Mac', count: Math.floor(Math.random() * 300) + 50 },
      { system: 'Android', count: Math.floor(Math.random() * 200) + 30 },
      { system: 'iOS', count: Math.floor(Math.random() * 150) + 20 }
    ];

    const total = systems.reduce((sum, p) => sum + p.count, 0);
    return systems.map(p => ({
      ...p,
      percentage: Math.round((p.count / total) * 100)
    }));
  }

  // Update analytics data and notify subscribers
  updateAnalyticsData(dateRange: DateRange): void {
    // In a real implementation, this would call your API
    // For now, we'll simulate with mock data
    this.simulateApiCall(dateRange).then(data => {
      this.analyticsDataSubject.next(data);
    });
  }

  // Get current analytics data
  getCurrentData(): AnalyticsData {
    return this.analyticsDataSubject.value;
  }

  // Filter data by date range
  filterByDateRange(startDate: string, endDate: string): void {
    this.updateAnalyticsData({ startDate, endDate });
  }

  // Get filtered daily/hourly data
  getTimeFilteredData(filter: 'day' | 'hour', dateRange: DateRange): any[] {
    const currentData = this.getCurrentData();
    
    if (filter === 'hour') {
      return this.generateHourlyData(dateRange);
    } else {
      return this.generateDailyData(dateRange);
    }
  }

  // Get platform filtered data
  getPlatformFilteredData(filter: 'platform' | 'country' | 'state' | 'city'): any[] {
    const currentData = this.getCurrentData();
    
    switch (filter) {
      case 'platform':
        return currentData.platformUsers;
      case 'country':
        return currentData.countryUsers;
      case 'state':
        return currentData.stateUsers;
      case 'city':
        return currentData.cityUsers;
      default:
        return currentData.platformUsers;
    }
  }

  // Get CTA filtered data
  getCTAFilteredData(filter: 'buttons' | 'quick_replies'): any[] {
    const currentData = this.getCurrentData();
    return currentData.topCTAs.filter(cta => 
      filter === 'buttons' ? cta.type === 'button' : cta.type === 'quick_reply'
    );
  }

  // Export data functionality
  exportData(format: 'csv' | 'excel' | 'pdf', dateRange: DateRange): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, {
      params: {
        format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      },
      responseType: 'blob'
    });
  }

  // Real-time updates simulation
  private startRealTimeUpdates(): void {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
      const currentData = this.getCurrentData();
      const updatedData = this.simulateRealTimeUpdate(currentData);
      this.analyticsDataSubject.next(updatedData);
    }, 30000);
  }

  private simulateRealTimeUpdate(currentData: AnalyticsData): AnalyticsData {
    return {
      ...currentData,
      chatbotUsers: currentData.chatbotUsers + Math.floor(Math.random() * 3),
      incomingMessages: currentData.incomingMessages + Math.floor(Math.random() * 10),
      outgoingMessages: currentData.outgoingMessages + Math.floor(Math.random() * 15),
      humanHelpRequested: currentData.humanHelpRequested + Math.floor(Math.random() * 2)
    };
  }

  // Mock data generation for demonstration
  private async simulateApiCall(dateRange: DateRange): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const days = this.getDaysBetween(new Date(dateRange.startDate), new Date(dateRange.endDate));
    
    return {
      chatbotUsers: Math.floor(Math.random() * 1000) + 100,
      humanHelpRequested: Math.floor(Math.random() * 50) + 10,
      incomingMessages: Math.floor(Math.random() * 5000) + 1000,
      outgoingMessages: Math.floor(Math.random() * 7000) + 1500,
      dailyUsers: this.generateDailyData(dateRange),
      hourlyUsers: this.generateHourlyData(dateRange),
      topMessages: this.generateTopMessages(),
      topCTAs: this.generateTopCTAs(),
      topStories: this.generateTopStories(),
      platformUsers: this.generatePlatformUsers(),
      countryUsers: this.generateCountryUsers(),
      stateUsers: this.generateStateUsers(),
      cityUsers: this.generateCityUsers(),
      usersByTime: this.generateUsersByTime(),
      csatFeedbacks: this.generateCSATFeedbacks(),
      conversionRate: Math.random() * 20 + 5,
      averageSessionDuration: Math.random() * 300 + 60,
      bounceRate: Math.random() * 40 + 10,
      systemUsers: this.generateSystemUsers(),
    };
  }

  private generateDailyData(dateRange: DateRange): any[] {
    const data = [];
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      data.push({
        day: d.toLocaleDateString('en-US', { weekday: 'long' }),
        users: Math.floor(Math.random() * 50) + 10,
        date: d.toISOString().split('T')[0]
      });
    }
    
    return data;
  }

  private generateHourlyData(dateRange: DateRange): any[] {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      data.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        users: Math.floor(Math.random() * 20) + 1,
        timestamp: new Date().toISOString()
      });
    }
    return data;
  }

  private generateTopMessages(): any[] {
    const messages = ['Hello', 'Help', 'Menu', 'Contact', 'About', 'Services', 'Pricing', 'Support'];
    return messages.slice(0, 5).map(msg => ({
      message: msg,
      count: Math.floor(Math.random() * 100) + 10,
      percentage: Math.random() * 30 + 5
    })).sort((a, b) => b.count - a.count);
  }

  private generateTopCTAs(): any[] {
    const ctas = [
      { buttonTitle: 'Get Started', type: 'button' as const },
      { buttonTitle: 'Learn More', type: 'button' as const },
      { buttonTitle: 'Contact Us', type: 'quick_reply' as const },
      { buttonTitle: 'View Pricing', type: 'button' as const },
      { buttonTitle: 'Book Demo', type: 'quick_reply' as const },
      { buttonTitle: 'Help', type: 'quick_reply' as const },
      { buttonTitle: 'Yes', type: 'quick_reply' as const },
      { buttonTitle: 'No', type: 'quick_reply' as const }
    ];
    
    return ctas.map(cta => ({
      ...cta,
      count: Math.floor(Math.random() * 200) + 50,
      initiated: Math.random() > 0.5 ? `Flow ${Math.floor(Math.random() * 100)}` : ''
    })).sort((a, b) => b.count - a.count);
  }

  private generateTopStories(): any[] {
    const stories = ['Welcome Flow', 'Product Info', 'Support Flow', 'Pricing Info', 'Contact Form'];
    return stories.map(story => ({
      message: story,
      count: Math.floor(Math.random() * 50) + 5,
      flowName: `${story} Flow`
    })).sort((a, b) => b.count - a.count);
  }

  private generatePlatformUsers(): any[] {
    const platforms = [
      { platform: 'Website', count: Math.floor(Math.random() * 500) + 100 },
      { platform: 'Facebook', count: Math.floor(Math.random() * 300) + 50 },
      { platform: 'WhatsApp', count: Math.floor(Math.random() * 200) + 30 },
      { platform: 'Telegram', count: Math.floor(Math.random() * 150) + 20 }
    ];
    
    const total = platforms.reduce((sum, p) => sum + p.count, 0);
    return platforms.map(p => ({
      ...p,
      percentage: Math.round((p.count / total) * 100)
    }));
  }

  private generateCountryUsers(): any[] {
    const countries = ['United States', 'India', 'United Kingdom', 'Canada', 'Australia'];
    const total = 1000;
    let remaining = total;
    
    return countries.map((country, index) => {
      const count = index === countries.length - 1 ? remaining : Math.floor(Math.random() * remaining * 0.4);
      remaining -= count;
      return {
        country,
        count,
        percentage: Math.round((count / total) * 100)
      };
    });
  }

  private generateStateUsers(): any[] {
    const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];
    return this.generateLocationData(states, 'state');
  }

  private generateCityUsers(): any[] {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    return this.generateLocationData(cities, 'city');
  }

  private generateLocationData(locations: string[], type: string): any[] {
    const total = 1000;
    let remaining = total;
    
    return locations.map((location, index) => {
      const count = index === locations.length - 1 ? remaining : Math.floor(Math.random() * remaining * 0.4);
      remaining -= count;
      return {
        [type]: location,
        count,
        percentage: Math.round((count / total) * 100)
      };
    });
  }

  private generateUsersByTime(): any[] {
    const times = [];
    for (let hour = 0; hour < 24; hour += 0.5) {
      const h = Math.floor(hour);
      const m = (hour % 1) === 0 ? '00' : '30';
      times.push({
        time: `${h.toString().padStart(2, '0')}:${m}`,
        users: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date().toISOString()
      });
    }
    return times;
  }

  private generateCSATFeedbacks(): any[] {
    const feedbacks = [
      'Great service!',
      'Could be better',
      'Very helpful bot',
      'Fast response time',
      'Needs improvement'
    ];
    
    return feedbacks.map(feedback => ({
      rating: Math.floor(Math.random() * 5) + 1,
      feedback,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      userId: `user_${Math.floor(Math.random() * 1000)}`
    }));
  }

  private getDaysBetween(start: Date, end: Date): number {
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}