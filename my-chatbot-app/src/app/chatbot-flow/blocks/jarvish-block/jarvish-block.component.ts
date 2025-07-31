import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiHeader } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-jarvish-block',
  imports: [NgIf, FormsModule, NgFor,CommonModule],
  templateUrl: './jarvish-block.component.html',
  styleUrl: './jarvish-block.component.scss'
})
export class JarvishBlockComponent {

  messageText : String = '';
  messages : { sender : 'user' | 'bot', text:String, type? : string, fileUrl? : string }[] = [];

  @Input() canvasBlocks: any[] = [];
  isChatStarted : boolean = false;
  currentBlockIndex: number = 0;
  waitingForUserInput: boolean = false;

  formFieldIndex: number = 0;
  currentFormFields: any[] = [];
  currentFormResponses: { [key: string]: string } = {};


  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  ngOnInit(){
    console.log('Received canvasBlocks:', this.canvasBlocks);

    if (this.canvasBlocks[0]?.type !== 'userInput') {
      this.processNextBlock();
    }
  }


  // sendMessage() {
  //   if (!this.messageText.trim()) return;

  //   // Push user message
  //   this.messages.push({ sender: 'user', text: this.messageText });

  //   // Clear input
  //   const userMsg = this.messageText;
  //   this.messageText = '';

  //   // Scroll to bottom
  //   setTimeout(() => this.scrollToBottom(), 100);

  //   // Fake bot reply for now
  //   setTimeout(() => {
  //     this.messages.push({ sender: 'bot', text: `You said: "${userMsg}"` });
  //     this.scrollToBottom();
  //   }, 1000);
  // }
  sendMessage() {
  if (!this.messageText.trim()) return;

  const userMsg = this.messageText.trim();
  this.messageText = '';
  this.messages.push({ sender: 'user', text: userMsg });
  this.scrollToBottom();

  const block = this.canvasBlocks[this.currentBlockIndex];

  if (block.type === 'conversationalForm') {
    const currentField = this.currentFormFields[this.formFieldIndex];
    this.currentFormResponses[currentField.name] = userMsg;
    this.formFieldIndex++;

    setTimeout(() => this.askNextFormField(), 800);

  } else {
    if (this.waitingForUserInput && block.subType === 'anything') {
      this.waitingForUserInput = false;
      this.currentBlockIndex++;
      setTimeout(() => this.processNextBlock(), 800);
    }else if(this.waitingForUserInput && block.subType === 'keywordGroup'){
        const userInput = userMsg.trim().toLowerCase();

        // Flatten keyword groups and normalize them
        const allKeywords = block.keywordGroups?.flat().map((kw:string) => kw.toLowerCase()) || [];

        // Match user input to any keyword
        const matched = allKeywords.some((keyword : string) => userInput.includes(keyword));

        if (matched) {
          this.waitingForUserInput = false;
          this.currentBlockIndex++;
          setTimeout(() => this.processNextBlock(), 800);
        } else {
          // Optional: You can send a retry message or show a hint
          this.messages.push({
            sender: 'bot',
            text: 'Sorry, I didn’t understand. Please try using a keyword like "Hi" or "Hello".'
          });
          
          setTimeout(()=>{
            const visibleKeywords = block.keywordGroups?.flat().join(', ') || '';
            this.messages.push({
              sender: 'bot',
              text: `Say something like: ${visibleKeywords}`
            });
          },2000);
          // Still waiting for user input, do not proceed
      }
    } else {
      this.waitingForUserInput = false;
      this.currentBlockIndex++;
      setTimeout(() => this.processNextBlock(), 800);
    }
  }
}


  scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  // ngAfterViewInit() {
  //   const el = this.messagesContainer.nativeElement;
  //   el.scrollTop = el.scrollHeight;
  // }

  // startConversation() {
  //   this.isChatStarted = true;
  // }

  startConversation(){
    this.isChatStarted = true;
    // this.processNextBlock();
  }

  async processNextBlock() {
  if (this.currentBlockIndex >= this.canvasBlocks.length) return;

  const block = this.canvasBlocks[this.currentBlockIndex];

  if (block.type === 'textResponse') {
    this.messages.push({ sender: 'bot', text: block.content });
    this.scrollToBottom();
    this.currentBlockIndex++;
    setTimeout(() => this.processNextBlock(), 1000);
  }

    else if (block.type === 'jsonApi') {
    this.messages.push({ text: 'Fetching live data...', sender: 'bot' });
    this.scrollToBottom();

    try {
      // 1️⃣ Merge default and block headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json', // required for POST/PUT/PATCH
      };
      (block.apiHeaders || []).forEach((h: ApiHeader) => {
        if (h.key && h.value) headers[h.key] = h.value;
      });

      // 2️⃣ Prepare fetch options
      const options: RequestInit = {
        method: block.requestType || 'GET',
        headers: headers
      };

      // 3️⃣ Handle request body automatically for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes((block.requestType || '').toUpperCase())) {
        options.body = JSON.stringify(
          block.body || { name: 'Aishwary', job: 'Developer' } // fallback example
        );
      }

      console.log('API Request:', options.method, options.headers, options.body);

      // 4️⃣ Make the request
      const res = await fetch(block.apiEndpoint, options);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      // 5️⃣ Parse and display response
      const data = await res.json();
      this.messages.push({ 
        text: `✅ API Response: ${JSON.stringify(data)}`, 
        sender: 'bot' 
      });

    } catch (err) {
      this.messages.push({ 
        text: `❌ API request failed: ${err}`, 
        sender: 'bot' 
      });
    }

    this.scrollToBottom();
    this.currentBlockIndex++;
    setTimeout(() => this.processNextBlock(), 500);
  }
  else if (block.type === 'userInput') {
    this.waitingForUserInput = true;
  }

  else if (block.type === 'conversationalForm') {
    this.currentFormFields = block.formFields;
    this.formFieldIndex = 0;
    this.currentFormResponses = {};
    this.askNextFormField();
  }
  /** 5️⃣ Handle Typing Delay */
  else if (block.type === 'typingDelay') {
    const delay = (block.delaySeconds || 1) * 1000;
    this.messages.push({ sender: 'bot', text: '🤖 Typing...' });
    this.scrollToBottom();

    setTimeout(() => {
      this.messages.pop(); // remove "typing..." message
      this.messages.push({ sender: 'bot', text: '🤖 Delay Complete...' });
      this.currentBlockIndex++;
      this.processNextBlock();
    }, delay);
  }
  /** 6️⃣ Handle Unknown Block Types */
  else {
    this.messages.push({ sender: 'bot', text: `[Unsupported block: ${block.type}]` });
    this.currentBlockIndex++;
    this.processNextBlock();
  }
}


  askNextFormField() {
  const field = this.currentFormFields[this.formFieldIndex];
  if (!field) {
    this.submitForm(); // all fields answered
    return;
  }

  this.waitingForUserInput = true;
  this.messages.push({ sender: 'bot', text: field.promptPhrase });
  this.scrollToBottom();
}

submitForm() {
  this.waitingForUserInput = false;
  this.messages.push({ sender: 'bot', text: '✅ Thank you! Your form has been submitted.' });

  console.log('Form Responses:', this.currentFormResponses);

  // Optionally send to webhook here using HttpClient

  this.scrollToBottom();
  this.currentBlockIndex++;
  setTimeout(() => this.processNextBlock(), 1000);
}


    handleFileInput(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
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
          };


          reader.readAsDataURL(file); // Can switch to readAsArrayBuffer if needed
          this.formFieldIndex++;
          this.askNextFormField();
        });
      }
    }
}
