// src/app/services/ollama.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import * as chrono from 'chrono-node';

@Injectable({ providedIn: 'root' })
export class OllamaService {
  constructor(private http: HttpClient) {}

  

  parseInputToFormData(prompt: string) {
    prompt ="Schedule a session next Friday from 4 PM to 6 PM with the Education Minister, category: Education, in  English";
    const jsonData = {
      "title": "",
      "description": "",
      "start_date": "TIMESTAMP",
      "end_date": "TIMESTAMP",
      "recommended_for": [""],
      "categories": [""],
      "medium": [""],
      "time_zone": "Asia/Calcutta",
      "image": [],
      "resources": [],
      "type": "session",
    };

    const today = new Date().toISOString().split('T')[0]; // e.g., "2025-06-26"

    const instruction = `Today's date is ${today}.
Based on the following session details: "${prompt}", extract structured form data.

The user may mention people involved using natural language like "with Education Officer and BEO", or "for Cluster Officers". Extract all such roles as a list under "recommended_for".

Return a valid JSON object with the following fields:

- title (string)
- description (string)
- start_date and end_date as epoch time (in seconds, based on Asia/Calcutta timezone)
- recommended_for (array of strings): inferred list of people mentioned as attendees (e.g., BEO, Cluster Officer, Education Officer)
- categories (array of strings): e.g., Education, Communication, etc.
- medium (array of strings): e.g., English, Hindi, etc.
- time_zone (string, always "Asia/Calcutta")
- image (empty array)
- resources (empty array)
- mentor_id (string, always "33")
- type (string): either "private" or "public". If not clearly mentioned, default to "public".

Return ONLY a valid JSON object. No explanation. No markdown. Follow this structure:\n${JSON.stringify(jsonData, null, 2)}`;

    return this.http.post<any>('http://localhost:11434/api/generate', {
      model: 'llama3.2',
      prompt: instruction,
      stream: false
    });
  }

  // convertNaturalDateToTimestamps(dateText: string, timeRange: [number, number]) {
  //   const parsedDate = chrono.parseDate(dateText, new Date());

  //   if (!parsedDate) {
  //     throw new Error('Invalid date parsed');
  //   }

  //   const start = new Date(parsedDate);
  //   const end = new Date(parsedDate);

  //   start.setHours(timeRange[0], 0, 0, 0);
  //   end.setHours(timeRange[1], 0, 0, 0);

  //   return {
  //     start_date: Math.floor(start.getTime() / 1000),
  //     end_date: Math.floor(end.getTime() / 1000)
  //   };
  // }
}
