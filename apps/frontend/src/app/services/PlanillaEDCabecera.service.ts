import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlanillaEDCabecera {
    _id?: string;
    fechaCreacion: Date;
    efectores: any[];
    periodo?: Date | string; agenteevaluador?: {
        idUsuarioEvaluador?: string;
        nombreUsuarioEvaluador?: string;
    };
    descripcion: string;
    servicios: any[];
    categoria: any[];
}

@Injectable({
    providedIn: 'root'
})
export class PlanillaEDCabeceraService {

    private apiUrl = 'http://localhost:3000/api/evaluacioncabecera/planillaedcabecera';
    private apiUrlCabecera = 'http://localhost:3000/api/evaluacioncabecera';


    constructor(private http: HttpClient) { }

    obtenerCabeceras(): Observable<{ success: boolean; data: PlanillaEDCabecera[] }> {
        return this.http.get<{ success: boolean; data: PlanillaEDCabecera[] }>(this.apiUrlCabecera);
    }

    obtenerCabecera(id: string): Observable<{ success: boolean; data: PlanillaEDCabecera }> {
        return this.http.get<{ success: boolean; data: PlanillaEDCabecera }>(`${this.apiUrlCabecera}/${id}`);
    }



    // Método alternativo que retorna la respuesta completa (con success y data)
    //  obtenerCabeceraG(id: string): Observable<{ success: boolean; data: PlanillaEDCabecera }> {
    //    return this.http.get<{ success: boolean; data: PlanillaEDCabecera }>(`${this.apiUrl}/${id}`);
    //}


    crearCabeceraEvaluacion(cabecera: any): Observable<any> {
        return this.http.post(this.apiUrl, cabecera);
    }

    actualizarCabecera(id: string, data: PlanillaEDCabecera): Observable<any> {

        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    eliminarCabecera(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
    // Verifica si ya existe una cabecera con la combinación de periodo, agente evaluador, efector y servicio
    verificarExistenciaCabecera(cabecera: any): Observable<{ success: boolean; existe: boolean; data?: any }> {
        return this.http.post<{ success: boolean; existe: boolean; data?: any }>(
            `${this.apiUrl}/existe`,
            cabecera
        );
    }

    // Buscar cabeceras por evaluador, efector y servicio, ordenadas por periodo ascendente para grilla en Plnillilaedcabeceera
    buscarCabecerasPorEvaluadorEfectorServicio(
        idUsuarioEvaluador: string,
        idEfector: string,
        idServicio: string
    ): Observable<any> {
        const url = `${this.apiUrl}/buscar?idUsuarioEvaluador=${idUsuarioEvaluador}&idEfector=${idEfector}&idServicio=${idServicio}`;
        return this.http.get<any>(url);
    }



    getCabeceraEvaluacion(id: string): Observable<any> {
        return this.http.get(`http://localhost:3000/api/evaluacioncabecera/${id}`);
    }



    obtenerCabeceraG(id: string): Observable<{ success: boolean; data: PlanillaEDCabecera }> {
        return this.http.get<{ success: boolean; data: PlanillaEDCabecera }>(
            `http://localhost:3000/api/evaluacioncabecera/evaluacioncabecera/${id}`
        );
    }


    actualizarCierreEvaluacion(id: string, cierreData: { tipoCierreEvaluacion: { id: string; nombre: string }, fechaCierre: string }): Observable<any> {
        const url = `http://localhost:3000/api/evaluacioncabecera/cierre/${id}`;
        return this.http.put(url, cierreData);
    }
    buscarCabecerasPorEvaluador(idUsuarioEvaluador: string) {

        return this.http.get<any>(`${this.apiUrl}/buscar`, {
            params: { idUsuarioEvaluador }
        });
    }

    getPlanillaEDCabeceraById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }



}
