import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PlanillaEDDetalleService {
    private baseUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    crearEvaluacionDetalle(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/evaluaciondetalle`, data);
    }

    obtenerEvaluacionDetallePorId(id: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/evaluaciondetalle/${id}`);
    }

    actualizarEvaluacionDetalle(id: string, data: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/evaluaciondetalle/${id}`, data);
    }

    eliminarEvaluacionDetallePorId(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/evaluaciondetalle/${id}`);
    }

    eliminarTodasLasEvaluaciones(): Observable<any> {
        return this.http.delete(`${this.baseUrl}/evaluaciondetalle`);
    }
    //corrige id items en la evaluacion
    corregirItemsPorDescripcion(idEvaluacion: string) {
        return this.http.put(`${this.baseUrl}/evaluaciondetalle/corregir-items/${idEvaluacion}`, {});
    }
    // Verifica si ya existe una evaluación para esa cabecera y agente
    existeEvaluacion(idCabecera: string, idAgente: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/evaluaciondetalle/existe/${idCabecera}/${idAgente}`);
    }

    /* Obtiene todos los agentes evaluados por ID cabecera
    obtenerAgentesEvaluadosPorCabecera(idCabecera: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/evaluaciondetalle/agentes/${idCabecera}`);
    }*/
    // es la mism que la de arriba probarla y luego borar la que no correspona
    getAgentesPorCabecera(idCabecera: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/evaluaciondetalle/por-cabecera/${idCabecera}/agentes`);
    }


    // Obtiene las categorías e ítems para un agente evaluado en una evaluación específica (evaluacionitems.ts)
    obtenerCategoriasEItemsPorEvaluacion(idEvaluacion: string, idAgente: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/evaluaciondetalle/categorias-items/${idEvaluacion}/${idAgente}`);
    }

    // Busca un ítem específico dentro de una evaluación por agente
    obtenerItemPorEvaluacionYAgente(
        idEvaluacion: string,
        idAgente: string,
        idItem: string
    ): Observable<any> {
        return this.http.get(`${this.baseUrl}/evaluaciondetalle/item/${idEvaluacion}/${idAgente}/${idItem}`);
    }
    // ✅ Nuevo método para cerrar evaluación

    cerrarEvaluacion(
        idEvaluacionCabecera: string,
        idAgente: string,
        tipoCierre: any
    ) {
        if (!idEvaluacionCabecera || !idAgente) {
            console.error('idEvaluacionCabecera o idAgente indefinido', { idEvaluacionCabecera, idAgente });
            return throwError(() => new Error('idEvaluacionCabecera o idAgente indefinido'));
        }

        // El backend espera un objeto con la propiedad tipoCierreEvaluacion
        const body = { tipoCierreEvaluacion: tipoCierre };

        return this.http.put(
            `${this.baseUrl}/evaluaciondetalle/${idEvaluacionCabecera}/agente/${idAgente}/tipo-cierreCabecera`,
            body
        );
    }


}
