interface ChatButton {
  title: string;
  type: string;       // e.g., "text_message"
  textMessage?: string;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text?: string;  // <-- Make optional
  type?: string;
  fileUrl?: string;
  quickReplies?: string[];
  slides?: { image: string; title?: string; subtitle?: string }[];
  buttons?: Button[];
  selectedButtonMessage?: string;
}

import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild, Input, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiHeader, AvailableForm, AvailableMedia, AvailableStory, Button } from '../../../models/chatbot-block.model';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
@Component({
  selector: 'app-jarvish-block',
  imports: [NgIf, FormsModule, NgFor, CommonModule, EmojiModule,PickerModule],
  templateUrl: './jarvish-block.component.html',
  styleUrl: './jarvish-block.component.scss'
})

export class JarvishBlockComponent {
  messageText: string = '';
  messages: ChatMessage[] = [];  // ✅ Now type-safe
  recognition : any;
  isListening : boolean = false;

  isDeleteMode = false;
  confirmDelete = false;
  // currentBlockId: string | null = null;

  // When trash icon is clicked
  enableDeleteMode() {
    this.isDeleteMode = true;
  }

  enableConfirmMode() {
    this.confirmDelete = true;
  }

  // When "Are you sure?" is clicked
  deleteConversation() {
    this.messages = []; // Clear conversation
    this.isDeleteMode = false;
    this.confirmDelete = false;
    this.isChatStarted = !this.isChatStarted
  }

  cancelDelete() {
    this.isDeleteMode = false;
    this.confirmDelete = false;
  }

  constructor(private ngZone: NgZone) {}
  

  // messages: { sender: 'user' | 'bot', text: string, type?: string, fileUrl?: string, quickReplies?: string[], slides?: { image: string; title?: string; subtitle?: string }[];}[] = [];
  // i update this with this part

  @Input() canvasBlocks: any[] = [];
  @Input() availableMedia: AvailableMedia[] = []; 
  @Input() availableStories : AvailableStory[] = [];
  @Input() availableForms : AvailableForm[] = [];

  activeButtonForm: AvailableForm | null = null; 
  isButtonFormActive = false;
  isChatStarted: boolean = false;
  // currentBlockIndex: number = 0;
  nextBlockId: string | null = null;
  currentWaitingBlockId: string | null = null;
  waitingForUserInput: boolean = false;

  formFieldIndex: number = 0;
  currentFormFields: any[] = [];
  currentFormResponses: { [key: string]: string } = {};

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isHeaderCollapsed = false;

  overlayHidden = false;


  ngOnInit() {
    console.log('Received canvasBlocks:', this.canvasBlocks);
    // // Auto start if first block is not userInput
    // if (this.canvasBlocks[0]?.type !== 'userInput') {
    //   this.processNextBlock();
    // }

    // Find the 'flow-start' block and begin the conversation.
  const startBlock = this.canvasBlocks.find(block => block.id === 'flow-start');
  if (startBlock) {
    this.nextBlockId = startBlock.id;
    // We only process if the start block is not a userInput, otherwise we wait for the user.
    if (startBlock.type !== 'userInput') {
      this.processNextBlock();
    }
  } else {
    console.error('No "flow-start" block found in the canvasBlocks.');
  }
  }

