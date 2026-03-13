import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Efector {
    _id?: string;
    nombre: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class EfectoresService {

    private apiUrl = 'http://localhost:3000/api/comunes/efectores';

    constructor(private http: HttpClient) { }

    getEfectores(): Observable<ApiResponse<Efector[]>> {
        return this.http.get<ApiResponse<Efector[]>>(
            `${this.apiUrl}/rmEfectores`
        );
    }

    getEfectorById(id: string): Observable<Efector> {
        return this.http.get<Efector>(`${this.apiUrl}/rmEfectores/${id}`);
    }

    createEfector(data: Efector): Observable<Efector> {
        return this.http.post<Efector>(`${this.apiUrl}/rmEfectores`, data);
    }
}