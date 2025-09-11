import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Story } from '../manage-bot-stories/manage-bot-stories.component';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private apiUrl = 'https://localhost:7221/api/components';
  private baseUrl = 'https://localhost:7221/api/story';

  constructor(private http: HttpClient) {}

  getAllStories(): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.apiUrl}/allstories`);
  }

  deleteStory(storyId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeleteStory/${storyId}`);
  }

  getStorySchemaById(storyId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/GetAllStorySchemaById/${storyId}`);
  }

}
