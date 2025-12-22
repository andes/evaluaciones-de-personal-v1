// src/app/services/PlanillaEDItems.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActualizarPuntajePayload {
    idPlanillaEvaluacionCabecera: string;
    idAgenteEvaluado: string;
    idItem: string;
    nuevoPuntaje: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    item?: any;
}

@Injectable({
    providedIn: 'root'
})
export class PlanillaEDItemsService {

    private baseUrl = 'http://localhost:3000/api/evaluacionItems';




    constructor(private http: HttpClient) { }

    actualizarPuntaje(payload: ActualizarPuntajePayload): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/actualizar-puntaje`, payload);
    }

}
