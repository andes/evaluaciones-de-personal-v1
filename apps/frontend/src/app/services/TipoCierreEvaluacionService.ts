import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoCierreEvaluacion {
    _id: string;
    nombre: string;
    descripcion?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TipoCierreEvaluacionService {


    private apiUrl = 'http://localhost:3000/api/comunes/tipocierreevaluacion';

    constructor(private http: HttpClient) { }

    // Obtener todos
    obtenerTodos(): Observable<TipoCierreEvaluacion[]> {
        return this.http.get<TipoCierreEvaluacion[]>(this.apiUrl);
    }

    // Obtener uno por ID
    obtenerPorId(id: string): Observable<TipoCierreEvaluacion> {
        return this.http.get<TipoCierreEvaluacion>(`${this.apiUrl}/${id}`);
    }

    // Crear uno nuevo
    crear(tipo: Partial<TipoCierreEvaluacion>): Observable<TipoCierreEvaluacion> {
        return this.http.post<TipoCierreEvaluacion>(this.apiUrl, tipo);
    }

    // Actualizar por ID
    actualizar(id: string, tipo: Partial<TipoCierreEvaluacion>): Observable<TipoCierreEvaluacion> {
        return this.http.put<TipoCierreEvaluacion>(`${this.apiUrl}/${id}`, tipo);
    }
}