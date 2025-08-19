import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrandingService, BrandingSettings } from '../../shared/services/branding.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './branding.component.html',
  styleUrls: ['./branding.component.scss']
})
export class BrandingComponent implements OnInit, OnDestroy {
  private brandingSubscription: Subscription | undefined;
  
  // Form data
  botName: string = 'Jarvis';
  botSubheading: string = '';
  homeMessage: string = '';
  selectedBotImage: string | null = null;
  selectedFileName: string = '';
   profileImageUrl: string = '';
  
  // Avatar options with proper icons
  avatarOptions = [
    { id: 1, icon: 'chat', selected: true },
    { id: 2, icon: 'person', selected: false },
    { id: 3, icon: 'monitor', selected: false },
    { id: 4, icon: 'message', selected: false }
  ];
  
  showChatAvatarAsWidget: boolean = true;
  
  // Color options
  primaryColors = [
    { color: '#00BCD4', selected: true },
    { color: '#F44336', selected: false },
    { color: '#2196F3', selected: false },
    { color: '#E91E63', selected: false },
    { color: '#03A9F4', selected: false }
  ];
  
  secondaryColors = [
    { color: '#ffffff', selected: true }, // Changed default to white
    { color: '#f8f9fa', selected: false },
    { color: '#e9ecef', selected: false },
    { color: '#dee2e6', selected: false },
    { color: '#ced4da', selected: false }
  ];

  // Color picker modal
  showColorPicker: boolean = false;
  colorPickerType: 'primary' | 'secondary' = 'primary';
  selectedCustomColor: string = '#ffffff';
  botImageUrl: string | null | undefined;

  constructor(private brandingService: BrandingService) {}

  ngOnInit(): void {
     const savedBranding = this.brandingService.getBranding();
    if (savedBranding) {
      // Load the saved profile image URL
      this.profileImageUrl = savedBranding.profileImage || '';
      // ... load other properties
    }
    // Load existing branding settings
    this.loadExistingBranding();
    
    // Subscribe to branding changes
    this.brandingSubscription = this.brandingService.branding$.subscribe(branding => {
      if (branding) {
        this.applyBrandingToForm(branding);
      }
    });
  }

  saveBranding(): void {
    const branding: BrandingSettings = {
      // ... other branding settings
      botImage: this.botImageUrl, // Assuming you have this property
      profileImage: this.profileImageUrl // Save the new property
    };
    this.brandingService.saveBranding(branding);
    console.log('Branding settings saved!', branding);
  }
  
  ngOnDestroy(): void {
    this.brandingSubscription?.unsubscribe();
  }

  /**
   * Load existing branding settings into the form
   */
  private loadExistingBranding(): void {
    const existingBranding = this.brandingService.getBranding();
    if (existingBranding) {
      this.applyBrandingToForm(existingBranding);
    }
  }

  /**
   * Apply branding settings to form fields
   */
  private applyBrandingToForm(branding: BrandingSettings): void {
    if (branding.botName) this.botName = branding.botName;
    if (branding.botSubheading) this.botSubheading = branding.botSubheading;
    if (branding.homeMessage) this.homeMessage = branding.homeMessage;
    if (branding.botImage) {
      this.selectedBotImage = branding.botImage;
      this.selectedFileName = 'Uploaded Image';
    }
    
    // Update avatar selection
    if (branding.selectedAvatar) {
      this.avatarOptions.forEach(avatar => {
        avatar.selected = avatar.id === branding.selectedAvatar!.id;
      });
    }
    
    if (branding.showChatAvatarAsWidget !== undefined) {
      this.showChatAvatarAsWidget = branding.showChatAvatarAsWidget;
    }
    
    // Update color selections
    if (branding.primaryColor) {
      this.updateColorSelection(this.primaryColors, branding.primaryColor);
    }
    
    if (branding.secondaryColor) {
      this.updateColorSelection(this.secondaryColors, branding.secondaryColor);
    }
  }

  /**
   * Update color selection arrays - FIXED: Uncommented and improved
   */
  private updateColorSelection(colorArray: any[], targetColor: string): void {
    // First try to find existing color
    let found = false;
    colorArray.forEach(color => {
      if (color.color.toLowerCase() === targetColor.toLowerCase()) {
        color.selected = true;
        found = true;
      } else {
        color.selected = false;
      }
    });
    
    // If color not found in existing options, add it as custom
    if (!found) {
      // Deselect all existing colors first
      colorArray.forEach(color => color.selected = false);
      // Add custom color
      const newColor = { color: targetColor, selected: true };
      colorArray.push(newColor);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB.');
        return;
      }
      
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedBotImage = e.target.result;
        // Auto-save when image is selected
        this.saveSettings();
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  }

