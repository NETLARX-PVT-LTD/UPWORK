import { Routes } from '@angular/router';
import { ChatbotFlowComponent } from './chatbot-flow/chatbot-flow.component';
import { MediaBlockPageComponent } from './media-block-page/media-block-page.component';

export const routes: Routes = [
  // Your other routes
  { path: 'media-blocks', component: MediaBlockPageComponent },

  // Route for your Create Story page
  { path: 'create-story', component: ChatbotFlowComponent },

  // Optional: A default route to redirect to the 'create-story' page
  { path: '', redirectTo: '/create-story', pathMatch: 'full' },
];