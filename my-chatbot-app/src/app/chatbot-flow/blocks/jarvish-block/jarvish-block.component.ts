import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-jarvish-block',
  imports: [NgIf],
  templateUrl: './jarvish-block.component.html',
  styleUrl: './jarvish-block.component.scss'
})
export class JarvishBlockComponent {
  isChatStarted : boolean = false;

  startConversation() {
  this.isChatStarted = true;
  }
}
