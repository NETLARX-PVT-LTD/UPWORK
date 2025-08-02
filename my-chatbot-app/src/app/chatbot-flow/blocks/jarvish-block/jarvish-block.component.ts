import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiHeader } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-jarvish-block',
  imports: [NgIf, FormsModule, NgFor, CommonModule],
  templateUrl: './jarvish-block.component.html',
  styleUrl: './jarvish-block.component.scss'
})
export class JarvishBlockComponent {
  messageText: string = '';
  messages: { sender: 'user' | 'bot', text: string, type?: string, fileUrl?: string, quickReplies?: string[]}[] = [];

  @Input() canvasBlocks: any[] = [];
  isChatStarted: boolean = false;
  currentBlockIndex: number = 0;
  waitingForUserInput: boolean = false;

  formFieldIndex: number = 0;
  currentFormFields: any[] = [];
  currentFormResponses: { [key: string]: string } = {};

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  ngOnInit() {
    console.log('Received canvasBlocks:', this.canvasBlocks);

    // Auto start if first block is not userInput
    if (this.canvasBlocks[0]?.type !== 'userInput') {
      this.processNextBlock();
    }
  }

  /** ✅ Handles user sending message */
  sendMessage() {
  if (!this.messageText.trim()) return;

  const userMsg = this.messageText.trim();
  this.messageText = '';
  this.messages.push({ sender: 'user', text: userMsg });
  this.scrollToBottom();

  const block = this.canvasBlocks[this.currentBlockIndex];
  console.log('Current Block:', block.type, block.subType);

  /** 1️⃣ Conversational Form Handling */
  if (block.type === 'conversationalForm') {
    const currentField = this.currentFormFields[this.formFieldIndex];
    this.currentFormResponses[currentField.name] = userMsg;
    this.formFieldIndex++;
    setTimeout(() => this.askNextFormField(), 800);
    return;
  }

  /** 2️⃣ User Input Handling */
  if (block.type === 'userInput') {

    // --- 2A) Handle Anything ---
    if (block.subType === 'anything') {
      console.log("✅ Anything matched");
      this.waitingForUserInput = false;
      this.currentBlockIndex++;
      setTimeout(() => this.processNextBlock(), 800);
      return;
    }

    // --- 2B) Handle Keyword Group ---
    else if (block.subType === 'keywordGroup') {
      const userInput = userMsg.toLowerCase();
      const allKeywords = block.keywordGroups?.flat().map((kw: string) => kw.toLowerCase()) || [];
      console.log('All Keywords:', allKeywords);

      const matched = allKeywords.some((keyword: string) => userInput.includes(keyword));

      if (matched) {
        console.log("✅ Keyword matched!");
        this.waitingForUserInput = false;
        this.currentBlockIndex++;
        setTimeout(() => this.processNextBlock(), 800);
      } else {
        console.log("❌ No keyword match");
        this.messages.push({
          sender: 'bot',
          text: 'Sorry, I didn’t understand. Try saying: ' + allKeywords.join(', ')
        });
        this.scrollToBottom();
        setTimeout(() => {
          this.messages.push({
            sender: 'bot',
            text: 'Try these keywords: ' + allKeywords.join(', ')
          });
        }, 5000);
      }
      return;
    }

    // --- 2C) Handle Phrase Matching ---
    else if (block.subType === 'phrase') {
      const userInput = userMsg.toLowerCase();

      // ✅ Include main phrase and similar phrases
      const phrases: string[] = [
        block.phraseText || '',
        ...(block.similarPhrases ? block.similarPhrases.split(',').map((p: string) => p.trim()) : [])
      ].map((p: string) => p.toLowerCase());

      console.log('All Phrases for match:', phrases);

      const matched = phrases.some((phrase: string) => userInput.includes(phrase));

      if (matched) {
        console.log("✅ Phrase matched!");
        this.waitingForUserInput = false;
        this.currentBlockIndex++;
        setTimeout(() => this.processNextBlock(), 800);
      } else {
        console.log("❌ Phrase not matched");
        this.messages.push({
          sender: 'bot',
          text: `I couldn’t recognize that. Try saying something like: ${phrases.join(', ')}`
        });
        this.scrollToBottom();
      }
      return;
    }
  }

  /** 3️⃣ Handle All Other Blocks (text, API, etc.) */
  this.waitingForUserInput = false;
  this.currentBlockIndex++;
  setTimeout(() => this.processNextBlock(), 800);
}


  /** ✅ Auto Scrolls Chat to Bottom */
  scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  /** ✅ Start conversation manually */
  startConversation() {
    this.isChatStarted = true;
  }

