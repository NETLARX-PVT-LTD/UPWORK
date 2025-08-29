// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { ChatbotFlowComponent } from './chatbot-flow/chatbot-flow.component';
import { MediaBlockPageComponent } from './media-block-page/media-block-page.component';
import { MediaBlockEditComponent } from './media-block-page/media-block-edit/media-block-edit.component';
import { PublishBotComponent } from './publish-bot/publish-bot.component';
import { ChatbotWidgetComponent } from './chatbot-widget/chatbot-widget.component';
import { ChatbotMenuComponent } from './chatbot-menu/chatbot-menu.component';
import { WhatsappPublisherComponent } from './whatsapp-publisher/whatsapp-publisher.component';
import { InstagramPublisherComponent } from './instagram-publisher/instagram-publisher.component';
import { FacebookPagePublisherComponent } from './facebook-page-publisher/facebook-page-publisher.component';
import { TelegramBotConnectionComponent } from './telegram-bot-connection/telegram-bot-connection.component';
import { TwilioSmsConnectionComponent } from './twilio-sms-connection/twilio-sms-connection.component';
import { BrandingComponent } from './publish-bot/branding/branding.component';
import { AdvancedSettingsComponent } from './publish-bot/advanced-settings/advanced-settings.component';
import { PageMessageComponent } from './publish-bot/page-message/page-message.component';
import { PageMessagesListComponent } from './publish-bot/page-messages-list/page-messages-list.component';
import { Title } from '@angular/platform-browser';
import { PartnerDashboardComponent } from './partner-dashboard/partner-dashboard.component';
import { FormsListComponent } from './forms-list/forms-list.component';
import { FormEditorComponent } from './forms-list/form-editor/form-editor.component';
import { AiAssistantListComponent } from './ai-assistant-list/ai-assistant-list.component';
import { CreateAssistantComponent } from './ai-assistant-list/create-assistant/create-assistant.component';
import { ChatbotAnalyticsComponent } from './chatbot-analytics/chatbot-analytics.component';
import { LiveChatComponent } from './live-chat/live-chat.component';
import { ManageBotStoriesComponent } from './chatbot-flow/manage-bot-stories/manage-bot-stories.component';

export const routes: Routes = [
  // Analytics
  { path: 'chatbot-analytics', component: ChatbotAnalyticsComponent,data: { title: 'Chatbot Analytics' } },
  // live chat
  { path: 'live-chat', component: LiveChatComponent },
// AI Assistants routes
   { path: 'assistants', component: AiAssistantListComponent,data: { title: 'AI Assistants' } },
  { path: 'assistants/create', component: CreateAssistantComponent,data: { title: 'Manage AI Assistant' } },
  { path: 'assistants/edit/:id', component: CreateAssistantComponent,data: { title: 'Manage AI Assistant' } },
  // publish bot on whatsapp
  { path: 'whatsapp-publisher', component: WhatsappPublisherComponent, data: { title: 'Publish Bot' } },
  // Partner dashboard route
  { path: 'partner-dashboard', component: PartnerDashboardComponent },
  // website chatbot advanced settings
  { path: 'advance-settings', component: AdvancedSettingsComponent, data: { title: 'Advance Settings' } },
  // create page messaging 
  { path: 'page-messages', component: PageMessagesListComponent, data: { title: 'Page Messaging' } },
  { path: 'page-messages/create', component: PageMessageComponent, data: {Title: 'Create Page Message'} },
  { path: 'page-messages/edit/:id', component: PageMessageComponent },
  // publish bot on instagram
  { path: 'instagram-publisher', component: InstagramPublisherComponent, data: { title: 'Publish Bot' } },
  // publish bot on facebook
  { path: 'facebook-publisher', component: FacebookPagePublisherComponent, data: { title: 'Publish Bot' } },
  // telegram bot connection
   { path: 'connect-to-telegram', component: TelegramBotConnectionComponent, data: { title: 'Publish Bot' } },
  //  Twilio SMS connection
   { path: 'twilio-sms', component: TwilioSmsConnectionComponent, data: { title: 'Publish Bot' } },
  // The main route for the publishing dashboard
  { path: 'publish-bot', component: PublishBotComponent,data: { title: 'Publish Bot' }  },

  // manage conversational forms 
   { path: 'forms', component: FormsListComponent, data: { title: 'Manage Conversational Forms' } },
  { path: 'forms/create', component: FormEditorComponent,data: { title: 'Create A Form' } },
  { path: 'forms/edit/:id', component: FormEditorComponent,data: { title: 'Edit Chatbot Form' } },
  // The route for the embeddable chatbot widget (used in the iframe)
  { path: 'chatbot-widget', component: ChatbotWidgetComponent },
  // The route for the branding (subtype of website chatbot)
  { path: 'branding', component: BrandingComponent, data: { title: 'Branding' } },
  { 
    path: 'chatbot-menu',
    component: ChatbotMenuComponent,
    data: { title: 'Chatbot Menu' },
    children: [
      // This child route will render its component inside ChatbotMenuComponent's <router-outlet>
      { path: 'create-story', component: ChatbotFlowComponent }
    ]
  },

  // The route for the full-page landing bot
  { path: 'landing/:id', component: ChatbotWidgetComponent },

  // Your other routes
  { path: 'media-blocks', component: MediaBlockPageComponent },
  {
    path: 'media-blocks/new',
    component: MediaBlockEditComponent
  },
  {
    path: 'media-blocks/edit/:id',
    component: MediaBlockEditComponent
  },
  // Route for your Create Story page
  { path: 'create-story', component: ChatbotFlowComponent },
{ path: 'manage-stories', component: ManageBotStoriesComponent,data: { title: 'Manage Bot Stories' } },
  // A default route to redirect to the 'create-story' page
  { path: '', redirectTo: '/create-story', pathMatch: 'full' },
];