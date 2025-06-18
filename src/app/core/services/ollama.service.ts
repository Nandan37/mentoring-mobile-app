// src/app/services/ollama.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OllamaService {
  constructor(private http: HttpClient) {}

  parseInputToFormData(prompt: string) {
    
    const jsonData ={
        "end_date": "1748968380",
        "title": "Session details",
        "start_date": "1748961180",
        "description": ""
      }
      const instruction = `Extract structured form fields from this text: "${prompt}". Return the output strictly in JSON format like this:\n${jsonData}\nNo explanation, just valid JSON.`;
    return this.http.post<any>('http://localhost:11434/api/generate', {
      model: 'llama3.2',
      prompt: instruction,
      stream: false
    });
  }
}