  /** ✅ Processes Next Block */
  async processNextBlock() {
  if (this.currentBlockIndex >= this.canvasBlocks.length) return;

  const block = this.canvasBlocks[this.currentBlockIndex];

  switch (block.type) {
    case 'textResponse':
      // Push bot message
      const botMsg: any = { sender: 'bot', text: block.content };

      // ✅ Attach quick replies if available
      if (block.quickReplies && block.quickReplies.length > 0) {
        botMsg.quickReplies = block.quickReplies.map((qr: any) => qr.title || qr.text || qr.value);
      }

      console.log(botMsg);
      

      this.messages.push(botMsg);
      this.scrollToBottom();

      // If quick replies exist, wait for user action
      if (block.quickReplies && block.quickReplies.length > 0) {
        this.waitingForUserInput = true; 
        return;
      }

      // Else continue automatically
      this.currentBlockIndex++;
      setTimeout(() => this.processNextBlock(), 1000);
      break;

    case 'userInput':
      this.waitingForUserInput = true;
      break;

    case 'jsonApi':
      await this.handleJsonApiBlock(block);
      this.currentBlockIndex++;
      setTimeout(() => this.processNextBlock(), 500);
      break;

    case 'conversationalForm':
      this.currentFormFields = block.formFields;
      this.formFieldIndex = 0;
      this.currentFormResponses = {};
      this.askNextFormField();
      break;

    case 'typingDelay':
      await this.handleTypingDelay(block);
      this.currentBlockIndex++;
      this.processNextBlock();
      break;

    default:
      this.messages.push({ sender: 'bot', text: `[Unsupported block: ${block.type}]` });
      this.currentBlockIndex++;
      this.processNextBlock();
  }
  }


  /** ✅ Ask Next Field in Form */
  askNextFormField() {
    const field = this.currentFormFields[this.formFieldIndex];
    if (!field) {
      this.submitForm(); 
      return;
    }

    this.waitingForUserInput = true;
    this.messages.push({ sender: 'bot', text: field.promptPhrase });
    this.scrollToBottom();
  }

  /** ✅ Submit Form */
  submitForm() {
    this.waitingForUserInput = false;
    this.messages.push({ sender: 'bot', text: '✅ Thank you! Your form has been submitted.' });
    console.log('Form Responses:', this.currentFormResponses);

    this.scrollToBottom();
    this.currentBlockIndex++;
    setTimeout(() => this.processNextBlock(), 1000);
  }

  /** ✅ File Upload Handler */
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileUrl = reader.result as string;
        this.messages.push({
          sender: 'user',
          type: file.type.startsWith('image/') ? 'image'
            : file.type.startsWith('video/') ? 'video'
            : file.type.startsWith('audio/') ? 'audio'
            : 'file',
          text: file.name,
          fileUrl
        });
        this.scrollToBottom();

        if (this.formFieldIndex < this.currentFormFields.length - 1) {
        this.formFieldIndex++;
        this.askNextFormField();
        } else {
          this.waitingForUserInput = true; // Wait for user to confirm manually
        }
      };
      reader.readAsDataURL(file);
    });
  }

  /** ✅ Handle JSON API Block */
  private async handleJsonApiBlock(block: any) {
  this.messages.push({ text: 'Fetching live data...', sender: 'bot' });
  this.scrollToBottom();

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    (block.apiHeaders || []).forEach((h: ApiHeader) => {
      if (h.key && h.value) headers[h.key] = h.value;
    });

    const method = (block.requestType || 'GET').toUpperCase();
    const options: RequestInit = { method, headers };

    // ✅ Safe check for body only if POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(block.body || { name: 'Aishwary', job: 'Developer' });
    }

    console.log('API Request:', method, headers, options.body);

    const res = await fetch(block.apiEndpoint, options);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    this.messages.push({ text: `✅ API Response: ${JSON.stringify(data)}`, sender: 'bot' });
  } catch (err) {
    this.messages.push({ text: `❌ API request failed: ${err}`, sender: 'bot' });
  }

  this.scrollToBottom();
  }


  /** ✅ Handle Typing Delay Block */
  private async handleTypingDelay(block: any) {
    const delay = (block.delaySeconds || 1) * 1000;
    this.messages.push({ sender: 'bot', text: '🤖 Typing...' });
    this.scrollToBottom();

    await new Promise(resolve => setTimeout(resolve, delay));
    this.messages.pop(); 
    this.messages.push({ sender: 'bot', text: '🤖 Delay Complete...' });
  }

  handleQuickReply(reply: string) {
  //  Push the reply as a user message
  this.messages.push({ sender: 'user', text: reply });
  this.scrollToBottom();

  // Remove quick replies from the last bot message
  const lastBotMsgIndex = this.messages.slice().reverse().findIndex(msg => msg.sender === 'bot' && msg.quickReplies);
  if (lastBotMsgIndex !== -1) {
    const actualIndex = this.messages.length - 1 - lastBotMsgIndex;
    delete this.messages[actualIndex].quickReplies;  // ✅ Remove buttons
  }

  // Move to next block
  this.waitingForUserInput = false;
  this.currentBlockIndex++;
  setTimeout(() => this.processNextBlock(), 800);
  }

}
