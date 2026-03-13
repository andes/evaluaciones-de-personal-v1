import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


//  Modelo
export interface Items {
    _id?: string;
    descripcion: string;
    valor: number;
}


// Respuesta estándar del backend
export interface ApiResponse<T> {
    ok: boolean;
    data: T;
    message: string;
}


@Injectable({
    providedIn: 'root'
})
export class ItemsService {


    private baseUrl = 'http://localhost:3000/api/comunes/items/rEvaDesemp';

    constructor(private http: HttpClient) { }

    getItems(): Observable<ApiResponse<Items[]>> {
        return this.http.get<ApiResponse<Items[]>>(this.baseUrl);
    }

    getItemById(id: string): Observable<ApiResponse<Items>> {
        return this.http.get<ApiResponse<Items>>(`${this.baseUrl}/${id}`);
    }

    createItem(item: Items): Observable<ApiResponse<Items>> {
        return this.http.post<ApiResponse<Items>>(this.baseUrl, item);
    }


    updateItem(id: string, item: Items): Observable<ApiResponse<Items>> {
        return this.http.put<ApiResponse<Items>>(`${this.baseUrl}/${id}`, item);
    }


    deleteItem(id: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
    }
}