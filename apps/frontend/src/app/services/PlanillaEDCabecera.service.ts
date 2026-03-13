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

    private apiUrl = 'http://localhost:3000/api/evaluacioncabecera';

    constructor(private http: HttpClient) { }

    obtenerCabeceras(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    obtenerCabecera(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    crearCabeceraEvaluacion(cabecera: any): Observable<any> {
        return this.http.post(this.apiUrl, cabecera);
    }

    actualizarCabecera(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    eliminarCabecera(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    verificarExistenciaCabecera(cabecera: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/existe`, cabecera);
    }

    buscarCabecerasPorEvaluador(idUsuarioEvaluador: string) {

        return this.http.get<any>(`${this.apiUrl}/buscar`, {
            params: { idUsuarioEvaluador }
        });

    }
}