  browseFiles() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Remove selected bot image
   */
  removeImage(): void {
    this.selectedBotImage = null;
    this.selectedFileName = '';
    // Clear the file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    // Auto-save when image is removed
    this.saveSettings();
  }

  selectAvatar(selectedId: number) {
    this.avatarOptions.forEach(avatar => {
      avatar.selected = avatar.id === selectedId;
    });
    // Auto-save when avatar is selected
    this.saveSettings();
  }

  selectPrimaryColor(selectedIndex: number) {
    this.primaryColors.forEach((color, index) => {
      color.selected = index === selectedIndex;
    });
    // Auto-save when color is selected
    this.saveSettings();
  }

  selectSecondaryColor(selectedIndex: number) {
    this.secondaryColors.forEach((color, index) => {
      color.selected = index === selectedIndex;
    });
    // Auto-save when color is selected
    this.saveSettings();
  }

  addCustomPrimaryColor() {
    this.colorPickerType = 'primary';
    this.selectedCustomColor = this.getSelectedColor('primary') || '#ffffff';
    this.showColorPicker = true;
  }

  addCustomSecondaryColor() {
    this.colorPickerType = 'secondary';
    this.selectedCustomColor = this.getSelectedColor('secondary') || '#ffffff';
    this.showColorPicker = true;
  }

  /**
   * Get currently selected color for a type
   */
  private getSelectedColor(type: 'primary' | 'secondary'): string | null {
    const colorArray = type === 'primary' ? this.primaryColors : this.secondaryColors;
    const selected = colorArray.find(c => c.selected);
    return selected ? selected.color : null;
  }

  closeColorPicker() {
    this.showColorPicker = false;
  }

  onColorPickerChange(event: any) {
    this.selectedCustomColor = event.target.value;
  }

  confirmCustomColor() {
    if (!this.selectedCustomColor) {
      return;
    }

    const newColor = {
      color: this.selectedCustomColor,
      selected: true
    };

    if (this.colorPickerType === 'primary') {
      // Deselect all primary colors
      this.primaryColors.forEach(c => c.selected = false);
      
      // Check if color already exists
      const existingIndex = this.primaryColors.findIndex(c => 
        c.color.toLowerCase() === this.selectedCustomColor.toLowerCase()
      );
      if (existingIndex >= 0) {
        this.primaryColors[existingIndex].selected = true;
      } else {
        // Add new color
        this.primaryColors.push(newColor);
      }
    } else {
      // Deselect all secondary colors
      this.secondaryColors.forEach(c => c.selected = false);
      
      // Check if color already exists
      const existingIndex = this.secondaryColors.findIndex(c => 
        c.color.toLowerCase() === this.selectedCustomColor.toLowerCase()
      );
      if (existingIndex >= 0) {
        this.secondaryColors[existingIndex].selected = true;
      } else {
        // Add new color
        this.secondaryColors.push(newColor);
      }
    }

    this.showColorPicker = false;
    // Auto-save when custom color is added
    this.saveSettings();
  }

