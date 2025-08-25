import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Assistant {
  id: string;
  name: string;
  platform: string;
  model: string;
  source: string;
  createdAt: Date;
  apiKey: string;
  instructions: string;
}

@Component({
  selector: 'app-ai-assistant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant-list.component.html',
  styleUrl: './ai-assistant-list.component.scss'
})
export class AiAssistantListComponent implements OnInit {
  assistants: Assistant[] = [];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Load assistants from localStorage or service
    this.loadAssistants();
  }

  loadAssistants() {
    // In a real app, this would be from a service
    const storedAssistants = localStorage.getItem('ai-assistants');
    if (storedAssistants) {
      this.assistants = JSON.parse(storedAssistants).map((assistant: any) => ({
        ...assistant,
        createdAt: new Date(assistant.createdAt)
      }));
    }
  }

  saveAssistants() {
    localStorage.setItem('ai-assistants', JSON.stringify(this.assistants));
  }

  goBack() {
    // Implement navigation logic
    console.log('Going back...');
    // this.router.navigate(['/dashboard']); // Navigate to parent route
  }

  navigateToCreateAssistant() {
    // Navigate to create assistant page instead of showing modal
    this.router.navigate(['/assistants/create']);
  }

  editAssistant(assistant: Assistant) {
    // Navigate to edit assistant page
    this.router.navigate(['/assistants/edit', assistant.id]);
  }

  deleteAssistant(index: number) {
    if (confirm('Are you sure you want to delete this assistant?')) {
      this.assistants.splice(index, 1);
      this.saveAssistants();
    }
  }

  // Method to be called from create component after successful creation
  addAssistant(assistantData: any) {
    const newAssistant: Assistant = {
      id: Date.now().toString(),
      ...assistantData,
      createdAt: new Date()
    };
    
    this.assistants.push(newAssistant);
    this.saveAssistants();
  }
}