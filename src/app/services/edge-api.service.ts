import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EdgeApiService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ======================
    // CATEGORY ENDPOINTS
    // ======================
    getCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/vocab/api/categories`);
    }

    createCategory(category: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/vocab/api/categories`, category);
    }

    updateCategory(id: number, category: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/vocab/api/categories/${id}`, category);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/vocab/api/categories/${id}`);
    }

    // ======================
    // TOPIC ENDPOINTS
    // ======================
    getTopicsByCategory(categoryId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/vocab/api/topics/category/${categoryId}`);
    }

    getTopicById(topicId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/vocab/api/topics/${topicId}`);
    }

    createTopic(topic: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/vocab/api/topics`, topic);
    }

    updateTopic(id: number, topic: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/vocab/api/topics/${id}`, topic);
    }

    deleteTopic(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/vocab/api/topics/${id}`);
    }

    // ======================
    // LABEL ENDPOINTS
    // ======================
    getLabelsByTopic(topicId: number, languageCode: string): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.baseUrl}/vocab/api/labels/topic/${topicId}?language=${languageCode}`
        );
    }

    createLabel(label: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/vocab/api/labels`, label);
    }

    updateLabel(id: number, label: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/vocab/api/labels/${id}`, label);
    }

    deleteLabel(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/vocab/api/labels/${id}`);
    }

    // ======================
    // VOCABULARY ENDPOINTS
    // ======================
    createVocabulary(vocabulary: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/vocab/api/vocabulary`, vocabulary);
    }

    // ======================
    // TRANSLATION ENDPOINTS
    // ======================
    createTranslation(translation: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/vocab/api/translations`, translation);
    }

    // ======================
    // LANGUAGE ENDPOINTS
    // ======================
    getLanguages(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/vocab/api/languages`);
    }

    // ======================
    // MEDIA ENDPOINTS
    // ======================
    uploadImage(file: File, topicId: number, width: number, height: number): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('topicId', topicId.toString());
        formData.append('width', width.toString());
        formData.append('height', height.toString());

        return this.http.post<any>(`${this.baseUrl}/media/images/upload`, formData);
    }

    getImageUrl(imageId: number): string {
        return `${this.baseUrl}/media/images/${imageId}`;
    }

    uploadAudio(file: File, translationId: number, languageCode: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('translationId', translationId.toString());
        formData.append('languageCode', languageCode);
        return this.http.post<any>(`${this.baseUrl}/media/audios/upload`, formData);
    }

    updateTranslationAudio(translationId: number, audioId: number): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/vocab/api/translations/${translationId}/audio/${audioId}`, {});
    }

    getAudioUrl(audioId: number): string {
        return `${this.baseUrl}/media/audios/${audioId}`;
    }

    // ======================
    // ADMIN ENDPOINTS
    // ======================
    adminLogin(username: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/api/admin/login`, {
            username,
            password,
        });
    }

    // ======================
    // ANALYTICS ENDPOINTS
    // ======================
    getTopCategories(limit: number = 10): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/analytics/api/analytics/categories/top?limit=${limit}`);
    }

    getTopTopics(limit: number = 10): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/analytics/api/analytics/topics/top?limit=${limit}`);
    }

    getAnalyticsSummary(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/analytics/api/analytics/summary`);
    }
}
