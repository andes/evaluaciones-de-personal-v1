import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

// Modelo de agente
export interface ModAgente {
    _id?: string;
    legajo: string;
    dni: string;
    nombre: string;
}

@Injectable({
    providedIn: 'root'
})
export class AgentesService {


    private apiUrl = 'http://localhost:3000/api/comunes/agentes';



    constructor(private http: HttpClient) { }
    /*
        obtenerAgentes(search: string = '', tipo: string = ''): Observable<any> {
            return this.http.get<any>(this.apiUrl, {
                params: {
                    search,
                    tipo
                }
            }).pipe(
                catchError(this.manejarError)
            );
        }
    */

    obtenerAgentePorId(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/rAgentes/${id}`)
            .pipe(catchError(this.manejarError));
    }

    crearAgente(agente: ModAgente): Observable<ModAgente> {
        return this.http.post<ModAgente>(this.apiUrl, agente)
            .pipe(
                catchError(this.manejarError)
            );
    }


    modificarAgente(id: string, agente: ModAgente): Observable<ModAgente> {
        return this.http.put<ModAgente>(`${this.apiUrl}/${id}`, agente)
            .pipe(
                catchError(this.manejarError)
            );
    }


    eliminarAgente(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.manejarError)
            );
    }


    private manejarError(error: HttpErrorResponse) {
        console.error('Ocurrió un error en AgentesService:', error);
        return throwError(() => new Error(error.message || 'Error desconocido del servidor'));
    }

    obtenerAgentes(search: string, tipo: string) {

        const params: any = {
            search: search || '',
            tipo: tipo || 'nombre'
        };

        return this.http.get<any>(`${this.apiUrl}/rAgentes`, { params });
    }

    obtenerTodosAgentes(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/rAgentes`)
            .pipe(catchError(this.manejarError));
    }
}
