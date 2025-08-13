// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { ChatbotFlowComponent } from './chatbot-flow/chatbot-flow.component';
import { MediaBlockPageComponent } from './media-block-page/media-block-page.component';
import { MediaBlockEditComponent } from './media-block-page/media-block-edit/media-block-edit.component';
import { PublishBotComponent } from './publish-bot/publish-bot.component';
import { ChatbotWidgetComponent } from './chatbot-widget/chatbot-widget.component';
import { ChatbotMenuComponent } from './chatbot-menu/chatbot-menu.component';
import { WhatsappPublisherComponent } from './whatsapp-publisher/whatsapp-publisher.component';

export const routes: Routes = [
  // publish bot on whatsapp
  { path: 'whatsapp-publisher', component: WhatsappPublisherComponent, data: { title: 'Publish Bot' } },
  // The main route for the publishing dashboard
  { path: 'publish-bot', component: PublishBotComponent,data: { title: 'Publish Bot' }  },

  // The route for the embeddable chatbot widget (used in the iframe)
  { path: 'chatbot-widget', component: ChatbotWidgetComponent },
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

  // A default route to redirect to the 'create-story' page
  { path: '', redirectTo: '/create-story', pathMatch: 'full' },
];