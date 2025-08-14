// src/app/shared/services/whatsapp.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface WhatsAppConfig {
  botId: string;
  botName: string;
  phoneNumber: string;
  apiType: 'meta-cloud' | 'd360';
  webhookUrl: string;
  accessToken: string;
  verifyToken: string;
  phoneNumberId?: string;
  businessAccountId?: string;
}

export interface ApiTestResult {
  success: boolean;
  message: string;
  responseTime?: string;
  status?: string;
  error?: any;
  details?: {
    accountId: string;
    accountName: string;
    phoneNumber: string;
    apiVersion: string;
    features: string[];
  };
}

export interface PublishResult {
  success: boolean;
  message: string;
  botId?: string;
  publishedAt?: Date;
  whatsappTestUrl?: string;
}

export interface BotStatus {
  botId: string;
  isActive: boolean;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastSeen?: Date;
  messagesSent?: number;
  messagesReceived?: number;
  webhookStatus?: 'verified' | 'failed' | 'pending';
}

export interface WebhookValidationResult {
  success: boolean;
  message: string;
  verifyToken?: string;
  challenge?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'button' | 'list';
  options?: string[];
}

export interface BotConversation {
  botId: string;
  botName: string;
  messages: ChatMessage[];
  isActive: boolean;
  userPhone?: string;
}

export interface LeadData {
  name: string;
  email: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private readonly DEMO_WHATSAPP_URL = 'https://web.whatsapp.com';

  private botStatusSubject = new BehaviorSubject<BotStatus | null>(null);
  public botStatus$ = this.botStatusSubject.asObservable();

  private publishedBots: Map<string, WhatsAppConfig> = new Map();
  private botConversations: Map<string, BotConversation> = new Map();
  private activeSessions: Map<string, any> = new Map();
  private leads: LeadData[] = [];

  private products: { [key: string]: { name: string; price: number; description: string } } = {
    "laptop": { name: "Laptop", price: 999, description: "High-performance laptop for work and gaming." },
    "phone": { name: "Phone", price: 499, description: "Latest smartphone with great camera." },
    "headphones": { name: "Headphones", price: 99, description: "Noise-cancelling wireless headphones." }
  };

  private responses = {
    "greeting": "Hello! Welcome to Dummy Botsify Bot. How can I help? Type 'menu' for options.",
    "menu": "Options:\n1. Product Info\n2. Support\n3. Buy/Checkout\n4. Feedback\n5. Switch Language (English/Spanish)\nType a number or keyword.",
    "product_info": "Available products: laptop, phone, headphones. Type the name for details.",
    "support": "What issue are you facing? (e.g., 'order status', 'return')",
    "buy": "What product do you want to buy? (e.g., 'laptop')",
    "feedback": "Please share your feedback: ",
    "cart_reminder": "You have items in your cart! Complete purchase for 10% off.",
    "discount": "Use code DUMMY10 for 10% off!",
    "lead_form": "To generate a lead, provide your name and email:",
    "order_update": "Your dummy order #123 is shipped. Tracking: DUMMY-TRACK-001.",
    "exit": "Thanks for chatting! Goodbye.",
    "unknown": "Sorry, I didn't understand. Type 'menu' for options."
  };

  private responses_es = {
    "greeting": "¡Hola! Bienvenido al Bot Dummy Botsify. ¿Cómo puedo ayudar? Escribe 'menú' para opciones.",
    "menu": "Opciones:\n1. Info de Producto\n2. Soporte\n3. Comprar/Pago\n4. Feedback\n5. Cambiar Idioma (English/Spanish)\nEscribe un número o palabra clave.",
    "product_info": "Productos disponibles: laptop, phone, headphones. Escribe el nombre para detalles.",
    "support": "¿Qué problema tienes? (e.g., 'estado de orden', 'devolución')",
    "buy": "¿Qué producto quieres comprar? (e.g., 'laptop')",
    "feedback": "Por favor comparte tu feedback: ",
    "cart_reminder": "¡Tienes items en tu carrito! Completa la compra para 10% off.",
    "discount": "Usa código DUMMY10 para 10% off!",
    "lead_form": "Para generar un lead, proporciona tu nombre y email:",
    "order_update": "Tu orden dummy #123 ha sido enviada. Tracking: DUMMY-TRACK-001.",
    "exit": "¡Gracias por chatear! Adiós.",
    "unknown": "Lo siento, no entendí. Escribe 'menú' para opciones."
  };

  private language: string = "en";

  constructor(private http: HttpClient) {
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    const demoBots = [
      {
        botId: '123456',
        botName: 'Customer Support Bot',
        phoneNumber: '+923313014733',
        apiType: 'meta-cloud' as const,
        webhookUrl: 'https://demo-webhook.com/whatsapp',
        accessToken: 'demo_access_token_123',
        verifyToken: 'demo_verify_123'
      }
    ];

    demoBots.forEach(bot => {
      this.publishedBots.set(bot.botId, bot);
      this.initializeBotConversation(bot.botId, bot.botName);
    });
  }

