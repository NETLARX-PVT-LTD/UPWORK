import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FileManagerComponent } from '../file-manager/file-manager.component';
import { WebsiteManagerComponent } from '../website-manager/website-manager.component';

interface AssistantForm {
  platform: string;
  apiKey: string;
  name: string;
  model: string;
  instructions: string;
  source: string;
   maxToken: number;
  temperature: number;
  topP: number;
}
class ChatbotMenuService {
  isValidUrl(url: string): boolean {
    // Simple URL validation logic
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}

interface MenuButton {
  isActive: boolean;
}

@Component({
  selector: 'app-create-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, WebsiteManagerComponent, FileManagerComponent],
  templateUrl: './create-assistant.component.html',
  styleUrl: './create-assistant.component.scss'
})
export class CreateAssistantComponent {
  currentTab = signal('settings');
  assistantCreated = false;
  showAdvanceSettings = false;
  fallbackType = 'text';
  fallbackMessage = "I'm sorry, I couldn't find the information you're looking for at the moment. Please feel free to rephrase your question or contact our support team for further assistance.";
  // --- New properties and methods to integrate from CreateAiAssistantComponent ---
  showVariableDropdown: boolean = false;
  searchVariable: string = '';
  availableStories: string[] = ['Story 1', 'Story 2', 'Story 3']; // Mock data

  // The 'onTabChange' method is not needed as the logic is handled directly in the HTML click handler
  // (click)="fallbackType = 'text'".

  toggleVariableDropdown(event: Event): void {
    event.stopPropagation();
    this.showVariableDropdown = !this.showVariableDropdown;
  }

  onVariableSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchVariable = input.value;
  }

  getFilteredVariables(): any[] {
    const mockVariables = [
      { category: 'User Info', variables: [{ display: '{{User Name}}', value: 'user_name' }] },
      { category: 'Date & Time', variables: [{ display: '{{Current Date}}', value: 'current_date' }] },
    ];
    if (!this.searchVariable) {
      return mockVariables;
    }
    const searchTerm = this.searchVariable.toLowerCase();
    return mockVariables.map(cat => ({
      ...cat,
      variables: cat.variables.filter(v => v.display.toLowerCase().includes(searchTerm)),
    })).filter(cat => cat.variables.length > 0);
  }

  insertVariable(variable: any, event: Event): void {
    event.stopPropagation();
    this.fallbackMessage += variable.display;
    this.showVariableDropdown = false;
  }

  openCreateStoryModal(): void {
    // Logic for modal (will not be implemented here, but the method should exist)
    console.log('Opening create story modal...');
  }

  // --- End of new additions ---
  formData: AssistantForm = {
    platform: 'openai',
    apiKey: '',
    name: '',
    model: '',
    instructions: `Act Human, Stay Professional

Always speak as a first-party representative of the company — not as an AI or third-party chatbot.

Your responses should reflect empathy, attentiveness, and clarity—as if you were a real human support agent.

Use Only Trained Information

Your responses must be based solely on the information you have been trained on.

If you're confident that the answer is covered in the trained content, respond accordingly.

When available, include relevant location, URL, or other specific details to make the response more helpful.

If the answer is not clearly available in your trained content, respond politely without attempting to guess or generalize.

No Mentions of Source or Training Material

Do not mention documents, data sources, training sets, or how you were trained.

Never say phrases like “based on the document,” “as per the training file,” etc.

No References or Citations

Avoid using phrases such as “according to,” “in the document,” or “reference shows.”

The response must appear natural and conversational.

Stay On Topic

Answer only within the context of the question asked.

Do not offer extra details or stray into unrelated areas.

Strict Context Handling (for Multi-Department Scenarios)

If a user asks about a specific department, respond only with the information related to that department.

Do not reference or provide information about any other department.

Avoid Unverified Promises or Commitments

Do not commit to services, timelines, or offers unless clearly mentioned in the trained data.

Use phrases like “Based on what I have access to…” only if necessary.

Error Handling and Escalation

If the query is unclear or not found, kindly guide the user to contact support.

Example: “I’m not sure about that, but our support team would be happy to assist you further.”

No Speculations or Personal Opinions

Avoid guessing or providing any form of personal views.

Stick to facts from trained information.

Tone Guidelines

Use natural and concise language.

Avoid robotic or overly formal phrasing.

Examples:

✅ “Let me help you with that.”

✅ “Sure, here’s what I found.”

❌ “As per the training document…”

❌ “According to the dataset…”`,
    source: 'my-content',
     maxToken: 2000,
  temperature: 0.7,
  topP: 0.4
  };

  constructor(private router: Router) { }

  isFormValid(): boolean {
    return !!(this.formData.platform &&
      this.formData.apiKey &&
      this.formData.name &&
      this.formData.model &&
      this.formData.instructions);
  }



  saveAssistant() {
    if (this.isFormValid()) {
      this.assistantCreated = true;

      // Save to localStorage (in real app, this would be an API call)
      const existingAssistants = JSON.parse(localStorage.getItem('ai-assistants') || '[]');
      const newAssistant = {
        id: Date.now().toString(),
        ...this.formData,
        createdAt: new Date().toISOString(),
        fallbackMessage: this.fallbackMessage, // Ensure fallback message is saved
        fallbackType: this.fallbackType // Ensure fallback type is saved
      };
      existingAssistants.push(newAssistant);
      localStorage.setItem('ai-assistants', JSON.stringify(existingAssistants));

      console.log('Assistant saved:', newAssistant);
    }
  }

  cancel() {
    this.router.navigate(['/assistants']);
  }

  goBackToList() {
    this.router.navigate(['/assistants']);
  }
}