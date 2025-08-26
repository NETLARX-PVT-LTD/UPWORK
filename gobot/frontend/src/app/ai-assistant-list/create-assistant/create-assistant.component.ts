import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
export class CreateAssistantComponent implements OnInit {
  currentTab = signal('settings');
  assistantCreated = false;
  showAdvanceSettings = false;
  fallbackType = 'text';
  fallbackMessage = "I'm sorry, I couldn't find the information you're looking for at the moment. Please feel free to rephrase your question or contact our support team for further assistance.";
  
  // Edit mode properties
  isEditMode = false;
  assistantId: string | null = null;
  
  // Variable dropdown properties
  showVariableDropdown: boolean = false;
  searchVariable: string = '';
  availableStories: string[] = ['Story 1', 'Story 2', 'Story 3'];

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

Never say phrases like "based on the document," "as per the training file," etc.

No References or Citations

Avoid using phrases such as "according to," "in the document," or "reference shows."

The response must appear natural and conversational.

Stay On Topic

Answer only within the context of the question asked.

Do not offer extra details or stray into unrelated areas.

Strict Context Handling (for Multi-Department Scenarios)

If a user asks about a specific department, respond only with the information related to that department.

Do not reference or provide information about any other department.

Avoid Unverified Promises or Commitments

Do not commit to services, timelines, or offers unless clearly mentioned in the trained data.

Use phrases like "Based on what I have access to…" only if necessary.

Error Handling and Escalation

If the query is unclear or not found, kindly guide the user to contact support.

Example: "I'm not sure about that, but our support team would be happy to assist you further."

No Speculations or Personal Opinions

Avoid guessing or providing any form of personal views.

Stick to facts from trained information.

Tone Guidelines

Use natural and concise language.

Avoid robotic or overly formal phrasing.

Examples:

✅ "Let me help you with that."

✅ "Sure, here's what I found."

❌ "As per the training document…"

❌ "According to the dataset…"`,
    source: 'my-content',
    maxToken: 2000,
    temperature: 0.7,
    topP: 0.4
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    // Check if we're in edit mode
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.assistantId = params['id'];
        this.assistantCreated = true; // Set to true so tabs are visible
        this.loadAssistantData(params['id']);
      }
    });
  }

  loadAssistantData(id: string) {
    try {
      const existingAssistants = JSON.parse(localStorage.getItem('ai-assistants') || '[]');
      const assistant = existingAssistants.find((a: any) => a.id === id);
      
      if (assistant) {
        // Populate form data
        this.formData = {
          platform: assistant.platform || 'openai',
          apiKey: assistant.apiKey || '',
          name: assistant.name || '',
          model: assistant.model || '',
          instructions: assistant.instructions || this.formData.instructions,
          source: assistant.source || 'my-content',
          maxToken: assistant.maxToken || 2000,
          temperature: assistant.temperature || 0.7,
          topP: assistant.topP || 0.4
        };

        // Load fallback message data
        this.fallbackMessage = assistant.fallbackMessage || this.fallbackMessage;
        this.fallbackType = assistant.fallbackType || 'text';
        
        console.log('Loaded assistant data:', assistant);
      } else {
        console.error('Assistant not found');
        // Redirect back to list if assistant not found
        this.router.navigate(['/assistants']);
      }
    } catch (error) {
      console.error('Error loading assistant data:', error);
      this.router.navigate(['/assistants']);
    }
  }

  isFormValid(): boolean {
    return !!(this.formData.platform &&
      this.formData.apiKey &&
      this.formData.name &&
      this.formData.model &&
      this.formData.instructions);
  }

  saveAssistant() {
    if (this.isFormValid()) {
      try {
        const existingAssistants = JSON.parse(localStorage.getItem('ai-assistants') || '[]');
        
        if (this.isEditMode && this.assistantId) {
          // Update existing assistant
          const index = existingAssistants.findIndex((a: any) => a.id === this.assistantId);
          if (index !== -1) {
            const updatedAssistant = {
              ...existingAssistants[index],
              ...this.formData,
              fallbackMessage: this.fallbackMessage,
              fallbackType: this.fallbackType,
              updatedAt: new Date().toISOString()
            };
            existingAssistants[index] = updatedAssistant;
            console.log('Assistant updated:', updatedAssistant);
          }
        } else {
          // Create new assistant
          const newAssistant = {
            id: Date.now().toString(),
            ...this.formData,
            createdAt: new Date().toISOString(),
            fallbackMessage: this.fallbackMessage,
            fallbackType: this.fallbackType
          };
          existingAssistants.push(newAssistant);
          this.assistantCreated = true;
          console.log('Assistant created:', newAssistant);
        }
        
        localStorage.setItem('ai-assistants', JSON.stringify(existingAssistants));
        
        // Show success message or redirect
        if (!this.isEditMode) {
          this.assistantCreated = true;
        }
        
      } catch (error) {
        console.error('Error saving assistant:', error);
      }
    }
  }

  cancel() {
    this.router.navigate(['/assistants']);
  }

  goBackToList() {
    this.router.navigate(['/assistants']);
  }

  // Variable dropdown methods
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
    console.log('Opening create story modal...');
  }
}