  /**
   * Reset form to defaults
   */
  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all branding settings to defaults?')) {
      this.brandingService.resetBranding();
      // The subscription will automatically update the form
    }
  }

  /**
   * Save settings and show confirmation
   */
  saveSettings(): void {
    const settings: BrandingSettings = {
      botName: this.botName.trim(),
      botSubheading: this.botSubheading.trim(),
      homeMessage: this.homeMessage.trim(),
      botImage: this.selectedBotImage,
      selectedAvatar: this.avatarOptions.find(a => a.selected),
      showChatAvatarAsWidget: this.showChatAvatarAsWidget,
      primaryColor: this.primaryColors.find(c => c.selected)?.color,
      secondaryColor: this.secondaryColors.find(c => c.selected)?.color,
      // Add landing page defaults if not set
      landingTitle: 'Chat with our AI Assistant',
      landingDescription: 'Get instant answers to your questions'
    };
    
    // Validate required fields
    if (!settings.botName) {
      alert('Bot name is required.');
      return;
    }
    
    if (settings.homeMessage && settings.homeMessage.length > 140) {
      alert('Home message must be 140 characters or less.');
      return;
    }
    
    try {
      // Save the settings using the service
      this.brandingService.saveBranding(settings);
      
      // Show success message
      this.showSuccessMessage();
      
      // Broadcast changes to any embedded widgets
      this.broadcastBrandingUpdate(settings);
      
      console.log('Branding settings saved successfully!', settings);
    } catch (error) {
      console.error('Error saving branding settings:', error);
      alert('There was an error saving your settings. Please try again.');
    }
  }

  /**
   * Broadcast branding updates to embedded widgets
   */
  private broadcastBrandingUpdate(settings: BrandingSettings): void {
    try {
      // Send message to all iframes/embedded widgets
      const message = {
        type: 'chatbot-update-branding',
        branding: settings,
        timestamp: Date.now()
      };
      
      // Send to all iframes
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          iframe.contentWindow?.postMessage(message, '*');
        } catch (e) {
          console.log('Could not send branding update to iframe:', e);
        }
      });
      
      // Also broadcast to parent window if this is embedded
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
      }
      
      // Broadcast to same origin windows
      window.postMessage(message, window.location.origin);
      
    } catch (error) {
      console.error('Error broadcasting branding update:', error);
    }
  }

  /**
   * Show success message to user
   */
  private showSuccessMessage(): void {
    // You could implement a toast notification here
    // For now, just use a simple alert
    alert('Branding settings saved successfully! Changes will appear in your chatbot widget.');
    
    // Or you could add a temporary success indicator
    // this.showSuccessIndicator = true;
    // setTimeout(() => this.showSuccessIndicator = false, 3000);
  }

  /**
   * Preview current settings in a new window/tab
   */
  previewSettings(): void {
    // Create preview URL with current settings
    const settings = {
      name: this.botName,
      greeting: this.homeMessage,
      primaryColor: this.primaryColors.find(c => c.selected)?.color,
      secondaryColor: this.secondaryColors.find(c => c.selected)?.color,
      title: 'Chat with our AI Assistant',
      description: 'Get instant answers to your questions'
    };
    
    const queryParams = new URLSearchParams();
    Object.entries(settings).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    
    // Open preview in new tab
    const previewUrl = `${window.location.origin}/landing?preview=true&${queryParams.toString()}`;
    window.open(previewUrl, '_blank');
  }

  /**
   * Test branding with embedded widget
   */
  testEmbeddedWidget(): void {
    // Create a test page that embeds the widget
    const testHtml = this.generateTestEmbedPage();
    const blob = new Blob([testHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Generate test embed page HTML
   */
  private generateTestEmbedPage(): string {
    const currentSettings = {
      name: this.botName,
      greeting: this.homeMessage,
      primaryColor: this.primaryColors.find(c => c.selected)?.color || '#00BCD4',
      secondaryColor: this.secondaryColors.find(c => c.selected)?.color || '#ffffff'
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Branding Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .test-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid ${currentSettings.primaryColor};
        }
        .branding-details {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .branding-item {
            margin: 5px 0;
        }
        .color-preview {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 3px;
            vertical-align: middle;
            margin-right: 8px;
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Chatbot Branding Test Page</h1>
        
        <div class="test-info">
            <h3>🧪 This is a test page to verify your chatbot branding</h3>
            <p>The chatbot widget should appear with your custom branding settings. Check the following:</p>
            <ul>
                <li>Bot name and colors match your settings</li>
                <li>Welcome message displays correctly</li>
                <li>Colors and styling are applied properly</li>
                <li>Widget is responsive and functional</li>
            </ul>
        </div>

        <div class="branding-details">
            <h4>Current Branding Settings:</h4>
            <div class="branding-item"><strong>Bot Name:</strong> ${currentSettings.name}</div>
            <div class="branding-item"><strong>Welcome Message:</strong> ${currentSettings.greeting}</div>
            <div class="branding-item">
                <strong>Primary Color:</strong> 
                <span class="color-preview" style="background-color: ${currentSettings.primaryColor}"></span>
                ${currentSettings.primaryColor}
            </div>
            <div class="branding-item">
                <strong>Secondary Color:</strong> 
                <span class="color-preview" style="background-color: ${currentSettings.secondaryColor}"></span>
                ${currentSettings.secondaryColor}
            </div>
        </div>

        <h2>Sample Website Content</h2>
        <p>This is sample content to demonstrate how the chatbot widget integrates with a real website.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        
        <h3>Features</h3>
        <ul>
            <li>Real-time chat functionality</li>
            <li>Customizable branding</li>
            <li>Mobile responsive design</li>
            <li>Menu integration</li>
        </ul>
    </div>

    <!-- Embed the chatbot widget -->
    <iframe 
        src="${window.location.origin}/chatbot-widget?name=${encodeURIComponent(currentSettings.name)}&greeting=${encodeURIComponent(currentSettings.greeting)}&primaryColor=${encodeURIComponent(currentSettings.primaryColor)}&secondaryColor=${encodeURIComponent(currentSettings.secondaryColor)}&position=bottom-right&size=medium"
        style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 1000;"
        title="Chatbot Widget">
    </iframe>

    <script>
        // Listen for messages from the chatbot widget
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type) {
                console.log('Received message from chatbot:', event.data);
                
                // Handle different message types
                switch(event.data.type) {
                    case 'chatbot-ready':
                        console.log('Chatbot is ready');
                        break;
                    case 'chatbot-minimized':
                        console.log('Chatbot was minimized');
                        break;
                    case 'chatbot-maximized':
                        console.log('Chatbot was maximized');
                        break;
                }
            }
        });

        // Test function to send message to chatbot
        function sendTestMessage() {
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'chatbot-send-message',
                    message: 'Hello from parent page!'
                }, '*');
            }
        }

        // Add test button after page loads
        window.addEventListener('load', function() {
            const testButton = document.createElement('button');
            testButton.textContent = 'Send Test Message to Chatbot';
            testButton.style.cssText = 'position: fixed; top: 20px; right: 20px; background: ${currentSettings.primaryColor}; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; z-index: 1001;';
            testButton.onclick = sendTestMessage;
            document.body.appendChild(testButton);
        });
    </script>
