import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvaluacionCompleta {
    cabecera: any;
    detalles: any[];
}

@Injectable({
    providedIn: 'root'
})
export class EvaluacionService {

    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    // Obtener evaluación completa por id de cabecera
    obtenerEvaluacionCompleta(idCabecera: string): Observable<EvaluacionCompleta> {

        return this.http.get<EvaluacionCompleta>(`${this.apiUrl}/evaluacion-completa/${idCabecera}`);
    }

}
