// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for standalone components
import { RouterModule, RouterOutlet } from '@angular/router'; // Keep if you use Angular Routing, otherwise remove

// Import your ChatbotFlowComponent here
import { ChatbotFlowComponent } from './chatbot-flow/chatbot-flow.component';

@Component({
  selector: 'app-root',
  standalone: true, // AppComponent is also a standalone component
  imports: [
    RouterModule,
    CommonModule, // Keep if you use routing, otherwise remove
    ChatbotFlowComponent // <--- Add ChatbotFlowComponent here
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-chatbot-app';
}