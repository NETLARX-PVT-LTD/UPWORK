// src/app/services/chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, delay, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface ChatMessage {
  message: string;
  sessionId?: string;
  timestamp: string;
  botId: string;
  userId?: string;
  metadata?: any;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  timestamp: string;
  confidence?: number;
  suggestions?: string[];
  quickReplies?: string[];
  attachments?: any[];
}

export interface BotConfiguration {
  id: string;
  name: string;
  story: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    borderRadius: string;
  };
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large';
  greeting: string;
  placeholder: string;
  allowFullscreen: boolean;
  showBranding: boolean;
  backgroundStyle: 'gradient' | 'plain-primary' | 'plain-secondary';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  domain?: string;
  allowedDomains?: string[];
}

export interface LandingPageConfig {
  title: string;
  description: string;
  backgroundStyle: 'gradient' | 'plain-primary' | 'plain-secondary';
  customCss?: string;
  logo?: string;
  favicon?: string;
  seoSettings?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
}

export interface ChatSession {
  id: string;
  botId: string;
  messages: Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    metadata?: any;
  }>;
  startedAt: Date;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  metadata?: any;
}

export interface PublishSettings {
  botId: string;
  embedCode: string;
  landingPageUrl: string;
  apiKey: string;
  webhookUrl?: string;
  allowedDomains: string[];
  rateLimit: {
    messagesPerMinute: number;
    messagesPerHour: number;
  };
  analytics: {
    trackConversations: boolean;
    trackUserInteractions: boolean;
    googleAnalyticsId?: string;
  };
}

export interface EmailIntegration {
  to: string;
  subject: string;
  botId: string;
  apiKey: string;
  landingUrl: string;
  embedCode: string;
  customMessage?: string;
  includeInstructions: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'https://api.yourservice.com'; // Replace with your API URL
  private localStorageKey = 'chatbot_configurations';
  
  // Subject for real-time updates
  private configUpdateSubject = new BehaviorSubject<BotConfiguration | null>(null);
  public configUpdates$ = this.configUpdateSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Bot Configuration Methods
  createBot(config: Partial<BotConfiguration>): Observable<BotConfiguration> {
    const newBot: BotConfiguration = {
      id: this.generateBotId(),
      name: config.name || 'New Chatbot',
      story: config.story || 'hello',
      theme: {
        primaryColor: '#4f46e5',
        secondaryColor: '#f3f4f6',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px',
        ...config.theme
      },
      position: config.position || 'bottom-right',
      size: config.size || 'medium',
      greeting: config.greeting || 'Hi! How can I help you today?',
      placeholder: config.placeholder || 'Type your message...',
      allowFullscreen: config.allowFullscreen ?? true,
      showBranding: config.showBranding ?? false,
      backgroundStyle: config.backgroundStyle || 'gradient',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...config
    };

    return this.saveBot(newBot);
  }

  saveBot(bot: BotConfiguration): Observable<BotConfiguration> {
    // In a real application, this would be an HTTP request
    // For now, we'll simulate with localStorage
    const savedBots = this.getSavedBots();
    const existingIndex = savedBots.findIndex(b => b.id === bot.id);
    
    bot.updatedAt = new Date().toISOString();
    
    if (existingIndex >= 0) {
      savedBots[existingIndex] = bot;
    } else {
      savedBots.push(bot);
    }

    localStorage.setItem(this.localStorageKey, JSON.stringify(savedBots));
    this.configUpdateSubject.next(bot);

    return of(bot).pipe(delay(500)); // Simulate network delay
  }

  getBotConfiguration(botId: string): Observable<BotConfiguration | null> {
    const savedBots = this.getSavedBots();
    const bot = savedBots.find(b => b.id === botId);
    return of(bot || null).pipe(delay(300));
  }

  getAllBots(): Observable<BotConfiguration[]> {
    return of(this.getSavedBots()).pipe(delay(300));
  }

  deleteBot(botId: string): Observable<boolean> {
    const savedBots = this.getSavedBots();
    const filteredBots = savedBots.filter(b => b.id !== botId);
    localStorage.setItem(this.localStorageKey, JSON.stringify(filteredBots));
    return of(true).pipe(delay(300));
  }

