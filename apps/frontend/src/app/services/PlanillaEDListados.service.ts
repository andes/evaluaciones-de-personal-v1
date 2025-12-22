import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvaluacionCompleta {
    success: boolean;
    cabecera: any;
    detalles: any[];
}

@Injectable({
    providedIn: 'root'
})
export class PlanillaEDListadosService {

    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }




    // – EVALUACIONES RESUMEN
    obtenerEvaluacionesResumen(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/evaluaciones/evaluaciones-resumen`);
    }

    // EVALUACIONES POR AGENTE
    obtenerPorAgente(idAgente: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/evaluaciones/por-agente/${idAgente}`);
    }



    //  EVALUACIÓN COMPLETA


    obtenerEvaluacionCompleta(idCabecera: string): Observable<EvaluacionCompleta> {
        return this.http.get<EvaluacionCompleta>(
            `${this.apiUrl}/evaluaciondetalle/evaluacion-completa/${idCabecera}`
        );
    }
    // buscar por agente
    buscarPorAgente(legajo?: string, nombre?: string) {

        const params: any = {};

        if (legajo) {
            params.legajo = legajo;
        }

        if (nombre) {
            params.nombre = nombre;
        }

        return this.http.get<any>(
            `${this.apiUrl}/evaluaciones/buscar-agente`,
            { params }
        );
    }

    // buscar por evaluador
    buscarPorEvaluador(idUsuario?: string, nombre?: string): Observable<any> {

        const params: any = {};

        if (idUsuario) {
            params.idUsuario = idUsuario;
        }

        if (nombre) {
            params.nombre = nombre;
        }

        return this.http.get<any>(
            `${this.apiUrl}/evaluaciones/buscar-evaluador`,
            { params }
        );
    }
    getEvaluacionesPorTipoCierre(idTipoCierre: string): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/por-tipo-cierre/${idTipoCierre}`
        );
    }


}