</body>
</html>`;
  }

  openTutorial() {
    // Open tutorial video/modal
    console.log('Opening tutorial');
    // You could implement this to open a modal with tutorial content
    // or redirect to a tutorial page
  }

  /**
   * Export current branding settings as JSON
   */
  exportSettings(): void {
    const settings = {
      botName: this.botName,
      botSubheading: this.botSubheading,
      homeMessage: this.homeMessage,
      selectedAvatar: this.avatarOptions.find(a => a.selected),
      showChatAvatarAsWidget: this.showChatAvatarAsWidget,
      primaryColor: this.primaryColors.find(c => c.selected)?.color,
      secondaryColor: this.secondaryColors.find(c => c.selected)?.color,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chatbot-branding-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import branding settings from JSON file
   */
  importSettings(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          this.applyImportedSettings(importedSettings);
        } catch (error) {
          alert('Invalid JSON file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid JSON file.');
    }
  }

  /**
   * Apply imported settings to the form
   */
  private applyImportedSettings(settings: any): void {
    if (settings.botName) this.botName = settings.botName;
    if (settings.botSubheading) this.botSubheading = settings.botSubheading;
    if (settings.homeMessage) this.homeMessage = settings.homeMessage;
    if (settings.showChatAvatarAsWidget !== undefined) {
      this.showChatAvatarAsWidget = settings.showChatAvatarAsWidget;
    }
    
    // Apply avatar selection
    if (settings.selectedAvatar) {
      this.selectAvatar(settings.selectedAvatar.id);
    }
    
    // Apply color selections
    if (settings.primaryColor) {
      this.updateColorSelection(this.primaryColors, settings.primaryColor);
    }
    
    if (settings.secondaryColor) {
      this.updateColorSelection(this.secondaryColors, settings.secondaryColor);
    }
    
    // Save the imported settings
    this.saveSettings();
    alert('Settings imported and applied successfully!');
  }

  /**
   * Auto-save on input changes (debounced)
   */
  private autoSaveTimeout: any;
  
  onInputChange(): void {
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    // Set new timeout to auto-save after 1 second of no changes
    this.autoSaveTimeout = setTimeout(() => {
      this.saveSettings();
    }, 1000);
  }

  /**
   * Get embed code for the current branding
   */
  getEmbedCode(): string {
    const settings = {
      name: this.botName,
      greeting: this.homeMessage,
      primaryColor: this.primaryColors.find(c => c.selected)?.color,
      secondaryColor: this.secondaryColors.find(c => c.selected)?.color
    };
    
    const params = new URLSearchParams();
    Object.entries(settings).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    return `<iframe 
    src="${window.location.origin}/chatbot-widget?${params.toString()}"
    style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 1000;"
    title="Chatbot Widget">
</iframe>`;
  }

  /**
   * Copy embed code to clipboard
   */
  copyEmbedCode(): void {
    const embedCode = this.getEmbedCode();
    navigator.clipboard.writeText(embedCode).then(() => {
      alert('Embed code copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy embed code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = embedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Embed code copied to clipboard!');
    });
  }
}