  showEmojiPicker = false;

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.messageText += event.emoji.native;
  }


  showOverlay = false;

  ngOnChanges() {
    if (this.isChatStarted) {
      this.showOverlay = true;

      // // Remove overlay after animation ends
      // setTimeout(() => {
      //   this.showOverlay = false;
      // }, 700);
    }
  }



  /** ✅ Handles user sending message */
  // sendMessage() {
  // if (!this.messageText.trim()) return;

  // const userMsg = this.messageText.trim();
  // this.messageText = '';
  // this.messages.push({ sender: 'user', text: userMsg });
  // this.scrollToBottom();

  // // 1️⃣ Handle active button form first
  // if (this.isButtonFormActive && this.activeButtonForm) {
  //   const currentField = this.currentFormFields?.[this.formFieldIndex];

  //   if (currentField) {
  //     this.currentFormResponses[currentField.name] = userMsg;
  //     this.formFieldIndex++;

  //     if (this.formFieldIndex < this.currentFormFields.length) {
  //       setTimeout(() => this.askNextFormField(), 800);
  //     } else {
  //       // ✅ Form finished
  //       this.messages.push({ sender: 'bot', text: '✅ Thank you! Form submitted.' });

  //       // 🔹 Reset form state
  //       this.isButtonFormActive = false;
  //       this.activeButtonForm = null;
  //       this.currentFormFields = [];
  //       this.formFieldIndex = 0;

  //       // 🔹 Continue story if available
  //       this.waitingForUserInput = false;
  //       setTimeout(() => this.processNextBlock(), 800);
  //     }
  //   }
  //   return;
  // }

  // const block = this.canvasBlocks[this.currentBlockIndex];
  // if (!block) {
  //   console.warn('No block found at index', this.currentBlockIndex);
  //   return;
  // }
  // console.log('Current Block:', block.type, block.subType);

  // /** 1️⃣ Conversational Form Handling */
  // if (block.type === 'conversationalForm') {
  //   const currentField = this.currentFormFields[this.formFieldIndex];
  //   this.currentFormResponses[currentField.name] = userMsg;
  //   this.formFieldIndex++;
  //   setTimeout(() => this.askNextFormField(), 800);
  //   return;
  // }

  // /** 2️⃣ User Input Handling */
  // if (block.type === 'userInput') {

  //   // --- 2A) Handle Anything ---
  //   if (block.subType === 'anything') {
  //     console.log("✅ Anything matched");
  //     this.waitingForUserInput = false;
  //     this.currentBlockIndex++;
  //     setTimeout(() => this.processNextBlock(), 800);
  //     return;
  //   }

  //   // --- 2B) Handle Keyword Group ---
  //   else if (block.subType === 'keywordGroup') {
  //     const userInput = userMsg.toLowerCase();
  //     const allKeywords = block.keywordGroups?.flat().map((kw: string) => kw.toLowerCase()) || [];
  //     console.log('All Keywords:', allKeywords);

  //     const matched = allKeywords.some((keyword: string) => userInput.includes(keyword));

  //     if (matched) {
  //       console.log("✅ Keyword matched!");
  //       this.waitingForUserInput = false;
  //       this.currentBlockIndex++;
  //       setTimeout(() => this.processNextBlock(), 800);
  //     } else {
  //       console.log("❌ No keyword match");
  //       this.messages.push({
  //         sender: 'bot',
  //         text: 'Sorry, I didn’t understand. Try saying: ' + allKeywords.join(', ')
  //       });
  //       this.scrollToBottom();
  //       setTimeout(() => {
  //         this.messages.push({
  //           sender: 'bot',
  //           text: 'Try these keywords: ' + allKeywords.join(', ')
  //         });
  //       }, 5000);
  //     }
  //     return;
  //   }

  //   // --- 2C) Handle Phrase Matching ---
  //   else if (block.subType === 'phrase') {
  //     const userInput = userMsg.toLowerCase();

  //     // ✅ Include main phrase and similar phrases
  //     const phrases: string[] = [
  //       block.phraseText || '',
  //       ...(block.similarPhrases ? block.similarPhrases.split(',').map((p: string) => p.trim()) : [])
  //     ].map((p: string) => p.toLowerCase());

  //     console.log('All Phrases for match:', phrases);

  //     const matched = phrases.some((phrase: string) => userInput.includes(phrase));

  //     if (matched) {
  //       console.log("✅ Phrase matched!");
  //       this.waitingForUserInput = false;
  //       this.currentBlockIndex++;
  //       setTimeout(() => this.processNextBlock(), 800);
  //     } else {
  //       console.log("❌ Phrase not matched");
  //       this.messages.push({
  //         sender: 'bot',
  //         text: `I couldn’t recognize that. Try saying something like: ${phrases.join(', ')}`
  //       });
  //       this.scrollToBottom();
  //     }
  //     return;
  //   }
  // }

  // /** 3️⃣ Handle All Other Blocks (text, API, etc.) */
  // this.waitingForUserInput = false;
  // this.currentBlockIndex++;
  // setTimeout(() => this.processNextBlock(), 800);
  // }

  sendMessage() {
    if (!this.messageText.trim()) return;

    const userMsg = this.messageText.trim();
    this.messageText = '';
    this.messages.push({ sender: 'user', text: userMsg });
    this.scrollToBottom();

    // 1️⃣ Handle active button form first
    if (this.isButtonFormActive && this.activeButtonForm) {
      const currentField = this.currentFormFields?.[this.formFieldIndex];

      if (currentField) {
        this.currentFormResponses[currentField.name] = userMsg;
        this.formFieldIndex++;

        if (this.formFieldIndex < this.currentFormFields.length) {
          setTimeout(() => this.askNextFormField(), 800);
        } else {
          // ✅ Form finished
          this.messages.push({ sender: 'bot', text: '✅ Thank you! Form submitted.' });

          // 🔹 Reset form state
          this.isButtonFormActive = false;
          this.activeButtonForm = null;
          this.currentFormFields = [];
          this.formFieldIndex = 0;

          // 🔹 Continue story if available
          this.waitingForUserInput = false;
          setTimeout(() => this.processNextBlock(), 800);
        }
      }
      return;
    }

    var block : any = [];

    // 💥 Use the new 'currentWaitingBlockId' to find the block
    if(this.currentWaitingBlockId !== null){
      block = this.canvasBlocks.find(b => b.id === this.currentWaitingBlockId);
    }else{
      block = this.canvasBlocks.find(b => b.id === this.nextBlockId);
    }
    
    if (!block) {
        // If no block is waiting for input, just clear the flag and move on
        this.waitingForUserInput = false;
        this.currentWaitingBlockId = null;
        return;
    }
    
    // Reset the waiting state, as we've received input
    this.waitingForUserInput = false;
    
    if (block.type === 'userInput') {
      const userInput = userMsg.toLowerCase();
      let isMatch = false;

      if (block.subType === 'anything') {
        isMatch = true;
      } else if (block.subType === 'keywordGroup') {
        const allKeywords = block.keywordGroups?.flat().map((kw : string) => kw.toLowerCase()) || [];
        isMatch = allKeywords.some((keyword : string) => userInput.includes(keyword));
      } else if (block.subType === 'phrase') {
        const phrases = [block.phraseText || '', ...(block.similarPhrases?.split(',').map((p : string) => p.trim()) || [])];
        isMatch = phrases.some(phrase => userInput.includes(phrase.toLowerCase()));
      }
      
      if (isMatch) {
        this.waitingForUserInput = false;
        // 💥 Find the next block ID from the 'connections'
        this.nextBlockId = block.connections?.output?.[0] || null;
        setTimeout(() => this.processNextBlock(), 800);
      } else {
        this.messages.push({ sender: 'bot', text: 'Sorry, I didn’t understand.' });
        this.scrollToBottom();
      }
      return;
    }else if (block.type === 'conversationalForm') {
    const currentField = this.currentFormFields[this.formFieldIndex];
    this.currentFormResponses[currentField.name] = userMsg;
    this.formFieldIndex++;

    // 💥 CORRECTED LOGIC: Check if all fields are completed
    if (this.formFieldIndex < this.currentFormFields.length) {
      // If there are more fields, ask for the next one
      setTimeout(() => this.askNextFormField(), 800);
    } else {
      // If all fields are completed, submit the form and proceed
      setTimeout(() => this.submitForm(), 800);
    }
    return;
  }
    
    this.waitingForUserInput = false;
    this.nextBlockId = block.connections?.output?.[0] || null;
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
    // Wait for DOM to render header first
    // setTimeout(() => {
    //   this.isHeaderCollapsed = true;
    // }, 50); // Delay to trigger transition
  }

  /** ✅ Close conversation smoothly */
  // closeConversation() {
  //   // Expand first to reverse animation
  //   this.isHeaderCollapsed = false;

  //   // Wait for animation to finish before hiding
  //   setTimeout(() => {
  //     this.isChatStarted = false;
  //   }, 500); // Matches Tailwind duration-500
  // }


  async processNextBlock() {
  // if (!this.nextBlockId) {
  //   this.messages.push({ sender: 'bot', text: 'End of conversation.' });
  //   return;
  // }

  // Find the block using its ID
  const block = this.canvasBlocks.find(b => b.id === this.nextBlockId);
  if (!block) {
    // this.messages.push({ sender: 'bot', text: `[Block with ID ${this.nextBlockId} not found.]` });
    return;
  }

  // Determine the next block's ID from the current block's connections
  const nextConnectionId = block.connections?.output?.[0] || null;
  this.nextBlockId = nextConnectionId;

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
      // this.currentBlockIndex++;
      setTimeout(() => this.processNextBlock(), 1000);
      break;

    case 'userInput':
      this.waitingForUserInput = true;
      break;

    case 'jsonApi':
      await this.handleJsonApiBlock(block);
      // this.currentBlockIndex++;
      setTimeout(() => this.processNextBlock(), 500);
      break;

    case 'conversationalForm':
      this.currentFormFields = block.formFields;
      this.formFieldIndex = 0;
      this.currentFormResponses = {};
      this.currentWaitingBlockId = block.id;
      this.askNextFormField();
      break;

    case 'typingDelay':
      await this.handleTypingDelay(block);
      // this.currentBlockIndex++;
      this.processNextBlock();
      break;

    case 'mediaBlock': {
        const mediaMsg: ChatMessage = { sender: 'bot', text: block.content || '' };

        // ✅ Handle slides first
        if (block.slides && block.slides.length > 0) {
          mediaMsg.slides = block.slides;
        }
        // ✅ Handle media (image, video, audio, pdf)
        else if (block.mediaType && block.mediaType !== 'text') {
          mediaMsg.type = block.mediaType;

          // 🔹 Pick the correct URL based on media type
          if (block.mediaType === 'image') {
            mediaMsg.fileUrl = block.mediaUrl || block.singleImageUrl || block.imageUrl;
          } 
          else if (block.mediaType === 'video') {
            mediaMsg.fileUrl = block.mediaUrl || block.videoUrl;
          } 
          else if (block.mediaType === 'audio') {
            mediaMsg.fileUrl = block.mediaUrl || block.audioUrl;
          } 
          else {
            mediaMsg.fileUrl = block.mediaUrl || block.fileUrl;
          }

          mediaMsg.text = block.mediaName || block.content || 'File';
        }

        // ✅ Attach buttons if present
        if (block.buttons && block.buttons.length > 0) {
          mediaMsg.buttons = block.buttons.map((btn: Button) => ({ ...btn }));
        }

        this.messages.push(mediaMsg);
        this.scrollToBottom();
        console.log('Media Block Pushed:', mediaMsg);

        // this.currentBlockIndex++;
        setTimeout(() => this.processNextBlock(), 1000);
        break;
    }

    case 'linkStory': {
      console.log(this.availableStories);
      if (block.linkStoryId) {
        // Find the linked story from availableStories
        const linkedStory = this.availableStories.find(story => story.id === block.linkStoryId);

        if (linkedStory && linkedStory.blocks && linkedStory.blocks.length > 0) {
          this.messages.push({ 
            sender: 'bot', 
            text: `🔗 Linking story: ${linkedStory.name}` 
          });

          // ✅ Insert the linked story blocks right after the current block
          // this.canvasBlocks.splice(this.currentBlockIndex + 1, 0, ...linkedStory.blocks);
          this.canvasBlocks = [...linkedStory.blocks];

          // // Move to the next block
          // this.currentBlockIndex++;
          // Update nextBlockId to be the first block of the newly inserted story.
          this.nextBlockId = linkedStory.blocks[0].id;

          setTimeout(() => this.processNextBlock(), 500);
        } else {
          this.messages.push({ 
            sender: 'bot', 
            text: '⚠️ Linked story not found or empty.' 
          });
          // this.currentBlockIndex++;
          setTimeout(() => this.processNextBlock(), 500);
        }
      } else {
        this.messages.push({ 
          sender: 'bot', 
          text: '⚠️ No linked story assigned to this block.' 
        });
        // this.currentBlockIndex++;
        setTimeout(() => this.processNextBlock(), 500);
      }
      break;
    }

    default:
      this.messages.push({ sender: 'bot', text: `[Unsupported block: ${block.type}]` });
      // this.currentBlockIndex++;
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
    // this.currentBlockIndex++;
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

        if (this.formFieldIndex <= this.currentFormFields.length - 1) {
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
  // this.currentBlockIndex++;
  setTimeout(() => this.processNextBlock(), 800);
  }

  private handleMediaBlock(block: any) {
       console.log("Block aa gaya", block);

      const mediaMsg: ChatMessage = { sender: 'bot', text: block.content || '' };

        // ✅ Handle slides first
        if (block.slides && block.slides.length > 0) {
          mediaMsg.slides = block.slides;
        }
        // ✅ Handle media (image, video, audio, pdf)
        else if (block.type) {
          mediaMsg.type = block.type;

          // 🔹 Pick the correct URL based on media type
          if (block.type === 'image') {
            mediaMsg.fileUrl = block.mediaUrl || block.singleImageUrl || block.imageUrl || block.url;
          } 
          else if (block.type === 'video') {
            mediaMsg.fileUrl = block.mediaUrl || block.videoUrl;
          } 
          else if (block.type === 'audio') {
            mediaMsg.fileUrl = block.mediaUrl || block.audioUrl;
          } 
          else {
            mediaMsg.fileUrl = block.mediaUrl || block.fileUrl;
          }

          mediaMsg.text = block.mediaName || block.content || 'File';
        }

        // ✅ Attach buttons if present
        if (block.buttons && block.buttons.length > 0) {
          mediaMsg.buttons = block.buttons.map((btn: Button) => ({ ...btn }));
        }

        this.messages.push(mediaMsg);
        this.scrollToBottom();
        console.log('Media Block Pushed:', mediaMsg);

        // this.currentBlockIndex++;
        setTimeout(() => this.processNextBlock(), 1000);
  }

  isPdf(fileUrl?: string): boolean {
     return !!fileUrl && fileUrl.toLowerCase().endsWith('.pdf');
  }

  openFile(url?: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  onButtonClick(msg: ChatMessage, button: Button) {
      // 1️⃣ Push the button title as a user message
      this.messages.push({
        sender: 'user',
        text: button.title
      });

      // 💥 Crucial: Find the block that contained this button to get its connections.
      const parentBlock = this.canvasBlocks.find(block => block.buttons?.some((b : any) => b.id === button.id));

      if (!parentBlock) {
        console.error('Could not find the block associated with this button.');
        this.messages.push({ sender: 'bot', text: 'Error: Could not process button action.' });
        return;
      }

      switch (button.type) {
        case 'text_message':
          if (button.textMessage) {
            this.messages.push({
              sender: 'bot',
              text: button.textMessage
            });
          }
          break;

        case 'media_block': {
          if (button.linkedMediaId) {
            console.log(this.availableMedia);
            console.log(button.linkedMediaId);
            
            const mediaBlock = this.availableMedia.find(
              (m: any) => m.id === button.linkedMediaId
            );

            console.log(mediaBlock);

            if (mediaBlock) {
              this.handleMediaBlock(mediaBlock);
            } else {
              this.messages.push({
                sender: 'bot',
                text: '⚠️ Media block not found in available media!'
              });
            }
          }
           else {
            this.messages.push({
              sender: 'bot',
              text: '⚠️ No media linked to this button.'
            });
          }
          break;
        }
        case 'website_url':
          // console.log("check it matches correctly or not",button);
          
          if (button.url) {
            let safeUrl = button.url;

            // 🔹 Ensure URL starts with http or https
            if (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://')) {
              safeUrl = 'https://' + safeUrl;
            }

            // 🔹 Open the link in a new tab
            window.open(safeUrl, '_blank', 'noopener,noreferrer');

            // 🔹 Optional: Bot confirmation message
            this.messages.push({
              sender: 'bot',
              text: `🌐 Opening: ${safeUrl}`
            });
          }
          break;

        case 'direct_call':
          if (button.phoneNumber) {
            const phoneNumber = button.phoneNumber.replace(/\s+/g, ''); // Clean spaces

            // ✅ Trigger the phone call
            window.open(`tel:${phoneNumber}`, '_self'); 

            // ✅ Optional: Add a bot confirmation message
            this.messages.push({
              sender: 'bot',
              text: `📞 Calling ${phoneNumber}...`
            });
          } else {
            this.messages.push({
              sender: 'bot',
              text: '⚠️ No phone number linked to this button.'
            });
          }
          break;

        case 'json_api':
          this.messages.push({
            sender: 'bot',
            text: 'Fetching data from API...'
          });
          if (button.apiEndpoint) {
            this.handleJsonApiButton(button);
          }
          break;
        case 'conversational_form': {
          const botMessage = button.messageAfterAction || '📝 Please start the form.';
          this.messages.push({ sender: 'bot', text: botMessage });

          const selectedForm = this.availableForms.find(f => f.id === button.formId);

          if (selectedForm?.formFields?.length) {
            this.activeButtonForm = selectedForm;
            this.isButtonFormActive = true;
            this.currentFormFields = selectedForm.formFields;
            this.formFieldIndex = 0;
            this.currentFormResponses = {};
            this.currentWaitingBlockId = parentBlock.id;
            this.askNextFormField();
          } else {
            this.messages.push({ sender: 'bot', text: '⚠️ No form fields found for this form.' });
          }
          break;
        }

        case 'start_story':
          if (button.storyId) {
            console.log(this.availableStories);
            const linkedStory = this.availableStories.find(story => story.id === button.storyId);

            if (linkedStory && linkedStory.blocks && linkedStory.blocks.length > 0) {
              this.messages.push({
                sender: 'bot',
                text: `🚀 Starting story: ${linkedStory.name}`
              });

              // ✅ Reset current story to linked story
              this.canvasBlocks = [...linkedStory.blocks];
              // this.currentBlockIndex = 0;

              // Update nextBlockId to be the first block of the newly inserted story.
              this.nextBlockId = linkedStory.blocks[0].id;

              // ✅ Begin processing the new story
              this.processNextBlock();
            } else {
              this.messages.push({
                sender: 'bot',
                text: '⚠️ Linked story not found or has no blocks.'
              });
            }
          } else {
            this.messages.push({
              sender: 'bot',
              text: '⚠️ No story linked to this button.'
            });
          }
      break;
        default:
          this.messages.push({
            sender: 'bot',
            text: `⚡ Action triggered: ${button.type}`
          });
      }
    this.scrollToBottom();
  }


  private async handleJsonApiButton(button: Button) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      (button.apiHeaders || []).forEach(h => {
        if (h.key && h.value) headers[h.key] = h.value;
      });

      const method = (button.requestType || 'GET').toUpperCase();
      const options: RequestInit = { method, headers };

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = button.jsonApiBody || '{}';
      }

      const res = await fetch(button.apiEndpoint!, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      this.messages.push({ sender: 'bot', text: `✅ API Response: ${JSON.stringify(data)}` });
    } catch (err) {
      this.messages.push({ sender: 'bot', text: `❌ API Error: ${err}` });
    }
    this.scrollToBottom();
  }

  startListening() {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('Speech Recognition is not supported in this browser.');
    return;
  }

  if (!this.recognition) {
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.ngZone.run(() => {
        this.messageText += transcript;
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
    };
  }

  if (!this.isListening) {
    this.recognition.start();
    this.isListening = true;
    console.log('Speech recognition started');
  } else {
    this.recognition.stop();
    this.isListening = false;
    console.log('Speech recognition stopped');
  }
  }

  // clearChat() {
  //   const confirmDelete = confirm("Are you sure you want to delete the chat?");
  //   if (confirmDelete) {
  //     this.messages = [];
  //   } 
  // } 
}
