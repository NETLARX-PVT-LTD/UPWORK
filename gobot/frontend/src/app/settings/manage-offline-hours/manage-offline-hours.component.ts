import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';

interface Day {
  id: string;
  label: string;
  selected: boolean;
}

interface Variable {
  name: string;
  category: string;
}

interface Story {
  id: string;
  name: string;
}
interface TimeSlot {
  fromTime: string;
  toTime: string;
}

@Component({
  selector: 'app-manage-offline-hours',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCardModule,
    MatChipsModule
  ],
templateUrl: './manage-offline-hours.component.html'
  // styleUrl: './manage-offline-hours.component.scss'
})
export class ManageOfflineHoursComponent implements OnInit {
   timeSlots: TimeSlot[] = [{ fromTime: '12:00', toTime: '12:00' }];
  selectedBot = 'Bot 3';
  fromTime = '12:00';
  toTime = '12:00';
  messageType: 'text' | 'story' = 'text';
  textMessage = '';
  selectedStory = '';
  autoEnableDisable = true;
  hideBotIcon = true;
  
  showVariableDropdown = false;
  variableSearch = '';
  dropdownPosition = { top: 0, left: 0 };

  days: Day[] = [
    { id: 'M', label: 'M', selected: false },
    { id: 'T', label: 'T', selected: true },
    { id: 'W', label: 'W', selected: true },
    { id: 'Th', label: 'T', selected: true },
    { id: 'F', label: 'F', selected: true },
    { id: 'S', label: 'S', selected: true },
    { id: 'Su', label: 'S', selected: true }
  ];

  variables: Variable[] = [
    { name: '{first_name}', category: 'General Attributes' },
    { name: '{last_name}', category: 'General Attributes' },
    { name: '{timezone}', category: 'General Attributes' },
    { name: '{gender}', category: 'General Attributes' },
    { name: '{last_user_msg}', category: 'General Attributes' },
    { name: '{last_page}', category: 'General Attributes' },
    { name: '{os}', category: 'General Attributes' },
     { name: '{user/last_user_message}', category: 'Form Attributes' },
      { name: '{user/last_bot_message}', category: 'Form Attributes' },
       { name: '{user/created_at}', category: 'Form Attributes' },
        { name: '{user/last_user_button}', category: 'Form Attributes' },
         { name: '{user/name}', category: 'Form Attributes' },
  ];

  stories: Story[] = [
    { id: '1', name: 'Go back to previous story' },
    { id: '2', name: '(Hii),' },
    { id: '3', name: 'Report Incident' },
    { id: '4', name: 'Process for setting up shop' },
    { id: '5', name: 'Aishwary' }
  ];

  filteredVariables: Variable[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredVariables = [...this.variables];
  }

  toggleDay(day: Day) {
    day.selected = !day.selected;
  }

 addTimeSlot() {
    this.timeSlots.push({ fromTime: '12:00', toTime: '12:00' });
  }

  // New method to remove a time slot
  removeTimeSlot(index: number) {
    this.timeSlots.splice(index, 1);
  }

  toggleVariableDropdown(event: Event) {
    event.stopPropagation();
    this.showVariableDropdown = !this.showVariableDropdown;
    
    if (this.showVariableDropdown) {
      const button = event.target as HTMLElement;
      const rect = button.getBoundingClientRect();
      this.dropdownPosition = {
        top: rect.bottom + 5,
        left: rect.left - 250 // Position to the left of the button
      };
    }
  }

  filterVariables() {
    const searchTerm = this.variableSearch.toLowerCase();
    this.filteredVariables = this.variables.filter(variable =>
      variable.name.toLowerCase().includes(searchTerm) ||
      variable.category.toLowerCase().includes(searchTerm)
    );
  }

  getFilteredVariableCategories() {
    const categories: { [key: string]: Variable[] } = {};
    
    this.filteredVariables.forEach(variable => {
      if (!categories[variable.category]) {
        categories[variable.category] = [];
      }
      categories[variable.category].push(variable);
    });

    return Object.keys(categories).map(categoryName => ({
      name: categoryName,
      variables: categories[categoryName]
    }));
  }

  insertVariable(variable: Variable) {
    this.textMessage += variable.name;
    this.showVariableDropdown = false;
  }

  navigateToCreateStory() {
    this.router.navigate(['/create-story']).then(() => {
      // After navigation, you could listen for story creation events
      // and update the stories list accordingly
    });
  }

 saveOfflineHours() {
    const selectedDays = this.days.filter(day => day.selected).map(day => day.id);
    
    const offlineHoursData = {
      bot: this.selectedBot,
      timeSlots: this.timeSlots, // Use the new timeSlots array
      selectedDays,
      autoEnableDisable: this.autoEnableDisable,
      hideBotIcon: this.hideBotIcon,
      messageType: this.messageType,
      textMessage: this.messageType === 'text' ? this.textMessage : '',
      selectedStory: this.messageType === 'story' ? this.selectedStory : ''
    };

    console.log('Saving offline hours:', offlineHoursData);
  }

  // Method to update stories list when a new story is created
  updateStoriesList(newStory: Story) {
    this.stories.push(newStory);
    this.selectedStory = newStory.id;
  }
}