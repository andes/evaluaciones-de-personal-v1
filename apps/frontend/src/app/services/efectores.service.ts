import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Efector {
    _id?: string;
    nombre: string;
}

@Injectable({
    providedIn: 'root'
})
export class EfectoresService {

    private apiUrl = 'http://localhost:3000/api/comunes/efectores';

    constructor(private http: HttpClient) { }

    // 🔹 Obtener todos los efectores
    getEfectores(): Observable<Efector[]> {
        return this.http.get<Efector[]>(`${this.apiUrl}/rmEfectores`);
    }

    // 🔹 Obtener un efector por ID
    getEfectorById(id: string): Observable<Efector> {
        return this.http.get<Efector>(`${this.apiUrl}/rmEfectores/${id}`);
    }

    // 🔹 Crear un nuevo efector
    createEfector(data: Efector): Observable<Efector> {
        return this.http.post<Efector>(`${this.apiUrl}/rmEfectores`, data);
    }
}