  // Publishing Methods
  generateEmbedCode(botId: string, customConfig?: any): Observable<string> {
    return this.getBotConfiguration(botId).pipe(
      map(bot => {
        if (!bot) throw new Error('Bot not found');
        
        const config = { ...bot, ...customConfig };
        return this.buildEmbedCode(bot.id, config);
      })
    );
  }

  generatePublishSettings(botId: string): Observable<PublishSettings> {
    return this.getBotConfiguration(botId).pipe(
      map(bot => {
        if (!bot) throw new Error('Bot not found');
        
        return {
          botId: bot.id,
          embedCode: this.buildEmbedCode(bot.id, bot),
          landingPageUrl: `${window.location.origin}/landing/${bot.id}`,
          apiKey: this.generateApiKey(),
          allowedDomains: bot.allowedDomains || ['*'],
          rateLimit: {
            messagesPerMinute: 30,
            messagesPerHour: 500
          },
          analytics: {
            trackConversations: true,
            trackUserInteractions: true
          }
        };
      })
    );
  }

  // Landing Page Methods
  saveLandingPageConfig(botId: string, config: LandingPageConfig): Observable<boolean> {
    const key = `landing_${botId}`;
    localStorage.setItem(key, JSON.stringify(config));
    return of(true).pipe(delay(300));
  }

  getLandingPageConfig(botId: string): Observable<LandingPageConfig | null> {
    const key = `landing_${botId}`;
    const config = localStorage.getItem(key);
    return of(config ? JSON.parse(config) : null).pipe(delay(300));
  }

  // Email Integration
  sendIntegrationEmail(emailData: EmailIntegration): Observable<boolean> {
    // In a real application, this would send an email via your backend
    console.log('Sending integration email:', emailData);
    
    // Simulate email sending
    return of(true).pipe(
      delay(2000),
      tap(() => {
        // Store email history for reference
        const history = JSON.parse(localStorage.getItem('email_history') || '[]');
        history.push({
          ...emailData,
          sentAt: new Date().toISOString()
        });
        localStorage.setItem('email_history', JSON.stringify(history));
      })
    );
  }

  // Chat Methods
  sendMessage(message: ChatMessage): Observable<ChatResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.generateApiKey()}`
    });

    // Simulate API call with mock responses
    return this.simulateBotResponse(message).pipe(
      delay(1000 + Math.random() * 2000),
      tap(response => {
        // Save message to session history
        this.saveMessageToSession(message, response);
      }),
      catchError(error => {
        console.error('Chat API error:', error);
        return throwError(() => new Error('Failed to get bot response'));
      })
    );
  }

  createChatSession(botId: string): Observable<ChatSession> {
    const session: ChatSession = {
      id: this.generateSessionId(),
      botId,
      messages: [],
      startedAt: new Date(),
      lastActivity: new Date(),
      userAgent: navigator.userAgent,
      metadata: {}
    };

    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    sessions.push(session);
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));

    return of(session).pipe(delay(200));
  }

  getChatSession(sessionId: string): Observable<ChatSession | null> {
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const session = sessions.find((s: ChatSession) => s.id === sessionId);
    return of(session || null);
  }

  // Analytics Methods
  trackConversation(botId: string, sessionId: string, event: string, data?: any): Observable<boolean> {
    const analyticsData = {
      botId,
      sessionId,
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store analytics locally (in production, send to analytics service)
    const analytics = JSON.parse(localStorage.getItem('bot_analytics') || '[]');
    analytics.push(analyticsData);
    localStorage.setItem('bot_analytics', JSON.stringify(analytics));

    return of(true);
  }

  getAnalytics(botId: string, dateFrom?: Date, dateTo?: Date): Observable<any[]> {
    const analytics = JSON.parse(localStorage.getItem('bot_analytics') || '[]');
    const filtered = analytics.filter((item: any) => {
      if (item.botId !== botId) return false;
      if (dateFrom && new Date(item.timestamp) < dateFrom) return false;
      if (dateTo && new Date(item.timestamp) > dateTo) return false;
      return true;
    });

    return of(filtered).pipe(delay(500));
  }

  // Utility Methods
  private getSavedBots(): BotConfiguration[] {
    const saved = localStorage.getItem(this.localStorageKey);
    return saved ? JSON.parse(saved) : [];
  }

  private buildEmbedCode(botId: string, config: BotConfiguration): string {
    const baseUrl = window.location.origin;
    return `<!-- Chatbot Widget -->
