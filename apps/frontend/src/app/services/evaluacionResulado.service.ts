import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    totalItems?: number;
    totalPuntaje?: number;
    sumaPuntajes?: number;
    cantidad?: number;
    promedio?: number;
}

@Injectable({
    providedIn: 'root'
})
export class EvaluacionResultadosService {

    private baseUrl = 'http://localhost:3000/api/evaluacionItems';

    constructor(private http: HttpClient) { }

    // 1) Contar total de items para idPlanillaEvaluacionCabecera y idAgente
    contarItems(idPlanillaEvaluacionCabecera: string, idAgente: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/contar-items/${idPlanillaEvaluacionCabecera}/${idAgente}`);
    }

    // 2) Contar items con puntaje > 0 para idPlanillaEvaluacionCabecera y idAgente
    contarItemsConValor(idPlanillaEvaluacionCabecera: string, idAgente: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/contar-items-valor/${idPlanillaEvaluacionCabecera}/${idAgente}`);
    }

    // 3) Sumar y promediar puntajes > 0 para idPlanillaEvaluacionCabecera y idAgente
    sumaPromediaPuntajes(idPlanillaEvaluacionCabecera: string, idAgente: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/sumaPromediaPuntajes/${idPlanillaEvaluacionCabecera}/${idAgente}`);
    }

    // 4) Obtener totales (items y suma de puntajes) filtrando por idCabecera e idAgente
    obtenerTotales(idPlanillaEvaluacionCabecera: string, idAgente: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/totales/${idPlanillaEvaluacionCabecera}/${idAgente}`);
    }
}