  private initializeBotConversation(botId: string, botName: string): void {
    this.botConversations.set(botId, {
      botId,
      botName,
      messages: [],
      isActive: true
    });
  }

  generateBotId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  validateWebhook(webhookUrl: string, verifyToken: string): Observable<WebhookValidationResult> {
    return of({
      success: true,
      message: 'Webhook validated successfully',
      verifyToken,
      challenge: 'dummy_challenge_123'
    }).pipe(delay(1000));
  }

  testWhatsAppConnection(config: WhatsAppConfig): Observable<ApiTestResult> {
    return of({
      success: true,
      message: 'Connection test successful',
      responseTime: '200ms',
      status: 'connected',
      details: {
        accountId: 'acc_123',
        accountName: 'Demo Account',
        phoneNumber: config.phoneNumber,
        apiVersion: 'v18.0',
        features: ['messaging', 'webhooks']
      }
    }).pipe(delay(1000));
  }

  sendTestMessage(config: WhatsAppConfig, to: string, message: string): Observable<any> {
    return of({ success: true, message: 'Test message sent' }).pipe(delay(1000));
  }

  publishBot(config: WhatsAppConfig): Observable<PublishResult> {
    return of({
      success: true,
      message: 'Bot published successfully',
      botId: config.botId,
      publishedAt: new Date(),
      whatsappTestUrl: 'https://web.whatsapp.com/test?botId=' + config.botId
    }).pipe(delay(2000)); // Simulate API call delay
  }

  unpublishBot(botId: string): Observable<any> {
    return of({ success: true, message: 'Bot unpublished' }).pipe(delay(1000));
  }

  openWhatsAppWebForTesting(botId: string): Window | null {
    return window.open(`${this.DEMO_WHATSAPP_URL}/test?botId=${botId}`, '_blank', 'noopener,noreferrer') || null;
  }

  getBotStatus(botId: string): Observable<BotStatus> {
    const status: BotStatus = {
      botId,
      isActive: true,
      status: 'active',
      lastSeen: new Date(),
      messagesSent: 10,
      messagesReceived: 5,
      webhookStatus: 'verified'
    };
    return of(status).pipe(delay(1000));
  }

  exportBotConfiguration(botId: string): any {
    const config = this.publishedBots.get(botId);
    return config ? { botConfiguration: config } : null;
  }

  getBotResponse(botId: string, userInput: string): Observable<string> {
    const conversation = this.botConversations.get(botId);
    if (!conversation) return of("Bot not found.");

    const res = this.language === "en" ? this.responses : this.responses_es;

    let response = res["unknown"];
    if (userInput.includes("menu") || userInput.includes("menú")) {
      response = res["menu"];
    } else if (userInput.includes("product") || userInput.includes("info") || userInput.includes("producto")) {
      response = res["product_info"];
    } else if (Object.keys(this.products).some(p => userInput.includes(p))) {
      const product = Object.keys(this.products).find(p => userInput.includes(p));
      if (product) {
        const details = this.products[product as keyof typeof this.products];
        response = `${details.name}: ${details.description} Price: $${details.price}. Type 'buy ${product}' to purchase.`;
      }
    } else if (userInput.includes("support") || userInput.includes("soporte")) {
      response = res["support"];
    } else if (userInput.includes("order status") || userInput.includes("estado de orden")) {
      response = res["order_update"];
    } else if (userInput.includes("buy") || userInput.includes("comprar")) {
      response = res["buy"];
    } else if (userInput.includes("feedback")) {
      response = res["feedback"];
    } else if (userInput.includes("cart")) {
      response = res["cart_reminder"];
    } else if (userInput.includes("discount")) {
      response = res["discount"];
    } else if (userInput.includes("lead") || userInput.includes("form")) {
      response = res["lead_form"];
    } else if (userInput.includes("switch language") || userInput.includes("cambiar idioma")) {
      this.language = this.language === "en" ? "es" : "en";
      response = "Language switched to " + (this.language === "es" ? "Spanish" : "English");
    } else if (userInput.includes("exit") || userInput.includes("adiós")) {
      response = res["exit"];
    }

    const message: ChatMessage = {
      id: this.generateMessageId(),
      sender: 'bot',
      message: response,
      timestamp: new Date(),
      type: 'text'
    };
    conversation.messages.push(message);
    return of(response).pipe(delay(1000));
  }

  collectLead(botId: string, name: string, email: string): Observable<string> {
    const lead: LeadData = { name, email, timestamp: new Date() };
    this.leads.push(lead);
    return of("Lead captured! Thank you. Here's a dummy discount: DUMMY10").pipe(delay(1000));
  }

  getConversation(botId: string): BotConversation | null {
    return this.botConversations.get(botId) || null;
  }

  getLeads(): LeadData[] {
    return this.leads;
  }

  private generateMessageId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}