<div id="chatbot-widget-${botId}"></div>
<script>
  window.ChatbotConfig = {
    id: "${botId}",
    name: "${config.name}",
    story: "${config.story}",
    theme: ${JSON.stringify(config.theme)},
    position: "${config.position}",
    size: "${config.size}",
    greeting: "${config.greeting}",
    placeholder: "${config.placeholder}",
    showBranding: ${config.showBranding},
    allowFullscreen: ${config.allowFullscreen}
  };
  
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/assets/chatbot-embed.js';
    script.async = true;
    script.onload = function() {
      if (window.ChatbotWidget) {
        window.ChatbotWidget.init({
          containerId: 'chatbot-widget-${botId}',
          widgetUrl: '${baseUrl}/chatbot-widget?id=${botId}',
          config: window.ChatbotConfig
        });
      }
    };
    document.head.appendChild(script);
  })();
</script>`;
  }

  private simulateBotResponse(message: ChatMessage): Observable<ChatResponse> {
    const responses = [
      "Thanks for your message! How can I assist you further?",
      "That's interesting! Let me help you with that.",
      "I understand. What would you like to know more about?",
      "Great question! Here's what I think about that...",
      "I'm here to help! Could you provide more details?",
      "Let me see how I can assist you with this request.",
      "That's a good point. Have you considered these options?",
      "I'd be happy to help you solve this problem."
    ];

    const response: ChatResponse = {
      reply: responses[Math.floor(Math.random() * responses.length)],
      sessionId: message.sessionId || this.generateSessionId(),
      timestamp: new Date().toISOString(),
      confidence: 0.8 + Math.random() * 0.2,
      suggestions: [
        "Tell me more about this",
        "What are my options?",
        "Can you help me with something else?"
      ]
    };

    return of(response);
  }

  private saveMessageToSession(message: ChatMessage, response: ChatResponse): void {
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    let session = sessions.find((s: ChatSession) => s.id === response.sessionId);
    
    if (!session) {
      session = {
        id: response.sessionId,
        botId: message.botId,
        messages: [],
        startedAt: new Date(),
        lastActivity: new Date()
      };
      sessions.push(session);
    }

    // Add user message
    session.messages.push({
      id: this.generateMessageId(),
      text: message.message,
      isUser: true,
      timestamp: new Date(message.timestamp)
    });

    // Add bot response
    session.messages.push({
      id: this.generateMessageId(),
      text: response.reply,
      isUser: false,
      timestamp: new Date(response.timestamp)
    });

    session.lastActivity = new Date();
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }

  private generateBotId(): string {
    return 'bot_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Domain validation for security
  validateDomain(botId: string, domain: string): Observable<boolean> {
    return this.getBotConfiguration(botId).pipe(
      map(bot => {
        if (!bot || !bot.allowedDomains) return true; // Allow all if not configured
        if (bot.allowedDomains.includes('*')) return true;
        return bot.allowedDomains.some(allowedDomain => {
          if (allowedDomain.startsWith('*.')) {
            const wildcardDomain = allowedDomain.substr(2);
            return domain.endsWith(wildcardDomain);
          }
          return domain === allowedDomain;
        });
      })
    );
  }

  // Rate limiting
  checkRateLimit(sessionId: string, botId: string): Observable<boolean> {
    const rateLimitKey = `rate_limit_${sessionId}`;
    const rateLimitData = JSON.parse(localStorage.getItem(rateLimitKey) || '{"count": 0, "lastReset": ""}');
    
    const now = new Date();
    const lastReset = new Date(rateLimitData.lastReset || now);
    const timeDiff = now.getTime() - lastReset.getTime();
    
    // Reset counter every minute
    if (timeDiff > 60000) {
      rateLimitData.count = 0;
      rateLimitData.lastReset = now.toISOString();
    }
    
    rateLimitData.count++;
    localStorage.setItem(rateLimitKey, JSON.stringify(rateLimitData));
    
    // Allow 30 messages per minute
    return of(rateLimitData.count <= 30);
  }
}