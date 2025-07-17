import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VoiceService {
  private recognition: any;

  constructor() {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
  }

  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recognition.start();
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      this.recognition.onerror = (event: any) => {
        reject(event.error);
      };
    });
  }
}
